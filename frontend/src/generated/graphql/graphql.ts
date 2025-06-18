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

export type Activity = {
  __typename?: 'Activity';
  assignedToUser?: Maybe<User>;
  assigned_to_user_id?: Maybe<Scalars['ID']['output']>;
  created_at: Scalars['DateTime']['output'];
  deal?: Maybe<Deal>;
  deal_id?: Maybe<Scalars['ID']['output']>;
  due_date?: Maybe<Scalars['DateTime']['output']>;
  id: Scalars['ID']['output'];
  is_done: Scalars['Boolean']['output'];
  is_system_activity: Scalars['Boolean']['output'];
  lead?: Maybe<Lead>;
  lead_id?: Maybe<Scalars['ID']['output']>;
  notes?: Maybe<Scalars['String']['output']>;
  organization?: Maybe<Organization>;
  organization_id?: Maybe<Scalars['ID']['output']>;
  person?: Maybe<Person>;
  person_id?: Maybe<Scalars['ID']['output']>;
  subject: Scalars['String']['output'];
  type: ActivityType;
  updated_at: Scalars['DateTime']['output'];
  user?: Maybe<User>;
  user_id: Scalars['ID']['output'];
};

export type ActivityFilterInput = {
  dealId?: InputMaybe<Scalars['ID']['input']>;
  isDone?: InputMaybe<Scalars['Boolean']['input']>;
  leadId?: InputMaybe<Scalars['ID']['input']>;
  organizationId?: InputMaybe<Scalars['ID']['input']>;
  personId?: InputMaybe<Scalars['ID']['input']>;
};

export type ActivityReminder = {
  __typename?: 'ActivityReminder';
  activity?: Maybe<Activity>;
  activityId: Scalars['ID']['output'];
  createdAt: Scalars['DateTime']['output'];
  failedAttempts: Scalars['Int']['output'];
  id: Scalars['ID']['output'];
  isSent: Scalars['Boolean']['output'];
  lastError?: Maybe<Scalars['String']['output']>;
  reminderContent?: Maybe<Scalars['JSON']['output']>;
  reminderType: ReminderType;
  scheduledFor: Scalars['DateTime']['output'];
  sentAt?: Maybe<Scalars['DateTime']['output']>;
  updatedAt: Scalars['DateTime']['output'];
  user?: Maybe<User>;
  userId: Scalars['ID']['output'];
};

/** Defines the GraphQL schema for Activities. */
export type ActivityType =
  | 'CALL'
  | 'DEADLINE'
  | 'EMAIL'
  | 'MEETING'
  | 'SYSTEM_TASK'
  | 'TASK';

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
  extendedThinkingEnabled: Scalars['Boolean']['output'];
  id: Scalars['ID']['output'];
  messages: Array<AgentMessage>;
  plan?: Maybe<AgentPlan>;
  thinkingBudget: ThinkingBudget;
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

export type ConvertedEntities = {
  __typename?: 'ConvertedEntities';
  deal?: Maybe<Deal>;
  organization?: Maybe<Organization>;
  person?: Maybe<Person>;
};

export type CreateActivityInput = {
  assigned_to_user_id?: InputMaybe<Scalars['ID']['input']>;
  deal_id?: InputMaybe<Scalars['ID']['input']>;
  due_date?: InputMaybe<Scalars['DateTime']['input']>;
  is_done?: InputMaybe<Scalars['Boolean']['input']>;
  lead_id?: InputMaybe<Scalars['ID']['input']>;
  notes?: InputMaybe<Scalars['String']['input']>;
  organization_id?: InputMaybe<Scalars['ID']['input']>;
  person_id?: InputMaybe<Scalars['ID']['input']>;
  subject: Scalars['String']['input'];
  type: ActivityType;
};

