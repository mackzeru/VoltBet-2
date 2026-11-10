import type { Metadata } from 'next';
import { Outfit, Plus_Jakarta_Sans, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/context/ThemeContext';
import { WalletProvider } from '@/context/WalletContext';
import { SportsDataProvider } from '@/context/SportsDataContext';
import { BetSlipProvider } from '@/context/BetSlipContext';
import { Header } from '@/components/layout/Header';
import { BottomNav } from '@/components/layout/BottomNav';
import { AuthModal } from '@/components/auth/AuthModal';

const outfit = Outfit({
  subsets: ['latin'],
  weight: ['600', '700', '800'],
  variable: '--font-display',
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-sans',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  variable: '--font-mono',
});

export const metadata: Metadata = {
  title: 'VoltBet Sportsbook & TMA',
  description:
    'High-frequency client-side Football Sportsbook and Telegram Mini App featuring live API-Football v3 markets, real-time odds drift, parlay calculator, early cashout, and Ethiopian Birr (ETB) screenshot deposit verification.',
  openGraph: {
    title: 'VoltBet Sportsbook & TMA',
    description:
      'High-frequency client-side Football Sportsbook and Telegram Mini App featuring live API-Football v3 markets, real-time odds drift, parlay calculator, early cashout, and Ethiopian Birr (ETB) screenshot deposit verification.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'VoltBet Sportsbook & TMA',
    description:
      'High-frequency client-side Football Sportsbook and Telegram Mini App featuring live API-Football v3 markets, real-time odds drift, parlay calculator, early cashout, and Ethiopian Birr (ETB) screenshot deposit verification.',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`dark ${outfit.variable} ${jakarta.variable} ${jetbrainsMono.variable}`}
    >
      <body
        suppressHydrationWarning
        className="min-h-screen bg-slate-50 dark:bg-[#0B0E14] text-slate-900 dark:text-white antialiased pb-24 md:pb-12 transition-colors duration-150"
      >
        <ThemeProvider>
          <WalletProvider>
            <SportsDataProvider>
              <BetSlipProvider>
                <Header />
                {children}
                <BottomNav />
                <AuthModal />
              </BetSlipProvider>
            </SportsDataProvider>
          </WalletProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
