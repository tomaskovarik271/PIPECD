/* eslint-disable */
import type { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  DateTime: { input: string; output: string; }
  JSON: { input: Record<string, any>; output: Record<string, any>; }
};

export type AiGeneratedTaskContent = {
  __typename?: 'AIGeneratedTaskContent';
  confidence: Scalars['Float']['output'];
  description: Scalars['String']['output'];
  emailScope: Scalars['String']['output'];
  sourceContent: Scalars['String']['output'];
  subject: Scalars['String']['output'];
  suggestedDueDate?: Maybe<Scalars['String']['output']>;
};

export type AccountPortfolioStats = {
  __typename?: 'AccountPortfolioStats';
  accountsNeedingAttention: Scalars['Int']['output'];
  activeDealCount: Scalars['Int']['output'];
  totalAccounts: Scalars['Int']['output'];
  totalDealValue: Scalars['Float']['output'];
};

export type AgentConfig = {
  __typename?: 'AgentConfig';
  autoExecute: Scalars['Boolean']['output'];
  enableExtendedThinking: Scalars['Boolean']['output'];
  maxClarifyingQuestions: Scalars['Int']['output'];
  maxThinkingSteps: Scalars['Int']['output'];
  thinkingBudget: ThinkingBudget;
};

export type AgentConfigInput = {
  autoExecute?: InputMaybe<Scalars['Boolean']['input']>;
  enableExtendedThinking?: InputMaybe<Scalars['Boolean']['input']>;
  maxClarifyingQuestions?: InputMaybe<Scalars['Int']['input']>;
  maxThinkingSteps?: InputMaybe<Scalars['Int']['input']>;
  thinkingBudget?: InputMaybe<ThinkingBudget>;
};

export type AgentConversation = {
  __typename?: 'AgentConversation';
  agentVersion: Scalars['String']['output'];
  context: Scalars['JSON']['output'];
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  messages: Array<AgentMessage>;
  plan?: Maybe<AgentPlan>;
  updatedAt: Scalars['DateTime']['output'];
  userId: Scalars['ID']['output'];
};

export type AgentMessage = {
  __typename?: 'AgentMessage';
  content: Scalars['String']['output'];
  role: Scalars['String']['output'];
  thoughts?: Maybe<Array<AgentThought>>;
  timestamp: Scalars['DateTime']['output'];
};

export type AgentPlan = {
  __typename?: 'AgentPlan';
  context: Scalars['JSON']['output'];
  goal: Scalars['String']['output'];
  steps: Array<AgentPlanStep>;
};

export type AgentPlanStep = {
  __typename?: 'AgentPlanStep';
  dependencies?: Maybe<Array<Scalars['String']['output']>>;
  description: Scalars['String']['output'];
  id: Scalars['String']['output'];
  parameters?: Maybe<Scalars['JSON']['output']>;
  result?: Maybe<Scalars['JSON']['output']>;
  status: AgentStepStatus;
  toolName?: Maybe<Scalars['String']['output']>;
};

export type AgentPlanStepInput = {
  dependencies?: InputMaybe<Array<Scalars['String']['input']>>;
  description: Scalars['String']['input'];
  parameters?: InputMaybe<Scalars['JSON']['input']>;
  toolName?: InputMaybe<Scalars['String']['input']>;
};

export type AgentResponse = {
  __typename?: 'AgentResponse';
  conversation: AgentConversation;
  message: AgentMessage;
  plan?: Maybe<AgentPlan>;
  thoughts: Array<AgentThought>;
};

export type AgentStepStatus =
  | 'COMPLETED'
  | 'FAILED'
  | 'IN_PROGRESS'
  | 'PENDING';

export type AgentThought = {
  __typename?: 'AgentThought';
  concerns?: Maybe<Scalars['String']['output']>;
  content: Scalars['String']['output'];
  conversationId: Scalars['ID']['output'];
  id: Scalars['ID']['output'];
  metadata: Scalars['JSON']['output'];
  nextSteps?: Maybe<Scalars['String']['output']>;
  reasoning?: Maybe<Scalars['String']['output']>;
  reflectionData: Scalars['JSON']['output'];
  strategy?: Maybe<Scalars['String']['output']>;
  thinkingBudget?: Maybe<ThinkingBudget>;
  timestamp: Scalars['DateTime']['output'];
  type: AgentThoughtType;
};

export type AgentThoughtInput = {
  content: Scalars['String']['input'];
  metadata?: InputMaybe<Scalars['JSON']['input']>;
  type: AgentThoughtType;
};

export type AgentThoughtType =
  | 'OBSERVATION'
  | 'PLAN'
  | 'QUESTION'
  | 'REASONING'
  | 'TOOL_CALL';

export type AgentV2Response = {
  __typename?: 'AgentV2Response';
  confidenceScore?: Maybe<Scalars['Float']['output']>;
  conversation: AgentConversation;
  extendedThoughts: Array<AgentThought>;
  message: AgentMessage;
  planModifications: Array<Scalars['String']['output']>;
  reflections: Array<AgentThought>;
  thinkingTime?: Maybe<Scalars['Float']['output']>;
  toolExecutions: Array<ToolExecution>;
};

export type AgentV2StreamChunk = {
  __typename?: 'AgentV2StreamChunk';
  complete?: Maybe<AgentV2Response>;
  content?: Maybe<Scalars['String']['output']>;
  conversationId: Scalars['ID']['output'];
  error?: Maybe<Scalars['String']['output']>;
  thinking?: Maybe<AgentThought>;
  type: AgentV2StreamChunkType;
};

export type AgentV2StreamChunkType =
  | 'COMPLETE'
  | 'CONTENT'
  | 'ERROR'
  | 'THINKING';

export type AgentV2ThoughtInput = {
  concerns?: InputMaybe<Scalars['String']['input']>;
  content: Scalars['String']['input'];
  nextSteps?: InputMaybe<Scalars['String']['input']>;
  reasoning?: InputMaybe<Scalars['String']['input']>;
  reflectionData?: InputMaybe<Scalars['JSON']['input']>;
  strategy?: InputMaybe<Scalars['String']['input']>;
  thinkingBudget?: InputMaybe<ThinkingBudget>;
  type: AgentThoughtType;
};

export type AppSetting = {
  __typename?: 'AppSetting';
  createdAt: Scalars['String']['output'];
  description?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  isPublic: Scalars['Boolean']['output'];
  settingKey: Scalars['String']['output'];
  settingType: Scalars['String']['output'];
  settingValue?: Maybe<Scalars['JSON']['output']>;
  updatedAt: Scalars['String']['output'];
};

export type AttachDocumentInput = {
  category?: InputMaybe<DocumentCategory>;
  dealId: Scalars['ID']['input'];
  fileName: Scalars['String']['input'];
  fileSize?: InputMaybe<Scalars['Int']['input']>;
  fileUrl: Scalars['String']['input'];
  googleFileId: Scalars['String']['input'];
  mimeType?: InputMaybe<Scalars['String']['input']>;
  sharedDriveId?: InputMaybe<Scalars['String']['input']>;
};

export type AttachDocumentToNoteInput = {
  category?: InputMaybe<DocumentCategory>;
  dealId: Scalars['ID']['input'];
  fileName: Scalars['String']['input'];
  fileSize?: InputMaybe<Scalars['Int']['input']>;
  fileUrl: Scalars['String']['input'];
  googleFileId: Scalars['String']['input'];
  mimeType?: InputMaybe<Scalars['String']['input']>;
  noteId: Scalars['ID']['input'];
  sharedDriveId?: InputMaybe<Scalars['String']['input']>;
};

export type AttachFileInput = {
  category?: InputMaybe<DocumentCategory>;
  dealId: Scalars['ID']['input'];
  fileId: Scalars['String']['input'];
};

export type AvailabilitySlot = {
  __typename?: 'AvailabilitySlot';
  available: Scalars['Boolean']['output'];
  end: Scalars['DateTime']['output'];
  start: Scalars['DateTime']['output'];
};

export type BulkTaskUpdatesInput = {
  assignedToUserId?: InputMaybe<Scalars['ID']['input']>;
  dueDate?: InputMaybe<Scalars['DateTime']['input']>;
  priority?: InputMaybe<TaskPriority>;
  status?: InputMaybe<TaskStatus>;
  tags?: InputMaybe<Array<Scalars['String']['input']>>;
};

export type BusinessRule = {
  __typename?: 'BusinessRule';
  actions: Array<RuleAction>;
  conditions: Array<RuleCondition>;
  createdAt: Scalars['DateTime']['output'];
  createdBy?: Maybe<User>;
  description?: Maybe<Scalars['String']['output']>;
  entityType: EntityTypeEnum;
  executionCount: Scalars['Int']['output'];
  id: Scalars['ID']['output'];
  lastError?: Maybe<Scalars['String']['output']>;
  lastExecution?: Maybe<Scalars['DateTime']['output']>;
  name: Scalars['String']['output'];
  status: RuleStatusEnum;
  triggerEvents: Array<Scalars['String']['output']>;
  triggerFields: Array<Scalars['String']['output']>;
  triggerType: TriggerTypeEnum;
  updatedAt: Scalars['DateTime']['output'];
  wfmStatus?: Maybe<WfmStatus>;
  wfmStep?: Maybe<WfmWorkflowStep>;
  wfmWorkflow?: Maybe<WfmWorkflow>;
};

export type BusinessRuleAnalytics = {
  __typename?: 'BusinessRuleAnalytics';
  activeRules: Scalars['Int']['output'];
  averageExecutionTime: Scalars['Float']['output'];
  errorRate: Scalars['Float']['output'];
  recentErrors: Array<Scalars['String']['output']>;
  topPerformingRules: Array<BusinessRule>;
  totalExecutions: Scalars['Int']['output'];
  totalNotifications: Scalars['Int']['output'];
  totalRules: Scalars['Int']['output'];
};

export type BusinessRuleExecutionResult = {
  __typename?: 'BusinessRuleExecutionResult';
  activitiesCreated: Scalars['Int']['output'];
  errors: Array<Scalars['String']['output']>;
  notificationsCreated: Scalars['Int']['output'];
  rulesProcessed: Scalars['Int']['output'];
  tasksCreated: Scalars['Int']['output'];
};

export type BusinessRuleFilters = {
  entityType?: InputMaybe<EntityTypeEnum>;
  search?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<RuleStatusEnum>;
  triggerType?: InputMaybe<TriggerTypeEnum>;
};

export type BusinessRuleInput = {
  actions: Array<RuleActionInput>;
  conditions: Array<RuleConditionInput>;
  description?: InputMaybe<Scalars['String']['input']>;
  entityType: EntityTypeEnum;
  name: Scalars['String']['input'];
  status?: InputMaybe<RuleStatusEnum>;
  triggerEvents?: InputMaybe<Array<Scalars['String']['input']>>;
  triggerFields?: InputMaybe<Array<Scalars['String']['input']>>;
  triggerType: TriggerTypeEnum;
  wfmStatusId?: InputMaybe<Scalars['ID']['input']>;
  wfmStepId?: InputMaybe<Scalars['ID']['input']>;
  wfmWorkflowId?: InputMaybe<Scalars['ID']['input']>;
};

export type BusinessRuleNotification = {
  __typename?: 'BusinessRuleNotification';
  actedUponAt?: Maybe<Scalars['DateTime']['output']>;
  actions?: Maybe<Scalars['JSON']['output']>;
  createdAt: Scalars['DateTime']['output'];
  dismissedAt?: Maybe<Scalars['DateTime']['output']>;
  entityId: Scalars['ID']['output'];
  entityType: EntityTypeEnum;
  id: Scalars['ID']['output'];
  message?: Maybe<Scalars['String']['output']>;
  notificationType: Scalars['String']['output'];
  priority: Scalars['Int']['output'];
  readAt?: Maybe<Scalars['DateTime']['output']>;
  rule: BusinessRule;
  title: Scalars['String']['output'];
  user: User;
};

export type BusinessRuleNotificationsConnection = {
  __typename?: 'BusinessRuleNotificationsConnection';
  hasNextPage: Scalars['Boolean']['output'];
  hasPreviousPage: Scalars['Boolean']['output'];
  nodes: Array<BusinessRuleNotification>;
  totalCount: Scalars['Int']['output'];
};

export type BusinessRulesConnection = {
  __typename?: 'BusinessRulesConnection';
  hasNextPage: Scalars['Boolean']['output'];
  hasPreviousPage: Scalars['Boolean']['output'];
  nodes: Array<BusinessRule>;
  totalCount: Scalars['Int']['output'];
};

export type CrmContextInput = {
  dealId?: InputMaybe<Scalars['ID']['input']>;
  entityId: Scalars['ID']['input'];
  entityType: TaskEntityType;
  leadId?: InputMaybe<Scalars['ID']['input']>;
  organizationId?: InputMaybe<Scalars['ID']['input']>;
  personId?: InputMaybe<Scalars['ID']['input']>;
};

export type CrmEventInput = {
  entityId: Scalars['ID']['input'];
  entityType: TaskEntityType;
  eventData: Scalars['JSON']['input'];
  eventType: Scalars['String']['input'];
};

export type CalendarAttendee = {
  __typename?: 'CalendarAttendee';
  displayName?: Maybe<Scalars['String']['output']>;
  email: Scalars['String']['output'];
  responseStatus: CalendarResponseStatus;
};

export type CalendarEvent = {
  __typename?: 'CalendarEvent';
  attendees?: Maybe<Array<CalendarAttendee>>;
  createdAt: Scalars['DateTime']['output'];
  deal?: Maybe<Deal>;
  description?: Maybe<Scalars['String']['output']>;
  endTime: Scalars['DateTime']['output'];
  eventType: CalendarEventType;
  googleCalendarId: Scalars['String']['output'];
  googleEventId: Scalars['String']['output'];
  googleMeetLink?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  isAllDay: Scalars['Boolean']['output'];
  isCancelled: Scalars['Boolean']['output'];
  lastSyncedAt?: Maybe<Scalars['DateTime']['output']>;
  location?: Maybe<Scalars['String']['output']>;
  nextActions?: Maybe<Array<Scalars['String']['output']>>;
  organization?: Maybe<Organization>;
  outcome?: Maybe<CalendarEventOutcome>;
  outcomeNotes?: Maybe<Scalars['String']['output']>;
  person?: Maybe<Person>;
  startTime: Scalars['DateTime']['output'];
  timezone: Scalars['String']['output'];
  title: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
};

export type CalendarEventOutcome =
  | 'CANCELLED'
  | 'COMPLETED'
  | 'NO_SHOW'
  | 'RESCHEDULED';

export type CalendarEventType =
  | 'CALL'
  | 'CHECK_IN'
  | 'CONTRACT_REVIEW'
  | 'DEMO'
  | 'FOLLOW_UP'
  | 'INTERNAL'
  | 'MEETING'
  | 'PROPOSAL_PRESENTATION';

export type CalendarPreferences = {
  __typename?: 'CalendarPreferences';
  autoAddDealParticipants: Scalars['Boolean']['output'];
  autoAddGoogleMeet: Scalars['Boolean']['output'];
  autoSyncEnabled: Scalars['Boolean']['output'];
  businessCalendarId?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['DateTime']['output'];
  defaultBufferTime: Scalars['Int']['output'];
  defaultLocation: Scalars['String']['output'];
  defaultMeetingDuration: Scalars['Int']['output'];
  id: Scalars['ID']['output'];
  includeDealContext: Scalars['Boolean']['output'];
  primaryCalendarId?: Maybe<Scalars['String']['output']>;
  reminderPreferences: Scalars['JSON']['output'];
  syncFutureDays: Scalars['Int']['output'];
  syncPastDays: Scalars['Int']['output'];
  updatedAt: Scalars['DateTime']['output'];
  workingHours: Scalars['JSON']['output'];
};

export type CalendarPreferencesInput = {
  autoAddDealParticipants?: InputMaybe<Scalars['Boolean']['input']>;
  autoAddGoogleMeet?: InputMaybe<Scalars['Boolean']['input']>;
  autoSyncEnabled?: InputMaybe<Scalars['Boolean']['input']>;
  businessCalendarId?: InputMaybe<Scalars['String']['input']>;
  defaultBufferTime?: InputMaybe<Scalars['Int']['input']>;
  defaultLocation?: InputMaybe<Scalars['String']['input']>;
  defaultMeetingDuration?: InputMaybe<Scalars['Int']['input']>;
  includeDealContext?: InputMaybe<Scalars['Boolean']['input']>;
  primaryCalendarId?: InputMaybe<Scalars['String']['input']>;
  reminderPreferences?: InputMaybe<Scalars['JSON']['input']>;
  syncFutureDays?: InputMaybe<Scalars['Int']['input']>;
  syncPastDays?: InputMaybe<Scalars['Int']['input']>;
  workingHours?: InputMaybe<Scalars['JSON']['input']>;
};

export type CalendarReminderInput = {
  method: CalendarReminderMethod;
  minutes: Scalars['Int']['input'];
};

export type CalendarReminderMethod =
  | 'EMAIL'
  | 'POPUP';

export type CalendarResponseStatus =
  | 'ACCEPTED'
  | 'DECLINED'
  | 'NEEDS_ACTION'
  | 'TENTATIVE';

export type CalendarSyncAction =
  | 'ADD_CRM_CONTEXT'
  | 'CREATE_EVENT'
  | 'DELETE_EVENT'
  | 'FULL_SYNC'
  | 'INCREMENTAL_SYNC'
  | 'UPDATE_EVENT';

export type CalendarSyncStatus = {
  __typename?: 'CalendarSyncStatus';
  errorMessage?: Maybe<Scalars['String']['output']>;
  eventsCount: Scalars['Int']['output'];
  hasSyncErrors: Scalars['Boolean']['output'];
  isConnected: Scalars['Boolean']['output'];
  lastSyncAt?: Maybe<Scalars['DateTime']['output']>;
  nextSyncAt?: Maybe<Scalars['DateTime']['output']>;
  syncDuration?: Maybe<Scalars['Int']['output']>;
};

export type CalendarTimeRangeInput = {
  end: Scalars['DateTime']['input'];
  start: Scalars['DateTime']['input'];
};

export type ComposeEmailInput = {
  attachments?: InputMaybe<Array<EmailAttachmentInput>>;
  bcc?: InputMaybe<Array<Scalars['String']['input']>>;
  body: Scalars['String']['input'];
  cc?: InputMaybe<Array<Scalars['String']['input']>>;
  dealId?: InputMaybe<Scalars['String']['input']>;
  entityId?: InputMaybe<Scalars['String']['input']>;
  entityType?: InputMaybe<Scalars['String']['input']>;
  subject: Scalars['String']['input'];
  threadId?: InputMaybe<Scalars['String']['input']>;
  to: Array<Scalars['String']['input']>;
};

export type ConnectGoogleIntegrationInput = {
  tokenData: GoogleTokenInput;
};

export type ContactRoleType =
  | 'CC'
  | 'PARTICIPANT'
  | 'PRIMARY';

export type ContactScopeType =
  | 'ALL'
  | 'CUSTOM'
  | 'PRIMARY'
  | 'SELECTED_ROLES';

export type ContactSuggestion = {
  __typename?: 'ContactSuggestion';
  email: Scalars['String']['output'];
  name?: Maybe<Scalars['String']['output']>;
  photoUrl?: Maybe<Scalars['String']['output']>;
};

export type ContextualTaskCreationInput = {
  assignedToUserId?: InputMaybe<Scalars['ID']['input']>;
  dealId?: InputMaybe<Scalars['ID']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  dueDate?: InputMaybe<Scalars['DateTime']['input']>;
  leadId?: InputMaybe<Scalars['ID']['input']>;
  organizationId?: InputMaybe<Scalars['ID']['input']>;
  personId?: InputMaybe<Scalars['ID']['input']>;
  priority?: InputMaybe<TaskPriority>;
  taskType: TaskType;
  templateId?: InputMaybe<Scalars['ID']['input']>;
  title: Scalars['String']['input'];
};

export type ConversionHistory = {
  __typename?: 'ConversionHistory';
  conversionData?: Maybe<Scalars['JSON']['output']>;
  conversionReason?: Maybe<ConversionReason>;
  conversionType: ConversionType;
  convertedAt: Scalars['DateTime']['output'];
  convertedByUser?: Maybe<User>;
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  sourceEntityId: Scalars['ID']['output'];
  sourceEntityType: Scalars['String']['output'];
  targetEntityId: Scalars['ID']['output'];
  targetEntityType: Scalars['String']['output'];
  wfmTransitionPlan?: Maybe<Scalars['JSON']['output']>;
};

export type ConversionReason =
  | 'BUDGET_CONSTRAINTS'
  | 'COMPETITIVE_LOSS'
  | 'COOLING'
  | 'DEMO_SCHEDULED'
  | 'HOT_LEAD'
  | 'QUALIFIED'
  | 'RELATIONSHIP_RESET'
  | 'REQUIREMENTS_CHANGE'
  | 'STAKEHOLDER_CHANGE'
  | 'TIMELINE_EXTENDED'
  | 'budget'
  | 'competition'
  | 'nurture'
  | 'other'
  | 'requirements'
  | 'timing'
  | 'unqualified';

