'use client';

import React from 'react';
import Link from 'next/link';
import { ChevronRight, Flame, Lock, Zap } from 'lucide-react';
import { ApiFootballFixture } from '@/types/api-football';
import { useBetSlip } from '@/context/BetSlipContext';
import { OddsButton } from '@/components/betting/OddsButton';
import { TeamCrest } from '@/components/ui/TeamCrest';

interface MatchCardProps {
  fixture: ApiFootballFixture;
  showMicroStats?: boolean;
  subSecondString?: string;
}

export function MatchCard({
  fixture,
  showMicroStats = false,
  subSecondString,
}: MatchCardProps) {
  const { isSelected, toggleSelection } = useBetSlip();

  const isLive = ['1H', 'HT', '2H', 'LIVE'].includes(fixture.fixture.status.short);
  const matchTitle = `${fixture.teams.home.name} vs ${fixture.teams.away.name}`;
  const isLocked = Boolean(fixture.liveMeta?.marketLocked);

  const bookmaker = fixture.odds?.bookmakers?.[0];
  const mainMarket = bookmaker?.bets.find((b) => b.id === 1);
  const homeOdd = mainMarket?.values.find((v) => v.value === 'Home');
  const drawOdd = mainMarket?.values.find((v) => v.value === 'Draw');
  const awayOdd = mainMarket?.values.find((v) => v.value === 'Away');

  const totalMarketsCount =
    bookmaker?.bets.reduce((acc, b) => acc + b.values.length, 24) || 42;

  const kickoffTime = new Date(fixture.fixture.date).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  const handleSelectOdd = (
    e: React.MouseEvent<HTMLButtonElement>,
    selectionName: string,
    oddStr: string
  ) => {
    e.preventDefault();
    e.stopPropagation();
    const numericOdd = parseFloat(oddStr);
    if (isNaN(numericOdd)) return;

    toggleSelection({
      fixtureId: fixture.fixture.id,
      matchTitle,
      leagueName: fixture.league.name,
      isLive,
      marketId: 1,
      marketName: '1X2',
      selectionName,
      odd: numericOdd,
    });
  };

  return (
    <article className="rounded-2xl bg-[#1E2638] border border-[#2A344B] hover:border-[#2A344B]/90 p-3.5 transition-colors flex flex-col justify-between gap-3">
      {/* Top Row: League Logo + League Name & Live/Kickoff Time */}
      <div className="flex items-center justify-between gap-2 text-xs text-[#94A3B8]">
        <div className="flex items-center gap-2 min-w-0 truncate">
          {fixture.league.logo && (
            <TeamCrest
              name={fixture.league.name}
              logo={fixture.league.logo}
              size="xs"
            />
          )}
          <span className="font-medium text-white truncate">
            {fixture.league.name}
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0 font-mono tabular-nums">
          {isLive ? (
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#EF4444]">
              <span className="w-2 h-2 rounded-full bg-[#EF4444] animate-pulse" />
              <span>
                {fixture.fixture.status.short}{' '}
                {fixture.fixture.status.elapsed
                  ? `${fixture.fixture.status.elapsed}${
                      subSecondString ? `:${subSecondString}` : "'"
                    }`
                  : 'LIVE'}
              </span>
            </span>
          ) : (
            <span className="text-[#94A3B8] font-medium">{kickoffTime}</span>
          )}
        </div>
      </div>

      {/* Teams & Scoreline Section */}
      <Link
        href={`/matches/${fixture.fixture.id}`}
        className="group block space-y-2 focus:outline-none"
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <TeamCrest
              name={fixture.teams.home.name}
              logo={fixture.teams.home.logo}
              shortCode={fixture.teams.home.shortCode}
              primaryColor={fixture.teams.home.primaryColor}
              secondaryColor={fixture.teams.home.secondaryColor}
              size="sm"
            />
            <span className="text-sm font-semibold text-white group-hover:text-[#00E676] transition-colors truncate">
              {fixture.teams.home.name}
            </span>
          </div>
          {isLive && (
            <span className="font-mono tabular-nums text-base font-bold text-white shrink-0">
              {fixture.goals.home ?? 0}
            </span>
          )}
        </div>

        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <TeamCrest
              name={fixture.teams.away.name}
              logo={fixture.teams.away.logo}
              shortCode={fixture.teams.away.shortCode}
              primaryColor={fixture.teams.away.primaryColor}
              secondaryColor={fixture.teams.away.secondaryColor}
              size="sm"
            />
            <span className="text-sm font-semibold text-white group-hover:text-[#00E676] transition-colors truncate">
              {fixture.teams.away.name}
            </span>
          </div>
          {isLive && (
            <span className="font-mono tabular-nums text-base font-bold text-white shrink-0">
              {fixture.goals.away ?? 0}
            </span>
          )}
        </div>
      </Link>

      {/* Live Micro-Stats Strip */}
      {(showMicroStats || isLive) && fixture.liveMeta && (
        <div className="flex items-center justify-between gap-2 pt-1 border-t border-[#2A344B]/60 text-[11px] text-[#94A3B8] font-mono tabular-nums">
          <span>
            Attacks {fixture.liveMeta.dangerousAttacksHome}-{fixture.liveMeta.dangerousAttacksAway} · Corners {fixture.liveMeta.recentCorners}
          </span>

          <span
            className={`inline-flex items-center gap-1 font-sans text-[11px] font-medium truncate ${
              isLocked ? 'text-amber-400' : 'text-[#00E676]'
            }`}
          >
            {isLocked ? (
              <>
                <Lock className="w-3 h-3 shrink-0" />
                <span>{fixture.liveMeta.pressureState}</span>
              </>
            ) : (
              <>
                <Flame className="w-3 h-3 shrink-0" />
                <span>{fixture.liveMeta.pressureState}</span>
              </>
            )}
          </span>
        </div>
      )}

      {/* Quick-Bet 1X2 Market Odds Bar */}
      {mainMarket && (
        <div className="grid grid-cols-3 gap-2">
          {homeOdd && (
            <OddsButton
              label="1"
              odd={homeOdd.odd}
              drift={homeOdd.drift}
              locked={isLocked}
              selected={isSelected(fixture.fixture.id, 1, 'Home')}
              onClick={(e) => handleSelectOdd(e, 'Home', homeOdd.odd)}
            />
          )}
          {drawOdd && (
            <OddsButton
              label="X"
              odd={drawOdd.odd}
              drift={drawOdd.drift}
              locked={isLocked}
              selected={isSelected(fixture.fixture.id, 1, 'Draw')}
              onClick={(e) => handleSelectOdd(e, 'Draw', drawOdd.odd)}
            />
          )}
          {awayOdd && (
            <OddsButton
              label="2"
              odd={awayOdd.odd}
              drift={awayOdd.drift}
              locked={isLocked}
              selected={isSelected(fixture.fixture.id, 1, 'Away')}
              onClick={(e) => handleSelectOdd(e, 'Away', awayOdd.odd)}
            />
          )}
        </div>
      )}

      {/* Footer Row: Boost or Venue + Deep Market Expander */}
      <div className="flex items-center justify-between gap-2 pt-1 border-t border-[#2A344B]/60">
        {fixture.featuredBoost ? (
          <div className="inline-flex items-center gap-1.5 text-xs text-[#00E676] truncate">
            <Zap className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate font-medium">
              {fixture.featuredBoost.selectionName}{' '}
              <span className="font-mono tabular-nums font-bold">
                {fixture.featuredBoost.boostedTo}
              </span>
            </span>
          </div>
        ) : (
          <span className="text-[11px] text-[#94A3B8] truncate">
            {fixture.fixture.venue.name}
          </span>
        )}

        <Link
          href={`/matches/${fixture.fixture.id}`}
          className="inline-flex items-center gap-0.5 text-xs font-semibold text-white hover:text-[#00E676] transition-colors whitespace-nowrap shrink-0"
        >
          <span>+{totalMarketsCount}</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </article>
  );
}
