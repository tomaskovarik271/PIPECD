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
  DateTime: { input: string; output: string };
  JSON: { input: Record<string, any>; output: Record<string, any> };
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

export enum BudgetAuthorityLevel {
  High = "HIGH",
  Low = "LOW",
  Medium = "MEDIUM",
  None = "NONE",
  Unlimited = "UNLIMITED",
}

export type BulkUpdateDealContactAssociationsInput = {
  associations: Array<UpdateDealContactAssociationInput>;
  dealId: Scalars["String"]["input"];
};

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

export enum ContactRoleType {
  DecisionMaker = "DECISION_MAKER",
  Influencer = "INFLUENCER",
  Legal = "LEGAL",
  Other = "OTHER",
  Primary = "PRIMARY",
  Technical = "TECHNICAL",
}

export enum ContactScopeType {
  All = "ALL",
  Custom = "CUSTOM",
  Primary = "PRIMARY",
  SelectedRoles = "SELECTED_ROLES",
}

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

export type CreateDealContactAssociationInput = {
  customRoleLabel?: InputMaybe<Scalars["String"]["input"]>;
  dealId: Scalars["String"]["input"];
  includeInEmailFilter?: InputMaybe<Scalars["Boolean"]["input"]>;
  personId: Scalars["String"]["input"];
  role: ContactRoleType;
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

export type CreateEmailFilterPresetInput = {
  contactScope: ContactScopeType;
  dateFrom?: InputMaybe<Scalars["String"]["input"]>;
  dateTo?: InputMaybe<Scalars["String"]["input"]>;
  description?: InputMaybe<Scalars["String"]["input"]>;
  hasAttachments?: InputMaybe<Scalars["Boolean"]["input"]>;
  includeNewParticipants?: InputMaybe<Scalars["Boolean"]["input"]>;
  isDefault?: InputMaybe<Scalars["Boolean"]["input"]>;
  isUnread?: InputMaybe<Scalars["Boolean"]["input"]>;
  keywords?: InputMaybe<Array<Scalars["String"]["input"]>>;
  name: Scalars["String"]["input"];
  selectedContactIds?: InputMaybe<Array<Scalars["String"]["input"]>>;
  selectedRoles?: InputMaybe<Array<ContactRoleType>>;
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
  contactAssociations: Array<DealContactAssociation>;
  createdBy: User;
  created_at: Scalars["DateTime"]["output"];
  currentWfmStatus?: Maybe<WfmStatus>;
  currentWfmStep?: Maybe<WfmWorkflowStep>;
  customFieldValues: Array<CustomFieldValue>;
  deal_specific_probability?: Maybe<Scalars["Float"]["output"]>;
  emailContactSuggestions: Array<EmailContactSuggestion>;
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

export type DealContactAssociation = {
  __typename?: "DealContactAssociation";
  createdAt: Scalars["String"]["output"];
  createdByUserId: Scalars["String"]["output"];
  customRoleLabel?: Maybe<Scalars["String"]["output"]>;
  dealId: Scalars["String"]["output"];
  id: Scalars["String"]["output"];
  includeInEmailFilter: Scalars["Boolean"]["output"];
  person?: Maybe<Person>;
  personId: Scalars["String"]["output"];
  role: ContactRoleType;
  updatedAt: Scalars["String"]["output"];
};

export type DealContactAssociationWithDetails = {
  __typename?: "DealContactAssociationWithDetails";
  createdAt: Scalars["String"]["output"];
  customRoleLabel?: Maybe<Scalars["String"]["output"]>;
  dealId: Scalars["String"]["output"];
  id: Scalars["String"]["output"];
  includeInEmailFilter: Scalars["Boolean"]["output"];
  personEmail?: Maybe<Scalars["String"]["output"]>;
  personFirstName?: Maybe<Scalars["String"]["output"]>;
  personId: Scalars["String"]["output"];
  personLastName?: Maybe<Scalars["String"]["output"]>;
  role: ContactRoleType;
  updatedAt: Scalars["String"]["output"];
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

export enum EmailContactDiscoveryStatus {
  Accepted = "ACCEPTED",
  AutoAssociated = "AUTO_ASSOCIATED",
  Pending = "PENDING",
  Rejected = "REJECTED",
}

export type EmailContactSuggestion = {
  __typename?: "EmailContactSuggestion";
  confidenceScore?: Maybe<Scalars["Float"]["output"]>;
  createdAt: Scalars["String"]["output"];
  dealId: Scalars["String"]["output"];
  discoveredName?: Maybe<Scalars["String"]["output"]>;
  emailAddress: Scalars["String"]["output"];
  emailCount: Scalars["Int"]["output"];
  existingPerson?: Maybe<Person>;
  existingPersonId?: Maybe<Scalars["String"]["output"]>;
  firstSeenThreadId?: Maybe<Scalars["String"]["output"]>;
  id: Scalars["String"]["output"];
  isExistingContact: Scalars["Boolean"]["output"];
  processedAt?: Maybe<Scalars["String"]["output"]>;
  processedByUserId?: Maybe<Scalars["String"]["output"]>;
  status: EmailContactDiscoveryStatus;
  suggestedRole: ContactRoleType;
};

export type EmailFilterPreset = {
  __typename?: "EmailFilterPreset";
  contactScope: ContactScopeType;
  createdAt: Scalars["String"]["output"];
  dateFrom?: Maybe<Scalars["String"]["output"]>;
  dateTo?: Maybe<Scalars["String"]["output"]>;
  description?: Maybe<Scalars["String"]["output"]>;
  hasAttachments?: Maybe<Scalars["Boolean"]["output"]>;
  id: Scalars["String"]["output"];
  includeNewParticipants: Scalars["Boolean"]["output"];
  isDefault: Scalars["Boolean"]["output"];
  isUnread?: Maybe<Scalars["Boolean"]["output"]>;
  keywords: Array<Scalars["String"]["output"]>;
  name: Scalars["String"]["output"];
  selectedContactIds: Array<Scalars["String"]["output"]>;
  selectedRoles: Array<ContactRoleType>;
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

export type EnhancedEmailThreadsFilterInput = {
  contactEmail?: InputMaybe<Scalars["String"]["input"]>;
  contactScope: ContactScopeType;
  dateFrom?: InputMaybe<Scalars["String"]["input"]>;
  dateTo?: InputMaybe<Scalars["String"]["input"]>;
  dealId?: InputMaybe<Scalars["String"]["input"]>;
  emailDirection?: InputMaybe<Scalars["String"]["input"]>;
  hasAttachments?: InputMaybe<Scalars["Boolean"]["input"]>;
  hasReplies?: InputMaybe<Scalars["Boolean"]["input"]>;
  includeNewParticipants?: InputMaybe<Scalars["Boolean"]["input"]>;
  isUnread?: InputMaybe<Scalars["Boolean"]["input"]>;
  keywords?: InputMaybe<Array<Scalars["String"]["input"]>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  pageToken?: InputMaybe<Scalars["String"]["input"]>;
  selectedContactIds?: InputMaybe<Array<Scalars["String"]["input"]>>;
  selectedRoles?: InputMaybe<Array<ContactRoleType>>;
};

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
  attachDocumentToNoteAndDeal: DualAttachmentResponse;
  attachFileToDeal: DealDocumentAttachment;
  bulkProcessEmailContactSuggestions: Array<EmailContactSuggestion>;
  bulkUpdateDealContactAssociations: Array<DealContactAssociation>;
  cancelActivityReminder: Scalars["Boolean"]["output"];
  composeEmail: EmailMessage;
  connectGoogleIntegration: GoogleIntegrationStatus;
  convertLead: LeadConversionResult;
  copyDriveFile: DriveFile;
  createActivity: Activity;
  createAgentConversation: AgentConversation;
  createCustomFieldDefinition: CustomFieldDefinition;
  createDeal: Deal;
  createDealContactAssociation: DealContactAssociation;
  createDealFolder: DriveFolderStructure;
  createDocument: Document;
  createEmail: Email;
  createEmailFilterPreset: EmailFilterPreset;
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
  deleteDealContactAssociation: Scalars["Boolean"]["output"];
  deleteDriveFile: Scalars["Boolean"]["output"];
  deleteEmailFilterPreset: Scalars["Boolean"]["output"];
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
  discoverEmailContacts: Array<EmailContactSuggestion>;
  dismissRelationshipInsight: Scalars["Boolean"]["output"];
  executeAgentStep: AgentResponse;
  linkEmailToDeal: Scalars["Boolean"]["output"];
  markAllNotificationsAsRead: Scalars["Int"]["output"];
  markNotificationAsRead: Notification;
  markThreadAsRead: Scalars["Boolean"]["output"];
  markThreadAsUnread: Scalars["Boolean"]["output"];
  moveDriveFile: DriveFile;
  moveStickersBulk: Array<SmartSticker>;
  processEmailContactSuggestion: EmailContactSuggestion;
  reactivateCustomFieldDefinition: CustomFieldDefinition;
  recalculateLeadScore: Lead;
  removeAccountFromTerritory: Scalars["Boolean"]["output"];
  removeDocumentAttachment: Scalars["Boolean"]["output"];
  removeNoteDocumentAttachment: Scalars["Boolean"]["output"];
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
  updateDealContactAssociation: DealContactAssociation;
  updateDealWFMProgress: Deal;
  updateDocumentAttachmentCategory: DealDocumentAttachment;
  updateEmailFilterPreset: EmailFilterPreset;
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
  updateUserEmailFilterPreferences: UserEmailFilterPreferences;
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

export type MutationAttachDocumentToNoteAndDealArgs = {
  input: AttachDocumentToNoteInput;
};

export type MutationAttachFileToDealArgs = {
  input: AttachFileInput;
};

export type MutationBulkProcessEmailContactSuggestionsArgs = {
  inputs: Array<ProcessEmailContactSuggestionInput>;
};

export type MutationBulkUpdateDealContactAssociationsArgs = {
  input: BulkUpdateDealContactAssociationsInput;
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

export type MutationCreateDealContactAssociationArgs = {
  input: CreateDealContactAssociationInput;
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

export type MutationCreateEmailFilterPresetArgs = {
  input: CreateEmailFilterPresetInput;
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

export type MutationDeleteDealContactAssociationArgs = {
  id: Scalars["String"]["input"];
};

export type MutationDeleteDriveFileArgs = {
  fileId: Scalars["String"]["input"];
};

export type MutationDeleteEmailFilterPresetArgs = {
  id: Scalars["String"]["input"];
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

export type MutationDiscoverEmailContactsArgs = {
  dealId: Scalars["String"]["input"];
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

export type MutationProcessEmailContactSuggestionArgs = {
  input: ProcessEmailContactSuggestionInput;
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

export type MutationRemoveNoteDocumentAttachmentArgs = {
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

export type MutationUpdateDealContactAssociationArgs = {
  input: UpdateDealContactAssociationInput;
};

export type MutationUpdateDealWfmProgressArgs = {
  dealId: Scalars["ID"]["input"];
  targetWfmWorkflowStepId: Scalars["ID"]["input"];
};

export type MutationUpdateDocumentAttachmentCategoryArgs = {
  attachmentId: Scalars["ID"]["input"];
  category: DocumentCategory;
};

export type MutationUpdateEmailFilterPresetArgs = {
  id: Scalars["String"]["input"];
  input: CreateEmailFilterPresetInput;
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

export type MutationUpdateUserEmailFilterPreferencesArgs = {
  input: UpdateUserEmailFilterPreferencesInput;
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
  dealAssociations: Array<DealContactAssociation>;
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

export type ProcessEmailContactSuggestionInput = {
  action: Scalars["String"]["input"];
  associationRole?: InputMaybe<ContactRoleType>;
  customRoleLabel?: InputMaybe<Scalars["String"]["input"]>;
  id: Scalars["String"]["input"];
};

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
  getDealContactAssociations: Array<DealContactAssociation>;
  getDealContactAssociationsWithDetails: Array<DealContactAssociationWithDetails>;
  getDealDocumentAttachments: Array<DealDocumentAttachment>;
  getDealDocuments: Array<DealDocumentAttachment>;
  getDealFolder?: Maybe<DriveFolder>;
  getDriveFile: DriveFile;
  getDriveFiles: DriveFileConnection;
  getDriveFolders: DriveFolderConnection;
  getEmailAnalytics?: Maybe<EmailAnalytics>;
  getEmailContactSuggestions: Array<EmailContactSuggestion>;
  getEmailMessage?: Maybe<EmailMessage>;
  getEmailThread?: Maybe<EmailThread>;
  getEmailThreads: EmailThreadConnection;
  getEmailThreadsEnhanced: EmailThreadConnection;
  getEntityDocuments: Array<Document>;
  getEntityEmails: Array<Email>;
  getEntityStickers: StickerConnection;
  getNoteDocumentAttachments: Array<NoteDocumentAttachment>;
  getPendingEmailContactSuggestions: Array<EmailContactSuggestion>;
  getPinnedStickers: StickerConnection;
  getRecentDriveFiles: DriveFileConnection;
  getRecentSharedDriveFiles: Array<DriveFile>;
  getSharedDriveFiles: Array<DriveFile>;
  getSharedDriveFolders: Array<DriveFolder>;
  getSharedDrives: Array<SharedDrive>;
  getSticker?: Maybe<SmartSticker>;
  getStickerCategories: Array<StickerCategory>;
  getUserEmailFilterPreferences: UserEmailFilterPreferences;
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

export type QueryGetDealContactAssociationsArgs = {
  dealId: Scalars["String"]["input"];
};

export type QueryGetDealContactAssociationsWithDetailsArgs = {
  dealId: Scalars["String"]["input"];
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

export type QueryGetEmailContactSuggestionsArgs = {
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

export type QueryGetEmailThreadsEnhancedArgs = {
  filter: EnhancedEmailThreadsFilterInput;
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

export type QueryGetPendingEmailContactSuggestionsArgs = {
  dealId: Scalars["String"]["input"];
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

export type UpdateDealContactAssociationInput = {
  customRoleLabel?: InputMaybe<Scalars["String"]["input"]>;
  id: Scalars["String"]["input"];
  includeInEmailFilter?: InputMaybe<Scalars["Boolean"]["input"]>;
  role?: InputMaybe<ContactRoleType>;
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

export type UpdateUserEmailFilterPreferencesInput = {
  autoDiscoverContacts?: InputMaybe<Scalars["Boolean"]["input"]>;
  defaultContactScope?: InputMaybe<ContactScopeType>;
  includeNewParticipants?: InputMaybe<Scalars["Boolean"]["input"]>;
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

export type UserEmailFilterPreferences = {
  __typename?: "UserEmailFilterPreferences";
  autoDiscoverContacts: Scalars["Boolean"]["output"];
  createdAt: Scalars["String"]["output"];
  defaultContactScope: ContactScopeType;
  id: Scalars["String"]["output"];
  includeNewParticipants: Scalars["Boolean"]["output"];
  savedFilterPresets: Array<EmailFilterPreset>;
  updatedAt: Scalars["String"]["output"];
  userId: Scalars["String"]["output"];
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

export type CreatePersonOrganizationalRoleMutationVariables = Exact<{
  input: CreatePersonOrganizationalRoleInput;
}>;

export type CreatePersonOrganizationalRoleMutation = {
  __typename?: "Mutation";
  createPersonOrganizationalRole: {
    __typename?: "PersonOrganizationalRole";
    id: string;
    roleTitle: string;
    department?: string | null;
    seniorityLevel?: SeniorityLevel | null;
    budgetAuthorityUsd?: number | null;
    teamSize?: number | null;
    startDate?: string | null;
    isPrimaryRole: boolean;
    notes?: string | null;
  };
};

export type CreateStakeholderAnalysisMutationVariables = Exact<{
  input: CreateStakeholderAnalysisInput;
}>;

export type CreateStakeholderAnalysisMutation = {
  __typename?: "Mutation";
  createStakeholderAnalysis: {
    __typename?: "StakeholderAnalysis";
    id: string;
    influenceScore?: number | null;
    decisionAuthority?: DecisionAuthority | null;
    engagementLevel?: EngagementLevel | null;
    approachStrategy?: string | null;
    nextBestAction?: string | null;
  };
};

export type GetPersonOrganizationalRolesQueryVariables = Exact<{
  personId: Scalars["ID"]["input"];
}>;

export type GetPersonOrganizationalRolesQuery = {
  __typename?: "Query";
  personOrganizationalRoles: Array<{
    __typename?: "PersonOrganizationalRole";
    id: string;
    roleTitle: string;
    department?: string | null;
    seniorityLevel?: SeniorityLevel | null;
    budgetAuthorityUsd?: number | null;
    teamSize?: number | null;
    startDate?: string | null;
    endDate?: string | null;
    isPrimaryRole: boolean;
    notes?: string | null;
    organization: { __typename?: "Organization"; id: string; name: string };
  }>;
};

export type CreatePersonOrgRoleEditMutationVariables = Exact<{
  input: CreatePersonOrganizationalRoleInput;
}>;

export type CreatePersonOrgRoleEditMutation = {
  __typename?: "Mutation";
  createPersonOrganizationalRole: {
    __typename?: "PersonOrganizationalRole";
    id: string;
    roleTitle: string;
    department?: string | null;
    seniorityLevel?: SeniorityLevel | null;
    isPrimaryRole: boolean;
    person: {
      __typename?: "Person";
      id: string;
      first_name?: string | null;
      last_name?: string | null;
    };
    organization: { __typename?: "Organization"; id: string; name: string };
  };
};

export type UpdatePersonOrgRoleMutationVariables = Exact<{
  id: Scalars["ID"]["input"];
  input: CreatePersonOrganizationalRoleInput;
}>;

export type UpdatePersonOrgRoleMutation = {
  __typename?: "Mutation";
  updatePersonOrganizationalRole: {
    __typename?: "PersonOrganizationalRole";
    id: string;
    roleTitle: string;
    department?: string | null;
    seniorityLevel?: SeniorityLevel | null;
    budgetAuthorityUsd?: number | null;
    teamSize?: number | null;
    startDate?: string | null;
    endDate?: string | null;
    isPrimaryRole: boolean;
    notes?: string | null;
    organization: { __typename?: "Organization"; id: string; name: string };
  };
};

export type DeletePersonOrganizationalRoleMutationVariables = Exact<{
  id: Scalars["ID"]["input"];
}>;

export type DeletePersonOrganizationalRoleMutation = {
  __typename?: "Mutation";
  deletePersonOrganizationalRole: boolean;
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

export type GetMyNotificationsQueryVariables = Exact<{
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
}>;

export type GetMyNotificationsQuery = {
  __typename?: "Query";
  myNotifications: {
    __typename?: "NotificationSummary";
    totalCount: number;
    unreadCount: number;
    notifications: Array<{
      __typename?: "Notification";
      id: string;
      userId: string;
      title: string;
      message: string;
      notificationType: NotificationType;
      isRead: boolean;
      readAt?: string | null;
      entityType?: string | null;
      entityId?: string | null;
      actionUrl?: string | null;
      metadata?: Record<string, any> | null;
      priority: NotificationPriority;
      expiresAt?: string | null;
      createdAt: string;
      updatedAt: string;
    }>;
  };
};

export type GetUnreadNotificationCountQueryVariables = Exact<{
  [key: string]: never;
}>;

export type GetUnreadNotificationCountQuery = {
  __typename?: "Query";
  unreadNotificationCount: number;
};

export type MarkNotificationAsReadMutationVariables = Exact<{
  id: Scalars["ID"]["input"];
}>;

export type MarkNotificationAsReadMutation = {
  __typename?: "Mutation";
  markNotificationAsRead: {
    __typename?: "Notification";
    id: string;
    isRead: boolean;
    readAt?: string | null;
  };
};

export type MarkAllNotificationsAsReadMutationVariables = Exact<{
  [key: string]: never;
}>;

export type MarkAllNotificationsAsReadMutation = {
  __typename?: "Mutation";
  markAllNotificationsAsRead: number;
};

export type DeleteNotificationMutationVariables = Exact<{
  id: Scalars["ID"]["input"];
}>;

export type DeleteNotificationMutation = {
  __typename?: "Mutation";
  deleteNotification: boolean;
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

export type CreateTaskFromEmailMutationVariables = Exact<{
  input: CreateTaskFromEmailInput;
}>;

export type CreateTaskFromEmailMutation = {
  __typename?: "Mutation";
  createTaskFromEmail: {
    __typename?: "Activity";
    id: string;
    subject: string;
    notes?: string | null;
    due_date?: string | null;
  };
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

export type GetMyReminderPreferencesQueryVariables = Exact<{
  [key: string]: never;
}>;

export type GetMyReminderPreferencesQuery = {
  __typename?: "Query";
  myReminderPreferences?: {
    __typename?: "UserReminderPreferences";
    id: string;
    userId: string;
    emailRemindersEnabled: boolean;
    emailReminderMinutesBefore: number;
    emailDailyDigestEnabled: boolean;
    emailDailyDigestTime: string;
    inAppRemindersEnabled: boolean;
    inAppReminderMinutesBefore: number;
    pushRemindersEnabled: boolean;
    pushReminderMinutesBefore: number;
    overdueNotificationsEnabled: boolean;
    overdueNotificationFrequencyHours: number;
    createdAt: string;
    updatedAt: string;
  } | null;
};

export type UpdateMyReminderPreferencesMutationVariables = Exact<{
  input: UpdateUserReminderPreferencesInput;
}>;

export type UpdateMyReminderPreferencesMutation = {
  __typename?: "Mutation";
  updateMyReminderPreferences: {
    __typename?: "UserReminderPreferences";
    id: string;
    userId: string;
    emailRemindersEnabled: boolean;
    emailReminderMinutesBefore: number;
    emailDailyDigestEnabled: boolean;
    emailDailyDigestTime: string;
    inAppRemindersEnabled: boolean;
    inAppReminderMinutesBefore: number;
    pushRemindersEnabled: boolean;
    pushReminderMinutesBefore: number;
    overdueNotificationsEnabled: boolean;
    overdueNotificationFrequencyHours: number;
    updatedAt: string;
  };
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

export type GetDealsForNetworkQueryVariables = Exact<{ [key: string]: never }>;

export type GetDealsForNetworkQuery = {
  __typename?: "Query";
  deals: Array<{
    __typename?: "Deal";
    id: string;
    name: string;
    amount?: number | null;
    expected_close_date?: string | null;
    organization_id?: string | null;
    currentWfmStatus?: {
      __typename?: "WFMStatus";
      name: string;
      color?: string | null;
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
    } | null;
  }>;
};

export type GetLeadsForNetworkQueryVariables = Exact<{
  filters?: InputMaybe<LeadFilters>;
}>;

export type GetLeadsForNetworkQuery = {
  __typename?: "Query";
  leads: Array<{
    __typename?: "Lead";
    id: string;
    name: string;
    lead_score: number;
    qualificationStatus: string;
    estimated_value?: number | null;
    contact_name?: string | null;
    contact_email?: string | null;
    company_name?: string | null;
    assignedToUser?: {
      __typename?: "User";
      id: string;
      display_name?: string | null;
    } | null;
  }>;
};

export type GetOrganizationsForNetworkQueryVariables = Exact<{
  [key: string]: never;
}>;

export type GetOrganizationsForNetworkQuery = {
  __typename?: "Query";
  organizations: Array<{
    __typename?: "Organization";
    id: string;
    name: string;
    address?: string | null;
    notes?: string | null;
  }>;
};

export type GetStakeholderAnalysesForNetworkQueryVariables = Exact<{
  organizationId?: InputMaybe<Scalars["ID"]["input"]>;
  dealId?: InputMaybe<Scalars["ID"]["input"]>;
  leadId?: InputMaybe<Scalars["ID"]["input"]>;
}>;

export type GetStakeholderAnalysesForNetworkQuery = {
  __typename?: "Query";
  stakeholderAnalyses: Array<{
    __typename?: "StakeholderAnalysis";
    id: string;
    influenceScore?: number | null;
    decisionAuthority?: DecisionAuthority | null;
    engagementLevel?: EngagementLevel | null;
    person: {
      __typename?: "Person";
      id: string;
      first_name?: string | null;
      last_name?: string | null;
      email?: string | null;
      organization_id?: string | null;
    };
    organization: { __typename?: "Organization"; id: string; name: string };
  }>;
};

export type GetPersonRelationshipsForNetworkQueryVariables = Exact<{
  organizationId: Scalars["ID"]["input"];
}>;

export type GetPersonRelationshipsForNetworkQuery = {
  __typename?: "Query";
  organizationPersonRelationships: Array<{
    __typename?: "PersonRelationship";
    id: string;
    relationshipType: PersonRelationshipType;
    relationshipStrength?: number | null;
    fromPerson: {
      __typename?: "Person";
      id: string;
      first_name?: string | null;
      last_name?: string | null;
    };
    toPerson: {
      __typename?: "Person";
      id: string;
      first_name?: string | null;
      last_name?: string | null;
    };
  }>;
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

export type GetStakeholderAnalysesQueryVariables = Exact<{
  organizationId: Scalars["ID"]["input"];
}>;

export type GetStakeholderAnalysesQuery = {
  __typename?: "Query";
  stakeholderAnalyses: Array<{
    __typename?: "StakeholderAnalysis";
    id: string;
    influenceScore?: number | null;
    decisionAuthority?: DecisionAuthority | null;
    engagementLevel?: EngagementLevel | null;
    approachStrategy?: string | null;
    nextBestAction?: string | null;
    createdAt: string;
    updatedAt: string;
    person: {
      __typename?: "Person";
      id: string;
      first_name?: string | null;
      last_name?: string | null;
    };
    organization: { __typename?: "Organization"; id: string; name: string };
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

export type GetActivitiesQueryVariables = Exact<{
  filter?: InputMaybe<ActivityFilterInput>;
}>;

export type GetActivitiesQuery = {
  __typename?: "Query";
  activities: Array<{
    __typename?: "Activity";
    id: string;
    user_id: string;
    created_at: string;
    updated_at: string;
    type: ActivityType;
    subject: string;
    due_date?: string | null;
    is_done: boolean;
    notes?: string | null;
    deal_id?: string | null;
    person_id?: string | null;
    organization_id?: string | null;
    deal?: { __typename?: "Deal"; id: string; name: string } | null;
    person?: {
      __typename?: "Person";
      id: string;
      first_name?: string | null;
      last_name?: string | null;
    } | null;
    organization?: {
      __typename?: "Organization";
      id: string;
      name: string;
    } | null;
  }>;
};

export type CreateActivityMutationVariables = Exact<{
  input: CreateActivityInput;
}>;

export type CreateActivityMutation = {
  __typename?: "Mutation";
  createActivity: {
    __typename?: "Activity";
    id: string;
    user_id: string;
    created_at: string;
    updated_at: string;
    type: ActivityType;
    subject: string;
    due_date?: string | null;
    is_done: boolean;
    notes?: string | null;
    deal_id?: string | null;
    person_id?: string | null;
    organization_id?: string | null;
    deal?: { __typename?: "Deal"; id: string; name: string } | null;
    person?: {
      __typename?: "Person";
      id: string;
      first_name?: string | null;
      last_name?: string | null;
    } | null;
    organization?: {
      __typename?: "Organization";
      id: string;
      name: string;
    } | null;
  };
};

export type UpdateActivityMutationVariables = Exact<{
  id: Scalars["ID"]["input"];
  input: UpdateActivityInput;
}>;

export type UpdateActivityMutation = {
  __typename?: "Mutation";
  updateActivity: {
    __typename?: "Activity";
    id: string;
    user_id: string;
    created_at: string;
    updated_at: string;
    type: ActivityType;
    subject: string;
    due_date?: string | null;
    is_done: boolean;
    notes?: string | null;
    deal_id?: string | null;
    person_id?: string | null;
    organization_id?: string | null;
    deal?: { __typename?: "Deal"; id: string; name: string } | null;
    person?: {
      __typename?: "Person";
      id: string;
      first_name?: string | null;
      last_name?: string | null;
    } | null;
    organization?: {
      __typename?: "Organization";
      id: string;
      name: string;
    } | null;
  };
};

export type DeleteActivityMutationVariables = Exact<{
  id: Scalars["ID"]["input"];
}>;

export type DeleteActivityMutation = {
  __typename?: "Mutation";
  deleteActivity: string;
};

export type GetActivityByIdQueryVariables = Exact<{
  id: Scalars["ID"]["input"];
}>;

export type GetActivityByIdQuery = {
  __typename?: "Query";
  activity?: {
    __typename?: "Activity";
    id: string;
    type: ActivityType;
    subject: string;
    due_date?: string | null;
    is_done: boolean;
    notes?: string | null;
    created_at: string;
    updated_at: string;
    is_system_activity: boolean;
    assigned_to_user_id?: string | null;
    user?: {
      __typename?: "User";
      id: string;
      email: string;
      display_name?: string | null;
    } | null;
    assignedToUser?: {
      __typename?: "User";
      id: string;
      email: string;
      display_name?: string | null;
      avatar_url?: string | null;
    } | null;
    deal?: { __typename?: "Deal"; id: string; name: string } | null;
    person?: {
      __typename?: "Person";
      id: string;
      first_name?: string | null;
      last_name?: string | null;
    } | null;
    organization?: {
      __typename?: "Organization";
      id: string;
      name: string;
    } | null;
  } | null;
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
    expected_close_date?: string | null;
    created_at: string;
    updated_at: string;
    deal_specific_probability?: number | null;
    weighted_amount?: number | null;
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

export type ActivitySummaryFieldsFragment = {
  __typename?: "Activity";
  id: string;
  type: ActivityType;
  subject: string;
  due_date?: string | null;
  is_done: boolean;
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
    activities: Array<{
      __typename?: "Activity";
      id: string;
      type: ActivityType;
      subject: string;
      due_date?: string | null;
      is_done: boolean;
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
    activities: Array<{
      __typename?: "Activity";
      id: string;
      type: ActivityType;
      subject: string;
      due_date?: string | null;
      is_done: boolean;
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
    organization_id?: string | null;
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
    organization_id?: string | null;
    organization?: {
      __typename?: "Organization";
      id: string;
      name: string;
    } | null;
    deals?: Array<{
      __typename?: "Deal";
      id: string;
      name: string;
      amount?: number | null;
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
    organization_id?: string | null;
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
    organization_id?: string | null;
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
