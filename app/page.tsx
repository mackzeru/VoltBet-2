'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
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

  // Only show soccer matches in the main Football Lobby feed
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
      // League filter
      if (selectedLeagueId !== null && fix.league.id !== selectedLeagueId) {
        return false;
      }

      // Search query filter
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        const matchHome = fix.teams.home.name.toLowerCase().includes(q);
        const matchAway = fix.teams.away.name.toLowerCase().includes(q);
        const matchLeague = fix.league.name.toLowerCase().includes(q);
        if (!matchHome && !matchAway && !matchLeague) return false;
      }

      // Tab filter
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
    <main className="max-w-7xl mx-auto px-3 sm:px-6 pt-4 space-y-5">
      {/* Top Navigation League Scroller */}
      <section aria-label="League Filter Scroller" className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
        <button
          type="button"
          onClick={() => setSelectedLeagueId(null)}
          className={`min-h-[40px] px-3.5 py-2 rounded-xl border text-xs font-semibold inline-flex items-center gap-2 whitespace-nowrap shrink-0 transition-all cursor-pointer ${
            selectedLeagueId === null
              ? 'bg-[#00E676] border-[#00E676] text-[#0B0E14] font-bold shadow-[0_0_16px_rgba(0,230,118,0.2)]'
              : 'bg-[#121721] border-[#2A344B] text-[#94A3B8] hover:text-white'
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
              onClick={() =>
                setSelectedLeagueId(isActive ? null : league.id)
              }
              className={`min-h-[40px] px-3.5 py-2 rounded-xl border text-xs font-semibold inline-flex items-center gap-2 whitespace-nowrap shrink-0 transition-all cursor-pointer ${
                isActive
                  ? 'bg-[#00E676] border-[#00E676] text-[#0B0E14] font-bold shadow-[0_0_16px_rgba(0,230,118,0.2)]'
                  : 'bg-[#121721] hover:bg-[#1A2232] border-[#2A344B] text-white'
              }`}
            >
              <span
                className="w-2 h-2 rounded-full shrink-0"
                style={{ backgroundColor: isActive ? '#0B0E14' : league.accentColor }}
              />
              <span>{league.name}</span>
              <span
                className={`font-mono text-[10px] ${
                  isActive ? 'text-[#0B0E14]/80' : 'text-[#94A3B8]'
                }`}
              >
                {league.code}
              </span>
            </button>
          );
        })}
      </section>

      {/* Main Responsive Layout: Left/Center Feed + Right Sticky Bet Slip */}
      <div className="flex flex-col lg:flex-row items-start gap-6">
        {/* Left / Center Feed Column */}
        <div className="w-full flex-1 min-w-0 space-y-5">
          {/* Hero Promotional Banner Carousel */}
          <section className="relative rounded-2xl bg-gradient-to-r from-[#1A2232] via-[#1E2638] to-[#121721] border border-[#2A344B] p-4 sm:p-6 overflow-hidden">
            <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-2 max-w-xl">
                <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#00E676]">
                  <Zap className="w-3.5 h-3.5" />
                  <span>{activePromo.tag}</span>
                </div>

                <h1
                  className="font-display text-xl sm:text-2xl md:text-3xl font-extrabold text-white tracking-tight"
                  style={{ textWrap: 'balance' }}
                >
                  {activePromo.title}
                </h1>

                <p className="text-xs sm:text-sm text-[#94A3B8]">
                  {activePromo.subtitle}
                </p>

                <div className="pt-2 flex flex-wrap items-center gap-2.5">
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
                    className={`min-h-[44px] px-4 py-2 rounded-xl font-bold text-xs sm:text-sm inline-flex items-center gap-2 transition-all cursor-pointer ${
                      isSelected(
                        activePromo.fixtureId,
                        activePromo.marketId,
                        activePromo.selectionName
                      )
                        ? 'bg-white text-[#0B0E14]'
                        : 'bg-[#00E676] hover:bg-[#00C853] text-[#0B0E14] shadow-[0_0_20px_rgba(0,230,118,0.3)]'
                    }`}
                  >
                    <span>
                      Bet {activePromo.selectionName} @
                    </span>
                    <span className="line-through opacity-60 font-mono tabular-nums text-xs">
                      {activePromo.oldOdd}
                    </span>
                    <span className="font-mono tabular-nums font-extrabold">
                      {activePromo.boostedOdd}
                    </span>
                  </button>

                  <Link
                    href={`/matches/${activePromo.fixtureId}`}
                    className="min-h-[44px] px-3.5 py-2 rounded-xl bg-[#121721] hover:bg-[#1A2232] border border-[#2A344B] text-xs font-semibold text-white inline-flex items-center gap-1"
                  >
                    <span>Match Center</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

              {/* Right Brand Emblem & Carousel Controls */}
              <div className="flex sm:flex-col items-center sm:items-end justify-between gap-3 shrink-0">
                <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border border-[#00E676]/40 bg-[#0B0E14]">
                  <Image
                    src="/assets/aistudio/Gemini_Generated_Image_z2jjacz2jjacz2jj_1f18e757.jpeg"
                    alt="VoltBet Featured Match"
                    fill
                    sizes="80px"
                    className="object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleCycleBanner('prev')}
                    className="w-8 h-8 rounded-lg bg-[#121721] hover:bg-[#2A344B] border border-[#2A344B] flex items-center justify-center text-white cursor-pointer"
                    aria-label="Previous promo banner"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="font-mono tabular-nums text-xs text-[#94A3B8] px-1">
                    {bannerIndex + 1}/{PROMO_BANNERS.length}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCycleBanner('next')}
                    className="w-8 h-8 rounded-lg bg-[#121721] hover:bg-[#2A344B] border border-[#2A344B] flex items-center justify-center text-white cursor-pointer"
                    aria-label="Next promo banner"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Tab Filter Bar & Search Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            {/* Segmented Tab Filter Bar */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar p-1 rounded-xl bg-[#121721] border border-[#2A344B]">
              <button
                type="button"
                onClick={() => setActiveTab('live')}
                className={`min-h-[38px] px-3 py-1.5 rounded-lg text-xs font-semibold inline-flex items-center gap-2 whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                  activeTab === 'live'
                    ? 'bg-[#1E2638] text-white border border-[#2A344B]'
                    : 'text-[#94A3B8] hover:text-white'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-[#EF4444] animate-pulse" />
                <span>Live In-Play</span>
                <span className="font-mono tabular-nums text-[#00E676]">
                  ({liveCount})
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('today')}
                className={`min-h-[38px] px-3 py-1.5 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                  activeTab === 'today'
                    ? 'bg-[#1E2638] text-white border border-[#2A344B]'
                    : 'text-[#94A3B8] hover:text-white'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Upcoming Today</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('tomorrow')}
                className={`min-h-[38px] px-3 py-1.5 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                  activeTab === 'tomorrow'
                    ? 'bg-[#1E2638] text-white border border-[#2A344B]'
                    : 'text-[#94A3B8] hover:text-white'
                }`}
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Tomorrow</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('outrights')}
                className={`min-h-[38px] px-3 py-1.5 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                  activeTab === 'outrights'
                    ? 'bg-[#1E2638] text-white border border-[#2A344B]'
                    : 'text-[#94A3B8] hover:text-white'
                }`}
              >
                <Award className="w-3.5 h-3.5" />
                <span>Outrights / Tournaments</span>
              </button>
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:w-60 shrink-0">
              <Search className="w-4 h-4 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search club or league..."
                className="w-full h-10 pl-9 pr-3 rounded-xl bg-[#121721] border border-[#2A344B] focus:border-[#00E676] focus:outline-none text-xs text-white placeholder-[#94A3B8]"
              />
            </div>
          </div>

          {/* Match Card Grid or Outrights View */}
          {activeTab === 'outrights' ? (
            <div className="space-y-4">
              {outrights
                .filter(
                  (o) => selectedLeagueId === null || o.leagueId === selectedLeagueId
                )
                .map((outright) => (
                  <div
                    key={outright.id}
                    className="rounded-2xl bg-[#1E2638] border border-[#2A344B] p-4 space-y-3"
                  >
                    <div className="flex items-center justify-between gap-2 text-xs text-[#94A3B8]">
                      <span>
                        {outright.leagueName} · {outright.country} · Season {outright.season}
                      </span>
                      <span className="font-mono">Closes {outright.deadline}</span>
                    </div>
                    <h3 className="font-display text-base font-bold text-white">
                      {outright.title}
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {outright.favorites.map((fav) => (
                        <div key={fav.teamId} className="flex items-center gap-2">
                          <TeamCrest
                            name={fav.teamName}
                            shortCode={fav.shortCode}
                            primaryColor={fav.primaryColor}
                            size="sm"
                          />
                          <div className="flex-1">
                            <OddsButton
                              label={fav.teamName}
                              odd={fav.odd}
                              selected={isSelected(
                                outright.id,
                                99,
                                fav.teamName
                              )}
                              onClick={() =>
                                toggleSelection({
                                  fixtureId: outright.id,
                                  matchTitle: outright.title,
                                  leagueName: outright.leagueName,
                                  isLive: false,
                                  marketId: 99,
                                  marketName: 'Tournament Outright Winner',
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
            <div className="rounded-2xl bg-[#1E2638] border border-[#2A344B] p-10 text-center space-y-3">
              <p className="text-sm font-semibold text-white">
                No fixtures match your current filter.
              </p>
              <p className="text-xs text-[#94A3B8]">
                Try switching between Live In-Play, Upcoming Today, or clearing your league filter.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSelectedLeagueId(null);
                  setSearchQuery('');
                  setActiveTab('live');
                }}
                className="px-4 py-2 rounded-xl bg-[#00E676] text-[#0B0E14] text-xs font-bold cursor-pointer"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredFixtures.map((fixture) => (
                <MatchCard key={fixture.fixture.id} fixture={fixture} />
              ))}
            </div>
          )}
        </div>

        {/* Right Sticky Bet Slip Sidebar (Desktop) & Floating Bottom Sheet (Mobile) */}
        <BetSlipDrawer />
      </div>
    </main>
  );
}
