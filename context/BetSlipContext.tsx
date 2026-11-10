'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from 'react';
import {
  BetSelection,
  BetSlipMode,
  PlacedBet,
} from '@/types/api-football';
import { useSportsData } from '@/context/SportsDataContext';
import { useWallet } from '@/context/WalletContext';
import { useTelegram } from '@/hooks/useTelegram';

interface ToggleSelectionInput {
  fixtureId: number;
  matchTitle: string;
  leagueName: string;
  isLive: boolean;
  marketId: number;
  marketName: string;
  selectionName: string;
  odd: number;
}

interface BetSlipContextValue {
  selections: BetSelection[];
  mode: BetSlipMode;
  setMode: (mode: BetSlipMode) => void;
  multiStake: number;
  setMultiStake: (stake: number) => void;
  isDrawerOpen: boolean;
  setIsDrawerOpen: (open: boolean) => void;
  placedBets: PlacedBet[];
  lastPlacedReceipt: PlacedBet | null;
  clearLastReceipt: () => void;
  hasDriftedSelections: boolean;
  hasSuspendedSelections: boolean;
  totalStake: number;
  combinedMultiOdds: number;
  estimatedPayout: number;
  inPlayExposure: number;
  isSelected: (fixtureId: number, marketId: number, selectionName: string) => boolean;
  toggleSelection: (input: ToggleSelectionInput) => void;
  removeSelection: (selectionId: string) => void;
  updateSingleStake: (selectionId: string, stake: number) => void;
  clearSlip: () => void;
  acceptOddsChanges: () => void;
  placeBet: () => { success: boolean; error?: string; bet?: PlacedBet };
  cashOutBet: (betId: string) => boolean;
  simulateSettleOpenBets: (outcome: 'WON' | 'LOST') => number;
}

const BetSlipContext = createContext<BetSlipContextValue | undefined>(undefined);

const INITIAL_PLACED_BETS: PlacedBet[] = [
  {
    id: '#BET-89421-ET',
    createdAt: '2026-11-10 19:42',
    mode: 'multi',
    legs: [
      {
        selectionId: '103901-1-Home',
        fixtureId: 103901,
        matchTitle: 'Arsenal vs Manchester City',
        leagueName: 'Premier League',
        marketName: 'Match Winner',
        selectionName: 'Home',
        odd: 1.62,
        legStatus: 'PENDING',
      },
      {
        selectionId: '114002-8-Yes',
        fixtureId: 114002,
        matchTitle: 'Real Madrid vs FC Barcelona',
        leagueName: 'La Liga',
        marketName: 'Both Teams To Score',
        selectionName: 'Yes',
        odd: 1.45,
        legStatus: 'WON',
      },
    ],
    totalStake: 2500,
    totalOdds: 2.35,
    potentialPayout: 5875.0,
    status: 'OPEN',
    cashoutOffer: 3420.0,
  },
  {
    id: '#BET-87109-ET',
    createdAt: '2026-11-09 22:15',
    mode: 'single',
    legs: [
      {
        selectionId: '107803-5-Over 2.5',
        fixtureId: 107803,
        matchTitle: 'Bayern Munich vs Borussia Dortmund',
        leagueName: 'Bundesliga',
        marketName: 'Goals Over/Under',
        selectionName: 'Over 2.5',
        odd: 1.55,
        legStatus: 'WON',
      },
    ],
    totalStake: 4000,
    totalOdds: 1.55,
    potentialPayout: 6200.0,
    status: 'WON',
    cashoutOffer: null,
    settledPayout: 6200.0,
    settledAt: '2026-11-10 19:10',
  },
  {
    id: '#BET-85032-ET',
    createdAt: '2026-11-08 20:00',
    mode: 'multi',
    legs: [
      {
        selectionId: '113504-26-Yes',
        fixtureId: 113504,
        matchTitle: 'Inter Milan vs Juventus',
        leagueName: 'Serie A',
        marketName: 'Red Card in Match',
        selectionName: 'Yes',
        odd: 4.1,
        legStatus: 'LOST',
      },
    ],
    totalStake: 1000,
    totalOdds: 4.1,
    potentialPayout: 4100.0,
    status: 'LOST',
    cashoutOffer: null,
    settledPayout: 0,
    settledAt: '2026-11-08 22:00',
  },
];

