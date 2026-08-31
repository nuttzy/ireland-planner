# Ireland Trip Planner

A personal, offline-capable trip planner for Ireland. It combines a map, points of interest, hotel stays, one-page reference notes, and a day-by-day itinerary in a static web application that can be installed on a phone.

Live site: <https://nuttzy.github.io/ireland-planner/>

## What the app provides

- A vintage offline map with markers for stays and points of interest
- Filterable place listings and map popups
- A Markdown one-pager for every place
- A six-day itinerary with locally assigned visits
- On-device editing, JSON import, and JSON export
- Installation as a home-screen web app
- Deterministic precaching of the application, data, map, and images
- Automatic deployment to GitHub Pages from `main`

## Technology

- React and TypeScript
- Vite
- React Router using hash-based routes for GitHub Pages compatibility
- Leaflet and React Leaflet
- Markdown rendered with Marked
- `vite-plugin-pwa` and Workbox for offline support
- GitHub Actions and GitHub Pages for hosting

## Local development

Use a current Node.js LTS release and npm.

```bash
npm install
npm run dev
```

Because the production site is hosted below `/ireland-planner/`, the local URL is normally:

```text
http://localhost:5173/ireland-planner/
```

The development server does not install the production service worker. It displays `Development mode` in the header instead.

## Production build

```bash
npm run build
npm run preview
```

The build creates `dist/` and then runs the offline-build verifier. A successful build confirms that:

- Every image referenced by `src/data/places.json` exists
- No TIFF files are included
- No individual precached asset exceeds 5 MiB
- Every runtime file in `dist/` is present in the generated precache manifest
- `dist/service-worker.js` was generated successfully

The preview is normally available at:

```text
http://localhost:4173/ireland-planner/
```

`dist/` and the generated service worker are build output. Do not edit or commit them.

### npm commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the Vite development server |
| `npm run build` | Type-check, build, generate the service worker, and verify the offline package |
| `npm run verify:offline` | Re-run offline validation against the existing `dist/` directory |
| `npm run preview` | Serve the completed production build locally |

## Updating trip content

Each place is made from three related pieces:

1. A record in `src/data/places.json`
2. A Markdown one-pager in `src/content/`
3. An image in `public/assets/`

### Add or edit a place

Edit `src/data/places.json`. A typical record looks like this:

```json
{
  "id": "newgrange",
  "name": "Newgrange & Brú na Bóinne",
  "type": "poi",
  "source": "Personal",
  "city": "Donore, County Meath",
  "lat": 53.693532,
  "lng": -6.449287,
  "image": "/assets/poi/Newgrange.jpg",
  "shortDesc": "A short description for maps and lists."
}
```

Keep `id` unique and stable. It connects the data record to its one-pager and may also be stored in a device's itinerary.

Supported place types are `stay`, `poi`, `food`, `shopping`, and `activity`. Supported source filters are `TV`, `Personal`, `GPT`, and `2018`; a missing source is treated as `GPT`.

### Add or edit a one-pager

Create or edit:

```text
src/content/<place-id>.md
```

For example, the place with ID `newgrange` uses `src/content/newgrange.md`. Filenames are case-sensitive when deployed to GitHub Pages.

Markdown files are bundled into the application during the build, so they are available offline without additional requests.

### Add or replace an image

Store images under one of these directories:

```text
public/assets/poi/
public/assets/stays/
```

Reference them from `places.json` as `/assets/...`. The application adds the correct GitHub Pages base path when displaying them.

Supported precache formats include PNG, JPG/JPEG, WebP, and SVG. Optimize images before adding them and keep each file below 5 MiB. A few hundred kilobytes or less is preferable for phone updates.

After changing data, one-pagers, or images, always run:

```bash
npm run build
```

The build should fail if a referenced image is missing or a runtime asset would be left out of the offline cache.

## Deployment

The workflow in `.github/workflows/deploy.yml` runs for every push to `main`. It:

1. Installs the exact dependencies from `package-lock.json` with `npm ci`
2. Runs the production build and offline validation
3. Uploads `dist/` as the Pages artifact
4. Deploys it to GitHub Pages

GitHub Pages must remain configured to use **GitHub Actions** as its source.

To publish an update:

```bash
git add <changed-files>
git commit -m "Describe the update"
git push origin main
```

Check the repository's **Actions** tab and wait for `Deploy to GitHub Pages` to finish successfully before updating a device.

The existing site at <https://nuttzy.github.io/> is separate. This project is hosted only beneath `/ireland-planner/`.

