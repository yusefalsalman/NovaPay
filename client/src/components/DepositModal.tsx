import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CreditCard, ShieldCheck, CheckCircle2, Loader2, Sparkles, AlertCircle } from 'lucide-react';
import confetti from 'canvas-confetti';
import { api } from '../lib/api';
import type { CreatePaymentIntentResponse } from '../types';

interface DepositModalProps {
  isOpen: boolean;
  onClose: () => void;
  currency: string;
  onDepositSuccess: () => void;
}

export const DepositModal: React.FC<DepositModalProps> = ({
  isOpen,
  onClose,
  currency,
  onDepositSuccess,
}) => {
  const [amount, setAmount] = useState('50.00');
  const [step, setStep] = useState<'amount' | 'checkout' | 'success'>('amount');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [intentData, setIntentData] = useState<CreatePaymentIntentResponse | null>(null);

  const presets = ['25.00', '50.00', '100.00', '250.00', '500.00'];

  const handleCreateIntent = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const parsed = parseFloat(amount);
    if (isNaN(parsed) || parsed <= 0) {
      setError('Please enter an amount greater than $0.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post<CreatePaymentIntentResponse>('/payments/create-intent', {
        amount: parsed,
      });
      setIntentData(res.data);
      setStep('checkout');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to initialize Stripe PaymentIntent.');
    } finally {
      setLoading(false);
    }
  };

  const handleSimulatePayment = async () => {
    if (!intentData) return;
    setLoading(true);
    setError(null);

    try {
      // 1. Confirm the PaymentIntent with Stripe and credit the PostgreSQL ledger atomically!
      await api.post(`/payments/confirm-intent/${intentData.paymentIntentId}`);

      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#10b981', '#6366f1', '#f59e0b'],
      });

      setStep('success');
      onDepositSuccess();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Payment confirmation encountered an issue.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setStep('amount');
    setIntentData(null);
    setError(null);
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
            className="fixed inset-0 bg-black/75 backdrop-blur-md"
          />

          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative z-10 w-full max-w-lg glass-panel-glow rounded-3xl p-6 sm:p-8 text-white overflow-hidden"
          >
            {/* Top decorative stripe */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-400 via-teal-500 to-indigo-500" />

            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold">Stripe Sandbox Top-Up</h3>
                  <p className="text-xs text-slate-400">Card Payment Rail & Idempotent Webhook</p>
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

            {error && (
              <div className="mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {step === 'amount' && (
              <form onSubmit={handleCreateIntent} className="mt-5 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                    Deposit Amount ({currency})
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                    <input
                      type="number"
                      step="0.01"
                      min="1.00"
                      required
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="w-full pl-8 pr-4 py-3 rounded-xl bg-slate-900/80 border border-white/15 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 text-xl font-bold text-white placeholder-slate-600 transition-all font-mono"
                    />
                  </div>
                  {/* Preset Pills */}
                  <div className="flex gap-2 mt-2.5">
                    {presets.map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setAmount(p)}
                        className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                          amount === p
                            ? 'bg-emerald-500 text-slate-950 font-bold shadow-lg shadow-emerald-500/30'
                            : 'bg-slate-800/80 hover:bg-slate-700/80 border border-white/5 text-slate-300'
                        }`}
                      >
                        ${p}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-900/60 border border-white/10 text-xs text-slate-400 flex items-start gap-2.5">
                  <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-slate-200">Stripe Sandbox Security:</span>
                    <p className="mt-0.5">
                      Card numbers are tokenized in Stripe iframe elements. Raw card data never touches NovaPay servers.
                    </p>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 disabled:opacity-50 transition-all"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Creating PaymentIntent...</span>
                    </>
                  ) : (
                    <span>Proceed to Card Checkout</span>
                  )}
                </button>
              </form>
            )}

            {step === 'checkout' && intentData && (
              <div className="mt-5 space-y-4">
                <div className="p-4 rounded-2xl bg-slate-900/80 border border-white/10 text-xs space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Locked Deposit:</span>
                    <span className="font-bold text-emerald-400 text-sm">${parseFloat(amount).toFixed(2)} USD</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">PaymentIntent ID:</span>
                    <span className="font-mono text-indigo-300 select-all">{intentData.paymentIntentId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Cents in Stripe:</span>
                    <span className="font-mono text-slate-300">{intentData.amountInCents}</span>
                  </div>
                </div>

                {/* Simulated Stripe Card Element */}
                <div className="p-4 rounded-2xl bg-slate-900/90 border border-emerald-500/30 space-y-3">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
                    <span>Card Information (Test Mode)</span>
                    <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px]">4242 Card</span>
                  </div>

                  <div className="px-3.5 py-2.5 rounded-xl bg-black/50 border border-white/10 text-sm font-mono text-slate-200 flex items-center justify-between">
                    <span>4242 •••• •••• 4242</span>
                    <span className="text-xs text-slate-400">12/28 • CVC 123</span>
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setStep('amount')}
                    className="flex-1 py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold transition-colors"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={handleSimulatePayment}
                    disabled={loading}
                    className="flex-2 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 disabled:opacity-50 transition-all"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Confirming with Stripe...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 text-emerald-300" />
                        <span>Authorize ${parseFloat(amount).toFixed(2)}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {step === 'success' && (
              <div className="py-6 text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                  className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-400 flex items-center justify-center mx-auto mb-4"
                >
                  <CheckCircle2 className="w-8 h-8" />
                </motion.div>
                <h4 className="text-xl font-extrabold text-white">Deposit Succeeded!</h4>
                <p className="text-sm text-slate-400 mt-1">
                  Added <span className="font-bold text-white">${parseFloat(amount).toFixed(2)} {currency}</span> to your wallet.
                </p>
                <p className="text-xs text-indigo-400 mt-2 font-mono">
                  Ledger Credited via Stripe Webhook Event
                </p>
                <button
                  type="button"
                  onClick={handleReset}
                  className="w-full mt-6 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold transition-all"
                >
                  Return to Dashboard
                </button>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
