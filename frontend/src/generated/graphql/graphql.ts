export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = {
  [K in keyof T]: T[K];
};
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & {
  [SubKey in K]?: Maybe<T[SubKey]>;
};
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & {
  [SubKey in K]: Maybe<T[SubKey]>;
};
export type MakeEmpty<
  T extends { [key: string]: unknown },
  K extends keyof T,
> = { [_ in K]?: never };
export type Incremental<T> =
  | T
  | {
      [P in keyof T]?: P extends " $fragmentName" | "__typename" ? T[P] : never;
    };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string };
  String: { input: string; output: string };
  Boolean: { input: boolean; output: boolean };
  Int: { input: number; output: number };
  Float: { input: number; output: number };
  Date: { input: string; output: string };
  DateTime: { input: string; output: string };
  JSON: { input: Record<string, any>; output: Record<string, any> };
};

export type AiGeneratedTaskContent = {
  __typename?: "AIGeneratedTaskContent";
  confidence: Scalars["Float"]["output"];
  description: Scalars["String"]["output"];
  emailScope: Scalars["String"]["output"];
  sourceContent: Scalars["String"]["output"];
  subject: Scalars["String"]["output"];
  suggestedDueDate?: Maybe<Scalars["String"]["output"]>;
};

export type AccountPortfolioStats = {
  __typename?: "AccountPortfolioStats";
  accountsNeedingAttention: Scalars["Int"]["output"];
  activeDealCount: Scalars["Int"]["output"];
  totalAccounts: Scalars["Int"]["output"];
  totalDealValue: Scalars["Float"]["output"];
};

export type AgentConfig = {
  __typename?: "AgentConfig";
  autoExecute: Scalars["Boolean"]["output"];
  enableExtendedThinking: Scalars["Boolean"]["output"];
  maxClarifyingQuestions: Scalars["Int"]["output"];
  maxThinkingSteps: Scalars["Int"]["output"];
  thinkingBudget: ThinkingBudget;
};

export type AgentConfigInput = {
  autoExecute?: InputMaybe<Scalars["Boolean"]["input"]>;
  enableExtendedThinking?: InputMaybe<Scalars["Boolean"]["input"]>;
  maxClarifyingQuestions?: InputMaybe<Scalars["Int"]["input"]>;
  maxThinkingSteps?: InputMaybe<Scalars["Int"]["input"]>;
  thinkingBudget?: InputMaybe<ThinkingBudget>;
};

export type AgentConversation = {
  __typename?: "AgentConversation";
  agentVersion: Scalars["String"]["output"];
  context: Scalars["JSON"]["output"];
  createdAt: Scalars["DateTime"]["output"];
  id: Scalars["ID"]["output"];
  messages: Array<AgentMessage>;
  plan?: Maybe<AgentPlan>;
  updatedAt: Scalars["DateTime"]["output"];
  userId: Scalars["ID"]["output"];
};

export type AgentMessage = {
  __typename?: "AgentMessage";
  content: Scalars["String"]["output"];
  role: Scalars["String"]["output"];
  thoughts?: Maybe<Array<AgentThought>>;
  timestamp: Scalars["DateTime"]["output"];
};

export type AgentPlan = {
  __typename?: "AgentPlan";
  context: Scalars["JSON"]["output"];
  goal: Scalars["String"]["output"];
  steps: Array<AgentPlanStep>;
};

export type AgentPlanStep = {
  __typename?: "AgentPlanStep";
  dependencies?: Maybe<Array<Scalars["String"]["output"]>>;
  description: Scalars["String"]["output"];
  id: Scalars["String"]["output"];
  parameters?: Maybe<Scalars["JSON"]["output"]>;
  result?: Maybe<Scalars["JSON"]["output"]>;
  status: AgentStepStatus;
  toolName?: Maybe<Scalars["String"]["output"]>;
};

export type AgentPlanStepInput = {
  dependencies?: InputMaybe<Array<Scalars["String"]["input"]>>;
  description: Scalars["String"]["input"];
  parameters?: InputMaybe<Scalars["JSON"]["input"]>;
  toolName?: InputMaybe<Scalars["String"]["input"]>;
};

export type AgentResponse = {
  __typename?: "AgentResponse";
  conversation: AgentConversation;
  message: AgentMessage;
  plan?: Maybe<AgentPlan>;
  thoughts: Array<AgentThought>;
};

export enum AgentStepStatus {
  Completed = "COMPLETED",
  Failed = "FAILED",
  InProgress = "IN_PROGRESS",
  Pending = "PENDING",
}

export type AgentThought = {
  __typename?: "AgentThought";
  concerns?: Maybe<Scalars["String"]["output"]>;
  content: Scalars["String"]["output"];
  conversationId: Scalars["ID"]["output"];
  id: Scalars["ID"]["output"];
  metadata: Scalars["JSON"]["output"];
  nextSteps?: Maybe<Scalars["String"]["output"]>;
  reasoning?: Maybe<Scalars["String"]["output"]>;
  reflectionData: Scalars["JSON"]["output"];
  strategy?: Maybe<Scalars["String"]["output"]>;
  thinkingBudget?: Maybe<ThinkingBudget>;
  timestamp: Scalars["DateTime"]["output"];
  type: AgentThoughtType;
};

export type AgentThoughtInput = {
  content: Scalars["String"]["input"];
  metadata?: InputMaybe<Scalars["JSON"]["input"]>;
  type: AgentThoughtType;
};

export enum AgentThoughtType {
  Observation = "OBSERVATION",
  Plan = "PLAN",
  Question = "QUESTION",
  Reasoning = "REASONING",
  ToolCall = "TOOL_CALL",
}

export type AgentV2Response = {
  __typename?: "AgentV2Response";
  confidenceScore?: Maybe<Scalars["Float"]["output"]>;
  conversation: AgentConversation;
  extendedThoughts: Array<AgentThought>;
  message: AgentMessage;
  planModifications: Array<Scalars["String"]["output"]>;
  reflections: Array<AgentThought>;
  thinkingTime?: Maybe<Scalars["Float"]["output"]>;
  toolExecutions: Array<ToolExecution>;
};

export type AgentV2StreamChunk = {
  __typename?: "AgentV2StreamChunk";
  complete?: Maybe<AgentV2Response>;
  content?: Maybe<Scalars["String"]["output"]>;
  conversationId: Scalars["ID"]["output"];
  error?: Maybe<Scalars["String"]["output"]>;
  thinking?: Maybe<AgentThought>;
  type: AgentV2StreamChunkType;
};

export enum AgentV2StreamChunkType {
  Complete = "COMPLETE",
  Content = "CONTENT",
  Error = "ERROR",
  Thinking = "THINKING",
}

export type AgentV2ThoughtInput = {
  concerns?: InputMaybe<Scalars["String"]["input"]>;
  content: Scalars["String"]["input"];
  nextSteps?: InputMaybe<Scalars["String"]["input"]>;
  reasoning?: InputMaybe<Scalars["String"]["input"]>;
  reflectionData?: InputMaybe<Scalars["JSON"]["input"]>;
  strategy?: InputMaybe<Scalars["String"]["input"]>;
  thinkingBudget?: InputMaybe<ThinkingBudget>;
  type: AgentThoughtType;
};

export type AppSetting = {
  __typename?: "AppSetting";
  createdAt: Scalars["String"]["output"];
  description?: Maybe<Scalars["String"]["output"]>;
  id: Scalars["ID"]["output"];
  isPublic: Scalars["Boolean"]["output"];
  settingKey: Scalars["String"]["output"];
  settingType: Scalars["String"]["output"];
  settingValue?: Maybe<Scalars["JSON"]["output"]>;
  updatedAt: Scalars["String"]["output"];
};

export type AttachDocumentInput = {
  category?: InputMaybe<DocumentCategory>;
  dealId: Scalars["ID"]["input"];
  fileName: Scalars["String"]["input"];
  fileSize?: InputMaybe<Scalars["Int"]["input"]>;
  fileUrl: Scalars["String"]["input"];
  googleFileId: Scalars["String"]["input"];
  mimeType?: InputMaybe<Scalars["String"]["input"]>;
  sharedDriveId?: InputMaybe<Scalars["String"]["input"]>;
};

export type AttachDocumentToNoteInput = {
  category?: InputMaybe<DocumentCategory>;
  dealId: Scalars["ID"]["input"];
  fileName: Scalars["String"]["input"];
  fileSize?: InputMaybe<Scalars["Int"]["input"]>;
  fileUrl: Scalars["String"]["input"];
  googleFileId: Scalars["String"]["input"];
  mimeType?: InputMaybe<Scalars["String"]["input"]>;
  noteId: Scalars["ID"]["input"];
  sharedDriveId?: InputMaybe<Scalars["String"]["input"]>;
};

export type AttachFileInput = {
  category?: InputMaybe<DocumentCategory>;
  dealId: Scalars["ID"]["input"];
  fileId: Scalars["String"]["input"];
};

export type AvailabilitySlot = {
  __typename?: "AvailabilitySlot";
  available: Scalars["Boolean"]["output"];
  end: Scalars["DateTime"]["output"];
  start: Scalars["DateTime"]["output"];
};

export type BulkTaskUpdatesInput = {
  assignedToUserId?: InputMaybe<Scalars["ID"]["input"]>;
  dueDate?: InputMaybe<Scalars["DateTime"]["input"]>;
  priority?: InputMaybe<TaskPriority>;
  status?: InputMaybe<TaskStatus>;
  tags?: InputMaybe<Array<Scalars["String"]["input"]>>;
};

export type BusinessRule = {
  __typename?: "BusinessRule";
  actions: Array<RuleAction>;
  conditions: Array<RuleCondition>;
  createdAt: Scalars["DateTime"]["output"];
  createdBy?: Maybe<User>;
  description?: Maybe<Scalars["String"]["output"]>;
  entityType: EntityTypeEnum;
  executionCount: Scalars["Int"]["output"];
  id: Scalars["ID"]["output"];
  lastError?: Maybe<Scalars["String"]["output"]>;
  lastExecution?: Maybe<Scalars["DateTime"]["output"]>;
  name: Scalars["String"]["output"];
  status: RuleStatusEnum;
  triggerEvents: Array<Scalars["String"]["output"]>;
  triggerFields: Array<Scalars["String"]["output"]>;
  triggerType: TriggerTypeEnum;
  updatedAt: Scalars["DateTime"]["output"];
  wfmStatus?: Maybe<WfmStatus>;
  wfmStep?: Maybe<WfmWorkflowStep>;
  wfmWorkflow?: Maybe<WfmWorkflow>;
};

export type BusinessRuleAnalytics = {
  __typename?: "BusinessRuleAnalytics";
  activeRules: Scalars["Int"]["output"];
  averageExecutionTime: Scalars["Float"]["output"];
  errorRate: Scalars["Float"]["output"];
  recentErrors: Array<Scalars["String"]["output"]>;
  topPerformingRules: Array<BusinessRule>;
  totalExecutions: Scalars["Int"]["output"];
  totalNotifications: Scalars["Int"]["output"];
  totalRules: Scalars["Int"]["output"];
};

export type BusinessRuleExecutionResult = {
  __typename?: "BusinessRuleExecutionResult";
  activitiesCreated: Scalars["Int"]["output"];
  errors: Array<Scalars["String"]["output"]>;
  notificationsCreated: Scalars["Int"]["output"];
  rulesProcessed: Scalars["Int"]["output"];
  tasksCreated: Scalars["Int"]["output"];
};

export type BusinessRuleFilters = {
  entityType?: InputMaybe<EntityTypeEnum>;
  search?: InputMaybe<Scalars["String"]["input"]>;
  status?: InputMaybe<RuleStatusEnum>;
  triggerType?: InputMaybe<TriggerTypeEnum>;
};

export type BusinessRuleInput = {
  actions: Array<RuleActionInput>;
  conditions: Array<RuleConditionInput>;
  description?: InputMaybe<Scalars["String"]["input"]>;
  entityType: EntityTypeEnum;
  name: Scalars["String"]["input"];
  status?: InputMaybe<RuleStatusEnum>;
  triggerEvents?: InputMaybe<Array<Scalars["String"]["input"]>>;
  triggerFields?: InputMaybe<Array<Scalars["String"]["input"]>>;
  triggerType: TriggerTypeEnum;
  wfmStatusId?: InputMaybe<Scalars["ID"]["input"]>;
  wfmStepId?: InputMaybe<Scalars["ID"]["input"]>;
  wfmWorkflowId?: InputMaybe<Scalars["ID"]["input"]>;
};

export type BusinessRuleNotification = {
  __typename?: "BusinessRuleNotification";
  actedUponAt?: Maybe<Scalars["DateTime"]["output"]>;
  actions?: Maybe<Scalars["JSON"]["output"]>;
  createdAt: Scalars["DateTime"]["output"];
  dismissedAt?: Maybe<Scalars["DateTime"]["output"]>;
  entityId: Scalars["ID"]["output"];
  entityType: EntityTypeEnum;
  id: Scalars["ID"]["output"];
  message?: Maybe<Scalars["String"]["output"]>;
  notificationType: Scalars["String"]["output"];
  priority: Scalars["Int"]["output"];
  readAt?: Maybe<Scalars["DateTime"]["output"]>;
  rule: BusinessRule;
  title: Scalars["String"]["output"];
  user: User;
};

export type BusinessRuleNotificationsConnection = {
  __typename?: "BusinessRuleNotificationsConnection";
  hasNextPage: Scalars["Boolean"]["output"];
  hasPreviousPage: Scalars["Boolean"]["output"];
  nodes: Array<BusinessRuleNotification>;
  totalCount: Scalars["Int"]["output"];
};

export type BusinessRulesConnection = {
  __typename?: "BusinessRulesConnection";
  hasNextPage: Scalars["Boolean"]["output"];
  hasPreviousPage: Scalars["Boolean"]["output"];
  nodes: Array<BusinessRule>;
  totalCount: Scalars["Int"]["output"];
};

export type CrmContextInput = {
  dealId?: InputMaybe<Scalars["ID"]["input"]>;
  entityId: Scalars["ID"]["input"];
  entityType: TaskEntityType;
  leadId?: InputMaybe<Scalars["ID"]["input"]>;
  organizationId?: InputMaybe<Scalars["ID"]["input"]>;
  personId?: InputMaybe<Scalars["ID"]["input"]>;
};

export type CrmEventInput = {
  entityId: Scalars["ID"]["input"];
  entityType: TaskEntityType;
  eventData: Scalars["JSON"]["input"];
  eventType: Scalars["String"]["input"];
};

export type CalendarAttendee = {
  __typename?: "CalendarAttendee";
  displayName?: Maybe<Scalars["String"]["output"]>;
  email: Scalars["String"]["output"];
  responseStatus: CalendarResponseStatus;
};

export type CalendarEvent = {
  __typename?: "CalendarEvent";
  attendees?: Maybe<Array<CalendarAttendee>>;
  createdAt: Scalars["DateTime"]["output"];
  deal?: Maybe<Deal>;
  description?: Maybe<Scalars["String"]["output"]>;
  endTime: Scalars["DateTime"]["output"];
  eventType: CalendarEventType;
  googleCalendarId: Scalars["String"]["output"];
  googleEventId: Scalars["String"]["output"];
  googleMeetLink?: Maybe<Scalars["String"]["output"]>;
  id: Scalars["ID"]["output"];
  isAllDay: Scalars["Boolean"]["output"];
  isCancelled: Scalars["Boolean"]["output"];
  lastSyncedAt?: Maybe<Scalars["DateTime"]["output"]>;
  location?: Maybe<Scalars["String"]["output"]>;
  nextActions?: Maybe<Array<Scalars["String"]["output"]>>;
  organization?: Maybe<Organization>;
  outcome?: Maybe<CalendarEventOutcome>;
  outcomeNotes?: Maybe<Scalars["String"]["output"]>;
  person?: Maybe<Person>;
  startTime: Scalars["DateTime"]["output"];
  timezone: Scalars["String"]["output"];
  title: Scalars["String"]["output"];
  updatedAt: Scalars["DateTime"]["output"];
};

export enum CalendarEventOutcome {
  Cancelled = "CANCELLED",
  Completed = "COMPLETED",
  NoShow = "NO_SHOW",
  Rescheduled = "RESCHEDULED",
}

export enum CalendarEventType {
  Call = "CALL",
  CheckIn = "CHECK_IN",
  ContractReview = "CONTRACT_REVIEW",
  Demo = "DEMO",
  FollowUp = "FOLLOW_UP",
  Internal = "INTERNAL",
  Meeting = "MEETING",
  ProposalPresentation = "PROPOSAL_PRESENTATION",
}

export type CalendarPreferences = {
  __typename?: "CalendarPreferences";
  autoAddDealParticipants: Scalars["Boolean"]["output"];
  autoAddGoogleMeet: Scalars["Boolean"]["output"];
  autoSyncEnabled: Scalars["Boolean"]["output"];
  businessCalendarId?: Maybe<Scalars["String"]["output"]>;
  createdAt: Scalars["DateTime"]["output"];
  defaultBufferTime: Scalars["Int"]["output"];
  defaultLocation: Scalars["String"]["output"];
  defaultMeetingDuration: Scalars["Int"]["output"];
  id: Scalars["ID"]["output"];
  includeDealContext: Scalars["Boolean"]["output"];
  primaryCalendarId?: Maybe<Scalars["String"]["output"]>;
  reminderPreferences: Scalars["JSON"]["output"];
  syncFutureDays: Scalars["Int"]["output"];
  syncPastDays: Scalars["Int"]["output"];
  updatedAt: Scalars["DateTime"]["output"];
  workingHours: Scalars["JSON"]["output"];
};

export type CalendarPreferencesInput = {
  autoAddDealParticipants?: InputMaybe<Scalars["Boolean"]["input"]>;
  autoAddGoogleMeet?: InputMaybe<Scalars["Boolean"]["input"]>;
  autoSyncEnabled?: InputMaybe<Scalars["Boolean"]["input"]>;
  businessCalendarId?: InputMaybe<Scalars["String"]["input"]>;
  defaultBufferTime?: InputMaybe<Scalars["Int"]["input"]>;
  defaultLocation?: InputMaybe<Scalars["String"]["input"]>;
  defaultMeetingDuration?: InputMaybe<Scalars["Int"]["input"]>;
  includeDealContext?: InputMaybe<Scalars["Boolean"]["input"]>;
  primaryCalendarId?: InputMaybe<Scalars["String"]["input"]>;
  reminderPreferences?: InputMaybe<Scalars["JSON"]["input"]>;
  syncFutureDays?: InputMaybe<Scalars["Int"]["input"]>;
  syncPastDays?: InputMaybe<Scalars["Int"]["input"]>;
  workingHours?: InputMaybe<Scalars["JSON"]["input"]>;
};

export type CalendarReminderInput = {
  method: CalendarReminderMethod;
  minutes: Scalars["Int"]["input"];
};

export enum CalendarReminderMethod {
  Email = "EMAIL",
  Popup = "POPUP",
}

export enum CalendarResponseStatus {
  Accepted = "ACCEPTED",
  Declined = "DECLINED",
  NeedsAction = "NEEDS_ACTION",
  Tentative = "TENTATIVE",
}

export enum CalendarSyncAction {
  AddCrmContext = "ADD_CRM_CONTEXT",
  CreateEvent = "CREATE_EVENT",
  DeleteEvent = "DELETE_EVENT",
  FullSync = "FULL_SYNC",
  IncrementalSync = "INCREMENTAL_SYNC",
  UpdateEvent = "UPDATE_EVENT",
}

export type CalendarSyncStatus = {
  __typename?: "CalendarSyncStatus";
  errorMessage?: Maybe<Scalars["String"]["output"]>;
  eventsCount: Scalars["Int"]["output"];
  hasSyncErrors: Scalars["Boolean"]["output"];
  isConnected: Scalars["Boolean"]["output"];
  lastSyncAt?: Maybe<Scalars["DateTime"]["output"]>;
  nextSyncAt?: Maybe<Scalars["DateTime"]["output"]>;
  syncDuration?: Maybe<Scalars["Int"]["output"]>;
};

export type CalendarTimeRangeInput = {
  end: Scalars["DateTime"]["input"];
  start: Scalars["DateTime"]["input"];
};

export type ComposeEmailInput = {
  attachments?: InputMaybe<Array<EmailAttachmentInput>>;
  bcc?: InputMaybe<Array<Scalars["String"]["input"]>>;
  body: Scalars["String"]["input"];
  cc?: InputMaybe<Array<Scalars["String"]["input"]>>;
  dealId?: InputMaybe<Scalars["String"]["input"]>;
  entityId?: InputMaybe<Scalars["String"]["input"]>;
  entityType?: InputMaybe<Scalars["String"]["input"]>;
  subject: Scalars["String"]["input"];
  threadId?: InputMaybe<Scalars["String"]["input"]>;
  to: Array<Scalars["String"]["input"]>;
};

export type ConnectGoogleIntegrationInput = {
  tokenData: GoogleTokenInput;
};

export enum ContactRoleType {
  Cc = "CC",
  Participant = "PARTICIPANT",
  Primary = "PRIMARY",
}

export enum ContactScopeType {
  All = "ALL",
  Custom = "CUSTOM",
  Primary = "PRIMARY",
  SelectedRoles = "SELECTED_ROLES",
}

export type ContactSuggestion = {
  __typename?: "ContactSuggestion";
  email: Scalars["String"]["output"];
  name?: Maybe<Scalars["String"]["output"]>;
  photoUrl?: Maybe<Scalars["String"]["output"]>;
};

export type ContextualTaskCreationInput = {
  assignedToUserId?: InputMaybe<Scalars["ID"]["input"]>;
  dealId?: InputMaybe<Scalars["ID"]["input"]>;
  description?: InputMaybe<Scalars["String"]["input"]>;
  dueDate?: InputMaybe<Scalars["DateTime"]["input"]>;
  leadId?: InputMaybe<Scalars["ID"]["input"]>;
  organizationId?: InputMaybe<Scalars["ID"]["input"]>;
  personId?: InputMaybe<Scalars["ID"]["input"]>;
  priority?: InputMaybe<TaskPriority>;
  taskType: TaskType;
  templateId?: InputMaybe<Scalars["ID"]["input"]>;
  title: Scalars["String"]["input"];
};

export type ConversionHistory = {
  __typename?: "ConversionHistory";
  conversionData?: Maybe<Scalars["JSON"]["output"]>;
  conversionReason?: Maybe<ConversionReason>;
  conversionType: ConversionType;
  convertedAt: Scalars["DateTime"]["output"];
  convertedByUser?: Maybe<User>;
  createdAt: Scalars["DateTime"]["output"];
  id: Scalars["ID"]["output"];
  sourceEntityId: Scalars["ID"]["output"];
  sourceEntityType: Scalars["String"]["output"];
  targetEntityId: Scalars["ID"]["output"];
  targetEntityType: Scalars["String"]["output"];
  wfmTransitionPlan?: Maybe<Scalars["JSON"]["output"]>;
};

export enum ConversionReason {
  BudgetConstraints = "BUDGET_CONSTRAINTS",
  CompetitiveLoss = "COMPETITIVE_LOSS",
  Cooling = "COOLING",
  DemoScheduled = "DEMO_SCHEDULED",
  HotLead = "HOT_LEAD",
  Qualified = "QUALIFIED",
  RelationshipReset = "RELATIONSHIP_RESET",
  RequirementsChange = "REQUIREMENTS_CHANGE",
  StakeholderChange = "STAKEHOLDER_CHANGE",
  TimelineExtended = "TIMELINE_EXTENDED",
  Budget = "budget",
  Competition = "competition",
  Nurture = "nurture",
  Other = "other",
  Requirements = "requirements",
  Timing = "timing",
  Unqualified = "unqualified",
}

export type ConversionResult = {
  __typename?: "ConversionResult";
  convertedAmount: Scalars["Float"]["output"];
  convertedCurrency: Scalars["String"]["output"];
  effectiveDate: Scalars["String"]["output"];
  exchangeRate: Scalars["Float"]["output"];
  formattedConverted: Scalars["String"]["output"];
  formattedOriginal: Scalars["String"]["output"];
  originalAmount: Scalars["Float"]["output"];
  originalCurrency: Scalars["String"]["output"];
};

export enum ConversionType {
  DealToLead = "DEAL_TO_LEAD",
  LeadToDeal = "LEAD_TO_DEAL",
}

export type ConversionValidationResult = {
  __typename?: "ConversionValidationResult";
  canProceed: Scalars["Boolean"]["output"];
  errors?: Maybe<Array<Scalars["String"]["output"]>>;
  isValid: Scalars["Boolean"]["output"];
  sourceEntity?: Maybe<Scalars["JSON"]["output"]>;
  warnings?: Maybe<Array<Scalars["String"]["output"]>>;
};

export type ConvertedEntities = {
  __typename?: "ConvertedEntities";
  deal?: Maybe<Deal>;
  organization?: Maybe<Organization>;
  person?: Maybe<Person>;
};

export type CreateAgentV2ConversationInput = {
  initialContext?: InputMaybe<Scalars["JSON"]["input"]>;
};

export type CreateCalendarEventInput = {
  addGoogleMeet?: InputMaybe<Scalars["Boolean"]["input"]>;
  attendeeEmails?: InputMaybe<Array<Scalars["String"]["input"]>>;
  calendarId?: InputMaybe<Scalars["String"]["input"]>;
  dealId?: InputMaybe<Scalars["ID"]["input"]>;
  description?: InputMaybe<Scalars["String"]["input"]>;
  endDateTime: Scalars["DateTime"]["input"];
  eventType?: InputMaybe<CalendarEventType>;
  location?: InputMaybe<Scalars["String"]["input"]>;
  organizationId?: InputMaybe<Scalars["ID"]["input"]>;
  personId?: InputMaybe<Scalars["ID"]["input"]>;
  reminders?: InputMaybe<Array<CalendarReminderInput>>;
  startDateTime: Scalars["DateTime"]["input"];
  timezone?: InputMaybe<Scalars["String"]["input"]>;
  title: Scalars["String"]["input"];
};

export type CreateContactFromEmailInput = {
  addAsDealParticipant?: InputMaybe<Scalars["Boolean"]["input"]>;
  dealId?: InputMaybe<Scalars["String"]["input"]>;
  emailAddress: Scalars["String"]["input"];
  emailId: Scalars["String"]["input"];
  firstName?: InputMaybe<Scalars["String"]["input"]>;
  lastName?: InputMaybe<Scalars["String"]["input"]>;
  notes?: InputMaybe<Scalars["String"]["input"]>;
  organizationId?: InputMaybe<Scalars["ID"]["input"]>;
};

export type CreateCurrencyInput = {
  code: Scalars["String"]["input"];
  decimalPlaces?: InputMaybe<Scalars["Int"]["input"]>;
  isActive?: InputMaybe<Scalars["Boolean"]["input"]>;
  name: Scalars["String"]["input"];
  symbol: Scalars["String"]["input"];
};

export type CreateDealFolderInput = {
  dealId: Scalars["ID"]["input"];
  dealName: Scalars["String"]["input"];
  parentFolderId?: InputMaybe<Scalars["String"]["input"]>;
  templateStructure?: InputMaybe<Scalars["Boolean"]["input"]>;
};

export type CreateDocumentInput = {
  entityId: Scalars["ID"]["input"];
  entityType: EntityType;
  fileName: Scalars["String"]["input"];
  fileSizeBytes?: InputMaybe<Scalars["Int"]["input"]>;
  googleDriveFileId?: InputMaybe<Scalars["String"]["input"]>;
  mimeType?: InputMaybe<Scalars["String"]["input"]>;
};

export type CreateEmailInput = {
  bccEmails?: InputMaybe<Array<Scalars["String"]["input"]>>;
  bodyPreview?: InputMaybe<Scalars["String"]["input"]>;
  ccEmails?: InputMaybe<Array<Scalars["String"]["input"]>>;
  entityId?: InputMaybe<Scalars["ID"]["input"]>;
  entityType?: InputMaybe<EntityType>;
  fromEmail: Scalars["String"]["input"];
  fullBody?: InputMaybe<Scalars["String"]["input"]>;
  gmailLabels?: InputMaybe<Array<Scalars["String"]["input"]>>;
  gmailMessageId?: InputMaybe<Scalars["String"]["input"]>;
  gmailThreadId?: InputMaybe<Scalars["String"]["input"]>;
  hasAttachments: Scalars["Boolean"]["input"];
  isOutbound: Scalars["Boolean"]["input"];
  isRead: Scalars["Boolean"]["input"];
  sentAt: Scalars["DateTime"]["input"];
  subject: Scalars["String"]["input"];
  toEmails: Array<Scalars["String"]["input"]>;
};

export type CreateStickerInput = {
  categoryId?: InputMaybe<Scalars["ID"]["input"]>;
  color?: InputMaybe<Scalars["String"]["input"]>;
  content?: InputMaybe<Scalars["String"]["input"]>;
  entityId: Scalars["ID"]["input"];
  entityType: EntityType;
  height?: InputMaybe<Scalars["Int"]["input"]>;
  isPinned?: InputMaybe<Scalars["Boolean"]["input"]>;
  isPrivate?: InputMaybe<Scalars["Boolean"]["input"]>;
  mentions?: InputMaybe<Array<Scalars["ID"]["input"]>>;
  positionX?: InputMaybe<Scalars["Int"]["input"]>;
  positionY?: InputMaybe<Scalars["Int"]["input"]>;
  priority?: InputMaybe<StickerPriority>;
  tags?: InputMaybe<Array<Scalars["String"]["input"]>>;
  title: Scalars["String"]["input"];
  width?: InputMaybe<Scalars["Int"]["input"]>;
};

export type CreateSystemNotificationInput = {
  actionUrl?: InputMaybe<Scalars["String"]["input"]>;
  entityId?: InputMaybe<Scalars["ID"]["input"]>;
  entityType?: InputMaybe<Scalars["String"]["input"]>;
  expiresAt?: InputMaybe<Scalars["DateTime"]["input"]>;
  message: Scalars["String"]["input"];
  metadata?: InputMaybe<Scalars["JSON"]["input"]>;
  notificationType: SystemNotificationType;
  priority?: InputMaybe<NotificationPriority>;
  title: Scalars["String"]["input"];
  userId: Scalars["ID"]["input"];
};

export type CreateTaskAutomationRuleInput = {
  appliesToEntityType: TaskEntityType;
  description?: InputMaybe<Scalars["String"]["input"]>;
  isActive?: InputMaybe<Scalars["Boolean"]["input"]>;
  name: Scalars["String"]["input"];
  taskTemplate: Scalars["JSON"]["input"];
  triggerConditions: Scalars["JSON"]["input"];
  triggerEvent: Scalars["String"]["input"];
};

export type CreateTaskDependencyInput = {
  dependencyType?: InputMaybe<Scalars["String"]["input"]>;
  dependsOnTaskId: Scalars["ID"]["input"];
  taskId: Scalars["ID"]["input"];
};

export type CreateTaskInput = {
  affectsLeadScoring?: InputMaybe<Scalars["Boolean"]["input"]>;
  assignedToUserId?: InputMaybe<Scalars["ID"]["input"]>;
  blocksStageProgression?: InputMaybe<Scalars["Boolean"]["input"]>;
  completionTriggersStageChange?: InputMaybe<Scalars["Boolean"]["input"]>;
  customFieldValues?: InputMaybe<Array<CustomFieldValueInput>>;
  dealId?: InputMaybe<Scalars["ID"]["input"]>;
  description?: InputMaybe<Scalars["String"]["input"]>;
  dueDate?: InputMaybe<Scalars["DateTime"]["input"]>;
  entityId: Scalars["ID"]["input"];
  entityType: TaskEntityType;
  estimatedHours?: InputMaybe<Scalars["Int"]["input"]>;
  leadId?: InputMaybe<Scalars["ID"]["input"]>;
  organizationId?: InputMaybe<Scalars["ID"]["input"]>;
  parentTaskId?: InputMaybe<Scalars["ID"]["input"]>;
  personId?: InputMaybe<Scalars["ID"]["input"]>;
  priority?: InputMaybe<TaskPriority>;
  requiredForDealClosure?: InputMaybe<Scalars["Boolean"]["input"]>;
  status?: InputMaybe<TaskStatus>;
  tags?: InputMaybe<Array<Scalars["String"]["input"]>>;
  taskType: TaskType;
  title: Scalars["String"]["input"];
  wfmProjectId?: InputMaybe<Scalars["ID"]["input"]>;
};

export type CreateWfmProjectTypeInput = {
  defaultWorkflowId?: InputMaybe<Scalars["ID"]["input"]>;
  description?: InputMaybe<Scalars["String"]["input"]>;
  iconName?: InputMaybe<Scalars["String"]["input"]>;
  name: Scalars["String"]["input"];
};

export type CreateWfmStatusInput = {
  color?: InputMaybe<Scalars["String"]["input"]>;
  description?: InputMaybe<Scalars["String"]["input"]>;
  name: Scalars["String"]["input"];
};

export type CreateWfmWorkflowInput = {
  description?: InputMaybe<Scalars["String"]["input"]>;
  name: Scalars["String"]["input"];
};

export type CreateWfmWorkflowStepInput = {
  isFinalStep?: InputMaybe<Scalars["Boolean"]["input"]>;
  isInitialStep?: InputMaybe<Scalars["Boolean"]["input"]>;
  metadata?: InputMaybe<Scalars["JSON"]["input"]>;
  statusId: Scalars["ID"]["input"];
  stepOrder: Scalars["Int"]["input"];
  workflowId: Scalars["ID"]["input"];
};

export type CreateWfmWorkflowTransitionInput = {
  fromStepId: Scalars["ID"]["input"];
  name?: InputMaybe<Scalars["String"]["input"]>;
  toStepId: Scalars["ID"]["input"];
  workflowId: Scalars["ID"]["input"];
};

export type Currency = {
  __typename?: "Currency";
  code: Scalars["String"]["output"];
  createdAt: Scalars["String"]["output"];
  decimalPlaces: Scalars["Int"]["output"];
  isActive: Scalars["Boolean"]["output"];
  name: Scalars["String"]["output"];
  symbol: Scalars["String"]["output"];
  updatedAt: Scalars["String"]["output"];
};

export type CurrencyAmount = {
  __typename?: "CurrencyAmount";
  amount: Scalars["Float"]["output"];
  currency: Scalars["String"]["output"];
  formattedAmount: Scalars["String"]["output"];
};

export type CurrencyOperationResult = {
  __typename?: "CurrencyOperationResult";
  message: Scalars["String"]["output"];
  success: Scalars["Boolean"]["output"];
};

export type CustomFieldDefinition = {
  __typename?: "CustomFieldDefinition";
  createdAt: Scalars["DateTime"]["output"];
  displayOrder: Scalars["Int"]["output"];
  dropdownOptions?: Maybe<Array<CustomFieldOption>>;
  entityType: CustomFieldEntityType;
  fieldLabel: Scalars["String"]["output"];
  fieldName: Scalars["String"]["output"];
  fieldType: CustomFieldType;
  id: Scalars["ID"]["output"];
  isActive: Scalars["Boolean"]["output"];
  isRequired: Scalars["Boolean"]["output"];
  updatedAt: Scalars["DateTime"]["output"];
};

export type CustomFieldDefinitionInput = {
  displayOrder?: InputMaybe<Scalars["Int"]["input"]>;
  dropdownOptions?: InputMaybe<Array<CustomFieldOptionInput>>;
  entityType: CustomFieldEntityType;
  fieldLabel: Scalars["String"]["input"];
  fieldName: Scalars["String"]["input"];
  fieldType: CustomFieldType;
  isRequired?: InputMaybe<Scalars["Boolean"]["input"]>;
};

export enum CustomFieldEntityType {
  Deal = "DEAL",
  Lead = "LEAD",
  Organization = "ORGANIZATION",
  Person = "PERSON",
}

export type CustomFieldOption = {
  __typename?: "CustomFieldOption";
  label: Scalars["String"]["output"];
  value: Scalars["String"]["output"];
};

export type CustomFieldOptionInput = {
  label: Scalars["String"]["input"];
  value: Scalars["String"]["input"];
};