export type ConversionResult = {
  __typename?: 'ConversionResult';
  convertedAmount: Scalars['Float']['output'];
  convertedCurrency: Scalars['String']['output'];
  effectiveDate: Scalars['String']['output'];
  exchangeRate: Scalars['Float']['output'];
  formattedConverted: Scalars['String']['output'];
  formattedOriginal: Scalars['String']['output'];
  originalAmount: Scalars['Float']['output'];
  originalCurrency: Scalars['String']['output'];
};

export type ConversionType =
  | 'DEAL_TO_LEAD'
  | 'LEAD_TO_DEAL';

export type ConversionValidationResult = {
  __typename?: 'ConversionValidationResult';
  canProceed: Scalars['Boolean']['output'];
  errors?: Maybe<Array<Scalars['String']['output']>>;
  isValid: Scalars['Boolean']['output'];
  sourceEntity?: Maybe<Scalars['JSON']['output']>;
  warnings?: Maybe<Array<Scalars['String']['output']>>;
};

export type ConvertedEntities = {
  __typename?: 'ConvertedEntities';
  deal?: Maybe<Deal>;
  organization?: Maybe<Organization>;
  person?: Maybe<Person>;
};

export type CreateAgentV2ConversationInput = {
  initialContext?: InputMaybe<Scalars['JSON']['input']>;
};

export type CreateCalendarEventInput = {
  addGoogleMeet?: InputMaybe<Scalars['Boolean']['input']>;
  attendeeEmails?: InputMaybe<Array<Scalars['String']['input']>>;
  calendarId?: InputMaybe<Scalars['String']['input']>;
  dealId?: InputMaybe<Scalars['ID']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  endDateTime: Scalars['DateTime']['input'];
  eventType?: InputMaybe<CalendarEventType>;
  location?: InputMaybe<Scalars['String']['input']>;
  organizationId?: InputMaybe<Scalars['ID']['input']>;
  personId?: InputMaybe<Scalars['ID']['input']>;
  reminders?: InputMaybe<Array<CalendarReminderInput>>;
  startDateTime: Scalars['DateTime']['input'];
  timezone?: InputMaybe<Scalars['String']['input']>;
  title: Scalars['String']['input'];
};

export type CreateContactFromEmailInput = {
  addAsDealParticipant?: InputMaybe<Scalars['Boolean']['input']>;
  dealId?: InputMaybe<Scalars['String']['input']>;
  emailAddress: Scalars['String']['input'];
  emailId: Scalars['String']['input'];
  firstName?: InputMaybe<Scalars['String']['input']>;
  lastName?: InputMaybe<Scalars['String']['input']>;
  notes?: InputMaybe<Scalars['String']['input']>;
  organizationId?: InputMaybe<Scalars['ID']['input']>;
};

export type CreateCurrencyInput = {
  code: Scalars['String']['input'];
  decimalPlaces?: InputMaybe<Scalars['Int']['input']>;
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  name: Scalars['String']['input'];
  symbol: Scalars['String']['input'];
};

export type CreateDealFolderInput = {
  dealId: Scalars['ID']['input'];
  dealName: Scalars['String']['input'];
  parentFolderId?: InputMaybe<Scalars['String']['input']>;
  templateStructure?: InputMaybe<Scalars['Boolean']['input']>;
};

export type CreateDocumentInput = {
  entityId: Scalars['ID']['input'];
  entityType: EntityType;
  fileName: Scalars['String']['input'];
  fileSizeBytes?: InputMaybe<Scalars['Int']['input']>;
  googleDriveFileId?: InputMaybe<Scalars['String']['input']>;
  mimeType?: InputMaybe<Scalars['String']['input']>;
};

export type CreateEmailInput = {
  bccEmails?: InputMaybe<Array<Scalars['String']['input']>>;
  bodyPreview?: InputMaybe<Scalars['String']['input']>;
  ccEmails?: InputMaybe<Array<Scalars['String']['input']>>;
  entityId?: InputMaybe<Scalars['ID']['input']>;
  entityType?: InputMaybe<EntityType>;
  fromEmail: Scalars['String']['input'];
  fullBody?: InputMaybe<Scalars['String']['input']>;
  gmailLabels?: InputMaybe<Array<Scalars['String']['input']>>;
  gmailMessageId?: InputMaybe<Scalars['String']['input']>;
  gmailThreadId?: InputMaybe<Scalars['String']['input']>;
  hasAttachments: Scalars['Boolean']['input'];
  isOutbound: Scalars['Boolean']['input'];
  isRead: Scalars['Boolean']['input'];
  sentAt: Scalars['DateTime']['input'];
  subject: Scalars['String']['input'];
  toEmails: Array<Scalars['String']['input']>;
};

export type CreateStickerInput = {
  categoryId?: InputMaybe<Scalars['ID']['input']>;
  color?: InputMaybe<Scalars['String']['input']>;
  content?: InputMaybe<Scalars['String']['input']>;
  entityId: Scalars['ID']['input'];
  entityType: EntityType;
  height?: InputMaybe<Scalars['Int']['input']>;
  isPinned?: InputMaybe<Scalars['Boolean']['input']>;
  isPrivate?: InputMaybe<Scalars['Boolean']['input']>;
  mentions?: InputMaybe<Array<Scalars['ID']['input']>>;
  positionX?: InputMaybe<Scalars['Int']['input']>;
  positionY?: InputMaybe<Scalars['Int']['input']>;
  priority?: InputMaybe<StickerPriority>;
  tags?: InputMaybe<Array<Scalars['String']['input']>>;
  title: Scalars['String']['input'];
  width?: InputMaybe<Scalars['Int']['input']>;
};

export type CreateSystemNotificationInput = {
  actionUrl?: InputMaybe<Scalars['String']['input']>;
  entityId?: InputMaybe<Scalars['ID']['input']>;
  entityType?: InputMaybe<Scalars['String']['input']>;
  expiresAt?: InputMaybe<Scalars['DateTime']['input']>;
  message: Scalars['String']['input'];
  metadata?: InputMaybe<Scalars['JSON']['input']>;
  notificationType: SystemNotificationType;
  priority?: InputMaybe<NotificationPriority>;
  title: Scalars['String']['input'];
  userId: Scalars['ID']['input'];
};

export type CreateTaskAutomationRuleInput = {
  appliesToEntityType: TaskEntityType;
  description?: InputMaybe<Scalars['String']['input']>;
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  name: Scalars['String']['input'];
  taskTemplate: Scalars['JSON']['input'];
  triggerConditions: Scalars['JSON']['input'];
  triggerEvent: Scalars['String']['input'];
};

export type CreateTaskDependencyInput = {
  dependencyType?: InputMaybe<Scalars['String']['input']>;
  dependsOnTaskId: Scalars['ID']['input'];
  taskId: Scalars['ID']['input'];
};

export type CreateTaskInput = {
  affectsLeadScoring?: InputMaybe<Scalars['Boolean']['input']>;
  assignedToUserId?: InputMaybe<Scalars['ID']['input']>;
  blocksStageProgression?: InputMaybe<Scalars['Boolean']['input']>;
  completionTriggersStageChange?: InputMaybe<Scalars['Boolean']['input']>;
  customFieldValues?: InputMaybe<Array<CustomFieldValueInput>>;
  dealId?: InputMaybe<Scalars['ID']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  dueDate?: InputMaybe<Scalars['DateTime']['input']>;
  entityId: Scalars['ID']['input'];
  entityType: TaskEntityType;
  estimatedHours?: InputMaybe<Scalars['Int']['input']>;
  leadId?: InputMaybe<Scalars['ID']['input']>;
  organizationId?: InputMaybe<Scalars['ID']['input']>;
  parentTaskId?: InputMaybe<Scalars['ID']['input']>;
  personId?: InputMaybe<Scalars['ID']['input']>;
  priority?: InputMaybe<TaskPriority>;
  requiredForDealClosure?: InputMaybe<Scalars['Boolean']['input']>;
  status?: InputMaybe<TaskStatus>;
  tags?: InputMaybe<Array<Scalars['String']['input']>>;
  taskType: TaskType;
  title: Scalars['String']['input'];
  wfmProjectId?: InputMaybe<Scalars['ID']['input']>;
};

export type CreateWfmProjectTypeInput = {
  defaultWorkflowId?: InputMaybe<Scalars['ID']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  iconName?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
};

export type CreateWfmStatusInput = {
  color?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
};

export type CreateWfmWorkflowInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
};

export type CreateWfmWorkflowStepInput = {
  isFinalStep?: InputMaybe<Scalars['Boolean']['input']>;
  isInitialStep?: InputMaybe<Scalars['Boolean']['input']>;
  metadata?: InputMaybe<Scalars['JSON']['input']>;
  statusId: Scalars['ID']['input'];
  stepOrder: Scalars['Int']['input'];
  workflowId: Scalars['ID']['input'];
};

export type CreateWfmWorkflowTransitionInput = {
  fromStepId: Scalars['ID']['input'];
  name?: InputMaybe<Scalars['String']['input']>;
  toStepId: Scalars['ID']['input'];
  workflowId: Scalars['ID']['input'];
};

export type Currency = {
  __typename?: 'Currency';
  code: Scalars['String']['output'];
  createdAt: Scalars['String']['output'];
  decimalPlaces: Scalars['Int']['output'];
  isActive: Scalars['Boolean']['output'];
  name: Scalars['String']['output'];
  symbol: Scalars['String']['output'];
  updatedAt: Scalars['String']['output'];
};

export type CurrencyAmount = {
  __typename?: 'CurrencyAmount';
  amount: Scalars['Float']['output'];
  currency: Scalars['String']['output'];
  formattedAmount: Scalars['String']['output'];
};

export type CurrencyOperationResult = {
  __typename?: 'CurrencyOperationResult';
  message: Scalars['String']['output'];
  success: Scalars['Boolean']['output'];
};

export type CustomFieldDefinition = {
  __typename?: 'CustomFieldDefinition';
  createdAt: Scalars['DateTime']['output'];
  displayOrder: Scalars['Int']['output'];
  dropdownOptions?: Maybe<Array<CustomFieldOption>>;
  entityType: CustomFieldEntityType;
  fieldLabel: Scalars['String']['output'];
  fieldName: Scalars['String']['output'];
  fieldType: CustomFieldType;
  id: Scalars['ID']['output'];
  isActive: Scalars['Boolean']['output'];
  isRequired: Scalars['Boolean']['output'];
  updatedAt: Scalars['DateTime']['output'];
};

export type CustomFieldDefinitionInput = {
  displayOrder?: InputMaybe<Scalars['Int']['input']>;
  dropdownOptions?: InputMaybe<Array<CustomFieldOptionInput>>;
  entityType: CustomFieldEntityType;
  fieldLabel: Scalars['String']['input'];
  fieldName: Scalars['String']['input'];
  fieldType: CustomFieldType;
  isRequired?: InputMaybe<Scalars['Boolean']['input']>;
};

export type CustomFieldEntityType =
  | 'DEAL'
  | 'LEAD'
  | 'ORGANIZATION'
  | 'PERSON';

export type CustomFieldOption = {
  __typename?: 'CustomFieldOption';
  label: Scalars['String']['output'];
  value: Scalars['String']['output'];
};

export type CustomFieldOptionInput = {
  label: Scalars['String']['input'];
  value: Scalars['String']['input'];
};

export type CustomFieldType =
  | 'BOOLEAN'
  | 'DATE'
  | 'DROPDOWN'
  | 'MULTI_SELECT'
  | 'NUMBER'
  | 'TEXT'
  | 'TEXT_AREA';

export type CustomFieldValue = {
  __typename?: 'CustomFieldValue';
  booleanValue?: Maybe<Scalars['Boolean']['output']>;
  dateValue?: Maybe<Scalars['DateTime']['output']>;
  definition: CustomFieldDefinition;
  numberValue?: Maybe<Scalars['Float']['output']>;
  selectedOptionValues?: Maybe<Array<Scalars['String']['output']>>;
  stringValue?: Maybe<Scalars['String']['output']>;
};

export type CustomFieldValueInput = {
  booleanValue?: InputMaybe<Scalars['Boolean']['input']>;
  dateValue?: InputMaybe<Scalars['DateTime']['input']>;
  definitionId: Scalars['ID']['input'];
  numberValue?: InputMaybe<Scalars['Float']['input']>;
  selectedOptionValues?: InputMaybe<Array<Scalars['String']['input']>>;
  stringValue?: InputMaybe<Scalars['String']['input']>;
};

export type Deal = {
  __typename?: 'Deal';
  amount?: Maybe<Scalars['Float']['output']>;
  amountUsd?: Maybe<Scalars['Float']['output']>;
  amount_usd?: Maybe<Scalars['Float']['output']>;
  assignedToUser?: Maybe<User>;
  assigned_to_user_id?: Maybe<Scalars['ID']['output']>;
  conversionHistory: Array<ConversionHistory>;
  conversionReason?: Maybe<Scalars['String']['output']>;
  convertedToLead?: Maybe<Lead>;
  createdBy: User;
  created_at: Scalars['DateTime']['output'];
  currency?: Maybe<Scalars['String']['output']>;
  currentWfmStatus?: Maybe<WfmStatus>;
  currentWfmStep?: Maybe<WfmWorkflowStep>;
  customFieldValues: Array<CustomFieldValue>;
  deal_specific_probability?: Maybe<Scalars['Float']['output']>;
  exchangeRateUsed?: Maybe<Scalars['Float']['output']>;
  exchange_rate_used?: Maybe<Scalars['Float']['output']>;
  expected_close_date?: Maybe<Scalars['DateTime']['output']>;
  formattedAmount?: Maybe<Scalars['String']['output']>;
  history?: Maybe<Array<DealHistoryEntry>>;
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  organization?: Maybe<Organization>;
  organization_id?: Maybe<Scalars['ID']['output']>;
  participants: Array<DealParticipant>;
  person?: Maybe<Person>;
  person_id?: Maybe<Scalars['ID']['output']>;
  project_id: Scalars['String']['output'];
  updated_at: Scalars['DateTime']['output'];
  user_id: Scalars['ID']['output'];
  weighted_amount?: Maybe<Scalars['Float']['output']>;
  wfmProject?: Maybe<WfmProject>;
  wfm_project_id?: Maybe<Scalars['ID']['output']>;
};


export type DealHistoryArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
};

export type DealDocumentAttachment = {
  __typename?: 'DealDocumentAttachment';
  attachedAt: Scalars['String']['output'];
  attachedBy: Scalars['ID']['output'];
  category?: Maybe<DocumentCategory>;
  dealId: Scalars['ID']['output'];
  fileName: Scalars['String']['output'];
  fileSize?: Maybe<Scalars['Int']['output']>;
  fileUrl: Scalars['String']['output'];
  googleFileId: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  mimeType?: Maybe<Scalars['String']['output']>;
  sharedDriveId?: Maybe<Scalars['String']['output']>;
};

export type DealFolderInfo = {
  __typename?: 'DealFolderInfo';
  dealFolder?: Maybe<DriveFolder>;
  exists: Scalars['Boolean']['output'];
  subfolders?: Maybe<DealSubfolders>;
};

export type DealHistoryEntry = {
  __typename?: 'DealHistoryEntry';
  changes?: Maybe<Scalars['JSON']['output']>;
  createdAt: Scalars['DateTime']['output'];
  eventType: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  user?: Maybe<User>;
};

export type DealInput = {
  amount?: InputMaybe<Scalars['Float']['input']>;
  assignedToUserId?: InputMaybe<Scalars['ID']['input']>;
  currency?: InputMaybe<Scalars['String']['input']>;
  customFields?: InputMaybe<Array<CustomFieldValueInput>>;
  deal_specific_probability?: InputMaybe<Scalars['Float']['input']>;
  expected_close_date?: InputMaybe<Scalars['DateTime']['input']>;
  name: Scalars['String']['input'];
  organization_id?: InputMaybe<Scalars['ID']['input']>;
  person_id?: InputMaybe<Scalars['ID']['input']>;
  wfmProjectTypeId: Scalars['ID']['input'];
};

export type DealParticipant = {
  __typename?: 'DealParticipant';
  addedFromEmail: Scalars['Boolean']['output'];
  createdAt: Scalars['DateTime']['output'];
  createdByUserId: Scalars['ID']['output'];
  dealId: Scalars['ID']['output'];
  id: Scalars['ID']['output'];
  person: Person;
  personId: Scalars['ID']['output'];
  role: ContactRoleType;
};

export type DealParticipantInput = {
  addedFromEmail?: InputMaybe<Scalars['Boolean']['input']>;
  dealId: Scalars['ID']['input'];
  personId: Scalars['ID']['input'];
  role?: InputMaybe<ContactRoleType>;
};

export type DealSubfolders = {
  __typename?: 'DealSubfolders';
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
  __typename?: 'DealTaskIndicator';
  dealId: Scalars['ID']['output'];
  tasksDueToday: Scalars['Int']['output'];
  tasksOverdue: Scalars['Int']['output'];
  totalActiveTasks: Scalars['Int']['output'];
};

export type DealToLeadConversionInput = {
  archiveDeal?: InputMaybe<Scalars['Boolean']['input']>;
  conversionReason: ConversionReason;
  createConversionActivity?: InputMaybe<Scalars['Boolean']['input']>;
  leadData?: InputMaybe<LeadConversionData>;
  notes?: InputMaybe<Scalars['String']['input']>;
  preserveActivities?: InputMaybe<Scalars['Boolean']['input']>;
  reactivationPlan?: InputMaybe<ReactivationPlanInput>;
};

export type DealToLeadConversionResult = {
  __typename?: 'DealToLeadConversionResult';
  conversionHistory?: Maybe<ConversionHistory>;
  conversionId: Scalars['ID']['output'];
  errors?: Maybe<Array<Scalars['String']['output']>>;
  lead?: Maybe<Lead>;
  message: Scalars['String']['output'];
  reactivationPlan?: Maybe<ReactivationPlan>;
  success: Scalars['Boolean']['output'];
};

export type DealUpdateInput = {
  amount?: InputMaybe<Scalars['Float']['input']>;
  assignedToUserId?: InputMaybe<Scalars['ID']['input']>;
  currency?: InputMaybe<Scalars['String']['input']>;
  customFields?: InputMaybe<Array<CustomFieldValueInput>>;
  deal_specific_probability?: InputMaybe<Scalars['Float']['input']>;
  expected_close_date?: InputMaybe<Scalars['DateTime']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  organization_id?: InputMaybe<Scalars['ID']['input']>;
  person_id?: InputMaybe<Scalars['ID']['input']>;
};

export type DealsByCurrencyResult = {
  __typename?: 'DealsByCurrencyResult';
  count: Scalars['Int']['output'];
  currency: Scalars['String']['output'];
  formattedTotal: Scalars['String']['output'];
  totalAmount: Scalars['Float']['output'];
  totalAmountUsd: Scalars['Float']['output'];
};

export type Document = {
  __typename?: 'Document';
  createdAt: Scalars['DateTime']['output'];
  createdByUser: User;
  entityId: Scalars['ID']['output'];
  entityType: EntityType;
  fileName: Scalars['String']['output'];
  fileSizeBytes?: Maybe<Scalars['Int']['output']>;
  googleDriveDownloadLink?: Maybe<Scalars['String']['output']>;
  googleDriveFileId?: Maybe<Scalars['String']['output']>;
  googleDriveFolderId?: Maybe<Scalars['String']['output']>;
  googleDriveWebViewLink?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  isPublic: Scalars['Boolean']['output'];
  lastSyncedAt?: Maybe<Scalars['DateTime']['output']>;
  mimeType?: Maybe<Scalars['String']['output']>;
  sharedWithUsers: Array<Scalars['ID']['output']>;
  updatedAt: Scalars['DateTime']['output'];
};

export type DocumentCategory =
  | 'CLIENT_DOCUMENT'
  | 'CLIENT_REQUEST'
  | 'CONTRACT'
  | 'CORRESPONDENCE'
  | 'OTHER'
  | 'PRESENTATION'
  | 'PROPOSAL';

export type DriveFile = {
  __typename?: 'DriveFile';
  createdTime: Scalars['String']['output'];
  iconLink?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  mimeType: Scalars['String']['output'];
  modifiedTime: Scalars['String']['output'];
  name: Scalars['String']['output'];
  owners?: Maybe<Array<DriveFileOwner>>;
  parents?: Maybe<Array<Scalars['String']['output']>>;
  size?: Maybe<Scalars['Int']['output']>;
  thumbnailLink?: Maybe<Scalars['String']['output']>;
  webContentLink?: Maybe<Scalars['String']['output']>;
  webViewLink?: Maybe<Scalars['String']['output']>;
};

export type DriveFileConnection = {
  __typename?: 'DriveFileConnection';
  files: Array<DriveFile>;
  totalCount: Scalars['Int']['output'];
};

