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
  Sun,
  Moon,
  Monitor,
} from 'lucide-react';
import { useWallet } from '@/context/WalletContext';
import { useSportsData } from '@/context/SportsDataContext';
import { useBetSlip } from '@/context/BetSlipContext';
import { useTelegram } from '@/hooks/useTelegram';
import { useTheme, ThemeMode } from '@/context/ThemeContext';

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
  const { themeMode, setThemeMode } = useTheme();

  const [showNotifs, setShowNotifs] = useState(false);
  const [showThemeMenu, setShowThemeMenu] = useState(false);
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

  const themeOptions: Array<{ mode: ThemeMode; label: string; icon: typeof Sun }> = [
    { mode: 'light', label: 'Light', icon: Sun },
    { mode: 'dark', label: 'Dark', icon: Moon },
    { mode: 'system', label: 'System', icon: Monitor },
  ];

  const ActiveThemeIcon =
    themeMode === 'light' ? Sun : themeMode === 'dark' ? Moon : Monitor;

  return (
    <header className="sticky top-0 z-30 w-full bg-white/95 dark:bg-[#0B0E14]/95 backdrop-blur-md border-b border-slate-200 dark:border-[#2A344B] transition-colors">
      <div className="max-w-7xl mx-auto px-2.5 sm:px-6 h-13 sm:h-16 flex items-center justify-between gap-1.5 sm:gap-4 min-w-0">
        {/* Zone 1: Brand Identity Logo (App wordmark hidden on mobile to prevent overflow) */}
        <Link
          href="/"
          className="flex items-center gap-2 shrink-0 focus:outline-none"
          aria-label="VoltBet Home"
        >
          <div className="relative w-8 h-8 sm:w-9 sm:h-9 rounded-xl overflow-hidden border border-emerald-500/50 dark:border-[#00E676]/50 bg-slate-900 dark:bg-[#121721] shrink-0">
            <Image
              src="/assets/aistudio/Gemini_Generated_Image_z2jjacz2jjacz2jj_1f18e757.jpeg"
              alt="VoltBet"
              fill
              sizes="36px"
              className="object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <span className="hidden sm:inline font-display text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-white whitespace-nowrap">
            Volt<span className="text-emerald-600 dark:text-[#00E676]">Bet</span>
          </span>
        </Link>

        {/* Zone 2: Tablet & Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-4 lg:gap-6 text-sm font-medium text-slate-600 dark:text-[#94A3B8]">
          <Link
            href="/"
            className={`hover:text-slate-900 dark:hover:text-white transition-colors whitespace-nowrap shrink-0 ${
              pathname === '/' ? 'text-emerald-600 dark:text-[#00E676] font-semibold' : ''
            }`}
          >
            Lobby
          </Link>
          <Link
            href="/live"
            className={`hover:text-slate-900 dark:hover:text-white transition-colors whitespace-nowrap shrink-0 ${
              pathname.startsWith('/live')
                ? 'text-emerald-600 dark:text-[#00E676] font-semibold'
                : ''
            }`}
          >
            Live
          </Link>
          <Link
            href="/my-bets"
            className={`hover:text-slate-900 dark:hover:text-white transition-colors whitespace-nowrap shrink-0 ${
              pathname.startsWith('/my-bets')
                ? 'text-emerald-600 dark:text-[#00E676] font-semibold'
                : ''
            }`}
          >
            My Bets {openBetsCount > 0 ? `(${openBetsCount})` : ''}
          </Link>
          <Link
            href="/wallet"
            className={`hover:text-slate-900 dark:hover:text-white transition-colors whitespace-nowrap shrink-0 ${
              pathname.startsWith('/wallet')
                ? 'text-emerald-600 dark:text-[#00E676] font-semibold'
                : ''
            }`}
          >
            Wallet
          </Link>
          <Link
            href="/profile"
            className={`hover:text-slate-900 dark:hover:text-white transition-colors whitespace-nowrap shrink-0 ${
              pathname.startsWith('/profile')
                ? 'text-emerald-600 dark:text-[#00E676] font-semibold'
                : ''
            }`}
          >
            Profile
          </Link>
        </nav>

        {/* Zone 3: Balance, Theme Switcher, Sim Bar Trigger, Notifications & Profile */}
        <div className="flex items-center gap-1 sm:gap-2 min-w-0">
          {isAuthenticated ? (
            <div className="flex items-center rounded-xl bg-slate-100 dark:bg-[#121721] border border-slate-200 dark:border-[#2A344B] p-0.5 sm:p-1 pl-2 sm:pl-2.5 gap-1.5 sm:gap-2 min-w-0">
              <Link href="/wallet" className="text-right min-w-0">
                <span className="block font-mono tabular-nums text-[11px] sm:text-sm font-bold text-slate-900 dark:text-white truncate max-w-[115px] sm:max-w-none">
                  {balance.toLocaleString('en-US', {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0,
                  })}{' '}
                  <span className="text-emerald-600 dark:text-[#00E676]">ETB</span>
                </span>
              </Link>
              <Link
                href="/wallet"
                className="inline-flex items-center justify-center gap-1 w-7 h-7 sm:w-auto sm:h-auto sm:px-2.5 sm:py-1.5 rounded-lg bg-[#00E676] hover:bg-[#00C853] text-[#0B0E14] text-xs font-bold transition-colors whitespace-nowrap shrink-0"
                aria-label="Deposit"
              >
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                <span className="hidden sm:inline">Deposit</span>
              </Link>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setIsAuthModalOpen(true)}
              className="h-8 sm:h-9 px-2.5 sm:px-3.5 rounded-xl bg-[#00E676] hover:bg-[#00C853] text-[#0B0E14] text-xs font-bold inline-flex items-center gap-1 cursor-pointer shrink-0"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>
          )}

          {/* Theme Switcher (Light / Dark / System) */}
          <div className="relative shrink-0">
            <button
              type="button"
              onClick={() => {
                setShowThemeMenu((prev) => !prev);
                setShowNotifs(false);
              }}
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-slate-100 hover:bg-slate-200/80 dark:bg-[#121721] dark:hover:bg-[#1A2232] border border-slate-200 dark:border-[#2A344B] flex items-center justify-center text-slate-700 dark:text-[#94A3B8] hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
              aria-label="Theme mode"
              title={`Theme: ${themeMode}`}
            >
              <ActiveThemeIcon className="w-4 h-4" />
            </button>

            {showThemeMenu && (
              <div className="absolute right-0 mt-2 w-36 rounded-2xl bg-white dark:bg-[#1E2638] border border-slate-200 dark:border-[#2A344B] shadow-xl p-1.5 z-50 space-y-1">
                {themeOptions.map((opt) => {
                  const Icon = opt.icon;
                  const active = themeMode === opt.mode;
                  return (
                    <button
                      key={opt.mode}
                      type="button"
                      onClick={() => {
                        hapticImpact('light');
                        setThemeMode(opt.mode);
                        setShowThemeMenu(false);
                      }}
                      className={`w-full px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between cursor-pointer transition-colors ${
                        active
                          ? 'bg-[#00E676] text-[#0B0E14] font-bold'
                          : 'text-slate-700 dark:text-[#94A3B8] hover:bg-slate-100 dark:hover:bg-[#121721] hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      <span className="inline-flex items-center gap-2">
                        <Icon className="w-3.5 h-3.5" />
                        <span>{opt.label}</span>
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Sim Control Bar Trigger */}
          <button
            type="button"
            onClick={() => {
              hapticImpact('light');
              setShowSimBar((prev) => !prev);
            }}
            className={`w-8 h-8 sm:w-auto sm:h-9 sm:px-2.5 rounded-xl border text-xs font-semibold inline-flex items-center justify-center gap-1 transition-colors cursor-pointer shrink-0 ${
              showSimBar
                ? 'bg-emerald-500/15 dark:bg-[#00E676]/15 border-emerald-500 dark:border-[#00E676] text-emerald-700 dark:text-[#00E676]'
                : 'bg-slate-100 dark:bg-[#121721] border-slate-200 dark:border-[#2A344B] text-slate-600 dark:text-[#94A3B8] hover:text-slate-900 dark:hover:text-white'
            }`}
            title="Simulation Controls"
            aria-label="Simulation Controls"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <ChevronDown
              className={`hidden sm:inline w-3 h-3 transition-transform ${
                showSimBar ? 'rotate-180' : ''
              }`}
            />
          </button>

          {/* Notifications */}
          <div className="relative shrink-0">
            <button
              type="button"
              onClick={() => {
                setShowNotifs((prev) => !prev);
                setShowThemeMenu(false);
                if (!showNotifs) markAllNotificationsRead();
              }}
              className="relative w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-slate-100 hover:bg-slate-200/80 dark:bg-[#121721] dark:hover:bg-[#1A2232] border border-slate-200 dark:border-[#2A344B] flex items-center justify-center text-slate-600 dark:text-[#94A3B8] hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
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
              <div className="absolute right-0 mt-2 w-72 max-w-[calc(100vw-1.5rem)] rounded-2xl bg-white dark:bg-[#1E2638] border border-slate-200 dark:border-[#2A344B] shadow-2xl p-3 z-50 space-y-2">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-[#2A344B]">
                  <span className="text-xs font-bold text-slate-900 dark:text-white">
                    Notifications
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowNotifs(false)}
                    className="text-xs text-slate-500 dark:text-[#94A3B8] hover:text-slate-900 dark:hover:text-white"
                  >
                    Close
                  </button>
                </div>
                <div className="max-h-60 overflow-y-auto space-y-1.5">
                  {notifications.map((n) => (
                    <div
                      key={n.id}
                      className="rounded-xl bg-slate-50 dark:bg-[#121721] border border-slate-200 dark:border-[#2A344B]/70 p-2.5 text-xs space-y-0.5"
                    >
                      <div className="flex items-center justify-between text-slate-900 dark:text-white font-semibold">
                        <span>{n.title}</span>
                        <span className="text-[10px] text-slate-500 dark:text-[#94A3B8] font-mono">
                          {n.timestamp}
                        </span>
                      </div>
                      <p className="text-slate-600 dark:text-[#94A3B8] leading-snug">
                        {n.message}
                      </p>
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
              className="hidden sm:flex items-center gap-2 px-2 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 dark:bg-[#121721] dark:hover:bg-[#1A2232] border border-slate-200 dark:border-[#2A344B] transition-colors shrink-0"
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
              <span className="hidden lg:inline text-xs font-semibold text-slate-900 dark:text-white truncate max-w-[90px]">
                {userProfile.fullName.split(' ')[0]}
              </span>
            </Link>
          )}
        </div>
      </div>

      {/* Collapsible Developer Simulation Control Bar */}
      {showSimBar && (
        <div className="bg-slate-100 dark:bg-[#121721] border-t border-slate-200 dark:border-[#2A344B] px-2.5 sm:px-6 py-2">
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-semibold text-emerald-700 dark:text-[#00E676]">
              {simFeedback || 'Simulation Controls'}
            </span>

            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                onClick={() => {
                  triggerManualOddsDrift();
                  showTempFeedback('Shifted live odds');
                }}
                className="px-2 py-1 rounded-lg bg-white dark:bg-[#1E2638] hover:bg-slate-200/60 dark:hover:bg-[#2A344B] border border-slate-200 dark:border-[#2A344B] text-[11px] sm:text-xs font-semibold text-slate-900 dark:text-white inline-flex items-center gap-1 cursor-pointer"
              >
                <Zap className="w-3 h-3 text-emerald-600 dark:text-[#00E676]" />
                <span>Odds Drift</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  toggleRandomMarketLock();
                  showTempFeedback('Toggled live market lock');
                }}
                className="px-2 py-1 rounded-lg bg-white dark:bg-[#1E2638] hover:bg-slate-200/60 dark:hover:bg-[#2A344B] border border-slate-200 dark:border-[#2A344B] text-[11px] sm:text-xs font-semibold text-slate-900 dark:text-white inline-flex items-center gap-1 cursor-pointer"
              >
                <Lock className="w-3 h-3 text-amber-500" />
                <span>Lock</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  const settled = simulateSettleOpenBets('WON');
                  showTempFeedback(
                    settled > 0 ? `Settled ${settled} slip(s) WON` : 'No open bets'
                  );
                }}
                className="px-2 py-1 rounded-lg bg-emerald-500/15 dark:bg-[#00E676]/15 hover:bg-emerald-500/25 dark:hover:bg-[#00E676]/25 border border-emerald-500/50 dark:border-[#00E676]/50 text-[11px] sm:text-xs font-bold text-emerald-700 dark:text-[#00E676] inline-flex items-center gap-1 cursor-pointer"
              >
                <Trophy className="w-3 h-3" />
                <span>Settle WON</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  const count = approveAllPendingDeposits();
                  showTempFeedback(
                    count > 0 ? `Approved ${count} deposit(s)` : 'No pending deposits'
                  );
                }}
                className="px-2 py-1 rounded-lg bg-white dark:bg-[#1E2638] hover:bg-slate-200/60 dark:hover:bg-[#2A344B] border border-slate-200 dark:border-[#2A344B] text-[11px] sm:text-xs font-semibold text-slate-900 dark:text-white inline-flex items-center gap-1 cursor-pointer"
              >
                <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-[#00E676]" />
                <span>
                  Approve {pendingDepositsCount > 0 ? `(${pendingDepositsCount})` : ''}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setIsLiveSimulationEnabled(!isLiveSimulationEnabled)}
                className={`px-2 py-1 rounded-lg border text-[11px] sm:text-xs font-mono cursor-pointer ${
                  isLiveSimulationEnabled
                    ? 'bg-white dark:bg-[#1E2638] border-slate-200 dark:border-[#2A344B] text-emerald-600 dark:text-[#22C55E]'
                    : 'bg-white dark:bg-[#1E2638] border-slate-200 dark:border-[#2A344B] text-slate-500 dark:text-[#94A3B8]'
                }`}
              >
                Live: {isLiveSimulationEnabled ? 'ON' : 'OFF'}
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