export enum CustomFieldType {
  Boolean = "BOOLEAN",
  Date = "DATE",
  Dropdown = "DROPDOWN",
  MultiSelect = "MULTI_SELECT",
  Number = "NUMBER",
  Text = "TEXT",
  TextArea = "TEXT_AREA",
  UserMultiselect = "USER_MULTISELECT",
}

export type CustomFieldValue = {
  __typename?: "CustomFieldValue";
  booleanValue?: Maybe<Scalars["Boolean"]["output"]>;
  dateValue?: Maybe<Scalars["DateTime"]["output"]>;
  definition: CustomFieldDefinition;
  numberValue?: Maybe<Scalars["Float"]["output"]>;
  selectedOptionValues?: Maybe<Array<Scalars["String"]["output"]>>;
  stringValue?: Maybe<Scalars["String"]["output"]>;
};

export type CustomFieldValueInput = {
  booleanValue?: InputMaybe<Scalars["Boolean"]["input"]>;
  dateValue?: InputMaybe<Scalars["DateTime"]["input"]>;
  definitionId: Scalars["ID"]["input"];
  numberValue?: InputMaybe<Scalars["Float"]["input"]>;
  selectedOptionValues?: InputMaybe<Array<Scalars["String"]["input"]>>;
  stringValue?: InputMaybe<Scalars["String"]["input"]>;
};

export type Deal = {
  __typename?: "Deal";
  amount?: Maybe<Scalars["Float"]["output"]>;
  amountUsd?: Maybe<Scalars["Float"]["output"]>;
  amount_usd?: Maybe<Scalars["Float"]["output"]>;
  assignedToUser?: Maybe<User>;
  assigned_to_user_id?: Maybe<Scalars["ID"]["output"]>;
  conversionHistory: Array<ConversionHistory>;
  conversionReason?: Maybe<Scalars["String"]["output"]>;
  convertedToLead?: Maybe<Lead>;
  createdBy: User;
  created_at: Scalars["DateTime"]["output"];
  currency?: Maybe<Scalars["String"]["output"]>;
  currentWfmStatus?: Maybe<WfmStatus>;
  currentWfmStep?: Maybe<WfmWorkflowStep>;
  customFieldValues: Array<CustomFieldValue>;
  deal_specific_probability?: Maybe<Scalars["Float"]["output"]>;
  exchangeRateUsed?: Maybe<Scalars["Float"]["output"]>;
  exchange_rate_used?: Maybe<Scalars["Float"]["output"]>;
  expected_close_date?: Maybe<Scalars["DateTime"]["output"]>;
  formattedAmount?: Maybe<Scalars["String"]["output"]>;
  history?: Maybe<Array<DealHistoryEntry>>;
  id: Scalars["ID"]["output"];
  name: Scalars["String"]["output"];
  organization?: Maybe<Organization>;
  organization_id?: Maybe<Scalars["ID"]["output"]>;
  participants: Array<DealParticipant>;
  person?: Maybe<Person>;
  person_id?: Maybe<Scalars["ID"]["output"]>;
  project_id: Scalars["String"]["output"];
  updated_at: Scalars["DateTime"]["output"];
  user_id: Scalars["ID"]["output"];
  weighted_amount?: Maybe<Scalars["Float"]["output"]>;
  wfmProject?: Maybe<WfmProject>;
  wfm_project_id?: Maybe<Scalars["ID"]["output"]>;
};

export type DealHistoryArgs = {
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
};

export type DealDocumentAttachment = {
  __typename?: "DealDocumentAttachment";
  attachedAt: Scalars["String"]["output"];
  attachedBy: Scalars["ID"]["output"];
  category?: Maybe<DocumentCategory>;
  dealId: Scalars["ID"]["output"];
  fileName: Scalars["String"]["output"];
  fileSize?: Maybe<Scalars["Int"]["output"]>;
  fileUrl: Scalars["String"]["output"];
  googleFileId: Scalars["String"]["output"];
  id: Scalars["ID"]["output"];
  mimeType?: Maybe<Scalars["String"]["output"]>;
  sharedDriveId?: Maybe<Scalars["String"]["output"]>;
};

export type DealFolderInfo = {
  __typename?: "DealFolderInfo";
  dealFolder?: Maybe<DriveFolder>;
  exists: Scalars["Boolean"]["output"];
  subfolders?: Maybe<DealSubfolders>;
};

export type DealHistoryEntry = {
  __typename?: "DealHistoryEntry";
  changes?: Maybe<Scalars["JSON"]["output"]>;
  createdAt: Scalars["DateTime"]["output"];
  eventType: Scalars["String"]["output"];
  id: Scalars["ID"]["output"];
  user?: Maybe<User>;
};

export type DealInput = {
  amount?: InputMaybe<Scalars["Float"]["input"]>;
  assignedToUserId?: InputMaybe<Scalars["ID"]["input"]>;
  currency?: InputMaybe<Scalars["String"]["input"]>;
  customFields?: InputMaybe<Array<CustomFieldValueInput>>;
  deal_specific_probability?: InputMaybe<Scalars["Float"]["input"]>;
  expected_close_date?: InputMaybe<Scalars["DateTime"]["input"]>;
  name: Scalars["String"]["input"];
  organization_id?: InputMaybe<Scalars["ID"]["input"]>;
  person_id?: InputMaybe<Scalars["ID"]["input"]>;
  wfmProjectTypeId: Scalars["ID"]["input"];
};

export type DealParticipant = {
  __typename?: "DealParticipant";
  addedFromEmail: Scalars["Boolean"]["output"];
  createdAt: Scalars["DateTime"]["output"];
  createdByUserId: Scalars["ID"]["output"];
  dealId: Scalars["ID"]["output"];
  id: Scalars["ID"]["output"];
  person: Person;
  personId: Scalars["ID"]["output"];
  role: ContactRoleType;
};

export type DealParticipantInput = {
  addedFromEmail?: InputMaybe<Scalars["Boolean"]["input"]>;
  dealId: Scalars["ID"]["input"];
  personId: Scalars["ID"]["input"];
  role?: InputMaybe<ContactRoleType>;
};

export type DealSubfolders = {
  __typename?: "DealSubfolders";
  contracts?: Maybe<DriveFolder>;
  correspondence?: Maybe<DriveFolder>;
  financial?: Maybe<DriveFolder>;
  legal?: Maybe<DriveFolder>;
  other?: Maybe<DriveFolder>;
  presentations?: Maybe<DriveFolder>;
  proposals?: Maybe<DriveFolder>;
  technical?: Maybe<DriveFolder>;
};

export type DealTaskIndicator = {
  __typename?: "DealTaskIndicator";
  dealId: Scalars["ID"]["output"];
  tasksDueToday: Scalars["Int"]["output"];
  tasksOverdue: Scalars["Int"]["output"];
  totalActiveTasks: Scalars["Int"]["output"];
};

export type DealToLeadConversionInput = {
  archiveDeal?: InputMaybe<Scalars["Boolean"]["input"]>;
  conversionReason: ConversionReason;
  createConversionActivity?: InputMaybe<Scalars["Boolean"]["input"]>;
  leadData?: InputMaybe<LeadConversionData>;
  notes?: InputMaybe<Scalars["String"]["input"]>;
  preserveActivities?: InputMaybe<Scalars["Boolean"]["input"]>;
  reactivationPlan?: InputMaybe<ReactivationPlanInput>;
};

export type DealToLeadConversionResult = {
  __typename?: "DealToLeadConversionResult";
  conversionHistory?: Maybe<ConversionHistory>;
  conversionId: Scalars["ID"]["output"];
  errors?: Maybe<Array<Scalars["String"]["output"]>>;
  lead?: Maybe<Lead>;
  message: Scalars["String"]["output"];
  reactivationPlan?: Maybe<ReactivationPlan>;
  success: Scalars["Boolean"]["output"];
};

export type DealUpdateInput = {
  amount?: InputMaybe<Scalars["Float"]["input"]>;
  assignedToUserId?: InputMaybe<Scalars["ID"]["input"]>;
  currency?: InputMaybe<Scalars["String"]["input"]>;
  customFields?: InputMaybe<Array<CustomFieldValueInput>>;
  deal_specific_probability?: InputMaybe<Scalars["Float"]["input"]>;
  expected_close_date?: InputMaybe<Scalars["DateTime"]["input"]>;
  name?: InputMaybe<Scalars["String"]["input"]>;
  organization_id?: InputMaybe<Scalars["ID"]["input"]>;
  person_id?: InputMaybe<Scalars["ID"]["input"]>;
};

export type DealsByCurrencyResult = {
  __typename?: "DealsByCurrencyResult";
  count: Scalars["Int"]["output"];
  currency: Scalars["String"]["output"];
  formattedTotal: Scalars["String"]["output"];
  totalAmount: Scalars["Float"]["output"];
  totalAmountUsd: Scalars["Float"]["output"];
};

export type Document = {
  __typename?: "Document";
  createdAt: Scalars["DateTime"]["output"];
  createdByUser: User;
  entityId: Scalars["ID"]["output"];
  entityType: EntityType;
  fileName: Scalars["String"]["output"];
  fileSizeBytes?: Maybe<Scalars["Int"]["output"]>;
  googleDriveDownloadLink?: Maybe<Scalars["String"]["output"]>;
  googleDriveFileId?: Maybe<Scalars["String"]["output"]>;
  googleDriveFolderId?: Maybe<Scalars["String"]["output"]>;
  googleDriveWebViewLink?: Maybe<Scalars["String"]["output"]>;
  id: Scalars["ID"]["output"];
  isPublic: Scalars["Boolean"]["output"];
  lastSyncedAt?: Maybe<Scalars["DateTime"]["output"]>;
  mimeType?: Maybe<Scalars["String"]["output"]>;
  sharedWithUsers: Array<Scalars["ID"]["output"]>;
  updatedAt: Scalars["DateTime"]["output"];
};

export enum DocumentCategory {
  ClientDocument = "CLIENT_DOCUMENT",
  ClientRequest = "CLIENT_REQUEST",
  Contract = "CONTRACT",
  Correspondence = "CORRESPONDENCE",
  Other = "OTHER",
  Presentation = "PRESENTATION",
  Proposal = "PROPOSAL",
}

export type DriveFile = {
  __typename?: "DriveFile";
  createdTime: Scalars["String"]["output"];
  iconLink?: Maybe<Scalars["String"]["output"]>;
  id: Scalars["ID"]["output"];
  mimeType: Scalars["String"]["output"];
  modifiedTime: Scalars["String"]["output"];
  name: Scalars["String"]["output"];
  owners?: Maybe<Array<DriveFileOwner>>;
  parents?: Maybe<Array<Scalars["String"]["output"]>>;
  size?: Maybe<Scalars["Int"]["output"]>;
  thumbnailLink?: Maybe<Scalars["String"]["output"]>;
  webContentLink?: Maybe<Scalars["String"]["output"]>;
  webViewLink?: Maybe<Scalars["String"]["output"]>;
};

export type DriveFileConnection = {
  __typename?: "DriveFileConnection";
  files: Array<DriveFile>;
  totalCount: Scalars["Int"]["output"];
};

export type DriveFileOwner = {
  __typename?: "DriveFileOwner";
  displayName: Scalars["String"]["output"];
  emailAddress: Scalars["String"]["output"];
};

export type DriveFolder = {
  __typename?: "DriveFolder";
  createdTime: Scalars["String"]["output"];
  id: Scalars["ID"]["output"];
  modifiedTime: Scalars["String"]["output"];
  name: Scalars["String"]["output"];
  parents?: Maybe<Array<Scalars["String"]["output"]>>;
  webViewLink: Scalars["String"]["output"];
};

export type DriveFolderBrowseInput = {
  includeFiles?: InputMaybe<Scalars["Boolean"]["input"]>;
  parentFolderId?: InputMaybe<Scalars["String"]["input"]>;
};

export type DriveFolderConnection = {
  __typename?: "DriveFolderConnection";
  folders: Array<DriveFolder>;
  totalCount: Scalars["Int"]["output"];
};

export type DriveFolderStructure = {
  __typename?: "DriveFolderStructure";
  dealFolder: DriveFolder;
  subfolders: DriveFolderSubfolders;
};

export type DriveFolderSubfolders = {
  __typename?: "DriveFolderSubfolders";
  contracts?: Maybe<DriveFolder>;
  correspondence?: Maybe<DriveFolder>;
  legal?: Maybe<DriveFolder>;
  presentations?: Maybe<DriveFolder>;
  proposals?: Maybe<DriveFolder>;
};

export type DrivePermissionInput = {
  domain?: InputMaybe<Scalars["String"]["input"]>;
  emailAddress?: InputMaybe<Scalars["String"]["input"]>;
  role: DrivePermissionRole;
  type: DrivePermissionType;
};

export enum DrivePermissionRole {
  Commenter = "COMMENTER",
  FileOrganizer = "FILE_ORGANIZER",
  Organizer = "ORGANIZER",
  Owner = "OWNER",
  Reader = "READER",
  Writer = "WRITER",
}

export enum DrivePermissionType {
  Anyone = "ANYONE",
  Domain = "DOMAIN",
  Group = "GROUP",
  User = "USER",
}

export type DriveSearchInput = {
  folderId?: InputMaybe<Scalars["String"]["input"]>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  query?: InputMaybe<Scalars["String"]["input"]>;
};

export type DualAttachmentResponse = {
  __typename?: "DualAttachmentResponse";
  dealAttachment: DealDocumentAttachment;
  noteAttachment: NoteDocumentAttachment;
};

export type Email = {
  __typename?: "Email";
  bccEmails: Array<Scalars["String"]["output"]>;
  bodyPreview?: Maybe<Scalars["String"]["output"]>;
  ccEmails: Array<Scalars["String"]["output"]>;
  createdAt: Scalars["DateTime"]["output"];
  createdByUser: User;
  entityId?: Maybe<Scalars["ID"]["output"]>;
  entityType?: Maybe<EntityType>;
  fromEmail: Scalars["String"]["output"];
  fullBody?: Maybe<Scalars["String"]["output"]>;
  gmailLabels: Array<Scalars["String"]["output"]>;
  gmailMessageId?: Maybe<Scalars["String"]["output"]>;
  gmailThreadId?: Maybe<Scalars["String"]["output"]>;
  hasAttachments: Scalars["Boolean"]["output"];
  id: Scalars["ID"]["output"];
  isOutbound: Scalars["Boolean"]["output"];
  isRead: Scalars["Boolean"]["output"];
  sentAt: Scalars["DateTime"]["output"];
  subject: Scalars["String"]["output"];
  toEmails: Array<Scalars["String"]["output"]>;
  updatedAt: Scalars["DateTime"]["output"];
};

export type EmailActivity = {
  __typename?: "EmailActivity";
  activityType: EmailActivityType;
  createdAt: Scalars["DateTime"]["output"];
  email: Email;
  id: Scalars["ID"]["output"];
  metadata?: Maybe<Scalars["JSON"]["output"]>;
  occurredAt: Scalars["DateTime"]["output"];
};

export enum EmailActivityType {
  ClickedLink = "CLICKED_LINK",
  Delivered = "DELIVERED",
  Forwarded = "FORWARDED",
  Opened = "OPENED",
  Replied = "REPLIED",
  Sent = "SENT",
}

export type EmailAnalytics = {
  __typename?: "EmailAnalytics";
  avgResponseTime?: Maybe<Scalars["String"]["output"]>;
  emailSentiment?: Maybe<Scalars["String"]["output"]>;
  lastContactTime?: Maybe<Scalars["String"]["output"]>;
  responseRate?: Maybe<Scalars["Float"]["output"]>;
  totalThreads: Scalars["Int"]["output"];
  unreadCount: Scalars["Int"]["output"];
};

export type EmailAttachment = {
  __typename?: "EmailAttachment";
  downloadUrl?: Maybe<Scalars["String"]["output"]>;
  filename: Scalars["String"]["output"];
  id: Scalars["ID"]["output"];
  mimeType: Scalars["String"]["output"];
  size: Scalars["Int"]["output"];
};

export type EmailAttachmentInput = {
  content: Scalars["String"]["input"];
  filename: Scalars["String"]["input"];
  mimeType: Scalars["String"]["input"];
};

export enum EmailImportance {
  High = "HIGH",
  Low = "LOW",
  Normal = "NORMAL",
}

export type EmailMessage = {
  __typename?: "EmailMessage";
  attachments?: Maybe<Array<EmailAttachment>>;
  bcc?: Maybe<Array<Scalars["String"]["output"]>>;
  body: Scalars["String"]["output"];
  cc?: Maybe<Array<Scalars["String"]["output"]>>;
  from: Scalars["String"]["output"];
  hasAttachments: Scalars["Boolean"]["output"];
  htmlBody?: Maybe<Scalars["String"]["output"]>;
  id: Scalars["ID"]["output"];
  importance?: Maybe<EmailImportance>;
  isUnread: Scalars["Boolean"]["output"];
  labels?: Maybe<Array<Scalars["String"]["output"]>>;
  subject: Scalars["String"]["output"];
  threadId: Scalars["String"]["output"];
  timestamp: Scalars["String"]["output"];
  to: Array<Scalars["String"]["output"]>;
};

export type EmailPin = {
  __typename?: "EmailPin";
  createdAt: Scalars["DateTime"]["output"];
  dealId: Scalars["ID"]["output"];
  emailId: Scalars["String"]["output"];
  fromEmail?: Maybe<Scalars["String"]["output"]>;
  id: Scalars["ID"]["output"];
  notes?: Maybe<Scalars["String"]["output"]>;
  pinnedAt: Scalars["DateTime"]["output"];
  subject?: Maybe<Scalars["String"]["output"]>;
  threadId: Scalars["String"]["output"];
  updatedAt: Scalars["DateTime"]["output"];
  userId: Scalars["ID"]["output"];
};

export type EmailThread = {
  __typename?: "EmailThread";
  dealId?: Maybe<Scalars["String"]["output"]>;
  entityId?: Maybe<Scalars["String"]["output"]>;
  entityType?: Maybe<Scalars["String"]["output"]>;
  id: Scalars["ID"]["output"];
  isUnread: Scalars["Boolean"]["output"];
  lastActivity: Scalars["String"]["output"];
  latestMessage?: Maybe<EmailMessage>;
  messageCount: Scalars["Int"]["output"];
  participants: Array<Scalars["String"]["output"]>;
  subject: Scalars["String"]["output"];
};

export type EmailThreadConnection = {
  __typename?: "EmailThreadConnection";
  hasNextPage: Scalars["Boolean"]["output"];
  nextPageToken?: Maybe<Scalars["String"]["output"]>;
  threads: Array<EmailThread>;
  totalCount: Scalars["Int"]["output"];
};

export type EmailThreadsFilterInput = {
  contactEmail?: InputMaybe<Scalars["String"]["input"]>;
  contactScope?: InputMaybe<ContactScopeType>;
  dateFrom?: InputMaybe<Scalars["String"]["input"]>;
  dateTo?: InputMaybe<Scalars["String"]["input"]>;
  dealId?: InputMaybe<Scalars["String"]["input"]>;
  hasAttachments?: InputMaybe<Scalars["Boolean"]["input"]>;
  includeAllParticipants?: InputMaybe<Scalars["Boolean"]["input"]>;
  isUnread?: InputMaybe<Scalars["Boolean"]["input"]>;
  keywords?: InputMaybe<Array<Scalars["String"]["input"]>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  pageToken?: InputMaybe<Scalars["String"]["input"]>;
  selectedContacts?: InputMaybe<Array<Scalars["String"]["input"]>>;
};

export enum EntityType {
  Deal = "DEAL",
  Lead = "LEAD",
  Organization = "ORGANIZATION",
  Person = "PERSON",
}

export enum EntityTypeEnum {
  Activity = "ACTIVITY",
  Deal = "DEAL",
  Lead = "LEAD",
  Organization = "ORGANIZATION",
  Person = "PERSON",
  Task = "TASK",
}

export type ExchangeRate = {
  __typename?: "ExchangeRate";
  createdAt: Scalars["String"]["output"];
  effectiveDate: Scalars["String"]["output"];
  fromCurrency: Scalars["String"]["output"];
  id: Scalars["ID"]["output"];
  rate: Scalars["Float"]["output"];
  source: Scalars["String"]["output"];
  toCurrency: Scalars["String"]["output"];
  updatedAt: Scalars["String"]["output"];
};

export type ExtendedThinkingAnalysis = {
  __typename?: "ExtendedThinkingAnalysis";
  identifiedConcerns: Array<Scalars["String"]["output"]>;
  reasoningDepth: Scalars["Float"]["output"];
  recommendedActions: Array<Scalars["String"]["output"]>;
  strategicInsights: Array<Scalars["String"]["output"]>;
  thinkingBudgetUsed: ThinkingBudget;
  totalThoughts: Scalars["Int"]["output"];
};

export type GenerateTaskContentInput = {
  emailId: Scalars["String"]["input"];
  threadId?: InputMaybe<Scalars["String"]["input"]>;
  useWholeThread: Scalars["Boolean"]["input"];
};

export type GoogleCalendar = {
  __typename?: "GoogleCalendar";
  accessRole: Scalars["String"]["output"];
  backgroundColor?: Maybe<Scalars["String"]["output"]>;
  colorId?: Maybe<Scalars["String"]["output"]>;
  description?: Maybe<Scalars["String"]["output"]>;
  foregroundColor?: Maybe<Scalars["String"]["output"]>;
  id: Scalars["String"]["output"];
  primary?: Maybe<Scalars["Boolean"]["output"]>;
  summary: Scalars["String"]["output"];
  timeZone: Scalars["String"]["output"];
};

/** Google Drive specific configuration */
export type GoogleDriveConfig = {
  __typename?: "GoogleDriveConfig";
  auto_create_deal_folders: Scalars["Boolean"]["output"];
  deal_folder_template: Scalars["Boolean"]["output"];
  pipecd_deals_folder_id?: Maybe<Scalars["String"]["output"]>;
};

export type GoogleIntegrationStatus = {
  __typename?: "GoogleIntegrationStatus";
  hasCalendarAccess: Scalars["Boolean"]["output"];
  hasContactsAccess: Scalars["Boolean"]["output"];
  hasDriveAccess: Scalars["Boolean"]["output"];
  hasGmailAccess: Scalars["Boolean"]["output"];
  hasGoogleAuth: Scalars["Boolean"]["output"];
  isConnected: Scalars["Boolean"]["output"];
  missingScopes: Array<Scalars["String"]["output"]>;
  tokenExpiry?: Maybe<Scalars["DateTime"]["output"]>;
};

export type GoogleTokenData = {
  __typename?: "GoogleTokenData";
  access_token: Scalars["String"]["output"];
  expires_at?: Maybe<Scalars["DateTime"]["output"]>;
  granted_scopes: Array<Scalars["String"]["output"]>;
  refresh_token?: Maybe<Scalars["String"]["output"]>;
};

export type GoogleTokenInput = {
  access_token: Scalars["String"]["input"];
  expires_at?: InputMaybe<Scalars["DateTime"]["input"]>;
  granted_scopes: Array<Scalars["String"]["input"]>;
  refresh_token?: InputMaybe<Scalars["String"]["input"]>;
};

export type Lead = {
  __typename?: "Lead";
  ai_insights?: Maybe<Scalars["JSON"]["output"]>;
  assignedToUser?: Maybe<User>;
  assigned_at?: Maybe<Scalars["DateTime"]["output"]>;
  assigned_to_user_id?: Maybe<Scalars["ID"]["output"]>;
  automation_score_factors?: Maybe<Scalars["JSON"]["output"]>;
  company_name?: Maybe<Scalars["String"]["output"]>;
  contact_email?: Maybe<Scalars["String"]["output"]>;
  contact_name?: Maybe<Scalars["String"]["output"]>;
  contact_phone?: Maybe<Scalars["String"]["output"]>;
  conversionHistory: Array<ConversionHistory>;
  conversionReason?: Maybe<Scalars["String"]["output"]>;
  converted_at?: Maybe<Scalars["DateTime"]["output"]>;
  converted_by_user?: Maybe<User>;
  converted_by_user_id?: Maybe<Scalars["ID"]["output"]>;
  converted_to_deal?: Maybe<Deal>;
  converted_to_deal_id?: Maybe<Scalars["ID"]["output"]>;
  converted_to_organization?: Maybe<Organization>;
  converted_to_organization_id?: Maybe<Scalars["ID"]["output"]>;
  converted_to_person?: Maybe<Person>;
  converted_to_person_id?: Maybe<Scalars["ID"]["output"]>;
  createdBy: User;
  created_at: Scalars["DateTime"]["output"];
  currency?: Maybe<Scalars["String"]["output"]>;
  currentWfmStatus?: Maybe<WfmStatus>;
  currentWfmStep?: Maybe<WfmWorkflowStep>;
  customFieldValues: Array<CustomFieldValue>;
  description?: Maybe<Scalars["String"]["output"]>;
  estimatedValueUsd?: Maybe<Scalars["Float"]["output"]>;
  estimated_close_date?: Maybe<Scalars["DateTime"]["output"]>;
  estimated_value?: Maybe<Scalars["Float"]["output"]>;
  exchangeRateUsed?: Maybe<Scalars["Float"]["output"]>;
  formattedEstimatedValue?: Maybe<Scalars["String"]["output"]>;
  history?: Maybe<Array<Maybe<LeadHistoryEntry>>>;
  id: Scalars["ID"]["output"];
  isQualified: Scalars["Boolean"]["output"];
  last_activity_at: Scalars["DateTime"]["output"];
  lead_score: Scalars["Int"]["output"];
  lead_score_factors?: Maybe<Scalars["JSON"]["output"]>;
  name: Scalars["String"]["output"];
  originalDeal?: Maybe<Deal>;
  qualificationLevel: Scalars["Float"]["output"];
  qualificationStatus: Scalars["String"]["output"];
  reactivationPlan?: Maybe<ReactivationPlan>;
  reactivationTargetDate?: Maybe<Scalars["DateTime"]["output"]>;
  source?: Maybe<Scalars["String"]["output"]>;
  updated_at: Scalars["DateTime"]["output"];
  user_id: Scalars["ID"]["output"];
  wfmProject?: Maybe<WfmProject>;
  wfm_project_id?: Maybe<Scalars["ID"]["output"]>;
};

export type LeadHistoryArgs = {
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
};

export type LeadConversionData = {
  company_name?: InputMaybe<Scalars["String"]["input"]>;
  contact_email?: InputMaybe<Scalars["String"]["input"]>;
  contact_name?: InputMaybe<Scalars["String"]["input"]>;
  contact_phone?: InputMaybe<Scalars["String"]["input"]>;
  description?: InputMaybe<Scalars["String"]["input"]>;
  estimatedCloseDate?: InputMaybe<Scalars["DateTime"]["input"]>;
  estimatedValue?: InputMaybe<Scalars["Float"]["input"]>;
  estimated_close_date?: InputMaybe<Scalars["DateTime"]["input"]>;
  estimated_value?: InputMaybe<Scalars["Float"]["input"]>;
  leadScore?: InputMaybe<Scalars["Int"]["input"]>;
  name?: InputMaybe<Scalars["String"]["input"]>;
  source?: InputMaybe<Scalars["String"]["input"]>;
};

export type LeadConversionInput = {
  createConversionActivity?: InputMaybe<Scalars["Boolean"]["input"]>;
  dealData?: InputMaybe<DealInput>;
  organizationData?: InputMaybe<OrganizationInput>;
  personData?: InputMaybe<PersonInput>;
  preserveActivities?: InputMaybe<Scalars["Boolean"]["input"]>;
  targetType: LeadConversionTargetType;
};

export type LeadConversionResult = {
  __typename?: "LeadConversionResult";
  convertedEntities: ConvertedEntities;
  leadId: Scalars["ID"]["output"];
};

export enum LeadConversionTargetType {
  All = "ALL",
  Deal = "DEAL",
  Organization = "ORGANIZATION",
  Person = "PERSON",
}

export type LeadFilters = {
  assignedToUserId?: InputMaybe<Scalars["ID"]["input"]>;
  convertedAfter?: InputMaybe<Scalars["DateTime"]["input"]>;
  convertedBefore?: InputMaybe<Scalars["DateTime"]["input"]>;
  createdAfter?: InputMaybe<Scalars["DateTime"]["input"]>;
  createdBefore?: InputMaybe<Scalars["DateTime"]["input"]>;
  isQualified?: InputMaybe<Scalars["Boolean"]["input"]>;
  leadScoreMax?: InputMaybe<Scalars["Int"]["input"]>;
  leadScoreMin?: InputMaybe<Scalars["Int"]["input"]>;
  qualificationLevel?: InputMaybe<Scalars["Float"]["input"]>;
  qualificationStatus?: InputMaybe<Scalars["String"]["input"]>;
  search?: InputMaybe<Scalars["String"]["input"]>;
  source?: InputMaybe<Scalars["String"]["input"]>;
};

export type LeadHistoryEntry = {
  __typename?: "LeadHistoryEntry";
  changes?: Maybe<Scalars["JSON"]["output"]>;
  created_at: Scalars["DateTime"]["output"];
  event_type: Scalars["String"]["output"];
  id: Scalars["ID"]["output"];
  lead_id: Scalars["ID"]["output"];
  user?: Maybe<User>;
  user_id?: Maybe<Scalars["ID"]["output"]>;
};

export type LeadInput = {
  assignedToUserId?: InputMaybe<Scalars["ID"]["input"]>;
  companyName?: InputMaybe<Scalars["String"]["input"]>;
  contactEmail?: InputMaybe<Scalars["String"]["input"]>;
  contactName?: InputMaybe<Scalars["String"]["input"]>;
  contactPhone?: InputMaybe<Scalars["String"]["input"]>;
  customFields?: InputMaybe<Array<CustomFieldValueInput>>;
  description?: InputMaybe<Scalars["String"]["input"]>;
  estimatedCloseDate?: InputMaybe<Scalars["DateTime"]["input"]>;
  estimatedValue?: InputMaybe<Scalars["Float"]["input"]>;
  name: Scalars["String"]["input"];
  source?: InputMaybe<Scalars["String"]["input"]>;
  wfmProjectTypeId: Scalars["ID"]["input"];
};

export type LeadUpdateInput = {
  assignedToUserId?: InputMaybe<Scalars["ID"]["input"]>;
  companyName?: InputMaybe<Scalars["String"]["input"]>;
  contactEmail?: InputMaybe<Scalars["String"]["input"]>;
  contactName?: InputMaybe<Scalars["String"]["input"]>;
  contactPhone?: InputMaybe<Scalars["String"]["input"]>;
  customFields?: InputMaybe<Array<CustomFieldValueInput>>;
  description?: InputMaybe<Scalars["String"]["input"]>;
  estimatedCloseDate?: InputMaybe<Scalars["DateTime"]["input"]>;
  estimatedValue?: InputMaybe<Scalars["Float"]["input"]>;
  leadScore?: InputMaybe<Scalars["Int"]["input"]>;
  name?: InputMaybe<Scalars["String"]["input"]>;
  source?: InputMaybe<Scalars["String"]["input"]>;
};

export type LeadsStats = {
  __typename?: "LeadsStats";
  averageLeadScore: Scalars["Float"]["output"];
  averageQualificationLevel: Scalars["Float"]["output"];
  conversionRate: Scalars["Float"]["output"];
  convertedLeads: Scalars["Int"]["output"];
  qualifiedLeads: Scalars["Int"]["output"];
  totalLeads: Scalars["Int"]["output"];
};

export enum LogicalOperator {
  And = "AND",
  Or = "OR",
}

export type Mutation = {
  __typename?: "Mutation";
  activateBusinessRule: BusinessRule;
  addAgentThoughts: Array<AgentThought>;
  addAgentV2Thoughts: Array<AgentThought>;
  addDealContextToEvent: CalendarEvent;
  addDealParticipant: DealParticipant;
  archiveThread: Scalars["Boolean"]["output"];
  assignAccountManager: Organization;
  assignTask: Task;
  assignUserRole: User;
  attachDocumentToDeal: DealDocumentAttachment;
  attachDocumentToNoteAndDeal: DualAttachmentResponse;
  attachFileToDeal: DealDocumentAttachment;
  bulkAssignTasks: Array<Task>;
  bulkConvertLeads: Array<LeadConversionResult>;
  bulkDeleteTasks: Scalars["Boolean"]["output"];
  bulkUpdateBusinessRuleStatus: Array<BusinessRule>;
  bulkUpdateTasks: Array<Task>;
  cleanupExpiredNotifications: Scalars["Int"]["output"];
  completeTask: Task;
  composeEmail: EmailMessage;
  connectGoogleIntegration: GoogleIntegrationStatus;
  convertCurrency: ConversionResult;
  convertDealToLead: DealToLeadConversionResult;
  convertLead: LeadConversionResult;
  copyDriveFile: DriveFile;
  createAgentConversation: AgentConversation;
  createAgentV2Conversation: AgentConversation;
  createBusinessRule: BusinessRule;
  createCalendarEvent: CalendarEvent;
  createContactFromEmail: Person;
  createContextualTask: Task;
  createCurrency: Currency;
  createCustomFieldDefinition: CustomFieldDefinition;
  createDeal: Deal;
  createDealFolder: DriveFolderStructure;
  createDocument: Document;
  createEmail: Email;
  createLead: Lead;
  createOrganization: Organization;
  createPerson: Person;
  createPersonOrganizationRole: PersonOrganizationRole;
  createReactivationPlan: ReactivationPlan;
  createSticker: SmartSticker;
  createSystemNotification: SystemNotification;
  createTask: Task;
  createTaskAutomationRule: TaskAutomationRule;
  createTaskDependency: TaskDependency;
  createTasksFromTemplate: Array<Task>;
  createWFMProjectType: WfmProjectType;
  createWFMStatus: WfmStatus;
  createWFMWorkflow: WfmWorkflow;
  createWFMWorkflowStep: WfmWorkflowStep;
  createWFMWorkflowTransition: WfmWorkflowTransition;
  deactivateBusinessRule: BusinessRule;
  deactivateCustomFieldDefinition: CustomFieldDefinition;
  deleteAgentConversation: Scalars["Boolean"]["output"];
  deleteBusinessRule: Scalars["Boolean"]["output"];
  deleteCalendarEvent: Scalars["Boolean"]["output"];
  deleteDeal?: Maybe<Scalars["Boolean"]["output"]>;
  deleteDriveFile: Scalars["Boolean"]["output"];
  deleteLead?: Maybe<Scalars["Boolean"]["output"]>;
  deleteOrganization?: Maybe<Scalars["Boolean"]["output"]>;
  deletePerson?: Maybe<Scalars["Boolean"]["output"]>;
  deletePersonOrganizationRole: Scalars["Boolean"]["output"];
  deleteReactivationPlan: Scalars["Boolean"]["output"];
  deleteSticker: Scalars["Boolean"]["output"];
  deleteSystemNotification: Scalars["Boolean"]["output"];
  deleteTask: Scalars["Boolean"]["output"];
  deleteTaskAutomationRule: Scalars["Boolean"]["output"];
  deleteTaskDependency: Scalars["Boolean"]["output"];
  deleteWFMWorkflowStep: WfmWorkflowStepMutationResponse;
  deleteWFMWorkflowTransition: WfmWorkflowTransitionMutationResponse;
  deleteWfmStatus: WfmStatusMutationResponse;
  detachFileFromDeal: Scalars["Boolean"]["output"];
  dismissSystemNotification: Scalars["Boolean"]["output"];
  duplicateBusinessRule: BusinessRule;
  executeAgentStep: AgentResponse;
  executeBusinessRule: BusinessRuleExecutionResult;
  generateTaskContentFromEmail: AiGeneratedTaskContent;
  linkEmailToDeal: Scalars["Boolean"]["output"];
  markAllBusinessRuleNotificationsAsRead: Scalars["Int"]["output"];
  markAllNotificationsAsRead: Scalars["Int"]["output"];
  markAllSystemNotificationsAsRead: Scalars["Int"]["output"];
  markBusinessRuleNotificationAsRead: Scalars["Boolean"]["output"];
  markNotificationAsActedUpon: BusinessRuleNotification;
  markNotificationAsDismissed: BusinessRuleNotification;
  markNotificationAsRead: BusinessRuleNotification;
  markSystemNotificationAsRead: Scalars["Boolean"]["output"];
  markThreadAsRead: Scalars["Boolean"]["output"];
  markThreadAsUnread: Scalars["Boolean"]["output"];
  moveDriveFile: DriveFile;
  moveStickersBulk: Array<SmartSticker>;
  pinEmail: EmailPin;
  reactivateCustomFieldDefinition: CustomFieldDefinition;
  recalculateLeadScore: Lead;
  removeAccountManager: Organization;
  removeDealContextFromEvent: CalendarEvent;
  removeDealParticipant: Scalars["Boolean"]["output"];
  removeDocumentAttachment: Scalars["Boolean"]["output"];
  removeNoteDocumentAttachment: Scalars["Boolean"]["output"];
  removeUserRole: User;
  revokeGoogleIntegration: Scalars["Boolean"]["output"];
  scheduleDemoMeeting: CalendarEvent;
  scheduleFollowUpMeeting: CalendarEvent;
  sendAgentMessage: AgentResponse;
  sendAgentV2Message: AgentV2Response;
  sendAgentV2MessageStream: Scalars["String"]["output"];
  setExchangeRate: ExchangeRate;
  setPrimaryOrganizationRole: PersonOrganizationRole;
  shareDriveFolder: Scalars["Boolean"]["output"];
  syncCalendarEvents: CalendarSyncStatus;
  syncGmailEmails: Array<Email>;
  toggleStickerPin: SmartSticker;
  triggerTaskAutomation: Array<Task>;
  unassignTask: Task;
  unpinEmail: Scalars["Boolean"]["output"];
  updateAgentConversation: AgentConversation;
  /** Update an app setting (admin only) */
  updateAppSetting: AppSetting;
  updateBusinessRule: BusinessRule;
  updateCalendarEvent: CalendarEvent;
  updateCalendarPreferences: CalendarPreferences;
  updateCurrency: Currency;
  updateCustomFieldDefinition: CustomFieldDefinition;
  updateDeal?: Maybe<Deal>;
  updateDealCurrency: CurrencyOperationResult;
  updateDealParticipantRole: DealParticipant;
  updateDealWFMProgress: Deal;
  updateDocumentAttachmentCategory: DealDocumentAttachment;
  updateEmailPin: EmailPin;
  updateLead?: Maybe<Lead>;
  updateLeadCurrency: CurrencyOperationResult;
  updateLeadWFMProgress: Lead;
  updateOrganization?: Maybe<Organization>;
  updatePerson?: Maybe<Person>;
  updatePersonOrganizationRole: PersonOrganizationRole;
  updateRatesFromECB: CurrencyOperationResult;
  updateReactivationPlan: ReactivationPlan;
  updateSticker: SmartSticker;
  updateStickerTags: SmartSticker;
  updateSystemNotification: SystemNotification;
  updateTask: Task;
  updateTaskAutomationRule: TaskAutomationRule;
  updateUserCurrencyPreferences: UserCurrencyPreferences;
  /** Updates the profile for the currently authenticated user. */
  updateUserProfile?: Maybe<User>;
  updateWFMProjectType: WfmProjectType;
  updateWFMStatus: WfmStatus;
  updateWFMWorkflow: WfmWorkflow;
  updateWFMWorkflowStep: WfmWorkflowStep;
  updateWFMWorkflowStepsOrder?: Maybe<WfmWorkflow>;
  updateWFMWorkflowTransition: WfmWorkflowTransition;
  uploadFileToDrive: DriveFile;
  uploadToGoogleDrive: Document;
};

