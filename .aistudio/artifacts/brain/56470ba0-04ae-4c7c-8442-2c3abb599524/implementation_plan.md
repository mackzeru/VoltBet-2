# VoltBet — Client-Side Sportsbook & Telegram Mini App

VoltBet is a high-frequency, mobile-first standalone client-side Sportsbook and Telegram Mini App (TMA) built for instant in-play and pre-match football wagering. It pairs an API-Football v3 compliant in-memory simulation engine with a responsive dark-slate interface that adapts seamlessly from compact Telegram viewports (`390px–430px`) to multi-column desktop displays (`1440px`).

## User Review & Critical Decisions

> [!IMPORTANT]
> The following architectural and product choices have been confirmed from your preferences and govern the implementation:

- **Confirmed Decision 1 — Brand Identity (`VoltBet`)**: The uploaded neon electric-emerald soccer-lightning emblem (`/assets/aistudio/Gemini_Generated_Image_z2jjacz2jjacz2jj_1f18e757.jpeg`) will anchor the **VoltBet** brand identity across the top header bar, promotional banners, and animated bet confirmation receipts.
- **Confirmed Decision 2 — Primary Currency (`ETB - Ethiopian Birr`)**: All wallet balances (starting at `100,000.00 ETB`), quick-stake presets (`+100 ETB`, `+500 ETB`, `+1,000 ETB`, `Max`), cashout offers, and payout calculations are denominated exclusively in Ethiopian Birr (`ETB`) with strict tabular numeral formatting.
- **Confirmed Decision 3 — Simulation Control Bar**: A compact, collapsible developer simulation bar is integrated into the top utility strip so you can trigger **Odds Drift**, **Settle Open Bets (Win/Loss)**, **Lock/Suspend Live Markets**, and **Approve Pending Deposits** from any route without cluttering the core player UI.

---

## 1. Overview & Core Concept

- **What It Does**: Delivers a complete end-user sportsbook workflow—from browsing live and upcoming fixtures across six elite European football leagues, analyzing live match timelines and head-to-head statistics, and building Single or Multi/Accumulator (Parlay) bet slips, to cashing out active wagers and submitting screenshot-verified manual deposits (Telebirr, CBE Birr, Bank Transfer, USDT TRC-20).
- **Target Audience / Persona**: Mobile-first Telegram Mini App bettors and desktop sports traders who demand sub-second odds feedback, one-handed thumb ergonomics, clear odds drift alerts, and localized Ethiopian payment rails.
- **Key Value**: Eliminates backend latency during evaluation while faithfully modeling real-world API-Football v3 payloads, dynamic market suspensions, parlay math, and tactile Telegram WebApp haptics.

---

## 2. User Experience & Visual Design

### Key User Flows
1. **Lobby & Quick Wagering (`/`)**: Users filter by league scroller (Premier League, UEFA Champions League, La Liga, Serie A, Bundesliga, Ligue 1) or time tabs (`Live In-Play`, `Upcoming Today`, `Tomorrow`, `Outrights / Tournaments`). Tapping any `1`, `X`, or `2` odds button triggers haptic feedback, highlights the selection in Electric Emerald (`#00E676`), and updates the persistent Bet Slip.
2. **Deep Match Inspection (`/matches/[id]`)**: Selecting `+Markets >` opens a stadium scoreboard header with live elapsed minute tickers, chronological match events (goals, yellow/red cards, substitutions), dual-team comparison progress bars (Possession %, Shots, Shots on Target, Corners, Fouls, Cards), and categorized market tabs (`All Markets`, `Main`, `Goals`, `Odd/Even`, `Cards & Discipline`, `Penalties`, `Halves`).
3. **Fast-Paced In-Play Hub (`/live`)**: Dedicated live arena with sport filters (Soccer, Basketball, Tennis), sub-minute match clocks, micro-stats (recent corners, dangerous attacks, card tallies), and periodic market locks (displaying a padlock state during dangerous attacks or VAR/penalty reviews before unlocking with recalibrated odds).
4. **Universal Bet Slip (Mobile Drawer & Desktop Sticky Sidebar)**: Supports instant switching between **Single** (independent stake per leg) and **Multi / Accumulator** (combined product of all leg odds: $\text{Total Odds} = \prod \text{Odds}_i$). If an odd drifts while in the slip, an interactive drift alert banner requires the user to click **Accept Odds Changes** before placing the wager. Validates stake against available ETB balance and generates an animated bet receipt with a unique slip ID (e.g., `#BET-89421-ET`).
5. **Active Wager Tracking & Early Cashout (`/my-bets`)**: Organizes slips into `Open / Active`, `Won`, `Lost`, and `All / Settled`. Active slips calculate a live dynamic **Cash Out Early** offer in ETB based on current odds drift and match state, crediting the user's wallet immediately upon confirmation.
6. **Wallet & Screenshot Deposit Workflow (`/wallet`)**: Displays Available Balance, In-Play Stake Exposure, and Lifetime Winnings in ETB. Users select a payment rail (Telebirr, CBE Birr, Bank Transfer, USDT TRC-20), copy account details or scan the QR code, enter an ETB amount, upload or capture a payment receipt screenshot with live preview and simulated validation, and submit a `PENDING` deposit ticket. The Deposit Audit Log lets testers toggle pending tickets to `APPROVED` (instantly crediting the wallet) or `REJECTED`.

