# 🧪 PipeCD Relationship Intelligence Platform - Comprehensive Testing Guide

## 📋 **Testing Overview**

This comprehensive testing guide covers the newly implemented Relationship Intelligence Platform, ensuring all features work correctly across different scenarios, browsers, and user types.

---

## 🎯 **Testing Scope**

### **Components Under Test:**
- ✅ **StakeholderNetworkVisualization.tsx** - Interactive D3.js network visualization
- ✅ **StakeholderAnalysisDashboard.tsx** - AI-powered analytics dashboard  
- ✅ **RelationshipIntelligencePage.tsx** - Main interface with context selection
- ✅ **Navigation Integration** - Sidebar routing and breadcrumbs
- ✅ **GraphQL Integration** - Backend data fetching
- ✅ **Theme Compatibility** - Light/dark mode support

### **Testing Types:**
- 🔬 **Unit Testing** - Component logic and functions
- 🔗 **Integration Testing** - Component interactions
- 👤 **User Acceptance Testing** - End-to-end workflows
- 🎨 **Visual Testing** - UI consistency and responsiveness
- ⚡ **Performance Testing** - Load times and animations
- ♿ **Accessibility Testing** - WCAG compliance
- 🌐 **Cross-Browser Testing** - Multi-platform compatibility

---

## 🚀 **Pre-Testing Setup**

### **Environment Preparation:**
```bash
# 1. Ensure development server is running
npm run dev

# 2. Verify database is seeded with test data
# Check that relationship tables have sample data

# 3. Confirm user has appropriate permissions
# Test with both admin and regular user accounts

# 4. Clear browser cache and localStorage
# Start with clean state for each test session
```

### **Test Data Requirements:**
- **Organizations**: At least 3 test organizations with different industries
- **People**: 10+ people with varied roles and seniority levels
- **Relationships**: Mix of reports-to, collaborates, influences relationships
- **Stakeholder Analysis**: Records with different influence scores (1-10)
- **Custom Fields**: LinkedIn Profile field populated for some records

---

## 🧭 **Navigation & Access Testing**

### **TC-NAV-001: Sidebar Navigation**
**Objective:** Verify Relationship Intelligence appears in sidebar navigation

**Steps:**
1. Log in to PipeCD application
2. Locate sidebar navigation menu
3. Look for "Relationship Intelligence" option with Network icon
4. Click on the navigation item

**Expected Results:**
- ✅ "Relationship Intelligence" appears in main navigation
- ✅ Network icon (🌐) displays correctly
- ✅ Click navigates to `/relationships` route
- ✅ Page loads without errors
- ✅ Active state highlights properly

**Test Data:** Any valid user account

---

### **TC-NAV-002: URL Direct Access**
**Objective:** Verify direct URL access works correctly

**Steps:**
1. Navigate directly to `http://localhost:3000/relationships`
2. Verify page loads correctly
3. Check breadcrumb navigation
4. Test browser back/forward buttons

**Expected Results:**
- ✅ Page loads directly from URL
- ✅ Breadcrumb shows "Dashboard > Relationship Intelligence"
- ✅ Browser navigation works correctly
- ✅ No 404 errors or broken routes

---

## 🏢 **Context Selection Testing**

### **TC-CTX-001: Organization Selection**
**Objective:** Test organization dropdown functionality

**Steps:**
1. Navigate to Relationship Intelligence page
2. Observe organization dropdown in Analysis Context section
3. Click dropdown to view available organizations
4. Select different organizations
5. Verify data updates accordingly

**Expected Results:**
- ✅ Organizations load in dropdown with (Industry) format
- ✅ Placeholder text "Select organization..." displays when none selected
- ✅ Selection triggers data refresh
- ✅ Previously selected deal/lead clears when org changes
- ✅ Context alert updates to show selected organization

**Test Data:** Organizations: Acme Corporation, Global Industries Inc, TechStart Innovations

---

### **TC-CTX-002: Deal Context Selection**
**Objective:** Test optional deal context filtering