export type MutationActivateBusinessRuleArgs = {
  id: Scalars["ID"]["input"];
};

export type MutationAddAgentThoughtsArgs = {
  conversationId: Scalars["ID"]["input"];
  thoughts: Array<AgentThoughtInput>;
};

export type MutationAddAgentV2ThoughtsArgs = {
  conversationId: Scalars["ID"]["input"];
  thoughts: Array<AgentV2ThoughtInput>;
};

export type MutationAddDealContextToEventArgs = {
  dealId: Scalars["ID"]["input"];
  eventId: Scalars["ID"]["input"];
  eventType?: InputMaybe<CalendarEventType>;
};

export type MutationAddDealParticipantArgs = {
  input: DealParticipantInput;
};

export type MutationArchiveThreadArgs = {
  threadId: Scalars["String"]["input"];
};

export type MutationAssignAccountManagerArgs = {
  organizationId: Scalars["ID"]["input"];
  userId: Scalars["ID"]["input"];
};

export type MutationAssignTaskArgs = {
  taskId: Scalars["ID"]["input"];
  userId?: InputMaybe<Scalars["ID"]["input"]>;
};

export type MutationAssignUserRoleArgs = {
  roleName: Scalars["String"]["input"];
  userId: Scalars["ID"]["input"];
};

export type MutationAttachDocumentToDealArgs = {
  input: AttachDocumentInput;
};

export type MutationAttachDocumentToNoteAndDealArgs = {
  input: AttachDocumentToNoteInput;
};

export type MutationAttachFileToDealArgs = {
  input: AttachFileInput;
};

export type MutationBulkAssignTasksArgs = {
  taskIds: Array<Scalars["ID"]["input"]>;
  userId: Scalars["ID"]["input"];
};

export type MutationBulkConvertLeadsArgs = {
  ids: Array<Scalars["ID"]["input"]>;
  input: LeadConversionInput;
};

export type MutationBulkDeleteTasksArgs = {
  taskIds: Array<Scalars["ID"]["input"]>;
};

export type MutationBulkUpdateBusinessRuleStatusArgs = {
  ruleIds: Array<Scalars["ID"]["input"]>;
  status: RuleStatusEnum;
};

export type MutationBulkUpdateTasksArgs = {
  taskIds: Array<Scalars["ID"]["input"]>;
  updates: BulkTaskUpdatesInput;
};

export type MutationCompleteTaskArgs = {
  completionData?: InputMaybe<TaskCompletionInput>;
  id: Scalars["ID"]["input"];
};

export type MutationComposeEmailArgs = {
  input: ComposeEmailInput;
};

export type MutationConnectGoogleIntegrationArgs = {
  input: ConnectGoogleIntegrationInput;
};

export type MutationConvertCurrencyArgs = {
  amount: Scalars["Float"]["input"];
  effectiveDate?: InputMaybe<Scalars["String"]["input"]>;
  fromCurrency: Scalars["String"]["input"];
  toCurrency: Scalars["String"]["input"];
};

export type MutationConvertDealToLeadArgs = {
  id: Scalars["ID"]["input"];
  input: DealToLeadConversionInput;
};

export type MutationConvertLeadArgs = {
  id: Scalars["ID"]["input"];
  input: LeadConversionInput;
};

export type MutationCopyDriveFileArgs = {
  fileId: Scalars["String"]["input"];
  newName?: InputMaybe<Scalars["String"]["input"]>;
  newParentId: Scalars["String"]["input"];
};

export type MutationCreateAgentConversationArgs = {
  config?: InputMaybe<AgentConfigInput>;
};

export type MutationCreateAgentV2ConversationArgs = {
  input: CreateAgentV2ConversationInput;
};

export type MutationCreateBusinessRuleArgs = {
  input: BusinessRuleInput;
};

export type MutationCreateCalendarEventArgs = {
  input: CreateCalendarEventInput;
};

export type MutationCreateContactFromEmailArgs = {
  input: CreateContactFromEmailInput;
};

export type MutationCreateContextualTaskArgs = {
  input: ContextualTaskCreationInput;
};

export type MutationCreateCurrencyArgs = {
  input: CreateCurrencyInput;
};

export type MutationCreateCustomFieldDefinitionArgs = {
  input: CustomFieldDefinitionInput;
};

export type MutationCreateDealArgs = {
  input: DealInput;
};

export type MutationCreateDealFolderArgs = {
  input: CreateDealFolderInput;
};

export type MutationCreateDocumentArgs = {
  input: CreateDocumentInput;
};

export type MutationCreateEmailArgs = {
  input: CreateEmailInput;
};

export type MutationCreateLeadArgs = {
  input: LeadInput;
};

export type MutationCreateOrganizationArgs = {
  input: OrganizationInput;
};

export type MutationCreatePersonArgs = {
  input: PersonInput;
};

export type MutationCreatePersonOrganizationRoleArgs = {
  input: PersonOrganizationRoleInput;
  personId: Scalars["ID"]["input"];
};

export type MutationCreateReactivationPlanArgs = {
  input: ReactivationPlanInput;
  leadId: Scalars["ID"]["input"];
};

export type MutationCreateStickerArgs = {
  input: CreateStickerInput;
};

export type MutationCreateSystemNotificationArgs = {
  input: CreateSystemNotificationInput;
};

export type MutationCreateTaskArgs = {
  input: CreateTaskInput;
};

export type MutationCreateTaskAutomationRuleArgs = {
  input: CreateTaskAutomationRuleInput;
};

export type MutationCreateTaskDependencyArgs = {
  input: CreateTaskDependencyInput;
};

export type MutationCreateTasksFromTemplateArgs = {
  context: CrmContextInput;
  templateId: Scalars["ID"]["input"];
};

export type MutationCreateWfmProjectTypeArgs = {
  input: CreateWfmProjectTypeInput;
};

export type MutationCreateWfmStatusArgs = {
  input: CreateWfmStatusInput;
};

export type MutationCreateWfmWorkflowArgs = {
  input: CreateWfmWorkflowInput;
};

export type MutationCreateWfmWorkflowStepArgs = {
  input: CreateWfmWorkflowStepInput;
};

export type MutationCreateWfmWorkflowTransitionArgs = {
  input: CreateWfmWorkflowTransitionInput;
};

export type MutationDeactivateBusinessRuleArgs = {
  id: Scalars["ID"]["input"];
};

export type MutationDeactivateCustomFieldDefinitionArgs = {
  id: Scalars["ID"]["input"];
};

export type MutationDeleteAgentConversationArgs = {
  id: Scalars["ID"]["input"];
};

export type MutationDeleteBusinessRuleArgs = {
  id: Scalars["ID"]["input"];
};

export type MutationDeleteCalendarEventArgs = {
  id: Scalars["ID"]["input"];
};

export type MutationDeleteDealArgs = {
  id: Scalars["ID"]["input"];
};

export type MutationDeleteDriveFileArgs = {
  fileId: Scalars["String"]["input"];
};

export type MutationDeleteLeadArgs = {
  id: Scalars["ID"]["input"];
};

export type MutationDeleteOrganizationArgs = {
  id: Scalars["ID"]["input"];
};

export type MutationDeletePersonArgs = {
  id: Scalars["ID"]["input"];
};

export type MutationDeletePersonOrganizationRoleArgs = {
  id: Scalars["ID"]["input"];
};

export type MutationDeleteReactivationPlanArgs = {
  id: Scalars["ID"]["input"];
};

export type MutationDeleteStickerArgs = {
  id: Scalars["ID"]["input"];
};

export type MutationDeleteSystemNotificationArgs = {
  id: Scalars["ID"]["input"];
};

export type MutationDeleteTaskArgs = {
  id: Scalars["ID"]["input"];
};

export type MutationDeleteTaskAutomationRuleArgs = {
  id: Scalars["ID"]["input"];
};

export type MutationDeleteTaskDependencyArgs = {
  id: Scalars["ID"]["input"];
};

export type MutationDeleteWfmWorkflowStepArgs = {
  id: Scalars["ID"]["input"];
};

export type MutationDeleteWfmWorkflowTransitionArgs = {
  id: Scalars["ID"]["input"];
};

export type MutationDeleteWfmStatusArgs = {
  id: Scalars["ID"]["input"];
};

export type MutationDetachFileFromDealArgs = {
  attachmentId: Scalars["ID"]["input"];
};

export type MutationDismissSystemNotificationArgs = {
  id: Scalars["ID"]["input"];
};

export type MutationDuplicateBusinessRuleArgs = {
  id: Scalars["ID"]["input"];
  name: Scalars["String"]["input"];
};

export type MutationExecuteAgentStepArgs = {
  conversationId: Scalars["ID"]["input"];
  stepId: Scalars["String"]["input"];
};

export type MutationExecuteBusinessRuleArgs = {
  entityId: Scalars["ID"]["input"];
  entityType: EntityTypeEnum;
  ruleId: Scalars["ID"]["input"];
  testMode?: InputMaybe<Scalars["Boolean"]["input"]>;
};

export type MutationGenerateTaskContentFromEmailArgs = {
  input: GenerateTaskContentInput;
};

export type MutationLinkEmailToDealArgs = {
  dealId: Scalars["String"]["input"];
  emailId: Scalars["String"]["input"];
};

export type MutationMarkAllNotificationsAsReadArgs = {
  userId: Scalars["ID"]["input"];
};

export type MutationMarkBusinessRuleNotificationAsReadArgs = {
  id: Scalars["ID"]["input"];
};

export type MutationMarkNotificationAsActedUponArgs = {
  id: Scalars["ID"]["input"];
};

export type MutationMarkNotificationAsDismissedArgs = {
  id: Scalars["ID"]["input"];
};

export type MutationMarkNotificationAsReadArgs = {
  id: Scalars["ID"]["input"];
};

export type MutationMarkSystemNotificationAsReadArgs = {
  id: Scalars["ID"]["input"];
};

export type MutationMarkThreadAsReadArgs = {
  threadId: Scalars["String"]["input"];
};

export type MutationMarkThreadAsUnreadArgs = {
  threadId: Scalars["String"]["input"];
};

export type MutationMoveDriveFileArgs = {
  fileId: Scalars["String"]["input"];
  newParentId: Scalars["String"]["input"];
  oldParentId?: InputMaybe<Scalars["String"]["input"]>;
};

export type MutationMoveStickersBulkArgs = {
  moves: Array<StickerMoveInput>;
};

export type MutationPinEmailArgs = {
  input: PinEmailInput;
};

export type MutationReactivateCustomFieldDefinitionArgs = {
  id: Scalars["ID"]["input"];
};

export type MutationRecalculateLeadScoreArgs = {
  leadId: Scalars["ID"]["input"];
};

export type MutationRemoveAccountManagerArgs = {
  organizationId: Scalars["ID"]["input"];
};

export type MutationRemoveDealContextFromEventArgs = {
  eventId: Scalars["ID"]["input"];
};

export type MutationRemoveDealParticipantArgs = {
  dealId: Scalars["ID"]["input"];
  personId: Scalars["ID"]["input"];
};

export type MutationRemoveDocumentAttachmentArgs = {
  attachmentId: Scalars["ID"]["input"];
};

export type MutationRemoveNoteDocumentAttachmentArgs = {
  attachmentId: Scalars["ID"]["input"];
};

export type MutationRemoveUserRoleArgs = {
  roleName: Scalars["String"]["input"];
  userId: Scalars["ID"]["input"];
};

export type MutationScheduleDemoMeetingArgs = {
  attendeeEmails: Array<Scalars["String"]["input"]>;
  dealId: Scalars["ID"]["input"];
  duration?: InputMaybe<Scalars["Int"]["input"]>;
  suggestedTime?: InputMaybe<Scalars["DateTime"]["input"]>;
  title: Scalars["String"]["input"];
};

export type MutationScheduleFollowUpMeetingArgs = {
  dealId: Scalars["ID"]["input"];
  duration?: InputMaybe<Scalars["Int"]["input"]>;
  suggestedTime?: InputMaybe<Scalars["DateTime"]["input"]>;
  title: Scalars["String"]["input"];
};

export type MutationSendAgentMessageArgs = {
  input: SendMessageInput;
};

export type MutationSendAgentV2MessageArgs = {
  input: SendAgentV2MessageInput;
};

export type MutationSendAgentV2MessageStreamArgs = {
  input: SendAgentV2MessageStreamInput;
};

export type MutationSetExchangeRateArgs = {
  input: SetExchangeRateInput;
};

export type MutationSetPrimaryOrganizationRoleArgs = {
  personId: Scalars["ID"]["input"];
  roleId: Scalars["ID"]["input"];
};

export type MutationShareDriveFolderArgs = {
  folderId: Scalars["String"]["input"];
  permissions: Array<DrivePermissionInput>;
};

export type MutationSyncCalendarEventsArgs = {
  calendarId?: InputMaybe<Scalars["String"]["input"]>;
  daysFuture?: InputMaybe<Scalars["Int"]["input"]>;
  daysPast?: InputMaybe<Scalars["Int"]["input"]>;
  fullSync?: InputMaybe<Scalars["Boolean"]["input"]>;
};

export type MutationSyncGmailEmailsArgs = {
  entityId: Scalars["ID"]["input"];
  entityType: EntityType;
};

export type MutationToggleStickerPinArgs = {
  id: Scalars["ID"]["input"];
};

export type MutationTriggerTaskAutomationArgs = {
  event: CrmEventInput;
};

export type MutationUnassignTaskArgs = {
  taskId: Scalars["ID"]["input"];
};

export type MutationUnpinEmailArgs = {
  id: Scalars["ID"]["input"];
};

export type MutationUpdateAgentConversationArgs = {
  input: UpdateConversationInput;
};

export type MutationUpdateAppSettingArgs = {
  input: UpdateAppSettingInput;
};

export type MutationUpdateBusinessRuleArgs = {
  id: Scalars["ID"]["input"];
  input: UpdateBusinessRuleInput;
};

export type MutationUpdateCalendarEventArgs = {
  id: Scalars["ID"]["input"];
  input: UpdateCalendarEventInput;
};

export type MutationUpdateCalendarPreferencesArgs = {
  input: CalendarPreferencesInput;
};

export type MutationUpdateCurrencyArgs = {
  code: Scalars["String"]["input"];
  input: UpdateCurrencyInput;
};

export type MutationUpdateCustomFieldDefinitionArgs = {
  id: Scalars["ID"]["input"];
  input: CustomFieldDefinitionInput;
};

export type MutationUpdateDealArgs = {
  id: Scalars["ID"]["input"];
  input: DealUpdateInput;
};

export type MutationUpdateDealCurrencyArgs = {
  currency: Scalars["String"]["input"];
  dealId: Scalars["ID"]["input"];
  effectiveDate?: InputMaybe<Scalars["String"]["input"]>;
};

export type MutationUpdateDealParticipantRoleArgs = {
  dealId: Scalars["ID"]["input"];
  personId: Scalars["ID"]["input"];
  role: ContactRoleType;
};

export type MutationUpdateDealWfmProgressArgs = {
  dealId: Scalars["ID"]["input"];
  targetWfmWorkflowStepId: Scalars["ID"]["input"];
};

export type MutationUpdateDocumentAttachmentCategoryArgs = {
  attachmentId: Scalars["ID"]["input"];
  category: DocumentCategory;
};

export type MutationUpdateEmailPinArgs = {
  id: Scalars["ID"]["input"];
  input: UpdateEmailPinInput;
};

export type MutationUpdateLeadArgs = {
  id: Scalars["ID"]["input"];
  input: LeadUpdateInput;
};

export type MutationUpdateLeadCurrencyArgs = {
  currency: Scalars["String"]["input"];
  effectiveDate?: InputMaybe<Scalars["String"]["input"]>;
  leadId: Scalars["ID"]["input"];
};

export type MutationUpdateLeadWfmProgressArgs = {
  leadId: Scalars["ID"]["input"];
  targetWfmWorkflowStepId: Scalars["ID"]["input"];
};

export type MutationUpdateOrganizationArgs = {
  id: Scalars["ID"]["input"];
  input: OrganizationInput;
};

export type MutationUpdatePersonArgs = {
  id: Scalars["ID"]["input"];
  input: PersonInput;
};

export type MutationUpdatePersonOrganizationRoleArgs = {
  id: Scalars["ID"]["input"];
  input: PersonOrganizationRoleUpdateInput;
};

export type MutationUpdateReactivationPlanArgs = {
  id: Scalars["ID"]["input"];
  input: ReactivationPlanInput;
};

export type MutationUpdateStickerArgs = {
  input: UpdateStickerInput;
};

export type MutationUpdateStickerTagsArgs = {
  id: Scalars["ID"]["input"];
  tagsToAdd?: InputMaybe<Array<Scalars["String"]["input"]>>;
  tagsToRemove?: InputMaybe<Array<Scalars["String"]["input"]>>;
};

export type MutationUpdateSystemNotificationArgs = {
  id: Scalars["ID"]["input"];
  input: UpdateSystemNotificationInput;
};

export type MutationUpdateTaskArgs = {
  id: Scalars["ID"]["input"];
  input: UpdateTaskInput;
};

export type MutationUpdateTaskAutomationRuleArgs = {
  id: Scalars["ID"]["input"];
  input: UpdateTaskAutomationRuleInput;
};

export type MutationUpdateUserCurrencyPreferencesArgs = {
  input: UpdateUserCurrencyPreferencesInput;
  userId: Scalars["ID"]["input"];
};

export type MutationUpdateUserProfileArgs = {
  input: UpdateUserProfileInput;
};

export type MutationUpdateWfmProjectTypeArgs = {
  id: Scalars["ID"]["input"];
  input: UpdateWfmProjectTypeInput;
};

export type MutationUpdateWfmStatusArgs = {
  id: Scalars["ID"]["input"];
  input: UpdateWfmStatusInput;
};

export type MutationUpdateWfmWorkflowArgs = {
  id: Scalars["ID"]["input"];
  input: UpdateWfmWorkflowInput;
};

export type MutationUpdateWfmWorkflowStepArgs = {
  id: Scalars["ID"]["input"];
  input: UpdateWfmWorkflowStepInput;
};

export type MutationUpdateWfmWorkflowStepsOrderArgs = {
  orderedStepIds: Array<Scalars["ID"]["input"]>;
  workflowId: Scalars["ID"]["input"];
};

export type MutationUpdateWfmWorkflowTransitionArgs = {
  id: Scalars["ID"]["input"];
  input: UpdateWfmWorkflowTransitionInput;
};

export type MutationUploadFileToDriveArgs = {
  input: UploadFileInput;
};

export type MutationUploadToGoogleDriveArgs = {
  entityId: Scalars["ID"]["input"];
  entityType: EntityType;
  fileContent: Scalars["String"]["input"];
  fileName: Scalars["String"]["input"];
  mimeType: Scalars["String"]["input"];
};

export type NoteDocumentAttachment = {
  __typename?: "NoteDocumentAttachment";
  attachedAt: Scalars["String"]["output"];
  attachedBy: Scalars["ID"]["output"];
  fileName: Scalars["String"]["output"];
  fileSize?: Maybe<Scalars["Int"]["output"]>;
  fileUrl: Scalars["String"]["output"];
  googleFileId: Scalars["String"]["output"];
  id: Scalars["ID"]["output"];
  mimeType?: Maybe<Scalars["String"]["output"]>;
  noteId: Scalars["ID"]["output"];
};

export type NotificationFilters = {
  entityId?: InputMaybe<Scalars["ID"]["input"]>;
  entityType?: InputMaybe<Scalars["String"]["input"]>;
  fromDate?: InputMaybe<Scalars["DateTime"]["input"]>;
  isRead?: InputMaybe<Scalars["Boolean"]["input"]>;
  notificationType?: InputMaybe<Scalars["String"]["input"]>;
  priority?: InputMaybe<Scalars["Int"]["input"]>;
  source?: InputMaybe<NotificationSource>;
  toDate?: InputMaybe<Scalars["DateTime"]["input"]>;
};

export enum NotificationPriority {
  High = "HIGH",
  Low = "LOW",
  Normal = "NORMAL",
  Urgent = "URGENT",
}

export enum NotificationSource {
  BusinessRule = "BUSINESS_RULE",
  System = "SYSTEM",
}

export type NotificationSummary = {
  __typename?: "NotificationSummary";
  businessRuleCount: Scalars["Int"]["output"];
  highPriorityCount: Scalars["Int"]["output"];
  systemCount: Scalars["Int"]["output"];
  totalCount: Scalars["Int"]["output"];
  unreadCount: Scalars["Int"]["output"];
};

/** Defines the Organization type and related queries/mutations. */
export type Organization = {
  __typename?: "Organization";
  accountManager?: Maybe<User>;
  account_manager_id?: Maybe<Scalars["ID"]["output"]>;
  activeDealCount?: Maybe<Scalars["Int"]["output"]>;
  address?: Maybe<Scalars["String"]["output"]>;
  created_at: Scalars["DateTime"]["output"];
  customFieldValues: Array<CustomFieldValue>;
  deals: Array<Deal>;
  id: Scalars["ID"]["output"];
  name: Scalars["String"]["output"];
  notes?: Maybe<Scalars["String"]["output"]>;
  people?: Maybe<Array<Person>>;
  totalDealValue?: Maybe<Scalars["Float"]["output"]>;
  updated_at: Scalars["DateTime"]["output"];
  user_id: Scalars["ID"]["output"];
};

export type OrganizationInput = {
  account_manager_id?: InputMaybe<Scalars["ID"]["input"]>;
  address?: InputMaybe<Scalars["String"]["input"]>;
  customFields?: InputMaybe<Array<CustomFieldValueInput>>;
  name: Scalars["String"]["input"];
  notes?: InputMaybe<Scalars["String"]["input"]>;
};

export type OrganizationUpdateInput = {
  account_manager_id?: InputMaybe<Scalars["ID"]["input"]>;
  address?: InputMaybe<Scalars["String"]["input"]>;
  customFields?: InputMaybe<Array<CustomFieldValueInput>>;
  name?: InputMaybe<Scalars["String"]["input"]>;
  notes?: InputMaybe<Scalars["String"]["input"]>;
};

/** Defines the Person type and related queries/mutations. */
export type Person = {
  __typename?: "Person";
  created_at: Scalars["DateTime"]["output"];
  customFieldValues: Array<CustomFieldValue>;
  deals: Array<Deal>;
  email?: Maybe<Scalars["String"]["output"]>;
  first_name?: Maybe<Scalars["String"]["output"]>;
  id: Scalars["ID"]["output"];
  last_name?: Maybe<Scalars["String"]["output"]>;
  notes?: Maybe<Scalars["String"]["output"]>;
  organization?: Maybe<Organization>;
  organizationRoles: Array<PersonOrganizationRole>;
  phone?: Maybe<Scalars["String"]["output"]>;
  primaryOrganization?: Maybe<Organization>;
  primaryRole?: Maybe<PersonOrganizationRole>;
  updated_at: Scalars["DateTime"]["output"];
  user_id: Scalars["ID"]["output"];
};

export type PersonHistory = {
  __typename?: "PersonHistory";
  created_at: Scalars["DateTime"]["output"];
  event_type: Scalars["String"]["output"];
  field_name?: Maybe<Scalars["String"]["output"]>;
  id: Scalars["ID"]["output"];
  new_value?: Maybe<Scalars["JSON"]["output"]>;
  old_value?: Maybe<Scalars["JSON"]["output"]>;
  person?: Maybe<Person>;
  person_id?: Maybe<Scalars["ID"]["output"]>;
  user_id?: Maybe<Scalars["ID"]["output"]>;
};

export type PersonInput = {
  customFields?: InputMaybe<Array<CustomFieldValueInput>>;
  email?: InputMaybe<Scalars["String"]["input"]>;
  first_name?: InputMaybe<Scalars["String"]["input"]>;
  last_name?: InputMaybe<Scalars["String"]["input"]>;
  notes?: InputMaybe<Scalars["String"]["input"]>;
  organizationRoles?: InputMaybe<Array<PersonOrganizationRoleInput>>;
  phone?: InputMaybe<Scalars["String"]["input"]>;
};

export type PersonListItem = {
  __typename?: "PersonListItem";
  id: Scalars["ID"]["output"];
  name: Scalars["String"]["output"];
};

export type PersonOrganizationRole = {
  __typename?: "PersonOrganizationRole";
  created_at: Scalars["DateTime"]["output"];
  created_by_user_id?: Maybe<Scalars["ID"]["output"]>;
  department?: Maybe<Scalars["String"]["output"]>;
  end_date?: Maybe<Scalars["Date"]["output"]>;
  id: Scalars["ID"]["output"];
  is_primary: Scalars["Boolean"]["output"];
  notes?: Maybe<Scalars["String"]["output"]>;
  organization: Organization;
  organization_id: Scalars["ID"]["output"];
  person: Person;
  person_id: Scalars["ID"]["output"];
  role_title: Scalars["String"]["output"];
  start_date?: Maybe<Scalars["Date"]["output"]>;
  status: Scalars["String"]["output"];
  updated_at: Scalars["DateTime"]["output"];
};

export type PersonOrganizationRoleInput = {
  department?: InputMaybe<Scalars["String"]["input"]>;
  end_date?: InputMaybe<Scalars["Date"]["input"]>;
  is_primary?: InputMaybe<Scalars["Boolean"]["input"]>;
  notes?: InputMaybe<Scalars["String"]["input"]>;
  organization_id: Scalars["ID"]["input"];
  role_title: Scalars["String"]["input"];
  start_date?: InputMaybe<Scalars["Date"]["input"]>;
  status?: InputMaybe<Scalars["String"]["input"]>;
};

export type PersonOrganizationRoleUpdateInput = {
  department?: InputMaybe<Scalars["String"]["input"]>;
  end_date?: InputMaybe<Scalars["Date"]["input"]>;
  is_primary?: InputMaybe<Scalars["Boolean"]["input"]>;
  notes?: InputMaybe<Scalars["String"]["input"]>;
  role_title?: InputMaybe<Scalars["String"]["input"]>;
  start_date?: InputMaybe<Scalars["Date"]["input"]>;
  status?: InputMaybe<Scalars["String"]["input"]>;
};

export type PersonUpdateInput = {
  customFields?: InputMaybe<Array<CustomFieldValueInput>>;
  email?: InputMaybe<Scalars["String"]["input"]>;
  first_name?: InputMaybe<Scalars["String"]["input"]>;
  last_name?: InputMaybe<Scalars["String"]["input"]>;
  notes?: InputMaybe<Scalars["String"]["input"]>;
  organizationRoles?: InputMaybe<Array<PersonOrganizationRoleInput>>;
  phone?: InputMaybe<Scalars["String"]["input"]>;
};

export type PinEmailInput = {
  dealId: Scalars["ID"]["input"];
  emailId: Scalars["String"]["input"];
  fromEmail?: InputMaybe<Scalars["String"]["input"]>;
  notes?: InputMaybe<Scalars["String"]["input"]>;
  subject?: InputMaybe<Scalars["String"]["input"]>;
  threadId: Scalars["String"]["input"];
};

export type Query = {
  __typename?: "Query";
  agentConversation?: Maybe<AgentConversation>;
  agentConversations: Array<AgentConversation>;
  agentThoughts: Array<AgentThought>;
  agentV2Conversations: Array<AgentConversation>;
  agentV2ThinkingAnalysis: ExtendedThinkingAnalysis;
  agentV2Thoughts: Array<AgentThought>;
  /** Get a specific app setting by key */
  appSetting?: Maybe<AppSetting>;
  /** Get all app settings (admin only for private settings) */
  appSettings: Array<AppSetting>;
  assignableUsers: Array<User>;
  businessRule?: Maybe<BusinessRule>;
  businessRuleAnalytics: BusinessRuleAnalytics;
  businessRuleNotification?: Maybe<BusinessRuleNotification>;
  businessRuleNotifications: BusinessRuleNotificationsConnection;
  businessRules: BusinessRulesConnection;
  calendarEvent?: Maybe<CalendarEvent>;
  calendarEvents: Array<CalendarEvent>;
  calendarPreferences?: Maybe<CalendarPreferences>;
  calendarSyncStatus: CalendarSyncStatus;
  checkAvailability: Array<AvailabilitySlot>;
  conversionHistory: Array<ConversionHistory>;
  conversionHistoryById?: Maybe<ConversionHistory>;
  currencies: Array<Currency>;
  currency?: Maybe<Currency>;
  customFieldDefinition?: Maybe<CustomFieldDefinition>;
  customFieldDefinitions: Array<CustomFieldDefinition>;
  deal?: Maybe<Deal>;
  dealCalendarEvents: Array<CalendarEvent>;
  /** Get files in the deal folder or specific subfolder */
  dealFolderFiles: Array<DriveFile>;
  /** Get deal folder information, auto-creating if needed */
  dealFolderInfo: DealFolderInfo;
  dealTaskIndicators: Array<DealTaskIndicator>;
  deals: Array<Deal>;
  dealsByCurrency: Array<DealsByCurrencyResult>;
  discoverAgentTools: ToolDiscoveryResponse;
  exchangeRate?: Maybe<ExchangeRate>;
  exchangeRates: Array<ExchangeRate>;
  getDealDocumentAttachments: Array<DealDocumentAttachment>;
  getDealDocuments: Array<DealDocumentAttachment>;
  getDealFolder?: Maybe<DriveFolder>;
  getDealParticipants: Array<DealParticipant>;
  getDriveFile: DriveFile;
  getDriveFiles: DriveFileConnection;
  getDriveFolders: DriveFolderConnection;
  getEmailAnalytics?: Maybe<EmailAnalytics>;
  getEmailMessage?: Maybe<EmailMessage>;
  getEmailPin?: Maybe<EmailPin>;
  getEmailThread?: Maybe<EmailThread>;
  getEmailThreads: EmailThreadConnection;
  getEntityDocuments: Array<Document>;
  getEntityEmails: Array<Email>;
  getEntityStickers: StickerConnection;
  getNoteDocumentAttachments: Array<NoteDocumentAttachment>;
  getPinnedEmails: Array<EmailPin>;
  getPinnedStickers: StickerConnection;
  getRecentDriveFiles: DriveFileConnection;
  getRecentSharedDriveFiles: Array<DriveFile>;
  getSharedDriveFiles: Array<DriveFile>;
  getSharedDriveFolders: Array<DriveFolder>;
  getSharedDrives: Array<SharedDrive>;
  getSticker?: Maybe<SmartSticker>;
  getStickerCategories: Array<StickerCategory>;
  getWfmAllowedTransitions: Array<WfmWorkflowTransition>;
  googleCalendars: Array<GoogleCalendar>;
  /** Get Google Drive configuration settings */
  googleDriveSettings: GoogleDriveConfig;
  googleIntegrationStatus: GoogleIntegrationStatus;
  health: Scalars["String"]["output"];
  lead?: Maybe<Lead>;
  leads: Array<Lead>;
  leadsStats: LeadsStats;
  me?: Maybe<User>;
  myAccountPortfolioStats: AccountPortfolioStats;
  myAccounts: Array<Organization>;
  myAssignedTasks: Array<Task>;
  myOverdueTasks: Array<Task>;
  myPermissions?: Maybe<Array<Scalars["String"]["output"]>>;
  myTasks: Array<Task>;
  myTasksDueThisWeek: Array<Task>;
  myTasksDueToday: Array<Task>;
  notificationSummary: NotificationSummary;
  organization?: Maybe<Organization>;
  organizations: Array<Organization>;
  people: Array<Person>;
  peopleByOrganization: Array<Person>;
  person?: Maybe<Person>;
  personHistory: Array<PersonHistory>;
  personList: Array<PersonListItem>;
  personOrganizationRoles: Array<PersonOrganizationRole>;
  previewRuleExecution: BusinessRuleExecutionResult;
  reactivationPlan?: Maybe<ReactivationPlan>;
  reactivationPlans: Array<ReactivationPlan>;
  roles: Array<Role>;
  ruleExecution?: Maybe<RuleExecution>;
  ruleExecutions: RuleExecutionsConnection;
  searchDriveFiles: DriveFileConnection;
  searchEmails: Array<Email>;
  searchGoogleContacts: Array<ContactSuggestion>;
  searchSharedDriveFiles: Array<DriveFile>;
  searchStickers: StickerConnection;
  suggestEmailParticipants: Array<Person>;
  supabaseConnectionTest: Scalars["String"]["output"];
  systemNotification?: Maybe<SystemNotification>;
  systemNotifications: SystemNotificationsConnection;
  task?: Maybe<Task>;
  taskAutomationRule?: Maybe<TaskAutomationRule>;
  taskAutomationRules: Array<TaskAutomationRule>;
  taskDependencies: Array<TaskDependency>;
  taskHistory: Array<TaskHistory>;
  taskStats: TaskStats;
  tasks: Array<Task>;
  tasksForDeal: Array<Task>;
  tasksForLead: Array<Task>;
  tasksForOrganization: Array<Task>;
  tasksForPerson: Array<Task>;
  tasksForUser: Array<Task>;
  unifiedNotifications: UnifiedNotificationsConnection;
  unreadNotificationCount: Scalars["Int"]["output"];
  upcomingMeetings: Array<CalendarEvent>;
  userCurrencyPreferences?: Maybe<UserCurrencyPreferences>;
  users: Array<User>;
  validateBusinessRule: Array<Scalars["String"]["output"]>;
  validateConversion: ConversionValidationResult;
  wfmProjectType?: Maybe<WfmProjectType>;
  wfmProjectTypeByName?: Maybe<WfmProjectType>;
  wfmProjectTypes: Array<WfmProjectType>;
  wfmStatus?: Maybe<WfmStatus>;
  wfmStatuses: Array<WfmStatus>;
  wfmWorkflow?: Maybe<WfmWorkflow>;
  wfmWorkflows: Array<WfmWorkflow>;
};

