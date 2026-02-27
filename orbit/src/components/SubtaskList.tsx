import { useState } from 'react';
import type { Subtask } from '../types/task';
import { Checkbox } from './ui/checkbox';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Plus, X } from 'lucide-react';

interface SubtaskListProps {
  subtasks: Subtask[];
  onUpdate: (subtasks: Subtask[]) => void;
}

export const SubtaskList = ({ subtasks, onUpdate }: SubtaskListProps) => {
  const [newTitle, setNewTitle] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const toggleSubtask = (id: string) => {
    onUpdate(
      subtasks.map(st => (st.id === id ? { ...st, completed: !st.completed } : st))
    );
  };

  const addSubtask = () => {
    if (!newTitle.trim()) return;
    onUpdate([
      ...subtasks,
      { id: crypto.randomUUID(), title: newTitle, completed: false },
    ]);
    setNewTitle('');
    setIsAdding(false);
  };

  const removeSubtask = (id: string) => {
    onUpdate(subtasks.filter(st => st.id !== id));
  };

  return (
    <div className="space-y-2 pl-1">
      {subtasks.map(subtask => (
        <div key={subtask.id} className="flex items-center gap-2.5 group">
          <Checkbox
            checked={subtask.completed}
            onCheckedChange={() => toggleSubtask(subtask.id)}
            id={subtask.id}
          />
          <label
            htmlFor={subtask.id}
            className={`flex-1 text-sm cursor-pointer transition-colors duration-150 ${
              subtask.completed ? 'line-through text-gray-400' : 'text-gray-700'
            }`}
          >
            {subtask.title}
          </label>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => removeSubtask(subtask.id)}
            className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity duration-150 text-gray-400 hover:text-red-500"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      ))}

      {isAdding ? (
        <div className="flex gap-2 pt-1">
          <Input
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Subtask title"
            className="h-8 text-sm"
            onKeyDown={(e) => {
              if (e.key === 'Enter') addSubtask();
              if (e.key === 'Escape') {
                setIsAdding(false);
                setNewTitle('');
              }
            }}
            autoFocus
          />
          <Button size="sm" onClick={addSubtask} className="h-8 px-3">
            Add
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => { setIsAdding(false); setNewTitle(''); }}
            className="h-8 px-3"
          >
            Cancel
          </Button>
        </div>
      ) : (
        <button
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-teal-600 transition-colors duration-150 pt-1 cursor-pointer"
        >
          <Plus className="h-3.5 w-3.5" />
          Add subtask
        </button>
      )}
    </div>
  );
};
