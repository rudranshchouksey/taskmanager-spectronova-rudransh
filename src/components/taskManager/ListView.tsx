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
  Briefcase,
  AlertCircle,
  FileSpreadsheet,
} from 'lucide-react';
import { useState } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import type { Task, TaskStatus, TaskType, FilterOptions, SortOptions } from '../../BLL/taskManager/types';
import type { TaskManager } from '../../BLL/taskManager/TaskManager';
import { getAvatarColor, getInitials } from '../../utils/utils';

interface ListViewProps {
  manager: TaskManager;
  filters: FilterOptions;
  sort: SortOptions;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  onSelect: (task: Task) => void;
  onUpdateTaskStatus: (taskId: string | number, newStatus: TaskStatus) => void;
}

const TH = 'border-b border-r border-slate-200 last:border-r-0 bg-[#F8FAFC] py-2.5 px-4 text-left align-middle font-semibold text-slate-500 first:pl-5 last:pr-5';
const TD = 'border-b border-r border-slate-100 last:border-r-0 py-3 px-4 align-middle text-slate-600 first:pl-5 last:pr-5 bg-white';

const LIST_PRIORITY: Record<Task['priority'], { label: string; bg: string; text: string; border: string }> = {
  high:   { label: 'Urgent',  bg: 'bg-[#FFF5F5]', text: 'text-[#E53E3E]', border: 'border-[#FED7D7]' },
  medium: { label: 'Normal',  bg: 'bg-[#FFF9E6]', text: 'text-[#D97706]', border: 'border-[#FEEBC8]' },
  low:    { label: 'Lowest',  bg: 'bg-[#EBFBF5]', text: 'text-[#319795]', border: 'border-[#C6F6D5]' },
};

const TASK_TYPE_CONFIG: Record<TaskType, { label: string; icon: React.ElementType }> = {
  feature: { label: 'Feature', icon: Settings2 },
  bug:     { label: 'Bug',     icon: Bug },
  review:  { label: 'Review',  icon: Shuffle },
  testing: { label: 'Testing', icon: FileText },
};

const SECTIONS: { status: TaskStatus; label: string; pillBg: string; pillText: string; pillBorder: string; icon: React.ElementType }[] = [
  { status: 'todo',        label: 'Not Started', pillBg: 'bg-[#FFF1F2]', pillText: 'text-[#F43F5E]', pillBorder: 'border-[#FFE4E6]', icon: Sun },
  { status: 'in-progress', label: 'In Progress', pillBg: 'bg-[#FEF3C7]', pillText: 'text-[#D97706]', pillBorder: 'border-[#FDE68A]', icon: Loader2 },
  { status: 'done',        label: 'Done',        pillBg: 'bg-[#DCFCE7]', pillText: 'text-[#10B981]', pillBorder: 'border-[#BBF7D0]', icon: CheckCircle2 },
];

function formatDateRange(createdAt: string, dueDate: string): string {
  const opts: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric' };
  return `${new Date(createdAt).toLocaleDateString('en-US', opts)} - ${new Date(dueDate).toLocaleDateString('en-US', opts)}`;
}