export type QueryAgentConversationArgs = {
  id: Scalars["ID"]["input"];
};

export type QueryAgentConversationsArgs = {
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
};

export type QueryAgentThoughtsArgs = {
  conversationId: Scalars["ID"]["input"];
  limit?: InputMaybe<Scalars["Int"]["input"]>;
};

export type QueryAgentV2ConversationsArgs = {
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
};

export type QueryAgentV2ThinkingAnalysisArgs = {
  conversationId: Scalars["ID"]["input"];
};

export type QueryAgentV2ThoughtsArgs = {
  conversationId: Scalars["ID"]["input"];
  limit?: InputMaybe<Scalars["Int"]["input"]>;
};

export type QueryAppSettingArgs = {
  settingKey: Scalars["String"]["input"];
};

export type QueryBusinessRuleArgs = {
  id: Scalars["ID"]["input"];
};

export type QueryBusinessRuleAnalyticsArgs = {
  entityType?: InputMaybe<EntityTypeEnum>;
  timeRange?: InputMaybe<Scalars["String"]["input"]>;
};

export type QueryBusinessRuleNotificationArgs = {
  id: Scalars["ID"]["input"];
};

export type QueryBusinessRuleNotificationsArgs = {
  after?: InputMaybe<Scalars["String"]["input"]>;
  first?: InputMaybe<Scalars["Int"]["input"]>;
  unreadOnly?: InputMaybe<Scalars["Boolean"]["input"]>;
  userId?: InputMaybe<Scalars["ID"]["input"]>;
};

export type QueryBusinessRulesArgs = {
  after?: InputMaybe<Scalars["String"]["input"]>;
  filters?: InputMaybe<BusinessRuleFilters>;
  first?: InputMaybe<Scalars["Int"]["input"]>;
};

export type QueryCalendarEventArgs = {
  id: Scalars["ID"]["input"];
};

export type QueryCalendarEventsArgs = {
  calendarId?: InputMaybe<Scalars["String"]["input"]>;
  dealId?: InputMaybe<Scalars["ID"]["input"]>;
  eventType?: InputMaybe<CalendarEventType>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  organizationId?: InputMaybe<Scalars["ID"]["input"]>;
  personId?: InputMaybe<Scalars["ID"]["input"]>;
  timeRange?: InputMaybe<CalendarTimeRangeInput>;
};

export type QueryCheckAvailabilityArgs = {
  calendarIds?: InputMaybe<Array<Scalars["String"]["input"]>>;
  timeRange: CalendarTimeRangeInput;
};

export type QueryConversionHistoryArgs = {
  entityId: Scalars["ID"]["input"];
  entityType: Scalars["String"]["input"];
};

export type QueryConversionHistoryByIdArgs = {
  id: Scalars["ID"]["input"];
};

export type QueryCurrencyArgs = {
  code: Scalars["String"]["input"];
};

export type QueryCustomFieldDefinitionArgs = {
  id: Scalars["ID"]["input"];
};

export type QueryCustomFieldDefinitionsArgs = {
  entityType: CustomFieldEntityType;
  includeInactive?: InputMaybe<Scalars["Boolean"]["input"]>;
};

export type QueryDealArgs = {
  id: Scalars["ID"]["input"];
};

export type QueryDealCalendarEventsArgs = {
  dealId: Scalars["ID"]["input"];
};

export type QueryDealFolderFilesArgs = {
  dealId: Scalars["ID"]["input"];
  folderId?: InputMaybe<Scalars["ID"]["input"]>;
};

export type QueryDealFolderInfoArgs = {
  dealId: Scalars["ID"]["input"];
};

export type QueryDealTaskIndicatorsArgs = {
  dealIds: Array<Scalars["ID"]["input"]>;
};

export type QueryExchangeRateArgs = {
  effectiveDate?: InputMaybe<Scalars["String"]["input"]>;
  fromCurrency: Scalars["String"]["input"];
  toCurrency: Scalars["String"]["input"];
};

export type QueryGetDealDocumentAttachmentsArgs = {
  dealId: Scalars["ID"]["input"];
};

export type QueryGetDealDocumentsArgs = {
  dealId: Scalars["ID"]["input"];
};

export type QueryGetDealFolderArgs = {
  dealId: Scalars["ID"]["input"];
};

export type QueryGetDealParticipantsArgs = {
  dealId: Scalars["ID"]["input"];
};

export type QueryGetDriveFileArgs = {
  fileId: Scalars["String"]["input"];
};

export type QueryGetDriveFilesArgs = {
  input: DriveSearchInput;
};

export type QueryGetDriveFoldersArgs = {
  input: DriveFolderBrowseInput;
};

export type QueryGetEmailAnalyticsArgs = {
  dealId: Scalars["String"]["input"];
};

export type QueryGetEmailMessageArgs = {
  messageId: Scalars["String"]["input"];
};

export type QueryGetEmailPinArgs = {
  id: Scalars["ID"]["input"];
};

export type QueryGetEmailThreadArgs = {
  threadId: Scalars["String"]["input"];
};

export type QueryGetEmailThreadsArgs = {
  filter: EmailThreadsFilterInput;
};

export type QueryGetEntityDocumentsArgs = {
  entityId: Scalars["ID"]["input"];
  entityType: EntityType;
};

export type QueryGetEntityEmailsArgs = {
  entityId: Scalars["ID"]["input"];
  entityType: EntityType;
};

export type QueryGetEntityStickersArgs = {
  after?: InputMaybe<Scalars["String"]["input"]>;
  entityId: Scalars["ID"]["input"];
  entityType: EntityType;
  filters?: InputMaybe<StickerFilters>;
  first?: InputMaybe<Scalars["Int"]["input"]>;
  sortBy?: InputMaybe<StickerSortBy>;
};

export type QueryGetNoteDocumentAttachmentsArgs = {
  noteId: Scalars["ID"]["input"];
};

export type QueryGetPinnedEmailsArgs = {
  dealId: Scalars["ID"]["input"];
};

export type QueryGetPinnedStickersArgs = {
  entityType?: InputMaybe<EntityType>;
  first?: InputMaybe<Scalars["Int"]["input"]>;
};

export type QueryGetRecentDriveFilesArgs = {
  limit?: InputMaybe<Scalars["Int"]["input"]>;
};

export type QueryGetRecentSharedDriveFilesArgs = {
  limit?: InputMaybe<Scalars["Int"]["input"]>;
};

export type QueryGetSharedDriveFilesArgs = {
  folderId?: InputMaybe<Scalars["ID"]["input"]>;
  query?: InputMaybe<Scalars["String"]["input"]>;
  sharedDriveId: Scalars["ID"]["input"];
};

export type QueryGetSharedDriveFoldersArgs = {
  parentFolderId?: InputMaybe<Scalars["ID"]["input"]>;
  sharedDriveId: Scalars["ID"]["input"];
};

export type QueryGetStickerArgs = {
  id: Scalars["ID"]["input"];
};

export type QueryGetWfmAllowedTransitionsArgs = {
  fromStepId: Scalars["ID"]["input"];
  workflowId: Scalars["ID"]["input"];
};

export type QueryLeadArgs = {
  id: Scalars["ID"]["input"];
};

export type QueryLeadsArgs = {
  filters?: InputMaybe<LeadFilters>;
};

export type QueryMyAssignedTasksArgs = {
  filters?: InputMaybe<TaskFiltersInput>;
};

export type QueryMyTasksArgs = {
  filters?: InputMaybe<TaskFiltersInput>;
};

export type QueryOrganizationArgs = {
  id: Scalars["ID"]["input"];
};

export type QueryPeopleByOrganizationArgs = {
  includeFormerEmployees?: InputMaybe<Scalars["Boolean"]["input"]>;
  organizationId: Scalars["ID"]["input"];
};

export type QueryPersonArgs = {
  id: Scalars["ID"]["input"];
};

export type QueryPersonHistoryArgs = {
  personId: Scalars["ID"]["input"];
};

export type QueryPersonOrganizationRolesArgs = {
  personId: Scalars["ID"]["input"];
};

export type QueryPreviewRuleExecutionArgs = {
  entityId: Scalars["ID"]["input"];
  entityType: EntityTypeEnum;
  ruleId: Scalars["ID"]["input"];
};

export type QueryReactivationPlanArgs = {
  id: Scalars["ID"]["input"];
};

export type QueryReactivationPlansArgs = {
  assignedToUserId?: InputMaybe<Scalars["ID"]["input"]>;
  status?: InputMaybe<ReactivationPlanStatus>;
};

export type QueryRuleExecutionArgs = {
  id: Scalars["ID"]["input"];
};

export type QueryRuleExecutionsArgs = {
  after?: InputMaybe<Scalars["String"]["input"]>;
  entityId?: InputMaybe<Scalars["ID"]["input"]>;
  entityType?: InputMaybe<EntityTypeEnum>;
  first?: InputMaybe<Scalars["Int"]["input"]>;
  ruleId?: InputMaybe<Scalars["ID"]["input"]>;
};

export type QuerySearchDriveFilesArgs = {
  query: Scalars["String"]["input"];
};

export type QuerySearchEmailsArgs = {
  entityType?: InputMaybe<EntityType>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  query: Scalars["String"]["input"];
};

export type QuerySearchGoogleContactsArgs = {
  query: Scalars["String"]["input"];
};

export type QuerySearchSharedDriveFilesArgs = {
  query: Scalars["String"]["input"];
  sharedDriveId?: InputMaybe<Scalars["ID"]["input"]>;
};

export type QuerySearchStickersArgs = {
  after?: InputMaybe<Scalars["String"]["input"]>;
  filters: StickerFilters;
  first?: InputMaybe<Scalars["Int"]["input"]>;
  sortBy?: InputMaybe<StickerSortBy>;
};

export type QuerySuggestEmailParticipantsArgs = {
  dealId: Scalars["ID"]["input"];
  threadId?: InputMaybe<Scalars["String"]["input"]>;
};

export type QuerySystemNotificationArgs = {
  id: Scalars["ID"]["input"];
};

export type QuerySystemNotificationsArgs = {
  after?: InputMaybe<Scalars["String"]["input"]>;
  filters?: InputMaybe<NotificationFilters>;
  first?: InputMaybe<Scalars["Int"]["input"]>;
};

export type QueryTaskArgs = {
  id: Scalars["ID"]["input"];
};

export type QueryTaskAutomationRuleArgs = {
  id: Scalars["ID"]["input"];
};

export type QueryTaskAutomationRulesArgs = {
  entityType?: InputMaybe<TaskEntityType>;
};

export type QueryTaskDependenciesArgs = {
  taskId: Scalars["ID"]["input"];
};

export type QueryTaskHistoryArgs = {
  taskId: Scalars["ID"]["input"];
};

export type QueryTaskStatsArgs = {
  entityId?: InputMaybe<Scalars["ID"]["input"]>;
  entityType?: InputMaybe<TaskEntityType>;
};

export type QueryTasksArgs = {
  filters?: InputMaybe<TaskFiltersInput>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
};

export type QueryTasksForDealArgs = {
  dealId: Scalars["ID"]["input"];
  filters?: InputMaybe<TaskFiltersInput>;
};

export type QueryTasksForLeadArgs = {
  filters?: InputMaybe<TaskFiltersInput>;
  leadId: Scalars["ID"]["input"];
};

export type QueryTasksForOrganizationArgs = {
  filters?: InputMaybe<TaskFiltersInput>;
  organizationId: Scalars["ID"]["input"];
};

export type QueryTasksForPersonArgs = {
  filters?: InputMaybe<TaskFiltersInput>;
  personId: Scalars["ID"]["input"];
};

export type QueryTasksForUserArgs = {
  filters?: InputMaybe<TaskFiltersInput>;
  userId: Scalars["ID"]["input"];
};

export type QueryUnifiedNotificationsArgs = {
  after?: InputMaybe<Scalars["String"]["input"]>;
  filters?: InputMaybe<NotificationFilters>;
  first?: InputMaybe<Scalars["Int"]["input"]>;
};

export type QueryUpcomingMeetingsArgs = {
  days?: InputMaybe<Scalars["Int"]["input"]>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
};

export type QueryUserCurrencyPreferencesArgs = {
  userId: Scalars["ID"]["input"];
};

export type QueryValidateBusinessRuleArgs = {
  input: BusinessRuleInput;
};

export type QueryValidateConversionArgs = {
  sourceId: Scalars["ID"]["input"];
  sourceType: Scalars["String"]["input"];
  targetType: Scalars["String"]["input"];
};

export type QueryWfmProjectTypeArgs = {
  id: Scalars["ID"]["input"];
};

export type QueryWfmProjectTypeByNameArgs = {
  name: Scalars["String"]["input"];
};

export type QueryWfmProjectTypesArgs = {
  isArchived?: InputMaybe<Scalars["Boolean"]["input"]>;
};

export type QueryWfmStatusArgs = {
  id: Scalars["ID"]["input"];
};

export type QueryWfmStatusesArgs = {
  isArchived?: InputMaybe<Scalars["Boolean"]["input"]>;
};

export type QueryWfmWorkflowArgs = {
  id: Scalars["ID"]["input"];
};

export type QueryWfmWorkflowsArgs = {
  isArchived?: InputMaybe<Scalars["Boolean"]["input"]>;
};

export type ReactivationPlan = {
  __typename?: "ReactivationPlan";
  assignedToUser?: Maybe<User>;
  createdAt: Scalars["DateTime"]["output"];
  createdByUser?: Maybe<User>;
  followUpActivities?: Maybe<Scalars["JSON"]["output"]>;
  id: Scalars["ID"]["output"];
  lead: Lead;
  notes?: Maybe<Scalars["String"]["output"]>;
  originalDeal?: Maybe<Deal>;
  reactivationStrategy: ReactivationStrategy;
  status: ReactivationPlanStatus;
  targetReactivationDate?: Maybe<Scalars["DateTime"]["output"]>;
  updatedAt: Scalars["DateTime"]["output"];
};

export type ReactivationPlanInput = {
  assignedToUserId?: InputMaybe<Scalars["ID"]["input"]>;
  followUpActivities?: InputMaybe<Scalars["JSON"]["input"]>;
  notes?: InputMaybe<Scalars["String"]["input"]>;
  reactivationStrategy: ReactivationStrategy;
  targetReactivationDate?: InputMaybe<Scalars["DateTime"]["input"]>;
};

export enum ReactivationPlanStatus {
  Active = "ACTIVE",
  Cancelled = "CANCELLED",
  Completed = "COMPLETED",
  Paused = "PAUSED",
}

export enum ReactivationStrategy {
  BudgetFollowUp = "BUDGET_FOLLOW_UP",
  CompetitiveAnalysis = "COMPETITIVE_ANALYSIS",
  ContentMarketing = "CONTENT_MARKETING",
  DirectOutreach = "DIRECT_OUTREACH",
  Nurturing = "NURTURING",
  RelationshipBuilding = "RELATIONSHIP_BUILDING",
}

export type Role = {
  __typename?: "Role";
  description: Scalars["String"]["output"];
  id: Scalars["ID"]["output"];
  name: Scalars["String"]["output"];
};

export type RuleAction = {
  __typename?: "RuleAction";
  message?: Maybe<Scalars["String"]["output"]>;
  metadata?: Maybe<Scalars["JSON"]["output"]>;
  priority: Scalars["Int"]["output"];
  target?: Maybe<Scalars["String"]["output"]>;
  template?: Maybe<Scalars["String"]["output"]>;
  type: RuleActionType;
};

export type RuleActionInput = {
  message?: InputMaybe<Scalars["String"]["input"]>;
  metadata?: InputMaybe<Scalars["JSON"]["input"]>;
  priority?: InputMaybe<Scalars["Int"]["input"]>;
  target?: InputMaybe<Scalars["String"]["input"]>;
  template?: InputMaybe<Scalars["String"]["input"]>;
  type: RuleActionType;
};

export enum RuleActionType {
  CreateActivity = "CREATE_ACTIVITY",
  CreateTask = "CREATE_TASK",
  NotifyOwner = "NOTIFY_OWNER",
  NotifyUser = "NOTIFY_USER",
  SendEmail = "SEND_EMAIL",
  UpdateField = "UPDATE_FIELD",
}

export type RuleCondition = {
  __typename?: "RuleCondition";
  field: Scalars["String"]["output"];
  logicalOperator: LogicalOperator;
  operator: RuleConditionOperator;
  value: Scalars["String"]["output"];
};

export type RuleConditionInput = {
  field: Scalars["String"]["input"];
  logicalOperator?: InputMaybe<LogicalOperator>;
  operator: RuleConditionOperator;
  value: Scalars["String"]["input"];
};

export enum RuleConditionOperator {
  ChangedFrom = "CHANGED_FROM",
  ChangedTo = "CHANGED_TO",
  Contains = "CONTAINS",
  DecreasedByPercent = "DECREASED_BY_PERCENT",
  EndsWith = "ENDS_WITH",
  Equals = "EQUALS",
  GreaterEqual = "GREATER_EQUAL",
  GreaterThan = "GREATER_THAN",
  In = "IN",
  IncreasedByPercent = "INCREASED_BY_PERCENT",
  IsNotNull = "IS_NOT_NULL",
  IsNull = "IS_NULL",
  LessEqual = "LESS_EQUAL",
  LessThan = "LESS_THAN",
  NewerThan = "NEWER_THAN",
  NotEquals = "NOT_EQUALS",
  NotIn = "NOT_IN",
  OlderThan = "OLDER_THAN",
  StartsWith = "STARTS_WITH",
}

export type RuleExecution = {
  __typename?: "RuleExecution";
  activitiesCreated: Scalars["Int"]["output"];
  conditionsMet: Scalars["Boolean"]["output"];
  entityId: Scalars["ID"]["output"];
  entityType: EntityTypeEnum;
  errors: Array<Scalars["String"]["output"]>;
  executedAt: Scalars["DateTime"]["output"];
  executionResult: Scalars["JSON"]["output"];
  executionTimeMs?: Maybe<Scalars["Int"]["output"]>;
  executionTrigger: Scalars["String"]["output"];
  id: Scalars["ID"]["output"];
  notificationsCreated: Scalars["Int"]["output"];
  rule: BusinessRule;
  tasksCreated: Scalars["Int"]["output"];
};

export type RuleExecutionsConnection = {
  __typename?: "RuleExecutionsConnection";
  hasNextPage: Scalars["Boolean"]["output"];
  hasPreviousPage: Scalars["Boolean"]["output"];
  nodes: Array<RuleExecution>;
  totalCount: Scalars["Int"]["output"];
};

export enum RuleStatusEnum {
  Active = "ACTIVE",
  Draft = "DRAFT",
  Inactive = "INACTIVE",
}

export type SendAgentV2MessageInput = {
  content: Scalars["String"]["input"];
  conversationId?: InputMaybe<Scalars["ID"]["input"]>;
};

export type SendAgentV2MessageStreamInput = {
  content: Scalars["String"]["input"];
  conversationId?: InputMaybe<Scalars["ID"]["input"]>;
};

export type SendMessageInput = {
  config?: InputMaybe<AgentConfigInput>;
  content: Scalars["String"]["input"];
  conversationId?: InputMaybe<Scalars["ID"]["input"]>;
};

export type SetExchangeRateInput = {
  effectiveDate?: InputMaybe<Scalars["String"]["input"]>;
  fromCurrency: Scalars["String"]["input"];
  rate: Scalars["Float"]["input"];
  source?: InputMaybe<Scalars["String"]["input"]>;
  toCurrency: Scalars["String"]["input"];
};

export type SharedDrive = {
  __typename?: "SharedDrive";
  backgroundImageFile?: Maybe<SharedDriveImage>;
  capabilities?: Maybe<SharedDriveCapabilities>;
  colorRgb?: Maybe<Scalars["String"]["output"]>;
  createdTime: Scalars["String"]["output"];
  id: Scalars["ID"]["output"];
  name: Scalars["String"]["output"];
  restrictions?: Maybe<SharedDriveRestrictions>;
};

export type SharedDriveCapabilities = {
  __typename?: "SharedDriveCapabilities";
  canAddChildren?: Maybe<Scalars["Boolean"]["output"]>;
  canComment?: Maybe<Scalars["Boolean"]["output"]>;
  canCopy?: Maybe<Scalars["Boolean"]["output"]>;
  canDeleteDrive?: Maybe<Scalars["Boolean"]["output"]>;
  canDownload?: Maybe<Scalars["Boolean"]["output"]>;
  canEdit?: Maybe<Scalars["Boolean"]["output"]>;
  canListChildren?: Maybe<Scalars["Boolean"]["output"]>;
  canManageMembers?: Maybe<Scalars["Boolean"]["output"]>;
  canReadRevisions?: Maybe<Scalars["Boolean"]["output"]>;
  canRename?: Maybe<Scalars["Boolean"]["output"]>;
  canRenameDrive?: Maybe<Scalars["Boolean"]["output"]>;
  canShare?: Maybe<Scalars["Boolean"]["output"]>;
};

export type SharedDriveImage = {
  __typename?: "SharedDriveImage";
  id: Scalars["String"]["output"];
  webViewLink: Scalars["String"]["output"];
};

export type SharedDriveRestrictions = {
  __typename?: "SharedDriveRestrictions";
  adminManagedRestrictions?: Maybe<Scalars["Boolean"]["output"]>;
  copyRequiresWriterPermission?: Maybe<Scalars["Boolean"]["output"]>;
  domainUsersOnly?: Maybe<Scalars["Boolean"]["output"]>;
  driveMembersOnly?: Maybe<Scalars["Boolean"]["output"]>;
};

export type SmartSticker = {
  __typename?: "SmartSticker";
  category?: Maybe<StickerCategory>;
  color: Scalars["String"]["output"];
  content?: Maybe<Scalars["String"]["output"]>;
  createdAt: Scalars["DateTime"]["output"];
  createdBy?: Maybe<User>;
  createdByUserId: Scalars["ID"]["output"];
  entityId: Scalars["ID"]["output"];
  entityType: EntityType;
  height: Scalars["Int"]["output"];
  id: Scalars["ID"]["output"];
  isPinned: Scalars["Boolean"]["output"];
  isPrivate: Scalars["Boolean"]["output"];
  lastEditedAt?: Maybe<Scalars["DateTime"]["output"]>;
  lastEditedBy?: Maybe<User>;
  lastEditedByUserId?: Maybe<Scalars["ID"]["output"]>;
  mentions: Array<Scalars["ID"]["output"]>;
  positionX: Scalars["Int"]["output"];
  positionY: Scalars["Int"]["output"];
  priority: StickerPriority;
  tags: Array<Scalars["String"]["output"]>;
  title: Scalars["String"]["output"];
  updatedAt: Scalars["DateTime"]["output"];
  width: Scalars["Int"]["output"];
};

export enum SortDirection {
  Asc = "ASC",
  Desc = "DESC",
}

export enum StageType {
  Lost = "LOST",
  Open = "OPEN",
  Won = "WON",
}

export type StickerCategory = {
  __typename?: "StickerCategory";
  color: Scalars["String"]["output"];
  createdAt: Scalars["DateTime"]["output"];
  description?: Maybe<Scalars["String"]["output"]>;
  displayOrder: Scalars["Int"]["output"];
  icon?: Maybe<Scalars["String"]["output"]>;
  id: Scalars["ID"]["output"];
  isSystem: Scalars["Boolean"]["output"];
  name: Scalars["String"]["output"];
  updatedAt: Scalars["DateTime"]["output"];
};

export type StickerConnection = {
  __typename?: "StickerConnection";
  hasNextPage: Scalars["Boolean"]["output"];
  hasPreviousPage: Scalars["Boolean"]["output"];
  nodes: Array<SmartSticker>;
  totalCount: Scalars["Int"]["output"];
};

export type StickerFilters = {
  categoryIds?: InputMaybe<Array<Scalars["ID"]["input"]>>;
  createdByUserId?: InputMaybe<Scalars["ID"]["input"]>;
  entityId?: InputMaybe<Scalars["ID"]["input"]>;
  entityType?: InputMaybe<EntityType>;
  isPinned?: InputMaybe<Scalars["Boolean"]["input"]>;
  isPrivate?: InputMaybe<Scalars["Boolean"]["input"]>;
  priority?: InputMaybe<StickerPriority>;
  search?: InputMaybe<Scalars["String"]["input"]>;
  tags?: InputMaybe<Array<Scalars["String"]["input"]>>;
};

export type StickerMoveInput = {
  id: Scalars["ID"]["input"];
  positionX: Scalars["Int"]["input"];
  positionY: Scalars["Int"]["input"];
};

export enum StickerPriority {
  High = "HIGH",
  Normal = "NORMAL",
  Urgent = "URGENT",
}

export type StickerSortBy = {
  direction?: InputMaybe<SortDirection>;
  field: StickerSortField;
};

export enum StickerSortField {
  CreatedAt = "CREATED_AT",
  PositionX = "POSITION_X",
  PositionY = "POSITION_Y",
  Priority = "PRIORITY",
  Title = "TITLE",
  UpdatedAt = "UPDATED_AT",
}

export type Subscription = {
  __typename?: "Subscription";
  agentConversationUpdated: AgentConversation;
  agentPlanUpdated: AgentPlan;
  agentThoughtsAdded: Array<AgentThought>;
  agentV2MessageStream: AgentV2StreamChunk;
  agentV2ReflectionAdded: AgentThought;
  agentV2ThinkingUpdated: Array<AgentThought>;
  dealTasksUpdated: Task;
  leadTasksUpdated: Task;
  myTasksUpdated: Task;
  taskCompleted: Task;
  taskUpdated: Task;
};

export type SubscriptionAgentConversationUpdatedArgs = {
  conversationId: Scalars["ID"]["input"];
};

export type SubscriptionAgentPlanUpdatedArgs = {
  conversationId: Scalars["ID"]["input"];
};

export type SubscriptionAgentThoughtsAddedArgs = {
  conversationId: Scalars["ID"]["input"];
};

export type SubscriptionAgentV2MessageStreamArgs = {
  conversationId: Scalars["ID"]["input"];
};

export type SubscriptionAgentV2ReflectionAddedArgs = {
  conversationId: Scalars["ID"]["input"];
};

export type SubscriptionAgentV2ThinkingUpdatedArgs = {
  conversationId: Scalars["ID"]["input"];
};

export type SubscriptionDealTasksUpdatedArgs = {
  dealId: Scalars["ID"]["input"];
};

export type SubscriptionLeadTasksUpdatedArgs = {
  leadId: Scalars["ID"]["input"];
};

export type SubscriptionTaskCompletedArgs = {
  entityId?: InputMaybe<Scalars["ID"]["input"]>;
  entityType?: InputMaybe<TaskEntityType>;
};

export type SubscriptionTaskUpdatedArgs = {
  taskId?: InputMaybe<Scalars["ID"]["input"]>;
};

export type SystemNotification = {
  __typename?: "SystemNotification";
  actionUrl?: Maybe<Scalars["String"]["output"]>;
  createdAt: Scalars["DateTime"]["output"];
  dismissedAt?: Maybe<Scalars["DateTime"]["output"]>;
  entityId?: Maybe<Scalars["ID"]["output"]>;
  entityType?: Maybe<Scalars["String"]["output"]>;
  expiresAt?: Maybe<Scalars["DateTime"]["output"]>;
  id: Scalars["ID"]["output"];
  isRead: Scalars["Boolean"]["output"];
  message: Scalars["String"]["output"];
  metadata?: Maybe<Scalars["JSON"]["output"]>;
  notificationType: SystemNotificationType;
  priority: NotificationPriority;
  readAt?: Maybe<Scalars["DateTime"]["output"]>;
  title: Scalars["String"]["output"];
  updatedAt: Scalars["DateTime"]["output"];
  user?: Maybe<User>;
  userId: Scalars["ID"]["output"];
};

export enum SystemNotificationType {
  DealCloseDateApproaching = "deal_close_date_approaching",
  FileShared = "file_shared",
  LeadFollowUpDue = "lead_follow_up_due",
  SystemAnnouncement = "system_announcement",
  TaskAssigned = "task_assigned",
  TaskDueToday = "task_due_today",
  TaskOverdue = "task_overdue",
  UserAssigned = "user_assigned",
  UserMentioned = "user_mentioned",
}

export type SystemNotificationsConnection = {
  __typename?: "SystemNotificationsConnection";
  hasNextPage: Scalars["Boolean"]["output"];
  hasPreviousPage: Scalars["Boolean"]["output"];
  nodes: Array<SystemNotification>;
  totalCount: Scalars["Int"]["output"];
};

export type Task = {
  __typename?: "Task";
  actualHours?: Maybe<Scalars["Int"]["output"]>;
  affectsLeadScoring: Scalars["Boolean"]["output"];
  assignedToUser?: Maybe<User>;
  blocksStageProgression: Scalars["Boolean"]["output"];
  businessImpactScore: Scalars["Float"]["output"];
  calculatedPriority: Scalars["Float"]["output"];
  completedAt?: Maybe<Scalars["DateTime"]["output"]>;
  completionTriggersStageChange: Scalars["Boolean"]["output"];
  createdAt: Scalars["DateTime"]["output"];
  createdByUser?: Maybe<User>;
  customFieldValues: Array<CustomFieldValue>;
  deal?: Maybe<Deal>;
  dependencies: Array<TaskDependency>;
  description?: Maybe<Scalars["String"]["output"]>;
  dueDate?: Maybe<Scalars["DateTime"]["output"]>;
  entityId: Scalars["ID"]["output"];
  entityType: TaskEntityType;
  estimatedHours?: Maybe<Scalars["Int"]["output"]>;
  id: Scalars["ID"]["output"];
  lead?: Maybe<Lead>;
  organization?: Maybe<Organization>;
  parentTask?: Maybe<Task>;
  person?: Maybe<Person>;
  priority: TaskPriority;
  requiredForDealClosure: Scalars["Boolean"]["output"];
  status: TaskStatus;
  subtasks: Array<Task>;
  tags: Array<Scalars["String"]["output"]>;
  taskType: TaskType;
  title: Scalars["String"]["output"];
  updatedAt: Scalars["DateTime"]["output"];
  wfmProject?: Maybe<WfmProject>;
};

export type TaskAutomationRule = {
  __typename?: "TaskAutomationRule";
  appliesToEntityType: TaskEntityType;
  createdAt: Scalars["DateTime"]["output"];
  description?: Maybe<Scalars["String"]["output"]>;
  id: Scalars["ID"]["output"];
  isActive: Scalars["Boolean"]["output"];
  name: Scalars["String"]["output"];
  taskTemplate: Scalars["JSON"]["output"];
  triggerConditions: Scalars["JSON"]["output"];
  triggerEvent: Scalars["String"]["output"];
  updatedAt: Scalars["DateTime"]["output"];
};

export type TaskCompletionInput = {
  actualHours?: InputMaybe<Scalars["Int"]["input"]>;
  completedAt?: InputMaybe<Scalars["DateTime"]["input"]>;
  completionNotes?: InputMaybe<Scalars["String"]["input"]>;
};

export type TaskDependency = {
  __typename?: "TaskDependency";
  createdAt: Scalars["DateTime"]["output"];
  dependencyType: Scalars["String"]["output"];
  dependsOnTask: Task;
  id: Scalars["ID"]["output"];
  task: Task;
};

export enum TaskEntityType {
  Deal = "DEAL",
  Lead = "LEAD",
  Organization = "ORGANIZATION",
  Person = "PERSON",
}

export type TaskFiltersInput = {
  assignedToUserId?: InputMaybe<Scalars["ID"]["input"]>;
  createdByUserId?: InputMaybe<Scalars["ID"]["input"]>;
  dueDateFrom?: InputMaybe<Scalars["DateTime"]["input"]>;
  dueDateTo?: InputMaybe<Scalars["DateTime"]["input"]>;
  entityId?: InputMaybe<Scalars["ID"]["input"]>;
  entityType?: InputMaybe<Array<TaskEntityType>>;
  overdue?: InputMaybe<Scalars["Boolean"]["input"]>;
  priority?: InputMaybe<Array<TaskPriority>>;
  status?: InputMaybe<Array<TaskStatus>>;
  tags?: InputMaybe<Array<Scalars["String"]["input"]>>;
  taskType?: InputMaybe<Array<TaskType>>;
};

export type TaskHistory = {
  __typename?: "TaskHistory";
  action: Scalars["String"]["output"];
  changedByUser?: Maybe<User>;
  createdAt: Scalars["DateTime"]["output"];
  id: Scalars["ID"]["output"];
  newValue?: Maybe<Scalars["JSON"]["output"]>;
  oldValue?: Maybe<Scalars["JSON"]["output"]>;
  taskId?: Maybe<Scalars["ID"]["output"]>;
};

export enum TaskPriority {
  High = "HIGH",
  Low = "LOW",
  Medium = "MEDIUM",
  Urgent = "URGENT",
}

export type TaskPriorityCount = {
  __typename?: "TaskPriorityCount";
  count: Scalars["Int"]["output"];
  priority: TaskPriority;
};

export type TaskStats = {
  __typename?: "TaskStats";
  averageCompletionTime?: Maybe<Scalars["Float"]["output"]>;
  completedTasks: Scalars["Int"]["output"];
  completionRate: Scalars["Float"]["output"];
  overdueTasks: Scalars["Int"]["output"];
  tasksByPriority: Array<TaskPriorityCount>;
  tasksByStatus: Array<TaskStatusCount>;
  tasksByType: Array<TaskTypeCount>;
  totalTasks: Scalars["Int"]["output"];
};

export enum TaskStatus {
  Cancelled = "CANCELLED",
  Completed = "COMPLETED",
  InProgress = "IN_PROGRESS",
  Todo = "TODO",
  WaitingOnCustomer = "WAITING_ON_CUSTOMER",
  WaitingOnInternal = "WAITING_ON_INTERNAL",
}

export type TaskStatusCount = {
  __typename?: "TaskStatusCount";
  count: Scalars["Int"]["output"];
  status: TaskStatus;
};

export enum TaskType {
  ContractReview = "CONTRACT_REVIEW",
  CrmUpdate = "CRM_UPDATE",
  DataEnrichment = "DATA_ENRICHMENT",
  DealClosure = "DEAL_CLOSURE",
  DemoPreparation = "DEMO_PREPARATION",
  Discovery = "DISCOVERY",
  FollowUp = "FOLLOW_UP",
  LeadNurturing = "LEAD_NURTURING",
  LeadQualification = "LEAD_QUALIFICATION",
  LeadScoringReview = "LEAD_SCORING_REVIEW",
  NegotiationPrep = "NEGOTIATION_PREP",
  ProposalCreation = "PROPOSAL_CREATION",
  RelationshipBuilding = "RELATIONSHIP_BUILDING",
  RenewalPreparation = "RENEWAL_PREPARATION",
  Reporting = "REPORTING",
  StakeholderMapping = "STAKEHOLDER_MAPPING",
}

