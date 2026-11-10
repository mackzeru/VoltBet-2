'use client';

import React from 'react';
import { Wallet, Activity, Trophy } from 'lucide-react';
import { useWallet } from '@/context/WalletContext';
import { useBetSlip } from '@/context/BetSlipContext';
import { DepositFormPanel } from '@/components/wallet/DepositModal';
import { TransactionList } from '@/components/wallet/TransactionList';

export default function WalletPage() {
  const { balance, lifetimeWinnings } = useWallet();
  const { inPlayExposure } = useBetSlip();

  return (
    <main className="max-w-7xl mx-auto px-3 sm:px-6 pt-4 space-y-6">
      {/* Top 3 Balance Summary Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl bg-[#1E2638] border border-[#2A344B] p-4 sm:p-5 space-y-1.5">
          <div className="flex items-center justify-between text-xs text-[#94A3B8]">
            <span>Total Available Balance</span>
            <Wallet className="w-4 h-4 text-[#00E676]" />
          </div>
          <div className="font-mono tabular-nums text-2xl sm:text-3xl font-extrabold text-white">
            {balance.toLocaleString('en-US', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}{' '}
            <span className="text-base text-[#00E676]">ETB</span>
          </div>
          <p className="text-[11px] text-[#94A3B8]">
            Instant settlement enabled via Telebirr & CBE Birr
          </p>
        </div>

        <div className="rounded-2xl bg-[#1E2638] border border-[#2A344B] p-4 sm:p-5 space-y-1.5">
          <div className="flex items-center justify-between text-xs text-[#94A3B8]">
            <span>Total In-Play Bets</span>
            <Activity className="w-4 h-4 text-amber-400" />
          </div>
          <div className="font-mono tabular-nums text-2xl sm:text-3xl font-extrabold text-white">
            {inPlayExposure.toLocaleString('en-US', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}{' '}
            <span className="text-base text-amber-400">ETB</span>
          </div>
          <p className="text-[11px] text-[#94A3B8]">
            Active stake exposure across open single & parlay slips
          </p>
        </div>

        <div className="rounded-2xl bg-[#1E2638] border border-[#2A344B] p-4 sm:p-5 space-y-1.5">
          <div className="flex items-center justify-between text-xs text-[#94A3B8]">
            <span>Total Lifetime Winnings</span>
            <Trophy className="w-4 h-4 text-[#22C55E]" />
          </div>
          <div className="font-mono tabular-nums text-2xl sm:text-3xl font-extrabold text-[#00E676]">
            +{lifetimeWinnings.toLocaleString('en-US', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}{' '}
            <span className="text-base">ETB</span>
          </div>
          <p className="text-[11px] text-[#94A3B8]">
            Cumulative settled payouts & early cashouts
          </p>
        </div>
      </section>

      {/* Screenshot Deposit Workflow */}
      <DepositFormPanel />

      {/* Deposit Audit Log & Admin Simulator */}
      <TransactionList />
    </main>
  );
}
