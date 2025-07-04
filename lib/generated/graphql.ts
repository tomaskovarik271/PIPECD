import {
  GraphQLResolveInfo,
  GraphQLScalarType,
  GraphQLScalarTypeConfig,
} from "graphql";
import { GraphQLContext } from "../../netlify/functions/graphql";
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
export type RequireFields<T, K extends keyof T> = Omit<T, K> & {
  [P in K]-?: NonNullable<T[P]>;
};
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string };
  String: { input: string; output: string };
  Boolean: { input: boolean; output: boolean };
  Int: { input: number; output: number };
  Float: { input: number; output: number };
  Date: { input: Date; output: Date };
  DateTime: { input: Date; output: Date };
  JSON: { input: { [key: string]: any }; output: { [key: string]: any } };
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
  organization_id?: Maybe<Scalars["ID"]["output"]>;
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
  organization_id?: InputMaybe<Scalars["ID"]["input"]>;
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
  organization_id?: InputMaybe<Scalars["ID"]["input"]>;
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

export type ResolverTypeWrapper<T> = Promise<T> | T;

export type ResolverWithResolve<TResult, TParent, TContext, TArgs> = {
  resolve: ResolverFn<TResult, TParent, TContext, TArgs>;
};
export type Resolver<TResult, TParent = {}, TContext = {}, TArgs = {}> =
  | ResolverFn<TResult, TParent, TContext, TArgs>
  | ResolverWithResolve<TResult, TParent, TContext, TArgs>;

export type ResolverFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo,
) => Promise<TResult> | TResult;

export type SubscriptionSubscribeFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo,
) => AsyncIterable<TResult> | Promise<AsyncIterable<TResult>>;

export type SubscriptionResolveFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo,
) => TResult | Promise<TResult>;

export interface SubscriptionSubscriberObject<
  TResult,
  TKey extends string,
  TParent,
  TContext,
  TArgs,
> {
  subscribe: SubscriptionSubscribeFn<
    { [key in TKey]: TResult },
    TParent,
    TContext,
    TArgs
  >;
  resolve?: SubscriptionResolveFn<
    TResult,
    { [key in TKey]: TResult },
    TContext,
    TArgs
  >;
}

export interface SubscriptionResolverObject<TResult, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<any, TParent, TContext, TArgs>;
  resolve: SubscriptionResolveFn<TResult, any, TContext, TArgs>;
}

export type SubscriptionObject<
  TResult,
  TKey extends string,
  TParent,
  TContext,
  TArgs,
> =
  | SubscriptionSubscriberObject<TResult, TKey, TParent, TContext, TArgs>
  | SubscriptionResolverObject<TResult, TParent, TContext, TArgs>;

export type SubscriptionResolver<
  TResult,
  TKey extends string,
  TParent = {},
  TContext = {},
  TArgs = {},
> =
  | ((
      ...args: any[]
    ) => SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>)
  | SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>;

export type TypeResolveFn<TTypes, TParent = {}, TContext = {}> = (
  parent: TParent,
  context: TContext,
  info: GraphQLResolveInfo,
) => Maybe<TTypes> | Promise<Maybe<TTypes>>;

export type IsTypeOfResolverFn<T = {}, TContext = {}> = (
  obj: T,
  context: TContext,
  info: GraphQLResolveInfo,
) => boolean | Promise<boolean>;

export type NextResolverFn<T> = () => Promise<T>;

export type DirectiveResolverFn<
  TResult = {},
  TParent = {},
  TContext = {},
  TArgs = {},
> = (
  next: NextResolverFn<TResult>,
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo,
) => TResult | Promise<TResult>;

/** Mapping between all available schema types and the resolvers types */
export type ResolversTypes = {
  AIGeneratedTaskContent: ResolverTypeWrapper<AiGeneratedTaskContent>;
  AccountPortfolioStats: ResolverTypeWrapper<AccountPortfolioStats>;
  AgentConfig: ResolverTypeWrapper<AgentConfig>;
  AgentConfigInput: AgentConfigInput;
  AgentConversation: ResolverTypeWrapper<AgentConversation>;
  AgentMessage: ResolverTypeWrapper<AgentMessage>;
  AgentPlan: ResolverTypeWrapper<AgentPlan>;
  AgentPlanStep: ResolverTypeWrapper<AgentPlanStep>;
  AgentPlanStepInput: AgentPlanStepInput;
  AgentResponse: ResolverTypeWrapper<AgentResponse>;
  AgentStepStatus: AgentStepStatus;
  AgentThought: ResolverTypeWrapper<AgentThought>;
  AgentThoughtInput: AgentThoughtInput;
  AgentThoughtType: AgentThoughtType;
  AgentV2Response: ResolverTypeWrapper<AgentV2Response>;
  AgentV2StreamChunk: ResolverTypeWrapper<AgentV2StreamChunk>;
  AgentV2StreamChunkType: AgentV2StreamChunkType;
  AgentV2ThoughtInput: AgentV2ThoughtInput;
  AppSetting: ResolverTypeWrapper<AppSetting>;
  AttachDocumentInput: AttachDocumentInput;
  AttachDocumentToNoteInput: AttachDocumentToNoteInput;
  AttachFileInput: AttachFileInput;
  AvailabilitySlot: ResolverTypeWrapper<AvailabilitySlot>;
  Boolean: ResolverTypeWrapper<Scalars["Boolean"]["output"]>;
  BulkTaskUpdatesInput: BulkTaskUpdatesInput;
  BusinessRule: ResolverTypeWrapper<BusinessRule>;
  BusinessRuleAnalytics: ResolverTypeWrapper<BusinessRuleAnalytics>;
  BusinessRuleExecutionResult: ResolverTypeWrapper<BusinessRuleExecutionResult>;
  BusinessRuleFilters: BusinessRuleFilters;
  BusinessRuleInput: BusinessRuleInput;
  BusinessRuleNotification: ResolverTypeWrapper<BusinessRuleNotification>;
  BusinessRuleNotificationsConnection: ResolverTypeWrapper<BusinessRuleNotificationsConnection>;
  BusinessRulesConnection: ResolverTypeWrapper<BusinessRulesConnection>;
  CRMContextInput: CrmContextInput;
  CRMEventInput: CrmEventInput;
  CalendarAttendee: ResolverTypeWrapper<CalendarAttendee>;
  CalendarEvent: ResolverTypeWrapper<CalendarEvent>;
  CalendarEventOutcome: CalendarEventOutcome;
  CalendarEventType: CalendarEventType;
  CalendarPreferences: ResolverTypeWrapper<CalendarPreferences>;
  CalendarPreferencesInput: CalendarPreferencesInput;
  CalendarReminderInput: CalendarReminderInput;
  CalendarReminderMethod: CalendarReminderMethod;
  CalendarResponseStatus: CalendarResponseStatus;
  CalendarSyncAction: CalendarSyncAction;
  CalendarSyncStatus: ResolverTypeWrapper<CalendarSyncStatus>;
  CalendarTimeRangeInput: CalendarTimeRangeInput;
  ComposeEmailInput: ComposeEmailInput;
  ConnectGoogleIntegrationInput: ConnectGoogleIntegrationInput;
  ContactRoleType: ContactRoleType;
  ContactScopeType: ContactScopeType;
  ContactSuggestion: ResolverTypeWrapper<ContactSuggestion>;
  ContextualTaskCreationInput: ContextualTaskCreationInput;
  ConversionHistory: ResolverTypeWrapper<ConversionHistory>;
  ConversionReason: ConversionReason;
  ConversionResult: ResolverTypeWrapper<ConversionResult>;
  ConversionType: ConversionType;
  ConversionValidationResult: ResolverTypeWrapper<ConversionValidationResult>;
  ConvertedEntities: ResolverTypeWrapper<ConvertedEntities>;
  CreateAgentV2ConversationInput: CreateAgentV2ConversationInput;
  CreateCalendarEventInput: CreateCalendarEventInput;
  CreateContactFromEmailInput: CreateContactFromEmailInput;
  CreateCurrencyInput: CreateCurrencyInput;
  CreateDealFolderInput: CreateDealFolderInput;
  CreateDocumentInput: CreateDocumentInput;
  CreateEmailInput: CreateEmailInput;
  CreateStickerInput: CreateStickerInput;
  CreateSystemNotificationInput: CreateSystemNotificationInput;
  CreateTaskAutomationRuleInput: CreateTaskAutomationRuleInput;
  CreateTaskDependencyInput: CreateTaskDependencyInput;
  CreateTaskInput: CreateTaskInput;
  CreateWFMProjectTypeInput: CreateWfmProjectTypeInput;
  CreateWFMStatusInput: CreateWfmStatusInput;
  CreateWFMWorkflowInput: CreateWfmWorkflowInput;
  CreateWFMWorkflowStepInput: CreateWfmWorkflowStepInput;
  CreateWFMWorkflowTransitionInput: CreateWfmWorkflowTransitionInput;
  Currency: ResolverTypeWrapper<Currency>;
  CurrencyAmount: ResolverTypeWrapper<CurrencyAmount>;
  CurrencyOperationResult: ResolverTypeWrapper<CurrencyOperationResult>;
  CustomFieldDefinition: ResolverTypeWrapper<CustomFieldDefinition>;
  CustomFieldDefinitionInput: CustomFieldDefinitionInput;
  CustomFieldEntityType: CustomFieldEntityType;
  CustomFieldOption: ResolverTypeWrapper<CustomFieldOption>;
  CustomFieldOptionInput: CustomFieldOptionInput;
  CustomFieldType: CustomFieldType;
  CustomFieldValue: ResolverTypeWrapper<CustomFieldValue>;
  CustomFieldValueInput: CustomFieldValueInput;
  Date: ResolverTypeWrapper<Scalars["Date"]["output"]>;
  DateTime: ResolverTypeWrapper<Scalars["DateTime"]["output"]>;
  Deal: ResolverTypeWrapper<Deal>;
  DealDocumentAttachment: ResolverTypeWrapper<DealDocumentAttachment>;
  DealFolderInfo: ResolverTypeWrapper<DealFolderInfo>;
  DealHistoryEntry: ResolverTypeWrapper<DealHistoryEntry>;
  DealInput: DealInput;
  DealParticipant: ResolverTypeWrapper<DealParticipant>;
  DealParticipantInput: DealParticipantInput;
  DealSubfolders: ResolverTypeWrapper<DealSubfolders>;
  DealTaskIndicator: ResolverTypeWrapper<DealTaskIndicator>;
  DealToLeadConversionInput: DealToLeadConversionInput;
  DealToLeadConversionResult: ResolverTypeWrapper<DealToLeadConversionResult>;
  DealUpdateInput: DealUpdateInput;
  DealsByCurrencyResult: ResolverTypeWrapper<DealsByCurrencyResult>;
  Document: ResolverTypeWrapper<Document>;
  DocumentCategory: DocumentCategory;
  DriveFile: ResolverTypeWrapper<DriveFile>;
  DriveFileConnection: ResolverTypeWrapper<DriveFileConnection>;
  DriveFileOwner: ResolverTypeWrapper<DriveFileOwner>;
  DriveFolder: ResolverTypeWrapper<DriveFolder>;
  DriveFolderBrowseInput: DriveFolderBrowseInput;
  DriveFolderConnection: ResolverTypeWrapper<DriveFolderConnection>;
  DriveFolderStructure: ResolverTypeWrapper<DriveFolderStructure>;
  DriveFolderSubfolders: ResolverTypeWrapper<DriveFolderSubfolders>;
  DrivePermissionInput: DrivePermissionInput;
  DrivePermissionRole: DrivePermissionRole;
  DrivePermissionType: DrivePermissionType;
  DriveSearchInput: DriveSearchInput;
  DualAttachmentResponse: ResolverTypeWrapper<DualAttachmentResponse>;
  Email: ResolverTypeWrapper<Email>;
  EmailActivity: ResolverTypeWrapper<EmailActivity>;
  EmailActivityType: EmailActivityType;
  EmailAnalytics: ResolverTypeWrapper<EmailAnalytics>;
  EmailAttachment: ResolverTypeWrapper<EmailAttachment>;
  EmailAttachmentInput: EmailAttachmentInput;
  EmailImportance: EmailImportance;
  EmailMessage: ResolverTypeWrapper<EmailMessage>;
  EmailPin: ResolverTypeWrapper<EmailPin>;
  EmailThread: ResolverTypeWrapper<EmailThread>;
  EmailThreadConnection: ResolverTypeWrapper<EmailThreadConnection>;
  EmailThreadsFilterInput: EmailThreadsFilterInput;
  EntityType: EntityType;
  EntityTypeEnum: EntityTypeEnum;
  ExchangeRate: ResolverTypeWrapper<ExchangeRate>;
  ExtendedThinkingAnalysis: ResolverTypeWrapper<ExtendedThinkingAnalysis>;
  Float: ResolverTypeWrapper<Scalars["Float"]["output"]>;
  GenerateTaskContentInput: GenerateTaskContentInput;
  GoogleCalendar: ResolverTypeWrapper<GoogleCalendar>;
  GoogleDriveConfig: ResolverTypeWrapper<GoogleDriveConfig>;
  GoogleIntegrationStatus: ResolverTypeWrapper<GoogleIntegrationStatus>;
  GoogleTokenData: ResolverTypeWrapper<GoogleTokenData>;
  GoogleTokenInput: GoogleTokenInput;
  ID: ResolverTypeWrapper<Scalars["ID"]["output"]>;
  Int: ResolverTypeWrapper<Scalars["Int"]["output"]>;
  JSON: ResolverTypeWrapper<Scalars["JSON"]["output"]>;
  Lead: ResolverTypeWrapper<Lead>;
  LeadConversionData: LeadConversionData;
  LeadConversionInput: LeadConversionInput;
  LeadConversionResult: ResolverTypeWrapper<LeadConversionResult>;
  LeadConversionTargetType: LeadConversionTargetType;
  LeadFilters: LeadFilters;
  LeadHistoryEntry: ResolverTypeWrapper<LeadHistoryEntry>;
  LeadInput: LeadInput;
  LeadUpdateInput: LeadUpdateInput;
  LeadsStats: ResolverTypeWrapper<LeadsStats>;
  LogicalOperator: LogicalOperator;
  Mutation: ResolverTypeWrapper<{}>;
  NoteDocumentAttachment: ResolverTypeWrapper<NoteDocumentAttachment>;
  NotificationFilters: NotificationFilters;
  NotificationPriority: NotificationPriority;
  NotificationSource: NotificationSource;
  NotificationSummary: ResolverTypeWrapper<NotificationSummary>;
  Organization: ResolverTypeWrapper<Organization>;
  OrganizationInput: OrganizationInput;
  OrganizationUpdateInput: OrganizationUpdateInput;
  Person: ResolverTypeWrapper<Person>;
  PersonHistory: ResolverTypeWrapper<PersonHistory>;
  PersonInput: PersonInput;
  PersonListItem: ResolverTypeWrapper<PersonListItem>;
  PersonOrganizationRole: ResolverTypeWrapper<PersonOrganizationRole>;
  PersonOrganizationRoleInput: PersonOrganizationRoleInput;
  PersonOrganizationRoleUpdateInput: PersonOrganizationRoleUpdateInput;
  PersonUpdateInput: PersonUpdateInput;
  PinEmailInput: PinEmailInput;
  Query: ResolverTypeWrapper<{}>;
  ReactivationPlan: ResolverTypeWrapper<ReactivationPlan>;
  ReactivationPlanInput: ReactivationPlanInput;
  ReactivationPlanStatus: ReactivationPlanStatus;
  ReactivationStrategy: ReactivationStrategy;
  Role: ResolverTypeWrapper<Role>;
  RuleAction: ResolverTypeWrapper<RuleAction>;
  RuleActionInput: RuleActionInput;
  RuleActionType: RuleActionType;
  RuleCondition: ResolverTypeWrapper<RuleCondition>;
  RuleConditionInput: RuleConditionInput;
  RuleConditionOperator: RuleConditionOperator;
  RuleExecution: ResolverTypeWrapper<RuleExecution>;
  RuleExecutionsConnection: ResolverTypeWrapper<RuleExecutionsConnection>;
  RuleStatusEnum: RuleStatusEnum;
  SendAgentV2MessageInput: SendAgentV2MessageInput;
  SendAgentV2MessageStreamInput: SendAgentV2MessageStreamInput;
  SendMessageInput: SendMessageInput;
  SetExchangeRateInput: SetExchangeRateInput;
  SharedDrive: ResolverTypeWrapper<SharedDrive>;
  SharedDriveCapabilities: ResolverTypeWrapper<SharedDriveCapabilities>;
  SharedDriveImage: ResolverTypeWrapper<SharedDriveImage>;
  SharedDriveRestrictions: ResolverTypeWrapper<SharedDriveRestrictions>;
  SmartSticker: ResolverTypeWrapper<SmartSticker>;
  SortDirection: SortDirection;
  StageType: StageType;
  StickerCategory: ResolverTypeWrapper<StickerCategory>;
  StickerConnection: ResolverTypeWrapper<StickerConnection>;
  StickerFilters: StickerFilters;
  StickerMoveInput: StickerMoveInput;
  StickerPriority: StickerPriority;
  StickerSortBy: StickerSortBy;
  StickerSortField: StickerSortField;
  String: ResolverTypeWrapper<Scalars["String"]["output"]>;
  Subscription: ResolverTypeWrapper<{}>;
  SystemNotification: ResolverTypeWrapper<SystemNotification>;
  SystemNotificationType: SystemNotificationType;
  SystemNotificationsConnection: ResolverTypeWrapper<SystemNotificationsConnection>;
  Task: ResolverTypeWrapper<Task>;
  TaskAutomationRule: ResolverTypeWrapper<TaskAutomationRule>;
  TaskCompletionInput: TaskCompletionInput;
  TaskDependency: ResolverTypeWrapper<TaskDependency>;
  TaskEntityType: TaskEntityType;
  TaskFiltersInput: TaskFiltersInput;
  TaskHistory: ResolverTypeWrapper<TaskHistory>;
  TaskPriority: TaskPriority;
  TaskPriorityCount: ResolverTypeWrapper<TaskPriorityCount>;
  TaskStats: ResolverTypeWrapper<TaskStats>;
  TaskStatus: TaskStatus;
  TaskStatusCount: ResolverTypeWrapper<TaskStatusCount>;
  TaskType: TaskType;
  TaskTypeCount: ResolverTypeWrapper<TaskTypeCount>;
  ThinkingBudget: ThinkingBudget;
  ToolDiscoveryResponse: ResolverTypeWrapper<ToolDiscoveryResponse>;
  ToolExecution: ResolverTypeWrapper<ToolExecution>;
  ToolExecutionStatus: ToolExecutionStatus;
  TriggerTypeEnum: TriggerTypeEnum;
  UnifiedNotification: ResolverTypeWrapper<UnifiedNotification>;
  UnifiedNotificationsConnection: ResolverTypeWrapper<UnifiedNotificationsConnection>;
  UpdateAppSettingInput: UpdateAppSettingInput;
  UpdateBusinessRuleInput: UpdateBusinessRuleInput;
  UpdateCalendarEventInput: UpdateCalendarEventInput;
  UpdateConversationInput: UpdateConversationInput;
  UpdateCurrencyInput: UpdateCurrencyInput;
  UpdateEmailPinInput: UpdateEmailPinInput;
  UpdateStickerInput: UpdateStickerInput;
  UpdateSystemNotificationInput: UpdateSystemNotificationInput;
  UpdateTaskAutomationRuleInput: UpdateTaskAutomationRuleInput;
  UpdateTaskInput: UpdateTaskInput;
  UpdateUserCurrencyPreferencesInput: UpdateUserCurrencyPreferencesInput;
  UpdateUserProfileInput: UpdateUserProfileInput;
  UpdateWFMProjectTypeInput: UpdateWfmProjectTypeInput;
  UpdateWFMStatusInput: UpdateWfmStatusInput;
  UpdateWFMWorkflowInput: UpdateWfmWorkflowInput;
  UpdateWFMWorkflowStepInput: UpdateWfmWorkflowStepInput;
  UpdateWfmWorkflowTransitionInput: UpdateWfmWorkflowTransitionInput;
  UploadFileInput: UploadFileInput;
  User: ResolverTypeWrapper<User>;
  UserCurrencyPreferences: ResolverTypeWrapper<UserCurrencyPreferences>;
  WFMProject: ResolverTypeWrapper<WfmProject>;
  WFMProjectType: ResolverTypeWrapper<WfmProjectType>;
  WFMStatus: ResolverTypeWrapper<WfmStatus>;
  WFMStatusMutationResponse: ResolverTypeWrapper<WfmStatusMutationResponse>;
  WFMWorkflow: ResolverTypeWrapper<WfmWorkflow>;
  WFMWorkflowStep: ResolverTypeWrapper<WfmWorkflowStep>;
  WFMWorkflowStepMutationResponse: ResolverTypeWrapper<WfmWorkflowStepMutationResponse>;
  WFMWorkflowTransition: ResolverTypeWrapper<WfmWorkflowTransition>;
  WFMWorkflowTransitionMutationResponse: ResolverTypeWrapper<WfmWorkflowTransitionMutationResponse>;
};

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = {
  AIGeneratedTaskContent: AiGeneratedTaskContent;
  AccountPortfolioStats: AccountPortfolioStats;
  AgentConfig: AgentConfig;
  AgentConfigInput: AgentConfigInput;
  AgentConversation: AgentConversation;
  AgentMessage: AgentMessage;
  AgentPlan: AgentPlan;
  AgentPlanStep: AgentPlanStep;
  AgentPlanStepInput: AgentPlanStepInput;
  AgentResponse: AgentResponse;
  AgentThought: AgentThought;
  AgentThoughtInput: AgentThoughtInput;
  AgentV2Response: AgentV2Response;
  AgentV2StreamChunk: AgentV2StreamChunk;
  AgentV2ThoughtInput: AgentV2ThoughtInput;
  AppSetting: AppSetting;
  AttachDocumentInput: AttachDocumentInput;
  AttachDocumentToNoteInput: AttachDocumentToNoteInput;
  AttachFileInput: AttachFileInput;
  AvailabilitySlot: AvailabilitySlot;
  Boolean: Scalars["Boolean"]["output"];
  BulkTaskUpdatesInput: BulkTaskUpdatesInput;
  BusinessRule: BusinessRule;
  BusinessRuleAnalytics: BusinessRuleAnalytics;
  BusinessRuleExecutionResult: BusinessRuleExecutionResult;
  BusinessRuleFilters: BusinessRuleFilters;
  BusinessRuleInput: BusinessRuleInput;
  BusinessRuleNotification: BusinessRuleNotification;
  BusinessRuleNotificationsConnection: BusinessRuleNotificationsConnection;
  BusinessRulesConnection: BusinessRulesConnection;
  CRMContextInput: CrmContextInput;
  CRMEventInput: CrmEventInput;
  CalendarAttendee: CalendarAttendee;
  CalendarEvent: CalendarEvent;
  CalendarPreferences: CalendarPreferences;
  CalendarPreferencesInput: CalendarPreferencesInput;
  CalendarReminderInput: CalendarReminderInput;
  CalendarSyncStatus: CalendarSyncStatus;
  CalendarTimeRangeInput: CalendarTimeRangeInput;
  ComposeEmailInput: ComposeEmailInput;
  ConnectGoogleIntegrationInput: ConnectGoogleIntegrationInput;
  ContactSuggestion: ContactSuggestion;
  ContextualTaskCreationInput: ContextualTaskCreationInput;
  ConversionHistory: ConversionHistory;
  ConversionResult: ConversionResult;
  ConversionValidationResult: ConversionValidationResult;
  ConvertedEntities: ConvertedEntities;
  CreateAgentV2ConversationInput: CreateAgentV2ConversationInput;
  CreateCalendarEventInput: CreateCalendarEventInput;
  CreateContactFromEmailInput: CreateContactFromEmailInput;
  CreateCurrencyInput: CreateCurrencyInput;
  CreateDealFolderInput: CreateDealFolderInput;
  CreateDocumentInput: CreateDocumentInput;
  CreateEmailInput: CreateEmailInput;
  CreateStickerInput: CreateStickerInput;
  CreateSystemNotificationInput: CreateSystemNotificationInput;
  CreateTaskAutomationRuleInput: CreateTaskAutomationRuleInput;
  CreateTaskDependencyInput: CreateTaskDependencyInput;
  CreateTaskInput: CreateTaskInput;
  CreateWFMProjectTypeInput: CreateWfmProjectTypeInput;
  CreateWFMStatusInput: CreateWfmStatusInput;
  CreateWFMWorkflowInput: CreateWfmWorkflowInput;
  CreateWFMWorkflowStepInput: CreateWfmWorkflowStepInput;
  CreateWFMWorkflowTransitionInput: CreateWfmWorkflowTransitionInput;
  Currency: Currency;
  CurrencyAmount: CurrencyAmount;
  CurrencyOperationResult: CurrencyOperationResult;
  CustomFieldDefinition: CustomFieldDefinition;
  CustomFieldDefinitionInput: CustomFieldDefinitionInput;
  CustomFieldOption: CustomFieldOption;
  CustomFieldOptionInput: CustomFieldOptionInput;
  CustomFieldValue: CustomFieldValue;
  CustomFieldValueInput: CustomFieldValueInput;
  Date: Scalars["Date"]["output"];
  DateTime: Scalars["DateTime"]["output"];
  Deal: Deal;
  DealDocumentAttachment: DealDocumentAttachment;
  DealFolderInfo: DealFolderInfo;
  DealHistoryEntry: DealHistoryEntry;
  DealInput: DealInput;
  DealParticipant: DealParticipant;
  DealParticipantInput: DealParticipantInput;
  DealSubfolders: DealSubfolders;
  DealTaskIndicator: DealTaskIndicator;
  DealToLeadConversionInput: DealToLeadConversionInput;
  DealToLeadConversionResult: DealToLeadConversionResult;
  DealUpdateInput: DealUpdateInput;
  DealsByCurrencyResult: DealsByCurrencyResult;
  Document: Document;
  DriveFile: DriveFile;
  DriveFileConnection: DriveFileConnection;
  DriveFileOwner: DriveFileOwner;
  DriveFolder: DriveFolder;
  DriveFolderBrowseInput: DriveFolderBrowseInput;
  DriveFolderConnection: DriveFolderConnection;
  DriveFolderStructure: DriveFolderStructure;
  DriveFolderSubfolders: DriveFolderSubfolders;
  DrivePermissionInput: DrivePermissionInput;
  DriveSearchInput: DriveSearchInput;
  DualAttachmentResponse: DualAttachmentResponse;
  Email: Email;
  EmailActivity: EmailActivity;
  EmailAnalytics: EmailAnalytics;
  EmailAttachment: EmailAttachment;
  EmailAttachmentInput: EmailAttachmentInput;
  EmailMessage: EmailMessage;
  EmailPin: EmailPin;
  EmailThread: EmailThread;
  EmailThreadConnection: EmailThreadConnection;
  EmailThreadsFilterInput: EmailThreadsFilterInput;
  ExchangeRate: ExchangeRate;
  ExtendedThinkingAnalysis: ExtendedThinkingAnalysis;
  Float: Scalars["Float"]["output"];
  GenerateTaskContentInput: GenerateTaskContentInput;
  GoogleCalendar: GoogleCalendar;
  GoogleDriveConfig: GoogleDriveConfig;
  GoogleIntegrationStatus: GoogleIntegrationStatus;
  GoogleTokenData: GoogleTokenData;
  GoogleTokenInput: GoogleTokenInput;
  ID: Scalars["ID"]["output"];
  Int: Scalars["Int"]["output"];
  JSON: Scalars["JSON"]["output"];
  Lead: Lead;
  LeadConversionData: LeadConversionData;
  LeadConversionInput: LeadConversionInput;
  LeadConversionResult: LeadConversionResult;
  LeadFilters: LeadFilters;
  LeadHistoryEntry: LeadHistoryEntry;
  LeadInput: LeadInput;
  LeadUpdateInput: LeadUpdateInput;
  LeadsStats: LeadsStats;
  Mutation: {};
  NoteDocumentAttachment: NoteDocumentAttachment;
  NotificationFilters: NotificationFilters;
  NotificationSummary: NotificationSummary;
  Organization: Organization;
  OrganizationInput: OrganizationInput;
  OrganizationUpdateInput: OrganizationUpdateInput;
  Person: Person;
  PersonHistory: PersonHistory;
  PersonInput: PersonInput;
  PersonListItem: PersonListItem;
  PersonOrganizationRole: PersonOrganizationRole;
  PersonOrganizationRoleInput: PersonOrganizationRoleInput;
  PersonOrganizationRoleUpdateInput: PersonOrganizationRoleUpdateInput;
  PersonUpdateInput: PersonUpdateInput;
  PinEmailInput: PinEmailInput;
  Query: {};
  ReactivationPlan: ReactivationPlan;
  ReactivationPlanInput: ReactivationPlanInput;
  Role: Role;
  RuleAction: RuleAction;
  RuleActionInput: RuleActionInput;
  RuleCondition: RuleCondition;
  RuleConditionInput: RuleConditionInput;
  RuleExecution: RuleExecution;
  RuleExecutionsConnection: RuleExecutionsConnection;
  SendAgentV2MessageInput: SendAgentV2MessageInput;
  SendAgentV2MessageStreamInput: SendAgentV2MessageStreamInput;
  SendMessageInput: SendMessageInput;
  SetExchangeRateInput: SetExchangeRateInput;
  SharedDrive: SharedDrive;
  SharedDriveCapabilities: SharedDriveCapabilities;
  SharedDriveImage: SharedDriveImage;
  SharedDriveRestrictions: SharedDriveRestrictions;
  SmartSticker: SmartSticker;
  StickerCategory: StickerCategory;
  StickerConnection: StickerConnection;
  StickerFilters: StickerFilters;
  StickerMoveInput: StickerMoveInput;
  StickerSortBy: StickerSortBy;
  String: Scalars["String"]["output"];
  Subscription: {};
  SystemNotification: SystemNotification;
  SystemNotificationsConnection: SystemNotificationsConnection;
  Task: Task;
  TaskAutomationRule: TaskAutomationRule;
  TaskCompletionInput: TaskCompletionInput;
  TaskDependency: TaskDependency;
  TaskFiltersInput: TaskFiltersInput;
  TaskHistory: TaskHistory;
  TaskPriorityCount: TaskPriorityCount;
  TaskStats: TaskStats;
  TaskStatusCount: TaskStatusCount;
  TaskTypeCount: TaskTypeCount;
  ToolDiscoveryResponse: ToolDiscoveryResponse;
  ToolExecution: ToolExecution;
  UnifiedNotification: UnifiedNotification;
  UnifiedNotificationsConnection: UnifiedNotificationsConnection;
  UpdateAppSettingInput: UpdateAppSettingInput;
  UpdateBusinessRuleInput: UpdateBusinessRuleInput;
  UpdateCalendarEventInput: UpdateCalendarEventInput;
  UpdateConversationInput: UpdateConversationInput;
  UpdateCurrencyInput: UpdateCurrencyInput;
  UpdateEmailPinInput: UpdateEmailPinInput;
  UpdateStickerInput: UpdateStickerInput;
  UpdateSystemNotificationInput: UpdateSystemNotificationInput;
  UpdateTaskAutomationRuleInput: UpdateTaskAutomationRuleInput;
  UpdateTaskInput: UpdateTaskInput;
  UpdateUserCurrencyPreferencesInput: UpdateUserCurrencyPreferencesInput;
  UpdateUserProfileInput: UpdateUserProfileInput;
  UpdateWFMProjectTypeInput: UpdateWfmProjectTypeInput;
  UpdateWFMStatusInput: UpdateWfmStatusInput;
  UpdateWFMWorkflowInput: UpdateWfmWorkflowInput;
  UpdateWFMWorkflowStepInput: UpdateWfmWorkflowStepInput;
  UpdateWfmWorkflowTransitionInput: UpdateWfmWorkflowTransitionInput;
  UploadFileInput: UploadFileInput;
  User: User;
  UserCurrencyPreferences: UserCurrencyPreferences;
  WFMProject: WfmProject;
  WFMProjectType: WfmProjectType;
  WFMStatus: WfmStatus;
  WFMStatusMutationResponse: WfmStatusMutationResponse;
  WFMWorkflow: WfmWorkflow;
  WFMWorkflowStep: WfmWorkflowStep;
  WFMWorkflowStepMutationResponse: WfmWorkflowStepMutationResponse;
  WFMWorkflowTransition: WfmWorkflowTransition;
  WFMWorkflowTransitionMutationResponse: WfmWorkflowTransitionMutationResponse;
};

