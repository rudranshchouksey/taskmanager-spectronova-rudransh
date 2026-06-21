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

const COLUMN_DOT: Record<TaskStatus, string> = {
  todo: 'bg-[#F59E0B]',
  'in-progress': 'bg-[#2563EB]',
  done: 'bg-[#EC4899]',
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
    <div className="flex flex-col min-h-[calc(100vh-160px)] bg-[#F8FAFC] rounded-3xl p-4 border border-[#F1F5F9]">
      {/* Column header */}
      <div className="flex items-center gap-2.5 mb-4 px-1 flex-shrink-0">
        <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${dot}`} />
        <span className="text-[16px] font-bold text-slate-800 flex-1">
          {label}
        </span>
        <span className="text-[12px] font-bold text-[#2563EB] bg-[#EFF6FF] rounded-full w-6 h-6 flex items-center justify-center">
          {tasks.length}
        </span>
        <button
          onClick={() => onAddTask(status)}
          className="p-1 rounded-lg text-slate-400 hover:bg-white hover:text-slate-600 transition-colors"
        >
          <Plus size={18} className="stroke-[2]" />
        </button>
        <button className="p-1 rounded-lg text-slate-400 hover:bg-white hover:text-slate-600 transition-colors">
          <MoreHorizontal size={18} className="stroke-[2]" />
        </button>
      </div>

      {/* Cards drop container area */}
      <div
        className={`flex-1 overflow-y-auto space-y-4 rounded-2xl transition-all duration-150 p-0.5 ${
          isDragOver ? 'bg-slate-100/80 ring-2 ring-inset ring-slate-200 ring-dashed' : ''
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {tasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center mb-3 shadow-sm border border-slate-100">
              <ClipboardList size={20} className="text-slate-300" />
            </div>
            <p className="text-[13px] font-semibold text-slate-400">No tasks here</p>
            <button
              onClick={() => onAddTask(status)}
              className="mt-2 text-[12px] font-bold text-blue-500 hover:text-blue-600 transition-colors"
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