export type CreateAgentV2ConversationInput = {
  enableExtendedThinking: Scalars['Boolean']['input'];
  initialContext?: InputMaybe<Scalars['JSON']['input']>;
  thinkingBudget: ThinkingBudget;
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

export type CreateNotificationInput = {
  actionUrl?: InputMaybe<Scalars['String']['input']>;
  entityId?: InputMaybe<Scalars['ID']['input']>;
  entityType?: InputMaybe<Scalars['String']['input']>;
  expiresAt?: InputMaybe<Scalars['DateTime']['input']>;
  message: Scalars['String']['input'];
  metadata?: InputMaybe<Scalars['JSON']['input']>;
  notificationType: NotificationType;
  priority?: InputMaybe<NotificationPriority>;
  title: Scalars['String']['input'];
  userId: Scalars['ID']['input'];
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

export type CreateTaskFromEmailInput = {
  assigneeId?: InputMaybe<Scalars['String']['input']>;
  dealId?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  dueDate?: InputMaybe<Scalars['String']['input']>;
  emailId: Scalars['String']['input'];
  subject: Scalars['String']['input'];
  threadId?: InputMaybe<Scalars['String']['input']>;
  useWholeThread?: InputMaybe<Scalars['Boolean']['input']>;
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
  activities: Array<Activity>;
  amount?: Maybe<Scalars['Float']['output']>;
  amountUsd?: Maybe<Scalars['Float']['output']>;
  amount_usd?: Maybe<Scalars['Float']['output']>;
  assignedToUser?: Maybe<User>;
  assigned_to_user_id?: Maybe<Scalars['ID']['output']>;
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

/** Google Drive specific configuration */
export type GoogleDriveConfig = {
  __typename?: 'GoogleDriveConfig';
  auto_create_deal_folders: Scalars['Boolean']['output'];
  deal_folder_template: Scalars['Boolean']['output'];
  pipecd_deals_folder_id?: Maybe<Scalars['String']['output']>;
};

export type GoogleIntegrationStatus = {
  __typename?: 'GoogleIntegrationStatus';
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
  activities: Array<Activity>;
  ai_insights?: Maybe<Scalars['JSON']['output']>;
  assignedToUser?: Maybe<User>;
  assigned_at?: Maybe<Scalars['DateTime']['output']>;
  assigned_to_user_id?: Maybe<Scalars['ID']['output']>;
  automation_score_factors?: Maybe<Scalars['JSON']['output']>;
  company_name?: Maybe<Scalars['String']['output']>;
  contact_email?: Maybe<Scalars['String']['output']>;
  contact_name?: Maybe<Scalars['String']['output']>;
  contact_phone?: Maybe<Scalars['String']['output']>;
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
  qualificationLevel: Scalars['Float']['output'];
  qualificationStatus: Scalars['String']['output'];
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

export type Mutation = {
  __typename?: 'Mutation';
  addAgentThoughts: Array<AgentThought>;
  addAgentV2Thoughts: Array<AgentThought>;
  addDealParticipant: DealParticipant;
  archiveThread: Scalars['Boolean']['output'];
  assignUserRole: User;
  attachDocumentToDeal: DealDocumentAttachment;
  attachDocumentToNoteAndDeal: DualAttachmentResponse;
  attachFileToDeal: DealDocumentAttachment;
  cancelActivityReminder: Scalars['Boolean']['output'];
  composeEmail: EmailMessage;
  connectGoogleIntegration: GoogleIntegrationStatus;
  convertCurrency: ConversionResult;
  convertLead: LeadConversionResult;
  copyDriveFile: DriveFile;
  createActivity: Activity;
  createAgentConversation: AgentConversation;
  createAgentV2Conversation: AgentConversation;
  createContactFromEmail: Person;
  createCurrency: Currency;
  createCustomFieldDefinition: CustomFieldDefinition;
  createDeal: Deal;
  createDealFolder: DriveFolderStructure;
  createDocument: Document;
  createEmail: Email;
  createLead: Lead;
  createNotification: Notification;
  createOrganization: Organization;
  createPerson: Person;
  createSticker: SmartSticker;
  createTaskFromEmail: Activity;
  createWFMProjectType: WfmProjectType;
  createWFMStatus: WfmStatus;
  createWFMWorkflow: WfmWorkflow;
  createWFMWorkflowStep: WfmWorkflowStep;
  createWFMWorkflowTransition: WfmWorkflowTransition;
  deactivateCustomFieldDefinition: CustomFieldDefinition;
  deleteActivity: Scalars['ID']['output'];
  deleteAgentConversation: Scalars['Boolean']['output'];
  deleteDeal?: Maybe<Scalars['Boolean']['output']>;
  deleteDriveFile: Scalars['Boolean']['output'];
  deleteLead?: Maybe<Scalars['Boolean']['output']>;
  deleteNotification: Scalars['Boolean']['output'];
  deleteOrganization?: Maybe<Scalars['Boolean']['output']>;
  deletePerson?: Maybe<Scalars['Boolean']['output']>;
  deleteSticker: Scalars['Boolean']['output'];
  deleteWFMWorkflowStep: WfmWorkflowStepMutationResponse;
  deleteWFMWorkflowTransition: WfmWorkflowTransitionMutationResponse;
  deleteWfmStatus: WfmStatusMutationResponse;
  detachFileFromDeal: Scalars['Boolean']['output'];
  executeAgentStep: AgentResponse;
  generateTaskContentFromEmail: AiGeneratedTaskContent;
  linkEmailToDeal: Scalars['Boolean']['output'];
  markAllNotificationsAsRead: Scalars['Int']['output'];
  markNotificationAsRead: Notification;
  markThreadAsRead: Scalars['Boolean']['output'];
  markThreadAsUnread: Scalars['Boolean']['output'];
  moveDriveFile: DriveFile;
  moveStickersBulk: Array<SmartSticker>;
  pinEmail: EmailPin;
  reactivateCustomFieldDefinition: CustomFieldDefinition;
  recalculateLeadScore: Lead;
  removeDealParticipant: Scalars['Boolean']['output'];
  removeDocumentAttachment: Scalars['Boolean']['output'];
  removeNoteDocumentAttachment: Scalars['Boolean']['output'];
  removeUserRole: User;
  revokeGoogleIntegration: Scalars['Boolean']['output'];
  scheduleActivityReminder: ActivityReminder;
  sendAgentMessage: AgentResponse;
  sendAgentV2Message: AgentV2Response;
  sendAgentV2MessageStream: Scalars['String']['output'];
  setExchangeRate: ExchangeRate;
  shareDriveFolder: Scalars['Boolean']['output'];
  syncGmailEmails: Array<Email>;
  toggleStickerPin: SmartSticker;
  unpinEmail: Scalars['Boolean']['output'];
  updateActivity: Activity;
  updateAgentConversation: AgentConversation;
  /** Update an app setting (admin only) */
  updateAppSetting: AppSetting;
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
  updateMyReminderPreferences: UserReminderPreferences;
  updateOrganization?: Maybe<Organization>;
  updatePerson?: Maybe<Person>;
  updateRatesFromECB: CurrencyOperationResult;
  updateSticker: SmartSticker;
  updateStickerTags: SmartSticker;
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


export type MutationAddAgentThoughtsArgs = {
  conversationId: Scalars['ID']['input'];
  thoughts: Array<AgentThoughtInput>;
};


export type MutationAddAgentV2ThoughtsArgs = {
  conversationId: Scalars['ID']['input'];
  thoughts: Array<AgentV2ThoughtInput>;
};


export type MutationAddDealParticipantArgs = {
  input: DealParticipantInput;
};


export type MutationArchiveThreadArgs = {
  threadId: Scalars['String']['input'];
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


export type MutationCancelActivityReminderArgs = {
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


export type MutationConvertLeadArgs = {
  id: Scalars['ID']['input'];
  input: LeadConversionInput;
};


export type MutationCopyDriveFileArgs = {
  fileId: Scalars['String']['input'];
  newName?: InputMaybe<Scalars['String']['input']>;
  newParentId: Scalars['String']['input'];
};


export type MutationCreateActivityArgs = {
  input: CreateActivityInput;
};


export type MutationCreateAgentConversationArgs = {
  config?: InputMaybe<AgentConfigInput>;
};


export type MutationCreateAgentV2ConversationArgs = {
  input: CreateAgentV2ConversationInput;
};


export type MutationCreateContactFromEmailArgs = {
  input: CreateContactFromEmailInput;
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


export type MutationCreateNotificationArgs = {
  input: CreateNotificationInput;
};


export type MutationCreateOrganizationArgs = {
  input: OrganizationInput;
};


export type MutationCreatePersonArgs = {
  input: PersonInput;
};


export type MutationCreateStickerArgs = {
  input: CreateStickerInput;
};


export type MutationCreateTaskFromEmailArgs = {
  input: CreateTaskFromEmailInput;
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


export type MutationDeactivateCustomFieldDefinitionArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteActivityArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteAgentConversationArgs = {
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


export type MutationDeleteNotificationArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteOrganizationArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeletePersonArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteStickerArgs = {
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


export type MutationExecuteAgentStepArgs = {
  conversationId: Scalars['ID']['input'];
  stepId: Scalars['String']['input'];
};


export type MutationGenerateTaskContentFromEmailArgs = {
  input: GenerateTaskContentInput;
};


export type MutationLinkEmailToDealArgs = {
  dealId: Scalars['String']['input'];
  emailId: Scalars['String']['input'];
};


export type MutationMarkNotificationAsReadArgs = {
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


export type MutationScheduleActivityReminderArgs = {
  activityId: Scalars['ID']['input'];
  reminderType: ReminderType;
  scheduledFor: Scalars['DateTime']['input'];
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


export type MutationSyncGmailEmailsArgs = {
  entityId: Scalars['ID']['input'];
  entityType: EntityType;
};


export type MutationToggleStickerPinArgs = {
  id: Scalars['ID']['input'];
};


export type MutationUnpinEmailArgs = {
  id: Scalars['ID']['input'];
};


export type MutationUpdateActivityArgs = {
  id: Scalars['ID']['input'];
  input: UpdateActivityInput;
};


export type MutationUpdateAgentConversationArgs = {
  input: UpdateConversationInput;
};


export type MutationUpdateAppSettingArgs = {
  input: UpdateAppSettingInput;
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


export type MutationUpdateMyReminderPreferencesArgs = {
  input: UpdateUserReminderPreferencesInput;
};


export type MutationUpdateOrganizationArgs = {
  id: Scalars['ID']['input'];
  input: OrganizationInput;
};


export type MutationUpdatePersonArgs = {
  id: Scalars['ID']['input'];
  input: PersonInput;
};


export type MutationUpdateStickerArgs = {
  input: UpdateStickerInput;
};


export type MutationUpdateStickerTagsArgs = {
  id: Scalars['ID']['input'];
  tagsToAdd?: InputMaybe<Array<Scalars['String']['input']>>;
  tagsToRemove?: InputMaybe<Array<Scalars['String']['input']>>;
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

export type Notification = {
  __typename?: 'Notification';
  actionUrl?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['DateTime']['output'];
  entityId?: Maybe<Scalars['ID']['output']>;
  entityType?: Maybe<Scalars['String']['output']>;
  expiresAt?: Maybe<Scalars['DateTime']['output']>;
  id: Scalars['ID']['output'];
  isRead: Scalars['Boolean']['output'];
  message: Scalars['String']['output'];
  metadata?: Maybe<Scalars['JSON']['output']>;
  notificationType: NotificationType;
  priority: NotificationPriority;
  readAt?: Maybe<Scalars['DateTime']['output']>;
  title: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
  user?: Maybe<User>;
  userId: Scalars['ID']['output'];
};

export type NotificationFilterInput = {
  entityId?: InputMaybe<Scalars['ID']['input']>;
  entityType?: InputMaybe<Scalars['String']['input']>;
  isRead?: InputMaybe<Scalars['Boolean']['input']>;
  notificationType?: InputMaybe<NotificationType>;
  priority?: InputMaybe<NotificationPriority>;
};

export type NotificationPriority =
  | 'HIGH'
  | 'LOW'
  | 'NORMAL'
  | 'URGENT';

export type NotificationSummary = {
  __typename?: 'NotificationSummary';
  notifications: Array<Notification>;
  totalCount: Scalars['Int']['output'];
  unreadCount: Scalars['Int']['output'];
};

export type NotificationType =
  | 'ACTIVITY_OVERDUE'
  | 'ACTIVITY_REMINDER'
  | 'CUSTOM'
  | 'DEAL_ASSIGNED'
  | 'LEAD_ASSIGNED'
  | 'SYSTEM_ANNOUNCEMENT';

/** Defines the Organization type and related queries/mutations. */
export type Organization = {
  __typename?: 'Organization';
  activities: Array<Activity>;
  address?: Maybe<Scalars['String']['output']>;
  created_at: Scalars['DateTime']['output'];
  customFieldValues: Array<CustomFieldValue>;
  deals: Array<Deal>;
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  notes?: Maybe<Scalars['String']['output']>;
  people?: Maybe<Array<Person>>;
  updated_at: Scalars['DateTime']['output'];
  user_id: Scalars['ID']['output'];
};

export type OrganizationInput = {
  address?: InputMaybe<Scalars['String']['input']>;
  customFields?: InputMaybe<Array<CustomFieldValueInput>>;
  name: Scalars['String']['input'];
  notes?: InputMaybe<Scalars['String']['input']>;
};

export type OrganizationUpdateInput = {
  address?: InputMaybe<Scalars['String']['input']>;
  customFields?: InputMaybe<Array<CustomFieldValueInput>>;
  name?: InputMaybe<Scalars['String']['input']>;
  notes?: InputMaybe<Scalars['String']['input']>;
};

/** Defines the Person type and related queries/mutations. */
export type Person = {
  __typename?: 'Person';
  activities: Array<Activity>;
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
  activities: Array<Activity>;
  activity?: Maybe<Activity>;
  activityReminders: Array<ActivityReminder>;
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
  currencies: Array<Currency>;
  currency?: Maybe<Currency>;
  customFieldDefinition?: Maybe<CustomFieldDefinition>;
  customFieldDefinitions: Array<CustomFieldDefinition>;
  deal?: Maybe<Deal>;
  /** Get files in the deal folder or specific subfolder */
  dealFolderFiles: Array<DriveFile>;
  /** Get deal folder information, auto-creating if needed */
  dealFolderInfo: DealFolderInfo;
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
  /** Get Google Drive configuration settings */
  googleDriveSettings: GoogleDriveConfig;
  googleIntegrationStatus: GoogleIntegrationStatus;
  health: Scalars['String']['output'];
  lead?: Maybe<Lead>;
  leads: Array<Lead>;
  leadsStats: LeadsStats;
  me?: Maybe<User>;
  myNotifications: NotificationSummary;
  myPermissions?: Maybe<Array<Scalars['String']['output']>>;
  myReminderPreferences?: Maybe<UserReminderPreferences>;
  notification?: Maybe<Notification>;
  organization?: Maybe<Organization>;
  organizations: Array<Organization>;
  people: Array<Person>;
  person?: Maybe<Person>;
  personList: Array<PersonListItem>;
  roles: Array<Role>;
  searchDriveFiles: DriveFileConnection;
  searchEmails: Array<Email>;
  searchSharedDriveFiles: Array<DriveFile>;
  searchStickers: StickerConnection;
  suggestEmailParticipants: Array<Person>;
  supabaseConnectionTest: Scalars['String']['output'];
  unreadNotificationCount: Scalars['Int']['output'];
  userCurrencyPreferences?: Maybe<UserCurrencyPreferences>;
  users: Array<User>;
  wfmProjectType?: Maybe<WfmProjectType>;
  wfmProjectTypeByName?: Maybe<WfmProjectType>;
  wfmProjectTypes: Array<WfmProjectType>;
  wfmStatus?: Maybe<WfmStatus>;
  wfmStatuses: Array<WfmStatus>;
  wfmWorkflow?: Maybe<WfmWorkflow>;
  wfmWorkflows: Array<WfmWorkflow>;
};


export type QueryActivitiesArgs = {
  filter?: InputMaybe<ActivityFilterInput>;
};


export type QueryActivityArgs = {
  id: Scalars['ID']['input'];
};


export type QueryActivityRemindersArgs = {
  activityId?: InputMaybe<Scalars['ID']['input']>;
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


export type QueryDealFolderFilesArgs = {
  dealId: Scalars['ID']['input'];
  folderId?: InputMaybe<Scalars['ID']['input']>;
};


export type QueryDealFolderInfoArgs = {
  dealId: Scalars['ID']['input'];
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


export type QueryMyNotificationsArgs = {
  filter?: InputMaybe<NotificationFilterInput>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryNotificationArgs = {
  id: Scalars['ID']['input'];
};


export type QueryOrganizationArgs = {
  id: Scalars['ID']['input'];
};


export type QueryPersonArgs = {
  id: Scalars['ID']['input'];
};


export type QuerySearchDriveFilesArgs = {
  query: Scalars['String']['input'];
};


export type QuerySearchEmailsArgs = {
  entityType?: InputMaybe<EntityType>;
  limit?: InputMaybe<Scalars['Int']['input']>;
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


export type QueryUserCurrencyPreferencesArgs = {
  userId: Scalars['ID']['input'];
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

/** Activity Reminders and Notifications GraphQL Schema */
export type ReminderType =
  | 'EMAIL'
  | 'IN_APP'
  | 'PUSH';

export type Role = {
  __typename?: 'Role';
  description: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
};

export type SendAgentV2MessageInput = {
  content: Scalars['String']['input'];
  conversationId?: InputMaybe<Scalars['ID']['input']>;
  enableExtendedThinking: Scalars['Boolean']['input'];
  thinkingBudget: ThinkingBudget;
};

export type SendAgentV2MessageStreamInput = {
  content: Scalars['String']['input'];
  conversationId?: InputMaybe<Scalars['ID']['input']>;
  enableExtendedThinking: Scalars['Boolean']['input'];
  thinkingBudget: ThinkingBudget;
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
  notificationAdded: Notification;
  notificationUpdated: Notification;
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


export type SubscriptionNotificationAddedArgs = {
  userId: Scalars['ID']['input'];
};


export type SubscriptionNotificationUpdatedArgs = {
  userId: Scalars['ID']['input'];
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

export type UpdateActivityInput = {
  assigned_to_user_id?: InputMaybe<Scalars['ID']['input']>;
  deal_id?: InputMaybe<Scalars['ID']['input']>;
  due_date?: InputMaybe<Scalars['DateTime']['input']>;
  is_done?: InputMaybe<Scalars['Boolean']['input']>;
  notes?: InputMaybe<Scalars['String']['input']>;
  organization_id?: InputMaybe<Scalars['ID']['input']>;
  person_id?: InputMaybe<Scalars['ID']['input']>;
  subject?: InputMaybe<Scalars['String']['input']>;
  type?: InputMaybe<ActivityType>;
};

export type UpdateAppSettingInput = {
  settingKey: Scalars['String']['input'];
  settingValue: Scalars['JSON']['input'];
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

export type UpdateUserReminderPreferencesInput = {
  emailDailyDigestEnabled?: InputMaybe<Scalars['Boolean']['input']>;
  emailDailyDigestTime?: InputMaybe<Scalars['String']['input']>;
  emailReminderMinutesBefore?: InputMaybe<Scalars['Int']['input']>;
  emailRemindersEnabled?: InputMaybe<Scalars['Boolean']['input']>;
  inAppReminderMinutesBefore?: InputMaybe<Scalars['Int']['input']>;
  inAppRemindersEnabled?: InputMaybe<Scalars['Boolean']['input']>;
  overdueNotificationFrequencyHours?: InputMaybe<Scalars['Int']['input']>;
  overdueNotificationsEnabled?: InputMaybe<Scalars['Boolean']['input']>;
  pushReminderMinutesBefore?: InputMaybe<Scalars['Int']['input']>;
  pushRemindersEnabled?: InputMaybe<Scalars['Boolean']['input']>;
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

export type UserReminderPreferences = {
  __typename?: 'UserReminderPreferences';
  createdAt: Scalars['DateTime']['output'];
  emailDailyDigestEnabled: Scalars['Boolean']['output'];
  emailDailyDigestTime: Scalars['String']['output'];
  emailReminderMinutesBefore: Scalars['Int']['output'];
  emailRemindersEnabled: Scalars['Boolean']['output'];
  id: Scalars['ID']['output'];
  inAppReminderMinutesBefore: Scalars['Int']['output'];
  inAppRemindersEnabled: Scalars['Boolean']['output'];
  overdueNotificationFrequencyHours: Scalars['Int']['output'];
  overdueNotificationsEnabled: Scalars['Boolean']['output'];
  pushReminderMinutesBefore: Scalars['Int']['output'];
  pushRemindersEnabled: Scalars['Boolean']['output'];
  updatedAt: Scalars['DateTime']['output'];
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

export type GetAgentThoughtsQueryVariables = Exact<{
  conversationId: Scalars['ID']['input'];
  limit?: InputMaybe<Scalars['Int']['input']>;
}>;


export type GetAgentThoughtsQuery = { __typename?: 'Query', agentThoughts: Array<{ __typename?: 'AgentThought', id: string, conversationId: string, type: AgentThoughtType, content: string, metadata: Record<string, any>, timestamp: string }> };

export type GetMyNotificationsQueryVariables = Exact<{
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
}>;


export type GetMyNotificationsQuery = { __typename?: 'Query', myNotifications: { __typename?: 'NotificationSummary', totalCount: number, unreadCount: number, notifications: Array<{ __typename?: 'Notification', id: string, userId: string, title: string, message: string, notificationType: NotificationType, isRead: boolean, readAt?: string | null, entityType?: string | null, entityId?: string | null, actionUrl?: string | null, metadata?: Record<string, any> | null, priority: NotificationPriority, expiresAt?: string | null, createdAt: string, updatedAt: string }> } };

export type GetUnreadNotificationCountQueryVariables = Exact<{ [key: string]: never; }>;


export type GetUnreadNotificationCountQuery = { __typename?: 'Query', unreadNotificationCount: number };

export type MarkNotificationAsReadMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type MarkNotificationAsReadMutation = { __typename?: 'Mutation', markNotificationAsRead: { __typename?: 'Notification', id: string, isRead: boolean, readAt?: string | null } };

export type MarkAllNotificationsAsReadMutationVariables = Exact<{ [key: string]: never; }>;


export type MarkAllNotificationsAsReadMutation = { __typename?: 'Mutation', markAllNotificationsAsRead: number };

export type DeleteNotificationMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type DeleteNotificationMutation = { __typename?: 'Mutation', deleteNotification: boolean };

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

export type CreateTaskFromEmailMutationVariables = Exact<{
  input: CreateTaskFromEmailInput;
}>;


export type CreateTaskFromEmailMutation = { __typename?: 'Mutation', createTaskFromEmail: { __typename?: 'Activity', id: string, subject: string, notes?: string | null, type: ActivityType, due_date?: string | null, is_done: boolean } };

export type GenerateTaskContentFromEmailMutationVariables = Exact<{
  input: GenerateTaskContentInput;
}>;


export type GenerateTaskContentFromEmailMutation = { __typename?: 'Mutation', generateTaskContentFromEmail: { __typename?: 'AIGeneratedTaskContent', subject: string, description: string, suggestedDueDate?: string | null, confidence: number, emailScope: string, sourceContent: string } };

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

export type GetPinnedEmailsQueryVariables = Exact<{
  dealId: Scalars['ID']['input'];
}>;


export type GetPinnedEmailsQuery = { __typename?: 'Query', getPinnedEmails: Array<{ __typename?: 'EmailPin', id: string, emailId: string, threadId: string, subject?: string | null, fromEmail?: string | null, pinnedAt: string, notes?: string | null, createdAt: string, updatedAt: string }> };

export type UpdateEmailPinMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  input: UpdateEmailPinInput;
}>;


export type UpdateEmailPinMutation = { __typename?: 'Mutation', updateEmailPin: { __typename?: 'EmailPin', id: string, notes?: string | null, updatedAt: string } };

export type GetMyReminderPreferencesQueryVariables = Exact<{ [key: string]: never; }>;


export type GetMyReminderPreferencesQuery = { __typename?: 'Query', myReminderPreferences?: { __typename?: 'UserReminderPreferences', id: string, userId: string, emailRemindersEnabled: boolean, emailReminderMinutesBefore: number, emailDailyDigestEnabled: boolean, emailDailyDigestTime: string, inAppRemindersEnabled: boolean, inAppReminderMinutesBefore: number, pushRemindersEnabled: boolean, pushReminderMinutesBefore: number, overdueNotificationsEnabled: boolean, overdueNotificationFrequencyHours: number, createdAt: string, updatedAt: string } | null };

export type UpdateMyReminderPreferencesMutationVariables = Exact<{
  input: UpdateUserReminderPreferencesInput;
}>;


export type UpdateMyReminderPreferencesMutation = { __typename?: 'Mutation', updateMyReminderPreferences: { __typename?: 'UserReminderPreferences', id: string, userId: string, emailRemindersEnabled: boolean, emailReminderMinutesBefore: number, emailDailyDigestEnabled: boolean, emailDailyDigestTime: string, inAppRemindersEnabled: boolean, inAppReminderMinutesBefore: number, pushRemindersEnabled: boolean, pushReminderMinutesBefore: number, overdueNotificationsEnabled: boolean, overdueNotificationFrequencyHours: number, updatedAt: string } };

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


export type GetGoogleIntegrationStatusQuery = { __typename?: 'Query', googleIntegrationStatus: { __typename?: 'GoogleIntegrationStatus', isConnected: boolean, hasGoogleAuth: boolean, hasDriveAccess: boolean, hasGmailAccess: boolean, tokenExpiry?: string | null, missingScopes: Array<string> } };

export type RevokeGoogleIntegrationMutationVariables = Exact<{ [key: string]: never; }>;


export type RevokeGoogleIntegrationMutation = { __typename?: 'Mutation', revokeGoogleIntegration: boolean };

export type ConnectGoogleIntegrationMutationVariables = Exact<{
  input: ConnectGoogleIntegrationInput;
}>;


export type ConnectGoogleIntegrationMutation = { __typename?: 'Mutation', connectGoogleIntegration: { __typename?: 'GoogleIntegrationStatus', isConnected: boolean, hasGoogleAuth: boolean, hasDriveAccess: boolean, hasGmailAccess: boolean, tokenExpiry?: string | null, missingScopes: Array<string> } };

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


export const GetAgentThoughtsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetAgentThoughts"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"conversationId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"limit"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"agentThoughts"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"conversationId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"conversationId"}}},{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"Variable","name":{"kind":"Name","value":"limit"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"conversationId"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"content"}},{"kind":"Field","name":{"kind":"Name","value":"metadata"}},{"kind":"Field","name":{"kind":"Name","value":"timestamp"}}]}}]}}]} as unknown as DocumentNode<GetAgentThoughtsQuery, GetAgentThoughtsQueryVariables>;
export const GetMyNotificationsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetMyNotifications"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"limit"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"offset"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"myNotifications"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"Variable","name":{"kind":"Name","value":"limit"}}},{"kind":"Argument","name":{"kind":"Name","value":"offset"},"value":{"kind":"Variable","name":{"kind":"Name","value":"offset"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"notifications"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"userId"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"message"}},{"kind":"Field","name":{"kind":"Name","value":"notificationType"}},{"kind":"Field","name":{"kind":"Name","value":"isRead"}},{"kind":"Field","name":{"kind":"Name","value":"readAt"}},{"kind":"Field","name":{"kind":"Name","value":"entityType"}},{"kind":"Field","name":{"kind":"Name","value":"entityId"}},{"kind":"Field","name":{"kind":"Name","value":"actionUrl"}},{"kind":"Field","name":{"kind":"Name","value":"metadata"}},{"kind":"Field","name":{"kind":"Name","value":"priority"}},{"kind":"Field","name":{"kind":"Name","value":"expiresAt"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}},{"kind":"Field","name":{"kind":"Name","value":"totalCount"}},{"kind":"Field","name":{"kind":"Name","value":"unreadCount"}}]}}]}}]} as unknown as DocumentNode<GetMyNotificationsQuery, GetMyNotificationsQueryVariables>;
export const GetUnreadNotificationCountDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetUnreadNotificationCount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"unreadNotificationCount"}}]}}]} as unknown as DocumentNode<GetUnreadNotificationCountQuery, GetUnreadNotificationCountQueryVariables>;
export const MarkNotificationAsReadDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"MarkNotificationAsRead"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"markNotificationAsRead"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"isRead"}},{"kind":"Field","name":{"kind":"Name","value":"readAt"}}]}}]}}]} as unknown as DocumentNode<MarkNotificationAsReadMutation, MarkNotificationAsReadMutationVariables>;
export const MarkAllNotificationsAsReadDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"MarkAllNotificationsAsRead"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"markAllNotificationsAsRead"}}]}}]} as unknown as DocumentNode<MarkAllNotificationsAsReadMutation, MarkAllNotificationsAsReadMutationVariables>;
export const DeleteNotificationDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DeleteNotification"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deleteNotification"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}]}]}}]} as unknown as DocumentNode<DeleteNotificationMutation, DeleteNotificationMutationVariables>;
export const CreateContactFromEmailDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateContactFromEmail"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateContactFromEmailInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createContactFromEmail"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"first_name"}},{"kind":"Field","name":{"kind":"Name","value":"last_name"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"organization_id"}}]}}]}}]} as unknown as DocumentNode<CreateContactFromEmailMutation, CreateContactFromEmailMutationVariables>;
export const GetOrganizationsForContactDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetOrganizationsForContact"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"organizations"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]} as unknown as DocumentNode<GetOrganizationsForContactQuery, GetOrganizationsForContactQueryVariables>;
export const GetEmailThreadsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetEmailThreads"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"filter"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"EmailThreadsFilterInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"getEmailThreads"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"filter"},"value":{"kind":"Variable","name":{"kind":"Name","value":"filter"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"threads"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"subject"}},{"kind":"Field","name":{"kind":"Name","value":"participants"}},{"kind":"Field","name":{"kind":"Name","value":"messageCount"}},{"kind":"Field","name":{"kind":"Name","value":"isUnread"}},{"kind":"Field","name":{"kind":"Name","value":"lastActivity"}},{"kind":"Field","name":{"kind":"Name","value":"latestMessage"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"from"}},{"kind":"Field","name":{"kind":"Name","value":"body"}},{"kind":"Field","name":{"kind":"Name","value":"timestamp"}},{"kind":"Field","name":{"kind":"Name","value":"hasAttachments"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"totalCount"}},{"kind":"Field","name":{"kind":"Name","value":"hasNextPage"}},{"kind":"Field","name":{"kind":"Name","value":"nextPageToken"}}]}}]}}]} as unknown as DocumentNode<GetEmailThreadsQuery, GetEmailThreadsQueryVariables>;
export const GetEmailThreadDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetEmailThread"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"threadId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"getEmailThread"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"threadId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"threadId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"subject"}},{"kind":"Field","name":{"kind":"Name","value":"participants"}},{"kind":"Field","name":{"kind":"Name","value":"messageCount"}},{"kind":"Field","name":{"kind":"Name","value":"isUnread"}},{"kind":"Field","name":{"kind":"Name","value":"lastActivity"}},{"kind":"Field","name":{"kind":"Name","value":"latestMessage"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"threadId"}},{"kind":"Field","name":{"kind":"Name","value":"subject"}},{"kind":"Field","name":{"kind":"Name","value":"from"}},{"kind":"Field","name":{"kind":"Name","value":"to"}},{"kind":"Field","name":{"kind":"Name","value":"cc"}},{"kind":"Field","name":{"kind":"Name","value":"bcc"}},{"kind":"Field","name":{"kind":"Name","value":"body"}},{"kind":"Field","name":{"kind":"Name","value":"htmlBody"}},{"kind":"Field","name":{"kind":"Name","value":"timestamp"}},{"kind":"Field","name":{"kind":"Name","value":"isUnread"}},{"kind":"Field","name":{"kind":"Name","value":"hasAttachments"}},{"kind":"Field","name":{"kind":"Name","value":"attachments"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"filename"}},{"kind":"Field","name":{"kind":"Name","value":"mimeType"}},{"kind":"Field","name":{"kind":"Name","value":"size"}}]}},{"kind":"Field","name":{"kind":"Name","value":"importance"}}]}}]}}]}}]} as unknown as DocumentNode<GetEmailThreadQuery, GetEmailThreadQueryVariables>;
export const GetEmailAnalyticsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetEmailAnalytics"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"dealId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"getEmailAnalytics"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"dealId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"dealId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"totalThreads"}},{"kind":"Field","name":{"kind":"Name","value":"unreadCount"}},{"kind":"Field","name":{"kind":"Name","value":"avgResponseTime"}},{"kind":"Field","name":{"kind":"Name","value":"lastContactTime"}},{"kind":"Field","name":{"kind":"Name","value":"emailSentiment"}},{"kind":"Field","name":{"kind":"Name","value":"responseRate"}}]}}]}}]} as unknown as DocumentNode<GetEmailAnalyticsQuery, GetEmailAnalyticsQueryVariables>;
export const ComposeEmailDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"ComposeEmail"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ComposeEmailInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"composeEmail"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"subject"}},{"kind":"Field","name":{"kind":"Name","value":"from"}},{"kind":"Field","name":{"kind":"Name","value":"to"}},{"kind":"Field","name":{"kind":"Name","value":"timestamp"}}]}}]}}]} as unknown as DocumentNode<ComposeEmailMutation, ComposeEmailMutationVariables>;
export const CreateTaskFromEmailDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateTaskFromEmail"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateTaskFromEmailInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createTaskFromEmail"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"subject"}},{"kind":"Field","name":{"kind":"Name","value":"notes"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"due_date"}},{"kind":"Field","name":{"kind":"Name","value":"is_done"}}]}}]}}]} as unknown as DocumentNode<CreateTaskFromEmailMutation, CreateTaskFromEmailMutationVariables>;
export const GenerateTaskContentFromEmailDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"GenerateTaskContentFromEmail"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"GenerateTaskContentInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"generateTaskContentFromEmail"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"subject"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"suggestedDueDate"}},{"kind":"Field","name":{"kind":"Name","value":"confidence"}},{"kind":"Field","name":{"kind":"Name","value":"emailScope"}},{"kind":"Field","name":{"kind":"Name","value":"sourceContent"}}]}}]}}]} as unknown as DocumentNode<GenerateTaskContentFromEmailMutation, GenerateTaskContentFromEmailMutationVariables>;
export const MarkThreadAsReadDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"MarkThreadAsRead"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"threadId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"markThreadAsRead"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"threadId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"threadId"}}}]}]}}]} as unknown as DocumentNode<MarkThreadAsReadMutation, MarkThreadAsReadMutationVariables>;
export const CreateStickerDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateSticker"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateStickerInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createSticker"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"content"}},{"kind":"Field","name":{"kind":"Name","value":"entityType"}},{"kind":"Field","name":{"kind":"Name","value":"entityId"}},{"kind":"Field","name":{"kind":"Name","value":"positionX"}},{"kind":"Field","name":{"kind":"Name","value":"positionY"}},{"kind":"Field","name":{"kind":"Name","value":"width"}},{"kind":"Field","name":{"kind":"Name","value":"height"}},{"kind":"Field","name":{"kind":"Name","value":"color"}},{"kind":"Field","name":{"kind":"Name","value":"isPinned"}},{"kind":"Field","name":{"kind":"Name","value":"isPrivate"}},{"kind":"Field","name":{"kind":"Name","value":"priority"}},{"kind":"Field","name":{"kind":"Name","value":"mentions"}},{"kind":"Field","name":{"kind":"Name","value":"tags"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"createdByUserId"}},{"kind":"Field","name":{"kind":"Name","value":"category"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"color"}},{"kind":"Field","name":{"kind":"Name","value":"icon"}}]}}]}}]}}]} as unknown as DocumentNode<CreateStickerMutation, CreateStickerMutationVariables>;
export const PinEmailDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"PinEmail"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"PinEmailInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"pinEmail"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"emailId"}},{"kind":"Field","name":{"kind":"Name","value":"threadId"}},{"kind":"Field","name":{"kind":"Name","value":"subject"}},{"kind":"Field","name":{"kind":"Name","value":"fromEmail"}},{"kind":"Field","name":{"kind":"Name","value":"pinnedAt"}},{"kind":"Field","name":{"kind":"Name","value":"notes"}}]}}]}}]} as unknown as DocumentNode<PinEmailMutation, PinEmailMutationVariables>;
export const GetPinnedEmailsForDealDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetPinnedEmailsForDeal"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"dealId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"getPinnedEmails"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"dealId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"dealId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"emailId"}},{"kind":"Field","name":{"kind":"Name","value":"threadId"}},{"kind":"Field","name":{"kind":"Name","value":"subject"}},{"kind":"Field","name":{"kind":"Name","value":"fromEmail"}},{"kind":"Field","name":{"kind":"Name","value":"pinnedAt"}},{"kind":"Field","name":{"kind":"Name","value":"notes"}}]}}]}}]} as unknown as DocumentNode<GetPinnedEmailsForDealQuery, GetPinnedEmailsForDealQueryVariables>;
export const UnpinEmailDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UnpinEmail"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"unpinEmail"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}]}]}}]} as unknown as DocumentNode<UnpinEmailMutation, UnpinEmailMutationVariables>;
export const GetDealWorkflowStepsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetDealWorkflowSteps"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"dealId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deal"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"dealId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"wfmProject"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"workflow"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"steps"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"stepOrder"}},{"kind":"Field","name":{"kind":"Name","value":"isInitialStep"}},{"kind":"Field","name":{"kind":"Name","value":"isFinalStep"}},{"kind":"Field","name":{"kind":"Name","value":"status"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"color"}}]}}]}}]}}]}}]}}]}}]} as unknown as DocumentNode<GetDealWorkflowStepsQuery, GetDealWorkflowStepsQueryVariables>;
export const GetDealParticipantsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetDealParticipants"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"dealId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"getDealParticipants"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"dealId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"dealId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"role"}},{"kind":"Field","name":{"kind":"Name","value":"addedFromEmail"}},{"kind":"Field","name":{"kind":"Name","value":"person"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"first_name"}},{"kind":"Field","name":{"kind":"Name","value":"last_name"}},{"kind":"Field","name":{"kind":"Name","value":"email"}}]}}]}}]}}]} as unknown as DocumentNode<GetDealParticipantsQuery, GetDealParticipantsQueryVariables>;
export const SuggestEmailParticipantsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"SuggestEmailParticipants"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"dealId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"threadId"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"suggestEmailParticipants"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"dealId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"dealId"}}},{"kind":"Argument","name":{"kind":"Name","value":"threadId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"threadId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"first_name"}},{"kind":"Field","name":{"kind":"Name","value":"last_name"}},{"kind":"Field","name":{"kind":"Name","value":"email"}}]}}]}}]} as unknown as DocumentNode<SuggestEmailParticipantsQuery, SuggestEmailParticipantsQueryVariables>;
export const GetPinnedEmailsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetPinnedEmails"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"dealId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"getPinnedEmails"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"dealId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"dealId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"emailId"}},{"kind":"Field","name":{"kind":"Name","value":"threadId"}},{"kind":"Field","name":{"kind":"Name","value":"subject"}},{"kind":"Field","name":{"kind":"Name","value":"fromEmail"}},{"kind":"Field","name":{"kind":"Name","value":"pinnedAt"}},{"kind":"Field","name":{"kind":"Name","value":"notes"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]}}]} as unknown as DocumentNode<GetPinnedEmailsQuery, GetPinnedEmailsQueryVariables>;
export const UpdateEmailPinDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateEmailPin"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateEmailPinInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateEmailPin"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"notes"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]}}]} as unknown as DocumentNode<UpdateEmailPinMutation, UpdateEmailPinMutationVariables>;
export const GetMyReminderPreferencesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetMyReminderPreferences"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"myReminderPreferences"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"userId"}},{"kind":"Field","name":{"kind":"Name","value":"emailRemindersEnabled"}},{"kind":"Field","name":{"kind":"Name","value":"emailReminderMinutesBefore"}},{"kind":"Field","name":{"kind":"Name","value":"emailDailyDigestEnabled"}},{"kind":"Field","name":{"kind":"Name","value":"emailDailyDigestTime"}},{"kind":"Field","name":{"kind":"Name","value":"inAppRemindersEnabled"}},{"kind":"Field","name":{"kind":"Name","value":"inAppReminderMinutesBefore"}},{"kind":"Field","name":{"kind":"Name","value":"pushRemindersEnabled"}},{"kind":"Field","name":{"kind":"Name","value":"pushReminderMinutesBefore"}},{"kind":"Field","name":{"kind":"Name","value":"overdueNotificationsEnabled"}},{"kind":"Field","name":{"kind":"Name","value":"overdueNotificationFrequencyHours"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]}}]} as unknown as DocumentNode<GetMyReminderPreferencesQuery, GetMyReminderPreferencesQueryVariables>;
export const UpdateMyReminderPreferencesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateMyReminderPreferences"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateUserReminderPreferencesInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateMyReminderPreferences"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"userId"}},{"kind":"Field","name":{"kind":"Name","value":"emailRemindersEnabled"}},{"kind":"Field","name":{"kind":"Name","value":"emailReminderMinutesBefore"}},{"kind":"Field","name":{"kind":"Name","value":"emailDailyDigestEnabled"}},{"kind":"Field","name":{"kind":"Name","value":"emailDailyDigestTime"}},{"kind":"Field","name":{"kind":"Name","value":"inAppRemindersEnabled"}},{"kind":"Field","name":{"kind":"Name","value":"inAppReminderMinutesBefore"}},{"kind":"Field","name":{"kind":"Name","value":"pushRemindersEnabled"}},{"kind":"Field","name":{"kind":"Name","value":"pushReminderMinutesBefore"}},{"kind":"Field","name":{"kind":"Name","value":"overdueNotificationsEnabled"}},{"kind":"Field","name":{"kind":"Name","value":"overdueNotificationFrequencyHours"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]}}]} as unknown as DocumentNode<UpdateMyReminderPreferencesMutation, UpdateMyReminderPreferencesMutationVariables>;
export const UpdateUserProfileDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateUserProfile"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateUserProfileInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateUserProfile"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"display_name"}},{"kind":"Field","name":{"kind":"Name","value":"avatar_url"}}]}}]}}]} as unknown as DocumentNode<UpdateUserProfileMutation, UpdateUserProfileMutationVariables>;
export const GetExchangeRatesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetExchangeRates"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"exchangeRates"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"fromCurrency"}},{"kind":"Field","name":{"kind":"Name","value":"toCurrency"}},{"kind":"Field","name":{"kind":"Name","value":"rate"}},{"kind":"Field","name":{"kind":"Name","value":"effectiveDate"}},{"kind":"Field","name":{"kind":"Name","value":"source"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]}}]} as unknown as DocumentNode<GetExchangeRatesQuery, GetExchangeRatesQueryVariables>;
export const SetExchangeRateDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"SetExchangeRate"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"SetExchangeRateInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"setExchangeRate"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"fromCurrency"}},{"kind":"Field","name":{"kind":"Name","value":"toCurrency"}},{"kind":"Field","name":{"kind":"Name","value":"rate"}},{"kind":"Field","name":{"kind":"Name","value":"effectiveDate"}},{"kind":"Field","name":{"kind":"Name","value":"source"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]}}]} as unknown as DocumentNode<SetExchangeRateMutation, SetExchangeRateMutationVariables>;
export const UpdateRatesFromEcbDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateRatesFromECB"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateRatesFromECB"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"success"}},{"kind":"Field","name":{"kind":"Name","value":"message"}}]}}]}}]} as unknown as DocumentNode<UpdateRatesFromEcbMutation, UpdateRatesFromEcbMutationVariables>;
export const GetGoogleIntegrationStatusDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetGoogleIntegrationStatus"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"googleIntegrationStatus"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"isConnected"}},{"kind":"Field","name":{"kind":"Name","value":"hasGoogleAuth"}},{"kind":"Field","name":{"kind":"Name","value":"hasDriveAccess"}},{"kind":"Field","name":{"kind":"Name","value":"hasGmailAccess"}},{"kind":"Field","name":{"kind":"Name","value":"tokenExpiry"}},{"kind":"Field","name":{"kind":"Name","value":"missingScopes"}}]}}]}}]} as unknown as DocumentNode<GetGoogleIntegrationStatusQuery, GetGoogleIntegrationStatusQueryVariables>;
export const RevokeGoogleIntegrationDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"RevokeGoogleIntegration"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"revokeGoogleIntegration"}}]}}]} as unknown as DocumentNode<RevokeGoogleIntegrationMutation, RevokeGoogleIntegrationMutationVariables>;
export const ConnectGoogleIntegrationDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"ConnectGoogleIntegration"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ConnectGoogleIntegrationInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"connectGoogleIntegration"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"isConnected"}},{"kind":"Field","name":{"kind":"Name","value":"hasGoogleAuth"}},{"kind":"Field","name":{"kind":"Name","value":"hasDriveAccess"}},{"kind":"Field","name":{"kind":"Name","value":"hasGmailAccess"}},{"kind":"Field","name":{"kind":"Name","value":"tokenExpiry"}},{"kind":"Field","name":{"kind":"Name","value":"missingScopes"}}]}}]}}]} as unknown as DocumentNode<ConnectGoogleIntegrationMutation, ConnectGoogleIntegrationMutationVariables>;
export const GetLeadDetailsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetLeadDetails"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"lead"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"source"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"contact_name"}},{"kind":"Field","name":{"kind":"Name","value":"contact_email"}},{"kind":"Field","name":{"kind":"Name","value":"contact_phone"}},{"kind":"Field","name":{"kind":"Name","value":"company_name"}},{"kind":"Field","name":{"kind":"Name","value":"estimated_value"}},{"kind":"Field","name":{"kind":"Name","value":"estimated_close_date"}},{"kind":"Field","name":{"kind":"Name","value":"lead_score"}},{"kind":"Field","name":{"kind":"Name","value":"isQualified"}},{"kind":"Field","name":{"kind":"Name","value":"assigned_to_user_id"}},{"kind":"Field","name":{"kind":"Name","value":"assigned_at"}},{"kind":"Field","name":{"kind":"Name","value":"converted_at"}},{"kind":"Field","name":{"kind":"Name","value":"converted_to_deal_id"}},{"kind":"Field","name":{"kind":"Name","value":"last_activity_at"}},{"kind":"Field","name":{"kind":"Name","value":"created_at"}},{"kind":"Field","name":{"kind":"Name","value":"updated_at"}},{"kind":"Field","name":{"kind":"Name","value":"assignedToUser"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"display_name"}},{"kind":"Field","name":{"kind":"Name","value":"avatar_url"}}]}},{"kind":"Field","name":{"kind":"Name","value":"currentWfmStatus"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"color"}}]}}]}}]}}]} as unknown as DocumentNode<GetLeadDetailsQuery, GetLeadDetailsQueryVariables>;
export const GetStickerCategoriesForLeadDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetStickerCategoriesForLead"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"getStickerCategories"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"color"}},{"kind":"Field","name":{"kind":"Name","value":"icon"}},{"kind":"Field","name":{"kind":"Name","value":"isSystem"}},{"kind":"Field","name":{"kind":"Name","value":"displayOrder"}}]}}]}}]} as unknown as DocumentNode<GetStickerCategoriesForLeadQuery, GetStickerCategoriesForLeadQueryVariables>;
export const GetPersonCustomFieldDefinitionsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetPersonCustomFieldDefinitions"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"customFieldDefinitions"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"entityType"},"value":{"kind":"EnumValue","value":"PERSON"}},{"kind":"Argument","name":{"kind":"Name","value":"includeInactive"},"value":{"kind":"BooleanValue","value":false}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"fieldName"}},{"kind":"Field","name":{"kind":"Name","value":"fieldLabel"}},{"kind":"Field","name":{"kind":"Name","value":"fieldType"}},{"kind":"Field","name":{"kind":"Name","value":"dropdownOptions"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"value"}},{"kind":"Field","name":{"kind":"Name","value":"label"}}]}}]}}]}}]} as unknown as DocumentNode<GetPersonCustomFieldDefinitionsQuery, GetPersonCustomFieldDefinitionsQueryVariables>;
export const GetMeDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetMe"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"me"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"display_name"}},{"kind":"Field","name":{"kind":"Name","value":"avatar_url"}}]}}]}}]} as unknown as DocumentNode<GetMeQuery, GetMeQueryVariables>;
export const GetRolesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetRoles"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"roles"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}}]}}]}}]} as unknown as DocumentNode<GetRolesQuery, GetRolesQueryVariables>;
export const AssignUserRoleDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"AssignUserRole"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"userId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"roleName"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"assignUserRole"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"userId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"userId"}}},{"kind":"Argument","name":{"kind":"Name","value":"roleName"},"value":{"kind":"Variable","name":{"kind":"Name","value":"roleName"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"roles"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}}]}}]}}]}}]} as unknown as DocumentNode<AssignUserRoleMutation, AssignUserRoleMutationVariables>;
export const RemoveUserRoleDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"RemoveUserRole"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"userId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"roleName"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"removeUserRole"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"userId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"userId"}}},{"kind":"Argument","name":{"kind":"Name","value":"roleName"},"value":{"kind":"Variable","name":{"kind":"Name","value":"roleName"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"roles"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}}]}}]}}]}}]} as unknown as DocumentNode<RemoveUserRoleMutation, RemoveUserRoleMutationVariables>;