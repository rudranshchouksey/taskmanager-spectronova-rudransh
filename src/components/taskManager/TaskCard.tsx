import { MessageSquare, Link2, FileText, Flag, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { useState } from 'react';
import type { Task, TaskStatus, TaskPriority } from '../../BLL/taskManager/types';
import type { TaskManager } from '../../BLL/taskManager/TaskManager';
import { getAvatarColor, getInitials, formatDate } from '../../utils/utils';

interface TaskCardProps {
  task: Task;
  manager: TaskManager;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  onSelect: (task: Task) => void;
}

type SubStatus = 'not-started' | 'in-research' | 'on-track' | 'complete';

function getSubStatus(status: TaskStatus, priority: TaskPriority): SubStatus {
  if (status === 'done') return 'complete';
  if (status === 'in-progress') {
    return priority === 'high' ? 'in-research' : 'on-track';
  }
  return priority === 'high' ? 'in-research' : 'not-started';
}

const SUB_STATUS_CONFIG: Record<
  SubStatus,
  { label: string; dot: string; bg: string; text: string }
> = {
  'not-started': {
    label: 'Not Started',
    dot: 'bg-[#5B21B6]',
    bg: 'bg-[#F3E8FF]',
    text: 'text-[#6D28D9]',
  },
  'in-research': {
    label: 'In Research',
    dot: 'bg-[#D97706]',
    bg: 'bg-[#FEF3C7]',
    text: 'text-[#B45309]',
  },
  'on-track': {
    label: 'On Track',
    dot: 'bg-[#DB2777]',
    bg: 'bg-[#FCE7F3]',
    text: 'text-[#C2185B]',
  },
  complete: {
    label: 'Complete',
    dot: 'bg-[#059669]',
    bg: 'bg-[#D1FAE5]',
    text: 'text-[#047857]',
  },
};

/* Matches custom capsule pills on bottom-right side */
const PRIORITY_CONFIG: Record<TaskPriority, { bg: string; text: string; label: string }> = {
  high: { bg: 'bg-red-50', text: 'text-red-500', label: 'High' },
  medium: { bg: 'bg-[#FFF7ED]', text: 'text-[#D97706]', label: 'Medium' },
  low: { bg: 'bg-[#EFF6FF]', text: 'text-[#2563EB]', label: 'Low' },
};

export function TaskCard({ task, manager, onEdit, onDelete, onSelect }: TaskCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const isOverdue = manager.isOverdue(task);

  const subStatus = getSubStatus(task.status, task.priority);
  const badge = SUB_STATUS_CONFIG[subStatus];
  const priority = PRIORITY_CONFIG[task.priority];

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    e.dataTransfer.setData('taskId', task.id);
    e.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onClick={() => onSelect(task)}
      className="bg-white rounded-3xl border border-[#E2E8F0] p-5 shadow-sm cursor-grab active:cursor-grabbing select-none transition-all duration-200 hover:shadow-md group"
    >
      {/* Top row: sub-status badge + menu */}
      <div className="flex items-center justify-between mb-4">
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[12px] font-medium ${badge.bg} ${badge.text}`}>
          <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${badge.dot}`} />
          {badge.label}
        </span>

        <div className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setMenuOpen((v) => !v);
            }}
            className="p-1 rounded-lg text-slate-400 hover:bg-slate-50 transition-colors"
          >
            <MoreHorizontal size={18} className="stroke-[1.5]" />
          </button>
          {menuOpen && (
            <div
              className="absolute right-0 top-8 z-50 bg-white border border-slate-200 rounded-xl shadow-xl py-1 min-w-[140px]"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                className="flex items-center gap-2 w-full px-3 py-2 text-[13px] text-slate-700 hover:bg-slate-50 transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  setMenuOpen(false);
                  onEdit(task);
                }}
              >
                <Pencil size={12} />
                Edit task
              </button>
              <button
                className="flex items-center gap-2 w-full px-3 py-2 text-[13px] text-red-600 hover:bg-red-50 transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  setMenuOpen(false);
                  onDelete(task);
                }}
              >
                <Trash2 size={12} />
                Delete task
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Title */}
      <h3 className="text-[16px] font-bold text-slate-900 leading-snug mb-1.5 line-clamp-1">
        {task.title}
      </h3>

      {/* Description */}
      <p className="text-[13px] text-slate-400 leading-relaxed line-clamp-2 mb-4 font-normal">
        {task.description}
      </p>

      {/* Assignees row */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-[13px] text-slate-500 font-medium">Assignees :</span>
        <div className="flex -space-x-1.5 items-center">
          {task.assignees.slice(0, 3).map((name) => (
            <div
              key={name}
              title={name}
              className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white ring-2 ring-white ${getAvatarColor(name)}`}
            >
              {getInitials(name)}
            </div>
          ))}
          {task.assignees.length > 3 && (
            <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-500 ring-2 ring-white">
              +{task.assignees.length - 3}
            </div>
          )}
        </div>
      </div>

      {/* Date + Priority row */}
      <div className="flex items-center justify-between mb-4">
        <div className={`flex items-center gap-1.5 text-[13px] font-medium ${isOverdue ? 'text-red-500' : 'text-slate-400'}`}>
          <Flag size={14} className="stroke-[1.5]" />
          <span>{formatDate(task.dueDate)}</span>
        </div>
        <span className={`text-[12px] font-bold px-3 py-1 rounded-xl ${priority.bg} ${priority.text}`}>
          {priority.label}
        </span>
      </div>

      {/* Footer Meta Details */}
      <div className="pt-3 border-t border-slate-100 flex items-center gap-4 text-[12px] text-slate-400 font-medium">
        <span className="flex items-center gap-1">
          <MessageSquare size={13} className="stroke-[1.5]" />
          {task.comments} Comments
        </span>
        <span className="flex items-center gap-1">
          <Link2 size={13} className="stroke-[1.5]" />
          {task.links} Links
        </span>
        <span className="flex items-center gap-1">
          <FileText size={13} className="stroke-[1.5]" />
          {task.subTasksCompleted}/{task.subTasksTotal}
        </span>
      </div>
    </div>
  );
}