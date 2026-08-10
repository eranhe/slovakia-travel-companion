# Decisions

## Current product

- Dedicated only to the Herskovitz Slovakia & Poland trip, August 2026.
- Twelve trip days, 17–28 August: arrival is day 0, 18–27 are days 1–10, departure is day 11.
- Hebrew/RTL by default; English remains available.
- Static React PWA with hash routing and future manual static hosting.
- No backend, cloud database, GitHub Actions, or deployment in this task.

## Simplified access and data

- Password is hardcoded and checked in the browser.
- No vault, encryption, IndexedDB, auto-lock, backup, restore, or synchronization.
- Login state is in memory and resets on reload.
- Trip profile, days, activities, booking codes, places, and contingencies are bundled.
- This is not secure: the build exposes the password and all bundled trip data.

## Interface

- Primary navigation: Today, Trip, Wallet, Settings.
- Places is opened contextually from Today/Trip.
- Removed demo mode, file upload, Travel Inbox, fact validation, duplicate/conflict review,
  storage diagnostics, and passphrase management.

## Schedule source of truth

- `src/data/dedicated-trip.ts` is transcribed from the family Google Calendar export
  (`scripts/parse-calendars.mjs` is the one-off importer used to read the `.ics` files).
- Arrival (17 Aug) and departure (28 Aug) are full day records with real activities — flights,
  car pickup and return, and the first-evening Liptovská Mara stop — not trip-level metadata.
- Optional calendar entries are kept and flagged `isOptional` rather than dropped, so the app shows
  the same plan the calendar does.
- Mutually exclusive entries share a `choiceGroup` and render as "pick one" (Dino vs Vrátna as a day 1
  swap, the day 4 split between staying at Maladinovo and a flat Podlesok morning, three-way Gubałówka /
  Zakopane festival / Chochołów village on day 8, and the day 5 / 7 / 9 evening add-ons).

## Calendar refresh, 10 Aug 2026

The refreshed `.ics` exports moved several days. The sync was curated, not mechanical, because the
export is internally inconsistent (stale all-day overview, wrong flight wall-clock times, duplicate
22 Aug check-out times, a wrong Ždiar address, Route 66 tagged as Terchová).

- **Applied:** Chopok → 19 Aug (07:15 GO/NO-GO, 07:45 depart, 08:30 lifts, descend by 12:15), followed by
  Route 66 lunch and a full Liptovská Mara afternoon with an optional karting split; Jánošíkove Diery →
  20 Aug with a hard 13:00 stop before the paid Bešeňová ticket (15:15–20:00); Suchá Belá → early
  21 Aug (leave 06:10, in the gorge 07:40) with the Mom + Rotem choice modelled as two separate options;
  22 Aug canonicalised on the 07:00 chain (wake 06:15, check-out 06:40, first cabins 08:30, Ždiar 451
  from 15:00); AquaCity Poprad added as the 22 and 24 Aug storm branch.
- **Rejected:** the calendar's 08:45 arrival and 08:50 departure times (booking says LY5119 07:00→09:45,
  LY5120 09:50→14:15), the duplicate 09:00 check-out event, the Ždiar "67 716" address, the stale
  28 Aug car-return event (the car is returned on the evening of 27 Aug), and Dino/Vrátna as a
  Tatralandia afternoon add-on (1h20 away — kept as a swap and as the Bešeňová-closed fallback).
- **Reframed:** the Dobšinská ice cave is no longer a fixed stop; it is the rain plan for the Chopok day
  and for a washed-out 21 Aug.
- Everything derived from the schedule was updated with it: day titles and notes, place `dayNumbers` /
  `activityIds`, new place records (Route 66, Monaco Karting, Suchá Belá, TANAP museum, AquaCity Poprad,
  Tricklandia), contingencies for days 2–5, 7 and 8, decision/prep reminders, day-bag plans and packing
  section subtitles, emergency gorge/lift tips, and three new Slovak phrases.
- Pre-trip prep, the Hilton free-cancellation deadline, and both online check-ins live in a separate
  `reminders` array so they surface without pretending to be itinerary activities.
- `src/data/dedicated-trip.test.ts` enforces the cross-references: every `activityIds` entry resolves,
  every `placeId` and `imageId` exists, no day is empty, and start times stay ordered.

## Booking documents & source-library sync

