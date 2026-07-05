# Spark Homes Repair Estimator — Product Direction

## 1. Core Problem

Spark Homes needs a faster, more accurate way for acquisition agents to estimate repair costs during property walkthroughs.

The business depends on buying distressed or undervalued homes, renovating them, and reselling them at a profit. Before Spark Homes buys a house, the acquisition team needs to estimate how much it will cost to repair the property. If the estimate is too low, the missing cost comes directly out of the profit margin.

The current workflow is risky because agents may rely on memory, rough notes, or spreadsheets that are not designed for mobile walkthroughs. This creates three major problems:

- The process is slow.
- Estimates can be inconsistent between agents.
- Expensive repair items can be missed.

The most dangerous misses are high-cost items such as HVAC, electrical, structural repairs, bathroom tear-outs, roof issues, water heaters, appliances, and exterior damage.

The app should solve this by giving agents a structured, mobile-first walkthrough system that helps them check every room, select repairs, enter quantities, attach photos, calculate a live total, review missing risks, and export a professional estimate package.

The core product question is:

> How can we help an acquisition agent confidently answer, on-site and fast, “How much will it cost to fix this house?”

---

## 2. Recommended Product Direction

Build the app as a **Field Walkthrough Estimator**, not just a repair calculator.

The app should feel like a guided field assistant that walks the agent through the property step by step. The goal is not only to calculate repair costs, but also to prevent missed repairs and make the final estimate easier to trust.

The core experience should be:

Create Project  
→ Add Rooms  
→ Walk Room-by-Room  
→ Check Repairs / Mark No Action Needed  
→ Add Quantity, Notes, and Photos  
→ Review Missing Risks  
→ Run Deal Analyzer  
→ Export ZIP  

This direction gives the app the best chance to feel useful in a real house walkthrough because it focuses on speed, accuracy, field usability, and risk prevention.

The app should feel like:

> “I am walking through the house, and the app tells me what to check next.”

---

## 3. Guided Walkthrough Mode

### Concept

The best solution is a step-by-step walkthrough flow, not a giant list of repair items.

The agent starts by creating a project, then adds the rooms that exist in the actual property. After that, the app guides the agent through each room and repair group in a logical order.

Example property flow:

Exterior  
→ Living / Common Areas  
→ Kitchen  
→ Bedroom 1  
→ Bedroom 2  
→ Bedroom 3  
→ Bathroom 1  
→ Bathroom 2  
→ Systems & Structure  
→ Review  

Inside each room, the app guides the agent through relevant repair groups.

Example bedroom flow:

Bedroom 1  
→ Flooring  
→ Paint  
→ Doors  
→ Closet  
→ Photos  
→ Next Room  

### Why This Matters

This directly solves the problem of agents relying on memory and rough notes. Instead of asking the agent to remember what to check, the app tells them what to check next.

The user should never feel like they are staring at a spreadsheet. They should feel like they are following a clean checklist built for real property walkthroughs.

### Design Principle

The app should guide the agent through the house in the same way they naturally inspect a property.

---

## 4. Missed-Cost Guardrail

### Concept

The app should include a risk checklist or missed-item warning system before export.

Before the agent finishes the estimate, the app should warn them about incomplete or potentially risky areas.

Example warnings:

- HVAC not reviewed
- Electrical not reviewed
- Structural not reviewed
- No exterior photos added
- Bathroom 2 tile group incomplete
- Kitchen appliances reviewed but no photos attached
- Selected repair item has missing quantity

### Why This Matters

Some repair categories can swing the estimate by thousands of dollars. Missing a furnace, electrical rewire, structural issue, bathroom tear-out, or roof issue can make a profitable-looking deal become a bad deal.

A normal progress bar only tells the user how much they completed. A missed-cost guardrail tells the user what might financially hurt the deal.

### Design Principle

The app should protect the business from expensive omissions, not just track task completion.

---

## 5. Photo Evidence Layer

### Concept

Photos should not be treated as random attachments. They should be connected to specific repair items, groups, or rooms.

Example photo attachments:

- HVAC → serial number photo
- Water Heater → label photo
- Roof → exterior roof photo
- Bathroom Tile → damage photo
- Kitchen Appliances → appliance condition photo
- Exterior Siding → siding damage photo
- Electrical Panel → panel photo
- Structural Issue → foundation or framing photo

### Why This Matters

Photos make the estimate easier to trust later. They help the team understand why a repair was included and provide evidence for high-cost items.

Each photo should answer:

> What repair does this photo prove?

### Design Principle

Photos should be contextual, organized, and useful during review/export. They should not just be stored in a general photo gallery.

---

## 6. Smart Pricing System

### Concept

The app should have two pricing layers:

### 1. Global Default Pricing

The official price list should be the default source of truth for repair item prices.

These prices should be used automatically when the agent creates a new project.

