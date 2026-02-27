import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { X, GripVertical, Sparkles } from 'lucide-react';

interface SubtaskBreakdownModalProps {
  open: boolean;
  onClose: () => void;
  suggestedSubtasks: string[];
  onAddSubtasks: (subtasks: string[]) => void;
}

export const SubtaskBreakdownModal = ({
  open,
  onClose,
  suggestedSubtasks,
  onAddSubtasks,
}: SubtaskBreakdownModalProps) => {
  const [subtasks, setSubtasks] = useState<string[]>(suggestedSubtasks);

  useEffect(() => {
    if (open) {
      setSubtasks(suggestedSubtasks);
    }
  }, [open, suggestedSubtasks]);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const handleRemove = (index: number) => {
    setSubtasks(subtasks.filter((_, i) => i !== index));
  };

  const handleEdit = (index: number, value: string) => {
    setSubtasks(subtasks.map((s, i) => (i === index ? value : s)));
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newSubtasks = [...subtasks];
    const draggedItem = newSubtasks[draggedIndex];
    newSubtasks.splice(draggedIndex, 1);
    newSubtasks.splice(index, 0, draggedItem);
    setSubtasks(newSubtasks);
    setDraggedIndex(index);
  };

  const handleAddAll = () => {
    const validSubtasks = subtasks.filter(s => s.trim());
    if (validSubtasks.length > 0) {
      onAddSubtasks(validSubtasks);
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <div className="p-1.5 bg-gradient-to-br from-teal-400 to-teal-600 rounded-lg">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            Orbit-Suggested Subtasks
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3 py-4">
          <p className="text-sm text-gray-600">
            Review, edit, or reorder these suggested subtasks. You can also remove any you don't need.
          </p>

          {subtasks.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              All subtasks removed. Click Cancel to go back.
            </div>
          ) : (
            <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
              {subtasks.map((subtask, index) => (
                <div
                  key={index}
                  draggable
                  onDragStart={() => handleDragStart(index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDragEnd={() => setDraggedIndex(null)}
                  className="group flex items-center gap-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg p-2 transition-colors cursor-move"
                >
                  <GripVertical className="h-4 w-4 text-gray-400 flex-shrink-0" />

                  <Input
                    value={subtask}
                    onChange={(e) => handleEdit(index, e.target.value)}
                    className="flex-1 border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 h-8 px-2"
                  />

                  <button
                    onClick={() => handleRemove(index)}
                    className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-100 rounded transition-all flex-shrink-0"
                    title="Remove subtask"
                  >
                    <X className="h-4 w-4 text-red-500" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t">
          <Button
            variant="outline"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            onClick={handleAddAll}
            disabled={subtasks.filter(s => s.trim()).length === 0}
            className="bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700"
          >
            Add {subtasks.filter(s => s.trim()).length} Subtask{subtasks.filter(s => s.trim()).length !== 1 ? 's' : ''}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
