'use client';

import React, { useState, useMemo } from 'react';
import { Radio, Lock, Zap, Flame } from 'lucide-react';
import { SportCategory } from '@/types/api-football';
import { useSportsData } from '@/context/SportsDataContext';
import { MatchCard } from '@/components/betting/MatchCard';
import { BetSlipDrawer } from '@/components/betting/BetSlipDrawer';
import { useOddsTicker } from '@/hooks/useOddsTicker';

export default function LiveInPlayHubPage() {
  const {
    fixtures,
    toggleRandomMarketLock,
    triggerManualOddsDrift,
  } = useSportsData();

  const { formattedSeconds } = useOddsTicker(true);
  const [selectedSport, setSelectedSport] = useState<'ALL' | SportCategory>('ALL');

  const liveFixtures = useMemo(() => {
    return fixtures.filter((f) => {
      const isLive = ['1H', 'HT', '2H', 'LIVE'].includes(f.fixture.status.short);
      if (!isLive) return false;
      const sport = f.sport || 'Soccer';
      if (selectedSport !== 'ALL' && sport !== selectedSport) return false;
      return true;
    });
  }, [fixtures, selectedSport]);

  const sportCounts = useMemo(() => {
    const allLive = fixtures.filter((f) =>
      ['1H', 'HT', '2H', 'LIVE'].includes(f.fixture.status.short)
    );
    return {
      ALL: allLive.length,
      Soccer: allLive.filter((f) => (f.sport || 'Soccer') === 'Soccer').length,
      Basketball: allLive.filter((f) => f.sport === 'Basketball').length,
      Tennis: allLive.filter((f) => f.sport === 'Tennis').length,
    };
  }, [fixtures]);

  return (
    <main className="max-w-7xl mx-auto px-3 sm:px-6 pt-4 space-y-5">
      {/* Live Hub Header Bar */}
      <div className="rounded-2xl bg-gradient-to-r from-[#1A2232] via-[#1E2638] to-[#121721] border border-[#2A344B] p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 text-xs font-mono font-bold text-[#EF4444]">
            <Radio className="w-4 h-4 animate-pulse" />
            <span>REAL-TIME IN-PLAY TRADING ARENA</span>
          </div>
          <h1 className="font-display text-xl sm:text-2xl font-extrabold text-white">
            Live In-Play Hub ({sportCounts.ALL} Active Matches)
          </h1>
          <p className="text-xs text-[#94A3B8]">
            Sub-minute match clocks, dangerous attack counters, and automatic VAR/Penalty odds lock protection.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={triggerManualOddsDrift}
            className="min-h-[40px] px-3.5 py-2 rounded-xl bg-[#121721] hover:bg-[#1E2638] border border-[#2A344B] text-xs font-semibold text-white inline-flex items-center gap-1.5 cursor-pointer"
          >
            <Zap className="w-3.5 h-3.5 text-[#00E676]" />
            <span>Trigger Odds Drift</span>
          </button>

          <button
            type="button"
            onClick={toggleRandomMarketLock}
            className="min-h-[40px] px-3.5 py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-xs font-bold text-amber-300 inline-flex items-center gap-1.5 cursor-pointer"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Simulate Danger Lock</span>
          </button>
        </div>
      </div>

      {/* Sport Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
        {(['ALL', 'Soccer', 'Basketball', 'Tennis'] as const).map((sport) => {
          const active = selectedSport === sport;
          const count = sportCounts[sport];
          return (
            <button
              key={sport}
              type="button"
              onClick={() => setSelectedSport(sport)}
              className={`min-h-[40px] px-4 py-2 rounded-xl border text-xs font-semibold inline-flex items-center gap-2 whitespace-nowrap shrink-0 transition-all cursor-pointer ${
                active
                  ? 'bg-[#00E676] border-[#00E676] text-[#0B0E14] font-bold'
                  : 'bg-[#121721] border-[#2A344B] text-[#94A3B8] hover:text-white'
              }`}
            >
              <Flame className="w-3.5 h-3.5" />
              <span>{sport === 'ALL' ? 'All Live Sports' : sport}</span>
              <span className="font-mono tabular-nums">({count})</span>
            </button>
          );
        })}
      </div>

      {/* Main Content Grid + Bet Slip */}
      <div className="flex flex-col lg:flex-row items-start gap-6">
        <div className="w-full flex-1 min-w-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {liveFixtures.map((fixture) => (
              <MatchCard
                key={fixture.fixture.id}
                fixture={fixture}
                showMicroStats={true}
                subSecondString={formattedSeconds}
              />
            ))}
          </div>
        </div>

        <BetSlipDrawer />
      </div>
    </main>
  );
}
