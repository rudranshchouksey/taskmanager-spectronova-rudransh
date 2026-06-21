import {
  ChevronDown,
  ChevronRight,
  MoreHorizontal,
  Pencil,
  Trash2,
  Flag,
  Users,
  AlignLeft,
  CalendarDays,
  Square,
  CheckSquare,
  Bug,
  Shuffle,
  FileText,
  Settings2,
  Sun,
  Loader2,
  CheckCircle2,
  GripHorizontal,
  SlidersHorizontal,
  Info,
  Briefcase,
} from 'lucide-react';
import { useState } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import type { Task, TaskStatus, TaskType, FilterOptions, SortOptions } from '../../BLL/taskManager/types';
import type { TaskManager } from '../../BLL/taskManager/TaskManager';
import { getAvatarColor, getInitials } from './utils';

interface ListViewProps {
  manager: TaskManager;
  filters: FilterOptions;
  sort: SortOptions;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  onSelect: (task: Task) => void;
  onUpdateTaskStatus: (taskId: string | number, newStatus: TaskStatus) => void; // Call your backend/state manager here
}

const TH = 'border-b border-slate-200 bg-slate-50/60 py-3 px-4 text-left align-middle font-semibold text-slate-500 first:pl-5 last:pr-5';
const TD = 'border-b border-slate-200 py-3 px-4 align-middle text-slate-600 first:pl-5 last:pr-5 bg-white';

const LIST_PRIORITY: Record<Task['priority'], { label: string; bg: string; text: string; border: string }> = {
  high:   { label: 'Urgent',  bg: 'bg-red-50/60',     text: 'text-red-500',    border: 'border-red-100' },
  medium: { label: 'Normal',  bg: 'bg-orange-50/60',  text: 'text-orange-400', border: 'border-orange-100' },
  low:    { label: 'Lowest',  bg: 'bg-emerald-50/60', text: 'text-emerald-500', border: 'border-emerald-100' },
};

const TASK_TYPE_CONFIG: Record<TaskType, { label: string; icon: React.ElementType; text: string; border: string }> = {
  feature: { label: 'Feature', icon: Settings2, text: 'text-slate-600', border: 'border-slate-200' },
  bug:     { label: 'Bug',     icon: Bug,       text: 'text-slate-600', border: 'border-slate-200' },
  review:  { label: 'Review',  icon: Shuffle,   text: 'text-slate-600', border: 'border-slate-200' },
  testing: { label: 'Testing', icon: FileText,  text: 'text-slate-600', border: 'border-slate-200' },
};

const SECTIONS: { status: TaskStatus; label: string; pillBg: string; pillText: string; pillBorder: string; icon: React.ElementType }[] = [
  { status: 'todo',        label: 'Not Started', pillBg: 'bg-red-50/60',     pillText: 'text-red-400',     pillBorder: 'border-red-100',     icon: Sun },
  { status: 'in-progress', label: 'In Progress', pillBg: 'bg-amber-50/60',   pillText: 'text-amber-500',   pillBorder: 'border-amber-100',   icon: Loader2 },
  { status: 'done',        label: 'Done',        pillBg: 'bg-emerald-50/60', pillText: 'text-emerald-500', pillBorder: 'border-emerald-100', icon: CheckCircle2 },
];

function formatDateRange(createdAt: string, dueDate: string): string {
  const opts: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric' };
  return `${new Date(createdAt).toLocaleDateString('en-US', opts)} - ${new Date(dueDate).toLocaleDateString('en-US', opts)}`;
}

function TableHeader() {
  return (
    <thead>
      <tr className="bg-slate-50/20">
        <th className={`${TH} w-10 px-2`} />
        <th className={`${TH} w-10 px-2`} />
        <th className={TH}><span className="inline-flex items-center gap-2 text-[12px] font-medium text-slate-500 whitespace-nowrap"><CheckSquare size={14} className="text-slate-400" />Task Name</span></th>
        <th className={TH}><span className="inline-flex items-center gap-2 text-[12px] font-medium text-slate-500 whitespace-nowrap"><AlignLeft size={14} className="text-slate-400" />Descriptions</span></th>
        <th className={TH}><span className="inline-flex items-center gap-2 text-[12px] font-medium text-slate-500 whitespace-nowrap"><Users size={14} className="text-slate-400" />People</span></th>
        <th className={TH}><span className="inline-flex items-center gap-2 text-[12px] font-medium text-slate-500 whitespace-nowrap"><Settings2 size={14} className="text-slate-400" />Type</span></th>
        <th className={TH}><span className="inline-flex items-center gap-2 text-[12px] font-medium text-slate-500 whitespace-nowrap"><CalendarDays size={14} className="text-slate-400" />Timeline Date</span></th>
        <th className={TH}><span className="inline-flex items-center gap-2 text-[12px] font-medium text-slate-500 whitespace-nowrap"><Flag size={14} className="text-slate-400" />Priority</span></th>
        <th className={`${TH} w-12`} />
      </tr>
    </thead>
  );
}

