# Cal AI - PWA Testing Guide

## PWA Implementation Summary

Cal AI now has full Progressive Web App (PWA) capabilities, enabling offline functionality, app installation, and enhanced performance through intelligent caching.

### Files Created

1. **PWA Icons**
   - `/public/icon-192.png` - 192x192 app icon
   - `/public/icon-512.png` - 512x512 app icon
   - `/public/apple-touch-icon.png` - 180x180 Apple touch icon
   - `/public/icon-192.svg` - Source SVG (192x192)
   - `/public/icon-512.svg` - Source SVG (512x512)

2. **PWA Manifest**
   - `/public/manifest.json` - PWA manifest configuration

3. **Service Worker Registration**
   - `/src/registerSW.ts` - Service worker registration with auto-update
   - Includes install prompt handling
   - Update notifications via toast
   - Offline ready notifications

4. **Offline Indicator Component**
   - `/src/components/OfflineIndicator.tsx` - Real-time online/offline status notifications

### Configuration Changes

1. **vite.config.ts**
   - Added `vite-plugin-pwa` with Workbox configuration
   - Configured runtime caching strategies:
     - **Supabase API**: NetworkFirst (10s timeout, 7 days cache)
     - **Images**: CacheFirst (30 days cache, 200 max entries)
     - **Google Fonts**: StaleWhileRevalidate (1 year cache)
     - **Static Assets**: CacheFirst (90 days cache)
   - Auto-update strategy enabled
   - Maximum cache size: 50MB

