import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Loader2, Sparkles, Calendar, Lightbulb, CheckCircle2 } from 'lucide-react';
import type { Task } from '../types/task';

interface ScheduleSuggestion {
  taskId: string;
  suggestedTime: string;
  reason: string;
}

interface ScheduleOptimizationModalProps {
  open: boolean;
  onClose: () => void;
  completedTasks: Task[];
  pendingTasks: Task[];
  onApplySuggestions: (suggestions: ScheduleSuggestion[]) => void;
}

export const ScheduleOptimizationModal = ({
  open,
  onClose,
  completedTasks,
  pendingTasks,
  onApplySuggestions,
}: ScheduleOptimizationModalProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [schedule, setSchedule] = useState<ScheduleSuggestion[]>([]);
  const [insights, setInsights] = useState('');
  const [hasGenerated, setHasGenerated] = useState(false);

  const handleGenerate = async () => {
    setIsLoading(true);
    setError('');

    try {
      if (completedTasks.length < 5) {
        throw new Error('You need at least 5 completed tasks to generate schedule optimization');
      }

      if (pendingTasks.length === 0) {
        throw new Error('No pending tasks to optimize');
      }

      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-schedule-optimize`;
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          completedTasks,
          pendingTasks,
        }),
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
      console.log('API Success Response:', data);
      setSchedule(data.schedule || []);
      setInsights(data.insights || '');
      setHasGenerated(true);
    } catch (err) {
      console.error('Schedule optimization error:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate schedule');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApply = () => {
    onApplySuggestions(schedule);
    onClose();
    setHasGenerated(false);
    setSchedule([]);
    setInsights('');
  };

  const handleClose = () => {
    onClose();
    setHasGenerated(false);
    setSchedule([]);
    setInsights('');
    setError('');
  };

  const getTaskById = (taskId: string) => {
    return pendingTasks.find(t => t.id === taskId);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Sparkles className="h-5 w-5 text-teal-600" />
            AI Schedule Optimization
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {!hasGenerated ? (
            <div className="text-center py-8">
              <div className="bg-gradient-to-br from-teal-50 to-blue-50 rounded-lg p-6 mb-4">
                <Calendar className="h-12 w-12 text-teal-600 mx-auto mb-3" />
                <h3 className="font-semibold text-lg mb-2">Optimize Your Schedule</h3>
                <p className="text-sm text-gray-600 mb-1">
                  AI will analyze your {completedTasks.length} completed tasks to understand your productivity patterns
                </p>
                <p className="text-sm text-gray-600">
                  Then suggest optimal times for your {pendingTasks.length} pending tasks
                </p>
              </div>

              {completedTasks.length < 5 && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
                  <p className="text-sm text-amber-700">
                    You need at least 5 completed tasks. Complete {5 - completedTasks.length} more to unlock schedule optimization.
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
                disabled={isLoading || completedTasks.length < 5 || pendingTasks.length === 0}
                className="bg-teal-600 hover:bg-teal-700 text-white gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Analyzing patterns...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Generate Optimal Schedule
                  </>
                )}
              </Button>
            </div>
          ) : (
            <>
              {insights && (
                <div className="bg-gradient-to-br from-blue-50 to-teal-50 rounded-lg p-4 border border-teal-200">
                  <div className="flex items-start gap-2 mb-2">
                    <Lightbulb className="h-5 w-5 text-teal-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-sm text-gray-900 mb-1">Your Productivity Insights</h4>
                      <p className="text-sm text-gray-700 leading-relaxed">{insights}</p>
                    </div>
                  </div>
                </div>
              )}

              {schedule.length > 0 && (
                <div>
                  <h4 className="font-semibold text-sm text-gray-700 mb-3 flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Suggested Schedule
                  </h4>
                  <div className="space-y-3">
                    {schedule.map((suggestion) => {
                      const task = getTaskById(suggestion.taskId);
                      if (!task) return null;

                      return (
                        <div
                          key={suggestion.taskId}
                          className="bg-white border border-gray-200 rounded-lg p-4 hover:border-teal-200 transition-colors"
                        >
                          <div className="flex items-start justify-between gap-3 mb-2">
                            <div className="flex-1 min-w-0">
                              <h5 className="font-medium text-sm text-gray-900 mb-1">{task.title}</h5>
                              <div className="flex flex-wrap gap-1.5">
                                <Badge className="text-xs bg-teal-50 text-teal-700 border-teal-200">
                                  <Calendar className="h-3 w-3 mr-1" />
                                  {suggestion.suggestedTime}
                                </Badge>
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
                              </div>
                            </div>
                          </div>
                          <p className="text-xs text-gray-600 leading-relaxed">{suggestion.reason}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <Button variant="outline" onClick={handleClose} className="flex-1">
                  Cancel
                </Button>
                <Button
                  onClick={handleApply}
                  className="flex-1 bg-teal-600 hover:bg-teal-700 text-white gap-2"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  Apply Suggestions
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
