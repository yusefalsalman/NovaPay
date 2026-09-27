import React, { useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { Wifi, Copy, Check, Eye, EyeOff } from 'lucide-react';
import { NovaLogo } from './NovaLogo';
import { useLanguage } from '../context/LanguageContext';

interface VirtualCardProps {
  cardHolder: string;
  accountNumber: string;
  balance: number;
  currency: string;
}

export const VirtualCard: React.FC<VirtualCardProps> = ({
  cardHolder,
  accountNumber,
  balance,
  currency,
}) => {
  const { t } = useLanguage();
  const [copied, setCopied] = useState(false);
  const [showBalance, setShowBalance] = useState(true);

  // 3D Tilt Motion Values
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, { stiffness: 180, damping: 20 });
  const mouseYSpring = useSpring(y, { stiffness: 180, damping: 20 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ['14deg', '-14deg']);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ['-16deg', '16deg']);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    x.set(mouseX / rect.width - 0.5);
    y.set(mouseY / rect.height - 0.5);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  const copyAccount = () => {
    navigator.clipboard.writeText(accountNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ perspective: '1200px' }} className="w-full max-w-[420px] mx-auto py-1 sm:py-2">
      <motion.div
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          rotateX,
          rotateY,
          transformStyle: 'preserve-3d',
        }}
        whileHover={{ scale: 1.02 }}
        transition={{ duration: 0.2 }}
        className="relative min-h-[210px] sm:h-60 w-full rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-2xl shadow-[oklch(74.6%_0.16_232.661/0.25)] overflow-hidden cursor-pointer select-none card-gradient-blue border border-[oklch(74.6%_0.16_232.661/0.4)] flex flex-col justify-between"
      >
        {/* Holographic light sweep overlay */}
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/15 to-transparent pointer-events-none opacity-70" />

        {/* Ambient glow accent */}
        <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-[oklch(74.6%_0.16_232.661/0.3)] blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col justify-between h-full text-white space-y-3 sm:space-y-0">
          {/* Top Row: Brand & Chip */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 sm:gap-3">
              <div className="w-9 h-6 sm:w-10 sm:h-7 rounded bg-amber-400/95 border border-amber-200/60 shadow-inner flex items-center justify-center">
                <div className="w-7 h-3.5 sm:w-8 sm:h-4 border border-amber-800/40 rounded-sm grid grid-cols-2 gap-0.5" />
              </div>
              <Wifi className="w-4 h-4 sm:w-5 sm:h-5 text-white/90 rotate-90" />
            </div>

            <div className="flex items-center gap-1.5 bg-black/25 backdrop-blur-md px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full border border-white/20 text-[10px] sm:text-xs font-semibold tracking-wider text-emerald-300 shadow-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>{t('activeLedger')}</span>
            </div>
          </div>

          {/* Middle: Live Balance */}
          <div className="my-auto py-1 sm:py-0">
            <div className="flex items-center gap-2 text-xs font-medium text-sky-100 tracking-wide">
              <span>{t('availableBalance')}</span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowBalance(!showBalance);
                }}
                className="hover:text-white transition-colors cursor-pointer"
              >
                {showBalance ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
            <div dir="ltr" className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-0.5 text-white flex items-baseline gap-1 justify-start">
              <span>$</span>
              <span>
                {showBalance ? balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '••••••'}
              </span>
              <span className="text-xs sm:text-sm font-semibold text-sky-200/90 ml-1">{currency}</span>
            </div>
          </div>

          {/* Bottom Row: Account Number & Cardholder */}
          <div className="flex items-end justify-between pt-1 sm:pt-2">
            <div>
              <p className="text-[9px] sm:text-[10px] uppercase font-bold text-sky-200/80 tracking-wider">{t('accountNumber')}</p>
              <div dir="ltr" className="flex items-center gap-1.5 sm:gap-2 mt-0.5">
                <span className="font-mono text-xs sm:text-sm tracking-wider font-semibold text-white/95">
                  {accountNumber || 'NP-2026-••••••'}
                </span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    copyAccount();
                  }}
                  className="p-1 rounded-lg hover:bg-white/20 text-white/90 transition-colors cursor-pointer"
                  title={t('copyAccount')}
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
              <p className="text-[11px] sm:text-xs font-medium text-white/90 mt-0.5 sm:mt-1 uppercase tracking-wide truncate max-w-[170px] sm:max-w-none">
                {cardHolder || 'User Name'}
              </p>
            </div>

            {/* NovaPay Logo Mark */}
            <div dir="ltr" className="flex items-center gap-1 sm:gap-1.5 shrink-0">
              <NovaLogo className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="text-sm sm:text-base font-black tracking-tighter">
                Nova<span className="text-[oklch(74.6%_0.16_232.661)]">Pay</span>
              </span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
