import React from 'react';
import { LogOut, RefreshCw, Compass, Languages } from 'lucide-react';
import { NovaLogo } from './NovaLogo';
import { useLanguage } from '../context/LanguageContext';
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
  const { lang, toggleLanguage, t } = useLanguage();

  return (
    <header className="sticky top-0 z-40 w-full bg-white/85 border-b border-[oklch(88%_0.07_232.661/0.7)] px-3 sm:px-8 py-2.5 sm:py-3.5 backdrop-blur-xl shadow-xs">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
        {/* Brand */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[oklch(28%_0.14_232.661)] border border-[oklch(40%_0.16_232.661)] flex items-center justify-center shadow-md shadow-[oklch(74.6%_0.16_232.661/0.3)] shrink-0">
            <NovaLogo className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div>
            <span className="text-lg sm:text-xl font-black tracking-tight text-slate-900 flex items-center gap-1.5">
              Nova<span className="text-[oklch(50%_0.17_232.661)]">Pay</span>
              <span className="hidden sm:inline-flex text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                {t('live')}
              </span>
            </span>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          {/* Language Switcher Pill */}
          <button
            type="button"
            onClick={toggleLanguage}
            className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200/90 text-slate-700 hover:text-slate-900 border border-slate-200 text-xs font-bold transition-all cursor-pointer shadow-xs shrink-0"
            title={lang === 'en' ? 'التحويل إلى العربية' : 'Switch to English'}
          >
            <Languages className="w-3.5 h-3.5 text-[oklch(50%_0.17_232.661)] shrink-0" />
            <span className="hidden sm:inline">{lang === 'en' ? 'العربية' : 'English'}</span>
            <span className="inline sm:hidden font-bold text-[11px]">{lang === 'en' ? 'عربي' : 'EN'}</span>
          </button>

          {/* Refresh Balance & Ledger */}
          <button
            type="button"
            onClick={onRefresh}
            className="p-1.5 sm:p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 border border-slate-200 transition-colors cursor-pointer shrink-0"
            title={t('refreshLedger')}
          >
            <RefreshCw className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${refreshing ? 'animate-spin text-[oklch(50%_0.17_232.661)]' : ''}`} />
          </button>

          {/* Ledger Intelligence Button */}
          <button
            type="button"
            onClick={onOpenAi}
            className="flex items-center gap-1.5 p-1.5 sm:px-3 sm:py-1.5 rounded-xl bg-[oklch(96%_0.03_232.661)] hover:bg-[oklch(93%_0.05_232.661)] text-[oklch(40%_0.16_232.661)] border border-[oklch(85%_0.08_232.661)] text-xs font-semibold shadow-xs transition-all group cursor-pointer shrink-0"
            title={t('ledgerIntelligence')}
          >
            <Compass className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[oklch(50%_0.17_232.661)] group-hover:rotate-45 transition-transform duration-300 shrink-0" />
            <span className="hidden sm:inline">{t('ledgerIntelligence')}</span>
          </button>

          {/* User Profile Info */}
          {user && (
            <div className="hidden md:flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-slate-100/90 border border-slate-200/90 text-xs shrink-0">
              <div className="w-6 h-6 rounded-full bg-[oklch(50%_0.17_232.661)] text-white font-bold flex items-center justify-center text-[10px]">
                {(user.fullName || user.email || 'U').charAt(0).toUpperCase()}
              </div>
              <div className="text-start">
                <p className="font-semibold text-slate-900 leading-none">{user.fullName || user.email || 'User'}</p>
                <p className="text-[10px] text-slate-500 font-mono mt-0.5">{user.wallet?.accountNumber || 'NP-2026-••••••'}</p>
              </div>
            </div>
          )}

          {/* Logout */}
          <button
            type="button"
            onClick={onLogout}
            className="p-1.5 sm:p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 text-xs transition-colors cursor-pointer shrink-0"
            title={t('signOut')}
          >
            <LogOut className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
