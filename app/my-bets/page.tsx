'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Receipt,
  CheckCircle2,
  XCircle,
  Clock,
  Banknote,
  Trophy,
  ArrowUpRight,
} from 'lucide-react';
import { useBetSlip } from '@/context/BetSlipContext';
import { BetSlipDrawer } from '@/components/betting/BetSlipDrawer';

type BetFilterTab = 'OPEN' | 'WON' | 'LOST' | 'ALL';

export default function MyBetsPage() {
  const {
    placedBets,
    cashOutBet,
    simulateSettleOpenBets,
  } = useBetSlip();

  const [activeTab, setActiveTab] = useState<BetFilterTab>('OPEN');
  const [cashoutFeedback, setCashoutFeedback] = useState<string | null>(null);

  const counts = useMemo(() => {
    return {
      OPEN: placedBets.filter((b) => b.status === 'OPEN').length,
      WON: placedBets.filter((b) => b.status === 'WON' || b.status === 'CASHED_OUT').length,
      LOST: placedBets.filter((b) => b.status === 'LOST').length,
      ALL: placedBets.length,
    };
  }, [placedBets]);

  const filteredBets = useMemo(() => {
    if (activeTab === 'ALL') return placedBets;
    if (activeTab === 'WON') {
      return placedBets.filter((b) => b.status === 'WON' || b.status === 'CASHED_OUT');
    }
    return placedBets.filter((b) => b.status === activeTab);
  }, [placedBets, activeTab]);

  const handleEarlyCashout = (betId: string, amount: number) => {
    const ok = cashOutBet(betId);
    if (ok) {
      setCashoutFeedback(
        `Cashed out ${betId} for +${amount.toLocaleString('en-US', {
          minimumFractionDigits: 2,
        })} ETB! Credited to wallet.`
      );
      setTimeout(() => setCashoutFeedback(null), 3500);
    }
  };

  return (
    <main className="max-w-7xl mx-auto px-3 sm:px-6 pt-4 space-y-5">
      {/* Header Banner */}
      <div className="rounded-2xl bg-[#1E2638] border border-[#2A344B] p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-xl sm:text-2xl font-bold text-white">
            My Bets & Active Wager Tracking
          </h1>
          <p className="text-xs text-[#94A3B8] mt-0.5">
            Track live accumulator legs, settle open slips, or execute instant Early Cashout in ETB.
          </p>
        </div>

        {counts.OPEN > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => {
                const c = simulateSettleOpenBets('WON');
                setCashoutFeedback(
                  `Graded ${c} open bet(s) as WON & credited payouts to your ETB wallet!`
                );
                setTimeout(() => setCashoutFeedback(null), 3500);
              }}
              className="min-h-[40px] px-3.5 py-2 rounded-xl bg-[#00E676] hover:bg-[#00C853] text-[#0B0E14] text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Trophy className="w-4 h-4" />
              <span>Simulate Winning ({counts.OPEN})</span>
            </button>

            <button
              type="button"
              onClick={() => {
                simulateSettleOpenBets('LOST');
              }}
              className="min-h-[40px] px-3 py-2 rounded-xl bg-[#121721] hover:bg-[#EF4444]/20 border border-[#2A344B] text-xs font-semibold text-[#94A3B8] hover:text-[#EF4444] cursor-pointer"
            >
              Simulate Lost
            </button>
          </div>
        )}
      </div>

      {cashoutFeedback && (
        <div className="rounded-xl bg-[#00E676]/15 border border-[#00E676]/50 p-3 flex items-center gap-2 text-xs font-semibold text-[#00E676]">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{cashoutFeedback}</span>
        </div>
      )}

      {/* Status Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar p-1 rounded-xl bg-[#121721] border border-[#2A344B]">
        {(
          [
            { id: 'OPEN', label: 'Open / Active', count: counts.OPEN },
            { id: 'WON', label: 'Won / Cashed Out', count: counts.WON },
            { id: 'LOST', label: 'Lost', count: counts.LOST },
            { id: 'ALL', label: 'All / Settled', count: counts.ALL },
          ] as const
        ).map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`min-h-[38px] px-3.5 py-1.5 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
              activeTab === tab.id
                ? 'bg-[#00E676] text-[#0B0E14] font-bold'
                : 'text-[#94A3B8] hover:text-white'
            }`}
          >
            <span>{tab.label}</span>
            <span className="font-mono tabular-nums">({tab.count})</span>
          </button>
        ))}
      </div>

      <div className="flex flex-col lg:flex-row items-start gap-6">
        {/* Bet Slips Feed */}
        <div className="w-full flex-1 min-w-0 space-y-4">
          {filteredBets.length === 0 ? (
            <div className="rounded-2xl bg-[#1E2638] border border-[#2A344B] p-10 text-center space-y-3">
              <Receipt className="w-8 h-8 text-[#94A3B8]/50 mx-auto" />
              <p className="text-sm font-semibold text-white">
                No Bet Slips in This Category
              </p>
              <p className="text-xs text-[#94A3B8]">
                Head to the Sportsbook Lobby or Live In-Play arena to place a Single or Accumulator wager.
              </p>
              <Link
                href="/"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#00E676] text-[#0B0E14] text-xs font-bold"
              >
                <span>Browse Matches</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ) : (
            filteredBets.map((bet) => (
              <article
                key={bet.id}
                className="rounded-2xl bg-[#1E2638] border border-[#2A344B] overflow-hidden"
              >
                {/* Slip Header */}
                <div className="px-4 py-3 bg-[#121721] border-b border-[#2A344B] flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-mono tabular-nums font-bold text-white">
                      {bet.id}
                    </span>
                    <span className="text-[#94A3B8]">·</span>
                    <span className="font-semibold text-[#00E676] uppercase">
                      {bet.mode === 'multi'
                        ? `${bet.legs.length}-Leg Accumulator`
                        : 'Single Wager'}
                    </span>
                    <span className="text-[#94A3B8]">·</span>
                    <span className="font-mono text-[#94A3B8]">{bet.createdAt}</span>
                  </div>

                  {/* Status Indicator */}
                  <div>
                    {bet.status === 'OPEN' && (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-400">
                        <Clock className="w-3.5 h-3.5" />
                        <span>OPEN / IN-PLAY</span>
                      </span>
                    )}
                    {bet.status === 'WON' && (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-[#22C55E]">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>
                          WON (+
                          {(bet.settledPayout || bet.potentialPayout).toLocaleString(
                            'en-US',
                            { minimumFractionDigits: 2 }
                          )}{' '}
                          ETB)
                        </span>
                      </span>
                    )}
                    {bet.status === 'CASHED_OUT' && (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-[#00E676]">
                        <Banknote className="w-3.5 h-3.5" />
                        <span>
                          CASHED OUT (+
                          {(bet.settledPayout || 0).toLocaleString('en-US', {
                            minimumFractionDigits: 2,
                          })}{' '}
                          ETB)
                        </span>
                      </span>
                    )}
                    {bet.status === 'LOST' && (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-[#EF4444]">
                        <XCircle className="w-3.5 h-3.5" />
                        <span>SETTLED LOST</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Multi-Match Breakdown List */}
                <div className="p-4 space-y-2.5 divide-y divide-[#2A344B]/60">
                  {bet.legs.map((leg) => (
                    <div
                      key={leg.selectionId}
                      className="pt-2.5 first:pt-0 flex items-center justify-between gap-3"
                    >
                      <div className="min-w-0 space-y-0.5">
                        <div className="text-xs text-[#94A3B8] truncate">
                          <Link
                            href={`/matches/${leg.fixtureId}`}
                            className="text-white font-semibold hover:text-[#00E676] transition-colors"
                          >
                            {leg.matchTitle}
                          </Link>{' '}
                          · {leg.leagueName}
                        </div>
                        <div className="text-xs sm:text-sm font-medium text-white">
                          {leg.marketName}:{' '}
                          <span className="font-bold text-[#00E676]">
                            {leg.selectionName}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <span className="font-mono tabular-nums text-xs sm:text-sm font-bold text-white">
                          @{leg.odd.toFixed(2)}
                        </span>
                        <span
                          className={`font-mono text-[11px] font-bold ${
                            leg.legStatus === 'WON'
                              ? 'text-[#22C55E]'
                              : leg.legStatus === 'LOST'
                              ? 'text-[#EF4444]'
                              : 'text-amber-400'
                          }`}
                        >
                          {leg.legStatus}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Financial Summary & Early Cashout Action */}
                <div className="px-4 py-3 bg-[#121721]/80 border-t border-[#2A344B] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-4 text-xs">
                    <div>
                      <span className="text-[#94A3B8] block">Total Stake</span>
                      <span className="font-mono tabular-nums font-bold text-white">
                        {bet.totalStake.toLocaleString('en-US', {
                          minimumFractionDigits: 2,
                        })}{' '}
                        ETB
                      </span>
                    </div>
                    <div>
                      <span className="text-[#94A3B8] block">Combined Odds</span>
                      <span className="font-mono tabular-nums font-bold text-white">
                        {bet.totalOdds.toFixed(2)}x
                      </span>
                    </div>
                    <div>
                      <span className="text-[#94A3B8] block">Potential Return</span>
                      <span className="font-mono tabular-nums font-bold text-[#00E676]">
                        {bet.potentialPayout.toLocaleString('en-US', {
                          minimumFractionDigits: 2,
                        })}{' '}
                        ETB
                      </span>
                    </div>
                  </div>

                  {bet.status === 'OPEN' && bet.cashoutOffer !== null && (
                    <button
                      type="button"
                      onClick={() => handleEarlyCashout(bet.id, bet.cashoutOffer!)}
                      className="min-h-[42px] px-4 py-2 rounded-xl bg-[#00E676] hover:bg-[#00C853] text-[#0B0E14] font-bold text-xs inline-flex items-center justify-center gap-2 shadow-[0_0_16px_rgba(0,230,118,0.2)] transition-all cursor-pointer shrink-0"
                    >
                      <Banknote className="w-4 h-4" />
                      <span>
                        Cash Out Early ·{' '}
                        <span className="font-mono tabular-nums font-extrabold">
                          {bet.cashoutOffer.toLocaleString('en-US', {
                            minimumFractionDigits: 2,
                          })}{' '}
                          ETB
                        </span>
                      </span>
                    </button>
                  )}
                </div>
              </article>
            ))
          )}
        </div>

        <BetSlipDrawer />
      </div>
    </main>
  );
}