### 2. Per-Project Price Overrides

The agent should be able to override a unit cost inside a specific project when the property has unusual conditions.

For example, if the default furnace replacement cost is not accurate for a particular house, the agent can change it for that project only.

### Pricing UX

When an agent changes a unit cost, the app should ask:

> Apply only to this project?

or

> Update standard price for future projects?

### Why This Matters

Default pricing helps agents estimate quickly and consistently. Per-project overrides keep the app flexible when a house has unusual repair conditions.

### Design Principle

The app should be standardized enough for consistency but flexible enough for real-world exceptions.

---

## 7. Deal Analyzer Creative Addition

### Concept

The strongest creative addition is a **Deal Confidence / Max Offer Calculator**.

After the repair estimate is calculated, the agent can enter deal numbers such as:

- ARV
- Target profit
- Holding costs
- Selling costs
- Purchase price
- Repair estimate

The app then calculates:

- Estimated profit
- Max allowable offer
- Deal risk: Green / Yellow / Red

### Example

ARV: $210,000  
Repair Estimate: $38,760  
Target Profit: $30,000  
Holding / Selling Costs: $18,000  

Max Offer: $123,240  
Deal Confidence: Yellow  

### Why This Matters

Spark Homes is not estimating repairs just for documentation. They are estimating repairs to decide whether they should buy the house and at what price.

The Deal Analyzer connects the repair estimate to the actual acquisition decision.

### Design Principle

The app should help the agent move from:

> What will repairs cost?

to:

> Does this deal still make sense?

---

## 8. Export / Handoff Package

### Concept

The export should feel like a professional field report, not just a spreadsheet.

The final ZIP package should include:

- Excel repair cost breakdown
- Photos organized by room, group, or item
- Project summary
- Grand total
- High-risk items
- Incomplete groups, if any
- Deal analyzer result

### Excel Should Include

- Project name
- Date
- Room / section
- Repair group
- Line item
- Quantity
- Unit type
- Unit cost
- Line total
- Grand total

### Why This Matters

The export is the handoff from the field agent to the team. It should be easy to review, share, and understand without needing to reopen the app.

### Design Principle

The exported package should make the estimate look credible, organized, and ready for team review.

---

## 9. Offline-First PWA

### Concept

The app must be offline-first because agents may walk through properties with poor cell service.

The app should:

- Save all project data locally
- Work without internet
- Persist repair selections, quantities, notes, photos, and pricing
- Compress photos locally when possible
- Be installable as a PWA
- Support mobile use on Android and iOS

### Why This Matters

Offline support is not a bonus. The app is intended for real field walkthroughs, where internet connection may be unreliable.

Core features must not depend on internet access.

Core offline features should include:

- Create project
- Add/remove rooms
- Select repair items
- Enter quantities
- Override prices
- Add notes
- Attach photos
- Track progress
- Review missing risks
- Export estimate

### Design Principle

The app should never depend on internet access for core estimating functionality.

---

## 10. Optional AI Direction: SparkCheck Review

### Concept

Because the app is offline-first, AI should be treated as an optional helper, not a requirement.

The best approach is an offline “AI-like” review system called:

**SparkCheck Review**

This feature scans the project and gives useful warnings based on rules and heuristics.

Example output:

Estimate Risk: Medium

- HVAC is marked No Action Needed, but no HVAC photo was attached.
- Bathroom 2 tile group is incomplete.
- Electrical has not been reviewed.
- Kitchen appliances were selected, but no appliance photos were added.
- Total estimate seems low for a 3 bed / 2 bath property.

### Why This Matters

This gives the app an intelligent assistant feel without breaking the offline-first requirement.

The app can still work fully offline, while optional online AI can be added later for summaries or report writing.

### Design Principle

The LLM should not be required for the app to work. If online AI is added later, it should only enhance summaries, explanations, or final report wording.

---

## 11. User Story

As a **Spark Homes acquisition agent**, I want to **walk through a property on my phone using a guided room-by-room repair checklist**, so that I can **quickly produce an accurate repair estimate, avoid missing expensive issues, and share the estimate with the team before making an offer**.

---

## 12. Acceptance Criteria

### Project Management

- I can create a property project.
- I can name and save multiple projects.
- I can switch between projects without losing data.
- Each project stores its own rooms, repair selections, quantities, notes, photos, and price overrides.

### Room Setup

- I can add or remove rooms based on the actual house layout.
- I can add multiple room instances, such as Bedroom 1, Bedroom 2, Bathroom 1, Bathroom 2, etc.
- Each room has repair groups relevant to that room type.

### Repair Walkthrough

- For each room or section, I can review repair groups one by one.
- For each group, I can either select repair items or mark No Action Needed.
- For each repair item, I can enter quantity, unit cost, notes, and photos.
- I can add new line items or delete existing line items when needed.

