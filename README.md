# Ireland Trip (Offline PWA)

Offline-first static site for planning and carrying your Ireland trip info.

## Requirements covered
1) Map pins for POIs and standout castle icons for stays
2) Hover shows image + title + short description
3) Click opens one‑pager; graceful message if none exists
4) Index page listing all items with deep links
5) Opt-in/out toggle stored locally
6) Offline editor to modify JSON (import/export) on the phone
7) PWA shell for offline use

## Dev
npm install
npm run dev

## Build
npm run build
npm run preview

## Notes
- This MVP omits a basemap to keep it small and fully offline. You can add local tiles later.
- Add/replace images under public/assets/ and update src/data/places.json.