export type DriveFileOwner = {
  __typename?: 'DriveFileOwner';
  displayName: Scalars['String']['output'];
  emailAddress: Scalars['String']['output'];
};

export type DriveFolder = {
  __typename?: 'DriveFolder';
  createdTime: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  modifiedTime: Scalars['String']['output'];
  name: Scalars['String']['output'];
  parents?: Maybe<Array<Scalars['String']['output']>>;
  webViewLink: Scalars['String']['output'];
};

export type DriveFolderBrowseInput = {
  includeFiles?: InputMaybe<Scalars['Boolean']['input']>;
  parentFolderId?: InputMaybe<Scalars['String']['input']>;
};

export type DriveFolderConnection = {
  __typename?: 'DriveFolderConnection';
  folders: Array<DriveFolder>;
  totalCount: Scalars['Int']['output'];
};

export type DriveFolderStructure = {
  __typename?: 'DriveFolderStructure';
  dealFolder: DriveFolder;
  subfolders: DriveFolderSubfolders;
};

export type DriveFolderSubfolders = {
  __typename?: 'DriveFolderSubfolders';
  contracts?: Maybe<DriveFolder>;
  correspondence?: Maybe<DriveFolder>;
  legal?: Maybe<DriveFolder>;
  presentations?: Maybe<DriveFolder>;
  proposals?: Maybe<DriveFolder>;
};

export type DrivePermissionInput = {
  domain?: InputMaybe<Scalars['String']['input']>;
  emailAddress?: InputMaybe<Scalars['String']['input']>;
  role: DrivePermissionRole;
  type: DrivePermissionType;
};

export type DrivePermissionRole =
  | 'COMMENTER'
  | 'FILE_ORGANIZER'
  | 'ORGANIZER'
  | 'OWNER'
  | 'READER'
  | 'WRITER';

export type DrivePermissionType =
  | 'ANYONE'
  | 'DOMAIN'
  | 'GROUP'
  | 'USER';

export type DriveSearchInput = {
  folderId?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  query?: InputMaybe<Scalars['String']['input']>;
};

export type DualAttachmentResponse = {
  __typename?: 'DualAttachmentResponse';
  dealAttachment: DealDocumentAttachment;
  noteAttachment: NoteDocumentAttachment;
};

export type Email = {
  __typename?: 'Email';
  bccEmails: Array<Scalars['String']['output']>;
  bodyPreview?: Maybe<Scalars['String']['output']>;
  ccEmails: Array<Scalars['String']['output']>;
  createdAt: Scalars['DateTime']['output'];
  createdByUser: User;
  entityId?: Maybe<Scalars['ID']['output']>;
  entityType?: Maybe<EntityType>;
  fromEmail: Scalars['String']['output'];
  fullBody?: Maybe<Scalars['String']['output']>;
  gmailLabels: Array<Scalars['String']['output']>;
  gmailMessageId?: Maybe<Scalars['String']['output']>;
  gmailThreadId?: Maybe<Scalars['String']['output']>;
  hasAttachments: Scalars['Boolean']['output'];
  id: Scalars['ID']['output'];
  isOutbound: Scalars['Boolean']['output'];
  isRead: Scalars['Boolean']['output'];
  sentAt: Scalars['DateTime']['output'];
  subject: Scalars['String']['output'];
  toEmails: Array<Scalars['String']['output']>;
  updatedAt: Scalars['DateTime']['output'];
};

export type EmailActivity = {
  __typename?: 'EmailActivity';
  activityType: EmailActivityType;
  createdAt: Scalars['DateTime']['output'];
  email: Email;
  id: Scalars['ID']['output'];
  metadata?: Maybe<Scalars['JSON']['output']>;
  occurredAt: Scalars['DateTime']['output'];
};

export type EmailActivityType =
  | 'CLICKED_LINK'
  | 'DELIVERED'
  | 'FORWARDED'
  | 'OPENED'
  | 'REPLIED'
  | 'SENT';

export type EmailAnalytics = {
  __typename?: 'EmailAnalytics';
  avgResponseTime?: Maybe<Scalars['String']['output']>;
  emailSentiment?: Maybe<Scalars['String']['output']>;
  lastContactTime?: Maybe<Scalars['String']['output']>;
  responseRate?: Maybe<Scalars['Float']['output']>;
  totalThreads: Scalars['Int']['output'];
  unreadCount: Scalars['Int']['output'];
};

export type EmailAttachment = {
  __typename?: 'EmailAttachment';
  downloadUrl?: Maybe<Scalars['String']['output']>;
  filename: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  mimeType: Scalars['String']['output'];
  size: Scalars['Int']['output'];
};

export type EmailAttachmentInput = {
  content: Scalars['String']['input'];
  filename: Scalars['String']['input'];
  mimeType: Scalars['String']['input'];
};

export type EmailImportance =
  | 'HIGH'
  | 'LOW'
  | 'NORMAL';

export type EmailMessage = {
  __typename?: 'EmailMessage';
  attachments?: Maybe<Array<EmailAttachment>>;
  bcc?: Maybe<Array<Scalars['String']['output']>>;
  body: Scalars['String']['output'];
  cc?: Maybe<Array<Scalars['String']['output']>>;
  from: Scalars['String']['output'];
  hasAttachments: Scalars['Boolean']['output'];
  htmlBody?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  importance?: Maybe<EmailImportance>;
  isUnread: Scalars['Boolean']['output'];
  labels?: Maybe<Array<Scalars['String']['output']>>;
  subject: Scalars['String']['output'];
  threadId: Scalars['String']['output'];
  timestamp: Scalars['String']['output'];
  to: Array<Scalars['String']['output']>;
};

export type EmailPin = {
  __typename?: 'EmailPin';
  createdAt: Scalars['DateTime']['output'];
  dealId: Scalars['ID']['output'];
  emailId: Scalars['String']['output'];
  fromEmail?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  notes?: Maybe<Scalars['String']['output']>;
  pinnedAt: Scalars['DateTime']['output'];
  subject?: Maybe<Scalars['String']['output']>;
  threadId: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
  userId: Scalars['ID']['output'];
};

export type EmailThread = {
  __typename?: 'EmailThread';
  dealId?: Maybe<Scalars['String']['output']>;
  entityId?: Maybe<Scalars['String']['output']>;
  entityType?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  isUnread: Scalars['Boolean']['output'];
  lastActivity: Scalars['String']['output'];
  latestMessage?: Maybe<EmailMessage>;
  messageCount: Scalars['Int']['output'];
  participants: Array<Scalars['String']['output']>;
  subject: Scalars['String']['output'];
};

export type EmailThreadConnection = {
  __typename?: 'EmailThreadConnection';
  hasNextPage: Scalars['Boolean']['output'];
  nextPageToken?: Maybe<Scalars['String']['output']>;
  threads: Array<EmailThread>;
  totalCount: Scalars['Int']['output'];
};

export type EmailThreadsFilterInput = {
  contactEmail?: InputMaybe<Scalars['String']['input']>;
  contactScope?: InputMaybe<ContactScopeType>;
  dateFrom?: InputMaybe<Scalars['String']['input']>;
  dateTo?: InputMaybe<Scalars['String']['input']>;
  dealId?: InputMaybe<Scalars['String']['input']>;
  hasAttachments?: InputMaybe<Scalars['Boolean']['input']>;
  includeAllParticipants?: InputMaybe<Scalars['Boolean']['input']>;
  isUnread?: InputMaybe<Scalars['Boolean']['input']>;
  keywords?: InputMaybe<Array<Scalars['String']['input']>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  pageToken?: InputMaybe<Scalars['String']['input']>;
  selectedContacts?: InputMaybe<Array<Scalars['String']['input']>>;
};

export type EntityType =
  | 'DEAL'
  | 'LEAD'
  | 'ORGANIZATION'
  | 'PERSON';

export type EntityTypeEnum =
  | 'ACTIVITY'
  | 'DEAL'
  | 'LEAD'
  | 'ORGANIZATION'
  | 'PERSON'
  | 'TASK';

export type ExchangeRate = {
  __typename?: 'ExchangeRate';
  createdAt: Scalars['String']['output'];
  effectiveDate: Scalars['String']['output'];
  fromCurrency: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  rate: Scalars['Float']['output'];
  source: Scalars['String']['output'];
  toCurrency: Scalars['String']['output'];
  updatedAt: Scalars['String']['output'];
};

export type ExtendedThinkingAnalysis = {
  __typename?: 'ExtendedThinkingAnalysis';
  identifiedConcerns: Array<Scalars['String']['output']>;
  reasoningDepth: Scalars['Float']['output'];
  recommendedActions: Array<Scalars['String']['output']>;
  strategicInsights: Array<Scalars['String']['output']>;
  thinkingBudgetUsed: ThinkingBudget;
  totalThoughts: Scalars['Int']['output'];
};

export type GenerateTaskContentInput = {
  emailId: Scalars['String']['input'];
  threadId?: InputMaybe<Scalars['String']['input']>;
  useWholeThread: Scalars['Boolean']['input'];
};

export type GoogleCalendar = {
  __typename?: 'GoogleCalendar';
  accessRole: Scalars['String']['output'];
  backgroundColor?: Maybe<Scalars['String']['output']>;
  colorId?: Maybe<Scalars['String']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  foregroundColor?: Maybe<Scalars['String']['output']>;
  id: Scalars['String']['output'];
  primary?: Maybe<Scalars['Boolean']['output']>;
  summary: Scalars['String']['output'];
  timeZone: Scalars['String']['output'];
};

/** Google Drive specific configuration */
export type GoogleDriveConfig = {
  __typename?: 'GoogleDriveConfig';
  auto_create_deal_folders: Scalars['Boolean']['output'];
  deal_folder_template: Scalars['Boolean']['output'];
  pipecd_deals_folder_id?: Maybe<Scalars['String']['output']>;
};

export type GoogleIntegrationStatus = {
  __typename?: 'GoogleIntegrationStatus';
  hasCalendarAccess: Scalars['Boolean']['output'];
  hasContactsAccess: Scalars['Boolean']['output'];
  hasDriveAccess: Scalars['Boolean']['output'];
  hasGmailAccess: Scalars['Boolean']['output'];
  hasGoogleAuth: Scalars['Boolean']['output'];
  isConnected: Scalars['Boolean']['output'];
  missingScopes: Array<Scalars['String']['output']>;
  tokenExpiry?: Maybe<Scalars['DateTime']['output']>;
};

export type GoogleTokenData = {
  __typename?: 'GoogleTokenData';
  access_token: Scalars['String']['output'];
  expires_at?: Maybe<Scalars['DateTime']['output']>;
  granted_scopes: Array<Scalars['String']['output']>;
  refresh_token?: Maybe<Scalars['String']['output']>;
};

export type GoogleTokenInput = {
  access_token: Scalars['String']['input'];
  expires_at?: InputMaybe<Scalars['DateTime']['input']>;
  granted_scopes: Array<Scalars['String']['input']>;
  refresh_token?: InputMaybe<Scalars['String']['input']>;
};

export type Lead = {
  __typename?: 'Lead';
  ai_insights?: Maybe<Scalars['JSON']['output']>;
  assignedToUser?: Maybe<User>;
  assigned_at?: Maybe<Scalars['DateTime']['output']>;
  assigned_to_user_id?: Maybe<Scalars['ID']['output']>;
  automation_score_factors?: Maybe<Scalars['JSON']['output']>;
  company_name?: Maybe<Scalars['String']['output']>;
  contact_email?: Maybe<Scalars['String']['output']>;
  contact_name?: Maybe<Scalars['String']['output']>;
  contact_phone?: Maybe<Scalars['String']['output']>;
  conversionHistory: Array<ConversionHistory>;
  conversionReason?: Maybe<Scalars['String']['output']>;
  converted_at?: Maybe<Scalars['DateTime']['output']>;
  converted_by_user?: Maybe<User>;
  converted_by_user_id?: Maybe<Scalars['ID']['output']>;
  converted_to_deal?: Maybe<Deal>;
  converted_to_deal_id?: Maybe<Scalars['ID']['output']>;
  converted_to_organization?: Maybe<Organization>;
  converted_to_organization_id?: Maybe<Scalars['ID']['output']>;
  converted_to_person?: Maybe<Person>;
  converted_to_person_id?: Maybe<Scalars['ID']['output']>;
  createdBy: User;
  created_at: Scalars['DateTime']['output'];
  currency?: Maybe<Scalars['String']['output']>;
  currentWfmStatus?: Maybe<WfmStatus>;
  currentWfmStep?: Maybe<WfmWorkflowStep>;
  customFieldValues: Array<CustomFieldValue>;
  description?: Maybe<Scalars['String']['output']>;
  estimatedValueUsd?: Maybe<Scalars['Float']['output']>;
  estimated_close_date?: Maybe<Scalars['DateTime']['output']>;
  estimated_value?: Maybe<Scalars['Float']['output']>;
  exchangeRateUsed?: Maybe<Scalars['Float']['output']>;
  formattedEstimatedValue?: Maybe<Scalars['String']['output']>;
  history?: Maybe<Array<Maybe<LeadHistoryEntry>>>;
  id: Scalars['ID']['output'];
  isQualified: Scalars['Boolean']['output'];
  last_activity_at: Scalars['DateTime']['output'];
  lead_score: Scalars['Int']['output'];
  lead_score_factors?: Maybe<Scalars['JSON']['output']>;
  name: Scalars['String']['output'];
  originalDeal?: Maybe<Deal>;
  qualificationLevel: Scalars['Float']['output'];
  qualificationStatus: Scalars['String']['output'];
  reactivationPlan?: Maybe<ReactivationPlan>;
  reactivationTargetDate?: Maybe<Scalars['DateTime']['output']>;
  source?: Maybe<Scalars['String']['output']>;
  updated_at: Scalars['DateTime']['output'];
  user_id: Scalars['ID']['output'];
  wfmProject?: Maybe<WfmProject>;
  wfm_project_id?: Maybe<Scalars['ID']['output']>;
};


export type LeadHistoryArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
};

export type LeadConversionData = {
  company_name?: InputMaybe<Scalars['String']['input']>;
  contact_email?: InputMaybe<Scalars['String']['input']>;
  contact_name?: InputMaybe<Scalars['String']['input']>;
  contact_phone?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  estimatedCloseDate?: InputMaybe<Scalars['DateTime']['input']>;
  estimatedValue?: InputMaybe<Scalars['Float']['input']>;
  estimated_close_date?: InputMaybe<Scalars['DateTime']['input']>;
  estimated_value?: InputMaybe<Scalars['Float']['input']>;
  leadScore?: InputMaybe<Scalars['Int']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  source?: InputMaybe<Scalars['String']['input']>;
};

export type LeadConversionInput = {
  createConversionActivity?: InputMaybe<Scalars['Boolean']['input']>;
  dealData?: InputMaybe<DealInput>;
  organizationData?: InputMaybe<OrganizationInput>;
  personData?: InputMaybe<PersonInput>;
  preserveActivities?: InputMaybe<Scalars['Boolean']['input']>;
  targetType: LeadConversionTargetType;
};

export type LeadConversionResult = {
  __typename?: 'LeadConversionResult';
  convertedEntities: ConvertedEntities;
  leadId: Scalars['ID']['output'];
};

export type LeadConversionTargetType =
  | 'ALL'
  | 'DEAL'
  | 'ORGANIZATION'
  | 'PERSON';

export type LeadFilters = {
  assignedToUserId?: InputMaybe<Scalars['ID']['input']>;
  convertedAfter?: InputMaybe<Scalars['DateTime']['input']>;
  convertedBefore?: InputMaybe<Scalars['DateTime']['input']>;
  createdAfter?: InputMaybe<Scalars['DateTime']['input']>;
  createdBefore?: InputMaybe<Scalars['DateTime']['input']>;
  isQualified?: InputMaybe<Scalars['Boolean']['input']>;
  leadScoreMax?: InputMaybe<Scalars['Int']['input']>;
  leadScoreMin?: InputMaybe<Scalars['Int']['input']>;
  qualificationLevel?: InputMaybe<Scalars['Float']['input']>;
  qualificationStatus?: InputMaybe<Scalars['String']['input']>;
  search?: InputMaybe<Scalars['String']['input']>;
  source?: InputMaybe<Scalars['String']['input']>;
};

export type LeadHistoryEntry = {
  __typename?: 'LeadHistoryEntry';
  changes?: Maybe<Scalars['JSON']['output']>;
  created_at: Scalars['DateTime']['output'];
  event_type: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  lead_id: Scalars['ID']['output'];
  user?: Maybe<User>;
  user_id?: Maybe<Scalars['ID']['output']>;
};

export type LeadInput = {
  assignedToUserId?: InputMaybe<Scalars['ID']['input']>;
  companyName?: InputMaybe<Scalars['String']['input']>;
  contactEmail?: InputMaybe<Scalars['String']['input']>;
  contactName?: InputMaybe<Scalars['String']['input']>;
  contactPhone?: InputMaybe<Scalars['String']['input']>;
  customFields?: InputMaybe<Array<CustomFieldValueInput>>;
  description?: InputMaybe<Scalars['String']['input']>;
  estimatedCloseDate?: InputMaybe<Scalars['DateTime']['input']>;
  estimatedValue?: InputMaybe<Scalars['Float']['input']>;
  name: Scalars['String']['input'];
  source?: InputMaybe<Scalars['String']['input']>;
  wfmProjectTypeId: Scalars['ID']['input'];
};

export type LeadUpdateInput = {
  assignedToUserId?: InputMaybe<Scalars['ID']['input']>;
  companyName?: InputMaybe<Scalars['String']['input']>;
  contactEmail?: InputMaybe<Scalars['String']['input']>;
  contactName?: InputMaybe<Scalars['String']['input']>;
  contactPhone?: InputMaybe<Scalars['String']['input']>;
  customFields?: InputMaybe<Array<CustomFieldValueInput>>;
  description?: InputMaybe<Scalars['String']['input']>;
  estimatedCloseDate?: InputMaybe<Scalars['DateTime']['input']>;
  estimatedValue?: InputMaybe<Scalars['Float']['input']>;
  leadScore?: InputMaybe<Scalars['Int']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  source?: InputMaybe<Scalars['String']['input']>;
};

export type LeadsStats = {
  __typename?: 'LeadsStats';
  averageLeadScore: Scalars['Float']['output'];
  averageQualificationLevel: Scalars['Float']['output'];
  conversionRate: Scalars['Float']['output'];
  convertedLeads: Scalars['Int']['output'];
  qualifiedLeads: Scalars['Int']['output'];
  totalLeads: Scalars['Int']['output'];
};

export type LogicalOperator =
  | 'AND'
  | 'OR';

export type Mutation = {
  __typename?: 'Mutation';
  activateBusinessRule: BusinessRule;
  addAgentThoughts: Array<AgentThought>;
  addAgentV2Thoughts: Array<AgentThought>;
  addDealContextToEvent: CalendarEvent;
  addDealParticipant: DealParticipant;
  archiveThread: Scalars['Boolean']['output'];
  assignAccountManager: Organization;
  assignTask: Task;
  assignUserRole: User;
  attachDocumentToDeal: DealDocumentAttachment;
  attachDocumentToNoteAndDeal: DualAttachmentResponse;
  attachFileToDeal: DealDocumentAttachment;
  bulkAssignTasks: Array<Task>;
  bulkConvertLeads: Array<LeadConversionResult>;
  bulkDeleteTasks: Scalars['Boolean']['output'];
  bulkUpdateBusinessRuleStatus: Array<BusinessRule>;
  bulkUpdateTasks: Array<Task>;
  cleanupExpiredNotifications: Scalars['Int']['output'];
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
  deleteAgentConversation: Scalars['Boolean']['output'];
  deleteBusinessRule: Scalars['Boolean']['output'];
  deleteCalendarEvent: Scalars['Boolean']['output'];
  deleteDeal?: Maybe<Scalars['Boolean']['output']>;
  deleteDriveFile: Scalars['Boolean']['output'];
  deleteLead?: Maybe<Scalars['Boolean']['output']>;
  deleteOrganization?: Maybe<Scalars['Boolean']['output']>;
  deletePerson?: Maybe<Scalars['Boolean']['output']>;
  deleteReactivationPlan: Scalars['Boolean']['output'];
  deleteSticker: Scalars['Boolean']['output'];
  deleteSystemNotification: Scalars['Boolean']['output'];
  deleteTask: Scalars['Boolean']['output'];
  deleteTaskAutomationRule: Scalars['Boolean']['output'];
  deleteTaskDependency: Scalars['Boolean']['output'];
  deleteWFMWorkflowStep: WfmWorkflowStepMutationResponse;
  deleteWFMWorkflowTransition: WfmWorkflowTransitionMutationResponse;
  deleteWfmStatus: WfmStatusMutationResponse;
  detachFileFromDeal: Scalars['Boolean']['output'];
  dismissSystemNotification: Scalars['Boolean']['output'];
  duplicateBusinessRule: BusinessRule;
  executeAgentStep: AgentResponse;
  executeBusinessRule: BusinessRuleExecutionResult;
  generateTaskContentFromEmail: AiGeneratedTaskContent;
  linkEmailToDeal: Scalars['Boolean']['output'];
  markAllBusinessRuleNotificationsAsRead: Scalars['Int']['output'];
  markAllNotificationsAsRead: Scalars['Int']['output'];
  markAllSystemNotificationsAsRead: Scalars['Int']['output'];
  markBusinessRuleNotificationAsRead: Scalars['Boolean']['output'];
  markNotificationAsActedUpon: BusinessRuleNotification;
  markNotificationAsDismissed: BusinessRuleNotification;
  markNotificationAsRead: BusinessRuleNotification;
  markSystemNotificationAsRead: Scalars['Boolean']['output'];
  markThreadAsRead: Scalars['Boolean']['output'];
  markThreadAsUnread: Scalars['Boolean']['output'];
  moveDriveFile: DriveFile;
  moveStickersBulk: Array<SmartSticker>;
  pinEmail: EmailPin;
  reactivateCustomFieldDefinition: CustomFieldDefinition;
  recalculateLeadScore: Lead;
  removeAccountManager: Organization;
  removeDealContextFromEvent: CalendarEvent;
  removeDealParticipant: Scalars['Boolean']['output'];
  removeDocumentAttachment: Scalars['Boolean']['output'];
  removeNoteDocumentAttachment: Scalars['Boolean']['output'];
  removeUserRole: User;
  revokeGoogleIntegration: Scalars['Boolean']['output'];
  scheduleDemoMeeting: CalendarEvent;
  scheduleFollowUpMeeting: CalendarEvent;
  sendAgentMessage: AgentResponse;
  sendAgentV2Message: AgentV2Response;
  sendAgentV2MessageStream: Scalars['String']['output'];
  setExchangeRate: ExchangeRate;
  shareDriveFolder: Scalars['Boolean']['output'];
  syncCalendarEvents: CalendarSyncStatus;
  syncGmailEmails: Array<Email>;
  toggleStickerPin: SmartSticker;
  triggerTaskAutomation: Array<Task>;
  unassignTask: Task;
  unpinEmail: Scalars['Boolean']['output'];
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
  id: Scalars['ID']['input'];
};


