# Urugendo Native Apps — Master Plan & Progress Tracker

> **Last updated:** 25 Oct 2026 — Supabase capacity and MTN integration update  
> **Rule:** This file is the single source of truth. Check it at the start of every session.  
> **Critical constraint:** Preserve the existing PWA experience. Shared backend changes are permitted only when required for native compatibility, reviewed against the live schema, and recorded here. Native app source remains in this repository.  
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

- **Backend:** Existing Supabase project is shared. Native-compatible migrations are now applied and tracked.
- **Existing PWA / GitHub repo:** The existing user-facing experience is preserved; a database migration and MTN Edge Function update were added for compatibility.
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
- Merged PR #1 into main (merge commit 3d354da801b6de3c111dfad08c6a49261e62474a). All future changes are committed directly to `main`, as requested.
- Removed the passenger-entered seat label requirement. The passenger enters passenger count; availability is calculated from manager-entered `trips.total_seats` minus active booking passenger counts.
- Applied the `capacity_based_native_bookings` database migration to the shared Supabase project. It adds `bookings.passenger_count`, MTN payment-tracking columns, and an atomic capacity-reservation RPC.
- Applied `enforce_trip_fares_for_native_bookings`: the database calculates the fare from the trip's stored price instead of trusting a client-supplied amount. The RPC is executable by authenticated users only.
- Verified the booking RPC in a rolled-back database transaction; the test did not leave a booking behind. Verified migration history, columns, function permissions, and the Edge Function deployment.
- Deployed `mtn-payment` Edge Function version 6. It checks session and booking ownership, uses MTN sandbox EUR €1 test requests (while preserving the actual RWF fare in Urugendo), records provider references, supports payment status checks, and marks bookings failed if initiation fails.
- **Still not verified:** a real MTN sandbox request-to-pay/status round trip. The Edge Function's MTN credentials and webhook secret are managed as Supabase secrets; their configured state and a live sandbox response were not confirmed by these checks. Do not treat payment as end-to-end tested yet.
- **Security finding:** Supabase's security advisor reports `public.trips` has RLS disabled even though policies exist. I did not change it automatically because enabling RLS may alter current access; review policies before enabling it.
- **Still outstanding:** native Expo install/bundle/runtime test; native agency manager schedule/auth screen. The existing PWA manager scheduling page remains the current source for total seat capacity.
- PWA source updates are committed directly to `main`: capacity migration and MTN Edge Function source.

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
