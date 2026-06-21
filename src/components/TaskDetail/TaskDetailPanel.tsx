import {
  X,
  Clock,
  Zap,
  Target,
  Calendar,
  Tag,
  Users,
  Star,
  MoreHorizontal,
  Download,
  FileText,
} from 'lucide-react';
import { useState } from 'react';
import type { Task } from '../../BLL/taskManager/types';
import type { TaskManager } from '../../BLL/taskManager/TaskManager';
import {
  getAvatarColor,
  getInitials,
  formatDate,
  formatDateTime,
  PRIORITY_CONFIG,
  STATUS_CONFIG,
} from '../../utils/utils';

interface TaskDetailPanelProps {
  task: Task;
  manager: TaskManager;
  onClose: () => void;
  onEdit: (task: Task) => void;
}

type ActivityTab = 'Activity' | 'My Work' | 'Assigned' | 'Comments';

const MOCK_ACTIVITY = [
  {
    id: 'a1',
    user: 'Talan Korsgaard',
    action: 'changed the status of ',
    bold: '"Design Homepage Wireframe"',
    suffix: ' from ',
    from: 'To Do',
    to: 'In Progress',
    time: '10:45 AM',
    date: 'Today',
    type: 'status' as const,
  },
  {
    id: 'a2',
    user: 'Hanna Philips',
    action: 'added reaction ',
    emoji: '🚀',
    suffix: ' in ',
    bold: 'Design Homepage Wireframe',
    time: '10:20 AM',
    date: 'Today',
    type: 'reaction' as const,
  },
  {
    id: 'a3',
    user: 'Talan Korsgaard',
    action: 'added a comment in ',
    bold: 'Design Homepage Wireframe',
    time: '10:45 AM',
    date: 'Today',
    type: 'comment' as const,
  },
  {
    id: 'a4',
    user: 'Davis Donin',
    action: 'Uploaded file ',
    bold: 'User flow',
    time: '10:45 AM',
    date: 'Today',
    type: 'upload' as const,
    fileName: 'User Flow',
    fileType: 'PDF',
    fileSize: '2.35 mb',
  },
  {
    id: 'a5',
    user: 'Talan Korsgaard',
    action: 'added reaction ',
    emoji: '👌',
    suffix: ' in ',
    bold: 'Design Homepage Wireframe',
    time: '10:45 AM',
    date: 'Yesterday',
    type: 'reaction' as const,
  },
  {
    id: 'a6',
    user: 'Talan Korsgaard',
    action: 'was created ',
    bold: 'Design Homepage Wireframe',
    time: '10:45 AM',
    date: 'Yesterday',
    type: 'status' as const,
  },
];

