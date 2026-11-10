'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  X,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  Receipt,
  ChevronUp,
  TrendingUp,
  TrendingDown,
  Lock,
  Loader2,
  Wallet,
  LogIn,
} from 'lucide-react';
import { useBetSlip } from '@/context/BetSlipContext';
import { useWallet } from '@/context/WalletContext';

const QUICK_ETB_PRESETS = [100, 500, 1000, 5000];

export function BetSlipDrawer() {
  const {
    selections,
    mode,
    setMode,
    multiStake,
    setMultiStake,
    isDrawerOpen,
    setIsDrawerOpen,
    lastPlacedReceipt,
    clearLastReceipt,
    hasDriftedSelections,
    hasSuspendedSelections,
    totalStake,
    combinedMultiOdds,
    estimatedPayout,
    removeSelection,
    updateSingleStake,
    clearSlip,
    acceptOddsChanges,
    placeBet,
  } = useBetSlip();

  const { balance, isAuthenticated, setIsAuthModalOpen } = useWallet();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const insufficientBalance = isAuthenticated && totalStake > balance;

  const handlePlaceBet = () => {
    if (!isAuthenticated) {
      setIsAuthModalOpen(true);
      return;
    }
    setErrorMessage(null);
    setIsSubmitting(true);
    setTimeout(() => {
      const result = placeBet();
      setIsSubmitting(false);
      if (!result.success && result.error) {
        setErrorMessage(result.error);
      } else if (result.success) {
        setIsDrawerOpen(false);
      }
    }, 300);
  };

  const handlePresetAdd = (amount: number) => {
    setErrorMessage(null);
    if (mode === 'multi') {
      setMultiStake(multiStake + amount);
    } else {
      selections.forEach((sel) => {
        updateSingleStake(sel.selectionId, sel.singleStake + amount);
      });
    }
  };

  const handleSetMaxStake = () => {
    setErrorMessage(null);
    if (balance <= 0) return;
    if (mode === 'multi') {
      setMultiStake(Math.floor(balance));
    } else if (selections.length > 0) {
      const perLeg = Math.floor(balance / selections.length);
      selections.forEach((sel) => {
        updateSingleStake(sel.selectionId, perLeg);
      });
    }
  };

  const renderSlipContent = () => (
    <div className="flex flex-col h-full">
      <div className="p-3.5 border-b border-[#2A344B] space-y-2.5">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Receipt className="w-4 h-4 text-[#00E676]" />
            <h2 className="font-display text-sm font-bold text-white">
              Bet Slip ({selections.length})
            </h2>
          </div>

          <div className="flex items-center gap-1.5">
            {selections.length > 0 && (
              <button
                type="button"
                onClick={clearSlip}
                className="inline-flex items-center gap-1 text-xs text-[#94A3B8] hover:text-[#EF4444] transition-colors cursor-pointer px-2 py-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => setIsDrawerOpen(false)}
              className="lg:hidden p-1 rounded-lg text-[#94A3B8] hover:text-white"
              aria-label="Close Bet Slip"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-1 p-1 rounded-xl bg-[#0B0E14] border border-[#2A344B]">
          <button
            type="button"
            onClick={() => setMode('single')}
            className={`py-1.5 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
              mode === 'single'
                ? 'bg-[#00E676] text-[#0B0E14] font-bold'
                : 'text-[#94A3B8] hover:text-white'
            }`}
          >
            Single ({selections.length})
          </button>
          <button
            type="button"
            onClick={() => setMode('multi')}
            className={`py-1.5 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
              mode === 'multi'
                ? 'bg-[#00E676] text-[#0B0E14] font-bold'
                : 'text-[#94A3B8] hover:text-white'
            }`}
          >
            Parlay
          </button>
        </div>
      </div>

      {/* Selections List */}
      <div className="flex-1 overflow-y-auto p-3.5 space-y-2 max-h-[45vh] lg:max-h-[400px]">
        {selections.length === 0 ? (
          <div className="py-10 px-3 text-center space-y-1.5">
            <Receipt className="w-7 h-7 text-[#94A3B8]/40 mx-auto" />
            <p className="text-xs font-semibold text-white">No Selections Yet</p>
            <p className="text-[11px] text-[#94A3B8]">
              Tap any odds button to build your slip.
            </p>
          </div>
        ) : (
          selections.map((sel) => (
            <div
              key={sel.selectionId}
              className="rounded-xl bg-[#121721] border border-[#2A344B] p-2.5 space-y-1.5"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-[11px] text-[#94A3B8] truncate">
                    {sel.matchTitle}
                  </p>
                  <p className="text-xs font-semibold text-white truncate">
                    {sel.marketName}:{' '}
                    <span className="text-[#00E676]">{sel.selectionName}</span>
                  </p>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <span
                    className={`inline-flex items-center gap-1 font-mono tabular-nums text-xs font-bold px-2 py-0.5 rounded-lg border ${
                      sel.suspended
                        ? 'bg-amber-500/10 border-amber-500/40 text-amber-400'
                        : sel.driftDirection === 'up'
                        ? 'bg-[#22C55E]/15 border-[#22C55E]/50 text-[#22C55E]'
                        : sel.driftDirection === 'down'
                        ? 'bg-[#EF4444]/15 border-[#EF4444]/50 text-[#EF4444]'
                        : 'bg-[#1E2638] border-[#2A344B] text-[#00E676]'
                    }`}
                  >
                    {sel.suspended ? (
                      <>
                        <Lock className="w-3 h-3" />
                        <span>Locked</span>
                      </>
                    ) : (
                      <>
                        {sel.driftDirection === 'up' && <TrendingUp className="w-3 h-3" />}
                        {sel.driftDirection === 'down' && <TrendingDown className="w-3 h-3" />}
                        <span>{sel.odd.toFixed(2)}</span>
                      </>
                    )}
                  </span>

                  <button
                    type="button"
                    onClick={() => removeSelection(sel.selectionId)}
                    className="p-1 rounded-lg text-[#94A3B8] hover:text-[#EF4444] cursor-pointer"
                    aria-label="Remove"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {sel.driftDirection && (
                <p className="text-[10px] font-mono tabular-nums text-amber-400">
                  {sel.lockedOdd.toFixed(2)} → {sel.odd.toFixed(2)}
                </p>
              )}

              {mode === 'single' && (
                <div className="flex items-center justify-between gap-2 pt-1.5 border-t border-[#2A344B]/60">
                  <span className="text-[11px] text-[#94A3B8]">Stake (ETB)</span>
                  <input
                    type="number"
                    min={0}
                    value={sel.singleStake || ''}
                    onChange={(e) =>
                      updateSingleStake(sel.selectionId, parseFloat(e.target.value) || 0)
                    }
                    className="w-24 h-7 px-2 rounded-lg bg-[#0B0E14] border border-[#2A344B] focus:border-[#00E676] focus:outline-none text-right font-mono tabular-nums text-xs text-white"
                  />
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {selections.length > 0 && hasDriftedSelections && (
        <div className="mx-3.5 mb-2 rounded-xl bg-amber-500/10 border border-amber-500/40 p-2.5 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 min-w-0">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="text-xs text-amber-200 truncate">Odds shifted</span>
          </div>
          <button
            type="button"
            onClick={acceptOddsChanges}
            className="px-2.5 py-1 rounded-lg bg-amber-400 hover:bg-amber-300 text-[#0B0E14] text-xs font-bold whitespace-nowrap shrink-0 cursor-pointer"
          >
            Accept Odds
          </button>
        </div>
      )}

      {selections.length > 0 && (
        <div className="p-3.5 border-t border-[#2A344B] bg-[#121721] space-y-2.5">
          {mode === 'multi' && (
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#94A3B8]">Stake (ETB)</span>
                {isAuthenticated && (
                  <span className="font-mono tabular-nums text-[11px] text-[#94A3B8]">
                    Bal: {balance.toLocaleString('en-US', { minimumFractionDigits: 0 })} ETB
                  </span>
                )}
              </div>
              <div className="relative">
                <input
                  type="number"
                  min={0}
                  value={multiStake || ''}
                  onChange={(e) => {
                    setErrorMessage(null);
                    setMultiStake(Math.max(0, parseFloat(e.target.value) || 0));
                  }}
                  placeholder="Stake"
                  className="w-full h-10 px-3 pr-12 rounded-xl bg-[#0B0E14] border border-[#2A344B] focus:border-[#00E676] focus:outline-none font-mono tabular-nums text-sm font-bold text-white"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 font-mono text-xs font-semibold text-[#94A3B8]">
                  ETB
                </span>
              </div>
            </div>
          )}

          <div className="grid grid-cols-4 gap-1.5">
            {QUICK_ETB_PRESETS.slice(0, 3).map((amt) => (
              <button
                key={amt}
                type="button"
                onClick={() => handlePresetAdd(amt)}
                className="min-h-[34px] rounded-lg bg-[#1E2638] hover:bg-[#2A344B] border border-[#2A344B] font-mono tabular-nums text-xs font-semibold text-white transition-colors cursor-pointer"
              >
                +{amt}
              </button>
            ))}
            <button
              type="button"
              onClick={handleSetMaxStake}
              className="min-h-[34px] rounded-lg bg-[#1E2638] hover:bg-[#2A344B] border border-[#2A344B] text-xs font-bold text-[#00E676] transition-colors cursor-pointer"
            >
              Max
            </button>
          </div>

          <div className="space-y-1 pt-0.5 text-xs">
            {mode === 'multi' && (
              <div className="flex items-center justify-between text-[#94A3B8]">
                <span>Total Odds</span>
                <span className="font-mono tabular-nums font-bold text-white">
                  {combinedMultiOdds.toFixed(2)}x
                </span>
              </div>
            )}
            <div className="flex items-center justify-between text-sm font-bold pt-1 border-t border-[#2A344B]/60">
              <span className="text-white">Est. Return</span>
              <span className="font-mono tabular-nums text-[#00E676]">
                {estimatedPayout.toLocaleString('en-US', { minimumFractionDigits: 2 })} ETB
              </span>
            </div>
          </div>

          {insufficientBalance && (
            <div className="rounded-xl bg-[#EF4444]/15 border border-[#EF4444]/40 p-2 flex items-center justify-between gap-2">
              <span className="text-xs text-[#EF4444]">Insufficient balance</span>
              <Link
                href="/wallet"
                onClick={() => setIsDrawerOpen(false)}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#EF4444] text-white text-xs font-bold whitespace-nowrap shrink-0"
              >
                <Wallet className="w-3 h-3" />
                <span>Deposit</span>
              </Link>
            </div>
          )}

          {errorMessage && !insufficientBalance && (
            <p className="text-xs text-[#EF4444] font-medium">{errorMessage}</p>
          )}

          {!isAuthenticated ? (
            <button
              type="button"
              onClick={() => setIsAuthModalOpen(true)}
              className="w-full min-h-[44px] rounded-xl bg-[#00E676] hover:bg-[#00C853] text-[#0B0E14] font-bold text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer"
            >
              <LogIn className="w-4 h-4" />
              <span>Sign In to Place Bet</span>
            </button>
          ) : (
            <button
              type="button"
              disabled={isSubmitting || insufficientBalance || hasSuspendedSelections}
              onClick={handlePlaceBet}
              className="w-full min-h-[44px] rounded-xl bg-[#00E676] hover:bg-[#00C853] disabled:opacity-50 disabled:cursor-not-allowed text-[#0B0E14] font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(0,230,118,0.2)] transition-all cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Placing Bet...</span>
                </>
              ) : (
                <span>
                  Place Bet · {totalStake.toLocaleString('en-US', { minimumFractionDigits: 0 })} ETB
                </span>
              )}
            </button>
          )}
        </div>
      )}
    </div>
  );

  return (
    <>
      <aside className="hidden lg:block w-80 xl:w-96 shrink-0">
        <div className="sticky top-20 rounded-2xl bg-[#1E2638] border border-[#2A344B] overflow-hidden">
          {renderSlipContent()}
        </div>
      </aside>

      {selections.length > 0 && !isDrawerOpen && (
        <div className="lg:hidden fixed bottom-16 left-3 right-3 z-30">
          <button
            type="button"
            onClick={() => setIsDrawerOpen(true)}
            className="w-full min-h-[46px] px-4 py-2 rounded-2xl bg-[#00E676] text-[#0B0E14] shadow-[0_8px_30px_rgba(0,230,118,0.3)] flex items-center justify-between gap-3 cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <span className="w-6 h-6 rounded-lg bg-[#0B0E14] text-[#00E676] font-mono tabular-nums text-xs font-bold flex items-center justify-center">
                {selections.length}
              </span>
              <span className="text-xs font-extrabold">
                Slip · {combinedMultiOdds.toFixed(2)}x
              </span>
            </div>

            <div className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-[#0B0E14] text-[#00E676] text-xs font-bold">
              <span>Open</span>
              <ChevronUp className="w-3.5 h-3.5" />
            </div>
          </button>
        </div>
      )}

      {isDrawerOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex flex-col justify-end bg-black/70 backdrop-blur-sm">
          <div
            className="flex-1"
            onClick={() => setIsDrawerOpen(false)}
            aria-hidden="true"
          />
          <div className="rounded-t-3xl bg-[#1E2638] border-t border-[#2A344B] max-h-[85vh] flex flex-col overflow-hidden">
            <div className="w-10 h-1.5 bg-[#2A344B] rounded-full mx-auto mt-2.5" />
            {renderSlipContent()}
          </div>
        </div>
      )}

      {lastPlacedReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-[#1E2638] border border-[#00E676]/50 p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-6 h-6 text-[#00E676]" />
                <div>
                  <h3 className="font-display text-base font-bold text-white">
                    Bet Confirmed
                  </h3>
                  <p className="font-mono tabular-nums text-xs text-[#94A3B8]">
                    {lastPlacedReceipt.id}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={clearLastReceipt}
                className="p-1.5 rounded-lg text-[#94A3B8] hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="rounded-xl bg-[#121721] border border-[#2A344B] p-3 space-y-2 max-h-48 overflow-y-auto">
              {lastPlacedReceipt.legs.map((leg) => (
                <div
                  key={leg.selectionId}
                  className="flex items-center justify-between gap-2 text-xs pb-2 last:pb-0 border-b last:border-b-0 border-[#2A344B]/60"
                >
                  <div className="min-w-0">
                    <p className="text-[#94A3B8] truncate">{leg.matchTitle}</p>
                    <p className="font-semibold text-white truncate">
                      {leg.marketName}: <span className="text-[#00E676]">{leg.selectionName}</span>
                    </p>
                  </div>
                  <span className="font-mono tabular-nums font-bold text-[#00E676] shrink-0">
                    @{leg.odd.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            <div className="rounded-xl bg-[#0B0E14] border border-[#2A344B] p-3 space-y-1 text-xs">
              <div className="flex justify-between text-[#94A3B8]">
                <span>Stake</span>
                <span className="font-mono tabular-nums text-white font-semibold">
                  {lastPlacedReceipt.totalStake.toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                  })}{' '}
                  ETB
                </span>
              </div>
              <div className="flex justify-between text-sm font-bold pt-1 border-t border-[#2A344B]">
                <span className="text-white">Potential Payout</span>
                <span className="font-mono tabular-nums text-[#00E676]">
                  {lastPlacedReceipt.potentialPayout.toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                  })}{' '}
                  ETB
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={clearLastReceipt}
                className="min-h-[42px] rounded-xl bg-[#121721] hover:bg-[#1A2232] border border-[#2A344B] text-xs font-semibold text-white cursor-pointer"
              >
                Done
              </button>
              <Link
                href="/my-bets"
                onClick={clearLastReceipt}
                className="min-h-[42px] rounded-xl bg-[#00E676] hover:bg-[#00C853] text-[#0B0E14] text-xs font-bold flex items-center justify-center"
              >
                My Bets
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
