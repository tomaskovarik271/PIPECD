# PipeCD Business Rules Engine - Administrator Manual

## 🎯 Overview

The Business Rules Engine is PipeCD's powerful automation system that monitors your CRM data and automatically triggers actions when specific conditions are met. Think of it as your digital assistant that never sleeps - watching for important events and ensuring nothing falls through the cracks.

## 🚀 Quick Start Guide

### Step 1: Understanding Rule Types

**EVENT_BASED Rules** - Trigger when something happens:
- ✅ Deal created, updated, or assigned
- ✅ Lead converted or status changed
- 🔄 Person/Organization updated (coming soon)

**FIELD_CHANGE Rules** - Trigger when specific fields change:
- ✅ Deal amount increases/decreases
- ✅ Assignment changes
- ✅ Status or stage transitions

**TIME_BASED Rules** - Trigger on schedule:
- 🔄 Daily, weekly, or monthly checks (coming soon)
- 🔄 Stale deal alerts
- 🔄 Follow-up reminders

### Step 2: Your First Rule

1. Click **"Create Business Rule"**
2. Choose **"High Value Deal Alert"** template
3. Set conditions: `amount > 50000`
4. Set action: `NOTIFY_OWNER`
5. Write message: `"High value deal detected: {{deal_name}} - Amount: {{deal_amount}}"`
6. Click **"Save & Activate"**

🎉 **Congratulations!** Your rule will now automatically notify deal owners when high-value deals are created.

## 🏗️ Rule Components Deep Dive

### Rule Information

**Name**: Choose descriptive names like "High Value Deal Alert" or "Stale Deal Follow-up"

**Description**: Explain what the rule does and why it's important

**Entity Type**: What you're monitoring:
- `DEAL` - Sales opportunities
- `LEAD` - Potential customers
- `TASK` - Action items
- `PERSON` - Individual contacts
- `ORGANIZATION` - Company records
- `ACTIVITY` - Logged actions

### Trigger Configuration

**EVENT_BASED**: Monitors CRM events
```
Trigger Events:
- DEAL_CREATED ✅
- DEAL_UPDATED ✅
- DEAL_ASSIGNED ✅
- LEAD_CREATED 🔄
- LEAD_CONVERTED 🔄
```

**FIELD_CHANGE**: Monitors specific field changes
```
Monitored Fields:
- amount (deal value)
- assigned_to_user_id (ownership)
- status (deal/lead status)
- close_date (estimated close)
- Any custom field
```

### Conditions System

Build sophisticated conditions using these operators:

**Comparison Operators**:
- `EQUALS` / `NOT_EQUALS`
- `GREATER_THAN` / `LESS_THAN`
- `GREATER_EQUAL` / `LESS_EQUAL`

**Text Operators**:
- `CONTAINS` - Field contains specific text
- `STARTS_WITH` / `ENDS_WITH`

**Null Checks**:
- `IS_NULL` - Field is empty
- `IS_NOT_NULL` - Field has value

**List Operators**:
- `IN` - Field matches any value in list
- `NOT_IN` - Field doesn't match any value

**Advanced Operators**:
- `OLDER_THAN` / `NEWER_THAN` - Date comparisons
- `DECREASED_BY_PERCENT` / `INCREASED_BY_PERCENT` - Change detection

**Logic Operators**:
- `AND` - All conditions must be true
- `OR` - Any condition can be true

### Actions System

**NOTIFY_USER** ✅ - Send notification to specific user
```json
{
  "type": "NOTIFY_USER",
  "target": "user-uuid",
  "template": "Custom Alert",
  "message": "Deal {{deal_name}} needs attention",
  "priority": 3
}
```

**NOTIFY_OWNER** ✅ - Send notification to entity owner
```json
{
  "type": "NOTIFY_OWNER",
  "template": "Owner Alert",
  "message": "Your deal {{deal_name}} has been updated",
  "priority": 2
}
```

**CREATE_TASK** 🔄 - Create follow-up task (coming soon)
```json
{
  "type": "CREATE_TASK",
  "template": "Follow-up Task",
  "data": {
    "subject": "Follow up on {{deal_name}}",
    "priority": "HIGH",
    "dueInDays": 3
  }
}
```

**Priority Levels**:
- `1` - Low (informational)
- `2` - Medium (standard alerts)
- `3` - High (important issues)
- `4` - Urgent (critical problems)

## 🎨 Template Variables System

Make your notifications dynamic with powerful template variables:

### Deal Variables
```
{{deal_name}} → "ACME Corporation Deal"
{{deal_amount}} → "EUR 75,000.00" (formatted with currency)
{{deal_currency}} → "EUR"
{{deal_stage}} → "Negotiation"
{{deal_owner}} → "John Smith"
{{deal_close_date}} → "2025-02-15"
{{deal_id}} → UUID
```

### Lead Variables
```
{{lead_name}} → "Jane Doe"
{{lead_email}} → "jane@company.com"
{{lead_value}} → "USD 25,000.00"
{{lead_source}} → "Website Form"
{{lead_status}} → "Qualified"
```

