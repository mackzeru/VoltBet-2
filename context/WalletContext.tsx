'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  DepositTransaction,
  PaymentMethodType,
  WalletNotification,
  UserProfile,
} from '@/types/api-football';
import { useTelegram } from '@/hooks/useTelegram';

interface SubmitDepositInput {
  method: PaymentMethodType;
  amount: number;
  referenceCode: string;
  screenshotFileName: string;
  screenshotPreviewUrl: string;
}

interface SubmitWithdrawalInput {
  method: PaymentMethodType;
  amount: number;
  destinationAccount: string;
}

export interface DemoAccountPreset {
  profile: UserProfile;
  initialBalance: number;
  initialBonus: number;
}

export const DEMO_ACCOUNT_PRESETS: DemoAccountPreset[] = [
  {
    profile: {
      id: 'usr-dawit-01',
      fullName: 'Dawit Tadesse',
      username: 'dawit_volt_et',
      phone: '+251 911 248 900',
      email: 'dawit.t@voltbet.et',
      vipTier: 'Platinum VIP',
      vipPoints: 8420,
      kycVerified: true,
      joinedDate: 'Jan 2026',
      defaultStake: 500,
      oddsFormat: 'decimal',
      avatarColor: '#00E676',
    },
    initialBalance: 100000.0,
    initialBonus: 2500.0,
  },
  {
    profile: {
      id: 'usr-yonas-02',
      fullName: 'Yonas Abebe',
      username: 'yonas_pro_et',
      phone: '+251 922 610 441',
      email: 'yonas.a@voltbet.et',
      vipTier: 'Gold VIP',
      vipPoints: 3910,
      kycVerified: true,
      joinedDate: 'Apr 2026',
      defaultStake: 250,
      oddsFormat: 'decimal',
      avatarColor: '#38BDF8',
    },
    initialBalance: 28500.0,
    initialBonus: 1000.0,
  },
  {
    profile: {
      id: 'usr-meron-03',
      fullName: 'Meron Hailu',
      username: 'meron_addis',
      phone: '+251 913 882 109',
      email: 'meron.h@voltbet.et',
      vipTier: 'Silver',
      vipPoints: 1120,
      kycVerified: false,
      joinedDate: 'Sep 2026',
      defaultStake: 100,
      oddsFormat: 'decimal',
      avatarColor: '#A855F7',
    },
    initialBalance: 7500.0,
    initialBonus: 500.0,
  },
];

interface WalletContextValue {
  isAuthenticated: boolean;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  userProfile: UserProfile;
  balance: number;
  bonusBalance: number;
  lifetimeWinnings: number;
  transactions: DepositTransaction[];
  notifications: WalletNotification[];
  unreadCount: number;
  deductStake: (amount: number) => boolean;
  creditWinnings: (amount: number, label: string) => void;
  submitDeposit: (input: SubmitDepositInput) => DepositTransaction;
  submitWithdrawal: (input: SubmitWithdrawalInput) => {
    success: boolean;
    error?: string;
    tx?: DepositTransaction;
  };
  approveDeposit: (transactionId: string) => void;
  rejectDeposit: (transactionId: string) => void;
  approveAllPendingDeposits: () => number;
  claimDailyBonus: () => boolean;
  markAllNotificationsRead: () => void;
  switchDemoAccount: (presetId: string) => void;
  loginWithPhone: (phone: string, name?: string) => void;
  logout: () => void;
  updateProfilePreferences: (updates: Partial<UserProfile>) => void;
}

const WalletContext = createContext<WalletContextValue | undefined>(undefined);

