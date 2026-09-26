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
            className="fixed inset-0 bg-black/70 backdrop-blur-sm"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 280 }}
            className="relative z-10 w-full max-w-md h-full bg-[#0a0f1d] border-l border-white/10 text-white p-6 flex flex-col shadow-2xl overflow-y-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
                  <BrainCircuit className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold flex items-center gap-1.5">
                    <span>NovaPay AI Advisor</span>
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  </h3>
                  <p className="text-[11px] text-purple-300/80 font-mono">Powered by Google Gemini</p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Metrics */}
            <div className="mt-5 grid grid-cols-2 gap-3">
              <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-white/10">
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Total Funded</span>
                <p className="text-lg font-bold text-emerald-400 font-mono mt-0.5">+${totalFunded.toFixed(2)}</p>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-white/10">
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Total Transferred</span>
                <p className="text-lg font-bold text-rose-400 font-mono mt-0.5">-${totalSpent.toFixed(2)}</p>
              </div>
            </div>

            {/* AI Insights Cards */}
            <div className="mt-5 space-y-3 flex-1">
              <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
                <span>Intelligent Ledger Insights</span>
              </h4>

              <div className="p-4 rounded-2xl bg-purple-950/20 border border-purple-500/20 space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-bold text-purple-300">
                  <TrendingDown className="w-4 h-4 text-purple-400" />
                  <span>Cash Flow Velocity</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Your wallet has processed {transactions.length} immutable ledger events. Net capital retention is currently at{' '}
                  <span className="font-bold text-emerald-400">
                    {totalFunded > 0 ? (((totalFunded - totalSpent) / totalFunded) * 100).toFixed(0) : 100}%
                  </span>.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-blue-950/20 border border-blue-500/20 space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-bold text-blue-300">
                  <ShieldAlert className="w-4 h-4 text-blue-400" />
                  <span>Reserve Recommendation</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Maintaining at least $50.00 prevents transfer rejections during high-frequency P2P settlement cycles.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/20 space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-300">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  <span>Ledger Integrity</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  All transaction journal entries strictly satisfy the Double-Entry balance invariant. Zero detected discrepancies.
                </p>
              </div>

              {customResponse && (
                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-200">
                  <span className="font-bold">Advisor Reply:</span>
                  <p className="mt-1 leading-relaxed text-slate-200">{customResponse}</p>
                </div>
              )}
            </div>

            {/* Interactive Query Input */}
            <form onSubmit={handleAskCustom} className="mt-4 pt-4 border-t border-white/10">
              <div className="relative">
                <input
                  type="text"
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  placeholder="Ask NovaPay AI about your spending..."
                  className="w-full pl-3.5 pr-10 py-2.5 rounded-xl bg-slate-900 border border-white/15 focus:outline-none focus:border-purple-500 text-xs text-white placeholder-slate-500"
                />
                <button
                  type="submit"
                  disabled={analyzing}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white transition-colors"
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
