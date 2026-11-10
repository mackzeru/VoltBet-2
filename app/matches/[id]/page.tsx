'use client';

import React, { useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Clock,
  MapPin,
  UserCheck,
  Activity,
  BarChart3,
  Zap,
  Lock,
} from 'lucide-react';
import { useSportsData } from '@/context/SportsDataContext';
import { MarketAccordion } from '@/components/betting/MarketAccordion';
import { BetSlipDrawer } from '@/components/betting/BetSlipDrawer';
import { TeamCrest } from '@/components/ui/TeamCrest';
import { useOddsTicker } from '@/hooks/useOddsTicker';

type MarketCategoryTab =
  | 'all'
  | 'main'
  | 'goals'
  | 'oddeven'
  | 'cards'
  | 'penalties'
  | 'halves';

export default function MatchDetailsPage() {
  const params = useParams<{ id: string }>();
  const fixtureId = Number(params?.id);
  const { getFixtureById, fixtures, toggleRandomMarketLock, triggerManualOddsDrift } =
    useSportsData();
  const { formattedSeconds } = useOddsTicker(true);

  const fixture = getFixtureById(fixtureId) || fixtures[0];
  const [activeCategory, setActiveCategory] = useState<MarketCategoryTab>('all');

  const isLive = ['1H', 'HT', '2H', 'LIVE'].includes(fixture.fixture.status.short);
  const isLocked = Boolean(fixture.liveMeta?.marketLocked);
  const matchTitle = `${fixture.teams.home.name} vs ${fixture.teams.away.name}`;

  const allMarkets = useMemo(
    () => fixture.odds?.bookmakers?.[0]?.bets || [],
    [fixture]
  );

  const filteredMarkets = useMemo(() => {
    if (activeCategory === 'all') return allMarkets;
    if (activeCategory === 'main')
      return allMarkets.filter((m) => [1, 12].includes(m.id));
    if (activeCategory === 'goals')
      return allMarkets.filter((m) => [5, 8].includes(m.id));
    if (activeCategory === 'oddeven')
      return allMarkets.filter((m) => [20].includes(m.id));
    if (activeCategory === 'cards')
      return allMarkets.filter((m) => [26].includes(m.id));
    if (activeCategory === 'penalties')
      return allMarkets.filter((m) => [40].includes(m.id));
    if (activeCategory === 'halves')
      return allMarkets.filter((m) => [13].includes(m.id));
    return allMarkets;
  }, [allMarkets, activeCategory]);

  const statRows = useMemo(() => {
    const homeStats = fixture.statistics?.[0]?.statistics || [];
    const awayStats = fixture.statistics?.[1]?.statistics || [];
    const statLabels: Array<{
      key: string;
      label: string;
    }> = [
      { key: 'Ball Possession', label: 'Possession %' },
      { key: 'Total Shots', label: 'Total Shots' },
      { key: 'Shots on Goal', label: 'Shots on Target' },
      { key: 'Corner Kicks', label: 'Corner Kicks' },
      { key: 'Fouls', label: 'Fouls Committed' },
      { key: 'Yellow Cards', label: 'Yellow Cards' },
      { key: 'Red Cards', label: 'Red Cards' },
    ];

    return statLabels.map(({ key, label }) => {
      const hValRaw = homeStats.find((s) => s.type === key)?.value ?? 0;
      const aValRaw = awayStats.find((s) => s.type === key)?.value ?? 0;
      const hNum = parseFloat(String(hValRaw).replace('%', '')) || 0;
      const aNum = parseFloat(String(aValRaw).replace('%', '')) || 0;
      const total = hNum + aNum;
      const homePct = total > 0 ? Math.round((hNum / total) * 100) : 50;
      return {
        label,
        homeDisplay: String(hValRaw),
        awayDisplay: String(aValRaw),
        homePct,
        awayPct: 100 - homePct,
      };
    });
  }, [fixture.statistics]);

  const categories: Array<{ id: MarketCategoryTab; label: string }> = [
    { id: 'all', label: 'All Markets' },
    { id: 'main', label: 'Main (1X2, Double Chance)' },
    { id: 'goals', label: 'Goals (O/U, BTTS)' },
    { id: 'oddeven', label: 'Odd/Even' },
    { id: 'cards', label: 'Cards & Discipline' },
    { id: 'penalties', label: 'Penalties' },
    { id: 'halves', label: 'Halves' },
  ];

  return (
    <main className="max-w-7xl mx-auto px-3 sm:px-6 pt-4 space-y-5">
      {/* Top Breadcrumb & Quick Simulation Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-[#94A3B8] hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Sportsbook Lobby</span>
        </Link>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={triggerManualOddsDrift}
            className="min-h-[36px] px-3 py-1.5 rounded-xl bg-[#121721] hover:bg-[#1E2638] border border-[#2A344B] text-xs font-semibold text-white inline-flex items-center gap-1.5 cursor-pointer"
          >
            <Zap className="w-3.5 h-3.5 text-[#00E676]" />
            <span>Pulse Odds</span>
          </button>
          {isLive && (
            <button
              type="button"
              onClick={toggleRandomMarketLock}
              className="min-h-[36px] px-3 py-1.5 rounded-xl bg-[#121721] hover:bg-[#1E2638] border border-[#2A344B] text-xs font-semibold text-white inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Lock className="w-3.5 h-3.5 text-amber-400" />
              <span>{isLocked ? 'Unlock Markets' : 'Simulate VAR Lock'}</span>
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-col lg:flex-row items-start gap-6">
        {/* Main Match Detail Column */}
        <div className="w-full flex-1 min-w-0 space-y-5">
          {/* Scoreboard Header Billboard */}
          <section className="rounded-2xl bg-gradient-to-b from-[#1A2232] to-[#1E2638] border border-[#2A344B] p-4 sm:p-6 space-y-5">
            {/* Metadata Line */}
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[#94A3B8]">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="font-semibold text-white">{fixture.league.name}</span>
                <span aria-hidden="true">·</span>
                <span>{fixture.league.country}</span>
                <span aria-hidden="true">·</span>
                <span>{fixture.league.round}</span>
              </div>

              <div className="flex items-center gap-3">
                <span className="inline-flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-[#00E676]" />
                  <span>
                    {fixture.fixture.venue.name}, {fixture.fixture.venue.city}
                  </span>
                </span>
                <span className="hidden sm:inline-flex items-center gap-1">
                  <UserCheck className="w-3.5 h-3.5 text-[#94A3B8]" />
                  <span>{fixture.fixture.referee}</span>
                </span>
              </div>
            </div>

            {/* Scoreboard Teams & Scoreline */}
            <div className="grid grid-cols-3 items-center gap-2 sm:gap-4 py-2">
              {/* Home Team */}
              <div className="flex flex-col items-center text-center gap-2">
                <TeamCrest
                  name={fixture.teams.home.name}
                  shortCode={fixture.teams.home.shortCode}
                  primaryColor={fixture.teams.home.primaryColor}
                  size="lg"
                />
                <h1 className="font-display text-sm sm:text-lg font-bold text-white leading-tight">
                  {fixture.teams.home.name}
                </h1>
              </div>

              {/* Center Score & Clock */}
              <div className="flex flex-col items-center justify-center text-center space-y-1.5">
                {isLive ? (
                  <>
                    <div className="inline-flex items-center gap-1.5 text-xs font-mono tabular-nums font-bold text-[#EF4444]">
                      <span className="w-2 h-2 rounded-full bg-[#EF4444] animate-pulse" />
                      <span>
                        {fixture.fixture.status.short} ·{' '}
                        {fixture.fixture.status.elapsed ?? 45}:{formattedSeconds}
                      </span>
                    </div>
                    <div className="font-mono tabular-nums text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                      {fixture.goals.home ?? 0}{' '}
                      <span className="text-[#94A3B8]">-</span>{' '}
                      {fixture.goals.away ?? 0}
                    </div>
                    {fixture.score.halftime.home !== null && (
                      <span className="text-xs font-mono tabular-nums text-[#94A3B8]">
                        HT: {fixture.score.halftime.home} - {fixture.score.halftime.away}
                      </span>
                    )}
                  </>
                ) : (
                  <>
                    <span className="inline-flex items-center gap-1 text-xs font-mono text-[#00E676]">
                      <Clock className="w-3.5 h-3.5" />
                      <span>Pre-Match Kickoff</span>
                    </span>
                    <div className="font-mono tabular-nums text-xl sm:text-2xl font-bold text-white">
                      {new Date(fixture.fixture.date).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                    <span className="text-xs text-[#94A3B8]">
                      {new Date(fixture.fixture.date).toLocaleDateString([], {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </>
                )}
              </div>

              {/* Away Team */}
              <div className="flex flex-col items-center text-center gap-2">
                <TeamCrest
                  name={fixture.teams.away.name}
                  shortCode={fixture.teams.away.shortCode}
                  primaryColor={fixture.teams.away.primaryColor}
                  size="lg"
                />
                <h2 className="font-display text-sm sm:text-lg font-bold text-white leading-tight">
                  {fixture.teams.away.name}
                </h2>
              </div>
            </div>

            {/* Live Match Event Ticker (Goals, Cards, Substitutions) */}
            {fixture.events && fixture.events.length > 0 && (
              <div className="pt-4 border-t border-[#2A344B] space-y-2.5">
                <div className="flex items-center justify-between text-xs text-[#94A3B8]">
                  <span className="inline-flex items-center gap-1.5 font-semibold text-white">
                    <Activity className="w-3.5 h-3.5 text-[#00E676]" />
                    <span>Chronological Match Event Ticker</span>
                  </span>
                  <span className="font-mono">{fixture.events.length} Events</span>
                </div>

                <div className="flex items-center gap-2.5 overflow-x-auto no-scrollbar pb-1">
                  {fixture.events.map((ev, index) => (
                    <div
                      key={`${ev.time.elapsed}-${index}`}
                      className="rounded-xl bg-[#121721] border border-[#2A344B] px-3 py-2 shrink-0 flex items-center gap-2 text-xs"
                    >
                      <span className="font-mono tabular-nums font-bold text-[#00E676]">
                        {ev.time.elapsed}&apos;
                      </span>
                      <span
                        className={`w-2 h-2 rounded-full shrink-0 ${
                          ev.type === 'Goal'
                            ? 'bg-[#00E676]'
                            : ev.detail === 'Red Card'
                            ? 'bg-[#EF4444]'
                            : 'bg-amber-400'
                        }`}
                      />
                      <div>
                        <span className="font-semibold text-white">{ev.player.name}</span>
                        <span className="text-[#94A3B8]">
                          {' '}
                          · {ev.detail} ({ev.team.name})
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>

          {/* Match Statistics Visualizer */}
          {statRows.length > 0 && (
            <section className="rounded-2xl bg-[#1E2638] border border-[#2A344B] p-4 sm:p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-[#00E676]" />
                  <h2 className="font-display text-sm sm:text-base font-bold text-white">
                    Match Statistics Comparison
                  </h2>
                </div>
                <div className="text-xs text-[#94A3B8] font-mono">
                  {fixture.teams.home.shortCode || 'HOME'} vs{' '}
                  {fixture.teams.away.shortCode || 'AWAY'}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
                {statRows.map((row) => (
                  <div key={row.label} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-mono tabular-nums font-bold text-white">
                        {row.homeDisplay}
                      </span>
                      <span className="text-[#94A3B8]">{row.label}</span>
                      <span className="font-mono tabular-nums font-bold text-white">
                        {row.awayDisplay}
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-[#121721] overflow-hidden flex">
                      <div
                        className="h-full bg-[#00E676] transition-all duration-300"
                        style={{ width: `${row.homePct}%` }}
                      />
                      <div
                        className="h-full bg-[#38BDF8] transition-all duration-300"
                        style={{ width: `${row.awayPct}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Categorized Market Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar p-1 rounded-xl bg-[#121721] border border-[#2A344B]">
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCategory(cat.id)}
                className={`min-h-[38px] px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                  activeCategory === cat.id
                    ? 'bg-[#00E676] text-[#0B0E14] font-bold'
                    : 'text-[#94A3B8] hover:text-white'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Collapsible Odds Matrix Blocks */}
          <div className="space-y-3.5">
            {filteredMarkets.map((market) => (
              <MarketAccordion
                key={market.id}
                fixtureId={fixture.fixture.id}
                matchTitle={matchTitle}
                leagueName={fixture.league.name}
                isLive={isLive}
                isLocked={isLocked}
                market={market}
                defaultOpen={true}
              />
            ))}
          </div>
        </div>

        {/* Persistent Universal Bet Slip */}
        <BetSlipDrawer />
      </div>
    </main>
  );
}