function ListRow({
  task, index, manager, onEdit, onDelete, onSelect, onUpdateTaskStatus
}: {
  task: Task; index: number; manager: TaskManager; onEdit: (t: Task) => void; onDelete: (t: Task) => void; onSelect: (t: Task) => void; onUpdateTaskStatus: (taskId: string, newStatus: TaskStatus) => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const checked = task.status === 'done';
  const isOverdue = manager.isOverdue(task);

  const handleToggleChecked = (e: React.MouseEvent) => {
    e.stopPropagation();
    onUpdateTaskStatus(task.id, checked ? 'todo' : 'done');
  };

  return (
    <Draggable draggableId={task.id.toString()} index={index}>
      {(provided, snapshot) => (
        <tr
          ref={provided.innerRef}
          {...provided.draggableProps}
          className={`transition-colors group cursor-pointer ${snapshot.isDragging ? 'bg-slate-50 border border-violet-200 shadow-md' : 'hover:bg-slate-50'}`}
          onClick={() => onSelect(task)}
        >
          <td className={`${TD} w-10 px-2 text-center`} {...provided.dragHandleProps}>
            <GripHorizontal size={14} className="text-slate-300 group-hover:text-slate-400 cursor-grab rotate-90 mx-auto" />
          </td>
          <td className={`${TD} w-10 px-2`} onClick={(e) => e.stopPropagation()}>
            <button onClick={handleToggleChecked} className="flex items-center justify-center w-full">
              {checked ? <CheckSquare size={16} className="text-violet-500" /> : <Square size={16} className="text-slate-300 group-hover:text-slate-400" />}
            </button>
          </td>
          <td className={TD}><span className="text-[13px] font-medium text-slate-700 truncate block">{task.title}</span></td>
          <td className={TD}><span className="text-[13px] text-slate-400 truncate block">{task.description}</span></td>
          <td className={TD}>
            <div className="flex -space-x-1.5">
              {task.assignees?.map((name, i) => (
                <div key={name} title={name} className={`w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-bold text-white border border-white uppercase shadow-sm ${getAvatarColor(name)}`} style={{ zIndex: task.assignees.length - i }}>
                  {getInitials(name)}
                </div>
              ))}
            </div>
          </td>
          <td className={TD}>
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded border bg-white shadow-sm text-[11px] font-medium ${TASK_TYPE_CONFIG[task.taskType].text} ${TASK_TYPE_CONFIG[task.taskType].border}`}>
              {(() => { const Icon = TASK_TYPE_CONFIG[task.taskType].icon; return <Icon size={12} className="text-slate-400" />; })()}
              {TASK_TYPE_CONFIG[task.taskType].label}
            </span>
          </td>
          <td className={TD}><span className={`text-[12px] whitespace-nowrap ${isOverdue ? 'text-red-400 font-medium' : 'text-slate-400'}`}>{formatDateRange(task.createdAt, task.dueDate)}</span></td>
          <td className={TD}>
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded border text-[10px] font-semibold ${LIST_PRIORITY[task.priority].bg} ${LIST_PRIORITY[task.priority].text} ${LIST_PRIORITY[task.priority].border}`}>
              <Flag size={10} fill="currentColor" className="opacity-80" />
              {LIST_PRIORITY[task.priority].label}
            </span>
          </td>
          <td className={`${TD} w-12 text-center`} onClick={(e) => e.stopPropagation()}>
            <div className="relative flex justify-center">
              <button onClick={() => setMenuOpen((v) => !v)} className="p-1 rounded-md text-slate-300 hover:bg-slate-100 hover:text-slate-500"><MoreHorizontal size={14} /></button>
              {menuOpen && (
                <div className="absolute right-0 top-7 z-50 bg-white border border-slate-200 rounded-xl shadow-xl py-1 min-w-[140px]">
                  <button className="flex items-center gap-2 w-full px-3 py-2 text-[13px] text-slate-700 hover:bg-slate-50" onClick={() => { setMenuOpen(false); onEdit(task); }}><Pencil size={12} /> Edit task</button>
                  <button className="flex items-center gap-2 w-full px-3 py-2 text-[13px] text-red-600 hover:bg-red-50" onClick={() => { setMenuOpen(false); onDelete(task); }}><Trash2 size={12} /> Delete task</button>
                </div>
              )}
            </div>
          </td>
        </tr>
      )}
    </Draggable>
  );
}

