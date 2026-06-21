import { useState, useCallback, useMemo } from 'react';
import {
  Plus,
  Search,
  Filter,
  ArrowUpDown,
  Bell,
  Share2,
  UserPlus,
  ChevronDown,
} from 'lucide-react';
import { TaskManager } from '../../BLL/taskManager/TaskManager';
import type {
  Task,
  TaskStatus,
  ViewMode,
  FilterOptions,
  SortOptions,
  SortField,
} from '../../BLL/taskManager/types';
import { Sidebar } from '../../components/Sidebar/Sidebar';
import { KanbanBoard } from '../../components/taskManager/KanbanBoard';
import { ListView } from '../../components/taskManager/ListView';
import { TaskModal } from '../../components/taskManager/TaskModal';
import { TaskDetailPanel } from '../../components/TaskDetail/TaskDetailPanel';
import { DeleteConfirmModal } from '../../components/TaskDetail/DeleteConfirmModal';
import { ViewToggle } from '../../components/taskManager/ViewToggle';
import { getAvatarColor, getInitials } from '../../utils/utils';

const VIEW_STORAGE_KEY = 'taskmanager_view';

function loadView(): ViewMode {
  const stored = localStorage.getItem(VIEW_STORAGE_KEY);
  return stored === 'list' ? 'list' : 'board';
}

function saveView(view: ViewMode) {
  localStorage.setItem(VIEW_STORAGE_KEY, view);
}

const TEAM_MEMBERS = ['Davis Donin', 'Talan Korsgaard', 'Hanna Philips', 'Marcus Webb', 'Sofia Reyes'];

