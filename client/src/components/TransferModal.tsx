import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowUpRight, ArrowRight, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useLanguage } from '../context/LanguageContext';
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
  const { t } = useLanguage();
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
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleReset}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm"
          />

          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative z-10 w-full max-w-lg bg-white/95 rounded-3xl p-6 sm:p-8 text-slate-900 shadow-2xl border border-slate-200/80 overflow-hidden"
          >
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[oklch(74.6%_0.16_232.661)] via-blue-600 to-emerald-500" />

            <div className="flex items-center justify-between pb-4 border-b border-slate-200/80">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-[oklch(96%_0.03_232.661)] text-[oklch(45%_0.17_232.661)] border border-[oklch(88%_0.07_232.661)]">
                  <ArrowUpRight className="w-5 h-5 rtl:rotate-90" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">{t('instantTransferModal')}</h3>
                  <p className="text-xs text-slate-500">{t('concurrencySubtitle')}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleReset}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {successData ? (
              <div className="py-6 text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                  className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto mb-4"
                >
                  <CheckCircle2 className="w-8 h-8" />
                </motion.div>

                <h4 className="text-xl font-extrabold text-slate-900">{t('transferSucceeded')}</h4>
                <p className="text-sm text-slate-600 mt-1">
                  {t('sentLabel')} <span dir="ltr" className="font-bold text-slate-900">${successData.amount.toFixed(2)} {currency}</span> {t('toLabel')}{' '}
                  <span className="font-mono text-[oklch(45%_0.17_232.661)] font-semibold">{successData.recipientAccountNumber}</span>
                </p>

                <div className="my-6 p-4 rounded-2xl bg-slate-50 border border-slate-200 text-start text-xs space-y-2">
                  <div className="flex justify-between text-slate-500">
                    <span>{t('transactionRefLabel')}</span>
                    <span className="font-mono text-slate-800 font-medium select-all">{successData.referenceId}</span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>{t('newBalanceLabel')}</span>
                    <span dir="ltr" className="font-bold text-emerald-600">${successData.remainingBalance.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>{t('ledgerStatusLabel')}</span>
                    <span className="text-[oklch(45%_0.17_232.661)] font-semibold">{t('doubleEntryBalanced')}</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleReset}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[oklch(55%_0.17_232.661)] to-[oklch(46%_0.16_232.661)] hover:from-[oklch(50%_0.17_232.661)] hover:to-[oklch(42%_0.16_232.661)] text-white font-semibold shadow-md shadow-[oklch(74.6%_0.16_232.661/0.25)] transition-all cursor-pointer"
                >
                  {t('doneBtn')}
                </button>
              </div>
            ) : (
              <form onSubmit={handleTransfer} className="mt-5 space-y-4">
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 text-xs flex items-center gap-2"
                  >
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{error}</span>
                  </motion.div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wider">
                    {t('recipientIdentifier')}
                  </label>
                  <input
                    type="text"
                    required
                    value={recipient}
                    onChange={(e) => setRecipient(e.target.value)}
                    placeholder={t('recipientPlaceholder')}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-[oklch(74.6%_0.16_232.661)] focus:outline-none focus:ring-1 focus:ring-[oklch(74.6%_0.16_232.661)] text-sm text-slate-900 placeholder-slate-400 transition-all font-mono"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="font-semibold text-slate-600 uppercase tracking-wider">{t('amountCurrency')} ({currency})</span>
                    <span className="text-slate-500">
                      {t('balanceLabel')} <span dir="ltr" className="font-bold text-slate-900">${userBalance.toFixed(2)}</span>
                    </span>
                  </div>
                  <div className="relative">
                    <span className="absolute start-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      required
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0.00"
                      className="w-full ps-8 pe-16 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-[oklch(74.6%_0.16_232.661)] focus:outline-none focus:ring-1 focus:ring-[oklch(74.6%_0.16_232.661)] text-lg font-bold text-slate-900 placeholder-slate-400 transition-all font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setAmount(userBalance.toFixed(2))}
                      className="absolute end-2.5 top-1/2 -translate-y-1/2 px-2.5 py-1 rounded-lg bg-[oklch(96%_0.03_232.661)] hover:bg-[oklch(90%_0.06_232.661)] text-[oklch(45%_0.17_232.661)] border border-[oklch(88%_0.07_232.661)] text-xs font-bold transition-colors cursor-pointer"
                    >
                      {t('maxBtn')}
                    </button>
                  </div>

                  <div className="flex gap-2 mt-2">
                    {presets.map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setAmount(p.toString())}
                        className="flex-1 py-1 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-medium text-slate-700 transition-all cursor-pointer"
                      >
                        +${p}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wider">
                    {t('referenceNote')}
                  </label>
                  <input
                    type="text"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder={t('notePlaceholder')}
                    className="w-full px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-[oklch(74.6%_0.16_232.661)] focus:outline-none text-xs text-slate-900 placeholder-slate-400"
                  />
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-600 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-rose-600 font-semibold">
                    <span>{t('debitPreview')} -${parseFloat(amount) || 0}</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400 rtl:rotate-180" />
                  <div className="flex items-center gap-2 text-emerald-600 font-semibold">
                    <span>{t('creditPreview')} +${parseFloat(amount) || 0}</span>
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
                      <span>{t('settlingLedger')}</span>
                    </>
                  ) : (
                    <>
                      <ArrowRight className="w-4 h-4 rtl:rotate-180" />
                      <span>{t('confirmAndSend')}</span>
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
