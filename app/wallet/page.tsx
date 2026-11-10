'use client';

import React from 'react';
import Link from 'next/link';
import { Wallet, Activity, Trophy, Gift, UserCheck } from 'lucide-react';
import { useWallet } from '@/context/WalletContext';
import { useBetSlip } from '@/context/BetSlipContext';
import { DepositFormPanel } from '@/components/wallet/DepositModal';
import { TransactionList } from '@/components/wallet/TransactionList';

export default function WalletPage() {
  const { balance, bonusBalance, lifetimeWinnings, userProfile } = useWallet();
  const { inPlayExposure } = useBetSlip();

  return (
    <main className="max-w-7xl mx-auto px-3 sm:px-6 pt-3 sm:pt-4 space-y-5">
      {/* Compact Account & Balance Strip */}
      <section className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-3.5">
        <div className="rounded-2xl bg-white dark:bg-[#1E2638] border border-slate-200 dark:border-[#2A344B] p-4 space-y-1 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-[#94A3B8]">
            <span>Cash Balance</span>
            <Wallet className="w-4 h-4 text-emerald-600 dark:text-[#00E676]" />
          </div>
          <div className="font-mono tabular-nums text-lg sm:text-2xl font-extrabold text-slate-900 dark:text-white">
            {balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}{' '}
            <span className="text-xs text-emerald-600 dark:text-[#00E676]">ETB</span>
          </div>
        </div>

        <div className="rounded-2xl bg-white dark:bg-[#1E2638] border border-slate-200 dark:border-[#2A344B] p-4 space-y-1 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-[#94A3B8]">
            <span>Bonus Balance</span>
            <Gift className="w-4 h-4 text-emerald-600 dark:text-[#00E676]" />
          </div>
          <div className="font-mono tabular-nums text-lg sm:text-2xl font-extrabold text-emerald-600 dark:text-[#00E676]">
            {bonusBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}{' '}
            <span className="text-xs">ETB</span>
          </div>
        </div>

        <div className="rounded-2xl bg-white dark:bg-[#1E2638] border border-slate-200 dark:border-[#2A344B] p-4 space-y-1 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-[#94A3B8]">
            <span>In-Play Stake</span>
            <Activity className="w-4 h-4 text-amber-500 dark:text-amber-400" />
          </div>
          <div className="font-mono tabular-nums text-lg sm:text-2xl font-extrabold text-slate-900 dark:text-white">
            {inPlayExposure.toLocaleString('en-US', { minimumFractionDigits: 2 })}{' '}
            <span className="text-xs text-amber-500 dark:text-amber-400">ETB</span>
          </div>
        </div>

        <div className="rounded-2xl bg-white dark:bg-[#1E2638] border border-slate-200 dark:border-[#2A344B] p-4 space-y-1 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-[#94A3B8]">
            <span>Total Won</span>
            <Trophy className="w-4 h-4 text-[#22C55E]" />
          </div>
          <div className="font-mono tabular-nums text-lg sm:text-2xl font-extrabold text-[#22C55E]">
            +{lifetimeWinnings.toLocaleString('en-US', { minimumFractionDigits: 0 })}{' '}
            <span className="text-xs">ETB</span>
          </div>
        </div>
      </section>

      {/* Quick Profile Link Bar */}
      <div className="rounded-xl bg-white dark:bg-[#121721] border border-slate-200 dark:border-[#2A344B] px-4 py-2.5 flex flex-wrap items-center justify-between gap-2 text-xs shadow-xs">
        <div className="flex items-center gap-2 text-slate-600 dark:text-[#94A3B8]">
          <UserCheck className="w-4 h-4 text-emerald-600 dark:text-[#00E676] shrink-0" />
          <span>
            Account:{' '}
            <strong className="text-slate-900 dark:text-white">
              {userProfile.fullName}
            </strong>{' '}
            ({userProfile.phone}) · {userProfile.vipTier}
          </span>
        </div>
        <Link
          href="/profile"
          className="font-semibold text-emerald-600 dark:text-[#00E676] hover:underline"
        >
          Manage Profile →
        </Link>
      </div>

      <DepositFormPanel />

      <TransactionList />
    </main>
  );
}