export type TaskTypeCount = {
  __typename?: "TaskTypeCount";
  count: Scalars["Int"]["output"];
  taskType: TaskType;
};

export enum ThinkingBudget {
  Standard = "STANDARD",
  Think = "THINK",
  ThinkHard = "THINK_HARD",
  ThinkHarder = "THINK_HARDER",
  Ultrathink = "ULTRATHINK",
}

export type ToolDiscoveryResponse = {
  __typename?: "ToolDiscoveryResponse";
  error?: Maybe<Scalars["String"]["output"]>;
  tools: Array<Scalars["JSON"]["output"]>;
};

export type ToolExecution = {
  __typename?: "ToolExecution";
  error?: Maybe<Scalars["String"]["output"]>;
  executionTime: Scalars["Int"]["output"];
  id: Scalars["ID"]["output"];
  input: Scalars["JSON"]["output"];
  name: Scalars["String"]["output"];
  result?: Maybe<Scalars["JSON"]["output"]>;
  status: ToolExecutionStatus;
  timestamp: Scalars["String"]["output"];
};

export enum ToolExecutionStatus {
  Error = "ERROR",
  Success = "SUCCESS",
}

export enum TriggerTypeEnum {
  EventBased = "EVENT_BASED",
  FieldChange = "FIELD_CHANGE",
  TimeBased = "TIME_BASED",
}

export type UnifiedNotification = {
  __typename?: "UnifiedNotification";
  actionUrl?: Maybe<Scalars["String"]["output"]>;
  createdAt: Scalars["DateTime"]["output"];
  dismissedAt?: Maybe<Scalars["DateTime"]["output"]>;
  entityId?: Maybe<Scalars["ID"]["output"]>;
  entityType?: Maybe<Scalars["String"]["output"]>;
  expiresAt?: Maybe<Scalars["DateTime"]["output"]>;
  id: Scalars["ID"]["output"];
  isRead: Scalars["Boolean"]["output"];
  message: Scalars["String"]["output"];
  metadata?: Maybe<Scalars["JSON"]["output"]>;
  notificationType: Scalars["String"]["output"];
  priority: Scalars["Int"]["output"];
  readAt?: Maybe<Scalars["DateTime"]["output"]>;
  source: NotificationSource;
  title: Scalars["String"]["output"];
  updatedAt: Scalars["DateTime"]["output"];
  user?: Maybe<User>;
  userId: Scalars["ID"]["output"];
};

export type UnifiedNotificationsConnection = {
  __typename?: "UnifiedNotificationsConnection";
  hasNextPage: Scalars["Boolean"]["output"];
  hasPreviousPage: Scalars["Boolean"]["output"];
  nodes: Array<UnifiedNotification>;
  totalCount: Scalars["Int"]["output"];
};

export type UpdateAppSettingInput = {
  settingKey: Scalars["String"]["input"];
  settingValue: Scalars["JSON"]["input"];
};

export type UpdateBusinessRuleInput = {
  actions?: InputMaybe<Array<RuleActionInput>>;
  conditions?: InputMaybe<Array<RuleConditionInput>>;
  description?: InputMaybe<Scalars["String"]["input"]>;
  name?: InputMaybe<Scalars["String"]["input"]>;
  status?: InputMaybe<RuleStatusEnum>;
  triggerEvents?: InputMaybe<Array<Scalars["String"]["input"]>>;
  triggerFields?: InputMaybe<Array<Scalars["String"]["input"]>>;
  wfmStatusId?: InputMaybe<Scalars["ID"]["input"]>;
  wfmStepId?: InputMaybe<Scalars["ID"]["input"]>;
  wfmWorkflowId?: InputMaybe<Scalars["ID"]["input"]>;
};

export type UpdateCalendarEventInput = {
  addGoogleMeet?: InputMaybe<Scalars["Boolean"]["input"]>;
  attendeeEmails?: InputMaybe<Array<Scalars["String"]["input"]>>;
  description?: InputMaybe<Scalars["String"]["input"]>;
  endDateTime?: InputMaybe<Scalars["DateTime"]["input"]>;
  location?: InputMaybe<Scalars["String"]["input"]>;
  nextActions?: InputMaybe<Array<Scalars["String"]["input"]>>;
  outcome?: InputMaybe<CalendarEventOutcome>;
  outcomeNotes?: InputMaybe<Scalars["String"]["input"]>;
  reminders?: InputMaybe<Array<CalendarReminderInput>>;
  startDateTime?: InputMaybe<Scalars["DateTime"]["input"]>;
  timezone?: InputMaybe<Scalars["String"]["input"]>;
  title?: InputMaybe<Scalars["String"]["input"]>;
};

export type UpdateConversationInput = {
  context?: InputMaybe<Scalars["JSON"]["input"]>;
  conversationId: Scalars["ID"]["input"];
  plan?: InputMaybe<Scalars["JSON"]["input"]>;
};

export type UpdateCurrencyInput = {
  decimalPlaces?: InputMaybe<Scalars["Int"]["input"]>;
  isActive?: InputMaybe<Scalars["Boolean"]["input"]>;
  name?: InputMaybe<Scalars["String"]["input"]>;
  symbol?: InputMaybe<Scalars["String"]["input"]>;
};

export type UpdateEmailPinInput = {
  notes?: InputMaybe<Scalars["String"]["input"]>;
};

export type UpdateStickerInput = {
  categoryId?: InputMaybe<Scalars["ID"]["input"]>;
  color?: InputMaybe<Scalars["String"]["input"]>;
  content?: InputMaybe<Scalars["String"]["input"]>;
  height?: InputMaybe<Scalars["Int"]["input"]>;
  id: Scalars["ID"]["input"];
  isPinned?: InputMaybe<Scalars["Boolean"]["input"]>;
  isPrivate?: InputMaybe<Scalars["Boolean"]["input"]>;
  mentions?: InputMaybe<Array<Scalars["ID"]["input"]>>;
  positionX?: InputMaybe<Scalars["Int"]["input"]>;
  positionY?: InputMaybe<Scalars["Int"]["input"]>;
  priority?: InputMaybe<StickerPriority>;
  tags?: InputMaybe<Array<Scalars["String"]["input"]>>;
  title?: InputMaybe<Scalars["String"]["input"]>;
  width?: InputMaybe<Scalars["Int"]["input"]>;
};

export type UpdateSystemNotificationInput = {
  dismissedAt?: InputMaybe<Scalars["DateTime"]["input"]>;
  isRead?: InputMaybe<Scalars["Boolean"]["input"]>;
};

export type UpdateTaskAutomationRuleInput = {
  appliesToEntityType?: InputMaybe<TaskEntityType>;
  description?: InputMaybe<Scalars["String"]["input"]>;
  isActive?: InputMaybe<Scalars["Boolean"]["input"]>;
  name?: InputMaybe<Scalars["String"]["input"]>;
  taskTemplate?: InputMaybe<Scalars["JSON"]["input"]>;
  triggerConditions?: InputMaybe<Scalars["JSON"]["input"]>;
  triggerEvent?: InputMaybe<Scalars["String"]["input"]>;
};

export type UpdateTaskInput = {
  actualHours?: InputMaybe<Scalars["Int"]["input"]>;
  affectsLeadScoring?: InputMaybe<Scalars["Boolean"]["input"]>;
  assignedToUserId?: InputMaybe<Scalars["ID"]["input"]>;
  blocksStageProgression?: InputMaybe<Scalars["Boolean"]["input"]>;
  completedAt?: InputMaybe<Scalars["DateTime"]["input"]>;
  completionTriggersStageChange?: InputMaybe<Scalars["Boolean"]["input"]>;
  customFieldValues?: InputMaybe<Array<CustomFieldValueInput>>;
  description?: InputMaybe<Scalars["String"]["input"]>;
  dueDate?: InputMaybe<Scalars["DateTime"]["input"]>;
  estimatedHours?: InputMaybe<Scalars["Int"]["input"]>;
  priority?: InputMaybe<TaskPriority>;
  requiredForDealClosure?: InputMaybe<Scalars["Boolean"]["input"]>;
  status?: InputMaybe<TaskStatus>;
  tags?: InputMaybe<Array<Scalars["String"]["input"]>>;
  taskType?: InputMaybe<TaskType>;
  title?: InputMaybe<Scalars["String"]["input"]>;
};

export type UpdateUserCurrencyPreferencesInput = {
  defaultCurrency?: InputMaybe<Scalars["String"]["input"]>;
  displayCurrency?: InputMaybe<Scalars["String"]["input"]>;
};

/**
 * Input type for updating a user's profile.
 * Only fields intended for update should be included.
 */
export type UpdateUserProfileInput = {
  /** The new avatar URL for the user. Null means no change. */
  avatar_url?: InputMaybe<Scalars["String"]["input"]>;
  /** The new display name for the user. Null means no change. */
  display_name?: InputMaybe<Scalars["String"]["input"]>;
};

export type UpdateWfmProjectTypeInput = {
  defaultWorkflowId?: InputMaybe<Scalars["ID"]["input"]>;
  description?: InputMaybe<Scalars["String"]["input"]>;
  iconName?: InputMaybe<Scalars["String"]["input"]>;
  isArchived?: InputMaybe<Scalars["Boolean"]["input"]>;
  name?: InputMaybe<Scalars["String"]["input"]>;
};

export type UpdateWfmStatusInput = {
  color?: InputMaybe<Scalars["String"]["input"]>;
  description?: InputMaybe<Scalars["String"]["input"]>;
  isArchived?: InputMaybe<Scalars["Boolean"]["input"]>;
  name?: InputMaybe<Scalars["String"]["input"]>;
};

export type UpdateWfmWorkflowInput = {
  description?: InputMaybe<Scalars["String"]["input"]>;
  isArchived?: InputMaybe<Scalars["Boolean"]["input"]>;
  name?: InputMaybe<Scalars["String"]["input"]>;
};

export type UpdateWfmWorkflowStepInput = {
  isFinalStep?: InputMaybe<Scalars["Boolean"]["input"]>;
  isInitialStep?: InputMaybe<Scalars["Boolean"]["input"]>;
  metadata?: InputMaybe<Scalars["JSON"]["input"]>;
  statusId?: InputMaybe<Scalars["ID"]["input"]>;
  stepOrder?: InputMaybe<Scalars["Int"]["input"]>;
};

export type UpdateWfmWorkflowTransitionInput = {
  name?: InputMaybe<Scalars["String"]["input"]>;
};

export type UploadFileInput = {
  category?: InputMaybe<DocumentCategory>;
  content: Scalars["String"]["input"];
  dealId?: InputMaybe<Scalars["ID"]["input"]>;
  mimeType: Scalars["String"]["input"];
  name: Scalars["String"]["input"];
  parentFolderId?: InputMaybe<Scalars["String"]["input"]>;
};

export type User = {
  __typename?: "User";
  avatar_url?: Maybe<Scalars["String"]["output"]>;
  display_name?: Maybe<Scalars["String"]["output"]>;
  email: Scalars["String"]["output"];
  id: Scalars["ID"]["output"];
  roles: Array<Role>;
};

export type UserCurrencyPreferences = {
  __typename?: "UserCurrencyPreferences";
  createdAt: Scalars["String"]["output"];
  defaultCurrency: Scalars["String"]["output"];
  displayCurrency: Scalars["String"]["output"];
  updatedAt: Scalars["String"]["output"];
  userId: Scalars["ID"]["output"];
};

/** Represents a specific instance of a workflow being executed for a particular entity (e.g., a deal, a task). */
export type WfmProject = {
  __typename?: "WFMProject";
  completedAt?: Maybe<Scalars["DateTime"]["output"]>;
  completedBy?: Maybe<User>;
  createdAt: Scalars["DateTime"]["output"];
  createdBy?: Maybe<User>;
  currentStep?: Maybe<WfmWorkflowStep>;
  description?: Maybe<Scalars["String"]["output"]>;
  id: Scalars["ID"]["output"];
  isActive: Scalars["Boolean"]["output"];
  metadata?: Maybe<Scalars["JSON"]["output"]>;
  name: Scalars["String"]["output"];
  projectType: WfmProjectType;
  updatedAt: Scalars["DateTime"]["output"];
  updatedBy?: Maybe<User>;
  workflow: WfmWorkflow;
};

export type WfmProjectType = {
  __typename?: "WFMProjectType";
  createdAt: Scalars["DateTime"]["output"];
  createdByUser?: Maybe<User>;
  defaultWorkflow?: Maybe<WfmWorkflow>;
  description?: Maybe<Scalars["String"]["output"]>;
  iconName?: Maybe<Scalars["String"]["output"]>;
  id: Scalars["ID"]["output"];
  isArchived: Scalars["Boolean"]["output"];
  name: Scalars["String"]["output"];
  updatedAt: Scalars["DateTime"]["output"];
  updatedByUser?: Maybe<User>;
};

export type WfmStatus = {
  __typename?: "WFMStatus";
  color?: Maybe<Scalars["String"]["output"]>;
  createdAt: Scalars["DateTime"]["output"];
  createdByUser?: Maybe<User>;
  description?: Maybe<Scalars["String"]["output"]>;
  id: Scalars["ID"]["output"];
  isArchived: Scalars["Boolean"]["output"];
  name: Scalars["String"]["output"];
  updatedAt: Scalars["DateTime"]["output"];
  updatedByUser?: Maybe<User>;
};

export type WfmStatusMutationResponse = {
  __typename?: "WFMStatusMutationResponse";
  message?: Maybe<Scalars["String"]["output"]>;
  status?: Maybe<WfmStatus>;
  success: Scalars["Boolean"]["output"];
};

export type WfmWorkflow = {
  __typename?: "WFMWorkflow";
  createdAt: Scalars["DateTime"]["output"];
  createdByUser?: Maybe<User>;
  description?: Maybe<Scalars["String"]["output"]>;
  id: Scalars["ID"]["output"];
  isArchived: Scalars["Boolean"]["output"];
  name: Scalars["String"]["output"];
  steps?: Maybe<Array<WfmWorkflowStep>>;
  transitions?: Maybe<Array<WfmWorkflowTransition>>;
  updatedAt: Scalars["DateTime"]["output"];
  updatedByUser?: Maybe<User>;
};

export type WfmWorkflowStep = {
  __typename?: "WFMWorkflowStep";
  createdAt: Scalars["DateTime"]["output"];
  id: Scalars["ID"]["output"];
  isFinalStep: Scalars["Boolean"]["output"];
  isInitialStep: Scalars["Boolean"]["output"];
  metadata?: Maybe<Scalars["JSON"]["output"]>;
  status: WfmStatus;
  stepOrder: Scalars["Int"]["output"];
  updatedAt: Scalars["DateTime"]["output"];
};

export type WfmWorkflowStepMutationResponse = {
  __typename?: "WFMWorkflowStepMutationResponse";
  message?: Maybe<Scalars["String"]["output"]>;
  stepId?: Maybe<Scalars["ID"]["output"]>;
  success: Scalars["Boolean"]["output"];
};

export type WfmWorkflowTransition = {
  __typename?: "WFMWorkflowTransition";
  createdAt: Scalars["DateTime"]["output"];
  fromStep: WfmWorkflowStep;
  id: Scalars["ID"]["output"];
  name?: Maybe<Scalars["String"]["output"]>;
  toStep: WfmWorkflowStep;
  updatedAt: Scalars["DateTime"]["output"];
};

export type WfmWorkflowTransitionMutationResponse = {
  __typename?: "WFMWorkflowTransitionMutationResponse";
  message?: Maybe<Scalars["String"]["output"]>;
  success: Scalars["Boolean"]["output"];
  transitionId?: Maybe<Scalars["ID"]["output"]>;
};

export type GetAssignableUsersForCreateOrgQueryVariables = Exact<{
  [key: string]: never;
}>;

export type GetAssignableUsersForCreateOrgQuery = {
  __typename?: "Query";
  assignableUsers: Array<{
    __typename?: "User";
    id: string;
    display_name?: string | null;
    email: string;
    avatar_url?: string | null;
  }>;
};

export type GetAssignableUsersForEditOrgQueryVariables = Exact<{
  [key: string]: never;
}>;

export type GetAssignableUsersForEditOrgQuery = {
  __typename?: "Query";
  assignableUsers: Array<{
    __typename?: "User";
    id: string;
    display_name?: string | null;
    email: string;
    avatar_url?: string | null;
  }>;
};

export type GetAssignableUsersForAccountMgmtQueryVariables = Exact<{
  [key: string]: never;
}>;

export type GetAssignableUsersForAccountMgmtQuery = {
  __typename?: "Query";
  assignableUsers: Array<{
    __typename?: "User";
    id: string;
    display_name?: string | null;
    email: string;
    avatar_url?: string | null;
  }>;
};

export type GetAgentThoughtsQueryVariables = Exact<{
  conversationId: Scalars["ID"]["input"];
  limit?: InputMaybe<Scalars["Int"]["input"]>;
}>;

export type GetAgentThoughtsQuery = {
  __typename?: "Query";
  agentThoughts: Array<{
    __typename?: "AgentThought";
    id: string;
    conversationId: string;
    type: AgentThoughtType;
    content: string;
    metadata: Record<string, any>;
    timestamp: string;
  }>;
};

export type SyncCalendarEventsMutationVariables = Exact<{
  calendarId?: InputMaybe<Scalars["String"]["input"]>;
  fullSync?: InputMaybe<Scalars["Boolean"]["input"]>;
  daysPast?: InputMaybe<Scalars["Int"]["input"]>;
  daysFuture?: InputMaybe<Scalars["Int"]["input"]>;
}>;

export type SyncCalendarEventsMutation = {
  __typename?: "Mutation";
  syncCalendarEvents: {
    __typename?: "CalendarSyncStatus";
    lastSyncAt?: string | null;
    isConnected: boolean;
    hasSyncErrors: boolean;
    errorMessage?: string | null;
    eventsCount: number;
  };
};

export type ComposeEmailMutationVariables = Exact<{
  input: ComposeEmailInput;
}>;

export type ComposeEmailMutation = {
  __typename?: "Mutation";
  composeEmail: {
    __typename?: "EmailMessage";
    id: string;
    subject: string;
    from: string;
    to: Array<string>;
    timestamp: string;
  };
};

export type ConvertDealToLeadModalMutationVariables = Exact<{
  id: Scalars["ID"]["input"];
  input: DealToLeadConversionInput;
}>;

export type ConvertDealToLeadModalMutation = {
  __typename?: "Mutation";
  convertDealToLead: {
    __typename?: "DealToLeadConversionResult";
    success: boolean;
    message: string;
    conversionId: string;
    lead?: {
      __typename?: "Lead";
      id: string;
      name: string;
      estimated_value?: number | null;
      contact_name?: string | null;
      company_name?: string | null;
    } | null;
  };
};

export type ConvertLeadMutationVariables = Exact<{
  id: Scalars["ID"]["input"];
  input: LeadConversionInput;
}>;

export type ConvertLeadMutation = {
  __typename?: "Mutation";
  convertLead: {
    __typename?: "LeadConversionResult";
    leadId: string;
    convertedEntities: {
      __typename?: "ConvertedEntities";
      person?: {
        __typename?: "Person";
        id: string;
        first_name?: string | null;
        last_name?: string | null;
        email?: string | null;
      } | null;
      organization?: {
        __typename?: "Organization";
        id: string;
        name: string;
      } | null;
      deal?: {
        __typename?: "Deal";
        id: string;
        name: string;
        amount?: number | null;
        currency?: string | null;
      } | null;
    };
  };
};

export type GetProjectTypesQueryVariables = Exact<{ [key: string]: never }>;

export type GetProjectTypesQuery = {
  __typename?: "Query";
  wfmProjectTypes: Array<{
    __typename?: "WFMProjectType";
    id: string;
    name: string;
  }>;
};

export type CreateContactFromEmailMutationVariables = Exact<{
  input: CreateContactFromEmailInput;
}>;

export type CreateContactFromEmailMutation = {
  __typename?: "Mutation";
  createContactFromEmail: {
    __typename?: "Person";
    id: string;
    first_name?: string | null;
    last_name?: string | null;
    email?: string | null;
  };
};

export type GetOrganizationsForContactQueryVariables = Exact<{
  [key: string]: never;
}>;

export type GetOrganizationsForContactQuery = {
  __typename?: "Query";
  organizations: Array<{
    __typename?: "Organization";
    id: string;
    name: string;
  }>;
};

export type GetEmailThreadsQueryVariables = Exact<{
  filter: EmailThreadsFilterInput;
}>;

export type GetEmailThreadsQuery = {
  __typename?: "Query";
  getEmailThreads: {
    __typename?: "EmailThreadConnection";
    totalCount: number;
    hasNextPage: boolean;
    nextPageToken?: string | null;
    threads: Array<{
      __typename?: "EmailThread";
      id: string;
      subject: string;
      participants: Array<string>;
      messageCount: number;
      isUnread: boolean;
      lastActivity: string;
      latestMessage?: {
        __typename?: "EmailMessage";
        id: string;
        from: string;
        body: string;
        timestamp: string;
        hasAttachments: boolean;
      } | null;
    }>;
  };
};

export type GetEmailThreadQueryVariables = Exact<{
  threadId: Scalars["String"]["input"];
}>;

export type GetEmailThreadQuery = {
  __typename?: "Query";
  getEmailThread?: {
    __typename?: "EmailThread";
    id: string;
    subject: string;
    participants: Array<string>;
    messageCount: number;
    isUnread: boolean;
    lastActivity: string;
    latestMessage?: {
      __typename?: "EmailMessage";
      id: string;
      threadId: string;
      subject: string;
      from: string;
      to: Array<string>;
      cc?: Array<string> | null;
      bcc?: Array<string> | null;
      body: string;
      htmlBody?: string | null;
      timestamp: string;
      isUnread: boolean;
      hasAttachments: boolean;
      importance?: EmailImportance | null;
      attachments?: Array<{
        __typename?: "EmailAttachment";
        id: string;
        filename: string;
        mimeType: string;
        size: number;
      }> | null;
    } | null;
  } | null;
};

export type GetEmailAnalyticsQueryVariables = Exact<{
  dealId: Scalars["String"]["input"];
}>;

export type GetEmailAnalyticsQuery = {
  __typename?: "Query";
  getEmailAnalytics?: {
    __typename?: "EmailAnalytics";
    totalThreads: number;
    unreadCount: number;
    avgResponseTime?: string | null;
    lastContactTime?: string | null;
    emailSentiment?: string | null;
    responseRate?: number | null;
  } | null;
};

export type MarkThreadAsReadMutationVariables = Exact<{
  threadId: Scalars["String"]["input"];
}>;

export type MarkThreadAsReadMutation = {
  __typename?: "Mutation";
  markThreadAsRead: boolean;
};

export type CreateStickerMutationVariables = Exact<{
  input: CreateStickerInput;
}>;

export type CreateStickerMutation = {
  __typename?: "Mutation";
  createSticker: {
    __typename?: "SmartSticker";
    id: string;
    title: string;
    content?: string | null;
    entityType: EntityType;
    entityId: string;
    positionX: number;
    positionY: number;
    width: number;
    height: number;
    color: string;
    isPinned: boolean;
    isPrivate: boolean;
    priority: StickerPriority;
    mentions: Array<string>;
    tags: Array<string>;
    createdAt: string;
    updatedAt: string;
    createdByUserId: string;
    category?: {
      __typename?: "StickerCategory";
      id: string;
      name: string;
      color: string;
      icon?: string | null;
    } | null;
  };
};

export type PinEmailMutationVariables = Exact<{
  input: PinEmailInput;
}>;

export type PinEmailMutation = {
  __typename?: "Mutation";
  pinEmail: {
    __typename?: "EmailPin";
    id: string;
    emailId: string;
    threadId: string;
    subject?: string | null;
    fromEmail?: string | null;
    pinnedAt: string;
    notes?: string | null;
  };
};

export type GetPinnedEmailsForDealQueryVariables = Exact<{
  dealId: Scalars["ID"]["input"];
}>;

export type GetPinnedEmailsForDealQuery = {
  __typename?: "Query";
  getPinnedEmails: Array<{
    __typename?: "EmailPin";
    id: string;
    emailId: string;
    threadId: string;
    subject?: string | null;
    fromEmail?: string | null;
    pinnedAt: string;
    notes?: string | null;
  }>;
};

export type UnpinEmailMutationVariables = Exact<{
  id: Scalars["ID"]["input"];
}>;

export type UnpinEmailMutation = {
  __typename?: "Mutation";
  unpinEmail: boolean;
};

export type GetDealWorkflowStepsQueryVariables = Exact<{
  dealId: Scalars["ID"]["input"];
}>;

export type GetDealWorkflowStepsQuery = {
  __typename?: "Query";
  deal?: {
    __typename?: "Deal";
    id: string;
    wfmProject?: {
      __typename?: "WFMProject";
      id: string;
      workflow: {
        __typename?: "WFMWorkflow";
        id: string;
        name: string;
        steps?: Array<{
          __typename?: "WFMWorkflowStep";
          id: string;
          stepOrder: number;
          isInitialStep: boolean;
          isFinalStep: boolean;
          status: {
            __typename?: "WFMStatus";
            id: string;
            name: string;
            color?: string | null;
          };
        }> | null;
      };
    } | null;
  } | null;
};

export type GetDealParticipantsQueryVariables = Exact<{
  dealId: Scalars["ID"]["input"];
}>;

export type GetDealParticipantsQuery = {
  __typename?: "Query";
  getDealParticipants: Array<{
    __typename?: "DealParticipant";
    id: string;
    role: ContactRoleType;
    addedFromEmail: boolean;
    person: {
      __typename?: "Person";
      id: string;
      first_name?: string | null;
      last_name?: string | null;
      email?: string | null;
    };
  }>;
};

export type SuggestEmailParticipantsQueryVariables = Exact<{
  dealId: Scalars["ID"]["input"];
  threadId?: InputMaybe<Scalars["String"]["input"]>;
}>;

export type SuggestEmailParticipantsQuery = {
  __typename?: "Query";
  suggestEmailParticipants: Array<{
    __typename?: "Person";
    id: string;
    first_name?: string | null;
    last_name?: string | null;
    email?: string | null;
  }>;
};

export type GenerateTaskContentFromEmailMutationVariables = Exact<{
  input: GenerateTaskContentInput;
}>;

export type GenerateTaskContentFromEmailMutation = {
  __typename?: "Mutation";
  generateTaskContentFromEmail: {
    __typename?: "AIGeneratedTaskContent";
    subject: string;
    description: string;
    suggestedDueDate?: string | null;
    confidence: number;
    emailScope: string;
    sourceContent: string;
  };
};

export type GetPinnedEmailsQueryVariables = Exact<{
  dealId: Scalars["ID"]["input"];
}>;

export type GetPinnedEmailsQuery = {
  __typename?: "Query";
  getPinnedEmails: Array<{
    __typename?: "EmailPin";
    id: string;
    emailId: string;
    threadId: string;
    subject?: string | null;
    fromEmail?: string | null;
    pinnedAt: string;
    notes?: string | null;
    createdAt: string;
    updatedAt: string;
  }>;
};

export type UpdateEmailPinMutationVariables = Exact<{
  id: Scalars["ID"]["input"];
  input: UpdateEmailPinInput;
}>;

export type UpdateEmailPinMutation = {
  __typename?: "Mutation";
  updateEmailPin: {
    __typename?: "EmailPin";
    id: string;
    notes?: string | null;
    updatedAt: string;
  };
};

export type GetNotificationSummaryQueryVariables = Exact<{
  [key: string]: never;
}>;

export type GetNotificationSummaryQuery = {
  __typename?: "Query";
  notificationSummary: {
    __typename?: "NotificationSummary";
    totalCount: number;
    unreadCount: number;
    businessRuleCount: number;
    systemCount: number;
    highPriorityCount: number;
  };
};

export type GetUnifiedNotificationsQueryVariables = Exact<{
  first?: InputMaybe<Scalars["Int"]["input"]>;
  filters?: InputMaybe<NotificationFilters>;
}>;

export type GetUnifiedNotificationsQuery = {
  __typename?: "Query";
  unifiedNotifications: {
    __typename?: "UnifiedNotificationsConnection";
    totalCount: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    nodes: Array<{
      __typename?: "UnifiedNotification";
      source: NotificationSource;
      id: string;
      title: string;
      message: string;
      notificationType: string;
      priority: number;
      entityType?: string | null;
      entityId?: string | null;
      actionUrl?: string | null;
      isRead: boolean;
      readAt?: string | null;
      dismissedAt?: string | null;
      expiresAt?: string | null;
      createdAt: string;
      updatedAt: string;
    }>;
  };
};

export type MarkSystemNotificationAsReadMutationVariables = Exact<{
  id: Scalars["ID"]["input"];
}>;

export type MarkSystemNotificationAsReadMutation = {
  __typename?: "Mutation";
  markSystemNotificationAsRead: boolean;
};

export type MarkAllSystemNotificationsAsReadMutationVariables = Exact<{
  [key: string]: never;
}>;

export type MarkAllSystemNotificationsAsReadMutation = {
  __typename?: "Mutation";
  markAllSystemNotificationsAsRead: number;
};

export type MarkBusinessRuleNotificationAsReadMutationVariables = Exact<{
  id: Scalars["ID"]["input"];
}>;

export type MarkBusinessRuleNotificationAsReadMutation = {
  __typename?: "Mutation";
  markBusinessRuleNotificationAsRead: boolean;
};

export type MarkAllBusinessRuleNotificationsAsReadMutationVariables = Exact<{
  [key: string]: never;
}>;

export type MarkAllBusinessRuleNotificationsAsReadMutation = {
  __typename?: "Mutation";
  markAllBusinessRuleNotificationsAsRead: number;
};

export type DismissSystemNotificationMutationVariables = Exact<{
  id: Scalars["ID"]["input"];
}>;

export type DismissSystemNotificationMutation = {
  __typename?: "Mutation";
  dismissSystemNotification: boolean;
};

export type UpdateUserProfileMutationVariables = Exact<{
  input: UpdateUserProfileInput;
}>;

export type UpdateUserProfileMutation = {
  __typename?: "Mutation";
  updateUserProfile?: {
    __typename?: "User";
    id: string;
    email: string;
    display_name?: string | null;
    avatar_url?: string | null;
  } | null;
};

export type TaskFragmentFragment = {
  __typename?: "Task";
  id: string;
  title: string;
  description?: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  taskType: TaskType;
  dueDate?: string | null;
  completedAt?: string | null;
  blocksStageProgression: boolean;
  requiredForDealClosure: boolean;
  calculatedPriority: number;
  businessImpactScore: number;
  tags: Array<string>;
  estimatedHours?: number | null;
  actualHours?: number | null;
  createdAt: string;
  updatedAt: string;
  assignedToUser?: {
    __typename?: "User";
    id: string;
    display_name?: string | null;
    email: string;
  } | null;
  createdByUser?: {
    __typename?: "User";
    id: string;
    display_name?: string | null;
    email: string;
  } | null;
};

export type GetTasksForDealQueryVariables = Exact<{
  dealId: Scalars["ID"]["input"];
  filters?: InputMaybe<TaskFiltersInput>;
}>;

export type GetTasksForDealQuery = {
  __typename?: "Query";
  tasksForDeal: Array<{
    __typename?: "Task";
    id: string;
    title: string;
    description?: string | null;
    status: TaskStatus;
    priority: TaskPriority;
    taskType: TaskType;
    dueDate?: string | null;
    completedAt?: string | null;
    blocksStageProgression: boolean;
    requiredForDealClosure: boolean;
    calculatedPriority: number;
    businessImpactScore: number;
    tags: Array<string>;
    estimatedHours?: number | null;
    actualHours?: number | null;
    createdAt: string;
    updatedAt: string;
    assignedToUser?: {
      __typename?: "User";
      id: string;
      display_name?: string | null;
      email: string;
    } | null;
    createdByUser?: {
      __typename?: "User";
      id: string;
      display_name?: string | null;
      email: string;
    } | null;
  }>;
};

export type GetTasksForLeadQueryVariables = Exact<{
  leadId: Scalars["ID"]["input"];
  filters?: InputMaybe<TaskFiltersInput>;
}>;

export type GetTasksForLeadQuery = {
  __typename?: "Query";
  tasksForLead: Array<{
    __typename?: "Task";
    id: string;
    title: string;
    description?: string | null;
    status: TaskStatus;
    priority: TaskPriority;
    taskType: TaskType;
    dueDate?: string | null;
    completedAt?: string | null;
    blocksStageProgression: boolean;
    requiredForDealClosure: boolean;
    calculatedPriority: number;
    businessImpactScore: number;
    tags: Array<string>;
    estimatedHours?: number | null;
    actualHours?: number | null;
    createdAt: string;
    updatedAt: string;
    assignedToUser?: {
      __typename?: "User";
      id: string;
      display_name?: string | null;
      email: string;
    } | null;
    createdByUser?: {
      __typename?: "User";
      id: string;
      display_name?: string | null;
      email: string;
    } | null;
  }>;
};

export type GetMyTasksQueryVariables = Exact<{
  filters?: InputMaybe<TaskFiltersInput>;
}>;

export type GetMyTasksQuery = {
  __typename?: "Query";
  myTasks: Array<{
    __typename?: "Task";
    id: string;
    title: string;
    description?: string | null;
    status: TaskStatus;
    priority: TaskPriority;
    taskType: TaskType;
    dueDate?: string | null;
    completedAt?: string | null;
    blocksStageProgression: boolean;
    requiredForDealClosure: boolean;
    calculatedPriority: number;
    businessImpactScore: number;
    tags: Array<string>;
    estimatedHours?: number | null;
    actualHours?: number | null;
    createdAt: string;
    updatedAt: string;
    assignedToUser?: {
      __typename?: "User";
      id: string;
      display_name?: string | null;
      email: string;
    } | null;
    createdByUser?: {
      __typename?: "User";
      id: string;
      display_name?: string | null;
      email: string;
    } | null;
  }>;
};

export type GetMyOverdueTasksQueryVariables = Exact<{ [key: string]: never }>;

export type GetMyOverdueTasksQuery = {
  __typename?: "Query";
  myOverdueTasks: Array<{
    __typename?: "Task";
    id: string;
    title: string;
    description?: string | null;
    status: TaskStatus;
    priority: TaskPriority;
    taskType: TaskType;
    dueDate?: string | null;
    completedAt?: string | null;
    blocksStageProgression: boolean;
    requiredForDealClosure: boolean;
    calculatedPriority: number;
    businessImpactScore: number;
    tags: Array<string>;
    estimatedHours?: number | null;
    actualHours?: number | null;
    createdAt: string;
    updatedAt: string;
    assignedToUser?: {
      __typename?: "User";
      id: string;
      display_name?: string | null;
      email: string;
    } | null;
    createdByUser?: {
      __typename?: "User";
      id: string;
      display_name?: string | null;
      email: string;
    } | null;
  }>;
};

export type CreateTaskMutationVariables = Exact<{
  input: CreateTaskInput;
}>;

export type CreateTaskMutation = {
  __typename?: "Mutation";
  createTask: {
    __typename?: "Task";
    id: string;
    title: string;
    description?: string | null;
    status: TaskStatus;
    priority: TaskPriority;
    taskType: TaskType;
    dueDate?: string | null;
    completedAt?: string | null;
    blocksStageProgression: boolean;
    requiredForDealClosure: boolean;
    calculatedPriority: number;
    businessImpactScore: number;
    tags: Array<string>;
    estimatedHours?: number | null;
    actualHours?: number | null;
    createdAt: string;
    updatedAt: string;
    assignedToUser?: {
      __typename?: "User";
      id: string;
      display_name?: string | null;
      email: string;
    } | null;
    createdByUser?: {
      __typename?: "User";
      id: string;
      display_name?: string | null;
      email: string;
    } | null;
  };
};

export type UpdateTaskMutationVariables = Exact<{
  id: Scalars["ID"]["input"];
  input: UpdateTaskInput;
}>;

