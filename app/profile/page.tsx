'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  Award,
  Gift,
  LogOut,
  LogIn,
  Wallet,
  ArrowUpRight,
  Sliders,
  Users,
  CheckCircle2,
  Sun,
  Moon,
  Monitor,
} from 'lucide-react';
import { useWallet, DEMO_ACCOUNT_PRESETS } from '@/context/WalletContext';
import { useBetSlip } from '@/context/BetSlipContext';
import { useTheme, ThemeMode } from '@/context/ThemeContext';

export default function ProfilePage() {
  const {
    isAuthenticated,
    setIsAuthModalOpen,
    userProfile,
    balance,
    bonusBalance,
    lifetimeWinnings,
    claimDailyBonus,
    switchDemoAccount,
    logout,
    updateProfilePreferences,
  } = useWallet();

  const { placedBets, inPlayExposure, setMultiStake } = useBetSlip();
  const { themeMode, setThemeMode } = useTheme();
  const [bonusToast, setBonusToast] = useState<string | null>(null);

  const totalBets = placedBets.length;
  const wonBets = placedBets.filter(
    (b) => b.status === 'WON' || b.status === 'CASHED_OUT'
  ).length;
  const winRate = totalBets > 0 ? Math.round((wonBets / totalBets) * 100) : 68;
  const vipProgress = Math.min(100, Math.round((userProfile.vipPoints / 10000) * 100));

  const handleClaimBonus = () => {
    claimDailyBonus();
    setBonusToast('+500.00 ETB VIP Reload Bonus credited!');
    setTimeout(() => setBonusToast(null), 3000);
  };

  if (!isAuthenticated) {
    return (
      <main className="max-w-3xl mx-auto px-3 sm:px-6 pt-8">
        <div className="rounded-2xl bg-white dark:bg-[#1E2638] border border-slate-200 dark:border-[#2A344B] p-8 text-center space-y-4 shadow-xs">
          <div className="w-14 h-14 rounded-2xl bg-[#00E676]/15 border border-[#00E676]/40 flex items-center justify-center mx-auto text-emerald-600 dark:text-[#00E676]">
            <LogIn className="w-7 h-7" />
          </div>
          <h1 className="font-display text-xl font-bold text-slate-900 dark:text-white">
            Sign In to Your VoltBet Account
          </h1>
          <p className="text-xs text-slate-600 dark:text-[#94A3B8] max-w-md mx-auto">
            Access your ETB wallet, VIP cashback rewards, active parlay slips, and instant Telebirr withdrawals.
          </p>
          <button
            type="button"
            onClick={() => setIsAuthModalOpen(true)}
            className="min-h-[44px] px-6 py-2.5 rounded-xl bg-[#00E676] hover:bg-[#00C853] text-[#0B0E14] text-xs sm:text-sm font-bold cursor-pointer"
          >
            Sign In / Switch Demo Account
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-5xl mx-auto px-3 sm:px-6 pt-3 sm:pt-4 space-y-5">
      {/* Top User Identity & VIP Card */}
      <section className="rounded-2xl bg-white dark:bg-[#1E2638] border border-slate-200 dark:border-[#2A344B] p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
        <div className="flex items-center gap-4 min-w-0">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center font-display text-xl font-extrabold text-[#0B0E14] shrink-0"
            style={{ backgroundColor: userProfile.avatarColor }}
          >
            {userProfile.fullName
              .split(' ')
              .map((n) => n[0])
              .join('')}
          </div>

          <div className="min-w-0 space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-display text-lg sm:text-xl font-bold text-slate-900 dark:text-white truncate">
                {userProfile.fullName}
              </h1>
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-[#00E676]">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>{userProfile.kycVerified ? 'KYC Verified' : 'Unverified'}</span>
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-[#94A3B8] font-mono">
              <span>@{userProfile.username}</span>
              <span aria-hidden="true">·</span>
              <span>{userProfile.phone}</span>
              <span aria-hidden="true">·</span>
              <span>Joined {userProfile.joinedDate}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setIsAuthModalOpen(true)}
            className="min-h-[40px] px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-[#121721] hover:bg-slate-200 dark:hover:bg-[#1A2232] border border-slate-200 dark:border-[#2A344B] text-xs font-semibold text-slate-900 dark:text-white inline-flex items-center gap-1.5 cursor-pointer"
          >
            <Users className="w-3.5 h-3.5 text-emerald-600 dark:text-[#00E676]" />
            <span>Switch User</span>
          </button>

          <button
            type="button"
            onClick={logout}
            className="min-h-[40px] px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-[#121721] hover:bg-red-500/15 border border-slate-200 dark:border-[#2A344B] text-xs font-semibold text-slate-600 dark:text-[#94A3B8] hover:text-[#EF4444] inline-flex items-center gap-1.5 cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </section>

      {bonusToast && (
        <div className="rounded-xl bg-[#00E676]/15 border border-[#00E676]/40 p-3 flex items-center gap-2 text-xs font-semibold text-emerald-700 dark:text-[#00E676]">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{bonusToast}</span>
        </div>
      )}

      {/* Balance & Portfolio Breakdown Grid */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-3.5">
        <div className="rounded-2xl bg-white dark:bg-[#1E2638] border border-slate-200 dark:border-[#2A344B] p-4 space-y-1 shadow-xs">
          <span className="text-xs text-slate-500 dark:text-[#94A3B8] block">
            Withdrawable Cash
          </span>
          <span className="font-mono tabular-nums text-lg sm:text-2xl font-extrabold text-slate-900 dark:text-white block">
            {balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}{' '}
            <span className="text-xs text-emerald-600 dark:text-[#00E676]">ETB</span>
          </span>
          <Link
            href="/wallet"
            className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-[#00E676] hover:underline pt-1"
          >
            <Wallet className="w-3 h-3" />
            <span>Deposit / Withdraw</span>
            <ArrowUpRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="rounded-2xl bg-white dark:bg-[#1E2638] border border-slate-200 dark:border-[#2A344B] p-4 space-y-1 shadow-xs">
          <span className="text-xs text-slate-500 dark:text-[#94A3B8] block">
            Bonus / Free Bets
          </span>
          <span className="font-mono tabular-nums text-lg sm:text-2xl font-extrabold text-emerald-600 dark:text-[#00E676] block">
            {bonusBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}{' '}
            <span className="text-xs">ETB</span>
          </span>
          <button
            type="button"
            onClick={handleClaimBonus}
            className="inline-flex items-center gap-1 text-xs font-semibold text-amber-500 dark:text-amber-400 hover:underline pt-1 cursor-pointer"
          >
            <Gift className="w-3 h-3" />
            <span>Claim +500 ETB Reload</span>
          </button>
        </div>

        <div className="rounded-2xl bg-white dark:bg-[#1E2638] border border-slate-200 dark:border-[#2A344B] p-4 space-y-1 shadow-xs">
          <span className="text-xs text-slate-500 dark:text-[#94A3B8] block">
            Active In-Play Exposure
          </span>
          <span className="font-mono tabular-nums text-lg sm:text-2xl font-extrabold text-slate-900 dark:text-white block">
            {inPlayExposure.toLocaleString('en-US', { minimumFractionDigits: 2 })}{' '}
            <span className="text-xs text-amber-500 dark:text-amber-400">ETB</span>
          </span>
          <Link
            href="/my-bets"
            className="inline-flex items-center gap-1 text-xs text-slate-500 dark:text-[#94A3B8] hover:text-slate-900 dark:hover:text-white pt-1"
          >
            <span>{totalBets} Total Slips</span>
            <ArrowUpRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="rounded-2xl bg-white dark:bg-[#1E2638] border border-slate-200 dark:border-[#2A344B] p-4 space-y-1 shadow-xs">
          <span className="text-xs text-slate-500 dark:text-[#94A3B8] block">
            Lifetime Winnings
          </span>
          <span className="font-mono tabular-nums text-lg sm:text-2xl font-extrabold text-[#22C55E] block">
            +{lifetimeWinnings.toLocaleString('en-US', { minimumFractionDigits: 0 })}{' '}
            <span className="text-xs">ETB</span>
          </span>
          <span className="text-xs font-mono text-slate-500 dark:text-[#94A3B8] block pt-1">
            Win Rate: {winRate}% ({wonBets}/{totalBets})
          </span>
        </div>
      </section>

      {/* VIP Tier & Preferences Split */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* VIP Loyalty Progress */}
        <section className="rounded-2xl bg-white dark:bg-[#1E2638] border border-slate-200 dark:border-[#2A344B] p-4 sm:p-5 space-y-4 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-emerald-600 dark:text-[#00E676]" />
              <h2 className="font-display text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                VIP Loyalty Status · {userProfile.vipTier}
              </h2>
            </div>
            <span className="font-mono tabular-nums text-xs font-bold text-emerald-600 dark:text-[#00E676]">
              {userProfile.vipPoints.toLocaleString()} / 10,000 PTS
            </span>
          </div>

          <div className="h-2.5 rounded-full bg-slate-100 dark:bg-[#121721] overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#00E676] to-[#38BDF8] transition-all duration-300"
              style={{ width: `${vipProgress}%` }}
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 dark:text-[#94A3B8]">
            <span>Weekly Cashback: 8.5% Instant ETB</span>
            <button
              type="button"
              onClick={handleClaimBonus}
              className="px-3 py-1.5 rounded-lg bg-[#00E676] hover:bg-[#00C853] text-[#0B0E14] font-bold cursor-pointer"
            >
              Claim +500 ETB Bonus
            </button>
          </div>
        </section>

        {/* Betting & Appearance Preferences */}
        <section className="rounded-2xl bg-white dark:bg-[#1E2638] border border-slate-200 dark:border-[#2A344B] p-4 sm:p-5 space-y-3.5 shadow-xs">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-emerald-600 dark:text-[#00E676]" />
            <h2 className="font-display text-sm sm:text-base font-bold text-slate-900 dark:text-white">
              App & Betting Preferences
            </h2>
          </div>

          <div className="space-y-3">
            {/* Theme Mode Selector: Light / Dark / System */}
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs text-slate-500 dark:text-[#94A3B8]">
                Appearance Theme
              </span>
              <div className="flex items-center gap-1.5">
                {(
                  [
                    { mode: 'light', label: 'Light', icon: Sun },
                    { mode: 'dark', label: 'Dark', icon: Moon },
                    { mode: 'system', label: 'System', icon: Monitor },
                  ] as Array<{
                    mode: ThemeMode;
                    label: string;
                    icon: React.ComponentType<{ className?: string }>;
                  }>
                ).map(({ mode, label, icon: Icon }) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setThemeMode(mode)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold inline-flex items-center gap-1 cursor-pointer ${
                      themeMode === mode
                        ? 'bg-[#00E676] text-[#0B0E14] font-bold'
                        : 'bg-slate-100 dark:bg-[#121721] border border-slate-200 dark:border-[#2A344B] text-slate-600 dark:text-[#94A3B8] hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <Icon className="w-3 h-3" />
                    <span>{label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs text-slate-500 dark:text-[#94A3B8]">
                Default Quick Stake
              </span>
              <div className="flex items-center gap-1.5">
                {[100, 250, 500, 1000].map((stakeVal) => (
                  <button
                    key={stakeVal}
                    type="button"
                    onClick={() => {
                      updateProfilePreferences({ defaultStake: stakeVal });
                      setMultiStake(stakeVal);
                    }}
                    className={`px-2.5 py-1 rounded-lg font-mono text-xs font-semibold cursor-pointer ${
                      userProfile.defaultStake === stakeVal
                        ? 'bg-[#00E676] text-[#0B0E14] font-bold'
                        : 'bg-slate-100 dark:bg-[#121721] border border-slate-200 dark:border-[#2A344B] text-slate-600 dark:text-[#94A3B8] hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    {stakeVal}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs text-slate-500 dark:text-[#94A3B8]">
                Odds Display Format
              </span>
              <div className="flex items-center gap-1.5">
                {(['decimal', 'american'] as const).map((fmt) => (
                  <button
                    key={fmt}
                    type="button"
                    onClick={() => updateProfilePreferences({ oddsFormat: fmt })}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold capitalize cursor-pointer ${
                      userProfile.oddsFormat === fmt
                        ? 'bg-[#00E676] text-[#0B0E14] font-bold'
                        : 'bg-slate-100 dark:bg-[#121721] border border-slate-200 dark:border-[#2A344B] text-slate-600 dark:text-[#94A3B8] hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    {fmt}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Quick Demo Profile Switcher */}
      <section className="rounded-2xl bg-white dark:bg-[#1E2638] border border-slate-200 dark:border-[#2A344B] p-4 sm:p-5 space-y-3 shadow-xs">
        <h2 className="font-display text-sm sm:text-base font-bold text-slate-900 dark:text-white">
          Quick-Switch Demo Accounts
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {DEMO_ACCOUNT_PRESETS.map((item) => {
            const active = item.profile.id === userProfile.id;
            return (
              <button
                key={item.profile.id}
                type="button"
                onClick={() => switchDemoAccount(item.profile.id)}
                className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                  active
                    ? 'bg-[#00E676]/15 border-[#00E676]'
                    : 'bg-slate-50 dark:bg-[#121721] hover:bg-slate-100 dark:hover:bg-[#1A2232] border-slate-200 dark:border-[#2A344B]'
                }`}
              >
                <div className="min-w-0">
                  <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                    {item.profile.fullName}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-[#94A3B8] font-mono">
                    {item.profile.vipTier} · {item.initialBalance.toLocaleString()} ETB
                  </div>
                </div>
                {active && (
                  <span className="text-[10px] font-mono font-bold text-emerald-600 dark:text-[#00E676] shrink-0">
                    ACTIVE
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </section>
    </main>
  );
}
