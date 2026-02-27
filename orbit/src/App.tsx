import { useState, useMemo, useRef } from 'react';
import { TaskProvider, useTaskContext } from './context/TaskContext';
import { TaskForm } from './components/TaskForm';
import { TaskCard } from './components/TaskCard';
import { FilterButtons } from './components/FilterButtons';
import { SearchBar } from './components/SearchBar';
import { CalendarView } from './components/CalendarView';
import { AITaskInput } from './components/AITaskInput';
import { ScheduleOptimizationModal } from './components/ScheduleOptimizationModal';
import { DailyPlanModal } from './components/DailyPlanModal';
import { Button } from './components/ui/button';
import { Plus, CheckSquare, ListTodo, List, CalendarDays, Target, Sparkles } from 'lucide-react';
import type { Task } from './types/task';
import { filterAndSortTasks } from './utils/taskUtils';
import { cn } from './lib/utils';
import './App.css';

type ViewMode = 'list' | 'calendar';

function TaskManager() {
  const { tasks, addTask, updateTask, deleteTask, filterPriority, setFilterPriority } = useTaskContext();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [showScheduleOptimization, setShowScheduleOptimization] = useState(false);
  const [showDailyPlan, setShowDailyPlan] = useState(false);
  const [highlightedTaskId, setHighlightedTaskId] = useState<string | null>(null);
  const taskRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const sortedTasks = useMemo(
    () => filterAndSortTasks(tasks, filterPriority, searchQuery),
    [tasks, filterPriority, searchQuery]
  );

  const handleOpenForm = () => {
    setEditingTask(undefined);
    setIsFormOpen(true);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setIsFormOpen(true);
  };

  const handleSubmitTask = (taskData: Omit<Task, 'id' | 'createdAt'>) => {
    if (editingTask) {
      updateTask(editingTask.id, taskData);
    } else {
      addTask(taskData);
    }
  };

  const stats = useMemo(() => ({
    total: tasks.length,
    done: tasks.filter(t => t.status === 'done').length,
    inProgress: tasks.filter(t => t.status === 'in-progress').length,
  }), [tasks]);

  const completedTasks = useMemo(
    () => tasks.filter(t => t.status === 'done' && t.completedAt),
    [tasks]
  );

  const pendingTasks = useMemo(
    () => tasks.filter(t => t.status !== 'done'),
    [tasks]
  );

  const handleApplySuggestions = (suggestions: Array<{ taskId: string; suggestedTime: string; reason: string }>) => {
    suggestions.forEach(suggestion => {
      const task = tasks.find(t => t.id === suggestion.taskId);
      if (task) {
        const updatedDescription = task.description
          ? `${task.description}\n\nSuggested time: ${suggestion.suggestedTime}\n${suggestion.reason}`
          : `Suggested time: ${suggestion.suggestedTime}\n${suggestion.reason}`;
        updateTask(suggestion.taskId, { description: updatedDescription });
      }
    });
  };

  const handleFocusTask = (taskId: string) => {
    setViewMode('list');
    setFilterPriority('all');
    setSearchQuery('');

    setTimeout(() => {
      const taskElement = taskRefs.current[taskId];
      if (taskElement) {
        taskElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        setHighlightedTaskId(taskId);
        setTimeout(() => setHighlightedTaskId(null), 2000);
      }
    }, 100);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-teal-50/30">
      <header className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-teal-900/20 via-transparent to-teal-900/20" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-teal-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-teal-400/5 rounded-full blur-2xl" />

        <div className="max-w-5xl mx-auto px-4 py-8 sm:px-6 lg:px-8 relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-br from-teal-400 to-teal-600 p-2.5 rounded-xl shadow-lg shadow-teal-500/25">
                <CheckSquare className="h-7 w-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white tracking-tight">Orbit</h1>
                {stats.total > 0 && (
                  <p className="text-sm text-gray-400 mt-0.5">
                    {stats.done} of {stats.total} completed
                    {stats.inProgress > 0 && <span> &middot; {stats.inProgress} in progress</span>}
                  </p>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => setShowDailyPlan(true)}
                size="lg"
                variant="outline"
                className="gap-2 bg-white/10 border-white/20 text-white hover:bg-white/20 hover:border-white/30 shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={pendingTasks.length === 0}
              >
                <Sparkles className="h-5 w-5" />
                <span className="hidden sm:inline">Plan My Day</span>
              </Button>
              <div className="relative group">
                <Button
                  onClick={() => setShowScheduleOptimization(true)}
                  size="lg"
                  variant="outline"
                  className="gap-2 bg-white/10 border-white/20 text-white hover:bg-white/20 hover:border-white/30 shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={completedTasks.length < 5 || pendingTasks.length === 0}
                >
                  <Target className="h-5 w-5" />
                  <span className="hidden sm:inline">Optimize</span>
                </Button>
                {(completedTasks.length < 5 || pendingTasks.length === 0) && (
                  <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-64 bg-gray-900 text-white text-xs rounded-lg p-3 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 shadow-xl">
                    <div className="space-y-1">
                      {completedTasks.length < 5 && (
                        <p>Need {5 - completedTasks.length} more completed task{5 - completedTasks.length !== 1 ? 's' : ''}</p>
                      )}
                      {pendingTasks.length === 0 && (
                        <p>Need at least 1 pending task to optimize</p>
                      )}
                    </div>
                    <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900" />
                  </div>
                )}
              </div>
              <Button
                onClick={handleOpenForm}
                size="lg"
                className="gap-2 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 shadow-lg shadow-teal-500/25 hover:shadow-xl hover:shadow-teal-500/30 hover:-translate-y-0.5 transition-all duration-200"
              >
                <Plus className="h-5 w-5" />
                <span className="hidden sm:inline">Add Task</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="pt-6 pb-2">
          <AITaskInput
            onTaskCreated={handleSubmitTask}
            onFallbackToManual={handleOpenForm}
          />
        </div>

        <div className="py-4 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex-1">
              <SearchBar value={searchQuery} onChange={setSearchQuery} />
            </div>
            <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-lg p-1 shadow-sm self-start">
              <button
                onClick={() => setViewMode('list')}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-150 cursor-pointer',
                  viewMode === 'list'
                    ? 'bg-gray-900 text-white shadow-sm'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                )}
              >
                <List className="h-4 w-4" />
                List
              </button>
              <button
                onClick={() => setViewMode('calendar')}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-150 cursor-pointer',
                  viewMode === 'calendar'
                    ? 'bg-gray-900 text-white shadow-sm'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                )}
              >
                <CalendarDays className="h-4 w-4" />
                Calendar
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <FilterButtons selected={filterPriority} onSelect={setFilterPriority} />
            <p className="text-sm text-gray-400 font-medium tabular-nums hidden sm:block">
              {(searchQuery.trim() || filterPriority !== 'all')
                ? `Showing ${sortedTasks.length} of ${tasks.length} tasks`
                : `${sortedTasks.length} ${sortedTasks.length === 1 ? 'task' : 'tasks'}`}
            </p>
          </div>
        </div>

        <main className="pb-12">
          {viewMode === 'calendar' ? (
            <CalendarView tasks={sortedTasks} onEditTask={handleEditTask} />
          ) : sortedTasks.length === 0 ? (
            <div className="text-center py-20 px-4">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 mb-5">
                <ListTodo className="h-10 w-10 text-gray-400" />
              </div>
              <h2 className="text-2xl font-semibold text-gray-800 mb-2">
                {tasks.length === 0
                  ? 'No tasks yet'
                  : searchQuery.trim()
                    ? 'No tasks match your search'
                    : 'No tasks match this filter'}
              </h2>
              <p className="text-gray-500 mb-8 max-w-sm mx-auto leading-relaxed">
                {tasks.length === 0
                  ? 'Create your first task to start organizing your work and boosting your productivity.'
                  : searchQuery.trim()
                    ? 'Try a different search term or clear your search to see all tasks.'
                    : 'Try selecting a different priority filter to see more tasks.'}
              </p>
              {tasks.length === 0 && (
                <Button
                  onClick={handleOpenForm}
                  size="lg"
                  className="gap-2 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 shadow-lg shadow-teal-500/25"
                >
                  <Plus className="h-5 w-5" />
                  Create Your First Task
                </Button>
              )}
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-2">
              {sortedTasks.map(task => (
                <div
                  key={task.id}
                  ref={(el) => { taskRefs.current[task.id] = el; }}
                  className={cn(
                    'transition-all duration-300',
                    highlightedTaskId === task.id && 'ring-2 ring-teal-500 rounded-lg'
                  )}
                >
                  <TaskCard
                    task={task}
                    onEdit={() => handleEditTask(task)}
                    onDelete={() => deleteTask(task.id)}
                    onUpdateSubtasks={(subtasks) => updateTask(task.id, { subtasks })}
                  />
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      <TaskForm
        open={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleSubmitTask}
        task={editingTask}
      />

      <ScheduleOptimizationModal
        open={showScheduleOptimization}
        onClose={() => setShowScheduleOptimization(false)}
        completedTasks={completedTasks}
        pendingTasks={pendingTasks}
        onApplySuggestions={handleApplySuggestions}
      />

      <DailyPlanModal
        open={showDailyPlan}
        onClose={() => setShowDailyPlan(false)}
        tasks={pendingTasks}
        onFocusTask={handleFocusTask}
      />
    </div>
  );
}

function App() {
  return (
    <TaskProvider>
      <TaskManager />
    </TaskProvider>
  );
}

export default App;