export type UpdateTaskMutation = {
  __typename?: "Mutation";
  updateTask: {
    __typename?: "Task";
    id: string;
    title: string;
    description?: string | null;
    status: TaskStatus;
    priority: TaskPriority;
    taskType: TaskType;
    dueDate?: string | null;
    completedAt?: string | null;
    blocksStageProgression: boolean;
    requiredForDealClosure: boolean;
    calculatedPriority: number;
    businessImpactScore: number;
    tags: Array<string>;
    estimatedHours?: number | null;
    actualHours?: number | null;
    createdAt: string;
    updatedAt: string;
    assignedToUser?: {
      __typename?: "User";
      id: string;
      display_name?: string | null;
      email: string;
    } | null;
    createdByUser?: {
      __typename?: "User";
      id: string;
      display_name?: string | null;
      email: string;
    } | null;
  };
};

export type DeleteTaskMutationVariables = Exact<{
  id: Scalars["ID"]["input"];
}>;

export type DeleteTaskMutation = {
  __typename?: "Mutation";
  deleteTask: boolean;
};

export type CompleteTaskMutationVariables = Exact<{
  id: Scalars["ID"]["input"];
  completionData?: InputMaybe<TaskCompletionInput>;
}>;

export type CompleteTaskMutation = {
  __typename?: "Mutation";
  completeTask: {
    __typename?: "Task";
    id: string;
    title: string;
    description?: string | null;
    status: TaskStatus;
    priority: TaskPriority;
    taskType: TaskType;
    dueDate?: string | null;
    completedAt?: string | null;
    blocksStageProgression: boolean;
    requiredForDealClosure: boolean;
    calculatedPriority: number;
    businessImpactScore: number;
    tags: Array<string>;
    estimatedHours?: number | null;
    actualHours?: number | null;
    createdAt: string;
    updatedAt: string;
    assignedToUser?: {
      __typename?: "User";
      id: string;
      display_name?: string | null;
      email: string;
    } | null;
    createdByUser?: {
      __typename?: "User";
      id: string;
      display_name?: string | null;
      email: string;
    } | null;
  };
};

export type GetTaskStatsQueryVariables = Exact<{
  entityType?: InputMaybe<TaskEntityType>;
  entityId?: InputMaybe<Scalars["ID"]["input"]>;
}>;

export type GetTaskStatsQuery = {
  __typename?: "Query";
  taskStats: {
    __typename?: "TaskStats";
    totalTasks: number;
    completedTasks: number;
    overdueTasks: number;
    averageCompletionTime?: number | null;
    completionRate: number;
    tasksByStatus: Array<{
      __typename?: "TaskStatusCount";
      status: TaskStatus;
      count: number;
    }>;
    tasksByPriority: Array<{
      __typename?: "TaskPriorityCount";
      priority: TaskPriority;
      count: number;
    }>;
    tasksByType: Array<{
      __typename?: "TaskTypeCount";
      taskType: TaskType;
      count: number;
    }>;
  };
};

export type GetDealTaskIndicatorsQueryVariables = Exact<{
  dealIds: Array<Scalars["ID"]["input"]> | Scalars["ID"]["input"];
}>;

export type GetDealTaskIndicatorsQuery = {
  __typename?: "Query";
  dealTaskIndicators: Array<{
    __typename?: "DealTaskIndicator";
    dealId: string;
    tasksDueToday: number;
    tasksOverdue: number;
    totalActiveTasks: number;
  }>;
};

export type GetCurrenciesQueryVariables = Exact<{ [key: string]: never }>;

export type GetCurrenciesQuery = {
  __typename?: "Query";
  currencies: Array<{
    __typename?: "Currency";
    code: string;
    name: string;
    symbol: string;
    decimalPlaces: number;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
  }>;
};

export type GetCurrencyQueryVariables = Exact<{
  code: Scalars["String"]["input"];
}>;

export type GetCurrencyQuery = {
  __typename?: "Query";
  currency?: {
    __typename?: "Currency";
    code: string;
    name: string;
    symbol: string;
    decimalPlaces: number;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
  } | null;
};

export type GetExchangeRateQueryVariables = Exact<{
  fromCurrency: Scalars["String"]["input"];
  toCurrency: Scalars["String"]["input"];
  effectiveDate?: InputMaybe<Scalars["String"]["input"]>;
}>;

export type GetExchangeRateQuery = {
  __typename?: "Query";
  exchangeRate?: {
    __typename?: "ExchangeRate";
    id: string;
    fromCurrency: string;
    toCurrency: string;
    rate: number;
    effectiveDate: string;
    source: string;
    createdAt: string;
    updatedAt: string;
  } | null;
};

export type ConvertCurrencyMutationVariables = Exact<{
  amount: Scalars["Float"]["input"];
  fromCurrency: Scalars["String"]["input"];
  toCurrency: Scalars["String"]["input"];
  effectiveDate?: InputMaybe<Scalars["String"]["input"]>;
}>;

export type ConvertCurrencyMutation = {
  __typename?: "Mutation";
  convertCurrency: {
    __typename?: "ConversionResult";
    originalAmount: number;
    originalCurrency: string;
    convertedAmount: number;
    convertedCurrency: string;
    exchangeRate: number;
    effectiveDate: string;
    formattedOriginal: string;
    formattedConverted: string;
  };
};

export type GetUserCurrencyPreferencesQueryVariables = Exact<{
  userId: Scalars["ID"]["input"];
}>;

export type GetUserCurrencyPreferencesQuery = {
  __typename?: "Query";
  userCurrencyPreferences?: {
    __typename?: "UserCurrencyPreferences";
    userId: string;
    defaultCurrency: string;
    displayCurrency: string;
    createdAt: string;
    updatedAt: string;
  } | null;
};

export type UpdateUserCurrencyPreferencesMutationVariables = Exact<{
  userId: Scalars["ID"]["input"];
  input: UpdateUserCurrencyPreferencesInput;
}>;

export type UpdateUserCurrencyPreferencesMutation = {
  __typename?: "Mutation";
  updateUserCurrencyPreferences: {
    __typename?: "UserCurrencyPreferences";
    userId: string;
    defaultCurrency: string;
    displayCurrency: string;
    createdAt: string;
    updatedAt: string;
  };
};

export type GetDealCustomFieldDefinitionsQueryVariables = Exact<{
  [key: string]: never;
}>;

export type GetDealCustomFieldDefinitionsQuery = {
  __typename?: "Query";
  customFieldDefinitions: Array<{
    __typename?: "CustomFieldDefinition";
    id: string;
    fieldName: string;
    fieldLabel: string;
    fieldType: CustomFieldType;
    dropdownOptions?: Array<{
      __typename?: "CustomFieldOption";
      value: string;
      label: string;
    }> | null;
  }>;
};

export type GetAllCustomFieldDefinitionsQueryVariables = Exact<{
  includeInactive?: InputMaybe<Scalars["Boolean"]["input"]>;
}>;

export type GetAllCustomFieldDefinitionsQuery = {
  __typename?: "Query";
  dealCustomFields: Array<{
    __typename?: "CustomFieldDefinition";
    id: string;
    fieldName: string;
    fieldLabel: string;
    fieldType: CustomFieldType;
    entityType: CustomFieldEntityType;
    isActive: boolean;
    dropdownOptions?: Array<{
      __typename?: "CustomFieldOption";
      value: string;
      label: string;
    }> | null;
  }>;
  personCustomFields: Array<{
    __typename?: "CustomFieldDefinition";
    id: string;
    fieldName: string;
    fieldLabel: string;
    fieldType: CustomFieldType;
    entityType: CustomFieldEntityType;
    isActive: boolean;
    dropdownOptions?: Array<{
      __typename?: "CustomFieldOption";
      value: string;
      label: string;
    }> | null;
  }>;
  organizationCustomFields: Array<{
    __typename?: "CustomFieldDefinition";
    id: string;
    fieldName: string;
    fieldLabel: string;
    fieldType: CustomFieldType;
    entityType: CustomFieldEntityType;
    isActive: boolean;
    dropdownOptions?: Array<{
      __typename?: "CustomFieldOption";
      value: string;
      label: string;
    }> | null;
  }>;
  leadCustomFields: Array<{
    __typename?: "CustomFieldDefinition";
    id: string;
    fieldName: string;
    fieldLabel: string;
    fieldType: CustomFieldType;
    entityType: CustomFieldEntityType;
    isActive: boolean;
    dropdownOptions?: Array<{
      __typename?: "CustomFieldOption";
      value: string;
      label: string;
    }> | null;
  }>;
};

export type GetEntityStickersQueryVariables = Exact<{
  entityType: EntityType;
  entityId: Scalars["ID"]["input"];
  filters?: InputMaybe<StickerFilters>;
}>;

export type GetEntityStickersQuery = {
  __typename?: "Query";
  getEntityStickers: {
    __typename?: "StickerConnection";
    totalCount: number;
    nodes: Array<{
      __typename?: "SmartSticker";
      id: string;
      title: string;
      content?: string | null;
      entityType: EntityType;
      entityId: string;
      positionX: number;
      positionY: number;
      width: number;
      height: number;
      color: string;
      isPinned: boolean;
      isPrivate: boolean;
      priority: StickerPriority;
      mentions: Array<string>;
      tags: Array<string>;
      createdAt: string;
      updatedAt: string;
      createdByUserId: string;
      category?: {
        __typename?: "StickerCategory";
        id: string;
        name: string;
        color: string;
        icon?: string | null;
      } | null;
    }>;
  };
};

export type GetStickerCategoriesQueryVariables = Exact<{
  [key: string]: never;
}>;

export type GetStickerCategoriesQuery = {
  __typename?: "Query";
  getStickerCategories: Array<{
    __typename?: "StickerCategory";
    id: string;
    name: string;
    color: string;
    icon?: string | null;
    isSystem: boolean;
    displayOrder: number;
  }>;
};

export type UpdateStickerMutationVariables = Exact<{
  input: UpdateStickerInput;
}>;

export type UpdateStickerMutation = {
  __typename?: "Mutation";
  updateSticker: {
    __typename?: "SmartSticker";
    id: string;
    title: string;
    content?: string | null;
    entityType: EntityType;
    entityId: string;
    positionX: number;
    positionY: number;
    width: number;
    height: number;
    color: string;
    isPinned: boolean;
    isPrivate: boolean;
    priority: StickerPriority;
    mentions: Array<string>;
    tags: Array<string>;
    createdAt: string;
    updatedAt: string;
    createdByUserId: string;
    category?: {
      __typename?: "StickerCategory";
      id: string;
      name: string;
      color: string;
      icon?: string | null;
    } | null;
  };
};

export type DeleteStickerMutationVariables = Exact<{
  id: Scalars["ID"]["input"];
}>;

export type DeleteStickerMutation = {
  __typename?: "Mutation";
  deleteSticker: boolean;
};

export type ToggleStickerPinMutationVariables = Exact<{
  id: Scalars["ID"]["input"];
}>;

export type ToggleStickerPinMutation = {
  __typename?: "Mutation";
  toggleStickerPin: {
    __typename?: "SmartSticker";
    id: string;
    isPinned: boolean;
    updatedAt: string;
  };
};

export type MoveStickersBulkMutationVariables = Exact<{
  moves: Array<StickerMoveInput> | StickerMoveInput;
}>;

export type MoveStickersBulkMutation = {
  __typename?: "Mutation";
  moveStickersBulk: Array<{
    __typename?: "SmartSticker";
    id: string;
    positionX: number;
    positionY: number;
    updatedAt: string;
  }>;
};

export type GetMyAccountsQueryVariables = Exact<{ [key: string]: never }>;

export type GetMyAccountsQuery = {
  __typename?: "Query";
  myAccounts: Array<{
    __typename?: "Organization";
    id: string;
    name: string;
    address?: string | null;
    notes?: string | null;
    created_at: string;
    updated_at: string;
    account_manager_id?: string | null;
    totalDealValue?: number | null;
    activeDealCount?: number | null;
    accountManager?: {
      __typename?: "User";
      id: string;
      display_name?: string | null;
      email: string;
      avatar_url?: string | null;
    } | null;
    customFieldValues: Array<{
      __typename?: "CustomFieldValue";
      stringValue?: string | null;
      numberValue?: number | null;
      booleanValue?: boolean | null;
      dateValue?: string | null;
      selectedOptionValues?: Array<string> | null;
      definition: {
        __typename?: "CustomFieldDefinition";
        id: string;
        fieldName: string;
        fieldLabel: string;
        fieldType: CustomFieldType;
        dropdownOptions?: Array<{
          __typename?: "CustomFieldOption";
          value: string;
          label: string;
        }> | null;
      };
    }>;
  }>;
};

export type GetMyAccountPortfolioStatsQueryVariables = Exact<{
  [key: string]: never;
}>;

export type GetMyAccountPortfolioStatsQuery = {
  __typename?: "Query";
  myAccountPortfolioStats: {
    __typename?: "AccountPortfolioStats";
    totalAccounts: number;
    totalDealValue: number;
    activeDealCount: number;
    accountsNeedingAttention: number;
  };
};

export type AssignAccountManagerMutationVariables = Exact<{
  organizationId: Scalars["ID"]["input"];
  userId: Scalars["ID"]["input"];
}>;

export type AssignAccountManagerMutation = {
  __typename?: "Mutation";
  assignAccountManager: {
    __typename?: "Organization";
    id: string;
    name: string;
    account_manager_id?: string | null;
    accountManager?: {
      __typename?: "User";
      id: string;
      display_name?: string | null;
      email: string;
      avatar_url?: string | null;
    } | null;
  };
};

export type RemoveAccountManagerMutationVariables = Exact<{
  organizationId: Scalars["ID"]["input"];
}>;

export type RemoveAccountManagerMutation = {
  __typename?: "Mutation";
  removeAccountManager: {
    __typename?: "Organization";
    id: string;
    name: string;
    account_manager_id?: string | null;
    accountManager?: {
      __typename?: "User";
      id: string;
      display_name?: string | null;
      email: string;
      avatar_url?: string | null;
    } | null;
  };
};

export type GetOrganizationWithAccountManagerQueryVariables = Exact<{
  id: Scalars["ID"]["input"];
}>;

export type GetOrganizationWithAccountManagerQuery = {
  __typename?: "Query";
  organization?: {
    __typename?: "Organization";
    id: string;
    name: string;
    address?: string | null;
    notes?: string | null;
    created_at: string;
    updated_at: string;
    account_manager_id?: string | null;
    totalDealValue?: number | null;
    activeDealCount?: number | null;
    accountManager?: {
      __typename?: "User";
      id: string;
      display_name?: string | null;
      email: string;
      avatar_url?: string | null;
    } | null;
  } | null;
};

export type CreateAgentV2ConversationMutationVariables = Exact<{
  input: CreateAgentV2ConversationInput;
}>;

export type CreateAgentV2ConversationMutation = {
  __typename?: "Mutation";
  createAgentV2Conversation: {
    __typename?: "AgentConversation";
    id: string;
    userId: string;
    agentVersion: string;
    context: Record<string, any>;
    createdAt: string;
    updatedAt: string;
    messages: Array<{
      __typename?: "AgentMessage";
      role: string;
      content: string;
      timestamp: string;
    }>;
  };
};

export type SendAgentV2MessageMutationVariables = Exact<{
  input: SendAgentV2MessageInput;
}>;

export type SendAgentV2MessageMutation = {
  __typename?: "Mutation";
  sendAgentV2Message: {
    __typename?: "AgentV2Response";
    conversation: {
      __typename?: "AgentConversation";
      id: string;
      userId: string;
      agentVersion: string;
      context: Record<string, any>;
      createdAt: string;
      updatedAt: string;
      messages: Array<{
        __typename?: "AgentMessage";
        role: string;
        content: string;
        timestamp: string;
      }>;
    };
    message: {
      __typename?: "AgentMessage";
      role: string;
      content: string;
      timestamp: string;
    };
    toolExecutions: Array<{
      __typename?: "ToolExecution";
      id: string;
      name: string;
      input: Record<string, any>;
      result?: Record<string, any> | null;
      error?: string | null;
      executionTime: number;
      timestamp: string;
      status: ToolExecutionStatus;
    }>;
  };
};

export type GetAgentV2ConversationsQueryVariables = Exact<{
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
}>;

export type GetAgentV2ConversationsQuery = {
  __typename?: "Query";
  agentV2Conversations: Array<{
    __typename?: "AgentConversation";
    id: string;
    userId: string;
    agentVersion: string;
    context: Record<string, any>;
    createdAt: string;
    updatedAt: string;
    messages: Array<{
      __typename?: "AgentMessage";
      role: string;
      content: string;
      timestamp: string;
    }>;
  }>;
};

export type SendAgentV2MessageStreamMutationVariables = Exact<{
  input: SendAgentV2MessageStreamInput;
}>;

export type SendAgentV2MessageStreamMutation = {
  __typename?: "Mutation";
  sendAgentV2MessageStream: string;
};

export type AgentV2MessageStreamSubscriptionVariables = Exact<{
  conversationId: Scalars["ID"]["input"];
}>;

export type AgentV2MessageStreamSubscription = {
  __typename?: "Subscription";
  agentV2MessageStream: {
    __typename?: "AgentV2StreamChunk";
    type: AgentV2StreamChunkType;
    content?: string | null;
    conversationId: string;
    error?: string | null;
    complete?: {
      __typename?: "AgentV2Response";
      conversation: {
        __typename?: "AgentConversation";
        id: string;
        userId: string;
        agentVersion: string;
        context: Record<string, any>;
        createdAt: string;
        updatedAt: string;
        messages: Array<{
          __typename?: "AgentMessage";
          role: string;
          content: string;
          timestamp: string;
        }>;
      };
      message: {
        __typename?: "AgentMessage";
        role: string;
        content: string;
        timestamp: string;
      };
      toolExecutions: Array<{
        __typename?: "ToolExecution";
        id: string;
        name: string;
        input: Record<string, any>;
        result?: Record<string, any> | null;
        error?: string | null;
        executionTime: number;
        timestamp: string;
        status: ToolExecutionStatus;
      }>;
    } | null;
  };
};

export type GetGoogleDriveSettingsQueryVariables = Exact<{
  [key: string]: never;
}>;

export type GetGoogleDriveSettingsQuery = {
  __typename?: "Query";
  googleDriveSettings: {
    __typename?: "GoogleDriveConfig";
    pipecd_deals_folder_id?: string | null;
    auto_create_deal_folders: boolean;
    deal_folder_template: boolean;
  };
};

export type GetAppSettingQueryVariables = Exact<{
  settingKey: Scalars["String"]["input"];
}>;

export type GetAppSettingQuery = {
  __typename?: "Query";
  appSetting?: {
    __typename?: "AppSetting";
    id: string;
    settingKey: string;
    settingValue?: Record<string, any> | null;
    settingType: string;
    description?: string | null;
    isPublic: boolean;
  } | null;
};

export type GetAllAppSettingsQueryVariables = Exact<{ [key: string]: never }>;

export type GetAllAppSettingsQuery = {
  __typename?: "Query";
  appSettings: Array<{
    __typename?: "AppSetting";
    id: string;
    settingKey: string;
    settingValue?: Record<string, any> | null;
    settingType: string;
    description?: string | null;
    isPublic: boolean;
    createdAt: string;
    updatedAt: string;
  }>;
};

export type UpdateAppSettingMutationVariables = Exact<{
  input: UpdateAppSettingInput;
}>;

export type UpdateAppSettingMutation = {
  __typename?: "Mutation";
  updateAppSetting: {
    __typename?: "AppSetting";
    id: string;
    settingKey: string;
    settingValue?: Record<string, any> | null;
    settingType: string;
    description?: string | null;
    isPublic: boolean;
    updatedAt: string;
  };
};

export type GetUpcomingMeetingsQueryVariables = Exact<{
  days?: InputMaybe<Scalars["Int"]["input"]>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
}>;

export type GetUpcomingMeetingsQuery = {
  __typename?: "Query";
  upcomingMeetings: Array<{
    __typename?: "CalendarEvent";
    id: string;
    googleEventId: string;
    googleCalendarId: string;
    title: string;
    description?: string | null;
    startTime: string;
    endTime: string;
    isAllDay: boolean;
    timezone: string;
    location?: string | null;
    googleMeetLink?: string | null;
    eventType: CalendarEventType;
    outcome?: CalendarEventOutcome | null;
    outcomeNotes?: string | null;
    nextActions?: Array<string> | null;
    isCancelled: boolean;
    lastSyncedAt?: string | null;
    createdAt: string;
    updatedAt: string;
    deal?: {
      __typename?: "Deal";
      id: string;
      name: string;
      amount?: number | null;
      currency?: string | null;
    } | null;
    person?: {
      __typename?: "Person";
      id: string;
      first_name?: string | null;
      last_name?: string | null;
      email?: string | null;
    } | null;
    organization?: {
      __typename?: "Organization";
      id: string;
      name: string;
    } | null;
  }>;
};

export type GetGoogleCalendarsQueryVariables = Exact<{ [key: string]: never }>;

export type GetGoogleCalendarsQuery = {
  __typename?: "Query";
  googleCalendars: Array<{
    __typename?: "GoogleCalendar";
    id: string;
    summary: string;
    description?: string | null;
    timeZone: string;
    colorId?: string | null;
    backgroundColor?: string | null;
    foregroundColor?: string | null;
    primary?: boolean | null;
    accessRole: string;
  }>;
};

export type CheckAvailabilityQueryVariables = Exact<{
  timeRange: CalendarTimeRangeInput;
  calendarIds?: InputMaybe<
    Array<Scalars["String"]["input"]> | Scalars["String"]["input"]
  >;
}>;

export type CheckAvailabilityQuery = {
  __typename?: "Query";
  checkAvailability: Array<{
    __typename?: "AvailabilitySlot";
    start: string;
    end: string;
    available: boolean;
  }>;
};

export type SearchGoogleContactsQueryVariables = Exact<{
  query: Scalars["String"]["input"];
}>;

export type SearchGoogleContactsQuery = {
  __typename?: "Query";
  searchGoogleContacts: Array<{
    __typename?: "ContactSuggestion";
    email: string;
    name?: string | null;
    photoUrl?: string | null;
  }>;
};

export type CreateCalendarEventMutationVariables = Exact<{
  input: CreateCalendarEventInput;
}>;

export type CreateCalendarEventMutation = {
  __typename?: "Mutation";
  createCalendarEvent: {
    __typename?: "CalendarEvent";
    id: string;
    googleEventId: string;
    googleCalendarId: string;
    title: string;
    description?: string | null;
    startTime: string;
    endTime: string;
    isAllDay: boolean;
    timezone: string;
    location?: string | null;
    googleMeetLink?: string | null;
    eventType: CalendarEventType;
    outcome?: CalendarEventOutcome | null;
    outcomeNotes?: string | null;
    nextActions?: Array<string> | null;
    isCancelled: boolean;
    lastSyncedAt?: string | null;
    createdAt: string;
    updatedAt: string;
    deal?: { __typename?: "Deal"; id: string; name: string } | null;
    person?: {
      __typename?: "Person";
      id: string;
      first_name?: string | null;
      last_name?: string | null;
      email?: string | null;
    } | null;
    organization?: {
      __typename?: "Organization";
      id: string;
      name: string;
    } | null;
  };
};

export type GetDealCalendarEventsQueryVariables = Exact<{
  dealId: Scalars["ID"]["input"];
}>;

export type GetDealCalendarEventsQuery = {
  __typename?: "Query";
  dealCalendarEvents: Array<{
    __typename?: "CalendarEvent";
    id: string;
    googleEventId: string;
    googleCalendarId: string;
    title: string;
    description?: string | null;
    startTime: string;
    endTime: string;
    isAllDay: boolean;
    timezone: string;
    location?: string | null;
    googleMeetLink?: string | null;
    eventType: CalendarEventType;
    outcome?: CalendarEventOutcome | null;
    outcomeNotes?: string | null;
    nextActions?: Array<string> | null;
    isCancelled: boolean;
    lastSyncedAt?: string | null;
    createdAt: string;
    updatedAt: string;
    person?: {
      __typename?: "Person";
      id: string;
      first_name?: string | null;
      last_name?: string | null;
      email?: string | null;
    } | null;
    organization?: {
      __typename?: "Organization";
      id: string;
      name: string;
    } | null;
  }>;
};

export type GetCustomFieldDefinitionsQueryVariables = Exact<{
  entityType: CustomFieldEntityType;
  includeInactive?: InputMaybe<Scalars["Boolean"]["input"]>;
}>;

export type GetCustomFieldDefinitionsQuery = {
  __typename?: "Query";
  customFieldDefinitions: Array<{
    __typename?: "CustomFieldDefinition";
    id: string;
    entityType: CustomFieldEntityType;
    fieldName: string;
    fieldLabel: string;
    fieldType: CustomFieldType;
    isRequired: boolean;
    isActive: boolean;
    displayOrder: number;
    createdAt: string;
    updatedAt: string;
    dropdownOptions?: Array<{
      __typename?: "CustomFieldOption";
      value: string;
      label: string;
    }> | null;
  }>;
};

export type GetCustomFieldDefinitionQueryVariables = Exact<{
  id: Scalars["ID"]["input"];
}>;

export type GetCustomFieldDefinitionQuery = {
  __typename?: "Query";
  customFieldDefinition?: {
    __typename?: "CustomFieldDefinition";
    id: string;
    entityType: CustomFieldEntityType;
    fieldName: string;
    fieldLabel: string;
    fieldType: CustomFieldType;
    isRequired: boolean;
    isActive: boolean;
    displayOrder: number;
    createdAt: string;
    updatedAt: string;
    dropdownOptions?: Array<{
      __typename?: "CustomFieldOption";
      value: string;
      label: string;
    }> | null;
  } | null;
};

export type CreateCustomFieldDefinitionMutationVariables = Exact<{
  input: CustomFieldDefinitionInput;
}>;

export type CreateCustomFieldDefinitionMutation = {
  __typename?: "Mutation";
  createCustomFieldDefinition: {
    __typename?: "CustomFieldDefinition";
    id: string;
    entityType: CustomFieldEntityType;
    fieldName: string;
    fieldLabel: string;
    fieldType: CustomFieldType;
    isRequired: boolean;
    isActive: boolean;
    displayOrder: number;
    createdAt: string;
    updatedAt: string;
    dropdownOptions?: Array<{
      __typename?: "CustomFieldOption";
      value: string;
      label: string;
    }> | null;
  };
};

export type UpdateCustomFieldDefinitionMutationVariables = Exact<{
  id: Scalars["ID"]["input"];
  input: CustomFieldDefinitionInput;
}>;

export type UpdateCustomFieldDefinitionMutation = {
  __typename?: "Mutation";
  updateCustomFieldDefinition: {
    __typename?: "CustomFieldDefinition";
    id: string;
    entityType: CustomFieldEntityType;
    fieldName: string;
    fieldLabel: string;
    fieldType: CustomFieldType;
    isRequired: boolean;
    isActive: boolean;
    displayOrder: number;
    createdAt: string;
    updatedAt: string;
    dropdownOptions?: Array<{
      __typename?: "CustomFieldOption";
      value: string;
      label: string;
    }> | null;
  };
};

export type DeactivateCustomFieldDefinitionMutationVariables = Exact<{
  id: Scalars["ID"]["input"];
}>;

export type DeactivateCustomFieldDefinitionMutation = {
  __typename?: "Mutation";
  deactivateCustomFieldDefinition: {
    __typename?: "CustomFieldDefinition";
    id: string;
    isActive: boolean;
    updatedAt: string;
  };
};

export type ReactivateCustomFieldDefinitionMutationVariables = Exact<{
  id: Scalars["ID"]["input"];
}>;

export type ReactivateCustomFieldDefinitionMutation = {
  __typename?: "Mutation";
  reactivateCustomFieldDefinition: {
    __typename?: "CustomFieldDefinition";
    id: string;
    isActive: boolean;
    updatedAt: string;
  };
};

export type GetDealFolderInfoQueryVariables = Exact<{
  dealId: Scalars["ID"]["input"];
}>;

export type GetDealFolderInfoQuery = {
  __typename?: "Query";
  getDealFolder?: {
    __typename?: "DriveFolder";
    id: string;
    name: string;
    parents?: Array<string> | null;
    webViewLink: string;
    createdTime: string;
    modifiedTime: string;
  } | null;
};

export type GetDealFolderFilesQueryVariables = Exact<{
  dealId: Scalars["ID"]["input"];
  folderId?: InputMaybe<Scalars["String"]["input"]>;
}>;

export type GetDealFolderFilesQuery = {
  __typename?: "Query";
  getDriveFiles: {
    __typename?: "DriveFileConnection";
    files: Array<{
      __typename?: "DriveFile";
      id: string;
      name: string;
      mimeType: string;
      size?: number | null;
      modifiedTime: string;
      createdTime: string;
      webViewLink?: string | null;
      webContentLink?: string | null;
      thumbnailLink?: string | null;
      iconLink?: string | null;
      parents?: Array<string> | null;
      owners?: Array<{
        __typename?: "DriveFileOwner";
        displayName: string;
        emailAddress: string;
      }> | null;
    }>;
  };
};

export type GetDealDocumentsQueryVariables = Exact<{
  dealId: Scalars["ID"]["input"];
}>;

export type GetDealDocumentsQuery = {
  __typename?: "Query";
  getDealDocuments: Array<{
    __typename?: "DealDocumentAttachment";
    id: string;
    dealId: string;
    googleFileId: string;
    fileName: string;
    fileUrl: string;
    category?: DocumentCategory | null;
    attachedAt: string;
    attachedBy: string;
  }>;
};

export type GetDealFolderQueryVariables = Exact<{
  dealId: Scalars["ID"]["input"];
}>;

export type GetDealFolderQuery = {
  __typename?: "Query";
  getDealFolder?: {
    __typename?: "DriveFolder";
    id: string;
    name: string;
    parents?: Array<string> | null;
    webViewLink: string;
    createdTime: string;
    modifiedTime: string;
  } | null;
};

export type GetDriveFilesQueryVariables = Exact<{
  input: DriveSearchInput;
}>;

export type GetDriveFilesQuery = {
  __typename?: "Query";
  getDriveFiles: {
    __typename?: "DriveFileConnection";
    totalCount: number;
    files: Array<{
      __typename?: "DriveFile";
      id: string;
      name: string;
      mimeType: string;
      size?: number | null;
      modifiedTime: string;
      createdTime: string;
      webViewLink?: string | null;
      webContentLink?: string | null;
      parents?: Array<string> | null;
      thumbnailLink?: string | null;
      iconLink?: string | null;
      owners?: Array<{
        __typename?: "DriveFileOwner";
        displayName: string;
        emailAddress: string;
      }> | null;
    }>;
  };
};

export type GetDriveFoldersQueryVariables = Exact<{
  input: DriveFolderBrowseInput;
}>;

export type GetDriveFoldersQuery = {
  __typename?: "Query";
  getDriveFolders: {
    __typename?: "DriveFolderConnection";
    totalCount: number;
    folders: Array<{
      __typename?: "DriveFolder";
      id: string;
      name: string;
      parents?: Array<string> | null;
      webViewLink: string;
      createdTime: string;
      modifiedTime: string;
    }>;
  };
};

export type SearchDriveFilesQueryVariables = Exact<{
  query: Scalars["String"]["input"];
}>;

export type SearchDriveFilesQuery = {
  __typename?: "Query";
  searchDriveFiles: {
    __typename?: "DriveFileConnection";
    totalCount: number;
    files: Array<{
      __typename?: "DriveFile";
      id: string;
      name: string;
      mimeType: string;
      size?: number | null;
      modifiedTime: string;
      createdTime: string;
      webViewLink?: string | null;
      webContentLink?: string | null;
      parents?: Array<string> | null;
      thumbnailLink?: string | null;
      iconLink?: string | null;
      owners?: Array<{
        __typename?: "DriveFileOwner";
        displayName: string;
        emailAddress: string;
      }> | null;
    }>;
  };
};

export type GetRecentDriveFilesQueryVariables = Exact<{
  limit?: InputMaybe<Scalars["Int"]["input"]>;
}>;

export type GetRecentDriveFilesQuery = {
  __typename?: "Query";
  getRecentDriveFiles: {
    __typename?: "DriveFileConnection";
    totalCount: number;
    files: Array<{
      __typename?: "DriveFile";
      id: string;
      name: string;
      mimeType: string;
      size?: number | null;
      modifiedTime: string;
      createdTime: string;
      webViewLink?: string | null;
      webContentLink?: string | null;
      parents?: Array<string> | null;
      thumbnailLink?: string | null;
      iconLink?: string | null;
      owners?: Array<{
        __typename?: "DriveFileOwner";
        displayName: string;
        emailAddress: string;
      }> | null;
    }>;
  };
};

export type CreateDealFolderMutationVariables = Exact<{
  input: CreateDealFolderInput;
}>;

export type CreateDealFolderMutation = {
  __typename?: "Mutation";
  createDealFolder: {
    __typename?: "DriveFolderStructure";
    dealFolder: {
      __typename?: "DriveFolder";
      id: string;
      name: string;
      parents?: Array<string> | null;
      webViewLink: string;
      createdTime: string;
      modifiedTime: string;
    };
    subfolders: {
      __typename?: "DriveFolderSubfolders";
      proposals?: {
        __typename?: "DriveFolder";
        id: string;
        name: string;
        parents?: Array<string> | null;
        webViewLink: string;
        createdTime: string;
        modifiedTime: string;
      } | null;
      contracts?: {
        __typename?: "DriveFolder";
        id: string;
        name: string;
        parents?: Array<string> | null;
        webViewLink: string;
        createdTime: string;
        modifiedTime: string;
      } | null;
      legal?: {
        __typename?: "DriveFolder";
        id: string;
        name: string;
        parents?: Array<string> | null;
        webViewLink: string;
        createdTime: string;
        modifiedTime: string;
      } | null;
      presentations?: {
        __typename?: "DriveFolder";
        id: string;
        name: string;
        parents?: Array<string> | null;
        webViewLink: string;
        createdTime: string;
        modifiedTime: string;
      } | null;
      correspondence?: {
        __typename?: "DriveFolder";
        id: string;
        name: string;
        parents?: Array<string> | null;
        webViewLink: string;
        createdTime: string;
        modifiedTime: string;
      } | null;
    };
  };
};

export type AttachFileToDealMutationVariables = Exact<{
  input: AttachFileInput;
}>;

export type AttachFileToDealMutation = {
  __typename?: "Mutation";
  attachFileToDeal: {
    __typename?: "DealDocumentAttachment";
    id: string;
    dealId: string;
    googleFileId: string;
    fileName: string;
    fileUrl: string;
    category?: DocumentCategory | null;
    attachedAt: string;
    attachedBy: string;
  };
};

export type DetachFileFromDealMutationVariables = Exact<{
  attachmentId: Scalars["ID"]["input"];
}>;

export type DetachFileFromDealMutation = {
  __typename?: "Mutation";
  detachFileFromDeal: boolean;
};

export type UploadFileToDriveMutationVariables = Exact<{
  input: UploadFileInput;
}>;

export type UploadFileToDriveMutation = {
  __typename?: "Mutation";
  uploadFileToDrive: {
    __typename?: "DriveFile";
    id: string;
    name: string;
    mimeType: string;
    size?: number | null;
    modifiedTime: string;
    createdTime: string;
    webViewLink?: string | null;
    webContentLink?: string | null;
    parents?: Array<string> | null;
    thumbnailLink?: string | null;
    iconLink?: string | null;
    owners?: Array<{
      __typename?: "DriveFileOwner";
      displayName: string;
      emailAddress: string;
    }> | null;
  };
};

export type PersonOrganizationRoleFieldsFragment = {
  __typename?: "PersonOrganizationRole";
  id: string;
  person_id: string;
  organization_id: string;
  role_title: string;
  department?: string | null;
  is_primary: boolean;
  status: string;
  start_date?: string | null;
  end_date?: string | null;
  notes?: string | null;
  created_at: string;
  updated_at: string;
  created_by_user_id?: string | null;
  organization: {
    __typename?: "Organization";
    id: string;
    name: string;
    address?: string | null;
  };
};

