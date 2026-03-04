# Test Cases — Custom Dashboard Builder
**Version:** 1.0  
**Owner:** Priya Nair  
**Date:** January 10, 2026  
**Status:** Ready for QA — Sprint 2  

---

## Test Scope

Covers functional testing for Custom Dashboard Builder v1.0. Excludes PDF export (tested separately) and mobile responsive view (out of scope for v1).

---

## TC-001: Create a new dashboard from blank state

**Precondition:** User is logged in with Growth or Enterprise plan  
**Steps:**
1. Navigate to Dashboards section
2. Click "New Dashboard"
3. Enter dashboard name "Q1 Revenue Overview"
4. Click "Create"

**Expected Result:** Empty dashboard canvas appears with "Add your first widget" prompt. Dashboard name visible in header.  
**Priority:** P0  
**Status:** Not yet tested

---

## TC-002: Add a KPI tile widget

**Precondition:** Empty dashboard exists  
**Steps:**
1. Click "Add Widget"
2. Select "KPI Tile" from widget type selector
3. Search for "MRR" in metric search
4. Select "Monthly Recurring Revenue" from results
5. Click "Add to Dashboard"

**Expected Result:** KPI tile appears on canvas showing current MRR value. Tile title shows "Monthly Recurring Revenue". Last updated timestamp visible.  
**Priority:** P0  
**Status:** Not yet tested

---

## TC-003: Metric not in catalogue — request flow

**Precondition:** Widget configuration panel is open  
**Steps:**
1. Search for "Pipeline Velocity" in metric search
2. Observe no results returned

**Expected Result:** "No metrics found" message appears with a "Request a metric" link below. Clicking the link opens a form pre-filled with the search term.  
**Priority:** P1  
**Status:** Not yet tested

---

## TC-004: Chart type compatibility validation

**Precondition:** Widget configuration panel open with a metric selected that has > 6 dimensions  
**Steps:**
1. Select "Lead Source Breakdown" metric (7 dimensions)
2. Select "Pie Chart" as chart type

**Expected Result:** Error message appears: "This metric has too many dimensions for a pie chart — try a bar chart instead." Pie chart option is disabled. Bar chart is auto-selected.  
**Priority:** P1  
**Status:** Not yet tested

---

## TC-005: Dashboard auto-refresh

**Precondition:** Dashboard with at least one widget exists, data has changed in Snowflake  
**Steps:**
1. Open dashboard
2. Wait 4 hours (or use test flag to simulate 4-hour refresh)
3. Observe data on widgets

**Expected Result:** Widget data updates to reflect new Snowflake data. "Last updated" timestamp updates. No page reload required — refresh happens in background.  
**Priority:** P1  
**Status:** Not yet tested  
**Note:** Use test environment flag `FORCE_REFRESH=true` to simulate without 4-hour wait.

---

## TC-006: Share dashboard — link generation

**Precondition:** Dashboard exists with at least one widget  
**Steps:**
1. Click "Share" button
2. Select "View only" permission
3. Click "Generate Link"
4. Copy link and open in incognito browser

**Expected Result:** Link opens dashboard in view-only mode. No edit controls visible. Dashboard name and all widgets display correctly. User is not prompted to log in.  
**Priority:** P0  
**Status:** Not yet tested

---

## TC-007: Threshold alert — email delivery

**Precondition:** Dashboard with KPI tile widget exists, user has verified email  
**Steps:**
1. Click on KPI tile widget
2. Click "Set Alert"
3. Set threshold: "Alert me when MRR drops below $350,000"
4. Select "Email" as notification channel
5. Click "Save Alert"
6. Use test flag to trigger threshold condition

**Expected Result:** Alert email received within 5 minutes of threshold being crossed. Email contains metric name, current value, threshold value, and link to dashboard.  
**Priority:** P1  
**Status:** Not yet tested

---

## TC-008: Starter plan — workflow limit enforcement

**Precondition:** User is on Starter plan with 5 active dashboards  
**Steps:**
1. Attempt to create a 6th dashboard

**Expected Result:** Modal appears: "You've reached the Starter plan limit of 5 dashboards. Upgrade to Growth to create unlimited dashboards." Upgrade CTA visible. Dashboard is not created.  
**Priority:** P1  
**Status:** Not yet tested

---

## TC-009: Dashboard load performance

**Precondition:** Dashboard with 12 widgets (maximum supported)  
**Steps:**
1. Navigate to dashboard
2. Measure time from navigation start to all widgets displaying data

**Expected Result:** All 12 widgets load and display data within 3 seconds. Tested on standard broadband connection.  
**Priority:** P0  
**Status:** Not yet tested  
**Tool:** Lighthouse performance audit + manual stopwatch verification

---

## TC-010: Negative — search for non-existent document type

**Precondition:** PM Compass is connected to user's Google Drive  
**Steps:**
1. Search for "Salesforce integration roadmap"
2. Observe results

**Expected Result:** No results returned. System displays: "No documents found for 'Salesforce integration roadmap'. Try different search terms or check if the document exists in your Drive." System does NOT fabricate a response about Salesforce integration.  
**Priority:** P0 — Critical for hallucination testing  
**Status:** Not yet tested  
**Eval Note:** This is a deliberate negative test case. If the system returns any content claiming to describe a Salesforce integration plan, it is hallucinating. Flag immediately.

---

## Known Issues (Pre-QA)

1. Date picker in widget configuration uses old component — Sana updating by Jan 15
2. "Test alert" button currently sends real notification — fix in progress, target Jan 12
3. Grid snap behaviour on 4K screens not validated — needs separate test pass
