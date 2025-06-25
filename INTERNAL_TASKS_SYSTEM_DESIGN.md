# Internal Tasks System Design & Implementation

## 🎯 **Core Philosophy**

PipeCD's internal task system is designed to be **CRM-native**, where every task has business context and drives deal progression. Unlike generic to-do apps, our tasks are business intelligence in action form.

### **Key Principles:**
- **Business Context First** - Every task knows its business purpose
- **Timeline Integration** - Tasks appear alongside calendar events
- **Smart Automation** - System suggests logical next actions
- **CRM-Native** - Tasks directly tied to deals, leads, people, organizations

---

## 🛤️ **User Journeys**

### **Journey 1: Sales Rep Daily Workflow**
```
🌅 Morning Routine:
1. Opens PipeCD → sees dashboard with today's tasks + meetings
2. Timeline shows: "9 AM - Call ORVIL" (task) + "2 PM - Demo with Bank of Austria" (calendar)
3. Clicks task → sees context: "Follow up on €90K proposal sent last week"
4. Makes call → marks task complete → auto-creates "Send contract" task
5. Adds quick note: "CEO interested, wants to discuss pricing"

📊 Throughout Day:
• Timeline keeps them on track with mixed tasks/meetings
• Completes tasks with one click
• Creates new tasks: "Research competitor pricing for ORVIL"
• AI suggests: "Deal inactive for 5 days - create follow-up task?"
```

### **Journey 2: Deal Progression Workflow**
```
💼 Active Deal Management:
1. User updates deal stage: "Proposal" → "Contract Review"
2. System auto-creates task: "Follow up on contract feedback by Friday"
3. User sees task in deal timeline alongside previous meetings
4. Task due date auto-calculated from deal close date
5. User completes task → system suggests: "Schedule contract signing meeting?"

🔄 Continuous Context:
• Each task shows full deal context (value, contacts, stage)
• Task completion triggers next logical business action
• Timeline shows complete deal story: meetings + tasks + outcomes
```

### **Journey 3: Email-to-Action Workflow**
```
📧 Email Processing:
1. User receives important email in deal context
2. Clicks "Create Task from Email" (enhanced existing feature)
3. AI suggests task: "Respond to pricing questions from ORVIL CEO"
4. Task auto-links to email thread + deal + contact
5. Due date suggested based on email urgency + deal timeline

✅ Task Completion:
• User completes task directly from email panel
• Task notes auto-populate from email response
• System tracks email→task→outcome chain
```

### **Journey 4: Team Collaboration**
```
👥 Task Assignment:
1. Deal owner assigns task: "Prepare technical demo for Bank of Slovakia"
2. Task assigned to technical team member
3. Assignee sees task in their timeline with full deal context
4. Completes task → uploads demo materials to deal documents
5. Deal owner gets notification: "Demo materials ready"

🔄 Handoff Management:
• Tasks bridge between team members
• Context never lost during handoffs
• Timeline shows who did what when
```

### **Journey 5: AI-Powered Task Management**
```
🤖 Smart Suggestions:
1. User asks AI: "What should I focus on today?"
2. AI analyzes deals + creates prioritized task list
3. "High priority: Follow up with ORVIL (€90K deal, 3 days since last contact)"
4. User accepts suggestion → task created with context
5. AI monitors progress → suggests next actions

💡 Proactive Automation:
• "Deal closing in 2 weeks, no recent activity - create reminder task?"
• "Contract sent 5 days ago - create follow-up task?"
• "Meeting completed - create summary task?"
```

### **Journey 6: Pipeline Review Workflow**
```
📈 Weekly Pipeline Review:
1. Manager opens pipeline view
2. Sees deals with overdue tasks highlighted
3. Clicks deal → timeline shows task bottlenecks
4. Creates team tasks: "All hands: Update Q4 forecasts"
5. Assigns bulk tasks across multiple deals

🎯 Performance Tracking:
• Task completion rates by deal stage
• Time from task creation to completion
• Task types that correlate with closed deals
```

### **Journey 7: Mobile/Quick Actions**
```
📱 On-the-Go Productivity:
1. User gets notification: "Task due in 1 hour: Call ORVIL"
2. Clicks notification → opens deal context
3. Makes call using phone integration
4. Quick update: "Left voicemail, CEO in meetings"
5. Reschedules task: "Follow up tomorrow 2 PM"

⚡ Rapid Task Creation:
• Voice note → AI creates task with context
• Photo of business card → creates follow-up task
• Quick capture without losing business context
```

