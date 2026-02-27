import type { Priority } from '../types/task';
import { cn } from '../lib/utils';

interface FilterButtonsProps {
  selected: Priority | 'all';
  onSelect: (priority: Priority | 'all') => void;
}

const filters: { value: Priority | 'all'; label: string; activeClass: string }[] = [
  { value: 'all', label: 'All Tasks', activeClass: 'bg-gray-900 text-white shadow-md' },
  { value: 'high', label: 'High', activeClass: 'bg-red-500 text-white shadow-md shadow-red-500/25' },
  { value: 'medium', label: 'Medium', activeClass: 'bg-amber-500 text-white shadow-md shadow-amber-500/25' },
  { value: 'low', label: 'Low', activeClass: 'bg-blue-500 text-white shadow-md shadow-blue-500/25' },
];

export const FilterButtons = ({ selected, onSelect }: FilterButtonsProps) => {
  return (
    <div className="flex gap-2 flex-wrap">
      {filters.map(filter => (
        <button
          key={filter.value}
          onClick={() => onSelect(filter.value)}
          className={cn(
            'px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer',
            selected === filter.value
              ? filter.activeClass
              : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300 hover:bg-gray-50 shadow-sm'
          )}
        >
          {filter.label}
        </button>
      ))}
    </div>
  );
};
