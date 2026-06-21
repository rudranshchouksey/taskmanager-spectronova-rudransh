import { MessageSquare, Link2, FileText, Flag, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { useState } from 'react';
import type { Task, TaskStatus, TaskPriority } from '../../BLL/taskManager/types';
import type { TaskManager } from '../../BLL/taskManager/TaskManager';
import { getAvatarColor, getInitials, formatDate } from './utils';

interface TaskCardProps {
  task: Task;
  manager: TaskManager;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  onSelect: (task: Task) => void;
}

/* ── Sub-status badge ──────────────────────────────────────────
   Derived deterministically from status + priority so cards in
   the same column can show different badges (like the design).    */
type SubStatus = 'not-started' | 'in-research' | 'on-track' | 'complete';

function getSubStatus(status: TaskStatus, priority: TaskPriority): SubStatus {
  if (status === 'done') return 'complete';
  if (status === 'in-progress') {
    return priority === 'high' ? 'in-research' : 'on-track';
  }
  // todo
  return priority === 'high' ? 'in-research' : 'not-started';
}

const SUB_STATUS_CONFIG: Record<
  SubStatus,
  { label: string; dot: string; bg: string; text: string }
> = {
  'not-started': {
    label: 'Not Started',
    dot: 'bg-violet-500',
    bg: 'bg-violet-50',
    text: 'text-violet-700',
  },
  'in-research': {
    label: 'In Research',
    dot: 'bg-amber-400',
    bg: 'bg-amber-50',
    text: 'text-amber-700',
  },
  'on-track': {
    label: 'On Track',
    dot: 'bg-pink-500',
    bg: 'bg-pink-50',
    text: 'text-pink-700',
  },
  complete: {
    label: 'Complete',
    dot: 'bg-emerald-500',
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
  },
};

/* ── Priority display (bottom-right colored text) ─────────────── */
const PRIORITY_COLOR: Record<TaskPriority, string> = {
  high: 'text-red-500',
  medium: 'text-amber-500',
  low: 'text-blue-500',
};
const PRIORITY_LABEL: Record<TaskPriority, string> = {
  high: 'High',
  medium: 'Medium',
  low: 'Low',
};

export function TaskCard({ task, manager, onEdit, onDelete, onSelect }: TaskCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const isOverdue = manager.isOverdue(task);

  const subStatus = getSubStatus(task.status, task.priority);
  const badge = SUB_STATUS_CONFIG[subStatus];
  const priorityColor = PRIORITY_COLOR[task.priority];
  const priorityLabel = PRIORITY_LABEL[task.priority];

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    e.dataTransfer.setData('taskId', task.id);
    e.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onClick={() => onSelect(task)}
      className="bg-white rounded-2xl border border-slate-200 shadow-sm cursor-grab active:cursor-grabbing select-none transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 group"
    >
      {/* Card body */}
      <div className="p-4 pb-3">
        {/* Top row: sub-status badge + menu */}
        <div className="flex items-center justify-between mb-3">
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold ${badge.bg} ${badge.text}`}
          >
            <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${badge.dot}`} />
            {badge.label}
          </span>

          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setMenuOpen((v) => !v);
              }}
              className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
            >
              <MoreHorizontal size={15} />
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
        <h3 className="text-[14px] font-bold text-slate-900 leading-snug mb-1.5 line-clamp-1">
          {task.title}
        </h3>

        {/* Description */}
        <p className="text-[12px] text-slate-400 leading-relaxed line-clamp-2 mb-4">
          {task.description}
        </p>

        {/* Assignees row */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-[12px] text-slate-400">Assignees :</span>
          <div className="flex -space-x-1.5">
            {task.assignees.slice(0, 3).map((name) => (
              <div
                key={name}
                title={name}
                className={`w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold text-white ring-2 ring-white ${getAvatarColor(name)}`}
              >
                {getInitials(name)}
              </div>
            ))}
            {task.assignees.length > 3 && (
              <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-[9px] font-bold text-slate-500 ring-2 ring-white">
                +{task.assignees.length - 3}
              </div>
            )}
          </div>
        </div>

        {/* Date + Priority row */}
        <div className="flex items-center justify-between">
          <div className={`flex items-center gap-1.5 text-[12px] ${isOverdue ? 'text-red-500' : 'text-slate-400'}`}>
            <Flag size={12} className="flex-shrink-0" />
            <span>{formatDate(task.dueDate)}</span>
          </div>
          <span className={`text-[12px] font-semibold ${priorityColor}`}>
            {priorityLabel}
          </span>
        </div>
      </div>

      {/* Footer */}
      <div className="px-4 py-2.5 border-t border-slate-100 flex items-center gap-4 text-[11px] text-slate-400">
        <span className="flex items-center gap-1">
          <MessageSquare size={11} />
          {task.comments} Comments
        </span>
        <span className="flex items-center gap-1">
          <Link2 size={11} />
          {task.links} Links
        </span>
        <span className="flex items-center gap-1">
          <FileText size={11} />
          {task.subTasksCompleted}/{task.subTasksTotal}
        </span>
      </div>
    </div>
  );
}
