import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, ArrowRight, AlertCircle, CheckCircle2, Loader2, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { api } from '../lib/api';
import type { TransferResponse } from '../types';

interface TransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  userBalance: number;
  currency: string;
  onSuccess: (newBalance: number) => void;
}

export const TransferModal: React.FC<TransferModalProps> = ({
  isOpen,
  onClose,
  userBalance,
  currency,
  onSuccess,
}) => {
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successData, setSuccessData] = useState<TransferResponse | null>(null);

  const presets = [10, 25, 50, 100, 250];

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('Please enter a valid amount greater than $0.');
      return;
    }

    if (parsedAmount > userBalance) {
      setError(`Insufficient balance. Maximum available: $${userBalance.toFixed(2)}`);
      return;
    }

    if (!recipient.trim()) {
      setError('Please provide a recipient account number or email.');
      return;
    }

    setLoading(true);

    try {
      const response = await api.post<TransferResponse>('/transfer', {
        recipientIdentifier: recipient.trim(),
        amount: parsedAmount,
        description: note.trim() || undefined,
      });

      // Blast celebratory confetti!
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#6366f1', '#10b981', '#38bdf8', '#a855f7'],
      });

      setSuccessData(response.data);
      onSuccess(response.data.remainingBalance);
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Transfer failed. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setRecipient('');
    setAmount('');
    setNote('');
    setError(null);
    setSuccessData(null);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleReset}
            className="fixed inset-0 bg-black/75 backdrop-blur-md"
          />

          {/* Modal Card */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative z-10 w-full max-w-lg glass-panel-glow rounded-3xl p-6 sm:p-8 text-white overflow-hidden"
          >
            {/* Ambient accent top bar */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-emerald-400" />

            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                  <Send className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold">Instant P2P Transfer</h3>
                  <p className="text-xs text-slate-400">Concurrency-safe Double-Entry Settlement</p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleReset}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {successData ? (
              /* Success State */
              <div className="py-6 text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                  className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-400 flex items-center justify-center mx-auto mb-4"
                >
                  <CheckCircle2 className="w-8 h-8" />
                </motion.div>

                <h4 className="text-xl font-extrabold text-white">Transfer Succeeded!</h4>
                <p className="text-sm text-slate-400 mt-1">
                  Sent <span className="font-bold text-white">${successData.amount.toFixed(2)} {currency}</span> to{' '}
                  <span className="font-mono text-indigo-300">{successData.recipientAccountNumber}</span>
                </p>

                <div className="my-6 p-4 rounded-2xl bg-slate-900/60 border border-white/10 text-left text-xs space-y-2">
                  <div className="flex justify-between text-slate-400">
                    <span>Transaction Ref:</span>
                    <span className="font-mono text-white select-all">{successData.referenceId}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>New Balance:</span>
                    <span className="font-bold text-emerald-400">${successData.remainingBalance.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Ledger Status:</span>
                    <span className="text-indigo-400 font-medium">Double-Entry Immutably Balanced</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleReset}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-semibold shadow-lg shadow-indigo-600/30 transition-all"
                >
                  Done
                </button>
              </div>
            ) : (
              /* Form State */
              <form onSubmit={handleTransfer} className="mt-5 space-y-4">
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2"
                  >
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{error}</span>
                  </motion.div>
                )}

                {/* Recipient */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                    Recipient Identifier
                  </label>
                  <input
                    type="text"
                    required
                    value={recipient}
                    onChange={(e) => setRecipient(e.target.value)}
                    placeholder="Account Number (NP-2026-...) or Email"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900/80 border border-white/15 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-sm text-white placeholder-slate-500 transition-all font-mono"
                  />
                </div>

                {/* Amount */}
                <div>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="font-semibold text-slate-300 uppercase tracking-wider">Amount ({currency})</span>
                    <span className="text-slate-400">
                      Balance: <span className="font-bold text-slate-200">${userBalance.toFixed(2)}</span>
                    </span>
                  </div>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      required
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0.00"
                      className="w-full pl-8 pr-16 py-2.5 rounded-xl bg-slate-900/80 border border-white/15 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-lg font-bold text-white placeholder-slate-600 transition-all font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setAmount(userBalance.toFixed(2))}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 px-2.5 py-1 rounded-lg bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 text-xs font-bold transition-colors"
                    >
                      MAX
                    </button>
                  </div>

                  {/* Preset Pills */}
                  <div className="flex gap-2 mt-2">
                    {presets.map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setAmount(p.toString())}
                        className="flex-1 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 border border-white/5 text-xs font-medium text-slate-300 transition-all"
                      >
                        +${p}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Note */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                    Reference Note (Optional)
                  </label>
                  <input
                    type="text"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="e.g. Dinner share, rent, coffee"
                    className="w-full px-4 py-2 rounded-xl bg-slate-900/80 border border-white/15 focus:border-indigo-500 focus:outline-none text-xs text-white placeholder-slate-500"
                  />
                </div>

                {/* Double-Entry Preview Box */}
                <div className="p-3 rounded-xl bg-indigo-950/30 border border-indigo-500/20 text-xs text-slate-300 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-rose-400 font-semibold">
                    <span>Debit: -${parseFloat(amount) || 0}</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-500" />
                  <div className="flex items-center gap-2 text-emerald-400 font-semibold">
                    <span>Credit: +${parseFloat(amount) || 0}</span>
                  </div>
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-bold flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 disabled:opacity-50 transition-all"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Settling Ledger...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-amber-300" />
                      <span>Confirm & Send Funds</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
