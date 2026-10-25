# Urugendo Native Apps

**Isolated monorepo** for the two real native apps.

> ⚠️ This repository is completely separate from the existing PWA (`amanididier/urugendo-bolt`).  
> Do not modify the original project. Both systems share only the same Supabase backend.

## Apps

| App | Path | Purpose |
|-----|------|---------|
| **Passenger** | `apps/passenger` | Travellers – search, book, ticket, profile |
| **Agency** | `apps/agency` | Staff – Agent, Ticket Checker, Branch Manager, Agency Boss |

## Shared Packages

| Package | Path | Purpose |
|---------|------|---------|
| `@urugendo/ui` | `packages/ui` | Design tokens + reusable components (UI parity) |
| `@urugendo/api` | `packages/api` | Supabase client, types, queries, auth |
| `@urugendo/config` | `packages/config` | Constants, roles, routes |
| `@urugendo/utils` | `packages/utils` | Helpers (dates, money, QR, etc.) |

## Quick Start — Test on a real phone with Expo Go

Requirements: Node.js 20+ and the Expo Go app installed on your Android or iPhone.

```bash
# In the repository root
npm install

# Start Passenger app and create a tunnel QR for your phone
npm run passenger -- --tunnel

# In a second terminal, start the Agency app
npm run agency -- --tunnel
```

Open Expo Go on your phone and scan the QR code. If Metro asks to install compatible Expo packages, use the versions recommended by the installed Expo SDK and restart the server.

### Before testing authentication and payments

1. **Create a future trip first.** Sign in to the Agency app using an existing manager's email, manager code, password and assigned agency name. Open **Schedule**, then save a trip with a future date, fare and total seat capacity. The live database currently has no future scheduled trips.
2. **Phone signup:** enable Phone authentication and configure an SMS provider in Supabase Auth. Phone registration sends an SMS code before the account is activated.
3. **Email signup:** enable Email authentication in Supabase Auth.
4. **Google sign-in:** enable Google in Supabase Auth and add the native callback URI `urugendo-passenger://auth/callback` to the allowed redirect URLs. Also configure the OAuth redirect URI in the Google provider settings.
5. **MTN sandbox:** server-side MTN credentials are configured as Supabase Edge Function secrets. Sandbox test numbers simulate MTN outcomes; they do not prove live Rwandan MoMo settlement. Sandbox requests use a €1 test amount while Urugendo records the actual fare in RWF.

The PWA guest checkout does not require an account. It reserves capacity on the server, sends an MTN request-to-pay, and activates the ticket only after the provider confirms payment. Pending reservations expire after 15 minutes.

### Current limits

- Expo runtime/device testing has not yet been performed from this workspace.
- Google and SMS provider settings must be confirmed in Supabase before testing those flows.
- The native manager schedule uses existing manager accounts and server-validated sessions. Agents do not have scheduling access.
- Play Store and App Store links should be added after the native apps are published; the PWA Download app button currently uses browser installation where supported.

## Master Plan

See `docs/URUGENDO_NATIVE_PLAN.md`.

## Rules

1. Never touch the original PWA or its GitHub repo.
2. Keep 100% UI/UX parity with the current design.
3. Log every progress in the master plan file.
