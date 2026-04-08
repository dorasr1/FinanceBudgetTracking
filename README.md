# BudgetTracker

A lightweight, privacy-first household budget tracking app for iOS built with **React Native + Expo**.

Designed for **2 users** in one household. Works fully offline — no account required. Optional cloud sync via Supabase.

---

## Screenshots (design reference)

Dark theme · Lime-green accent (`#C9FF2F`) · Card-based layout

| Dashboard | Categories | Bills |
|-----------|-----------|-------|
| Donut chart · Safe-to-spend | Category breakdown + progress rings | Bill reminders · Auto debit alerts |

---

## Tech Stack

| Layer | Choice | Why |
|-------|--------|-----|
| Framework | **React Native + Expo SDK 52** | Single codebase, easy iOS build |
| Navigation | **Expo Router 4** (file-based) | Familiar, typed routes |
| State | **Zustand** | Minimal boilerplate, great DX |
| Persistence | **AsyncStorage** | Offline-first, no backend needed |
| Charts | **react-native-svg** (built-in Expo) | No heavy chart lib |
| Icons | **@expo/vector-icons** (MaterialCommunityIcons) | 7000+ icons, zero config |
| Cloud sync (optional) | **Supabase** free tier | Sync between 2 devices |

---

## Project Structure

```
app/
  _layout.tsx              Root layout (gesture handler, status bar)
  (tabs)/
    _layout.tsx            Bottom tab navigator
    index.tsx              Dashboard — donut chart, recent transactions
    transactions.tsx       All transactions with search + filter
    categories.tsx         Category spending vs budget
    bills.tsx              Bill reminders (auto debit, due today, overdue)
    settings.tsx           Budget setup, currency, profiles

  add-transaction.tsx      Add / edit transaction modal
  add-bill.tsx             Add / edit bill modal

components/
  DonutChart.tsx           SVG donut / progress ring chart
  TransactionItem.tsx      Single transaction row
  CategoryCard.tsx         Category row with mini progress ring
  BillCard.tsx             Bill card with Pay Now / Mark Paid actions
  MonthSelector.tsx        ← / → month picker
  HeaderBar.tsx            Top bar with user avatars + search

store/
  types.ts                 TypeScript domain types
  useFinanceStore.ts       Zustand store (transactions, budgets, bills)

constants/
  colors.ts                Design tokens (dark theme + lime accent)
  categories.ts            Expense / income category definitions

lib/
  supabase.ts              Optional Supabase client + SQL schema
```

---

## Features

- **Dashboard** — spending donut chart, income (maskable), budget, safe-to-spend per day
- **Transactions** — add/edit/delete, search, filter by income/expense, grouped by date
- **Categories** — budget vs actual per category with circular progress rings
- **Bills** — recurring bills, auto-debit warnings (3-day alert), overdue detection, one-tap pay
- **Shared expenses** — mark any transaction as 50/50 split between household members
- **Month navigation** — browse any past month
- **2 user profiles** — tap avatars to switch active user
- **Currency selector** — USD, EUR, GBP, INR, JPY, AUD, CAD
- **Privacy mode** — toggle to hide income on dashboard

---

## Getting Started

### Prerequisites
- Node.js 18+
- Expo CLI: `npm install -g expo`
- iOS Simulator (Xcode) or iPhone with **Expo Go** app

### Install & Run

```bash
npm install
npx expo start
```

Scan the QR code with **Expo Go** on your iPhone — the app runs instantly, no build required.

---

## Publishing to iOS (for 2 users)

### Option A — Expo Go (zero-config, fastest)
1. Both users install **Expo Go** from the App Store (free)
2. Run `npx expo start` on your development machine
3. Share the QR code / URL — done

> ✅ Best for personal use at home on the same Wi-Fi

### Option B — TestFlight (recommended for production)
1. Enrol in **Apple Developer Program** ($99/year) — one account shared
2. Build: `npx expo build:ios` or use **EAS Build** (free tier):
   ```bash
   npm install -g eas-cli
   eas login
   eas build --platform ios --profile preview
   ```
3. Upload the `.ipa` to **TestFlight** in App Store Connect
4. Add both users as **Internal Testers** (no review needed, instant)

> ✅ Best for a polished, persistent install that survives app restarts and phone restarts

### Option C — Ad-hoc distribution (no Apple Developer account)
- Not recommended — requires device UDID registration

---

## Optional: Cloud Sync (Supabase)

To sync data between 2 devices in real time:

1. Create a **free project** at https://supabase.com
2. Run the SQL schema in `lib/supabase.ts` (copy the commented SQL into the SQL editor)
3. Add your credentials to `app.json → extra`:
   ```json
   "extra": {
     "supabaseUrl": "https://your-project.supabase.co",
     "supabaseAnonKey": "your-anon-key"
   }
   ```
4. The `supabase` client in `lib/supabase.ts` activates automatically when configured

**Free tier limits** (more than enough for 2 users):
- 500 MB database
- 50,000 MAU
- Unlimited API requests

---

## Customisation

| What | Where |
|------|-------|
| Colors / theme | `constants/colors.ts` |
| Add a new category | `constants/categories.ts` |
| Change default currency | `store/useFinanceStore.ts` → `settings` initial state |
| Rename household users | In-app Settings → Profile |
| Add a new screen | Create `app/(tabs)/your-screen.tsx` and add a `<Tabs.Screen>` entry |

---

## Data & Privacy

- All data is stored locally on the device using `AsyncStorage`
- No analytics, no tracking, no ads
- Income can be hidden on the dashboard via Settings → Privacy
- Clear all data any time from Settings → Data
