import React from 'react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer,
  CartesianGrid
} from 'recharts';
import { TrendingUp, ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import type { TransactionHistoryItem } from '../types';

interface AnalyticsChartProps {
  items: TransactionHistoryItem[];
  currency: string;
}

export const AnalyticsChart: React.FC<AnalyticsChartProps> = ({ items, currency }) => {
  // Aggregate transactions by date for the chart
  const chartData = React.useMemo(() => {
    if (!items || items.length === 0) {
      return [
        { name: 'Day 1', balance: 0 },
        { name: 'Day 2', balance: 0 },
      ];
    }

    // Sort chronologically
    const sorted = [...items].sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );

    return sorted.map((t) => ({
      name: new Date(t.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      balance: t.balanceAfter,
      amount: t.amount,
      type: t.entryType,
    }));
  }, [items]);

  const totalCredits = items
    .filter((i) => i.entryType === 'Credit' || (i.entryType as any) === 1 || (i.entryType as any) === '1')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const totalDebits = items
    .filter((i) => i.entryType === 'Debit' || (i.entryType as any) === 0 || (i.entryType as any) === '0')
    .reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <div className="glass-panel rounded-3xl p-6 border border-white/10 text-white shadow-xl flex flex-col justify-between">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-indigo-400" />
            <span>Balance & Cash Flow Dynamics</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">Real-time ledger curve</p>
        </div>

        {/* Mini stats */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
            <ArrowDownLeft className="w-3.5 h-3.5" />
            <span>+${totalCredits.toFixed(2)}</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>-${totalDebits.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="h-44 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="balanceGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff0a" vertical={false} />
            <XAxis 
              dataKey="name" 
              stroke="#64748b" 
              fontSize={10}
              tickLine={false}
              axisLine={false}
            />
            <YAxis 
              stroke="#64748b" 
              fontSize={10} 
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `$${v}`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#0f172a',
                borderColor: 'rgba(255,255,255,0.1)',
                borderRadius: '12px',
                fontSize: '12px',
                color: '#fff',
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)',
              }}
              formatter={(value: any) => [`$${Number(value).toFixed(2)} ${currency}`, 'Balance After']}
            />
            <Area
              type="monotone"
              dataKey="balance"
              stroke="#6366f1"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#balanceGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