### Organization Variables
```
{{organization_name}} → "ACME Corporation"
{{organization_website}} → "https://acme.com"
{{organization_industry}} → "Technology"
```

### Person Variables
```
{{person_name}} → "John Smith"
{{person_email}} → "john@company.com"
{{person_phone}} → "(555) 123-4567"
```

### Universal Variables
```
{{entity_id}} → Entity UUID
{{entity_name}} → Entity name (context-aware)
{{current_date}} → "2025-01-20"
{{current_time}} → "2025-01-20 14:30:00"
```

### Template Examples

**Professional Notifications**:
```
"High value opportunity: {{deal_name}} worth {{deal_amount}} requires immediate attention."

"Deal assignment update: You are now responsible for {{deal_name}} ({{deal_amount}}) closing on {{deal_close_date}}."

"Lead conversion opportunity: {{lead_name}} from {{organization_name}} shows strong interest."
```

**Rich Context Messages**:
```
"🚨 URGENT: Deal {{deal_name}} value dropped by 25% to {{deal_amount}}. Immediate review required."

"✅ SUCCESS: New high-value deal {{deal_name}} created for {{organization_name}} worth {{deal_amount}}."

"📅 REMINDER: Deal {{deal_name}} closes in 7 days ({{deal_close_date}}) - current value: {{deal_amount}}."
```

## 📋 Pre-Built Rule Templates

### High Value Deal Alert
```yaml
Entity: DEAL
Trigger: EVENT_BASED (DEAL_CREATED)
Conditions:
  - amount GREATER_THAN 50000
Actions:
  - NOTIFY_OWNER: "High value deal detected: {{deal_name}} - Amount: {{deal_amount}}"
```

### Deal Assignment Notification
```yaml
Entity: DEAL
Trigger: FIELD_CHANGE (assigned_to_user_id)
Conditions:
  - assigned_to_user_id IS_NOT_NULL
Actions:
  - NOTIFY_OWNER: "You have been assigned to deal: {{deal_name}} with amount {{deal_amount}}"
```

### Deal Value Change Alert
```yaml
Entity: DEAL
Trigger: FIELD_CHANGE (amount)
Conditions:
  - amount DECREASED_BY_PERCENT 25
Actions:
  - NOTIFY_OWNER: "Deal value decreased: {{deal_name}} is now {{deal_amount}}"
  - priority: 3 (HIGH)
```

### Large Organization Deal Alert
```yaml
Entity: DEAL
Trigger: EVENT_BASED (DEAL_CREATED)
Conditions:
  - amount GREATER_THAN 100000
  - organization_name CONTAINS "Corporation"
Actions:
  - NOTIFY_USER (manager): "Enterprise deal created: {{deal_name}} for {{organization_name}} worth {{deal_amount}}"
```

### Lost Deal Recovery
```yaml
Entity: DEAL
Trigger: FIELD_CHANGE (status)
Conditions:
  - status EQUALS "LOST"
  - amount GREATER_THAN 25000
Actions:
  - CREATE_TASK: "Analyze lost deal: {{deal_name}} - conduct post-mortem"
  - NOTIFY_OWNER: "High-value deal lost: {{deal_name}} ({{deal_amount}}) - review required"
```

## 🔧 Advanced Configuration

### Multi-Condition Rules

**AND Logic** - All conditions must be true:
```json
[
  {"field": "amount", "operator": "GREATER_THAN", "value": 50000, "logicalOperator": "AND"},
  {"field": "close_date", "operator": "NEWER_THAN", "value": "30 days"}
]
```

**OR Logic** - Any condition can be true:
```json
[
  {"field": "status", "operator": "EQUALS", "value": "URGENT", "logicalOperator": "OR"},
  {"field": "amount", "operator": "GREATER_THAN", "value": 100000}
]
```

### Complex Conditions

**Date-Based Conditions**:
```json
{"field": "close_date", "operator": "OLDER_THAN", "value": "7 days"}
{"field": "created_at", "operator": "NEWER_THAN", "value": "1 hour"}
```

**Percentage Change Detection**:
```json
{"field": "amount", "operator": "INCREASED_BY_PERCENT", "value": 50}
{"field": "amount", "operator": "DECREASED_BY_PERCENT", "value": 25}
```

**List Matching**:
```json
{"field": "status", "operator": "IN", "value": ["ACTIVE", "NEGOTIATION", "PROPOSAL"]}
{"field": "source", "operator": "NOT_IN", "value": ["SPAM", "INVALID"]}
```

### Priority and Notification Management

**Priority Guidelines**:
- **Priority 1 (Low)**: Informational updates, routine notifications
- **Priority 2 (Medium)**: Standard business alerts, assignment changes
- **Priority 3 (High)**: Important issues requiring attention
- **Priority 4 (Urgent)**: Critical problems needing immediate action

**Notification Best Practices**:
- Use clear, action-oriented messages
- Include relevant context with template variables
- Set appropriate priorities to avoid alert fatigue
- Test rules before activating in production

