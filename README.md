# Slovakia Travel Companion

Dedicated static website for the Herskovitz Slovakia & Poland 2026 trip.

## Run

```bash
npm install
npm run dev
```

Open `http://localhost:5173/#/unlock` and enter the configured site password.

## Product shape

- One fixed trip; its structured data is bundled with the site.
- Four primary screens: Today, Trip, Wallet, Settings.
- Waze, weather, places, timeline, and contingency plans are ready immediately.
- No file upload, validation inbox, vault, encryption, backup, or data synchronization.
- Authentication is a simple client-side password comparison.

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Development server |
| `npm run build` | Static production build |
| `npm run preview` | Preview the build |
| `npm run typecheck` | TypeScript check |
| `npm run test` | Unit tests |
| `npm run test:e2e` | Playwright smoke test |

## Security notice

The password and trip data are present in the JavaScript bundle. The login screen is only a
convenience gate and must not be treated as security. Anyone who can download the site can
inspect its source and recover both.
