import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowUpRight, 
  ArrowDownLeft, 
  ChevronLeft, 
  ChevronRight, 
  Copy, 
  Check, 
  CheckCircle2,
  Filter
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import type { TransactionHistoryItem, PagedResult } from '../types';

interface LedgerTableProps {
  data: PagedResult<TransactionHistoryItem> | null;
  loading: boolean;
  page: number;
  onPageChange: (newPage: number) => void;
  filterType: 'ALL' | 'Credit' | 'Debit';
  onFilterChange: (type: 'ALL' | 'Credit' | 'Debit') => void;
}

export const LedgerTable: React.FC<LedgerTableProps> = ({
  data,
  loading,
  page,
  onPageChange,
  filterType,
  onFilterChange,
}) => {
  const { t } = useLanguage();
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyRef = (refId: string) => {
    navigator.clipboard.writeText(refId);
    setCopiedId(refId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="bg-white/90 backdrop-blur-xl rounded-3xl p-6 border border-[oklch(88%_0.07_232.661/0.7)] shadow-xl shadow-slate-200/50 text-slate-800">
      {/* Table Header & Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 border-b border-slate-200/80">
        <div>
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <span>{t('immutableLedger')}</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-[oklch(96%_0.03_232.661)] text-[oklch(45%_0.17_232.661)] border border-[oklch(88%_0.07_232.661)] font-mono font-semibold">
              {t('doubleEntryBadge')}
            </span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">{t('verifiableAudit')}</p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 bg-slate-100/90 p-1 rounded-xl border border-slate-200/80 text-xs">
          <button
            type="button"
            onClick={() => onFilterChange('ALL')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
              filterType === 'ALL'
                ? 'bg-[oklch(52%_0.17_232.661)] text-white shadow-sm shadow-[oklch(52%_0.17_232.661/0.3)]'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {t('all')}
          </button>
          <button
            type="button"
            onClick={() => onFilterChange('Credit')}
            className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1 transition-all cursor-pointer ${
              filterType === 'Credit'
                ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/30'
                : 'text-slate-600 hover:text-emerald-700'
            }`}
          >
            <ArrowDownLeft className="w-3.5 h-3.5" />
            <span>{t('credits')}</span>
          </button>
          <button
            type="button"
            onClick={() => onFilterChange('Debit')}
            className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1 transition-all cursor-pointer ${
              filterType === 'Debit'
                ? 'bg-rose-600 text-white shadow-sm shadow-rose-600/30'
                : 'text-slate-600 hover:text-rose-700'
            }`}
          >
            <ArrowUpRight className="w-3.5 h-3.5 rtl:rotate-90" />
            <span>{t('debits')}</span>
          </button>
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto min-h-[300px] mt-2">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <div className="w-8 h-8 rounded-full border-2 border-[oklch(52%_0.17_232.661)] border-t-transparent animate-spin mb-3" />
            <p className="text-xs font-medium text-slate-500">{t('queryingLedger')}</p>
          </div>
        ) : !data || data.items.length === 0 ? (
          <div className="text-center py-20 text-slate-400">
            <Filter className="w-10 h-10 mx-auto mb-2 opacity-30 text-slate-400" />
            <p className="text-sm font-semibold text-slate-700">{t('noTransactions')}</p>
            <p className="text-xs text-slate-500 mt-1">{t('noTransactionsDesc')}</p>
          </div>
        ) : (
          <table className="w-full text-start text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200/80 text-[11px] uppercase tracking-wider text-slate-500 font-semibold bg-slate-50/70">
                <th className="py-3 px-3">{t('type')}</th>
                <th className="py-3 px-3">{t('descriptionRef')}</th>
                <th className="py-3 px-3">{t('amount')}</th>
                <th className="py-3 px-3">{t('balanceAfter')}</th>
                <th className="py-3 px-3">{t('date')}</th>
                <th className="py-3 px-3 text-end">{t('status')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.items.map((item) => {
                const isCredit = item.entryType === 'Credit' || (item.entryType as any) === 1 || (item.entryType as any) === '1';
                const isTopUp = item.transactionType === 'TopUp' || (item.transactionType as any) === 0 || (item.transactionType as any) === '0';

                return (
                  <motion.tr
                    key={item.ledgerEntryId}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="hover:bg-[oklch(98%_0.02_232.661)] transition-colors group"
                  >
                    {/* Direction / Type */}
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                            isCredit
                              ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                              : 'bg-rose-50 text-rose-600 border border-rose-200'
                          }`}
                        >
                          {isCredit ? (
                            <ArrowDownLeft className="w-4 h-4" />
                          ) : (
                            <ArrowUpRight className="w-4 h-4 rtl:rotate-90" />
                          )}
                        </div>
                        <span className="font-semibold text-slate-800">
                          {isTopUp ? t('stripeDeposit') : t('p2pTransfer')}
                        </span>
                      </div>
                    </td>

                    {/* Description & Reference */}
                    <td className="py-3 px-3">
                      <div>
                        <p className="font-medium text-slate-900 truncate max-w-[220px]">
                          {item.description || (isCredit ? t('receivedFunds') : t('sentFunds'))}
                        </p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="font-mono text-[10px] text-slate-500 truncate max-w-[130px]">
                            {item.referenceId}
                          </span>
                          <button
                            type="button"
                            onClick={() => copyRef(item.referenceId)}
                            className="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                            title={t('copyRefId')}
                          >
                            {copiedId === item.referenceId ? (
                              <Check className="w-3 h-3 text-emerald-600" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                      </div>
                    </td>

                    {/* Amount */}
                    <td className="py-3 px-3 font-mono font-bold text-sm">
                      <span dir="ltr" className={`inline-block ${isCredit ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {isCredit ? '+' : '-'}${item.amount.toFixed(2)}
                      </span>
                    </td>

                    {/* Balance After */}
                    <td className="py-3 px-3 font-mono text-slate-700 text-xs font-semibold">
                      <span dir="ltr">${item.balanceAfter.toFixed(2)}</span>
                    </td>

                    {/* Date */}
                    <td className="py-3 px-3 text-slate-500 whitespace-nowrap text-[11px]">
                      {new Date(item.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>

                    {/* Status */}
                    <td className="py-3 px-3 text-end">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>{t('completed')}</span>
                      </span>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination Footer */}
      {data && data.totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 mt-2 border-t border-slate-200/80 text-xs text-slate-500">
          <span>
            {t('page')} <span className="font-bold text-slate-900">{data.pageNumber}</span> {t('of')}{' '}
            <span className="font-bold text-slate-900">{data.totalPages}</span> ({data.totalCount} {t('entries')})
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={!data.hasPreviousPage}
              onClick={() => onPageChange(page - 1)}
              className="p-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed text-slate-700 shadow-xs transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4 rtl:rotate-180" />
            </button>
            <button
              type="button"
              disabled={!data.hasNextPage}
              onClick={() => onPageChange(page + 1)}
              className="p-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed text-slate-700 shadow-xs transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4 rtl:rotate-180" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
