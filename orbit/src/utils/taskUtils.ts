import type { Task, Priority } from '../types/task';

const priorityOrder: Record<Priority, number> = {
  high: 1,
  medium: 2,
  low: 3,
};

const matchesSearch = (task: Task, query: string): boolean => {
  if (!query) return true;
  const q = query.toLowerCase();
  if (task.title.toLowerCase().includes(q)) return true;
  if (task.description.toLowerCase().includes(q)) return true;
  if (task.subtasks.some(st => st.title.toLowerCase().includes(q))) return true;
  return false;
};

export const filterAndSortTasks = (
  tasks: Task[],
  filterPriority: Priority | 'all',
  searchQuery = ''
): Task[] => {
  let filtered = tasks;

  if (filterPriority !== 'all') {
    filtered = filtered.filter(task => task.priority === filterPriority);
  }

  if (searchQuery.trim()) {
    filtered = filtered.filter(task => matchesSearch(task, searchQuery.trim()));
  }

  return [...filtered].sort((a, b) => {
    const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
    if (priorityDiff !== 0) return priorityDiff;

    if (a.dueDate && b.dueDate) {
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    }
    if (a.dueDate) return -1;
    if (b.dueDate) return 1;

    return 0;
  });
};