const INITIAL_TRANSACTIONS: DepositTransaction[] = [
  {
    id: 'DEP-90418-ET',
    type: 'DEPOSIT',
    createdAt: '2026-11-10 18:12',
    method: 'Telebirr',
    amount: 15000,
    referenceCode: 'TB99481023ET',
    screenshotFileName: 'telebirr_receipt_15k.jpg',
    screenshotPreviewUrl: '/assets/aistudio/Gemini_Generated_Image_z2jjacz2jjacz2jj_1f18e757.jpeg',
    status: 'PENDING',
  },
  {
    id: 'DEP-88310-ET',
    type: 'DEPOSIT',
    createdAt: '2026-11-09 21:40',
    method: 'Commercial Bank of Ethiopia (CBE Birr)',
    amount: 50000,
    referenceCode: 'FT2631398001',
    screenshotFileName: 'cbe_transfer_50000.png',
    screenshotPreviewUrl: '/assets/aistudio/Gemini_Generated_Image_z2jjacz2jjacz2jj_1f18e757.jpeg',
    status: 'APPROVED',
  },
  {
    id: 'WTH-86902-ET',
    type: 'WITHDRAWAL',
    createdAt: '2026-11-08 16:20',
    method: 'Telebirr',
    amount: 8500,
    referenceCode: '+251 911 248 900',
    screenshotFileName: 'Instant Payout',
    screenshotPreviewUrl: '/assets/aistudio/Gemini_Generated_Image_z2jjacz2jjacz2jj_1f18e757.jpeg',
    status: 'APPROVED',
  },
];

const INITIAL_NOTIFICATIONS: WalletNotification[] = [
  {
    id: 'notif-1',
    title: 'Welcome to VoltBet ETB',
    message: 'Active balance: 100,000.00 ETB + 2,500.00 ETB Bonus.',
    timestamp: 'Just now',
    type: 'info',
    read: false,
  },
  {
    id: 'notif-2',
    title: 'Pending Telebirr Deposit',
    message: 'Deposit #DEP-90418-ET (15,000 ETB) awaiting approval.',
    timestamp: '12m ago',
    type: 'deposit',
    read: false,
  },
];

