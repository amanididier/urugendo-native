# Urugendo brand logos

## Your three assets

| Asset | File to use | Where it goes |
|-------|-------------|---------------|
| **White duck on green** | `passenger-icon-green-bg.png` | Passenger **app icon + splash** |
| **Green duck on white** | `agency-icon-white-bg.png` | Agency **app icon + splash** |
| **Transparent green duck** | `logo-transparent.png` | **In-app** headers (replaces bus emoji) → `assets/logo.png` |

## On your PC (after `git pull`)

Copy the files you uploaded into the apps:

```bat
cd C:\Users\HP\Documents\urugendo-native

REM Passenger store icon (green background)
copy "brand\passenger-icon-green-bg.png" "apps\passenger\assets\icon.png"
copy "brand\passenger-icon-green-bg.png" "apps\passenger\assets\splash-icon.png"
copy "brand\passenger-icon-green-bg.png" "apps\passenger\assets\android-icon-foreground.png"

REM Agency store icon (white background)
copy "brand\agency-icon-white-bg.png" "apps\agency\assets\icon.png"
copy "brand\agency-icon-white-bg.png" "apps\agency\assets\splash-icon.png"
copy "brand\agency-icon-white-bg.png" "apps\agency\assets\android-icon-foreground.png"

REM In-app logo (both apps)
copy "brand\logo-transparent.png" "apps\passenger\assets\logo.png"
copy "brand\logo-transparent.png" "apps\agency\assets\logo.png"
```

If `brand/` is empty after pull, copy from your original files:

- White Duck Loop Logo.png → passenger icon/splash
- Minimalist Green Duck Emblem.png → agency icon/splash
- urugendo-transparent-brand-logo.png → both apps `assets/logo.png`

Then restart Expo:

```bash
cd apps/passenger
npx expo start -c
```

App code already uses `require('./assets/logo.png')` in headers instead of the bus emoji.
