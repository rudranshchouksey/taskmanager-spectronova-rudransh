import { X, Plus } from 'lucide-react';
import { useState, useEffect } from 'react';
import type { Task, TaskStatus, TaskPriority, TaskType, TaskFormData } from '../../BLL/taskManager/types';
import type { TaskManager } from '../../BLL/taskManager/TaskManager';
import { getAvatarColor, getInitials } from './utils';

interface TaskModalProps {
  manager: TaskManager;
  task: Task | null;
  defaultStatus: TaskStatus;
  onClose: () => void;
  onSaved: () => void;
}

interface FormErrors {
  title?: string;
  dueDate?: string;
}

const PRIORITIES: TaskPriority[] = ['low', 'medium', 'high'];
const STATUSES: TaskStatus[] = ['todo', 'in-progress', 'done'];
const TASK_TYPES: TaskType[] = ['feature', 'bug', 'review', 'testing'];
const STATUS_LABELS: Record<TaskStatus, string> = {
  todo: 'To Do',
  'in-progress': 'In Progress',
  done: 'Done',
};
const PRIORITY_LABELS: Record<TaskPriority, string> = { low: 'Low', medium: 'Medium', high: 'High' };
const TASK_TYPE_LABELS: Record<TaskType, string> = { feature: 'Feature', bug: 'Bug', review: 'Review', testing: 'Testing' };

export function TaskModal({ manager, task, defaultStatus, onClose, onSaved }: TaskModalProps) {
  const isEdit = task !== null;
  const allAssignees = manager.getAllAssignees();

  const [form, setForm] = useState<TaskFormData>({
    title: task?.title ?? '',
    description: task?.description ?? '',
    priority: task?.priority ?? 'medium',
    dueDate: task?.dueDate ?? '',
    assignees: task?.assignees ?? [],
    status: task?.status ?? defaultStatus,
    taskType: task?.taskType ?? 'feature',
    tags: task?.tags ?? [],
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [tagInput, setTagInput] = useState('');

  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    if (!form.title.trim()) newErrors.title = 'Title is required.';
    if (!form.dueDate) {
      newErrors.dueDate = 'Due date is required.';
    } else if (!isEdit && new Date(form.dueDate) < new Date(new Date().toDateString())) {
      newErrors.dueDate = 'Due date cannot be in the past.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    if (isEdit) {
      manager.updateTask(task.id, form);
    } else {
      manager.createTask(form);
    }
    onSaved();
  };

  const toggleAssignee = (name: string) => {
    setForm((f) => ({
      ...f,
      assignees: f.assignees.includes(name)
        ? f.assignees.filter((a) => a !== name)
        : [...f.assignees, name],
    }));
  };

  const addTag = () => {
    const tag = tagInput.trim().toLowerCase();
    if (tag && !form.tags.includes(tag)) {
      setForm((f) => ({ ...f, tags: [...f.tags, tag] }));
    }
    setTagInput('');
  };

  const removeTag = (tag: string) => {
    setForm((f) => ({ ...f, tags: f.tags.filter((t) => t !== tag) }));
  };

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-[18px] font-bold text-slate-800">
            {isEdit ? 'Edit Task' : 'Create Task'}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-5">
          {/* Title */}
          <div>
            <label className="block text-[12px] font-semibold text-slate-600 mb-1.5">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              placeholder="Enter task title..."
              className={`w-full px-3 py-2.5 rounded-lg border text-[14px] text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                errors.title ? 'border-red-400 bg-red-50' : 'border-slate-200 bg-white'
              }`}
            />
            {errors.title && (
              <p className="mt-1 text-[11px] text-red-500">{errors.title}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-[12px] font-semibold text-slate-600 mb-1.5">
              Description
            </label>
            <textarea
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              placeholder="Add a description..."
              rows={3}
              className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-[14px] text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors resize-none"
            />
          </div>

          {/* Status + Priority row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[12px] font-semibold text-slate-600 mb-1.5">Status</label>
              <select
                value={form.status}
                onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as TaskStatus }))}
                className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-[14px] text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {STATUS_LABELS[s]}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[12px] font-semibold text-slate-600 mb-1.5">Priority</label>
              <select
                value={form.priority}
                onChange={(e) => setForm((f) => ({ ...f, priority: e.target.value as TaskPriority }))}
                className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-[14px] text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                {PRIORITIES.map((p) => (
                  <option key={p} value={p}>
                    {PRIORITY_LABELS[p]}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Type */}
          <div>
            <label className="block text-[12px] font-semibold text-slate-600 mb-1.5">Type</label>
            <select
              value={form.taskType}
              onChange={(e) => setForm((f) => ({ ...f, taskType: e.target.value as TaskType }))}
              className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-[14px] text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              {TASK_TYPES.map((t) => (
                <option key={t} value={t}>
                  {TASK_TYPE_LABELS[t]}
                </option>
              ))}
            </select>
          </div>

          {/* Due date */}
          <div>
            <label className="block text-[12px] font-semibold text-slate-600 mb-1.5">
              Due Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={form.dueDate}
              onChange={(e) => setForm((f) => ({ ...f, dueDate: e.target.value }))}
              className={`w-full px-3 py-2.5 rounded-lg border text-[14px] text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                errors.dueDate ? 'border-red-400 bg-red-50' : 'border-slate-200 bg-white'
              }`}
            />
            {errors.dueDate && (
              <p className="mt-1 text-[11px] text-red-500">{errors.dueDate}</p>
            )}
          </div>

          {/* Assignees */}
          <div>
            <label className="block text-[12px] font-semibold text-slate-600 mb-1.5">Assignees</label>
            <div className="flex flex-wrap gap-2">
              {allAssignees.map((name) => {
                const selected = form.assignees.includes(name);
                return (
                  <button
                    key={name}
                    type="button"
                    onClick={() => toggleAssignee(name)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-[12px] font-medium transition-colors ${
                      selected
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-slate-200 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold text-white ${getAvatarColor(name)}`}
                    >
                      {getInitials(name)}
                    </div>
                    {name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-[12px] font-semibold text-slate-600 mb-1.5">Tags</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {form.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 text-slate-600 rounded-full text-[11px] font-semibold"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="ml-0.5 text-slate-400 hover:text-slate-600"
                  >
                    <X size={10} />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addTag();
                  }
                }}
                placeholder="Add a tag..."
                className="flex-1 px-3 py-2 rounded-lg border border-slate-200 text-[13px] text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={addTag}
                className="px-3 py-2 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
              >
                <Plus size={15} />
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-slate-200 text-[14px] font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl bg-blue-600 text-[14px] font-semibold text-white hover:bg-blue-700 transition-colors"
            >
              {isEdit ? 'Save changes' : 'Create task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
