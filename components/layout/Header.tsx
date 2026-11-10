'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  Plus,
  Bell,
  SlidersHorizontal,
  Zap,
  Trophy,
  Lock,
  CheckCircle2,
  LogIn,
  ChevronDown,
} from 'lucide-react';
import { useWallet } from '@/context/WalletContext';
import { useSportsData } from '@/context/SportsDataContext';
import { useBetSlip } from '@/context/BetSlipContext';
import { useTelegram } from '@/hooks/useTelegram';

export function Header() {
  const pathname = usePathname();
  const {
    isAuthenticated,
    setIsAuthModalOpen,
    userProfile,
    balance,
    notifications,
    unreadCount,
    markAllNotificationsRead,
    approveAllPendingDeposits,
    transactions,
  } = useWallet();
  const {
    triggerManualOddsDrift,
    toggleRandomMarketLock,
    isLiveSimulationEnabled,
    setIsLiveSimulationEnabled,
  } = useSportsData();
  const { simulateSettleOpenBets, placedBets } = useBetSlip();
  const { hapticImpact } = useTelegram();

  const [showNotifs, setShowNotifs] = useState(false);
  const [showSimBar, setShowSimBar] = useState(false);
  const [simFeedback, setSimFeedback] = useState<string | null>(null);

  const openBetsCount = placedBets.filter((b) => b.status === 'OPEN').length;
  const pendingDepositsCount = transactions.filter((t) => t.status === 'PENDING').length;

  const showTempFeedback = (msg: string) => {
    setSimFeedback(msg);
    setTimeout(() => {
      setSimFeedback(null);
    }, 2200);
  };

  return (
    <header className="sticky top-0 z-30 bg-[#0B0E14]/95 backdrop-blur-md border-b border-[#2A344B]">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-4">
        {/* Zone 1: Brand Identity Logo & Wordmark */}
        <Link
          href="/"
          className="flex items-center gap-2 shrink-0 focus:outline-none"
        >
          <div className="relative w-8 h-8 sm:w-9 sm:h-9 rounded-xl overflow-hidden border border-[#00E676]/50 bg-[#121721] shrink-0">
            <Image
              src="/assets/aistudio/Gemini_Generated_Image_z2jjacz2jjacz2jj_1f18e757.jpeg"
              alt="VoltBet"
              fill
              sizes="36px"
              className="object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <span className="font-display text-lg sm:text-xl font-bold tracking-tight text-white whitespace-nowrap">
            Volt<span className="text-[#00E676]">Bet</span>
          </span>
        </Link>

        {/* Zone 2: Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-[#94A3B8]">
          <Link
            href="/"
            className={`hover:text-white transition-colors whitespace-nowrap shrink-0 ${
              pathname === '/' ? 'text-[#00E676] font-semibold' : ''
            }`}
          >
            Lobby
          </Link>
          <Link
            href="/live"
            className={`hover:text-white transition-colors whitespace-nowrap shrink-0 ${
              pathname.startsWith('/live') ? 'text-[#00E676] font-semibold' : ''
            }`}
          >
            Live
          </Link>
          <Link
            href="/my-bets"
            className={`hover:text-white transition-colors whitespace-nowrap shrink-0 ${
              pathname.startsWith('/my-bets') ? 'text-[#00E676] font-semibold' : ''
            }`}
          >
            My Bets {openBetsCount > 0 ? `(${openBetsCount})` : ''}
          </Link>
          <Link
            href="/wallet"
            className={`hover:text-white transition-colors whitespace-nowrap shrink-0 ${
              pathname.startsWith('/wallet') ? 'text-[#00E676] font-semibold' : ''
            }`}
          >
            Wallet
          </Link>
          <Link
            href="/profile"
            className={`hover:text-white transition-colors whitespace-nowrap shrink-0 ${
              pathname.startsWith('/profile') ? 'text-[#00E676] font-semibold' : ''
            }`}
          >
            Profile
          </Link>
        </nav>

        {/* Zone 3: Balance, Auth / Profile & Sim Bar Trigger */}
        <div className="flex items-center gap-2 shrink-0">
          {isAuthenticated ? (
            <div className="flex items-center rounded-xl bg-[#121721] border border-[#2A344B] p-1 pl-2.5 gap-2">
              <Link href="/wallet" className="text-right">
                <span className="block font-mono tabular-nums text-xs sm:text-sm font-bold text-white whitespace-nowrap">
                  {balance.toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}{' '}
                  <span className="text-[#00E676]">ETB</span>
                </span>
              </Link>
              <Link
                href="/wallet"
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#00E676] hover:bg-[#00C853] text-[#0B0E14] text-xs font-bold transition-colors whitespace-nowrap shrink-0"
              >
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                <span className="hidden sm:inline">Deposit</span>
              </Link>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setIsAuthModalOpen(true)}
              className="min-h-[38px] px-3.5 py-1.5 rounded-xl bg-[#00E676] hover:bg-[#00C853] text-[#0B0E14] text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>
          )}

          {/* Sim Control Bar Trigger */}
          <button
            type="button"
            onClick={() => {
              hapticImpact('light');
              setShowSimBar((prev) => !prev);
            }}
            className={`min-h-[38px] px-2.5 rounded-xl border text-xs font-semibold inline-flex items-center gap-1 transition-colors cursor-pointer ${
              showSimBar
                ? 'bg-[#00E676]/15 border-[#00E676] text-[#00E676]'
                : 'bg-[#121721] border-[#2A344B] text-[#94A3B8] hover:text-white'
            }`}
            title="Simulation Controls"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <ChevronDown
              className={`w-3 h-3 transition-transform ${showSimBar ? 'rotate-180' : ''}`}
            />
          </button>

          {/* Notifications */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setShowNotifs((prev) => !prev);
                if (!showNotifs) markAllNotificationsRead();
              }}
              className="relative w-9 h-9 rounded-xl bg-[#121721] hover:bg-[#1A2232] border border-[#2A344B] flex items-center justify-center text-[#94A3B8] hover:text-white transition-colors cursor-pointer"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#00E676] text-[#0B0E14] font-mono text-[10px] font-bold flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifs && (
              <div className="absolute right-0 mt-2 w-72 rounded-2xl bg-[#1E2638] border border-[#2A344B] shadow-2xl p-3 z-50 space-y-2">
                <div className="flex items-center justify-between pb-2 border-b border-[#2A344B]">
                  <span className="text-xs font-bold text-white">Notifications</span>
                  <button
                    type="button"
                    onClick={() => setShowNotifs(false)}
                    className="text-xs text-[#94A3B8] hover:text-white"
                  >
                    Close
                  </button>
                </div>
                <div className="max-h-60 overflow-y-auto space-y-1.5">
                  {notifications.map((n) => (
                    <div
                      key={n.id}
                      className="rounded-xl bg-[#121721] border border-[#2A344B]/70 p-2.5 text-xs space-y-0.5"
                    >
                      <div className="flex items-center justify-between text-white font-semibold">
                        <span>{n.title}</span>
                        <span className="text-[10px] text-[#94A3B8] font-mono">
                          {n.timestamp}
                        </span>
                      </div>
                      <p className="text-[#94A3B8] leading-snug">{n.message}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Profile Avatar Button */}
          {isAuthenticated && (
            <Link
              href="/profile"
              className="flex items-center gap-2 px-2 py-1.5 rounded-xl bg-[#121721] hover:bg-[#1A2232] border border-[#2A344B] transition-colors"
              title={`${userProfile.fullName} (${userProfile.vipTier})`}
            >
              <div
                className="w-6 h-6 rounded-lg flex items-center justify-center font-mono text-[11px] font-bold text-[#0B0E14]"
                style={{ backgroundColor: userProfile.avatarColor }}
              >
                {userProfile.fullName
                  .split(' ')
                  .map((n) => n[0])
                  .join('')}
              </div>
              <span className="hidden lg:inline text-xs font-semibold text-white truncate max-w-[90px]">
                {userProfile.fullName.split(' ')[0]}
              </span>
            </Link>
          )}
        </div>
      </div>

      {/* Collapsible Developer Simulation Control Bar */}
      {showSimBar && (
        <div className="bg-[#121721] border-t border-[#2A344B] px-3 sm:px-6 py-2">
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-semibold text-[#00E676]">
              {simFeedback || 'Simulation Controls'}
            </span>

            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                onClick={() => {
                  triggerManualOddsDrift();
                  showTempFeedback('Shifted live odds');
                }}
                className="px-2.5 py-1.5 rounded-lg bg-[#1E2638] hover:bg-[#2A344B] border border-[#2A344B] text-xs font-semibold text-white inline-flex items-center gap-1 cursor-pointer"
              >
                <Zap className="w-3.5 h-3.5 text-[#00E676]" />
                <span>Odds Drift</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  toggleRandomMarketLock();
                  showTempFeedback('Toggled live market lock');
                }}
                className="px-2.5 py-1.5 rounded-lg bg-[#1E2638] hover:bg-[#2A344B] border border-[#2A344B] text-xs font-semibold text-white inline-flex items-center gap-1 cursor-pointer"
              >
                <Lock className="w-3.5 h-3.5 text-amber-400" />
                <span>Market Lock</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  const settled = simulateSettleOpenBets('WON');
                  showTempFeedback(
                    settled > 0 ? `Settled ${settled} slip(s) WON` : 'No open bets'
                  );
                }}
                className="px-2.5 py-1.5 rounded-lg bg-[#00E676]/15 hover:bg-[#00E676]/25 border border-[#00E676]/50 text-xs font-bold text-[#00E676] inline-flex items-center gap-1 cursor-pointer"
              >
                <Trophy className="w-3.5 h-3.5" />
                <span>Settle Bets (WON)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  const count = approveAllPendingDeposits();
                  showTempFeedback(
                    count > 0 ? `Approved ${count} deposit(s)` : 'No pending deposits'
                  );
                }}
                className="px-2.5 py-1.5 rounded-lg bg-[#1E2638] hover:bg-[#2A344B] border border-[#2A344B] text-xs font-semibold text-white inline-flex items-center gap-1 cursor-pointer"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-[#00E676]" />
                <span>
                  Approve Deposits {pendingDepositsCount > 0 ? `(${pendingDepositsCount})` : ''}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setIsLiveSimulationEnabled(!isLiveSimulationEnabled)}
                className={`px-2.5 py-1.5 rounded-lg border text-xs font-mono cursor-pointer ${
                  isLiveSimulationEnabled
                    ? 'bg-[#1E2638] border-[#2A344B] text-[#22C55E]'
                    : 'bg-[#1E2638] border-[#2A344B] text-[#94A3B8]'
                }`}
              >
                Live Stream: {isLiveSimulationEnabled ? 'ON' : 'OFF'}
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