export type MutationAddAgentThoughtsArgs = {
  conversationId: Scalars['ID']['input'];
  thoughts: Array<AgentThoughtInput>;
};


export type MutationAddAgentV2ThoughtsArgs = {
  conversationId: Scalars['ID']['input'];
  thoughts: Array<AgentV2ThoughtInput>;
};


export type MutationAddDealContextToEventArgs = {
  dealId: Scalars['ID']['input'];
  eventId: Scalars['ID']['input'];
  eventType?: InputMaybe<CalendarEventType>;
};


export type MutationAddDealParticipantArgs = {
  input: DealParticipantInput;
};


export type MutationArchiveThreadArgs = {
  threadId: Scalars['String']['input'];
};


export type MutationAssignAccountManagerArgs = {
  organizationId: Scalars['ID']['input'];
  userId: Scalars['ID']['input'];
};


export type MutationAssignTaskArgs = {
  taskId: Scalars['ID']['input'];
  userId?: InputMaybe<Scalars['ID']['input']>;
};


export type MutationAssignUserRoleArgs = {
  roleName: Scalars['String']['input'];
  userId: Scalars['ID']['input'];
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
  taskIds: Array<Scalars['ID']['input']>;
  userId: Scalars['ID']['input'];
};


export type MutationBulkConvertLeadsArgs = {
  ids: Array<Scalars['ID']['input']>;
  input: LeadConversionInput;
};


export type MutationBulkDeleteTasksArgs = {
  taskIds: Array<Scalars['ID']['input']>;
};


export type MutationBulkUpdateBusinessRuleStatusArgs = {
  ruleIds: Array<Scalars['ID']['input']>;
  status: RuleStatusEnum;
};


export type MutationBulkUpdateTasksArgs = {
  taskIds: Array<Scalars['ID']['input']>;
  updates: BulkTaskUpdatesInput;
};


export type MutationCompleteTaskArgs = {
  completionData?: InputMaybe<TaskCompletionInput>;
  id: Scalars['ID']['input'];
};


export type MutationComposeEmailArgs = {
  input: ComposeEmailInput;
};


export type MutationConnectGoogleIntegrationArgs = {
  input: ConnectGoogleIntegrationInput;
};


export type MutationConvertCurrencyArgs = {
  amount: Scalars['Float']['input'];
  effectiveDate?: InputMaybe<Scalars['String']['input']>;
  fromCurrency: Scalars['String']['input'];
  toCurrency: Scalars['String']['input'];
};


export type MutationConvertDealToLeadArgs = {
  id: Scalars['ID']['input'];
  input: DealToLeadConversionInput;
};


export type MutationConvertLeadArgs = {
  id: Scalars['ID']['input'];
  input: LeadConversionInput;
};


