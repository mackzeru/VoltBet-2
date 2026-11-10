'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Search,
  Zap,
  ChevronRight,
  ChevronLeft,
  Trophy,
  Calendar,
  Clock,
  Award,
} from 'lucide-react';
import { SUPPORTED_LEAGUES, PROMO_BANNERS } from '@/data/mockApiFootball';
import { useSportsData } from '@/context/SportsDataContext';
import { useBetSlip } from '@/context/BetSlipContext';
import { MatchCard } from '@/components/betting/MatchCard';
import { BetSlipDrawer } from '@/components/betting/BetSlipDrawer';
import { OddsButton } from '@/components/betting/OddsButton';
import { TeamCrest } from '@/components/ui/TeamCrest';

type LobbyTab = 'live' | 'today' | 'tomorrow' | 'outrights';

export default function SportsbookLobbyPage() {
  const {
    fixtures,
    outrights,
    selectedLeagueId,
    setSelectedLeagueId,
    searchQuery,
    setSearchQuery,
  } = useSportsData();

  const { isSelected, toggleSelection } = useBetSlip();

  const [activeTab, setActiveTab] = useState<LobbyTab>('live');
  const [bannerIndex, setBannerIndex] = useState<number>(0);

  const soccerFixtures = useMemo(
    () => fixtures.filter((f) => !f.sport || f.sport === 'Soccer'),
    [fixtures]
  );

  const liveCount = useMemo(
    () =>
      soccerFixtures.filter((f) =>
        ['1H', 'HT', '2H', 'LIVE'].includes(f.fixture.status.short)
      ).length,
    [soccerFixtures]
  );

  const filteredFixtures = useMemo(() => {
    return soccerFixtures.filter((fix) => {
      if (selectedLeagueId !== null && fix.league.id !== selectedLeagueId) {
        return false;
      }

      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        const matchHome = fix.teams.home.name.toLowerCase().includes(q);
        const matchAway = fix.teams.away.name.toLowerCase().includes(q);
        const matchLeague = fix.league.name.toLowerCase().includes(q);
        if (!matchHome && !matchAway && !matchLeague) return false;
      }

      const isLive = ['1H', 'HT', '2H', 'LIVE'].includes(fix.fixture.status.short);
      const isTomorrow = fix.fixture.date.startsWith('2026-11-11');

      if (activeTab === 'live') return isLive;
      if (activeTab === 'today') return !isLive && !isTomorrow;
      if (activeTab === 'tomorrow') return isTomorrow;
      return true;
    });
  }, [soccerFixtures, selectedLeagueId, searchQuery, activeTab]);

  const activePromo = PROMO_BANNERS[bannerIndex] || PROMO_BANNERS[0];

  const handleCycleBanner = (dir: 'prev' | 'next') => {
    if (dir === 'next') {
      setBannerIndex((prev) => (prev + 1) % PROMO_BANNERS.length);
    } else {
      setBannerIndex((prev) => (prev - 1 + PROMO_BANNERS.length) % PROMO_BANNERS.length);
    }
  };

  return (
    <main className="max-w-7xl mx-auto px-3 sm:px-6 pt-3 sm:pt-4 space-y-4">
      {/* Top Navigation League Scroller with Real League Logos */}
      <section
        aria-label="League Filter Scroller"
        className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1"
      >
        <button
          type="button"
          onClick={() => setSelectedLeagueId(null)}
          className={`min-h-[40px] px-3.5 py-1.5 rounded-xl border text-xs font-semibold inline-flex items-center gap-2 whitespace-nowrap shrink-0 transition-all cursor-pointer ${
            selectedLeagueId === null
              ? 'bg-[#00E676] border-[#00E676] text-[#0B0E14] font-bold shadow-sm'
              : 'bg-white dark:bg-[#121721] border-slate-200 dark:border-[#2A344B] text-slate-600 dark:text-[#94A3B8] hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Trophy className="w-3.5 h-3.5" />
          <span>All Leagues</span>
        </button>

        {SUPPORTED_LEAGUES.map((league) => {
          const isActive = selectedLeagueId === league.id;
          return (
            <button
              key={league.id}
              type="button"
              onClick={() => setSelectedLeagueId(isActive ? null : league.id)}
              className={`min-h-[40px] px-3 py-1.5 rounded-xl border text-xs font-semibold inline-flex items-center gap-2 whitespace-nowrap shrink-0 transition-all cursor-pointer ${
                isActive
                  ? 'bg-[#00E676] border-[#00E676] text-[#0B0E14] font-bold shadow-sm'
                  : 'bg-white dark:bg-[#121721] hover:bg-slate-50 dark:hover:bg-[#1A2232] border-slate-200 dark:border-[#2A344B] text-slate-800 dark:text-white'
              }`}
            >
              <TeamCrest
                name={league.name}
                logo={league.logo}
                shortCode={league.shortName}
                primaryColor={league.accentColor}
                size="xs"
              />
              <span>{league.name}</span>
            </button>
          );
        })}
      </section>

      <div className="flex flex-col lg:flex-row items-start gap-5 lg:gap-6">
        <div className="w-full flex-1 min-w-0 space-y-4">
          {/* Hero Promotional Banner with Real Team Logos */}
          <section className="relative rounded-2xl bg-gradient-to-r from-emerald-50 via-white to-slate-100 dark:from-[#1A2232] dark:via-[#1E2638] dark:to-[#121721] border border-slate-200 dark:border-[#2A344B] p-4 sm:p-5 overflow-hidden shadow-xs">
            <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1.5 max-w-xl">
                <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-emerald-600 dark:text-[#00E676]">
                  <Zap className="w-3.5 h-3.5" />
                  <span>{activePromo.tag}</span>
                </div>

                <h1 className="font-display text-lg sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  {activePromo.title}
                </h1>

                <p className="text-xs text-slate-600 dark:text-[#94A3B8]">
                  {activePromo.subtitle}
                </p>

                <div className="pt-2 flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      toggleSelection({
                        fixtureId: activePromo.fixtureId,
                        matchTitle: activePromo.title,
                        leagueName: 'Featured Boost',
                        isLive: true,
                        marketId: activePromo.marketId,
                        marketName: activePromo.marketName,
                        selectionName: activePromo.selectionName,
                        odd: parseFloat(activePromo.boostedOdd),
                      })
                    }
                    className={`min-h-[40px] px-3.5 py-1.5 rounded-xl font-bold text-xs inline-flex items-center gap-1.5 transition-all cursor-pointer ${
                      isSelected(
                        activePromo.fixtureId,
                        activePromo.marketId,
                        activePromo.selectionName
                      )
                        ? 'bg-slate-900 text-white dark:bg-white dark:text-[#0B0E14]'
                        : 'bg-[#00E676] hover:bg-[#00C853] text-[#0B0E14]'
                    }`}
                  >
                    <span>{activePromo.selectionName}</span>
                    <span className="line-through opacity-60 font-mono tabular-nums">
                      {activePromo.oldOdd}
                    </span>
                    <span className="font-mono tabular-nums font-extrabold">
                      {activePromo.boostedOdd}
                    </span>
                  </button>

                  <Link
                    href={`/matches/${activePromo.fixtureId}`}
                    className="min-h-[40px] px-3 py-1.5 rounded-xl bg-white dark:bg-[#121721] hover:bg-slate-100 dark:hover:bg-[#1A2232] border border-slate-200 dark:border-[#2A344B] text-xs font-semibold text-slate-900 dark:text-white inline-flex items-center gap-1"
                  >
                    <span>Markets</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

              {/* Right Matchup Crests & Carousel Arrows */}
              <div className="flex sm:flex-col items-center sm:items-end justify-between gap-3 shrink-0">
                <div className="flex items-center gap-2 bg-white/90 dark:bg-[#0B0E14]/70 border border-slate-200 dark:border-[#2A344B] rounded-2xl px-3 py-2">
                  <TeamCrest
                    name={activePromo.homeName}
                    logo={activePromo.homeLogo}
                    size="md"
                  />
                  <span className="font-mono text-xs font-bold text-slate-500 dark:text-[#94A3B8]">
                    VS
                  </span>
                  <TeamCrest
                    name={activePromo.awayName}
                    logo={activePromo.awayLogo}
                    size="md"
                  />
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleCycleBanner('prev')}
                    className="w-7 h-7 rounded-lg bg-white dark:bg-[#121721] hover:bg-slate-100 dark:hover:bg-[#2A344B] border border-slate-200 dark:border-[#2A344B] flex items-center justify-center text-slate-700 dark:text-white cursor-pointer"
                    aria-label="Previous promo"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                  <span className="font-mono tabular-nums text-[11px] text-slate-500 dark:text-[#94A3B8] px-1">
                    {bannerIndex + 1}/{PROMO_BANNERS.length}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCycleBanner('next')}
                    className="w-7 h-7 rounded-lg bg-white dark:bg-[#121721] hover:bg-slate-100 dark:hover:bg-[#2A344B] border border-slate-200 dark:border-[#2A344B] flex items-center justify-center text-slate-700 dark:text-white cursor-pointer"
                    aria-label="Next promo"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Tab Filter Bar & Search Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div className="flex items-center gap-1 overflow-x-auto no-scrollbar p-1 rounded-xl bg-slate-100 dark:bg-[#121721] border border-slate-200 dark:border-[#2A344B]">
              <button
                type="button"
                onClick={() => setActiveTab('live')}
                className={`min-h-[36px] px-3 py-1.5 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                  activeTab === 'live'
                    ? 'bg-white dark:bg-[#1E2638] text-slate-900 dark:text-white border border-slate-200 dark:border-[#2A344B] shadow-2xs'
                    : 'text-slate-600 dark:text-[#94A3B8] hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-[#EF4444] animate-pulse" />
                <span>Live</span>
                <span className="font-mono tabular-nums text-emerald-600 dark:text-[#00E676]">
                  ({liveCount})
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('today')}
                className={`min-h-[36px] px-3 py-1.5 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                  activeTab === 'today'
                    ? 'bg-white dark:bg-[#1E2638] text-slate-900 dark:text-white border border-slate-200 dark:border-[#2A344B] shadow-2xs'
                    : 'text-slate-600 dark:text-[#94A3B8] hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Today</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('tomorrow')}
                className={`min-h-[36px] px-3 py-1.5 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                  activeTab === 'tomorrow'
                    ? 'bg-white dark:bg-[#1E2638] text-slate-900 dark:text-white border border-slate-200 dark:border-[#2A344B] shadow-2xs'
                    : 'text-slate-600 dark:text-[#94A3B8] hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Tomorrow</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('outrights')}
                className={`min-h-[36px] px-3 py-1.5 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                  activeTab === 'outrights'
                    ? 'bg-white dark:bg-[#1E2638] text-slate-900 dark:text-white border border-slate-200 dark:border-[#2A344B] shadow-2xs'
                    : 'text-slate-600 dark:text-[#94A3B8] hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Award className="w-3.5 h-3.5" />
                <span>Outrights</span>
              </button>
            </div>

            <div className="relative w-full sm:w-56 md:w-64 shrink-0">
              <Search className="w-4 h-4 text-slate-400 dark:text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search team or league..."
                className="w-full h-9 pl-9 pr-3 rounded-xl bg-white dark:bg-[#121721] border border-slate-200 dark:border-[#2A344B] focus:border-[#00E676] focus:outline-none text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-[#94A3B8]"
              />
            </div>
          </div>

          {/* Match Card Grid or Outrights View */}
          {activeTab === 'outrights' ? (
            <div className="space-y-3.5">
              {outrights
                .filter(
                  (o) => selectedLeagueId === null || o.leagueId === selectedLeagueId
                )
                .map((outright) => (
                  <div
                    key={outright.id}
                    className="rounded-2xl bg-white dark:bg-[#1E2638] border border-slate-200 dark:border-[#2A344B] p-4 space-y-3 shadow-xs"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <TeamCrest
                          name={outright.leagueName}
                          logo={outright.leagueLogo}
                          size="xs"
                        />
                        <h3 className="font-display text-sm font-bold text-slate-900 dark:text-white">
                          {outright.title}
                        </h3>
                      </div>
                      <span className="text-xs font-mono text-slate-500 dark:text-[#94A3B8]">
                        {outright.season}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {outright.favorites.map((fav) => (
                        <div key={fav.teamId} className="flex items-center gap-2">
                          <TeamCrest
                            name={fav.teamName}
                            logo={fav.teamLogo}
                            shortCode={fav.shortCode}
                            primaryColor={fav.primaryColor}
                            size="sm"
                          />
                          <div className="flex-1">
                            <OddsButton
                              label={fav.teamName}
                              odd={fav.odd}
                              selected={isSelected(outright.id, 99, fav.teamName)}
                              onClick={() =>
                                toggleSelection({
                                  fixtureId: outright.id,
                                  matchTitle: outright.title,
                                  leagueName: outright.leagueName,
                                  isLive: false,
                                  marketId: 99,
                                  marketName: 'Outright Winner',
                                  selectionName: fav.teamName,
                                  odd: parseFloat(fav.odd),
                                })
                              }
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
            </div>
          ) : filteredFixtures.length === 0 ? (
            <div className="rounded-2xl bg-white dark:bg-[#1E2638] border border-slate-200 dark:border-[#2A344B] p-8 text-center space-y-2.5 shadow-xs">
              <p className="text-sm font-semibold text-slate-900 dark:text-white">
                No matches found
              </p>
              <button
                type="button"
                onClick={() => {
                  setSelectedLeagueId(null);
                  setSearchQuery('');
                  setActiveTab('live');
                }}
                className="px-4 py-1.5 rounded-xl bg-[#00E676] text-[#0B0E14] text-xs font-bold cursor-pointer"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            /* Responsive grid: 1 col on mobile (<640px), 2 cols on tablet (640px+) & desktop */
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {filteredFixtures.map((fixture) => (
                <MatchCard key={fixture.fixture.id} fixture={fixture} />
              ))}
            </div>
          )}
        </div>

        <BetSlipDrawer />
      </div>
    </main>
  );
}
