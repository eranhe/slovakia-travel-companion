# Architecture

## Overview

Single-purpose static React PWA. There is no backend, database, vault, encryption layer,
file-import workflow, or synchronization mechanism.

## Data flow

```text
src/data/dedicated-trip.ts
src/data/trip-places-seed.ts
src/data/contingency-seed.ts
src/data/packing-seed.ts
src/data/phrasebook-seed.ts
src/data/emergency-seed.ts
        ↓
Today / Trip / Wallet / Places / Guide (journal · maps · packing · phrases · emergency · command)
```

Trip and place repositories expose asynchronous functions only to keep page code simple;
they read bundled in-memory data. Itinerary edits and active contingency plans live in memory
and reset when the page reloads.

## Login

`src/auth/password.ts` performs a literal client-side comparison. Successful login changes
React session state from `locked` to `open`. The state is not persisted across reloads.

## Hosting

Hash routing and `VITE_BASE_PATH` allow static subpath hosting. All application data,
including the password, is part of the public build.
