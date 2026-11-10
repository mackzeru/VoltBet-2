'use client';

import React, { useState } from 'react';
import {
  X,
  Phone,
  Lock,
  User,
  Send,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { useWallet, DEMO_ACCOUNT_PRESETS } from '@/context/WalletContext';
import { useTelegram } from '@/hooks/useTelegram';

export function AuthModal() {
  const {
    isAuthModalOpen,
    setIsAuthModalOpen,
    switchDemoAccount,
    loginWithPhone,
    userProfile,
  } = useWallet();
  const { user: tgUser } = useTelegram();

  const [tab, setTab] = useState<'login' | 'register' | 'presets'>('login');
  const [phone, setPhone] = useState('+251 911 248 900');
  const [password, setPassword] = useState('••••••••');
  const [fullName, setFullName] = useState('');

  if (!isAuthModalOpen) return null;

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loginWithPhone(
      phone,
      tab === 'register' ? fullName || 'Bereket Tesfaye' : 'Dawit Tadesse'
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl bg-[#1E2638] border border-[#2A344B] overflow-hidden shadow-2xl">
        {/* Modal Header */}
        <div className="px-5 py-4 bg-[#121721] border-b border-[#2A344B] flex items-center justify-between">
          <div>
            <h2 className="font-display text-base font-bold text-white">
              VoltBet Account Access
            </h2>
            <p className="text-xs text-[#94A3B8]">
              Sign in via Telegram, Ethiopian phone, or switch demo profiles
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsAuthModalOpen(false)}
            className="p-1.5 rounded-lg text-[#94A3B8] hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Switcher */}
        <div className="p-4 pb-0">
          <div className="grid grid-cols-3 gap-1 p-1 rounded-xl bg-[#0B0E14] border border-[#2A344B]">
            <button
              type="button"
              onClick={() => setTab('login')}
              className={`py-2 rounded-lg text-xs font-semibold cursor-pointer ${
                tab === 'login'
                  ? 'bg-[#00E676] text-[#0B0E14] font-bold'
                  : 'text-[#94A3B8] hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => setTab('register')}
              className={`py-2 rounded-lg text-xs font-semibold cursor-pointer ${
                tab === 'register'
                  ? 'bg-[#00E676] text-[#0B0E14] font-bold'
                  : 'text-[#94A3B8] hover:text-white'
              }`}
            >
              Register
            </button>
            <button
              type="button"
              onClick={() => setTab('presets')}
              className={`py-2 rounded-lg text-xs font-semibold cursor-pointer ${
                tab === 'presets'
                  ? 'bg-[#00E676] text-[#0B0E14] font-bold'
                  : 'text-[#94A3B8] hover:text-white'
              }`}
            >
              Demo Profiles
            </button>
          </div>
        </div>

        <div className="p-5 space-y-4">
          {/* One-Tap Telegram WebApp Connect */}
          <button
            type="button"
            onClick={() => switchDemoAccount(DEMO_ACCOUNT_PRESETS[0].profile.id)}
            className="w-full min-h-[44px] px-4 py-2.5 rounded-xl bg-[#38BDF8]/15 hover:bg-[#38BDF8]/25 border border-[#38BDF8]/40 text-xs font-bold text-[#38BDF8] flex items-center justify-center gap-2 cursor-pointer transition-colors"
          >
            <Send className="w-4 h-4" />
            <span>One-Tap Connect as @{tgUser.username}</span>
          </button>

          {tab === 'presets' ? (
            <div className="space-y-2.5">
              {DEMO_ACCOUNT_PRESETS.map((item) => {
                const isCurrent = userProfile.id === item.profile.id;
                return (
                  <button
                    key={item.profile.id}
                    type="button"
                    onClick={() => switchDemoAccount(item.profile.id)}
                    className={`w-full p-3 rounded-xl border text-left flex items-center justify-between gap-3 transition-colors cursor-pointer ${
                      isCurrent
                        ? 'bg-[#00E676]/15 border-[#00E676]'
                        : 'bg-[#121721] hover:bg-[#1A2232] border-[#2A344B]'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center font-mono font-bold text-xs text-[#0B0E14] shrink-0"
                        style={{ backgroundColor: item.profile.avatarColor }}
                      >
                        {item.profile.fullName
                          .split(' ')
                          .map((n) => n[0])
                          .join('')}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-white truncate">
                            {item.profile.fullName}
                          </span>
                          <span className="text-[10px] font-mono text-[#00E676]">
                            · {item.profile.vipTier}
                          </span>
                        </div>
                        <span className="text-[11px] text-[#94A3B8] font-mono block truncate">
                          {item.profile.phone}
                        </span>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="font-mono tabular-nums text-xs font-bold text-white block">
                        {item.initialBalance.toLocaleString()} ETB
                      </span>
                      <span className="text-[10px] text-[#00E676] font-mono">
                        +{item.initialBonus.toLocaleString()} Bonus
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <form onSubmit={handleFormSubmit} className="space-y-3.5">
              {tab === 'register' && (
                <div className="space-y-1">
                  <label className="text-xs font-medium text-[#94A3B8]">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Dawit Tadesse"
                      className="w-full h-11 pl-9 pr-3 rounded-xl bg-[#0B0E14] border border-[#2A344B] focus:border-[#00E676] focus:outline-none text-xs text-white"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-1">
                <label className="text-xs font-medium text-[#94A3B8]">
                  Ethiopian Mobile Number
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+251 911 248 900"
                    className="w-full h-11 pl-9 pr-3 rounded-xl bg-[#0B0E14] border border-[#2A344B] focus:border-[#00E676] focus:outline-none font-mono text-xs text-white"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-[#94A3B8]">
                  Password / PIN
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full h-11 pl-9 pr-3 rounded-xl bg-[#0B0E14] border border-[#2A344B] focus:border-[#00E676] focus:outline-none text-xs text-white"
                  />
                </div>
              </div>

              {tab === 'register' && (
                <div className="rounded-xl bg-[#00E676]/10 border border-[#00E676]/30 p-2.5 flex items-center gap-2 text-xs text-[#00E676]">
                  <Sparkles className="w-4 h-4 shrink-0" />
                  <span>Includes +2,500 ETB Welcome Free Bet Bonus</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full min-h-[46px] rounded-xl bg-[#00E676] hover:bg-[#00C853] text-[#0B0E14] font-bold text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer transition-colors"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>
                  {tab === 'register' ? 'Create Account & Claim Bonus' : 'Sign In to VoltBet'}
                </span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