2. **index.html**
   - Added manifest link
   - Added apple-touch-icon link
   - Updated theme-color to match app branding (#10B981)
   - Added PWA icon links

3. **main.tsx**
   - Initialized PWA service worker
   - Added install prompt handling
   - Integrated with Sentry for error tracking

4. **App.tsx**
   - Added OfflineIndicator component for network status monitoring

### Dependencies Installed

```json
{
  "devDependencies": {
    "vite-plugin-pwa": "^1.1.0",
    "workbox-window": "^7.3.0",
    "sharp": "^0.33.5" (for icon generation)
  }
}
```

---

## Testing PWA Features

### 1. Build for Production

```bash
# Build the app with PWA support
npm run build

# Serve the production build
npm run preview
# or use a simple HTTP server
npx serve dist
```

### 2. Test in Chrome DevTools

#### A. Manifest Validation

1. Open Chrome DevTools (F12)
2. Go to **Application** tab
3. Click **Manifest** in the left sidebar
4. Verify:
   - ✅ Name: "Cal AI - Smart Nutrition Tracker"
   - ✅ Short name: "Cal AI"
   - ✅ Start URL: "/"
   - ✅ Theme color: #10B981
   - ✅ Display: standalone
   - ✅ Icons: 192x192 and 512x512 visible

#### B. Service Worker Validation

1. In DevTools **Application** tab
2. Click **Service Workers** in the left sidebar
3. Verify:
   - ✅ Service worker is **activated and running**
   - ✅ Status shows "activated"
   - ✅ You can see the service worker script URL

#### C. Cache Storage

1. In DevTools **Application** tab
2. Click **Cache Storage** (under Cache section)
3. Verify caches exist:
   - ✅ `workbox-precache-v2-...` (app shell cache)
   - ✅ `supabase-api-cache` (after making API calls)
   - ✅ `images-cache` (after viewing meal images)
   - ✅ `static-assets-cache` (fonts, CSS, JS)
   - ✅ `google-fonts-cache` (if using Google Fonts)

### 3. Test Offline Mode

#### Option A: Chrome DevTools Network Throttling

1. Open DevTools → **Network** tab
2. Change throttling dropdown from "No throttling" to **"Offline"**
3. Reload the page
4. Verify:
   - ✅ App loads successfully from cache
   - ✅ Previously viewed meals are visible
   - ✅ Offline indicator toast appears
   - ✅ Navigation still works
   - ✅ UI remains functional

#### Option B: Disable Network

1. Disconnect from WiFi/unplug ethernet
2. Reload the page
3. Verify same offline functionality

### 4. Test Install Prompt

#### Desktop (Chrome/Edge)

1. Visit the site in Chrome/Edge
2. Look for install icon in address bar (+ icon or install icon)
3. Click the icon or wait for the install prompt toast
4. Click "Install" in the toast notification
5. Verify:
   - ✅ App installs as standalone window
   - ✅ App icon appears in taskbar/dock
   - ✅ App opens in standalone mode (no browser UI)

#### Mobile (Android)

1. Visit site in Chrome on Android
2. Tap the 3-dot menu → **"Add to Home screen"** or **"Install app"**
3. Confirm installation
4. Verify:
   - ✅ App icon appears on home screen
   - ✅ App opens in fullscreen standalone mode
   - ✅ No browser address bar visible

#### Mobile (iOS)

iOS doesn't support install prompts but supports Add to Home Screen:

1. Open Safari on iPhone/iPad
2. Tap the Share button (square with arrow)
3. Scroll and tap **"Add to Home Screen"**
4. Confirm
5. Verify:
   - ✅ App icon appears on home screen
   - ✅ App opens without Safari UI
   - ✅ Uses apple-touch-icon

### 5. Test Auto-Update

1. Make a small change to the app (e.g., change a color)
2. Build again: `npm run build`
3. Deploy/serve the new build
4. Keep the old version open in browser
5. After ~1 hour (or manually refresh service worker in DevTools)
6. Verify:
   - ✅ Toast notification appears: "New version available!"
   - ✅ Click "Update" button in toast
   - ✅ Page reloads with new version
   - ✅ Changes are visible

### 6. Test Caching Strategies

#### Supabase API Caching (NetworkFirst)

1. Load the dashboard with meals
2. Open DevTools → Network tab
3. Reload page
4. Verify:
   - ✅ First load: Network requests to Supabase
   - ✅ Check Cache Storage → `supabase-api-cache`
   - ✅ Go offline
   - ✅ Reload page
   - ✅ Data loads from cache (no network errors)

#### Image Caching (CacheFirst)

1. View a meal with an image
2. Open DevTools → Application → Cache Storage
3. Check `images-cache`
4. Verify:
   - ✅ Meal images are cached
   - ✅ Reload page → images load instantly from cache
   - ✅ No network requests for cached images

---

## Lighthouse PWA Audit

### Run Lighthouse Audit

1. Open Chrome DevTools
2. Go to **Lighthouse** tab
3. Select:
   - ✅ Progressive Web App
   - ✅ Performance (optional)
   - 📱 Mobile or 🖥️ Desktop
4. Click **"Analyze page load"**

### Expected PWA Score: 100/100

#### Required Criteria (All should pass ✅)

- ✅ **Installable**
  - Web app manifest meets installability requirements
  - Service worker registered
  - HTTPS (or localhost)

- ✅ **PWA Optimized**
  - Configured for a custom splash screen
  - Sets theme color
  - Content sized correctly for viewport
  - Provides apple-touch-icon

- ✅ **Offline Functionality**
  - Service worker controls page and start_url
  - App works offline (200 response when offline)

- ✅ **Performance**
  - Fast load times
  - Responsive design
  - No console errors

### Common Issues & Fixes

| Issue | Solution |
|-------|----------|
| "Does not respond with 200 when offline" | Ensure service worker is active and precaching is working |
| "No matching service worker detected" | Check service worker registration in main.tsx |
| "Manifest doesn't have a maskable icon" | Icons already set to "any maskable" purpose |
| "Page load is not fast enough" | Already optimized with code splitting and caching |

---

## Testing Checklist

### Before Deployment

- [ ] Build passes: `npm run build`
- [ ] Service worker generates: Check `dist/sw.js` exists
- [ ] Manifest generates: Check `dist/manifest.webmanifest` exists
- [ ] Icons exist in dist: icon-192.png, icon-512.png, apple-touch-icon.png
- [ ] Preview build works: `npm run preview`

### Functionality Tests

- [ ] **Install prompt appears** (on supported browsers)
- [ ] **App installs successfully** (desktop & mobile)
- [ ] **Offline mode works** (can view cached meals)
- [ ] **Network status indicator** shows offline/online toasts
- [ ] **Auto-update works** (new version notification)
- [ ] **Cached images load** when offline
- [ ] **API responses cache** (NetworkFirst strategy)
- [ ] **App shell caches** (instant reload)

### Browser Compatibility

- [ ] **Chrome/Edge Desktop** - Full PWA support ✅
- [ ] **Chrome Android** - Full PWA support ✅
- [ ] **Safari iOS** - Add to Home Screen (limited PWA) ⚠️
- [ ] **Firefox Desktop** - Partial PWA support ⚠️

---

## Advanced Testing

### Test Cache Expiration

```javascript
// In DevTools Console
caches.keys().then(keys => console.log('Caches:', keys));

// Clear specific cache
caches.delete('supabase-api-cache');

// Clear all caches
caches.keys().then(keys =>
  Promise.all(keys.map(key => caches.delete(key)))
);
```

### Monitor Service Worker Updates

```javascript
// In DevTools Console
navigator.serviceWorker.getRegistration().then(reg => {
  console.log('Service Worker:', reg);
  reg.update(); // Force check for updates
});
```

### Test Network Strategies

1. **NetworkFirst**: Open DevTools Network → Slow 3G
2. **CacheFirst**: Check images load instantly
3. **StaleWhileRevalidate**: Check fonts load from cache then update

---

## Performance Metrics

### Current Build Stats

- **Total Bundle Size**: ~1.58 MB (precached)
- **Largest Chunks**:
  - charts-BBCv43J6.js: 383.40 kB (gzip: 105.29 kB)
  - index-DyOvSFKJ.js: 313.16 kB (gzip: 104.03 kB)
  - supabase-vendor: 166.81 kB (gzip: 44.39 kB)
  - react-vendor: 162.77 kB (gzip: 53.08 kB)

### Cache Limits

- **Maximum cache size**: 50 MB
- **Supabase API cache**: 100 entries, 7 days
- **Images cache**: 200 entries, 30 days
- **Static assets**: 100 entries, 90 days
- **Google Fonts**: 20 entries, 1 year

---

## Troubleshooting

### Service Worker Not Registering

```bash
# Check if running on HTTPS or localhost
# Service workers require secure context

# Check console for errors
# DevTools → Console → Look for service worker errors
```

### Install Prompt Not Showing

```javascript
// Must meet all criteria:
// 1. Valid manifest
// 2. Service worker registered
// 3. HTTPS (or localhost)
// 4. Not already installed
// 5. User engagement (visited site multiple times)
```

### Cache Not Working

```javascript
// Clear all caches and reload
caches.keys().then(keys =>
  Promise.all(keys.map(key => caches.delete(key)))
).then(() => location.reload());
```

---

## Deployment Notes

### Environment Requirements

1. **HTTPS Required** (or localhost for testing)
2. **Valid manifest.json** served with correct MIME type
3. **Service worker** must be served from same origin
4. **Icons** must be accessible (not 404)

### Hosting Configuration

Most modern hosts (Vercel, Netlify, Cloudflare Pages) automatically support PWAs. Ensure:

- Service worker is not cached aggressively (check _headers file)
- Manifest is served with `application/manifest+json` MIME type
- Icons are publicly accessible

---

## Next Steps

### Optional Enhancements

1. **Background Sync**: Queue failed API requests when offline
2. **Push Notifications**: Notify users of meal reminders
3. **Periodic Background Sync**: Sync data in background
4. **App Shortcuts**: Add quick actions to app icon
5. **Share Target**: Allow sharing to Cal AI from other apps

### Icon Improvements

Replace placeholder icons with professionally designed ones:

```bash
# Current icons are SVG-based placeholders
# Replace with:
# - Professional icon design
# - Proper maskable icon (safe zone padding)
# - Adaptive icons for Android
```

---

## Resources

- [PWA Checklist](https://web.dev/pwa-checklist/)
- [Workbox Documentation](https://developers.google.com/web/tools/workbox)
- [Web App Manifest Spec](https://www.w3.org/TR/appmanifest/)
- [Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
