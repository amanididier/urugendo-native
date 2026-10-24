# Fix Expo errors

## Syntax error — FIXED on GitHub (pull latest)

The invalid `{\n}` in TicketScreen is fixed on `main`.

```bash
cd urugendo-native
git pull origin main
```

## Missing icon.png

Assets were not always committed. From repo root:

```bash
node scripts/ensure-assets.js
```

Or:

```bash
cd apps/passenger
npx create-expo-app@latest C:\Users\HP\expo-tmp --template blank
xcopy C:\Users\HP\expo-tmp\assets\* assets\ /Y
```

## Supabase (same DB as PWA)

```bash
cd apps/passenger
npm install @supabase/supabase-js
npx expo start -c
```

Client: `apps/passenger/src/lib/supabase.js`  
URL: `https://zrvcqlyowqfrqdidozrk.supabase.co`

Same for `apps/agency`.
