# Activity Reminders System - Testing Guide

This guide provides step-by-step instructions for testing the Activity Reminders System in different ways: automated tests, manual GraphQL testing, frontend testing, and production validation.

## Prerequisites

Before testing, ensure you have:

1. **Local development environment running:**
   ```bash
   # Terminal 1: Start Supabase
   npx supabase start
   
   # Terminal 2: Start Netlify Dev
   netlify dev
   ```

2. **Database migrations applied:**
   ```bash
   npx supabase db reset  # This applies all migrations
   ```

3. **Dependencies installed:**
   ```bash
   npm install
   ```

## 1. Automated Testing

### Complete System Test

Run the comprehensive automated test suite:

```bash
# Install test dependencies if needed
npm install node-fetch @supabase/supabase-js

# Make the script executable
chmod +x scripts/test-activity-reminders-complete.js

# Run the complete test suite
node scripts/test-activity-reminders-complete.js
```

**What this tests:**
- ✅ GraphQL API health
- ✅ User preferences system (create, read, update)
- ✅ Activity creation with automatic reminder scheduling
- ✅ Notification system (create, read, mark as read)
- ✅ Activity lifecycle integration (update, complete)
- ✅ Data cleanup

### Database-Only Tests

For testing just the database layer:

```bash
# Run the simple database test
node scripts/test-db-simple.js
```

## 2. Manual GraphQL Testing

### Using GraphQL Playground

1. **Open GraphQL Playground:**
   - Go to `http://localhost:8888/.netlify/functions/graphql`
   - You should see the GraphQL Playground interface

2. **Authentication Setup:**
   ```graphql
   # First, sign up/in to get a token (replace with your test user)
   mutation {
     signUp(email: "test@example.com", password: "testpassword123") {
       access_token
       user {
         id
         email
       }
     }
   }
   ```

3. **Set Authorization Header:**
   ```json
   {
     "Authorization": "Bearer YOUR_ACCESS_TOKEN_HERE"
   }
   ```

### Test Queries and Mutations

#### Test User Preferences
```graphql
# Get current preferences (creates defaults if none exist)
query GetMyPreferences {
  myReminderPreferences {
    id
    userId
    emailRemindersEnabled
    emailReminderMinutesBefore
    inAppRemindersEnabled
    inAppReminderMinutesBefore
    overdueNotificationsEnabled
    overdueNotificationFrequencyHours
    createdAt
    updatedAt
  }
}

# Update preferences
mutation UpdatePreferences {
  updateMyReminderPreferences(input: {
    emailRemindersEnabled: true
    emailReminderMinutesBefore: 30
    inAppRemindersEnabled: true
    inAppReminderMinutesBefore: 15
    overdueNotificationsEnabled: true
    overdueNotificationFrequencyHours: 24
  }) {
    id
    emailReminderMinutesBefore
    inAppReminderMinutesBefore
  }
}
```

#### Test Activity Creation with Reminders
```graphql
# Create activity (should auto-schedule reminders)
mutation CreateTestActivity {
  createActivity(input: {
    subject: "Test Call with GraphQL"
    type: "CALL"
    due_date: "2025-01-20T15:00:00Z"
    notes: "Testing reminder scheduling"
  }) {
    id
    subject
    due_date
    is_done
    created_at
  }
}

# Check if reminders were scheduled (use the activity ID from above)
query CheckReminders {
  activityReminders(activityId: "YOUR_ACTIVITY_ID") {
    id
    activityId
    reminderType
    scheduledFor
    isSent
    createdAt
  }
}
```

#### Test Notifications
```graphql
# Get my notifications
query GetMyNotifications {
  myNotifications(limit: 10) {
    totalCount
    unreadCount
    notifications {
      id
      title
      message
      isRead
      notificationType
      priority
      createdAt
      entityType
      entityId
    }
  }
  unreadNotificationCount
}

# Mark notification as read
mutation MarkAsRead {
  markNotificationAsRead(id: "NOTIFICATION_ID") {
    id
    isRead
    readAt
  }
}

# Create manual notification (admin only)
mutation CreateNotification {
  createNotification(input: {
    title: "Manual Test Notification"
    message: "This is a test notification created manually"
    notificationType: "activity_reminder"
    priority: "normal"
    entityType: "ACTIVITY"
    entityId: "YOUR_ACTIVITY_ID"
  }) {
    id
    title
    message
    priority
  }
}
```

## 3. Frontend Testing

### Test the Notification Component

1. **View the component:**
   - Open your app in the browser
   - Look for the bell icon in the header/navigation
   - Click it to open the notification center

2. **Test interactions:**
   - Click notifications to mark as read
   - Use the "Mark all as read" button
   - Delete individual notifications

### Test User Preferences

1. **Access preferences:**
   - Go to user profile/settings
   - Find the "Notification Preferences" section

2. **Test preference updates:**
   - Toggle email/in-app reminders on/off
   - Change reminder timing (minutes before)
   - Update overdue notification settings
   - Save and verify changes persist

### Test Activity Lifecycle

1. **Create activities with due dates:**
   - Create activities in the future (2+ hours)
   - Verify reminders are scheduled in database
   
2. **Update activities:**
   - Change due dates
   - Mark activities as complete
   - Check that reminders are updated/cancelled

## 4. Email Testing (Development)

Since emails require Gmail integration, test in development mode:

```bash
# Check the Inngest dashboard for email jobs
# Open: http://localhost:8288 (if Inngest dev server is running)

# Alternatively, check email processing logs
node -e "
const { inngest } = require('./netlify/functions/inngest');
console.log('Checking Inngest functions...');
console.log(inngest.functions.map(f => f.name));
"
```

