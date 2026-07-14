# Spark Homes Repair Estimator

Mobile-first, offline-first repair walkthrough app for Spark Homes acquisition agents. Built for the Spark Homes Developer Contest (July 2026).

**Live app:** https://nicholastc.github.io/spark-homes-repair-estimator/

## Running it

No build step. Open `index.html` directly in a browser, or serve the folder as static files:

```bash
python3 -m http.server 8080
# then open http://localhost:8080
```

PWA install and offline mode need HTTPS (or localhost). It's deployed on GitHub Pages.

## What it does

**Core (contest requirements)**
- 100+ repair line items across 29 groups, spanning 7 room types (Bathroom, Bedroom, Kitchen, Living/Common, Interior/General, Systems & Structure, Exterior) plus free-form custom rooms
- Multiple room instances (Bedroom 1, 2, 3...) added or removed anytime during the walkthrough
- "No Action Needed" toggle per group
- Price overrides, per-project or global, with the original catalog price still shown for comparison
- Custom line items and photos, per item
- Running total always visible in the header
- Progress tracking per group, per room, and overall, plus a recommended walkthrough order
- Camera capture for photos (compressed client-side before saving, to stay under localStorage limits)
- Export to a ZIP: Excel workbook (one tab per room), photos organized by room/group, and a text summary
- Offline PWA — service worker, localStorage, installable to home screen, with an update banner when a new version loads

**Guided walkthrough**
Steps through rooms in a recommended order, then groups, then items, with breadcrumbs ("Room 2 of 8", "Group 3 of 5") so it's always clear where you are. The order is a suggestion, not a rule — drag to reorder and it sticks. "Copy setup from another room" copies item selections between similar rooms (e.g. two bedrooms in similar shape) without carrying over photos or serial numbers that don't apply to the new room.

**SparkCheck**
Rule-based checks that catch things easy to miss on a rushed walkthrough: unreviewed HVAC/electrical, a roof line item with no photo, appliances with no condition photo, line items checked with zero quantity, and a few more. Each one links straight to the group that needs attention.

**Deal Analyzer**
ARV, target profit, and holding/selling costs roll up into a max offer and a Green/Yellow/Red confidence read, so the repair estimate ties directly into the go/no-go decision instead of sitting as a checklist total.

**Dashboard**
Status pill per project (Not Started / In Progress / Complete), a "continue where you left off" banner for the most recently active project, and sorting by recency, name, status, or value.

**Extras beyond the brief**
- **Autosummarizer** — one tap generates a plain-language summary of a project's status, top risks, and deal read. Fully offline and rule-based, no LLM involved; the same text is reused in the export.
- **Room condition rating** (Good/Fair/Poor/Gut) — a quick anchor before picking items; lets SparkCheck flag a "Poor" room with nothing selected as inconsistent.
- **Serial number OCR** (Tesseract.js, lazy-loaded) — pulls serials off HVAC/water heater/appliance nameplates, with manual entry as a fallback when a photo doesn't OCR cleanly.
- **Drag-to-reorder walkthrough** — same idea as above, agents aren't locked into the app's suggested order.
- **Quick repair profiles** — one-tap templates (e.g. "Standard Bath Refresh") for common jobs.
- **Backup / restore** — download or upload all projects as JSON, in case localStorage gets cleared or you switch devices.
- **Project duplication** — copy a project's room setup for a similar property layout.
- **Walkthrough timer** — tracks time spent, included in the export.
- **Hand-drawn SVG icons instead of emoji** — keeps the UI consistent across devices and doesn't depend on an icon font or CDN.

## Stack

Vanilla HTML/CSS/JS, no build step. Tailwind (CDN) for styling, xlsx-js-style for the Excel export, JSZip for bundling the export, Tesseract.js (lazy-loaded) for OCR.

## Files

```
index.html      the app — markup, styles, and logic, all in one file (~3,700 lines)
sw.js           service worker (network-first app shell, cache-first static assets)
manifest.json   PWA manifest
icon-192.png / icon-512.png / logo.png
docs/implementation-plan.md   design & architecture notes
```

## How it's built

One `state` object as the source of truth, persisted to localStorage. `setState()` merges in a change, saves, and re-renders. Views are plain functions that return HTML strings, swapped into `#app`. A couple of interactions — typing in quantity/price fields, dragging to reorder rooms — touch the DOM directly instead of re-rendering on every keystroke or pointer move, then commit to state once at the end so nothing loses focus mid-interaction.

## AI tools

Built with Claude in Cursor, working through it conversationally rather than one-shot generation. I made the calls on direction and design — turned down a cloud-LLM summarizer in favor of an offline rules-based one, went through a few rounds on the walkthrough navigation before it actually felt clear — and the agent wrote the code under that direction, tested in-browser after each meaningful change.
