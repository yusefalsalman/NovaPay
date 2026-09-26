import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, PlusCircle, Lock, CheckCircle2, Loader2, ArrowRight, AlertCircle } from 'lucide-react';
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
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm"
          />

          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative z-10 w-full max-w-lg bg-white/95 rounded-3xl p-6 sm:p-8 text-slate-900 shadow-2xl border border-slate-200/80 overflow-hidden"
          >
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 via-[oklch(74.6%_0.16_232.661)] to-teal-500" />

            <div className="flex items-center justify-between pb-4 border-b border-slate-200/80">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200">
                  <PlusCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Stripe Sandbox Top-Up</h3>
                  <p className="text-xs text-slate-500">Card Payment Rail & Idempotent Webhook</p>
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

            {error && (
              <div className="mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {step === 'amount' && (
              <form onSubmit={handleCreateIntent} className="mt-5 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-2 uppercase tracking-wider">
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
                      className="w-full pl-8 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 text-xl font-bold text-slate-900 placeholder-slate-400 transition-all font-mono"
                    />
                  </div>
                  <div className="flex gap-2 mt-2.5">
                    {presets.map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setAmount(p)}
                        className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                          amount === p
                            ? 'bg-emerald-600 text-white font-bold shadow-md shadow-emerald-600/30'
                            : 'bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700'
                        }`}
                      >
                        ${p}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-600 flex items-start gap-2.5">
                  <Lock className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-slate-800">Stripe Sandbox Security:</span>
                    <p className="mt-0.5 text-slate-500">
                      Card numbers are tokenized in Stripe iframe elements. Raw card data never touches NovaPay servers.
                    </p>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold flex items-center justify-center gap-2 shadow-md shadow-emerald-600/25 disabled:opacity-50 transition-all cursor-pointer"
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
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Locked Deposit:</span>
                    <span className="font-bold text-emerald-600 text-sm">${parseFloat(amount).toFixed(2)} USD</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">PaymentIntent ID:</span>
                    <span className="font-mono text-[oklch(45%_0.17_232.661)] font-medium select-all">{intentData.paymentIntentId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Cents in Stripe:</span>
                    <span className="font-mono text-slate-700">{intentData.amountInCents}</span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-emerald-200 space-y-3">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                    <span>Card Information (Test Mode)</span>
                    <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300 text-[10px] font-bold">4242 Card</span>
                  </div>

                  <div className="px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-sm font-mono text-slate-800 flex items-center justify-between shadow-xs">
                    <span>4242 •••• •••• 4242</span>
                    <span className="text-xs text-slate-500">12/28 • CVC 123</span>
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setStep('amount')}
                    className="flex-1 py-3 px-4 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-semibold transition-colors cursor-pointer"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={handleSimulatePayment}
                    disabled={loading}
                    className="flex-2 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold flex items-center justify-center gap-2 shadow-md shadow-emerald-600/25 disabled:opacity-50 transition-all cursor-pointer"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Confirming with Stripe...</span>
                      </>
                    ) : (
                      <>
                        <ArrowRight className="w-4 h-4 text-emerald-100" />
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
                  className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto mb-4"
                >
                  <CheckCircle2 className="w-8 h-8" />
                </motion.div>
                <h4 className="text-xl font-extrabold text-slate-900">Deposit Succeeded!</h4>
                <p className="text-sm text-slate-600 mt-1">
                  Added <span className="font-bold text-slate-900">${parseFloat(amount).toFixed(2)} {currency}</span> to your wallet.
                </p>
                <p className="text-xs text-[oklch(45%_0.17_232.661)] mt-2 font-mono font-medium">
                  Ledger Credited via Stripe Webhook Event
                </p>
                <button
                  type="button"
                  onClick={handleReset}
                  className="w-full mt-6 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-md shadow-emerald-600/25 transition-all cursor-pointer"
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