export type GetPersonOrganizationRolesQueryVariables = Exact<{
  personId: Scalars["ID"]["input"];
}>;

export type GetPersonOrganizationRolesQuery = {
  __typename?: "Query";
  personOrganizationRoles: Array<{
    __typename?: "PersonOrganizationRole";
    id: string;
    person_id: string;
    organization_id: string;
    role_title: string;
    department?: string | null;
    is_primary: boolean;
    status: string;
    start_date?: string | null;
    end_date?: string | null;
    notes?: string | null;
    created_at: string;
    updated_at: string;
    created_by_user_id?: string | null;
    organization: {
      __typename?: "Organization";
      id: string;
      name: string;
      address?: string | null;
    };
  }>;
};

export type GetPeopleByOrganizationQueryVariables = Exact<{
  organizationId: Scalars["ID"]["input"];
  includeFormerEmployees?: InputMaybe<Scalars["Boolean"]["input"]>;
}>;

export type GetPeopleByOrganizationQuery = {
  __typename?: "Query";
  peopleByOrganization: Array<{
    __typename?: "Person";
    id: string;
    first_name?: string | null;
    last_name?: string | null;
    email?: string | null;
    phone?: string | null;
    notes?: string | null;
    created_at: string;
    updated_at: string;
  }>;
};

export type GetOrganizationPeopleWithRolesQueryVariables = Exact<{
  organizationId: Scalars["ID"]["input"];
  includeFormerEmployees?: InputMaybe<Scalars["Boolean"]["input"]>;
}>;

export type GetOrganizationPeopleWithRolesQuery = {
  __typename?: "Query";
  peopleByOrganization: Array<{
    __typename?: "Person";
    id: string;
    first_name?: string | null;
    last_name?: string | null;
    email?: string | null;
    phone?: string | null;
    notes?: string | null;
    created_at: string;
    updated_at: string;
    organizationRoles: Array<{
      __typename?: "PersonOrganizationRole";
      id: string;
      organization_id: string;
      role_title: string;
      department?: string | null;
      is_primary: boolean;
      status: string;
      start_date?: string | null;
      end_date?: string | null;
      notes?: string | null;
      created_at: string;
      updated_at: string;
      organization: { __typename?: "Organization"; id: string; name: string };
    }>;
    primaryOrganization?: {
      __typename?: "Organization";
      id: string;
      name: string;
    } | null;
    primaryRole?: {
      __typename?: "PersonOrganizationRole";
      id: string;
      role_title: string;
      department?: string | null;
      is_primary: boolean;
      status: string;
    } | null;
  }>;
};

export type CreatePersonOrganizationRoleMutationVariables = Exact<{
  personId: Scalars["ID"]["input"];
  input: PersonOrganizationRoleInput;
}>;

export type CreatePersonOrganizationRoleMutation = {
  __typename?: "Mutation";
  createPersonOrganizationRole: {
    __typename?: "PersonOrganizationRole";
    id: string;
    person_id: string;
    organization_id: string;
    role_title: string;
    department?: string | null;
    is_primary: boolean;
    status: string;
    start_date?: string | null;
    end_date?: string | null;
    notes?: string | null;
    created_at: string;
    updated_at: string;
    created_by_user_id?: string | null;
    organization: {
      __typename?: "Organization";
      id: string;
      name: string;
      address?: string | null;
    };
  };
};

export type UpdatePersonOrganizationRoleMutationVariables = Exact<{
  id: Scalars["ID"]["input"];
  input: PersonOrganizationRoleUpdateInput;
}>;

export type UpdatePersonOrganizationRoleMutation = {
  __typename?: "Mutation";
  updatePersonOrganizationRole: {
    __typename?: "PersonOrganizationRole";
    id: string;
    person_id: string;
    organization_id: string;
    role_title: string;
    department?: string | null;
    is_primary: boolean;
    status: string;
    start_date?: string | null;
    end_date?: string | null;
    notes?: string | null;
    created_at: string;
    updated_at: string;
    created_by_user_id?: string | null;
    organization: {
      __typename?: "Organization";
      id: string;
      name: string;
      address?: string | null;
    };
  };
};

export type DeletePersonOrganizationRoleMutationVariables = Exact<{
  id: Scalars["ID"]["input"];
}>;

export type DeletePersonOrganizationRoleMutation = {
  __typename?: "Mutation";
  deletePersonOrganizationRole: boolean;
};

export type SetPrimaryOrganizationRoleMutationVariables = Exact<{
  personId: Scalars["ID"]["input"];
  roleId: Scalars["ID"]["input"];
}>;

export type SetPrimaryOrganizationRoleMutation = {
  __typename?: "Mutation";
  setPrimaryOrganizationRole: {
    __typename?: "PersonOrganizationRole";
    id: string;
    person_id: string;
    organization_id: string;
    role_title: string;
    department?: string | null;
    is_primary: boolean;
    status: string;
    start_date?: string | null;
    end_date?: string | null;
    notes?: string | null;
    created_at: string;
    updated_at: string;
    created_by_user_id?: string | null;
    organization: {
      __typename?: "Organization";
      id: string;
      name: string;
      address?: string | null;
    };
  };
};

export type GetSharedDrivesQueryVariables = Exact<{ [key: string]: never }>;

export type GetSharedDrivesQuery = {
  __typename?: "Query";
  getSharedDrives: Array<{
    __typename?: "SharedDrive";
    id: string;
    name: string;
    createdTime: string;
    capabilities?: {
      __typename?: "SharedDriveCapabilities";
      canAddChildren?: boolean | null;
      canListChildren?: boolean | null;
      canDownload?: boolean | null;
    } | null;
  }>;
};

export type GetSharedDriveFilesQueryVariables = Exact<{
  sharedDriveId: Scalars["ID"]["input"];
  folderId?: InputMaybe<Scalars["ID"]["input"]>;
  query?: InputMaybe<Scalars["String"]["input"]>;
}>;

export type GetSharedDriveFilesQuery = {
  __typename?: "Query";
  getSharedDriveFiles: Array<{
    __typename?: "DriveFile";
    id: string;
    name: string;
    mimeType: string;
    size?: number | null;
    modifiedTime: string;
    createdTime: string;
    webViewLink?: string | null;
    parents?: Array<string> | null;
    thumbnailLink?: string | null;
    iconLink?: string | null;
    owners?: Array<{
      __typename?: "DriveFileOwner";
      displayName: string;
      emailAddress: string;
    }> | null;
  }>;
};

export type GetSharedDriveFoldersQueryVariables = Exact<{
  sharedDriveId: Scalars["ID"]["input"];
  parentFolderId?: InputMaybe<Scalars["ID"]["input"]>;
}>;

export type GetSharedDriveFoldersQuery = {
  __typename?: "Query";
  getSharedDriveFolders: Array<{
    __typename?: "DriveFolder";
    id: string;
    name: string;
    parents?: Array<string> | null;
    webViewLink: string;
    createdTime: string;
    modifiedTime: string;
  }>;
};

export type SearchSharedDriveFilesQueryVariables = Exact<{
  query: Scalars["String"]["input"];
  sharedDriveId?: InputMaybe<Scalars["ID"]["input"]>;
}>;

export type SearchSharedDriveFilesQuery = {
  __typename?: "Query";
  searchSharedDriveFiles: Array<{
    __typename?: "DriveFile";
    id: string;
    name: string;
    mimeType: string;
    size?: number | null;
    modifiedTime: string;
    createdTime: string;
    webViewLink?: string | null;
    parents?: Array<string> | null;
    thumbnailLink?: string | null;
    iconLink?: string | null;
    owners?: Array<{
      __typename?: "DriveFileOwner";
      displayName: string;
      emailAddress: string;
    }> | null;
  }>;
};

export type GetRecentSharedDriveFilesQueryVariables = Exact<{
  limit?: InputMaybe<Scalars["Int"]["input"]>;
}>;

export type GetRecentSharedDriveFilesQuery = {
  __typename?: "Query";
  getRecentSharedDriveFiles: Array<{
    __typename?: "DriveFile";
    id: string;
    name: string;
    mimeType: string;
    size?: number | null;
    modifiedTime: string;
    createdTime: string;
    webViewLink?: string | null;
    parents?: Array<string> | null;
    thumbnailLink?: string | null;
    iconLink?: string | null;
    owners?: Array<{
      __typename?: "DriveFileOwner";
      displayName: string;
      emailAddress: string;
    }> | null;
  }>;
};

export type GetDealDocumentAttachmentsQueryVariables = Exact<{
  dealId: Scalars["ID"]["input"];
}>;

export type GetDealDocumentAttachmentsQuery = {
  __typename?: "Query";
  getDealDocumentAttachments: Array<{
    __typename?: "DealDocumentAttachment";
    id: string;
    dealId: string;
    googleFileId: string;
    fileName: string;
    fileUrl: string;
    sharedDriveId?: string | null;
    category?: DocumentCategory | null;
    attachedAt: string;
    attachedBy: string;
    mimeType?: string | null;
    fileSize?: number | null;
  }>;
};

export type AttachDocumentToDealMutationVariables = Exact<{
  input: AttachDocumentInput;
}>;

export type AttachDocumentToDealMutation = {
  __typename?: "Mutation";
  attachDocumentToDeal: {
    __typename?: "DealDocumentAttachment";
    id: string;
    dealId: string;
    googleFileId: string;
    fileName: string;
    fileUrl: string;
    sharedDriveId?: string | null;
    category?: DocumentCategory | null;
    attachedAt: string;
    attachedBy: string;
    mimeType?: string | null;
    fileSize?: number | null;
  };
};

export type RemoveDocumentAttachmentMutationVariables = Exact<{
  attachmentId: Scalars["ID"]["input"];
}>;

export type RemoveDocumentAttachmentMutation = {
  __typename?: "Mutation";
  removeDocumentAttachment: boolean;
};

export type AttachDocumentToNoteAndDealMutationVariables = Exact<{
  input: AttachDocumentToNoteInput;
}>;

export type AttachDocumentToNoteAndDealMutation = {
  __typename?: "Mutation";
  attachDocumentToNoteAndDeal: {
    __typename?: "DualAttachmentResponse";
    noteAttachment: {
      __typename?: "NoteDocumentAttachment";
      id: string;
      noteId: string;
      googleFileId: string;
      fileName: string;
      fileUrl: string;
      attachedAt: string;
    };
    dealAttachment: {
      __typename?: "DealDocumentAttachment";
      id: string;
      dealId: string;
      googleFileId: string;
      fileName: string;
      fileUrl: string;
      sharedDriveId?: string | null;
      category?: DocumentCategory | null;
      attachedAt: string;
      attachedBy: string;
      mimeType?: string | null;
      fileSize?: number | null;
    };
  };
};

export type GetNoteDocumentAttachmentsQueryVariables = Exact<{
  noteId: Scalars["ID"]["input"];
}>;

export type GetNoteDocumentAttachmentsQuery = {
  __typename?: "Query";
  getNoteDocumentAttachments: Array<{
    __typename?: "NoteDocumentAttachment";
    id: string;
    noteId: string;
    googleFileId: string;
    fileName: string;
    fileUrl: string;
    attachedAt: string;
    attachedBy: string;
    mimeType?: string | null;
    fileSize?: number | null;
  }>;
};

export type RemoveNoteDocumentAttachmentMutationVariables = Exact<{
  attachmentId: Scalars["ID"]["input"];
}>;

export type RemoveNoteDocumentAttachmentMutation = {
  __typename?: "Mutation";
  removeNoteDocumentAttachment: boolean;
};

export type UpdateDocumentAttachmentCategoryMutationVariables = Exact<{
  attachmentId: Scalars["ID"]["input"];
  category: DocumentCategory;
}>;

export type UpdateDocumentAttachmentCategoryMutation = {
  __typename?: "Mutation";
  updateDocumentAttachmentCategory: {
    __typename?: "DealDocumentAttachment";
    id: string;
    category?: DocumentCategory | null;
  };
};

export type GetAssignableUsersQueryVariables = Exact<{ [key: string]: never }>;

export type GetAssignableUsersQuery = {
  __typename?: "Query";
  assignableUsers: Array<{
    __typename?: "User";
    id: string;
    display_name?: string | null;
    email: string;
    avatar_url?: string | null;
    roles: Array<{
      __typename?: "Role";
      id: string;
      name: string;
      description: string;
    }>;
  }>;
};

export type GetUserListQueryVariables = Exact<{ [key: string]: never }>;

export type GetUserListQuery = {
  __typename?: "Query";
  users: Array<{
    __typename?: "User";
    id: string;
    display_name?: string | null;
    email: string;
    avatar_url?: string | null;
    roles: Array<{
      __typename?: "Role";
      id: string;
      name: string;
      description: string;
    }>;
  }>;
};

export type GetMeQueryVariables = Exact<{ [key: string]: never }>;

export type GetMeQuery = {
  __typename?: "Query";
  me?: {
    __typename?: "User";
    id: string;
    email: string;
    display_name?: string | null;
    avatar_url?: string | null;
  } | null;
};

export type GetWfmProjectTypesQueryVariables = Exact<{
  isArchived?: InputMaybe<Scalars["Boolean"]["input"]>;
}>;

export type GetWfmProjectTypesQuery = {
  __typename?: "Query";
  wfmProjectTypes: Array<{
    __typename?: "WFMProjectType";
    id: string;
    name: string;
    description?: string | null;
    iconName?: string | null;
    isArchived: boolean;
    createdAt: string;
    updatedAt: string;
    defaultWorkflow?: {
      __typename?: "WFMWorkflow";
      id: string;
      name: string;
    } | null;
    createdByUser?: {
      __typename?: "User";
      id: string;
      display_name?: string | null;
    } | null;
    updatedByUser?: {
      __typename?: "User";
      id: string;
      display_name?: string | null;
    } | null;
  }>;
};

export type GetWfmProjectTypeByIdQueryVariables = Exact<{
  id: Scalars["ID"]["input"];
}>;

export type GetWfmProjectTypeByIdQuery = {
  __typename?: "Query";
  wfmProjectType?: {
    __typename?: "WFMProjectType";
    id: string;
    name: string;
    description?: string | null;
    iconName?: string | null;
    isArchived: boolean;
    createdAt: string;
    updatedAt: string;
    defaultWorkflow?: {
      __typename?: "WFMWorkflow";
      id: string;
      name: string;
    } | null;
    createdByUser?: {
      __typename?: "User";
      id: string;
      display_name?: string | null;
    } | null;
    updatedByUser?: {
      __typename?: "User";
      id: string;
      display_name?: string | null;
    } | null;
  } | null;
};

export type CreateWfmProjectTypeMutationVariables = Exact<{
  input: CreateWfmProjectTypeInput;
}>;

export type CreateWfmProjectTypeMutation = {
  __typename?: "Mutation";
  createWFMProjectType: {
    __typename?: "WFMProjectType";
    id: string;
    name: string;
    description?: string | null;
    iconName?: string | null;
    isArchived: boolean;
    createdAt: string;
    updatedAt: string;
    defaultWorkflow?: {
      __typename?: "WFMWorkflow";
      id: string;
      name: string;
    } | null;
    createdByUser?: {
      __typename?: "User";
      id: string;
      display_name?: string | null;
    } | null;
    updatedByUser?: {
      __typename?: "User";
      id: string;
      display_name?: string | null;
    } | null;
  };
};

export type UpdateWfmProjectTypeMutationVariables = Exact<{
  id: Scalars["ID"]["input"];
  input: UpdateWfmProjectTypeInput;
}>;

export type UpdateWfmProjectTypeMutation = {
  __typename?: "Mutation";
  updateWFMProjectType: {
    __typename?: "WFMProjectType";
    id: string;
    name: string;
    description?: string | null;
    iconName?: string | null;
    isArchived: boolean;
    createdAt: string;
    updatedAt: string;
    defaultWorkflow?: {
      __typename?: "WFMWorkflow";
      id: string;
      name: string;
    } | null;
    createdByUser?: {
      __typename?: "User";
      id: string;
      display_name?: string | null;
    } | null;
    updatedByUser?: {
      __typename?: "User";
      id: string;
      display_name?: string | null;
    } | null;
  };
};

export type GetWfmStatusesQueryVariables = Exact<{
  isArchived?: InputMaybe<Scalars["Boolean"]["input"]>;
}>;

export type GetWfmStatusesQuery = {
  __typename?: "Query";
  wfmStatuses: Array<{
    __typename?: "WFMStatus";
    id: string;
    name: string;
    description?: string | null;
    color?: string | null;
    isArchived: boolean;
    createdAt: string;
    updatedAt: string;
    createdByUser?: {
      __typename?: "User";
      id: string;
      display_name?: string | null;
    } | null;
    updatedByUser?: {
      __typename?: "User";
      id: string;
      display_name?: string | null;
    } | null;
  }>;
};

export type GetWfmStatusByIdQueryVariables = Exact<{
  id: Scalars["ID"]["input"];
}>;

export type GetWfmStatusByIdQuery = {
  __typename?: "Query";
  wfmStatus?: {
    __typename?: "WFMStatus";
    id: string;
    name: string;
    description?: string | null;
    color?: string | null;
    isArchived: boolean;
    createdAt: string;
    updatedAt: string;
    createdByUser?: {
      __typename?: "User";
      id: string;
      display_name?: string | null;
      email: string;
      avatar_url?: string | null;
    } | null;
    updatedByUser?: {
      __typename?: "User";
      id: string;
      display_name?: string | null;
      email: string;
      avatar_url?: string | null;
    } | null;
  } | null;
};

export type CreateWfmStatusMutationVariables = Exact<{
  input: CreateWfmStatusInput;
}>;

export type CreateWfmStatusMutation = {
  __typename?: "Mutation";
  createWFMStatus: {
    __typename?: "WFMStatus";
    id: string;
    name: string;
    description?: string | null;
    color?: string | null;
    isArchived: boolean;
    createdAt: string;
    updatedAt: string;
    createdByUser?: {
      __typename?: "User";
      id: string;
      display_name?: string | null;
    } | null;
    updatedByUser?: {
      __typename?: "User";
      id: string;
      display_name?: string | null;
    } | null;
  };
};

export type UpdateWfmStatusMutationVariables = Exact<{
  id: Scalars["ID"]["input"];
  input: UpdateWfmStatusInput;
}>;

export type UpdateWfmStatusMutation = {
  __typename?: "Mutation";
  updateWFMStatus: {
    __typename?: "WFMStatus";
    id: string;
    name: string;
    description?: string | null;
    color?: string | null;
    isArchived: boolean;
    createdAt: string;
    updatedAt: string;
    createdByUser?: {
      __typename?: "User";
      id: string;
      display_name?: string | null;
    } | null;
    updatedByUser?: {
      __typename?: "User";
      id: string;
      display_name?: string | null;
    } | null;
  };
};

export type DeleteWfmStatusMutationVariables = Exact<{
  id: Scalars["ID"]["input"];
}>;

export type DeleteWfmStatusMutation = {
  __typename?: "Mutation";
  deleteWfmStatus: {
    __typename?: "WFMStatusMutationResponse";
    success: boolean;
    message?: string | null;
  };
};

export type GetWfmWorkflowsQueryVariables = Exact<{
  isArchived?: InputMaybe<Scalars["Boolean"]["input"]>;
}>;

export type GetWfmWorkflowsQuery = {
  __typename?: "Query";
  wfmWorkflows: Array<{
    __typename?: "WFMWorkflow";
    id: string;
    name: string;
    description?: string | null;
    isArchived: boolean;
    createdAt: string;
    updatedAt: string;
    createdByUser?: {
      __typename?: "User";
      id: string;
      display_name?: string | null;
    } | null;
    updatedByUser?: {
      __typename?: "User";
      id: string;
      display_name?: string | null;
    } | null;
  }>;
};

export type GetWfmWorkflowByIdQueryVariables = Exact<{
  id: Scalars["ID"]["input"];
}>;

export type GetWfmWorkflowByIdQuery = {
  __typename?: "Query";
  wfmWorkflow?: {
    __typename?: "WFMWorkflow";
    id: string;
    name: string;
    description?: string | null;
    isArchived: boolean;
    createdAt: string;
    updatedAt: string;
    createdByUser?: {
      __typename?: "User";
      id: string;
      display_name?: string | null;
    } | null;
    updatedByUser?: {
      __typename?: "User";
      id: string;
      display_name?: string | null;
    } | null;
    steps?: Array<{
      __typename?: "WFMWorkflowStep";
      id: string;
      stepOrder: number;
      isInitialStep: boolean;
      isFinalStep: boolean;
      metadata?: Record<string, any> | null;
      status: {
        __typename?: "WFMStatus";
        id: string;
        name: string;
        color?: string | null;
      };
    }> | null;
    transitions?: Array<{
      __typename?: "WFMWorkflowTransition";
      id: string;
      name?: string | null;
      fromStep: {
        __typename?: "WFMWorkflowStep";
        id: string;
        status: { __typename?: "WFMStatus"; id: string; name: string };
      };
      toStep: {
        __typename?: "WFMWorkflowStep";
        id: string;
        status: { __typename?: "WFMStatus"; id: string; name: string };
      };
    }> | null;
  } | null;
};

export type CreateWfmWorkflowMutationVariables = Exact<{
  input: CreateWfmWorkflowInput;
}>;

export type CreateWfmWorkflowMutation = {
  __typename?: "Mutation";
  createWFMWorkflow: {
    __typename?: "WFMWorkflow";
    id: string;
    name: string;
    description?: string | null;
    isArchived: boolean;
    createdAt: string;
    updatedAt: string;
  };
};

export type UpdateWfmWorkflowMutationVariables = Exact<{
  id: Scalars["ID"]["input"];
  input: UpdateWfmWorkflowInput;
}>;

export type UpdateWfmWorkflowMutation = {
  __typename?: "Mutation";
  updateWFMWorkflow: {
    __typename?: "WFMWorkflow";
    id: string;
    name: string;
    description?: string | null;
    isArchived: boolean;
    createdAt: string;
    updatedAt: string;
  };
};

export type CreateWfmWorkflowStepMutationVariables = Exact<{
  input: CreateWfmWorkflowStepInput;
}>;

export type CreateWfmWorkflowStepMutation = {
  __typename?: "Mutation";
  createWFMWorkflowStep: {
    __typename?: "WFMWorkflowStep";
    id: string;
    stepOrder: number;
    isInitialStep: boolean;
    isFinalStep: boolean;
    metadata?: Record<string, any> | null;
    createdAt: string;
    updatedAt: string;
    status: { __typename?: "WFMStatus"; id: string; name: string };
  };
};

export type UpdateWfmWorkflowStepMutationVariables = Exact<{
  id: Scalars["ID"]["input"];
  input: UpdateWfmWorkflowStepInput;
}>;

export type UpdateWfmWorkflowStepMutation = {
  __typename?: "Mutation";
  updateWFMWorkflowStep: {
    __typename?: "WFMWorkflowStep";
    id: string;
    stepOrder: number;
    isInitialStep: boolean;
    isFinalStep: boolean;
    metadata?: Record<string, any> | null;
    createdAt: string;
    updatedAt: string;
    status: {
      __typename?: "WFMStatus";
      id: string;
      name: string;
      color?: string | null;
    };
  };
};

export type RemoveWfmWorkflowStepMutationVariables = Exact<{
  id: Scalars["ID"]["input"];
}>;

export type RemoveWfmWorkflowStepMutation = {
  __typename?: "Mutation";
  deleteWFMWorkflowStep: {
    __typename?: "WFMWorkflowStepMutationResponse";
    success: boolean;
    message?: string | null;
    stepId?: string | null;
  };
};

export type UpdateWfmWorkflowStepsOrderMutationVariables = Exact<{
  workflowId: Scalars["ID"]["input"];
  orderedStepIds: Array<Scalars["ID"]["input"]> | Scalars["ID"]["input"];
}>;

export type UpdateWfmWorkflowStepsOrderMutation = {
  __typename?: "Mutation";
  updateWFMWorkflowStepsOrder?: {
    __typename?: "WFMWorkflow";
    id: string;
    name: string;
    description?: string | null;
    updatedAt: string;
    steps?: Array<{
      __typename?: "WFMWorkflowStep";
      id: string;
      stepOrder: number;
      isInitialStep: boolean;
      isFinalStep: boolean;
      metadata?: Record<string, any> | null;
      status: {
        __typename?: "WFMStatus";
        id: string;
        name: string;
        color?: string | null;
      };
    }> | null;
  } | null;
};

export type CreateWfmWorkflowTransitionMutationVariables = Exact<{
  input: CreateWfmWorkflowTransitionInput;
}>;

export type CreateWfmWorkflowTransitionMutation = {
  __typename?: "Mutation";
  createWFMWorkflowTransition: {
    __typename?: "WFMWorkflowTransition";
    id: string;
    name?: string | null;
    createdAt: string;
    updatedAt: string;
    fromStep: {
      __typename?: "WFMWorkflowStep";
      id: string;
      status: {
        __typename?: "WFMStatus";
        id: string;
        name: string;
        color?: string | null;
      };
    };
    toStep: {
      __typename?: "WFMWorkflowStep";
      id: string;
      status: {
        __typename?: "WFMStatus";
        id: string;
        name: string;
        color?: string | null;
      };
    };
  };
};

export type DeleteWfmWorkflowTransitionMutationVariables = Exact<{
  id: Scalars["ID"]["input"];
}>;

export type DeleteWfmWorkflowTransitionMutation = {
  __typename?: "Mutation";
  deleteWFMWorkflowTransition: {
    __typename?: "WFMWorkflowTransitionMutationResponse";
    success: boolean;
    message?: string | null;
    transitionId?: string | null;
  };
};

export type UpdateWfmWorkflowTransitionMutationVariables = Exact<{
  id: Scalars["ID"]["input"];
  input: UpdateWfmWorkflowTransitionInput;
}>;

export type UpdateWfmWorkflowTransitionMutation = {
  __typename?: "Mutation";
  updateWFMWorkflowTransition: {
    __typename?: "WFMWorkflowTransition";
    id: string;
    name?: string | null;
    createdAt: string;
    updatedAt: string;
    fromStep: {
      __typename?: "WFMWorkflowStep";
      id: string;
      status: {
        __typename?: "WFMStatus";
        id: string;
        name: string;
        color?: string | null;
      };
    };
    toStep: {
      __typename?: "WFMWorkflowStep";
      id: string;
      status: {
        __typename?: "WFMStatus";
        id: string;
        name: string;
        color?: string | null;
      };
    };
  };
};

export type GetOrganizationsForSimilarityQueryVariables = Exact<{
  [key: string]: never;
}>;

export type GetOrganizationsForSimilarityQuery = {
  __typename?: "Query";
  organizations: Array<{
    __typename?: "Organization";
    id: string;
    name: string;
    address?: string | null;
    notes?: string | null;
  }>;
};

export type GetExchangeRatesQueryVariables = Exact<{ [key: string]: never }>;

export type GetExchangeRatesQuery = {
  __typename?: "Query";
  exchangeRates: Array<{
    __typename?: "ExchangeRate";
    id: string;
    fromCurrency: string;
    toCurrency: string;
    rate: number;
    effectiveDate: string;
    source: string;
    createdAt: string;
    updatedAt: string;
  }>;
};

export type SetExchangeRateMutationVariables = Exact<{
  input: SetExchangeRateInput;
}>;

export type SetExchangeRateMutation = {
  __typename?: "Mutation";
  setExchangeRate: {
    __typename?: "ExchangeRate";
    id: string;
    fromCurrency: string;
    toCurrency: string;
    rate: number;
    effectiveDate: string;
    source: string;
    createdAt: string;
    updatedAt: string;
  };
};

export type UpdateRatesFromEcbMutationVariables = Exact<{
  [key: string]: never;
}>;

export type UpdateRatesFromEcbMutation = {
  __typename?: "Mutation";
  updateRatesFromECB: {
    __typename?: "CurrencyOperationResult";
    success: boolean;
    message: string;
  };
};

export type GetGoogleIntegrationStatusQueryVariables = Exact<{
  [key: string]: never;
}>;

export type GetGoogleIntegrationStatusQuery = {
  __typename?: "Query";
  googleIntegrationStatus: {
    __typename?: "GoogleIntegrationStatus";
    isConnected: boolean;
    hasGoogleAuth: boolean;
    hasDriveAccess: boolean;
    hasGmailAccess: boolean;
    hasCalendarAccess: boolean;
    hasContactsAccess: boolean;
    tokenExpiry?: string | null;
    missingScopes: Array<string>;
  };
};

export type RevokeGoogleIntegrationMutationVariables = Exact<{
  [key: string]: never;
}>;

export type RevokeGoogleIntegrationMutation = {
  __typename?: "Mutation";
  revokeGoogleIntegration: boolean;
};

export type ConnectGoogleIntegrationMutationVariables = Exact<{
  input: ConnectGoogleIntegrationInput;
}>;

export type ConnectGoogleIntegrationMutation = {
  __typename?: "Mutation";
  connectGoogleIntegration: {
    __typename?: "GoogleIntegrationStatus";
    isConnected: boolean;
    hasGoogleAuth: boolean;
    hasDriveAccess: boolean;
    hasGmailAccess: boolean;
    hasCalendarAccess: boolean;
    hasContactsAccess: boolean;
    tokenExpiry?: string | null;
    missingScopes: Array<string>;
  };
};

export type GetLeadDetailsQueryVariables = Exact<{
  id: Scalars["ID"]["input"];
}>;

export type GetLeadDetailsQuery = {
  __typename?: "Query";
  lead?: {
    __typename?: "Lead";
    id: string;
    name: string;
    source?: string | null;
    description?: string | null;
    contact_name?: string | null;
    contact_email?: string | null;
    contact_phone?: string | null;
    company_name?: string | null;
    estimated_value?: number | null;
    estimated_close_date?: string | null;
    lead_score: number;
    isQualified: boolean;
    assigned_to_user_id?: string | null;
    assigned_at?: string | null;
    converted_at?: string | null;
    converted_to_deal_id?: string | null;
    last_activity_at: string;
    created_at: string;
    updated_at: string;
    assignedToUser?: {
      __typename?: "User";
      id: string;
      email: string;
      display_name?: string | null;
      avatar_url?: string | null;
    } | null;
    currentWfmStatus?: {
      __typename?: "WFMStatus";
      id: string;
      name: string;
      color?: string | null;
    } | null;
  } | null;
};

export type GetStickerCategoriesForLeadQueryVariables = Exact<{
  [key: string]: never;
}>;

export type GetStickerCategoriesForLeadQuery = {
  __typename?: "Query";
  getStickerCategories: Array<{
    __typename?: "StickerCategory";
    id: string;
    name: string;
    color: string;
    icon?: string | null;
    isSystem: boolean;
    displayOrder: number;
  }>;
};

export type GetPersonCustomFieldDefinitionsQueryVariables = Exact<{
  [key: string]: never;
}>;

export type GetPersonCustomFieldDefinitionsQuery = {
  __typename?: "Query";
  customFieldDefinitions: Array<{
    __typename?: "CustomFieldDefinition";
    id: string;
    fieldName: string;
    fieldLabel: string;
    fieldType: CustomFieldType;
    dropdownOptions?: Array<{
      __typename?: "CustomFieldOption";
      value: string;
      label: string;
    }> | null;
  }>;
};

export type GetRolesQueryVariables = Exact<{ [key: string]: never }>;

export type GetRolesQuery = {
  __typename?: "Query";
  roles: Array<{
    __typename?: "Role";
    id: string;
    name: string;
    description: string;
  }>;
};

export type AssignUserRoleMutationVariables = Exact<{
  userId: Scalars["ID"]["input"];
  roleName: Scalars["String"]["input"];
}>;

export type AssignUserRoleMutation = {
  __typename?: "Mutation";
  assignUserRole: {
    __typename?: "User";
    id: string;
    email: string;
    roles: Array<{
      __typename?: "Role";
      id: string;
      name: string;
      description: string;
    }>;
  };
};

export type RemoveUserRoleMutationVariables = Exact<{
  userId: Scalars["ID"]["input"];
  roleName: Scalars["String"]["input"];
}>;

export type RemoveUserRoleMutation = {
  __typename?: "Mutation";
  removeUserRole: {
    __typename?: "User";
    id: string;
    email: string;
    roles: Array<{
      __typename?: "Role";
      id: string;
      name: string;
      description: string;
    }>;
  };
};

export type CreateAgentConversationMutationVariables = Exact<{
  config?: InputMaybe<AgentConfigInput>;
}>;

export type CreateAgentConversationMutation = {
  __typename?: "Mutation";
  createAgentConversation: {
    __typename?: "AgentConversation";
    id: string;
    userId: string;
    context: Record<string, any>;
    createdAt: string;
    updatedAt: string;
    messages: Array<{
      __typename?: "AgentMessage";
      role: string;
      content: string;
      timestamp: string;
      thoughts?: Array<{
        __typename?: "AgentThought";
        id: string;
        type: AgentThoughtType;
        content: string;
        metadata: Record<string, any>;
        timestamp: string;
      }> | null;
    }>;
    plan?: {
      __typename?: "AgentPlan";
      goal: string;
      context: Record<string, any>;
      steps: Array<{
        __typename?: "AgentPlanStep";
        id: string;
        description: string;
        toolName?: string | null;
        status: AgentStepStatus;
      }>;
    } | null;
  };
};

export type GetAgentConversationsQueryVariables = Exact<{
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
}>;

export type GetAgentConversationsQuery = {
  __typename?: "Query";
  agentConversations: Array<{
    __typename?: "AgentConversation";
    id: string;
    userId: string;
    context: Record<string, any>;
    createdAt: string;
    updatedAt: string;
    messages: Array<{
      __typename?: "AgentMessage";
      role: string;
      content: string;
      timestamp: string;
      thoughts?: Array<{
        __typename?: "AgentThought";
        id: string;
        type: AgentThoughtType;
        content: string;
        metadata: Record<string, any>;
        timestamp: string;
      }> | null;
    }>;
  }>;
};

export type SendAgentMessageMutationVariables = Exact<{
  input: SendMessageInput;
}>;

export type SendAgentMessageMutation = {
  __typename?: "Mutation";
  sendAgentMessage: {
    __typename?: "AgentResponse";
    conversation: {
      __typename?: "AgentConversation";
      id: string;
      userId: string;
      context: Record<string, any>;
      createdAt: string;
      updatedAt: string;
      messages: Array<{
        __typename?: "AgentMessage";
        role: string;
        content: string;
        timestamp: string;
        thoughts?: Array<{
          __typename?: "AgentThought";
          id: string;
          type: AgentThoughtType;
          content: string;
          metadata: Record<string, any>;
          timestamp: string;
        }> | null;
      }>;
      plan?: {
        __typename?: "AgentPlan";
        goal: string;
        context: Record<string, any>;
        steps: Array<{
          __typename?: "AgentPlanStep";
          id: string;
          description: string;
          toolName?: string | null;
          status: AgentStepStatus;
          result?: Record<string, any> | null;
        }>;
      } | null;
    };
    message: {
      __typename?: "AgentMessage";
      role: string;
      content: string;
      timestamp: string;
    };
    thoughts: Array<{
      __typename?: "AgentThought";
      id: string;
      type: AgentThoughtType;
      content: string;
      metadata: Record<string, any>;
      timestamp: string;
    }>;
    plan?: {
      __typename?: "AgentPlan";
      goal: string;
      context: Record<string, any>;
      steps: Array<{
        __typename?: "AgentPlanStep";
        id: string;
        description: string;
        toolName?: string | null;
        status: AgentStepStatus;
      }>;
    } | null;
  };
};

export type DeleteAgentConversationMutationVariables = Exact<{
  id: Scalars["ID"]["input"];
}>;

export type DeleteAgentConversationMutation = {
  __typename?: "Mutation";
  deleteAgentConversation: boolean;
};

export type DiscoverAgentToolsQueryVariables = Exact<{ [key: string]: never }>;

export type DiscoverAgentToolsQuery = {
  __typename?: "Query";
  discoverAgentTools: {
    __typename?: "ToolDiscoveryResponse";
    tools: Array<Record<string, any>>;
    error?: string | null;
  };
};