### Visual Identity & Theme
- **Aesthetic Direction**: High-precision dark sportsbook terminal inspired by tier-1 trading and betting platforms, balancing dense tabular odds scannability with clean whitespace and single-elevation card depth.
- **Color Palette & Mood**:
  - **Dominant Canvas (60%)**: Deep Slate Navy (`#0B0E14`), Secondary Canvas (`#121721`), Elevated Surface (`#1A2232`).
  - **Structural Surfaces (30%)**: Card Surface (`#1E2638`) with crisp `1px` hairline borders (`#2A344B`), Pure White (`#FFFFFF`) primary text, and Slate Gray (`#94A3B8`) secondary metadata.
  - **Accent & Semantic Budget (10%)**: Electric Emerald (`#00E676`, hover `#00C853`) for active odds selections, primary CTAs, and won badges; Neon Green (`#22C55E`) with upward chevron & flash animation for drifting-up odds; Bright Rose (`#EF4444`) with downward chevron & flash animation for drifting-down odds; Amber (`#F59E0B`) for pending deposits and locked markets.
- **Typography & Hierarchy (2+1 Font Rule)**:
  - **Display & Brand**: `Outfit` (SemiBold/Bold) for scoreboard titles, promotional headlines, and brand lockups (`text-wrap: balance`).
  - **UI & Market Labels**: `Plus Jakarta Sans` (Regular/Medium/SemiBold) for crisp legibility across league filters, team names, and market accordions.
  - **Odds, Clocks & Financial Telemetry**: `JetBrains Mono` with mandatory `tabular-nums` (`font-mono tabular-nums`) on all odds buttons, live match minutes (`64'`), scores, ETB balances, and payout calculators so decimal points align vertically without jitter during live ticks.
- **Spatial & Ergonomic Rules**:
  - **Mobile First to Desktop Grid**: Compact mobile viewports (`360px–430px`) use a fixed 4-tab Bottom Navigation Bar and a collapsible floating Bet Slip trigger bar, respecting the **15% mobile sticky height cap** and minimum `44x44px` touch targets. Desktop viewports (`lg:` / `1440px`) expand into a 3-column workspace (`Left League & Sport Rail` + `Central Match Feed / Detail Canvas` + `Right Sticky Bet Slip & Simulation Sidebar`).
  - **Zero-Pill Metadata Discipline**: Match metadata (league name, country, round, venue, kickoff time) renders as clean inline text with typographic separators (`·`), reserving button containers strictly for interactive filter tabs and selectable odds boxes.

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: In-Memory Reactive API-Football v3 Store with LocalStorage Hydration**
  - *Chosen Approach*: Combine an initial 10-fixture API-Football v3 dataset (4 Live In-Play fixtures + 6 Upcoming/Outright fixtures) in React Context with `localStorage` persistence for placed bets, wallet balance (`100,000 ETB`), and deposit tickets.
  - *Why*: Guarantees instantaneous page transitions, realistic live odds ticks every 3.5 seconds, and survival of user bets and deposits across page reloads without external database dependencies.
  - *Alternatives Considered*: Pure ephemeral React state (rejected because refreshing the browser would wipe placed bets and uploaded deposit receipts).
