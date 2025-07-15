# 📋 Manual Test Scenarios: Universal Notification Center

## 🎯 **Overview**
This document provides step-by-step manual test scenarios to validate the Universal Notification Center, Task Notification System, and @Mention System functionality in PipeCD.

## 🚀 **Prerequisites**

### **Environment Setup**
1. **Local Development Environment Running**:
   ```bash
   netlify dev        # Should be running on http://localhost:8888
   supabase start     # Local database should be active
   ```

2. **Test Data Requirements**:
   - At least **2 user accounts** (created through authentication)
   - At least **1 deal** in the system
   - Users should have different roles (to test assignment scenarios)

3. **Browser Setup**:
   - Open PipeCD in browser: `http://localhost:8888`
   - Login with primary test user
   - Open Developer Tools (F12) for debugging if needed

---

## 📋 **TASK NOTIFICATION SYSTEM - Manual Tests**

### **Test 1: Task Assignment Notification (Real-time)**

#### **Objective**: Verify immediate notifications when tasks are assigned to other users

#### **Steps**:
1. **Login as User A** (primary test user)
2. **Navigate to Deal Detail Page**:
   - Go to Deals → Click on any existing deal
   - Click on **"Activities"** tab

3. **Create Task Assigned to Different User**:
   - Click **"Create Task"** button
   - Fill in task details:
     - **Title**: "Manual Test - Task Assignment"
     - **Description**: "Testing task assignment notifications"
     - **Type**: Select "Follow-up"
     - **Priority**: Select "High"
     - **Due Date**: Select tomorrow's date
     - **Assigned To**: Select **User B** (different from current user)
   - Click **"Create Task"**

4. **Verify Notification Creation**:
   - **Expected**: Task created successfully
   - **Expected**: System shows success message

5. **Switch to User B Account**:
   - Logout from User A
   - Login as **User B**

6. **Check Universal Notification Center**:
   - Look for **bell icon** in page header (top right area)
   - **Expected**: Bell icon shows notification badge/count
   - Click on bell icon to open notification panel

7. **Verify Task Assignment Notification**:
   - **Expected**: New notification with type "Task Assigned"
   - **Expected**: Notification title mentions the task
   - **Expected**: Notification shows task details and due date
   - **Expected**: Notification includes deal context
   - **Expected**: Notification shows User A as the assigner

#### **Success Criteria**:
- ✅ Notification appears within 5 seconds of task creation
- ✅ Notification contains correct task information
- ✅ Notification shows proper user attribution
- ✅ Bell icon updates with notification count

---

### **Test 2: Due Today Task Detection**

#### **Objective**: Verify tasks due today are properly detected for notifications

#### **Steps**:
1. **Login as User A**
2. **Create Task Due Today**:
   - Navigate to any deal → Activities tab
   - Create new task:
     - **Title**: "Manual Test - Due Today"
     - **Due Date**: **Today's date**
     - **Assigned To**: User B
   - Save task

3. **Simulate Scheduled Processing**:
   - **Note**: In production, this runs automatically at 9 AM weekdays
   - For testing, we'll verify the task would be detected

4. **Check Task in Database** (Optional):
   - Open browser dev tools → Console
   - This step validates the task exists and would trigger notifications

5. **Expected Behavior**:
   - Task is created successfully
   - Task appears in Activities list with today's due date
   - In production: User B would receive "Task Due Today" notification at 9 AM

#### **Success Criteria**:
- ✅ Task created with today's due date
- ✅ Task visible in Activities panel
- ✅ Task shows correct assignment

---

### **Test 3: Overdue Task Detection**

#### **Objective**: Verify overdue tasks are properly identified

#### **Steps**:
1. **Login as User A**
2. **Create Overdue Task**:
   - Navigate to any deal → Activities tab
   - Create new task:
     - **Title**: "Manual Test - Overdue Task"
     - **Due Date**: **Yesterday's date** (or earlier)
     - **Status**: Keep as "Pending"
     - **Assigned To**: User B
   - Save task

3. **Verify Task Status**:
   - **Expected**: Task appears in Activities list
   - **Expected**: Task shows overdue status (red indicator or similar)

4. **Expected Production Behavior**:
   - In production: User B would receive "Task Overdue" notification at next 9 AM scheduled run
   - Notification would include days overdue calculation

#### **Success Criteria**:
- ✅ Task created with past due date
- ✅ Task shows as overdue in UI
- ✅ Task properly assigned to User B

---

## 💬 **@MENTION SYSTEM - Manual Tests**