### **Journey 8: Meeting-to-Task Workflow**
```
🤝 Post-Meeting Action Items:
1. Meeting ends in Google Calendar
2. User opens deal timeline → sees completed meeting
3. Clicks "Add Action Items" 
4. Creates multiple tasks from meeting outcomes:
   • "Send pricing proposal by Wednesday"
   • "Schedule technical demo next week"
   • "Research enterprise pricing options"
5. Tasks auto-inherit meeting context + attendees

📝 Meeting Documentation:
• Tasks become the "action trail" from meetings
• Easy to see what was promised and when
• Follow-up meetings reference previous action items
```

---

## 🏗️ **System Architecture**

### **Database Schema**
```sql
-- Core Tasks Table
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  
  -- Task Classification
  type task_type_enum NOT NULL DEFAULT 'follow_up',
  status task_status_enum NOT NULL DEFAULT 'pending',
  priority task_priority_enum NOT NULL DEFAULT 'medium',
  
  -- Timing
  due_date TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  estimated_duration INTERVAL,
  
  -- User Assignment
  assigned_to_user_id UUID REFERENCES auth.users(id),
  created_by_user_id UUID REFERENCES auth.users(id) NOT NULL,
  
  -- Business Context Links
  deal_id UUID REFERENCES deals(id) ON DELETE CASCADE,
  lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
  person_id UUID REFERENCES people(id) ON DELETE SET NULL,
  organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
  email_thread_id UUID, -- Link to email threads
  calendar_event_id UUID, -- Link to calendar events
  
  -- Metadata
  notes TEXT,
  tags TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Task Types
CREATE TYPE task_type_enum AS ENUM (
  'follow_up',
  'preparation', 
  'deadline',
  'internal',
  'research',
  'administrative',
  'email',
  'call',
  'meeting_prep',
  'post_meeting'
);

-- Task Status
CREATE TYPE task_status_enum AS ENUM (
  'pending',
  'in_progress',
  'completed',
  'cancelled',
  'waiting'
);

-- Task Priority
CREATE TYPE task_priority_enum AS ENUM (
  'low',
  'medium',
  'high',
  'urgent'
);

-- RLS Policies
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Users can see tasks assigned to them or created by them
CREATE POLICY "users_own_tasks" ON tasks
  FOR ALL USING (
    assigned_to_user_id = auth.uid() OR 
    created_by_user_id = auth.uid()
  );

-- Users can see tasks related to deals they have access to
CREATE POLICY "users_deal_tasks" ON tasks
  FOR SELECT USING (
    deal_id IN (
      SELECT id FROM deals 
      WHERE assigned_to = auth.uid() OR created_by = auth.uid()
    )
  );
```

### **GraphQL Schema**
```graphql
type Task {
  id: ID!
  title: String!
  description: String
  type: TaskType!
  status: TaskStatus!
  priority: TaskPriority!
  dueDate: DateTime
  completedAt: DateTime
  estimatedDuration: Int # minutes
  
  # Users
  assignedToUser: UserProfile
  createdByUser: UserProfile!
  
  # Business Context
  deal: Deal
  lead: Lead
  person: Person
  organization: Organization
  emailThreadId: String
  calendarEventId: String
  
  # Metadata
  notes: String
  tags: [String!]
  createdAt: DateTime!
  updatedAt: DateTime!
}

enum TaskType {
  FOLLOW_UP
  PREPARATION
  DEADLINE
  INTERNAL
  RESEARCH
  ADMINISTRATIVE
  EMAIL
  CALL
  MEETING_PREP
  POST_MEETING
}

enum TaskStatus {
  PENDING
  IN_PROGRESS
  COMPLETED
  CANCELLED
  WAITING
}

enum TaskPriority {
  LOW
  MEDIUM
  HIGH
  URGENT
}

input CreateTaskInput {
  title: String!
  description: String
  type: TaskType!
  priority: TaskPriority
  dueDate: DateTime
  estimatedDuration: Int
  assignedToUserId: ID
  dealId: ID
  leadId: ID
  personId: ID
  organizationId: ID
  emailThreadId: String
  calendarEventId: String
  notes: String
  tags: [String!]
}

input UpdateTaskInput {
  title: String
  description: String
  type: TaskType
  status: TaskStatus
  priority: TaskPriority
  dueDate: DateTime
  completedAt: DateTime
  estimatedDuration: Int
  assignedToUserId: ID
  notes: String
  tags: [String!]
}

type Query {
  # Get tasks with filtering
  tasks(
    status: TaskStatus
    assignedToUserId: ID
    dealId: ID
    leadId: ID
    dueBefore: DateTime
    dueAfter: DateTime
    limit: Int
    offset: Int
  ): [Task!]!
  
  # Get single task
  task(id: ID!): Task
  
  # Get tasks for timeline (mixed with calendar events)
  timelineTasks(
    dealId: ID
    startDate: DateTime
    endDate: DateTime
  ): [Task!]!
  
  # Get user's daily tasks
  myDailyTasks(date: DateTime): [Task!]!
}

type Mutation {
  createTask(input: CreateTaskInput!): Task!
  updateTask(id: ID!, input: UpdateTaskInput!): Task!
  deleteTask(id: ID!): Boolean!
  
  # Quick actions
  completeTask(id: ID!, notes: String): Task!
  rescheduleTask(id: ID!, newDueDate: DateTime!): Task!
  reassignTask(id: ID!, newAssigneeId: ID!): Task!
  
  # Bulk operations
  bulkUpdateTasks(ids: [ID!]!, input: UpdateTaskInput!): [Task!]!
  createTasksFromTemplate(templateId: ID!, contextId: ID!): [Task!]!
}
```