- **Decision 2: Strict Odds Drift Protection in Bet Slip**
  - *Chosen Approach*: Track both `lockedOdd` (at the moment of selection) and `currentOdd` (live market price) on every slip item. When the background ticker shifts a selected market's price, flag the slip with an explicit drift state and require a single-tap "Accept Odds Changes" confirmation before submission.
  - *Why*: Mirrors authentic tier-1 sportsbook risk rules and showcases the real-time link between the live data stream and the bet slip calculator.
- **Decision 3: Resilient Telegram WebApp Bridge (`useTelegram`)**
  - *Chosen Approach*: Inspect `window.Telegram?.WebApp` on mount to call `ready()`, `expand()`, theme sync, and native `HapticFeedback`, while seamlessly falling back to `navigator.vibrate` and a realistic Telegram user profile (`@volt_trader_et`) on standard desktop/mobile browsers.
  - *Why*: Ensures full functionality whether tested inside Telegram's WebView or in a standard desktop browser preview.

---

## 4. Technical Architecture & Data Strategy

### Architecture & Component Diagram

```
┌────────────────────────────────────────────────────────────────────────────┐
│                   Root Application Shell & TMA Bridge                      │
│   ┌───────────────────────┐  ┌──────────────────────┐  ┌───────────────┐   │
│   │ SportsDataContext     │  │ WalletContext (ETB)  │  │ BetSlipContext│   │
│   │ (API-Football v3 +    │  │ (100,000 ETB Init +  │  │ (Single/Multi │   │
│   │  3.5s Odds Drift Sim) │  │  Screenshot Ledger)  │  │  Parlay Math) │   │
│   └───────────┬───────────┘  └──────────┬───────────┘  └───────┬───────┘   │
└───────────────┼─────────────────────────┼──────────────────────┼───────────┘
                │                         │                      │
      ┌─────────┴─────────────────────────┴──────────────────────┴─────────┐
      ▼                                                                    ▼
┌──────────────────────────────────────────────────┐  ┌──────────────────────────┐
│           Primary Client Route Views             │  │ Persistent Global Chrome │
│  ┌────────────────────────────────────────────┐  │  │ ┌──────────────────────┐ │
│  │ 1. Sportsbook Lobby (/)                    │  │  │ │ Top Header +         │ │
│  │    • League Scroller & Hero Promo Carousel │  │  │ │ Collapsible Dev Sim  │ │
│  │    • Time Filter Tabs & 1X2 Match Cards    │  │  │ │ Control Strip        │ │
│  ├────────────────────────────────────────────┤  │  │ └──────────────────────┘ │
│  │ 2. Deep Match Detail (/matches/[id])       │  │  │ ┌──────────────────────┐ │
│  │    • Stadium Scoreboard & Event Ticker     │  │  │ │ Universal Bet Slip   │ │
│  │    • Dual Team Stats & Market Accordions   │  │  │ │ (Mobile Bottom Sheet │ │
│  │      (IDs: 1, 5, 8, 20, 26, 40 + Halves)   │  │  │ │  / Desktop Sidebar)  │ │
│  ├────────────────────────────────────────────┤  │  │ └──────────────────────┘ │
│  │ 3. Live In-Play Hub (/live)                │  │  │ ┌──────────────────────┐ │
│  │    • Sub-Minute Clock & Market Lock Sim    │  │  │ │ Mobile Bottom Nav    │ │
│  │    • Dangerous Attack & Micro-Stat Counters│  │  │ │ (Lobby, Live, Bets,  │ │
│  ├────────────────────────────────────────────┤  │  │ │  Wallet w/ Badges)   │ │
│  │ 4. My Bets & Cashout Tracker (/my-bets)    │  │  │ └──────────────────────┘ │
│  │    • Open/Won/Lost Filter & Early Cashout  │  │  └──────────────────────────┘
│  ├────────────────────────────────────────────┤  │
│  │ 5. ETB Wallet & Deposit Flow (/wallet)     │  │
│  │    • Telebirr / CBE Birr / Bank / USDT     │  │
│  │    • Receipt Upload Preview & Audit Ledger │  │
│  └────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────┘
```

