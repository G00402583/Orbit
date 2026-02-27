import { useState } from 'react';
import type { Task } from '../types/task';
import { Card, CardContent, CardHeader } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from './ui/alert-dialog';
import { Pencil, Trash2, Calendar, ChevronDown, ChevronRight, Flame, AlertTriangle, ArrowDown, Sparkles, Loader2 } from 'lucide-react';
import { SubtaskList } from './SubtaskList';
import { SubtaskBreakdownModal } from './SubtaskBreakdownModal';
import { format, isPast, isToday } from 'date-fns';

interface TaskCardProps {
  task: Task;
  onEdit: () => void;
  onDelete: () => void;
  onUpdateSubtasks: (subtasks: Task['subtasks']) => void;
}

const priorityConfig = {
  high: {
    label: 'High',
    icon: Flame,
    borderColor: 'border-l-red-500',
    badgeClass: 'bg-red-50 text-red-700 border-red-200',
  },
  medium: {
    label: 'Medium',
    icon: AlertTriangle,
    borderColor: 'border-l-amber-500',
    badgeClass: 'bg-amber-50 text-amber-700 border-amber-200',
  },
  low: {
    label: 'Low',
    icon: ArrowDown,
    borderColor: 'border-l-blue-500',
    badgeClass: 'bg-blue-50 text-blue-700 border-blue-200',
  },
};

const statusConfig = {
  todo: { label: 'To Do', class: 'bg-gray-100 text-gray-600 border-gray-200' },
  'in-progress': { label: 'In Progress', class: 'bg-teal-50 text-teal-700 border-teal-200' },
  done: { label: 'Done', class: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
};

export const TaskCard = ({ task, onEdit, onDelete, onUpdateSubtasks }: TaskCardProps) => {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [isBreakingDown, setIsBreakingDown] = useState(false);
  const [suggestedSubtasks, setSuggestedSubtasks] = useState<string[]>([]);
  const [showBreakdownModal, setShowBreakdownModal] = useState(false);
  const [breakdownError, setBreakdownError] = useState('');

  const priority = priorityConfig[task.priority];
  const status = statusConfig[task.status];
  const PriorityIcon = priority.icon;
  const completedCount = task.subtasks.filter(st => st.completed).length;
  const hasSubtasks = task.subtasks.length > 0;

  const isOverdue = task.dueDate && isPast(new Date(task.dueDate)) && !isToday(new Date(task.dueDate)) && task.status !== 'done';

  const handleAIBreakdown = async () => {
    setIsBreakingDown(true);
    setBreakdownError('');

    try {
      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-task-parse`;
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'breakdown',
          task: {
            title: task.title,
            description: task.description,
          },
        }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({ error: 'Request failed' }));
        throw new Error(err.error || `API error: ${response.status}`);
      }

      const data = await response.json();

      if (!Array.isArray(data.subtasks) || data.subtasks.length === 0) {
        throw new Error('No subtasks generated');
      }

      setSuggestedSubtasks(data.subtasks);
      setShowBreakdownModal(true);
    } catch (err) {
      setBreakdownError(err instanceof Error ? err.message : 'Failed to generate subtasks');
      setTimeout(() => setBreakdownError(''), 4000);
    } finally {
      setIsBreakingDown(false);
    }
  };

  const handleAddSubtasks = (newSubtasks: string[]) => {
    const updatedSubtasks = [
      ...task.subtasks,
      ...newSubtasks.map(title => ({ id: crypto.randomUUID(), title, completed: false })),
    ];
    onUpdateSubtasks(updatedSubtasks);
  };

  return (
    <>
      <Card
        className={`border-l-4 ${priority.borderColor} hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 group`}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <h3
                className={`font-semibold text-[17px] leading-snug mb-2.5 break-words ${
                  task.status === 'done' ? 'line-through text-gray-400' : 'text-gray-900'
                }`}
              >
                {task.title}
              </h3>
              <div className="flex flex-wrap gap-2">
                <Badge className={`${priority.badgeClass} gap-1`}>
                  <PriorityIcon className="h-3 w-3" />
                  {priority.label}
                </Badge>
                <Badge className={status.class}>{status.label}</Badge>
                {task.dueDate && (
                  <Badge
                    variant="outline"
                    className={`gap-1 ${isOverdue ? 'border-red-300 text-red-600 bg-red-50' : ''}`}
                  >
                    <Calendar className="h-3 w-3" />
                    {format(new Date(task.dueDate), 'MMM d, yyyy')}
                    {isOverdue && <span className="text-[10px] font-bold ml-0.5">OVERDUE</span>}
                  </Badge>
                )}
              </div>
            </div>
            <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
              <Button
                variant="ghost"
                size="icon"
                onClick={onEdit}
                className="h-8 w-8 text-gray-400 hover:text-teal-600 hover:bg-teal-50"
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowDeleteDialog(true)}
                className="h-8 w-8 text-gray-400 hover:text-red-600 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        {(task.description || hasSubtasks || !hasSubtasks) && (
          <CardContent className="pt-0 space-y-3">
            {task.description && (
              <p className="text-sm text-gray-500 leading-relaxed whitespace-pre-wrap break-words">
                {task.description}
              </p>
            )}

            {!hasSubtasks && (
              <div className="pt-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleAIBreakdown}
                  disabled={isBreakingDown}
                  className="gap-2 text-teal-600 border-teal-200 hover:bg-teal-50 hover:text-teal-700 hover:border-teal-300"
                >
                  {isBreakingDown ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      Breaking down...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-3.5 w-3.5" />
                      Break down with Orbit
                    </>
                  )}
                </Button>
                {breakdownError && (
                  <p className="text-xs text-red-500 mt-2">{breakdownError}</p>
                )}
              </div>
            )}

            {hasSubtasks && (
              <div>
                <button
                  onClick={() => setExpanded(!expanded)}
                  className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 mb-2 transition-colors duration-150 cursor-pointer"
                >
                  {expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                  <span>Subtasks</span>
                  <span className="text-xs font-normal text-gray-400">
                    {completedCount}/{task.subtasks.length} done
                  </span>
                  <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden ml-1">
                    <div
                      className="h-full bg-teal-500 rounded-full transition-all duration-300"
                      style={{ width: `${(completedCount / task.subtasks.length) * 100}%` }}
                    />
                  </div>
                </button>
                {expanded && (
                  <SubtaskList subtasks={task.subtasks} onUpdate={onUpdateSubtasks} />
                )}
              </div>
            )}
          </CardContent>
        )}
      </Card>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Task</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{task.title}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={onDelete}
              className="bg-red-600 hover:bg-red-700 shadow-md shadow-red-600/20"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <SubtaskBreakdownModal
        open={showBreakdownModal}
        onClose={() => setShowBreakdownModal(false)}
        suggestedSubtasks={suggestedSubtasks}
        onAddSubtasks={handleAddSubtasks}
      />
    </>
  );
};
