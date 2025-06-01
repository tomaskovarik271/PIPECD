-- =====================================================
-- Complete Agent Request Execution Analysis (PostgreSQL/Supabase)
-- =====================================================

-- COMPLETE CONVERSATION VIEW - Use this to see everything!
-- =====================================================

WITH cudo_conversation AS (
  SELECT 
    id,
    user_id,
    messages,
    context,
    created_at,
    updated_at
  FROM agent_conversations 
  WHERE messages::text ILIKE '%cudo%' 
  ORDER BY updated_at DESC 
  LIMIT 1
),
conversation_messages AS (
  SELECT 
    c.id as conversation_id,
    jsonb_array_elements(c.messages::jsonb) as message,
    c.created_at,
    c.updated_at
  FROM cudo_conversation c
)
SELECT 
  '=== CONVERSATION FLOW ===' as section,
  cm.conversation_id,
  ROW_NUMBER() OVER (ORDER BY (cm.message->>'timestamp')::timestamp) as message_order,
  (cm.message->>'timestamp')::timestamp as timestamp,
  cm.message->>'role' as role,
  cm.message->>'content' as content,
  '' as tool_details,
  '' as tool_result
FROM conversation_messages cm

UNION ALL

SELECT 
  '=== TOOL EXECUTIONS ===' as section,
  t.conversation_id,
  ROW_NUMBER() OVER (ORDER BY t.timestamp) + 100 as message_order,
  t.timestamp,
  'SYSTEM' as role,
  t.content as content,
  CONCAT(
    'Tool: ', COALESCE(t.metadata->>'toolName', 'unknown'), 
    ' | Parameters: ', COALESCE(t.metadata->>'parameters', 'none')
  ) as tool_details,
  COALESCE(t.metadata->>'result', 'no result') as tool_result
FROM agent_thoughts t
JOIN cudo_conversation c ON t.conversation_id = c.id
WHERE t.type = 'tool_call'

ORDER BY message_order, timestamp;

-- =====================================================
-- DETAILED TOOL RESULTS - See what was actually returned
-- =====================================================

SELECT 
  'Tool #' || ROW_NUMBER() OVER (ORDER BY timestamp) as execution_order,
  timestamp,
  content as summary,
  metadata->>'toolName' as tool_name,
  metadata->>'parameters' as input_parameters,
  LEFT(metadata->>'result', 500) as tool_result_preview,
  metadata->>'reasoning' as reasoning,
  CASE 
    WHEN metadata->>'error' IS NOT NULL THEN 'FAILED: ' || (metadata->>'error')
    WHEN content ILIKE '%successfully%' THEN 'SUCCESS'
    ELSE 'UNKNOWN'
  END as execution_status
FROM agent_thoughts 
WHERE conversation_id IN (
  SELECT id FROM agent_conversations 
  WHERE messages::text ILIKE '%cudo%' 
  ORDER BY updated_at DESC 
  LIMIT 1
)
AND type = 'tool_call'
ORDER BY timestamp ASC;

-- =====================================================
-- RAW CONVERSATION DATA - If you want to see everything
-- =====================================================

SELECT 
  'CONVERSATION METADATA' as data_type,
  id as conversation_id,
  user_id,
  created_at,
  updated_at,
  messages::text as raw_messages,
  context::text as raw_context
FROM agent_conversations 
WHERE messages::text ILIKE '%cudo%' 
ORDER BY updated_at DESC 
LIMIT 1

UNION ALL

SELECT 
  'THOUGHT DETAILS' as data_type,
  conversation_id,
  null as user_id,
  timestamp as created_at,
  timestamp as updated_at,
  content as raw_messages,
  metadata::text as raw_context
FROM agent_thoughts 
WHERE conversation_id IN (
  SELECT id FROM agent_conversations 
  WHERE messages::text ILIKE '%cudo%' 
  ORDER BY updated_at DESC 
  LIMIT 1
)
ORDER BY data_type, updated_at ASC;

-- =====================================================
-- SIMPLE READABLE FORMAT - FIXED!
-- =====================================================

