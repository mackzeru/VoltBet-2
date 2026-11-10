'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Trophy, Radio, Receipt, Wallet } from 'lucide-react';
import { useBetSlip } from '@/context/BetSlipContext';
import { useWallet } from '@/context/WalletContext';

export function BottomNav() {
  const pathname = usePathname();
  const { placedBets } = useBetSlip();
  const { transactions } = useWallet();

  const openBetsCount = placedBets.filter((b) => b.status === 'OPEN').length;
  const pendingDeposits = transactions.filter((t) => t.status === 'PENDING').length;

  const navItems = [
    {
      href: '/',
      label: 'Lobby',
      icon: Trophy,
      active: pathname === '/' || pathname.startsWith('/matches'),
      badge: null,
    },
    {
      href: '/live',
      label: 'Live In-Play',
      icon: Radio,
      active: pathname.startsWith('/live'),
      badge: 'LIVE',
    },
    {
      href: '/my-bets',
      label: 'My Bets',
      icon: Receipt,
      active: pathname.startsWith('/my-bets'),
      badge: openBetsCount > 0 ? String(openBetsCount) : null,
    },
    {
      href: '/wallet',
      label: 'Wallet',
      icon: Wallet,
      active: pathname.startsWith('/wallet'),
      badge: pendingDeposits > 0 ? String(pendingDeposits) : null,
    },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 h-15 bg-[#0B0E14]/95 backdrop-blur-md border-t border-[#2A344B] grid grid-cols-4 items-center px-2">
      {navItems.map((item) => {
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`relative min-h-[44px] flex flex-col items-center justify-center py-1 transition-colors ${
              item.active ? 'text-[#00E676]' : 'text-[#94A3B8] hover:text-white'
            }`}
          >
            <div className="relative">
              <Icon className="w-5 h-5" />
              {item.badge && (
                <span
                  className={`absolute -top-1.5 -right-3 px-1 rounded text-[9px] font-mono font-bold ${
                    item.badge === 'LIVE'
                      ? 'bg-[#EF4444] text-white'
                      : 'bg-[#00E676] text-[#0B0E14]'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </div>
            <span className="text-[10px] font-medium tracking-tight mt-1 whitespace-nowrap">
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
