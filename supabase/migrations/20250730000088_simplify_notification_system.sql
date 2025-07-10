-- Migration: Simplify Notification System
-- Date: 2025-01-30
-- Description: Simplified notification architecture by removing complex Inngest-based 
--              task notifications in favor of live-data approach using proven 
--              useDealTaskIndicators pattern extended globally.

-- CHANGES MADE:
-- 1. Removed processTaskNotifications Inngest function (background scheduled jobs)
-- 2. Implemented live task calculation in NotificationCenter using useGlobalTaskIndicators hook
-- 3. Extended proven deal task indicators pattern for global notification system
-- 4. Kept business rule notifications (working well with real-time triggers)
-- 5. Kept currency exchange rate updates (essential functionality)

-- BENEFITS:
-- ✅ Eliminated complex background job scheduling 
-- ✅ Real-time task notification calculation (like deal kanban cards)
-- ✅ Simpler architecture with fewer moving parts
-- ✅ Better performance (live queries vs stored notifications)
-- ✅ Consistent with existing successful patterns

-- NOTE: system_notifications table still exists and can be used for future
--       system-level notifications if needed, but is not actively populated
--       by background jobs. Task notifications are now calculated live.

-- No schema changes required - this is purely an architectural simplification.
SELECT 1 as simplification_complete; 