function TableHeader() {
  return (
    <thead>
      <tr className="bg-slate-50/10">
        <th className={`${TH} w-12 px-2`} />
        <th className={`${TH} w-12 px-2`} />
        <th className={TH}><span className="inline-flex items-center gap-2 text-[13px] font-semibold text-[#64748B]"><FileSpreadsheet size={15} className="text-[#94A3B8]" /> Task Name</span></th>
        <th className={TH}><span className="inline-flex items-center gap-2 text-[13px] font-semibold text-[#64748B]"><AlignLeft size={15} className="text-[#94A3B8]" /> Descriptions</span></th>
        <th className={TH}><span className="inline-flex items-center gap-2 text-[13px] font-semibold text-[#64748B]"><Users size={15} className="text-[#94A3B8]" /> People</span></th>
        <th className={TH}><span className="inline-flex items-center gap-2 text-[13px] font-semibold text-[#64748B]"><Settings2 size={15} className="text-[#94A3B8]" /> Type</span></th>
        <th className={TH}><span className="inline-flex items-center gap-2 text-[13px] font-semibold text-[#64748B]"><CalendarDays size={15} className="text-[#94A3B8]" /> Timeline Date</span></th>
        <th className={TH}><span className="inline-flex items-center gap-2 text-[13px] font-semibold text-[#64748B]"><Flag size={15} className="text-[#94A3B8]" /> Priority</span></th>
        <th className={`${TH} w-14`} />
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
          className={`transition-colors group cursor-pointer border-b border-slate-100 last:border-none ${snapshot.isDragging ? 'bg-slate-50 shadow-md' : 'hover:bg-[#F8FAFC]'}`}
          onClick={() => onSelect(task)}
        >
          <td className={`${TD} w-12 px-2 text-center`} {...provided.dragHandleProps}>
            <GripHorizontal size={14} className="text-slate-300 group-hover:text-slate-400 rotate-90 mx-auto" />
          </td>
          <td className={`${TD} w-12 px-2`} onClick={(e) => e.stopPropagation()}>
            <button onClick={handleToggleChecked} className="flex items-center justify-center w-full">
              {checked ? (
                <CheckSquare size={18} className="text-[#6366F1]" />
              ) : (
                <Square size={18} className="text-slate-300 group-hover:text-slate-400" />
              )}
            </button>
          </td>
          <td className={TD}><span className="text-[14px] font-medium text-slate-700 truncate max-w-[200px] block">{task.title}</span></td>
          <td className={TD}><span className="text-[14px] text-slate-400 truncate max-w-[260px] block font-normal">{task.description}</span></td>
          <td className={TD}>
            <div className="flex -space-x-1.5 items-center">
              {task.assignees?.map((name, i) => (
                <div 
                  key={name} 
                  title={name} 
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold text-white border-2 border-white uppercase shadow-sm ${getAvatarColor(name)}`} 
                  style={{ zIndex: task.assignees.length - i }}
                >
                  {getInitials(name)}
                </div>
              ))}
            </div>
          </td>
          <td className={TD}>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl border border-slate-200 bg-white text-[12px] font-medium text-slate-600 shadow-sm">
              {(() => { const Icon = TASK_TYPE_CONFIG[task.taskType].icon; return <Icon size={12} className="text-slate-400" />; })()}
              {TASK_TYPE_CONFIG[task.taskType].label}
            </span>
          </td>
          <td className={TD}><span className={`text-[13px] font-normal whitespace-nowrap ${isOverdue ? 'text-red-500 font-medium' : 'text-slate-400'}`}>{formatDateRange(task.createdAt, task.dueDate)}</span></td>
          <td className={TD}>
            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-xl border text-[12px] font-bold ${LIST_PRIORITY[task.priority].bg} ${LIST_PRIORITY[task.priority].text} ${LIST_PRIORITY[task.priority].border}`}>
              <Flag size={11} fill="currentColor" className="mr-0.5 opacity-90" />
              {LIST_PRIORITY[task.priority].label}
            </span>
          </td>
          <td className={`${TD} w-14 text-center`} onClick={(e) => e.stopPropagation()}>
            <div className="relative flex justify-center">
              <button onClick={() => setMenuOpen((v) => !v)} className="p-1 rounded-lg text-slate-300 hover:bg-slate-100 hover:text-slate-500"><MoreHorizontal size={16} /></button>
              {menuOpen && (
                <div className="absolute right-0 top-7 z-50 bg-white border border-slate-200 rounded-xl shadow-xl py-1 min-w-[145px]">
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
    <div className="mb-4 last:mb-0 overflow-hidden">
      {/* Section Subheader - Embedded directly with zero outer margins */}
      <div
        className="flex items-center justify-between py-3 cursor-pointer select-none bg-white"
        onClick={() => setCollapsed((v) => !v)}
      >
        <div className="flex items-center gap-3">
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl border text-[13px] font-bold ${pillBg} ${pillText} ${pillBorder}`}>
            <Icon size={13} fill={label === 'Done' ? 'currentColor' : 'none'} className="stroke-[2.5]" />
            {label}
          </span>
          <span className="text-[12px] font-bold bg-slate-50 border border-slate-200 text-slate-500 w-6 h-6 flex items-center justify-center rounded-lg">{tasks.length}</span>
        </div>
        <div className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-50 transition-colors border border-slate-200 shadow-sm">
          {collapsed ? <ChevronRight size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
        </div>
      </div>

      {/* Grid Table Block */}
      {!collapsed && (
        <div className="overflow-x-auto rounded-2xl border border-slate-200">
          <table className="w-full border-collapse border border-slate-200 border-hidden" style={{ minWidth: '1080px', tableLayout: 'fixed' }}>
            <colgroup>
              <col style={{ width: '48px'  }} />
              <col style={{ width: '48px'  }} />
              <col style={{ width: '240px' }} />
              <col style={{ width: '300px' }} />
              <col style={{ width: '130px' }} />
              <col style={{ width: '120px' }} />
              <col style={{ width: '230px' }} />
              <col style={{ width: '120px' }} />
              <col style={{ width: '55px'  }} />
            </colgroup>
            <TableHeader />
            <Droppable droppableId={label}>
              {(provided) => (
                <tbody ref={provided.innerRef} {...provided.droppableProps}>
                  {tasks.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-8 text-center text-[14px] text-slate-400 bg-white">No active tasks in this section.</td>
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

export function ListView({ manager, filters, sort, onEdit, onDelete, onSelect, onUpdateTaskStatus }: ListViewProps) {
  const handleDragEnd = (result: DropResult) => {
    const { source, destination, draggableId } = result;
    if (!destination) return;

    const statusMap: Record<string, TaskStatus> = {
      "Not Started": "todo",
      "In Progress": "in-progress",
      "Done": "done"
    };

    const targetStatus = statusMap[destination.droppableId];
    if (source.droppableId !== destination.droppableId && targetStatus) {
      onUpdateTaskStatus(draggableId, targetStatus);
    }
  };

  const allTasksCount = 
    manager.getFilteredByStatus('todo', filters, sort).length +
    manager.getFilteredByStatus('in-progress', filters, sort).length +
    manager.getFilteredByStatus('done', filters, sort).length;

  return (
    <div className="p-6 bg-[#F8FAFC] min-h-screen">
      {/* 
        This is the single parent card wrapper enclosing the main header 
        and all lower subsections sequentially as illustrated inside "firstthe top and header_2.jpeg".
      */}
      <div className="border border-slate-200 rounded-3xl bg-white p-6 shadow-sm">
        
        {/* Main Title Metadata Row */}
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-5 border-b border-slate-100 mb-4">
          <div className="flex flex-col gap-1">
            <h1 className="text-[18px] font-bold text-slate-800 tracking-tight">Daily Back-End Task</h1>
            <div className="flex items-center flex-wrap gap-x-4 gap-y-1.5 text-[13px] text-slate-400 font-medium mt-0.5">
              <span className="inline-flex items-center gap-1.5"><Briefcase size={15} className="text-slate-400" /> Developer Team</span>
              <span className="inline-flex items-center gap-1.5"><AlertCircle size={15} className="text-slate-400" /> Important</span>
              <span className="inline-flex items-center gap-1.5"><CheckSquare size={14} className="text-slate-400" /> {allTasksCount} Task</span>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-4 md:mt-0">
            <button className="inline-flex items-center gap-2 px-3.5 py-2 border border-slate-200 rounded-xl text-[13px] font-bold text-slate-600 bg-white hover:bg-slate-50 transition-colors shadow-sm">
              <SlidersHorizontal size={14} className="text-slate-500" /> Filter
            </button>
            <button className="inline-flex items-center gap-2 px-3.5 py-2 border border-slate-200 rounded-xl text-[13px] font-bold text-slate-600 bg-white hover:bg-slate-50 transition-colors shadow-sm">
              <SlidersHorizontal size={14} className="text-slate-500" /> Filter
            </button>
          </div>
        </div>

        {/* Kanban Drop Sections Layout */}
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="space-y-2">
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
    </div>
  );
}