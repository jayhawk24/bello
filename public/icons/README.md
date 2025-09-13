# PWA Icons

This folder contains platform-targeted icons generated from a PWA generator.

Structure:
- android/ … Android launcher icons (48–512)
- ios/ … iOS touch icons (16–1024)
- windows11/ … Windows tiles/splash assets

How to update:
1. Replace files in the respective subfolders with new ones from your generator.
2. Keep names identical to avoid code changes.
3. Update `public/manifest.webmanifest` if you add/remove sizes you want Android/Chromium to consider.
4. iOS uses the `<link rel="apple-touch-icon" …>` tags in `src/app/layout.tsx`.

Verification:
- Run a production build and open the app on a device or in Chrome devtools → Application → Manifest.
- Use Lighthouse PWA audit to confirm icons are discovered.