export type MutationCopyDriveFileArgs = {
  fileId: Scalars['String']['input'];
  newName?: InputMaybe<Scalars['String']['input']>;
  newParentId: Scalars['String']['input'];
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


export type MutationCreateReactivationPlanArgs = {
  input: ReactivationPlanInput;
  leadId: Scalars['ID']['input'];
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
  templateId: Scalars['ID']['input'];
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
  id: Scalars['ID']['input'];
};


export type MutationDeactivateCustomFieldDefinitionArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteAgentConversationArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteBusinessRuleArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteCalendarEventArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteDealArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteDriveFileArgs = {
  fileId: Scalars['String']['input'];
};


export type MutationDeleteLeadArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteOrganizationArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeletePersonArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteReactivationPlanArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteStickerArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteSystemNotificationArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteTaskArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteTaskAutomationRuleArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteTaskDependencyArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteWfmWorkflowStepArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteWfmWorkflowTransitionArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteWfmStatusArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDetachFileFromDealArgs = {
  attachmentId: Scalars['ID']['input'];
};


export type MutationDismissSystemNotificationArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDuplicateBusinessRuleArgs = {
  id: Scalars['ID']['input'];
  name: Scalars['String']['input'];
};


export type MutationExecuteAgentStepArgs = {
  conversationId: Scalars['ID']['input'];
  stepId: Scalars['String']['input'];
};


export type MutationExecuteBusinessRuleArgs = {
  entityId: Scalars['ID']['input'];
  entityType: EntityTypeEnum;
  ruleId: Scalars['ID']['input'];
  testMode?: InputMaybe<Scalars['Boolean']['input']>;
};


export type MutationGenerateTaskContentFromEmailArgs = {
  input: GenerateTaskContentInput;
};


export type MutationLinkEmailToDealArgs = {
  dealId: Scalars['String']['input'];
  emailId: Scalars['String']['input'];
};


export type MutationMarkAllNotificationsAsReadArgs = {
  userId: Scalars['ID']['input'];
};


export type MutationMarkBusinessRuleNotificationAsReadArgs = {
  id: Scalars['ID']['input'];
};


export type MutationMarkNotificationAsActedUponArgs = {
  id: Scalars['ID']['input'];
};


export type MutationMarkNotificationAsDismissedArgs = {
  id: Scalars['ID']['input'];
};


export type MutationMarkNotificationAsReadArgs = {
  id: Scalars['ID']['input'];
};


export type MutationMarkSystemNotificationAsReadArgs = {
  id: Scalars['ID']['input'];
};


export type MutationMarkThreadAsReadArgs = {
  threadId: Scalars['String']['input'];
};


export type MutationMarkThreadAsUnreadArgs = {
  threadId: Scalars['String']['input'];
};


export type MutationMoveDriveFileArgs = {
  fileId: Scalars['String']['input'];
  newParentId: Scalars['String']['input'];
  oldParentId?: InputMaybe<Scalars['String']['input']>;
};


export type MutationMoveStickersBulkArgs = {
  moves: Array<StickerMoveInput>;
};


export type MutationPinEmailArgs = {
  input: PinEmailInput;
};


export type MutationReactivateCustomFieldDefinitionArgs = {
  id: Scalars['ID']['input'];
};


export type MutationRecalculateLeadScoreArgs = {
  leadId: Scalars['ID']['input'];
};


export type MutationRemoveAccountManagerArgs = {
  organizationId: Scalars['ID']['input'];
};


export type MutationRemoveDealContextFromEventArgs = {
  eventId: Scalars['ID']['input'];
};


export type MutationRemoveDealParticipantArgs = {
  dealId: Scalars['ID']['input'];
  personId: Scalars['ID']['input'];
};


export type MutationRemoveDocumentAttachmentArgs = {
  attachmentId: Scalars['ID']['input'];
};


export type MutationRemoveNoteDocumentAttachmentArgs = {
  attachmentId: Scalars['ID']['input'];
};


export type MutationRemoveUserRoleArgs = {
  roleName: Scalars['String']['input'];
  userId: Scalars['ID']['input'];
};


export type MutationScheduleDemoMeetingArgs = {
  attendeeEmails: Array<Scalars['String']['input']>;
  dealId: Scalars['ID']['input'];
  duration?: InputMaybe<Scalars['Int']['input']>;
  suggestedTime?: InputMaybe<Scalars['DateTime']['input']>;
  title: Scalars['String']['input'];
};


export type MutationScheduleFollowUpMeetingArgs = {
  dealId: Scalars['ID']['input'];
  duration?: InputMaybe<Scalars['Int']['input']>;
  suggestedTime?: InputMaybe<Scalars['DateTime']['input']>;
  title: Scalars['String']['input'];
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


export type MutationShareDriveFolderArgs = {
  folderId: Scalars['String']['input'];
  permissions: Array<DrivePermissionInput>;
};


export type MutationSyncCalendarEventsArgs = {
  calendarId?: InputMaybe<Scalars['String']['input']>;
  daysFuture?: InputMaybe<Scalars['Int']['input']>;
  daysPast?: InputMaybe<Scalars['Int']['input']>;
  fullSync?: InputMaybe<Scalars['Boolean']['input']>;
};


export type MutationSyncGmailEmailsArgs = {
  entityId: Scalars['ID']['input'];
  entityType: EntityType;
};


export type MutationToggleStickerPinArgs = {
  id: Scalars['ID']['input'];
};


export type MutationTriggerTaskAutomationArgs = {
  event: CrmEventInput;
};


export type MutationUnassignTaskArgs = {
  taskId: Scalars['ID']['input'];
};


export type MutationUnpinEmailArgs = {
  id: Scalars['ID']['input'];
};


export type MutationUpdateAgentConversationArgs = {
  input: UpdateConversationInput;
};


export type MutationUpdateAppSettingArgs = {
  input: UpdateAppSettingInput;
};


export type MutationUpdateBusinessRuleArgs = {
  id: Scalars['ID']['input'];
  input: UpdateBusinessRuleInput;
};


export type MutationUpdateCalendarEventArgs = {
  id: Scalars['ID']['input'];
  input: UpdateCalendarEventInput;
};


export type MutationUpdateCalendarPreferencesArgs = {
  input: CalendarPreferencesInput;
};


export type MutationUpdateCurrencyArgs = {
  code: Scalars['String']['input'];
  input: UpdateCurrencyInput;
};


export type MutationUpdateCustomFieldDefinitionArgs = {
  id: Scalars['ID']['input'];
  input: CustomFieldDefinitionInput;
};


export type MutationUpdateDealArgs = {
  id: Scalars['ID']['input'];
  input: DealUpdateInput;
};


export type MutationUpdateDealCurrencyArgs = {
  currency: Scalars['String']['input'];
  dealId: Scalars['ID']['input'];
  effectiveDate?: InputMaybe<Scalars['String']['input']>;
};


export type MutationUpdateDealParticipantRoleArgs = {
  dealId: Scalars['ID']['input'];
  personId: Scalars['ID']['input'];
  role: ContactRoleType;
};


export type MutationUpdateDealWfmProgressArgs = {
  dealId: Scalars['ID']['input'];
  targetWfmWorkflowStepId: Scalars['ID']['input'];
};


export type MutationUpdateDocumentAttachmentCategoryArgs = {
  attachmentId: Scalars['ID']['input'];
  category: DocumentCategory;
};


export type MutationUpdateEmailPinArgs = {
  id: Scalars['ID']['input'];
  input: UpdateEmailPinInput;
};


export type MutationUpdateLeadArgs = {
  id: Scalars['ID']['input'];
  input: LeadUpdateInput;
};


export type MutationUpdateLeadCurrencyArgs = {
  currency: Scalars['String']['input'];
  effectiveDate?: InputMaybe<Scalars['String']['input']>;
  leadId: Scalars['ID']['input'];
};


export type MutationUpdateLeadWfmProgressArgs = {
  leadId: Scalars['ID']['input'];
  targetWfmWorkflowStepId: Scalars['ID']['input'];
};


export type MutationUpdateOrganizationArgs = {
  id: Scalars['ID']['input'];
  input: OrganizationInput;
};


export type MutationUpdatePersonArgs = {
  id: Scalars['ID']['input'];
  input: PersonInput;
};


export type MutationUpdateReactivationPlanArgs = {
  id: Scalars['ID']['input'];
  input: ReactivationPlanInput;
};


export type MutationUpdateStickerArgs = {
  input: UpdateStickerInput;
};


export type MutationUpdateStickerTagsArgs = {
  id: Scalars['ID']['input'];
  tagsToAdd?: InputMaybe<Array<Scalars['String']['input']>>;
  tagsToRemove?: InputMaybe<Array<Scalars['String']['input']>>;
};


export type MutationUpdateSystemNotificationArgs = {
  id: Scalars['ID']['input'];
  input: UpdateSystemNotificationInput;
};


export type MutationUpdateTaskArgs = {
  id: Scalars['ID']['input'];
  input: UpdateTaskInput;
};


export type MutationUpdateTaskAutomationRuleArgs = {
  id: Scalars['ID']['input'];
  input: UpdateTaskAutomationRuleInput;
};


export type MutationUpdateUserCurrencyPreferencesArgs = {
  input: UpdateUserCurrencyPreferencesInput;
  userId: Scalars['ID']['input'];
};


export type MutationUpdateUserProfileArgs = {
  input: UpdateUserProfileInput;
};


export type MutationUpdateWfmProjectTypeArgs = {
  id: Scalars['ID']['input'];
  input: UpdateWfmProjectTypeInput;
};


export type MutationUpdateWfmStatusArgs = {
  id: Scalars['ID']['input'];
  input: UpdateWfmStatusInput;
};


export type MutationUpdateWfmWorkflowArgs = {
  id: Scalars['ID']['input'];
  input: UpdateWfmWorkflowInput;
};


export type MutationUpdateWfmWorkflowStepArgs = {
  id: Scalars['ID']['input'];
  input: UpdateWfmWorkflowStepInput;
};


export type MutationUpdateWfmWorkflowStepsOrderArgs = {
  orderedStepIds: Array<Scalars['ID']['input']>;
  workflowId: Scalars['ID']['input'];
};


export type MutationUpdateWfmWorkflowTransitionArgs = {
  id: Scalars['ID']['input'];
  input: UpdateWfmWorkflowTransitionInput;
};


export type MutationUploadFileToDriveArgs = {
  input: UploadFileInput;
};


export type MutationUploadToGoogleDriveArgs = {
  entityId: Scalars['ID']['input'];
  entityType: EntityType;
  fileContent: Scalars['String']['input'];
  fileName: Scalars['String']['input'];
  mimeType: Scalars['String']['input'];
};

export type NoteDocumentAttachment = {
  __typename?: 'NoteDocumentAttachment';
  attachedAt: Scalars['String']['output'];
  attachedBy: Scalars['ID']['output'];
  fileName: Scalars['String']['output'];
  fileSize?: Maybe<Scalars['Int']['output']>;
  fileUrl: Scalars['String']['output'];
  googleFileId: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  mimeType?: Maybe<Scalars['String']['output']>;
  noteId: Scalars['ID']['output'];
};

export type NotificationFilters = {
  entityId?: InputMaybe<Scalars['ID']['input']>;
  entityType?: InputMaybe<Scalars['String']['input']>;
  fromDate?: InputMaybe<Scalars['DateTime']['input']>;
  isRead?: InputMaybe<Scalars['Boolean']['input']>;
  notificationType?: InputMaybe<Scalars['String']['input']>;
  priority?: InputMaybe<Scalars['Int']['input']>;
  source?: InputMaybe<NotificationSource>;
  toDate?: InputMaybe<Scalars['DateTime']['input']>;
};

export type NotificationPriority =
  | 'HIGH'
  | 'LOW'
  | 'NORMAL'
  | 'URGENT';

export type NotificationSource =
  | 'BUSINESS_RULE'
  | 'SYSTEM';

export type NotificationSummary = {
  __typename?: 'NotificationSummary';
  businessRuleCount: Scalars['Int']['output'];
  highPriorityCount: Scalars['Int']['output'];
  systemCount: Scalars['Int']['output'];
  totalCount: Scalars['Int']['output'];
  unreadCount: Scalars['Int']['output'];
};

/** Defines the Organization type and related queries/mutations. */
export type Organization = {
  __typename?: 'Organization';
  accountManager?: Maybe<User>;
  account_manager_id?: Maybe<Scalars['ID']['output']>;
  activeDealCount?: Maybe<Scalars['Int']['output']>;
  address?: Maybe<Scalars['String']['output']>;
  created_at: Scalars['DateTime']['output'];
  customFieldValues: Array<CustomFieldValue>;
  deals: Array<Deal>;
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  notes?: Maybe<Scalars['String']['output']>;
  people?: Maybe<Array<Person>>;
  totalDealValue?: Maybe<Scalars['Float']['output']>;
  updated_at: Scalars['DateTime']['output'];
  user_id: Scalars['ID']['output'];
};

export type OrganizationInput = {
  account_manager_id?: InputMaybe<Scalars['ID']['input']>;
  address?: InputMaybe<Scalars['String']['input']>;
  customFields?: InputMaybe<Array<CustomFieldValueInput>>;
  name: Scalars['String']['input'];
  notes?: InputMaybe<Scalars['String']['input']>;
};

export type OrganizationUpdateInput = {
  account_manager_id?: InputMaybe<Scalars['ID']['input']>;
  address?: InputMaybe<Scalars['String']['input']>;
  customFields?: InputMaybe<Array<CustomFieldValueInput>>;
  name?: InputMaybe<Scalars['String']['input']>;
  notes?: InputMaybe<Scalars['String']['input']>;
};

/** Defines the Person type and related queries/mutations. */
export type Person = {
  __typename?: 'Person';
  created_at: Scalars['DateTime']['output'];
  customFieldValues: Array<CustomFieldValue>;
  deals?: Maybe<Array<Deal>>;
  email?: Maybe<Scalars['String']['output']>;
  first_name?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  last_name?: Maybe<Scalars['String']['output']>;
  notes?: Maybe<Scalars['String']['output']>;
  organization?: Maybe<Organization>;
  organization_id?: Maybe<Scalars['ID']['output']>;
  phone?: Maybe<Scalars['String']['output']>;
  updated_at: Scalars['DateTime']['output'];
  user_id: Scalars['ID']['output'];
};

export type PersonInput = {
  customFields?: InputMaybe<Array<CustomFieldValueInput>>;
  email?: InputMaybe<Scalars['String']['input']>;
  first_name?: InputMaybe<Scalars['String']['input']>;
  last_name?: InputMaybe<Scalars['String']['input']>;
  notes?: InputMaybe<Scalars['String']['input']>;
  organization_id?: InputMaybe<Scalars['ID']['input']>;
  phone?: InputMaybe<Scalars['String']['input']>;
};

export type PersonListItem = {
  __typename?: 'PersonListItem';
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
};

export type PersonUpdateInput = {
  customFields?: InputMaybe<Array<CustomFieldValueInput>>;
  email?: InputMaybe<Scalars['String']['input']>;
  first_name?: InputMaybe<Scalars['String']['input']>;
  last_name?: InputMaybe<Scalars['String']['input']>;
  notes?: InputMaybe<Scalars['String']['input']>;
  organization_id?: InputMaybe<Scalars['ID']['input']>;
  phone?: InputMaybe<Scalars['String']['input']>;
};

export type PinEmailInput = {
  dealId: Scalars['ID']['input'];
  emailId: Scalars['String']['input'];
  fromEmail?: InputMaybe<Scalars['String']['input']>;
  notes?: InputMaybe<Scalars['String']['input']>;
  subject?: InputMaybe<Scalars['String']['input']>;
  threadId: Scalars['String']['input'];
};

export type Query = {
  __typename?: 'Query';
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
  health: Scalars['String']['output'];
  lead?: Maybe<Lead>;
  leads: Array<Lead>;
  leadsStats: LeadsStats;
  me?: Maybe<User>;
  myAccountPortfolioStats: AccountPortfolioStats;
  myAccounts: Array<Organization>;
  myAssignedTasks: Array<Task>;
  myOverdueTasks: Array<Task>;
  myPermissions?: Maybe<Array<Scalars['String']['output']>>;
  myTasks: Array<Task>;
  myTasksDueThisWeek: Array<Task>;
  myTasksDueToday: Array<Task>;
  notificationSummary: NotificationSummary;
  organization?: Maybe<Organization>;
  organizations: Array<Organization>;
  people: Array<Person>;
  person?: Maybe<Person>;
  personList: Array<PersonListItem>;
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
  supabaseConnectionTest: Scalars['String']['output'];
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
  unreadNotificationCount: Scalars['Int']['output'];
  upcomingMeetings: Array<CalendarEvent>;
  userCurrencyPreferences?: Maybe<UserCurrencyPreferences>;
  users: Array<User>;
  validateBusinessRule: Array<Scalars['String']['output']>;
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
  id: Scalars['ID']['input'];
};


export type QueryAgentConversationsArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryAgentThoughtsArgs = {
  conversationId: Scalars['ID']['input'];
  limit?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryAgentV2ConversationsArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryAgentV2ThinkingAnalysisArgs = {
  conversationId: Scalars['ID']['input'];
};


export type QueryAgentV2ThoughtsArgs = {
  conversationId: Scalars['ID']['input'];
  limit?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryAppSettingArgs = {
  settingKey: Scalars['String']['input'];
};


export type QueryBusinessRuleArgs = {
  id: Scalars['ID']['input'];
};


export type QueryBusinessRuleAnalyticsArgs = {
  entityType?: InputMaybe<EntityTypeEnum>;
  timeRange?: InputMaybe<Scalars['String']['input']>;
};


export type QueryBusinessRuleNotificationArgs = {
  id: Scalars['ID']['input'];
};


export type QueryBusinessRuleNotificationsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  unreadOnly?: InputMaybe<Scalars['Boolean']['input']>;
  userId?: InputMaybe<Scalars['ID']['input']>;
};


export type QueryBusinessRulesArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  filters?: InputMaybe<BusinessRuleFilters>;
  first?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryCalendarEventArgs = {
  id: Scalars['ID']['input'];
};


export type QueryCalendarEventsArgs = {
  calendarId?: InputMaybe<Scalars['String']['input']>;
  dealId?: InputMaybe<Scalars['ID']['input']>;
  eventType?: InputMaybe<CalendarEventType>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  organizationId?: InputMaybe<Scalars['ID']['input']>;
  personId?: InputMaybe<Scalars['ID']['input']>;
  timeRange?: InputMaybe<CalendarTimeRangeInput>;
};


export type QueryCheckAvailabilityArgs = {
  calendarIds?: InputMaybe<Array<Scalars['String']['input']>>;
  timeRange: CalendarTimeRangeInput;
};


export type QueryConversionHistoryArgs = {
  entityId: Scalars['ID']['input'];
  entityType: Scalars['String']['input'];
};


export type QueryConversionHistoryByIdArgs = {
  id: Scalars['ID']['input'];
};


export type QueryCurrencyArgs = {
  code: Scalars['String']['input'];
};


export type QueryCustomFieldDefinitionArgs = {
  id: Scalars['ID']['input'];
};


export type QueryCustomFieldDefinitionsArgs = {
  entityType: CustomFieldEntityType;
  includeInactive?: InputMaybe<Scalars['Boolean']['input']>;
};


export type QueryDealArgs = {
  id: Scalars['ID']['input'];
};


export type QueryDealCalendarEventsArgs = {
  dealId: Scalars['ID']['input'];
};


export type QueryDealFolderFilesArgs = {
  dealId: Scalars['ID']['input'];
  folderId?: InputMaybe<Scalars['ID']['input']>;
};


export type QueryDealFolderInfoArgs = {
  dealId: Scalars['ID']['input'];
};


export type QueryDealTaskIndicatorsArgs = {
  dealIds: Array<Scalars['ID']['input']>;
};


export type QueryExchangeRateArgs = {
  effectiveDate?: InputMaybe<Scalars['String']['input']>;
  fromCurrency: Scalars['String']['input'];
  toCurrency: Scalars['String']['input'];
};


export type QueryGetDealDocumentAttachmentsArgs = {
  dealId: Scalars['ID']['input'];
};


export type QueryGetDealDocumentsArgs = {
  dealId: Scalars['ID']['input'];
};


export type QueryGetDealFolderArgs = {
  dealId: Scalars['ID']['input'];
};


export type QueryGetDealParticipantsArgs = {
  dealId: Scalars['ID']['input'];
};


export type QueryGetDriveFileArgs = {
  fileId: Scalars['String']['input'];
};


export type QueryGetDriveFilesArgs = {
  input: DriveSearchInput;
};


export type QueryGetDriveFoldersArgs = {
  input: DriveFolderBrowseInput;
};


export type QueryGetEmailAnalyticsArgs = {
  dealId: Scalars['String']['input'];
};


export type QueryGetEmailMessageArgs = {
  messageId: Scalars['String']['input'];
};


export type QueryGetEmailPinArgs = {
  id: Scalars['ID']['input'];
};


export type QueryGetEmailThreadArgs = {
  threadId: Scalars['String']['input'];
};


export type QueryGetEmailThreadsArgs = {
  filter: EmailThreadsFilterInput;
};


export type QueryGetEntityDocumentsArgs = {
  entityId: Scalars['ID']['input'];
  entityType: EntityType;
};


export type QueryGetEntityEmailsArgs = {
  entityId: Scalars['ID']['input'];
  entityType: EntityType;
};


export type QueryGetEntityStickersArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  entityId: Scalars['ID']['input'];
  entityType: EntityType;
  filters?: InputMaybe<StickerFilters>;
  first?: InputMaybe<Scalars['Int']['input']>;
  sortBy?: InputMaybe<StickerSortBy>;
};


export type QueryGetNoteDocumentAttachmentsArgs = {
  noteId: Scalars['ID']['input'];
};


export type QueryGetPinnedEmailsArgs = {
  dealId: Scalars['ID']['input'];
};


export type QueryGetPinnedStickersArgs = {
  entityType?: InputMaybe<EntityType>;
  first?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryGetRecentDriveFilesArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryGetRecentSharedDriveFilesArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryGetSharedDriveFilesArgs = {
  folderId?: InputMaybe<Scalars['ID']['input']>;
  query?: InputMaybe<Scalars['String']['input']>;
  sharedDriveId: Scalars['ID']['input'];
};


export type QueryGetSharedDriveFoldersArgs = {
  parentFolderId?: InputMaybe<Scalars['ID']['input']>;
  sharedDriveId: Scalars['ID']['input'];
};


export type QueryGetStickerArgs = {
  id: Scalars['ID']['input'];
};


export type QueryGetWfmAllowedTransitionsArgs = {
  fromStepId: Scalars['ID']['input'];
  workflowId: Scalars['ID']['input'];
};


export type QueryLeadArgs = {
  id: Scalars['ID']['input'];
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
  id: Scalars['ID']['input'];
};


export type QueryPersonArgs = {
  id: Scalars['ID']['input'];
};


export type QueryPreviewRuleExecutionArgs = {
  entityId: Scalars['ID']['input'];
  entityType: EntityTypeEnum;
  ruleId: Scalars['ID']['input'];
};


export type QueryReactivationPlanArgs = {
  id: Scalars['ID']['input'];
};


export type QueryReactivationPlansArgs = {
  assignedToUserId?: InputMaybe<Scalars['ID']['input']>;
  status?: InputMaybe<ReactivationPlanStatus>;
};


export type QueryRuleExecutionArgs = {
  id: Scalars['ID']['input'];
};


export type QueryRuleExecutionsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  entityId?: InputMaybe<Scalars['ID']['input']>;
  entityType?: InputMaybe<EntityTypeEnum>;
  first?: InputMaybe<Scalars['Int']['input']>;
  ruleId?: InputMaybe<Scalars['ID']['input']>;
};


export type QuerySearchDriveFilesArgs = {
  query: Scalars['String']['input'];
};


export type QuerySearchEmailsArgs = {
  entityType?: InputMaybe<EntityType>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  query: Scalars['String']['input'];
};


export type QuerySearchGoogleContactsArgs = {
  query: Scalars['String']['input'];
};


export type QuerySearchSharedDriveFilesArgs = {
  query: Scalars['String']['input'];
  sharedDriveId?: InputMaybe<Scalars['ID']['input']>;
};


export type QuerySearchStickersArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  filters: StickerFilters;
  first?: InputMaybe<Scalars['Int']['input']>;
  sortBy?: InputMaybe<StickerSortBy>;
};


export type QuerySuggestEmailParticipantsArgs = {
  dealId: Scalars['ID']['input'];
  threadId?: InputMaybe<Scalars['String']['input']>;
};


export type QuerySystemNotificationArgs = {
  id: Scalars['ID']['input'];
};


export type QuerySystemNotificationsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  filters?: InputMaybe<NotificationFilters>;
  first?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryTaskArgs = {
  id: Scalars['ID']['input'];
};


export type QueryTaskAutomationRuleArgs = {
  id: Scalars['ID']['input'];
};


export type QueryTaskAutomationRulesArgs = {
  entityType?: InputMaybe<TaskEntityType>;
};


export type QueryTaskDependenciesArgs = {
  taskId: Scalars['ID']['input'];
};


export type QueryTaskHistoryArgs = {
  taskId: Scalars['ID']['input'];
};


export type QueryTaskStatsArgs = {
  entityId?: InputMaybe<Scalars['ID']['input']>;
  entityType?: InputMaybe<TaskEntityType>;
};


export type QueryTasksArgs = {
  filters?: InputMaybe<TaskFiltersInput>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryTasksForDealArgs = {
  dealId: Scalars['ID']['input'];
  filters?: InputMaybe<TaskFiltersInput>;
};


export type QueryTasksForLeadArgs = {
  filters?: InputMaybe<TaskFiltersInput>;
  leadId: Scalars['ID']['input'];
};


export type QueryTasksForOrganizationArgs = {
  filters?: InputMaybe<TaskFiltersInput>;
  organizationId: Scalars['ID']['input'];
};


export type QueryTasksForPersonArgs = {
  filters?: InputMaybe<TaskFiltersInput>;
  personId: Scalars['ID']['input'];
};


export type QueryTasksForUserArgs = {
  filters?: InputMaybe<TaskFiltersInput>;
  userId: Scalars['ID']['input'];
};


export type QueryUnifiedNotificationsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  filters?: InputMaybe<NotificationFilters>;
  first?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryUpcomingMeetingsArgs = {
  days?: InputMaybe<Scalars['Int']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryUserCurrencyPreferencesArgs = {
  userId: Scalars['ID']['input'];
};


export type QueryValidateBusinessRuleArgs = {
  input: BusinessRuleInput;
};


export type QueryValidateConversionArgs = {
  sourceId: Scalars['ID']['input'];
  sourceType: Scalars['String']['input'];
  targetType: Scalars['String']['input'];
};


export type QueryWfmProjectTypeArgs = {
  id: Scalars['ID']['input'];
};


export type QueryWfmProjectTypeByNameArgs = {
  name: Scalars['String']['input'];
};


export type QueryWfmProjectTypesArgs = {
  isArchived?: InputMaybe<Scalars['Boolean']['input']>;
};


export type QueryWfmStatusArgs = {
  id: Scalars['ID']['input'];
};


export type QueryWfmStatusesArgs = {
  isArchived?: InputMaybe<Scalars['Boolean']['input']>;
};


export type QueryWfmWorkflowArgs = {
  id: Scalars['ID']['input'];
};


export type QueryWfmWorkflowsArgs = {
  isArchived?: InputMaybe<Scalars['Boolean']['input']>;
};

export type ReactivationPlan = {
  __typename?: 'ReactivationPlan';
  assignedToUser?: Maybe<User>;
  createdAt: Scalars['DateTime']['output'];
  createdByUser?: Maybe<User>;
  followUpActivities?: Maybe<Scalars['JSON']['output']>;
  id: Scalars['ID']['output'];
  lead: Lead;
  notes?: Maybe<Scalars['String']['output']>;
  originalDeal?: Maybe<Deal>;
  reactivationStrategy: ReactivationStrategy;
  status: ReactivationPlanStatus;
  targetReactivationDate?: Maybe<Scalars['DateTime']['output']>;
  updatedAt: Scalars['DateTime']['output'];
};

export type ReactivationPlanInput = {
  assignedToUserId?: InputMaybe<Scalars['ID']['input']>;
  followUpActivities?: InputMaybe<Scalars['JSON']['input']>;
  notes?: InputMaybe<Scalars['String']['input']>;
  reactivationStrategy: ReactivationStrategy;
  targetReactivationDate?: InputMaybe<Scalars['DateTime']['input']>;
};

export type ReactivationPlanStatus =
  | 'ACTIVE'
  | 'CANCELLED'
  | 'COMPLETED'
  | 'PAUSED';

export type ReactivationStrategy =
  | 'BUDGET_FOLLOW_UP'
  | 'COMPETITIVE_ANALYSIS'
  | 'CONTENT_MARKETING'
  | 'DIRECT_OUTREACH'
  | 'NURTURING'
  | 'RELATIONSHIP_BUILDING';

export type Role = {
  __typename?: 'Role';
  description: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
};

export type RuleAction = {
  __typename?: 'RuleAction';
  message?: Maybe<Scalars['String']['output']>;
  metadata?: Maybe<Scalars['JSON']['output']>;
  priority: Scalars['Int']['output'];
  target?: Maybe<Scalars['String']['output']>;
  template?: Maybe<Scalars['String']['output']>;
  type: RuleActionType;
};

export type RuleActionInput = {
  message?: InputMaybe<Scalars['String']['input']>;
  metadata?: InputMaybe<Scalars['JSON']['input']>;
  priority?: InputMaybe<Scalars['Int']['input']>;
  target?: InputMaybe<Scalars['String']['input']>;
  template?: InputMaybe<Scalars['String']['input']>;
  type: RuleActionType;
};

export type RuleActionType =
  | 'CREATE_ACTIVITY'
  | 'CREATE_TASK'
  | 'NOTIFY_OWNER'
  | 'NOTIFY_USER'
  | 'SEND_EMAIL'
  | 'UPDATE_FIELD';

export type RuleCondition = {
  __typename?: 'RuleCondition';
  field: Scalars['String']['output'];
  logicalOperator: LogicalOperator;
  operator: RuleConditionOperator;
  value: Scalars['String']['output'];
};

export type RuleConditionInput = {
  field: Scalars['String']['input'];
  logicalOperator?: InputMaybe<LogicalOperator>;
  operator: RuleConditionOperator;
  value: Scalars['String']['input'];
};

export type RuleConditionOperator =
  | 'CHANGED_FROM'
  | 'CHANGED_TO'
  | 'CONTAINS'
  | 'DECREASED_BY_PERCENT'
  | 'ENDS_WITH'
  | 'EQUALS'
  | 'GREATER_EQUAL'
  | 'GREATER_THAN'
  | 'IN'
  | 'INCREASED_BY_PERCENT'
  | 'IS_NOT_NULL'
  | 'IS_NULL'
  | 'LESS_EQUAL'
  | 'LESS_THAN'
  | 'NEWER_THAN'
  | 'NOT_EQUALS'
  | 'NOT_IN'
  | 'OLDER_THAN'
  | 'STARTS_WITH';

export type RuleExecution = {
  __typename?: 'RuleExecution';
  activitiesCreated: Scalars['Int']['output'];
  conditionsMet: Scalars['Boolean']['output'];
  entityId: Scalars['ID']['output'];
  entityType: EntityTypeEnum;
  errors: Array<Scalars['String']['output']>;
  executedAt: Scalars['DateTime']['output'];
  executionResult: Scalars['JSON']['output'];
  executionTimeMs?: Maybe<Scalars['Int']['output']>;
  executionTrigger: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  notificationsCreated: Scalars['Int']['output'];
  rule: BusinessRule;
  tasksCreated: Scalars['Int']['output'];
};

export type RuleExecutionsConnection = {
  __typename?: 'RuleExecutionsConnection';
  hasNextPage: Scalars['Boolean']['output'];
  hasPreviousPage: Scalars['Boolean']['output'];
  nodes: Array<RuleExecution>;
  totalCount: Scalars['Int']['output'];
};

export type RuleStatusEnum =
  | 'ACTIVE'
  | 'DRAFT'
  | 'INACTIVE';

export type SendAgentV2MessageInput = {
  content: Scalars['String']['input'];
  conversationId?: InputMaybe<Scalars['ID']['input']>;
};

export type SendAgentV2MessageStreamInput = {
  content: Scalars['String']['input'];
  conversationId?: InputMaybe<Scalars['ID']['input']>;
};

export type SendMessageInput = {
  config?: InputMaybe<AgentConfigInput>;
  content: Scalars['String']['input'];
  conversationId?: InputMaybe<Scalars['ID']['input']>;
};

export type SetExchangeRateInput = {
  effectiveDate?: InputMaybe<Scalars['String']['input']>;
  fromCurrency: Scalars['String']['input'];
  rate: Scalars['Float']['input'];
  source?: InputMaybe<Scalars['String']['input']>;
  toCurrency: Scalars['String']['input'];
};

export type SharedDrive = {
  __typename?: 'SharedDrive';
  backgroundImageFile?: Maybe<SharedDriveImage>;
  capabilities?: Maybe<SharedDriveCapabilities>;
  colorRgb?: Maybe<Scalars['String']['output']>;
  createdTime: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  restrictions?: Maybe<SharedDriveRestrictions>;
};

export type SharedDriveCapabilities = {
  __typename?: 'SharedDriveCapabilities';
  canAddChildren?: Maybe<Scalars['Boolean']['output']>;
  canComment?: Maybe<Scalars['Boolean']['output']>;
  canCopy?: Maybe<Scalars['Boolean']['output']>;
  canDeleteDrive?: Maybe<Scalars['Boolean']['output']>;
  canDownload?: Maybe<Scalars['Boolean']['output']>;
  canEdit?: Maybe<Scalars['Boolean']['output']>;
  canListChildren?: Maybe<Scalars['Boolean']['output']>;
  canManageMembers?: Maybe<Scalars['Boolean']['output']>;
  canReadRevisions?: Maybe<Scalars['Boolean']['output']>;
  canRename?: Maybe<Scalars['Boolean']['output']>;
  canRenameDrive?: Maybe<Scalars['Boolean']['output']>;
  canShare?: Maybe<Scalars['Boolean']['output']>;
};

export type SharedDriveImage = {
  __typename?: 'SharedDriveImage';
  id: Scalars['String']['output'];
  webViewLink: Scalars['String']['output'];
};

export type SharedDriveRestrictions = {
  __typename?: 'SharedDriveRestrictions';
  adminManagedRestrictions?: Maybe<Scalars['Boolean']['output']>;
  copyRequiresWriterPermission?: Maybe<Scalars['Boolean']['output']>;
  domainUsersOnly?: Maybe<Scalars['Boolean']['output']>;
  driveMembersOnly?: Maybe<Scalars['Boolean']['output']>;
};

export type SmartSticker = {
  __typename?: 'SmartSticker';
  category?: Maybe<StickerCategory>;
  color: Scalars['String']['output'];
  content?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['DateTime']['output'];
  createdBy?: Maybe<User>;
  createdByUserId: Scalars['ID']['output'];
  entityId: Scalars['ID']['output'];
  entityType: EntityType;
  height: Scalars['Int']['output'];
  id: Scalars['ID']['output'];
  isPinned: Scalars['Boolean']['output'];
  isPrivate: Scalars['Boolean']['output'];
  lastEditedAt?: Maybe<Scalars['DateTime']['output']>;
  lastEditedBy?: Maybe<User>;
  lastEditedByUserId?: Maybe<Scalars['ID']['output']>;
  mentions: Array<Scalars['ID']['output']>;
  positionX: Scalars['Int']['output'];
  positionY: Scalars['Int']['output'];
  priority: StickerPriority;
  tags: Array<Scalars['String']['output']>;
  title: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
  width: Scalars['Int']['output'];
};

export type SortDirection =
  | 'ASC'
  | 'DESC';

export type StageType =
  | 'LOST'
  | 'OPEN'
  | 'WON';

export type StickerCategory = {
  __typename?: 'StickerCategory';
  color: Scalars['String']['output'];
  createdAt: Scalars['DateTime']['output'];
  description?: Maybe<Scalars['String']['output']>;
  displayOrder: Scalars['Int']['output'];
  icon?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  isSystem: Scalars['Boolean']['output'];
  name: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
};

export type StickerConnection = {
  __typename?: 'StickerConnection';
  hasNextPage: Scalars['Boolean']['output'];
  hasPreviousPage: Scalars['Boolean']['output'];
  nodes: Array<SmartSticker>;
  totalCount: Scalars['Int']['output'];
};

export type StickerFilters = {
  categoryIds?: InputMaybe<Array<Scalars['ID']['input']>>;
  createdByUserId?: InputMaybe<Scalars['ID']['input']>;
  entityId?: InputMaybe<Scalars['ID']['input']>;
  entityType?: InputMaybe<EntityType>;
  isPinned?: InputMaybe<Scalars['Boolean']['input']>;
  isPrivate?: InputMaybe<Scalars['Boolean']['input']>;
  priority?: InputMaybe<StickerPriority>;
  search?: InputMaybe<Scalars['String']['input']>;
  tags?: InputMaybe<Array<Scalars['String']['input']>>;
};

export type StickerMoveInput = {
  id: Scalars['ID']['input'];
  positionX: Scalars['Int']['input'];
  positionY: Scalars['Int']['input'];
};

export type StickerPriority =
  | 'HIGH'
  | 'NORMAL'
  | 'URGENT';

export type StickerSortBy = {
  direction?: InputMaybe<SortDirection>;
  field: StickerSortField;
};

export type StickerSortField =
  | 'CREATED_AT'
  | 'POSITION_X'
  | 'POSITION_Y'
  | 'PRIORITY'
  | 'TITLE'
  | 'UPDATED_AT';

export type Subscription = {
  __typename?: 'Subscription';
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
  conversationId: Scalars['ID']['input'];
};


export type SubscriptionAgentPlanUpdatedArgs = {
  conversationId: Scalars['ID']['input'];
};


export type SubscriptionAgentThoughtsAddedArgs = {
  conversationId: Scalars['ID']['input'];
};


export type SubscriptionAgentV2MessageStreamArgs = {
  conversationId: Scalars['ID']['input'];
};


export type SubscriptionAgentV2ReflectionAddedArgs = {
  conversationId: Scalars['ID']['input'];
};


export type SubscriptionAgentV2ThinkingUpdatedArgs = {
  conversationId: Scalars['ID']['input'];
};


export type SubscriptionDealTasksUpdatedArgs = {
  dealId: Scalars['ID']['input'];
};


export type SubscriptionLeadTasksUpdatedArgs = {
  leadId: Scalars['ID']['input'];
};


export type SubscriptionTaskCompletedArgs = {
  entityId?: InputMaybe<Scalars['ID']['input']>;
  entityType?: InputMaybe<TaskEntityType>;
};


export type SubscriptionTaskUpdatedArgs = {
  taskId?: InputMaybe<Scalars['ID']['input']>;
};

export type SystemNotification = {
  __typename?: 'SystemNotification';
  actionUrl?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['DateTime']['output'];
  dismissedAt?: Maybe<Scalars['DateTime']['output']>;
  entityId?: Maybe<Scalars['ID']['output']>;
  entityType?: Maybe<Scalars['String']['output']>;
  expiresAt?: Maybe<Scalars['DateTime']['output']>;
  id: Scalars['ID']['output'];
  isRead: Scalars['Boolean']['output'];
  message: Scalars['String']['output'];
  metadata?: Maybe<Scalars['JSON']['output']>;
  notificationType: SystemNotificationType;
  priority: NotificationPriority;
  readAt?: Maybe<Scalars['DateTime']['output']>;
  title: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
  user?: Maybe<User>;
  userId: Scalars['ID']['output'];
};

export type SystemNotificationType =
  | 'deal_close_date_approaching'
  | 'file_shared'
  | 'lead_follow_up_due'
  | 'system_announcement'
  | 'task_assigned'
  | 'task_due_today'
  | 'task_overdue'
  | 'user_assigned'
  | 'user_mentioned';

export type SystemNotificationsConnection = {
  __typename?: 'SystemNotificationsConnection';
  hasNextPage: Scalars['Boolean']['output'];
  hasPreviousPage: Scalars['Boolean']['output'];
  nodes: Array<SystemNotification>;
  totalCount: Scalars['Int']['output'];
};

export type Task = {
  __typename?: 'Task';
  actualHours?: Maybe<Scalars['Int']['output']>;
  affectsLeadScoring: Scalars['Boolean']['output'];
  assignedToUser?: Maybe<User>;
  blocksStageProgression: Scalars['Boolean']['output'];
  businessImpactScore: Scalars['Float']['output'];
  calculatedPriority: Scalars['Float']['output'];
  completedAt?: Maybe<Scalars['DateTime']['output']>;
  completionTriggersStageChange: Scalars['Boolean']['output'];
  createdAt: Scalars['DateTime']['output'];
  createdByUser?: Maybe<User>;
  customFieldValues: Array<CustomFieldValue>;
  deal?: Maybe<Deal>;
  dependencies: Array<TaskDependency>;
  description?: Maybe<Scalars['String']['output']>;
  dueDate?: Maybe<Scalars['DateTime']['output']>;
  entityId: Scalars['ID']['output'];
  entityType: TaskEntityType;
  estimatedHours?: Maybe<Scalars['Int']['output']>;
  id: Scalars['ID']['output'];
  lead?: Maybe<Lead>;
  organization?: Maybe<Organization>;
  parentTask?: Maybe<Task>;
  person?: Maybe<Person>;
  priority: TaskPriority;
  requiredForDealClosure: Scalars['Boolean']['output'];
  status: TaskStatus;
  subtasks: Array<Task>;
  tags: Array<Scalars['String']['output']>;
  taskType: TaskType;
  title: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
  wfmProject?: Maybe<WfmProject>;
};

export type TaskAutomationRule = {
  __typename?: 'TaskAutomationRule';
  appliesToEntityType: TaskEntityType;
  createdAt: Scalars['DateTime']['output'];
  description?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  isActive: Scalars['Boolean']['output'];
  name: Scalars['String']['output'];
  taskTemplate: Scalars['JSON']['output'];
  triggerConditions: Scalars['JSON']['output'];
  triggerEvent: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
};

export type TaskCompletionInput = {
  actualHours?: InputMaybe<Scalars['Int']['input']>;
  completedAt?: InputMaybe<Scalars['DateTime']['input']>;
  completionNotes?: InputMaybe<Scalars['String']['input']>;
};

export type TaskDependency = {
  __typename?: 'TaskDependency';
  createdAt: Scalars['DateTime']['output'];
  dependencyType: Scalars['String']['output'];
  dependsOnTask: Task;
  id: Scalars['ID']['output'];
  task: Task;
};

export type TaskEntityType =
  | 'DEAL'
  | 'LEAD'
  | 'ORGANIZATION'
  | 'PERSON';

export type TaskFiltersInput = {
  assignedToUserId?: InputMaybe<Scalars['ID']['input']>;
  createdByUserId?: InputMaybe<Scalars['ID']['input']>;
  dueDateFrom?: InputMaybe<Scalars['DateTime']['input']>;
  dueDateTo?: InputMaybe<Scalars['DateTime']['input']>;
  entityId?: InputMaybe<Scalars['ID']['input']>;
  entityType?: InputMaybe<Array<TaskEntityType>>;
  overdue?: InputMaybe<Scalars['Boolean']['input']>;
  priority?: InputMaybe<Array<TaskPriority>>;
  status?: InputMaybe<Array<TaskStatus>>;
  tags?: InputMaybe<Array<Scalars['String']['input']>>;
  taskType?: InputMaybe<Array<TaskType>>;
};

export type TaskHistory = {
  __typename?: 'TaskHistory';
  action: Scalars['String']['output'];
  changedByUser?: Maybe<User>;
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  newValue?: Maybe<Scalars['JSON']['output']>;
  oldValue?: Maybe<Scalars['JSON']['output']>;
  taskId?: Maybe<Scalars['ID']['output']>;
};

export type TaskPriority =
  | 'HIGH'
  | 'LOW'
  | 'MEDIUM'
  | 'URGENT';

export type TaskPriorityCount = {
  __typename?: 'TaskPriorityCount';
  count: Scalars['Int']['output'];
  priority: TaskPriority;
};

export type TaskStats = {
  __typename?: 'TaskStats';
  averageCompletionTime?: Maybe<Scalars['Float']['output']>;
  completedTasks: Scalars['Int']['output'];
  completionRate: Scalars['Float']['output'];
  overdueTasks: Scalars['Int']['output'];
  tasksByPriority: Array<TaskPriorityCount>;
  tasksByStatus: Array<TaskStatusCount>;
  tasksByType: Array<TaskTypeCount>;
  totalTasks: Scalars['Int']['output'];
};

export type TaskStatus =
  | 'CANCELLED'
  | 'COMPLETED'
  | 'IN_PROGRESS'
  | 'TODO'
  | 'WAITING_ON_CUSTOMER'
  | 'WAITING_ON_INTERNAL';

export type TaskStatusCount = {
  __typename?: 'TaskStatusCount';
  count: Scalars['Int']['output'];
  status: TaskStatus;
};

export type TaskType =
  | 'CONTRACT_REVIEW'
  | 'CRM_UPDATE'
  | 'DATA_ENRICHMENT'
  | 'DEAL_CLOSURE'
  | 'DEMO_PREPARATION'
  | 'DISCOVERY'
  | 'FOLLOW_UP'
  | 'LEAD_NURTURING'
  | 'LEAD_QUALIFICATION'
  | 'LEAD_SCORING_REVIEW'
  | 'NEGOTIATION_PREP'
  | 'PROPOSAL_CREATION'
  | 'RELATIONSHIP_BUILDING'
  | 'RENEWAL_PREPARATION'
  | 'REPORTING'
  | 'STAKEHOLDER_MAPPING';

export type TaskTypeCount = {
  __typename?: 'TaskTypeCount';
  count: Scalars['Int']['output'];
  taskType: TaskType;
};

export type ThinkingBudget =
  | 'STANDARD'
  | 'THINK'
  | 'THINK_HARD'
  | 'THINK_HARDER'
  | 'ULTRATHINK';

export type ToolDiscoveryResponse = {
  __typename?: 'ToolDiscoveryResponse';
  error?: Maybe<Scalars['String']['output']>;
  tools: Array<Scalars['JSON']['output']>;
};

export type ToolExecution = {
  __typename?: 'ToolExecution';
  error?: Maybe<Scalars['String']['output']>;
  executionTime: Scalars['Int']['output'];
  id: Scalars['ID']['output'];
  input: Scalars['JSON']['output'];
  name: Scalars['String']['output'];
  result?: Maybe<Scalars['JSON']['output']>;
  status: ToolExecutionStatus;
  timestamp: Scalars['String']['output'];
};

export type ToolExecutionStatus =
  | 'ERROR'
  | 'SUCCESS';

export type TriggerTypeEnum =
  | 'EVENT_BASED'
  | 'FIELD_CHANGE'
  | 'TIME_BASED';

export type UnifiedNotification = {
  __typename?: 'UnifiedNotification';
  actionUrl?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['DateTime']['output'];
  dismissedAt?: Maybe<Scalars['DateTime']['output']>;
  entityId?: Maybe<Scalars['ID']['output']>;
  entityType?: Maybe<Scalars['String']['output']>;
  expiresAt?: Maybe<Scalars['DateTime']['output']>;
  id: Scalars['ID']['output'];
  isRead: Scalars['Boolean']['output'];
  message: Scalars['String']['output'];
  metadata?: Maybe<Scalars['JSON']['output']>;
  notificationType: Scalars['String']['output'];
  priority: Scalars['Int']['output'];
  readAt?: Maybe<Scalars['DateTime']['output']>;
  source: NotificationSource;
  title: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
  user?: Maybe<User>;
  userId: Scalars['ID']['output'];
};

export type UnifiedNotificationsConnection = {
  __typename?: 'UnifiedNotificationsConnection';
  hasNextPage: Scalars['Boolean']['output'];
  hasPreviousPage: Scalars['Boolean']['output'];
  nodes: Array<UnifiedNotification>;
  totalCount: Scalars['Int']['output'];
};

export type UpdateAppSettingInput = {
  settingKey: Scalars['String']['input'];
  settingValue: Scalars['JSON']['input'];
};

export type UpdateBusinessRuleInput = {
  actions?: InputMaybe<Array<RuleActionInput>>;
  conditions?: InputMaybe<Array<RuleConditionInput>>;
  description?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<RuleStatusEnum>;
  triggerEvents?: InputMaybe<Array<Scalars['String']['input']>>;
  triggerFields?: InputMaybe<Array<Scalars['String']['input']>>;
  wfmStatusId?: InputMaybe<Scalars['ID']['input']>;
  wfmStepId?: InputMaybe<Scalars['ID']['input']>;
  wfmWorkflowId?: InputMaybe<Scalars['ID']['input']>;
};

export type UpdateCalendarEventInput = {
  addGoogleMeet?: InputMaybe<Scalars['Boolean']['input']>;
  attendeeEmails?: InputMaybe<Array<Scalars['String']['input']>>;
  description?: InputMaybe<Scalars['String']['input']>;
  endDateTime?: InputMaybe<Scalars['DateTime']['input']>;
  location?: InputMaybe<Scalars['String']['input']>;
  nextActions?: InputMaybe<Array<Scalars['String']['input']>>;
  outcome?: InputMaybe<CalendarEventOutcome>;
  outcomeNotes?: InputMaybe<Scalars['String']['input']>;
  reminders?: InputMaybe<Array<CalendarReminderInput>>;
  startDateTime?: InputMaybe<Scalars['DateTime']['input']>;
  timezone?: InputMaybe<Scalars['String']['input']>;
  title?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateConversationInput = {
  context?: InputMaybe<Scalars['JSON']['input']>;
  conversationId: Scalars['ID']['input'];
  plan?: InputMaybe<Scalars['JSON']['input']>;
};

export type UpdateCurrencyInput = {
  decimalPlaces?: InputMaybe<Scalars['Int']['input']>;
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  symbol?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateEmailPinInput = {
  notes?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateStickerInput = {
  categoryId?: InputMaybe<Scalars['ID']['input']>;
  color?: InputMaybe<Scalars['String']['input']>;
  content?: InputMaybe<Scalars['String']['input']>;
  height?: InputMaybe<Scalars['Int']['input']>;
  id: Scalars['ID']['input'];
  isPinned?: InputMaybe<Scalars['Boolean']['input']>;
  isPrivate?: InputMaybe<Scalars['Boolean']['input']>;
  mentions?: InputMaybe<Array<Scalars['ID']['input']>>;
  positionX?: InputMaybe<Scalars['Int']['input']>;
  positionY?: InputMaybe<Scalars['Int']['input']>;
  priority?: InputMaybe<StickerPriority>;
  tags?: InputMaybe<Array<Scalars['String']['input']>>;
  title?: InputMaybe<Scalars['String']['input']>;
  width?: InputMaybe<Scalars['Int']['input']>;
};

export type UpdateSystemNotificationInput = {
  dismissedAt?: InputMaybe<Scalars['DateTime']['input']>;
  isRead?: InputMaybe<Scalars['Boolean']['input']>;
};

export type UpdateTaskAutomationRuleInput = {
  appliesToEntityType?: InputMaybe<TaskEntityType>;
  description?: InputMaybe<Scalars['String']['input']>;
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  taskTemplate?: InputMaybe<Scalars['JSON']['input']>;
  triggerConditions?: InputMaybe<Scalars['JSON']['input']>;
  triggerEvent?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateTaskInput = {
  actualHours?: InputMaybe<Scalars['Int']['input']>;
  affectsLeadScoring?: InputMaybe<Scalars['Boolean']['input']>;
  assignedToUserId?: InputMaybe<Scalars['ID']['input']>;
  blocksStageProgression?: InputMaybe<Scalars['Boolean']['input']>;
  completedAt?: InputMaybe<Scalars['DateTime']['input']>;
  completionTriggersStageChange?: InputMaybe<Scalars['Boolean']['input']>;
  customFieldValues?: InputMaybe<Array<CustomFieldValueInput>>;
  description?: InputMaybe<Scalars['String']['input']>;
  dueDate?: InputMaybe<Scalars['DateTime']['input']>;
  estimatedHours?: InputMaybe<Scalars['Int']['input']>;
  priority?: InputMaybe<TaskPriority>;
  requiredForDealClosure?: InputMaybe<Scalars['Boolean']['input']>;
  status?: InputMaybe<TaskStatus>;
  tags?: InputMaybe<Array<Scalars['String']['input']>>;
  taskType?: InputMaybe<TaskType>;
  title?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateUserCurrencyPreferencesInput = {
  defaultCurrency?: InputMaybe<Scalars['String']['input']>;
  displayCurrency?: InputMaybe<Scalars['String']['input']>;
};

/**
 * Input type for updating a user's profile.
 * Only fields intended for update should be included.
 */
export type UpdateUserProfileInput = {
  /** The new avatar URL for the user. Null means no change. */
  avatar_url?: InputMaybe<Scalars['String']['input']>;
  /** The new display name for the user. Null means no change. */
  display_name?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateWfmProjectTypeInput = {
  defaultWorkflowId?: InputMaybe<Scalars['ID']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  iconName?: InputMaybe<Scalars['String']['input']>;
  isArchived?: InputMaybe<Scalars['Boolean']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateWfmStatusInput = {
  color?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  isArchived?: InputMaybe<Scalars['Boolean']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateWfmWorkflowInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  isArchived?: InputMaybe<Scalars['Boolean']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateWfmWorkflowStepInput = {
  isFinalStep?: InputMaybe<Scalars['Boolean']['input']>;
  isInitialStep?: InputMaybe<Scalars['Boolean']['input']>;
  metadata?: InputMaybe<Scalars['JSON']['input']>;
  statusId?: InputMaybe<Scalars['ID']['input']>;
  stepOrder?: InputMaybe<Scalars['Int']['input']>;
};

export type UpdateWfmWorkflowTransitionInput = {
  name?: InputMaybe<Scalars['String']['input']>;
};

export type UploadFileInput = {
  category?: InputMaybe<DocumentCategory>;
  content: Scalars['String']['input'];
  dealId?: InputMaybe<Scalars['ID']['input']>;
  mimeType: Scalars['String']['input'];
  name: Scalars['String']['input'];
  parentFolderId?: InputMaybe<Scalars['String']['input']>;
};

export type User = {
  __typename?: 'User';
  avatar_url?: Maybe<Scalars['String']['output']>;
  display_name?: Maybe<Scalars['String']['output']>;
  email: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  roles: Array<Role>;
};

export type UserCurrencyPreferences = {
  __typename?: 'UserCurrencyPreferences';
  createdAt: Scalars['String']['output'];
  defaultCurrency: Scalars['String']['output'];
  displayCurrency: Scalars['String']['output'];
  updatedAt: Scalars['String']['output'];
  userId: Scalars['ID']['output'];
};

/** Represents a specific instance of a workflow being executed for a particular entity (e.g., a deal, a task). */
export type WfmProject = {
  __typename?: 'WFMProject';
  completedAt?: Maybe<Scalars['DateTime']['output']>;
  completedBy?: Maybe<User>;
  createdAt: Scalars['DateTime']['output'];
  createdBy?: Maybe<User>;
  currentStep?: Maybe<WfmWorkflowStep>;
  description?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  isActive: Scalars['Boolean']['output'];
  metadata?: Maybe<Scalars['JSON']['output']>;
  name: Scalars['String']['output'];
  projectType: WfmProjectType;
  updatedAt: Scalars['DateTime']['output'];
  updatedBy?: Maybe<User>;
  workflow: WfmWorkflow;
};

export type WfmProjectType = {
  __typename?: 'WFMProjectType';
  createdAt: Scalars['DateTime']['output'];
  createdByUser?: Maybe<User>;
  defaultWorkflow?: Maybe<WfmWorkflow>;
  description?: Maybe<Scalars['String']['output']>;
  iconName?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  isArchived: Scalars['Boolean']['output'];
  name: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
  updatedByUser?: Maybe<User>;
};

export type WfmStatus = {
  __typename?: 'WFMStatus';
  color?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['DateTime']['output'];
  createdByUser?: Maybe<User>;
  description?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  isArchived: Scalars['Boolean']['output'];
  name: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
  updatedByUser?: Maybe<User>;
};

export type WfmStatusMutationResponse = {
  __typename?: 'WFMStatusMutationResponse';
  message?: Maybe<Scalars['String']['output']>;
  status?: Maybe<WfmStatus>;
  success: Scalars['Boolean']['output'];
};

export type WfmWorkflow = {
  __typename?: 'WFMWorkflow';
  createdAt: Scalars['DateTime']['output'];
  createdByUser?: Maybe<User>;
  description?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  isArchived: Scalars['Boolean']['output'];
  name: Scalars['String']['output'];
  steps?: Maybe<Array<WfmWorkflowStep>>;
  transitions?: Maybe<Array<WfmWorkflowTransition>>;
  updatedAt: Scalars['DateTime']['output'];
  updatedByUser?: Maybe<User>;
};

export type WfmWorkflowStep = {
  __typename?: 'WFMWorkflowStep';
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  isFinalStep: Scalars['Boolean']['output'];
  isInitialStep: Scalars['Boolean']['output'];
  metadata?: Maybe<Scalars['JSON']['output']>;
  status: WfmStatus;
  stepOrder: Scalars['Int']['output'];
  updatedAt: Scalars['DateTime']['output'];
};

export type WfmWorkflowStepMutationResponse = {
  __typename?: 'WFMWorkflowStepMutationResponse';
  message?: Maybe<Scalars['String']['output']>;
  stepId?: Maybe<Scalars['ID']['output']>;
  success: Scalars['Boolean']['output'];
};

export type WfmWorkflowTransition = {
  __typename?: 'WFMWorkflowTransition';
  createdAt: Scalars['DateTime']['output'];
  fromStep: WfmWorkflowStep;
  id: Scalars['ID']['output'];
  name?: Maybe<Scalars['String']['output']>;
  toStep: WfmWorkflowStep;
  updatedAt: Scalars['DateTime']['output'];
};

export type WfmWorkflowTransitionMutationResponse = {
  __typename?: 'WFMWorkflowTransitionMutationResponse';
  message?: Maybe<Scalars['String']['output']>;
  success: Scalars['Boolean']['output'];
  transitionId?: Maybe<Scalars['ID']['output']>;
};

export type GetAssignableUsersForCreateOrgQueryVariables = Exact<{ [key: string]: never; }>;


export type GetAssignableUsersForCreateOrgQuery = { __typename?: 'Query', assignableUsers: Array<{ __typename?: 'User', id: string, display_name?: string | null, email: string, avatar_url?: string | null }> };

export type GetAssignableUsersForEditOrgQueryVariables = Exact<{ [key: string]: never; }>;


export type GetAssignableUsersForEditOrgQuery = { __typename?: 'Query', assignableUsers: Array<{ __typename?: 'User', id: string, display_name?: string | null, email: string, avatar_url?: string | null }> };

export type GetAssignableUsersForAccountMgmtQueryVariables = Exact<{ [key: string]: never; }>;


export type GetAssignableUsersForAccountMgmtQuery = { __typename?: 'Query', assignableUsers: Array<{ __typename?: 'User', id: string, display_name?: string | null, email: string, avatar_url?: string | null }> };

export type GetAgentThoughtsQueryVariables = Exact<{
  conversationId: Scalars['ID']['input'];
  limit?: InputMaybe<Scalars['Int']['input']>;
}>;


export type GetAgentThoughtsQuery = { __typename?: 'Query', agentThoughts: Array<{ __typename?: 'AgentThought', id: string, conversationId: string, type: AgentThoughtType, content: string, metadata: Record<string, any>, timestamp: string }> };

export type ConvertDealToLeadModalMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  input: DealToLeadConversionInput;
}>;


export type ConvertDealToLeadModalMutation = { __typename?: 'Mutation', convertDealToLead: { __typename?: 'DealToLeadConversionResult', success: boolean, message: string, conversionId: string, lead?: { __typename?: 'Lead', id: string, name: string, estimated_value?: number | null, contact_name?: string | null, company_name?: string | null } | null } };

export type ConvertLeadMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  input: LeadConversionInput;
}>;


export type ConvertLeadMutation = { __typename?: 'Mutation', convertLead: { __typename?: 'LeadConversionResult', leadId: string, convertedEntities: { __typename?: 'ConvertedEntities', person?: { __typename?: 'Person', id: string, first_name?: string | null, last_name?: string | null, email?: string | null } | null, organization?: { __typename?: 'Organization', id: string, name: string } | null, deal?: { __typename?: 'Deal', id: string, name: string, amount?: number | null, currency?: string | null } | null } } };

export type GetProjectTypesQueryVariables = Exact<{ [key: string]: never; }>;


export type GetProjectTypesQuery = { __typename?: 'Query', wfmProjectTypes: Array<{ __typename?: 'WFMProjectType', id: string, name: string }> };

export type CreateContactFromEmailMutationVariables = Exact<{
  input: CreateContactFromEmailInput;
}>;


export type CreateContactFromEmailMutation = { __typename?: 'Mutation', createContactFromEmail: { __typename?: 'Person', id: string, first_name?: string | null, last_name?: string | null, email?: string | null, organization_id?: string | null } };

export type GetOrganizationsForContactQueryVariables = Exact<{ [key: string]: never; }>;


export type GetOrganizationsForContactQuery = { __typename?: 'Query', organizations: Array<{ __typename?: 'Organization', id: string, name: string }> };

export type GetEmailThreadsQueryVariables = Exact<{
  filter: EmailThreadsFilterInput;
}>;


export type GetEmailThreadsQuery = { __typename?: 'Query', getEmailThreads: { __typename?: 'EmailThreadConnection', totalCount: number, hasNextPage: boolean, nextPageToken?: string | null, threads: Array<{ __typename?: 'EmailThread', id: string, subject: string, participants: Array<string>, messageCount: number, isUnread: boolean, lastActivity: string, latestMessage?: { __typename?: 'EmailMessage', id: string, from: string, body: string, timestamp: string, hasAttachments: boolean } | null }> } };

export type GetEmailThreadQueryVariables = Exact<{
  threadId: Scalars['String']['input'];
}>;


export type GetEmailThreadQuery = { __typename?: 'Query', getEmailThread?: { __typename?: 'EmailThread', id: string, subject: string, participants: Array<string>, messageCount: number, isUnread: boolean, lastActivity: string, latestMessage?: { __typename?: 'EmailMessage', id: string, threadId: string, subject: string, from: string, to: Array<string>, cc?: Array<string> | null, bcc?: Array<string> | null, body: string, htmlBody?: string | null, timestamp: string, isUnread: boolean, hasAttachments: boolean, importance?: EmailImportance | null, attachments?: Array<{ __typename?: 'EmailAttachment', id: string, filename: string, mimeType: string, size: number }> | null } | null } | null };

export type GetEmailAnalyticsQueryVariables = Exact<{
  dealId: Scalars['String']['input'];
}>;


export type GetEmailAnalyticsQuery = { __typename?: 'Query', getEmailAnalytics?: { __typename?: 'EmailAnalytics', totalThreads: number, unreadCount: number, avgResponseTime?: string | null, lastContactTime?: string | null, emailSentiment?: string | null, responseRate?: number | null } | null };

export type ComposeEmailMutationVariables = Exact<{
  input: ComposeEmailInput;
}>;


export type ComposeEmailMutation = { __typename?: 'Mutation', composeEmail: { __typename?: 'EmailMessage', id: string, subject: string, from: string, to: Array<string>, timestamp: string } };

export type MarkThreadAsReadMutationVariables = Exact<{
  threadId: Scalars['String']['input'];
}>;


export type MarkThreadAsReadMutation = { __typename?: 'Mutation', markThreadAsRead: boolean };

export type CreateStickerMutationVariables = Exact<{
  input: CreateStickerInput;
}>;


export type CreateStickerMutation = { __typename?: 'Mutation', createSticker: { __typename?: 'SmartSticker', id: string, title: string, content?: string | null, entityType: EntityType, entityId: string, positionX: number, positionY: number, width: number, height: number, color: string, isPinned: boolean, isPrivate: boolean, priority: StickerPriority, mentions: Array<string>, tags: Array<string>, createdAt: string, updatedAt: string, createdByUserId: string, category?: { __typename?: 'StickerCategory', id: string, name: string, color: string, icon?: string | null } | null } };

export type PinEmailMutationVariables = Exact<{
  input: PinEmailInput;
}>;


export type PinEmailMutation = { __typename?: 'Mutation', pinEmail: { __typename?: 'EmailPin', id: string, emailId: string, threadId: string, subject?: string | null, fromEmail?: string | null, pinnedAt: string, notes?: string | null } };

export type GetPinnedEmailsForDealQueryVariables = Exact<{
  dealId: Scalars['ID']['input'];
}>;


export type GetPinnedEmailsForDealQuery = { __typename?: 'Query', getPinnedEmails: Array<{ __typename?: 'EmailPin', id: string, emailId: string, threadId: string, subject?: string | null, fromEmail?: string | null, pinnedAt: string, notes?: string | null }> };

export type UnpinEmailMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type UnpinEmailMutation = { __typename?: 'Mutation', unpinEmail: boolean };

export type GetDealWorkflowStepsQueryVariables = Exact<{
  dealId: Scalars['ID']['input'];
}>;


export type GetDealWorkflowStepsQuery = { __typename?: 'Query', deal?: { __typename?: 'Deal', id: string, wfmProject?: { __typename?: 'WFMProject', id: string, workflow: { __typename?: 'WFMWorkflow', id: string, name: string, steps?: Array<{ __typename?: 'WFMWorkflowStep', id: string, stepOrder: number, isInitialStep: boolean, isFinalStep: boolean, status: { __typename?: 'WFMStatus', id: string, name: string, color?: string | null } }> | null } } | null } | null };

export type GetDealParticipantsQueryVariables = Exact<{
  dealId: Scalars['ID']['input'];
}>;


export type GetDealParticipantsQuery = { __typename?: 'Query', getDealParticipants: Array<{ __typename?: 'DealParticipant', id: string, role: ContactRoleType, addedFromEmail: boolean, person: { __typename?: 'Person', id: string, first_name?: string | null, last_name?: string | null, email?: string | null } }> };

export type SuggestEmailParticipantsQueryVariables = Exact<{
  dealId: Scalars['ID']['input'];
  threadId?: InputMaybe<Scalars['String']['input']>;
}>;


export type SuggestEmailParticipantsQuery = { __typename?: 'Query', suggestEmailParticipants: Array<{ __typename?: 'Person', id: string, first_name?: string | null, last_name?: string | null, email?: string | null }> };

export type GenerateTaskContentFromEmailMutationVariables = Exact<{
  input: GenerateTaskContentInput;
}>;


export type GenerateTaskContentFromEmailMutation = { __typename?: 'Mutation', generateTaskContentFromEmail: { __typename?: 'AIGeneratedTaskContent', subject: string, description: string, suggestedDueDate?: string | null, confidence: number, emailScope: string, sourceContent: string } };

export type GetPinnedEmailsQueryVariables = Exact<{
  dealId: Scalars['ID']['input'];
}>;


export type GetPinnedEmailsQuery = { __typename?: 'Query', getPinnedEmails: Array<{ __typename?: 'EmailPin', id: string, emailId: string, threadId: string, subject?: string | null, fromEmail?: string | null, pinnedAt: string, notes?: string | null, createdAt: string, updatedAt: string }> };

export type UpdateEmailPinMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  input: UpdateEmailPinInput;
}>;


export type UpdateEmailPinMutation = { __typename?: 'Mutation', updateEmailPin: { __typename?: 'EmailPin', id: string, notes?: string | null, updatedAt: string } };

export type GetNotificationSummaryQueryVariables = Exact<{ [key: string]: never; }>;


export type GetNotificationSummaryQuery = { __typename?: 'Query', notificationSummary: { __typename?: 'NotificationSummary', totalCount: number, unreadCount: number, businessRuleCount: number, systemCount: number, highPriorityCount: number } };

export type GetUnifiedNotificationsQueryVariables = Exact<{
  first?: InputMaybe<Scalars['Int']['input']>;
  filters?: InputMaybe<NotificationFilters>;
}>;


export type GetUnifiedNotificationsQuery = { __typename?: 'Query', unifiedNotifications: { __typename?: 'UnifiedNotificationsConnection', totalCount: number, hasNextPage: boolean, hasPreviousPage: boolean, nodes: Array<{ __typename?: 'UnifiedNotification', source: NotificationSource, id: string, title: string, message: string, notificationType: string, priority: number, entityType?: string | null, entityId?: string | null, actionUrl?: string | null, isRead: boolean, readAt?: string | null, dismissedAt?: string | null, expiresAt?: string | null, createdAt: string, updatedAt: string }> } };

export type MarkSystemNotificationAsReadMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type MarkSystemNotificationAsReadMutation = { __typename?: 'Mutation', markSystemNotificationAsRead: boolean };

export type MarkAllSystemNotificationsAsReadMutationVariables = Exact<{ [key: string]: never; }>;


export type MarkAllSystemNotificationsAsReadMutation = { __typename?: 'Mutation', markAllSystemNotificationsAsRead: number };

export type MarkBusinessRuleNotificationAsReadMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type MarkBusinessRuleNotificationAsReadMutation = { __typename?: 'Mutation', markBusinessRuleNotificationAsRead: boolean };

export type MarkAllBusinessRuleNotificationsAsReadMutationVariables = Exact<{ [key: string]: never; }>;


export type MarkAllBusinessRuleNotificationsAsReadMutation = { __typename?: 'Mutation', markAllBusinessRuleNotificationsAsRead: number };

export type DismissSystemNotificationMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type DismissSystemNotificationMutation = { __typename?: 'Mutation', dismissSystemNotification: boolean };

export type UpdateUserProfileMutationVariables = Exact<{
  input: UpdateUserProfileInput;
}>;


export type UpdateUserProfileMutation = { __typename?: 'Mutation', updateUserProfile?: { __typename?: 'User', id: string, email: string, display_name?: string | null, avatar_url?: string | null } | null };

export type GetExchangeRatesQueryVariables = Exact<{ [key: string]: never; }>;


export type GetExchangeRatesQuery = { __typename?: 'Query', exchangeRates: Array<{ __typename?: 'ExchangeRate', id: string, fromCurrency: string, toCurrency: string, rate: number, effectiveDate: string, source: string, createdAt: string, updatedAt: string }> };

export type SetExchangeRateMutationVariables = Exact<{
  input: SetExchangeRateInput;
}>;


export type SetExchangeRateMutation = { __typename?: 'Mutation', setExchangeRate: { __typename?: 'ExchangeRate', id: string, fromCurrency: string, toCurrency: string, rate: number, effectiveDate: string, source: string, createdAt: string, updatedAt: string } };

export type UpdateRatesFromEcbMutationVariables = Exact<{ [key: string]: never; }>;


export type UpdateRatesFromEcbMutation = { __typename?: 'Mutation', updateRatesFromECB: { __typename?: 'CurrencyOperationResult', success: boolean, message: string } };

export type GetGoogleIntegrationStatusQueryVariables = Exact<{ [key: string]: never; }>;


export type GetGoogleIntegrationStatusQuery = { __typename?: 'Query', googleIntegrationStatus: { __typename?: 'GoogleIntegrationStatus', isConnected: boolean, hasGoogleAuth: boolean, hasDriveAccess: boolean, hasGmailAccess: boolean, hasCalendarAccess: boolean, hasContactsAccess: boolean, tokenExpiry?: string | null, missingScopes: Array<string> } };

export type RevokeGoogleIntegrationMutationVariables = Exact<{ [key: string]: never; }>;


export type RevokeGoogleIntegrationMutation = { __typename?: 'Mutation', revokeGoogleIntegration: boolean };

export type ConnectGoogleIntegrationMutationVariables = Exact<{
  input: ConnectGoogleIntegrationInput;
}>;


export type ConnectGoogleIntegrationMutation = { __typename?: 'Mutation', connectGoogleIntegration: { __typename?: 'GoogleIntegrationStatus', isConnected: boolean, hasGoogleAuth: boolean, hasDriveAccess: boolean, hasGmailAccess: boolean, hasCalendarAccess: boolean, hasContactsAccess: boolean, tokenExpiry?: string | null, missingScopes: Array<string> } };

export type GetLeadDetailsQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type GetLeadDetailsQuery = { __typename?: 'Query', lead?: { __typename?: 'Lead', id: string, name: string, source?: string | null, description?: string | null, contact_name?: string | null, contact_email?: string | null, contact_phone?: string | null, company_name?: string | null, estimated_value?: number | null, estimated_close_date?: string | null, lead_score: number, isQualified: boolean, assigned_to_user_id?: string | null, assigned_at?: string | null, converted_at?: string | null, converted_to_deal_id?: string | null, last_activity_at: string, created_at: string, updated_at: string, assignedToUser?: { __typename?: 'User', id: string, email: string, display_name?: string | null, avatar_url?: string | null } | null, currentWfmStatus?: { __typename?: 'WFMStatus', id: string, name: string, color?: string | null } | null } | null };

export type GetStickerCategoriesForLeadQueryVariables = Exact<{ [key: string]: never; }>;


export type GetStickerCategoriesForLeadQuery = { __typename?: 'Query', getStickerCategories: Array<{ __typename?: 'StickerCategory', id: string, name: string, color: string, icon?: string | null, isSystem: boolean, displayOrder: number }> };

export type GetPersonCustomFieldDefinitionsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetPersonCustomFieldDefinitionsQuery = { __typename?: 'Query', customFieldDefinitions: Array<{ __typename?: 'CustomFieldDefinition', id: string, fieldName: string, fieldLabel: string, fieldType: CustomFieldType, dropdownOptions?: Array<{ __typename?: 'CustomFieldOption', value: string, label: string }> | null }> };

export type GetMeQueryVariables = Exact<{ [key: string]: never; }>;


export type GetMeQuery = { __typename?: 'Query', me?: { __typename?: 'User', id: string, email: string, display_name?: string | null, avatar_url?: string | null } | null };

export type GetRolesQueryVariables = Exact<{ [key: string]: never; }>;


export type GetRolesQuery = { __typename?: 'Query', roles: Array<{ __typename?: 'Role', id: string, name: string, description: string }> };

export type AssignUserRoleMutationVariables = Exact<{
  userId: Scalars['ID']['input'];
  roleName: Scalars['String']['input'];
}>;


export type AssignUserRoleMutation = { __typename?: 'Mutation', assignUserRole: { __typename?: 'User', id: string, email: string, roles: Array<{ __typename?: 'Role', id: string, name: string, description: string }> } };

export type RemoveUserRoleMutationVariables = Exact<{
  userId: Scalars['ID']['input'];
  roleName: Scalars['String']['input'];
}>;


export type RemoveUserRoleMutation = { __typename?: 'Mutation', removeUserRole: { __typename?: 'User', id: string, email: string, roles: Array<{ __typename?: 'Role', id: string, name: string, description: string }> } };


export const GetAssignableUsersForCreateOrgDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetAssignableUsersForCreateOrg"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"assignableUsers"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"display_name"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"avatar_url"}}]}}]}}]} as unknown as DocumentNode<GetAssignableUsersForCreateOrgQuery, GetAssignableUsersForCreateOrgQueryVariables>;
export const GetAssignableUsersForEditOrgDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetAssignableUsersForEditOrg"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"assignableUsers"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"display_name"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"avatar_url"}}]}}]}}]} as unknown as DocumentNode<GetAssignableUsersForEditOrgQuery, GetAssignableUsersForEditOrgQueryVariables>;
export const GetAssignableUsersForAccountMgmtDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetAssignableUsersForAccountMgmt"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"assignableUsers"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"display_name"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"avatar_url"}}]}}]}}]} as unknown as DocumentNode<GetAssignableUsersForAccountMgmtQuery, GetAssignableUsersForAccountMgmtQueryVariables>;
export const GetAgentThoughtsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetAgentThoughts"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"conversationId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"limit"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"agentThoughts"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"conversationId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"conversationId"}}},{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"Variable","name":{"kind":"Name","value":"limit"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"conversationId"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"content"}},{"kind":"Field","name":{"kind":"Name","value":"metadata"}},{"kind":"Field","name":{"kind":"Name","value":"timestamp"}}]}}]}}]} as unknown as DocumentNode<GetAgentThoughtsQuery, GetAgentThoughtsQueryVariables>;
export const ConvertDealToLeadModalDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"ConvertDealToLeadModal"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"DealToLeadConversionInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"convertDealToLead"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"success"}},{"kind":"Field","name":{"kind":"Name","value":"message"}},{"kind":"Field","name":{"kind":"Name","value":"conversionId"}},{"kind":"Field","name":{"kind":"Name","value":"lead"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"estimated_value"}},{"kind":"Field","name":{"kind":"Name","value":"contact_name"}},{"kind":"Field","name":{"kind":"Name","value":"company_name"}}]}}]}}]}}]} as unknown as DocumentNode<ConvertDealToLeadModalMutation, ConvertDealToLeadModalMutationVariables>;
export const ConvertLeadDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"ConvertLead"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"LeadConversionInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"convertLead"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"leadId"}},{"kind":"Field","name":{"kind":"Name","value":"convertedEntities"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"person"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"first_name"}},{"kind":"Field","name":{"kind":"Name","value":"last_name"}},{"kind":"Field","name":{"kind":"Name","value":"email"}}]}},{"kind":"Field","name":{"kind":"Name","value":"organization"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"deal"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}}]}}]}}]}}]}}]} as unknown as DocumentNode<ConvertLeadMutation, ConvertLeadMutationVariables>;
export const GetProjectTypesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetProjectTypes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"wfmProjectTypes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]} as unknown as DocumentNode<GetProjectTypesQuery, GetProjectTypesQueryVariables>;
export const CreateContactFromEmailDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateContactFromEmail"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateContactFromEmailInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createContactFromEmail"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"first_name"}},{"kind":"Field","name":{"kind":"Name","value":"last_name"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"organization_id"}}]}}]}}]} as unknown as DocumentNode<CreateContactFromEmailMutation, CreateContactFromEmailMutationVariables>;
export const GetOrganizationsForContactDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetOrganizationsForContact"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"organizations"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]} as unknown as DocumentNode<GetOrganizationsForContactQuery, GetOrganizationsForContactQueryVariables>;
export const GetEmailThreadsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetEmailThreads"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"filter"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"EmailThreadsFilterInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"getEmailThreads"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"filter"},"value":{"kind":"Variable","name":{"kind":"Name","value":"filter"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"threads"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"subject"}},{"kind":"Field","name":{"kind":"Name","value":"participants"}},{"kind":"Field","name":{"kind":"Name","value":"messageCount"}},{"kind":"Field","name":{"kind":"Name","value":"isUnread"}},{"kind":"Field","name":{"kind":"Name","value":"lastActivity"}},{"kind":"Field","name":{"kind":"Name","value":"latestMessage"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"from"}},{"kind":"Field","name":{"kind":"Name","value":"body"}},{"kind":"Field","name":{"kind":"Name","value":"timestamp"}},{"kind":"Field","name":{"kind":"Name","value":"hasAttachments"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"totalCount"}},{"kind":"Field","name":{"kind":"Name","value":"hasNextPage"}},{"kind":"Field","name":{"kind":"Name","value":"nextPageToken"}}]}}]}}]} as unknown as DocumentNode<GetEmailThreadsQuery, GetEmailThreadsQueryVariables>;
export const GetEmailThreadDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetEmailThread"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"threadId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"getEmailThread"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"threadId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"threadId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"subject"}},{"kind":"Field","name":{"kind":"Name","value":"participants"}},{"kind":"Field","name":{"kind":"Name","value":"messageCount"}},{"kind":"Field","name":{"kind":"Name","value":"isUnread"}},{"kind":"Field","name":{"kind":"Name","value":"lastActivity"}},{"kind":"Field","name":{"kind":"Name","value":"latestMessage"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"threadId"}},{"kind":"Field","name":{"kind":"Name","value":"subject"}},{"kind":"Field","name":{"kind":"Name","value":"from"}},{"kind":"Field","name":{"kind":"Name","value":"to"}},{"kind":"Field","name":{"kind":"Name","value":"cc"}},{"kind":"Field","name":{"kind":"Name","value":"bcc"}},{"kind":"Field","name":{"kind":"Name","value":"body"}},{"kind":"Field","name":{"kind":"Name","value":"htmlBody"}},{"kind":"Field","name":{"kind":"Name","value":"timestamp"}},{"kind":"Field","name":{"kind":"Name","value":"isUnread"}},{"kind":"Field","name":{"kind":"Name","value":"hasAttachments"}},{"kind":"Field","name":{"kind":"Name","value":"attachments"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"filename"}},{"kind":"Field","name":{"kind":"Name","value":"mimeType"}},{"kind":"Field","name":{"kind":"Name","value":"size"}}]}},{"kind":"Field","name":{"kind":"Name","value":"importance"}}]}}]}}]}}]} as unknown as DocumentNode<GetEmailThreadQuery, GetEmailThreadQueryVariables>;
export const GetEmailAnalyticsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetEmailAnalytics"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"dealId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"getEmailAnalytics"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"dealId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"dealId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"totalThreads"}},{"kind":"Field","name":{"kind":"Name","value":"unreadCount"}},{"kind":"Field","name":{"kind":"Name","value":"avgResponseTime"}},{"kind":"Field","name":{"kind":"Name","value":"lastContactTime"}},{"kind":"Field","name":{"kind":"Name","value":"emailSentiment"}},{"kind":"Field","name":{"kind":"Name","value":"responseRate"}}]}}]}}]} as unknown as DocumentNode<GetEmailAnalyticsQuery, GetEmailAnalyticsQueryVariables>;
export const ComposeEmailDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"ComposeEmail"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ComposeEmailInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"composeEmail"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"subject"}},{"kind":"Field","name":{"kind":"Name","value":"from"}},{"kind":"Field","name":{"kind":"Name","value":"to"}},{"kind":"Field","name":{"kind":"Name","value":"timestamp"}}]}}]}}]} as unknown as DocumentNode<ComposeEmailMutation, ComposeEmailMutationVariables>;
export const MarkThreadAsReadDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"MarkThreadAsRead"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"threadId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"markThreadAsRead"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"threadId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"threadId"}}}]}]}}]} as unknown as DocumentNode<MarkThreadAsReadMutation, MarkThreadAsReadMutationVariables>;
export const CreateStickerDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateSticker"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateStickerInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createSticker"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"content"}},{"kind":"Field","name":{"kind":"Name","value":"entityType"}},{"kind":"Field","name":{"kind":"Name","value":"entityId"}},{"kind":"Field","name":{"kind":"Name","value":"positionX"}},{"kind":"Field","name":{"kind":"Name","value":"positionY"}},{"kind":"Field","name":{"kind":"Name","value":"width"}},{"kind":"Field","name":{"kind":"Name","value":"height"}},{"kind":"Field","name":{"kind":"Name","value":"color"}},{"kind":"Field","name":{"kind":"Name","value":"isPinned"}},{"kind":"Field","name":{"kind":"Name","value":"isPrivate"}},{"kind":"Field","name":{"kind":"Name","value":"priority"}},{"kind":"Field","name":{"kind":"Name","value":"mentions"}},{"kind":"Field","name":{"kind":"Name","value":"tags"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"createdByUserId"}},{"kind":"Field","name":{"kind":"Name","value":"category"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"color"}},{"kind":"Field","name":{"kind":"Name","value":"icon"}}]}}]}}]}}]} as unknown as DocumentNode<CreateStickerMutation, CreateStickerMutationVariables>;
export const PinEmailDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"PinEmail"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"PinEmailInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"pinEmail"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"emailId"}},{"kind":"Field","name":{"kind":"Name","value":"threadId"}},{"kind":"Field","name":{"kind":"Name","value":"subject"}},{"kind":"Field","name":{"kind":"Name","value":"fromEmail"}},{"kind":"Field","name":{"kind":"Name","value":"pinnedAt"}},{"kind":"Field","name":{"kind":"Name","value":"notes"}}]}}]}}]} as unknown as DocumentNode<PinEmailMutation, PinEmailMutationVariables>;
export const GetPinnedEmailsForDealDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetPinnedEmailsForDeal"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"dealId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"getPinnedEmails"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"dealId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"dealId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"emailId"}},{"kind":"Field","name":{"kind":"Name","value":"threadId"}},{"kind":"Field","name":{"kind":"Name","value":"subject"}},{"kind":"Field","name":{"kind":"Name","value":"fromEmail"}},{"kind":"Field","name":{"kind":"Name","value":"pinnedAt"}},{"kind":"Field","name":{"kind":"Name","value":"notes"}}]}}]}}]} as unknown as DocumentNode<GetPinnedEmailsForDealQuery, GetPinnedEmailsForDealQueryVariables>;
export const UnpinEmailDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UnpinEmail"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"unpinEmail"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}]}]}}]} as unknown as DocumentNode<UnpinEmailMutation, UnpinEmailMutationVariables>;
export const GetDealWorkflowStepsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetDealWorkflowSteps"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"dealId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deal"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"dealId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"wfmProject"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"workflow"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"steps"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"stepOrder"}},{"kind":"Field","name":{"kind":"Name","value":"isInitialStep"}},{"kind":"Field","name":{"kind":"Name","value":"isFinalStep"}},{"kind":"Field","name":{"kind":"Name","value":"status"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"color"}}]}}]}}]}}]}}]}}]}}]} as unknown as DocumentNode<GetDealWorkflowStepsQuery, GetDealWorkflowStepsQueryVariables>;
export const GetDealParticipantsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetDealParticipants"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"dealId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"getDealParticipants"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"dealId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"dealId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"role"}},{"kind":"Field","name":{"kind":"Name","value":"addedFromEmail"}},{"kind":"Field","name":{"kind":"Name","value":"person"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"first_name"}},{"kind":"Field","name":{"kind":"Name","value":"last_name"}},{"kind":"Field","name":{"kind":"Name","value":"email"}}]}}]}}]}}]} as unknown as DocumentNode<GetDealParticipantsQuery, GetDealParticipantsQueryVariables>;
export const SuggestEmailParticipantsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"SuggestEmailParticipants"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"dealId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"threadId"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"suggestEmailParticipants"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"dealId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"dealId"}}},{"kind":"Argument","name":{"kind":"Name","value":"threadId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"threadId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"first_name"}},{"kind":"Field","name":{"kind":"Name","value":"last_name"}},{"kind":"Field","name":{"kind":"Name","value":"email"}}]}}]}}]} as unknown as DocumentNode<SuggestEmailParticipantsQuery, SuggestEmailParticipantsQueryVariables>;
export const GenerateTaskContentFromEmailDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"GenerateTaskContentFromEmail"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"GenerateTaskContentInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"generateTaskContentFromEmail"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"subject"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"suggestedDueDate"}},{"kind":"Field","name":{"kind":"Name","value":"confidence"}},{"kind":"Field","name":{"kind":"Name","value":"emailScope"}},{"kind":"Field","name":{"kind":"Name","value":"sourceContent"}}]}}]}}]} as unknown as DocumentNode<GenerateTaskContentFromEmailMutation, GenerateTaskContentFromEmailMutationVariables>;
export const GetPinnedEmailsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetPinnedEmails"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"dealId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"getPinnedEmails"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"dealId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"dealId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"emailId"}},{"kind":"Field","name":{"kind":"Name","value":"threadId"}},{"kind":"Field","name":{"kind":"Name","value":"subject"}},{"kind":"Field","name":{"kind":"Name","value":"fromEmail"}},{"kind":"Field","name":{"kind":"Name","value":"pinnedAt"}},{"kind":"Field","name":{"kind":"Name","value":"notes"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]}}]} as unknown as DocumentNode<GetPinnedEmailsQuery, GetPinnedEmailsQueryVariables>;
export const UpdateEmailPinDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateEmailPin"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateEmailPinInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateEmailPin"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"notes"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]}}]} as unknown as DocumentNode<UpdateEmailPinMutation, UpdateEmailPinMutationVariables>;
export const GetNotificationSummaryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetNotificationSummary"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"notificationSummary"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"totalCount"}},{"kind":"Field","name":{"kind":"Name","value":"unreadCount"}},{"kind":"Field","name":{"kind":"Name","value":"businessRuleCount"}},{"kind":"Field","name":{"kind":"Name","value":"systemCount"}},{"kind":"Field","name":{"kind":"Name","value":"highPriorityCount"}}]}}]}}]} as unknown as DocumentNode<GetNotificationSummaryQuery, GetNotificationSummaryQueryVariables>;
export const GetUnifiedNotificationsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetUnifiedNotifications"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"first"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"filters"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"NotificationFilters"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"unifiedNotifications"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"Variable","name":{"kind":"Name","value":"first"}}},{"kind":"Argument","name":{"kind":"Name","value":"filters"},"value":{"kind":"Variable","name":{"kind":"Name","value":"filters"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"source"}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"message"}},{"kind":"Field","name":{"kind":"Name","value":"notificationType"}},{"kind":"Field","name":{"kind":"Name","value":"priority"}},{"kind":"Field","name":{"kind":"Name","value":"entityType"}},{"kind":"Field","name":{"kind":"Name","value":"entityId"}},{"kind":"Field","name":{"kind":"Name","value":"actionUrl"}},{"kind":"Field","name":{"kind":"Name","value":"isRead"}},{"kind":"Field","name":{"kind":"Name","value":"readAt"}},{"kind":"Field","name":{"kind":"Name","value":"dismissedAt"}},{"kind":"Field","name":{"kind":"Name","value":"expiresAt"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}},{"kind":"Field","name":{"kind":"Name","value":"totalCount"}},{"kind":"Field","name":{"kind":"Name","value":"hasNextPage"}},{"kind":"Field","name":{"kind":"Name","value":"hasPreviousPage"}}]}}]}}]} as unknown as DocumentNode<GetUnifiedNotificationsQuery, GetUnifiedNotificationsQueryVariables>;
export const MarkSystemNotificationAsReadDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"MarkSystemNotificationAsRead"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"markSystemNotificationAsRead"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}]}]}}]} as unknown as DocumentNode<MarkSystemNotificationAsReadMutation, MarkSystemNotificationAsReadMutationVariables>;
export const MarkAllSystemNotificationsAsReadDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"MarkAllSystemNotificationsAsRead"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"markAllSystemNotificationsAsRead"}}]}}]} as unknown as DocumentNode<MarkAllSystemNotificationsAsReadMutation, MarkAllSystemNotificationsAsReadMutationVariables>;
export const MarkBusinessRuleNotificationAsReadDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"MarkBusinessRuleNotificationAsRead"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"markBusinessRuleNotificationAsRead"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}]}]}}]} as unknown as DocumentNode<MarkBusinessRuleNotificationAsReadMutation, MarkBusinessRuleNotificationAsReadMutationVariables>;
export const MarkAllBusinessRuleNotificationsAsReadDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"MarkAllBusinessRuleNotificationsAsRead"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"markAllBusinessRuleNotificationsAsRead"}}]}}]} as unknown as DocumentNode<MarkAllBusinessRuleNotificationsAsReadMutation, MarkAllBusinessRuleNotificationsAsReadMutationVariables>;
export const DismissSystemNotificationDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DismissSystemNotification"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"dismissSystemNotification"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}]}]}}]} as unknown as DocumentNode<DismissSystemNotificationMutation, DismissSystemNotificationMutationVariables>;
export const UpdateUserProfileDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateUserProfile"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateUserProfileInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateUserProfile"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"display_name"}},{"kind":"Field","name":{"kind":"Name","value":"avatar_url"}}]}}]}}]} as unknown as DocumentNode<UpdateUserProfileMutation, UpdateUserProfileMutationVariables>;
export const GetExchangeRatesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetExchangeRates"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"exchangeRates"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"fromCurrency"}},{"kind":"Field","name":{"kind":"Name","value":"toCurrency"}},{"kind":"Field","name":{"kind":"Name","value":"rate"}},{"kind":"Field","name":{"kind":"Name","value":"effectiveDate"}},{"kind":"Field","name":{"kind":"Name","value":"source"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]}}]} as unknown as DocumentNode<GetExchangeRatesQuery, GetExchangeRatesQueryVariables>;
export const SetExchangeRateDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"SetExchangeRate"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"SetExchangeRateInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"setExchangeRate"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"fromCurrency"}},{"kind":"Field","name":{"kind":"Name","value":"toCurrency"}},{"kind":"Field","name":{"kind":"Name","value":"rate"}},{"kind":"Field","name":{"kind":"Name","value":"effectiveDate"}},{"kind":"Field","name":{"kind":"Name","value":"source"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]}}]} as unknown as DocumentNode<SetExchangeRateMutation, SetExchangeRateMutationVariables>;
export const UpdateRatesFromEcbDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateRatesFromECB"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateRatesFromECB"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"success"}},{"kind":"Field","name":{"kind":"Name","value":"message"}}]}}]}}]} as unknown as DocumentNode<UpdateRatesFromEcbMutation, UpdateRatesFromEcbMutationVariables>;
export const GetGoogleIntegrationStatusDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetGoogleIntegrationStatus"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"googleIntegrationStatus"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"isConnected"}},{"kind":"Field","name":{"kind":"Name","value":"hasGoogleAuth"}},{"kind":"Field","name":{"kind":"Name","value":"hasDriveAccess"}},{"kind":"Field","name":{"kind":"Name","value":"hasGmailAccess"}},{"kind":"Field","name":{"kind":"Name","value":"hasCalendarAccess"}},{"kind":"Field","name":{"kind":"Name","value":"hasContactsAccess"}},{"kind":"Field","name":{"kind":"Name","value":"tokenExpiry"}},{"kind":"Field","name":{"kind":"Name","value":"missingScopes"}}]}}]}}]} as unknown as DocumentNode<GetGoogleIntegrationStatusQuery, GetGoogleIntegrationStatusQueryVariables>;
export const RevokeGoogleIntegrationDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"RevokeGoogleIntegration"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"revokeGoogleIntegration"}}]}}]} as unknown as DocumentNode<RevokeGoogleIntegrationMutation, RevokeGoogleIntegrationMutationVariables>;
export const ConnectGoogleIntegrationDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"ConnectGoogleIntegration"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ConnectGoogleIntegrationInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"connectGoogleIntegration"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"isConnected"}},{"kind":"Field","name":{"kind":"Name","value":"hasGoogleAuth"}},{"kind":"Field","name":{"kind":"Name","value":"hasDriveAccess"}},{"kind":"Field","name":{"kind":"Name","value":"hasGmailAccess"}},{"kind":"Field","name":{"kind":"Name","value":"hasCalendarAccess"}},{"kind":"Field","name":{"kind":"Name","value":"hasContactsAccess"}},{"kind":"Field","name":{"kind":"Name","value":"tokenExpiry"}},{"kind":"Field","name":{"kind":"Name","value":"missingScopes"}}]}}]}}]} as unknown as DocumentNode<ConnectGoogleIntegrationMutation, ConnectGoogleIntegrationMutationVariables>;
export const GetLeadDetailsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetLeadDetails"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"lead"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"source"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"contact_name"}},{"kind":"Field","name":{"kind":"Name","value":"contact_email"}},{"kind":"Field","name":{"kind":"Name","value":"contact_phone"}},{"kind":"Field","name":{"kind":"Name","value":"company_name"}},{"kind":"Field","name":{"kind":"Name","value":"estimated_value"}},{"kind":"Field","name":{"kind":"Name","value":"estimated_close_date"}},{"kind":"Field","name":{"kind":"Name","value":"lead_score"}},{"kind":"Field","name":{"kind":"Name","value":"isQualified"}},{"kind":"Field","name":{"kind":"Name","value":"assigned_to_user_id"}},{"kind":"Field","name":{"kind":"Name","value":"assigned_at"}},{"kind":"Field","name":{"kind":"Name","value":"converted_at"}},{"kind":"Field","name":{"kind":"Name","value":"converted_to_deal_id"}},{"kind":"Field","name":{"kind":"Name","value":"last_activity_at"}},{"kind":"Field","name":{"kind":"Name","value":"created_at"}},{"kind":"Field","name":{"kind":"Name","value":"updated_at"}},{"kind":"Field","name":{"kind":"Name","value":"assignedToUser"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"display_name"}},{"kind":"Field","name":{"kind":"Name","value":"avatar_url"}}]}},{"kind":"Field","name":{"kind":"Name","value":"currentWfmStatus"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"color"}}]}}]}}]}}]} as unknown as DocumentNode<GetLeadDetailsQuery, GetLeadDetailsQueryVariables>;
export const GetStickerCategoriesForLeadDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetStickerCategoriesForLead"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"getStickerCategories"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"color"}},{"kind":"Field","name":{"kind":"Name","value":"icon"}},{"kind":"Field","name":{"kind":"Name","value":"isSystem"}},{"kind":"Field","name":{"kind":"Name","value":"displayOrder"}}]}}]}}]} as unknown as DocumentNode<GetStickerCategoriesForLeadQuery, GetStickerCategoriesForLeadQueryVariables>;
export const GetPersonCustomFieldDefinitionsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetPersonCustomFieldDefinitions"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"customFieldDefinitions"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"entityType"},"value":{"kind":"EnumValue","value":"PERSON"}},{"kind":"Argument","name":{"kind":"Name","value":"includeInactive"},"value":{"kind":"BooleanValue","value":false}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"fieldName"}},{"kind":"Field","name":{"kind":"Name","value":"fieldLabel"}},{"kind":"Field","name":{"kind":"Name","value":"fieldType"}},{"kind":"Field","name":{"kind":"Name","value":"dropdownOptions"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"value"}},{"kind":"Field","name":{"kind":"Name","value":"label"}}]}}]}}]}}]} as unknown as DocumentNode<GetPersonCustomFieldDefinitionsQuery, GetPersonCustomFieldDefinitionsQueryVariables>;
export const GetMeDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetMe"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"me"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"display_name"}},{"kind":"Field","name":{"kind":"Name","value":"avatar_url"}}]}}]}}]} as unknown as DocumentNode<GetMeQuery, GetMeQueryVariables>;
export const GetRolesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetRoles"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"roles"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}}]}}]}}]} as unknown as DocumentNode<GetRolesQuery, GetRolesQueryVariables>;
export const AssignUserRoleDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"AssignUserRole"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"userId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"roleName"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"assignUserRole"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"userId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"userId"}}},{"kind":"Argument","name":{"kind":"Name","value":"roleName"},"value":{"kind":"Variable","name":{"kind":"Name","value":"roleName"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"roles"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}}]}}]}}]}}]} as unknown as DocumentNode<AssignUserRoleMutation, AssignUserRoleMutationVariables>;
export const RemoveUserRoleDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"RemoveUserRole"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"userId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"roleName"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"removeUserRole"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"userId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"userId"}}},{"kind":"Argument","name":{"kind":"Name","value":"roleName"},"value":{"kind":"Variable","name":{"kind":"Name","value":"roleName"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"roles"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}}]}}]}}]}}]} as unknown as DocumentNode<RemoveUserRoleMutation, RemoveUserRoleMutationVariables>;