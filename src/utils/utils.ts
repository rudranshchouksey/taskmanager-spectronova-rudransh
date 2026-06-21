import type { TaskPriority, TaskStatus } from '../BLL/taskManager/types';

const AVATAR_COLORS = [
  'bg-violet-500',
  'bg-blue-500',
  'bg-emerald-500',
  'bg-amber-500',
  'bg-rose-500',
  'bg-cyan-500',
  'bg-pink-500',
  'bg-orange-500',
];

export function getAvatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function formatDate(isoDate: string): string {
  const date = new Date(isoDate);
  return date.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function formatDateTime(isoDate: string): string {
  const date = new Date(isoDate);
  return (
    date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) +
    '  ' +
    date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
  );
}

export const PRIORITY_CONFIG: Record<
  TaskPriority,
  { label: string; badgeBg: string; badgeText: string; dot: string }
> = {
  high: {
    label: 'High',
    badgeBg: 'bg-red-100',
    badgeText: 'text-red-600',
    dot: 'bg-red-500',
  },
  medium: {
    label: 'Medium',
    badgeBg: 'bg-amber-100',
    badgeText: 'text-amber-600',
    dot: 'bg-amber-500',
  },
  low: {
    label: 'Low',
    badgeBg: 'bg-blue-100',
    badgeText: 'text-blue-600',
    dot: 'bg-blue-500',
  },
};

export const STATUS_CONFIG: Record<
  TaskStatus,
  { label: string; color: string; bg: string; dot: string }
> = {
  todo: {
    label: 'Not Started',
    color: 'text-slate-600',
    bg: 'bg-slate-100',
    dot: 'bg-slate-400',
  },
  'in-progress': {
    label: 'In Progress',
    color: 'text-amber-600',
    bg: 'bg-amber-50',
    dot: 'bg-amber-400',
  },
  done: {
    label: 'Complete',
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
    dot: 'bg-emerald-500',
  },
};

export const COLUMN_COLORS: Record<TaskStatus, string> = {
  todo: 'text-slate-500',
  'in-progress': 'text-blue-500',
  done: 'text-emerald-500',
};

export const COLUMN_DOT: Record<TaskStatus, string> = {
  todo: 'bg-slate-400',
  'in-progress': 'bg-blue-500',
  done: 'bg-emerald-500',
};
