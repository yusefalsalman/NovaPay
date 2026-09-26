import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, Mail, User as UserIcon, ArrowRight, Loader2, AlertCircle, Scale, Languages } from 'lucide-react';
import { NovaLogo } from './NovaLogo';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../lib/api';
import type { AuthResponse } from '../types';

interface AuthScreenProps {
  onAuthSuccess: (authData: AuthResponse) => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onAuthSuccess }) => {
  const { lang, toggleLanguage, t } = useLanguage();
  const [isLogin, setIsLogin] = useState(true);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const endpoint = isLogin ? '/auth/login' : '/auth/register';
      const payload = isLogin
        ? { email, password }
        : { fullName, email, password };

      const response = await api.post<AuthResponse>(endpoint, payload);

      const userObj = {
        fullName: response.data.fullName || response.data.user?.fullName || '',
        email: response.data.email || response.data.user?.email || '',
        wallet: {
          accountNumber: response.data.accountNumber || response.data.user?.accountNumber || 'NP-2026-000000',
          balance: response.data.balance ?? response.data.user?.balance ?? 0,
          currency: 'USD',
        },
      };

      localStorage.setItem('novapay_token', response.data.token);
      localStorage.setItem('novapay_user', JSON.stringify(userObj));

      onAuthSuccess(response.data);
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Authentication failed. Please verify credentials.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative z-10">
      <motion.div
        initial={{ opacity: 0, y: 25, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="w-full max-w-md bg-white/95 rounded-3xl p-8 border border-slate-200/80 shadow-2xl relative overflow-hidden backdrop-blur-xl text-slate-900"
      >
        {/* Ambient Top Glow Line */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[oklch(74.6%_0.16_232.661)] via-blue-600 to-indigo-600" />

        {/* Top bar with language switcher */}
        <div className="flex justify-end mb-2">
          <button
            type="button"
            onClick={toggleLanguage}
            className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-700 hover:text-slate-900 border border-slate-200 text-xs font-bold transition-all cursor-pointer shadow-2xs"
          >
            <Languages className="w-3.5 h-3.5 text-[oklch(50%_0.17_232.661)]" />
            <span>{lang === 'en' ? 'العربية' : 'English'}</span>
          </button>
        </div>

        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-[oklch(96%_0.03_232.661)] border border-[oklch(88%_0.07_232.661)] shadow-sm mb-3">
            <NovaLogo className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900">
            Nova<span className="text-[oklch(45%_0.17_232.661)]">Pay</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {t('authHeadline')}
          </p>
        </div>

        {/* Auth Mode Tabs */}
        <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 mb-6 text-xs font-semibold">
          <button
            type="button"
            onClick={() => {
              setIsLogin(true);
              setError(null);
            }}
            className={`flex-1 py-2 rounded-lg transition-all cursor-pointer ${
              isLogin ? 'bg-[oklch(52%_0.17_232.661)] text-white shadow-sm shadow-[oklch(52%_0.17_232.661/0.3)]' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {t('signInTab')}
          </button>
          <button
            type="button"
            onClick={() => {
              setIsLogin(false);
              setError(null);
            }}
            className={`flex-1 py-2 rounded-lg transition-all cursor-pointer ${
              !isLogin ? 'bg-[oklch(52%_0.17_232.661)] text-white shadow-sm shadow-[oklch(52%_0.17_232.661/0.3)]' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {t('createAccountTab')}
          </button>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 text-xs flex items-center gap-2"
          >
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </motion.div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wider">
                {t('fullNameLabel')}
              </label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-slate-400 absolute start-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full ps-10 pe-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:border-[oklch(74.6%_0.16_232.661)] focus:ring-1 focus:ring-[oklch(74.6%_0.16_232.661)] text-xs text-slate-900 placeholder-slate-400 transition-all"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wider">
              {t('emailLabel')}
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute start-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="yousef@example.com"
                className="w-full ps-10 pe-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:border-[oklch(74.6%_0.16_232.661)] focus:ring-1 focus:ring-[oklch(74.6%_0.16_232.661)] text-xs text-slate-900 placeholder-slate-400 transition-all font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wider">
              {t('passwordLabel')}
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute start-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full ps-10 pe-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:border-[oklch(74.6%_0.16_232.661)] focus:ring-1 focus:ring-[oklch(74.6%_0.16_232.661)] text-xs text-slate-900 placeholder-slate-400 transition-all font-mono"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-[oklch(55%_0.17_232.661)] to-[oklch(46%_0.16_232.661)] hover:from-[oklch(50%_0.17_232.661)] hover:to-[oklch(42%_0.16_232.661)] text-white font-bold flex items-center justify-center gap-2 shadow-md shadow-[oklch(74.6%_0.16_232.661/0.25)] disabled:opacity-50 transition-all cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>{t('authenticatingBtn')}</span>
              </>
            ) : (
              <>
                <span>{isLogin ? t('signInBtn') : t('createAccountBtn')}</span>
                <ArrowRight className="w-4 h-4 rtl:rotate-180 transition-transform" />
              </>
            )}
          </button>
        </form>

        {/* Footer info */}
        <div className="mt-6 pt-4 border-t border-slate-200/80 flex items-center justify-center gap-2 text-[11px] text-slate-500">
          <Scale className="w-3.5 h-3.5 text-[oklch(45%_0.17_232.661)]" />
          <span>{t('authSecurityNote')}</span>
        </div>
      </motion.div>
    </div>
  );
};
