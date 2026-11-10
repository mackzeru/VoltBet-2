'use client';

import React, { useState } from 'react';

interface TeamCrestProps {
  name: string;
  logo?: string;
  shortCode?: string;
  primaryColor?: string;
  secondaryColor?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
}

export function TeamCrest({
  name,
  logo,
  shortCode,
  primaryColor = '#00E676',
  secondaryColor = '#FFFFFF',
  size = 'md',
}: TeamCrestProps) {
  const [imgFailed, setImgFailed] = useState(false);

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
      ? 'w-12 h-12 text-xs p-1.5'
      : size === 'xs'
      ? 'w-5 h-5 text-[9px] p-0.5'
      : size === 'sm'
      ? 'w-7 h-7 text-[10px] p-1'
      : 'w-9 h-9 text-[11px] p-1';

  const hasExternalLogo =
    Boolean(logo) &&
    !imgFailed &&
    !logo?.includes('Gemini_Generated_Image');

  return (
    <div
      className={`relative inline-flex items-center justify-center rounded-xl bg-white dark:bg-[#121721] border border-slate-200 dark:border-[#2A344B] font-mono font-bold tracking-tight text-slate-900 dark:text-white shrink-0 select-none overflow-hidden shadow-2xs dark:shadow-none ${dimensions}`}
      title={name}
    >
      {hasExternalLogo ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={logo}
          alt={name}
          referrerPolicy="no-referrer"
          onError={() => setImgFailed(true)}
          className="w-full h-full object-contain"
        />
      ) : (
        <svg
          viewBox="0 0 36 36"
          className="w-full h-full"
          aria-label={name}
        >
          <path
            d="M18 2L31 7V17C31 25.5 25.4 31.8 18 34C10.6 31.8 5 25.5 5 17V7L18 2Z"
            fill={primaryColor}
            stroke={secondaryColor}
            strokeWidth="2"
          />
          <path
            d="M18 3.5L29.5 8V17C29.5 24.4 24.5 30 18 32.2V3.5Z"
            fill={secondaryColor}
            fillOpacity="0.22"
          />
          <text
            x="18"
            y="21"
            textAnchor="middle"
            fill="#FFFFFF"
            fontSize="10"
            fontWeight="800"
            fontFamily="monospace"
          >
            {code}
          </text>
        </svg>
      )}
    </div>
  );
}
