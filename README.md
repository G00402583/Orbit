<h1>Orbit</h1>

<h2>Description</h2>
<p>
Orbit is an intelligent task management application that combines modern productivity features 
with AI-powered capabilities to help you organize, prioritize, and optimize your daily workflow. 
Unlike traditional to-do apps, Orbit learns from your completed tasks to provide personalized 
scheduling recommendations and automatically generates daily plans tailored to your productivity patterns.
</p>

<p>
Built with React 19 and TypeScript, Orbit features a beautiful, responsive interface with dual 
view modes (list and calendar), natural language task input, smart subtask management, and 
real-time statistics tracking. The AI integration analyzes your work patterns to suggest optimal 
times for tasks, helping you work smarter and accomplish more.
</p>

<hr/>

<h2>Installation</h2>

<h3>Install Dependencies</h3>
<pre><code>npm install</code></pre>

<h3>Set Up Environment Variables</h3>
<p>Create a <code>.env</code> file in the root directory:</p>

<pre><code>VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
</code></pre>

<h3>Deploy Edge Functions</h3>
<pre><code>your-backend-cli login
your-backend-cli functions deploy ai-task-parse
your-backend-cli functions deploy ai-daily-plan
your-backend-cli functions deploy ai-schedule-optimize
</code></pre>

<h3>Start Development Server</h3>
<pre><code>npm run dev</code></pre>

<p>Open your browser and navigate to:</p>
<pre><code>http://localhost:5173</code></pre>

<hr/>

<h2>Project Structure</h2>

<pre><code>orbit/
├── src/
│   ├── components/
│   │   ├── ui/
│   │   ├── AITaskInput.tsx
│   │   ├── CalendarView.tsx
│   │   ├── DailyPlanModal.tsx
│   │   ├── FilterButtons.tsx
│   │   ├── ScheduleOptimizationModal.tsx
│   │   ├── SearchBar.tsx
│   │   ├── SubtaskList.tsx
│   │   ├── TaskCard.tsx
│   │   └── TaskForm.tsx
│   ├── context/
│   │   └── TaskContext.tsx
│   ├── types/
│   │   └── task.ts
│   ├── utils/
│   │   └── taskUtils.ts
│   ├── lib/
│   │   └── utils.ts
│   ├── App.tsx
│   └── main.tsx
├── supabase/
│   └── functions/
│       ├── ai-task-parse/
│       ├── ai-daily-plan/
│       └── ai-schedule-optimize/
├── public/
└── package.json
</code></pre>

<hr/>

<h2>AI Features</h2>

<h3>Natural Language Task Parser</h3>
<p>Converts plain text into structured tasks. The AI extracts:</p>
<ul>
  <li>Task title</li>
  <li>Due date (relative or absolute)</li>
  <li>Priority level (high, medium, low)</li>
  <li>Initial subtasks if mentioned</li>
</ul>

<p><strong>Example:</strong></p>
<pre><code>Finish project proposal by Friday high priority with research and draft sections</code></pre>

<h3>Daily Plan Generator</h3>
<ul>
  <li>Analyzes all pending tasks</li>
  <li>Considers due dates and priorities</li>
  <li>Suggests execution order</li>
  <li>Provides reasoning for recommendations</li>
</ul>

<h3>Schedule Optimizer</h3>
<ul>
  <li>Identifies your most productive time periods</li>
  <li>Matches task types to optimal times</li>
  <li>Considers priority and due dates</li>
  <li>Provides personalized scheduling insights</li>
</ul>

<p><em>Requires a minimum of 5 completed tasks for pattern analysis.</em></p>

<hr/>

<h2>Usage Guide</h2>

<h3>Creating Tasks</h3>

<h4>Using AI Input (Recommended)</h4>
<ol>
  <li>Type naturally in the AI input box</li>
  <li>Review the parsed task</li>
  <li>Confirm or edit before saving</li>
</ol>

<p><strong>Examples:</strong></p>
<ul>
  <li>Meeting with client tomorrow 2pm high priority</li>
  <li>Buy groceries this weekend</li>
  <li>Review pull requests by Friday</li>
</ul>

<h4>Using Manual Form</h4>
<ol>
  <li>Click <strong>Add Task</strong></li>
  <li>Fill in title, description, due date, and priority</li>
  <li>Add optional subtasks</li>
  <li>Click <strong>Create Task</strong></li>
</ol>

<h3>Managing Tasks</h3>
<ul>
  <li><strong>Edit:</strong> Click the edit icon</li>
  <li><strong>Complete:</strong> Mark checkbox</li>
  <li><strong>Delete:</strong> Click delete icon and confirm</li>
  <li><strong>Subtasks:</strong> Expand tasks to manage subtasks</li>
  <li><strong>Status:</strong> Update between todo, in-progress, and done</li>
</ul>

<h3>Calendar View</h3>
<ul>
  <li>Switch to calendar view to see tasks by due date</li>
  <li>Get visual overview of deadlines</li>
  <li>Edit tasks directly from calendar</li>
</ul>

<hr/>

<h2>Development</h2>

<h3>Available Scripts</h3>
<pre><code>npm run dev       # Start development server
npm run build     # Build for production
npm run preview   # Preview production build
npm run lint      # Run ESLint
</code></pre>

<h3>Code Organization</h3>

<h4>Component Structure</h4>
<ul>
  <li>UI components follow shadcn/ui patterns</li>
  <li>Feature components are reusable</li>
  <li>Context API manages global task state</li>
</ul>

<h4>State Management</h4>
<ul>
  <li>Centralized CRUD via TaskContext</li>
  <li>Local storage sync</li>
  <li>React hooks for derived state</li>
</ul>

<h4>Styling</h4>
<ul>
  <li>Tailwind CSS utility classes</li>
  <li>Custom teal accent theme</li>
  <li>Responsive mobile-first design</li>
</ul>

<hr/>

<h2>Configuration</h2>

<h3>Tailwind CSS</h3>
<p>Custom configuration via <code>components.json</code> for shadcn/ui integration.</p>

<h3>TypeScript</h3>
<p>Strict mode enabled with configured path aliases.</p>

<h3>Vite</h3>
<p>Development server with React plugin and fast refresh.</p>

<hr/>

<h2>Browser Support</h2>
<ul>
  <li>Chrome / Edge (latest)</li>
  <li>Firefox (latest)</li>
  <li>Safari (latest)</li>
</ul>

<hr/>

<h2>License</h2>
<p>
MIT License — free for personal and commercial use.
</p>

<hr/>

<h2>Contributing</h2>
<ol>
  <li>Fork the repository</li>
  <li>Create your feature branch:
    <pre><code>git checkout -b feature/AmazingFeature</code></pre>
  </li>
  <li>Commit changes:
    <pre><code>git commit -m "Add some AmazingFeature"</code></pre>
  </li>
  <li>Push branch:
    <pre><code>git push origin feature/AmazingFeature</code></pre>
  </li>
  <li>Open a Pull Request</li>
</ol>

<hr/>

<p><strong>Built with React and TypeScript.</strong></p>
