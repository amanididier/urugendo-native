# Build downloadable apps + automatic updates

You install each APK **once**. After that, when we push JS/UI changes and you run `eas update`, phones that are **online** pick up the new version **on next open** — no reinstall, no “Update” button.

---

## How it works

| Layer | What |
|-------|------|
| **APK** (native shell) | Built with EAS once (or when native modules change) |
| **OTA** (`eas update`) | JS, screens, styles — pushed over the network |
| **AutoUpdateGate** | On launch: check → download → reload automatically |

Expo Go does **not** use this. Only real APKs / store builds do.

---

## One-time setup (your PC)

### 1. Install tools

```powershell
npm install -g eas-cli
eas login
```

Create a free account at https://expo.dev if needed.

### 2. Passenger app project

```powershell
cd C:\Users\HP\Documents\urugendo-native
git pull origin main

cd apps\passenger
npm install
npx expo install expo-updates
eas init
```

`eas init` writes a real `projectId` into `app.json`. Keep that file.

### 3. Agency app project

```powershell
cd C:\Users\HP\Documents\urugendo-native\apps\agency
npm install
npx expo install expo-updates
eas init
```

### 4. Build APKs (cloud, free tier has limits)

**Passenger:**

```powershell
cd C:\Users\HP\Documents\urugendo-native\apps\passenger
eas build -p android --profile preview
```

**Agency:**

```powershell
cd C:\Users\HP\Documents\urugendo-native\apps\agency
eas build -p android --profile preview
```

When the build finishes, Expo gives a **download URL**. Install on your phone (allow install from browser).

Put those URLs on the marketing site buttons (`data-apk` + `href` in `website/index.html`).

---

## Every batch of code changes (no new APK)

After we push UI/logic changes to GitHub:

```powershell
cd C:\Users\HP\Documents\urugendo-native
git pull origin main

cd apps\passenger
eas update --branch preview --message "batch: describe change"

cd ..\agency
eas update --branch preview --message "batch: describe change"
```

Then on your phone: **close the app fully and open it again** (online).  
It shows “Checking for updates…” briefly, then loads the new code by itself.

---

## When you *must* rebuild the APK

Only if you change **native** things, for example:

- new native module
- `app.json` version / package name
- icons that must ship inside the binary
- SDK upgrade

Otherwise prefer `eas update` only.

---

## iPhone later

Same projects work for iOS with `eas build -p ios`, but Apple needs an Apple Developer account for device installs beyond short test periods. Android APK is the fast path for you now.

---

## Free tier notes

- Expo / EAS free plan: limited builds per month
- OTA updates: generous free quota for small teams
- Host APKs on Expo’s link, Google Drive, or your Vercel site (`/downloads/*.apk`)