- The source binder folders (`אטרקציות`, `טיסות`, `השכרת רכב`, `לינה`, `ביטוח נסיעות`, `תכנון`) were read
  end-to-end; every reservation now has a Wallet entry in `dedicated-trip.ts` → `documents`, grouped by
  category and carrying a `note` with the concrete details (confirmation numbers, per-traveler Gopass PINs
  and card numbers, hotel PINs, operator phone, cancellation deadlines).
- Flight times were corrected to the official El Al e-ticket (LY5119 07:00→09:45, LY5120 09:50→14:15);
  the calendar copy was an hour off. Tatralandia (`Gopass`) and Energylandia (`4957259`) activities now
  carry their booking refs too.
- `WalletPage` groups documents by category and renders the `note`, and the large-code overlay shows it.

## Planning-guide integration (`תכנון`)

- The operational tips PDF and the "recommendations not in the schedule" doc were folded into the app as:
  - **decision + prep reminders** (bilingual, `kind: 'decision' | 'prep'`) reproducing the guide's phone
    "decision card" and the four timing corrections (ice-cave 07:15, Suchá Belá 11:45 cutoff, Belianska
    07:30, Energylandia 18:00 hard stop);
  - **curated optional add-ons** as `isOptional` activities — Skalnaté quest (22 Aug), Goral evening vs
    grill (24 Aug), Zakopane folk festival (25 Aug), Hrebienok bouldering + Julie Nox vs Titanic dinner
    (26 Aug), plus Dinner Under the Stars vs Hohenlohe dinner (22 Aug);
  - **weather backups** appended to existing contingency plans (Luminaverse + Nature Museum near
    Maladinovo, Strachankovo near Ždiar).

## Imagery

- Place photos are **real Wikimedia Commons photographs** (CC BY / CC BY-SA / CC0 / Public domain),
  bundled in `public/images` as 960×540 and 320×320 WebP so the PWA stays offline.
- Attribution lives in `public/images/CREDITS.json` (+ `CREDITS.md`) and is listed under Settings.
- `scripts/fetch-real-photos.mjs` refreshes the set from Commons; `src/media/images.ts` is the only
  place that maps an id to a URL — unknown ids render nothing rather than a broken image.

## Photos & journal (Phase 10)

- Photos via explicit picker/camera only — never silent gallery scanning.
- Location metadata attached only when the user checks approval at import time.
- Photo blobs/thumbnails in IndexedDB; journal + recaps in localStorage (unencrypted in the simplified product).
- Nightly recap default 21:30 trip-local; in-app / on-open cues only (no background scheduler).
- Deterministic local templates (no remote AI). Locked body text survives regeneration.
- Share/copy sanitizes known booking/policy refs. Object URLs are revoked after use.

## Maps (Phase 9)

- Chose **Option A**: completed activities + manual/foreground check-ins + estimated routes.
- No background location tracking and no promise of locked-phone tracking.
- Two layers: Planned (teal) and Visited (green) on OpenStreetMap via Leaflet.
- Map points use approximate-city forecast coordinates for display only — never invented verified Waze pins.
- Dashed day routes are always labeled **Estimated — not exact**.
- Check-ins and completed-activity flags persist in localStorage (simplified product; not encrypted).

## Content surfaces (Phase 8)

- Guide hub: Command center, packing checklist, phrasebook, emergency.
- Packing checklist uses the family 4-bag list; checkmarks persist in localStorage only.
- Morning briefing on Today answers sleep / first activity / weather / bag / rain-plan readiness.
- Emergency emphasizes calling 112 before apps; no personal medical profile is stored.
- Command center omits vault/backup storage diagnostics (removed in the simplified product).

## Weather review (Phase 7)

- Tomorrow Check at 20:30 trip-local time, on-open after 20:30, manual, and morning recheck.
- No background scheduler — checks only run while the app is open.
- Assessments never auto-change the itinerary; contingency activation needs preview + confirm.
- Day 10 evening reviews the departure day, which is now a real itinerary day.
- Optional local `.ics` calendar reminder export.

## Navigation and weather

- Waze uses search links by default; precise coordinates are not invented.
- Open-Meteo provides weather with a 30-minute cache and request deduplication.
- City-level forecast points are labeled approximate and are not used as precise Waze pins.

## Itinerary

- Main timeline supports accessible up/down ordering.
- Contingency plans require preview and confirmation.
- Undo/revision history is in memory and resets on reload.