function ListSection({
  label, pillBg, pillText, pillBorder, icon: Icon, tasks, manager, onEdit, onDelete, onSelect, onUpdateTaskStatus
}: {
  label: string; pillBg: string; pillText: string; pillBorder: string; icon: React.ElementType; tasks: Task[]; manager: TaskManager; onEdit: (t: Task) => void; onDelete: (t: Task) => void; onSelect: (t: Task) => void; onUpdateTaskStatus: (taskId: string, newStatus: TaskStatus) => void;
}) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="mb-6 rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      {/* Status header bar — same card as the table, connected via a single border */}
      <div
        className="flex items-center justify-between px-4 py-2.5 border-b border-slate-100 cursor-pointer select-none"
        onClick={() => setCollapsed((v) => !v)}
      >
        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md border text-[12px] font-semibold ${pillBg} ${pillText} ${pillBorder}`}>
            <Icon size={12} fill={label === 'Done' ? 'currentColor' : 'none'} />
            {label}
          </span>
          <span className="text-[12px] font-semibold bg-slate-100 border border-slate-200 text-slate-500 px-2 py-0.5 rounded-md min-w-[20px] text-center">{tasks.length}</span>
        </div>
        <div className="w-6 h-6 flex items-center justify-center rounded-md hover:bg-slate-100 transition-colors">
          {collapsed ? <ChevronRight size={15} className="text-slate-400" /> : <ChevronDown size={15} className="text-slate-400" />}
        </div>
      </div>

      {!collapsed && (
        <div>
          <table className="w-full border-collapse" style={{ minWidth: '1040px', tableLayout: 'fixed' }}>
            <colgroup>
              <col style={{ width: '44px'  }} />
              <col style={{ width: '44px'  }} />
              <col style={{ width: '220px' }} />
              <col style={{ width: '280px' }} />
              <col style={{ width: '120px' }} />
              <col style={{ width: '110px' }} />
              <col style={{ width: '220px' }} />
              <col style={{ width: '110px' }} />
              <col style={{ width: '50px'  }} />
            </colgroup>
            <TableHeader />
            <Droppable droppableId={label}>
              {(provided) => (
                <tbody ref={provided.innerRef} {...provided.droppableProps}>
                  {tasks.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-8 text-center text-[13px] text-slate-400 bg-white">No tasks assigned to this section.</td>
                    </tr>
                  ) : (
                    tasks.map((task, index) => (
                      <ListRow key={task.id} task={task} index={index} manager={manager} onEdit={onEdit} onDelete={onDelete} onSelect={onSelect} onUpdateTaskStatus={onUpdateTaskStatus} />
                    ))
                  )}
                  {provided.placeholder}
                </tbody>
              )}
            </Droppable>
          </table>
        </div>
      )}
    </div>
  );
}

/* ── Top Header Panel Component ─────────────────────────────── */
function DashboardHeader({ totalTasks }: { totalTasks: number }) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between border border-slate-200 rounded-xl p-4 bg-white mb-6 shadow-sm">
      <div className="flex flex-col gap-1.5">
        <h1 className="text-base font-semibold text-slate-800 tracking-tight">Daily Back-End Task</h1>
        <div className="flex items-center flex-wrap gap-x-4 gap-y-1.5 text-[12px] text-slate-400 font-medium mt-0.5">
          <span className="inline-flex items-center gap-1.5"><Briefcase size={14} className="text-slate-400" /> Developer Team</span>
          <span className="inline-flex items-center gap-1.5"><Info size={14} className="text-slate-400" /> Important</span>
          <span className="inline-flex items-center gap-1.5"><CheckSquare size={13} className="text-slate-400" /> {totalTasks} Tasks</span>
        </div>
      </div>
      <div className="flex items-center gap-2 mt-4 md:mt-0">
        <button className="inline-flex items-center gap-2 px-3 py-1.5 border border-slate-200 rounded-lg text-[13px] font-medium text-slate-600 bg-white hover:bg-slate-50 transition-colors shadow-sm">
          <SlidersHorizontal size={14} className="text-slate-400" /> Filter
        </button>
      </div>
    </div>
  );
}

export function ListView({ manager, filters, sort, onEdit, onDelete, onSelect, onUpdateTaskStatus }: ListViewProps) {
  
  const handleDragEnd = (result: DropResult) => {
    const { source, destination, draggableId } = result;
    if (!destination) return;

    // Map view section titles cleanly to valid backend TaskStatus enums
    const statusMap: Record<string, TaskStatus> = {
      "Not Started": "todo",
      "In Progress": "in-progress",
      "Done": "done"
    };

    const targetStatus = statusMap[destination.droppableId];
    
    // If dropped inside a new section, invoke action callback to save update state status change
    if (source.droppableId !== destination.droppableId && targetStatus) {
      onUpdateTaskStatus(draggableId, targetStatus);
    }
  };

  // Get cumulative cross-group total count
  const allTasksCount = 
    manager.getFilteredByStatus('todo', filters, sort).length +
    manager.getFilteredByStatus('in-progress', filters, sort).length +
    manager.getFilteredByStatus('done', filters, sort).length;

  return (
    <div className="p-4 bg-slate-50/50 min-h-screen">
      {/* Visual Top Bar */}
      <DashboardHeader totalTasks={allTasksCount} />

      {/* Drag Core Wrapper */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <div>
          {SECTIONS.map(({ status, label, pillBg, pillText, pillBorder, icon }) => (
            <ListSection
              key={status}
              label={label}
              pillBg={pillBg}
              pillText={pillText}
              pillBorder={pillBorder}
              icon={icon}
              tasks={manager.getFilteredByStatus(status, filters, sort)}
              manager={manager}
              onEdit={onEdit}
              onDelete={onDelete}
              onSelect={onSelect}
              onUpdateTaskStatus={onUpdateTaskStatus}
            />
          ))}
        </div>
      </DragDropContext>
    </div>
  );
}