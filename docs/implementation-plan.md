# Spark Homes Repair Estimator — Implementation Plan

**Prepared for:** Developer Contest, Deadline July 14 2026  
**Evaluation weights:** Mobile UX 30% · Feature Completeness 25% · Code Quality 20% · PWA/Offline 15% · Creative Addition 10%

---

## 1. Executive Summary

We are building a mobile-first, offline-first field walkthrough estimator for Spark Homes acquisition agents. The reference implementation (`Example App.html`) is the baseline to beat — not the target to copy. Our version must be original, polished, and feel better in a real house on a real phone.

The guiding principle from the contest brief:

> "Do not optimize for a screenshot. Optimize for a real walkthrough."

---

## 2. Technical Stack

| Layer | Choice | Rationale |
|---|---|---|
| Markup | HTML5 | Contest requirement |
| Styling | Tailwind CSS v3 (CDN) | Fastest path to mobile-polish; utility-first keeps markup readable |
| JavaScript | Vanilla ES2022 | Contest preference; no build step; scores well on code quality |
| Spreadsheet | xlsx-js-style (CDN) | Excel export with styled cells |
| ZIP | JSZip (CDN) | ZIP packaging for export |
| OCR | Tesseract.js (CDN) | Serial number extraction from HVAC/appliance photos |
| Storage | localStorage | Offline-first; no backend required |
| PWA | Service Worker + Web App Manifest | Offline support + installable |

### Architecture Pattern

State → Render pipeline (no framework):

```
User Action → setState() → saveToStorage() → render() → DOM update
```

- Single `state` object as source of truth
- `setState(patch)` merges patch, persists, triggers selective re-render
- Views are functions that return HTML strings, rendered with `innerHTML`
- Event delegation from `#app` container — no per-element listeners
- Router is a simple `state.view` string property

---

## 3. File Structure

```
spark-homes-repair-estimator/
├── index.html            ← Main app (all logic inline)
├── sw.js                 ← Service worker (offline caching)
├── manifest.json         ← PWA manifest
├── icon-192.png          ← PWA home screen icon (192×192)
├── icon-512.png          ← PWA home screen icon (512×512)
├── docs/
│   └── implementation-plan.md   ← This file
└── README.md             ← GitHub README
```

---

## 4. Data Model

### Global State Shape

```javascript
{
  // Navigation
  view: 'dashboard' | 'project-setup' | 'room-setup' | 'walkthrough'
       | 'group-detail' | 'sparkcheck' | 'deal-analyzer' | 'export' | 'settings',
  activeProjectId: string | null,
  activeRoomId: string | null,
  activeGroupKey: string | null,
  walkthroughRoomIndex: number,

  // Data
  projects: Project[],
  globalPriceOverrides: Record<string, number>,  // itemId → overridden unit cost
}
```

### Project

```javascript
{
  id: string,                    // uuid
  name: string,                  // "123 Main St"
  address: string,               // optional address
  createdAt: number,             // timestamp
  updatedAt: number,             // timestamp
  rooms: Room[],
  priceOverrides: Record<string, number>,  // per-project item overrides
  photos: Record<string, Photo[]>,         // groupKey → photos[]
  dealAnalyzer: {
    arv: number,
    targetProfit: number,
    holdingCosts: number,
    sellingCosts: number,
    purchasePrice: number,
    confidenceThresholds: {
      greenMin: number,          // default: 30000
      yellowMin: number,         // default: 15000
    }
  },
  notes: string,
  walkthroughStarted: boolean,
}
```

### Room

```javascript
{
  id: string,           // uuid
  type: RoomType,       // 'bathroom' | 'bedroom' | 'kitchen' | 'living'
                        // | 'interior-general' | 'systems' | 'exterior'
  label: string,        // "Bathroom 1", "Bedroom 2", etc.
  order: number,        // for walkthrough sequence
  condition: 'good' | 'fair' | 'poor' | 'gut' | null,  // Room Condition Score
  groups: GroupState[], // one entry per group relevant to this room type
}
```

### GroupState

