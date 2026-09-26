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
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyRef = (refId: string) => {
    navigator.clipboard.writeText(refId);
    setCopiedId(refId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="glass-panel rounded-3xl p-6 border border-white/10 text-white shadow-xl">
      {/* Table Header & Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 border-b border-white/10">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <span>Immutable Ledger Activity</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 font-mono font-medium">
              Double-Entry
            </span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">Live verifiable audit entries for your account</p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 bg-slate-900/80 p-1 rounded-xl border border-white/10 text-xs">
          <button
            type="button"
            onClick={() => onFilterChange('ALL')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
              filterType === 'ALL'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            All
          </button>
          <button
            type="button"
            onClick={() => onFilterChange('Credit')}
            className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1 transition-all ${
              filterType === 'Credit'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-400 hover:text-emerald-400'
            }`}
          >
            <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-400" />
            <span>Credits</span>
          </button>
          <button
            type="button"
            onClick={() => onFilterChange('Debit')}
            className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1 transition-all ${
              filterType === 'Debit'
                ? 'bg-rose-600 text-white shadow-md'
                : 'text-slate-400 hover:text-rose-400'
            }`}
          >
            <ArrowUpRight className="w-3.5 h-3.5 text-rose-400" />
            <span>Debits</span>
          </button>
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto min-h-[300px] mt-2">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <div className="w-8 h-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin mb-3" />
            <p className="text-xs font-medium">Querying Ledger Entries...</p>
          </div>
        ) : !data || data.items.length === 0 ? (
          <div className="text-center py-20 text-slate-500">
            <Filter className="w-10 h-10 mx-auto mb-2 opacity-30" />
            <p className="text-sm font-semibold">No transactions found</p>
            <p className="text-xs text-slate-500 mt-1">Make a Stripe deposit or send funds to start your ledger.</p>
          </div>
        ) : (
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-white/5 text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
                <th className="py-3 px-3">Type</th>
                <th className="py-3 px-3">Description / Reference</th>
                <th className="py-3 px-3">Amount</th>
                <th className="py-3 px-3">Balance After</th>
                <th className="py-3 px-3">Date</th>
                <th className="py-3 px-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {data.items.map((item) => {
                const isCredit = item.entryType === 'Credit' || (item.entryType as any) === 1 || (item.entryType as any) === '1';
                const isTopUp = item.transactionType === 'TopUp' || (item.transactionType as any) === 0 || (item.transactionType as any) === '0';

                return (
                  <motion.tr
                    key={item.ledgerEntryId}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="hover:bg-white/[0.02] transition-colors group"
                  >
                    {/* Direction / Type */}
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                            isCredit
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                          }`}
                        >
                          {isCredit ? (
                            <ArrowDownLeft className="w-4 h-4" />
                          ) : (
                            <ArrowUpRight className="w-4 h-4" />
                          )}
                        </div>
                        <span className="font-semibold text-slate-200">
                          {isTopUp ? 'Stripe Deposit' : 'P2P Transfer'}
                        </span>
                      </div>
                    </td>

                    {/* Description & Reference */}
                    <td className="py-3 px-3">
                      <div>
                        <p className="font-medium text-slate-200 truncate max-w-[220px]">
                          {item.description || (isCredit ? 'Received Funds' : 'Sent Funds')}
                        </p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="font-mono text-[10px] text-slate-500 truncate max-w-[130px]">
                            {item.referenceId}
                          </span>
                          <button
                            type="button"
                            onClick={() => copyRef(item.referenceId)}
                            className="text-slate-500 hover:text-slate-300 transition-colors"
                            title="Copy reference ID"
                          >
                            {copiedId === item.referenceId ? (
                              <Check className="w-3 h-3 text-emerald-400" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                      </div>
                    </td>

                    {/* Amount */}
                    <td className="py-3 px-3 font-mono font-bold text-sm">
                      <span className={isCredit ? 'text-emerald-400' : 'text-rose-400'}>
                        {isCredit ? '+' : '-'}${item.amount.toFixed(2)}
                      </span>
                    </td>

                    {/* Balance After */}
                    <td className="py-3 px-3 font-mono text-slate-300 text-xs">
                      ${item.balanceAfter.toFixed(2)}
                    </td>

                    {/* Date */}
                    <td className="py-3 px-3 text-slate-400 whitespace-nowrap text-[11px]">
                      {new Date(item.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>

                    {/* Status */}
                    <td className="py-3 px-3 text-right">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Completed</span>
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
        <div className="flex items-center justify-between pt-4 mt-2 border-t border-white/5 text-xs text-slate-400">
          <span>
            Page <span className="font-bold text-white">{data.pageNumber}</span> of{' '}
            <span className="font-bold text-white">{data.totalPages}</span> ({data.totalCount} entries)
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={!data.hasPreviousPage}
              onClick={() => onPageChange(page - 1)}
              className="p-1.5 rounded-lg bg-slate-900 border border-white/10 hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed text-white transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              disabled={!data.hasNextPage}
              onClick={() => onPageChange(page + 1)}
              className="p-1.5 rounded-lg bg-slate-900 border border-white/10 hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed text-white transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
