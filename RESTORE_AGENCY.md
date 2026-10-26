# Logo placement + Agency restore

## Logos (your 3 assets)

| Your file | App | Path |
|-----------|-----|------|
| **White Duck on green** (`White Duck Loop Logo.png`) | Passenger store icon/splash | `apps/passenger/assets/icon.png` and `splash-icon.png` |
| **Green Duck on white** (`Minimalist Green Duck Emblem.png`) | Agency store icon/splash | `apps/agency/assets/icon.png` and `splash-icon.png` |
| **Transparent duck** (`urugendo-transparent-brand-logo.png`) | In-app headers both apps | `apps/passenger/assets/logo.png` and `apps/agency/assets/logo.png` |

### Copy commands (Windows)

```bat
cd C:\Users\HP\Documents\urugendo-native

copy "path\to\White Duck Loop Logo.png" "apps\passenger\assets\icon.png"
copy "path\to\White Duck Loop Logo.png" "apps\passenger\assets\splash-icon.png"

copy "path\to\Minimalist Green Duck Emblem.png" "apps\agency\assets\icon.png"
copy "path\to\Minimalist Green Duck Emblem.png" "apps\agency\assets\splash-icon.png"

copy "path\to\urugendo-transparent-brand-logo.png" "apps\passenger\assets\logo.png"
copy "path\to\urugendo-transparent-brand-logo.png" "apps\agency\assets\logo.png"
```

### Code already expects

- Passenger: `require('./assets/logo.png')` in the home header (after you pull logo App updates)
- Agency: same path in dashboard header

## If Agency App.js is broken on pull

```bash
git show 0909c96a66a92a713e891ac5a7444605ca51cfab:apps/agency/App.js > apps/agency/App.js
```

Then add `Image` to imports from `react-native` and replace the bus in `logoCircle` with:

```jsx
<Image source={require('./assets/logo.png')} style={{ width: 44, height: 44 }} resizeMode="contain" />
```