```javascript
{
  key: string,          // e.g. "ba:tub", "as:hvac"
  reviewed: boolean,    // true if agent explicitly touched this group
  noActionNeeded: boolean,
  items: LineItem[],    // selected repair items
}
```

### LineItem

```javascript
{
  id: string,           // uuid (for user-added items) or catalog id (e.g. "ig-06")
  catalogId: string | null,   // null for custom items
  name: string,
  qty: number,
  unitCost: number,     // effective cost (global override → project override → default)
  unit: string,
  notes: string,
  photos: Photo[],
  year: number | null,        // for HVAC/appliance items with hasYear flag
  serialNumber: string | null, // parsed from photo OCR
  isCustom: boolean,
}
```

### Photo

```javascript
{
  id: string,           // uuid
  dataUrl: string,      // compressed base64 JPEG (~800px, quality 0.6)
  caption: string,
  ocrText: string | null,      // raw text extracted by Tesseract
  serialNumber: string | null, // parsed serial from OCR text
  attachedTo: string,          // lineItem.id or groupKey
}
```

---

## 5. Room Types & Repair Groups

### Complete Room Type → Group Mapping

This is the full schema. Room types marked `multi` can be added multiple times.

| Room Type | Multiplicity | Groups |
|---|---|---|
| Interior / General | single | Flooring, Paint & Wall Repair, Doors, Pest Control |
| Kitchen | single | Cabinets, Countertops & Tile, Appliances |
| Bathroom | **multi** | Vanity & Countertop, Tub & Shower, Tile |
| Bedroom | **multi** | Flooring, Paint & Wall Repair, Doors, Closet |
| Living / Common Areas | single | Flooring, Paint & Wall Repair, Doors, Lighting |
| Systems & Structure | single | HVAC, Electrical, Structural, Insulation & Drywall |
| Exterior | single | Fence, Siding, Windows, Garage, Trees |

**Total groups in a typical 3/2 house:** 19 required + 4 (bedrooms) + 4 (living) = 27 active groups

### Group → Item Mapping

Groups reference items from the pricing catalog by `id`. Full group definitions:

```
ig:flooring    → ig-nan-1, ig-01..ig-06
ig:paint       → ig-nan-2, ig-07..ig-09
ig:doors       → ig-nan-3, ig-10..ig-18 (interior + exterior doors)
ig:pest        → ig-nan-4, ig-23, ig-24

kt:cabinets    → kt-nan-1, kt-01..kt-05
kt:counters    → kt-nan-2, kt-06..kt-10
kt:appliances  → kt-nan-3, kt-11..kt-17

ba:vanity      → ba-nan-1, ba-01..ba-03, ba-14, ba-15
ba:tub         → ba-nan-2, ba-07..ba-13
ba:tile        → ba-nan-3, ba-04..ba-06, ba-16

bd:flooring    → bd-nan-1, ig-01..ig-06 (shared items)
bd:paint       → bd-nan-2, ig-07..ig-09
bd:doors       → bd-nan-3, ig-10..ig-13
bd:closet      → bd-nan-4, ig-12 (Bifold Door), ig-10 (Hollow Slab)

lv:flooring    → lv-nan-1, ig-01..ig-06
lv:paint       → lv-nan-2, ig-07..ig-09
lv:doors       → lv-nan-3, ig-10..ig-18
lv:lighting    → lv-nan-4, ig-22 (Light Fixtures)

as:hvac        → as-nan-1, as-01..as-07, as-08, as-09 (water heater added here)
as:electrical  → as-nan-2, as-10, as-11, as-18..as-20, as-24
as:structural  → as-nan-3, as-12..as-15, as-16 (roof), as-17 (plumbing)
as:insulation  → as-nan-4, as-21..as-23

ex:fence       → ex-nan-1, ex-01..ex-03
ex:siding      → ex-nan-2, ex-05..ex-09 (siding + exterior paint + tuck pointing + wood repair)
ex:windows     → ex-nan-3, ex-13..ex-17
ex:garage      → ex-nan-4, ex-21..ex-23
ex:trees       → ex-nan-5, ex-10..ex-12
```

