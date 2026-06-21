import { Plus, MoreHorizontal, ClipboardList } from 'lucide-react';
import { useState } from 'react';
import type { Task, TaskStatus } from '../../BLL/taskManager/types';
import type { TaskManager } from '../../BLL/taskManager/TaskManager';
import { TaskCard } from './TaskCard';

interface KanbanColumnProps {
  status: TaskStatus;
  label: string;
  tasks: Task[];
  manager: TaskManager;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  onSelect: (task: Task) => void;
  onAddTask: (status: TaskStatus) => void;
  onTaskMoved: () => void;
}

/* Dot color matches the image: amber=todo, blue=in-progress, pink=done */
const COLUMN_DOT: Record<TaskStatus, string> = {
  todo: 'bg-amber-400',
  'in-progress': 'bg-blue-500',
  done: 'bg-pink-500',
};

export function KanbanColumn({
  status,
  label,
  tasks,
  manager,
  onEdit,
  onDelete,
  onSelect,
  onAddTask,
  onTaskMoved,
}: KanbanColumnProps) {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragOver(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    const taskId = e.dataTransfer.getData('taskId');
    if (taskId) {
      manager.moveTo(taskId, status);
      onTaskMoved();
    }
  };

  const dot = COLUMN_DOT[status];

  return (
    <div className="column flex flex-col min-h-[calc(100vh-200px)] bg-[#f5f6f8] rounded-2xl p-3">
      {/* Column header */}
      <div className="column-header flex items-center gap-2 mb-3 px-1 flex-shrink-0">
        <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${dot}`} />
        <span className="text-[15px] font-semibold text-slate-800 flex-1 leading-none">
          {label}
        </span>
        <span className="text-[12px] font-semibold text-slate-500 bg-white rounded-full px-2 py-0.5 min-w-[22px] text-center leading-snug">
          {tasks.length}
        </span>
        <button
          onClick={() => onAddTask(status)}
          className="p-1 rounded-lg text-slate-400 hover:bg-white hover:text-slate-600 transition-colors"
        >
          <Plus size={15} />
        </button>
        <button className="p-1 rounded-lg text-slate-400 hover:bg-white hover:text-slate-600 transition-colors">
          <MoreHorizontal size={15} />
        </button>
      </div>

      {/* Scrollable cards area — also the drop zone, so dropping anywhere
          in the column's empty space (not just on a card) still works */}
      <div
        className={`column-content flex-1 overflow-y-auto space-y-3 rounded-xl transition-colors duration-150 ${
          isDragOver ? 'bg-blue-100/70 ring-2 ring-inset ring-blue-300 ring-dashed' : ''
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {tasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center mb-2.5">
              <ClipboardList size={18} className="text-slate-300" />
            </div>
            <p className="text-[12px] font-medium text-slate-400">No tasks</p>
            <button
              onClick={() => onAddTask(status)}
              className="mt-2 text-[11px] font-semibold text-blue-500 hover:text-blue-600 transition-colors"
            >
              + Add task
            </button>
          </div>
        ) : (
          tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              manager={manager}
              onEdit={onEdit}
              onDelete={onDelete}
              onSelect={onSelect}
            />
          ))
        )}
      </div>
    </div>
  );
}
