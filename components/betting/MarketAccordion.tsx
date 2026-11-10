'use client';

import React, { useState } from 'react';
import { ChevronDown, Lock } from 'lucide-react';
import { ApiFootballBetMarket } from '@/types/api-football';
import { OddsButton } from '@/components/betting/OddsButton';
import { useBetSlip } from '@/context/BetSlipContext';

interface MarketAccordionProps {
  fixtureId: number;
  matchTitle: string;
  leagueName: string;
  isLive: boolean;
  isLocked?: boolean;
  market: ApiFootballBetMarket;
  defaultOpen?: boolean;
}

export function MarketAccordion({
  fixtureId,
  matchTitle,
  leagueName,
  isLive,
  isLocked = false,
  market,
  defaultOpen = true,
}: MarketAccordionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const { isSelected, toggleSelection } = useBetSlip();

  const is3Col = market.values.length === 3;

  return (
    <div className="rounded-2xl bg-white dark:bg-[#1E2638] border border-slate-200 dark:border-[#2A344B] shadow-xs dark:shadow-none overflow-hidden">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="w-full min-h-[46px] px-4 py-2.5 flex items-center justify-between gap-3 text-left hover:bg-slate-50 dark:hover:bg-[#1A2232]/60 transition-colors cursor-pointer"
      >
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-sm font-semibold text-slate-900 dark:text-white truncate">
            {market.name}
          </span>
          {isLocked && (
            <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-600 dark:text-amber-400">
              <Lock className="w-3 h-3" />
              <span>Suspended</span>
            </span>
          )}
        </div>

        <ChevronDown
          className={`w-4 h-4 text-slate-500 dark:text-[#94A3B8] transition-transform duration-150 shrink-0 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {isOpen && (
        <div className="p-3.5 pt-2 border-t border-slate-200 dark:border-[#2A344B]/60">
          <div
            className={`grid gap-2 ${
              is3Col ? 'grid-cols-1 xs:grid-cols-3 sm:grid-cols-3' : 'grid-cols-2'
            }`}
          >
            {market.values.map((val) => {
              const selected = isSelected(fixtureId, market.id, val.value);
              return (
                <OddsButton
                  key={`${market.id}-${val.value}`}
                  label={val.value}
                  odd={val.odd}
                  drift={val.drift}
                  locked={isLocked || Boolean(val.locked)}
                  selected={selected}
                  onClick={(e) => {
                    e.stopPropagation();
                    const oddNum = parseFloat(val.odd);
                    if (isNaN(oddNum)) return;
                    toggleSelection({
                      fixtureId,
                      matchTitle,
                      leagueName,
                      isLive,
                      marketId: market.id,
                      marketName: market.name,
                      selectionName: val.value,
                      odd: oddNum,
                    });
                  }}
                />
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
