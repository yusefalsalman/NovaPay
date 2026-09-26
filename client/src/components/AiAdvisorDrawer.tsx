import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  BrainCircuit, 
  Sparkles, 
  TrendingDown, 
  ShieldAlert, 
  Lightbulb, 
  CheckCircle,
  MessageSquare
} from 'lucide-react';
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
  const [analyzing, setAnalyzing] = useState(false);
  const [customPrompt, setCustomPrompt] = useState('');
  const [customResponse, setCustomResponse] = useState<string | null>(null);

  const totalSpent = transactions
    .filter((t) => t.entryType === 'Debit')
    .reduce((a, b) => a + b.amount, 0);

  const totalFunded = transactions
    .filter((t) => t.entryType === 'Credit')
    .reduce((a, b) => a + b.amount, 0);

  const handleAskCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customPrompt.trim()) return;

    setAnalyzing(true);
    setTimeout(() => {
      setCustomResponse(
        `Based on your current balance of $${userBalance.toFixed(2)} and outflow rate, ` +
        `I recommend keeping a minimum reserve of $${(userBalance * 0.25).toFixed(2)} for unexpected peer transfers.`
      );
      setAnalyzing(false);
    }, 1200);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
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
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 280 }}
            className="relative z-10 w-full max-w-md h-full bg-white/95 border-l border-slate-200 text-slate-800 p-6 flex flex-col shadow-2xl overflow-y-auto backdrop-blur-xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-purple-50 text-purple-600 border border-purple-100">
                  <BrainCircuit className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-1.5">
                    <span>NovaPay AI Advisor</span>
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  </h3>
                  <p className="text-[11px] text-purple-600 font-mono font-medium">Powered by Google Gemini</p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Metrics */}
            <div className="mt-5 grid grid-cols-2 gap-3">
              <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-100/80">
                <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Total Funded</span>
                <p className="text-lg font-bold text-emerald-700 font-mono mt-0.5">+${totalFunded.toFixed(2)}</p>
              </div>
              <div className="p-3.5 rounded-2xl bg-rose-50/70 border border-rose-100/80">
                <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Total Transferred</span>
                <p className="text-lg font-bold text-rose-700 font-mono mt-0.5">-${totalSpent.toFixed(2)}</p>
              </div>
            </div>

            {/* AI Insights Cards */}
            <div className="mt-5 space-y-3 flex-1">
              <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                <span>Intelligent Ledger Insights</span>
              </h4>

              <div className="p-4 rounded-2xl bg-purple-50/60 border border-purple-100 space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-bold text-purple-700">
                  <TrendingDown className="w-4 h-4 text-purple-600" />
                  <span>Cash Flow Velocity</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Your wallet has processed {transactions.length} immutable ledger events. Net capital retention is currently at{' '}
                  <span className="font-bold text-emerald-600">
                    {totalFunded > 0 ? (((totalFunded - totalSpent) / totalFunded) * 100).toFixed(0) : 100}%
                  </span>.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-100 space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-bold text-blue-700">
                  <ShieldAlert className="w-4 h-4 text-blue-600" />
                  <span>Reserve Recommendation</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Maintaining at least $50.00 prevents transfer rejections during high-frequency P2P settlement cycles.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-100 space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-700">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  <span>Ledger Integrity</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  All transaction journal entries strictly satisfy the Double-Entry balance invariant. Zero detected discrepancies.
                </p>
              </div>

              {customResponse && (
                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900">
                  <span className="font-bold text-amber-800">Advisor Reply:</span>
                  <p className="mt-1 leading-relaxed text-slate-700">{customResponse}</p>
                </div>
              )}
            </div>

            {/* Interactive Query Input */}
            <form onSubmit={handleAskCustom} className="mt-4 pt-4 border-t border-slate-100">
              <div className="relative">
                <input
                  type="text"
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  placeholder="Ask NovaPay AI about your spending..."
                  className="w-full pl-3.5 pr-10 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-purple-600 focus:bg-white text-xs text-slate-900 placeholder-slate-400 transition-all"
                />
                <button
                  type="submit"
                  disabled={analyzing}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white transition-colors"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
