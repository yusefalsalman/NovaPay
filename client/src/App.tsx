import React, { useState, useEffect, useCallback } from 'react';
import { 
  ArrowUpRight, 
  PlusCircle, 
  Receipt, 
  SlidersHorizontal, 
  Scale, 
  Database, 
  KeyRound
} from 'lucide-react';
import { CyberBackground } from './components/CyberBackground';
import { Navbar } from './components/Navbar';
import { VirtualCard } from './components/VirtualCard';
import { TransferModal } from './components/TransferModal';
import { DepositModal } from './components/DepositModal';
import { StatementDownloadModal } from './components/StatementDownloadModal';
import { AiAdvisorDrawer } from './components/AiAdvisorDrawer';
import { LedgerTable } from './components/LedgerTable';
import { AnalyticsChart } from './components/AnalyticsChart';
import { AuthScreen } from './components/AuthScreen';
import { useLanguage } from './context/LanguageContext';
import { api } from './lib/api';
import type { User, TransactionHistoryItem, PagedResult } from './types';

export const App: React.FC = () => {
  const { t } = useLanguage();
  // Auth state
  const [token, setToken] = useState<string | null>(localStorage.getItem('novapay_token'));
  const [user, setUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem('novapay_user');
      if (!saved || saved === 'undefined' || saved === 'null') return null;
      const parsed = JSON.parse(saved);
      return parsed && typeof parsed === 'object' ? parsed : null;
    } catch {
      localStorage.removeItem('novapay_user');
      return null;
    }
  });

  // Modal states
  const [isTransferOpen, setIsTransferOpen] = useState(false);
  const [isDepositOpen, setIsDepositOpen] = useState(false);
  const [isStatementOpen, setIsStatementOpen] = useState(false);
  const [isAiOpen, setIsAiOpen] = useState(false);

  // Ledger query states
  const [historyPage, setHistoryPage] = useState(1);
  const [filterType, setFilterType] = useState<'ALL' | 'Credit' | 'Debit'>('ALL');
  const [ledgerData, setLedgerData] = useState<PagedResult<TransactionHistoryItem> | null>(null);
  const [loadingLedger, setLoadingLedger] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Sync fresh profile from /auth/me
  const fetchFreshProfile = useCallback(async () => {
    try {
      setRefreshing(true);
      const res = await api.get<any>('/auth/me');
      const data = res.data;

      const updatedUser: User = {
        id: data.id || data.userId || data.UserId || '',
        fullName: data.fullName || data.FullName || data.name || data.Name || data.email || 'NovaPay User',
        email: data.email || data.Email || '',
        createdAt: data.createdAt || new Date().toISOString(),
        wallet: data.wallet ? {
          id: data.wallet.id || '',
          accountNumber: data.wallet.accountNumber || 'NP-2026-000000',
          balance: Number(data.wallet.balance ?? 0),
          currency: data.wallet.currency || 'USD',
        } : {
          id: '',
          accountNumber: data.accountNumber || data.AccountNumber || 'NP-2026-000000',
          balance: Number(data.balance ?? 0),
          currency: data.currency || 'USD',
        },
      };

      setUser(updatedUser);
      localStorage.setItem('novapay_user', JSON.stringify(updatedUser));
    } catch (err) {
      console.error('Failed to load profile', err);
    } finally {
      setRefreshing(false);
    }
  }, []);

  // Fetch transaction history
  const fetchHistory = useCallback(async (page: number, type: 'ALL' | 'Credit' | 'Debit') => {
    setLoadingLedger(true);
    try {
      const params: any = {
        pageNumber: page,
        pageSize: 8,
      };

      if (type !== 'ALL') {
        params.type = type;
      }

      const res = await api.get<PagedResult<TransactionHistoryItem>>('/transactions', { params });
      setLedgerData(res.data);
    } catch (err) {
      console.error('Failed to fetch transactions', err);
    } finally {
      setLoadingLedger(false);
    }
  }, []);

  useEffect(() => {
    if (token) {
      fetchFreshProfile();
      fetchHistory(historyPage, filterType);
    }
  }, [token, historyPage, filterType, fetchFreshProfile, fetchHistory]);

  const handleLogout = () => {
    localStorage.removeItem('novapay_token');
    localStorage.removeItem('novapay_user');
    setToken(null);
    setUser(null);
  };

  const handleTransferSuccess = (newBalance: number) => {
    if (user && user.wallet) {
      setUser({
        ...user,
        wallet: {
          ...user.wallet,
          balance: newBalance,
        },
      });
    }
    fetchFreshProfile();
    fetchHistory(1, filterType);
  };

  const handleDepositSuccess = () => {
    fetchFreshProfile();
    fetchHistory(1, filterType);
  };

  // If unauthenticated, show Auth Screen
  if (!token || !user) {
    return (
      <main className="relative min-h-screen bg-white overflow-hidden">
        <CyberBackground />
        <AuthScreen
          onAuthSuccess={(data) => {
            setToken(data.token);
            setUser({
              id: data.user?.id || '',
              fullName: data.fullName || data.user?.fullName || '',
              email: data.email || data.user?.email || '',
              createdAt: new Date().toISOString(),
              wallet: {
                id: data.user?.id || '',
                accountNumber: data.accountNumber || data.user?.accountNumber || 'NP-2026-000000',
                currency: 'USD',
                balance: data.balance ?? data.user?.balance ?? 0,
              },
            });
            fetchFreshProfile();
          }}
        />
      </main>
    );
  }

  const currentBalance = user.wallet?.balance ?? 0;
  const currentCurrency = user.wallet?.currency ?? 'USD';
  const currentAccount = user.wallet?.accountNumber ?? 'NP-2026-••••••';

  return (
    <div className="relative min-h-screen bg-white text-slate-900 flex flex-col">
      <CyberBackground />

      <Navbar
        user={user}
        onLogout={handleLogout}
        onOpenAi={() => setIsAiOpen(true)}
        onRefresh={() => {
          fetchFreshProfile();
          fetchHistory(historyPage, filterType);
        }}
        refreshing={refreshing}
      />

      {/* Main Container */}
      <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto px-4 sm:px-8 py-8 space-y-8">
        {/* Top Hero Section: Virtual 3D Card + Quick Action Deck */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Virtual Card (Left 5 Cols) */}
          <div className="lg:col-span-5 flex flex-col justify-center">
            <VirtualCard
              cardHolder={user?.fullName || user?.email || 'NovaPay User'}
              accountNumber={currentAccount}
              balance={currentBalance}
              currency={currentCurrency}
            />
          </div>

          {/* Action Deck & Platform Metrics (Right 7 Cols) */}
          <div className="lg:col-span-7 flex flex-col justify-between space-y-4">
            {/* Quick Actions Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {/* Send Funds */}
              <button
                type="button"
                onClick={() => setIsTransferOpen(true)}
                className="bg-white/95 backdrop-blur-md border border-[oklch(88%_0.07_232.661/0.7)] p-4 rounded-2xl flex flex-col items-center text-center group cursor-pointer shadow-xs hover:shadow-md hover:border-[oklch(74.6%_0.16_232.661)] hover:scale-[1.02] transition-all"
              >
                <div className="w-11 h-11 rounded-xl bg-[oklch(96%_0.03_232.661)] text-[oklch(50%_0.17_232.661)] border border-[oklch(85%_0.08_232.661)] flex items-center justify-center mb-2.5 group-hover:scale-110 transition-transform">
                  <ArrowUpRight className="w-5 h-5 rtl:rotate-90" />
                </div>
                <span className="text-xs font-bold text-slate-900">{t('transfer')}</span>
                <span className="text-[10px] text-slate-500 mt-0.5">{t('instantP2P')}</span>
              </button>

              {/* Stripe Deposit */}
              <button
                type="button"
                onClick={() => setIsDepositOpen(true)}
                className="bg-white/95 backdrop-blur-md border border-[oklch(88%_0.07_232.661/0.7)] p-4 rounded-2xl flex flex-col items-center text-center group cursor-pointer shadow-xs hover:shadow-md hover:border-emerald-400 hover:scale-[1.02] transition-all"
              >
                <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mb-2.5 group-hover:scale-110 transition-transform">
                  <PlusCircle className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-slate-900">{t('deposit')}</span>
                <span className="text-[10px] text-slate-500 mt-0.5">{t('cardGateway')}</span>
              </button>

              {/* PDF Statement */}
              <button
                type="button"
                onClick={() => setIsStatementOpen(true)}
                className="bg-white/95 backdrop-blur-md border border-[oklch(88%_0.07_232.661/0.7)] p-4 rounded-2xl flex flex-col items-center text-center group cursor-pointer shadow-xs hover:shadow-md hover:border-sky-400 hover:scale-[1.02] transition-all"
              >
                <div className="w-11 h-11 rounded-xl bg-sky-50 text-sky-600 border border-sky-200 flex items-center justify-center mb-2.5 group-hover:scale-110 transition-transform">
                  <Receipt className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-slate-900">{t('statement')}</span>
                <span className="text-[10px] text-slate-500 mt-0.5">{t('vectorPdf')}</span>
              </button>

              {/* Ledger Intelligence */}
              <button
                type="button"
                onClick={() => setIsAiOpen(true)}
                className="bg-white/95 backdrop-blur-md border border-[oklch(88%_0.07_232.661/0.7)] p-4 rounded-2xl flex flex-col items-center text-center group cursor-pointer shadow-xs hover:shadow-md hover:border-[oklch(74.6%_0.16_232.661)] hover:scale-[1.02] transition-all"
              >
                <div className="w-11 h-11 rounded-xl bg-[oklch(96%_0.03_232.661)] text-[oklch(50%_0.17_232.661)] border border-[oklch(85%_0.08_232.661)] flex items-center justify-center mb-2.5 group-hover:scale-110 transition-transform">
                  <SlidersHorizontal className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-slate-900">{t('analytics')}</span>
                <span className="text-[10px] text-slate-500 mt-0.5">{t('riskVelocity')}</span>
              </button>
            </div>

            {/* Platform Security & Concurrency Badges */}
            <div className="bg-white/95 backdrop-blur-md rounded-2xl p-4 border border-[oklch(88%_0.07_232.661/0.7)] shadow-xs grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center shrink-0">
                  <Scale className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-bold text-slate-900 leading-tight">{t('doubleEntryBadge')}</p>
                  <p className="text-[10px] text-slate-500">{t('doubleEntryDesc')}</p>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[oklch(96%_0.03_232.661)] border border-[oklch(85%_0.08_232.661)] text-[oklch(45%_0.16_232.661)] flex items-center justify-center shrink-0">
                  <Database className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-bold text-slate-900 leading-tight">{t('concurrencySafe')}</p>
                  <p className="text-[10px] text-slate-500">{t('concurrencySafeDesc')}</p>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-purple-50 border border-purple-200 text-purple-600 flex items-center justify-center shrink-0">
                  <KeyRound className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-bold text-slate-900 leading-tight">{t('stripeIdempotent')}</p>
                  <p className="text-[10px] text-slate-500">{t('stripeIdempotentDesc')}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Analytics Section */}
        <AnalyticsChart
          items={ledgerData?.items || []}
          currency={currentCurrency}
        />

        {/* Ledger History Feed */}
        <LedgerTable
          data={ledgerData}
          loading={loadingLedger}
          page={historyPage}
          onPageChange={(newPage) => setHistoryPage(newPage)}
          filterType={filterType}
          onFilterChange={(newFilter) => {
            setFilterType(newFilter);
            setHistoryPage(1);
          }}
        />
      </main>

      {/* Modals & Slide-overs */}
      <TransferModal
        isOpen={isTransferOpen}
        onClose={() => setIsTransferOpen(false)}
        userBalance={currentBalance}
        currency={currentCurrency}
        onSuccess={handleTransferSuccess}
      />

      <DepositModal
        isOpen={isDepositOpen}
        onClose={() => setIsDepositOpen(false)}
        currency={currentCurrency}
        onDepositSuccess={handleDepositSuccess}
      />

      <StatementDownloadModal
        isOpen={isStatementOpen}
        onClose={() => setIsStatementOpen(false)}
        accountNumber={currentAccount}
      />

      <AiAdvisorDrawer
        isOpen={isAiOpen}
        onClose={() => setIsAiOpen(false)}
        userBalance={currentBalance}
        transactions={ledgerData?.items || []}
      />
    </div>
  );
};

export default App;