> **Note on Roof & Plumbing:** Items `as-16` (Roof) and `as-17` (Plumbing) are in the pricing catalog but not assigned to a named group in the 19-group spec. We assign Roof and Plumbing to `as:structural` since both are structural/systems items. Water Heater (`as-08`, `as-09`) goes into `as:hvac` since it is a mechanical system closely related to HVAC review. This assignment is documented in the UI as tooltips.

---

## 6. Feature Specifications

### 6A. Required Features (from Contest Brief)

#### Project Management
- Create, name, save multiple projects
- Address field (optional but useful for export header)
- Switch between projects from side panel without losing data
- Each project stores: rooms, selections, quantities, notes, photos, per-project price overrides
- Delete project with confirmation
- **Project duplication** (see creative additions)

#### Repair Line Items
- 75+ items from official price list, organized into 5 sections and 19 groups
- Every group includes "No Action Needed" option — explicitly marks group as reviewed
- Each item shows: name, unit type, quantity input, unit cost, line total
- **Price override:** per-project unit cost edit; prompt "this project only" vs "update standard price"
- Running cost total visible at all times (persistent footer)
- Add custom line items per group
- Delete individual line items (swipe or explicit delete button)

#### Adjustable Room Support
- Add / remove room instances freely during walkthrough
- Room types: Bathroom (multi), Bedroom (multi), Kitchen, Living/Common Areas, Interior/General, Systems & Structure, Exterior
- Rooms labeled by instance: "Bedroom 1", "Bathroom 2", etc.
- Groups labeled by room instance: "Bathroom 1: Tub & Shower"
- Room order is user-adjustable (drag handles)

#### Progress Tracking
- Progress bar showing completion percentage
- Progress counted per group — any item selected OR "No Action Needed" marked = group complete
- Total progress counts all groups across all sections and room instances
- Persistent risk badge showing count of unreviewed high-cost groups

#### Photo Capture
- Attach photos from device camera via `<input capture="environment">`
- Photos displayed as thumbnails with item/group context
- Individual photo removal
- **Photos compressed client-side** before storage (canvas resize to 800px max, JPEG quality 0.65) — prevents localStorage quota errors

#### Export
- Export as ZIP: Excel cost breakdown + photos organized by room/group
- Excel includes: project name, date, room, group, item, qty, unit, unit cost, line total, grand total
- Excel uses tab-per-room organization (not a flat list)
- ZIP downloads automatically
- Grand total and deal analyzer result in project summary tab

#### Offline / PWA
- Service worker with cache-first strategy for all app assets
- All data in localStorage
- Installable to home screen (manifest + icons)
- Works on Chrome for Android + Safari for iOS

---

### 6B. Project Spec Features (from project-spec.md)

#### Guided Walkthrough Mode
- After room setup, agent enters a step-by-step room-by-room flow
- Progress through rooms in logical order: Exterior → Interior/General → Kitchen → Living → Bedrooms → Bathrooms → Systems
- Inside each room: step through groups one at a time
- "Next Group" and "Back" navigation; "Skip Room" option
- Resume from last position on re-open
- Breadcrumb header shows: "Bedroom 1 → Flooring"

#### Missed-Cost Guardrail / SparkCheck Review
- Pre-export risk review screen
- Persistent "X risks" badge on the main navigation
- Tiered warnings: 🔴 Critical (HVAC/Electrical/Structural not reviewed) / 🟡 Warning (no photo on high-cost item) / 🔵 Info (minor completeness gaps)
- **Each warning deep-links** directly to the incomplete group — tap warning → navigated straight there
- SparkCheck runs automatically as agent works; warnings update in real-time

SparkCheck rule set:
```
CRITICAL:
  - HVAC group not reviewed (as:hvac)
  - Electrical group not reviewed (as:electrical)
  - Structural group not reviewed (as:structural)
  - Roof item selected but no photo attached

WARNING:
  - Furnace/AC/Water heater selected with no year entered
  - Furnace/AC selected with no serial number photo
  - Any line item with qty = 0 but item is checked
  - Bathroom tile group incomplete (if any bathroom added)
  - Kitchen appliances reviewed but no photos
  - Estimate total < $8,000 for a 3+ bed property (statistically low)

INFO:
  - Exterior photos missing
  - Any room added but not started
  - Custom item added with no qty or notes
```

