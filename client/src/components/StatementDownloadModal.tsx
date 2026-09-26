import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, FileText, Download, Calendar, Loader2, CheckCircle2 } from 'lucide-react';
import { api } from '../lib/api';

interface StatementDownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
  accountNumber: string;
}

export const StatementDownloadModal: React.FC<StatementDownloadModalProps> = ({
  isOpen,
  onClose,
  accountNumber,
}) => {
  const [rangePreset, setRangePreset] = useState<'30' | '60' | '90' | 'custom'>('30');
  const [startDate, setStartDate] = useState(
    new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const handlePreset = (days: number, key: '30' | '60' | '90') => {
    setRangePreset(key);
    setStartDate(new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
    setEndDate(new Date().toISOString().split('T')[0]);
  };

  const handleDownload = async () => {
    setLoading(true);
    setDownloadSuccess(false);

    try {
      const response = await api.get('/statements/download', {
        params: {
          startDate,
          endDate,
        },
        responseType: 'blob', // Crucial for PDF binary streams!
      });

      // Create browser blob download link
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `NovaPay_Statement_${accountNumber}_${startDate}_${endDate}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);

      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3000);
    } catch (err) {
      console.error('Download failed', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm"
          />

          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            className="relative z-10 w-full max-w-md bg-white/95 border border-slate-200/80 rounded-3xl p-6 sm:p-8 text-slate-800 shadow-2xl backdrop-blur-xl"
          >
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Account Statement</h3>
                  <p className="text-xs text-slate-500">QuestPDF Vector Document Engine</p>
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

            <div className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wider">
                  Quick Timeframes
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => handlePreset(30, '30')}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all ${
                      rangePreset === '30'
                        ? 'bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-500/20'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    Last 30 Days
                  </button>
                  <button
                    type="button"
                    onClick={() => handlePreset(60, '60')}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all ${
                      rangePreset === '60'
                        ? 'bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-500/20'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    Last 60 Days
                  </button>
                  <button
                    type="button"
                    onClick={() => handlePreset(90, '90')}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all ${
                      rangePreset === '90'
                        ? 'bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-500/20'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    Last 90 Days
                  </button>
                </div>
              </div>

              {/* Custom Date Pickers */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">From Date</label>
                  <div className="relative">
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => {
                        setStartDate(e.target.value);
                        setRangePreset('custom');
                      }}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">To Date</label>
                  <div className="relative">
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => {
                        setEndDate(e.target.value);
                        setRangePreset('custom');
                      }}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white"
                    />
                  </div>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs text-slate-600 space-y-1">
                <div className="flex items-center gap-1.5 text-slate-700 font-semibold">
                  <Calendar className="w-3.5 h-3.5 text-blue-600" />
                  <span>Report Includes:</span>
                </div>
                <p>• Opening Balance & Closing Balance</p>
                <p>• Total Credits (Inflow) & Total Debits (Outflow)</p>
                <p>• Itemized Double-Entry audit table with reference IDs</p>
              </div>

              <button
                type="button"
                onClick={handleDownload}
                disabled={loading}
                className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 disabled:opacity-50 transition-all"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Compiling PDF Document...</span>
                  </>
                ) : downloadSuccess ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                    <span>Downloaded Successfully!</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    <span>Download PDF Statement</span>
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
