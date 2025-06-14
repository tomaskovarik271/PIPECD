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