#### Photo Evidence Layer
- Photos attached to specific line items OR to a group (for context photos)
- Each photo tagged with: room name, group name, item name (or "general" if group-level)
- Displayed as thumbnails in the item row and in a room-level photo strip
- Photos organized in ZIP by room/group folder structure

#### Smart Pricing System
- Global default prices from official price list
- Per-project overrides stored in project object
- Global overrides stored separately, apply to new projects only
- When overriding: modal asks "this project only" or "update standard price"
- Override indicator shown on item (small badge or color change)
- Original price shown in tooltip on overridden items
- Minimum cost enforcement: warn if qty × unitCost < item.min

#### Deal Analyzer
- ARV, Target Profit, Holding Costs, Selling Costs, Purchase Price inputs
- Outputs: Estimated Profit, Max Allowable Offer, Deal Confidence
- Formula: `maxOffer = ARV - repairEstimate - targetProfit - holdingCosts - sellingCosts`
- `profit = ARV - purchasePrice - repairEstimate - holdingCosts - sellingCosts`
- Confidence: Green (profit ≥ target), Yellow (0 ≤ profit < target), Red (profit < 0)
- Results persist with project and included in export

---

### 6C. Creative Additions (Not in Official Documentation)

The following features are additions beyond the spec. Each is justified below.

---

#### CC-1: Room Condition Scoring
**What:** Before selecting repair items in any room, the agent rates the condition: `Good / Fair / Poor / Gut`.

**Why added:**
- Creates a mental anchor for the agent before item selection — prevents anchoring bias from the first item they think of
- Enables SparkCheck to flag rooms rated "Poor" or "Gut" with fewer items than expected
- Adds useful context to the export report (reviewer can see which rooms were the worst)
- Takes 1 tap, costs nothing in time

---

#### CC-2: Serial Number OCR via Tesseract.js
**What:** When a photo is attached to an HVAC or appliance item, the app attempts to extract text using Tesseract.js OCR. A parsed serial number (alphanumeric string) is suggested to the agent, who can confirm or clear it.

**Why added:**
- The contest brief explicitly lists this as a **"significant plus"**: "If you can extract or attempt to parse a serial number from the photo, that is a significant plus."
- Serial numbers on HVAC units are used to look up equipment age — knowing furnace age directly informs the repair/replace decision
- Even an imperfect OCR attempt scores points here; we handle the case gracefully if OCR fails

**Implementation note:** Tesseract.js is ~2MB via CDN. We load it lazily (only when a photo is attached to a `hasYear` item) to avoid impacting initial load time.

---

#### CC-3: Quick Repair Profiles (Templates)
**What:** One-tap templates that pre-populate a group with common configurations. Examples:
- "Standard Bath Refresh" → Toilet + 18" Vanity + Reglaze Tub
- "Full Kitchen Gut" → All cabinets + Backsplash + All appliances
- "Paint & Floors Only" → Interior Paint + Vinyl Plank

**Why added:**
- Experienced agents recognize common house conditions immediately and shouldn't have to tap 8 items to express "standard bathroom refresh"
- Reduces walkthrough time by ~40% for agents who know the house type
- Templates are suggestions — agent can add/remove after applying
- Directly addresses the contest brief's real-world usability goal

---

#### CC-4: Deal Sensitivity Slider
**What:** In the Deal Analyzer, a slider shows how the repair estimate would need to change for the deal confidence to shift (e.g., "deal turns Red if repairs exceed $X").

**Why added:**
- The repair estimate is the one number agents have the most uncertainty about
- Showing the "buffer" between current estimate and the Red threshold gives agents a gut-check: "I have $12k of margin before this deal goes red — am I confident in my estimate?"
- No extra data entry required — computed from existing Deal Analyzer inputs

---

#### CC-5: Backup & Restore
**What:** In Settings, agent can download all projects as a single JSON file and restore from that file.

