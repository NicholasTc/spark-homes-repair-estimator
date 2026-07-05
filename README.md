# Spark Homes Repair Estimator

A mobile-first, offline-first field walkthrough estimator for Spark Homes acquisition agents.

## Overview

Built for the Spark Homes Developer Contest (July 2026). Acquisition agents use this app during property walkthroughs to estimate repair costs, avoid missing expensive issues, and produce a professional estimate package before making an offer.

## How to Run

No build tools required. Open `index.html` directly in any modern browser, or host the directory as static files.

```bash
# Serve locally (requires Python 3)
python3 -m http.server 8080
# Then open http://localhost:8080
```

For PWA install + offline support, the app must be served over HTTPS (or localhost). GitHub Pages works perfectly.

## Features

### Required (Contest Brief)
- **75+ repair line items** across 5 sections and 19 collapsible groups
- **Room-based architecture** — Bathroom, Bedroom, Kitchen, Living/Common, Interior/General, Systems & Structure, Exterior
- **Multiple room instances** — Bedroom 1, Bedroom 2, Bathroom 1, etc. added/removed freely
- **No Action Needed** per group — explicitly marks a group as reviewed with no work required
- **Price overrides** — per-project or update global defaults, with original price shown
- **Add / delete custom line items** per group
- **Live running total** always visible
- **Progress tracking** — per-group, per-room, and overall
- **Photo capture** from device camera, attached to specific items or groups
- **Photo compression** — client-side canvas resize (900px, JPEG 0.65) prevents storage overflow
- **Export ZIP** — Excel (tab-per-room) + organized photos by room/group + summary text
- **Offline-first PWA** — service worker + localStorage + installable to home screen

### Project Spec Features
- **Guided walkthrough** — step-through flow: room list → group list → item selection → next group
- **SparkCheck Review** — rules-based risk engine with tiered warnings (Critical / Warning / Info)
  - Persistent risk badge in header and nav tab
  - Each warning deep-links directly to the incomplete group
- **Deal Analyzer** — ARV, target profit, holding/selling costs → Max Offer + Deal Confidence (Green/Yellow/Red)

### Creative Additions
| Feature | Justification |
|---|---|
| **Room Condition Scoring** (Good/Fair/Poor/Gut) | Creates mental anchor before item selection; enables SparkCheck to flag poor rooms with no items |
| **Serial Number OCR** (Tesseract.js, lazy-loaded) | Contest brief explicitly calls this a "significant plus"; extracts serial from HVAC/appliance photos |
| **Quick Repair Profiles** | One-tap templates (e.g. "Standard Bath Refresh") cut walkthrough time for experienced agents |
| **Deal Sensitivity** | Shows how much repair buffer remains before deal turns Red |
| **Backup/Restore** | Download/upload all projects as JSON; protects against localStorage wipe |
| **Project Duplication** | Copy a project's room structure for similar properties, clearing selections |
| **Walkthrough Timer** | Tracks duration from first open; included in export metadata |

## Tech Stack

- **HTML/CSS/JS** — Vanilla ES2022, no build step, no server required
- **Tailwind CSS** (CDN) — utility-first styling
- **xlsx-js-style** (CDN) — Excel export with styled cells
- **JSZip** (CDN) — ZIP packaging
- **Tesseract.js** (CDN, lazy) — OCR for serial number extraction

## File Structure

```
index.html      Main app (all logic inline, ~2,000 lines)
sw.js           Service worker (cache-first, offline support)
manifest.json   PWA manifest (installable, standalone mode)
icon-192.png    PWA home screen icon
icon-512.png    PWA splash icon
logo.png        Spark Homes logo
docs/
  implementation-plan.md   Full design & architecture document
```

## Architecture

State → Render pipeline with surgical DOM updates:

- Single `state` object as source of truth (persisted to localStorage)
- `setState(patch)` merges, saves, re-renders
- Views are pure render functions returning HTML strings
- Qty/price inputs use targeted DOM updates (no focus loss during typing)
- Event delegation from document root via `data-action` attributes

## AI Tools

This project was developed with Claude (Cursor) as a coding assistant. The implementation plan, architecture decisions, data model, and all creative additions were designed collaboratively. All code was written by the agent under active direction and review.
