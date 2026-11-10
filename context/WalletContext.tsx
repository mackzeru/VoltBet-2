'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  DepositTransaction,
  PaymentMethodType,
  WalletNotification,
} from '@/types/api-football';
import { useTelegram } from '@/hooks/useTelegram';

interface SubmitDepositInput {
  method: PaymentMethodType;
  amount: number;
  referenceCode: string;
  screenshotFileName: string;
  screenshotPreviewUrl: string;
}

interface WalletContextValue {
  balance: number; // in ETB
  lifetimeWinnings: number;
  transactions: DepositTransaction[];
  notifications: WalletNotification[];
  unreadCount: number;
  deductStake: (amount: number) => boolean;
  creditWinnings: (amount: number, label: string) => void;
  submitDeposit: (input: SubmitDepositInput) => DepositTransaction;
  approveDeposit: (transactionId: string) => void;
  rejectDeposit: (transactionId: string) => void;
  approveAllPendingDeposits: () => number;
  markAllNotificationsRead: () => void;
}

const WalletContext = createContext<WalletContextValue | undefined>(undefined);

const INITIAL_TRANSACTIONS: DepositTransaction[] = [
  {
    id: 'DEP-90418-ET',
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
    createdAt: '2026-11-09 21:40',
    method: 'Commercial Bank of Ethiopia (CBE Birr)',
    amount: 50000,
    referenceCode: 'FT2631398001',
    screenshotFileName: 'cbe_transfer_50000.png',
    screenshotPreviewUrl: '/assets/aistudio/Gemini_Generated_Image_z2jjacz2jjacz2jj_1f18e757.jpeg',
    status: 'APPROVED',
  },
  {
    id: 'DEP-86104-ET',
    createdAt: '2026-11-08 14:05',
    method: 'USDT (TRC-20)',
    amount: 50000,
    referenceCode: '0x7c92f81b...e31a',
    screenshotFileName: 'tronscan_tx_receipt.png',
    screenshotPreviewUrl: '/assets/aistudio/Gemini_Generated_Image_z2jjacz2jjacz2jj_1f18e757.jpeg',
    status: 'APPROVED',
  },
];

const INITIAL_NOTIFICATIONS: WalletNotification[] = [
  {
    id: 'notif-1',
    title: 'Welcome to VoltBet ETB',
    message: 'Your demo trading balance of 100,000.00 ETB is active.',
    timestamp: 'Just now',
    type: 'info',
    read: false,
  },
  {
    id: 'notif-2',
    title: 'Pending Telebirr Deposit',
    message: 'Deposit #DEP-90418-ET (15,000 ETB) is awaiting admin verification.',
    timestamp: '12m ago',
    type: 'deposit',
    read: false,
  },
];

const STORAGE_KEY = 'voltbet_wallet_state_v1';

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const { hapticNotification } = useTelegram();
  const [balance, setBalance] = useState<number>(100000.0);
  const [lifetimeWinnings, setLifetimeWinnings] = useState<number>(42850.0);
  const [transactions, setTransactions] = useState<DepositTransaction[]>(INITIAL_TRANSACTIONS);
  const [notifications, setNotifications] = useState<WalletNotification[]>(INITIAL_NOTIFICATIONS);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (typeof parsed.balance === 'number') setBalance(parsed.balance);
          if (typeof parsed.lifetimeWinnings === 'number')
            setLifetimeWinnings(parsed.lifetimeWinnings);
          if (Array.isArray(parsed.transactions)) setTransactions(parsed.transactions);
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
        JSON.stringify({ balance, lifetimeWinnings, transactions })
      );
    } catch {
      // ignore
    }
  }, [balance, lifetimeWinnings, transactions, hydrated]);

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
      if (amount <= 0 || amount > balance) {
        hapticNotification('error');
        return false;
      }
      setBalance((prev) => Number((prev - amount).toFixed(2)));
      return true;
    },
    [balance, hapticNotification]
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
      const timeStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
        now.getDate()
      ).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(
        now.getMinutes()
      ).padStart(2, '0')}`;

      const newTx: DepositTransaction = {
        id: `DEP-${randomNum}-ET`,
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
        'Deposit Ticket Submitted',
        `${newTx.amount.toLocaleString()} ETB via ${newTx.method} is pending review.`,
        'deposit'
      );
      hapticNotification('success');
      return newTx;
    },
    [addNotification, hapticNotification]
  );

  const approveDeposit = useCallback(
    (transactionId: string) => {
      setTransactions((prev) => {
        const target = prev.find((t) => t.id === transactionId);
        if (!target || target.status !== 'PENDING') return prev;

        setBalance((b) => Number((b + target.amount).toFixed(2)));
        addNotification(
          'Deposit Approved',
          `+${target.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })} ETB (${target.method}) credited to your wallet.`,
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
        `Ticket ${transactionId} was marked rejected in simulation.`,
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
        'Admin Simulator: Deposits Approved',
        `Approved ${approvedCount} pending ticket(s) totaling +${approvedTotal.toLocaleString('en-US', {
          minimumFractionDigits: 2,
        })} ETB.`,
        'deposit'
      );
      hapticNotification('success');
    }

    return approvedCount;
  }, [addNotification, hapticNotification]);

  const markAllNotificationsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <WalletContext.Provider
      value={{
        balance,
        lifetimeWinnings,
        transactions,
        notifications,
        unreadCount,
        deductStake,
        creditWinnings,
        submitDeposit,
        approveDeposit,
        rejectDeposit,
        approveAllPendingDeposits,
        markAllNotificationsRead,
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