**Why added:**
- localStorage can be wiped by the browser (storage pressure, privacy settings, app uninstall)
- There is no backend — if localStorage is lost, all projects are gone permanently
- This is a one-time feature with zero complexity that prevents catastrophic data loss
- Especially important for agents who have 10+ projects in flight during a busy acquisition period

---

#### CC-6: Project Duplication
**What:** From the project list, agent can duplicate an existing project as a template. Room structure is copied; repair selections and photos are cleared.

**Why added:**
- Agents often walk similar house types in the same neighborhood (same floor plan, same issues)
- Duplicating room structure from a prior project eliminates setup time on repeat walkthroughs
- Complementary to Quick Repair Profiles — this saves at the project level, profiles save at the group level

---

#### CC-7: Walkthrough Timer
**What:** A subtle elapsed timer shown in the walkthrough header from when the agent started the walkthrough. Included in export metadata.

**Why added:**
- Agents track their time; this adds accountability and professionalism
- Export says "Walkthrough duration: 47 minutes" — useful for team training on walkthrough efficiency
- Costs zero implementation complexity (just `Date.now() - project.walkthroughStartedAt`)

---

## 7. Design System

### Color Palette

```
Background:    #F1F5F9  (slate-100)
Surface:       #FFFFFF  (white)
Surface-alt:   #F8FAFC  (slate-50)

Brand Primary: #EA580C  (orange-600)
Brand Dark:    #C2410C  (orange-700)
Brand Light:   #FED7AA  (orange-200)

Nav/Header:    #0F172A  (slate-900)
Text Primary:  #1E293B  (slate-800)
Text Muted:    #64748B  (slate-500)
Border:        #E2E8F0  (slate-200)

Success:       #16A34A  (green-600)
Warning:       #D97706  (amber-600)
Danger:        #DC2626  (red-600)
Info:          #0284C7  (sky-600)
```

### Typography

- Font: `-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif` (native feel)
- Display numbers: `font-variant-numeric: tabular-nums` (totals stay aligned)
- Running total: `font-mono` weight 700

### Component Library (built inline)

| Component | Description |
|---|---|
| `card` | White surface, `rounded-2xl shadow-sm border border-slate-100` |
| `btn-primary` | Orange-600, `rounded-xl py-3.5 font-semibold text-white` |
| `btn-ghost` | Transparent, slate text, hover surface |
| `btn-danger` | Red-100 background, red text |
| `pill` | Small status label, `rounded-full px-2.5 py-0.5 text-xs font-medium` |
| `bottom-sheet` | Slides up from bottom, `rounded-t-2xl`, `max-h-[85vh]` |
| `progress-bar` | Orange fill on slate-200 track |
| `risk-badge` | Floating badge showing unresolved SparkCheck warnings |
| `photo-thumb` | `64px × 64px rounded-xl object-cover` |

### Mobile Conventions

- Touch targets: minimum 44×44px
- Safe area insets respected on iOS (`env(safe-area-inset-*)`)
- No hover-only states — everything touchable
- Bottom navigation bar (4 tabs, thumb-reachable)
- Modals slide up from bottom as sheets (not centered dialogs on mobile)
- Destructive actions require confirmation

---

## 8. Screen Inventory

### Navigation Structure

```
Bottom Tab Bar:
  [Projects]  [Walkthrough]  [SparkCheck]  [Deal Analyzer]
```

Side panel (hamburger): Project switcher, Settings, Backup/Restore

### Screens

| Screen ID | Description | Trigger |
|---|---|---|
| `dashboard` | Project list, create new project CTA | App open / tab: Projects |
| `project-setup` | Name, address, room count inputs | "New Project" tap |
| `room-setup` | Add/remove/reorder rooms, condition scores | After project create, or edit rooms |
| `walkthrough` | Guided room list, progress overview | Tab: Walkthrough |
| `group-detail` | Items for one repair group | Tap a group in walkthrough |
| `item-detail` | Qty, notes, photos, price override | Tap a line item |
| `sparkcheck` | Tiered warnings with deep-links | Tab: SparkCheck |
| `deal-analyzer` | Deal inputs + confidence output | Tab: Deal Analyzer |
| `export` | Export options, preview summary | Tap Export button |
| `settings` | Global price overrides, backup/restore | Settings in side panel |