export default function TaskManagerPage() {
  const [manager] = useState(() => new TaskManager());
  const [view, setView] = useState<ViewMode>(loadView);
  const [tick, setTick] = useState(0); // force re-render after mutations

  // Modal state
  const [editTask, setEditTask] = useState<Task | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [defaultStatus, setDefaultStatus] = useState<TaskStatus>('todo');
  const [deleteTask, setDeleteTask] = useState<Task | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  // Filters
  const [filters, setFilters] = useState<FilterOptions>({
    priority: 'all',
    assignee: 'all',
    search: '',
  });

  // Sort
  const [sort, setSort] = useState<SortOptions>({
    field: 'dueDate',
    direction: 'asc',
  });

  const [showFilters, setShowFilters] = useState(false);

  const forceUpdate = useCallback(() => setTick((t) => t + 1), []);

  const handleViewChange = (v: ViewMode) => {
    setView(v);
    saveView(v);
  };

  const handleAddTask = (status: TaskStatus) => {
    setDefaultStatus(status);
    setShowCreateModal(true);
  };

  const handleEdit = (task: Task) => {
    setEditTask(task);
    setSelectedTask(null);
  };

  const handleDelete = (task: Task) => {
    setDeleteTask(task);
  };

  const handleConfirmDelete = () => {
    if (deleteTask) {
      manager.deleteTask(deleteTask.id);
      setDeleteTask(null);
      if (selectedTask?.id === deleteTask.id) setSelectedTask(null);
      forceUpdate();
    }
  };

  const handleSaved = () => {
    setEditTask(null);
    setShowCreateModal(false);
    forceUpdate();
  };

  const handleSelect = (task: Task) => {
    setSelectedTask(task);
  };

  const handleTaskMoved = () => forceUpdate();

  const handleUpdateTaskStatus = (taskId: string | number, newStatus: TaskStatus) => {
    manager.moveTo(String(taskId), newStatus);
    forceUpdate();
  };

  const setSortField = (field: SortField) => {
    setSort((s) =>
      s.field === field
        ? { ...s, direction: s.direction === 'asc' ? 'desc' : 'asc' }
        : { field, direction: 'asc' }
    );
  };

  const allAssignees = useMemo(() => manager.getAllAssignees(), [tick, manager]);

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <Sidebar />

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top header */}
        <div className="bg-white border-b border-slate-100 px-8 py-4 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-[24px] font-bold text-slate-900 leading-tight">Tasks</h1>
              <p className="text-[13px] text-slate-400 mt-0.5">Manage and track your team's work</p>
            </div>
            <div className="flex items-center gap-3">
              {/* Team avatars */}
              <div className="flex -space-x-2 mr-1">
                {TEAM_MEMBERS.slice(0, 4).map((name) => (
                  <div
                    key={name}
                    title={name}
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold text-white ring-2 ring-white ${getAvatarColor(name)}`}
                  >
                    {getInitials(name)}
                  </div>
                ))}
                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-500 ring-2 ring-white">
                  +{TEAM_MEMBERS.length - 4}
                </div>
              </div>
              <button className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-[13px] font-semibold rounded-lg hover:bg-blue-700 transition-colors">
                <UserPlus size={14} />
                Invite Member
              </button>
              <button className="flex items-center gap-1.5 px-4 py-2 border border-slate-200 text-slate-600 text-[13px] font-medium rounded-lg hover:bg-slate-50 transition-colors">
                <Share2 size={14} />
                Share
              </button>
              <button className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors">
                <Bell size={16} />
              </button>
            </div>
          </div>

          {/* Tabs row */}
          <div className="flex items-center justify-between mt-4">
            <ViewToggle view={view} onChange={handleViewChange} />
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowFilters((v) => !v)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] font-medium transition-colors border ${
                  showFilters ? 'bg-blue-50 border-blue-200 text-blue-600' : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Filter size={13} />
                Filter
              </button>
              <button
                onClick={() => setSortField(sort.field)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] font-medium border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
              >
                <ArrowUpDown size={13} />
                Sort
              </button>
              <button
                onClick={() => handleAddTask('todo')}
                className="flex items-center gap-1.5 px-4 py-1.5 bg-blue-600 text-white text-[13px] font-semibold rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus size={14} />
                Add Task
              </button>
            </div>
          </div>
        </div>

        {/* Filter bar */}
        {showFilters && (
          <div className="bg-white border-b border-slate-100 px-8 py-3 flex items-center gap-4 flex-shrink-0">
            {/* Search */}
            <div className="relative flex-1 max-w-xs">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search tasks..."
                value={filters.search}
                onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
                className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 text-[13px] text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              />
            </div>

            {/* Priority filter */}
            <div className="flex items-center gap-2">
              <span className="text-[12px] font-semibold text-slate-500">Priority:</span>
              <div className="flex gap-1">
                {(['all', 'high', 'medium', 'low'] as const).map((p) => (
                  <button
                    key={p}
                    onClick={() => setFilters((f) => ({ ...f, priority: p as FilterOptions['priority'] }))}
                    className={`px-3 py-1 rounded-full text-[11px] font-semibold transition-colors ${
                      filters.priority === p
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {p === 'all' ? 'All' : p.charAt(0).toUpperCase() + p.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Assignee filter */}
            <div className="flex items-center gap-2">
              <span className="text-[12px] font-semibold text-slate-500">Assignee:</span>
              <select
                value={filters.assignee}
                onChange={(e) => setFilters((f) => ({ ...f, assignee: e.target.value }))}
                className="px-3 py-1.5 rounded-lg border border-slate-200 text-[12px] text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="all">All</option>
                {allAssignees.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort field */}
            <div className="flex items-center gap-2">
              <span className="text-[12px] font-semibold text-slate-500">Sort by:</span>
              <select
                value={sort.field}
                onChange={(e) => setSort((s) => ({ ...s, field: e.target.value as SortField }))}
                className="px-3 py-1.5 rounded-lg border border-slate-200 text-[12px] text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="dueDate">Due Date</option>
                <option value="priority">Priority</option>
                <option value="createdAt">Created At</option>
                <option value="title">Title</option>
              </select>
              <button
                onClick={() =>
                  setSort((s) => ({
                    ...s,
                    direction: s.direction === 'asc' ? 'desc' : 'asc',
                  }))
                }
                className="px-3 py-1.5 rounded-lg border border-slate-200 text-[12px] text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-1"
              >
                {sort.direction === 'asc' ? 'Asc' : 'Desc'}
                <ChevronDown size={12} className={`transition-transform ${sort.direction === 'desc' ? 'rotate-180' : ''}`} />
              </button>
            </div>

            <button
              onClick={() => setFilters({ priority: 'all', assignee: 'all', search: '' })}
              className="text-[12px] text-slate-400 hover:text-slate-600 transition-colors ml-auto"
            >
              Clear filters
            </button>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-8 py-6">
          {view === 'board' ? (
            <KanbanBoard
              manager={manager}
              filters={filters}
              sort={sort}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onSelect={handleSelect}
              onAddTask={handleAddTask}
              onTaskMoved={handleTaskMoved}
            />
          ) : (
            <ListView
              manager={manager}
              filters={filters}
              sort={sort}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onSelect={handleSelect}
              onUpdateTaskStatus={handleUpdateTaskStatus}
            />
          )}
        </div>
      </div>

      {/* Modals */}
      {(showCreateModal || editTask) && (
        <TaskModal
          manager={manager}
          task={editTask}
          defaultStatus={defaultStatus}
          onClose={() => {
            setShowCreateModal(false);
            setEditTask(null);
          }}
          onSaved={handleSaved}
        />
      )}

      {deleteTask && (
        <DeleteConfirmModal
          task={deleteTask}
          onConfirm={handleConfirmDelete}
          onCancel={() => setDeleteTask(null)}
        />
      )}

      {selectedTask && (
        <TaskDetailPanel
          task={selectedTask}
          manager={manager}
          onClose={() => setSelectedTask(null)}
          onEdit={handleEdit}
        />
      )}
    </div>
  );
}
