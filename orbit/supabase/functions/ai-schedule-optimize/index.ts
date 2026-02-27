import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface Task {
  id: string;
  title: string;
  description: string;
  priority: string;
  dueDate: string;
  completedAt?: number;
  status: string;
}

interface ScheduleRequest {
  completedTasks: Task[];
  pendingTasks: Task[];
}

interface ScheduleSuggestion {
  taskId: string;
  suggestedTime: string;
  reason: string;
}

interface ScheduleResponse {
  schedule: ScheduleSuggestion[];
  insights: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { completedTasks, pendingTasks }: ScheduleRequest = await req.json();

    const apiKey = Deno.env.get("ANTHROPIC_API_KEY") || "#";

    console.log(`Received request with ${completedTasks?.length || 0} completed tasks and ${pendingTasks?.length || 0} pending tasks`);

    if (!completedTasks || completedTasks.length < 5) {
      return new Response(
        JSON.stringify({ error: "Need at least 5 completed tasks for optimization" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (!pendingTasks || pendingTasks.length === 0) {
      return new Response(
        JSON.stringify({ error: "No pending tasks to optimize" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const completedTasksData = completedTasks.map(t => ({
      title: t.title,
      description: t.description,
      priority: t.priority,
      completedAt: t.completedAt ? new Date(t.completedAt).toISOString() : null,
    }));

    const pendingTasksData = pendingTasks.map(t => ({
      id: t.id,
      title: t.title,
      description: t.description,
      priority: t.priority,
      dueDate: t.dueDate,
    }));

    const prompt = `Based on these completed tasks with timestamps ${JSON.stringify(completedTasksData)}, and these pending tasks ${JSON.stringify(pendingTasksData)}, suggest optimal times to work on each task. Consider: task difficulty (inferred from title), user's productive hours (inferred from completion patterns), task priority, due dates. Respond with JSON: {schedule: [{taskId: string, suggestedTime: string, reason: string}], insights: string (about user's productivity patterns)}. No markdown.`;

    console.log("Calling Anthropic API...");
    const anthropicResponse = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 2000,
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
      }),
    });

    console.log("Anthropic API response status:", anthropicResponse.status);

    if (!anthropicResponse.ok) {
      const errorText = await anthropicResponse.text();
      console.error("Anthropic API error:", errorText);
      return new Response(
        JSON.stringify({ error: `API error: ${anthropicResponse.status} - ${errorText.substring(0, 200)}` }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const anthropicData = await anthropicResponse.json();
    const responseText = anthropicData.content[0].text;

    let scheduleData: ScheduleResponse;
    try {
      scheduleData = JSON.parse(responseText);
    } catch (e) {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        scheduleData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("Failed to parse AI response");
      }
    }

    return new Response(
      JSON.stringify(scheduleData),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Internal server error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
