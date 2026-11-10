'use client';

import React from 'react';
import { Lock, TrendingUp, TrendingDown } from 'lucide-react';

interface OddsButtonProps {
  label: string;
  odd: string;
  drift?: 'up' | 'down' | null;
  selected: boolean;
  locked?: boolean;
  compact?: boolean;
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

export function OddsButton({
  label,
  odd,
  drift = null,
  selected,
  locked = false,
  compact = false,
  onClick,
}: OddsButtonProps) {
  const driftAnimationClass =
    !selected && drift === 'up'
      ? 'animate-odds-up border-[#22C55E]/70'
      : !selected && drift === 'down'
      ? 'animate-odds-down border-[#EF4444]/70'
      : '';

  if (locked) {
    return (
      <button
        type="button"
        disabled
        className={`w-full min-h-[44px] rounded-xl bg-[#121721]/80 border border-[#2A344B]/70 px-3 flex items-center justify-between text-[#94A3B8]/50 cursor-not-allowed select-none ${
          compact ? 'py-2' : 'py-2.5'
        }`}
        aria-label={`${label} market locked`}
      >
        <span className="text-xs font-medium truncate">{label}</span>
        <Lock className="w-3.5 h-3.5 text-amber-400/80 shrink-0" />
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={`group relative w-full min-h-[44px] rounded-xl border px-3 flex items-center justify-between gap-1.5 transition-all duration-150 active:scale-[0.98] cursor-pointer select-none ${
        compact ? 'py-2' : 'py-2.5'
      } ${
        selected
          ? 'bg-[#00E676] border-[#00E676] text-[#0B0E14] shadow-[0_0_16px_rgba(0,230,118,0.25)]'
          : `bg-[#121721] hover:bg-[#1A2232] border-[#2A344B] hover:border-[#00E676]/50 text-white ${driftAnimationClass}`
      }`}
    >
      <span
        className={`text-xs truncate whitespace-nowrap ${
          selected
            ? 'font-bold text-[#0B0E14]'
            : 'font-medium text-[#94A3B8] group-hover:text-white'
        }`}
      >
        {label}
      </span>

      <span className="inline-flex items-center gap-1 shrink-0 font-mono tabular-nums text-xs sm:text-sm font-bold">
        {drift === 'up' && (
          <TrendingUp
            className={`w-3 h-3 ${selected ? 'text-[#0B0E14]' : 'text-[#22C55E]'}`}
          />
        )}
        {drift === 'down' && (
          <TrendingDown
            className={`w-3 h-3 ${selected ? 'text-[#0B0E14]' : 'text-[#EF4444]'}`}
          />
        )}
        <span
          className={
            selected
              ? 'text-[#0B0E14]'
              : drift === 'up'
              ? 'text-[#22C55E]'
              : drift === 'down'
              ? 'text-[#EF4444]'
              : 'text-[#00E676]'
          }
        >
          {odd}
        </span>
      </span>
    </button>
  );
}
