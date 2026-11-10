'use client';

import React from 'react';
import { Shield } from 'lucide-react';

interface TeamCrestProps {
  name: string;
  shortCode?: string;
  primaryColor?: string;
  secondaryColor?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function TeamCrest({
  name,
  shortCode,
  primaryColor = '#00E676',
  size = 'md',
}: TeamCrestProps) {
  const code =
    shortCode ||
    name
      .split(' ')
      .map((w) => w[0])
      .join('')
      .slice(0, 3)
      .toUpperCase();

  const dimensions =
    size === 'lg'
      ? 'w-12 h-12 text-xs'
      : size === 'sm'
      ? 'w-7 h-7 text-[10px]'
      : 'w-9 h-9 text-[11px]';

  return (
    <div
      className={`relative inline-flex items-center justify-center rounded-xl bg-[#121721] border border-[#2A344B] font-mono font-bold tracking-tight text-white shrink-0 select-none ${dimensions}`}
      title={name}
    >
      <Shield
        className="w-4/5 h-4/5 opacity-25"
        style={{ color: primaryColor }}
        strokeWidth={2}
      />
      <span className="absolute inset-0 flex items-center justify-center font-mono font-bold text-white">
        {code}
      </span>
    </div>
  );
}
