import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { Task, Priority } from '../types/task';

interface TaskContextType {
  tasks: Task[];
  addTask: (task: Omit<Task, 'id' | 'createdAt'>) => void;
  updateTask: (id: string, task: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  filterPriority: Priority | 'all';
  setFilterPriority: (priority: Priority | 'all') => void;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export const useTaskContext = () => {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error('useTaskContext must be used within TaskProvider');
  }
  return context;
};

export const TaskProvider = ({ children }: { children: ReactNode }) => {
  const [tasks, setTasks] = useState<Task[]>(() => {
    const stored = localStorage.getItem('tasks');
    if (!stored) return [];

    const parsedTasks = JSON.parse(stored);
    return parsedTasks.map((task: Task) => {
      if (task.status === 'done' && !task.completedAt) {
        return { ...task, completedAt: task.createdAt + 3600000 };
      }
      return task;
    });
  });
  const [filterPriority, setFilterPriority] = useState<Priority | 'all'>('all');

  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }, [tasks]);

  const addTask = (task: Omit<Task, 'id' | 'createdAt'>) => {
    const newTask: Task = {
      ...task,
      id: crypto.randomUUID(),
      createdAt: Date.now(),
    };
    setTasks(prev => [...prev, newTask]);
  };

  const updateTask = (id: string, updatedFields: Partial<Task>) => {
    setTasks(prev =>
      prev.map(task => {
        if (task.id !== id) return task;

        const updated = { ...task, ...updatedFields };

        if (updatedFields.status === 'done' && task.status !== 'done') {
          updated.completedAt = Date.now();
        } else if (updatedFields.status && updatedFields.status !== 'done') {
          updated.completedAt = undefined;
        }

        return updated;
      })
    );
  };

  const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(task => task.id !== id));
  };

  return (
    <TaskContext.Provider
      value={{ tasks, addTask, updateTask, deleteTask, filterPriority, setFilterPriority }}
    >
      {children}
    </TaskContext.Provider>
  );
};