---

## 9. Development Phases

### Phase 1 — Foundation (Day 1–2)
- [ ] File structure: `index.html`, `sw.js`, `manifest.json`
- [ ] State model and localStorage persistence
- [ ] Router (view switching)
- [ ] Design system (Tailwind config, base components)
- [ ] Bottom navigation
- [ ] Dashboard screen

### Phase 2 — Project & Room Setup (Day 3)
- [ ] Create project flow
- [ ] Room setup screen: add/remove rooms, drag-to-reorder
- [ ] Room type definitions and group mappings
- [ ] Room condition scoring

### Phase 3 — Walkthrough Core (Day 4–5)
- [ ] Guided walkthrough screen (room list view)
- [ ] Group detail screen (item list, No Action Needed)
- [ ] Line item: qty, notes, price override, "this project / global" modal
- [ ] Live running total in footer
- [ ] Add/delete custom line items

### Phase 4 — Photos & OCR (Day 5–6)
- [ ] Photo capture (camera input)
- [ ] Client-side compression (canvas resize)
- [ ] Photo thumbnails in item rows
- [ ] OCR integration (Tesseract.js, lazy-loaded)
- [ ] Serial number suggestion modal

### Phase 5 — SparkCheck & Progress (Day 6)
- [ ] Progress bar calculation
- [ ] SparkCheck rule engine
- [ ] Risk badge (persistent)
- [ ] SparkCheck screen with tiered warnings + deep-links
- [ ] Quick Repair Profiles (templates)

### Phase 6 — Deal Analyzer (Day 7)
- [ ] Deal Analyzer screen
- [ ] Formula implementation
- [ ] Confidence level (Green/Yellow/Red)
- [ ] Sensitivity slider
- [ ] Results persisted to project

### Phase 7 — Export (Day 8)
- [ ] Excel generation (tab-per-room, styled)
- [ ] ZIP packaging (photos organized by room/group folder)
- [ ] Project summary tab in Excel
- [ ] Deal Analyzer result in export

### Phase 8 — PWA & Offline (Day 8–9)
- [ ] Service worker (cache-first for all static assets)
- [ ] Manifest (icons, display: standalone, theme color)
- [ ] Photo compression edge cases
- [ ] Backup/Restore (JSON download/upload)
- [ ] Project duplication
- [ ] Walkthrough timer

### Phase 9 — Polish (Day 9)
- [ ] Transitions and animations
- [ ] Empty states for all screens
- [ ] Error handling (storage quota, photo failures)
- [ ] Mobile edge cases (iOS safe areas, Android back button)
- [ ] Logo embedding

### Phase 10 — Submission (Day 10)
- [ ] QA on a real phone (Chrome Android + Safari iOS)
- [ ] README update
- [ ] One-page PDF writeup
- [ ] GitHub push + GitHub Pages deploy

---

## 10. Known Tradeoffs & Decisions

| Decision | Rationale |
|---|---|
| Vanilla JS (no framework) | Contest rewards clean readable code; no build step; evaluators can read inline JS directly |
| localStorage only | Offline-first requirement; backend optional; localStorage is sufficient for ~50 projects with compressed photos |
| Photo compression to 800px/0.65 JPEG | Prevents localStorage quota (~5-10MB) overflow with 20+ photos per project |
| Tesseract.js loaded lazily | 2MB OCR library; only loaded on-demand when agent attaches a photo to an HVAC/appliance item |
| Roof in as:structural | Roof (as-16) not explicitly assigned in the 19-group spec; Structural is the closest logical home |
| Water heater in as:hvac | Water heater (as-08, as-09) is a mechanical system reviewed alongside HVAC during walkthroughs |
| Sensitivity slider formula | `redThreshold = ARV - targetProfit - holdingCosts - sellingCosts` — shows the maximum repair budget before the deal goes red |