export type AiGeneratedTaskContentResolvers<
  ContextType = GraphQLContext,
  ParentType extends
    ResolversParentTypes["AIGeneratedTaskContent"] = ResolversParentTypes["AIGeneratedTaskContent"],
> = {
  confidence?: Resolver<ResolversTypes["Float"], ParentType, ContextType>;
  description?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  emailScope?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  sourceContent?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  subject?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  suggestedDueDate?: Resolver<
    Maybe<ResolversTypes["String"]>,
    ParentType,
    ContextType
  >;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type AccountPortfolioStatsResolvers<
  ContextType = GraphQLContext,
  ParentType extends
    ResolversParentTypes["AccountPortfolioStats"] = ResolversParentTypes["AccountPortfolioStats"],
> = {
  accountsNeedingAttention?: Resolver<
    ResolversTypes["Int"],
    ParentType,
    ContextType
  >;
  activeDealCount?: Resolver<ResolversTypes["Int"], ParentType, ContextType>;
  totalAccounts?: Resolver<ResolversTypes["Int"], ParentType, ContextType>;
  totalDealValue?: Resolver<ResolversTypes["Float"], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type AgentConfigResolvers<
  ContextType = GraphQLContext,
  ParentType extends
    ResolversParentTypes["AgentConfig"] = ResolversParentTypes["AgentConfig"],
> = {
  autoExecute?: Resolver<ResolversTypes["Boolean"], ParentType, ContextType>;
  enableExtendedThinking?: Resolver<
    ResolversTypes["Boolean"],
    ParentType,
    ContextType
  >;
  maxClarifyingQuestions?: Resolver<
    ResolversTypes["Int"],
    ParentType,
    ContextType
  >;
  maxThinkingSteps?: Resolver<ResolversTypes["Int"], ParentType, ContextType>;
  thinkingBudget?: Resolver<
    ResolversTypes["ThinkingBudget"],
    ParentType,
    ContextType
  >;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type AgentConversationResolvers<
  ContextType = GraphQLContext,
  ParentType extends
    ResolversParentTypes["AgentConversation"] = ResolversParentTypes["AgentConversation"],
> = {
  agentVersion?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  context?: Resolver<ResolversTypes["JSON"], ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes["DateTime"], ParentType, ContextType>;
  id?: Resolver<ResolversTypes["ID"], ParentType, ContextType>;
  messages?: Resolver<
    Array<ResolversTypes["AgentMessage"]>,
    ParentType,
    ContextType
  >;
  plan?: Resolver<Maybe<ResolversTypes["AgentPlan"]>, ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes["DateTime"], ParentType, ContextType>;
  userId?: Resolver<ResolversTypes["ID"], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type AgentMessageResolvers<
  ContextType = GraphQLContext,
  ParentType extends
    ResolversParentTypes["AgentMessage"] = ResolversParentTypes["AgentMessage"],
> = {
  content?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  role?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  thoughts?: Resolver<
    Maybe<Array<ResolversTypes["AgentThought"]>>,
    ParentType,
    ContextType
  >;
  timestamp?: Resolver<ResolversTypes["DateTime"], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type AgentPlanResolvers<
  ContextType = GraphQLContext,
  ParentType extends
    ResolversParentTypes["AgentPlan"] = ResolversParentTypes["AgentPlan"],
> = {
  context?: Resolver<ResolversTypes["JSON"], ParentType, ContextType>;
  goal?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  steps?: Resolver<
    Array<ResolversTypes["AgentPlanStep"]>,
    ParentType,
    ContextType
  >;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type AgentPlanStepResolvers<
  ContextType = GraphQLContext,
  ParentType extends
    ResolversParentTypes["AgentPlanStep"] = ResolversParentTypes["AgentPlanStep"],
> = {
  dependencies?: Resolver<
    Maybe<Array<ResolversTypes["String"]>>,
    ParentType,
    ContextType
  >;
  description?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  id?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  parameters?: Resolver<Maybe<ResolversTypes["JSON"]>, ParentType, ContextType>;
  result?: Resolver<Maybe<ResolversTypes["JSON"]>, ParentType, ContextType>;
  status?: Resolver<ResolversTypes["AgentStepStatus"], ParentType, ContextType>;
  toolName?: Resolver<Maybe<ResolversTypes["String"]>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type AgentResponseResolvers<
  ContextType = GraphQLContext,
  ParentType extends
    ResolversParentTypes["AgentResponse"] = ResolversParentTypes["AgentResponse"],
> = {
  conversation?: Resolver<
    ResolversTypes["AgentConversation"],
    ParentType,
    ContextType
  >;
  message?: Resolver<ResolversTypes["AgentMessage"], ParentType, ContextType>;
  plan?: Resolver<Maybe<ResolversTypes["AgentPlan"]>, ParentType, ContextType>;
  thoughts?: Resolver<
    Array<ResolversTypes["AgentThought"]>,
    ParentType,
    ContextType
  >;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type AgentThoughtResolvers<
  ContextType = GraphQLContext,
  ParentType extends
    ResolversParentTypes["AgentThought"] = ResolversParentTypes["AgentThought"],
> = {
  concerns?: Resolver<Maybe<ResolversTypes["String"]>, ParentType, ContextType>;
  content?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  conversationId?: Resolver<ResolversTypes["ID"], ParentType, ContextType>;
  id?: Resolver<ResolversTypes["ID"], ParentType, ContextType>;
  metadata?: Resolver<ResolversTypes["JSON"], ParentType, ContextType>;
  nextSteps?: Resolver<
    Maybe<ResolversTypes["String"]>,
    ParentType,
    ContextType
  >;
  reasoning?: Resolver<
    Maybe<ResolversTypes["String"]>,
    ParentType,
    ContextType
  >;
  reflectionData?: Resolver<ResolversTypes["JSON"], ParentType, ContextType>;
  strategy?: Resolver<Maybe<ResolversTypes["String"]>, ParentType, ContextType>;
  thinkingBudget?: Resolver<
    Maybe<ResolversTypes["ThinkingBudget"]>,
    ParentType,
    ContextType
  >;
  timestamp?: Resolver<ResolversTypes["DateTime"], ParentType, ContextType>;
  type?: Resolver<ResolversTypes["AgentThoughtType"], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type AgentV2ResponseResolvers<
  ContextType = GraphQLContext,
  ParentType extends
    ResolversParentTypes["AgentV2Response"] = ResolversParentTypes["AgentV2Response"],
> = {
  confidenceScore?: Resolver<
    Maybe<ResolversTypes["Float"]>,
    ParentType,
    ContextType
  >;
  conversation?: Resolver<
    ResolversTypes["AgentConversation"],
    ParentType,
    ContextType
  >;
  extendedThoughts?: Resolver<
    Array<ResolversTypes["AgentThought"]>,
    ParentType,
    ContextType
  >;
  message?: Resolver<ResolversTypes["AgentMessage"], ParentType, ContextType>;
  planModifications?: Resolver<
    Array<ResolversTypes["String"]>,
    ParentType,
    ContextType
  >;
  reflections?: Resolver<
    Array<ResolversTypes["AgentThought"]>,
    ParentType,
    ContextType
  >;
  thinkingTime?: Resolver<
    Maybe<ResolversTypes["Float"]>,
    ParentType,
    ContextType
  >;
  toolExecutions?: Resolver<
    Array<ResolversTypes["ToolExecution"]>,
    ParentType,
    ContextType
  >;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type AgentV2StreamChunkResolvers<
  ContextType = GraphQLContext,
  ParentType extends
    ResolversParentTypes["AgentV2StreamChunk"] = ResolversParentTypes["AgentV2StreamChunk"],
> = {
  complete?: Resolver<
    Maybe<ResolversTypes["AgentV2Response"]>,
    ParentType,
    ContextType
  >;
  content?: Resolver<Maybe<ResolversTypes["String"]>, ParentType, ContextType>;
  conversationId?: Resolver<ResolversTypes["ID"], ParentType, ContextType>;
  error?: Resolver<Maybe<ResolversTypes["String"]>, ParentType, ContextType>;
  thinking?: Resolver<
    Maybe<ResolversTypes["AgentThought"]>,
    ParentType,
    ContextType
  >;
  type?: Resolver<
    ResolversTypes["AgentV2StreamChunkType"],
    ParentType,
    ContextType
  >;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type AppSettingResolvers<
  ContextType = GraphQLContext,
  ParentType extends
    ResolversParentTypes["AppSetting"] = ResolversParentTypes["AppSetting"],
> = {
  createdAt?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  description?: Resolver<
    Maybe<ResolversTypes["String"]>,
    ParentType,
    ContextType
  >;
  id?: Resolver<ResolversTypes["ID"], ParentType, ContextType>;
  isPublic?: Resolver<ResolversTypes["Boolean"], ParentType, ContextType>;
  settingKey?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  settingType?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  settingValue?: Resolver<
    Maybe<ResolversTypes["JSON"]>,
    ParentType,
    ContextType
  >;
  updatedAt?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type AvailabilitySlotResolvers<
  ContextType = GraphQLContext,
  ParentType extends
    ResolversParentTypes["AvailabilitySlot"] = ResolversParentTypes["AvailabilitySlot"],
> = {
  available?: Resolver<ResolversTypes["Boolean"], ParentType, ContextType>;
  end?: Resolver<ResolversTypes["DateTime"], ParentType, ContextType>;
  start?: Resolver<ResolversTypes["DateTime"], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type BusinessRuleResolvers<
  ContextType = GraphQLContext,
  ParentType extends
    ResolversParentTypes["BusinessRule"] = ResolversParentTypes["BusinessRule"],
> = {
  actions?: Resolver<
    Array<ResolversTypes["RuleAction"]>,
    ParentType,
    ContextType
  >;
  conditions?: Resolver<
    Array<ResolversTypes["RuleCondition"]>,
    ParentType,
    ContextType
  >;
  createdAt?: Resolver<ResolversTypes["DateTime"], ParentType, ContextType>;
  createdBy?: Resolver<Maybe<ResolversTypes["User"]>, ParentType, ContextType>;
  description?: Resolver<
    Maybe<ResolversTypes["String"]>,
    ParentType,
    ContextType
  >;
  entityType?: Resolver<
    ResolversTypes["EntityTypeEnum"],
    ParentType,
    ContextType
  >;
  executionCount?: Resolver<ResolversTypes["Int"], ParentType, ContextType>;
  id?: Resolver<ResolversTypes["ID"], ParentType, ContextType>;
  lastError?: Resolver<
    Maybe<ResolversTypes["String"]>,
    ParentType,
    ContextType
  >;
  lastExecution?: Resolver<
    Maybe<ResolversTypes["DateTime"]>,
    ParentType,
    ContextType
  >;
  name?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  status?: Resolver<ResolversTypes["RuleStatusEnum"], ParentType, ContextType>;
  triggerEvents?: Resolver<
    Array<ResolversTypes["String"]>,
    ParentType,
    ContextType
  >;
  triggerFields?: Resolver<
    Array<ResolversTypes["String"]>,
    ParentType,
    ContextType
  >;
  triggerType?: Resolver<
    ResolversTypes["TriggerTypeEnum"],
    ParentType,
    ContextType
  >;
  updatedAt?: Resolver<ResolversTypes["DateTime"], ParentType, ContextType>;
  wfmStatus?: Resolver<
    Maybe<ResolversTypes["WFMStatus"]>,
    ParentType,
    ContextType
  >;
  wfmStep?: Resolver<
    Maybe<ResolversTypes["WFMWorkflowStep"]>,
    ParentType,
    ContextType
  >;
  wfmWorkflow?: Resolver<
    Maybe<ResolversTypes["WFMWorkflow"]>,
    ParentType,
    ContextType
  >;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type BusinessRuleAnalyticsResolvers<
  ContextType = GraphQLContext,
  ParentType extends
    ResolversParentTypes["BusinessRuleAnalytics"] = ResolversParentTypes["BusinessRuleAnalytics"],
> = {
  activeRules?: Resolver<ResolversTypes["Int"], ParentType, ContextType>;
  averageExecutionTime?: Resolver<
    ResolversTypes["Float"],
    ParentType,
    ContextType
  >;
  errorRate?: Resolver<ResolversTypes["Float"], ParentType, ContextType>;
  recentErrors?: Resolver<
    Array<ResolversTypes["String"]>,
    ParentType,
    ContextType
  >;
  topPerformingRules?: Resolver<
    Array<ResolversTypes["BusinessRule"]>,
    ParentType,
    ContextType
  >;
  totalExecutions?: Resolver<ResolversTypes["Int"], ParentType, ContextType>;
  totalNotifications?: Resolver<ResolversTypes["Int"], ParentType, ContextType>;
  totalRules?: Resolver<ResolversTypes["Int"], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type BusinessRuleExecutionResultResolvers<
  ContextType = GraphQLContext,
  ParentType extends
    ResolversParentTypes["BusinessRuleExecutionResult"] = ResolversParentTypes["BusinessRuleExecutionResult"],
> = {
  activitiesCreated?: Resolver<ResolversTypes["Int"], ParentType, ContextType>;
  errors?: Resolver<Array<ResolversTypes["String"]>, ParentType, ContextType>;
  notificationsCreated?: Resolver<
    ResolversTypes["Int"],
    ParentType,
    ContextType
  >;
  rulesProcessed?: Resolver<ResolversTypes["Int"], ParentType, ContextType>;
  tasksCreated?: Resolver<ResolversTypes["Int"], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type BusinessRuleNotificationResolvers<
  ContextType = GraphQLContext,
  ParentType extends
    ResolversParentTypes["BusinessRuleNotification"] = ResolversParentTypes["BusinessRuleNotification"],
> = {
  actedUponAt?: Resolver<
    Maybe<ResolversTypes["DateTime"]>,
    ParentType,
    ContextType
  >;
  actions?: Resolver<Maybe<ResolversTypes["JSON"]>, ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes["DateTime"], ParentType, ContextType>;
  dismissedAt?: Resolver<
    Maybe<ResolversTypes["DateTime"]>,
    ParentType,
    ContextType
  >;
  entityId?: Resolver<ResolversTypes["ID"], ParentType, ContextType>;
  entityType?: Resolver<
    ResolversTypes["EntityTypeEnum"],
    ParentType,
    ContextType
  >;
  id?: Resolver<ResolversTypes["ID"], ParentType, ContextType>;
  message?: Resolver<Maybe<ResolversTypes["String"]>, ParentType, ContextType>;
  notificationType?: Resolver<
    ResolversTypes["String"],
    ParentType,
    ContextType
  >;
  priority?: Resolver<ResolversTypes["Int"], ParentType, ContextType>;
  readAt?: Resolver<Maybe<ResolversTypes["DateTime"]>, ParentType, ContextType>;
  rule?: Resolver<ResolversTypes["BusinessRule"], ParentType, ContextType>;
  title?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  user?: Resolver<ResolversTypes["User"], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type BusinessRuleNotificationsConnectionResolvers<
  ContextType = GraphQLContext,
  ParentType extends
    ResolversParentTypes["BusinessRuleNotificationsConnection"] = ResolversParentTypes["BusinessRuleNotificationsConnection"],
> = {
  hasNextPage?: Resolver<ResolversTypes["Boolean"], ParentType, ContextType>;
  hasPreviousPage?: Resolver<
    ResolversTypes["Boolean"],
    ParentType,
    ContextType
  >;
  nodes?: Resolver<
    Array<ResolversTypes["BusinessRuleNotification"]>,
    ParentType,
    ContextType
  >;
  totalCount?: Resolver<ResolversTypes["Int"], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type BusinessRulesConnectionResolvers<
  ContextType = GraphQLContext,
  ParentType extends
    ResolversParentTypes["BusinessRulesConnection"] = ResolversParentTypes["BusinessRulesConnection"],
> = {
  hasNextPage?: Resolver<ResolversTypes["Boolean"], ParentType, ContextType>;
  hasPreviousPage?: Resolver<
    ResolversTypes["Boolean"],
    ParentType,
    ContextType
  >;
  nodes?: Resolver<
    Array<ResolversTypes["BusinessRule"]>,
    ParentType,
    ContextType
  >;
  totalCount?: Resolver<ResolversTypes["Int"], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type CalendarAttendeeResolvers<
  ContextType = GraphQLContext,
  ParentType extends
    ResolversParentTypes["CalendarAttendee"] = ResolversParentTypes["CalendarAttendee"],
> = {
  displayName?: Resolver<
    Maybe<ResolversTypes["String"]>,
    ParentType,
    ContextType
  >;
  email?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  responseStatus?: Resolver<
    ResolversTypes["CalendarResponseStatus"],
    ParentType,
    ContextType
  >;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type CalendarEventResolvers<
  ContextType = GraphQLContext,
  ParentType extends
    ResolversParentTypes["CalendarEvent"] = ResolversParentTypes["CalendarEvent"],
> = {
  attendees?: Resolver<
    Maybe<Array<ResolversTypes["CalendarAttendee"]>>,
    ParentType,
    ContextType
  >;
  createdAt?: Resolver<ResolversTypes["DateTime"], ParentType, ContextType>;
  deal?: Resolver<Maybe<ResolversTypes["Deal"]>, ParentType, ContextType>;
  description?: Resolver<
    Maybe<ResolversTypes["String"]>,
    ParentType,
    ContextType
  >;
  endTime?: Resolver<ResolversTypes["DateTime"], ParentType, ContextType>;
  eventType?: Resolver<
    ResolversTypes["CalendarEventType"],
    ParentType,
    ContextType
  >;
  googleCalendarId?: Resolver<
    ResolversTypes["String"],
    ParentType,
    ContextType
  >;
  googleEventId?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  googleMeetLink?: Resolver<
    Maybe<ResolversTypes["String"]>,
    ParentType,
    ContextType
  >;
  id?: Resolver<ResolversTypes["ID"], ParentType, ContextType>;
  isAllDay?: Resolver<ResolversTypes["Boolean"], ParentType, ContextType>;
  isCancelled?: Resolver<ResolversTypes["Boolean"], ParentType, ContextType>;
  lastSyncedAt?: Resolver<
    Maybe<ResolversTypes["DateTime"]>,
    ParentType,
    ContextType
  >;
  location?: Resolver<Maybe<ResolversTypes["String"]>, ParentType, ContextType>;
  nextActions?: Resolver<
    Maybe<Array<ResolversTypes["String"]>>,
    ParentType,
    ContextType
  >;
  organization?: Resolver<
    Maybe<ResolversTypes["Organization"]>,
    ParentType,
    ContextType
  >;
  outcome?: Resolver<
    Maybe<ResolversTypes["CalendarEventOutcome"]>,
    ParentType,
    ContextType
  >;
  outcomeNotes?: Resolver<
    Maybe<ResolversTypes["String"]>,
    ParentType,
    ContextType
  >;
  person?: Resolver<Maybe<ResolversTypes["Person"]>, ParentType, ContextType>;
  startTime?: Resolver<ResolversTypes["DateTime"], ParentType, ContextType>;
  timezone?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  title?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes["DateTime"], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type CalendarPreferencesResolvers<
  ContextType = GraphQLContext,
  ParentType extends
    ResolversParentTypes["CalendarPreferences"] = ResolversParentTypes["CalendarPreferences"],
> = {
  autoAddDealParticipants?: Resolver<
    ResolversTypes["Boolean"],
    ParentType,
    ContextType
  >;
  autoAddGoogleMeet?: Resolver<
    ResolversTypes["Boolean"],
    ParentType,
    ContextType
  >;
  autoSyncEnabled?: Resolver<
    ResolversTypes["Boolean"],
    ParentType,
    ContextType
  >;
  businessCalendarId?: Resolver<
    Maybe<ResolversTypes["String"]>,
    ParentType,
    ContextType
  >;
  createdAt?: Resolver<ResolversTypes["DateTime"], ParentType, ContextType>;
  defaultBufferTime?: Resolver<ResolversTypes["Int"], ParentType, ContextType>;
  defaultLocation?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  defaultMeetingDuration?: Resolver<
    ResolversTypes["Int"],
    ParentType,
    ContextType
  >;
  id?: Resolver<ResolversTypes["ID"], ParentType, ContextType>;
  includeDealContext?: Resolver<
    ResolversTypes["Boolean"],
    ParentType,
    ContextType
  >;
  primaryCalendarId?: Resolver<
    Maybe<ResolversTypes["String"]>,
    ParentType,
    ContextType
  >;
  reminderPreferences?: Resolver<
    ResolversTypes["JSON"],
    ParentType,
    ContextType
  >;
  syncFutureDays?: Resolver<ResolversTypes["Int"], ParentType, ContextType>;
  syncPastDays?: Resolver<ResolversTypes["Int"], ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes["DateTime"], ParentType, ContextType>;
  workingHours?: Resolver<ResolversTypes["JSON"], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type CalendarSyncStatusResolvers<
  ContextType = GraphQLContext,
  ParentType extends
    ResolversParentTypes["CalendarSyncStatus"] = ResolversParentTypes["CalendarSyncStatus"],
> = {
  errorMessage?: Resolver<
    Maybe<ResolversTypes["String"]>,
    ParentType,
    ContextType
  >;
  eventsCount?: Resolver<ResolversTypes["Int"], ParentType, ContextType>;
  hasSyncErrors?: Resolver<ResolversTypes["Boolean"], ParentType, ContextType>;
  isConnected?: Resolver<ResolversTypes["Boolean"], ParentType, ContextType>;
  lastSyncAt?: Resolver<
    Maybe<ResolversTypes["DateTime"]>,
    ParentType,
    ContextType
  >;
  nextSyncAt?: Resolver<
    Maybe<ResolversTypes["DateTime"]>,
    ParentType,
    ContextType
  >;
  syncDuration?: Resolver<
    Maybe<ResolversTypes["Int"]>,
    ParentType,
    ContextType
  >;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ContactSuggestionResolvers<
  ContextType = GraphQLContext,
  ParentType extends
    ResolversParentTypes["ContactSuggestion"] = ResolversParentTypes["ContactSuggestion"],
> = {
  email?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  name?: Resolver<Maybe<ResolversTypes["String"]>, ParentType, ContextType>;
  photoUrl?: Resolver<Maybe<ResolversTypes["String"]>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ConversionHistoryResolvers<
  ContextType = GraphQLContext,
  ParentType extends
    ResolversParentTypes["ConversionHistory"] = ResolversParentTypes["ConversionHistory"],
> = {
  conversionData?: Resolver<
    Maybe<ResolversTypes["JSON"]>,
    ParentType,
    ContextType
  >;
  conversionReason?: Resolver<
    Maybe<ResolversTypes["ConversionReason"]>,
    ParentType,
    ContextType
  >;
  conversionType?: Resolver<
    ResolversTypes["ConversionType"],
    ParentType,
    ContextType
  >;
  convertedAt?: Resolver<ResolversTypes["DateTime"], ParentType, ContextType>;
  convertedByUser?: Resolver<
    Maybe<ResolversTypes["User"]>,
    ParentType,
    ContextType
  >;
  createdAt?: Resolver<ResolversTypes["DateTime"], ParentType, ContextType>;
  id?: Resolver<ResolversTypes["ID"], ParentType, ContextType>;
  sourceEntityId?: Resolver<ResolversTypes["ID"], ParentType, ContextType>;
  sourceEntityType?: Resolver<
    ResolversTypes["String"],
    ParentType,
    ContextType
  >;
  targetEntityId?: Resolver<ResolversTypes["ID"], ParentType, ContextType>;
  targetEntityType?: Resolver<
    ResolversTypes["String"],
    ParentType,
    ContextType
  >;
  wfmTransitionPlan?: Resolver<
    Maybe<ResolversTypes["JSON"]>,
    ParentType,
    ContextType
  >;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ConversionResultResolvers<
  ContextType = GraphQLContext,
  ParentType extends
    ResolversParentTypes["ConversionResult"] = ResolversParentTypes["ConversionResult"],
> = {
  convertedAmount?: Resolver<ResolversTypes["Float"], ParentType, ContextType>;
  convertedCurrency?: Resolver<
    ResolversTypes["String"],
    ParentType,
    ContextType
  >;
  effectiveDate?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  exchangeRate?: Resolver<ResolversTypes["Float"], ParentType, ContextType>;
  formattedConverted?: Resolver<
    ResolversTypes["String"],
    ParentType,
    ContextType
  >;
  formattedOriginal?: Resolver<
    ResolversTypes["String"],
    ParentType,
    ContextType
  >;
  originalAmount?: Resolver<ResolversTypes["Float"], ParentType, ContextType>;
  originalCurrency?: Resolver<
    ResolversTypes["String"],
    ParentType,
    ContextType
  >;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ConversionValidationResultResolvers<
  ContextType = GraphQLContext,
  ParentType extends
    ResolversParentTypes["ConversionValidationResult"] = ResolversParentTypes["ConversionValidationResult"],
> = {
  canProceed?: Resolver<ResolversTypes["Boolean"], ParentType, ContextType>;
  errors?: Resolver<
    Maybe<Array<ResolversTypes["String"]>>,
    ParentType,
    ContextType
  >;
  isValid?: Resolver<ResolversTypes["Boolean"], ParentType, ContextType>;
  sourceEntity?: Resolver<
    Maybe<ResolversTypes["JSON"]>,
    ParentType,
    ContextType
  >;
  warnings?: Resolver<
    Maybe<Array<ResolversTypes["String"]>>,
    ParentType,
    ContextType
  >;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ConvertedEntitiesResolvers<
  ContextType = GraphQLContext,
  ParentType extends
    ResolversParentTypes["ConvertedEntities"] = ResolversParentTypes["ConvertedEntities"],
> = {
  deal?: Resolver<Maybe<ResolversTypes["Deal"]>, ParentType, ContextType>;
  organization?: Resolver<
    Maybe<ResolversTypes["Organization"]>,
    ParentType,
    ContextType
  >;
  person?: Resolver<Maybe<ResolversTypes["Person"]>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type CurrencyResolvers<
  ContextType = GraphQLContext,
  ParentType extends
    ResolversParentTypes["Currency"] = ResolversParentTypes["Currency"],
> = {
  code?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  decimalPlaces?: Resolver<ResolversTypes["Int"], ParentType, ContextType>;
  isActive?: Resolver<ResolversTypes["Boolean"], ParentType, ContextType>;
  name?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  symbol?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type CurrencyAmountResolvers<
  ContextType = GraphQLContext,
  ParentType extends
    ResolversParentTypes["CurrencyAmount"] = ResolversParentTypes["CurrencyAmount"],
> = {
  amount?: Resolver<ResolversTypes["Float"], ParentType, ContextType>;
  currency?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  formattedAmount?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type CurrencyOperationResultResolvers<
  ContextType = GraphQLContext,
  ParentType extends
    ResolversParentTypes["CurrencyOperationResult"] = ResolversParentTypes["CurrencyOperationResult"],
> = {
  message?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  success?: Resolver<ResolversTypes["Boolean"], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type CustomFieldDefinitionResolvers<
  ContextType = GraphQLContext,
  ParentType extends
    ResolversParentTypes["CustomFieldDefinition"] = ResolversParentTypes["CustomFieldDefinition"],
> = {
  createdAt?: Resolver<ResolversTypes["DateTime"], ParentType, ContextType>;
  displayOrder?: Resolver<ResolversTypes["Int"], ParentType, ContextType>;
  dropdownOptions?: Resolver<
    Maybe<Array<ResolversTypes["CustomFieldOption"]>>,
    ParentType,
    ContextType
  >;
  entityType?: Resolver<
    ResolversTypes["CustomFieldEntityType"],
    ParentType,
    ContextType
  >;
  fieldLabel?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  fieldName?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  fieldType?: Resolver<
    ResolversTypes["CustomFieldType"],
    ParentType,
    ContextType
  >;
  id?: Resolver<ResolversTypes["ID"], ParentType, ContextType>;
  isActive?: Resolver<ResolversTypes["Boolean"], ParentType, ContextType>;
  isRequired?: Resolver<ResolversTypes["Boolean"], ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes["DateTime"], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type CustomFieldOptionResolvers<
  ContextType = GraphQLContext,
  ParentType extends
    ResolversParentTypes["CustomFieldOption"] = ResolversParentTypes["CustomFieldOption"],
> = {
  label?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  value?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type CustomFieldValueResolvers<
  ContextType = GraphQLContext,
  ParentType extends
    ResolversParentTypes["CustomFieldValue"] = ResolversParentTypes["CustomFieldValue"],
> = {
  booleanValue?: Resolver<
    Maybe<ResolversTypes["Boolean"]>,
    ParentType,
    ContextType
  >;
  dateValue?: Resolver<
    Maybe<ResolversTypes["DateTime"]>,
    ParentType,
    ContextType
  >;
  definition?: Resolver<
    ResolversTypes["CustomFieldDefinition"],
    ParentType,
    ContextType
  >;
  numberValue?: Resolver<
    Maybe<ResolversTypes["Float"]>,
    ParentType,
    ContextType
  >;
  selectedOptionValues?: Resolver<
    Maybe<Array<ResolversTypes["String"]>>,
    ParentType,
    ContextType
  >;
  stringValue?: Resolver<
    Maybe<ResolversTypes["String"]>,
    ParentType,
    ContextType
  >;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export interface DateScalarConfig
  extends GraphQLScalarTypeConfig<ResolversTypes["Date"], any> {
  name: "Date";
}

export interface DateTimeScalarConfig
  extends GraphQLScalarTypeConfig<ResolversTypes["DateTime"], any> {
  name: "DateTime";
}

export type DealResolvers<
  ContextType = GraphQLContext,
  ParentType extends
    ResolversParentTypes["Deal"] = ResolversParentTypes["Deal"],
> = {
  amount?: Resolver<Maybe<ResolversTypes["Float"]>, ParentType, ContextType>;
  amountUsd?: Resolver<Maybe<ResolversTypes["Float"]>, ParentType, ContextType>;
  amount_usd?: Resolver<
    Maybe<ResolversTypes["Float"]>,
    ParentType,
    ContextType
  >;
  assignedToUser?: Resolver<
    Maybe<ResolversTypes["User"]>,
    ParentType,
    ContextType
  >;
  assigned_to_user_id?: Resolver<
    Maybe<ResolversTypes["ID"]>,
    ParentType,
    ContextType
  >;
  conversionHistory?: Resolver<
    Array<ResolversTypes["ConversionHistory"]>,
    ParentType,
    ContextType
  >;
  conversionReason?: Resolver<
    Maybe<ResolversTypes["String"]>,
    ParentType,
    ContextType
  >;
  convertedToLead?: Resolver<
    Maybe<ResolversTypes["Lead"]>,
    ParentType,
    ContextType
  >;
  createdBy?: Resolver<ResolversTypes["User"], ParentType, ContextType>;
  created_at?: Resolver<ResolversTypes["DateTime"], ParentType, ContextType>;
  currency?: Resolver<Maybe<ResolversTypes["String"]>, ParentType, ContextType>;
  currentWfmStatus?: Resolver<
    Maybe<ResolversTypes["WFMStatus"]>,
    ParentType,
    ContextType
  >;
  currentWfmStep?: Resolver<
    Maybe<ResolversTypes["WFMWorkflowStep"]>,
    ParentType,
    ContextType
  >;
  customFieldValues?: Resolver<
    Array<ResolversTypes["CustomFieldValue"]>,
    ParentType,
    ContextType
  >;
  deal_specific_probability?: Resolver<
    Maybe<ResolversTypes["Float"]>,
    ParentType,
    ContextType
  >;
  exchangeRateUsed?: Resolver<
    Maybe<ResolversTypes["Float"]>,
    ParentType,
    ContextType
  >;
  exchange_rate_used?: Resolver<
    Maybe<ResolversTypes["Float"]>,
    ParentType,
    ContextType
  >;
  expected_close_date?: Resolver<
    Maybe<ResolversTypes["DateTime"]>,
    ParentType,
    ContextType
  >;
  formattedAmount?: Resolver<
    Maybe<ResolversTypes["String"]>,
    ParentType,
    ContextType
  >;
  history?: Resolver<
    Maybe<Array<ResolversTypes["DealHistoryEntry"]>>,
    ParentType,
    ContextType,
    Partial<DealHistoryArgs>
  >;
  id?: Resolver<ResolversTypes["ID"], ParentType, ContextType>;
  name?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  organization?: Resolver<
    Maybe<ResolversTypes["Organization"]>,
    ParentType,
    ContextType
  >;
  organization_id?: Resolver<
    Maybe<ResolversTypes["ID"]>,
    ParentType,
    ContextType
  >;
  participants?: Resolver<
    Array<ResolversTypes["DealParticipant"]>,
    ParentType,
    ContextType
  >;
  person?: Resolver<Maybe<ResolversTypes["Person"]>, ParentType, ContextType>;
  person_id?: Resolver<Maybe<ResolversTypes["ID"]>, ParentType, ContextType>;
  project_id?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  updated_at?: Resolver<ResolversTypes["DateTime"], ParentType, ContextType>;
  user_id?: Resolver<ResolversTypes["ID"], ParentType, ContextType>;
  weighted_amount?: Resolver<
    Maybe<ResolversTypes["Float"]>,
    ParentType,
    ContextType
  >;
  wfmProject?: Resolver<
    Maybe<ResolversTypes["WFMProject"]>,
    ParentType,
    ContextType
  >;
  wfm_project_id?: Resolver<
    Maybe<ResolversTypes["ID"]>,
    ParentType,
    ContextType
  >;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type DealDocumentAttachmentResolvers<
  ContextType = GraphQLContext,
  ParentType extends
    ResolversParentTypes["DealDocumentAttachment"] = ResolversParentTypes["DealDocumentAttachment"],
> = {
  attachedAt?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  attachedBy?: Resolver<ResolversTypes["ID"], ParentType, ContextType>;
  category?: Resolver<
    Maybe<ResolversTypes["DocumentCategory"]>,
    ParentType,
    ContextType
  >;
  dealId?: Resolver<ResolversTypes["ID"], ParentType, ContextType>;
  fileName?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  fileSize?: Resolver<Maybe<ResolversTypes["Int"]>, ParentType, ContextType>;
  fileUrl?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  googleFileId?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  id?: Resolver<ResolversTypes["ID"], ParentType, ContextType>;
  mimeType?: Resolver<Maybe<ResolversTypes["String"]>, ParentType, ContextType>;
  sharedDriveId?: Resolver<
    Maybe<ResolversTypes["String"]>,
    ParentType,
    ContextType
  >;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type DealFolderInfoResolvers<
  ContextType = GraphQLContext,
  ParentType extends
    ResolversParentTypes["DealFolderInfo"] = ResolversParentTypes["DealFolderInfo"],
> = {
  dealFolder?: Resolver<
    Maybe<ResolversTypes["DriveFolder"]>,
    ParentType,
    ContextType
  >;
  exists?: Resolver<ResolversTypes["Boolean"], ParentType, ContextType>;
  subfolders?: Resolver<
    Maybe<ResolversTypes["DealSubfolders"]>,
    ParentType,
    ContextType
  >;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type DealHistoryEntryResolvers<
  ContextType = GraphQLContext,
  ParentType extends
    ResolversParentTypes["DealHistoryEntry"] = ResolversParentTypes["DealHistoryEntry"],
> = {
  changes?: Resolver<Maybe<ResolversTypes["JSON"]>, ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes["DateTime"], ParentType, ContextType>;
  eventType?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  id?: Resolver<ResolversTypes["ID"], ParentType, ContextType>;
  user?: Resolver<Maybe<ResolversTypes["User"]>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type DealParticipantResolvers<
  ContextType = GraphQLContext,
  ParentType extends
    ResolversParentTypes["DealParticipant"] = ResolversParentTypes["DealParticipant"],
> = {
  addedFromEmail?: Resolver<ResolversTypes["Boolean"], ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes["DateTime"], ParentType, ContextType>;
  createdByUserId?: Resolver<ResolversTypes["ID"], ParentType, ContextType>;
  dealId?: Resolver<ResolversTypes["ID"], ParentType, ContextType>;
  id?: Resolver<ResolversTypes["ID"], ParentType, ContextType>;
  person?: Resolver<ResolversTypes["Person"], ParentType, ContextType>;
  personId?: Resolver<ResolversTypes["ID"], ParentType, ContextType>;
  role?: Resolver<ResolversTypes["ContactRoleType"], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type DealSubfoldersResolvers<
  ContextType = GraphQLContext,
  ParentType extends
    ResolversParentTypes["DealSubfolders"] = ResolversParentTypes["DealSubfolders"],
> = {
  contracts?: Resolver<
    Maybe<ResolversTypes["DriveFolder"]>,
    ParentType,
    ContextType
  >;
  correspondence?: Resolver<
    Maybe<ResolversTypes["DriveFolder"]>,
    ParentType,
    ContextType
  >;
  financial?: Resolver<
    Maybe<ResolversTypes["DriveFolder"]>,
    ParentType,
    ContextType
  >;
  legal?: Resolver<
    Maybe<ResolversTypes["DriveFolder"]>,
    ParentType,
    ContextType
  >;
  other?: Resolver<
    Maybe<ResolversTypes["DriveFolder"]>,
    ParentType,
    ContextType
  >;
  presentations?: Resolver<
    Maybe<ResolversTypes["DriveFolder"]>,
    ParentType,
    ContextType
  >;
  proposals?: Resolver<
    Maybe<ResolversTypes["DriveFolder"]>,
    ParentType,
    ContextType
  >;
  technical?: Resolver<
    Maybe<ResolversTypes["DriveFolder"]>,
    ParentType,
    ContextType
  >;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type DealTaskIndicatorResolvers<
  ContextType = GraphQLContext,
  ParentType extends
    ResolversParentTypes["DealTaskIndicator"] = ResolversParentTypes["DealTaskIndicator"],
> = {
  dealId?: Resolver<ResolversTypes["ID"], ParentType, ContextType>;
  tasksDueToday?: Resolver<ResolversTypes["Int"], ParentType, ContextType>;
  tasksOverdue?: Resolver<ResolversTypes["Int"], ParentType, ContextType>;
  totalActiveTasks?: Resolver<ResolversTypes["Int"], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type DealToLeadConversionResultResolvers<
  ContextType = GraphQLContext,
  ParentType extends
    ResolversParentTypes["DealToLeadConversionResult"] = ResolversParentTypes["DealToLeadConversionResult"],
> = {
  conversionHistory?: Resolver<
    Maybe<ResolversTypes["ConversionHistory"]>,
    ParentType,
    ContextType
  >;
  conversionId?: Resolver<ResolversTypes["ID"], ParentType, ContextType>;
  errors?: Resolver<
    Maybe<Array<ResolversTypes["String"]>>,
    ParentType,
    ContextType
  >;
  lead?: Resolver<Maybe<ResolversTypes["Lead"]>, ParentType, ContextType>;
  message?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  reactivationPlan?: Resolver<
    Maybe<ResolversTypes["ReactivationPlan"]>,
    ParentType,
    ContextType
  >;
  success?: Resolver<ResolversTypes["Boolean"], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type DealsByCurrencyResultResolvers<
  ContextType = GraphQLContext,
  ParentType extends
    ResolversParentTypes["DealsByCurrencyResult"] = ResolversParentTypes["DealsByCurrencyResult"],
> = {
  count?: Resolver<ResolversTypes["Int"], ParentType, ContextType>;
  currency?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  formattedTotal?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  totalAmount?: Resolver<ResolversTypes["Float"], ParentType, ContextType>;
  totalAmountUsd?: Resolver<ResolversTypes["Float"], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type DocumentResolvers<
  ContextType = GraphQLContext,
  ParentType extends
    ResolversParentTypes["Document"] = ResolversParentTypes["Document"],
> = {
  createdAt?: Resolver<ResolversTypes["DateTime"], ParentType, ContextType>;
  createdByUser?: Resolver<ResolversTypes["User"], ParentType, ContextType>;
  entityId?: Resolver<ResolversTypes["ID"], ParentType, ContextType>;
  entityType?: Resolver<ResolversTypes["EntityType"], ParentType, ContextType>;
  fileName?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  fileSizeBytes?: Resolver<
    Maybe<ResolversTypes["Int"]>,
    ParentType,
    ContextType
  >;
  googleDriveDownloadLink?: Resolver<
    Maybe<ResolversTypes["String"]>,
    ParentType,
    ContextType
  >;
  googleDriveFileId?: Resolver<
    Maybe<ResolversTypes["String"]>,
    ParentType,
    ContextType
  >;
  googleDriveFolderId?: Resolver<
    Maybe<ResolversTypes["String"]>,
    ParentType,
    ContextType
  >;
  googleDriveWebViewLink?: Resolver<
    Maybe<ResolversTypes["String"]>,
    ParentType,
    ContextType
  >;
  id?: Resolver<ResolversTypes["ID"], ParentType, ContextType>;
  isPublic?: Resolver<ResolversTypes["Boolean"], ParentType, ContextType>;
  lastSyncedAt?: Resolver<
    Maybe<ResolversTypes["DateTime"]>,
    ParentType,
    ContextType
  >;
  mimeType?: Resolver<Maybe<ResolversTypes["String"]>, ParentType, ContextType>;
  sharedWithUsers?: Resolver<
    Array<ResolversTypes["ID"]>,
    ParentType,
    ContextType
  >;
  updatedAt?: Resolver<ResolversTypes["DateTime"], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type DriveFileResolvers<
  ContextType = GraphQLContext,
  ParentType extends
    ResolversParentTypes["DriveFile"] = ResolversParentTypes["DriveFile"],
> = {
  createdTime?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  iconLink?: Resolver<Maybe<ResolversTypes["String"]>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes["ID"], ParentType, ContextType>;
  mimeType?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  modifiedTime?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  name?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  owners?: Resolver<
    Maybe<Array<ResolversTypes["DriveFileOwner"]>>,
    ParentType,
    ContextType
  >;
  parents?: Resolver<
    Maybe<Array<ResolversTypes["String"]>>,
    ParentType,
    ContextType
  >;
  size?: Resolver<Maybe<ResolversTypes["Int"]>, ParentType, ContextType>;
  thumbnailLink?: Resolver<
    Maybe<ResolversTypes["String"]>,
    ParentType,
    ContextType
  >;
  webContentLink?: Resolver<
    Maybe<ResolversTypes["String"]>,
    ParentType,
    ContextType
  >;
  webViewLink?: Resolver<
    Maybe<ResolversTypes["String"]>,
    ParentType,
    ContextType
  >;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type DriveFileConnectionResolvers<
  ContextType = GraphQLContext,
  ParentType extends
    ResolversParentTypes["DriveFileConnection"] = ResolversParentTypes["DriveFileConnection"],
> = {
  files?: Resolver<Array<ResolversTypes["DriveFile"]>, ParentType, ContextType>;
  totalCount?: Resolver<ResolversTypes["Int"], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type DriveFileOwnerResolvers<
  ContextType = GraphQLContext,
  ParentType extends
    ResolversParentTypes["DriveFileOwner"] = ResolversParentTypes["DriveFileOwner"],
> = {
  displayName?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  emailAddress?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type DriveFolderResolvers<
  ContextType = GraphQLContext,
  ParentType extends
    ResolversParentTypes["DriveFolder"] = ResolversParentTypes["DriveFolder"],
> = {
  createdTime?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  id?: Resolver<ResolversTypes["ID"], ParentType, ContextType>;
  modifiedTime?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  name?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  parents?: Resolver<
    Maybe<Array<ResolversTypes["String"]>>,
    ParentType,
    ContextType
  >;
  webViewLink?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type DriveFolderConnectionResolvers<
  ContextType = GraphQLContext,
  ParentType extends
    ResolversParentTypes["DriveFolderConnection"] = ResolversParentTypes["DriveFolderConnection"],
> = {
  folders?: Resolver<
    Array<ResolversTypes["DriveFolder"]>,
    ParentType,
    ContextType
  >;
  totalCount?: Resolver<ResolversTypes["Int"], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type DriveFolderStructureResolvers<
  ContextType = GraphQLContext,
  ParentType extends
    ResolversParentTypes["DriveFolderStructure"] = ResolversParentTypes["DriveFolderStructure"],
> = {
  dealFolder?: Resolver<ResolversTypes["DriveFolder"], ParentType, ContextType>;
  subfolders?: Resolver<
    ResolversTypes["DriveFolderSubfolders"],
    ParentType,
    ContextType
  >;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type DriveFolderSubfoldersResolvers<
  ContextType = GraphQLContext,
  ParentType extends
    ResolversParentTypes["DriveFolderSubfolders"] = ResolversParentTypes["DriveFolderSubfolders"],
> = {
  contracts?: Resolver<
    Maybe<ResolversTypes["DriveFolder"]>,
    ParentType,
    ContextType
  >;
  correspondence?: Resolver<
    Maybe<ResolversTypes["DriveFolder"]>,
    ParentType,
    ContextType
  >;
  legal?: Resolver<
    Maybe<ResolversTypes["DriveFolder"]>,
    ParentType,
    ContextType
  >;
  presentations?: Resolver<
    Maybe<ResolversTypes["DriveFolder"]>,
    ParentType,
    ContextType
  >;
  proposals?: Resolver<
    Maybe<ResolversTypes["DriveFolder"]>,
    ParentType,
    ContextType
  >;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type DualAttachmentResponseResolvers<
  ContextType = GraphQLContext,
  ParentType extends
    ResolversParentTypes["DualAttachmentResponse"] = ResolversParentTypes["DualAttachmentResponse"],
> = {
  dealAttachment?: Resolver<
    ResolversTypes["DealDocumentAttachment"],
    ParentType,
    ContextType
  >;
  noteAttachment?: Resolver<
    ResolversTypes["NoteDocumentAttachment"],
    ParentType,
    ContextType
  >;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type EmailResolvers<
  ContextType = GraphQLContext,
  ParentType extends
    ResolversParentTypes["Email"] = ResolversParentTypes["Email"],
> = {
  bccEmails?: Resolver<
    Array<ResolversTypes["String"]>,
    ParentType,
    ContextType
  >;
  bodyPreview?: Resolver<
    Maybe<ResolversTypes["String"]>,
    ParentType,
    ContextType
  >;
  ccEmails?: Resolver<Array<ResolversTypes["String"]>, ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes["DateTime"], ParentType, ContextType>;
  createdByUser?: Resolver<ResolversTypes["User"], ParentType, ContextType>;
  entityId?: Resolver<Maybe<ResolversTypes["ID"]>, ParentType, ContextType>;
  entityType?: Resolver<
    Maybe<ResolversTypes["EntityType"]>,
    ParentType,
    ContextType
  >;
  fromEmail?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  fullBody?: Resolver<Maybe<ResolversTypes["String"]>, ParentType, ContextType>;
  gmailLabels?: Resolver<
    Array<ResolversTypes["String"]>,
    ParentType,
    ContextType
  >;
  gmailMessageId?: Resolver<
    Maybe<ResolversTypes["String"]>,
    ParentType,
    ContextType
  >;
  gmailThreadId?: Resolver<
    Maybe<ResolversTypes["String"]>,
    ParentType,
    ContextType
  >;
  hasAttachments?: Resolver<ResolversTypes["Boolean"], ParentType, ContextType>;
  id?: Resolver<ResolversTypes["ID"], ParentType, ContextType>;
  isOutbound?: Resolver<ResolversTypes["Boolean"], ParentType, ContextType>;
  isRead?: Resolver<ResolversTypes["Boolean"], ParentType, ContextType>;
  sentAt?: Resolver<ResolversTypes["DateTime"], ParentType, ContextType>;
  subject?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  toEmails?: Resolver<Array<ResolversTypes["String"]>, ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes["DateTime"], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type EmailActivityResolvers<
  ContextType = GraphQLContext,
  ParentType extends
    ResolversParentTypes["EmailActivity"] = ResolversParentTypes["EmailActivity"],
> = {
  activityType?: Resolver<
    ResolversTypes["EmailActivityType"],
    ParentType,
    ContextType
  >;
  createdAt?: Resolver<ResolversTypes["DateTime"], ParentType, ContextType>;
  email?: Resolver<ResolversTypes["Email"], ParentType, ContextType>;
  id?: Resolver<ResolversTypes["ID"], ParentType, ContextType>;
  metadata?: Resolver<Maybe<ResolversTypes["JSON"]>, ParentType, ContextType>;
  occurredAt?: Resolver<ResolversTypes["DateTime"], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type EmailAnalyticsResolvers<
  ContextType = GraphQLContext,
  ParentType extends
    ResolversParentTypes["EmailAnalytics"] = ResolversParentTypes["EmailAnalytics"],
> = {
  avgResponseTime?: Resolver<
    Maybe<ResolversTypes["String"]>,
    ParentType,
    ContextType
  >;
  emailSentiment?: Resolver<
    Maybe<ResolversTypes["String"]>,
    ParentType,
    ContextType
  >;
  lastContactTime?: Resolver<
    Maybe<ResolversTypes["String"]>,
    ParentType,
    ContextType
  >;
  responseRate?: Resolver<
    Maybe<ResolversTypes["Float"]>,
    ParentType,
    ContextType
  >;
  totalThreads?: Resolver<ResolversTypes["Int"], ParentType, ContextType>;
  unreadCount?: Resolver<ResolversTypes["Int"], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type EmailAttachmentResolvers<
  ContextType = GraphQLContext,
  ParentType extends
    ResolversParentTypes["EmailAttachment"] = ResolversParentTypes["EmailAttachment"],
> = {
  downloadUrl?: Resolver<
    Maybe<ResolversTypes["String"]>,
    ParentType,
    ContextType
  >;
  filename?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  id?: Resolver<ResolversTypes["ID"], ParentType, ContextType>;
  mimeType?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  size?: Resolver<ResolversTypes["Int"], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type EmailMessageResolvers<
  ContextType = GraphQLContext,
  ParentType extends
    ResolversParentTypes["EmailMessage"] = ResolversParentTypes["EmailMessage"],
> = {
  attachments?: Resolver<
    Maybe<Array<ResolversTypes["EmailAttachment"]>>,
    ParentType,
    ContextType
  >;
  bcc?: Resolver<
    Maybe<Array<ResolversTypes["String"]>>,
    ParentType,
    ContextType
  >;
  body?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  cc?: Resolver<
    Maybe<Array<ResolversTypes["String"]>>,
    ParentType,
    ContextType
  >;
  from?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  hasAttachments?: Resolver<ResolversTypes["Boolean"], ParentType, ContextType>;
  htmlBody?: Resolver<Maybe<ResolversTypes["String"]>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes["ID"], ParentType, ContextType>;
  importance?: Resolver<
    Maybe<ResolversTypes["EmailImportance"]>,
    ParentType,
    ContextType
  >;
  isUnread?: Resolver<ResolversTypes["Boolean"], ParentType, ContextType>;
  labels?: Resolver<
    Maybe<Array<ResolversTypes["String"]>>,
    ParentType,
    ContextType
  >;
  subject?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  threadId?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  timestamp?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  to?: Resolver<Array<ResolversTypes["String"]>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type EmailPinResolvers<
  ContextType = GraphQLContext,
  ParentType extends
    ResolversParentTypes["EmailPin"] = ResolversParentTypes["EmailPin"],
> = {
  createdAt?: Resolver<ResolversTypes["DateTime"], ParentType, ContextType>;
  dealId?: Resolver<ResolversTypes["ID"], ParentType, ContextType>;
  emailId?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  fromEmail?: Resolver<
    Maybe<ResolversTypes["String"]>,
    ParentType,
    ContextType
  >;
  id?: Resolver<ResolversTypes["ID"], ParentType, ContextType>;
  notes?: Resolver<Maybe<ResolversTypes["String"]>, ParentType, ContextType>;
  pinnedAt?: Resolver<ResolversTypes["DateTime"], ParentType, ContextType>;
  subject?: Resolver<Maybe<ResolversTypes["String"]>, ParentType, ContextType>;
  threadId?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes["DateTime"], ParentType, ContextType>;
  userId?: Resolver<ResolversTypes["ID"], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type EmailThreadResolvers<
  ContextType = GraphQLContext,
  ParentType extends
    ResolversParentTypes["EmailThread"] = ResolversParentTypes["EmailThread"],
> = {
  dealId?: Resolver<Maybe<ResolversTypes["String"]>, ParentType, ContextType>;
  entityId?: Resolver<Maybe<ResolversTypes["String"]>, ParentType, ContextType>;
  entityType?: Resolver<
    Maybe<ResolversTypes["String"]>,
    ParentType,
    ContextType
  >;
  id?: Resolver<ResolversTypes["ID"], ParentType, ContextType>;
  isUnread?: Resolver<ResolversTypes["Boolean"], ParentType, ContextType>;
  lastActivity?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  latestMessage?: Resolver<
    Maybe<ResolversTypes["EmailMessage"]>,
    ParentType,
    ContextType
  >;
  messageCount?: Resolver<ResolversTypes["Int"], ParentType, ContextType>;
  participants?: Resolver<
    Array<ResolversTypes["String"]>,
    ParentType,
    ContextType
  >;
  subject?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type EmailThreadConnectionResolvers<
  ContextType = GraphQLContext,
  ParentType extends
    ResolversParentTypes["EmailThreadConnection"] = ResolversParentTypes["EmailThreadConnection"],
> = {
  hasNextPage?: Resolver<ResolversTypes["Boolean"], ParentType, ContextType>;
  nextPageToken?: Resolver<
    Maybe<ResolversTypes["String"]>,
    ParentType,
    ContextType
  >;
  threads?: Resolver<
    Array<ResolversTypes["EmailThread"]>,
    ParentType,
    ContextType
  >;
  totalCount?: Resolver<ResolversTypes["Int"], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ExchangeRateResolvers<
  ContextType = GraphQLContext,
  ParentType extends
    ResolversParentTypes["ExchangeRate"] = ResolversParentTypes["ExchangeRate"],
> = {
  createdAt?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  effectiveDate?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  fromCurrency?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  id?: Resolver<ResolversTypes["ID"], ParentType, ContextType>;
  rate?: Resolver<ResolversTypes["Float"], ParentType, ContextType>;
  source?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  toCurrency?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ExtendedThinkingAnalysisResolvers<
  ContextType = GraphQLContext,
  ParentType extends
    ResolversParentTypes["ExtendedThinkingAnalysis"] = ResolversParentTypes["ExtendedThinkingAnalysis"],
> = {
  identifiedConcerns?: Resolver<
    Array<ResolversTypes["String"]>,
    ParentType,
    ContextType
  >;
  reasoningDepth?: Resolver<ResolversTypes["Float"], ParentType, ContextType>;
  recommendedActions?: Resolver<
    Array<ResolversTypes["String"]>,
    ParentType,
    ContextType
  >;
  strategicInsights?: Resolver<
    Array<ResolversTypes["String"]>,
    ParentType,
    ContextType
  >;
  thinkingBudgetUsed?: Resolver<
    ResolversTypes["ThinkingBudget"],
    ParentType,
    ContextType
  >;
  totalThoughts?: Resolver<ResolversTypes["Int"], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type GoogleCalendarResolvers<
  ContextType = GraphQLContext,
  ParentType extends
    ResolversParentTypes["GoogleCalendar"] = ResolversParentTypes["GoogleCalendar"],
> = {
  accessRole?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  backgroundColor?: Resolver<
    Maybe<ResolversTypes["String"]>,
    ParentType,
    ContextType
  >;
  colorId?: Resolver<Maybe<ResolversTypes["String"]>, ParentType, ContextType>;
  description?: Resolver<
    Maybe<ResolversTypes["String"]>,
    ParentType,
    ContextType
  >;
  foregroundColor?: Resolver<
    Maybe<ResolversTypes["String"]>,
    ParentType,
    ContextType
  >;
  id?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  primary?: Resolver<Maybe<ResolversTypes["Boolean"]>, ParentType, ContextType>;
  summary?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  timeZone?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type GoogleDriveConfigResolvers<
  ContextType = GraphQLContext,
  ParentType extends
    ResolversParentTypes["GoogleDriveConfig"] = ResolversParentTypes["GoogleDriveConfig"],
> = {
  auto_create_deal_folders?: Resolver<
    ResolversTypes["Boolean"],
    ParentType,
    ContextType
  >;
  deal_folder_template?: Resolver<
    ResolversTypes["Boolean"],
    ParentType,
    ContextType
  >;
  pipecd_deals_folder_id?: Resolver<
    Maybe<ResolversTypes["String"]>,
    ParentType,
    ContextType
  >;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type GoogleIntegrationStatusResolvers<
  ContextType = GraphQLContext,
  ParentType extends
    ResolversParentTypes["GoogleIntegrationStatus"] = ResolversParentTypes["GoogleIntegrationStatus"],
> = {
  hasCalendarAccess?: Resolver<
    ResolversTypes["Boolean"],
    ParentType,
    ContextType
  >;
  hasContactsAccess?: Resolver<
    ResolversTypes["Boolean"],
    ParentType,
    ContextType
  >;
  hasDriveAccess?: Resolver<ResolversTypes["Boolean"], ParentType, ContextType>;
  hasGmailAccess?: Resolver<ResolversTypes["Boolean"], ParentType, ContextType>;
  hasGoogleAuth?: Resolver<ResolversTypes["Boolean"], ParentType, ContextType>;
  isConnected?: Resolver<ResolversTypes["Boolean"], ParentType, ContextType>;
  missingScopes?: Resolver<
    Array<ResolversTypes["String"]>,
    ParentType,
    ContextType
  >;
  tokenExpiry?: Resolver<
    Maybe<ResolversTypes["DateTime"]>,
    ParentType,
    ContextType
  >;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type GoogleTokenDataResolvers<
  ContextType = GraphQLContext,
  ParentType extends
    ResolversParentTypes["GoogleTokenData"] = ResolversParentTypes["GoogleTokenData"],
> = {
  access_token?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  expires_at?: Resolver<
    Maybe<ResolversTypes["DateTime"]>,
    ParentType,
    ContextType
  >;
  granted_scopes?: Resolver<
    Array<ResolversTypes["String"]>,
    ParentType,
    ContextType
  >;
  refresh_token?: Resolver<
    Maybe<ResolversTypes["String"]>,
    ParentType,
    ContextType
  >;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export interface JsonScalarConfig
  extends GraphQLScalarTypeConfig<ResolversTypes["JSON"], any> {
  name: "JSON";
}

export type LeadResolvers<
  ContextType = GraphQLContext,
  ParentType extends
    ResolversParentTypes["Lead"] = ResolversParentTypes["Lead"],
> = {
  ai_insights?: Resolver<
    Maybe<ResolversTypes["JSON"]>,
    ParentType,
    ContextType
  >;
  assignedToUser?: Resolver<
    Maybe<ResolversTypes["User"]>,
    ParentType,
    ContextType
  >;
  assigned_at?: Resolver<
    Maybe<ResolversTypes["DateTime"]>,
    ParentType,
    ContextType
  >;
  assigned_to_user_id?: Resolver<
    Maybe<ResolversTypes["ID"]>,
    ParentType,
    ContextType
  >;
  automation_score_factors?: Resolver<
    Maybe<ResolversTypes["JSON"]>,
    ParentType,
    ContextType
  >;
  company_name?: Resolver<
    Maybe<ResolversTypes["String"]>,
    ParentType,
    ContextType
  >;
  contact_email?: Resolver<
    Maybe<ResolversTypes["String"]>,
    ParentType,
    ContextType
  >;
  contact_name?: Resolver<
    Maybe<ResolversTypes["String"]>,
    ParentType,
    ContextType
  >;
  contact_phone?: Resolver<
    Maybe<ResolversTypes["String"]>,
    ParentType,
    ContextType
  >;
  conversionHistory?: Resolver<
    Array<ResolversTypes["ConversionHistory"]>,
    ParentType,
    ContextType
  >;
  conversionReason?: Resolver<
    Maybe<ResolversTypes["String"]>,
    ParentType,
    ContextType
  >;
  converted_at?: Resolver<
    Maybe<ResolversTypes["DateTime"]>,
    ParentType,
    ContextType
  >;
  converted_by_user?: Resolver<
    Maybe<ResolversTypes["User"]>,
    ParentType,
    ContextType
  >;
  converted_by_user_id?: Resolver<
    Maybe<ResolversTypes["ID"]>,
    ParentType,
    ContextType
  >;
  converted_to_deal?: Resolver<
    Maybe<ResolversTypes["Deal"]>,
    ParentType,
    ContextType
  >;
  converted_to_deal_id?: Resolver<
    Maybe<ResolversTypes["ID"]>,
    ParentType,
    ContextType
  >;
  converted_to_organization?: Resolver<
    Maybe<ResolversTypes["Organization"]>,
    ParentType,
    ContextType
  >;
  converted_to_organization_id?: Resolver<
    Maybe<ResolversTypes["ID"]>,
    ParentType,
    ContextType
  >;
  converted_to_person?: Resolver<
    Maybe<ResolversTypes["Person"]>,
    ParentType,
    ContextType
  >;
  converted_to_person_id?: Resolver<
    Maybe<ResolversTypes["ID"]>,
    ParentType,
    ContextType
  >;
  createdBy?: Resolver<ResolversTypes["User"], ParentType, ContextType>;
  created_at?: Resolver<ResolversTypes["DateTime"], ParentType, ContextType>;
  currency?: Resolver<Maybe<ResolversTypes["String"]>, ParentType, ContextType>;
  currentWfmStatus?: Resolver<
    Maybe<ResolversTypes["WFMStatus"]>,
    ParentType,
    ContextType
  >;
  currentWfmStep?: Resolver<
    Maybe<ResolversTypes["WFMWorkflowStep"]>,
    ParentType,
    ContextType
  >;
  customFieldValues?: Resolver<
    Array<ResolversTypes["CustomFieldValue"]>,
    ParentType,
    ContextType
  >;
  description?: Resolver<
    Maybe<ResolversTypes["String"]>,
    ParentType,
    ContextType
  >;
  estimatedValueUsd?: Resolver<
    Maybe<ResolversTypes["Float"]>,
    ParentType,
    ContextType
  >;
  estimated_close_date?: Resolver<
    Maybe<ResolversTypes["DateTime"]>,
    ParentType,
    ContextType
  >;
  estimated_value?: Resolver<
    Maybe<ResolversTypes["Float"]>,
    ParentType,
    ContextType
  >;
  exchangeRateUsed?: Resolver<
    Maybe<ResolversTypes["Float"]>,
    ParentType,
    ContextType
  >;
  formattedEstimatedValue?: Resolver<
    Maybe<ResolversTypes["String"]>,
    ParentType,
    ContextType
  >;
  history?: Resolver<
    Maybe<Array<Maybe<ResolversTypes["LeadHistoryEntry"]>>>,
    ParentType,
    ContextType,
    Partial<LeadHistoryArgs>
  >;
  id?: Resolver<ResolversTypes["ID"], ParentType, ContextType>;
  isQualified?: Resolver<ResolversTypes["Boolean"], ParentType, ContextType>;
  last_activity_at?: Resolver<
    ResolversTypes["DateTime"],
    ParentType,
    ContextType
  >;
  lead_score?: Resolver<ResolversTypes["Int"], ParentType, ContextType>;
  lead_score_factors?: Resolver<
    Maybe<ResolversTypes["JSON"]>,
    ParentType,
    ContextType
  >;
  name?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  originalDeal?: Resolver<
    Maybe<ResolversTypes["Deal"]>,
    ParentType,
    ContextType
  >;
  qualificationLevel?: Resolver<
    ResolversTypes["Float"],
    ParentType,
    ContextType
  >;
  qualificationStatus?: Resolver<
    ResolversTypes["String"],
    ParentType,
    ContextType
  >;
  reactivationPlan?: Resolver<
    Maybe<ResolversTypes["ReactivationPlan"]>,
    ParentType,
    ContextType
  >;
  reactivationTargetDate?: Resolver<
    Maybe<ResolversTypes["DateTime"]>,
    ParentType,
    ContextType
  >;
  source?: Resolver<Maybe<ResolversTypes["String"]>, ParentType, ContextType>;
  updated_at?: Resolver<ResolversTypes["DateTime"], ParentType, ContextType>;
  user_id?: Resolver<ResolversTypes["ID"], ParentType, ContextType>;
  wfmProject?: Resolver<
    Maybe<ResolversTypes["WFMProject"]>,
    ParentType,
    ContextType
  >;
  wfm_project_id?: Resolver<
    Maybe<ResolversTypes["ID"]>,
    ParentType,
    ContextType
  >;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type LeadConversionResultResolvers<
  ContextType = GraphQLContext,
  ParentType extends
    ResolversParentTypes["LeadConversionResult"] = ResolversParentTypes["LeadConversionResult"],
> = {
  convertedEntities?: Resolver<
    ResolversTypes["ConvertedEntities"],
    ParentType,
    ContextType
  >;
  leadId?: Resolver<ResolversTypes["ID"], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type LeadHistoryEntryResolvers<
  ContextType = GraphQLContext,
  ParentType extends
    ResolversParentTypes["LeadHistoryEntry"] = ResolversParentTypes["LeadHistoryEntry"],
> = {
  changes?: Resolver<Maybe<ResolversTypes["JSON"]>, ParentType, ContextType>;
  created_at?: Resolver<ResolversTypes["DateTime"], ParentType, ContextType>;
  event_type?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  id?: Resolver<ResolversTypes["ID"], ParentType, ContextType>;
  lead_id?: Resolver<ResolversTypes["ID"], ParentType, ContextType>;
  user?: Resolver<Maybe<ResolversTypes["User"]>, ParentType, ContextType>;
  user_id?: Resolver<Maybe<ResolversTypes["ID"]>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type LeadsStatsResolvers<
  ContextType = GraphQLContext,
  ParentType extends
    ResolversParentTypes["LeadsStats"] = ResolversParentTypes["LeadsStats"],
> = {
  averageLeadScore?: Resolver<ResolversTypes["Float"], ParentType, ContextType>;
  averageQualificationLevel?: Resolver<
    ResolversTypes["Float"],
    ParentType,
    ContextType
  >;
  conversionRate?: Resolver<ResolversTypes["Float"], ParentType, ContextType>;
  convertedLeads?: Resolver<ResolversTypes["Int"], ParentType, ContextType>;
  qualifiedLeads?: Resolver<ResolversTypes["Int"], ParentType, ContextType>;
  totalLeads?: Resolver<ResolversTypes["Int"], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type MutationResolvers<
  ContextType = GraphQLContext,
  ParentType extends
    ResolversParentTypes["Mutation"] = ResolversParentTypes["Mutation"],
> = {
  activateBusinessRule?: Resolver<
    ResolversTypes["BusinessRule"],
    ParentType,
    ContextType,
    RequireFields<MutationActivateBusinessRuleArgs, "id">
  >;
  addAgentThoughts?: Resolver<
    Array<ResolversTypes["AgentThought"]>,
    ParentType,
    ContextType,
    RequireFields<MutationAddAgentThoughtsArgs, "conversationId" | "thoughts">
  >;
  addAgentV2Thoughts?: Resolver<
    Array<ResolversTypes["AgentThought"]>,
    ParentType,
    ContextType,
    RequireFields<MutationAddAgentV2ThoughtsArgs, "conversationId" | "thoughts">
  >;
  addDealContextToEvent?: Resolver<
    ResolversTypes["CalendarEvent"],
    ParentType,
    ContextType,
    RequireFields<MutationAddDealContextToEventArgs, "dealId" | "eventId">
  >;
  addDealParticipant?: Resolver<
    ResolversTypes["DealParticipant"],
    ParentType,
    ContextType,
    RequireFields<MutationAddDealParticipantArgs, "input">
  >;
  archiveThread?: Resolver<
    ResolversTypes["Boolean"],
    ParentType,
    ContextType,
    RequireFields<MutationArchiveThreadArgs, "threadId">
  >;
  assignAccountManager?: Resolver<
    ResolversTypes["Organization"],
    ParentType,
    ContextType,
    RequireFields<MutationAssignAccountManagerArgs, "organizationId" | "userId">
  >;
  assignTask?: Resolver<
    ResolversTypes["Task"],
    ParentType,
    ContextType,
    RequireFields<MutationAssignTaskArgs, "taskId">
  >;
  assignUserRole?: Resolver<
    ResolversTypes["User"],
    ParentType,
    ContextType,
    RequireFields<MutationAssignUserRoleArgs, "roleName" | "userId">
  >;
  attachDocumentToDeal?: Resolver<
    ResolversTypes["DealDocumentAttachment"],
    ParentType,
    ContextType,
    RequireFields<MutationAttachDocumentToDealArgs, "input">
  >;
  attachDocumentToNoteAndDeal?: Resolver<
    ResolversTypes["DualAttachmentResponse"],
    ParentType,
    ContextType,
    RequireFields<MutationAttachDocumentToNoteAndDealArgs, "input">
  >;
  attachFileToDeal?: Resolver<
    ResolversTypes["DealDocumentAttachment"],
    ParentType,
    ContextType,
    RequireFields<MutationAttachFileToDealArgs, "input">
  >;
  bulkAssignTasks?: Resolver<
    Array<ResolversTypes["Task"]>,
    ParentType,
    ContextType,
    RequireFields<MutationBulkAssignTasksArgs, "taskIds" | "userId">
  >;
  bulkConvertLeads?: Resolver<
    Array<ResolversTypes["LeadConversionResult"]>,
    ParentType,
    ContextType,
    RequireFields<MutationBulkConvertLeadsArgs, "ids" | "input">
  >;
  bulkDeleteTasks?: Resolver<
    ResolversTypes["Boolean"],
    ParentType,
    ContextType,
    RequireFields<MutationBulkDeleteTasksArgs, "taskIds">
  >;
  bulkUpdateBusinessRuleStatus?: Resolver<
    Array<ResolversTypes["BusinessRule"]>,
    ParentType,
    ContextType,
    RequireFields<
      MutationBulkUpdateBusinessRuleStatusArgs,
      "ruleIds" | "status"
    >
  >;
  bulkUpdateTasks?: Resolver<
    Array<ResolversTypes["Task"]>,
    ParentType,
    ContextType,
    RequireFields<MutationBulkUpdateTasksArgs, "taskIds" | "updates">
  >;
  cleanupExpiredNotifications?: Resolver<
    ResolversTypes["Int"],
    ParentType,
    ContextType
  >;
  completeTask?: Resolver<
    ResolversTypes["Task"],
    ParentType,
    ContextType,
    RequireFields<MutationCompleteTaskArgs, "id">
  >;
  composeEmail?: Resolver<
    ResolversTypes["EmailMessage"],
    ParentType,
    ContextType,
    RequireFields<MutationComposeEmailArgs, "input">
  >;
  connectGoogleIntegration?: Resolver<
    ResolversTypes["GoogleIntegrationStatus"],
    ParentType,
    ContextType,
    RequireFields<MutationConnectGoogleIntegrationArgs, "input">
  >;
  convertCurrency?: Resolver<
    ResolversTypes["ConversionResult"],
    ParentType,
    ContextType,
    RequireFields<
      MutationConvertCurrencyArgs,
      "amount" | "fromCurrency" | "toCurrency"
    >
  >;
  convertDealToLead?: Resolver<
    ResolversTypes["DealToLeadConversionResult"],
    ParentType,
    ContextType,
    RequireFields<MutationConvertDealToLeadArgs, "id" | "input">
  >;
  convertLead?: Resolver<
    ResolversTypes["LeadConversionResult"],
    ParentType,
    ContextType,
    RequireFields<MutationConvertLeadArgs, "id" | "input">
  >;
  copyDriveFile?: Resolver<
    ResolversTypes["DriveFile"],
    ParentType,
    ContextType,
    RequireFields<MutationCopyDriveFileArgs, "fileId" | "newParentId">
  >;
  createAgentConversation?: Resolver<
    ResolversTypes["AgentConversation"],
    ParentType,
    ContextType,
    Partial<MutationCreateAgentConversationArgs>
  >;
  createAgentV2Conversation?: Resolver<
    ResolversTypes["AgentConversation"],
    ParentType,
    ContextType,
    RequireFields<MutationCreateAgentV2ConversationArgs, "input">
  >;
  createBusinessRule?: Resolver<
    ResolversTypes["BusinessRule"],
    ParentType,
    ContextType,
    RequireFields<MutationCreateBusinessRuleArgs, "input">
  >;
  createCalendarEvent?: Resolver<
    ResolversTypes["CalendarEvent"],
    ParentType,
    ContextType,
    RequireFields<MutationCreateCalendarEventArgs, "input">
  >;
  createContactFromEmail?: Resolver<
    ResolversTypes["Person"],
    ParentType,
    ContextType,
    RequireFields<MutationCreateContactFromEmailArgs, "input">
  >;
  createContextualTask?: Resolver<
    ResolversTypes["Task"],
    ParentType,
    ContextType,
    RequireFields<MutationCreateContextualTaskArgs, "input">
  >;
  createCurrency?: Resolver<
    ResolversTypes["Currency"],
    ParentType,
    ContextType,
    RequireFields<MutationCreateCurrencyArgs, "input">
  >;
  createCustomFieldDefinition?: Resolver<
    ResolversTypes["CustomFieldDefinition"],
    ParentType,
    ContextType,
    RequireFields<MutationCreateCustomFieldDefinitionArgs, "input">
  >;
  createDeal?: Resolver<
    ResolversTypes["Deal"],
    ParentType,
    ContextType,
    RequireFields<MutationCreateDealArgs, "input">
  >;
  createDealFolder?: Resolver<
    ResolversTypes["DriveFolderStructure"],
    ParentType,
    ContextType,
    RequireFields<MutationCreateDealFolderArgs, "input">
  >;
  createDocument?: Resolver<
    ResolversTypes["Document"],
    ParentType,
    ContextType,
    RequireFields<MutationCreateDocumentArgs, "input">
  >;
  createEmail?: Resolver<
    ResolversTypes["Email"],
    ParentType,
    ContextType,
    RequireFields<MutationCreateEmailArgs, "input">
  >;
  createLead?: Resolver<
    ResolversTypes["Lead"],
    ParentType,
    ContextType,
    RequireFields<MutationCreateLeadArgs, "input">
  >;
  createOrganization?: Resolver<
    ResolversTypes["Organization"],
    ParentType,
    ContextType,
    RequireFields<MutationCreateOrganizationArgs, "input">
  >;
  createPerson?: Resolver<
    ResolversTypes["Person"],
    ParentType,
    ContextType,
    RequireFields<MutationCreatePersonArgs, "input">
  >;
  createPersonOrganizationRole?: Resolver<
    ResolversTypes["PersonOrganizationRole"],
    ParentType,
    ContextType,
    RequireFields<
      MutationCreatePersonOrganizationRoleArgs,
      "input" | "personId"
    >
  >;
  createReactivationPlan?: Resolver<
    ResolversTypes["ReactivationPlan"],
    ParentType,
    ContextType,
    RequireFields<MutationCreateReactivationPlanArgs, "input" | "leadId">
  >;
  createSticker?: Resolver<
    ResolversTypes["SmartSticker"],
    ParentType,
    ContextType,
    RequireFields<MutationCreateStickerArgs, "input">
  >;
  createSystemNotification?: Resolver<
    ResolversTypes["SystemNotification"],
    ParentType,
    ContextType,
    RequireFields<MutationCreateSystemNotificationArgs, "input">
  >;
  createTask?: Resolver<
    ResolversTypes["Task"],
    ParentType,
    ContextType,
    RequireFields<MutationCreateTaskArgs, "input">
  >;
  createTaskAutomationRule?: Resolver<
    ResolversTypes["TaskAutomationRule"],
    ParentType,
    ContextType,
    RequireFields<MutationCreateTaskAutomationRuleArgs, "input">
  >;
  createTaskDependency?: Resolver<
    ResolversTypes["TaskDependency"],
    ParentType,
    ContextType,
    RequireFields<MutationCreateTaskDependencyArgs, "input">
  >;
  createTasksFromTemplate?: Resolver<
    Array<ResolversTypes["Task"]>,
    ParentType,
    ContextType,
    RequireFields<MutationCreateTasksFromTemplateArgs, "context" | "templateId">
  >;
  createWFMProjectType?: Resolver<
    ResolversTypes["WFMProjectType"],
    ParentType,
    ContextType,
    RequireFields<MutationCreateWfmProjectTypeArgs, "input">
  >;
  createWFMStatus?: Resolver<
    ResolversTypes["WFMStatus"],
    ParentType,
    ContextType,
    RequireFields<MutationCreateWfmStatusArgs, "input">
  >;
  createWFMWorkflow?: Resolver<
    ResolversTypes["WFMWorkflow"],
    ParentType,
    ContextType,
    RequireFields<MutationCreateWfmWorkflowArgs, "input">
  >;
  createWFMWorkflowStep?: Resolver<
    ResolversTypes["WFMWorkflowStep"],
    ParentType,
    ContextType,
    RequireFields<MutationCreateWfmWorkflowStepArgs, "input">
  >;
  createWFMWorkflowTransition?: Resolver<
    ResolversTypes["WFMWorkflowTransition"],
    ParentType,
    ContextType,
    RequireFields<MutationCreateWfmWorkflowTransitionArgs, "input">
  >;
  deactivateBusinessRule?: Resolver<
    ResolversTypes["BusinessRule"],
    ParentType,
    ContextType,
    RequireFields<MutationDeactivateBusinessRuleArgs, "id">
  >;
  deactivateCustomFieldDefinition?: Resolver<
    ResolversTypes["CustomFieldDefinition"],
    ParentType,
    ContextType,
    RequireFields<MutationDeactivateCustomFieldDefinitionArgs, "id">
  >;
  deleteAgentConversation?: Resolver<
    ResolversTypes["Boolean"],
    ParentType,
    ContextType,
    RequireFields<MutationDeleteAgentConversationArgs, "id">
  >;
  deleteBusinessRule?: Resolver<
    ResolversTypes["Boolean"],
    ParentType,
    ContextType,
    RequireFields<MutationDeleteBusinessRuleArgs, "id">
  >;
  deleteCalendarEvent?: Resolver<
    ResolversTypes["Boolean"],
    ParentType,
    ContextType,
    RequireFields<MutationDeleteCalendarEventArgs, "id">
  >;
  deleteDeal?: Resolver<
    Maybe<ResolversTypes["Boolean"]>,
    ParentType,
    ContextType,
    RequireFields<MutationDeleteDealArgs, "id">
  >;
  deleteDriveFile?: Resolver<
    ResolversTypes["Boolean"],
    ParentType,
    ContextType,
    RequireFields<MutationDeleteDriveFileArgs, "fileId">
  >;
  deleteLead?: Resolver<
    Maybe<ResolversTypes["Boolean"]>,
    ParentType,
    ContextType,
    RequireFields<MutationDeleteLeadArgs, "id">
  >;
  deleteOrganization?: Resolver<
    Maybe<ResolversTypes["Boolean"]>,
    ParentType,
    ContextType,
    RequireFields<MutationDeleteOrganizationArgs, "id">
  >;
  deletePerson?: Resolver<
    Maybe<ResolversTypes["Boolean"]>,
    ParentType,
    ContextType,
    RequireFields<MutationDeletePersonArgs, "id">
  >;
  deletePersonOrganizationRole?: Resolver<
    ResolversTypes["Boolean"],
    ParentType,
    ContextType,
    RequireFields<MutationDeletePersonOrganizationRoleArgs, "id">
  >;
  deleteReactivationPlan?: Resolver<
    ResolversTypes["Boolean"],
    ParentType,
    ContextType,
    RequireFields<MutationDeleteReactivationPlanArgs, "id">
  >;
  deleteSticker?: Resolver<
    ResolversTypes["Boolean"],
    ParentType,
    ContextType,
    RequireFields<MutationDeleteStickerArgs, "id">
  >;
  deleteSystemNotification?: Resolver<
    ResolversTypes["Boolean"],
    ParentType,
    ContextType,
    RequireFields<MutationDeleteSystemNotificationArgs, "id">
  >;
  deleteTask?: Resolver<
    ResolversTypes["Boolean"],
    ParentType,
    ContextType,
    RequireFields<MutationDeleteTaskArgs, "id">
  >;
  deleteTaskAutomationRule?: Resolver<
    ResolversTypes["Boolean"],
    ParentType,
    ContextType,
    RequireFields<MutationDeleteTaskAutomationRuleArgs, "id">
  >;
  deleteTaskDependency?: Resolver<
    ResolversTypes["Boolean"],
    ParentType,
    ContextType,
    RequireFields<MutationDeleteTaskDependencyArgs, "id">
  >;
  deleteWFMWorkflowStep?: Resolver<
    ResolversTypes["WFMWorkflowStepMutationResponse"],
    ParentType,
    ContextType,
    RequireFields<MutationDeleteWfmWorkflowStepArgs, "id">
  >;
  deleteWFMWorkflowTransition?: Resolver<
    ResolversTypes["WFMWorkflowTransitionMutationResponse"],
    ParentType,
    ContextType,
    RequireFields<MutationDeleteWfmWorkflowTransitionArgs, "id">
  >;
  deleteWfmStatus?: Resolver<
    ResolversTypes["WFMStatusMutationResponse"],
    ParentType,
    ContextType,
    RequireFields<MutationDeleteWfmStatusArgs, "id">
  >;
  detachFileFromDeal?: Resolver<
    ResolversTypes["Boolean"],
    ParentType,
    ContextType,
    RequireFields<MutationDetachFileFromDealArgs, "attachmentId">
  >;
  dismissSystemNotification?: Resolver<
    ResolversTypes["Boolean"],
    ParentType,
    ContextType,
    RequireFields<MutationDismissSystemNotificationArgs, "id">
  >;
  duplicateBusinessRule?: Resolver<
    ResolversTypes["BusinessRule"],
    ParentType,
    ContextType,
    RequireFields<MutationDuplicateBusinessRuleArgs, "id" | "name">
  >;
  executeAgentStep?: Resolver<
    ResolversTypes["AgentResponse"],
    ParentType,
    ContextType,
    RequireFields<MutationExecuteAgentStepArgs, "conversationId" | "stepId">
  >;
  executeBusinessRule?: Resolver<
    ResolversTypes["BusinessRuleExecutionResult"],
    ParentType,
    ContextType,
    RequireFields<
      MutationExecuteBusinessRuleArgs,
      "entityId" | "entityType" | "ruleId" | "testMode"
    >
  >;
  generateTaskContentFromEmail?: Resolver<
    ResolversTypes["AIGeneratedTaskContent"],
    ParentType,
    ContextType,
    RequireFields<MutationGenerateTaskContentFromEmailArgs, "input">
  >;
  linkEmailToDeal?: Resolver<
    ResolversTypes["Boolean"],
    ParentType,
    ContextType,
    RequireFields<MutationLinkEmailToDealArgs, "dealId" | "emailId">
  >;
  markAllBusinessRuleNotificationsAsRead?: Resolver<
    ResolversTypes["Int"],
    ParentType,
    ContextType
  >;
  markAllNotificationsAsRead?: Resolver<
    ResolversTypes["Int"],
    ParentType,
    ContextType,
    RequireFields<MutationMarkAllNotificationsAsReadArgs, "userId">
  >;
  markAllSystemNotificationsAsRead?: Resolver<
    ResolversTypes["Int"],
    ParentType,
    ContextType
  >;
  markBusinessRuleNotificationAsRead?: Resolver<
    ResolversTypes["Boolean"],
    ParentType,
    ContextType,
    RequireFields<MutationMarkBusinessRuleNotificationAsReadArgs, "id">
  >;
  markNotificationAsActedUpon?: Resolver<
    ResolversTypes["BusinessRuleNotification"],
    ParentType,
    ContextType,
    RequireFields<MutationMarkNotificationAsActedUponArgs, "id">
  >;
  markNotificationAsDismissed?: Resolver<
    ResolversTypes["BusinessRuleNotification"],
    ParentType,
    ContextType,
    RequireFields<MutationMarkNotificationAsDismissedArgs, "id">
  >;
  markNotificationAsRead?: Resolver<
    ResolversTypes["BusinessRuleNotification"],
    ParentType,
    ContextType,
    RequireFields<MutationMarkNotificationAsReadArgs, "id">
  >;
  markSystemNotificationAsRead?: Resolver<
    ResolversTypes["Boolean"],
    ParentType,
    ContextType,
    RequireFields<MutationMarkSystemNotificationAsReadArgs, "id">
  >;
  markThreadAsRead?: Resolver<
    ResolversTypes["Boolean"],
    ParentType,
    ContextType,
    RequireFields<MutationMarkThreadAsReadArgs, "threadId">
  >;
  markThreadAsUnread?: Resolver<
    ResolversTypes["Boolean"],
    ParentType,
    ContextType,
    RequireFields<MutationMarkThreadAsUnreadArgs, "threadId">
  >;
  moveDriveFile?: Resolver<
    ResolversTypes["DriveFile"],
    ParentType,
    ContextType,
    RequireFields<MutationMoveDriveFileArgs, "fileId" | "newParentId">
  >;
  moveStickersBulk?: Resolver<
    Array<ResolversTypes["SmartSticker"]>,
    ParentType,
    ContextType,
    RequireFields<MutationMoveStickersBulkArgs, "moves">
  >;
  pinEmail?: Resolver<
    ResolversTypes["EmailPin"],
    ParentType,
    ContextType,
    RequireFields<MutationPinEmailArgs, "input">
  >;
  reactivateCustomFieldDefinition?: Resolver<
    ResolversTypes["CustomFieldDefinition"],
    ParentType,
    ContextType,
    RequireFields<MutationReactivateCustomFieldDefinitionArgs, "id">
  >;
  recalculateLeadScore?: Resolver<
    ResolversTypes["Lead"],
    ParentType,
    ContextType,
    RequireFields<MutationRecalculateLeadScoreArgs, "leadId">
  >;
  removeAccountManager?: Resolver<
    ResolversTypes["Organization"],
    ParentType,
    ContextType,
    RequireFields<MutationRemoveAccountManagerArgs, "organizationId">
  >;
  removeDealContextFromEvent?: Resolver<
    ResolversTypes["CalendarEvent"],
    ParentType,
    ContextType,
    RequireFields<MutationRemoveDealContextFromEventArgs, "eventId">
  >;
  removeDealParticipant?: Resolver<
    ResolversTypes["Boolean"],
    ParentType,
    ContextType,
    RequireFields<MutationRemoveDealParticipantArgs, "dealId" | "personId">
  >;
  removeDocumentAttachment?: Resolver<
    ResolversTypes["Boolean"],
    ParentType,
    ContextType,
    RequireFields<MutationRemoveDocumentAttachmentArgs, "attachmentId">
  >;
  removeNoteDocumentAttachment?: Resolver<
    ResolversTypes["Boolean"],
    ParentType,
    ContextType,
    RequireFields<MutationRemoveNoteDocumentAttachmentArgs, "attachmentId">
  >;
  removeUserRole?: Resolver<
    ResolversTypes["User"],
    ParentType,
    ContextType,
    RequireFields<MutationRemoveUserRoleArgs, "roleName" | "userId">
  >;
  revokeGoogleIntegration?: Resolver<
    ResolversTypes["Boolean"],
    ParentType,
    ContextType
  >;
  scheduleDemoMeeting?: Resolver<
    ResolversTypes["CalendarEvent"],
    ParentType,
    ContextType,
    RequireFields<
      MutationScheduleDemoMeetingArgs,
      "attendeeEmails" | "dealId" | "duration" | "title"
    >
  >;
  scheduleFollowUpMeeting?: Resolver<
    ResolversTypes["CalendarEvent"],
    ParentType,
    ContextType,
    RequireFields<
      MutationScheduleFollowUpMeetingArgs,
      "dealId" | "duration" | "title"
    >
  >;
  sendAgentMessage?: Resolver<
    ResolversTypes["AgentResponse"],
    ParentType,
    ContextType,
    RequireFields<MutationSendAgentMessageArgs, "input">
  >;
  sendAgentV2Message?: Resolver<
    ResolversTypes["AgentV2Response"],
    ParentType,
    ContextType,
    RequireFields<MutationSendAgentV2MessageArgs, "input">
  >;
  sendAgentV2MessageStream?: Resolver<
    ResolversTypes["String"],
    ParentType,
    ContextType,
    RequireFields<MutationSendAgentV2MessageStreamArgs, "input">
  >;
  setExchangeRate?: Resolver<
    ResolversTypes["ExchangeRate"],
    ParentType,
    ContextType,
    RequireFields<MutationSetExchangeRateArgs, "input">
  >;
  setPrimaryOrganizationRole?: Resolver<
    ResolversTypes["PersonOrganizationRole"],
    ParentType,
    ContextType,
    RequireFields<MutationSetPrimaryOrganizationRoleArgs, "personId" | "roleId">
  >;
  shareDriveFolder?: Resolver<
    ResolversTypes["Boolean"],
    ParentType,
    ContextType,
    RequireFields<MutationShareDriveFolderArgs, "folderId" | "permissions">
  >;
  syncCalendarEvents?: Resolver<
    ResolversTypes["CalendarSyncStatus"],
    ParentType,
    ContextType,
    RequireFields<
      MutationSyncCalendarEventsArgs,
      "daysFuture" | "daysPast" | "fullSync"
    >
  >;
  syncGmailEmails?: Resolver<
    Array<ResolversTypes["Email"]>,
    ParentType,
    ContextType,
    RequireFields<MutationSyncGmailEmailsArgs, "entityId" | "entityType">
  >;
  toggleStickerPin?: Resolver<
    ResolversTypes["SmartSticker"],
    ParentType,
    ContextType,
    RequireFields<MutationToggleStickerPinArgs, "id">
  >;
  triggerTaskAutomation?: Resolver<
    Array<ResolversTypes["Task"]>,
    ParentType,
    ContextType,
    RequireFields<MutationTriggerTaskAutomationArgs, "event">
  >;
  unassignTask?: Resolver<
    ResolversTypes["Task"],
    ParentType,
    ContextType,
    RequireFields<MutationUnassignTaskArgs, "taskId">
  >;
  unpinEmail?: Resolver<
    ResolversTypes["Boolean"],
    ParentType,
    ContextType,
    RequireFields<MutationUnpinEmailArgs, "id">
  >;
  updateAgentConversation?: Resolver<
    ResolversTypes["AgentConversation"],
    ParentType,
    ContextType,
    RequireFields<MutationUpdateAgentConversationArgs, "input">
  >;
  updateAppSetting?: Resolver<
    ResolversTypes["AppSetting"],
    ParentType,
    ContextType,
    RequireFields<MutationUpdateAppSettingArgs, "input">
  >;
  updateBusinessRule?: Resolver<
    ResolversTypes["BusinessRule"],
    ParentType,
    ContextType,
    RequireFields<MutationUpdateBusinessRuleArgs, "id" | "input">
  >;
  updateCalendarEvent?: Resolver<
    ResolversTypes["CalendarEvent"],
    ParentType,
    ContextType,
    RequireFields<MutationUpdateCalendarEventArgs, "id" | "input">
  >;
  updateCalendarPreferences?: Resolver<
    ResolversTypes["CalendarPreferences"],
    ParentType,
    ContextType,
    RequireFields<MutationUpdateCalendarPreferencesArgs, "input">
  >;
  updateCurrency?: Resolver<
    ResolversTypes["Currency"],
    ParentType,
    ContextType,
    RequireFields<MutationUpdateCurrencyArgs, "code" | "input">
  >;
  updateCustomFieldDefinition?: Resolver<
    ResolversTypes["CustomFieldDefinition"],
    ParentType,
    ContextType,
    RequireFields<MutationUpdateCustomFieldDefinitionArgs, "id" | "input">
  >;
  updateDeal?: Resolver<
    Maybe<ResolversTypes["Deal"]>,
    ParentType,
    ContextType,
    RequireFields<MutationUpdateDealArgs, "id" | "input">
  >;
  updateDealCurrency?: Resolver<
    ResolversTypes["CurrencyOperationResult"],
    ParentType,
    ContextType,
    RequireFields<MutationUpdateDealCurrencyArgs, "currency" | "dealId">
  >;
  updateDealParticipantRole?: Resolver<
    ResolversTypes["DealParticipant"],
    ParentType,
    ContextType,
    RequireFields<
      MutationUpdateDealParticipantRoleArgs,
      "dealId" | "personId" | "role"
    >
  >;
  updateDealWFMProgress?: Resolver<
    ResolversTypes["Deal"],
    ParentType,
    ContextType,
    RequireFields<
      MutationUpdateDealWfmProgressArgs,
      "dealId" | "targetWfmWorkflowStepId"
    >
  >;
  updateDocumentAttachmentCategory?: Resolver<
    ResolversTypes["DealDocumentAttachment"],
    ParentType,
    ContextType,
    RequireFields<
      MutationUpdateDocumentAttachmentCategoryArgs,
      "attachmentId" | "category"
    >
  >;
  updateEmailPin?: Resolver<
    ResolversTypes["EmailPin"],
    ParentType,
    ContextType,
    RequireFields<MutationUpdateEmailPinArgs, "id" | "input">
  >;
  updateLead?: Resolver<
    Maybe<ResolversTypes["Lead"]>,
    ParentType,
    ContextType,
    RequireFields<MutationUpdateLeadArgs, "id" | "input">
  >;
  updateLeadCurrency?: Resolver<
    ResolversTypes["CurrencyOperationResult"],
    ParentType,
    ContextType,
    RequireFields<MutationUpdateLeadCurrencyArgs, "currency" | "leadId">
  >;
  updateLeadWFMProgress?: Resolver<
    ResolversTypes["Lead"],
    ParentType,
    ContextType,
    RequireFields<
      MutationUpdateLeadWfmProgressArgs,
      "leadId" | "targetWfmWorkflowStepId"
    >
  >;
  updateOrganization?: Resolver<
    Maybe<ResolversTypes["Organization"]>,
    ParentType,
    ContextType,
    RequireFields<MutationUpdateOrganizationArgs, "id" | "input">
  >;
  updatePerson?: Resolver<
    Maybe<ResolversTypes["Person"]>,
    ParentType,
    ContextType,
    RequireFields<MutationUpdatePersonArgs, "id" | "input">
  >;
  updatePersonOrganizationRole?: Resolver<
    ResolversTypes["PersonOrganizationRole"],
    ParentType,
    ContextType,
    RequireFields<MutationUpdatePersonOrganizationRoleArgs, "id" | "input">
  >;
  updateRatesFromECB?: Resolver<
    ResolversTypes["CurrencyOperationResult"],
    ParentType,
    ContextType
  >;
  updateReactivationPlan?: Resolver<
    ResolversTypes["ReactivationPlan"],
    ParentType,
    ContextType,
    RequireFields<MutationUpdateReactivationPlanArgs, "id" | "input">
  >;
  updateSticker?: Resolver<
    ResolversTypes["SmartSticker"],
    ParentType,
    ContextType,
    RequireFields<MutationUpdateStickerArgs, "input">
  >;
  updateStickerTags?: Resolver<
    ResolversTypes["SmartSticker"],
    ParentType,
    ContextType,
    RequireFields<
      MutationUpdateStickerTagsArgs,
      "id" | "tagsToAdd" | "tagsToRemove"
    >
  >;
  updateSystemNotification?: Resolver<
    ResolversTypes["SystemNotification"],
    ParentType,
    ContextType,
    RequireFields<MutationUpdateSystemNotificationArgs, "id" | "input">
  >;
  updateTask?: Resolver<
    ResolversTypes["Task"],
    ParentType,
    ContextType,
    RequireFields<MutationUpdateTaskArgs, "id" | "input">
  >;
  updateTaskAutomationRule?: Resolver<
    ResolversTypes["TaskAutomationRule"],
    ParentType,
    ContextType,
    RequireFields<MutationUpdateTaskAutomationRuleArgs, "id" | "input">
  >;
  updateUserCurrencyPreferences?: Resolver<
    ResolversTypes["UserCurrencyPreferences"],
    ParentType,
    ContextType,
    RequireFields<MutationUpdateUserCurrencyPreferencesArgs, "input" | "userId">
  >;
  updateUserProfile?: Resolver<
    Maybe<ResolversTypes["User"]>,
    ParentType,
    ContextType,
    RequireFields<MutationUpdateUserProfileArgs, "input">
  >;
  updateWFMProjectType?: Resolver<
    ResolversTypes["WFMProjectType"],
    ParentType,
    ContextType,
    RequireFields<MutationUpdateWfmProjectTypeArgs, "id" | "input">
  >;
  updateWFMStatus?: Resolver<
    ResolversTypes["WFMStatus"],
    ParentType,
    ContextType,
    RequireFields<MutationUpdateWfmStatusArgs, "id" | "input">
  >;
  updateWFMWorkflow?: Resolver<
    ResolversTypes["WFMWorkflow"],
    ParentType,
    ContextType,
    RequireFields<MutationUpdateWfmWorkflowArgs, "id" | "input">
  >;
  updateWFMWorkflowStep?: Resolver<
    ResolversTypes["WFMWorkflowStep"],
    ParentType,
    ContextType,
    RequireFields<MutationUpdateWfmWorkflowStepArgs, "id" | "input">
  >;
  updateWFMWorkflowStepsOrder?: Resolver<
    Maybe<ResolversTypes["WFMWorkflow"]>,
    ParentType,
    ContextType,
    RequireFields<
      MutationUpdateWfmWorkflowStepsOrderArgs,
      "orderedStepIds" | "workflowId"
    >
  >;
  updateWFMWorkflowTransition?: Resolver<
    ResolversTypes["WFMWorkflowTransition"],
    ParentType,
    ContextType,
    RequireFields<MutationUpdateWfmWorkflowTransitionArgs, "id" | "input">
  >;
  uploadFileToDrive?: Resolver<
    ResolversTypes["DriveFile"],
    ParentType,
    ContextType,
    RequireFields<MutationUploadFileToDriveArgs, "input">
  >;
  uploadToGoogleDrive?: Resolver<
    ResolversTypes["Document"],
    ParentType,
    ContextType,
    RequireFields<
      MutationUploadToGoogleDriveArgs,
      "entityId" | "entityType" | "fileContent" | "fileName" | "mimeType"
    >
  >;
};

export type NoteDocumentAttachmentResolvers<
  ContextType = GraphQLContext,
  ParentType extends
    ResolversParentTypes["NoteDocumentAttachment"] = ResolversParentTypes["NoteDocumentAttachment"],
> = {
  attachedAt?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  attachedBy?: Resolver<ResolversTypes["ID"], ParentType, ContextType>;
  fileName?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  fileSize?: Resolver<Maybe<ResolversTypes["Int"]>, ParentType, ContextType>;
  fileUrl?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  googleFileId?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  id?: Resolver<ResolversTypes["ID"], ParentType, ContextType>;
  mimeType?: Resolver<Maybe<ResolversTypes["String"]>, ParentType, ContextType>;
  noteId?: Resolver<ResolversTypes["ID"], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type NotificationSummaryResolvers<
  ContextType = GraphQLContext,
  ParentType extends
    ResolversParentTypes["NotificationSummary"] = ResolversParentTypes["NotificationSummary"],
> = {
  businessRuleCount?: Resolver<ResolversTypes["Int"], ParentType, ContextType>;
  highPriorityCount?: Resolver<ResolversTypes["Int"], ParentType, ContextType>;
  systemCount?: Resolver<ResolversTypes["Int"], ParentType, ContextType>;
  totalCount?: Resolver<ResolversTypes["Int"], ParentType, ContextType>;
  unreadCount?: Resolver<ResolversTypes["Int"], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type OrganizationResolvers<
  ContextType = GraphQLContext,
  ParentType extends
    ResolversParentTypes["Organization"] = ResolversParentTypes["Organization"],
> = {
  accountManager?: Resolver<
    Maybe<ResolversTypes["User"]>,
    ParentType,
    ContextType
  >;
  account_manager_id?: Resolver<
    Maybe<ResolversTypes["ID"]>,
    ParentType,
    ContextType
  >;
  activeDealCount?: Resolver<
    Maybe<ResolversTypes["Int"]>,
    ParentType,
    ContextType
  >;
  address?: Resolver<Maybe<ResolversTypes["String"]>, ParentType, ContextType>;
  created_at?: Resolver<ResolversTypes["DateTime"], ParentType, ContextType>;
  customFieldValues?: Resolver<
    Array<ResolversTypes["CustomFieldValue"]>,
    ParentType,
    ContextType
  >;
  deals?: Resolver<Array<ResolversTypes["Deal"]>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes["ID"], ParentType, ContextType>;
  name?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  notes?: Resolver<Maybe<ResolversTypes["String"]>, ParentType, ContextType>;
  people?: Resolver<
    Maybe<Array<ResolversTypes["Person"]>>,
    ParentType,
    ContextType
  >;
  totalDealValue?: Resolver<
    Maybe<ResolversTypes["Float"]>,
    ParentType,
    ContextType
  >;
  updated_at?: Resolver<ResolversTypes["DateTime"], ParentType, ContextType>;
  user_id?: Resolver<ResolversTypes["ID"], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type PersonResolvers<
  ContextType = GraphQLContext,
  ParentType extends
    ResolversParentTypes["Person"] = ResolversParentTypes["Person"],
> = {
  created_at?: Resolver<ResolversTypes["DateTime"], ParentType, ContextType>;
  customFieldValues?: Resolver<
    Array<ResolversTypes["CustomFieldValue"]>,
    ParentType,
    ContextType
  >;
  deals?: Resolver<Array<ResolversTypes["Deal"]>, ParentType, ContextType>;
  email?: Resolver<Maybe<ResolversTypes["String"]>, ParentType, ContextType>;
  first_name?: Resolver<
    Maybe<ResolversTypes["String"]>,
    ParentType,
    ContextType
  >;
  id?: Resolver<ResolversTypes["ID"], ParentType, ContextType>;
  last_name?: Resolver<
    Maybe<ResolversTypes["String"]>,
    ParentType,
    ContextType
  >;
  notes?: Resolver<Maybe<ResolversTypes["String"]>, ParentType, ContextType>;
  organization?: Resolver<
    Maybe<ResolversTypes["Organization"]>,
    ParentType,
    ContextType
  >;
  organizationRoles?: Resolver<
    Array<ResolversTypes["PersonOrganizationRole"]>,
    ParentType,
    ContextType
  >;
  organization_id?: Resolver<
    Maybe<ResolversTypes["ID"]>,
    ParentType,
    ContextType
  >;
  phone?: Resolver<Maybe<ResolversTypes["String"]>, ParentType, ContextType>;
  primaryOrganization?: Resolver<
    Maybe<ResolversTypes["Organization"]>,
    ParentType,
    ContextType
  >;
  primaryRole?: Resolver<
    Maybe<ResolversTypes["PersonOrganizationRole"]>,
    ParentType,
    ContextType
  >;
  updated_at?: Resolver<ResolversTypes["DateTime"], ParentType, ContextType>;
  user_id?: Resolver<ResolversTypes["ID"], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type PersonHistoryResolvers<
  ContextType = GraphQLContext,
  ParentType extends
    ResolversParentTypes["PersonHistory"] = ResolversParentTypes["PersonHistory"],
> = {
  created_at?: Resolver<ResolversTypes["DateTime"], ParentType, ContextType>;
  event_type?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  field_name?: Resolver<
    Maybe<ResolversTypes["String"]>,
    ParentType,
    ContextType
  >;
  id?: Resolver<ResolversTypes["ID"], ParentType, ContextType>;
  new_value?: Resolver<Maybe<ResolversTypes["JSON"]>, ParentType, ContextType>;
  old_value?: Resolver<Maybe<ResolversTypes["JSON"]>, ParentType, ContextType>;
  person?: Resolver<Maybe<ResolversTypes["Person"]>, ParentType, ContextType>;
  person_id?: Resolver<Maybe<ResolversTypes["ID"]>, ParentType, ContextType>;
  user_id?: Resolver<Maybe<ResolversTypes["ID"]>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type PersonListItemResolvers<
  ContextType = GraphQLContext,
  ParentType extends
    ResolversParentTypes["PersonListItem"] = ResolversParentTypes["PersonListItem"],
> = {
  id?: Resolver<ResolversTypes["ID"], ParentType, ContextType>;
  name?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type PersonOrganizationRoleResolvers<
  ContextType = GraphQLContext,
  ParentType extends
    ResolversParentTypes["PersonOrganizationRole"] = ResolversParentTypes["PersonOrganizationRole"],
> = {
  created_at?: Resolver<ResolversTypes["DateTime"], ParentType, ContextType>;
  created_by_user_id?: Resolver<
    Maybe<ResolversTypes["ID"]>,
    ParentType,
    ContextType
  >;
  department?: Resolver<
    Maybe<ResolversTypes["String"]>,
    ParentType,
    ContextType
  >;
  end_date?: Resolver<Maybe<ResolversTypes["Date"]>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes["ID"], ParentType, ContextType>;
  is_primary?: Resolver<ResolversTypes["Boolean"], ParentType, ContextType>;
  notes?: Resolver<Maybe<ResolversTypes["String"]>, ParentType, ContextType>;
  organization?: Resolver<
    ResolversTypes["Organization"],
    ParentType,
    ContextType
  >;
  organization_id?: Resolver<ResolversTypes["ID"], ParentType, ContextType>;
  person?: Resolver<ResolversTypes["Person"], ParentType, ContextType>;
  person_id?: Resolver<ResolversTypes["ID"], ParentType, ContextType>;
  role_title?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  start_date?: Resolver<Maybe<ResolversTypes["Date"]>, ParentType, ContextType>;
  status?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  updated_at?: Resolver<ResolversTypes["DateTime"], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type QueryResolvers<
  ContextType = GraphQLContext,
  ParentType extends
    ResolversParentTypes["Query"] = ResolversParentTypes["Query"],
> = {
  agentConversation?: Resolver<
    Maybe<ResolversTypes["AgentConversation"]>,
    ParentType,
    ContextType,
    RequireFields<QueryAgentConversationArgs, "id">
  >;
  agentConversations?: Resolver<
    Array<ResolversTypes["AgentConversation"]>,
    ParentType,
    ContextType,
    RequireFields<QueryAgentConversationsArgs, "limit" | "offset">
  >;
  agentThoughts?: Resolver<
    Array<ResolversTypes["AgentThought"]>,
    ParentType,
    ContextType,
    RequireFields<QueryAgentThoughtsArgs, "conversationId" | "limit">
  >;
  agentV2Conversations?: Resolver<
    Array<ResolversTypes["AgentConversation"]>,
    ParentType,
    ContextType,
    RequireFields<QueryAgentV2ConversationsArgs, "limit" | "offset">
  >;
  agentV2ThinkingAnalysis?: Resolver<
    ResolversTypes["ExtendedThinkingAnalysis"],
    ParentType,
    ContextType,
    RequireFields<QueryAgentV2ThinkingAnalysisArgs, "conversationId">
  >;
  agentV2Thoughts?: Resolver<
    Array<ResolversTypes["AgentThought"]>,
    ParentType,
    ContextType,
    RequireFields<QueryAgentV2ThoughtsArgs, "conversationId" | "limit">
  >;
  appSetting?: Resolver<
    Maybe<ResolversTypes["AppSetting"]>,
    ParentType,
    ContextType,
    RequireFields<QueryAppSettingArgs, "settingKey">
  >;
  appSettings?: Resolver<
    Array<ResolversTypes["AppSetting"]>,
    ParentType,
    ContextType
  >;
  assignableUsers?: Resolver<
    Array<ResolversTypes["User"]>,
    ParentType,
    ContextType
  >;
  businessRule?: Resolver<
    Maybe<ResolversTypes["BusinessRule"]>,
    ParentType,
    ContextType,
    RequireFields<QueryBusinessRuleArgs, "id">
  >;
  businessRuleAnalytics?: Resolver<
    ResolversTypes["BusinessRuleAnalytics"],
    ParentType,
    ContextType,
    Partial<QueryBusinessRuleAnalyticsArgs>
  >;
  businessRuleNotification?: Resolver<
    Maybe<ResolversTypes["BusinessRuleNotification"]>,
    ParentType,
    ContextType,
    RequireFields<QueryBusinessRuleNotificationArgs, "id">
  >;
  businessRuleNotifications?: Resolver<
    ResolversTypes["BusinessRuleNotificationsConnection"],
    ParentType,
    ContextType,
    RequireFields<QueryBusinessRuleNotificationsArgs, "first" | "unreadOnly">
  >;
  businessRules?: Resolver<
    ResolversTypes["BusinessRulesConnection"],
    ParentType,
    ContextType,
    RequireFields<QueryBusinessRulesArgs, "first">
  >;
  calendarEvent?: Resolver<
    Maybe<ResolversTypes["CalendarEvent"]>,
    ParentType,
    ContextType,
    RequireFields<QueryCalendarEventArgs, "id">
  >;
  calendarEvents?: Resolver<
    Array<ResolversTypes["CalendarEvent"]>,
    ParentType,
    ContextType,
    Partial<QueryCalendarEventsArgs>
  >;
  calendarPreferences?: Resolver<
    Maybe<ResolversTypes["CalendarPreferences"]>,
    ParentType,
    ContextType
  >;
  calendarSyncStatus?: Resolver<
    ResolversTypes["CalendarSyncStatus"],
    ParentType,
    ContextType
  >;
  checkAvailability?: Resolver<
    Array<ResolversTypes["AvailabilitySlot"]>,
    ParentType,
    ContextType,
    RequireFields<QueryCheckAvailabilityArgs, "timeRange">
  >;
  conversionHistory?: Resolver<
    Array<ResolversTypes["ConversionHistory"]>,
    ParentType,
    ContextType,
    RequireFields<QueryConversionHistoryArgs, "entityId" | "entityType">
  >;
  conversionHistoryById?: Resolver<
    Maybe<ResolversTypes["ConversionHistory"]>,
    ParentType,
    ContextType,
    RequireFields<QueryConversionHistoryByIdArgs, "id">
  >;
  currencies?: Resolver<
    Array<ResolversTypes["Currency"]>,
    ParentType,
    ContextType
  >;
  currency?: Resolver<
    Maybe<ResolversTypes["Currency"]>,
    ParentType,
    ContextType,
    RequireFields<QueryCurrencyArgs, "code">
  >;
  customFieldDefinition?: Resolver<
    Maybe<ResolversTypes["CustomFieldDefinition"]>,
    ParentType,
    ContextType,
    RequireFields<QueryCustomFieldDefinitionArgs, "id">
  >;
  customFieldDefinitions?: Resolver<
    Array<ResolversTypes["CustomFieldDefinition"]>,
    ParentType,
    ContextType,
    RequireFields<
      QueryCustomFieldDefinitionsArgs,
      "entityType" | "includeInactive"
    >
  >;
  deal?: Resolver<
    Maybe<ResolversTypes["Deal"]>,
    ParentType,
    ContextType,
    RequireFields<QueryDealArgs, "id">
  >;
  dealCalendarEvents?: Resolver<
    Array<ResolversTypes["CalendarEvent"]>,
    ParentType,
    ContextType,
    RequireFields<QueryDealCalendarEventsArgs, "dealId">
  >;
  dealFolderFiles?: Resolver<
    Array<ResolversTypes["DriveFile"]>,
    ParentType,
    ContextType,
    RequireFields<QueryDealFolderFilesArgs, "dealId">
  >;
  dealFolderInfo?: Resolver<
    ResolversTypes["DealFolderInfo"],
    ParentType,
    ContextType,
    RequireFields<QueryDealFolderInfoArgs, "dealId">
  >;
  dealTaskIndicators?: Resolver<
    Array<ResolversTypes["DealTaskIndicator"]>,
    ParentType,
    ContextType,
    RequireFields<QueryDealTaskIndicatorsArgs, "dealIds">
  >;
  deals?: Resolver<Array<ResolversTypes["Deal"]>, ParentType, ContextType>;
  dealsByCurrency?: Resolver<
    Array<ResolversTypes["DealsByCurrencyResult"]>,
    ParentType,
    ContextType
  >;
  discoverAgentTools?: Resolver<
    ResolversTypes["ToolDiscoveryResponse"],
    ParentType,
    ContextType
  >;
  exchangeRate?: Resolver<
    Maybe<ResolversTypes["ExchangeRate"]>,
    ParentType,
    ContextType,
    RequireFields<QueryExchangeRateArgs, "fromCurrency" | "toCurrency">
  >;
  exchangeRates?: Resolver<
    Array<ResolversTypes["ExchangeRate"]>,
    ParentType,
    ContextType
  >;
  getDealDocumentAttachments?: Resolver<
    Array<ResolversTypes["DealDocumentAttachment"]>,
    ParentType,
    ContextType,
    RequireFields<QueryGetDealDocumentAttachmentsArgs, "dealId">
  >;
  getDealDocuments?: Resolver<
    Array<ResolversTypes["DealDocumentAttachment"]>,
    ParentType,
    ContextType,
    RequireFields<QueryGetDealDocumentsArgs, "dealId">
  >;
  getDealFolder?: Resolver<
    Maybe<ResolversTypes["DriveFolder"]>,
    ParentType,
    ContextType,
    RequireFields<QueryGetDealFolderArgs, "dealId">
  >;
  getDealParticipants?: Resolver<
    Array<ResolversTypes["DealParticipant"]>,
    ParentType,
    ContextType,
    RequireFields<QueryGetDealParticipantsArgs, "dealId">
  >;
  getDriveFile?: Resolver<
    ResolversTypes["DriveFile"],
    ParentType,
    ContextType,
    RequireFields<QueryGetDriveFileArgs, "fileId">
  >;
  getDriveFiles?: Resolver<
    ResolversTypes["DriveFileConnection"],
    ParentType,
    ContextType,
    RequireFields<QueryGetDriveFilesArgs, "input">
  >;
  getDriveFolders?: Resolver<
    ResolversTypes["DriveFolderConnection"],
    ParentType,
    ContextType,
    RequireFields<QueryGetDriveFoldersArgs, "input">
  >;
  getEmailAnalytics?: Resolver<
    Maybe<ResolversTypes["EmailAnalytics"]>,
    ParentType,
    ContextType,
    RequireFields<QueryGetEmailAnalyticsArgs, "dealId">
  >;
  getEmailMessage?: Resolver<
    Maybe<ResolversTypes["EmailMessage"]>,
    ParentType,
    ContextType,
    RequireFields<QueryGetEmailMessageArgs, "messageId">
  >;
  getEmailPin?: Resolver<
    Maybe<ResolversTypes["EmailPin"]>,
    ParentType,
    ContextType,
    RequireFields<QueryGetEmailPinArgs, "id">
  >;
  getEmailThread?: Resolver<
    Maybe<ResolversTypes["EmailThread"]>,
    ParentType,
    ContextType,
    RequireFields<QueryGetEmailThreadArgs, "threadId">
  >;
  getEmailThreads?: Resolver<
    ResolversTypes["EmailThreadConnection"],
    ParentType,
    ContextType,
    RequireFields<QueryGetEmailThreadsArgs, "filter">
  >;
  getEntityDocuments?: Resolver<
    Array<ResolversTypes["Document"]>,
    ParentType,
    ContextType,
    RequireFields<QueryGetEntityDocumentsArgs, "entityId" | "entityType">
  >;
  getEntityEmails?: Resolver<
    Array<ResolversTypes["Email"]>,
    ParentType,
    ContextType,
    RequireFields<QueryGetEntityEmailsArgs, "entityId" | "entityType">
  >;
  getEntityStickers?: Resolver<
    ResolversTypes["StickerConnection"],
    ParentType,
    ContextType,
    RequireFields<
      QueryGetEntityStickersArgs,
      "entityId" | "entityType" | "first"
    >
  >;
  getNoteDocumentAttachments?: Resolver<
    Array<ResolversTypes["NoteDocumentAttachment"]>,
    ParentType,
    ContextType,
    RequireFields<QueryGetNoteDocumentAttachmentsArgs, "noteId">
  >;
  getPinnedEmails?: Resolver<
    Array<ResolversTypes["EmailPin"]>,
    ParentType,
    ContextType,
    RequireFields<QueryGetPinnedEmailsArgs, "dealId">
  >;
  getPinnedStickers?: Resolver<
    ResolversTypes["StickerConnection"],
    ParentType,
    ContextType,
    RequireFields<QueryGetPinnedStickersArgs, "first">
  >;
  getRecentDriveFiles?: Resolver<
    ResolversTypes["DriveFileConnection"],
    ParentType,
    ContextType,
    RequireFields<QueryGetRecentDriveFilesArgs, "limit">
  >;
  getRecentSharedDriveFiles?: Resolver<
    Array<ResolversTypes["DriveFile"]>,
    ParentType,
    ContextType,
    RequireFields<QueryGetRecentSharedDriveFilesArgs, "limit">
  >;
  getSharedDriveFiles?: Resolver<
    Array<ResolversTypes["DriveFile"]>,
    ParentType,
    ContextType,
    RequireFields<QueryGetSharedDriveFilesArgs, "sharedDriveId">
  >;
  getSharedDriveFolders?: Resolver<
    Array<ResolversTypes["DriveFolder"]>,
    ParentType,
    ContextType,
    RequireFields<QueryGetSharedDriveFoldersArgs, "sharedDriveId">
  >;
  getSharedDrives?: Resolver<
    Array<ResolversTypes["SharedDrive"]>,
    ParentType,
    ContextType
  >;
  getSticker?: Resolver<
    Maybe<ResolversTypes["SmartSticker"]>,
    ParentType,
    ContextType,
    RequireFields<QueryGetStickerArgs, "id">
  >;
  getStickerCategories?: Resolver<
    Array<ResolversTypes["StickerCategory"]>,
    ParentType,
    ContextType
  >;
  getWfmAllowedTransitions?: Resolver<
    Array<ResolversTypes["WFMWorkflowTransition"]>,
    ParentType,
    ContextType,
    RequireFields<
      QueryGetWfmAllowedTransitionsArgs,
      "fromStepId" | "workflowId"
    >
  >;
  googleCalendars?: Resolver<
    Array<ResolversTypes["GoogleCalendar"]>,
    ParentType,
    ContextType
  >;
  googleDriveSettings?: Resolver<
    ResolversTypes["GoogleDriveConfig"],
    ParentType,
    ContextType
  >;
  googleIntegrationStatus?: Resolver<
    ResolversTypes["GoogleIntegrationStatus"],
    ParentType,
    ContextType
  >;
  health?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  lead?: Resolver<
    Maybe<ResolversTypes["Lead"]>,
    ParentType,
    ContextType,
    RequireFields<QueryLeadArgs, "id">
  >;
  leads?: Resolver<
    Array<ResolversTypes["Lead"]>,
    ParentType,
    ContextType,
    Partial<QueryLeadsArgs>
  >;
  leadsStats?: Resolver<ResolversTypes["LeadsStats"], ParentType, ContextType>;
  me?: Resolver<Maybe<ResolversTypes["User"]>, ParentType, ContextType>;
  myAccountPortfolioStats?: Resolver<
    ResolversTypes["AccountPortfolioStats"],
    ParentType,
    ContextType
  >;
  myAccounts?: Resolver<
    Array<ResolversTypes["Organization"]>,
    ParentType,
    ContextType
  >;
  myAssignedTasks?: Resolver<
    Array<ResolversTypes["Task"]>,
    ParentType,
    ContextType,
    Partial<QueryMyAssignedTasksArgs>
  >;
  myOverdueTasks?: Resolver<
    Array<ResolversTypes["Task"]>,
    ParentType,
    ContextType
  >;
  myPermissions?: Resolver<
    Maybe<Array<ResolversTypes["String"]>>,
    ParentType,
    ContextType
  >;
  myTasks?: Resolver<
    Array<ResolversTypes["Task"]>,
    ParentType,
    ContextType,
    Partial<QueryMyTasksArgs>
  >;
  myTasksDueThisWeek?: Resolver<
    Array<ResolversTypes["Task"]>,
    ParentType,
    ContextType
  >;
  myTasksDueToday?: Resolver<
    Array<ResolversTypes["Task"]>,
    ParentType,
    ContextType
  >;
  notificationSummary?: Resolver<
    ResolversTypes["NotificationSummary"],
    ParentType,
    ContextType
  >;
  organization?: Resolver<
    Maybe<ResolversTypes["Organization"]>,
    ParentType,
    ContextType,
    RequireFields<QueryOrganizationArgs, "id">
  >;
  organizations?: Resolver<
    Array<ResolversTypes["Organization"]>,
    ParentType,
    ContextType
  >;
  people?: Resolver<Array<ResolversTypes["Person"]>, ParentType, ContextType>;
  peopleByOrganization?: Resolver<
    Array<ResolversTypes["Person"]>,
    ParentType,
    ContextType,
    RequireFields<
      QueryPeopleByOrganizationArgs,
      "includeFormerEmployees" | "organizationId"
    >
  >;
  person?: Resolver<
    Maybe<ResolversTypes["Person"]>,
    ParentType,
    ContextType,
    RequireFields<QueryPersonArgs, "id">
  >;
  personHistory?: Resolver<
    Array<ResolversTypes["PersonHistory"]>,
    ParentType,
    ContextType,
    RequireFields<QueryPersonHistoryArgs, "personId">
  >;
  personList?: Resolver<
    Array<ResolversTypes["PersonListItem"]>,
    ParentType,
    ContextType
  >;
  personOrganizationRoles?: Resolver<
    Array<ResolversTypes["PersonOrganizationRole"]>,
    ParentType,
    ContextType,
    RequireFields<QueryPersonOrganizationRolesArgs, "personId">
  >;
  previewRuleExecution?: Resolver<
    ResolversTypes["BusinessRuleExecutionResult"],
    ParentType,
    ContextType,
    RequireFields<
      QueryPreviewRuleExecutionArgs,
      "entityId" | "entityType" | "ruleId"
    >
  >;
  reactivationPlan?: Resolver<
    Maybe<ResolversTypes["ReactivationPlan"]>,
    ParentType,
    ContextType,
    RequireFields<QueryReactivationPlanArgs, "id">
  >;
  reactivationPlans?: Resolver<
    Array<ResolversTypes["ReactivationPlan"]>,
    ParentType,
    ContextType,
    Partial<QueryReactivationPlansArgs>
  >;
  roles?: Resolver<Array<ResolversTypes["Role"]>, ParentType, ContextType>;
  ruleExecution?: Resolver<
    Maybe<ResolversTypes["RuleExecution"]>,
    ParentType,
    ContextType,
    RequireFields<QueryRuleExecutionArgs, "id">
  >;
  ruleExecutions?: Resolver<
    ResolversTypes["RuleExecutionsConnection"],
    ParentType,
    ContextType,
    RequireFields<QueryRuleExecutionsArgs, "first">
  >;
  searchDriveFiles?: Resolver<
    ResolversTypes["DriveFileConnection"],
    ParentType,
    ContextType,
    RequireFields<QuerySearchDriveFilesArgs, "query">
  >;
  searchEmails?: Resolver<
    Array<ResolversTypes["Email"]>,
    ParentType,
    ContextType,
    RequireFields<QuerySearchEmailsArgs, "limit" | "query">
  >;
  searchGoogleContacts?: Resolver<
    Array<ResolversTypes["ContactSuggestion"]>,
    ParentType,
    ContextType,
    RequireFields<QuerySearchGoogleContactsArgs, "query">
  >;
  searchSharedDriveFiles?: Resolver<
    Array<ResolversTypes["DriveFile"]>,
    ParentType,
    ContextType,
    RequireFields<QuerySearchSharedDriveFilesArgs, "query">
  >;
  searchStickers?: Resolver<
    ResolversTypes["StickerConnection"],
    ParentType,
    ContextType,
    RequireFields<QuerySearchStickersArgs, "filters" | "first">
  >;
  suggestEmailParticipants?: Resolver<
    Array<ResolversTypes["Person"]>,
    ParentType,
    ContextType,
    RequireFields<QuerySuggestEmailParticipantsArgs, "dealId">
  >;
  supabaseConnectionTest?: Resolver<
    ResolversTypes["String"],
    ParentType,
    ContextType
  >;
  systemNotification?: Resolver<
    Maybe<ResolversTypes["SystemNotification"]>,
    ParentType,
    ContextType,
    RequireFields<QuerySystemNotificationArgs, "id">
  >;
  systemNotifications?: Resolver<
    ResolversTypes["SystemNotificationsConnection"],
    ParentType,
    ContextType,
    RequireFields<QuerySystemNotificationsArgs, "first">
  >;
  task?: Resolver<
    Maybe<ResolversTypes["Task"]>,
    ParentType,
    ContextType,
    RequireFields<QueryTaskArgs, "id">
  >;
  taskAutomationRule?: Resolver<
    Maybe<ResolversTypes["TaskAutomationRule"]>,
    ParentType,
    ContextType,
    RequireFields<QueryTaskAutomationRuleArgs, "id">
  >;
  taskAutomationRules?: Resolver<
    Array<ResolversTypes["TaskAutomationRule"]>,
    ParentType,
    ContextType,
    Partial<QueryTaskAutomationRulesArgs>
  >;
  taskDependencies?: Resolver<
    Array<ResolversTypes["TaskDependency"]>,
    ParentType,
    ContextType,
    RequireFields<QueryTaskDependenciesArgs, "taskId">
  >;
  taskHistory?: Resolver<
    Array<ResolversTypes["TaskHistory"]>,
    ParentType,
    ContextType,
    RequireFields<QueryTaskHistoryArgs, "taskId">
  >;
  taskStats?: Resolver<
    ResolversTypes["TaskStats"],
    ParentType,
    ContextType,
    Partial<QueryTaskStatsArgs>
  >;
  tasks?: Resolver<
    Array<ResolversTypes["Task"]>,
    ParentType,
    ContextType,
    RequireFields<QueryTasksArgs, "limit" | "offset">
  >;
  tasksForDeal?: Resolver<
    Array<ResolversTypes["Task"]>,
    ParentType,
    ContextType,
    RequireFields<QueryTasksForDealArgs, "dealId">
  >;
  tasksForLead?: Resolver<
    Array<ResolversTypes["Task"]>,
    ParentType,
    ContextType,
    RequireFields<QueryTasksForLeadArgs, "leadId">
  >;
  tasksForOrganization?: Resolver<
    Array<ResolversTypes["Task"]>,
    ParentType,
    ContextType,
    RequireFields<QueryTasksForOrganizationArgs, "organizationId">
  >;
  tasksForPerson?: Resolver<
    Array<ResolversTypes["Task"]>,
    ParentType,
    ContextType,
    RequireFields<QueryTasksForPersonArgs, "personId">
  >;
  tasksForUser?: Resolver<
    Array<ResolversTypes["Task"]>,
    ParentType,
    ContextType,
    RequireFields<QueryTasksForUserArgs, "userId">
  >;
  unifiedNotifications?: Resolver<
    ResolversTypes["UnifiedNotificationsConnection"],
    ParentType,
    ContextType,
    RequireFields<QueryUnifiedNotificationsArgs, "first">
  >;
  unreadNotificationCount?: Resolver<
    ResolversTypes["Int"],
    ParentType,
    ContextType
  >;
  upcomingMeetings?: Resolver<
    Array<ResolversTypes["CalendarEvent"]>,
    ParentType,
    ContextType,
    RequireFields<QueryUpcomingMeetingsArgs, "days" | "limit">
  >;
  userCurrencyPreferences?: Resolver<
    Maybe<ResolversTypes["UserCurrencyPreferences"]>,
    ParentType,
    ContextType,
    RequireFields<QueryUserCurrencyPreferencesArgs, "userId">
  >;
  users?: Resolver<Array<ResolversTypes["User"]>, ParentType, ContextType>;
  validateBusinessRule?: Resolver<
    Array<ResolversTypes["String"]>,
    ParentType,
    ContextType,
    RequireFields<QueryValidateBusinessRuleArgs, "input">
  >;
  validateConversion?: Resolver<
    ResolversTypes["ConversionValidationResult"],
    ParentType,
    ContextType,
    RequireFields<
      QueryValidateConversionArgs,
      "sourceId" | "sourceType" | "targetType"
    >
  >;
  wfmProjectType?: Resolver<
    Maybe<ResolversTypes["WFMProjectType"]>,
    ParentType,
    ContextType,
    RequireFields<QueryWfmProjectTypeArgs, "id">
  >;
  wfmProjectTypeByName?: Resolver<
    Maybe<ResolversTypes["WFMProjectType"]>,
    ParentType,
    ContextType,
    RequireFields<QueryWfmProjectTypeByNameArgs, "name">
  >;
  wfmProjectTypes?: Resolver<
    Array<ResolversTypes["WFMProjectType"]>,
    ParentType,
    ContextType,
    RequireFields<QueryWfmProjectTypesArgs, "isArchived">
  >;
  wfmStatus?: Resolver<
    Maybe<ResolversTypes["WFMStatus"]>,
    ParentType,
    ContextType,
    RequireFields<QueryWfmStatusArgs, "id">
  >;
  wfmStatuses?: Resolver<
    Array<ResolversTypes["WFMStatus"]>,
    ParentType,
    ContextType,
    RequireFields<QueryWfmStatusesArgs, "isArchived">
  >;
  wfmWorkflow?: Resolver<
    Maybe<ResolversTypes["WFMWorkflow"]>,
    ParentType,
    ContextType,
    RequireFields<QueryWfmWorkflowArgs, "id">
  >;
  wfmWorkflows?: Resolver<
    Array<ResolversTypes["WFMWorkflow"]>,
    ParentType,
    ContextType,
    RequireFields<QueryWfmWorkflowsArgs, "isArchived">
  >;
};

export type ReactivationPlanResolvers<
  ContextType = GraphQLContext,
  ParentType extends
    ResolversParentTypes["ReactivationPlan"] = ResolversParentTypes["ReactivationPlan"],
> = {
  assignedToUser?: Resolver<
    Maybe<ResolversTypes["User"]>,
    ParentType,
    ContextType
  >;
  createdAt?: Resolver<ResolversTypes["DateTime"], ParentType, ContextType>;
  createdByUser?: Resolver<
    Maybe<ResolversTypes["User"]>,
    ParentType,
    ContextType
  >;
  followUpActivities?: Resolver<
    Maybe<ResolversTypes["JSON"]>,
    ParentType,
    ContextType
  >;
  id?: Resolver<ResolversTypes["ID"], ParentType, ContextType>;
  lead?: Resolver<ResolversTypes["Lead"], ParentType, ContextType>;
  notes?: Resolver<Maybe<ResolversTypes["String"]>, ParentType, ContextType>;
  originalDeal?: Resolver<
    Maybe<ResolversTypes["Deal"]>,
    ParentType,
    ContextType
  >;
  reactivationStrategy?: Resolver<
    ResolversTypes["ReactivationStrategy"],
    ParentType,
    ContextType
  >;
  status?: Resolver<
    ResolversTypes["ReactivationPlanStatus"],
    ParentType,
    ContextType
  >;
  targetReactivationDate?: Resolver<
    Maybe<ResolversTypes["DateTime"]>,
    ParentType,
    ContextType
  >;
  updatedAt?: Resolver<ResolversTypes["DateTime"], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type RoleResolvers<
  ContextType = GraphQLContext,
  ParentType extends
    ResolversParentTypes["Role"] = ResolversParentTypes["Role"],
> = {
  description?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  id?: Resolver<ResolversTypes["ID"], ParentType, ContextType>;
  name?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type RuleActionResolvers<
  ContextType = GraphQLContext,
  ParentType extends
    ResolversParentTypes["RuleAction"] = ResolversParentTypes["RuleAction"],
> = {
  message?: Resolver<Maybe<ResolversTypes["String"]>, ParentType, ContextType>;
  metadata?: Resolver<Maybe<ResolversTypes["JSON"]>, ParentType, ContextType>;
  priority?: Resolver<ResolversTypes["Int"], ParentType, ContextType>;
  target?: Resolver<Maybe<ResolversTypes["String"]>, ParentType, ContextType>;
  template?: Resolver<Maybe<ResolversTypes["String"]>, ParentType, ContextType>;
  type?: Resolver<ResolversTypes["RuleActionType"], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type RuleConditionResolvers<
  ContextType = GraphQLContext,
  ParentType extends
    ResolversParentTypes["RuleCondition"] = ResolversParentTypes["RuleCondition"],
> = {
  field?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  logicalOperator?: Resolver<
    ResolversTypes["LogicalOperator"],
    ParentType,
    ContextType
  >;
  operator?: Resolver<
    ResolversTypes["RuleConditionOperator"],
    ParentType,
    ContextType
  >;
  value?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type RuleExecutionResolvers<
  ContextType = GraphQLContext,
  ParentType extends
    ResolversParentTypes["RuleExecution"] = ResolversParentTypes["RuleExecution"],
> = {
  activitiesCreated?: Resolver<ResolversTypes["Int"], ParentType, ContextType>;
  conditionsMet?: Resolver<ResolversTypes["Boolean"], ParentType, ContextType>;
  entityId?: Resolver<ResolversTypes["ID"], ParentType, ContextType>;
  entityType?: Resolver<
    ResolversTypes["EntityTypeEnum"],
    ParentType,
    ContextType
  >;
  errors?: Resolver<Array<ResolversTypes["String"]>, ParentType, ContextType>;
  executedAt?: Resolver<ResolversTypes["DateTime"], ParentType, ContextType>;
  executionResult?: Resolver<ResolversTypes["JSON"], ParentType, ContextType>;
  executionTimeMs?: Resolver<
    Maybe<ResolversTypes["Int"]>,
    ParentType,
    ContextType
  >;
  executionTrigger?: Resolver<
    ResolversTypes["String"],
    ParentType,
    ContextType
  >;
  id?: Resolver<ResolversTypes["ID"], ParentType, ContextType>;
  notificationsCreated?: Resolver<
    ResolversTypes["Int"],
    ParentType,
    ContextType
  >;
  rule?: Resolver<ResolversTypes["BusinessRule"], ParentType, ContextType>;
  tasksCreated?: Resolver<ResolversTypes["Int"], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type RuleExecutionsConnectionResolvers<
  ContextType = GraphQLContext,
  ParentType extends
    ResolversParentTypes["RuleExecutionsConnection"] = ResolversParentTypes["RuleExecutionsConnection"],
> = {
  hasNextPage?: Resolver<ResolversTypes["Boolean"], ParentType, ContextType>;
  hasPreviousPage?: Resolver<
    ResolversTypes["Boolean"],
    ParentType,
    ContextType
  >;
  nodes?: Resolver<
    Array<ResolversTypes["RuleExecution"]>,
    ParentType,
    ContextType
  >;
  totalCount?: Resolver<ResolversTypes["Int"], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type SharedDriveResolvers<
  ContextType = GraphQLContext,
  ParentType extends
    ResolversParentTypes["SharedDrive"] = ResolversParentTypes["SharedDrive"],
> = {
  backgroundImageFile?: Resolver<
    Maybe<ResolversTypes["SharedDriveImage"]>,
    ParentType,
    ContextType
  >;
  capabilities?: Resolver<
    Maybe<ResolversTypes["SharedDriveCapabilities"]>,
    ParentType,
    ContextType
  >;
  colorRgb?: Resolver<Maybe<ResolversTypes["String"]>, ParentType, ContextType>;
  createdTime?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  id?: Resolver<ResolversTypes["ID"], ParentType, ContextType>;
  name?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  restrictions?: Resolver<
    Maybe<ResolversTypes["SharedDriveRestrictions"]>,
    ParentType,
    ContextType
  >;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type SharedDriveCapabilitiesResolvers<
  ContextType = GraphQLContext,
  ParentType extends
    ResolversParentTypes["SharedDriveCapabilities"] = ResolversParentTypes["SharedDriveCapabilities"],
> = {
  canAddChildren?: Resolver<
    Maybe<ResolversTypes["Boolean"]>,
    ParentType,
    ContextType
  >;
  canComment?: Resolver<
    Maybe<ResolversTypes["Boolean"]>,
    ParentType,
    ContextType
  >;
  canCopy?: Resolver<Maybe<ResolversTypes["Boolean"]>, ParentType, ContextType>;
  canDeleteDrive?: Resolver<
    Maybe<ResolversTypes["Boolean"]>,
    ParentType,
    ContextType
  >;
  canDownload?: Resolver<
    Maybe<ResolversTypes["Boolean"]>,
    ParentType,
    ContextType
  >;
  canEdit?: Resolver<Maybe<ResolversTypes["Boolean"]>, ParentType, ContextType>;
  canListChildren?: Resolver<
    Maybe<ResolversTypes["Boolean"]>,
    ParentType,
    ContextType
  >;
  canManageMembers?: Resolver<
    Maybe<ResolversTypes["Boolean"]>,
    ParentType,
    ContextType
  >;
  canReadRevisions?: Resolver<
    Maybe<ResolversTypes["Boolean"]>,
    ParentType,
    ContextType
  >;
  canRename?: Resolver<
    Maybe<ResolversTypes["Boolean"]>,
    ParentType,
    ContextType
  >;
  canRenameDrive?: Resolver<
    Maybe<ResolversTypes["Boolean"]>,
    ParentType,
    ContextType
  >;
  canShare?: Resolver<
    Maybe<ResolversTypes["Boolean"]>,
    ParentType,
    ContextType
  >;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type SharedDriveImageResolvers<
  ContextType = GraphQLContext,
  ParentType extends
    ResolversParentTypes["SharedDriveImage"] = ResolversParentTypes["SharedDriveImage"],
> = {
  id?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  webViewLink?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type SharedDriveRestrictionsResolvers<
  ContextType = GraphQLContext,
  ParentType extends
    ResolversParentTypes["SharedDriveRestrictions"] = ResolversParentTypes["SharedDriveRestrictions"],
> = {
  adminManagedRestrictions?: Resolver<
    Maybe<ResolversTypes["Boolean"]>,
    ParentType,
    ContextType
  >;
  copyRequiresWriterPermission?: Resolver<
    Maybe<ResolversTypes["Boolean"]>,
    ParentType,
    ContextType
  >;
  domainUsersOnly?: Resolver<
    Maybe<ResolversTypes["Boolean"]>,
    ParentType,
    ContextType
  >;
  driveMembersOnly?: Resolver<
    Maybe<ResolversTypes["Boolean"]>,
    ParentType,
    ContextType
  >;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type SmartStickerResolvers<
  ContextType = GraphQLContext,
  ParentType extends
    ResolversParentTypes["SmartSticker"] = ResolversParentTypes["SmartSticker"],
> = {
  category?: Resolver<
    Maybe<ResolversTypes["StickerCategory"]>,
    ParentType,
    ContextType
  >;
  color?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  content?: Resolver<Maybe<ResolversTypes["String"]>, ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes["DateTime"], ParentType, ContextType>;
  createdBy?: Resolver<Maybe<ResolversTypes["User"]>, ParentType, ContextType>;
  createdByUserId?: Resolver<ResolversTypes["ID"], ParentType, ContextType>;
  entityId?: Resolver<ResolversTypes["ID"], ParentType, ContextType>;
  entityType?: Resolver<ResolversTypes["EntityType"], ParentType, ContextType>;
  height?: Resolver<ResolversTypes["Int"], ParentType, ContextType>;
  id?: Resolver<ResolversTypes["ID"], ParentType, ContextType>;
  isPinned?: Resolver<ResolversTypes["Boolean"], ParentType, ContextType>;
  isPrivate?: Resolver<ResolversTypes["Boolean"], ParentType, ContextType>;
  lastEditedAt?: Resolver<
    Maybe<ResolversTypes["DateTime"]>,
    ParentType,
    ContextType
  >;
  lastEditedBy?: Resolver<
    Maybe<ResolversTypes["User"]>,
    ParentType,
    ContextType
  >;
  lastEditedByUserId?: Resolver<
    Maybe<ResolversTypes["ID"]>,
    ParentType,
    ContextType
  >;
  mentions?: Resolver<Array<ResolversTypes["ID"]>, ParentType, ContextType>;
  positionX?: Resolver<ResolversTypes["Int"], ParentType, ContextType>;
  positionY?: Resolver<ResolversTypes["Int"], ParentType, ContextType>;
  priority?: Resolver<
    ResolversTypes["StickerPriority"],
    ParentType,
    ContextType
  >;
  tags?: Resolver<Array<ResolversTypes["String"]>, ParentType, ContextType>;
  title?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes["DateTime"], ParentType, ContextType>;
  width?: Resolver<ResolversTypes["Int"], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type StickerCategoryResolvers<
  ContextType = GraphQLContext,
  ParentType extends
    ResolversParentTypes["StickerCategory"] = ResolversParentTypes["StickerCategory"],
> = {
  color?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes["DateTime"], ParentType, ContextType>;
  description?: Resolver<
    Maybe<ResolversTypes["String"]>,
    ParentType,
    ContextType
  >;
  displayOrder?: Resolver<ResolversTypes["Int"], ParentType, ContextType>;
  icon?: Resolver<Maybe<ResolversTypes["String"]>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes["ID"], ParentType, ContextType>;
  isSystem?: Resolver<ResolversTypes["Boolean"], ParentType, ContextType>;
  name?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes["DateTime"], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type StickerConnectionResolvers<
  ContextType = GraphQLContext,
  ParentType extends
    ResolversParentTypes["StickerConnection"] = ResolversParentTypes["StickerConnection"],
> = {
  hasNextPage?: Resolver<ResolversTypes["Boolean"], ParentType, ContextType>;
  hasPreviousPage?: Resolver<
    ResolversTypes["Boolean"],
    ParentType,
    ContextType
  >;
  nodes?: Resolver<
    Array<ResolversTypes["SmartSticker"]>,
    ParentType,
    ContextType
  >;
  totalCount?: Resolver<ResolversTypes["Int"], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type SubscriptionResolvers<
  ContextType = GraphQLContext,
  ParentType extends
    ResolversParentTypes["Subscription"] = ResolversParentTypes["Subscription"],
> = {
  agentConversationUpdated?: SubscriptionResolver<
    ResolversTypes["AgentConversation"],
    "agentConversationUpdated",
    ParentType,
    ContextType,
    RequireFields<SubscriptionAgentConversationUpdatedArgs, "conversationId">
  >;
  agentPlanUpdated?: SubscriptionResolver<
    ResolversTypes["AgentPlan"],
    "agentPlanUpdated",
    ParentType,
    ContextType,
    RequireFields<SubscriptionAgentPlanUpdatedArgs, "conversationId">
  >;
  agentThoughtsAdded?: SubscriptionResolver<
    Array<ResolversTypes["AgentThought"]>,
    "agentThoughtsAdded",
    ParentType,
    ContextType,
    RequireFields<SubscriptionAgentThoughtsAddedArgs, "conversationId">
  >;
  agentV2MessageStream?: SubscriptionResolver<
    ResolversTypes["AgentV2StreamChunk"],
    "agentV2MessageStream",
    ParentType,
    ContextType,
    RequireFields<SubscriptionAgentV2MessageStreamArgs, "conversationId">
  >;
  agentV2ReflectionAdded?: SubscriptionResolver<
    ResolversTypes["AgentThought"],
    "agentV2ReflectionAdded",
    ParentType,
    ContextType,
    RequireFields<SubscriptionAgentV2ReflectionAddedArgs, "conversationId">
  >;
  agentV2ThinkingUpdated?: SubscriptionResolver<
    Array<ResolversTypes["AgentThought"]>,
    "agentV2ThinkingUpdated",
    ParentType,
    ContextType,
    RequireFields<SubscriptionAgentV2ThinkingUpdatedArgs, "conversationId">
  >;
  dealTasksUpdated?: SubscriptionResolver<
    ResolversTypes["Task"],
    "dealTasksUpdated",
    ParentType,
    ContextType,
    RequireFields<SubscriptionDealTasksUpdatedArgs, "dealId">
  >;
  leadTasksUpdated?: SubscriptionResolver<
    ResolversTypes["Task"],
    "leadTasksUpdated",
    ParentType,
    ContextType,
    RequireFields<SubscriptionLeadTasksUpdatedArgs, "leadId">
  >;
  myTasksUpdated?: SubscriptionResolver<
    ResolversTypes["Task"],
    "myTasksUpdated",
    ParentType,
    ContextType
  >;
  taskCompleted?: SubscriptionResolver<
    ResolversTypes["Task"],
    "taskCompleted",
    ParentType,
    ContextType,
    Partial<SubscriptionTaskCompletedArgs>
  >;
  taskUpdated?: SubscriptionResolver<
    ResolversTypes["Task"],
    "taskUpdated",
    ParentType,
    ContextType,
    Partial<SubscriptionTaskUpdatedArgs>
  >;
};

export type SystemNotificationResolvers<
  ContextType = GraphQLContext,
  ParentType extends
    ResolversParentTypes["SystemNotification"] = ResolversParentTypes["SystemNotification"],
> = {
  actionUrl?: Resolver<
    Maybe<ResolversTypes["String"]>,
    ParentType,
    ContextType
  >;
  createdAt?: Resolver<ResolversTypes["DateTime"], ParentType, ContextType>;
  dismissedAt?: Resolver<
    Maybe<ResolversTypes["DateTime"]>,
    ParentType,
    ContextType
  >;
  entityId?: Resolver<Maybe<ResolversTypes["ID"]>, ParentType, ContextType>;
  entityType?: Resolver<
    Maybe<ResolversTypes["String"]>,
    ParentType,
    ContextType
  >;
  expiresAt?: Resolver<
    Maybe<ResolversTypes["DateTime"]>,
    ParentType,
    ContextType
  >;
  id?: Resolver<ResolversTypes["ID"], ParentType, ContextType>;
  isRead?: Resolver<ResolversTypes["Boolean"], ParentType, ContextType>;
  message?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  metadata?: Resolver<Maybe<ResolversTypes["JSON"]>, ParentType, ContextType>;
  notificationType?: Resolver<
    ResolversTypes["SystemNotificationType"],
    ParentType,
    ContextType
  >;
  priority?: Resolver<
    ResolversTypes["NotificationPriority"],
    ParentType,
    ContextType
  >;
  readAt?: Resolver<Maybe<ResolversTypes["DateTime"]>, ParentType, ContextType>;
  title?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes["DateTime"], ParentType, ContextType>;
  user?: Resolver<Maybe<ResolversTypes["User"]>, ParentType, ContextType>;
  userId?: Resolver<ResolversTypes["ID"], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type SystemNotificationsConnectionResolvers<
  ContextType = GraphQLContext,
  ParentType extends
    ResolversParentTypes["SystemNotificationsConnection"] = ResolversParentTypes["SystemNotificationsConnection"],
> = {
  hasNextPage?: Resolver<ResolversTypes["Boolean"], ParentType, ContextType>;
  hasPreviousPage?: Resolver<
    ResolversTypes["Boolean"],
    ParentType,
    ContextType
  >;
  nodes?: Resolver<
    Array<ResolversTypes["SystemNotification"]>,
    ParentType,
    ContextType
  >;
  totalCount?: Resolver<ResolversTypes["Int"], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type TaskResolvers<
  ContextType = GraphQLContext,
  ParentType extends
    ResolversParentTypes["Task"] = ResolversParentTypes["Task"],
> = {
  actualHours?: Resolver<Maybe<ResolversTypes["Int"]>, ParentType, ContextType>;
  affectsLeadScoring?: Resolver<
    ResolversTypes["Boolean"],
    ParentType,
    ContextType
  >;
  assignedToUser?: Resolver<
    Maybe<ResolversTypes["User"]>,
    ParentType,
    ContextType
  >;
  blocksStageProgression?: Resolver<
    ResolversTypes["Boolean"],
    ParentType,
    ContextType
  >;
  businessImpactScore?: Resolver<
    ResolversTypes["Float"],
    ParentType,
    ContextType
  >;
  calculatedPriority?: Resolver<
    ResolversTypes["Float"],
    ParentType,
    ContextType
  >;
  completedAt?: Resolver<
    Maybe<ResolversTypes["DateTime"]>,
    ParentType,
    ContextType
  >;
  completionTriggersStageChange?: Resolver<
    ResolversTypes["Boolean"],
    ParentType,
    ContextType
  >;
  createdAt?: Resolver<ResolversTypes["DateTime"], ParentType, ContextType>;
  createdByUser?: Resolver<
    Maybe<ResolversTypes["User"]>,
    ParentType,
    ContextType
  >;
  customFieldValues?: Resolver<
    Array<ResolversTypes["CustomFieldValue"]>,
    ParentType,
    ContextType
  >;
  deal?: Resolver<Maybe<ResolversTypes["Deal"]>, ParentType, ContextType>;
  dependencies?: Resolver<
    Array<ResolversTypes["TaskDependency"]>,
    ParentType,
    ContextType
  >;
  description?: Resolver<
    Maybe<ResolversTypes["String"]>,
    ParentType,
    ContextType
  >;
  dueDate?: Resolver<
    Maybe<ResolversTypes["DateTime"]>,
    ParentType,
    ContextType
  >;
  entityId?: Resolver<ResolversTypes["ID"], ParentType, ContextType>;
  entityType?: Resolver<
    ResolversTypes["TaskEntityType"],
    ParentType,
    ContextType
  >;
  estimatedHours?: Resolver<
    Maybe<ResolversTypes["Int"]>,
    ParentType,
    ContextType
  >;
  id?: Resolver<ResolversTypes["ID"], ParentType, ContextType>;
  lead?: Resolver<Maybe<ResolversTypes["Lead"]>, ParentType, ContextType>;
  organization?: Resolver<
    Maybe<ResolversTypes["Organization"]>,
    ParentType,
    ContextType
  >;
  parentTask?: Resolver<Maybe<ResolversTypes["Task"]>, ParentType, ContextType>;
  person?: Resolver<Maybe<ResolversTypes["Person"]>, ParentType, ContextType>;
  priority?: Resolver<ResolversTypes["TaskPriority"], ParentType, ContextType>;
  requiredForDealClosure?: Resolver<
    ResolversTypes["Boolean"],
    ParentType,
    ContextType
  >;
  status?: Resolver<ResolversTypes["TaskStatus"], ParentType, ContextType>;
  subtasks?: Resolver<Array<ResolversTypes["Task"]>, ParentType, ContextType>;
  tags?: Resolver<Array<ResolversTypes["String"]>, ParentType, ContextType>;
  taskType?: Resolver<ResolversTypes["TaskType"], ParentType, ContextType>;
  title?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes["DateTime"], ParentType, ContextType>;
  wfmProject?: Resolver<
    Maybe<ResolversTypes["WFMProject"]>,
    ParentType,
    ContextType
  >;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type TaskAutomationRuleResolvers<
  ContextType = GraphQLContext,
  ParentType extends
    ResolversParentTypes["TaskAutomationRule"] = ResolversParentTypes["TaskAutomationRule"],
> = {
  appliesToEntityType?: Resolver<
    ResolversTypes["TaskEntityType"],
    ParentType,
    ContextType
  >;
  createdAt?: Resolver<ResolversTypes["DateTime"], ParentType, ContextType>;
  description?: Resolver<
    Maybe<ResolversTypes["String"]>,
    ParentType,
    ContextType
  >;
  id?: Resolver<ResolversTypes["ID"], ParentType, ContextType>;
  isActive?: Resolver<ResolversTypes["Boolean"], ParentType, ContextType>;
  name?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  taskTemplate?: Resolver<ResolversTypes["JSON"], ParentType, ContextType>;
  triggerConditions?: Resolver<ResolversTypes["JSON"], ParentType, ContextType>;
  triggerEvent?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes["DateTime"], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type TaskDependencyResolvers<
  ContextType = GraphQLContext,
  ParentType extends
    ResolversParentTypes["TaskDependency"] = ResolversParentTypes["TaskDependency"],
> = {
  createdAt?: Resolver<ResolversTypes["DateTime"], ParentType, ContextType>;
  dependencyType?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  dependsOnTask?: Resolver<ResolversTypes["Task"], ParentType, ContextType>;
  id?: Resolver<ResolversTypes["ID"], ParentType, ContextType>;
  task?: Resolver<ResolversTypes["Task"], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type TaskHistoryResolvers<
  ContextType = GraphQLContext,
  ParentType extends
    ResolversParentTypes["TaskHistory"] = ResolversParentTypes["TaskHistory"],
> = {
  action?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  changedByUser?: Resolver<
    Maybe<ResolversTypes["User"]>,
    ParentType,
    ContextType
  >;
  createdAt?: Resolver<ResolversTypes["DateTime"], ParentType, ContextType>;
  id?: Resolver<ResolversTypes["ID"], ParentType, ContextType>;
  newValue?: Resolver<Maybe<ResolversTypes["JSON"]>, ParentType, ContextType>;
  oldValue?: Resolver<Maybe<ResolversTypes["JSON"]>, ParentType, ContextType>;
  taskId?: Resolver<Maybe<ResolversTypes["ID"]>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type TaskPriorityCountResolvers<
  ContextType = GraphQLContext,
  ParentType extends
    ResolversParentTypes["TaskPriorityCount"] = ResolversParentTypes["TaskPriorityCount"],
> = {
  count?: Resolver<ResolversTypes["Int"], ParentType, ContextType>;
  priority?: Resolver<ResolversTypes["TaskPriority"], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type TaskStatsResolvers<
  ContextType = GraphQLContext,
  ParentType extends
    ResolversParentTypes["TaskStats"] = ResolversParentTypes["TaskStats"],
> = {
  averageCompletionTime?: Resolver<
    Maybe<ResolversTypes["Float"]>,
    ParentType,
    ContextType
  >;
  completedTasks?: Resolver<ResolversTypes["Int"], ParentType, ContextType>;
  completionRate?: Resolver<ResolversTypes["Float"], ParentType, ContextType>;
  overdueTasks?: Resolver<ResolversTypes["Int"], ParentType, ContextType>;
  tasksByPriority?: Resolver<
    Array<ResolversTypes["TaskPriorityCount"]>,
    ParentType,
    ContextType
  >;
  tasksByStatus?: Resolver<
    Array<ResolversTypes["TaskStatusCount"]>,
    ParentType,
    ContextType
  >;
  tasksByType?: Resolver<
    Array<ResolversTypes["TaskTypeCount"]>,
    ParentType,
    ContextType
  >;
  totalTasks?: Resolver<ResolversTypes["Int"], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type TaskStatusCountResolvers<
  ContextType = GraphQLContext,
  ParentType extends
    ResolversParentTypes["TaskStatusCount"] = ResolversParentTypes["TaskStatusCount"],
> = {
  count?: Resolver<ResolversTypes["Int"], ParentType, ContextType>;
  status?: Resolver<ResolversTypes["TaskStatus"], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type TaskTypeCountResolvers<
  ContextType = GraphQLContext,
  ParentType extends
    ResolversParentTypes["TaskTypeCount"] = ResolversParentTypes["TaskTypeCount"],
> = {
  count?: Resolver<ResolversTypes["Int"], ParentType, ContextType>;
  taskType?: Resolver<ResolversTypes["TaskType"], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ToolDiscoveryResponseResolvers<
  ContextType = GraphQLContext,
  ParentType extends
    ResolversParentTypes["ToolDiscoveryResponse"] = ResolversParentTypes["ToolDiscoveryResponse"],
> = {
  error?: Resolver<Maybe<ResolversTypes["String"]>, ParentType, ContextType>;
  tools?: Resolver<Array<ResolversTypes["JSON"]>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ToolExecutionResolvers<
  ContextType = GraphQLContext,
  ParentType extends
    ResolversParentTypes["ToolExecution"] = ResolversParentTypes["ToolExecution"],
> = {
  error?: Resolver<Maybe<ResolversTypes["String"]>, ParentType, ContextType>;
  executionTime?: Resolver<ResolversTypes["Int"], ParentType, ContextType>;
  id?: Resolver<ResolversTypes["ID"], ParentType, ContextType>;
  input?: Resolver<ResolversTypes["JSON"], ParentType, ContextType>;
  name?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  result?: Resolver<Maybe<ResolversTypes["JSON"]>, ParentType, ContextType>;
  status?: Resolver<
    ResolversTypes["ToolExecutionStatus"],
    ParentType,
    ContextType
  >;
  timestamp?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type UnifiedNotificationResolvers<
  ContextType = GraphQLContext,
  ParentType extends
    ResolversParentTypes["UnifiedNotification"] = ResolversParentTypes["UnifiedNotification"],
> = {
  actionUrl?: Resolver<
    Maybe<ResolversTypes["String"]>,
    ParentType,
    ContextType
  >;
  createdAt?: Resolver<ResolversTypes["DateTime"], ParentType, ContextType>;
  dismissedAt?: Resolver<
    Maybe<ResolversTypes["DateTime"]>,
    ParentType,
    ContextType
  >;
  entityId?: Resolver<Maybe<ResolversTypes["ID"]>, ParentType, ContextType>;
  entityType?: Resolver<
    Maybe<ResolversTypes["String"]>,
    ParentType,
    ContextType
  >;
  expiresAt?: Resolver<
    Maybe<ResolversTypes["DateTime"]>,
    ParentType,
    ContextType
  >;
  id?: Resolver<ResolversTypes["ID"], ParentType, ContextType>;
  isRead?: Resolver<ResolversTypes["Boolean"], ParentType, ContextType>;
  message?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  metadata?: Resolver<Maybe<ResolversTypes["JSON"]>, ParentType, ContextType>;
  notificationType?: Resolver<
    ResolversTypes["String"],
    ParentType,
    ContextType
  >;
  priority?: Resolver<ResolversTypes["Int"], ParentType, ContextType>;
  readAt?: Resolver<Maybe<ResolversTypes["DateTime"]>, ParentType, ContextType>;
  source?: Resolver<
    ResolversTypes["NotificationSource"],
    ParentType,
    ContextType
  >;
  title?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes["DateTime"], ParentType, ContextType>;
  user?: Resolver<Maybe<ResolversTypes["User"]>, ParentType, ContextType>;
  userId?: Resolver<ResolversTypes["ID"], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type UnifiedNotificationsConnectionResolvers<
  ContextType = GraphQLContext,
  ParentType extends
    ResolversParentTypes["UnifiedNotificationsConnection"] = ResolversParentTypes["UnifiedNotificationsConnection"],
> = {
  hasNextPage?: Resolver<ResolversTypes["Boolean"], ParentType, ContextType>;
  hasPreviousPage?: Resolver<
    ResolversTypes["Boolean"],
    ParentType,
    ContextType
  >;
  nodes?: Resolver<
    Array<ResolversTypes["UnifiedNotification"]>,
    ParentType,
    ContextType
  >;
  totalCount?: Resolver<ResolversTypes["Int"], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type UserResolvers<
  ContextType = GraphQLContext,
  ParentType extends
    ResolversParentTypes["User"] = ResolversParentTypes["User"],
> = {
  avatar_url?: Resolver<
    Maybe<ResolversTypes["String"]>,
    ParentType,
    ContextType
  >;
  display_name?: Resolver<
    Maybe<ResolversTypes["String"]>,
    ParentType,
    ContextType
  >;
  email?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  id?: Resolver<ResolversTypes["ID"], ParentType, ContextType>;
  roles?: Resolver<Array<ResolversTypes["Role"]>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type UserCurrencyPreferencesResolvers<
  ContextType = GraphQLContext,
  ParentType extends
    ResolversParentTypes["UserCurrencyPreferences"] = ResolversParentTypes["UserCurrencyPreferences"],
> = {
  createdAt?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  defaultCurrency?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  displayCurrency?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  userId?: Resolver<ResolversTypes["ID"], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type WfmProjectResolvers<
  ContextType = GraphQLContext,
  ParentType extends
    ResolversParentTypes["WFMProject"] = ResolversParentTypes["WFMProject"],
> = {
  completedAt?: Resolver<
    Maybe<ResolversTypes["DateTime"]>,
    ParentType,
    ContextType
  >;
  completedBy?: Resolver<
    Maybe<ResolversTypes["User"]>,
    ParentType,
    ContextType
  >;
  createdAt?: Resolver<ResolversTypes["DateTime"], ParentType, ContextType>;
  createdBy?: Resolver<Maybe<ResolversTypes["User"]>, ParentType, ContextType>;
  currentStep?: Resolver<
    Maybe<ResolversTypes["WFMWorkflowStep"]>,
    ParentType,
    ContextType
  >;
  description?: Resolver<
    Maybe<ResolversTypes["String"]>,
    ParentType,
    ContextType
  >;
  id?: Resolver<ResolversTypes["ID"], ParentType, ContextType>;
  isActive?: Resolver<ResolversTypes["Boolean"], ParentType, ContextType>;
  metadata?: Resolver<Maybe<ResolversTypes["JSON"]>, ParentType, ContextType>;
  name?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  projectType?: Resolver<
    ResolversTypes["WFMProjectType"],
    ParentType,
    ContextType
  >;
  updatedAt?: Resolver<ResolversTypes["DateTime"], ParentType, ContextType>;
  updatedBy?: Resolver<Maybe<ResolversTypes["User"]>, ParentType, ContextType>;
  workflow?: Resolver<ResolversTypes["WFMWorkflow"], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type WfmProjectTypeResolvers<
  ContextType = GraphQLContext,
  ParentType extends
    ResolversParentTypes["WFMProjectType"] = ResolversParentTypes["WFMProjectType"],
> = {
  createdAt?: Resolver<ResolversTypes["DateTime"], ParentType, ContextType>;
  createdByUser?: Resolver<
    Maybe<ResolversTypes["User"]>,
    ParentType,
    ContextType
  >;
  defaultWorkflow?: Resolver<
    Maybe<ResolversTypes["WFMWorkflow"]>,
    ParentType,
    ContextType
  >;
  description?: Resolver<
    Maybe<ResolversTypes["String"]>,
    ParentType,
    ContextType
  >;
  iconName?: Resolver<Maybe<ResolversTypes["String"]>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes["ID"], ParentType, ContextType>;
  isArchived?: Resolver<ResolversTypes["Boolean"], ParentType, ContextType>;
  name?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes["DateTime"], ParentType, ContextType>;
  updatedByUser?: Resolver<
    Maybe<ResolversTypes["User"]>,
    ParentType,
    ContextType
  >;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type WfmStatusResolvers<
  ContextType = GraphQLContext,
  ParentType extends
    ResolversParentTypes["WFMStatus"] = ResolversParentTypes["WFMStatus"],
> = {
  color?: Resolver<Maybe<ResolversTypes["String"]>, ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes["DateTime"], ParentType, ContextType>;
  createdByUser?: Resolver<
    Maybe<ResolversTypes["User"]>,
    ParentType,
    ContextType
  >;
  description?: Resolver<
    Maybe<ResolversTypes["String"]>,
    ParentType,
    ContextType
  >;
  id?: Resolver<ResolversTypes["ID"], ParentType, ContextType>;
  isArchived?: Resolver<ResolversTypes["Boolean"], ParentType, ContextType>;
  name?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes["DateTime"], ParentType, ContextType>;
  updatedByUser?: Resolver<
    Maybe<ResolversTypes["User"]>,
    ParentType,
    ContextType
  >;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type WfmStatusMutationResponseResolvers<
  ContextType = GraphQLContext,
  ParentType extends
    ResolversParentTypes["WFMStatusMutationResponse"] = ResolversParentTypes["WFMStatusMutationResponse"],
> = {
  message?: Resolver<Maybe<ResolversTypes["String"]>, ParentType, ContextType>;
  status?: Resolver<
    Maybe<ResolversTypes["WFMStatus"]>,
    ParentType,
    ContextType
  >;
  success?: Resolver<ResolversTypes["Boolean"], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type WfmWorkflowResolvers<
  ContextType = GraphQLContext,
  ParentType extends
    ResolversParentTypes["WFMWorkflow"] = ResolversParentTypes["WFMWorkflow"],
> = {
  createdAt?: Resolver<ResolversTypes["DateTime"], ParentType, ContextType>;
  createdByUser?: Resolver<
    Maybe<ResolversTypes["User"]>,
    ParentType,
    ContextType
  >;
  description?: Resolver<
    Maybe<ResolversTypes["String"]>,
    ParentType,
    ContextType
  >;
  id?: Resolver<ResolversTypes["ID"], ParentType, ContextType>;
  isArchived?: Resolver<ResolversTypes["Boolean"], ParentType, ContextType>;
  name?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  steps?: Resolver<
    Maybe<Array<ResolversTypes["WFMWorkflowStep"]>>,
    ParentType,
    ContextType
  >;
  transitions?: Resolver<
    Maybe<Array<ResolversTypes["WFMWorkflowTransition"]>>,
    ParentType,
    ContextType
  >;
  updatedAt?: Resolver<ResolversTypes["DateTime"], ParentType, ContextType>;
  updatedByUser?: Resolver<
    Maybe<ResolversTypes["User"]>,
    ParentType,
    ContextType
  >;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type WfmWorkflowStepResolvers<
  ContextType = GraphQLContext,
  ParentType extends
    ResolversParentTypes["WFMWorkflowStep"] = ResolversParentTypes["WFMWorkflowStep"],
> = {
  createdAt?: Resolver<ResolversTypes["DateTime"], ParentType, ContextType>;
  id?: Resolver<ResolversTypes["ID"], ParentType, ContextType>;
  isFinalStep?: Resolver<ResolversTypes["Boolean"], ParentType, ContextType>;
  isInitialStep?: Resolver<ResolversTypes["Boolean"], ParentType, ContextType>;
  metadata?: Resolver<Maybe<ResolversTypes["JSON"]>, ParentType, ContextType>;
  status?: Resolver<ResolversTypes["WFMStatus"], ParentType, ContextType>;
  stepOrder?: Resolver<ResolversTypes["Int"], ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes["DateTime"], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type WfmWorkflowStepMutationResponseResolvers<
  ContextType = GraphQLContext,
  ParentType extends
    ResolversParentTypes["WFMWorkflowStepMutationResponse"] = ResolversParentTypes["WFMWorkflowStepMutationResponse"],
> = {
  message?: Resolver<Maybe<ResolversTypes["String"]>, ParentType, ContextType>;
  stepId?: Resolver<Maybe<ResolversTypes["ID"]>, ParentType, ContextType>;
  success?: Resolver<ResolversTypes["Boolean"], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type WfmWorkflowTransitionResolvers<
  ContextType = GraphQLContext,
  ParentType extends
    ResolversParentTypes["WFMWorkflowTransition"] = ResolversParentTypes["WFMWorkflowTransition"],
> = {
  createdAt?: Resolver<ResolversTypes["DateTime"], ParentType, ContextType>;
  fromStep?: Resolver<
    ResolversTypes["WFMWorkflowStep"],
    ParentType,
    ContextType
  >;
  id?: Resolver<ResolversTypes["ID"], ParentType, ContextType>;
  name?: Resolver<Maybe<ResolversTypes["String"]>, ParentType, ContextType>;
  toStep?: Resolver<ResolversTypes["WFMWorkflowStep"], ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes["DateTime"], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type WfmWorkflowTransitionMutationResponseResolvers<
  ContextType = GraphQLContext,
  ParentType extends
    ResolversParentTypes["WFMWorkflowTransitionMutationResponse"] = ResolversParentTypes["WFMWorkflowTransitionMutationResponse"],
> = {
  message?: Resolver<Maybe<ResolversTypes["String"]>, ParentType, ContextType>;
  success?: Resolver<ResolversTypes["Boolean"], ParentType, ContextType>;
  transitionId?: Resolver<Maybe<ResolversTypes["ID"]>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type Resolvers<ContextType = GraphQLContext> = {
  AIGeneratedTaskContent?: AiGeneratedTaskContentResolvers<ContextType>;
  AccountPortfolioStats?: AccountPortfolioStatsResolvers<ContextType>;
  AgentConfig?: AgentConfigResolvers<ContextType>;
  AgentConversation?: AgentConversationResolvers<ContextType>;
  AgentMessage?: AgentMessageResolvers<ContextType>;
  AgentPlan?: AgentPlanResolvers<ContextType>;
  AgentPlanStep?: AgentPlanStepResolvers<ContextType>;
  AgentResponse?: AgentResponseResolvers<ContextType>;
  AgentThought?: AgentThoughtResolvers<ContextType>;
  AgentV2Response?: AgentV2ResponseResolvers<ContextType>;
  AgentV2StreamChunk?: AgentV2StreamChunkResolvers<ContextType>;
  AppSetting?: AppSettingResolvers<ContextType>;
  AvailabilitySlot?: AvailabilitySlotResolvers<ContextType>;
  BusinessRule?: BusinessRuleResolvers<ContextType>;
  BusinessRuleAnalytics?: BusinessRuleAnalyticsResolvers<ContextType>;
  BusinessRuleExecutionResult?: BusinessRuleExecutionResultResolvers<ContextType>;
  BusinessRuleNotification?: BusinessRuleNotificationResolvers<ContextType>;
  BusinessRuleNotificationsConnection?: BusinessRuleNotificationsConnectionResolvers<ContextType>;
  BusinessRulesConnection?: BusinessRulesConnectionResolvers<ContextType>;
  CalendarAttendee?: CalendarAttendeeResolvers<ContextType>;
  CalendarEvent?: CalendarEventResolvers<ContextType>;
  CalendarPreferences?: CalendarPreferencesResolvers<ContextType>;
  CalendarSyncStatus?: CalendarSyncStatusResolvers<ContextType>;
  ContactSuggestion?: ContactSuggestionResolvers<ContextType>;
  ConversionHistory?: ConversionHistoryResolvers<ContextType>;
  ConversionResult?: ConversionResultResolvers<ContextType>;
  ConversionValidationResult?: ConversionValidationResultResolvers<ContextType>;
  ConvertedEntities?: ConvertedEntitiesResolvers<ContextType>;
  Currency?: CurrencyResolvers<ContextType>;
  CurrencyAmount?: CurrencyAmountResolvers<ContextType>;
  CurrencyOperationResult?: CurrencyOperationResultResolvers<ContextType>;
  CustomFieldDefinition?: CustomFieldDefinitionResolvers<ContextType>;
  CustomFieldOption?: CustomFieldOptionResolvers<ContextType>;
  CustomFieldValue?: CustomFieldValueResolvers<ContextType>;
  Date?: GraphQLScalarType;
  DateTime?: GraphQLScalarType;
  Deal?: DealResolvers<ContextType>;
  DealDocumentAttachment?: DealDocumentAttachmentResolvers<ContextType>;
  DealFolderInfo?: DealFolderInfoResolvers<ContextType>;
  DealHistoryEntry?: DealHistoryEntryResolvers<ContextType>;
  DealParticipant?: DealParticipantResolvers<ContextType>;
  DealSubfolders?: DealSubfoldersResolvers<ContextType>;
  DealTaskIndicator?: DealTaskIndicatorResolvers<ContextType>;
  DealToLeadConversionResult?: DealToLeadConversionResultResolvers<ContextType>;
  DealsByCurrencyResult?: DealsByCurrencyResultResolvers<ContextType>;
  Document?: DocumentResolvers<ContextType>;
  DriveFile?: DriveFileResolvers<ContextType>;
  DriveFileConnection?: DriveFileConnectionResolvers<ContextType>;
  DriveFileOwner?: DriveFileOwnerResolvers<ContextType>;
  DriveFolder?: DriveFolderResolvers<ContextType>;
  DriveFolderConnection?: DriveFolderConnectionResolvers<ContextType>;
  DriveFolderStructure?: DriveFolderStructureResolvers<ContextType>;
  DriveFolderSubfolders?: DriveFolderSubfoldersResolvers<ContextType>;
  DualAttachmentResponse?: DualAttachmentResponseResolvers<ContextType>;
  Email?: EmailResolvers<ContextType>;
  EmailActivity?: EmailActivityResolvers<ContextType>;
  EmailAnalytics?: EmailAnalyticsResolvers<ContextType>;
  EmailAttachment?: EmailAttachmentResolvers<ContextType>;
  EmailMessage?: EmailMessageResolvers<ContextType>;
  EmailPin?: EmailPinResolvers<ContextType>;
  EmailThread?: EmailThreadResolvers<ContextType>;
  EmailThreadConnection?: EmailThreadConnectionResolvers<ContextType>;
  ExchangeRate?: ExchangeRateResolvers<ContextType>;
  ExtendedThinkingAnalysis?: ExtendedThinkingAnalysisResolvers<ContextType>;
  GoogleCalendar?: GoogleCalendarResolvers<ContextType>;
  GoogleDriveConfig?: GoogleDriveConfigResolvers<ContextType>;
  GoogleIntegrationStatus?: GoogleIntegrationStatusResolvers<ContextType>;
  GoogleTokenData?: GoogleTokenDataResolvers<ContextType>;
  JSON?: GraphQLScalarType;
  Lead?: LeadResolvers<ContextType>;
  LeadConversionResult?: LeadConversionResultResolvers<ContextType>;
  LeadHistoryEntry?: LeadHistoryEntryResolvers<ContextType>;
  LeadsStats?: LeadsStatsResolvers<ContextType>;
  Mutation?: MutationResolvers<ContextType>;
  NoteDocumentAttachment?: NoteDocumentAttachmentResolvers<ContextType>;
  NotificationSummary?: NotificationSummaryResolvers<ContextType>;
  Organization?: OrganizationResolvers<ContextType>;
  Person?: PersonResolvers<ContextType>;
  PersonHistory?: PersonHistoryResolvers<ContextType>;
  PersonListItem?: PersonListItemResolvers<ContextType>;
  PersonOrganizationRole?: PersonOrganizationRoleResolvers<ContextType>;
  Query?: QueryResolvers<ContextType>;
  ReactivationPlan?: ReactivationPlanResolvers<ContextType>;
  Role?: RoleResolvers<ContextType>;
  RuleAction?: RuleActionResolvers<ContextType>;
  RuleCondition?: RuleConditionResolvers<ContextType>;
  RuleExecution?: RuleExecutionResolvers<ContextType>;
  RuleExecutionsConnection?: RuleExecutionsConnectionResolvers<ContextType>;
  SharedDrive?: SharedDriveResolvers<ContextType>;
  SharedDriveCapabilities?: SharedDriveCapabilitiesResolvers<ContextType>;
  SharedDriveImage?: SharedDriveImageResolvers<ContextType>;
  SharedDriveRestrictions?: SharedDriveRestrictionsResolvers<ContextType>;
  SmartSticker?: SmartStickerResolvers<ContextType>;
  StickerCategory?: StickerCategoryResolvers<ContextType>;
  StickerConnection?: StickerConnectionResolvers<ContextType>;
  Subscription?: SubscriptionResolvers<ContextType>;
  SystemNotification?: SystemNotificationResolvers<ContextType>;
  SystemNotificationsConnection?: SystemNotificationsConnectionResolvers<ContextType>;
  Task?: TaskResolvers<ContextType>;
  TaskAutomationRule?: TaskAutomationRuleResolvers<ContextType>;
  TaskDependency?: TaskDependencyResolvers<ContextType>;
  TaskHistory?: TaskHistoryResolvers<ContextType>;
  TaskPriorityCount?: TaskPriorityCountResolvers<ContextType>;
  TaskStats?: TaskStatsResolvers<ContextType>;
  TaskStatusCount?: TaskStatusCountResolvers<ContextType>;
  TaskTypeCount?: TaskTypeCountResolvers<ContextType>;
  ToolDiscoveryResponse?: ToolDiscoveryResponseResolvers<ContextType>;
  ToolExecution?: ToolExecutionResolvers<ContextType>;
  UnifiedNotification?: UnifiedNotificationResolvers<ContextType>;
  UnifiedNotificationsConnection?: UnifiedNotificationsConnectionResolvers<ContextType>;
  User?: UserResolvers<ContextType>;
  UserCurrencyPreferences?: UserCurrencyPreferencesResolvers<ContextType>;
  WFMProject?: WfmProjectResolvers<ContextType>;
  WFMProjectType?: WfmProjectTypeResolvers<ContextType>;
  WFMStatus?: WfmStatusResolvers<ContextType>;
  WFMStatusMutationResponse?: WfmStatusMutationResponseResolvers<ContextType>;
  WFMWorkflow?: WfmWorkflowResolvers<ContextType>;
  WFMWorkflowStep?: WfmWorkflowStepResolvers<ContextType>;
  WFMWorkflowStepMutationResponse?: WfmWorkflowStepMutationResponseResolvers<ContextType>;
  WFMWorkflowTransition?: WfmWorkflowTransitionResolvers<ContextType>;
  WFMWorkflowTransitionMutationResponse?: WfmWorkflowTransitionMutationResponseResolvers<ContextType>;
};
