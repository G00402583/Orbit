import { useState, useRef } from 'react';
import { Sparkles, Loader2, Check, AlertCircle } from 'lucide-react';
import type { Task } from '../types/task';
import { cn } from '../lib/utils';

interface AITaskInputProps {
  onTaskCreated: (task: Omit<Task, 'id' | 'createdAt'>) => void;
  onFallbackToManual: () => void;
}

type InputStatus = 'idle' | 'loading' | 'success' | 'error';

export const AITaskInput = ({ onTaskCreated, onFallbackToManual }: AITaskInputProps) => {
  const [input, setInput] = useState('');
  const [status, setStatus] = useState<InputStatus>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const successTimeout = useRef<ReturnType<typeof setTimeout>>(undefined);

  const handleSubmit = async () => {
    const trimmed = input.trim();
    if (!trimmed) return;

    setStatus('loading');
    setErrorMsg('');

    try {
      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-task-parse`;
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ input: trimmed }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({ error: 'Request failed' }));
        throw new Error(err.error || `API error: ${response.status}`);
      }

      const taskData = await response.json();

      let dueDate = '';
      if (taskData.dueDate) {
        const d = new Date(taskData.dueDate);
        if (!isNaN(d.getTime())) {
          dueDate = d.toISOString().split('T')[0];
        }
      }

      onTaskCreated({
        title: taskData.title || trimmed,
        description: taskData.description || '',
        dueDate,
        priority: ['high', 'medium', 'low'].includes(taskData.priority) ? taskData.priority : 'medium',
        status: 'todo',
        subtasks: [],
      });

      setInput('');
      setStatus('success');

      if (successTimeout.current) clearTimeout(successTimeout.current);
      successTimeout.current = setTimeout(() => setStatus('idle'), 2000);
    } catch (err) {
      setStatus('error');
      setErrorMsg(err instanceof Error ? err.message : 'Failed to create task');
      setTimeout(() => {
        setStatus('idle');
        setErrorMsg('');
      }, 4000);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="space-y-2">
      <div className="relative group">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
          {status === 'loading' ? (
            <Loader2 className="h-5 w-5 text-teal-500 animate-spin" />
          ) : status === 'success' ? (
            <Check className="h-5 w-5 text-emerald-500" />
          ) : status === 'error' ? (
            <AlertCircle className="h-5 w-5 text-red-400" />
          ) : (
            <Sparkles className="h-5 w-5 text-teal-400 group-focus-within:text-teal-600 transition-colors" />
          )}
        </div>

        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={status === 'loading'}
          placeholder="What do you need to do? (e.g., 'Essay due Friday 3pm')"
          className={cn(
            'w-full h-13 pl-12 pr-5 rounded-xl border-2 bg-white text-sm font-medium transition-all duration-200',
            'placeholder:text-gray-400 placeholder:font-normal',
            'focus:outline-none focus:ring-0',
            'disabled:opacity-60 disabled:cursor-not-allowed',
            status === 'error'
              ? 'border-red-200 focus:border-red-300 bg-red-50/50'
              : status === 'success'
                ? 'border-emerald-200 focus:border-emerald-300 bg-emerald-50/50'
                : 'border-gray-200 focus:border-teal-400 hover:border-gray-300',
            'shadow-sm focus:shadow-md'
          )}
        />
      </div>

      <div className="flex items-center justify-between px-1">
        <p className="text-xs text-gray-400">
          {status === 'loading' ? (
            <span className="text-teal-600 font-medium">Creating task...</span>
          ) : status === 'success' ? (
            <span className="text-emerald-600 font-medium">Task created successfully!</span>
          ) : status === 'error' ? (
            <span className="text-red-500">
              {errorMsg}{' '}
              <button onClick={onFallbackToManual} className="underline hover:text-red-600 cursor-pointer">
                Use manual form instead
              </button>
            </span>
          ) : (
            <span>
              Try: &ldquo;Biology essay due Friday 5pm&rdquo; or &ldquo;Study for math exam next Tuesday urgent&rdquo;
            </span>
          )}
        </p>
      </div>
    </div>
  );
};