**Steps:**
1. Select an organization first
2. Click Deal Context dropdown
3. Verify deals are available for selection
4. Select a deal
5. Verify lead selection clears
6. Check context description updates

**Expected Results:**
- ✅ Dropdown disabled until organization selected
- ✅ Deals show with value in format: "Title ($Value)"
- ✅ Lead selection clears when deal selected
- ✅ Context shows "Deal: Title ($Value)" format
- ✅ Network data filters by deal context

**Test Data:** Deals with different values and stages

---

### **TC-CTX-003: Lead Context Selection**
**Objective:** Test optional lead context filtering

**Steps:**
1. Select an organization first
2. Click Lead Context dropdown  
3. Select a lead
4. Verify deal selection clears
5. Check context description updates

**Expected Results:**
- ✅ Dropdown disabled until organization selected
- ✅ Leads show with score: "Title (Score: XX)"
- ✅ Deal selection clears when lead selected
- ✅ Context shows "Lead: Title (Score: XX)" format
- ✅ Network data filters by lead context

---

### **TC-CTX-004: Search Functionality**
**Objective:** Test stakeholder search input

**Steps:**
1. Enter text in "Search Stakeholders" field
2. Try various search terms:
   - Person names
   - Job titles
   - Department names
   - Partial matches
3. Verify search icon displays
4. Test clearing search

**Expected Results:**
- ✅ Search icon appears in input field
- ✅ Placeholder text is descriptive
- ✅ Input accepts text without errors
- ✅ Search functionality (if implemented) works
- ✅ Clear search resets results

---

## 🌐 **Network Visualization Testing**

### **TC-VIZ-001: Basic Network Loading**
**Objective:** Verify network visualization loads correctly

**Steps:**
1. Select an organization
2. Navigate to "Network Map" tab
3. Wait for network to load
4. Observe initial network state

**Expected Results:**
- ✅ SVG canvas renders at specified height (700px)
- ✅ Network nodes appear as circles
- ✅ Connections (links) render between nodes
- ✅ Loading indicator shows during layout optimization
- ✅ "Optimizing layout..." message appears briefly

**Performance Criteria:**
- Network should load within 3 seconds
- Animation should be smooth (60fps)
- No memory leaks during rendering

---

### **TC-VIZ-002: Node Interaction**
**Objective:** Test node clicking and selection

**Steps:**
1. Load network visualization
2. Click on different stakeholder nodes
3. Verify selection feedback
4. Check stakeholder details panel appears

**Expected Results:**
- ✅ Nodes are clickable (cursor changes to pointer)
- ✅ Click triggers stakeholder selection
- ✅ Toast notification shows: "Selected: [Name]"
- ✅ "Stakeholder Details" panel appears below network
- ✅ Details show complete stakeholder information

**Test Data:** Nodes with different influence scores and roles

---

### **TC-VIZ-003: Node Drag Functionality**  
**Objective:** Test drag-and-drop node positioning

**Steps:**
1. Load network visualization
2. Click and drag various nodes
3. Release nodes in different positions
4. Verify drag behavior and physics simulation

**Expected Results:**
- ✅ Nodes can be dragged smoothly
- ✅ Dragging temporarily fixes node position
- ✅ Other nodes adjust to maintain network layout
- ✅ Released nodes return to physics simulation
- ✅ Network re-stabilizes after drag operations

---

### **TC-VIZ-004: Hover Effects**
**Objective:** Test node hover interactions

**Steps:**
1. Hover over different stakeholder nodes
2. Observe visual feedback
3. Move mouse away and verify reset
4. Test hover on connected vs unconnected nodes

**Expected Results:**
- ✅ Hovered node remains at full opacity
- ✅ Connected nodes remain visible (opacity: 1)
- ✅ Unconnected nodes fade (opacity: 0.3)
- ✅ Connected links highlight (opacity: 1)  
- ✅ Unconnected links fade (opacity: 0.1)
- ✅ Mouse leave resets all opacities