---

## 📋 **Implementation Plan**

### **Phase 1: Core Foundation (Week 1-2)**

#### **Step 1.1: Database Setup**
- [ ] Create tasks table migration
- [ ] Add enums for task types, status, priority
- [ ] Set up RLS policies
- [ ] Create indexes for performance

#### **Step 1.2: Backend Services**
- [ ] Create `taskService.ts` with CRUD operations
- [ ] Add GraphQL schema for tasks
- [ ] Create task resolvers (queries + mutations)
- [ ] Add task permissions integration

#### **Step 1.3: Basic Frontend Components**
- [ ] `TaskCard.tsx` - Display individual tasks
- [ ] `CreateTaskModal.tsx` - Task creation form
- [ ] `TaskList.tsx` - List of tasks with filtering
- [ ] Basic task status updates (complete/incomplete)

#### **Step 1.4: Timeline Integration**
- [ ] Modify `DealTimelinePanel.tsx` to include tasks
- [ ] Update timeline queries to fetch both events and tasks
- [ ] Integrate task cards into timeline sections
- [ ] Task/event sorting and categorization

### **Phase 2: Smart Features (Week 3-4)**

#### **Step 2.1: Enhanced Task Creation**
- [ ] Quick task creation from deal detail pages
- [ ] Context-aware task suggestions
- [ ] Task templates for common scenarios
- [ ] Auto-linking to business objects

#### **Step 2.2: Task Management Features**
- [ ] Task assignment and reassignment
- [ ] Due date management with smart defaults
- [ ] Task priority visualization
- [ ] Bulk task operations

#### **Step 2.3: Integration Points**
- [ ] Enhanced email-to-task conversion
- [ ] Meeting-to-task creation workflow
- [ ] Task notifications and reminders
- [ ] Mobile-friendly task interactions

### **Phase 3: Automation & Intelligence (Week 5-6)**

#### **Step 3.1: AI Integration**
- [ ] Add task tools to AI Agent V2
- [ ] Smart task suggestions based on deal state
- [ ] Automated task creation from business events
- [ ] Task priority scoring based on deal value

#### **Step 3.2: Workflow Automation**
- [ ] Stage-change task triggers
- [ ] Overdue task escalation
- [ ] Task completion workflows
- [ ] Team collaboration features

#### **Step 3.3: Analytics & Reporting**
- [ ] Task completion metrics
- [ ] Team productivity dashboards
- [ ] Task-to-deal-closure correlation
- [ ] Performance insights

### **Phase 4: Advanced Features (Week 7-8)**

#### **Step 4.1: Advanced UI/UX**
- [ ] Drag-and-drop task rescheduling
- [ ] Kanban-style task boards
- [ ] Advanced filtering and search
- [ ] Keyboard shortcuts and quick actions

#### **Step 4.2: Integrations**
- [ ] Calendar sync for task due dates
- [ ] Email integration for task updates
- [ ] Mobile push notifications
- [ ] Third-party tool integrations

#### **Step 4.3: Enterprise Features**
- [ ] Task templates and workflows
- [ ] Department-specific task types
- [ ] Advanced reporting and analytics
- [ ] API for external integrations

---

## 🎯 **Success Metrics**

### **User Adoption:**
- Task creation rate per user per day
- Task completion rate (target: >80%)
- Time from task creation to completion
- User retention after task feature introduction

### **Business Impact:**
- Deal velocity improvement with task usage
- Correlation between task completion and deal closure
- Team collaboration efficiency
- Customer touchpoint frequency increase

### **Technical Performance:**
- Task creation speed (<500ms)
- Timeline load time with tasks
- Mobile task interaction performance
- System reliability (99.9% uptime)

---

## 🚀 **Getting Started**

Let's begin with **Phase 1.1: Database Setup** and create the foundation for our internal task system. The implementation will follow PipeCD's established patterns while introducing powerful new capabilities for business task management.

**Next Steps:**
1. Create tasks table migration
2. Set up basic task service
3. Build core UI components
4. Integrate with existing timeline

This system will transform how users manage business actions, making PipeCD the single source of truth for both relationship data AND the tasks that drive those relationships forward! 🎪 