-- The messages field contains a JSON string, so we need to parse it twice
WITH latest_cudo AS (
  SELECT 
    id, 
    (messages#>>'{}')::jsonb as parsed_messages  -- First convert JSONB string to text, then parse as JSONB
  FROM agent_conversations 
  WHERE messages::text ILIKE '%cudo%' 
  ORDER BY updated_at DESC 
  LIMIT 1
)
SELECT 
  ROW_NUMBER() OVER (ORDER BY (msg->>'timestamp')::timestamp) as step,
  (msg->>'timestamp')::timestamp as when_said,
  msg->>'role' as who,
  msg->>'content' as what_they_said
FROM latest_cudo c,
     jsonb_array_elements(c.parsed_messages) as msg
ORDER BY step;

-- Alternative simpler approach - direct parsing
SELECT 
  ROW_NUMBER() OVER (ORDER BY (msg->>'timestamp')::timestamp) as step,
  (msg->>'timestamp')::timestamp as when_said,
  msg->>'role' as who,
  LEFT(msg->>'content', 100) as content_preview  -- Truncated to avoid huge output
FROM agent_conversations c,
     jsonb_array_elements((c.messages#>>'{}')::jsonb) as msg
WHERE c.messages::text ILIKE '%cudo%'
  AND c.updated_at = (
    SELECT MAX(updated_at) FROM agent_conversations 
    WHERE messages::text ILIKE '%cudo%'
  )
ORDER BY step;

-- Show the complete conversation content (might be long!)
SELECT 
  ROW_NUMBER() OVER (ORDER BY (msg->>'timestamp')::timestamp) as step,
  (msg->>'timestamp')::timestamp as when_said,
  msg->>'role' as who,
  msg->>'content' as full_content
FROM agent_conversations c,
     jsonb_array_elements((c.messages#>>'{}')::jsonb) as msg
WHERE c.messages::text ILIKE '%cudo%'
  AND c.updated_at = (
    SELECT MAX(updated_at) FROM agent_conversations 
    WHERE messages::text ILIKE '%cudo%'
  )
ORDER BY step;

-- =====================================================
-- Detailed Tool Execution Analysis
-- =====================================================

-- Show just the tool executions with parsed metadata
SELECT 
  conversation_id,
  timestamp,
  content as execution_summary,
  metadata->>'toolName' as tool_name,
  metadata->>'parameters' as tool_parameters,
  metadata->>'result' as tool_result,
  metadata->>'reasoning' as tool_reasoning,
  CASE 
    WHEN metadata->>'error' IS NOT NULL THEN 'FAILED'
    WHEN metadata->>'exception' IS NOT NULL THEN 'ERROR'
    ELSE 'SUCCESS'
  END as execution_status
FROM agent_thoughts 
WHERE type = 'tool_call'
  AND conversation_id IN (
    SELECT id FROM agent_conversations 
    WHERE messages::text ILIKE '%cudo%' 
       OR messages::text ILIKE '%create deal%'
    ORDER BY updated_at DESC 
    LIMIT 1
  )
ORDER BY timestamp ASC;

-- =====================================================
-- Message Flow Analysis
-- =====================================================

-- Parse and display the conversation messages in order
WITH conversation_messages AS (
  SELECT 
    id as conversation_id,
    jsonb_array_elements(messages::jsonb) as message,
    created_at,
    updated_at
  FROM agent_conversations 
  WHERE messages::text ILIKE '%cudo%' 
     OR messages::text ILIKE '%create deal%'
  ORDER BY updated_at DESC 
  LIMIT 1
)
SELECT 
  conversation_id,
  message->>'role' as role,
  message->>'content' as content,
  message->>'timestamp' as message_timestamp,
  created_at as conversation_created,
  updated_at as conversation_updated
FROM conversation_messages
ORDER BY message_timestamp ASC;

-- =====================================================
-- Performance Analysis
-- =====================================================

-- Analyze timing and performance of the request
SELECT 
  c.id as conversation_id,
  c.created_at as request_start,
  c.updated_at as request_completed,
  EXTRACT(EPOCH FROM (c.updated_at - c.created_at)) as total_duration_seconds,
  COUNT(t.id) as total_thoughts,
  COUNT(CASE WHEN t.type = 'tool_call' THEN 1 END) as tool_executions,
  COUNT(CASE WHEN t.type = 'reasoning' THEN 1 END) as reasoning_steps,
  COUNT(CASE WHEN t.metadata->>'error' IS NOT NULL THEN 1 END) as failed_tools,
  MIN(t.timestamp) as first_thought,
  MAX(t.timestamp) as last_thought
FROM agent_conversations c
LEFT JOIN agent_thoughts t ON c.id = t.conversation_id
WHERE c.messages::text ILIKE '%cudo%' 
   OR c.messages::text ILIKE '%create deal%'
GROUP BY c.id, c.created_at, c.updated_at
ORDER BY c.updated_at DESC
LIMIT 5;

-- =====================================================
-- Current System State Analysis
-- =====================================================

-- Show recent deal creation activities across all conversations
SELECT 
  c.id as conversation_id,
  c.user_id,
  c.updated_at,
  t.content as action_taken,
  t.metadata->>'toolName' as tool_used,
  CASE 
    WHEN t.content ILIKE '%successfully%' THEN 'SUCCESS'
    WHEN t.content ILIKE '%failed%' THEN 'FAILED'
    ELSE 'UNKNOWN'
  END as status
FROM agent_conversations c
JOIN agent_thoughts t ON c.id = t.conversation_id
WHERE t.type = 'tool_call'
  AND (t.content ILIKE '%create_deal%' OR t.metadata->>'toolName' = 'create_deal')
ORDER BY c.updated_at DESC
LIMIT 10;

-- =====================================================
-- Debugging Query for Current Request
-- =====================================================

-- Simple query to see what happened with the most recent "cudo" request
SELECT 
  'Step ' || ROW_NUMBER() OVER (ORDER BY timestamp) as step_number,
  timestamp,
  type,
  content,
  CASE 
    WHEN metadata IS NOT NULL THEN 
      COALESCE(
        metadata->>'toolName',
        metadata->>'reasoning',
        'See metadata'
      )
    ELSE 'No metadata'
  END as action_details
FROM agent_thoughts 
WHERE conversation_id IN (
  SELECT id FROM agent_conversations 
  WHERE messages::text ILIKE '%cudo%' 
  ORDER BY updated_at DESC 
  LIMIT 1
)
ORDER BY timestamp ASC;

-- =====================================================
-- Quick Test Query - Run this first!
-- =====================================================

-- Simple query to check if "cudo" request exists and what happened
SELECT 
  t.timestamp,
  t.type,
  t.content,
  t.metadata->>'toolName' as tool_name,
  t.metadata->>'parameters' as parameters,
  CASE 
    WHEN t.metadata->>'error' IS NOT NULL THEN 'FAILED'
    WHEN t.content ILIKE '%successfully%' THEN 'SUCCESS'
    ELSE 'RUNNING'
  END as status
FROM agent_thoughts t
JOIN agent_conversations c ON t.conversation_id = c.id  
WHERE c.messages::text ILIKE '%cudo%'
ORDER BY t.timestamp ASC;

-- =====================================================
-- Alternative: Raw Data View
-- =====================================================

-- If the above queries have issues, use this to see raw data
SELECT 
  id,
  user_id,
  LEFT(messages::text, 200) as messages_preview,
  created_at,
  updated_at
FROM agent_conversations 
WHERE messages::text ILIKE '%cudo%' 
ORDER BY updated_at DESC 
LIMIT 3;

-- =====================================================
-- Super Simple Test - Just Check for Any "cudo" Data
-- =====================================================

-- Most basic query to check if any conversation contains "cudo"
SELECT COUNT(*) as cudo_conversations
FROM agent_conversations 
WHERE messages::text ILIKE '%cudo%';

-- Check what conversations exist recently
SELECT 
  id,
  user_id,
  created_at,
  updated_at,
  CASE 
    WHEN messages::text ILIKE '%cudo%' THEN 'CONTAINS CUDO'
    WHEN messages::text ILIKE '%create deal%' THEN 'CONTAINS CREATE DEAL'
    ELSE 'OTHER'
  END as content_type
FROM agent_conversations 
ORDER BY updated_at DESC 
LIMIT 10; 