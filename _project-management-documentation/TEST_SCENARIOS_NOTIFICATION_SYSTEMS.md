# Test Scenarios: Universal Notification Center Systems

## Overview
This document provides comprehensive test scenarios for PipeCD's Universal Notification Center, covering both **Task Notification System** and **Mention System** implementations.

## 🚀 Quick Start Testing

### Prerequisites
1. **Local Environment**: Ensure `netlify dev` and `supabase start` are running
2. **Test Data**: Have at least 2 users and 1 deal in your local database
3. **Authentication**: For GraphQL tests, obtain auth token from browser dev tools

### Running Tests
```bash
# Task Notification System
node test-task-notifications.js

# Mention System (requires auth token)
AUTH_TOKEN=your_token_here node test-mention-system.js
```

## 📋 Task Notification System Test Scenarios

### Test Script: `test-task-notifications.js`

#### **Scenario 1: Task Due Today Notifications**
- **Purpose**: Verify scheduled notifications for tasks due today
- **Test Data**: Creates task with `due_date = today`
- **Expected Behavior**: 
  - Task created successfully
  - Would trigger `task_due_today` notification via scheduled function
  - Notification includes task context and priority
- **Validation**: Script detects tasks due today that would trigger notifications

#### **Scenario 2: Overdue Task Notifications**
- **Purpose**: Verify scheduled notifications for overdue tasks  
- **Test Data**: Creates task with `due_date = 2 days ago`
- **Expected Behavior**:
  - Task created successfully
  - Would trigger `task_overdue` notification via scheduled function
  - Notification includes days overdue calculation
- **Validation**: Script detects overdue tasks and calculates days overdue

#### **Scenario 3: Task Assignment Notifications (Real-time)**
- **Purpose**: Verify immediate notifications when tasks are assigned
- **Test Data**: Creates task assigned to different user than creator
- **Expected Behavior**:
  - Task created successfully
  - `task_assigned` notification created immediately
  - Notification sent to assigned user (not creator)
- **Validation**: Script checks for notification within 1 second

#### **Scenario 4: Scheduled Function Simulation**
- **Purpose**: Simulate the Inngest scheduled function behavior
- **Test Data**: Queries existing tasks in database
- **Expected Behavior**:
  - Identifies tasks due today (9 AM weekday schedule)
  - Identifies overdue tasks with day calculations
  - Shows what notifications would be created
- **Validation**: Comprehensive report of notification-triggering tasks

### Manual Task Testing Scenarios

#### **MT-1: Assignment Notification Flow**
1. Login as User A
2. Go to deal detail page → Activities tab
3. Create task assigned to User B with due date tomorrow
4. **Expected**: User B receives `task_assigned` notification immediately
5. **Verify**: Check Universal Notification Center as User B

#### **MT-2: Due Today Notification Flow**
1. Create task with due date = today
2. Wait for 9 AM weekday (or manually trigger Inngest function)
3. **Expected**: Assigned user receives `task_due_today` notification
4. **Verify**: Notification shows task title, entity context, due date

#### **MT-3: Overdue Escalation Flow**
1. Create task with due date = yesterday
2. Wait for 9 AM weekday scheduled run
3. **Expected**: Assigned user receives `task_overdue` notification
4. **Verify**: Notification shows days overdue, priority escalation

## 💬 Mention System Test Scenarios

### Test Script: `test-mention-system.js`

#### **Scenario 1: Single User Mention**
- **Purpose**: Verify basic @mention functionality
- **Test Data**: Sticker with content mentioning one user
- **Expected Behavior**:
  - Sticker created with mentions array populated
  - `user_mentioned` notification created for mentioned user
  - Notification excludes creator (no self-notification)
- **Validation**: Checks notification count, metadata, and user targeting

#### **Scenario 2: Multiple User Mentions**
- **Purpose**: Verify multiple @mentions in single sticker
- **Test Data**: Sticker mentioning 2+ users in content
- **Expected Behavior**:
  - All mentioned users receive individual notifications
  - Each notification has correct user-specific metadata
  - Creator excluded from notifications
- **Validation**: Verifies correct notification count and distribution

#### **Scenario 3: Self-Mention Exclusion**
- **Purpose**: Verify users don't get notified for self-mentions
- **Test Data**: Sticker where creator mentions themselves
- **Expected Behavior**:
  - Sticker created with self in mentions array
  - No notification created (self-mention exclusion)
- **Validation**: Confirms zero notifications created

#### **Scenario 4: Invalid User Filtering**
- **Purpose**: Verify system handles invalid user IDs gracefully
- **Test Data**: Mentions array with mix of valid/invalid user IDs
- **Expected Behavior**:
  - Invalid user IDs filtered out during processing
  - Only valid users stored in mentions array
  - Only valid users receive notifications
- **Validation**: Confirms mention array contains only valid IDs

#### **Scenario 5: Mention Updates (New Mentions Only)**
- **Purpose**: Verify updating stickers with new mentions
- **Test Data**: Update existing sticker to add new mentions
- **Expected Behavior**:
  - Only newly mentioned users receive notifications
  - Previously mentioned users don't get duplicate notifications
  - System tracks mention history correctly
