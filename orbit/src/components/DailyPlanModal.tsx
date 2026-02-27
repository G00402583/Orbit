import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Loader2, Sparkles, Calendar, Lightbulb, ArrowRight } from 'lucide-react';
import type { Task } from '../types/task';

interface DailyPlan {
  plan: string;
  recommendedOrder: string[];
  reasoning: string;
}

interface DailyPlanModalProps {
  open: boolean;
  onClose: () => void;
  tasks: Task[];
  onFocusTask: (taskId: string) => void;
}

export const DailyPlanModal = ({
  open,
  onClose,
  tasks,
  onFocusTask,
}: DailyPlanModalProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [dailyPlan, setDailyPlan] = useState<DailyPlan | null>(null);

  const handleGenerate = async () => {
    setIsLoading(true);
    setError('');

    try {
      if (tasks.length === 0) {
        throw new Error('No tasks to plan');
      }

      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-daily-plan`;
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tasks }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error Response:', errorText);
        let errorMessage = 'Request failed';
        try {
          const errJson = JSON.parse(errorText);
          errorMessage = errJson.error || errorMessage;
        } catch {
          errorMessage = errorText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log('Daily Plan Response:', data);
      setDailyPlan(data);
    } catch (err) {
      console.error('Daily plan error:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate daily plan');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartTask = (taskId: string) => {
    onFocusTask(taskId);
    onClose();
  };

  const handleClose = () => {
    onClose();
  };

  const getTaskById = (taskId: string) => {
    return tasks.find(t => t.id === taskId);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Sparkles className="h-5 w-5 text-teal-600" />
            Plan My Day
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {!dailyPlan ? (
            <div className="text-center py-8">
              <div className="bg-gradient-to-br from-teal-50 to-blue-50 rounded-lg p-6 mb-4">
                <Calendar className="h-12 w-12 text-teal-600 mx-auto mb-3" />
                <h3 className="font-semibold text-lg mb-2">Get Your Daily Plan</h3>
                <p className="text-sm text-gray-600 mb-1">
                  AI will analyze your {tasks.length} task{tasks.length !== 1 ? 's' : ''}
                </p>
                <p className="text-sm text-gray-600">
                  and create a prioritized plan for today
                </p>
              </div>

              {tasks.length === 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
                  <p className="text-sm text-amber-700">
                    You need at least one incomplete task to create a daily plan.
                  </p>
                </div>
              )}

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              <Button
                onClick={handleGenerate}
                disabled={isLoading || tasks.length === 0}
                className="bg-teal-600 hover:bg-teal-700 text-white gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Creating your plan...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Generate Daily Plan
                  </>
                )}
              </Button>
            </div>
          ) : (
            <>
              <div className="bg-gradient-to-br from-blue-50 to-teal-50 rounded-lg p-4 border border-teal-200">
                <div className="flex items-start gap-2 mb-2">
                  <Lightbulb className="h-5 w-5 text-teal-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-sm text-gray-900 mb-1">Your Plan for Today</h4>
                    <p className="text-sm text-gray-700 leading-relaxed mb-2">{dailyPlan.plan}</p>
                    <p className="text-xs text-gray-600 italic">{dailyPlan.reasoning}</p>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-sm text-gray-700 mb-3 flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Recommended Order
                </h4>
                <div className="space-y-3">
                  {dailyPlan.recommendedOrder.map((taskId, index) => {
                    const task = getTaskById(taskId);
                    if (!task) return null;

                    return (
                      <div
                        key={taskId}
                        className="bg-white border border-gray-200 rounded-lg p-4 hover:border-teal-200 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-3 flex-1 min-w-0">
                            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center text-xs font-semibold">
                              {index + 1}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h5 className="font-medium text-sm text-gray-900 mb-1">{task.title}</h5>
                              {task.description && (
                                <p className="text-xs text-gray-600 mb-2 line-clamp-2">{task.description}</p>
                              )}
                              <div className="flex flex-wrap gap-1.5">
                                <Badge
                                  variant="outline"
                                  className={`text-xs ${
                                    task.priority === 'high'
                                      ? 'bg-red-50 text-red-700 border-red-200'
                                      : task.priority === 'medium'
                                      ? 'bg-amber-50 text-amber-700 border-amber-200'
                                      : 'bg-blue-50 text-blue-700 border-blue-200'
                                  }`}
                                >
                                  {task.priority}
                                </Badge>
                                {task.dueDate && (
                                  <Badge className="text-xs bg-gray-50 text-gray-700 border-gray-200">
                                    <Calendar className="h-3 w-3 mr-1" />
                                    {new Date(task.dueDate).toLocaleDateString()}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            onClick={() => handleStartTask(taskId)}
                            className="bg-teal-600 hover:bg-teal-700 text-white text-xs gap-1 flex-shrink-0"
                          >
                            Start
                            <ArrowRight className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <Button variant="outline" onClick={handleClose} className="flex-1">
                  Dismiss
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