### Pricing

- The app uses default prices from the official price list.
- I can override a unit cost for a specific project.
- I can update standard pricing globally for future projects.

### Progress and Risk Review

- The app shows a live running total.
- The app shows walkthrough progress based on completed repair groups.
- The app warns me if major groups like HVAC, electrical, structural, bathrooms, systems, or exterior are incomplete.
- The app warns me if selected items are missing required quantities or useful photos.

### Photo Capture

- I can attach photos from the device camera.
- Photos display as thumbnails inside the project.
- I can remove photos individually.
- Photos are connected to the relevant room, group, or repair item.

### Export

- I can export the current project as a ZIP file.
- The ZIP contains an Excel estimate and all attached photos.
- The Excel file includes selected repair items, quantities, unit costs, line totals, and grand total.
- The export is useful as a team handoff package.

### Offline Use

- The app works offline.
- The app saves locally.
- The app is usable on a phone during a real property walkthrough.
- Core estimating features do not depend on internet access.

---

## 13. Sample App Flow

### Step 1: Open Dashboard

The agent opens the app and sees saved projects.

Example:

- 123 Main St
- Oak Avenue Flip
- Pine Duplex

The agent can create a new project or resume an existing one.

---

### Step 2: Create Project

The agent creates a new project:

Project Name: 123 Main St

Then the agent sets up the property structure:

- 3 Bedrooms
- 2 Bathrooms
- 1 Kitchen
- 1 Living / Common Area
- Exterior
- Systems & Structure

---

### Step 3: Start Guided Walkthrough

The app begins the walkthrough in a logical order:

Exterior  
→ Living / Common Areas  
→ Kitchen  
→ Bedroom 1  
→ Bedroom 2  
→ Bedroom 3  
→ Bathroom 1  
→ Bathroom 2  
→ Systems & Structure  

Each section has its own repair groups.

---

### Step 4: Select Repairs

In Bedroom 1, the agent sees:

- Flooring
- Paint
- Doors
- Closet

The agent selects:

Carpet Replacement  
Quantity: 180 sqft  

Interior Paint  
Quantity: 180 sqft  

Doors  
No Action Needed  

The running total updates immediately.

---

### Step 5: Add Photos

In Systems & Structure, the agent checks HVAC and selects:

Furnace Replacement  
Quantity: 1  

The app asks for or encourages a serial number photo.

The agent adds:

- HVAC serial number photo
- Furnace condition photo

These photos are attached to the HVAC repair item.

---

### Step 6: Review Missing Risks

Before export, the app shows a review screen:

92% Complete

Warnings:

- Electrical not reviewed
- Bathroom 2 tile group incomplete
- Exterior photos missing

The agent goes back and completes those groups.

---

### Step 7: Run Deal Analyzer

The agent enters:

ARV: $210,000  
Target Profit: $30,000  
Holding / Selling Costs: $18,000  
Repair Estimate: $38,760  

The app shows:

Max Offer: $123,240  
Deal Confidence: Yellow  

---

### Step 8: Export Package

The agent taps:

Export ZIP

The app downloads a package containing:

- Excel estimate
- Organized photos
- Project summary
- Deal analyzer result

---

## 14. Sample Scenario

An acquisition agent walks into a distressed 3 bed / 2 bath house called `123 Main St`.

The agent opens the app, creates a project, and adds:

- 3 Bedrooms
- 2 Bathrooms
- 1 Kitchen
- 1 Living / Common Area
- Exterior
- Systems & Structure

The app starts with the exterior. The agent marks fence repair, siding repair, and tree trimming, then attaches photos of the fence and siding damage.

Inside the house, the app guides the agent room by room. In Bedroom 1, the agent selects carpet replacement and paint. In Bedroom 2, the agent marks doors as No Action Needed but selects paint repair. In the kitchen, the agent selects lower cabinets, backsplash, dishwasher, and range.

When the agent reaches Systems & Structure, the app reminds them to review HVAC, electrical, structural, and insulation. The agent notices the furnace is old, selects furnace replacement, and takes a serial number photo.

At the end, the app shows:

92% Complete

Remaining Issues:

- Bathroom 2 tile not reviewed
- Electrical not reviewed

The agent checks those groups, completes the review, runs the Deal Analyzer, and exports the final package.

Final result:

Repair Estimate: $38,760  
Deal Confidence: Yellow  
Export: ZIP with Excel + photos  

---

## 15. Product Summary

This project should be built as a mobile-first, offline-first field walkthrough estimator.

The app should help acquisition agents:

- Move through a property step by step
- Avoid missing expensive repairs
- Estimate costs consistently
- Attach evidence through photos
- Understand deal risk
- Export a professional handoff package

The main product philosophy is:

> Do not optimize for a screenshot. Optimize for a real walkthrough.