- **Validation**: Checks notification creation for new mentions only

### Manual Mention Testing Scenarios

#### **MM-1: Rich Text Editor Integration**
1. Go to deal detail → Sticker Board tab
2. Create new sticker
3. Type `@` in content area
4. **Expected**: Dropdown shows real users from system
5. Select user from dropdown
6. Save sticker
7. **Verify**: Mentioned user receives notification

#### **MM-2: Real-time User Search**
1. In sticker editor, type `@j` 
2. **Expected**: Dropdown filters to users with names/emails containing 'j'
3. **Verify**: Search works with both display names and email addresses

#### **MM-3: Visual Mention Display**
1. Create sticker with mentions
2. **Expected**: Mentions appear with special styling (`.rich-text-mention` class)
3. View sticker in read-only mode
4. **Verify**: Mentions maintain visual distinction

#### **MM-4: Cross-Entity Mention Context**
1. Create sticker on Deal A mentioning User B
2. **Expected**: User B's notification includes Deal A context
3. **Verify**: Notification metadata contains correct entity information

## 🔧 Advanced Testing Scenarios

### **Integration Test: Task + Mention Workflow**
1. Create task assigned to User A
2. User A creates sticker on task mentioning User B
3. **Expected Notifications**:
   - User A: `task_assigned` notification
   - User B: `user_mentioned` notification
4. **Verify**: Both notification types work together

### **Performance Test: Bulk Mentions**
1. Create sticker mentioning 10+ users
2. **Expected**: All users receive notifications within 2 seconds
3. **Verify**: System handles bulk notification creation efficiently

### **Permission Test: Mention Validation**
1. Attempt to mention user outside organization
2. **Expected**: Invalid user filtered out
3. **Verify**: Only valid, accessible users can be mentioned

## 📊 Test Data Requirements

### Minimum Test Environment
- **Users**: 3+ user profiles with different roles
- **Deals**: 1+ deal for entity context
- **Tasks**: Existing tasks for overdue testing (optional)

### Test Data Setup Script
```sql
-- Create test users (if needed)
INSERT INTO user_profiles (user_id, email, display_name) VALUES 
  ('test-user-1', 'test1@example.com', 'Test User 1'),
  ('test-user-2', 'test2@example.com', 'Test User 2'),
  ('test-user-3', 'test3@example.com', 'Test User 3');

-- Create test deal (if needed)
INSERT INTO deals (title, amount, currency, status) VALUES 
  ('Test Deal for Notifications', 50000, 'USD', 'active');
```

## 🎯 Success Criteria

### Task Notifications
- ✅ Assignment notifications created immediately (< 2 seconds)
- ✅ Due today notifications detected by scheduled function
- ✅ Overdue notifications calculated correctly
- ✅ Notification metadata includes complete task context
- ✅ No duplicate notifications for same task/user combination

### Mention System
- ✅ Mentions stored correctly in database
- ✅ User validation filters invalid IDs
- ✅ Notifications created for all valid mentions
- ✅ Self-mention exclusion working
- ✅ Update logic only notifies new mentions
- ✅ Rich text editor integration functional

## 🚨 Common Issues & Troubleshooting

### Task Notification Issues
- **No assignment notifications**: Check GraphQL resolver integration
- **Scheduled notifications not working**: Verify Inngest function deployment
- **Wrong notification timing**: Check timezone handling in date calculations

### Mention System Issues
- **Mentions not saving**: Verify GraphQL schema includes mentions field
- **No notifications created**: Check smartStickersService mention processing
- **Invalid users not filtered**: Verify validateMentionedUsers function
- **Rich editor not showing users**: Check useUserListStore integration

## 📈 Monitoring & Analytics

### Notification Metrics to Track
- **Creation Rate**: Notifications created per hour/day
- **Read Rate**: Percentage of notifications marked as read
- **Response Time**: Time from trigger to notification creation
- **Error Rate**: Failed notification creation attempts

### Database Queries for Monitoring
```sql
-- Notification summary by type
SELECT notification_type, COUNT(*), AVG(CASE WHEN read_at IS NOT NULL THEN 1 ELSE 0 END) as read_rate
FROM system_notifications 
WHERE created_at > NOW() - INTERVAL '24 hours'
GROUP BY notification_type;

-- Recent mention activity
SELECT COUNT(*) as mention_count, DATE_TRUNC('hour', created_at) as hour
FROM system_notifications 
WHERE notification_type = 'user_mentioned'
AND created_at > NOW() - INTERVAL '24 hours'
GROUP BY hour ORDER BY hour;
```

## 🔄 Continuous Testing

### Automated Testing Integration
- Add test scripts to CI/CD pipeline
- Run tests against staging environment
- Monitor notification system health in production

### User Acceptance Testing
- Train team members on notification features
- Collect feedback on notification frequency/relevance
- Iterate on notification content and timing

---

## 📞 Support & Documentation

For additional testing support or to report issues:
1. Check system logs in Universal Notification Center
2. Review database notification tables for data integrity
3. Verify GraphQL schema consistency
4. Test with different user permission levels

This comprehensive testing framework ensures the Universal Notification Center operates reliably across all user scenarios and business workflows. 