# Urugendo Native Apps — Master Plan & Progress Tracker

> **Last updated:** 25 Oct 2026  
> **Rule:** This file is the single source of truth. Check it at the start of every session.  
> **Critical constraint:** Never modify the existing PWA, the GitHub repo `amanididier/urugendo-bolt`, or any live production system. Native apps are built in complete isolation.  
> **Native GitHub repo:** https://github.com/amanididier/urugendo-native (all progress is pushed here automatically)

---

## 1. Confirmed Goals

| Goal | Status |
|------|--------|
| Split into **2 separate native apps** (Passenger + Agency) | Confirmed |
| Use **React Native + Expo** | Confirmed |
| Keep **100% of current UI & UX** | Confirmed |
| Keep existing **PWA** fully working for testing (no download needed) | Confirmed |
| Native apps must be publishable to **Google Play + Apple App Store** | Confirmed |
| Do **not touch** the current codebase / live app | Confirmed |
| Ignore Driver role for now | Confirmed |

---

## 2. Architecture Overview

```
urugendo-native/
├── apps/
│   ├── passenger/                  ← Expo app – travellers only
│   └── agency/                     ← Expo app – Agent / Checker / Manager / Boss
├── packages/
│   ├── ui/                         ← Shared design tokens + components
│   ├── api/                        ← Supabase client, types, queries, auth helpers
│   ├── config/                     ← Shared constants, roles, routes
│   └── utils/                      ← Helpers (dates, money, QR, etc.)
├── docs/
│   └── URUGENDO_NATIVE_PLAN.md
└── README.md
```

- **Backend:** Existing Supabase project stays exactly as-is.
- **Existing PWA / GitHub repo:** Completely untouched.
- **New monorepo:** https://github.com/amanididier/urugendo-native

---

## 3. Design & UX Rules

- 100% visual and interaction parity with the current PWA + Lovable redesign.
- Same green primary color, typography, spacing, card styles, bottom navigation, icons (Lucide).
- Use NativeWind for styling consistency.
- Design tokens in `packages/ui`.
- Passenger app = consumer-friendly, calm, fast.
- Agency app = operational, role-based, dense but clean.

---

## 4. App Responsibilities

### Passenger App
- Splash / Onboarding, Phone + OTP login, Home, Search, Seats, Payment, Ticket (QR), My Tickets, Profile + Points, Notifications
- Bottom nav: Home · Search · Tickets · Profile

### Agency App (role-based)
- Login (agency + credentials)
- **Agent:** Sell tickets, confirm MoMo, manifests
- **Ticket Checker:** Scan QR / lookup, board passengers
- **Branch Manager:** Schedule buses, approve staff, branch revenue
- **Agency Boss:** Multi-branch overview, rankings, payouts

---

## 5. Phases

### Phase 0 – Planning & Isolation
- [x] Confirm split + Expo + keep PWA
- [x] Create master plan file
- [x] Create isolated monorepo structure
- [x] Create GitHub repo `urugendo-native`
- [ ] Document full design tokens from PWA / Lovable

### Phase 1 – Foundation
- [x] Scaffold Expo apps (passenger + agency)
- [x] Set up shared packages (ui, api, config, utils)
- [x] Connect Passenger app to existing Supabase client with persisted native sessions\n- [x] Add shared Supabase auth, trip query, passenger booking, and ticket retrieval functions
- [ ] Basic navigation shells
- [ ] Design tokens + core UI components

### Phase 2 – Passenger App (Core Flow)
- [x] Passenger email/password sign-in and account creation (email confirmation respected)\n- [x] Home route/date inputs and live Supabase trip search\n- [x] Booking write using the PWA booking columns; payment is explicitly marked submitted, not verified\n- [x] My Tickets reads the signed-in user's bookings from Supabase\n- [ ] Seat inventory/seat selection integration and actual MoMo payment provider integration\n- [ ] Local Expo install/build and end-to-end test against Supabase

### Phase 3 – Agency App
- [ ] Role-based auth & all role screens

### Phase 4 – Polish & Store Readiness
- [ ] Icons, splash, EAS Build, App Store + Play Store

### Phase 5 – PWA Coexistence
- [ ] Keep PWA unchanged, optional download banner

---

## 6. Progress Log

### 24 Oct 2026 – Session 1
- Created master plan file. Decision: complete isolation from PWA.

### 24 Oct 2026 – Session 2
- Created local monorepo structure with both Expo apps + shared packages.

### 25 Oct 2026 – Session 3
- Created GitHub repo https://github.com/amanididier/urugendo-native
- Pushed initial scaffold. All future progress goes here automatically.

---

### 25 Oct 2026 – Session 4 (Passenger backend batch)\n- Added shared API types and operations for passenger auth, trip search, booking creation, and ticket retrieval using the existing PWA schema.\n- Added AsyncStorage-backed Supabase session persistence to the Passenger app.\n- Replaced passenger mock trip search, sign-in, ticket confirmation, and My Tickets with database-backed flows.\n- Booking confirmation is accurately labelled as submitted and awaiting agency verification; no real MoMo charge is claimed.\n- Native repository changes are on branch `feat/passenger-supabase-core`; PWA repository was not modified.\n- Not yet verified: local `npm install`, Expo bundling, and live database end-to-end behavior.\n\n---\n\n### 25 Oct 2026 – Session 5 (Capacity bookings and MTN sandbox wiring)
- Merged PR #1 into main (merge commit 3d354da801b6de3c111dfad08c6a49261e62474a). Future native changes are committed directly to main as requested.
- Removed the passenger-entered seat label requirement; booking flow now asks for passenger count and displays availability derived from manager-entered trip total_seats minus active booked passenger counts.
- Added atomic create_passenger_booking RPC migration in the PWA repository. This migration must still be applied to the live Supabase database before native booking creation can pass.
- Passenger booking now calls the MTN MoMo Edge Function and includes a status-check action. PWA Edge Function source now checks the signed-in user and booking ownership before initiation/status access.
- Found the PWA's current paymentProvider.ts is still a manual-USSD stub; the MTN Edge Function source exists but sandbox credentials/deployment have not been verified.
- Not tested live: database migration application, native Expo runtime, MTN sandbox credentials/token, and an end-to-end request-to-pay transaction. Supabase access and MTN sandbox secrets are required to finish those tests.
- Native agency manager currently has no real schedule screen or DB-backed login; the PWA agency schedule page does accept total seats and stores trip capacity. Native manager schedule/auth remains separate work.

---
## 7. Rules for Every Future Session

1. Read this file first.
2. Never edit the original urugendo-bolt repo or live PWA.
3. Log every change in the Progress Log.
4. Keep 100% UI/UX parity.
5. Prefer shared packages.
6. Protect the existing production system.

---

## 8. Key References (read-only)

- Original repo: https://github.com/amanididier/urugendo-bolt
- Live PWA: https://urugendo-v0.vercel.app
- Redesign reference: https://branch-to-busway.lovable.app
- Native repo: https://github.com/amanididier/urugendo-native

**End of plan file.**
