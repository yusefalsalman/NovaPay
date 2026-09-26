import React from 'react';
import { ShieldCheck, LogOut, BrainCircuit, Sparkles, RefreshCw } from 'lucide-react';
import type { User } from '../types';

interface NavbarProps {
  user: User | null;
  onLogout: () => void;
  onOpenAi: () => void;
  onRefresh: () => void;
  refreshing: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  onLogout,
  onOpenAi,
  onRefresh,
  refreshing,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full bg-white/85 border-b border-slate-200/90 px-4 sm:px-8 py-3.5 backdrop-blur-xl shadow-xs">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-blue-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/25">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xl font-black tracking-tight text-slate-900 flex items-center gap-1.5">
              Nova<span className="text-indigo-600">Pay</span>
              <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                PROD
              </span>
            </span>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Refresh Balance & Ledger */}
          <button
            type="button"
            onClick={onRefresh}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 border border-slate-200 transition-colors cursor-pointer"
            title="Refresh Ledger"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-indigo-600' : ''}`} />
          </button>

          {/* AI Advisor Button */}
          <button
            type="button"
            onClick={onOpenAi}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 text-xs font-semibold shadow-xs transition-all group cursor-pointer"
          >
            <BrainCircuit className="w-4 h-4 text-purple-600 group-hover:rotate-12 transition-transform" />
            <span className="hidden sm:inline">AI Advisor</span>
            <Sparkles className="w-3 h-3 text-amber-500" />
          </button>

          {/* User Profile Info */}
          {user && (
            <div className="hidden md:flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-slate-100/90 border border-slate-200/90 text-xs">
              <div className="w-6 h-6 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-[10px]">
                {(user.fullName || user.email || 'U').charAt(0).toUpperCase()}
              </div>
              <div className="text-left">
                <p className="font-semibold text-slate-900 leading-none">{user.fullName || user.email || 'User'}</p>
                <p className="text-[10px] text-slate-500 font-mono mt-0.5">{user.wallet?.accountNumber || 'NP-2026-••••••'}</p>
              </div>
            </div>
          )}

          {/* Logout */}
          <button
            type="button"
            onClick={onLogout}
            className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 text-xs transition-colors cursor-pointer"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