## 5. Background Jobs Testing

### Test Inngest Functions

1. **Start Inngest dev server:**
   ```bash
   # In a new terminal
   npx inngest-cli@latest dev
   ```

2. **Trigger functions manually:**
   ```bash
   # Create a test activity and watch for jobs
   curl -X POST http://localhost:8888/.netlify/functions/inngest \
     -H "Content-Type: application/json" \
     -d '{
       "name": "activity/reminder.schedule",
       "data": {
         "activityId": "test-activity-id",
         "userId": "test-user-id"
       }
     }'
   ```

### Test Scheduled Jobs

Check that cron jobs are registered:

```bash
# View Inngest dashboard
open http://localhost:8288

# Check for:
# - checkOverdueActivities (runs daily)
# - cleanupExpiredNotifications (runs daily)
# - processActivityReminder (triggered events)
```

## 6. Manual Database Verification

### Check Data Integrity

```sql
-- Connect to local Supabase: npx supabase db start
-- Access SQL editor: http://localhost:54323

-- Check user preferences are created automatically
SELECT 
  urp.*,
  auth.users.email
FROM user_reminder_preferences urp
JOIN auth.users ON urp.user_id = auth.users.id
LIMIT 5;

-- Check activity reminders
SELECT 
  ar.*,
  a.subject,
  a.due_date
FROM activity_reminders ar
JOIN activities a ON ar.activity_id = a.id
WHERE ar.is_sent = false
ORDER BY ar.scheduled_for ASC
LIMIT 10;

-- Check notifications
SELECT 
  n.*,
  auth.users.email
FROM notifications n
JOIN auth.users ON n.user_id = auth.users.id
ORDER BY n.created_at DESC
LIMIT 10;
```

### Test Database Functions

```sql
-- Test cleanup function
SELECT cleanup_expired_notifications();

-- Check RLS policies work
SET ROLE authenticated;
SET request.jwt.claims.sub = 'test-user-id';
SELECT * FROM user_reminder_preferences;
```

## 7. Performance Testing

### Database Performance

```sql
-- Check query performance with EXPLAIN
EXPLAIN ANALYZE
SELECT * FROM activity_reminders 
WHERE scheduled_for <= NOW() 
  AND is_sent = false 
ORDER BY scheduled_for ASC
LIMIT 100;

-- Check index usage
SELECT 
  schemaname,
  tablename,
  indexname,
  idx_tup_read,
  idx_tup_fetch
FROM pg_stat_user_indexes
WHERE tablename IN ('activity_reminders', 'notifications', 'user_reminder_preferences');
```

### API Performance

```bash
# Test GraphQL query performance
time curl -X POST http://localhost:8888/.netlify/functions/graphql \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"query": "query { myNotifications(limit: 50) { totalCount notifications { id title } } }"}'
```

## 8. Error Handling Testing

### Test Error Scenarios

1. **Invalid authentication:**
   ```graphql
   # Remove Authorization header and try queries
   query {
     myReminderPreferences {
       id
     }
   }
   ```

2. **Invalid data:**
   ```graphql
   mutation {
     updateMyReminderPreferences(input: {
       emailReminderMinutesBefore: -10  # Invalid negative value
     }) {
       id
     }
   }
   ```

3. **Non-existent resources:**
   ```graphql
   mutation {
     markNotificationAsRead(id: "non-existent-id") {
       id
     }
   }
   ```

## 9. Production Readiness Checklist

Before deploying to production:

- [ ] All automated tests pass
- [ ] Manual GraphQL testing successful
- [ ] Frontend components working
- [ ] Email integration configured
- [ ] Inngest functions deployed
- [ ] Database migrations applied
- [ ] RLS policies tested
- [ ] Performance benchmarks met
- [ ] Error handling verified
- [ ] Monitoring/logging configured

## 10. Troubleshooting

### Common Issues

**GraphQL Schema not loading:**
```bash
# Restart Netlify dev
netlify dev --port 8888

# Check schema files exist
ls -la netlify/functions/graphql/schema/
```

**Database connection issues:**
```bash
# Restart Supabase
npx supabase stop
npx supabase start
```

**Inngest functions not working:**
```bash
# Check Inngest configuration
npx inngest-cli@latest dev --verbose
```

### Debug Logging

Enable debug logging for more information:

```bash
# Set environment variables
export DEBUG=activity-reminders:*
export NODE_ENV=development

# Run tests with verbose output
node scripts/test-activity-reminders-complete.js
```

## Quick Start Test Script

For a quick verification that everything is working:

```bash
#!/bin/bash
echo "🚀 Quick Activity Reminders Test"
echo "================================"

# Check services are running
echo "1. Checking Supabase..."
curl -s http://localhost:54321/rest/v1/ > /dev/null && echo "✅ Supabase OK" || echo "❌ Supabase DOWN"

echo "2. Checking Netlify..."
curl -s http://localhost:8888/.netlify/functions/graphql > /dev/null && echo "✅ Netlify OK" || echo "❌ Netlify DOWN"

echo "3. Checking GraphQL Schema..."
curl -s -X POST http://localhost:8888/.netlify/functions/graphql \
  -H "Content-Type: application/json" \
  -d '{"query": "{ __schema { types { name } } }"}' | \
  grep -q "UserReminderPreferences" && echo "✅ Schema OK" || echo "❌ Schema Missing"

echo "4. Running automated tests..."
node scripts/test-activity-reminders-complete.js

echo "🎉 Test complete!"
```

Save this as `quick-test.sh`, make it executable (`chmod +x quick-test.sh`), and run it for a fast verification. 