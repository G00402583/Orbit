import { useMemo, useState } from 'react';
import type { Task } from '../types/task';
import { ChevronLeft, ChevronRight, Flame, AlertTriangle, ArrowDown } from 'lucide-react';
import {
  startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  eachDayOfInterval, format, isSameMonth, addMonths, subMonths, isToday,
} from 'date-fns';

interface CalendarViewProps {
  tasks: Task[];
  onEditTask: (task: Task) => void;
}

const priorityDot: Record<Task['priority'], string> = {
  high: 'bg-red-500',
  medium: 'bg-amber-500',
  low: 'bg-blue-500',
};

const priorityIcon = {
  high: Flame,
  medium: AlertTriangle,
  low: ArrowDown,
};

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const CalendarView = ({ tasks, onEditTask }: CalendarViewProps) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const calStart = startOfWeek(monthStart);
    const calEnd = endOfWeek(monthEnd);
    return eachDayOfInterval({ start: calStart, end: calEnd });
  }, [currentMonth]);

  const tasksByDate = useMemo(() => {
    const map = new Map<string, Task[]>();
    tasks.forEach(task => {
      if (task.dueDate) {
        const key = task.dueDate;
        if (!map.has(key)) map.set(key, []);
        map.get(key)!.push(task);
      }
    });
    return map;
  }, [tasks]);

  const undatedTasks = useMemo(
    () => tasks.filter(t => !t.dueDate),
    [tasks]
  );

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <button
            onClick={() => setCurrentMonth(prev => subMonths(prev, 1))}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors duration-150 cursor-pointer text-gray-600"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <h2 className="text-lg font-semibold text-gray-900">
            {format(currentMonth, 'MMMM yyyy')}
          </h2>
          <button
            onClick={() => setCurrentMonth(prev => addMonths(prev, 1))}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors duration-150 cursor-pointer text-gray-600"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        <div className="grid grid-cols-7">
          {WEEKDAYS.map(day => (
            <div
              key={day}
              className="px-2 py-2.5 text-center text-xs font-semibold text-gray-500 uppercase tracking-wide border-b border-gray-100"
            >
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7">
          {calendarDays.map((day, idx) => {
            const dateKey = format(day, 'yyyy-MM-dd');
            const dayTasks = tasksByDate.get(dateKey) || [];
            const inMonth = isSameMonth(day, currentMonth);
            const today = isToday(day);

            return (
              <div
                key={idx}
                className={`min-h-[90px] sm:min-h-[110px] border-b border-r border-gray-100 p-1.5 transition-colors duration-100 ${
                  inMonth ? 'bg-white' : 'bg-gray-50/60'
                }`}
              >
                <div className="flex justify-end mb-1">
                  <span
                    className={`text-xs font-medium w-6 h-6 flex items-center justify-center rounded-full ${
                      today
                        ? 'bg-teal-600 text-white'
                        : inMonth
                          ? 'text-gray-700'
                          : 'text-gray-300'
                    }`}
                  >
                    {format(day, 'd')}
                  </span>
                </div>

                <div className="space-y-0.5">
                  {dayTasks.slice(0, 3).map(task => {
                    const Icon = priorityIcon[task.priority];
                    return (
                      <button
                        key={task.id}
                        onClick={() => onEditTask(task)}
                        className={`w-full text-left px-1.5 py-1 rounded-md text-[11px] leading-tight font-medium truncate flex items-center gap-1 transition-all duration-150 cursor-pointer ${
                          task.status === 'done'
                            ? 'bg-gray-100 text-gray-400 line-through hover:bg-gray-200'
                            : `hover:ring-1 hover:ring-gray-300 ${
                                task.priority === 'high'
                                  ? 'bg-red-50 text-red-800'
                                  : task.priority === 'medium'
                                    ? 'bg-amber-50 text-amber-800'
                                    : 'bg-blue-50 text-blue-800'
                              }`
                        }`}
                        title={task.title}
                      >
                        <Icon className="h-2.5 w-2.5 shrink-0" />
                        <span className="truncate">{task.title}</span>
                      </button>
                    );
                  })}
                  {dayTasks.length > 3 && (
                    <p className="text-[10px] text-gray-400 font-medium pl-1.5">
                      +{dayTasks.length - 3} more
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {undatedTasks.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">
            No date assigned ({undatedTasks.length})
          </h3>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {undatedTasks.map(task => (
              <button
                key={task.id}
                onClick={() => onEditTask(task)}
                className="flex items-center gap-2.5 p-3 rounded-lg border border-gray-150 hover:border-gray-300 hover:shadow-sm transition-all duration-150 text-left cursor-pointer group"
              >
                <span className={`w-2 h-2 rounded-full shrink-0 ${priorityDot[task.priority]}`} />
                <span
                  className={`text-sm font-medium truncate group-hover:text-gray-900 ${
                    task.status === 'done' ? 'line-through text-gray-400' : 'text-gray-700'
                  }`}
                >
                  {task.title}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