const STORAGE_KEY = 'voltbet_wallet_state_v2';

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const { hapticNotification } = useTelegram();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [userProfile, setUserProfile] = useState<UserProfile>(
    DEMO_ACCOUNT_PRESETS[0].profile
  );
  const [balance, setBalance] = useState<number>(100000.0);
  const [bonusBalance, setBonusBalance] = useState<number>(2500.0);
  const [lifetimeWinnings, setLifetimeWinnings] = useState<number>(42850.0);
  const [transactions, setTransactions] =
    useState<DepositTransaction[]>(INITIAL_TRANSACTIONS);
  const [notifications, setNotifications] =
    useState<WalletNotification[]>(INITIAL_NOTIFICATIONS);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (typeof parsed.isAuthenticated === 'boolean')
            setIsAuthenticated(parsed.isAuthenticated);
          if (parsed.userProfile) setUserProfile(parsed.userProfile);
          if (typeof parsed.balance === 'number') setBalance(parsed.balance);
          if (typeof parsed.bonusBalance === 'number')
            setBonusBalance(parsed.bonusBalance);
          if (typeof parsed.lifetimeWinnings === 'number')
            setLifetimeWinnings(parsed.lifetimeWinnings);
          if (Array.isArray(parsed.transactions))
            setTransactions(parsed.transactions);
        }
      } catch {
        // ignore storage errors
      }
      setHydrated(true);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          isAuthenticated,
          userProfile,
          balance,
          bonusBalance,
          lifetimeWinnings,
          transactions,
        })
      );
    } catch {
      // ignore
    }
  }, [
    isAuthenticated,
    userProfile,
    balance,
    bonusBalance,
    lifetimeWinnings,
    transactions,
    hydrated,
  ]);

  const addNotification = useCallback(
    (title: string, message: string, type: WalletNotification['type']) => {
      const newNotif: WalletNotification = {
        id: `notif-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        title,
        message,
        timestamp: 'Just now',
        type,
        read: false,
      };
      setNotifications((prev) => [newNotif, ...prev.slice(0, 14)]);
    },
    []
  );

  const deductStake = useCallback(
    (amount: number): boolean => {
      if (!isAuthenticated) {
        setIsAuthModalOpen(true);
        return false;
      }
      if (amount <= 0 || amount > balance) {
        hapticNotification('error');
        return false;
      }
      setBalance((prev) => Number((prev - amount).toFixed(2)));
      setUserProfile((prev) => ({
        ...prev,
        vipPoints: prev.vipPoints + Math.max(1, Math.floor(amount / 50)),
      }));
      return true;
    },
    [isAuthenticated, balance, hapticNotification]
  );

  const creditWinnings = useCallback(
    (amount: number, label: string) => {
      const cleanAmount = Number(amount.toFixed(2));
      setBalance((prev) => Number((prev + cleanAmount).toFixed(2)));
      setLifetimeWinnings((prev) => Number((prev + cleanAmount).toFixed(2)));
      addNotification(
        'Payout Credited',
        `+${cleanAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })} ETB from ${label}`,
        'win'
      );
      hapticNotification('success');
    },
    [addNotification, hapticNotification]
  );

  const submitDeposit = useCallback(
    (input: SubmitDepositInput): DepositTransaction => {
      const randomNum = Math.floor(10000 + Math.random() * 89999);
      const now = new Date();
      const timeStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
        2,
        '0'
      )}-${String(now.getDate()).padStart(2, '0')} ${String(
        now.getHours()
      ).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

      const newTx: DepositTransaction = {
        id: `DEP-${randomNum}-ET`,
        type: 'DEPOSIT',
        createdAt: timeStr,
        method: input.method,
        amount: Number(input.amount.toFixed(2)),
        referenceCode: input.referenceCode.trim() || `REF-${randomNum}`,
        screenshotFileName: input.screenshotFileName || 'receipt_capture.jpg',
        screenshotPreviewUrl: input.screenshotPreviewUrl,
        status: 'PENDING',
      };

      setTransactions((prev) => [newTx, ...prev]);
      addNotification(
        'Deposit Submitted',
        `${newTx.amount.toLocaleString()} ETB via ${newTx.method} is pending approval.`,
        'deposit'
      );
      hapticNotification('success');
      return newTx;
    },
    [addNotification, hapticNotification]
  );

  const submitWithdrawal = useCallback(
    (input: SubmitWithdrawalInput) => {
      if (!isAuthenticated) {
        setIsAuthModalOpen(true);
        return { success: false, error: 'Please sign in to withdraw.' };
      }
      if (input.amount <= 0) {
        return { success: false, error: 'Enter a valid ETB withdrawal amount.' };
      }
      if (input.amount > balance) {
        hapticNotification('error');
        return {
          success: false,
          error: 'Withdrawal amount exceeds available cash balance.',
        };
      }

      const randomNum = Math.floor(10000 + Math.random() * 89999);
      const now = new Date();
      const timeStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
        2,
        '0'
      )}-${String(now.getDate()).padStart(2, '0')} ${String(
        now.getHours()
      ).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

      setBalance((prev) => Number((prev - input.amount).toFixed(2)));

      const newTx: DepositTransaction = {
        id: `WTH-${randomNum}-ET`,
        type: 'WITHDRAWAL',
        createdAt: timeStr,
        method: input.method,
        amount: Number(input.amount.toFixed(2)),
        referenceCode: input.destinationAccount || userProfile.phone,
        screenshotFileName: 'Instant Withdrawal',
        screenshotPreviewUrl:
          '/assets/aistudio/Gemini_Generated_Image_z2jjacz2jjacz2jj_1f18e757.jpeg',
        status: 'APPROVED',
      };

      setTransactions((prev) => [newTx, ...prev]);
      addNotification(
        'Withdrawal Processed',
        `-${newTx.amount.toLocaleString()} ETB sent to ${input.method} (${newTx.referenceCode}).`,
        'deposit'
      );
      hapticNotification('success');
      return { success: true, tx: newTx };
    },
    [isAuthenticated, balance, userProfile.phone, addNotification, hapticNotification]
  );

  const approveDeposit = useCallback(
    (transactionId: string) => {
      setTransactions((prev) => {
        const target = prev.find((t) => t.id === transactionId);
        if (!target || target.status !== 'PENDING') return prev;

        setBalance((b) => Number((b + target.amount).toFixed(2)));
        addNotification(
          'Deposit Approved',
          `+${target.amount.toLocaleString('en-US', {
            minimumFractionDigits: 2,
          })} ETB (${target.method}) credited.`,
          'deposit'
        );
        hapticNotification('success');

        return prev.map((t) =>
          t.id === transactionId ? { ...t, status: 'APPROVED' } : t
        );
      });
    },
    [addNotification, hapticNotification]
  );

  const rejectDeposit = useCallback(
    (transactionId: string) => {
      setTransactions((prev) =>
        prev.map((t) =>
          t.id === transactionId && t.status === 'PENDING'
            ? { ...t, status: 'REJECTED' }
            : t
        )
      );
      addNotification(
        'Deposit Rejected',
        `Ticket ${transactionId} marked rejected.`,
        'info'
      );
      hapticNotification('warning');
    },
    [addNotification, hapticNotification]
  );

  const approveAllPendingDeposits = useCallback((): number => {
    let approvedTotal = 0;
    let approvedCount = 0;

    setTransactions((prev) =>
      prev.map((t) => {
        if (t.status === 'PENDING') {
          approvedTotal += t.amount;
          approvedCount += 1;
          return { ...t, status: 'APPROVED' };
        }
        return t;
      })
    );

    if (approvedCount > 0) {
      setBalance((b) => Number((b + approvedTotal).toFixed(2)));
      addNotification(
        'Deposits Approved',
        `Approved ${approvedCount} ticket(s) (+${approvedTotal.toLocaleString('en-US', {
          minimumFractionDigits: 2,
        })} ETB).`,
        'deposit'
      );
      hapticNotification('success');
    }

    return approvedCount;
  }, [addNotification, hapticNotification]);

  const claimDailyBonus = useCallback((): boolean => {
    setBonusBalance((prev) => Number((prev + 500).toFixed(2)));
    setBalance((prev) => Number((prev + 500).toFixed(2)));
    addNotification(
      'VIP Reload Bonus Claimed',
      '+500.00 ETB added to your playable balance.',
      'win'
    );
    hapticNotification('success');
    return true;
  }, [addNotification, hapticNotification]);

  const switchDemoAccount = useCallback(
    (presetId: string) => {
      const preset = DEMO_ACCOUNT_PRESETS.find((p) => p.profile.id === presetId);
      if (!preset) return;
      setUserProfile(preset.profile);
      setBalance(preset.initialBalance);
      setBonusBalance(preset.initialBonus);
      setIsAuthenticated(true);
      setIsAuthModalOpen(false);
      addNotification(
        'Switched Account',
        `Signed in as ${preset.profile.fullName} (@${preset.profile.username}).`,
        'info'
      );
      hapticNotification('success');
    },
    [addNotification, hapticNotification]
  );

  const loginWithPhone = useCallback(
    (phone: string, name?: string) => {
      const cleanName = name?.trim() || 'Abebe Bikila';
      const cleanUsername = cleanName.toLowerCase().replace(/\s+/g, '_') + '_et';
      const customProfile: UserProfile = {
        id: `usr-${Date.now()}`,
        fullName: cleanName,
        username: cleanUsername,
        phone: phone.trim() || '+251 911 550 112',
        email: `${cleanUsername}@voltbet.et`,
        vipTier: 'Gold VIP',
        vipPoints: 2500,
        kycVerified: true,
        joinedDate: 'Nov 2026',
        defaultStake: 500,
        oddsFormat: 'decimal',
        avatarColor: '#00E676',
      };
      setUserProfile(customProfile);
      if (!isAuthenticated) {
        setBalance((prev) => (prev > 0 ? prev : 50000.0));
      }
      setIsAuthenticated(true);
      setIsAuthModalOpen(false);
      addNotification(
        'Signed In Successfully',
        `Welcome back, ${customProfile.fullName}!`,
        'info'
      );
      hapticNotification('success');
    },
    [isAuthenticated, addNotification, hapticNotification]
  );

  const logout = useCallback(() => {
    setIsAuthenticated(false);
    hapticNotification('warning');
  }, [hapticNotification]);

  const updateProfilePreferences = useCallback((updates: Partial<UserProfile>) => {
    setUserProfile((prev) => ({ ...prev, ...updates }));
  }, []);

  const markAllNotificationsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <WalletContext.Provider
      value={{
        isAuthenticated,
        isAuthModalOpen,
        setIsAuthModalOpen,
        userProfile,
        balance,
        bonusBalance,
        lifetimeWinnings,
        transactions,
        notifications,
        unreadCount,
        deductStake,
        creditWinnings,
        submitDeposit,
        submitWithdrawal,
        approveDeposit,
        rejectDeposit,
        approveAllPendingDeposits,
        claimDailyBonus,
        markAllNotificationsRead,
        switchDemoAccount,
        loginWithPhone,
        logout,
        updateProfilePreferences,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const ctx = useContext(WalletContext);
  if (!ctx) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return ctx;
}
