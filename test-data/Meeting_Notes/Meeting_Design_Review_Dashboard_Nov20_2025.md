# Meeting Notes — Design Review: Custom Dashboard Builder
**Date:** November 20, 2025  
**Facilitator:** Ravi Shankar  
**Attendees:** Meera Iyer, Sana Mirza (Design), Dev Kapoor (Engineering Lead), Priya Nair  
**Purpose:** Review v2 design mockups for Dashboard Builder before engineering handoff  

---

## Designs Reviewed

Sana presented 4 screens:
1. Dashboard creation flow — blank state to first widget
2. Widget configuration panel — metric selection and chart type
3. Dashboard sharing flow — link generation and permissions
4. Alert setup — threshold configuration and notification channel selection

All designs available in Figma: [Dashboard Builder v2 — Nov 2025]

---

## Feedback by Screen

### Screen 1: Dashboard Creation Flow

**What worked:**
- Empty state illustration with guided prompt ("Start with a metric that matters to your team") tested well in the last usability session — 8/10 users understood what to do immediately
- Drag-and-drop grid is intuitive — Dev confirmed it maps well to the grid library we're already using

**Issues raised:**
- Meera: The "Add Widget" button is too small on 13" screens. Users in the last usability test missed it twice before finding it.
- Priya: Where does a user go if the metric they need isn't in the catalogue? There's no visible path to request a new metric.
- Dev: Grid snap behaviour needs clarification — do widgets snap to a 12-column grid or free position? Free positioning creates alignment problems.

**Decisions:**
- "Add Widget" button size increased to 44px minimum touch target, moved to persistent bottom bar
- "Request a metric" link added below the metric search results when no results found
- Grid confirmed as 12-column fixed snap — Dev to update component spec

### Screen 2: Widget Configuration Panel

**What worked:**
- Metric search with autocomplete is clean and fast in the prototype
- Preview of chart updates in real time as user selects chart type — Meera said this is "the moment that will sell this feature in demos"

**Issues raised:**
- Sana: Date range selector is inconsistent with the date picker used elsewhere in the product. Creates visual inconsistency.
- Dev: If the user selects a metric that doesn't support a pie chart (e.g. a metric with more than 6 dimensions), we need a graceful error — currently shows a blank chart.

**Decisions:**
- Date picker replaced with existing shared component — Sana to update Figma by Nov 25
- Dev to implement metric-chart compatibility validation with a plain-English error message ("This metric has too many dimensions for a pie chart — try a bar chart instead")

### Screen 3: Dashboard Sharing Flow

**No major issues.** Link generation is clean. Permission levels (view-only vs edit) are clearly labelled.

Minor: Meera requested that when a user shares a link, it should show a preview of what the recipient will see — similar to how Google Docs shows a share preview.

Decision: Nice-to-have, defer to V1.1 post-launch.

### Screen 4: Alert Setup

**Issues raised:**
- Priya: Slack channel selector only shows channels the user is in — what if they want to alert a different channel?
- The "test alert" button sends an actual Slack/email notification — this confused 2 users in testing who weren't expecting a real message.

**Decisions:**
- Slack channel selector to show all public channels the workspace has access to (requires Slack scope update)
- "Test alert" button to send to a preview panel within the product first, with a secondary "Send real test" option that explicitly warns the user

---

## Engineering Handoff Status

Dev confirmed engineering is ready to begin implementation for Screens 1 and 2 on November 25. Screens 3 and 4 can start December 2 after the Figma updates are complete.

Outstanding before handoff:
- [ ] Sana: Update date picker component (due Nov 25)
- [ ] Sana: Add "request a metric" state to Screen 1 (due Nov 25)
- [ ] Dev: Document grid snap spec for component library

---

## Next Design Review

Scheduled for December 10, 2025 — will cover mobile responsive view and PDF export flow.
