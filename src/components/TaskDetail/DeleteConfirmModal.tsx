import { Trash2, X } from 'lucide-react';
import type { Task } from '../../BLL/taskManager/types';

interface DeleteConfirmModalProps {
  task: Task;
  onConfirm: () => void;
  onCancel: () => void;
}

export function DeleteConfirmModal({ task, onConfirm, onCancel }: DeleteConfirmModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
            <Trash2 size={18} className="text-red-600" />
          </div>
          <button
            onClick={onCancel}
            className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 transition-colors"
          >
            <X size={16} />
          </button>
        </div>
        <h2 className="text-[17px] font-bold text-slate-800 mb-2">Delete task?</h2>
        <p className="text-[13px] text-slate-500 mb-6 leading-relaxed">
          Are you sure you want to delete{' '}
          <span className="font-semibold text-slate-700">"{task.title}"</span>? This action cannot be undone.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl border border-slate-200 text-[14px] font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-2.5 rounded-xl bg-red-600 text-[14px] font-semibold text-white hover:bg-red-700 transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
