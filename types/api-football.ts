// Strict API-Football v3 Schema Definitions & Client Domain Models

export type MatchShortStatus = 'NS' | '1H' | 'HT' | '2H' | 'FT' | 'LIVE';

export type SportCategory = 'Soccer' | 'Basketball' | 'Tennis';

export type OddsFormat = 'decimal' | 'american';

export interface ApiFootballEvent {
  time: {
    elapsed: number;
    extra: number | null;
  };
  team: {
    id: number;
    name: string;
    logo: string;
  };
  player: {
    id: number;
    name: string;
  };
  assist: {
    id: number | null;
    name: string | null;
  };
  type: 'Goal' | 'Card' | 'subst';
  detail: 'Normal Goal' | 'Penalty' | 'Yellow Card' | 'Red Card' | 'Substitution 1' | 'Substitution 2' | 'Substitution 3';
}

export interface ApiFootballTeamStat {
  type:
    | 'Ball Possession'
    | 'Total Shots'
    | 'Shots on Goal'
    | 'Corner Kicks'
    | 'Fouls'
    | 'Yellow Cards'
    | 'Red Cards'
    | 'Dangerous Attacks';
  value: string | number | null;
}

export interface ApiFootballOddValue {
  value: string;
  odd: string;
  previousOdd?: string;
  drift?: 'up' | 'down' | null;
  lastUpdated?: number;
  locked?: boolean;
}

export interface ApiFootballBetMarket {
  id: number;
  name: string;
  suspended?: boolean;
  suspensionReason?: string;
  values: ApiFootballOddValue[];
}

export interface ApiFootballBookmaker {
  id: number;
  name: string;
  bets: ApiFootballBetMarket[];
}

export interface ApiFootballFixture {
  sport?: SportCategory;
  featuredBoost?: {
    label: string;
    boostedFrom: string;
    boostedTo: string;
    marketName: string;
    selectionName: string;
  };
  liveMeta?: {
    dangerousAttacksHome: number;
    dangerousAttacksAway: number;
    recentCorners: number;
    pressureState: 'Normal' | 'Home Attacking' | 'Away Attacking' | 'VAR / Penalty Review' | 'Corner Danger';
    marketLocked?: boolean;
  };
  fixture: {
    id: number;
    referee: string;
    timezone: string;
    date: string;
    timestamp: number;
    periods: {
      first: number | null;
      second: number | null;
    };
    venue: {
      id: number;
      name: string;
      city: string;
    };
    status: {
      long: string;
      short: MatchShortStatus;
      elapsed: number | null;
    };
  };
  league: {
    id: number;
    name: string;
    country: string;
    logo: string;
    flag: string;
    season: number;
    round: string;
  };
  teams: {
    home: {
      id: number;
      name: string;
      shortCode?: string;
      primaryColor?: string;
      secondaryColor?: string;
      logo: string;
      winner: boolean | null;
    };
    away: {
      id: number;
      name: string;
      shortCode?: string;
      primaryColor?: string;
      secondaryColor?: string;
      logo: string;
      winner: boolean | null;
    };
  };
  goals: {
    home: number | null;
    away: number | null;
  };
  score: {
    halftime: { home: number | null; away: number | null };
    fulltime: { home: number | null; away: number | null };
    extratime: { home: number | null; away: number | null };
    penalty: { home: number | null; away: number | null };
  };
  events?: ApiFootballEvent[];
  statistics?: Array<{
    team: { id: number; name: string; logo: string };
    statistics: ApiFootballTeamStat[];
  }>;
  odds?: {
    bookmakers: ApiFootballBookmaker[];
  };
}

export interface OutrightTournamentMarket {
  id: number;
  leagueId: number;
  leagueName: string;
  leagueLogo: string;
  country: string;
  season: string;
  title: string;
  deadline: string;
  favorites: Array<{
    teamId: number;
    teamName: string;
    teamLogo: string;
    shortCode: string;
    primaryColor: string;
    odd: string;
    drift?: 'up' | 'down' | null;
  }>;
}

export interface BetSelection {
  selectionId: string;
  fixtureId: number;
  matchTitle: string;
  leagueName: string;
  homeLogo?: string;
  awayLogo?: string;
  isLive: boolean;
  marketId: number;
  marketName: string;
  selectionName: string;
  odd: number;
  lockedOdd: number;
  driftDirection: 'up' | 'down' | null;
  suspended: boolean;
  singleStake: number;
}

export type BetSlipMode = 'single' | 'multi';

export type BetStatus = 'OPEN' | 'WON' | 'LOST' | 'CASHED_OUT';

export interface PlacedBetLeg {
  selectionId: string;
  fixtureId: number;
  matchTitle: string;
  leagueName: string;
  marketName: string;
  selectionName: string;
  odd: number;
  legStatus: 'PENDING' | 'WON' | 'LOST';
}

export interface PlacedBet {
  id: string;
  createdAt: string;
  mode: BetSlipMode;
  legs: PlacedBetLeg[];
  totalStake: number;
  totalOdds: number;
  potentialPayout: number;
  status: BetStatus;
  cashoutOffer: number | null;
  settledPayout?: number;
  settledAt?: string;
}

export type PaymentMethodType =
  | 'Telebirr'
  | 'Commercial Bank of Ethiopia (CBE Birr)'
  | 'Bank Transfer'
  | 'USDT (TRC-20)';

export type DepositStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface DepositTransaction {
  id: string;
  type?: 'DEPOSIT' | 'WITHDRAWAL';
  createdAt: string;
  method: PaymentMethodType;
  amount: number;
  referenceCode: string;
  screenshotFileName: string;
  screenshotPreviewUrl: string;
  status: DepositStatus;
}

export interface WalletNotification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  type: 'win' | 'deposit' | 'drift' | 'info';
  read: boolean;
}

export interface UserProfile {
  id: string;
  fullName: string;
  username: string;
  phone: string;
  email: string;
  vipTier: 'Silver' | 'Gold VIP' | 'Platinum VIP';
  vipPoints: number;
  kycVerified: boolean;
  joinedDate: string;
  defaultStake: number;
  oddsFormat: OddsFormat;
  avatarColor: string;
}
