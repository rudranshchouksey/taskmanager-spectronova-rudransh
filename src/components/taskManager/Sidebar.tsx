import {
  LayoutDashboard,
  Inbox,
  Calendar,
  CheckSquare,
  FileText,
  Users,
  Settings,
  HelpCircle,
  Plus,
  Grid3x3,
  Bell,
} from 'lucide-react';
import { getAvatarColor, getInitials } from './utils';

const currentUser = { name: 'Davis Donin', email: 'daviddoni@gmail.com' };

export function Sidebar() {
  return (
    <div className="flex h-screen flex-shrink-0">
      {/* Icon rail */}
      <div className="w-14 bg-slate-900 flex flex-col items-center py-4 gap-3 border-r border-slate-800">
        <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center mb-2">
          <Grid3x3 size={16} className="text-white" />
        </div>
        {[LayoutDashboard, Bell, CheckSquare].map((Icon, i) => (
          <button
            key={i}
            className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${
              i === 2
                ? 'bg-blue-600 text-white'
                : 'text-slate-400 hover:bg-white/10 hover:text-white'
            }`}
          >
            <Icon size={17} />
          </button>
        ))}
        <div className="flex-1" />
        <button className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:bg-white/10 hover:text-white transition-colors">
          <Plus size={17} />
        </button>
      </div>

      {/* Nav sidebar */}
      <div className="w-52 bg-white border-r border-slate-100 flex flex-col overflow-y-auto">
        {/* User profile */}
        <div className="px-4 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold text-white flex-shrink-0 ${getAvatarColor(currentUser.name)}`}
            >
              {getInitials(currentUser.name)}
            </div>
            <div className="min-w-0">
              <p className="text-[13px] font-semibold text-slate-800 truncate">{currentUser.name}</p>
              <p className="text-[10px] text-slate-400 truncate">{currentUser.email}</p>
            </div>
          </div>
        </div>

        <div className="flex-1 px-3 py-3 space-y-0.5">
          <p className="px-2 py-1.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Menu</p>

          {[
            { icon: LayoutDashboard, label: 'Dashboard' },
            { icon: Inbox, label: 'Inbox' },
            { icon: Calendar, label: 'Calendar' },
          ].map(({ icon: Icon, label }) => (
            <button
              key={label}
              className="w-full flex items-center gap-2.5 px-2 py-2 rounded-lg text-[13px] text-slate-600 hover:bg-slate-50 hover:text-slate-800 transition-colors"
            >
              <Icon size={15} className="text-slate-400" />
              {label}
            </button>
          ))}

          <div className="pt-3">
            <div className="flex items-center justify-between px-2 py-1.5">
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Team spaces</p>
              <button className="text-slate-400 hover:text-slate-600 transition-colors">
                <Plus size={13} />
              </button>
            </div>
            <button className="w-full flex items-center gap-2.5 px-2 py-2 rounded-lg text-[13px] text-blue-600 bg-blue-50 font-medium transition-colors">
              <CheckSquare size={15} className="text-blue-500" />
              Tasks
            </button>
            <button className="w-full flex items-center gap-2.5 px-2 py-2 rounded-lg text-[13px] text-slate-600 hover:bg-slate-50 hover:text-slate-800 transition-colors">
              <FileText size={15} className="text-slate-400" />
              Docs
            </button>
            <button className="w-full flex items-center gap-2.5 px-2 py-2 rounded-lg text-[13px] text-slate-600 hover:bg-slate-50 hover:text-slate-800 transition-colors">
              <Users size={15} className="text-slate-400" />
              Meeting
            </button>
          </div>

          <div className="pt-3">
            <p className="px-2 py-1.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Other</p>
            <button className="w-full flex items-center gap-2.5 px-2 py-2 rounded-lg text-[13px] text-slate-600 hover:bg-slate-50 hover:text-slate-800 transition-colors">
              <Settings size={15} className="text-slate-400" />
              Settings
            </button>
            <button className="w-full flex items-center gap-2.5 px-2 py-2 rounded-lg text-[13px] text-slate-600 hover:bg-slate-50 hover:text-slate-800 transition-colors">
              <HelpCircle size={15} className="text-slate-400" />
              Support
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