export type GetMyPermissionsQueryVariables = Exact<{ [key: string]: never }>;

export type GetMyPermissionsQuery = {
  __typename?: "Query";
  myPermissions?: Array<string> | null;
};

export type GetDealWithHistoryQueryVariables = Exact<{
  dealId: Scalars["ID"]["input"];
}>;

export type GetDealWithHistoryQuery = {
  __typename?: "Query";
  deal?: {
    __typename?: "Deal";
    id: string;
    name: string;
    amount?: number | null;
    currency?: string | null;
    expected_close_date?: string | null;
    created_at: string;
    updated_at: string;
    deal_specific_probability?: number | null;
    weighted_amount?: number | null;
    user_id: string;
    assigned_to_user_id?: string | null;
    project_id: string;
    wfm_project_id?: string | null;
    assignedToUser?: {
      __typename?: "User";
      id: string;
      display_name?: string | null;
      email: string;
    } | null;
    currentWfmStatus?: {
      __typename?: "WFMStatus";
      id: string;
      name: string;
      color?: string | null;
    } | null;
    currentWfmStep?: {
      __typename?: "WFMWorkflowStep";
      id: string;
      stepOrder: number;
      isInitialStep: boolean;
      isFinalStep: boolean;
      metadata?: Record<string, any> | null;
      status: {
        __typename?: "WFMStatus";
        id: string;
        name: string;
        color?: string | null;
      };
    } | null;
    person?: {
      __typename?: "Person";
      id: string;
      first_name?: string | null;
      last_name?: string | null;
      email?: string | null;
    } | null;
    organization?: {
      __typename?: "Organization";
      id: string;
      name: string;
    } | null;
    customFieldValues: Array<{
      __typename?: "CustomFieldValue";
      stringValue?: string | null;
      numberValue?: number | null;
      booleanValue?: boolean | null;
      dateValue?: string | null;
      selectedOptionValues?: Array<string> | null;
      definition: {
        __typename?: "CustomFieldDefinition";
        id: string;
        fieldName: string;
        fieldLabel: string;
        fieldType: CustomFieldType;
        dropdownOptions?: Array<{
          __typename?: "CustomFieldOption";
          value: string;
          label: string;
        }> | null;
      };
    }>;
    history?: Array<{
      __typename?: "DealHistoryEntry";
      id: string;
      eventType: string;
      changes?: Record<string, any> | null;
      createdAt: string;
      user?: {
        __typename?: "User";
        id: string;
        email: string;
        display_name?: string | null;
      } | null;
    }> | null;
  } | null;
};

export type GetBusinessRulesQueryVariables = Exact<{ [key: string]: never }>;

export type GetBusinessRulesQuery = {
  __typename?: "Query";
  businessRules: {
    __typename?: "BusinessRulesConnection";
    totalCount: number;
    nodes: Array<{
      __typename?: "BusinessRule";
      id: string;
      name: string;
      description?: string | null;
      entityType: EntityTypeEnum;
      triggerType: TriggerTypeEnum;
      triggerEvents: Array<string>;
      triggerFields: Array<string>;
      status: RuleStatusEnum;
      executionCount: number;
      lastError?: string | null;
      lastExecution?: string | null;
      createdAt: string;
      updatedAt: string;
      conditions: Array<{
        __typename?: "RuleCondition";
        field: string;
        operator: RuleConditionOperator;
        value: string;
        logicalOperator: LogicalOperator;
      }>;
      actions: Array<{
        __typename?: "RuleAction";
        type: RuleActionType;
        target?: string | null;
        template?: string | null;
        message?: string | null;
        priority: number;
        metadata?: Record<string, any> | null;
      }>;
      wfmWorkflow?: {
        __typename?: "WFMWorkflow";
        id: string;
        name: string;
      } | null;
      wfmStep?: {
        __typename?: "WFMWorkflowStep";
        id: string;
        status: { __typename?: "WFMStatus"; id: string; name: string };
      } | null;
      wfmStatus?: { __typename?: "WFMStatus"; id: string; name: string } | null;
      createdBy?: {
        __typename?: "User";
        id: string;
        email: string;
        display_name?: string | null;
      } | null;
    }>;
  };
};

export type CreateBusinessRuleMutationVariables = Exact<{
  input: BusinessRuleInput;
}>;

export type CreateBusinessRuleMutation = {
  __typename?: "Mutation";
  createBusinessRule: {
    __typename?: "BusinessRule";
    id: string;
    name: string;
    description?: string | null;
    entityType: EntityTypeEnum;
    triggerType: TriggerTypeEnum;
    triggerEvents: Array<string>;
    triggerFields: Array<string>;
    status: RuleStatusEnum;
    executionCount: number;
    lastError?: string | null;
    lastExecution?: string | null;
    createdAt: string;
    updatedAt: string;
    conditions: Array<{
      __typename?: "RuleCondition";
      field: string;
      operator: RuleConditionOperator;
      value: string;
      logicalOperator: LogicalOperator;
    }>;
    actions: Array<{
      __typename?: "RuleAction";
      type: RuleActionType;
      target?: string | null;
      template?: string | null;
      message?: string | null;
      priority: number;
      metadata?: Record<string, any> | null;
    }>;
  };
};

export type UpdateBusinessRuleMutationVariables = Exact<{
  id: Scalars["ID"]["input"];
  input: UpdateBusinessRuleInput;
}>;

export type UpdateBusinessRuleMutation = {
  __typename?: "Mutation";
  updateBusinessRule: {
    __typename?: "BusinessRule";
    id: string;
    name: string;
    description?: string | null;
    entityType: EntityTypeEnum;
    triggerType: TriggerTypeEnum;
    triggerEvents: Array<string>;
    triggerFields: Array<string>;
    status: RuleStatusEnum;
    executionCount: number;
    lastError?: string | null;
    lastExecution?: string | null;
    createdAt: string;
    updatedAt: string;
    conditions: Array<{
      __typename?: "RuleCondition";
      field: string;
      operator: RuleConditionOperator;
      value: string;
      logicalOperator: LogicalOperator;
    }>;
    actions: Array<{
      __typename?: "RuleAction";
      type: RuleActionType;
      target?: string | null;
      template?: string | null;
      message?: string | null;
      priority: number;
      metadata?: Record<string, any> | null;
    }>;
  };
};

export type DeleteBusinessRuleMutationVariables = Exact<{
  id: Scalars["ID"]["input"];
}>;

export type DeleteBusinessRuleMutation = {
  __typename?: "Mutation";
  deleteBusinessRule: boolean;
};

export type ActivateBusinessRuleMutationVariables = Exact<{
  id: Scalars["ID"]["input"];
}>;

export type ActivateBusinessRuleMutation = {
  __typename?: "Mutation";
  activateBusinessRule: {
    __typename?: "BusinessRule";
    id: string;
    status: RuleStatusEnum;
    updatedAt: string;
  };
};

export type DeactivateBusinessRuleMutationVariables = Exact<{
  id: Scalars["ID"]["input"];
}>;

export type DeactivateBusinessRuleMutation = {
  __typename?: "Mutation";
  deactivateBusinessRule: {
    __typename?: "BusinessRule";
    id: string;
    status: RuleStatusEnum;
    updatedAt: string;
  };
};

export type PersonFieldsFragment = {
  __typename?: "Person";
  id: string;
  first_name?: string | null;
  last_name?: string | null;
  email?: string | null;
};

export type OrganizationFieldsFragment = {
  __typename?: "Organization";
  id: string;
  name: string;
};

export type UserProfileFieldsFragment = {
  __typename?: "User";
  id: string;
  display_name?: string | null;
  email: string;
  avatar_url?: string | null;
};

export type CustomFieldValueFieldsFragment = {
  __typename?: "CustomFieldValue";
  stringValue?: string | null;
  numberValue?: number | null;
  booleanValue?: boolean | null;
  dateValue?: string | null;
  selectedOptionValues?: Array<string> | null;
  definition: {
    __typename?: "CustomFieldDefinition";
    id: string;
    fieldName: string;
    fieldType: CustomFieldType;
  };
};

export type WfmStepFieldsFragment = {
  __typename?: "WFMWorkflowStep";
  id: string;
  stepOrder: number;
  isInitialStep: boolean;
  isFinalStep: boolean;
  metadata?: Record<string, any> | null;
  status: {
    __typename?: "WFMStatus";
    id: string;
    name: string;
    color?: string | null;
  };
};

export type WfmStatusFieldsFragment = {
  __typename?: "WFMStatus";
  id: string;
  name: string;
  color?: string | null;
};

export type DealCoreFieldsFragment = {
  __typename?: "Deal";
  id: string;
  name: string;
  amount?: number | null;
  currency?: string | null;
  expected_close_date?: string | null;
  created_at: string;
  updated_at: string;
  person_id?: string | null;
  organization_id?: string | null;
  project_id: string;
  user_id: string;
  assigned_to_user_id?: string | null;
  deal_specific_probability?: number | null;
  weighted_amount?: number | null;
  wfm_project_id?: string | null;
};

export type GetDealsQueryVariables = Exact<{ [key: string]: never }>;

export type GetDealsQuery = {
  __typename?: "Query";
  deals: Array<{
    __typename?: "Deal";
    id: string;
    name: string;
    amount?: number | null;
    currency?: string | null;
    expected_close_date?: string | null;
    created_at: string;
    updated_at: string;
    person_id?: string | null;
    organization_id?: string | null;
    project_id: string;
    user_id: string;
    assigned_to_user_id?: string | null;
    deal_specific_probability?: number | null;
    weighted_amount?: number | null;
    wfm_project_id?: string | null;
    person?: {
      __typename?: "Person";
      id: string;
      first_name?: string | null;
      last_name?: string | null;
      email?: string | null;
    } | null;
    organization?: {
      __typename?: "Organization";
      id: string;
      name: string;
    } | null;
    assignedToUser?: {
      __typename?: "User";
      id: string;
      display_name?: string | null;
      email: string;
      avatar_url?: string | null;
    } | null;
    customFieldValues: Array<{
      __typename?: "CustomFieldValue";
      stringValue?: string | null;
      numberValue?: number | null;
      booleanValue?: boolean | null;
      dateValue?: string | null;
      selectedOptionValues?: Array<string> | null;
      definition: {
        __typename?: "CustomFieldDefinition";
        id: string;
        fieldName: string;
        fieldType: CustomFieldType;
      };
    }>;
    currentWfmStep?: {
      __typename?: "WFMWorkflowStep";
      id: string;
      stepOrder: number;
      isInitialStep: boolean;
      isFinalStep: boolean;
      metadata?: Record<string, any> | null;
      status: {
        __typename?: "WFMStatus";
        id: string;
        name: string;
        color?: string | null;
      };
    } | null;
    currentWfmStatus?: {
      __typename?: "WFMStatus";
      id: string;
      name: string;
      color?: string | null;
    } | null;
  }>;
};

export type CreateDealMutationVariables = Exact<{
  input: DealInput;
}>;

export type CreateDealMutation = {
  __typename?: "Mutation";
  createDeal: {
    __typename?: "Deal";
    id: string;
    name: string;
    amount?: number | null;
    currency?: string | null;
    expected_close_date?: string | null;
    created_at: string;
    updated_at: string;
    person_id?: string | null;
    organization_id?: string | null;
    project_id: string;
    user_id: string;
    assigned_to_user_id?: string | null;
    deal_specific_probability?: number | null;
    weighted_amount?: number | null;
    wfm_project_id?: string | null;
    person?: {
      __typename?: "Person";
      id: string;
      first_name?: string | null;
      last_name?: string | null;
      email?: string | null;
    } | null;
    organization?: {
      __typename?: "Organization";
      id: string;
      name: string;
    } | null;
    assignedToUser?: {
      __typename?: "User";
      id: string;
      display_name?: string | null;
      email: string;
      avatar_url?: string | null;
    } | null;
    currentWfmStep?: {
      __typename?: "WFMWorkflowStep";
      id: string;
      stepOrder: number;
      isInitialStep: boolean;
      isFinalStep: boolean;
      metadata?: Record<string, any> | null;
      status: {
        __typename?: "WFMStatus";
        id: string;
        name: string;
        color?: string | null;
      };
    } | null;
    currentWfmStatus?: {
      __typename?: "WFMStatus";
      id: string;
      name: string;
      color?: string | null;
    } | null;
  };
};

export type UpdateDealMutationVariables = Exact<{
  id: Scalars["ID"]["input"];
  input: DealUpdateInput;
}>;

export type UpdateDealMutation = {
  __typename?: "Mutation";
  updateDeal?: {
    __typename?: "Deal";
    id: string;
    name: string;
    amount?: number | null;
    currency?: string | null;
    expected_close_date?: string | null;
    created_at: string;
    updated_at: string;
    person_id?: string | null;
    organization_id?: string | null;
    project_id: string;
    user_id: string;
    assigned_to_user_id?: string | null;
    deal_specific_probability?: number | null;
    weighted_amount?: number | null;
    wfm_project_id?: string | null;
    person?: {
      __typename?: "Person";
      id: string;
      first_name?: string | null;
      last_name?: string | null;
      email?: string | null;
    } | null;
    assignedToUser?: {
      __typename?: "User";
      id: string;
      display_name?: string | null;
      email: string;
      avatar_url?: string | null;
    } | null;
  } | null;
};

export type DeleteDealMutationVariables = Exact<{
  id: Scalars["ID"]["input"];
}>;

export type DeleteDealMutation = {
  __typename?: "Mutation";
  deleteDeal?: boolean | null;
};

export type UpdateDealWfmProgressMutationVariables = Exact<{
  dealId: Scalars["ID"]["input"];
  targetWfmWorkflowStepId: Scalars["ID"]["input"];
}>;

export type UpdateDealWfmProgressMutation = {
  __typename?: "Mutation";
  updateDealWFMProgress: {
    __typename?: "Deal";
    wfm_project_id?: string | null;
    id: string;
    name: string;
    amount?: number | null;
    currency?: string | null;
    expected_close_date?: string | null;
    created_at: string;
    updated_at: string;
    person_id?: string | null;
    organization_id?: string | null;
    project_id: string;
    user_id: string;
    assigned_to_user_id?: string | null;
    deal_specific_probability?: number | null;
    weighted_amount?: number | null;
    currentWfmStep?: {
      __typename?: "WFMWorkflowStep";
      id: string;
      stepOrder: number;
      isInitialStep: boolean;
      isFinalStep: boolean;
      metadata?: Record<string, any> | null;
      status: {
        __typename?: "WFMStatus";
        id: string;
        name: string;
        color?: string | null;
      };
    } | null;
    currentWfmStatus?: {
      __typename?: "WFMStatus";
      id: string;
      name: string;
      color?: string | null;
    } | null;
  };
};

export type LeadCoreFieldsFragment = {
  __typename?: "Lead";
  id: string;
  name: string;
  source?: string | null;
  description?: string | null;
  contact_name?: string | null;
  contact_email?: string | null;
  contact_phone?: string | null;
  company_name?: string | null;
  estimated_value?: number | null;
  estimated_close_date?: string | null;
  lead_score: number;
  lead_score_factors?: Record<string, any> | null;
  isQualified: boolean;
  qualificationLevel: number;
  qualificationStatus: string;
  assigned_to_user_id?: string | null;
  assigned_at?: string | null;
  converted_at?: string | null;
  converted_to_deal_id?: string | null;
  converted_to_person_id?: string | null;
  converted_to_organization_id?: string | null;
  converted_by_user_id?: string | null;
  wfm_project_id?: string | null;
  last_activity_at: string;
  automation_score_factors?: Record<string, any> | null;
  ai_insights?: Record<string, any> | null;
  user_id: string;
  created_at: string;
  updated_at: string;
  customFieldValues: Array<{
    __typename?: "CustomFieldValue";
    stringValue?: string | null;
    numberValue?: number | null;
    booleanValue?: boolean | null;
    dateValue?: string | null;
    selectedOptionValues?: Array<string> | null;
    definition: {
      __typename?: "CustomFieldDefinition";
      id: string;
      fieldName: string;
      fieldType: CustomFieldType;
    };
  }>;
};

export type GetLeadsQueryVariables = Exact<{ [key: string]: never }>;

export type GetLeadsQuery = {
  __typename?: "Query";
  leads: Array<{
    __typename?: "Lead";
    id: string;
    name: string;
    source?: string | null;
    description?: string | null;
    contact_name?: string | null;
    contact_email?: string | null;
    contact_phone?: string | null;
    company_name?: string | null;
    estimated_value?: number | null;
    estimated_close_date?: string | null;
    lead_score: number;
    lead_score_factors?: Record<string, any> | null;
    isQualified: boolean;
    qualificationLevel: number;
    qualificationStatus: string;
    assigned_to_user_id?: string | null;
    assigned_at?: string | null;
    converted_at?: string | null;
    converted_to_deal_id?: string | null;
    converted_to_person_id?: string | null;
    converted_to_organization_id?: string | null;
    converted_by_user_id?: string | null;
    wfm_project_id?: string | null;
    last_activity_at: string;
    automation_score_factors?: Record<string, any> | null;
    ai_insights?: Record<string, any> | null;
    user_id: string;
    created_at: string;
    updated_at: string;
    assignedToUser?: {
      __typename?: "User";
      id: string;
      display_name?: string | null;
      email: string;
      avatar_url?: string | null;
    } | null;
    currentWfmStep?: {
      __typename?: "WFMWorkflowStep";
      id: string;
      stepOrder: number;
      isInitialStep: boolean;
      isFinalStep: boolean;
      metadata?: Record<string, any> | null;
      status: {
        __typename?: "WFMStatus";
        id: string;
        name: string;
        color?: string | null;
      };
    } | null;
    currentWfmStatus?: {
      __typename?: "WFMStatus";
      id: string;
      name: string;
      color?: string | null;
    } | null;
    customFieldValues: Array<{
      __typename?: "CustomFieldValue";
      stringValue?: string | null;
      numberValue?: number | null;
      booleanValue?: boolean | null;
      dateValue?: string | null;
      selectedOptionValues?: Array<string> | null;
      definition: {
        __typename?: "CustomFieldDefinition";
        id: string;
        fieldName: string;
        fieldType: CustomFieldType;
      };
    }>;
  }>;
};

export type CreateLeadMutationVariables = Exact<{
  input: LeadInput;
}>;

export type CreateLeadMutation = {
  __typename?: "Mutation";
  createLead: {
    __typename?: "Lead";
    id: string;
    name: string;
    source?: string | null;
    description?: string | null;
    contact_name?: string | null;
    contact_email?: string | null;
    contact_phone?: string | null;
    company_name?: string | null;
    estimated_value?: number | null;
    estimated_close_date?: string | null;
    lead_score: number;
    lead_score_factors?: Record<string, any> | null;
    isQualified: boolean;
    qualificationLevel: number;
    qualificationStatus: string;
    assigned_to_user_id?: string | null;
    assigned_at?: string | null;
    converted_at?: string | null;
    converted_to_deal_id?: string | null;
    converted_to_person_id?: string | null;
    converted_to_organization_id?: string | null;
    converted_by_user_id?: string | null;
    wfm_project_id?: string | null;
    last_activity_at: string;
    automation_score_factors?: Record<string, any> | null;
    ai_insights?: Record<string, any> | null;
    user_id: string;
    created_at: string;
    updated_at: string;
    assignedToUser?: {
      __typename?: "User";
      id: string;
      display_name?: string | null;
      email: string;
      avatar_url?: string | null;
    } | null;
    currentWfmStep?: {
      __typename?: "WFMWorkflowStep";
      id: string;
      stepOrder: number;
      isInitialStep: boolean;
      isFinalStep: boolean;
      metadata?: Record<string, any> | null;
      status: {
        __typename?: "WFMStatus";
        id: string;
        name: string;
        color?: string | null;
      };
    } | null;
    currentWfmStatus?: {
      __typename?: "WFMStatus";
      id: string;
      name: string;
      color?: string | null;
    } | null;
    customFieldValues: Array<{
      __typename?: "CustomFieldValue";
      stringValue?: string | null;
      numberValue?: number | null;
      booleanValue?: boolean | null;
      dateValue?: string | null;
      selectedOptionValues?: Array<string> | null;
      definition: {
        __typename?: "CustomFieldDefinition";
        id: string;
        fieldName: string;
        fieldType: CustomFieldType;
      };
    }>;
  };
};

export type UpdateLeadMutationVariables = Exact<{
  id: Scalars["ID"]["input"];
  input: LeadUpdateInput;
}>;

export type UpdateLeadMutation = {
  __typename?: "Mutation";
  updateLead?: {
    __typename?: "Lead";
    id: string;
    name: string;
    source?: string | null;
    description?: string | null;
    contact_name?: string | null;
    contact_email?: string | null;
    contact_phone?: string | null;
    company_name?: string | null;
    estimated_value?: number | null;
    estimated_close_date?: string | null;
    lead_score: number;
    lead_score_factors?: Record<string, any> | null;
    isQualified: boolean;
    qualificationLevel: number;
    qualificationStatus: string;
    assigned_to_user_id?: string | null;
    assigned_at?: string | null;
    converted_at?: string | null;
    converted_to_deal_id?: string | null;
    converted_to_person_id?: string | null;
    converted_to_organization_id?: string | null;
    converted_by_user_id?: string | null;
    wfm_project_id?: string | null;
    last_activity_at: string;
    automation_score_factors?: Record<string, any> | null;
    ai_insights?: Record<string, any> | null;
    user_id: string;
    created_at: string;
    updated_at: string;
    assignedToUser?: {
      __typename?: "User";
      id: string;
      display_name?: string | null;
      email: string;
      avatar_url?: string | null;
    } | null;
    customFieldValues: Array<{
      __typename?: "CustomFieldValue";
      stringValue?: string | null;
      numberValue?: number | null;
      booleanValue?: boolean | null;
      dateValue?: string | null;
      selectedOptionValues?: Array<string> | null;
      definition: {
        __typename?: "CustomFieldDefinition";
        id: string;
        fieldName: string;
        fieldType: CustomFieldType;
      };
    }>;
  } | null;
};

export type DeleteLeadMutationVariables = Exact<{
  id: Scalars["ID"]["input"];
}>;

export type DeleteLeadMutation = {
  __typename?: "Mutation";
  deleteLead?: boolean | null;
};

export type UpdateLeadWfmProgressMutationVariables = Exact<{
  leadId: Scalars["ID"]["input"];
  targetWfmWorkflowStepId: Scalars["ID"]["input"];
}>;

export type UpdateLeadWfmProgressMutation = {
  __typename?: "Mutation";
  updateLeadWFMProgress: {
    __typename?: "Lead";
    id: string;
    name: string;
    source?: string | null;
    description?: string | null;
    contact_name?: string | null;
    contact_email?: string | null;
    contact_phone?: string | null;
    company_name?: string | null;
    estimated_value?: number | null;
    estimated_close_date?: string | null;
    lead_score: number;
    lead_score_factors?: Record<string, any> | null;
    isQualified: boolean;
    qualificationLevel: number;
    qualificationStatus: string;
    assigned_to_user_id?: string | null;
    assigned_at?: string | null;
    converted_at?: string | null;
    converted_to_deal_id?: string | null;
    converted_to_person_id?: string | null;
    converted_to_organization_id?: string | null;
    converted_by_user_id?: string | null;
    wfm_project_id?: string | null;
    last_activity_at: string;
    automation_score_factors?: Record<string, any> | null;
    ai_insights?: Record<string, any> | null;
    user_id: string;
    created_at: string;
    updated_at: string;
    assignedToUser?: {
      __typename?: "User";
      id: string;
      display_name?: string | null;
      email: string;
      avatar_url?: string | null;
    } | null;
    currentWfmStep?: {
      __typename?: "WFMWorkflowStep";
      id: string;
      stepOrder: number;
      isInitialStep: boolean;
      isFinalStep: boolean;
      metadata?: Record<string, any> | null;
      status: {
        __typename?: "WFMStatus";
        id: string;
        name: string;
        color?: string | null;
      };
    } | null;
    currentWfmStatus?: {
      __typename?: "WFMStatus";
      id: string;
      name: string;
      color?: string | null;
    } | null;
    customFieldValues: Array<{
      __typename?: "CustomFieldValue";
      stringValue?: string | null;
      numberValue?: number | null;
      booleanValue?: boolean | null;
      dateValue?: string | null;
      selectedOptionValues?: Array<string> | null;
      definition: {
        __typename?: "CustomFieldDefinition";
        id: string;
        fieldName: string;
        fieldType: CustomFieldType;
      };
    }>;
  };
};

export type CustomFieldValuesDataFragment = {
  __typename?: "CustomFieldValue";
  stringValue?: string | null;
  numberValue?: number | null;
  booleanValue?: boolean | null;
  dateValue?: string | null;
  selectedOptionValues?: Array<string> | null;
  definition: {
    __typename?: "CustomFieldDefinition";
    id: string;
    fieldName: string;
    fieldLabel: string;
    fieldType: CustomFieldType;
    displayOrder: number;
    isRequired: boolean;
    isActive: boolean;
    dropdownOptions?: Array<{
      __typename?: "CustomFieldOption";
      value: string;
      label: string;
    }> | null;
  };
};

export type GetOrganizationsQueryVariables = Exact<{ [key: string]: never }>;

export type GetOrganizationsQuery = {
  __typename?: "Query";
  organizations: Array<{
    __typename?: "Organization";
    id: string;
    name: string;
    address?: string | null;
    notes?: string | null;
    created_at: string;
    updated_at: string;
    account_manager_id?: string | null;
    accountManager?: {
      __typename?: "User";
      id: string;
      display_name?: string | null;
      email: string;
      avatar_url?: string | null;
    } | null;
    customFieldValues: Array<{
      __typename?: "CustomFieldValue";
      stringValue?: string | null;
      numberValue?: number | null;
      booleanValue?: boolean | null;
      dateValue?: string | null;
      selectedOptionValues?: Array<string> | null;
      definition: {
        __typename?: "CustomFieldDefinition";
        id: string;
        fieldName: string;
        fieldLabel: string;
        fieldType: CustomFieldType;
        displayOrder: number;
        isRequired: boolean;
        isActive: boolean;
        dropdownOptions?: Array<{
          __typename?: "CustomFieldOption";
          value: string;
          label: string;
        }> | null;
      };
    }>;
  }>;
};

export type GetOrganizationByIdQueryVariables = Exact<{
  id: Scalars["ID"]["input"];
}>;

export type GetOrganizationByIdQuery = {
  __typename?: "Query";
  organization?: {
    __typename?: "Organization";
    id: string;
    name: string;
    address?: string | null;
    notes?: string | null;
    created_at: string;
    updated_at: string;
    account_manager_id?: string | null;
    totalDealValue?: number | null;
    activeDealCount?: number | null;
    accountManager?: {
      __typename?: "User";
      id: string;
      display_name?: string | null;
      email: string;
      avatar_url?: string | null;
    } | null;
    people?: Array<{
      __typename?: "Person";
      id: string;
      first_name?: string | null;
      last_name?: string | null;
      email?: string | null;
      phone?: string | null;
      notes?: string | null;
      created_at: string;
      updated_at: string;
    }> | null;
    customFieldValues: Array<{
      __typename?: "CustomFieldValue";
      stringValue?: string | null;
      numberValue?: number | null;
      booleanValue?: boolean | null;
      dateValue?: string | null;
      selectedOptionValues?: Array<string> | null;
      definition: {
        __typename?: "CustomFieldDefinition";
        id: string;
        fieldName: string;
        fieldLabel: string;
        fieldType: CustomFieldType;
        displayOrder: number;
        isRequired: boolean;
        isActive: boolean;
        dropdownOptions?: Array<{
          __typename?: "CustomFieldOption";
          value: string;
          label: string;
        }> | null;
      };
    }>;
  } | null;
};

export type CreateOrganizationMutationVariables = Exact<{
  input: OrganizationInput;
}>;

export type CreateOrganizationMutation = {
  __typename?: "Mutation";
  createOrganization: {
    __typename?: "Organization";
    id: string;
    name: string;
    address?: string | null;
    notes?: string | null;
    created_at: string;
    updated_at: string;
    account_manager_id?: string | null;
    accountManager?: {
      __typename?: "User";
      id: string;
      display_name?: string | null;
      email: string;
      avatar_url?: string | null;
    } | null;
    customFieldValues: Array<{
      __typename?: "CustomFieldValue";
      stringValue?: string | null;
      numberValue?: number | null;
      booleanValue?: boolean | null;
      dateValue?: string | null;
      selectedOptionValues?: Array<string> | null;
      definition: {
        __typename?: "CustomFieldDefinition";
        id: string;
        fieldName: string;
        fieldLabel: string;
        fieldType: CustomFieldType;
        displayOrder: number;
        isRequired: boolean;
        isActive: boolean;
        dropdownOptions?: Array<{
          __typename?: "CustomFieldOption";
          value: string;
          label: string;
        }> | null;
      };
    }>;
  };
};

export type UpdateOrganizationMutationVariables = Exact<{
  id: Scalars["ID"]["input"];
  input: OrganizationInput;
}>;

export type UpdateOrganizationMutation = {
  __typename?: "Mutation";
  updateOrganization?: {
    __typename?: "Organization";
    id: string;
    name: string;
    address?: string | null;
    notes?: string | null;
    created_at: string;
    updated_at: string;
    account_manager_id?: string | null;
    accountManager?: {
      __typename?: "User";
      id: string;
      display_name?: string | null;
      email: string;
      avatar_url?: string | null;
    } | null;
    customFieldValues: Array<{
      __typename?: "CustomFieldValue";
      stringValue?: string | null;
      numberValue?: number | null;
      booleanValue?: boolean | null;
      dateValue?: string | null;
      selectedOptionValues?: Array<string> | null;
      definition: {
        __typename?: "CustomFieldDefinition";
        id: string;
        fieldName: string;
        fieldLabel: string;
        fieldType: CustomFieldType;
        displayOrder: number;
        isRequired: boolean;
        isActive: boolean;
        dropdownOptions?: Array<{
          __typename?: "CustomFieldOption";
          value: string;
          label: string;
        }> | null;
      };
    }>;
  } | null;
};

export type DeleteOrganizationMutationVariables = Exact<{
  id: Scalars["ID"]["input"];
}>;

export type DeleteOrganizationMutation = {
  __typename?: "Mutation";
  deleteOrganization?: boolean | null;
};

export type GetPeopleQueryVariables = Exact<{ [key: string]: never }>;

export type GetPeopleQuery = {
  __typename?: "Query";
  people: Array<{
    __typename?: "Person";
    id: string;
    first_name?: string | null;
    last_name?: string | null;
    email?: string | null;
    phone?: string | null;
    notes?: string | null;
    created_at: string;
    updated_at: string;
    primaryOrganization?: {
      __typename?: "Organization";
      id: string;
      name: string;
    } | null;
    customFieldValues: Array<{
      __typename?: "CustomFieldValue";
      stringValue?: string | null;
      numberValue?: number | null;
      booleanValue?: boolean | null;
      dateValue?: string | null;
      selectedOptionValues?: Array<string> | null;
      definition: {
        __typename?: "CustomFieldDefinition";
        id: string;
        fieldName: string;
        fieldLabel: string;
        fieldType: CustomFieldType;
        isRequired: boolean;
        dropdownOptions?: Array<{
          __typename?: "CustomFieldOption";
          value: string;
          label: string;
        }> | null;
      };
    }>;
  }>;
};

export type GetPersonByIdQueryVariables = Exact<{
  id: Scalars["ID"]["input"];
}>;

export type GetPersonByIdQuery = {
  __typename?: "Query";
  person?: {
    __typename?: "Person";
    id: string;
    first_name?: string | null;
    last_name?: string | null;
    email?: string | null;
    phone?: string | null;
    notes?: string | null;
    created_at: string;
    updated_at: string;
    organizationRoles: Array<{
      __typename?: "PersonOrganizationRole";
      id: string;
      organization_id: string;
      role_title: string;
      department?: string | null;
      is_primary: boolean;
      status: string;
      start_date?: string | null;
      end_date?: string | null;
      notes?: string | null;
      created_at: string;
      organization: {
        __typename?: "Organization";
        id: string;
        name: string;
        address?: string | null;
      };
    }>;
    primaryOrganization?: {
      __typename?: "Organization";
      id: string;
      name: string;
      address?: string | null;
    } | null;
    primaryRole?: {
      __typename?: "PersonOrganizationRole";
      id: string;
      role_title: string;
      department?: string | null;
      is_primary: boolean;
    } | null;
    organization?: {
      __typename?: "Organization";
      id: string;
      name: string;
    } | null;
    deals: Array<{
      __typename?: "Deal";
      id: string;
      name: string;
      amount?: number | null;
    }>;
    customFieldValues: Array<{
      __typename?: "CustomFieldValue";
      stringValue?: string | null;
      numberValue?: number | null;
      booleanValue?: boolean | null;
      dateValue?: string | null;
      selectedOptionValues?: Array<string> | null;
      definition: {
        __typename?: "CustomFieldDefinition";
        id: string;
        fieldName: string;
        fieldLabel: string;
        fieldType: CustomFieldType;
        isRequired: boolean;
        dropdownOptions?: Array<{
          __typename?: "CustomFieldOption";
          value: string;
          label: string;
        }> | null;
      };
    }>;
  } | null;
};

export type CreatePersonMutationVariables = Exact<{
  input: PersonInput;
}>;

export type CreatePersonMutation = {
  __typename?: "Mutation";
  createPerson: {
    __typename?: "Person";
    id: string;
    first_name?: string | null;
    last_name?: string | null;
    email?: string | null;
    phone?: string | null;
    notes?: string | null;
    created_at: string;
    updated_at: string;
    primaryOrganization?: {
      __typename?: "Organization";
      id: string;
      name: string;
    } | null;
    customFieldValues: Array<{
      __typename?: "CustomFieldValue";
      stringValue?: string | null;
      numberValue?: number | null;
      booleanValue?: boolean | null;
      dateValue?: string | null;
      selectedOptionValues?: Array<string> | null;
      definition: {
        __typename?: "CustomFieldDefinition";
        id: string;
        fieldName: string;
        fieldLabel: string;
        fieldType: CustomFieldType;
        isRequired: boolean;
        dropdownOptions?: Array<{
          __typename?: "CustomFieldOption";
          value: string;
          label: string;
        }> | null;
      };
    }>;
  };
};

export type UpdatePersonMutationVariables = Exact<{
  id: Scalars["ID"]["input"];
  input: PersonInput;
}>;

export type UpdatePersonMutation = {
  __typename?: "Mutation";
  updatePerson?: {
    __typename?: "Person";
    id: string;
    first_name?: string | null;
    last_name?: string | null;
    email?: string | null;
    phone?: string | null;
    notes?: string | null;
    created_at: string;
    updated_at: string;
    primaryOrganization?: {
      __typename?: "Organization";
      id: string;
      name: string;
    } | null;
    customFieldValues: Array<{
      __typename?: "CustomFieldValue";
      stringValue?: string | null;
      numberValue?: number | null;
      booleanValue?: boolean | null;
      dateValue?: string | null;
      selectedOptionValues?: Array<string> | null;
      definition: {
        __typename?: "CustomFieldDefinition";
        id: string;
        fieldName: string;
        fieldLabel: string;
        fieldType: CustomFieldType;
        isRequired: boolean;
        dropdownOptions?: Array<{
          __typename?: "CustomFieldOption";
          value: string;
          label: string;
        }> | null;
      };
    }>;
  } | null;
};

export type DeletePersonMutationVariables = Exact<{
  id: Scalars["ID"]["input"];
}>;

export type DeletePersonMutation = {
  __typename?: "Mutation";
  deletePerson?: boolean | null;
};

export type GetWfmProjectTypeByNameForConfigQueryVariables = Exact<{
  name: Scalars["String"]["input"];
}>;

export type GetWfmProjectTypeByNameForConfigQuery = {
  __typename?: "Query";
  wfmProjectTypeByName?: {
    __typename?: "WFMProjectType";
    id: string;
    name: string;
    defaultWorkflow?: {
      __typename?: "WFMWorkflow";
      id: string;
      name: string;
    } | null;
  } | null;
};