### Data Model & State
- **`ApiFootballFixture` (API-Football v3 Schema)**:
  - `fixture`: `{ id, referee, timezone, date, timestamp, periods, venue, status: { long, short, elapsed } }`
  - `league`: `{ id, name, country, logo, flag, season, round }` covering Premier League (`39`), Champions League (`2`), La Liga (`140`), Serie A (`135`), Bundesliga (`78`), and Ligue 1 (`61`).
  - `teams` & `goals` & `score`: Official home/away structures with halftime/fulltime tallies.
  - `events`: Chronological array of `Goal`, `Card` (`Yellow Card`, `Red Card`), and `subst` records.
  - `statistics`: Home and Away arrays containing `Ball Possession`, `Total Shots`, `Shots on Goal`, `Corner Kicks`, `Fouls`, `Yellow Cards`, and `Red Cards`.
  - `odds.bookmakers[0].bets`: Full market definitions for **Match Winner 1X2 (`ID: 1`)**, **Goals Over/Under (`ID: 5`)**, **Both Teams To Score (`ID: 8`)**, **Goals Odd/Even (`ID: 20`)**, **Red Card in Match (`ID: 26`)**, **Penalty Awarded (`ID: 40`)**, plus **Double Chance (`ID: 12`)** and **1st Half Winner (`ID: 13`)**.
- **`BetSelection` & `PlacedBet`**:
  - Tracks `selectionId` (`${fixtureId}-${marketId}-${value}`), `fixtureId`, `matchTitle`, `leagueName`, `marketId`, `marketName`, `selectionName`, `odd`, `previousOdd`, `driftDirection` (`'up' | 'down' | null`), `locked` boolean, and individual stake (for Single mode).
  - `PlacedBet` stores `id` (`#BET-XXXXX-ET`), `createdAt`, `mode` (`'single' | 'multi'`), `selections`, `totalStake`, `totalOdds`, `potentialPayout`, `status` (`'OPEN' | 'WON' | 'LOST' | 'CASHED_OUT'`), and live `cashoutOffer`.
- **`DepositTransaction`**:
  - Tracks `id`, `createdAt`, `method` (`'Telebirr' | 'CBE Birr' | 'Bank Transfer' | 'USDT (TRC-20)'`), `amount` (ETB), `referenceCode`, `screenshotDataUrl`, `screenshotFileName`, and `status` (`'PENDING' | 'APPROVED' | 'REJECTED'`).

### Interactive Component & State Mapping
- **Odds Selection & Parlay Replacement Rule**: Clicking an `OddsButton` toggles that selection in `BetSlipContext`. If a user selects a different outcome from the *same market and fixture* (e.g., switching from `Home` to `Draw` in Arsenal vs Man City 1X2), the context automatically replaces the conflicting leg and triggers a medium haptic pulse.
- **Live Odds Drift & Market Lock Engine**: Every 3.5 seconds (or immediately via the Developer Control Bar's `"Trigger Odds Shift"` button), `SportsDataContext` mutates 2–4 odds values across live/upcoming matches by $\pm 0.04\text{ to }0.12$, sets a 2.5-second directional flash indicator (`up` green / `down` red), and temporarily locks 1 live market during simulated dangerous attacks.
- **Bet Placement & Settlement**: Submitting the Bet Slip verifies `totalStake <= availableBalance` (showing a direct `"Deposit ETB"` warning link if insufficient), deducts the stake from `WalletContext`, appends the new `PlacedBet` to `/my-bets`, and opens a celebratory receipt modal. Clicking `"Settle Open Bets"` in the Developer Control Bar (or `"Cash Out Early"` on an individual slip) grades active bets and credits the payout directly into the user's ETB balance with a toast notification.
- **Screenshot Deposit Verification**: Selecting an image file in `/wallet` uses `FileReader` to render an instant receipt thumbnail preview with a simulated verification progress bar. Submitting adds a `PENDING` row to the Deposit Audit Log, where clicking `"Simulate Approve"` transitions the badge to `APPROVED` and increments the live ETB balance in the header.
