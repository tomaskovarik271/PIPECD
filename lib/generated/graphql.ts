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
  DateTime: { input: Date; output: Date };
  JSON: { input: { [key: string]: any }; output: { [key: string]: any } };
};

export type AccountTerritory = {
  __typename?: "AccountTerritory";
  assignmentReason?: Maybe<Scalars["String"]["output"]>;
  createdAt: Scalars["String"]["output"];
  isPrimary: Scalars["Boolean"]["output"];
  organization: Organization;
  territory: Territory;
};

export type Activity = {
  __typename?: "Activity";
  assignedToUser?: Maybe<User>;
  assigned_to_user_id?: Maybe<Scalars["ID"]["output"]>;
  created_at: Scalars["DateTime"]["output"];
  deal?: Maybe<Deal>;
  deal_id?: Maybe<Scalars["ID"]["output"]>;
  due_date?: Maybe<Scalars["DateTime"]["output"]>;
  id: Scalars["ID"]["output"];
  is_done: Scalars["Boolean"]["output"];
  is_system_activity: Scalars["Boolean"]["output"];
  lead?: Maybe<Lead>;
  lead_id?: Maybe<Scalars["ID"]["output"]>;
  notes?: Maybe<Scalars["String"]["output"]>;
  organization?: Maybe<Organization>;
  organization_id?: Maybe<Scalars["ID"]["output"]>;
  person?: Maybe<Person>;
  person_id?: Maybe<Scalars["ID"]["output"]>;
  subject: Scalars["String"]["output"];
  type: ActivityType;
  updated_at: Scalars["DateTime"]["output"];
  user?: Maybe<User>;
  user_id: Scalars["ID"]["output"];
};

export type ActivityFilterInput = {
  dealId?: InputMaybe<Scalars["ID"]["input"]>;
  isDone?: InputMaybe<Scalars["Boolean"]["input"]>;
  leadId?: InputMaybe<Scalars["ID"]["input"]>;
  organizationId?: InputMaybe<Scalars["ID"]["input"]>;
  personId?: InputMaybe<Scalars["ID"]["input"]>;
};

export type ActivityReminder = {
  __typename?: "ActivityReminder";
  activity?: Maybe<Activity>;
  activityId: Scalars["ID"]["output"];
  createdAt: Scalars["DateTime"]["output"];
  failedAttempts: Scalars["Int"]["output"];
  id: Scalars["ID"]["output"];
  isSent: Scalars["Boolean"]["output"];
  lastError?: Maybe<Scalars["String"]["output"]>;
  reminderContent?: Maybe<Scalars["JSON"]["output"]>;
  reminderType: ReminderType;
  scheduledFor: Scalars["DateTime"]["output"];
  sentAt?: Maybe<Scalars["DateTime"]["output"]>;
  updatedAt: Scalars["DateTime"]["output"];
  user?: Maybe<User>;
  userId: Scalars["ID"]["output"];
};

/** Defines the GraphQL schema for Activities. */
export enum ActivityType {
  Call = "CALL",
  Deadline = "DEADLINE",
  Email = "EMAIL",
  Meeting = "MEETING",
  SystemTask = "SYSTEM_TASK",
  Task = "TASK",
}

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
  content: Scalars["String"]["output"];
  conversationId: Scalars["ID"]["output"];
  id: Scalars["ID"]["output"];
  metadata: Scalars["JSON"]["output"];
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

export type AttachFileInput = {
  category?: InputMaybe<DocumentCategory>;
  dealId: Scalars["ID"]["input"];
  fileId: Scalars["String"]["input"];
};

export enum BudgetAuthorityLevel {
  High = "HIGH",
  Low = "LOW",
  Medium = "MEDIUM",
  None = "NONE",
  Unlimited = "UNLIMITED",
}

export enum CommunicationPreference {
  Email = "EMAIL",
  FormalMeetings = "FORMAL_MEETINGS",
  InPerson = "IN_PERSON",
  Phone = "PHONE",
  Slack = "SLACK",
  Teams = "TEAMS",
}

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

export type ConvertedEntities = {
  __typename?: "ConvertedEntities";
  deal?: Maybe<Deal>;
  organization?: Maybe<Organization>;
  person?: Maybe<Person>;
};

