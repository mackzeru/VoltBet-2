'use client';

import React, { useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Clock,
  MapPin,
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
      { key: 'Ball Possession', label: 'Possession' },
      { key: 'Total Shots', label: 'Total Shots' },
      { key: 'Shots on Goal', label: 'Shots on Target' },
      { key: 'Corner Kicks', label: 'Corners' },
      { key: 'Fouls', label: 'Fouls' },
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
    { id: 'all', label: 'All' },
    { id: 'main', label: 'Main' },
    { id: 'goals', label: 'Goals' },
    { id: 'oddeven', label: 'Odd/Even' },
    { id: 'cards', label: 'Cards' },
    { id: 'penalties', label: 'Penalties' },
    { id: 'halves', label: 'Halves' },
  ];

  return (
    <main className="max-w-7xl mx-auto px-3 sm:px-6 pt-3 sm:pt-4 space-y-4">
      {/* Top Bar */}
      <div className="flex items-center justify-between gap-2">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-[#94A3B8] hover:text-slate-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Lobby</span>
        </Link>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={triggerManualOddsDrift}
            className="min-h-[34px] px-3 py-1 rounded-xl bg-white dark:bg-[#121721] hover:bg-slate-100 dark:hover:bg-[#1E2638] border border-slate-200 dark:border-[#2A344B] text-xs font-semibold text-slate-900 dark:text-white inline-flex items-center gap-1 cursor-pointer"
          >
            <Zap className="w-3.5 h-3.5 text-emerald-600 dark:text-[#00E676]" />
            <span>Pulse Odds</span>
          </button>
          {isLive && (
            <button
              type="button"
              onClick={toggleRandomMarketLock}
              className="min-h-[34px] px-3 py-1 rounded-xl bg-white dark:bg-[#121721] hover:bg-slate-100 dark:hover:bg-[#1E2638] border border-slate-200 dark:border-[#2A344B] text-xs font-semibold text-slate-900 dark:text-white inline-flex items-center gap-1 cursor-pointer"
            >
              <Lock className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
              <span>{isLocked ? 'Unlock' : 'VAR Lock'}</span>
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-col lg:flex-row items-start gap-5 lg:gap-6">
        <div className="w-full flex-1 min-w-0 space-y-4">
          {/* Scoreboard Header Billboard */}
          <section className="rounded-2xl bg-gradient-to-b from-slate-100 to-white dark:from-[#1A2232] dark:to-[#1E2638] border border-slate-200 dark:border-[#2A344B] p-4 sm:p-5 space-y-4 shadow-xs">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600 dark:text-[#94A3B8]">
              <div className="flex items-center gap-2">
                {fixture.league.logo && (
                  <TeamCrest
                    name={fixture.league.name}
                    logo={fixture.league.logo}
                    size="xs"
                  />
                )}
                <span className="font-semibold text-slate-900 dark:text-white">
                  {fixture.league.name}
                </span>
                <span aria-hidden="true">·</span>
                <span>{fixture.league.round}</span>
              </div>

              <span className="inline-flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-emerald-600 dark:text-[#00E676]" />
                <span>{fixture.fixture.venue.name}</span>
              </span>
            </div>

            <div className="grid grid-cols-3 items-center gap-2 sm:gap-4 py-1">
              <div className="flex flex-col items-center text-center gap-2">
                <TeamCrest
                  name={fixture.teams.home.name}
                  logo={fixture.teams.home.logo}
                  shortCode={fixture.teams.home.shortCode}
                  primaryColor={fixture.teams.home.primaryColor}
                  secondaryColor={fixture.teams.home.secondaryColor}
                  size="lg"
                />
                <h1 className="font-display text-sm sm:text-base font-bold text-slate-900 dark:text-white leading-tight">
                  {fixture.teams.home.name}
                </h1>
              </div>

              <div className="flex flex-col items-center justify-center text-center space-y-1">
                {isLive ? (
                  <>
                    <div className="inline-flex items-center gap-1.5 text-xs font-mono tabular-nums font-bold text-[#EF4444]">
                      <span className="w-2 h-2 rounded-full bg-[#EF4444] animate-pulse" />
                      <span>
                        {fixture.fixture.status.short} ·{' '}
                        {fixture.fixture.status.elapsed ?? 45}:{formattedSeconds}
                      </span>
                    </div>
                    <div className="font-mono tabular-nums text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                      {fixture.goals.home ?? 0}{' '}
                      <span className="text-slate-400 dark:text-[#94A3B8]">-</span>{' '}
                      {fixture.goals.away ?? 0}
                    </div>
                    {fixture.score.halftime.home !== null && (
                      <span className="text-[11px] font-mono tabular-nums text-slate-500 dark:text-[#94A3B8]">
                        HT {fixture.score.halftime.home}-{fixture.score.halftime.away}
                      </span>
                    )}
                  </>
                ) : (
                  <>
                    <span className="inline-flex items-center gap-1 text-xs font-mono text-emerald-600 dark:text-[#00E676]">
                      <Clock className="w-3.5 h-3.5" />
                      <span>Kickoff</span>
                    </span>
                    <div className="font-mono tabular-nums text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                      {new Date(fixture.fixture.date).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                  </>
                )}
              </div>

              <div className="flex flex-col items-center text-center gap-2">
                <TeamCrest
                  name={fixture.teams.away.name}
                  logo={fixture.teams.away.logo}
                  shortCode={fixture.teams.away.shortCode}
                  primaryColor={fixture.teams.away.primaryColor}
                  secondaryColor={fixture.teams.away.secondaryColor}
                  size="lg"
                />
                <h2 className="font-display text-sm sm:text-base font-bold text-slate-900 dark:text-white leading-tight">
                  {fixture.teams.away.name}
                </h2>
              </div>
            </div>

            {fixture.events && fixture.events.length > 0 && (
              <div className="pt-3 border-t border-slate-200 dark:border-[#2A344B]">
                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
                  {fixture.events.map((ev, index) => (
                    <div
                      key={`${ev.time.elapsed}-${index}`}
                      className="rounded-xl bg-white dark:bg-[#121721] border border-slate-200 dark:border-[#2A344B] px-2.5 py-1.5 shrink-0 flex items-center gap-2 text-xs"
                    >
                      <span className="font-mono tabular-nums font-bold text-emerald-600 dark:text-[#00E676]">
                        {ev.time.elapsed}&apos;
                      </span>
                      <TeamCrest
                        name={ev.team.name}
                        logo={ev.team.logo}
                        size="xs"
                      />
                      <span className="font-semibold text-slate-900 dark:text-white">
                        {ev.player.name}
                      </span>
                      <span className="text-slate-500 dark:text-[#94A3B8] text-[11px]">
                        {ev.detail}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>

          {/* Match Statistics Visualizer */}
          {statRows.length > 0 && (
            <section className="rounded-2xl bg-white dark:bg-[#1E2638] border border-slate-200 dark:border-[#2A344B] p-4 space-y-3 shadow-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-emerald-600 dark:text-[#00E676]" />
                  <h2 className="font-display text-sm font-bold text-slate-900 dark:text-white">
                    Match Stats
                  </h2>
                </div>
                <span className="text-xs text-slate-500 dark:text-[#94A3B8] font-mono">
                  {fixture.teams.home.shortCode} vs {fixture.teams.away.shortCode}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2.5">
                {statRows.map((row) => (
                  <div key={row.label} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-mono tabular-nums font-bold text-slate-900 dark:text-white">
                        {row.homeDisplay}
                      </span>
                      <span className="text-slate-500 dark:text-[#94A3B8]">
                        {row.label}
                      </span>
                      <span className="font-mono tabular-nums font-bold text-slate-900 dark:text-white">
                        {row.awayDisplay}
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full bg-slate-100 dark:bg-[#121721] overflow-hidden flex">
                      <div
                        className="h-full bg-[#00E676]"
                        style={{ width: `${row.homePct}%` }}
                      />
                      <div
                        className="h-full bg-[#38BDF8]"
                        style={{ width: `${row.awayPct}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Categorized Market Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar p-1 rounded-xl bg-slate-100 dark:bg-[#121721] border border-slate-200 dark:border-[#2A344B]">
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCategory(cat.id)}
                className={`min-h-[36px] px-3.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                  activeCategory === cat.id
                    ? 'bg-[#00E676] text-[#0B0E14] font-bold shadow-2xs'
                    : 'text-slate-600 dark:text-[#94A3B8] hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Collapsible Odds Matrix Blocks */}
          <div className="space-y-3">
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

        <BetSlipDrawer />
      </div>
    </main>
  );
}
