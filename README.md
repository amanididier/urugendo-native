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

## Quick Start

```bash
# Install all workspaces
npm install

# Run Passenger app
npm run passenger

# Run Agency app
npm run agency
```

## Master Plan

See `docs/URUGENDO_NATIVE_PLAN.md`.

## Rules

1. Never touch the original PWA or its GitHub repo.
2. Keep 100% UI/UX parity with the current design.
3. Log every progress in the master plan file.
