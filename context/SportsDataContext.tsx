'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  ApiFootballFixture,
  OutrightTournamentMarket,
} from '@/types/api-football';
import {
  INITIAL_API_FOOTBALL_FIXTURES,
  MOCK_OUTRIGHTS,
} from '@/data/mockApiFootball';

interface SportsDataContextValue {
  fixtures: ApiFootballFixture[];
  outrights: OutrightTournamentMarket[];
  selectedLeagueId: number | null;
  setSelectedLeagueId: (id: number | null) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  isLiveSimulationEnabled: boolean;
  setIsLiveSimulationEnabled: (enabled: boolean) => void;
  lastDriftTimestamp: number | null;
  triggerManualOddsDrift: () => void;
  toggleRandomMarketLock: () => void;
  getFixtureById: (id: number) => ApiFootballFixture | undefined;
}

const SportsDataContext = createContext<SportsDataContextValue | undefined>(undefined);

export function SportsDataProvider({ children }: { children: React.ReactNode }) {
  const [fixtures, setFixtures] = useState<ApiFootballFixture[]>(INITIAL_API_FOOTBALL_FIXTURES);
  const [outrights] = useState<OutrightTournamentMarket[]>(MOCK_OUTRIGHTS);
  const [selectedLeagueId, setSelectedLeagueId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLiveSimulationEnabled, setIsLiveSimulationEnabled] = useState<boolean>(true);
  const [lastDriftTimestamp, setLastDriftTimestamp] = useState<number | null>(null);

  const mutateRandomOdds = useCallback(() => {
    const now = Date.now();
    setLastDriftTimestamp(now);

    setFixtures((prevFixtures) => {
      // Pick 2 or 3 random fixtures to experience an odds tick
      const indicesToUpdate = new Set<number>();
      const count = Math.min(3, prevFixtures.length);
      while (indicesToUpdate.size < count) {
        indicesToUpdate.add(Math.floor(Math.random() * prevFixtures.length));
      }

      return prevFixtures.map((fix, idx) => {
        if (!indicesToUpdate.has(idx) || !fix.odds?.bookmakers?.[0]) {
          // Clear stale drift animations older than 2.2s
          if (!fix.odds?.bookmakers?.[0]) return fix;
          return {
            ...fix,
            odds: {
              ...fix.odds,
              bookmakers: fix.odds.bookmakers.map((bm) => ({
                ...bm,
                bets: bm.bets.map((bet) => ({
                  ...bet,
                  values: bet.values.map((val) =>
                    val.lastUpdated && now - val.lastUpdated > 2200
                      ? { ...val, drift: null }
                      : val
                  ),
                })),
              })),
            },
          };
        }

        const bookmaker = fix.odds.bookmakers[0];
        // Pick 1 or 2 markets in this fixture (always include 1X2 so cards visibly pulse)
        const targetMarketIds = new Set<number>([1]);
        const randomMarket = bookmaker.bets[Math.floor(Math.random() * bookmaker.bets.length)];
        if (randomMarket) targetMarketIds.add(randomMarket.id);

        const updatedBets = bookmaker.bets.map((bet) => {
          if (!targetMarketIds.has(bet.id)) return bet;

          const valueIndexToShift = Math.floor(Math.random() * bet.values.length);
          const updatedValues = bet.values.map((v, vIdx) => {
            if (vIdx !== valueIndexToShift) {
              return v.lastUpdated && now - v.lastUpdated > 2200
                ? { ...v, drift: null }
                : v;
            }
            const currentNumeric = parseFloat(v.odd);
            if (isNaN(currentNumeric) || currentNumeric <= 1.04) return v;

            const delta = (Math.floor(Math.random() * 8) + 3) / 100; // 0.03 to 0.10
            const goUp = Math.random() > 0.48;
            const nextVal = goUp
              ? Math.min(25.0, currentNumeric + delta)
              : Math.max(1.05, currentNumeric - delta);
            const nextStr = nextVal.toFixed(2);
            if (nextStr === v.odd) return v;

            return {
              ...v,
              previousOdd: v.odd,
              odd: nextStr,
              drift: goUp ? ('up' as const) : ('down' as const),
              lastUpdated: now,
            };
          });

          return {
            ...bet,
            values: updatedValues,
          };
        });

        // Also update live dangerous attacks slightly if live
        const isLiveMatch = ['1H', '2H', 'LIVE'].includes(fix.fixture.status.short);
        const nextLiveMeta =
          isLiveMatch && fix.liveMeta
            ? {
                ...fix.liveMeta,
                dangerousAttacksHome:
                  fix.liveMeta.dangerousAttacksHome + (Math.random() > 0.5 ? 1 : 0),
                dangerousAttacksAway:
                  fix.liveMeta.dangerousAttacksAway + (Math.random() > 0.5 ? 1 : 0),
              }
            : fix.liveMeta;

        return {
          ...fix,
          liveMeta: nextLiveMeta,
          odds: {
            ...fix.odds,
            bookmakers: [
              {
                ...bookmaker,
                bets: updatedBets,
              },
              ...fix.odds.bookmakers.slice(1),
            ],
          },
        };
      });
    });
  }, []);

  const toggleRandomMarketLock = useCallback(() => {
    setFixtures((prev) => {
      const liveIndices = prev
        .map((f, i) => (['1H', '2H', 'LIVE'].includes(f.fixture.status.short) ? i : -1))
        .filter((i) => i !== -1);

      if (liveIndices.length === 0) return prev;
      const chosenIdx = liveIndices[Math.floor(Math.random() * liveIndices.length)];

      return prev.map((fix, idx) => {
        if (idx !== chosenIdx || !fix.liveMeta) return fix;
        const nextLocked = !fix.liveMeta.marketLocked;
        const pressureStates: Array<NonNullable<ApiFootballFixture['liveMeta']>['pressureState']> = [
          'VAR / Penalty Review',
          'Corner Danger',
          'Home Attacking',
          'Away Attacking',
        ];
        const nextState = nextLocked
          ? pressureStates[Math.floor(Math.random() * 2)]
          : 'Home Attacking';

        return {
          ...fix,
          liveMeta: {
            ...fix.liveMeta,
            marketLocked: nextLocked,
            pressureState: nextState,
          },
        };
      });
    });
  }, []);

  // Periodic live odds drift every 3.8s when enabled
  useEffect(() => {
    if (!isLiveSimulationEnabled) return;
    const interval = setInterval(() => {
      mutateRandomOdds();
    }, 3800);
    return () => clearInterval(interval);
  }, [isLiveSimulationEnabled, mutateRandomOdds]);

  // Periodic live match minute progression every 25s
  useEffect(() => {
    if (!isLiveSimulationEnabled) return;
    const clockInterval = setInterval(() => {
      setFixtures((prev) =>
        prev.map((f) => {
          if (
            ['1H', '2H'].includes(f.fixture.status.short) &&
            typeof f.fixture.status.elapsed === 'number' &&
            f.fixture.status.elapsed < 90
          ) {
            return {
              ...f,
              fixture: {
                ...f.fixture,
                status: {
                  ...f.fixture.status,
                  elapsed: f.fixture.status.elapsed + 1,
                },
              },
            };
          }
          return f;
        })
      );
    }, 25000);
    return () => clearInterval(clockInterval);
  }, [isLiveSimulationEnabled]);

  const getFixtureById = useCallback(
    (id: number) => fixtures.find((f) => f.fixture.id === id),
    [fixtures]
  );

  return (
    <SportsDataContext.Provider
      value={{
        fixtures,
        outrights,
        selectedLeagueId,
        setSelectedLeagueId,
        searchQuery,
        setSearchQuery,
        isLiveSimulationEnabled,
        setIsLiveSimulationEnabled,
        lastDriftTimestamp,
        triggerManualOddsDrift: mutateRandomOdds,
        toggleRandomMarketLock,
        getFixtureById,
      }}
    >
      {children}
    </SportsDataContext.Provider>
  );
}

export function useSportsData() {
  const ctx = useContext(SportsDataContext);
  if (!ctx) {
    throw new Error('useSportsData must be used within a SportsDataProvider');
  }
  return ctx;
}
