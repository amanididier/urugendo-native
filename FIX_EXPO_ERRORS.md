# Fix Expo errors (Passenger)

## 1. SyntaxError: Expecting Unicode escape sequence (line ~356)

Open `apps/passenger/App.js` and find this **broken** line:

```js
Kigali → Musanze{\n}14:30 · Volcano Express
```

Replace the whole Text block with:

```jsx
<Text style={{ color: colors.textSecondary, marginTop: 8, textAlign: 'center' }}>
  Kigali → Musanze · 14:30 · Volcano Express
</Text>
```

Save the file.

## 2. Unable to resolve asset "./assets/icon.png"

From `apps/passenger` run:

```bash
# If assets folder is empty/missing, recreate default Expo assets:
npx expo install
# Or copy icon from a fresh template:
# npx create-expo-app /tmp/expo-tmp
# copy /tmp/expo-tmp/assets/* into apps/passenger/assets/
```

Make sure these files exist:
- `apps/passenger/assets/icon.png`
- `apps/passenger/assets/splash-icon.png`
- `apps/passenger/assets/favicon.png`

## 3. Install Supabase (same DB as PWA)

```bash
cd apps/passenger
npm install @supabase/supabase-js
```

Client is at `apps/passenger/src/lib/supabase.js`  
Project: `https://zrvcqlyowqfrqdidozrk.supabase.co` (same as PWA)

## 4. Restart Expo

```bash
cd apps/passenger
npx expo start -c
```

Then scan QR again with Expo Go.
