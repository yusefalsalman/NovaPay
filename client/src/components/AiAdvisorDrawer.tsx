import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Compass, 
  BarChart3, 
  TrendingDown, 
  Scale, 
  CheckCircle,
  ArrowUpRight
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import type { TransactionHistoryItem } from '../types';

interface AiAdvisorDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  userBalance: number;
  transactions: TransactionHistoryItem[];
}

export const AiAdvisorDrawer: React.FC<AiAdvisorDrawerProps> = ({
  isOpen,
  onClose,
  userBalance,
  transactions,
}) => {
  const { isRtl, t } = useLanguage();
  const [analyzing, setAnalyzing] = useState(false);
  const [customPrompt, setCustomPrompt] = useState('');
  const [customResponse, setCustomResponse] = useState<string | null>(null);

  const totalSpent = transactions
    .filter((t) => t.entryType === 'Debit')
    .reduce((a, b) => a + b.amount, 0);

  const totalFunded = transactions
    .filter((t) => t.entryType === 'Credit')
    .reduce((a, b) => a + b.amount, 0);

  const retentionPct = totalFunded > 0 ? (((totalFunded - totalSpent) / totalFunded) * 100).toFixed(0) : '100';

  const handleAskCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customPrompt.trim()) return;

    setAnalyzing(true);
    setTimeout(() => {
      setCustomResponse(
        isRtl
          ? `بناءً على رصيدك الحالي البالغ $${userBalance.toFixed(2)} ومعدل الصرف، أوصي بالاحتفاظ باحتياطي لا يقل عن $${(userBalance * 0.25).toFixed(2)} للمعاملات الفورية غير المتوقعة.`
          : `Based on your current balance of $${userBalance.toFixed(2)} and outflow rate, I recommend keeping a minimum reserve of $${(userBalance * 0.25).toFixed(2)} for unexpected peer transfers.`
      );
      setAnalyzing(false);
    }, 1200);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className={`fixed inset-0 z-50 flex ${isRtl ? 'justify-start' : 'justify-end'}`}>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: isRtl ? '-100%' : '100%' }}
            animate={{ x: 0 }}
            exit={{ x: isRtl ? '-100%' : '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 280 }}
            className={`relative z-10 w-full max-w-md h-full bg-white text-slate-900 p-6 flex flex-col shadow-2xl overflow-y-auto ${
              isRtl ? 'border-r border-slate-200' : 'border-l border-slate-200'
            }`}
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-200/80">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-[oklch(96%_0.03_232.661)] text-[oklch(45%_0.17_232.661)] border border-[oklch(88%_0.07_232.661)]">
                  <Compass className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-1.5">
                    <span>{t('advisorTitle')}</span>
                  </h3>
                  <p className="text-[11px] text-[oklch(45%_0.17_232.661)] font-mono font-medium">{t('advisorSubtitle')}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Metrics */}
            <div className="mt-5 grid grid-cols-2 gap-3">
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
                <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">{t('totalFundedLabel')}</span>
                <p dir="ltr" className="text-lg font-bold text-emerald-600 font-mono mt-0.5 text-start">+${totalFunded.toFixed(2)}</p>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
                <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">{t('totalTransferredLabel')}</span>
                <p dir="ltr" className="text-lg font-bold text-rose-600 font-mono mt-0.5 text-start">-${totalSpent.toFixed(2)}</p>
              </div>
            </div>

            {/* Diagnostic Cards */}
            <div className="mt-5 space-y-3 flex-1">
              <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <BarChart3 className="w-3.5 h-3.5 text-[oklch(45%_0.17_232.661)]" />
                <span>{t('diagnosticsTitle')}</span>
              </h4>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-bold text-purple-600">
                  <TrendingDown className="w-4 h-4 text-purple-600" />
                  <span>{t('cashFlowVelocity')}</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {t('cashFlowText', { count: transactions.length, pct: retentionPct })}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-bold text-[oklch(45%_0.17_232.661)]">
                  <Scale className="w-4 h-4 text-[oklch(45%_0.17_232.661)]" />
                  <span>{t('reserveRecommendation')}</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {t('reserveText')}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-600">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  <span>{t('ledgerIntegrity')}</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {t('ledgerIntegrityText')}
                </p>
              </div>

              {customResponse && (
                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900">
                  <span className="font-bold text-amber-800">{t('advisorReply')}</span>
                  <p className="mt-1 leading-relaxed text-slate-700">{customResponse}</p>
                </div>
              )}
            </div>

            {/* Interactive Query Input */}
            <form onSubmit={handleAskCustom} className="mt-4 pt-4 border-t border-slate-200/80">
              <div className="relative">
                <input
                  type="text"
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  placeholder={t('advisorQueryPlaceholder')}
                  className="w-full ps-3.5 pe-10 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-[oklch(74.6%_0.16_232.661)] text-xs text-slate-900 placeholder-slate-400 transition-all"
                />
                <button
                  type="submit"
                  disabled={analyzing}
                  className="absolute end-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg bg-[oklch(52%_0.17_232.661)] hover:bg-[oklch(46%_0.16_232.661)] text-white transition-colors cursor-pointer"
                >
                  <ArrowUpRight className="w-3.5 h-3.5 rtl:rotate-90" />
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
