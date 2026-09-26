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
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-white/10 px-4 sm:px-8 py-3.5 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-blue-500 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xl font-black tracking-tight text-white flex items-center gap-1.5">
              Nova<span className="text-indigo-400">Pay</span>
              <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
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
            className="p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-white border border-white/10 transition-colors"
            title="Refresh Ledger"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-indigo-400' : ''}`} />
          </button>

          {/* AI Advisor Button */}
          <button
            type="button"
            onClick={onOpenAi}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 text-xs font-semibold shadow-lg shadow-purple-600/10 transition-all group"
          >
            <BrainCircuit className="w-4 h-4 text-purple-400 group-hover:rotate-12 transition-transform" />
            <span className="hidden sm:inline">AI Advisor</span>
            <Sparkles className="w-3 h-3 text-amber-300" />
          </button>

          {/* User Profile Info */}
          {user && (
            <div className="hidden md:flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-white/10 text-xs">
              <div className="w-6 h-6 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-[10px]">
                {(user.fullName || user.email || 'U').charAt(0).toUpperCase()}
              </div>
              <div className="text-left">
                <p className="font-semibold text-slate-200 leading-none">{user.fullName || user.email || 'User'}</p>
                <p className="text-[10px] text-slate-400 font-mono mt-0.5">{user.wallet?.accountNumber || 'NP-2026-••••••'}</p>
              </div>
            </div>
          )}

          {/* Logout */}
          <button
            type="button"
            onClick={onLogout}
            className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-xs transition-colors"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