---

### **TC-VIZ-005: Zoom and Pan**
**Objective:** Test zoom and pan functionality

**Steps:**
1. Use mouse wheel to zoom in/out
2. Click and drag background to pan
3. Test zoom limits (0.1x to 4x)
4. Verify smooth zoom transitions

**Expected Results:**
- ✅ Mouse wheel zooms smoothly
- ✅ Zoom limits enforced (min: 0.1x, max: 4x)
- ✅ Pan works by dragging background
- ✅ Zoom centers on mouse cursor position
- ✅ Network layout scales proportionally

---

### **TC-VIZ-006: View Mode Switching**
**Objective:** Test different visualization modes

**Steps:**
1. Load network visualization
2. Click "Influence" tab
3. Click "Engagement" tab  
4. Click "Hierarchy" tab
5. Verify visual changes and legend updates

**Expected Results:**

**Influence Mode:**
- ✅ Nodes use red gradient colors
- ✅ Legend shows "Low Influence (1-3)" and "High Influence (8-10)"
- ✅ Node size correlates with influence score

**Engagement Mode:**
- ✅ Champion = Green (#22c55e)
- ✅ Supporter = Light Green (#84cc16)
- ✅ Neutral = Gray (#64748b)
- ✅ Skeptic = Yellow (#f59e0b)
- ✅ Blocker = Red (#ef4444)

**Hierarchy Mode:**
- ✅ Founder = Purple (#7c3aed)
- ✅ C-Level = Red (#dc2626) 
- ✅ VP = Orange (#ea580c)
- ✅ Director = Dark Orange (#d97706)
- ✅ Manager = Green (#65a30d)

---

### **TC-VIZ-007: Authority Indicators**
**Objective:** Test decision authority visual indicators

**Steps:**
1. Load network with stakeholders having different authority levels
2. Identify nodes with authority indicators
3. Verify correct icons for each authority type

**Expected Results:**
- ✅ Final Decision = Crown emoji (👑)
- ✅ Strong Influence = Lightning emoji (⚡)
- ✅ Gatekeeper = Shield emoji (🛡️)
- ✅ Icons render clearly within node circles
- ✅ Icons are white color for visibility
- ✅ Only authority roles show icons

---

### **TC-VIZ-008: Legend Accuracy**
**Objective:** Verify legend information is accurate

**Steps:**
1. Switch between different view modes
2. Compare legend with actual node colors
3. Verify authority icons section
4. Check legend positioning and styling

**Expected Results:**
- ✅ Legend updates dynamically based on view mode
- ✅ Colors in legend match node colors exactly
- ✅ Authority icons section shows correct emojis
- ✅ Legend positioned at top-left with proper styling
- ✅ Legend background is white with shadow
- ✅ Text is readable and well-formatted

---

## 📊 **Analysis Dashboard Testing**

### **TC-DASH-001: Dashboard Loading**
**Objective:** Test analysis dashboard loads correctly

**Steps:**
1. Navigate to "Analysis Dashboard" tab
2. Wait for data to load
3. Verify all dashboard sections appear

**Expected Results:**
- ✅ Loading spinner shows during data fetch
- ✅ "Analyzing stakeholder network..." message displays
- ✅ Dashboard loads within 3 seconds
- ✅ All stat cards render correctly
- ✅ No JavaScript errors in console

---

### **TC-DASH-002: Coverage Statistics**
**Objective:** Verify coverage percentage calculations

**Steps:**
1. Review Coverage Percentage card
2. Check calculation accuracy
3. Verify color coding
4. Test different scenarios

**Expected Results:**
- ✅ Coverage percentage displays as "XX.X%"
- ✅ Green color for ≥75% coverage
- ✅ Orange color for <75% coverage
- ✅ Helper text shows "X of Y roles covered"
- ✅ Arrow indicator matches coverage level

**Test Scenarios:**
- High coverage (>75%): Should show green with up arrow
- Low coverage (<75%): Should show orange with down arrow

---

### **TC-DASH-003: Seniority Breakdown**
**Objective:** Test seniority level coverage visualization

**Steps:**
1. Locate "Seniority Level Coverage" card
2. Verify all seniority levels listed
3. Check progress bars and counts
4. Verify icons for each level

**Expected Results:**
- ✅ All seniority levels shown (c_level, vp, director, manager, etc.)
- ✅ Progress bars scale relative to maximum count
- ✅ Blue progress bars for counts > 0
- ✅ Gray progress bars for counts = 0
- ✅ Correct icons: Crown for c_level, Shield for vp, etc.
- ✅ Text transforms "c_level" to "C Level"

---

### **TC-DASH-004: Department Coverage**
**Objective:** Test department coverage analysis

**Steps:**
1. Review "Department Coverage" card
2. Check all departments listed
3. Verify status indicators
4. Test progress bar calculations

**Expected Results:**
- ✅ All departments shown with counts
- ✅ Green checkmark for departments with stakeholders
- ✅ Red X for departments with 0 stakeholders
- ✅ Green progress bars for coverage > 0
- ✅ Red progress bars for no coverage
- ✅ Progress scales relative to department with most stakeholders

---

### **TC-DASH-005: Network Intelligence Insights**
**Objective:** Test business intelligence-generated insights section

**Steps:**
1. Locate "Network Intelligence Insights" section
2. Review different insight types
3. Verify priority indicators
4. Check insight messages

**Expected Results:**
- ✅ Insights display with appropriate icons
- ✅ High priority = Red background + AlertTriangle icon
- ✅ Medium priority = Yellow background + Target icon  
- ✅ No priority = Blue background + TrendingUp icon
- ✅ Insight messages are clear and actionable
- ✅ Border colors match priority levels

**Test Data:** Mix of risk_alert, opportunity, and coverage_gap insights

---

### **TC-DASH-006: Priority Missing Roles**
**Objective:** Test missing stakeholder identification

**Steps:**
1. Review "Priority Missing Roles" section
2. Check role recommendations
3. Verify priority badges
4. Test "Add Stakeholder" buttons

**Expected Results:**
- ✅ Missing roles display with titles
- ✅ Priority badges show correct colors (red=high, yellow=medium, green=low)
- ✅ "Why" section explains importance
- ✅ "Approach" section provides strategy
- ✅ "Add Stakeholder" button renders correctly
- ✅ Empty state shows "No high-priority gaps identified"

---

### **TC-DASH-007: Recommended Actions**
**Objective:** Test action recommendations section

**Steps:**
1. Locate "Recommended Actions" card
2. Review suggested actions
3. Test action buttons
4. Verify priority indicators

**Expected Results:**
- ✅ Actions display with clear descriptions
- ✅ Priority badges use correct colors
- ✅ "Take Action" button is primary blue
- ✅ "Schedule" button is outline with clock icon
- ✅ Maximum 5 actions shown
- ✅ Empty state handled gracefully

---

### **TC-DASH-008: Summary Analysis**
**Objective:** Test dashboard summary card

**Steps:**
1. Scroll to bottom "Analysis Summary" section
2. Verify summary statistics accuracy
3. Check formatting and highlighting

**Expected Results:**
- ✅ Blue background with proper contrast
- ✅ Coverage percentage matches other displays
- ✅ Stakeholder count is accurate
- ✅ Department count is correct
- ✅ High-priority gaps count matches Priority Missing Roles
- ✅ Bold text highlights key numbers
- ✅ Summary provides actionable guidance

---

### **TC-DASH-009: Refresh Functionality**
**Objective:** Test dashboard refresh capability

**Steps:**
1. Click refresh button (circular arrow icon)
2. Observe loading state
3. Verify data updates
4. Test multiple refreshes

**Expected Results:**
- ✅ Refresh button shows spinner when clicked
- ✅ Button disabled during refresh
- ✅ Loading completes within 2 seconds
- ✅ Data refreshes successfully
- ✅ No errors during refresh operation

---

## 🎮 **User Experience Testing**

### **TC-UX-001: First-Time User Experience**
**Objective:** Test experience for new users

**Steps:**
1. Clear all application data
2. Log in as new user
3. Navigate to Relationship Intelligence
4. Follow natural user flow

**Expected Results:**
- ✅ Page loads without selected organization
- ✅ Helpful "Select an Organization" message displays
- ✅ Building icon and descriptive text guide user
- ✅ Organization selection is intuitive
- ✅ Context alert explains current selection
- ✅ Network loads immediately after organization selection

---

### **TC-UX-002: Error Handling**
**Objective:** Test error scenarios and recovery

**Steps:**
1. Test with network disconnected
2. Test with invalid organization ID
3. Test with corrupted data
4. Verify error messages and recovery

**Expected Results:**
- ✅ Network errors show user-friendly messages
- ✅ Loading states handle timeouts gracefully
- ✅ Invalid data doesn't crash application
- ✅ User can retry failed operations
- ✅ Error toast notifications are informative

---

### **TC-UX-003: Loading States**
**Objective:** Verify all loading states work correctly

**Steps:**
1. Test initial page load
2. Test organization switching
3. Test tab switching
4. Test refresh operations

**Expected Results:**
- ✅ Initial load shows "Loading Relationship Intelligence..."
- ✅ Context changes show appropriate loading
- ✅ Network optimization shows "Optimizing layout..."
- ✅ Dashboard shows "Analyzing stakeholder network..."
- ✅ All spinners are properly sized and positioned

---

### **TC-UX-004: Toast Notifications**
**Objective:** Test user feedback notifications

**Steps:**
1. Select stakeholders in network view
2. Use action buttons
3. Test export and share functions
4. Verify notification content and timing

**Expected Results:**
- ✅ Stakeholder selection shows: "Selected: [Name]"
- ✅ Network analysis shows: "Analyzing Network"
- ✅ Missing stakeholders shows: "AI is analyzing gaps..."
- ✅ Export shows: "Export Started"
- ✅ Share shows: "Share Link Created"
- ✅ All toasts auto-dismiss after appropriate time

---

## 📱 **Responsive Design Testing**

### **TC-RESP-001: Desktop Resolutions**
**Objective:** Test on various desktop screen sizes

**Screen Sizes to Test:**
- 1920x1080 (Full HD)
- 1440x900 (MacBook Air)
- 1366x768 (Standard laptop)
- 1280x720 (HD)

**Expected Results:**
- ✅ All components scale appropriately
- ✅ Network visualization maintains aspect ratio
- ✅ Dashboard cards use responsive grid
- ✅ Text remains readable at all sizes
- ✅ No horizontal scrolling required

---

### **TC-RESP-002: Tablet Testing**
**Objective:** Test tablet compatibility

**Screen Sizes:**
- iPad (768x1024)
- iPad Pro (1024x1366)
- Android tablets (various)

**Expected Results:**
- ✅ Interface adapts to touch interactions
- ✅ Grid layouts adjust to available space
- ✅ Network remains interactive
- ✅ All buttons are touch-friendly (minimum 44px)

---

### **TC-RESP-003: Mobile Testing**
**Objective:** Test mobile phone compatibility

**Screen Sizes:**
- iPhone SE (375x667)
- iPhone 12 (390x844)
- Samsung Galaxy (360x740)

**Expected Results:**
- ✅ Grid stacks to single column
- ✅ Network visualization remains functional
- ✅ Text is readable without zooming
- ✅ Navigation remains accessible

---

## ♿ **Accessibility Testing**

### **TC-A11Y-001: Keyboard Navigation**
**Objective:** Test keyboard-only navigation

**Steps:**
1. Navigate using only Tab key
2. Test Enter/Space key interactions
3. Test Escape key for dismissing elements
4. Verify focus indicators

**Expected Results:**
- ✅ All interactive elements focusable
- ✅ Tab order is logical
- ✅ Focus indicators visible
- ✅ Enter/Space activate buttons
- ✅ No keyboard traps

---

### **TC-A11Y-002: Screen Reader Testing**
**Objective:** Test with screen reader software

**Tools:** NVDA, JAWS, or VoiceOver

**Expected Results:**
- ✅ All elements have appropriate ARIA labels
- ✅ Headings create proper document structure
- ✅ Images have alt text
- ✅ Form controls have labels
- ✅ Status updates are announced

---

### **TC-A11Y-003: Color Contrast**
**Objective:** Verify color contrast meets WCAG standards

**Tools:** axe-core, Colour Contrast Analyser

**Expected Results:**
- ✅ Text contrast ratio ≥ 4.5:1 (normal text)
- ✅ Large text contrast ratio ≥ 3:1
- ✅ Interactive elements meet contrast requirements
- ✅ Color is not the only way to convey information

---

## 🌐 **Cross-Browser Testing**

### **TC-BROWSER-001: Chrome Testing**
**Versions:** Latest stable, Previous major version

**Expected Results:**
- ✅ All features work correctly
- ✅ D3.js animations smooth
- ✅ SVG rendering correct
- ✅ No console errors

---

### **TC-BROWSER-002: Firefox Testing**
**Versions:** Latest stable, ESR

**Expected Results:**
- ✅ Feature parity with Chrome
- ✅ CSS Grid layouts correct
- ✅ Network visualization functions
- ✅ Theme switching works

---

### **TC-BROWSER-003: Safari Testing**
**Versions:** Latest macOS, Latest iOS

**Expected Results:**
- ✅ WebKit-specific features work
- ✅ Touch interactions on iOS
- ✅ SVG animations perform well
- ✅ Memory usage acceptable

---

### **TC-BROWSER-004: Edge Testing**
**Versions:** Latest Chromium-based

**Expected Results:**
- ✅ All Chromium features supported
- ✅ Windows-specific interactions
- ✅ Performance comparable to Chrome

---

## ⚡ **Performance Testing**

### **TC-PERF-001: Initial Load Performance**
**Objective:** Measure page load times

**Metrics to Track:**
- Time to First Byte (TTFB)
- First Contentful Paint (FCP)
- Largest Contentful Paint (LCP)
- Time to Interactive (TTI)

**Performance Targets:**
- ✅ FCP < 1.8 seconds
- ✅ LCP < 2.5 seconds
- ✅ TTI < 3.8 seconds
- ✅ No layout shifts (CLS < 0.1)

---

### **TC-PERF-002: Network Visualization Performance**
**Objective:** Test D3.js rendering performance

**Test Scenarios:**
- 10 nodes, 15 relationships
- 25 nodes, 40 relationships  
- 50 nodes, 80 relationships
- 100 nodes, 150 relationships

**Performance Expectations:**
- ✅ Smooth 60fps animation
- ✅ Initial render < 500ms
- ✅ Interaction response < 16ms
- ✅ Memory usage stable

---

### **TC-PERF-003: Memory Usage**
**Objective:** Monitor memory consumption

**Steps:**
1. Load relationship intelligence page
2. Switch between organizations
3. Change visualization modes
4. Monitor for memory leaks

**Expected Results:**
- ✅ Memory usage stays under 100MB
- ✅ No memory leaks during normal use
- ✅ Garbage collection occurs properly
- ✅ DOM nodes cleaned up on unmount

---

## 📋 **Data Validation Testing**

### **TC-DATA-001: Mock Data Accuracy**
**Objective:** Verify mock data represents realistic scenarios

**Validation Points:**
- ✅ Stakeholder data has required fields
- ✅ Influence scores are 1-10 range
- ✅ Relationship types are valid enums
- ✅ Department coverage represents real organizations
- ✅ Seniority levels span org hierarchy

---

### **TC-DATA-002: Edge Cases**
**Objective:** Test with edge case data

**Test Scenarios:**
- Empty organization (no stakeholders)
- Single stakeholder (no relationships)
- All stakeholders same influence score
- Missing optional data fields
- Circular relationships

**Expected Results:**
- ✅ Empty states handled gracefully
- ✅ Single nodes render correctly
- ✅ Uniform data doesn't break visualizations
- ✅ Missing data uses defaults
- ✅ Circular relationships prevented or handled

---

## 🧩 **Integration Testing**

### **TC-INT-001: GraphQL Integration**
**Objective:** Test GraphQL query integration points

**Steps:**
1. Verify GraphQL schema imports correctly
2. Test query structure matches expected data
3. Check error handling for failed queries
4. Validate data transformations

**Expected Results:**
- ✅ GraphQL types imported without errors
- ✅ Query structure supports all UI requirements
- ✅ Network errors handled gracefully
- ✅ Data transformation functions work correctly

---

### **TC-INT-002: Theme Integration**
**Objective:** Test theme compatibility

**Steps:**
1. Switch between available themes
2. Verify color tokens work correctly
3. Test light/dark mode compatibility
4. Check custom theme support

**Expected Results:**
- ✅ All themes render correctly
- ✅ Color contrast maintained in all themes
- ✅ Network visualization adapts to themes
- ✅ Dashboard components respect theme colors

---

### **TC-INT-003: Navigation Integration**
**Objective:** Test routing and navigation

**Steps:**
1. Test all navigation paths to relationships page
2. Verify breadcrumb accuracy
3. Test browser navigation (back/forward)
4. Check deep linking support

**Expected Results:**
- ✅ All routes function correctly
- ✅ Breadcrumbs update properly
- ✅ Browser navigation works
- ✅ Deep links load correct state

---

## 🎯 **User Acceptance Testing**

### **UAT-001: Sales Representative Workflow**
**Persona:** Sarah, Sales Rep

**Scenario:** "I need to understand the stakeholder network for Acme Corporation before my next meeting."

**Steps:**
1. Navigate to Relationship Intelligence
2. Select "Acme Corporation"
3. Review network visualization
4. Identify key decision makers
5. Check for missing stakeholders

**Success Criteria:**
- ✅ Can quickly identify all current stakeholders
- ✅ Understands reporting relationships visually
- ✅ Spots influence patterns immediately
- ✅ Gets recommendations for missing contacts
- ✅ Feels confident about next meeting

---

### **UAT-002: Sales Manager Workflow**
**Persona:** Marcus, Sales Manager

**Scenario:** "I need to review my team's relationship coverage across all active deals."

**Steps:**
1. Review multiple organizations
2. Check coverage percentages
3. Identify systematic gaps
4. Plan territory adjustments

**Success Criteria:**
- ✅ Can compare coverage across organizations
- ✅ Spots patterns in missing stakeholder types
- ✅ Understands team's relationship strengths/weaknesses
- ✅ Can make data-driven territory decisions

---

### **UAT-003: Account Executive Workflow**
**Persona:** Lisa, Account Executive

**Scenario:** "I'm working on a complex enterprise deal and need to map all influencers."

**Steps:**
1. Select organization and specific deal
2. Use influence view mode
3. Identify champions and blockers
4. Plan engagement strategy

**Success Criteria:**
- ✅ Can filter network by specific deal
- ✅ Easily identifies high-influence stakeholders
- ✅ Understands engagement levels at a glance
- ✅ Gets actionable next steps from AI insights

---

## 📊 **Test Execution Tracking**

### **Test Matrix Template**
```
| Test Case | Priority | Status | Browser | Notes | Date |
|-----------|----------|--------|---------|--------|------|
| TC-NAV-001 | High | ⏳ | Chrome | | |
| TC-VIZ-001 | High | ⏳ | Chrome | | |
| TC-DASH-001 | High | ⏳ | Chrome | | |
```

### **Bug Report Template**
```markdown
**Bug ID:** BUG-RI-001
**Title:** Network nodes disappear on zoom out
**Severity:** Medium
**Priority:** High
**Reporter:** [Name]
**Date:** [Date]

**Environment:**
- Browser: Chrome 119.0
- OS: macOS 14.0
- Screen: 1440x900

**Steps to Reproduce:**
1. Load network visualization
2. Zoom out to minimum (0.1x)
3. Observe nodes

**Expected Result:** Nodes should remain visible
**Actual Result:** Nodes disappear completely
**Workaround:** Zoom back in to 0.2x or higher

**Screenshots:** [Attach]
**Console Errors:** [Paste]
```

---

## 🚀 **Automated Testing Setup**

### **Unit Tests (Jest + React Testing Library)**
```typescript
// Example test structure
describe('StakeholderNetworkVisualization', () => {
  test('renders network canvas', () => {
    render(<StakeholderNetworkVisualization organizationId="1" />);
    expect(screen.getByTestId('network-svg')).toBeInTheDocument();
  });

  test('handles node selection', () => {
    const onSelect = jest.fn();
    render(<StakeholderNetworkVisualization 
      organizationId="1" 
      onStakeholderSelect={onSelect} 
    />);
    // Test node click interactions
  });
});
```

### **E2E Tests (Playwright)**
```typescript
// Example E2E test
test('complete relationship intelligence workflow', async ({ page }) => {
  await page.goto('/relationships');
  await page.selectOption('[data-testid=org-select]', '1');
  await page.click('[data-testid=network-tab]');
  await expect(page.locator('[data-testid=network-svg]')).toBeVisible();
  await page.click('[data-testid=stakeholder-node-1]');
  await expect(page.locator('[data-testid=stakeholder-details]')).toBeVisible();
});
```

### **Visual Regression Tests (Chromatic/Percy)**
```typescript
// Example visual test
test('network visualization visual consistency', async ({ page }) => {
  await page.goto('/relationships');
  await page.selectOption('[data-testid=org-select]', '1');
  await page.waitForLoadState('networkidle');
  await expect(page).toHaveScreenshot('network-default-view.png');
});
```

---

## 📈 **Performance Monitoring**

### **Lighthouse Scoring Targets**
- **Performance:** ≥ 90
- **Accessibility:** ≥ 95
- **Best Practices:** ≥ 90
- **SEO:** ≥ 85

### **Core Web Vitals**
- **LCP:** < 2.5s (Good)
- **FID:** < 100ms (Good)
- **CLS:** < 0.1 (Good)

### **Custom Metrics**
- Network rendering time: < 500ms
- Dashboard load time: < 1s
- Memory usage: < 100MB
- Frame rate: 60fps sustained

---

## 🎉 **Test Completion Criteria**

### **Definition of Done:**
- ✅ All High/Critical test cases pass
- ✅ No blocking bugs remain
- ✅ Performance targets met
- ✅ Accessibility requirements satisfied
- ✅ Cross-browser compatibility confirmed
- ✅ User acceptance criteria validated
- ✅ Documentation updated

### **Release Readiness Checklist:**
- [ ] All test cases executed
- [ ] Bug triage completed
- [ ] Performance benchmarks met
- [ ] Accessibility audit passed
- [ ] User acceptance tests signed off
- [ ] Documentation reviewed
- [ ] Stakeholder approval obtained

---

## 📞 **Support & Escalation**

### **Test Environment Issues:**
- **Contact:** DevOps Team
- **Slack:** #devops-support
- **Priority:** Blocker issues halt testing

### **Feature Questions:**
- **Contact:** Development Team
- **Slack:** #relationship-intelligence
- **Priority:** Clarification needed for test cases

### **Bug Triage:**
- **Contact:** Product Team
- **Slack:** #product-triage
- **Priority:** Severity assessment and prioritization

---

**📋 Status: Ready for Testing** ✅
**🎯 Coverage: Comprehensive** 
**⚡ Priority: Ship-Critical**

*"Quality is not an act, it is a habit. Test with precision, ship with confidence."* 