const BETS_STORAGE_KEY = 'voltbet_placed_bets_v1';

export function BetSlipProvider({ children }: { children: React.ReactNode }) {
  const { fixtures } = useSportsData();
  const { deductStake, creditWinnings } = useWallet();
  const { hapticImpact, hapticNotification } = useTelegram();

  const [rawSelections, setSelections] = useState<BetSelection[]>([]);
  const [mode, setMode] = useState<BetSlipMode>('multi');
  const [multiStake, setMultiStake] = useState<number>(500);
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  const [placedBets, setPlacedBets] = useState<PlacedBet[]>(INITIAL_PLACED_BETS);
  const [lastPlacedReceipt, setLastPlacedReceipt] = useState<PlacedBet | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const saved = localStorage.getItem(BETS_STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) setPlacedBets(parsed);
        }
      } catch {
        // ignore
      }
      setHydrated(true);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(BETS_STORAGE_KEY, JSON.stringify(placedBets));
    } catch {
      // ignore
    }
  }, [placedBets, hydrated]);

  // Derive live-synced selections from rawSelections + live fixtures
  const selections = useMemo(() => {
    return rawSelections.map((sel) => {
      const fix = fixtures.find((f) => f.fixture.id === sel.fixtureId);
      if (!fix || !fix.odds?.bookmakers?.[0]) return sel;

      const isMarketLocked = Boolean(fix.liveMeta?.marketLocked);
      const market = fix.odds.bookmakers[0].bets.find((b) => b.id === sel.marketId);
      const oddObj = market?.values.find((v) => v.value === sel.selectionName);

      if (!oddObj) return sel;
      const liveOddNum = parseFloat(oddObj.odd);
      if (isNaN(liveOddNum)) return sel;

      const driftDirection: 'up' | 'down' | null =
        liveOddNum > sel.lockedOdd + 0.001
          ? 'up'
          : liveOddNum < sel.lockedOdd - 0.001
          ? 'down'
          : null;

      return {
        ...sel,
        odd: liveOddNum,
        driftDirection,
        suspended: isMarketLocked,
      };
    });
  }, [rawSelections, fixtures]);

  // Periodically fluctuate cashout offers on OPEN placed bets
  useEffect(() => {
    const interval = setInterval(() => {
      setPlacedBets((prevBets) =>
        prevBets.map((bet) => {
          if (bet.status !== 'OPEN' || !bet.cashoutOffer) return bet;
          const jitter = (Math.random() - 0.46) * 35;
          const nextOffer = Math.max(
            bet.totalStake * 0.45,
            Math.min(bet.potentialPayout * 0.92, bet.cashoutOffer + jitter)
          );
          return {
            ...bet,
            cashoutOffer: Number(nextOffer.toFixed(2)),
          };
        })
      );
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const isSelected = useCallback(
    (fixtureId: number, marketId: number, selectionName: string) => {
      const id = `${fixtureId}-${marketId}-${selectionName}`;
      return selections.some((s) => s.selectionId === id);
    },
    [selections]
  );

  const toggleSelection = useCallback(
    (input: ToggleSelectionInput) => {
      const selectionId = `${input.fixtureId}-${input.marketId}-${input.selectionName}`;
      hapticImpact('medium');

      setSelections((prev) => {
        const exists = prev.some((s) => s.selectionId === selectionId);
        if (exists) {
          return prev.filter((s) => s.selectionId !== selectionId);
        }

        // Replace conflicting selection from the same fixture & market
        const filtered = prev.filter(
          (s) => !(s.fixtureId === input.fixtureId && s.marketId === input.marketId)
        );

        const newItem: BetSelection = {
          selectionId,
          fixtureId: input.fixtureId,
          matchTitle: input.matchTitle,
          leagueName: input.leagueName,
          isLive: input.isLive,
          marketId: input.marketId,
          marketName: input.marketName,
          selectionName: input.selectionName,
          odd: input.odd,
          lockedOdd: input.odd,
          driftDirection: null,
          suspended: false,
          singleStake: 250,
        };

        return [...filtered, newItem];
      });
    },
    [hapticImpact]
  );

  const removeSelection = useCallback(
    (selectionId: string) => {
      hapticImpact('light');
      setSelections((prev) => prev.filter((s) => s.selectionId !== selectionId));
    },
    [hapticImpact]
  );

  const updateSingleStake = useCallback((selectionId: string, stake: number) => {
    const clean = Math.max(0, stake);
    setSelections((prev) =>
      prev.map((s) => (s.selectionId === selectionId ? { ...s, singleStake: clean } : s))
    );
  }, []);

  const clearSlip = useCallback(() => {
    hapticImpact('light');
    setSelections([]);
  }, [hapticImpact]);

  const acceptOddsChanges = useCallback(() => {
    hapticImpact('medium');
    setSelections(
      selections.map((s) => ({
        ...s,
        lockedOdd: s.odd,
        driftDirection: null,
      }))
    );
  }, [hapticImpact, selections]);

  const hasDriftedSelections = useMemo(
    () => selections.some((s) => s.driftDirection !== null),
    [selections]
  );

  const hasSuspendedSelections = useMemo(
    () => selections.some((s) => s.suspended),
    [selections]
  );

  const combinedMultiOdds = useMemo(() => {
    if (selections.length === 0) return 0;
    const product = selections.reduce((acc, item) => acc * item.odd, 1);
    return Number(product.toFixed(2));
  }, [selections]);

  const totalStake = useMemo(() => {
    if (selections.length === 0) return 0;
    if (mode === 'multi') return multiStake;
    return selections.reduce((sum, item) => sum + item.singleStake, 0);
  }, [selections, mode, multiStake]);

  const estimatedPayout = useMemo(() => {
    if (selections.length === 0) return 0;
    if (mode === 'multi') {
      return Number((multiStake * combinedMultiOdds).toFixed(2));
    }
    return Number(
      selections
        .reduce((sum, item) => sum + item.singleStake * item.odd, 0)
        .toFixed(2)
    );
  }, [selections, mode, multiStake, combinedMultiOdds]);

  const inPlayExposure = useMemo(() => {
    return placedBets
      .filter((b) => b.status === 'OPEN')
      .reduce((sum, b) => sum + b.totalStake, 0);
  }, [placedBets]);

  const placeBet = useCallback((): {
    success: boolean;
    error?: string;
    bet?: PlacedBet;
  } => {
    if (selections.length === 0) {
      return { success: false, error: 'Your bet slip is empty.' };
    }
    if (hasSuspendedSelections) {
      return {
        success: false,
        error: 'One or more selections are temporarily locked.',
      };
    }
    if (hasDriftedSelections) {
      return {
        success: false,
        error: 'Please accept live odds changes before placing your wager.',
      };
    }
    if (totalStake <= 0) {
      return { success: false, error: 'Enter a valid stake amount in ETB.' };
    }

    const deducted = deductStake(totalStake);
    if (!deducted) {
      return {
        success: false,
        error: 'Insufficient ETB balance. Please deposit funds to continue.',
      };
    }

    const randomCode = Math.floor(10000 + Math.random() * 89999);
    const now = new Date();
    const formattedDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
      2,
      '0'
    )}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(
      2,
      '0'
    )}:${String(now.getMinutes()).padStart(2, '0')}`;

    const effectiveOdds =
      mode === 'multi'
        ? combinedMultiOdds
        : Number((estimatedPayout / totalStake).toFixed(2));

    const newBet: PlacedBet = {
      id: `#BET-${randomCode}-ET`,
      createdAt: formattedDate,
      mode,
      legs: selections.map((s) => ({
        selectionId: s.selectionId,
        fixtureId: s.fixtureId,
        matchTitle: s.matchTitle,
        leagueName: s.leagueName,
        marketName: s.marketName,
        selectionName: s.selectionName,
        odd: s.odd,
        legStatus: 'PENDING',
      })),
      totalStake: Number(totalStake.toFixed(2)),
      totalOdds: effectiveOdds,
      potentialPayout: estimatedPayout,
      status: 'OPEN',
      cashoutOffer: Number((totalStake * 0.92).toFixed(2)),
    };

    setPlacedBets((prev) => [newBet, ...prev]);
    setLastPlacedReceipt(newBet);
    setSelections([]);
    hapticNotification('success');

    return { success: true, bet: newBet };
  }, [
    selections,
    hasSuspendedSelections,
    hasDriftedSelections,
    totalStake,
    deductStake,
    mode,
    combinedMultiOdds,
    estimatedPayout,
    hapticNotification,
  ]);

  const cashOutBet = useCallback(
    (betId: string): boolean => {
      const target = placedBets.find((b) => b.id === betId && b.status === 'OPEN');
      if (!target || !target.cashoutOffer) return false;

      const offerAmount = target.cashoutOffer;
      const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      setPlacedBets((prev) =>
        prev.map((b) =>
          b.id === betId
            ? {
                ...b,
                status: 'CASHED_OUT',
                settledPayout: offerAmount,
                settledAt: `Today, ${now}`,
                cashoutOffer: null,
              }
            : b
        )
      );

      creditWinnings(offerAmount, `Early Cashout (${betId})`);
      return true;
    },
    [placedBets, creditWinnings]
  );

  const simulateSettleOpenBets = useCallback(
    (outcome: 'WON' | 'LOST'): number => {
      const openList = placedBets.filter((b) => b.status === 'OPEN');
      if (openList.length === 0) return 0;

      let totalCredited = 0;
      const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      setPlacedBets((prev) =>
        prev.map((bet) => {
          if (bet.status !== 'OPEN') return bet;
          if (outcome === 'WON') {
            totalCredited += bet.potentialPayout;
          }
          return {
            ...bet,
            status: outcome,
            cashoutOffer: null,
            settledPayout: outcome === 'WON' ? bet.potentialPayout : 0,
            settledAt: `Today, ${now}`,
            legs: bet.legs.map((l) => ({
              ...l,
              legStatus: outcome === 'WON' ? 'WON' : 'LOST',
            })),
          };
        })
      );

      if (outcome === 'WON' && totalCredited > 0) {
        creditWinnings(totalCredited, `${openList.length} Winning Slip(s)`);
      } else {
        hapticNotification('warning');
      }

      return openList.length;
    },
    [placedBets, creditWinnings, hapticNotification]
  );

  const clearLastReceipt = useCallback(() => {
    setLastPlacedReceipt(null);
  }, []);

  return (
    <BetSlipContext.Provider
      value={{
        selections,
        mode,
        setMode,
        multiStake,
        setMultiStake,
        isDrawerOpen,
        setIsDrawerOpen,
        placedBets,
        lastPlacedReceipt,
        clearLastReceipt,
        hasDriftedSelections,
        hasSuspendedSelections,
        totalStake,
        combinedMultiOdds,
        estimatedPayout,
        inPlayExposure,
        isSelected,
        toggleSelection,
        removeSelection,
        updateSingleStake,
        clearSlip,
        acceptOddsChanges,
        placeBet,
        cashOutBet,
        simulateSettleOpenBets,
      }}
    >
      {children}
    </BetSlipContext.Provider>
  );
}

export function useBetSlip() {
  const ctx = useContext(BetSlipContext);
  if (!ctx) {
    throw new Error('useBetSlip must be used within a BetSlipProvider');
  }
  return ctx;
}