## 🧪 Testing & Debugging

### Rule Testing

**Test Mode**: Use the "Test Rule" button to validate rules without triggering real notifications

**Manual Execution**: 
```graphql
mutation {
  executeBusinessRule(
    ruleId: "your-rule-uuid"
    entityType: DEAL
    entityId: "test-deal-uuid"
    testMode: true
  ) {
    rulesProcessed
    notificationsCreated
    errors
  }
}
```

### Debugging Tools

**Rule Executions Tab**: Monitor rule performance and identify issues
- Execution count and success rate
- Error messages and stack traces
- Performance metrics and timing

**Notification Center**: Verify notifications are created and properly formatted
- Check template variable substitution
- Confirm priority levels and targeting
- Review notification history

### Common Issues

**Rule Not Triggering**:
1. ✅ Check rule status (must be ACTIVE)
2. ✅ Verify trigger events match your test scenario
3. ✅ Confirm conditions are correctly configured
4. ✅ Check entity type matches your test data

**Template Variables Not Working**:
1. ✅ Verify variable names are correct (case-sensitive)
2. ✅ Check entity data contains the referenced fields
3. ✅ Ensure template syntax uses double braces `{{variable}}`

**Performance Issues**:
1. ✅ Review condition complexity
2. ✅ Check rule execution frequency
3. ✅ Monitor database performance impact

## 📊 Monitoring & Analytics

### Rule Performance Metrics

**Execution Statistics**:
- Total executions
- Success rate
- Average execution time
- Error frequency

**Business Impact**:
- Notifications created
- Tasks generated
- User engagement rates

### Health Monitoring

**Active Rules Dashboard**:
- Rule status overview
- Recent execution activity
- Error alerts and warnings

**System Performance**:
- Database query performance
- Function execution times
- Notification delivery rates

## 🔐 Security & Permissions

### Role-Based Access

**Admin Rights Required**:
- Create and modify business rules
- Access rule execution logs
- Configure system-wide settings

**Permission Model**:
- Rules respect existing entity permissions
- Notifications only sent to authorized users
- Audit trails maintain security compliance

### Data Privacy

**Template Variables**:
- Only include data users have permission to see
- Sensitive fields automatically filtered
- Compliance with data protection regulations

## 🎯 Best Practices

### Rule Design Principles

**1. Start Simple**: Begin with basic rules and add complexity gradually

**2. Use Descriptive Names**: Make rule purposes clear to other admins

**3. Test Thoroughly**: Always test rules in test mode before activation

**4. Monitor Performance**: Watch for rules that trigger too frequently

**5. Regular Reviews**: Periodically audit rules for relevance and effectiveness

### Notification Guidelines

**Clear Messaging**: Use template variables to provide context

**Appropriate Priorities**: Reserve urgent notifications for true emergencies

**Actionable Content**: Include next steps or required actions

**Consistent Formatting**: Use standardized message templates

### Performance Optimization

**Efficient Conditions**: Use specific conditions to minimize rule execution

**Batch Operations**: Group related rules to reduce system load

**Archive Inactive Rules**: Remove or disable unused rules

**Monitor Execution Frequency**: Watch for rules triggering too often

## 🆘 Troubleshooting Guide

### Common Problems

**"Rule not triggering"**:
- Verify rule status is ACTIVE
- Check trigger configuration matches test scenario
- Confirm entity type and conditions are correct
- Review rule execution logs for errors

**"Template variables showing as {{variable}}"**:
- Check variable name spelling and case
- Verify entity data contains the referenced field
- Ensure proper template syntax with double braces

**"Notifications not appearing"**:
- Check user permissions for target notifications
- Verify notification center is functioning
- Review notification table for created records

**"Performance issues"**:
- Simplify complex condition logic
- Reduce rule execution frequency
- Monitor database query performance

### Getting Help

**Documentation**: Review this manual and system documentation

**Logs**: Check rule execution logs for detailed error information

**Support**: Contact system administrators for complex issues

**Community**: Share experiences with other PipeCD administrators

## 🔮 Coming Soon

### Phase 2 Features

**TIME_BASED Rules**: Scheduled rule execution for proactive monitoring

**Additional Actions**:
- `CREATE_TASK` - Automatically generate follow-up tasks
- `SEND_EMAIL` - Send email notifications to external contacts
- `UPDATE_FIELD` - Automatically update entity fields

**Enhanced Templates**: More template variables and formatting options

### Phase 3 Features

**Advanced Scheduling**: Complex time-based rule configurations

**Workflow Integration**: Rules that interact with WFM stages

**External Integrations**: Webhook actions and third-party notifications

**Analytics Dashboard**: Rule effectiveness and business impact metrics

---

## 📞 Support & Resources

**System Status**: Monitor business rules engine health in Admin → System Health

**Documentation**: Complete technical documentation in project files

**Training**: Request administrator training sessions for complex scenarios

**Updates**: Stay informed about new features and improvements

---

*Last Updated: January 2025 - Business Rules Engine v1.0* 