### **Test 4: Single User Mention in Sticker**

#### **Objective**: Verify basic @mention functionality creates notifications

#### **Steps**:
1. **Login as User A**
2. **Navigate to Sticker Board**:
   - Go to any deal detail page
   - Click on **"Sticker Board"** tab

3. **Create Sticker with Mention**:
   - Click **"Add Sticker"** or similar button
   - In the content editor:
     - Type: "Hey "
     - Type **"@"** character
     - **Expected**: Dropdown appears with user list
     - Select **User B** from dropdown
     - Complete message: "Hey @UserB, can you review this deal proposal?"
   - Set other sticker properties:
     - **Title**: "Manual Test - Single Mention"
     - **Color**: Any color
   - Save sticker

4. **Verify Mention Storage**:
   - **Expected**: Sticker created successfully
   - **Expected**: Sticker displays with @UserB highlighted/styled
   - **Expected**: Mention appears with special formatting

5. **Switch to User B Account**:
   - Logout from User A
   - Login as **User B**

6. **Check Notification**:
   - Click bell icon in header
   - **Expected**: New "User Mentioned" notification
   - **Expected**: Notification shows sticker title
   - **Expected**: Notification includes deal context
   - **Expected**: Notification shows User A as the mentioner

#### **Success Criteria**:
- ✅ @mention dropdown shows real users
- ✅ Mention is properly styled in sticker
- ✅ Notification created for mentioned user
- ✅ Notification contains correct context

---

### **Test 5: Multiple User Mentions**

#### **Objective**: Verify multiple users can be mentioned in single sticker

#### **Steps**:
1. **Login as User A**
2. **Navigate to Sticker Board** (any deal)
3. **Create Sticker with Multiple Mentions**:
   - Create new sticker
   - Content: "Team meeting update: @UserB and @UserC, please review the latest proposal and provide feedback by EOD."
   - **Title**: "Manual Test - Multiple Mentions"
   - Save sticker

4. **Verify Multiple Mentions**:
   - **Expected**: Both @UserB and @UserC are highlighted
   - **Expected**: Sticker saves successfully

5. **Check Notifications for User B**:
   - Login as User B
   - Check notifications
   - **Expected**: Receives "User Mentioned" notification

6. **Check Notifications for User C**:
   - Login as User C
   - Check notifications
   - **Expected**: Receives "User Mentioned" notification

#### **Success Criteria**:
- ✅ Multiple mentions work in single sticker
- ✅ Each mentioned user receives individual notification
- ✅ Notifications are properly targeted

---

### **Test 6: Self-Mention Exclusion**

#### **Objective**: Verify users don't get notified for mentioning themselves

#### **Steps**:
1. **Login as User A**
2. **Create Sticker Mentioning Self**:
   - Navigate to Sticker Board
   - Create sticker with content: "Note to self: @UserA, remember to follow up on this deal next week."
   - **Title**: "Manual Test - Self Mention"
   - Save sticker

3. **Verify No Self-Notification**:
   - Stay logged in as User A
   - Check notification center
   - **Expected**: NO new "User Mentioned" notification for self
   - **Expected**: Sticker still saves and displays @UserA mention

#### **Success Criteria**:
- ✅ Self-mention is stored and displayed
- ✅ No notification created for self-mention
- ✅ System handles self-mentions gracefully

---

### **Test 7: Mention Search and Filtering**

#### **Objective**: Verify mention dropdown search functionality