export type CreateActivityInput = {
  assigned_to_user_id?: InputMaybe<Scalars["ID"]["input"]>;
  deal_id?: InputMaybe<Scalars["ID"]["input"]>;
  due_date?: InputMaybe<Scalars["DateTime"]["input"]>;
  is_done?: InputMaybe<Scalars["Boolean"]["input"]>;
  lead_id?: InputMaybe<Scalars["ID"]["input"]>;
  notes?: InputMaybe<Scalars["String"]["input"]>;
  organization_id?: InputMaybe<Scalars["ID"]["input"]>;
  person_id?: InputMaybe<Scalars["ID"]["input"]>;
  subject: Scalars["String"]["input"];
  type: ActivityType;
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

export type CreateNotificationInput = {
  actionUrl?: InputMaybe<Scalars["String"]["input"]>;
  entityId?: InputMaybe<Scalars["ID"]["input"]>;
  entityType?: InputMaybe<Scalars["String"]["input"]>;
  expiresAt?: InputMaybe<Scalars["DateTime"]["input"]>;
  message: Scalars["String"]["input"];
  metadata?: InputMaybe<Scalars["JSON"]["input"]>;
  notificationType: NotificationType;
  priority?: InputMaybe<NotificationPriority>;
  title: Scalars["String"]["input"];
  userId: Scalars["ID"]["input"];
};

export type CreateOrganizationRelationshipInput = {
  childOrgId: Scalars["ID"]["input"];
  notes?: InputMaybe<Scalars["String"]["input"]>;
  ownershipPercentage?: InputMaybe<Scalars["Float"]["input"]>;
  parentOrgId: Scalars["ID"]["input"];
  relationshipStrength?: InputMaybe<Scalars["Int"]["input"]>;
  relationshipType: OrganizationRelationshipType;
  startDate?: InputMaybe<Scalars["String"]["input"]>;
};

export type CreatePersonOrganizationalRoleInput = {
  budgetAuthorityUsd?: InputMaybe<Scalars["Float"]["input"]>;
  department?: InputMaybe<Scalars["String"]["input"]>;
  endDate?: InputMaybe<Scalars["String"]["input"]>;
  isPrimaryRole?: InputMaybe<Scalars["Boolean"]["input"]>;
  notes?: InputMaybe<Scalars["String"]["input"]>;
  organizationId: Scalars["ID"]["input"];
  personId: Scalars["ID"]["input"];
  reportingStructure?: InputMaybe<Scalars["JSON"]["input"]>;
  responsibilities?: InputMaybe<Scalars["JSON"]["input"]>;
  roleTitle: Scalars["String"]["input"];
  seniorityLevel?: InputMaybe<SeniorityLevel>;
  startDate?: InputMaybe<Scalars["String"]["input"]>;
  teamSize?: InputMaybe<Scalars["Int"]["input"]>;
};

export type CreatePersonRelationshipInput = {
  fromPersonId: Scalars["ID"]["input"];
  interactionFrequency?: InputMaybe<InteractionFrequency>;
  isBidirectional?: InputMaybe<Scalars["Boolean"]["input"]>;
  notes?: InputMaybe<Scalars["String"]["input"]>;
  relationshipContext?: InputMaybe<Scalars["String"]["input"]>;
  relationshipStrength?: InputMaybe<Scalars["Int"]["input"]>;
  relationshipType: PersonRelationshipType;
  toPersonId: Scalars["ID"]["input"];
};

export type CreateStakeholderAnalysisInput = {
  approachStrategy?: InputMaybe<Scalars["String"]["input"]>;
  budgetAuthorityLevel?: InputMaybe<BudgetAuthorityLevel>;
  communicationPreference?: InputMaybe<CommunicationPreference>;
  concerns?: InputMaybe<Scalars["JSON"]["input"]>;
  dealId?: InputMaybe<Scalars["ID"]["input"]>;
  decisionAuthority?: InputMaybe<DecisionAuthority>;
  engagementLevel?: InputMaybe<EngagementLevel>;
  influenceScore?: InputMaybe<Scalars["Int"]["input"]>;
  lastInteractionDate?: InputMaybe<Scalars["String"]["input"]>;
  lastInteractionType?: InputMaybe<Scalars["String"]["input"]>;
  leadId?: InputMaybe<Scalars["ID"]["input"]>;
  motivations?: InputMaybe<Scalars["JSON"]["input"]>;
  nextBestAction?: InputMaybe<Scalars["String"]["input"]>;
  organizationId: Scalars["ID"]["input"];
  painPoints?: InputMaybe<Scalars["JSON"]["input"]>;
  personId: Scalars["ID"]["input"];
  preferredMeetingTime?: InputMaybe<Scalars["String"]["input"]>;
  successMetrics?: InputMaybe<Scalars["JSON"]["input"]>;
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

export type CreateTaskFromEmailInput = {
  assigneeId?: InputMaybe<Scalars["String"]["input"]>;
  dealId?: InputMaybe<Scalars["String"]["input"]>;
  description?: InputMaybe<Scalars["String"]["input"]>;
  dueDate?: InputMaybe<Scalars["String"]["input"]>;
  emailId: Scalars["String"]["input"];
  subject: Scalars["String"]["input"];
};

export type CreateTerritoryInput = {
  accountSizeRange?: InputMaybe<Scalars["String"]["input"]>;
  assignedUserId?: InputMaybe<Scalars["ID"]["input"]>;
  city?: InputMaybe<Scalars["String"]["input"]>;
  country?: InputMaybe<Scalars["String"]["input"]>;
  industryFocus?: InputMaybe<Array<Scalars["String"]["input"]>>;
  metadata?: InputMaybe<Scalars["JSON"]["input"]>;
  name: Scalars["String"]["input"];
  parentTerritoryId?: InputMaybe<Scalars["ID"]["input"]>;
  region?: InputMaybe<Scalars["String"]["input"]>;
  stateProvince?: InputMaybe<Scalars["String"]["input"]>;
  territoryType: TerritoryType;
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
  activities: Array<Activity>;
  amount?: Maybe<Scalars["Float"]["output"]>;
  assignedToUser?: Maybe<User>;
  assigned_to_user_id?: Maybe<Scalars["ID"]["output"]>;
  createdBy: User;
  created_at: Scalars["DateTime"]["output"];
  currentWfmStatus?: Maybe<WfmStatus>;
  currentWfmStep?: Maybe<WfmWorkflowStep>;
  customFieldValues: Array<CustomFieldValue>;
  deal_specific_probability?: Maybe<Scalars["Float"]["output"]>;
  expected_close_date?: Maybe<Scalars["DateTime"]["output"]>;
  history?: Maybe<Array<DealHistoryEntry>>;
  id: Scalars["ID"]["output"];
  name: Scalars["String"]["output"];
  organization?: Maybe<Organization>;
  organization_id?: Maybe<Scalars["ID"]["output"]>;
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
  customFields?: InputMaybe<Array<CustomFieldValueInput>>;
  deal_specific_probability?: InputMaybe<Scalars["Float"]["input"]>;
  expected_close_date?: InputMaybe<Scalars["DateTime"]["input"]>;
  name: Scalars["String"]["input"];
  organization_id?: InputMaybe<Scalars["ID"]["input"]>;
  person_id?: InputMaybe<Scalars["ID"]["input"]>;
  wfmProjectTypeId: Scalars["ID"]["input"];
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

export type DealUpdateInput = {
  amount?: InputMaybe<Scalars["Float"]["input"]>;
  assignedToUserId?: InputMaybe<Scalars["ID"]["input"]>;
  customFields?: InputMaybe<Array<CustomFieldValueInput>>;
  deal_specific_probability?: InputMaybe<Scalars["Float"]["input"]>;
  expected_close_date?: InputMaybe<Scalars["DateTime"]["input"]>;
  name?: InputMaybe<Scalars["String"]["input"]>;
  organization_id?: InputMaybe<Scalars["ID"]["input"]>;
  person_id?: InputMaybe<Scalars["ID"]["input"]>;
};

export enum DecisionAuthority {
  Blocker = "BLOCKER",
  EndUser = "END_USER",
  FinalDecision = "FINAL_DECISION",
  Gatekeeper = "GATEKEEPER",
  Influencer = "INFLUENCER",
  Recommender = "RECOMMENDER",
  StrongInfluence = "STRONG_INFLUENCE",
}

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
  dateFrom?: InputMaybe<Scalars["String"]["input"]>;
  dateTo?: InputMaybe<Scalars["String"]["input"]>;
  dealId?: InputMaybe<Scalars["String"]["input"]>;
  hasAttachments?: InputMaybe<Scalars["Boolean"]["input"]>;
  isUnread?: InputMaybe<Scalars["Boolean"]["input"]>;
  keywords?: InputMaybe<Array<Scalars["String"]["input"]>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  pageToken?: InputMaybe<Scalars["String"]["input"]>;
};

export enum EngagementLevel {
  Blocker = "BLOCKER",
  Champion = "CHAMPION",
  Neutral = "NEUTRAL",
  Skeptic = "SKEPTIC",
  Supporter = "SUPPORTER",
}

export enum EntityType {
  Deal = "DEAL",
  Lead = "LEAD",
  Organization = "ORGANIZATION",
  Person = "PERSON",
}

/** Google Drive specific configuration */
export type GoogleDriveConfig = {
  __typename?: "GoogleDriveConfig";
  auto_create_deal_folders: Scalars["Boolean"]["output"];
  deal_folder_template: Scalars["Boolean"]["output"];
  pipecd_deals_folder_id?: Maybe<Scalars["String"]["output"]>;
};

export type GoogleIntegrationStatus = {
  __typename?: "GoogleIntegrationStatus";
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

export enum InsightStatus {
  ActingOn = "ACTING_ON",
  Completed = "COMPLETED",
  Dismissed = "DISMISSED",
  New = "NEW",
  Reviewed = "REVIEWED",
}

export enum InsightType {
  DecisionPath = "DECISION_PATH",
  InfluencePattern = "INFLUENCE_PATTERN",
  MissingStakeholder = "MISSING_STAKEHOLDER",
  Opportunity = "OPPORTUNITY",
  RelationshipGap = "RELATIONSHIP_GAP",
  RelationshipStrengthChange = "RELATIONSHIP_STRENGTH_CHANGE",
  RiskAlert = "RISK_ALERT",
}

export enum InteractionFrequency {
  Annually = "ANNUALLY",
  Daily = "DAILY",
  Monthly = "MONTHLY",
  Quarterly = "QUARTERLY",
  Rarely = "RARELY",
  Weekly = "WEEKLY",
}

export type Lead = {
  __typename?: "Lead";
  activities: Array<Activity>;
  ai_insights?: Maybe<Scalars["JSON"]["output"]>;
  assignedToUser?: Maybe<User>;
  assigned_at?: Maybe<Scalars["DateTime"]["output"]>;
  assigned_to_user_id?: Maybe<Scalars["ID"]["output"]>;
  automation_score_factors?: Maybe<Scalars["JSON"]["output"]>;
  company_name?: Maybe<Scalars["String"]["output"]>;
  contact_email?: Maybe<Scalars["String"]["output"]>;
  contact_name?: Maybe<Scalars["String"]["output"]>;
  contact_phone?: Maybe<Scalars["String"]["output"]>;
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
  currentWfmStatus?: Maybe<WfmStatus>;
  currentWfmStep?: Maybe<WfmWorkflowStep>;
  customFieldValues: Array<CustomFieldValue>;
  description?: Maybe<Scalars["String"]["output"]>;
  estimated_close_date?: Maybe<Scalars["DateTime"]["output"]>;
  estimated_value?: Maybe<Scalars["Float"]["output"]>;
  history?: Maybe<Array<Maybe<LeadHistoryEntry>>>;
  id: Scalars["ID"]["output"];
  isQualified: Scalars["Boolean"]["output"];
  last_activity_at: Scalars["DateTime"]["output"];
  lead_score: Scalars["Int"]["output"];
  lead_score_factors?: Maybe<Scalars["JSON"]["output"]>;
  name: Scalars["String"]["output"];
  qualificationLevel: Scalars["Float"]["output"];
  qualificationStatus: Scalars["String"]["output"];
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

export type MissingStakeholderRecommendations = {
  __typename?: "MissingStakeholderRecommendations";
  coveragePercentage: Scalars["Float"]["output"];
  currentCoverage: Scalars["Int"]["output"];
  missingRoles: Scalars["JSON"]["output"];
  priorityAdditions: Scalars["JSON"]["output"];
  recommendedCoverage: Scalars["Int"]["output"];
  suggestedActions: Scalars["JSON"]["output"];
};

export type Mutation = {
  __typename?: "Mutation";
  addAgentThoughts: Array<AgentThought>;
  archiveThread: Scalars["Boolean"]["output"];
  assignAccountToTerritory: AccountTerritory;
  assignUserRole: User;
  attachDocumentToDeal: DealDocumentAttachment;
  attachFileToDeal: DealDocumentAttachment;
  cancelActivityReminder: Scalars["Boolean"]["output"];
  composeEmail: EmailMessage;
  connectGoogleIntegration: GoogleIntegrationStatus;
  convertLead: LeadConversionResult;
  copyDriveFile: DriveFile;
  createActivity: Activity;
  createAgentConversation: AgentConversation;
  createCustomFieldDefinition: CustomFieldDefinition;
  createDeal: Deal;
  createDealFolder: DriveFolderStructure;
  createDocument: Document;
  createEmail: Email;
  createLead: Lead;
  createNotification: Notification;
  createOrganization: Organization;
  createOrganizationRelationship: OrganizationRelationship;
  createPerson: Person;
  createPersonOrganizationalRole: PersonOrganizationalRole;
  createPersonRelationship: PersonRelationship;
  createStakeholderAnalysis: StakeholderAnalysis;
  createSticker: SmartSticker;
  createTaskFromEmail: Activity;
  createTerritory: Territory;
  createWFMProjectType: WfmProjectType;
  createWFMStatus: WfmStatus;
  createWFMWorkflow: WfmWorkflow;
  createWFMWorkflowStep: WfmWorkflowStep;
  createWFMWorkflowTransition: WfmWorkflowTransition;
  deactivateCustomFieldDefinition: CustomFieldDefinition;
  deleteActivity: Scalars["ID"]["output"];
  deleteAgentConversation: Scalars["Boolean"]["output"];
  deleteDeal?: Maybe<Scalars["Boolean"]["output"]>;
  deleteDriveFile: Scalars["Boolean"]["output"];
  deleteLead?: Maybe<Scalars["Boolean"]["output"]>;
  deleteNotification: Scalars["Boolean"]["output"];
  deleteOrganization?: Maybe<Scalars["Boolean"]["output"]>;
  deleteOrganizationRelationship: Scalars["Boolean"]["output"];
  deletePerson?: Maybe<Scalars["Boolean"]["output"]>;
  deletePersonOrganizationalRole: Scalars["Boolean"]["output"];
  deletePersonRelationship: Scalars["Boolean"]["output"];
  deleteStakeholderAnalysis: Scalars["Boolean"]["output"];
  deleteSticker: Scalars["Boolean"]["output"];
  deleteTerritory: Scalars["Boolean"]["output"];
  deleteWFMWorkflowStep: WfmWorkflowStepMutationResponse;
  deleteWFMWorkflowTransition: WfmWorkflowTransitionMutationResponse;
  deleteWfmStatus: WfmStatusMutationResponse;
  detachFileFromDeal: Scalars["Boolean"]["output"];
  dismissRelationshipInsight: Scalars["Boolean"]["output"];
  executeAgentStep: AgentResponse;
  linkEmailToDeal: Scalars["Boolean"]["output"];
  markAllNotificationsAsRead: Scalars["Int"]["output"];
  markNotificationAsRead: Notification;
  markThreadAsRead: Scalars["Boolean"]["output"];
  markThreadAsUnread: Scalars["Boolean"]["output"];
  moveDriveFile: DriveFile;
  moveStickersBulk: Array<SmartSticker>;
  reactivateCustomFieldDefinition: CustomFieldDefinition;
  recalculateLeadScore: Lead;
  removeAccountFromTerritory: Scalars["Boolean"]["output"];
  removeDocumentAttachment: Scalars["Boolean"]["output"];
  removeUserRole: User;
  revokeGoogleIntegration: Scalars["Boolean"]["output"];
  scheduleActivityReminder: ActivityReminder;
  sendAgentMessage: AgentResponse;
  shareDriveFolder: Scalars["Boolean"]["output"];
  syncGmailEmails: Array<Email>;
  toggleStickerPin: SmartSticker;
  updateActivity: Activity;
  updateAgentConversation: AgentConversation;
  /** Update an app setting (admin only) */
  updateAppSetting: AppSetting;
  updateCustomFieldDefinition: CustomFieldDefinition;
  updateDeal?: Maybe<Deal>;
  updateDealWFMProgress: Deal;
  updateDocumentAttachmentCategory: DealDocumentAttachment;
  updateLead?: Maybe<Lead>;
  updateLeadWFMProgress: Lead;
  updateMyReminderPreferences: UserReminderPreferences;
  updateOrganization?: Maybe<Organization>;
  updatePerson?: Maybe<Person>;
  updatePersonOrganizationalRole: PersonOrganizationalRole;
  updateRelationshipInsight: RelationshipInsight;
  updateStakeholderAnalysis: StakeholderAnalysis;
  updateSticker: SmartSticker;
  updateStickerTags: SmartSticker;
  updateTerritory: Territory;
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
  conversationId: Scalars["ID"]["input"];
  thoughts: Array<AgentThoughtInput>;
};

export type MutationArchiveThreadArgs = {
  threadId: Scalars["String"]["input"];
};

export type MutationAssignAccountToTerritoryArgs = {
  assignmentReason?: InputMaybe<Scalars["String"]["input"]>;
  isPrimary?: InputMaybe<Scalars["Boolean"]["input"]>;
  organizationId: Scalars["ID"]["input"];
  territoryId: Scalars["ID"]["input"];
};

export type MutationAssignUserRoleArgs = {
  roleName: Scalars["String"]["input"];
  userId: Scalars["ID"]["input"];
};

export type MutationAttachDocumentToDealArgs = {
  input: AttachDocumentInput;
};

export type MutationAttachFileToDealArgs = {
  input: AttachFileInput;
};

export type MutationCancelActivityReminderArgs = {
  id: Scalars["ID"]["input"];
};

export type MutationComposeEmailArgs = {
  input: ComposeEmailInput;
};

export type MutationConnectGoogleIntegrationArgs = {
  input: ConnectGoogleIntegrationInput;
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

export type MutationCreateActivityArgs = {
  input: CreateActivityInput;
};

export type MutationCreateAgentConversationArgs = {
  config?: InputMaybe<AgentConfigInput>;
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

export type MutationCreateOrganizationRelationshipArgs = {
  input: CreateOrganizationRelationshipInput;
};

export type MutationCreatePersonArgs = {
  input: PersonInput;
};

export type MutationCreatePersonOrganizationalRoleArgs = {
  input: CreatePersonOrganizationalRoleInput;
};

export type MutationCreatePersonRelationshipArgs = {
  input: CreatePersonRelationshipInput;
};

export type MutationCreateStakeholderAnalysisArgs = {
  input: CreateStakeholderAnalysisInput;
};

export type MutationCreateStickerArgs = {
  input: CreateStickerInput;
};

export type MutationCreateTaskFromEmailArgs = {
  input: CreateTaskFromEmailInput;
};

export type MutationCreateTerritoryArgs = {
  input: CreateTerritoryInput;
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
  id: Scalars["ID"]["input"];
};

export type MutationDeleteActivityArgs = {
  id: Scalars["ID"]["input"];
};

export type MutationDeleteAgentConversationArgs = {
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

export type MutationDeleteNotificationArgs = {
  id: Scalars["ID"]["input"];
};

export type MutationDeleteOrganizationArgs = {
  id: Scalars["ID"]["input"];
};

export type MutationDeleteOrganizationRelationshipArgs = {
  id: Scalars["ID"]["input"];
};

export type MutationDeletePersonArgs = {
  id: Scalars["ID"]["input"];
};

export type MutationDeletePersonOrganizationalRoleArgs = {
  id: Scalars["ID"]["input"];
};

export type MutationDeletePersonRelationshipArgs = {
  id: Scalars["ID"]["input"];
};

export type MutationDeleteStakeholderAnalysisArgs = {
  id: Scalars["ID"]["input"];
};

export type MutationDeleteStickerArgs = {
  id: Scalars["ID"]["input"];
};

export type MutationDeleteTerritoryArgs = {
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

export type MutationDismissRelationshipInsightArgs = {
  id: Scalars["ID"]["input"];
};

export type MutationExecuteAgentStepArgs = {
  conversationId: Scalars["ID"]["input"];
  stepId: Scalars["String"]["input"];
};

export type MutationLinkEmailToDealArgs = {
  dealId: Scalars["String"]["input"];
  emailId: Scalars["String"]["input"];
};

export type MutationMarkNotificationAsReadArgs = {
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

export type MutationReactivateCustomFieldDefinitionArgs = {
  id: Scalars["ID"]["input"];
};

export type MutationRecalculateLeadScoreArgs = {
  leadId: Scalars["ID"]["input"];
};

export type MutationRemoveAccountFromTerritoryArgs = {
  organizationId: Scalars["ID"]["input"];
  territoryId: Scalars["ID"]["input"];
};

export type MutationRemoveDocumentAttachmentArgs = {
  attachmentId: Scalars["ID"]["input"];
};

export type MutationRemoveUserRoleArgs = {
  roleName: Scalars["String"]["input"];
  userId: Scalars["ID"]["input"];
};

export type MutationScheduleActivityReminderArgs = {
  activityId: Scalars["ID"]["input"];
  reminderType: ReminderType;
  scheduledFor: Scalars["DateTime"]["input"];
};

export type MutationSendAgentMessageArgs = {
  input: SendMessageInput;
};

export type MutationShareDriveFolderArgs = {
  folderId: Scalars["String"]["input"];
  permissions: Array<DrivePermissionInput>;
};

export type MutationSyncGmailEmailsArgs = {
  entityId: Scalars["ID"]["input"];
  entityType: EntityType;
};

export type MutationToggleStickerPinArgs = {
  id: Scalars["ID"]["input"];
};

export type MutationUpdateActivityArgs = {
  id: Scalars["ID"]["input"];
  input: UpdateActivityInput;
};

export type MutationUpdateAgentConversationArgs = {
  input: UpdateConversationInput;
};

export type MutationUpdateAppSettingArgs = {
  input: UpdateAppSettingInput;
};

export type MutationUpdateCustomFieldDefinitionArgs = {
  id: Scalars["ID"]["input"];
  input: CustomFieldDefinitionInput;
};

export type MutationUpdateDealArgs = {
  id: Scalars["ID"]["input"];
  input: DealUpdateInput;
};

export type MutationUpdateDealWfmProgressArgs = {
  dealId: Scalars["ID"]["input"];
  targetWfmWorkflowStepId: Scalars["ID"]["input"];
};

export type MutationUpdateDocumentAttachmentCategoryArgs = {
  attachmentId: Scalars["ID"]["input"];
  category: DocumentCategory;
};

export type MutationUpdateLeadArgs = {
  id: Scalars["ID"]["input"];
  input: LeadUpdateInput;
};

export type MutationUpdateLeadWfmProgressArgs = {
  leadId: Scalars["ID"]["input"];
  targetWfmWorkflowStepId: Scalars["ID"]["input"];
};

export type MutationUpdateMyReminderPreferencesArgs = {
  input: UpdateUserReminderPreferencesInput;
};

export type MutationUpdateOrganizationArgs = {
  id: Scalars["ID"]["input"];
  input: OrganizationInput;
};

export type MutationUpdatePersonArgs = {
  id: Scalars["ID"]["input"];
  input: PersonInput;
};

export type MutationUpdatePersonOrganizationalRoleArgs = {
  id: Scalars["ID"]["input"];
  input: CreatePersonOrganizationalRoleInput;
};

export type MutationUpdateRelationshipInsightArgs = {
  id: Scalars["ID"]["input"];
  input: UpdateRelationshipInsightInput;
};

export type MutationUpdateStakeholderAnalysisArgs = {
  id: Scalars["ID"]["input"];
  input: UpdateStakeholderAnalysisInput;
};

export type MutationUpdateStickerArgs = {
  input: UpdateStickerInput;
};

export type MutationUpdateStickerTagsArgs = {
  id: Scalars["ID"]["input"];
  tagsToAdd?: InputMaybe<Array<Scalars["String"]["input"]>>;
  tagsToRemove?: InputMaybe<Array<Scalars["String"]["input"]>>;
};

export type MutationUpdateTerritoryArgs = {
  id: Scalars["ID"]["input"];
  input: CreateTerritoryInput;
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

export type Notification = {
  __typename?: "Notification";
  actionUrl?: Maybe<Scalars["String"]["output"]>;
  createdAt: Scalars["DateTime"]["output"];
  entityId?: Maybe<Scalars["ID"]["output"]>;
  entityType?: Maybe<Scalars["String"]["output"]>;
  expiresAt?: Maybe<Scalars["DateTime"]["output"]>;
  id: Scalars["ID"]["output"];
  isRead: Scalars["Boolean"]["output"];
  message: Scalars["String"]["output"];
  metadata?: Maybe<Scalars["JSON"]["output"]>;
  notificationType: NotificationType;
  priority: NotificationPriority;
  readAt?: Maybe<Scalars["DateTime"]["output"]>;
  title: Scalars["String"]["output"];
  updatedAt: Scalars["DateTime"]["output"];
  user?: Maybe<User>;
  userId: Scalars["ID"]["output"];
};

export type NotificationFilterInput = {
  entityId?: InputMaybe<Scalars["ID"]["input"]>;
  entityType?: InputMaybe<Scalars["String"]["input"]>;
  isRead?: InputMaybe<Scalars["Boolean"]["input"]>;
  notificationType?: InputMaybe<NotificationType>;
  priority?: InputMaybe<NotificationPriority>;
};

export enum NotificationPriority {
  High = "HIGH",
  Low = "LOW",
  Normal = "NORMAL",
  Urgent = "URGENT",
}

export type NotificationSummary = {
  __typename?: "NotificationSummary";
  notifications: Array<Notification>;
  totalCount: Scalars["Int"]["output"];
  unreadCount: Scalars["Int"]["output"];
};

export enum NotificationType {
  ActivityOverdue = "ACTIVITY_OVERDUE",
  ActivityReminder = "ACTIVITY_REMINDER",
  Custom = "CUSTOM",
  DealAssigned = "DEAL_ASSIGNED",
  LeadAssigned = "LEAD_ASSIGNED",
  SystemAnnouncement = "SYSTEM_ANNOUNCEMENT",
}

/** Defines the Organization type and related queries/mutations. */
export type Organization = {
  __typename?: "Organization";
  activities: Array<Activity>;
  address?: Maybe<Scalars["String"]["output"]>;
  created_at: Scalars["DateTime"]["output"];
  customFieldValues: Array<CustomFieldValue>;
  deals: Array<Deal>;
  id: Scalars["ID"]["output"];
  name: Scalars["String"]["output"];
  notes?: Maybe<Scalars["String"]["output"]>;
  people?: Maybe<Array<Person>>;
  updated_at: Scalars["DateTime"]["output"];
  user_id: Scalars["ID"]["output"];
};

export type OrganizationInput = {
  address?: InputMaybe<Scalars["String"]["input"]>;
  customFields?: InputMaybe<Array<CustomFieldValueInput>>;
  name: Scalars["String"]["input"];
  notes?: InputMaybe<Scalars["String"]["input"]>;
};

export type OrganizationRelationship = {
  __typename?: "OrganizationRelationship";
  childOrg: Organization;
  createdAt: Scalars["String"]["output"];
  createdByUser?: Maybe<User>;
  endDate?: Maybe<Scalars["String"]["output"]>;
  id: Scalars["ID"]["output"];
  metadata?: Maybe<Scalars["JSON"]["output"]>;
  notes?: Maybe<Scalars["String"]["output"]>;
  ownershipPercentage?: Maybe<Scalars["Float"]["output"]>;
  parentOrg: Organization;
  relationshipStrength?: Maybe<Scalars["Int"]["output"]>;
  relationshipType: OrganizationRelationshipType;
  startDate?: Maybe<Scalars["String"]["output"]>;
  updatedAt: Scalars["String"]["output"];
};

export enum OrganizationRelationshipType {
  AcquisitionTarget = "ACQUISITION_TARGET",
  Competitor = "COMPETITOR",
  Customer = "CUSTOMER",
  Division = "DIVISION",
  JointVenture = "JOINT_VENTURE",
  Partnership = "PARTNERSHIP",
  Subsidiary = "SUBSIDIARY",
  Supplier = "SUPPLIER",
}

export type OrganizationUpdateInput = {
  address?: InputMaybe<Scalars["String"]["input"]>;
  customFields?: InputMaybe<Array<CustomFieldValueInput>>;
  name?: InputMaybe<Scalars["String"]["input"]>;
  notes?: InputMaybe<Scalars["String"]["input"]>;
};

/** Defines the Person type and related queries/mutations. */
export type Person = {
  __typename?: "Person";
  activities: Array<Activity>;
  created_at: Scalars["DateTime"]["output"];
  customFieldValues: Array<CustomFieldValue>;
  deals?: Maybe<Array<Deal>>;
  email?: Maybe<Scalars["String"]["output"]>;
  first_name?: Maybe<Scalars["String"]["output"]>;
  id: Scalars["ID"]["output"];
  last_name?: Maybe<Scalars["String"]["output"]>;
  notes?: Maybe<Scalars["String"]["output"]>;
  organization?: Maybe<Organization>;
  organization_id?: Maybe<Scalars["ID"]["output"]>;
  phone?: Maybe<Scalars["String"]["output"]>;
  updated_at: Scalars["DateTime"]["output"];
  user_id: Scalars["ID"]["output"];
};

export type PersonInput = {
  customFields?: InputMaybe<Array<CustomFieldValueInput>>;
  email?: InputMaybe<Scalars["String"]["input"]>;
  first_name?: InputMaybe<Scalars["String"]["input"]>;
  last_name?: InputMaybe<Scalars["String"]["input"]>;
  notes?: InputMaybe<Scalars["String"]["input"]>;
  organization_id?: InputMaybe<Scalars["ID"]["input"]>;
  phone?: InputMaybe<Scalars["String"]["input"]>;
};

export type PersonListItem = {
  __typename?: "PersonListItem";
  id: Scalars["ID"]["output"];
  name: Scalars["String"]["output"];
};

export type PersonOrganizationalRole = {
  __typename?: "PersonOrganizationalRole";
  budgetAuthorityUsd?: Maybe<Scalars["Float"]["output"]>;
  createdAt: Scalars["String"]["output"];
  createdByUser?: Maybe<User>;
  department?: Maybe<Scalars["String"]["output"]>;
  endDate?: Maybe<Scalars["String"]["output"]>;
  id: Scalars["ID"]["output"];
  isPrimaryRole: Scalars["Boolean"]["output"];
  notes?: Maybe<Scalars["String"]["output"]>;
  organization: Organization;
  person: Person;
  reportingStructure?: Maybe<Scalars["JSON"]["output"]>;
  responsibilities?: Maybe<Scalars["JSON"]["output"]>;
  roleTitle: Scalars["String"]["output"];
  seniorityLevel?: Maybe<SeniorityLevel>;
  startDate?: Maybe<Scalars["String"]["output"]>;
  teamSize?: Maybe<Scalars["Int"]["output"]>;
  updatedAt: Scalars["String"]["output"];
};

export type PersonRelationship = {
  __typename?: "PersonRelationship";
  createdAt: Scalars["String"]["output"];
  createdByUser?: Maybe<User>;
  fromPerson: Person;
  id: Scalars["ID"]["output"];
  interactionFrequency?: Maybe<InteractionFrequency>;
  isBidirectional: Scalars["Boolean"]["output"];
  metadata?: Maybe<Scalars["JSON"]["output"]>;
  notes?: Maybe<Scalars["String"]["output"]>;
  relationshipContext?: Maybe<Scalars["String"]["output"]>;
  relationshipStrength?: Maybe<Scalars["Int"]["output"]>;
  relationshipType: PersonRelationshipType;
  toPerson: Person;
  updatedAt: Scalars["String"]["output"];
};

export enum PersonRelationshipType {
  CollaboratesWith = "COLLABORATES_WITH",
  CompetesWith = "COMPETES_WITH",
  Influences = "INFLUENCES",
  Manages = "MANAGES",
  Mentors = "MENTORS",
  PartnersWith = "PARTNERS_WITH",
  RefersTo = "REFERS_TO",
  ReportsTo = "REPORTS_TO",
}

export type PersonUpdateInput = {
  customFields?: InputMaybe<Array<CustomFieldValueInput>>;
  email?: InputMaybe<Scalars["String"]["input"]>;
  first_name?: InputMaybe<Scalars["String"]["input"]>;
  last_name?: InputMaybe<Scalars["String"]["input"]>;
  notes?: InputMaybe<Scalars["String"]["input"]>;
  organization_id?: InputMaybe<Scalars["ID"]["input"]>;
  phone?: InputMaybe<Scalars["String"]["input"]>;
};

export enum PriorityLevel {
  Critical = "CRITICAL",
  High = "HIGH",
  Low = "LOW",
  Medium = "MEDIUM",
}

export type Query = {
  __typename?: "Query";
  accountTerritories: Array<AccountTerritory>;
  activities: Array<Activity>;
  activity?: Maybe<Activity>;
  activityReminders: Array<ActivityReminder>;
  agentConversation?: Maybe<AgentConversation>;
  agentConversations: Array<AgentConversation>;
  agentThoughts: Array<AgentThought>;
  analyzeStakeholderNetwork: StakeholderNetworkAnalysis;
  /** Get a specific app setting by key */
  appSetting?: Maybe<AppSetting>;
  /** Get all app settings (admin only for private settings) */
  appSettings: Array<AppSetting>;
  customFieldDefinition?: Maybe<CustomFieldDefinition>;
  customFieldDefinitions: Array<CustomFieldDefinition>;
  deal?: Maybe<Deal>;
  /** Get files in the deal folder or specific subfolder */
  dealFolderFiles: Array<DriveFile>;
  /** Get deal folder information, auto-creating if needed */
  dealFolderInfo: DealFolderInfo;
  deals: Array<Deal>;
  discoverAgentTools: ToolDiscoveryResponse;
  findMissingStakeholders: MissingStakeholderRecommendations;
  getDealDocumentAttachments: Array<DealDocumentAttachment>;
  getDealDocuments: Array<DealDocumentAttachment>;
  getDealFolder?: Maybe<DriveFolder>;
  getDriveFile: DriveFile;
  getDriveFiles: DriveFileConnection;
  getDriveFolders: DriveFolderConnection;
  getEmailAnalytics?: Maybe<EmailAnalytics>;
  getEmailMessage?: Maybe<EmailMessage>;
  getEmailThread?: Maybe<EmailThread>;
  getEmailThreads: EmailThreadConnection;
  getEntityDocuments: Array<Document>;
  getEntityEmails: Array<Email>;
  getEntityStickers: StickerConnection;
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
  health: Scalars["String"]["output"];
  lead?: Maybe<Lead>;
  leads: Array<Lead>;
  leadsStats: LeadsStats;
  me?: Maybe<User>;
  myNotifications: NotificationSummary;
  myPermissions?: Maybe<Array<Scalars["String"]["output"]>>;
  myReminderPreferences?: Maybe<UserReminderPreferences>;
  notification?: Maybe<Notification>;
  organization?: Maybe<Organization>;
  organizationPersonRelationships: Array<PersonRelationship>;
  organizationRelationships: Array<OrganizationRelationship>;
  organizationRoles: Array<PersonOrganizationalRole>;
  organizations: Array<Organization>;
  people: Array<Person>;
  person?: Maybe<Person>;
  personList: Array<PersonListItem>;
  personOrganizationalRoles: Array<PersonOrganizationalRole>;
  personRelationships: Array<PersonRelationship>;
  relationshipInsight?: Maybe<RelationshipInsight>;
  relationshipInsights: Array<RelationshipInsight>;
  roles: Array<Role>;
  searchDriveFiles: DriveFileConnection;
  searchEmails: Array<Email>;
  searchSharedDriveFiles: Array<DriveFile>;
  searchStickers: StickerConnection;
  stakeholderAnalyses: Array<StakeholderAnalysis>;
  stakeholderAnalysis?: Maybe<StakeholderAnalysis>;
  supabaseConnectionTest: Scalars["String"]["output"];
  territories: Array<Territory>;
  territory?: Maybe<Territory>;
  unreadNotificationCount: Scalars["Int"]["output"];
  users: Array<User>;
  wfmProjectType?: Maybe<WfmProjectType>;
  wfmProjectTypeByName?: Maybe<WfmProjectType>;
  wfmProjectTypes: Array<WfmProjectType>;
  wfmStatus?: Maybe<WfmStatus>;
  wfmStatuses: Array<WfmStatus>;
  wfmWorkflow?: Maybe<WfmWorkflow>;
  wfmWorkflows: Array<WfmWorkflow>;
};

export type QueryAccountTerritoriesArgs = {
  organizationId: Scalars["ID"]["input"];
};

export type QueryActivitiesArgs = {
  filter?: InputMaybe<ActivityFilterInput>;
};

export type QueryActivityArgs = {
  id: Scalars["ID"]["input"];
};

export type QueryActivityRemindersArgs = {
  activityId?: InputMaybe<Scalars["ID"]["input"]>;
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

export type QueryAnalyzeStakeholderNetworkArgs = {
  dealId?: InputMaybe<Scalars["ID"]["input"]>;
  includeInactiveRoles?: InputMaybe<Scalars["Boolean"]["input"]>;
  leadId?: InputMaybe<Scalars["ID"]["input"]>;
  organizationId: Scalars["ID"]["input"];
};

export type QueryAppSettingArgs = {
  settingKey: Scalars["String"]["input"];
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

export type QueryDealFolderFilesArgs = {
  dealId: Scalars["ID"]["input"];
  folderId?: InputMaybe<Scalars["ID"]["input"]>;
};

export type QueryDealFolderInfoArgs = {
  dealId: Scalars["ID"]["input"];
};

export type QueryFindMissingStakeholdersArgs = {
  dealId?: InputMaybe<Scalars["ID"]["input"]>;
  dealSize?: InputMaybe<Scalars["String"]["input"]>;
  industryType?: InputMaybe<Scalars["String"]["input"]>;
  leadId?: InputMaybe<Scalars["ID"]["input"]>;
  organizationId: Scalars["ID"]["input"];
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

export type QueryMyNotificationsArgs = {
  filter?: InputMaybe<NotificationFilterInput>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
};

export type QueryNotificationArgs = {
  id: Scalars["ID"]["input"];
};

export type QueryOrganizationArgs = {
  id: Scalars["ID"]["input"];
};

export type QueryOrganizationPersonRelationshipsArgs = {
  organizationId: Scalars["ID"]["input"];
};

export type QueryOrganizationRelationshipsArgs = {
  organizationId: Scalars["ID"]["input"];
};

export type QueryOrganizationRolesArgs = {
  includeInactive?: InputMaybe<Scalars["Boolean"]["input"]>;
  organizationId: Scalars["ID"]["input"];
};

export type QueryPersonArgs = {
  id: Scalars["ID"]["input"];
};

export type QueryPersonOrganizationalRolesArgs = {
  personId?: InputMaybe<Scalars["ID"]["input"]>;
};

export type QueryPersonRelationshipsArgs = {
  personId: Scalars["ID"]["input"];
};

export type QueryRelationshipInsightArgs = {
  id: Scalars["ID"]["input"];
};

export type QueryRelationshipInsightsArgs = {
  entityId?: InputMaybe<Scalars["ID"]["input"]>;
  entityType?: InputMaybe<EntityType>;
  status?: InputMaybe<InsightStatus>;
};

export type QuerySearchDriveFilesArgs = {
  query: Scalars["String"]["input"];
};

export type QuerySearchEmailsArgs = {
  entityType?: InputMaybe<EntityType>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
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

export type QueryStakeholderAnalysesArgs = {
  dealId?: InputMaybe<Scalars["ID"]["input"]>;
  leadId?: InputMaybe<Scalars["ID"]["input"]>;
  organizationId?: InputMaybe<Scalars["ID"]["input"]>;
};

export type QueryStakeholderAnalysisArgs = {
  id: Scalars["ID"]["input"];
};

export type QueryTerritoriesArgs = {
  assignedToUser?: InputMaybe<Scalars["ID"]["input"]>;
};

export type QueryTerritoryArgs = {
  id: Scalars["ID"]["input"];
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

export type RelationshipInsight = {
  __typename?: "RelationshipInsight";
  aiReasoning?: Maybe<Scalars["String"]["output"]>;
  confidenceScore?: Maybe<Scalars["Float"]["output"]>;
  createdAt: Scalars["String"]["output"];
  entityId: Scalars["ID"]["output"];
  entityType: EntityType;
  expiresAt?: Maybe<Scalars["String"]["output"]>;
  id: Scalars["ID"]["output"];
  insightDescription: Scalars["String"]["output"];
  insightTitle: Scalars["String"]["output"];
  insightType: InsightType;
  priorityLevel?: Maybe<PriorityLevel>;
  recommendedActions?: Maybe<Scalars["JSON"]["output"]>;
  reviewedAt?: Maybe<Scalars["String"]["output"]>;
  reviewedBy?: Maybe<User>;
  status: InsightStatus;
  supportingData?: Maybe<Scalars["JSON"]["output"]>;
  updatedAt: Scalars["String"]["output"];
};

/** Activity Reminders and Notifications GraphQL Schema */
export enum ReminderType {
  Email = "EMAIL",
  InApp = "IN_APP",
  Push = "PUSH",
}

export type Role = {
  __typename?: "Role";
  description: Scalars["String"]["output"];
  id: Scalars["ID"]["output"];
  name: Scalars["String"]["output"];
};

export type SendMessageInput = {
  config?: InputMaybe<AgentConfigInput>;
  content: Scalars["String"]["input"];
  conversationId?: InputMaybe<Scalars["ID"]["input"]>;
};

export enum SeniorityLevel {
  CLevel = "C_LEVEL",
  Director = "DIRECTOR",
  Entry = "ENTRY",
  Founder = "FOUNDER",
  Lead = "LEAD",
  Manager = "MANAGER",
  Mid = "MID",
  Senior = "SENIOR",
  Vp = "VP",
}

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

export type StakeholderAnalysis = {
  __typename?: "StakeholderAnalysis";
  aiCommunicationStyle?: Maybe<Scalars["String"]["output"]>;
  aiDecisionPattern?: Maybe<Scalars["String"]["output"]>;
  aiInfluenceNetwork?: Maybe<Scalars["JSON"]["output"]>;
  aiPersonalityProfile?: Maybe<Scalars["JSON"]["output"]>;
  approachStrategy?: Maybe<Scalars["String"]["output"]>;
  budgetAuthorityLevel?: Maybe<BudgetAuthorityLevel>;
  communicationPreference?: Maybe<CommunicationPreference>;
  concerns?: Maybe<Scalars["JSON"]["output"]>;
  createdAt: Scalars["String"]["output"];
  createdByUser?: Maybe<User>;
  deal?: Maybe<Deal>;
  decisionAuthority?: Maybe<DecisionAuthority>;
  engagementLevel?: Maybe<EngagementLevel>;
  id: Scalars["ID"]["output"];
  influenceScore?: Maybe<Scalars["Int"]["output"]>;
  lastInteractionDate?: Maybe<Scalars["String"]["output"]>;
  lastInteractionType?: Maybe<Scalars["String"]["output"]>;
  lead?: Maybe<Lead>;
  motivations?: Maybe<Scalars["JSON"]["output"]>;
  nextBestAction?: Maybe<Scalars["String"]["output"]>;
  organization: Organization;
  painPoints?: Maybe<Scalars["JSON"]["output"]>;
  person: Person;
  preferredMeetingTime?: Maybe<Scalars["String"]["output"]>;
  successMetrics?: Maybe<Scalars["JSON"]["output"]>;
  updatedAt: Scalars["String"]["output"];
};

export type StakeholderNetworkAnalysis = {
  __typename?: "StakeholderNetworkAnalysis";
  coverageAnalysis: Scalars["JSON"]["output"];
  influenceMap: Scalars["JSON"]["output"];
  networkInsights: Scalars["JSON"]["output"];
  organization: Organization;
  relationshipCount: Scalars["Int"]["output"];
  relationships: Array<PersonRelationship>;
  roleCount: Scalars["Int"]["output"];
  roles: Array<PersonOrganizationalRole>;
  stakeholderCount: Scalars["Int"]["output"];
  stakeholders: Array<StakeholderAnalysis>;
};

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
  notificationAdded: Notification;
  notificationUpdated: Notification;
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

export type SubscriptionNotificationAddedArgs = {
  userId: Scalars["ID"]["input"];
};

export type SubscriptionNotificationUpdatedArgs = {
  userId: Scalars["ID"]["input"];
};

export type Territory = {
  __typename?: "Territory";
  accountSizeRange?: Maybe<Scalars["String"]["output"]>;
  assignedUser?: Maybe<User>;
  childTerritories: Array<Territory>;
  city?: Maybe<Scalars["String"]["output"]>;
  country?: Maybe<Scalars["String"]["output"]>;
  createdAt: Scalars["String"]["output"];
  id: Scalars["ID"]["output"];
  industryFocus?: Maybe<Array<Scalars["String"]["output"]>>;
  isActive: Scalars["Boolean"]["output"];
  metadata?: Maybe<Scalars["JSON"]["output"]>;
  name: Scalars["String"]["output"];
  organizations: Array<Organization>;
  parentTerritory?: Maybe<Territory>;
  region?: Maybe<Scalars["String"]["output"]>;
  stateProvince?: Maybe<Scalars["String"]["output"]>;
  territoryType: TerritoryType;
  updatedAt: Scalars["String"]["output"];
};

export enum TerritoryType {
  AccountSize = "ACCOUNT_SIZE",
  Geographic = "GEOGRAPHIC",
  Hybrid = "HYBRID",
  Industry = "INDUSTRY",
  ProductLine = "PRODUCT_LINE",
}

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

export type UpdateActivityInput = {
  assigned_to_user_id?: InputMaybe<Scalars["ID"]["input"]>;
  deal_id?: InputMaybe<Scalars["ID"]["input"]>;
  due_date?: InputMaybe<Scalars["DateTime"]["input"]>;
  is_done?: InputMaybe<Scalars["Boolean"]["input"]>;
  notes?: InputMaybe<Scalars["String"]["input"]>;
  organization_id?: InputMaybe<Scalars["ID"]["input"]>;
  person_id?: InputMaybe<Scalars["ID"]["input"]>;
  subject?: InputMaybe<Scalars["String"]["input"]>;
  type?: InputMaybe<ActivityType>;
};

export type UpdateAppSettingInput = {
  settingKey: Scalars["String"]["input"];
  settingValue: Scalars["JSON"]["input"];
};

export type UpdateConversationInput = {
  context?: InputMaybe<Scalars["JSON"]["input"]>;
  conversationId: Scalars["ID"]["input"];
  plan?: InputMaybe<Scalars["JSON"]["input"]>;
};

export type UpdateRelationshipInsightInput = {
  reviewedAt?: InputMaybe<Scalars["String"]["input"]>;
  status: InsightStatus;
};

export type UpdateStakeholderAnalysisInput = {
  aiCommunicationStyle?: InputMaybe<Scalars["String"]["input"]>;
  aiDecisionPattern?: InputMaybe<Scalars["String"]["input"]>;
  aiInfluenceNetwork?: InputMaybe<Scalars["JSON"]["input"]>;
  aiPersonalityProfile?: InputMaybe<Scalars["JSON"]["input"]>;
  approachStrategy?: InputMaybe<Scalars["String"]["input"]>;
  budgetAuthorityLevel?: InputMaybe<BudgetAuthorityLevel>;
  communicationPreference?: InputMaybe<CommunicationPreference>;
  concerns?: InputMaybe<Scalars["JSON"]["input"]>;
  decisionAuthority?: InputMaybe<DecisionAuthority>;
  engagementLevel?: InputMaybe<EngagementLevel>;
  influenceScore?: InputMaybe<Scalars["Int"]["input"]>;
  lastInteractionDate?: InputMaybe<Scalars["String"]["input"]>;
  lastInteractionType?: InputMaybe<Scalars["String"]["input"]>;
  motivations?: InputMaybe<Scalars["JSON"]["input"]>;
  nextBestAction?: InputMaybe<Scalars["String"]["input"]>;
  painPoints?: InputMaybe<Scalars["JSON"]["input"]>;
  preferredMeetingTime?: InputMaybe<Scalars["String"]["input"]>;
  successMetrics?: InputMaybe<Scalars["JSON"]["input"]>;
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

export type UpdateUserReminderPreferencesInput = {
  emailDailyDigestEnabled?: InputMaybe<Scalars["Boolean"]["input"]>;
  emailDailyDigestTime?: InputMaybe<Scalars["String"]["input"]>;
  emailReminderMinutesBefore?: InputMaybe<Scalars["Int"]["input"]>;
  emailRemindersEnabled?: InputMaybe<Scalars["Boolean"]["input"]>;
  inAppReminderMinutesBefore?: InputMaybe<Scalars["Int"]["input"]>;
  inAppRemindersEnabled?: InputMaybe<Scalars["Boolean"]["input"]>;
  overdueNotificationFrequencyHours?: InputMaybe<Scalars["Int"]["input"]>;
  overdueNotificationsEnabled?: InputMaybe<Scalars["Boolean"]["input"]>;
  pushReminderMinutesBefore?: InputMaybe<Scalars["Int"]["input"]>;
  pushRemindersEnabled?: InputMaybe<Scalars["Boolean"]["input"]>;
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

export type UserReminderPreferences = {
  __typename?: "UserReminderPreferences";
  createdAt: Scalars["DateTime"]["output"];
  emailDailyDigestEnabled: Scalars["Boolean"]["output"];
  emailDailyDigestTime: Scalars["String"]["output"];
  emailReminderMinutesBefore: Scalars["Int"]["output"];
  emailRemindersEnabled: Scalars["Boolean"]["output"];
  id: Scalars["ID"]["output"];
  inAppReminderMinutesBefore: Scalars["Int"]["output"];
  inAppRemindersEnabled: Scalars["Boolean"]["output"];
  overdueNotificationFrequencyHours: Scalars["Int"]["output"];
  overdueNotificationsEnabled: Scalars["Boolean"]["output"];
  pushReminderMinutesBefore: Scalars["Int"]["output"];
  pushRemindersEnabled: Scalars["Boolean"]["output"];
  updatedAt: Scalars["DateTime"]["output"];
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
  AccountTerritory: ResolverTypeWrapper<AccountTerritory>;
  Activity: ResolverTypeWrapper<Activity>;
  ActivityFilterInput: ActivityFilterInput;
  ActivityReminder: ResolverTypeWrapper<ActivityReminder>;
  ActivityType: ActivityType;
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
  AppSetting: ResolverTypeWrapper<AppSetting>;
  AttachDocumentInput: AttachDocumentInput;
  AttachFileInput: AttachFileInput;
  Boolean: ResolverTypeWrapper<Scalars["Boolean"]["output"]>;
  BudgetAuthorityLevel: BudgetAuthorityLevel;
  CommunicationPreference: CommunicationPreference;
  ComposeEmailInput: ComposeEmailInput;
  ConnectGoogleIntegrationInput: ConnectGoogleIntegrationInput;
  ConvertedEntities: ResolverTypeWrapper<ConvertedEntities>;
  CreateActivityInput: CreateActivityInput;
  CreateDealFolderInput: CreateDealFolderInput;
  CreateDocumentInput: CreateDocumentInput;
  CreateEmailInput: CreateEmailInput;
  CreateNotificationInput: CreateNotificationInput;
  CreateOrganizationRelationshipInput: CreateOrganizationRelationshipInput;
  CreatePersonOrganizationalRoleInput: CreatePersonOrganizationalRoleInput;
  CreatePersonRelationshipInput: CreatePersonRelationshipInput;
  CreateStakeholderAnalysisInput: CreateStakeholderAnalysisInput;
  CreateStickerInput: CreateStickerInput;
  CreateTaskFromEmailInput: CreateTaskFromEmailInput;
  CreateTerritoryInput: CreateTerritoryInput;
  CreateWFMProjectTypeInput: CreateWfmProjectTypeInput;
  CreateWFMStatusInput: CreateWfmStatusInput;
  CreateWFMWorkflowInput: CreateWfmWorkflowInput;
  CreateWFMWorkflowStepInput: CreateWfmWorkflowStepInput;
  CreateWFMWorkflowTransitionInput: CreateWfmWorkflowTransitionInput;
  CustomFieldDefinition: ResolverTypeWrapper<CustomFieldDefinition>;
  CustomFieldDefinitionInput: CustomFieldDefinitionInput;
  CustomFieldEntityType: CustomFieldEntityType;
  CustomFieldOption: ResolverTypeWrapper<CustomFieldOption>;
  CustomFieldOptionInput: CustomFieldOptionInput;
  CustomFieldType: CustomFieldType;
  CustomFieldValue: ResolverTypeWrapper<CustomFieldValue>;
  CustomFieldValueInput: CustomFieldValueInput;
  DateTime: ResolverTypeWrapper<Scalars["DateTime"]["output"]>;
  Deal: ResolverTypeWrapper<Deal>;
  DealDocumentAttachment: ResolverTypeWrapper<DealDocumentAttachment>;
  DealFolderInfo: ResolverTypeWrapper<DealFolderInfo>;
  DealHistoryEntry: ResolverTypeWrapper<DealHistoryEntry>;
  DealInput: DealInput;
  DealSubfolders: ResolverTypeWrapper<DealSubfolders>;
  DealUpdateInput: DealUpdateInput;
  DecisionAuthority: DecisionAuthority;
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
  Email: ResolverTypeWrapper<Email>;
  EmailActivity: ResolverTypeWrapper<EmailActivity>;
  EmailActivityType: EmailActivityType;
  EmailAnalytics: ResolverTypeWrapper<EmailAnalytics>;
  EmailAttachment: ResolverTypeWrapper<EmailAttachment>;
  EmailAttachmentInput: EmailAttachmentInput;
  EmailImportance: EmailImportance;
  EmailMessage: ResolverTypeWrapper<EmailMessage>;
  EmailThread: ResolverTypeWrapper<EmailThread>;
  EmailThreadConnection: ResolverTypeWrapper<EmailThreadConnection>;
  EmailThreadsFilterInput: EmailThreadsFilterInput;
  EngagementLevel: EngagementLevel;
  EntityType: EntityType;
  Float: ResolverTypeWrapper<Scalars["Float"]["output"]>;
  GoogleDriveConfig: ResolverTypeWrapper<GoogleDriveConfig>;
  GoogleIntegrationStatus: ResolverTypeWrapper<GoogleIntegrationStatus>;
  GoogleTokenData: ResolverTypeWrapper<GoogleTokenData>;
  GoogleTokenInput: GoogleTokenInput;
  ID: ResolverTypeWrapper<Scalars["ID"]["output"]>;
  InsightStatus: InsightStatus;
  InsightType: InsightType;
  Int: ResolverTypeWrapper<Scalars["Int"]["output"]>;
  InteractionFrequency: InteractionFrequency;
  JSON: ResolverTypeWrapper<Scalars["JSON"]["output"]>;
  Lead: ResolverTypeWrapper<Lead>;
  LeadConversionInput: LeadConversionInput;
  LeadConversionResult: ResolverTypeWrapper<LeadConversionResult>;
  LeadConversionTargetType: LeadConversionTargetType;
  LeadFilters: LeadFilters;
  LeadHistoryEntry: ResolverTypeWrapper<LeadHistoryEntry>;
  LeadInput: LeadInput;
  LeadUpdateInput: LeadUpdateInput;
  LeadsStats: ResolverTypeWrapper<LeadsStats>;
  MissingStakeholderRecommendations: ResolverTypeWrapper<MissingStakeholderRecommendations>;
  Mutation: ResolverTypeWrapper<{}>;
  Notification: ResolverTypeWrapper<Notification>;
  NotificationFilterInput: NotificationFilterInput;
  NotificationPriority: NotificationPriority;
  NotificationSummary: ResolverTypeWrapper<NotificationSummary>;
  NotificationType: NotificationType;
  Organization: ResolverTypeWrapper<Organization>;
  OrganizationInput: OrganizationInput;
  OrganizationRelationship: ResolverTypeWrapper<OrganizationRelationship>;
  OrganizationRelationshipType: OrganizationRelationshipType;
  OrganizationUpdateInput: OrganizationUpdateInput;
  Person: ResolverTypeWrapper<Person>;
  PersonInput: PersonInput;
  PersonListItem: ResolverTypeWrapper<PersonListItem>;
  PersonOrganizationalRole: ResolverTypeWrapper<PersonOrganizationalRole>;
  PersonRelationship: ResolverTypeWrapper<PersonRelationship>;
  PersonRelationshipType: PersonRelationshipType;
  PersonUpdateInput: PersonUpdateInput;
  PriorityLevel: PriorityLevel;
  Query: ResolverTypeWrapper<{}>;
  RelationshipInsight: ResolverTypeWrapper<RelationshipInsight>;
  ReminderType: ReminderType;
  Role: ResolverTypeWrapper<Role>;
  SendMessageInput: SendMessageInput;
  SeniorityLevel: SeniorityLevel;
  SharedDrive: ResolverTypeWrapper<SharedDrive>;
  SharedDriveCapabilities: ResolverTypeWrapper<SharedDriveCapabilities>;
  SharedDriveImage: ResolverTypeWrapper<SharedDriveImage>;
  SharedDriveRestrictions: ResolverTypeWrapper<SharedDriveRestrictions>;
  SmartSticker: ResolverTypeWrapper<SmartSticker>;
  SortDirection: SortDirection;
  StageType: StageType;
  StakeholderAnalysis: ResolverTypeWrapper<StakeholderAnalysis>;
  StakeholderNetworkAnalysis: ResolverTypeWrapper<StakeholderNetworkAnalysis>;
  StickerCategory: ResolverTypeWrapper<StickerCategory>;
  StickerConnection: ResolverTypeWrapper<StickerConnection>;
  StickerFilters: StickerFilters;
  StickerMoveInput: StickerMoveInput;
  StickerPriority: StickerPriority;
  StickerSortBy: StickerSortBy;
  StickerSortField: StickerSortField;
  String: ResolverTypeWrapper<Scalars["String"]["output"]>;
  Subscription: ResolverTypeWrapper<{}>;
  Territory: ResolverTypeWrapper<Territory>;
  TerritoryType: TerritoryType;
  ThinkingBudget: ThinkingBudget;
  ToolDiscoveryResponse: ResolverTypeWrapper<ToolDiscoveryResponse>;
  UpdateActivityInput: UpdateActivityInput;
  UpdateAppSettingInput: UpdateAppSettingInput;
  UpdateConversationInput: UpdateConversationInput;
  UpdateRelationshipInsightInput: UpdateRelationshipInsightInput;
  UpdateStakeholderAnalysisInput: UpdateStakeholderAnalysisInput;
  UpdateStickerInput: UpdateStickerInput;
  UpdateUserProfileInput: UpdateUserProfileInput;
  UpdateUserReminderPreferencesInput: UpdateUserReminderPreferencesInput;
  UpdateWFMProjectTypeInput: UpdateWfmProjectTypeInput;
  UpdateWFMStatusInput: UpdateWfmStatusInput;
  UpdateWFMWorkflowInput: UpdateWfmWorkflowInput;
  UpdateWFMWorkflowStepInput: UpdateWfmWorkflowStepInput;
  UpdateWfmWorkflowTransitionInput: UpdateWfmWorkflowTransitionInput;
  UploadFileInput: UploadFileInput;
  User: ResolverTypeWrapper<User>;
  UserReminderPreferences: ResolverTypeWrapper<UserReminderPreferences>;
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
  AccountTerritory: AccountTerritory;
  Activity: Activity;
  ActivityFilterInput: ActivityFilterInput;
  ActivityReminder: ActivityReminder;
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
  AppSetting: AppSetting;
  AttachDocumentInput: AttachDocumentInput;
  AttachFileInput: AttachFileInput;
  Boolean: Scalars["Boolean"]["output"];
  ComposeEmailInput: ComposeEmailInput;
  ConnectGoogleIntegrationInput: ConnectGoogleIntegrationInput;
  ConvertedEntities: ConvertedEntities;
  CreateActivityInput: CreateActivityInput;
  CreateDealFolderInput: CreateDealFolderInput;
  CreateDocumentInput: CreateDocumentInput;
  CreateEmailInput: CreateEmailInput;
  CreateNotificationInput: CreateNotificationInput;
  CreateOrganizationRelationshipInput: CreateOrganizationRelationshipInput;
  CreatePersonOrganizationalRoleInput: CreatePersonOrganizationalRoleInput;
  CreatePersonRelationshipInput: CreatePersonRelationshipInput;
  CreateStakeholderAnalysisInput: CreateStakeholderAnalysisInput;
  CreateStickerInput: CreateStickerInput;
  CreateTaskFromEmailInput: CreateTaskFromEmailInput;
  CreateTerritoryInput: CreateTerritoryInput;
  CreateWFMProjectTypeInput: CreateWfmProjectTypeInput;
  CreateWFMStatusInput: CreateWfmStatusInput;
  CreateWFMWorkflowInput: CreateWfmWorkflowInput;
  CreateWFMWorkflowStepInput: CreateWfmWorkflowStepInput;
  CreateWFMWorkflowTransitionInput: CreateWfmWorkflowTransitionInput;
  CustomFieldDefinition: CustomFieldDefinition;
  CustomFieldDefinitionInput: CustomFieldDefinitionInput;
  CustomFieldOption: CustomFieldOption;
  CustomFieldOptionInput: CustomFieldOptionInput;
  CustomFieldValue: CustomFieldValue;
  CustomFieldValueInput: CustomFieldValueInput;
  DateTime: Scalars["DateTime"]["output"];
  Deal: Deal;
  DealDocumentAttachment: DealDocumentAttachment;
  DealFolderInfo: DealFolderInfo;
  DealHistoryEntry: DealHistoryEntry;
  DealInput: DealInput;
  DealSubfolders: DealSubfolders;
  DealUpdateInput: DealUpdateInput;
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
  Email: Email;
  EmailActivity: EmailActivity;
  EmailAnalytics: EmailAnalytics;
  EmailAttachment: EmailAttachment;
  EmailAttachmentInput: EmailAttachmentInput;
  EmailMessage: EmailMessage;
  EmailThread: EmailThread;
  EmailThreadConnection: EmailThreadConnection;
  EmailThreadsFilterInput: EmailThreadsFilterInput;
  Float: Scalars["Float"]["output"];
  GoogleDriveConfig: GoogleDriveConfig;
  GoogleIntegrationStatus: GoogleIntegrationStatus;
  GoogleTokenData: GoogleTokenData;
  GoogleTokenInput: GoogleTokenInput;
  ID: Scalars["ID"]["output"];
  Int: Scalars["Int"]["output"];
  JSON: Scalars["JSON"]["output"];
  Lead: Lead;
  LeadConversionInput: LeadConversionInput;
  LeadConversionResult: LeadConversionResult;
  LeadFilters: LeadFilters;
  LeadHistoryEntry: LeadHistoryEntry;
  LeadInput: LeadInput;
  LeadUpdateInput: LeadUpdateInput;
  LeadsStats: LeadsStats;
  MissingStakeholderRecommendations: MissingStakeholderRecommendations;
  Mutation: {};
  Notification: Notification;
  NotificationFilterInput: NotificationFilterInput;
  NotificationSummary: NotificationSummary;
  Organization: Organization;
  OrganizationInput: OrganizationInput;
  OrganizationRelationship: OrganizationRelationship;
  OrganizationUpdateInput: OrganizationUpdateInput;
  Person: Person;
  PersonInput: PersonInput;
  PersonListItem: PersonListItem;
  PersonOrganizationalRole: PersonOrganizationalRole;
  PersonRelationship: PersonRelationship;
  PersonUpdateInput: PersonUpdateInput;
  Query: {};
  RelationshipInsight: RelationshipInsight;
  Role: Role;
  SendMessageInput: SendMessageInput;
  SharedDrive: SharedDrive;
  SharedDriveCapabilities: SharedDriveCapabilities;
  SharedDriveImage: SharedDriveImage;
  SharedDriveRestrictions: SharedDriveRestrictions;
  SmartSticker: SmartSticker;
  StakeholderAnalysis: StakeholderAnalysis;
  StakeholderNetworkAnalysis: StakeholderNetworkAnalysis;
  StickerCategory: StickerCategory;
  StickerConnection: StickerConnection;
  StickerFilters: StickerFilters;
  StickerMoveInput: StickerMoveInput;
  StickerSortBy: StickerSortBy;
  String: Scalars["String"]["output"];
  Subscription: {};
  Territory: Territory;
  ToolDiscoveryResponse: ToolDiscoveryResponse;
  UpdateActivityInput: UpdateActivityInput;
  UpdateAppSettingInput: UpdateAppSettingInput;
  UpdateConversationInput: UpdateConversationInput;
  UpdateRelationshipInsightInput: UpdateRelationshipInsightInput;
  UpdateStakeholderAnalysisInput: UpdateStakeholderAnalysisInput;
  UpdateStickerInput: UpdateStickerInput;
  UpdateUserProfileInput: UpdateUserProfileInput;
  UpdateUserReminderPreferencesInput: UpdateUserReminderPreferencesInput;
  UpdateWFMProjectTypeInput: UpdateWfmProjectTypeInput;
  UpdateWFMStatusInput: UpdateWfmStatusInput;
  UpdateWFMWorkflowInput: UpdateWfmWorkflowInput;
  UpdateWFMWorkflowStepInput: UpdateWfmWorkflowStepInput;
  UpdateWfmWorkflowTransitionInput: UpdateWfmWorkflowTransitionInput;
  UploadFileInput: UploadFileInput;
  User: User;
  UserReminderPreferences: UserReminderPreferences;
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

export type AccountTerritoryResolvers<
  ContextType = GraphQLContext,
  ParentType extends
    ResolversParentTypes["AccountTerritory"] = ResolversParentTypes["AccountTerritory"],
> = {
  assignmentReason?: Resolver<
    Maybe<ResolversTypes["String"]>,
    ParentType,
    ContextType
  >;
  createdAt?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  isPrimary?: Resolver<ResolversTypes["Boolean"], ParentType, ContextType>;
  organization?: Resolver<
    ResolversTypes["Organization"],
    ParentType,
    ContextType
  >;
  territory?: Resolver<ResolversTypes["Territory"], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ActivityResolvers<
  ContextType = GraphQLContext,
  ParentType extends
    ResolversParentTypes["Activity"] = ResolversParentTypes["Activity"],
> = {
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
  created_at?: Resolver<ResolversTypes["DateTime"], ParentType, ContextType>;
  deal?: Resolver<Maybe<ResolversTypes["Deal"]>, ParentType, ContextType>;
  deal_id?: Resolver<Maybe<ResolversTypes["ID"]>, ParentType, ContextType>;
  due_date?: Resolver<
    Maybe<ResolversTypes["DateTime"]>,
    ParentType,
    ContextType
  >;
  id?: Resolver<ResolversTypes["ID"], ParentType, ContextType>;
  is_done?: Resolver<ResolversTypes["Boolean"], ParentType, ContextType>;
  is_system_activity?: Resolver<
    ResolversTypes["Boolean"],
    ParentType,
    ContextType
  >;
  lead?: Resolver<Maybe<ResolversTypes["Lead"]>, ParentType, ContextType>;
  lead_id?: Resolver<Maybe<ResolversTypes["ID"]>, ParentType, ContextType>;
  notes?: Resolver<Maybe<ResolversTypes["String"]>, ParentType, ContextType>;
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
  person?: Resolver<Maybe<ResolversTypes["Person"]>, ParentType, ContextType>;
  person_id?: Resolver<Maybe<ResolversTypes["ID"]>, ParentType, ContextType>;
  subject?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  type?: Resolver<ResolversTypes["ActivityType"], ParentType, ContextType>;
  updated_at?: Resolver<ResolversTypes["DateTime"], ParentType, ContextType>;
  user?: Resolver<Maybe<ResolversTypes["User"]>, ParentType, ContextType>;
  user_id?: Resolver<ResolversTypes["ID"], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ActivityReminderResolvers<
  ContextType = GraphQLContext,
  ParentType extends
    ResolversParentTypes["ActivityReminder"] = ResolversParentTypes["ActivityReminder"],
> = {
  activity?: Resolver<
    Maybe<ResolversTypes["Activity"]>,
    ParentType,
    ContextType
  >;
  activityId?: Resolver<ResolversTypes["ID"], ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes["DateTime"], ParentType, ContextType>;
  failedAttempts?: Resolver<ResolversTypes["Int"], ParentType, ContextType>;
  id?: Resolver<ResolversTypes["ID"], ParentType, ContextType>;
  isSent?: Resolver<ResolversTypes["Boolean"], ParentType, ContextType>;
  lastError?: Resolver<
    Maybe<ResolversTypes["String"]>,
    ParentType,
    ContextType
  >;
  reminderContent?: Resolver<
    Maybe<ResolversTypes["JSON"]>,
    ParentType,
    ContextType
  >;
  reminderType?: Resolver<
    ResolversTypes["ReminderType"],
    ParentType,
    ContextType
  >;
  scheduledFor?: Resolver<ResolversTypes["DateTime"], ParentType, ContextType>;
  sentAt?: Resolver<Maybe<ResolversTypes["DateTime"]>, ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes["DateTime"], ParentType, ContextType>;
  user?: Resolver<Maybe<ResolversTypes["User"]>, ParentType, ContextType>;
  userId?: Resolver<ResolversTypes["ID"], ParentType, ContextType>;
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
  content?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  conversationId?: Resolver<ResolversTypes["ID"], ParentType, ContextType>;
  id?: Resolver<ResolversTypes["ID"], ParentType, ContextType>;
  metadata?: Resolver<ResolversTypes["JSON"], ParentType, ContextType>;
  timestamp?: Resolver<ResolversTypes["DateTime"], ParentType, ContextType>;
  type?: Resolver<ResolversTypes["AgentThoughtType"], ParentType, ContextType>;
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

export interface DateTimeScalarConfig
  extends GraphQLScalarTypeConfig<ResolversTypes["DateTime"], any> {
  name: "DateTime";
}

export type DealResolvers<
  ContextType = GraphQLContext,
  ParentType extends
    ResolversParentTypes["Deal"] = ResolversParentTypes["Deal"],
> = {
  activities?: Resolver<
    Array<ResolversTypes["Activity"]>,
    ParentType,
    ContextType
  >;
  amount?: Resolver<Maybe<ResolversTypes["Float"]>, ParentType, ContextType>;
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
  createdBy?: Resolver<ResolversTypes["User"], ParentType, ContextType>;
  created_at?: Resolver<ResolversTypes["DateTime"], ParentType, ContextType>;
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
  expected_close_date?: Resolver<
    Maybe<ResolversTypes["DateTime"]>,
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
  activities?: Resolver<
    Array<ResolversTypes["Activity"]>,
    ParentType,
    ContextType
  >;
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

export type MissingStakeholderRecommendationsResolvers<
  ContextType = GraphQLContext,
  ParentType extends
    ResolversParentTypes["MissingStakeholderRecommendations"] = ResolversParentTypes["MissingStakeholderRecommendations"],
> = {
  coveragePercentage?: Resolver<
    ResolversTypes["Float"],
    ParentType,
    ContextType
  >;
  currentCoverage?: Resolver<ResolversTypes["Int"], ParentType, ContextType>;
  missingRoles?: Resolver<ResolversTypes["JSON"], ParentType, ContextType>;
  priorityAdditions?: Resolver<ResolversTypes["JSON"], ParentType, ContextType>;
  recommendedCoverage?: Resolver<
    ResolversTypes["Int"],
    ParentType,
    ContextType
  >;
  suggestedActions?: Resolver<ResolversTypes["JSON"], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type MutationResolvers<
  ContextType = GraphQLContext,
  ParentType extends
    ResolversParentTypes["Mutation"] = ResolversParentTypes["Mutation"],
> = {
  addAgentThoughts?: Resolver<
    Array<ResolversTypes["AgentThought"]>,
    ParentType,
    ContextType,
    RequireFields<MutationAddAgentThoughtsArgs, "conversationId" | "thoughts">
  >;
  archiveThread?: Resolver<
    ResolversTypes["Boolean"],
    ParentType,
    ContextType,
    RequireFields<MutationArchiveThreadArgs, "threadId">
  >;
  assignAccountToTerritory?: Resolver<
    ResolversTypes["AccountTerritory"],
    ParentType,
    ContextType,
    RequireFields<
      MutationAssignAccountToTerritoryArgs,
      "isPrimary" | "organizationId" | "territoryId"
    >
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
  attachFileToDeal?: Resolver<
    ResolversTypes["DealDocumentAttachment"],
    ParentType,
    ContextType,
    RequireFields<MutationAttachFileToDealArgs, "input">
  >;
  cancelActivityReminder?: Resolver<
    ResolversTypes["Boolean"],
    ParentType,
    ContextType,
    RequireFields<MutationCancelActivityReminderArgs, "id">
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
  createActivity?: Resolver<
    ResolversTypes["Activity"],
    ParentType,
    ContextType,
    RequireFields<MutationCreateActivityArgs, "input">
  >;
  createAgentConversation?: Resolver<
    ResolversTypes["AgentConversation"],
    ParentType,
    ContextType,
    Partial<MutationCreateAgentConversationArgs>
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
  createNotification?: Resolver<
    ResolversTypes["Notification"],
    ParentType,
    ContextType,
    RequireFields<MutationCreateNotificationArgs, "input">
  >;
  createOrganization?: Resolver<
    ResolversTypes["Organization"],
    ParentType,
    ContextType,
    RequireFields<MutationCreateOrganizationArgs, "input">
  >;
  createOrganizationRelationship?: Resolver<
    ResolversTypes["OrganizationRelationship"],
    ParentType,
    ContextType,
    RequireFields<MutationCreateOrganizationRelationshipArgs, "input">
  >;
  createPerson?: Resolver<
    ResolversTypes["Person"],
    ParentType,
    ContextType,
    RequireFields<MutationCreatePersonArgs, "input">
  >;
  createPersonOrganizationalRole?: Resolver<
    ResolversTypes["PersonOrganizationalRole"],
    ParentType,
    ContextType,
    RequireFields<MutationCreatePersonOrganizationalRoleArgs, "input">
  >;
  createPersonRelationship?: Resolver<
    ResolversTypes["PersonRelationship"],
    ParentType,
    ContextType,
    RequireFields<MutationCreatePersonRelationshipArgs, "input">
  >;
  createStakeholderAnalysis?: Resolver<
    ResolversTypes["StakeholderAnalysis"],
    ParentType,
    ContextType,
    RequireFields<MutationCreateStakeholderAnalysisArgs, "input">
  >;
  createSticker?: Resolver<
    ResolversTypes["SmartSticker"],
    ParentType,
    ContextType,
    RequireFields<MutationCreateStickerArgs, "input">
  >;
  createTaskFromEmail?: Resolver<
    ResolversTypes["Activity"],
    ParentType,
    ContextType,
    RequireFields<MutationCreateTaskFromEmailArgs, "input">
  >;
  createTerritory?: Resolver<
    ResolversTypes["Territory"],
    ParentType,
    ContextType,
    RequireFields<MutationCreateTerritoryArgs, "input">
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
  deactivateCustomFieldDefinition?: Resolver<
    ResolversTypes["CustomFieldDefinition"],
    ParentType,
    ContextType,
    RequireFields<MutationDeactivateCustomFieldDefinitionArgs, "id">
  >;
  deleteActivity?: Resolver<
    ResolversTypes["ID"],
    ParentType,
    ContextType,
    RequireFields<MutationDeleteActivityArgs, "id">
  >;
  deleteAgentConversation?: Resolver<
    ResolversTypes["Boolean"],
    ParentType,
    ContextType,
    RequireFields<MutationDeleteAgentConversationArgs, "id">
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
  deleteNotification?: Resolver<
    ResolversTypes["Boolean"],
    ParentType,
    ContextType,
    RequireFields<MutationDeleteNotificationArgs, "id">
  >;
  deleteOrganization?: Resolver<
    Maybe<ResolversTypes["Boolean"]>,
    ParentType,
    ContextType,
    RequireFields<MutationDeleteOrganizationArgs, "id">
  >;
  deleteOrganizationRelationship?: Resolver<
    ResolversTypes["Boolean"],
    ParentType,
    ContextType,
    RequireFields<MutationDeleteOrganizationRelationshipArgs, "id">
  >;
  deletePerson?: Resolver<
    Maybe<ResolversTypes["Boolean"]>,
    ParentType,
    ContextType,
    RequireFields<MutationDeletePersonArgs, "id">
  >;
  deletePersonOrganizationalRole?: Resolver<
    ResolversTypes["Boolean"],
    ParentType,
    ContextType,
    RequireFields<MutationDeletePersonOrganizationalRoleArgs, "id">
  >;
  deletePersonRelationship?: Resolver<
    ResolversTypes["Boolean"],
    ParentType,
    ContextType,
    RequireFields<MutationDeletePersonRelationshipArgs, "id">
  >;
  deleteStakeholderAnalysis?: Resolver<
    ResolversTypes["Boolean"],
    ParentType,
    ContextType,
    RequireFields<MutationDeleteStakeholderAnalysisArgs, "id">
  >;
  deleteSticker?: Resolver<
    ResolversTypes["Boolean"],
    ParentType,
    ContextType,
    RequireFields<MutationDeleteStickerArgs, "id">
  >;
  deleteTerritory?: Resolver<
    ResolversTypes["Boolean"],
    ParentType,
    ContextType,
    RequireFields<MutationDeleteTerritoryArgs, "id">
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
  dismissRelationshipInsight?: Resolver<
    ResolversTypes["Boolean"],
    ParentType,
    ContextType,
    RequireFields<MutationDismissRelationshipInsightArgs, "id">
  >;
  executeAgentStep?: Resolver<
    ResolversTypes["AgentResponse"],
    ParentType,
    ContextType,
    RequireFields<MutationExecuteAgentStepArgs, "conversationId" | "stepId">
  >;
  linkEmailToDeal?: Resolver<
    ResolversTypes["Boolean"],
    ParentType,
    ContextType,
    RequireFields<MutationLinkEmailToDealArgs, "dealId" | "emailId">
  >;
  markAllNotificationsAsRead?: Resolver<
    ResolversTypes["Int"],
    ParentType,
    ContextType
  >;
  markNotificationAsRead?: Resolver<
    ResolversTypes["Notification"],
    ParentType,
    ContextType,
    RequireFields<MutationMarkNotificationAsReadArgs, "id">
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
  removeAccountFromTerritory?: Resolver<
    ResolversTypes["Boolean"],
    ParentType,
    ContextType,
    RequireFields<
      MutationRemoveAccountFromTerritoryArgs,
      "organizationId" | "territoryId"
    >
  >;
  removeDocumentAttachment?: Resolver<
    ResolversTypes["Boolean"],
    ParentType,
    ContextType,
    RequireFields<MutationRemoveDocumentAttachmentArgs, "attachmentId">
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
  scheduleActivityReminder?: Resolver<
    ResolversTypes["ActivityReminder"],
    ParentType,
    ContextType,
    RequireFields<
      MutationScheduleActivityReminderArgs,
      "activityId" | "reminderType" | "scheduledFor"
    >
  >;
  sendAgentMessage?: Resolver<
    ResolversTypes["AgentResponse"],
    ParentType,
    ContextType,
    RequireFields<MutationSendAgentMessageArgs, "input">
  >;
  shareDriveFolder?: Resolver<
    ResolversTypes["Boolean"],
    ParentType,
    ContextType,
    RequireFields<MutationShareDriveFolderArgs, "folderId" | "permissions">
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
  updateActivity?: Resolver<
    ResolversTypes["Activity"],
    ParentType,
    ContextType,
    RequireFields<MutationUpdateActivityArgs, "id" | "input">
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
  updateLead?: Resolver<
    Maybe<ResolversTypes["Lead"]>,
    ParentType,
    ContextType,
    RequireFields<MutationUpdateLeadArgs, "id" | "input">
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
  updateMyReminderPreferences?: Resolver<
    ResolversTypes["UserReminderPreferences"],
    ParentType,
    ContextType,
    RequireFields<MutationUpdateMyReminderPreferencesArgs, "input">
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
  updatePersonOrganizationalRole?: Resolver<
    ResolversTypes["PersonOrganizationalRole"],
    ParentType,
    ContextType,
    RequireFields<MutationUpdatePersonOrganizationalRoleArgs, "id" | "input">
  >;
  updateRelationshipInsight?: Resolver<
    ResolversTypes["RelationshipInsight"],
    ParentType,
    ContextType,
    RequireFields<MutationUpdateRelationshipInsightArgs, "id" | "input">
  >;
  updateStakeholderAnalysis?: Resolver<
    ResolversTypes["StakeholderAnalysis"],
    ParentType,
    ContextType,
    RequireFields<MutationUpdateStakeholderAnalysisArgs, "id" | "input">
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
  updateTerritory?: Resolver<
    ResolversTypes["Territory"],
    ParentType,
    ContextType,
    RequireFields<MutationUpdateTerritoryArgs, "id" | "input">
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

export type NotificationResolvers<
  ContextType = GraphQLContext,
  ParentType extends
    ResolversParentTypes["Notification"] = ResolversParentTypes["Notification"],
> = {
  actionUrl?: Resolver<
    Maybe<ResolversTypes["String"]>,
    ParentType,
    ContextType
  >;
  createdAt?: Resolver<ResolversTypes["DateTime"], ParentType, ContextType>;
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
    ResolversTypes["NotificationType"],
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

export type NotificationSummaryResolvers<
  ContextType = GraphQLContext,
  ParentType extends
    ResolversParentTypes["NotificationSummary"] = ResolversParentTypes["NotificationSummary"],
> = {
  notifications?: Resolver<
    Array<ResolversTypes["Notification"]>,
    ParentType,
    ContextType
  >;
  totalCount?: Resolver<ResolversTypes["Int"], ParentType, ContextType>;
  unreadCount?: Resolver<ResolversTypes["Int"], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type OrganizationResolvers<
  ContextType = GraphQLContext,
  ParentType extends
    ResolversParentTypes["Organization"] = ResolversParentTypes["Organization"],
> = {
  activities?: Resolver<
    Array<ResolversTypes["Activity"]>,
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
  updated_at?: Resolver<ResolversTypes["DateTime"], ParentType, ContextType>;
  user_id?: Resolver<ResolversTypes["ID"], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type OrganizationRelationshipResolvers<
  ContextType = GraphQLContext,
  ParentType extends
    ResolversParentTypes["OrganizationRelationship"] = ResolversParentTypes["OrganizationRelationship"],
> = {
  childOrg?: Resolver<ResolversTypes["Organization"], ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  createdByUser?: Resolver<
    Maybe<ResolversTypes["User"]>,
    ParentType,
    ContextType
  >;
  endDate?: Resolver<Maybe<ResolversTypes["String"]>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes["ID"], ParentType, ContextType>;
  metadata?: Resolver<Maybe<ResolversTypes["JSON"]>, ParentType, ContextType>;
  notes?: Resolver<Maybe<ResolversTypes["String"]>, ParentType, ContextType>;
  ownershipPercentage?: Resolver<
    Maybe<ResolversTypes["Float"]>,
    ParentType,
    ContextType
  >;
  parentOrg?: Resolver<ResolversTypes["Organization"], ParentType, ContextType>;
  relationshipStrength?: Resolver<
    Maybe<ResolversTypes["Int"]>,
    ParentType,
    ContextType
  >;
  relationshipType?: Resolver<
    ResolversTypes["OrganizationRelationshipType"],
    ParentType,
    ContextType
  >;
  startDate?: Resolver<
    Maybe<ResolversTypes["String"]>,
    ParentType,
    ContextType
  >;
  updatedAt?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type PersonResolvers<
  ContextType = GraphQLContext,
  ParentType extends
    ResolversParentTypes["Person"] = ResolversParentTypes["Person"],
> = {
  activities?: Resolver<
    Array<ResolversTypes["Activity"]>,
    ParentType,
    ContextType
  >;
  created_at?: Resolver<ResolversTypes["DateTime"], ParentType, ContextType>;
  customFieldValues?: Resolver<
    Array<ResolversTypes["CustomFieldValue"]>,
    ParentType,
    ContextType
  >;
  deals?: Resolver<
    Maybe<Array<ResolversTypes["Deal"]>>,
    ParentType,
    ContextType
  >;
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
  organization_id?: Resolver<
    Maybe<ResolversTypes["ID"]>,
    ParentType,
    ContextType
  >;
  phone?: Resolver<Maybe<ResolversTypes["String"]>, ParentType, ContextType>;
  updated_at?: Resolver<ResolversTypes["DateTime"], ParentType, ContextType>;
  user_id?: Resolver<ResolversTypes["ID"], ParentType, ContextType>;
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

export type PersonOrganizationalRoleResolvers<
  ContextType = GraphQLContext,
  ParentType extends
    ResolversParentTypes["PersonOrganizationalRole"] = ResolversParentTypes["PersonOrganizationalRole"],
> = {
  budgetAuthorityUsd?: Resolver<
    Maybe<ResolversTypes["Float"]>,
    ParentType,
    ContextType
  >;
  createdAt?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  createdByUser?: Resolver<
    Maybe<ResolversTypes["User"]>,
    ParentType,
    ContextType
  >;
  department?: Resolver<
    Maybe<ResolversTypes["String"]>,
    ParentType,
    ContextType
  >;
  endDate?: Resolver<Maybe<ResolversTypes["String"]>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes["ID"], ParentType, ContextType>;
  isPrimaryRole?: Resolver<ResolversTypes["Boolean"], ParentType, ContextType>;
  notes?: Resolver<Maybe<ResolversTypes["String"]>, ParentType, ContextType>;
  organization?: Resolver<
    ResolversTypes["Organization"],
    ParentType,
    ContextType
  >;
  person?: Resolver<ResolversTypes["Person"], ParentType, ContextType>;
  reportingStructure?: Resolver<
    Maybe<ResolversTypes["JSON"]>,
    ParentType,
    ContextType
  >;
  responsibilities?: Resolver<
    Maybe<ResolversTypes["JSON"]>,
    ParentType,
    ContextType
  >;
  roleTitle?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  seniorityLevel?: Resolver<
    Maybe<ResolversTypes["SeniorityLevel"]>,
    ParentType,
    ContextType
  >;
  startDate?: Resolver<
    Maybe<ResolversTypes["String"]>,
    ParentType,
    ContextType
  >;
  teamSize?: Resolver<Maybe<ResolversTypes["Int"]>, ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type PersonRelationshipResolvers<
  ContextType = GraphQLContext,
  ParentType extends
    ResolversParentTypes["PersonRelationship"] = ResolversParentTypes["PersonRelationship"],
> = {
  createdAt?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  createdByUser?: Resolver<
    Maybe<ResolversTypes["User"]>,
    ParentType,
    ContextType
  >;
  fromPerson?: Resolver<ResolversTypes["Person"], ParentType, ContextType>;
  id?: Resolver<ResolversTypes["ID"], ParentType, ContextType>;
  interactionFrequency?: Resolver<
    Maybe<ResolversTypes["InteractionFrequency"]>,
    ParentType,
    ContextType
  >;
  isBidirectional?: Resolver<
    ResolversTypes["Boolean"],
    ParentType,
    ContextType
  >;
  metadata?: Resolver<Maybe<ResolversTypes["JSON"]>, ParentType, ContextType>;
  notes?: Resolver<Maybe<ResolversTypes["String"]>, ParentType, ContextType>;
  relationshipContext?: Resolver<
    Maybe<ResolversTypes["String"]>,
    ParentType,
    ContextType
  >;
  relationshipStrength?: Resolver<
    Maybe<ResolversTypes["Int"]>,
    ParentType,
    ContextType
  >;
  relationshipType?: Resolver<
    ResolversTypes["PersonRelationshipType"],
    ParentType,
    ContextType
  >;
  toPerson?: Resolver<ResolversTypes["Person"], ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type QueryResolvers<
  ContextType = GraphQLContext,
  ParentType extends
    ResolversParentTypes["Query"] = ResolversParentTypes["Query"],
> = {
  accountTerritories?: Resolver<
    Array<ResolversTypes["AccountTerritory"]>,
    ParentType,
    ContextType,
    RequireFields<QueryAccountTerritoriesArgs, "organizationId">
  >;
  activities?: Resolver<
    Array<ResolversTypes["Activity"]>,
    ParentType,
    ContextType,
    Partial<QueryActivitiesArgs>
  >;
  activity?: Resolver<
    Maybe<ResolversTypes["Activity"]>,
    ParentType,
    ContextType,
    RequireFields<QueryActivityArgs, "id">
  >;
  activityReminders?: Resolver<
    Array<ResolversTypes["ActivityReminder"]>,
    ParentType,
    ContextType,
    Partial<QueryActivityRemindersArgs>
  >;
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
  analyzeStakeholderNetwork?: Resolver<
    ResolversTypes["StakeholderNetworkAnalysis"],
    ParentType,
    ContextType,
    RequireFields<
      QueryAnalyzeStakeholderNetworkArgs,
      "includeInactiveRoles" | "organizationId"
    >
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
  deals?: Resolver<Array<ResolversTypes["Deal"]>, ParentType, ContextType>;
  discoverAgentTools?: Resolver<
    ResolversTypes["ToolDiscoveryResponse"],
    ParentType,
    ContextType
  >;
  findMissingStakeholders?: Resolver<
    ResolversTypes["MissingStakeholderRecommendations"],
    ParentType,
    ContextType,
    RequireFields<QueryFindMissingStakeholdersArgs, "organizationId">
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
  myNotifications?: Resolver<
    ResolversTypes["NotificationSummary"],
    ParentType,
    ContextType,
    Partial<QueryMyNotificationsArgs>
  >;
  myPermissions?: Resolver<
    Maybe<Array<ResolversTypes["String"]>>,
    ParentType,
    ContextType
  >;
  myReminderPreferences?: Resolver<
    Maybe<ResolversTypes["UserReminderPreferences"]>,
    ParentType,
    ContextType
  >;
  notification?: Resolver<
    Maybe<ResolversTypes["Notification"]>,
    ParentType,
    ContextType,
    RequireFields<QueryNotificationArgs, "id">
  >;
  organization?: Resolver<
    Maybe<ResolversTypes["Organization"]>,
    ParentType,
    ContextType,
    RequireFields<QueryOrganizationArgs, "id">
  >;
  organizationPersonRelationships?: Resolver<
    Array<ResolversTypes["PersonRelationship"]>,
    ParentType,
    ContextType,
    RequireFields<QueryOrganizationPersonRelationshipsArgs, "organizationId">
  >;
  organizationRelationships?: Resolver<
    Array<ResolversTypes["OrganizationRelationship"]>,
    ParentType,
    ContextType,
    RequireFields<QueryOrganizationRelationshipsArgs, "organizationId">
  >;
  organizationRoles?: Resolver<
    Array<ResolversTypes["PersonOrganizationalRole"]>,
    ParentType,
    ContextType,
    RequireFields<
      QueryOrganizationRolesArgs,
      "includeInactive" | "organizationId"
    >
  >;
  organizations?: Resolver<
    Array<ResolversTypes["Organization"]>,
    ParentType,
    ContextType
  >;
  people?: Resolver<Array<ResolversTypes["Person"]>, ParentType, ContextType>;
  person?: Resolver<
    Maybe<ResolversTypes["Person"]>,
    ParentType,
    ContextType,
    RequireFields<QueryPersonArgs, "id">
  >;
  personList?: Resolver<
    Array<ResolversTypes["PersonListItem"]>,
    ParentType,
    ContextType
  >;
  personOrganizationalRoles?: Resolver<
    Array<ResolversTypes["PersonOrganizationalRole"]>,
    ParentType,
    ContextType,
    Partial<QueryPersonOrganizationalRolesArgs>
  >;
  personRelationships?: Resolver<
    Array<ResolversTypes["PersonRelationship"]>,
    ParentType,
    ContextType,
    RequireFields<QueryPersonRelationshipsArgs, "personId">
  >;
  relationshipInsight?: Resolver<
    Maybe<ResolversTypes["RelationshipInsight"]>,
    ParentType,
    ContextType,
    RequireFields<QueryRelationshipInsightArgs, "id">
  >;
  relationshipInsights?: Resolver<
    Array<ResolversTypes["RelationshipInsight"]>,
    ParentType,
    ContextType,
    Partial<QueryRelationshipInsightsArgs>
  >;
  roles?: Resolver<Array<ResolversTypes["Role"]>, ParentType, ContextType>;
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
  stakeholderAnalyses?: Resolver<
    Array<ResolversTypes["StakeholderAnalysis"]>,
    ParentType,
    ContextType,
    Partial<QueryStakeholderAnalysesArgs>
  >;
  stakeholderAnalysis?: Resolver<
    Maybe<ResolversTypes["StakeholderAnalysis"]>,
    ParentType,
    ContextType,
    RequireFields<QueryStakeholderAnalysisArgs, "id">
  >;
  supabaseConnectionTest?: Resolver<
    ResolversTypes["String"],
    ParentType,
    ContextType
  >;
  territories?: Resolver<
    Array<ResolversTypes["Territory"]>,
    ParentType,
    ContextType,
    Partial<QueryTerritoriesArgs>
  >;
  territory?: Resolver<
    Maybe<ResolversTypes["Territory"]>,
    ParentType,
    ContextType,
    RequireFields<QueryTerritoryArgs, "id">
  >;
  unreadNotificationCount?: Resolver<
    ResolversTypes["Int"],
    ParentType,
    ContextType
  >;
  users?: Resolver<Array<ResolversTypes["User"]>, ParentType, ContextType>;
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

export type RelationshipInsightResolvers<
  ContextType = GraphQLContext,
  ParentType extends
    ResolversParentTypes["RelationshipInsight"] = ResolversParentTypes["RelationshipInsight"],
> = {
  aiReasoning?: Resolver<
    Maybe<ResolversTypes["String"]>,
    ParentType,
    ContextType
  >;
  confidenceScore?: Resolver<
    Maybe<ResolversTypes["Float"]>,
    ParentType,
    ContextType
  >;
  createdAt?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  entityId?: Resolver<ResolversTypes["ID"], ParentType, ContextType>;
  entityType?: Resolver<ResolversTypes["EntityType"], ParentType, ContextType>;
  expiresAt?: Resolver<
    Maybe<ResolversTypes["String"]>,
    ParentType,
    ContextType
  >;
  id?: Resolver<ResolversTypes["ID"], ParentType, ContextType>;
  insightDescription?: Resolver<
    ResolversTypes["String"],
    ParentType,
    ContextType
  >;
  insightTitle?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  insightType?: Resolver<
    ResolversTypes["InsightType"],
    ParentType,
    ContextType
  >;
  priorityLevel?: Resolver<
    Maybe<ResolversTypes["PriorityLevel"]>,
    ParentType,
    ContextType
  >;
  recommendedActions?: Resolver<
    Maybe<ResolversTypes["JSON"]>,
    ParentType,
    ContextType
  >;
  reviewedAt?: Resolver<
    Maybe<ResolversTypes["String"]>,
    ParentType,
    ContextType
  >;
  reviewedBy?: Resolver<Maybe<ResolversTypes["User"]>, ParentType, ContextType>;
  status?: Resolver<ResolversTypes["InsightStatus"], ParentType, ContextType>;
  supportingData?: Resolver<
    Maybe<ResolversTypes["JSON"]>,
    ParentType,
    ContextType
  >;
  updatedAt?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
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

export type StakeholderAnalysisResolvers<
  ContextType = GraphQLContext,
  ParentType extends
    ResolversParentTypes["StakeholderAnalysis"] = ResolversParentTypes["StakeholderAnalysis"],
> = {
  aiCommunicationStyle?: Resolver<
    Maybe<ResolversTypes["String"]>,
    ParentType,
    ContextType
  >;
  aiDecisionPattern?: Resolver<
    Maybe<ResolversTypes["String"]>,
    ParentType,
    ContextType
  >;
  aiInfluenceNetwork?: Resolver<
    Maybe<ResolversTypes["JSON"]>,
    ParentType,
    ContextType
  >;
  aiPersonalityProfile?: Resolver<
    Maybe<ResolversTypes["JSON"]>,
    ParentType,
    ContextType
  >;
  approachStrategy?: Resolver<
    Maybe<ResolversTypes["String"]>,
    ParentType,
    ContextType
  >;
  budgetAuthorityLevel?: Resolver<
    Maybe<ResolversTypes["BudgetAuthorityLevel"]>,
    ParentType,
    ContextType
  >;
  communicationPreference?: Resolver<
    Maybe<ResolversTypes["CommunicationPreference"]>,
    ParentType,
    ContextType
  >;
  concerns?: Resolver<Maybe<ResolversTypes["JSON"]>, ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  createdByUser?: Resolver<
    Maybe<ResolversTypes["User"]>,
    ParentType,
    ContextType
  >;
  deal?: Resolver<Maybe<ResolversTypes["Deal"]>, ParentType, ContextType>;
  decisionAuthority?: Resolver<
    Maybe<ResolversTypes["DecisionAuthority"]>,
    ParentType,
    ContextType
  >;
  engagementLevel?: Resolver<
    Maybe<ResolversTypes["EngagementLevel"]>,
    ParentType,
    ContextType
  >;
  id?: Resolver<ResolversTypes["ID"], ParentType, ContextType>;
  influenceScore?: Resolver<
    Maybe<ResolversTypes["Int"]>,
    ParentType,
    ContextType
  >;
  lastInteractionDate?: Resolver<
    Maybe<ResolversTypes["String"]>,
    ParentType,
    ContextType
  >;
  lastInteractionType?: Resolver<
    Maybe<ResolversTypes["String"]>,
    ParentType,
    ContextType
  >;
  lead?: Resolver<Maybe<ResolversTypes["Lead"]>, ParentType, ContextType>;
  motivations?: Resolver<
    Maybe<ResolversTypes["JSON"]>,
    ParentType,
    ContextType
  >;
  nextBestAction?: Resolver<
    Maybe<ResolversTypes["String"]>,
    ParentType,
    ContextType
  >;
  organization?: Resolver<
    ResolversTypes["Organization"],
    ParentType,
    ContextType
  >;
  painPoints?: Resolver<Maybe<ResolversTypes["JSON"]>, ParentType, ContextType>;
  person?: Resolver<ResolversTypes["Person"], ParentType, ContextType>;
  preferredMeetingTime?: Resolver<
    Maybe<ResolversTypes["String"]>,
    ParentType,
    ContextType
  >;
  successMetrics?: Resolver<
    Maybe<ResolversTypes["JSON"]>,
    ParentType,
    ContextType
  >;
  updatedAt?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type StakeholderNetworkAnalysisResolvers<
  ContextType = GraphQLContext,
  ParentType extends
    ResolversParentTypes["StakeholderNetworkAnalysis"] = ResolversParentTypes["StakeholderNetworkAnalysis"],
> = {
  coverageAnalysis?: Resolver<ResolversTypes["JSON"], ParentType, ContextType>;
  influenceMap?: Resolver<ResolversTypes["JSON"], ParentType, ContextType>;
  networkInsights?: Resolver<ResolversTypes["JSON"], ParentType, ContextType>;
  organization?: Resolver<
    ResolversTypes["Organization"],
    ParentType,
    ContextType
  >;
  relationshipCount?: Resolver<ResolversTypes["Int"], ParentType, ContextType>;
  relationships?: Resolver<
    Array<ResolversTypes["PersonRelationship"]>,
    ParentType,
    ContextType
  >;
  roleCount?: Resolver<ResolversTypes["Int"], ParentType, ContextType>;
  roles?: Resolver<
    Array<ResolversTypes["PersonOrganizationalRole"]>,
    ParentType,
    ContextType
  >;
  stakeholderCount?: Resolver<ResolversTypes["Int"], ParentType, ContextType>;
  stakeholders?: Resolver<
    Array<ResolversTypes["StakeholderAnalysis"]>,
    ParentType,
    ContextType
  >;
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
  notificationAdded?: SubscriptionResolver<
    ResolversTypes["Notification"],
    "notificationAdded",
    ParentType,
    ContextType,
    RequireFields<SubscriptionNotificationAddedArgs, "userId">
  >;
  notificationUpdated?: SubscriptionResolver<
    ResolversTypes["Notification"],
    "notificationUpdated",
    ParentType,
    ContextType,
    RequireFields<SubscriptionNotificationUpdatedArgs, "userId">
  >;
};

export type TerritoryResolvers<
  ContextType = GraphQLContext,
  ParentType extends
    ResolversParentTypes["Territory"] = ResolversParentTypes["Territory"],
> = {
  accountSizeRange?: Resolver<
    Maybe<ResolversTypes["String"]>,
    ParentType,
    ContextType
  >;
  assignedUser?: Resolver<
    Maybe<ResolversTypes["User"]>,
    ParentType,
    ContextType
  >;
  childTerritories?: Resolver<
    Array<ResolversTypes["Territory"]>,
    ParentType,
    ContextType
  >;
  city?: Resolver<Maybe<ResolversTypes["String"]>, ParentType, ContextType>;
  country?: Resolver<Maybe<ResolversTypes["String"]>, ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  id?: Resolver<ResolversTypes["ID"], ParentType, ContextType>;
  industryFocus?: Resolver<
    Maybe<Array<ResolversTypes["String"]>>,
    ParentType,
    ContextType
  >;
  isActive?: Resolver<ResolversTypes["Boolean"], ParentType, ContextType>;
  metadata?: Resolver<Maybe<ResolversTypes["JSON"]>, ParentType, ContextType>;
  name?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  organizations?: Resolver<
    Array<ResolversTypes["Organization"]>,
    ParentType,
    ContextType
  >;
  parentTerritory?: Resolver<
    Maybe<ResolversTypes["Territory"]>,
    ParentType,
    ContextType
  >;
  region?: Resolver<Maybe<ResolversTypes["String"]>, ParentType, ContextType>;
  stateProvince?: Resolver<
    Maybe<ResolversTypes["String"]>,
    ParentType,
    ContextType
  >;
  territoryType?: Resolver<
    ResolversTypes["TerritoryType"],
    ParentType,
    ContextType
  >;
  updatedAt?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
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

export type UserReminderPreferencesResolvers<
  ContextType = GraphQLContext,
  ParentType extends
    ResolversParentTypes["UserReminderPreferences"] = ResolversParentTypes["UserReminderPreferences"],
> = {
  createdAt?: Resolver<ResolversTypes["DateTime"], ParentType, ContextType>;
  emailDailyDigestEnabled?: Resolver<
    ResolversTypes["Boolean"],
    ParentType,
    ContextType
  >;
  emailDailyDigestTime?: Resolver<
    ResolversTypes["String"],
    ParentType,
    ContextType
  >;
  emailReminderMinutesBefore?: Resolver<
    ResolversTypes["Int"],
    ParentType,
    ContextType
  >;
  emailRemindersEnabled?: Resolver<
    ResolversTypes["Boolean"],
    ParentType,
    ContextType
  >;
  id?: Resolver<ResolversTypes["ID"], ParentType, ContextType>;
  inAppReminderMinutesBefore?: Resolver<
    ResolversTypes["Int"],
    ParentType,
    ContextType
  >;
  inAppRemindersEnabled?: Resolver<
    ResolversTypes["Boolean"],
    ParentType,
    ContextType
  >;
  overdueNotificationFrequencyHours?: Resolver<
    ResolversTypes["Int"],
    ParentType,
    ContextType
  >;
  overdueNotificationsEnabled?: Resolver<
    ResolversTypes["Boolean"],
    ParentType,
    ContextType
  >;
  pushReminderMinutesBefore?: Resolver<
    ResolversTypes["Int"],
    ParentType,
    ContextType
  >;
  pushRemindersEnabled?: Resolver<
    ResolversTypes["Boolean"],
    ParentType,
    ContextType
  >;
  updatedAt?: Resolver<ResolversTypes["DateTime"], ParentType, ContextType>;
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
  AccountTerritory?: AccountTerritoryResolvers<ContextType>;
  Activity?: ActivityResolvers<ContextType>;
  ActivityReminder?: ActivityReminderResolvers<ContextType>;
  AgentConfig?: AgentConfigResolvers<ContextType>;
  AgentConversation?: AgentConversationResolvers<ContextType>;
  AgentMessage?: AgentMessageResolvers<ContextType>;
  AgentPlan?: AgentPlanResolvers<ContextType>;
  AgentPlanStep?: AgentPlanStepResolvers<ContextType>;
  AgentResponse?: AgentResponseResolvers<ContextType>;
  AgentThought?: AgentThoughtResolvers<ContextType>;
  AppSetting?: AppSettingResolvers<ContextType>;
  ConvertedEntities?: ConvertedEntitiesResolvers<ContextType>;
  CustomFieldDefinition?: CustomFieldDefinitionResolvers<ContextType>;
  CustomFieldOption?: CustomFieldOptionResolvers<ContextType>;
  CustomFieldValue?: CustomFieldValueResolvers<ContextType>;
  DateTime?: GraphQLScalarType;
  Deal?: DealResolvers<ContextType>;
  DealDocumentAttachment?: DealDocumentAttachmentResolvers<ContextType>;
  DealFolderInfo?: DealFolderInfoResolvers<ContextType>;
  DealHistoryEntry?: DealHistoryEntryResolvers<ContextType>;
  DealSubfolders?: DealSubfoldersResolvers<ContextType>;
  Document?: DocumentResolvers<ContextType>;
  DriveFile?: DriveFileResolvers<ContextType>;
  DriveFileConnection?: DriveFileConnectionResolvers<ContextType>;
  DriveFileOwner?: DriveFileOwnerResolvers<ContextType>;
  DriveFolder?: DriveFolderResolvers<ContextType>;
  DriveFolderConnection?: DriveFolderConnectionResolvers<ContextType>;
  DriveFolderStructure?: DriveFolderStructureResolvers<ContextType>;
  DriveFolderSubfolders?: DriveFolderSubfoldersResolvers<ContextType>;
  Email?: EmailResolvers<ContextType>;
  EmailActivity?: EmailActivityResolvers<ContextType>;
  EmailAnalytics?: EmailAnalyticsResolvers<ContextType>;
  EmailAttachment?: EmailAttachmentResolvers<ContextType>;
  EmailMessage?: EmailMessageResolvers<ContextType>;
  EmailThread?: EmailThreadResolvers<ContextType>;
  EmailThreadConnection?: EmailThreadConnectionResolvers<ContextType>;
  GoogleDriveConfig?: GoogleDriveConfigResolvers<ContextType>;
  GoogleIntegrationStatus?: GoogleIntegrationStatusResolvers<ContextType>;
  GoogleTokenData?: GoogleTokenDataResolvers<ContextType>;
  JSON?: GraphQLScalarType;
  Lead?: LeadResolvers<ContextType>;
  LeadConversionResult?: LeadConversionResultResolvers<ContextType>;
  LeadHistoryEntry?: LeadHistoryEntryResolvers<ContextType>;
  LeadsStats?: LeadsStatsResolvers<ContextType>;
  MissingStakeholderRecommendations?: MissingStakeholderRecommendationsResolvers<ContextType>;
  Mutation?: MutationResolvers<ContextType>;
  Notification?: NotificationResolvers<ContextType>;
  NotificationSummary?: NotificationSummaryResolvers<ContextType>;
  Organization?: OrganizationResolvers<ContextType>;
  OrganizationRelationship?: OrganizationRelationshipResolvers<ContextType>;
  Person?: PersonResolvers<ContextType>;
  PersonListItem?: PersonListItemResolvers<ContextType>;
  PersonOrganizationalRole?: PersonOrganizationalRoleResolvers<ContextType>;
  PersonRelationship?: PersonRelationshipResolvers<ContextType>;
  Query?: QueryResolvers<ContextType>;
  RelationshipInsight?: RelationshipInsightResolvers<ContextType>;
  Role?: RoleResolvers<ContextType>;
  SharedDrive?: SharedDriveResolvers<ContextType>;
  SharedDriveCapabilities?: SharedDriveCapabilitiesResolvers<ContextType>;
  SharedDriveImage?: SharedDriveImageResolvers<ContextType>;
  SharedDriveRestrictions?: SharedDriveRestrictionsResolvers<ContextType>;
  SmartSticker?: SmartStickerResolvers<ContextType>;
  StakeholderAnalysis?: StakeholderAnalysisResolvers<ContextType>;
  StakeholderNetworkAnalysis?: StakeholderNetworkAnalysisResolvers<ContextType>;
  StickerCategory?: StickerCategoryResolvers<ContextType>;
  StickerConnection?: StickerConnectionResolvers<ContextType>;
  Subscription?: SubscriptionResolvers<ContextType>;
  Territory?: TerritoryResolvers<ContextType>;
  ToolDiscoveryResponse?: ToolDiscoveryResponseResolvers<ContextType>;
  User?: UserResolvers<ContextType>;
  UserReminderPreferences?: UserReminderPreferencesResolvers<ContextType>;
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