function ActivityItem({ entry }: { entry: (typeof MOCK_ACTIVITY)[0] }) {
  const firstAssignee = entry.user;
  return (
    <div className="flex gap-3 py-3">
      <div
        className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-[10px] font-bold text-white ${getAvatarColor(firstAssignee)}`}
      >
        {getInitials(firstAssignee)}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[13px] text-slate-700 leading-snug">
          <span className="font-semibold">{entry.user}</span>{' '}
          <span className="text-slate-500">{entry.action}</span>
          {'emoji' in entry && entry.emoji && <span>{entry.emoji}</span>}
          {'bold' in entry && entry.bold && (
            <span className="font-semibold text-slate-700">{entry.bold}</span>
          )}
          {'suffix' in entry && entry.suffix && (
            <span className="text-slate-500">{entry.suffix}</span>
          )}
          {'from' in entry && entry.from && (
            <span className="font-semibold">{entry.from}</span>
          )}
          {'to' in entry && entry.to && (
            <>
              <span className="text-slate-500"> to </span>
              <span className="font-semibold">{entry.to}</span>
            </>
          )}
        </p>
        {entry.type === 'upload' && entry.fileName && (
          <div className="mt-2 flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200 max-w-[220px]">
            <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <FileText size={16} className="text-red-500" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[12px] font-semibold text-slate-700 truncate">{entry.fileName}</p>
              <p className="text-[11px] text-slate-400">{entry.fileType} • {entry.fileSize}</p>
            </div>
            <button className="p-1 text-slate-400 hover:text-slate-600 transition-colors">
              <Download size={14} />
            </button>
          </div>
        )}
        <p className="text-[11px] text-slate-400 mt-1">{entry.time}</p>
      </div>
    </div>
  );
}

export function TaskDetailPanel({ task, manager, onClose, onEdit }: TaskDetailPanelProps) {
  const [activeTab, setActiveTab] = useState<ActivityTab>('Activity');
  const isOverdue = manager.isOverdue(task);
  const priority = PRIORITY_CONFIG[task.priority];
  const status = STATUS_CONFIG[task.status];

  const todayEntries = MOCK_ACTIVITY.filter((e) => e.date === 'Today');
  const yesterdayEntries = MOCK_ACTIVITY.filter((e) => e.date === 'Yesterday');

  const tabs: ActivityTab[] = ['Activity', 'My Work', 'Assigned', 'Comments'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white h-full w-full max-w-[520px] shadow-2xl flex flex-col overflow-hidden">
        {/* Top bar */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 flex-shrink-0">
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
          >
            <X size={18} />
          </button>
          <div className="flex items-center gap-1">
            <button className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 transition-colors">
              <Clock size={16} />
            </button>
            <button className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 transition-colors">
              <Star size={16} />
            </button>
            <button
              onClick={() => onEdit(task)}
              className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 transition-colors"
            >
              <MoreHorizontal size={16} />
            </button>
          </div>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto">
          <div className="px-6 pt-6 pb-4">
            {/* Title */}
            <h1 className="text-[22px] font-bold text-slate-900 leading-snug mb-6">
              {task.title}
            </h1>

            {/* Meta fields */}
            <div className="space-y-4">
              {/* Created time */}
              <div className="flex items-start gap-3">
                <div className="flex items-center gap-2 w-32 flex-shrink-0 mt-0.5">
                  <Clock size={14} className="text-slate-400" />
                  <span className="text-[13px] text-slate-500">Created time</span>
                </div>
                <span className="text-[13px] text-slate-700">{formatDateTime(task.createdAt)}</span>
              </div>

              {/* Status */}
              <div className="flex items-start gap-3">
                <div className="flex items-center gap-2 w-32 flex-shrink-0 mt-0.5">
                  <Zap size={14} className="text-slate-400" />
                  <span className="text-[13px] text-slate-500">Status</span>
                </div>
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[12px] font-semibold ${status.bg} ${status.color}`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                  {status.label}
                </span>
              </div>

              {/* Priority */}
              <div className="flex items-start gap-3">
                <div className="flex items-center gap-2 w-32 flex-shrink-0 mt-0.5">
                  <Target size={14} className="text-slate-400" />
                  <span className="text-[13px] text-slate-500">Priority</span>
                </div>
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[12px] font-semibold ${priority.badgeBg} ${priority.badgeText}`}
                >
                  {priority.label}
                </span>
              </div>

              {/* Due Date */}
              <div className="flex items-start gap-3">
                <div className="flex items-center gap-2 w-32 flex-shrink-0 mt-0.5">
                  <Calendar size={14} className="text-slate-400" />
                  <span className="text-[13px] text-slate-500">Due Date</span>
                </div>
                <span className={`text-[13px] font-medium ${isOverdue ? 'text-red-500' : 'text-slate-700'}`}>
                  {formatDate(task.dueDate)}
                  {isOverdue && <span className="ml-1 text-[11px] text-red-400">(overdue)</span>}
                </span>
              </div>

              {/* Tags */}
              {task.tags.length > 0 && (
                <div className="flex items-start gap-3">
                  <div className="flex items-center gap-2 w-32 flex-shrink-0 mt-0.5">
                    <Tag size={14} className="text-slate-400" />
                    <span className="text-[13px] text-slate-500">Tags</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {task.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2.5 py-1 rounded-full border border-slate-200 text-[11px] font-semibold text-slate-600 bg-slate-50"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Assignees */}
              <div className="flex items-start gap-3">
                <div className="flex items-center gap-2 w-32 flex-shrink-0 mt-0.5">
                  <Users size={14} className="text-slate-400" />
                  <span className="text-[13px] text-slate-500">Assignees</span>
                </div>
                <div className="flex -space-x-1.5">
                  {task.assignees.map((name) => (
                    <div
                      key={name}
                      title={name}
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold text-white ring-2 ring-white ${getAvatarColor(name)}`}
                    >
                      {getInitials(name)}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="mt-6 p-4 rounded-xl bg-slate-50 border border-slate-100">
              <h3 className="text-[13px] font-semibold text-slate-700 mb-2">Project Description</h3>
              <p className="text-[13px] text-slate-600 leading-relaxed">{task.description}</p>
            </div>

            {/* Activity tabs */}
            <div className="mt-6">
              <div className="flex gap-1 border-b border-slate-100">
                {tabs.map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 py-2.5 text-[13px] font-medium transition-colors border-b-2 -mb-px ${
                      activeTab === tab
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {activeTab === 'Activity' && (
                <div className="mt-2">
                  {todayEntries.length > 0 && (
                    <div>
                      <p className="text-[12px] font-semibold text-slate-700 py-2">Today</p>
                      <div className="divide-y divide-slate-50">
                        {todayEntries.map((e) => (
                          <ActivityItem key={e.id} entry={e} />
                        ))}
                      </div>
                    </div>
                  )}
                  {yesterdayEntries.length > 0 && (
                    <div className="mt-2">
                      <p className="text-[12px] font-semibold text-slate-700 py-2">Yesterday</p>
                      <div className="divide-y divide-slate-50">
                        {yesterdayEntries.map((e) => (
                          <ActivityItem key={e.id} entry={e} />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab !== 'Activity' && (
                <div className="py-10 text-center text-[13px] text-slate-400">
                  No {activeTab.toLowerCase()} yet
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
