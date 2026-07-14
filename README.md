# Spark Homes Repair Estimator

A mobile-first, offline-first field walkthrough estimator for Spark Homes acquisition agents.

**Live app:** https://nicholastc.github.io/spark-homes-repair-estimator/

## Overview

Built for the Spark Homes Developer Contest (July 2026). Acquisition agents use this app during property walkthroughs to estimate repair costs, avoid missing expensive issues, and produce a professional estimate package before making an offer.

## How to Run

No build tools required. Open `index.html` directly in any modern browser, or host the directory as static files.

```bash
# Serve locally (requires Python 3)
python3 -m http.server 8080
# Then open http://localhost:8080
```

For PWA install + offline support, the app must be served over HTTPS (or localhost). GitHub Pages works perfectly — that's what the live link above uses.

## Features

### Required (Contest Brief)
- **75+ repair line items** across 5 sections and 19 collapsible groups (plus a couple of bonus groups beyond the required set)
- **Room-based architecture** — Bathroom, Bedroom, Kitchen, Living/Common, Interior/General, Systems & Structure, Exterior, and free-form Custom rooms
- **Multiple room instances** — Bedroom 1, Bedroom 2, Bathroom 1, etc. added/removed freely, at any point during the walkthrough
- **No Action Needed** per group — explicitly marks a group as reviewed with no work required
- **Price overrides** — per-project or update global defaults; original catalog price always visible for comparison
- **Add / delete custom line items and photos**, per item
- **Live running total** always visible in the header
- **Progress tracking** — per-group, per-room, and overall, with a "recommended order" walkthrough sequence
- **Photo capture** from device camera (`capture="environment"` on the file input for reliable Android behavior), attached to specific items or groups
- **Photo compression** — client-side canvas resize (900px, JPEG 0.65) prevents `localStorage` overflow
- **Export ZIP** — Excel (tab-per-room) + organized photos by room/group + a plain-text summary
- **Offline-first PWA** — service worker (network-first for the app shell, cache-first for static/CDN assets) + `localStorage` + installable to home screen, with an "update available" banner when a newer build takes over in the background

### Guided Walkthrough
- Step-through flow: recommended room order → room's group list → item selection, with "Room X of N" / "Group X of N" breadcrumbs and a "Continue to [Next Room]" CTA that skips already-completed rooms
- Sticky header shows both the current room's progress and the overall project progress side by side, so agents always know where they are and how much is left
- Room order is a *recommendation*, not a mandate — agents can drag-and-drop rooms into their own preferred order (grip handle, live reordering), which persists and is respected by future add/remove-room actions
- "Copy Setup from Another Room" — for multi-instance rooms (e.g. 3 bedrooms with similar condition), copy item selections and quantities from one instance to another, resetting instance-specific data like photos and serial numbers to avoid misattributing them

### SparkCheck Review
Rules-based risk engine with tiered warnings (Critical / Warning / Info) that flags things a rushed walkthrough is most likely to miss — unreviewed HVAC/electrical/structural, a roof line item with no photo, appliances with no condition photo, line items checked with zero quantity, and more. Each warning deep-links straight to the incomplete group. A persistent badge in the header and bottom nav surfaces critical count at a glance.

### Deal Analyzer
ARV, target profit, holding/selling costs → Max Offer + Deal Confidence (Green/Yellow/Red), so the repair estimate is immediately actionable for the acquisition decision, not just a checklist total.

### Dashboard
- Status pill per project (Not Started / In Progress / Complete), computed from walkthrough progress
- "Continue where you left off" banner that jumps straight back into the most recently active in-progress project
- Sort projects by recency, name, status, or total value

### Creative Additions
| Feature | Justification |
|---|---|
| **Autosummarizer** | One tap generates a natural-language summary of a project's status, top risks, and deal read — fully offline, rules-based (no LLM/network dependency), shown in a bottom-sheet and reused verbatim in the export |
| **SparkCheck Review** | Turns "did I forget anything expensive" from a memory problem into a checklist the app runs for you |
| **Room Condition Scoring** (Good/Fair/Poor/Gut) | Creates a mental anchor before item selection; lets SparkCheck flag a "Poor" room with no items selected as inconsistent |
| **Serial Number OCR** (Tesseract.js, lazy-loaded) | Contest brief explicitly calls this a "significant plus"; dedicated high-res/contrast preprocessing + scored candidate extraction (not just a raw OCR dump) to reliably pull serials off HVAC/water heater/appliance nameplates, with manual add/edit as a fallback |
| **Copy Setup from Another Room** | Cuts repeat data entry across similar bedrooms/bathrooms while explicitly resetting instance-specific fields (photos, serials, notes) so accuracy isn't compromised for speed |
| **Drag-to-reorder walkthrough** | The recommended room order is a suggestion, not a constraint — agents can reorder to match how they actually want to move through the property |
| **Quick Repair Profiles** | One-tap templates (e.g. "Standard Bath Refresh") cut walkthrough time for experienced agents |
| **Deal Sensitivity** | Shows how much repair buffer remains before a deal turns Red |
| **Backup / Restore** | Download/upload all projects as JSON; protects against `localStorage` loss or device switches |
| **Project Duplication** | Copy a project's room structure for a similar property layout, clearing selections |
| **Walkthrough Timer** | Tracks duration from first open; included in export metadata |
| **Minimalist icon system** | Every icon in the app is a hand-authored inline SVG (no emoji, no icon font/CDN) — keeps the offline-first story intact and gives the UI a more professional, consistent look |

## Tech Stack

- **HTML/CSS/JS** — Vanilla ES2022, no build step, no server required
- **Tailwind CSS** (CDN) — utility-first styling
- **xlsx-js-style** (CDN) — Excel export with styled cells
- **JSZip** (CDN) — ZIP packaging
- **Tesseract.js** (CDN, lazy-loaded) — OCR for serial number extraction

## File Structure

```
index.html      Main app — all markup, styles, and logic inline (~3,700 lines)
sw.js           Service worker — network-first app shell, cache-first static/CDN assets
manifest.json   PWA manifest (installable, standalone mode)
icon-192.png    PWA home screen icon
icon-512.png    PWA splash icon
logo.png        Spark Homes logo
docs/
  implementation-plan.md   Full design & architecture document
```

## Architecture

State → Render pipeline with a few targeted exceptions for performance:

- Single `state` object as the source of truth (persisted to `localStorage`)
- `setState(patch)` merges, saves, and triggers a full re-render
- Views are pure functions that return HTML strings, swapped into `#app` via `innerHTML`
- Qty/price inputs and the drag-to-reorder interaction manipulate the DOM directly instead of going through a full re-render mid-interaction — re-rendering on every keystroke/pointer-move would lose focus/listeners, so those paths commit their change to `state` once, on blur/drop, and render once at the end
- Event delegation from document root via inline `onclick`/`oninput` attributes calling named global functions

## AI Tools

This project was developed with Claude (via Cursor) as a coding assistant, in an iterative, conversational workflow rather than one-shot generation. The implementation plan, architecture decisions, data model, and every creative addition were designed collaboratively — I set direction, reviewed tradeoffs, and pushed back on approaches I didn't like (e.g. rejecting a cloud-LLM summarizer in favor of an offline rules-based one; multiple rounds of revisiting the walkthrough navigation until it was actually clear). All code was written by the agent under active direction, review, and in-browser testing on every significant change.