#### **Steps**:
1. **Login as User A**
2. **Navigate to Sticker Board**
3. **Test Mention Search**:
   - Start creating new sticker
   - Type "@j" (or first letter of a user's name)
   - **Expected**: Dropdown filters to users matching "j"
   - **Expected**: Shows both display names and email addresses
   - Clear and type "@" + email prefix
   - **Expected**: Filters by email address too

4. **Test Invalid Mention**:
   - Try typing "@nonexistentuser"
   - **Expected**: No dropdown results or empty state
   - **Expected**: System handles gracefully

#### **Success Criteria**:
- ✅ Search filters users by name and email
- ✅ Dropdown updates in real-time
- ✅ Invalid searches handled gracefully

---

## 🔧 **UNIVERSAL NOTIFICATION CENTER - Manual Tests**

### **Test 8: Notification Center UI Functionality**

#### **Objective**: Verify all notification center features work correctly

#### **Steps**:
1. **Login with account that has notifications** (from previous tests)
2. **Open Notification Center**:
   - Click bell icon in page header
   - **Expected**: Panel opens with notifications list

3. **Test Notification Display**:
   - **Expected**: Notifications show proper icons by type
   - **Expected**: Timestamps are relative (e.g., "2m ago")
   - **Expected**: Unread notifications are visually distinct

4. **Test Mark as Read**:
   - Click "Mark as read" on individual notification
   - **Expected**: Notification visual state changes
   - **Expected**: Bell icon count decreases

5. **Test Mark All as Read**:
   - Click "Mark all as read" button
   - **Expected**: All notifications marked as read
   - **Expected**: Bell icon shows no unread count

6. **Test Dismiss Functionality**:
   - Click "Dismiss" on a notification
   - **Expected**: Notification disappears from list
   - **Expected**: Notification doesn't reappear on refresh

7. **Test Filtering**:
   - Use filter dropdown to filter by type
   - **Expected**: Only selected notification types shown
   - Clear filter
   - **Expected**: All notifications return

8. **Test Manual Refresh**:
   - Click refresh button
   - **Expected**: Notification list updates
   - **Expected**: Shows loading state briefly

#### **Success Criteria**:
- ✅ All UI controls function correctly
- ✅ Visual states update appropriately
- ✅ Filtering and refresh work properly
- ✅ No JavaScript errors in console

---

### **Test 9: Cross-Page Notification Persistence**

#### **Objective**: Verify notifications persist across page navigation

#### **Steps**:
1. **Create notifications** (using previous test scenarios)
2. **Navigate between pages**:
   - Go to Deals page → Check bell icon
   - Go to People page → Check bell icon
   - Go to deal detail page → Check bell icon
   - **Expected**: Notification count consistent across pages

3. **Test Auto-Refresh**:
   - Open notification center
   - Wait 30+ seconds
   - **Expected**: Panel auto-refreshes (may see brief loading state)

#### **Success Criteria**:
- ✅ Notification count consistent across pages
- ✅ Auto-refresh works every 30 seconds
- ✅ No duplicate notifications

---

## 🎯 **INTEGRATION TESTS**

### **Test 10: Task + Mention Workflow**

#### **Objective**: Verify both systems work together

#### **Steps**:
1. **Create task assigned to User B** (Task notification)
2. **User B creates sticker mentioning User A** (Mention notification)
3. **Verify both users receive appropriate notifications**

#### **Success Criteria**:
- ✅ Both notification types work simultaneously
- ✅ No conflicts between notification systems
- ✅ Each user receives correct notifications

---

## ❗ **Troubleshooting Guide**

### **Common Issues & Solutions**

#### **No Notifications Appearing**:
- Check browser console for JavaScript errors
- Verify GraphQL endpoint is accessible
- Confirm user has proper permissions
- Check if notification polling is working (30-second intervals)

#### **Mention Dropdown Not Working**:
- Verify users exist in system
- Check GraphQL `assignableUsers` query
- Confirm TipTap editor is properly initialized

#### **Task Notifications Not Created**:
- Verify task assignment is to different user (not self)
- Check GraphQL task creation mutation
- Confirm notification resolvers are working

#### **Bell Icon Not Updating**:
- Check notification count query
- Verify real-time polling is active
- Refresh page and test again

### **Debug Tools**:
- **Browser Console**: Check for JavaScript errors
- **Network Tab**: Verify GraphQL requests are successful
- **GraphQL Playground**: Test queries directly
- **Database**: Check notification tables directly

---

## 📊 **Test Results Template**

### **Task Notification System**
- [ ] Test 1: Task Assignment Notification
- [ ] Test 2: Due Today Task Detection  
- [ ] Test 3: Overdue Task Detection

### **@Mention System**
- [ ] Test 4: Single User Mention
- [ ] Test 5: Multiple User Mentions
- [ ] Test 6: Self-Mention Exclusion
- [ ] Test 7: Mention Search and Filtering

### **Universal Notification Center**
- [ ] Test 8: Notification Center UI
- [ ] Test 9: Cross-Page Persistence
- [ ] Test 10: Integration Workflow

### **Overall Assessment**:
- **Task Notifications**: ✅ Pass / ❌ Fail
- **Mention System**: ✅ Pass / ❌ Fail  
- **Notification Center**: ✅ Pass / ❌ Fail
- **Ready for Production**: ✅ Yes / ❌ No

---

## 🚀 **Next Steps After Testing**

1. **Document any issues found** during manual testing
2. **Report bugs** with steps to reproduce
3. **Validate fixes** by re-running failed tests
4. **Sign off on production readiness** once all tests pass

**Happy Testing! 🧪** 