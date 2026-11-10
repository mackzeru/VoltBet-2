'use client';

import { useEffect, useState, useCallback } from 'react';

interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username: string;
  language_code?: string;
  is_premium?: boolean;
}

interface TelegramWebAppInstance {
  ready: () => void;
  expand: () => void;
  isExpanded?: boolean;
  colorScheme?: 'dark' | 'light';
  headerColor?: string;
  backgroundColor?: string;
  setHeaderColor?: (color: string) => void;
  setBackgroundColor?: (color: string) => void;
  initDataUnsafe?: {
    user?: TelegramUser;
  };
  HapticFeedback?: {
    impactOccurred: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => void;
    notificationOccurred: (type: 'error' | 'success' | 'warning') => void;
    selectionChanged: () => void;
  };
}

declare global {
  interface Window {
    Telegram?: {
      WebApp?: TelegramWebAppInstance;
    };
  }
}

export function useTelegram() {
  const [isTMA, setIsTMA] = useState(false);
  const [user, setUser] = useState<TelegramUser>({
    id: 94810234,
    first_name: 'Dawit',
    last_name: 'Tadesse',
    username: 'dawit_volt_et',
    is_premium: true,
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const timer = setTimeout(() => {
      const tg = window.Telegram?.WebApp;
      if (tg) {
        try {
          tg.ready();
          tg.expand();
          tg.setHeaderColor?.('#0B0E14');
          tg.setBackgroundColor?.('#0B0E14');
          if (tg.initDataUnsafe?.user) {
            setUser(tg.initDataUnsafe.user);
            setIsTMA(true);
          }
        } catch {
          // Fallback silently for standard desktop/mobile browsers
        }
      }
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  const hapticImpact = useCallback(
    (style: 'light' | 'medium' | 'heavy' = 'medium') => {
      if (typeof window === 'undefined') return;
      const tg = window.Telegram?.WebApp;
      if (tg?.HapticFeedback) {
        try {
          tg.HapticFeedback.impactOccurred(style);
          return;
        } catch {
          // ignore
        }
      }
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        const ms = style === 'heavy' ? 35 : style === 'medium' ? 20 : 10;
        navigator.vibrate(ms);
      }
    },
    []
  );

  const hapticNotification = useCallback(
    (type: 'success' | 'warning' | 'error' = 'success') => {
      if (typeof window === 'undefined') return;
      const tg = window.Telegram?.WebApp;
      if (tg?.HapticFeedback) {
        try {
          tg.HapticFeedback.notificationOccurred(type);
          return;
        } catch {
          // ignore
        }
      }
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        if (type === 'success') navigator.vibrate([18, 40, 25]);
        else if (type === 'warning') navigator.vibrate([30, 30]);
        else navigator.vibrate([50, 40, 50]);
      }
    },
    []
  );

  return {
    isTMA,
    user,
    hapticImpact,
    hapticNotification,
  };
}