## Installing on an iPhone or iPad

1. Open <https://nuttzy.github.io/ireland-planner/> in Safari while online.
2. Leave the page open until the header says **Ready offline**.
3. Use Safari's Share menu and choose **Add to Home Screen**.
4. Launch the installed app once while still online.
5. Test it in airplane mode before relying on it during the trip.

The initial offline download is currently about 15 MiB. Keep the page open until it finishes.

## Updating a device

After a new version has deployed successfully:

1. Connect the device to the internet.
2. Open the installed app, or visit <https://nuttzy.github.io/ireland-planner/> in the browser where it was installed.
3. Leave it open while it checks for the new service worker.
4. Tap **Update now** when that button appears.
5. Wait for the app to reload and report **Ready offline**.
6. Optionally enable airplane mode and spot-check the map, itinerary, one-pagers, and images.

The new service worker downloads the complete new release before replacing the previous offline version. If that download fails, the previous cached release remains available.

If **Update now** does not appear immediately, confirm the GitHub Action completed, keep the app online, and reload it once.

### Device-local data during updates

Application updates do not erase `localStorage`. Itinerary assignments, source filters, and locally edited place data remain on that device.

This is normally desirable, but a saved places override takes precedence over the newly deployed `places.json`. If deployed place changes do not appear:

1. Open **Edit Data**.
2. Choose **Reset place data** to remove only the local places override.
3. Use **Reset app data** only when you want to remove all Ireland-app settings stored on that device.

Export locally edited place JSON before resetting it if you may want those edits later.

## How offline operation works

`vite-plugin-pwa` generates `dist/service-worker.js` during each production build. The file does not exist in `public/` and should not be maintained by hand.

The generated worker precaches the application shell and every supported runtime asset, including:

- Compiled JavaScript and CSS
- The web app manifest and icons
- The vintage map image
- All POI and stay images
- All data and bundled Markdown content

Navigation requests fall back to the cached application entry point. Hash-based routes such as `#/itinerary` allow all client-side pages to work on GitHub Pages without server rewrite rules.

The header reports the current offline state:

- **Preparing offline…** — the worker is installing or checking the cache
- **Ready offline** — the complete current release is cached
- **Working offline** — the browser is offline and the cached release is active
- **Update now** — a new complete release is waiting to activate
- **Offline setup failed** or **Offline cache incomplete** — do not assume the app is ready for offline use

External websites linked from a one-pager are not cached and still require internet access.

## Local data and privacy

The app has no backend and does not synchronize personal state between devices. The following keys are stored only in the current browser or installed app:

| Key | Contents |
| --- | --- |
| `ireland_itinerary_v1` | Day assignments and planned POIs |
| `ireland_filters_sources_v1` | Selected source filters |
| `ireland_places_override_v1` | Locally edited or imported place data |
| `ireland_user_flags_v1` | Per-place user flags |

The reset control removes keys beginning with `ireland_`; it cannot clear storage belonging to another site or origin.

Clearing website data, uninstalling the home-screen app, or using a different browser or device may remove or isolate local changes. Export important local edits before doing so.

Everything committed to this repository and deployed to GitHub Pages should be treated as public, including default trip data, Markdown notes, and images. Device-local `localStorage` is not included in deployments.

## Project layout

```text
.github/workflows/deploy.yml    GitHub Pages deployment
public/assets/                  Map, icons, and place images
public/manifest.webmanifest     Installable-app metadata
scripts/verify-offline-build.mjs
                                Offline build validation
src/content/                    Markdown one-pagers
src/data/places.json            Canonical place data
src/hooks/                      Local persistence and app state
src/pages/                      Index, itinerary, editor, and details
src/utils/assetUrl.ts           GitHub Pages-aware asset paths
vite.config.ts                  Build, base path, and PWA configuration
```

## Troubleshooting

### A newly deployed place does not appear

Check for a device-local places override under **Edit Data**. Choose **Reset place data** if the deployed file should become authoritative again.

### An image works locally but not on GitHub Pages

Check filename capitalization and confirm the path in `places.json` exactly matches the file under `public/assets/`. Run `npm run build` before pushing.

### The app works online but not offline

Keep it open online until it says **Ready offline**. If it reports a failure, reconnect, reload, and allow the full cache to download. Also confirm the latest Pages deployment succeeded.

### GitHub Pages shows an old release

Confirm the deployment completed in **Actions**, open the app online, and use **Update now** when prompted. The old release intentionally remains active until the new one is completely downloaded.
