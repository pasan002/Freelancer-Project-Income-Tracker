import React from 'react';
import { Menu, Plus, UserCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Navbar = ({ onOpenSidebar, title = 'Dashboard', onActionClick, actionLabel, actionIcon: ActionIcon }) => {
  const { user } = useAuth();

  return (
    <header className="h-16 bg-white border-b border-slate-200 sticky top-0 z-30 flex items-center justify-between px-4 sm:px-8 shadow-xs">
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenSidebar}
          className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 focus:outline-none"
          aria-label="Toggle navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-bold text-slate-800 tracking-tight">{title}</h1>
      </div>

      <div className="flex items-center gap-3">
        {actionLabel && (
          <button
            onClick={onActionClick}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm px-4 py-2 rounded-xl transition duration-150 shadow-sm shadow-indigo-600/20 active:scale-95"
          >
            {ActionIcon ? <ActionIcon className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            <span className="hidden sm:inline">{actionLabel}</span>
          </button>
        )}

        <div className="hidden md:flex items-center gap-2 pl-3 border-l border-slate-200">
          <div className="text-right">
            <p className="text-xs font-semibold text-slate-800 leading-tight">{user?.name}</p>
            <p className="text-[11px] text-slate-500">{user?.title || 'Freelancer'}</p>
          </div>
          <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">
            <UserCheck className="w-4 h-4" />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
