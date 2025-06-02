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
  Date: { input: any; output: any };
  DateTime: { input: Date; output: Date };
  JSON: { input: { [key: string]: any }; output: { [key: string]: any } };
};

/** AI-powered activity recommendation system for intelligent sales assistance. */
export type AiActivityRecommendation = {
  __typename?: "AIActivityRecommendation";
  confidence: Scalars["Float"]["output"];
  notes: Scalars["String"]["output"];
  reasoning: Scalars["String"]["output"];
  subject: Scalars["String"]["output"];
  suggestedDueDate: Scalars["Date"]["output"];
  type: ActivityType;
};

export type AiActivityRecommendationsResponse = {
  __typename?: "AIActivityRecommendationsResponse";
  contextSummary: Scalars["String"]["output"];
  primaryRecommendation: AiActivityRecommendation;
  recommendations: Array<AiActivityRecommendation>;
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
  organizationId?: InputMaybe<Scalars["ID"]["input"]>;
  personId?: InputMaybe<Scalars["ID"]["input"]>;
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

/** Represents an additional cost item associated with a price quote. */
export type AdditionalCost = {
  __typename?: "AdditionalCost";
  amount: Scalars["Float"]["output"];
  created_at: Scalars["DateTime"]["output"];
  description: Scalars["String"]["output"];
  id: Scalars["ID"]["output"];
  updated_at: Scalars["DateTime"]["output"];
};

/** Input for creating an additional cost item. */
export type AdditionalCostInput = {
  amount: Scalars["Float"]["input"];
  description: Scalars["String"]["input"];
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

export type CreateActivityInput = {
  deal_id?: InputMaybe<Scalars["ID"]["input"]>;
  due_date?: InputMaybe<Scalars["DateTime"]["input"]>;
  is_done?: InputMaybe<Scalars["Boolean"]["input"]>;
  notes?: InputMaybe<Scalars["String"]["input"]>;
  organization_id?: InputMaybe<Scalars["ID"]["input"]>;
  person_id?: InputMaybe<Scalars["ID"]["input"]>;
  subject: Scalars["String"]["input"];
  type: ActivityType;
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

/** Represents a single entry in the invoice payment schedule for a price quote. */
export type InvoiceScheduleEntry = {
  __typename?: "InvoiceScheduleEntry";
  amount_due: Scalars["Float"]["output"];
  created_at: Scalars["DateTime"]["output"];
  description?: Maybe<Scalars["String"]["output"]>;
  due_date: Scalars["String"]["output"];
  entry_type: Scalars["String"]["output"];
  id: Scalars["ID"]["output"];
  updated_at: Scalars["DateTime"]["output"];
};

export type Lead = {
  __typename?: "Lead";
  activities: Array<Activity>;
  assignedToUser?: Maybe<User>;
  assigned_to_user_id?: Maybe<Scalars["ID"]["output"]>;
  company_name?: Maybe<Scalars["String"]["output"]>;
  contact_email?: Maybe<Scalars["String"]["output"]>;
  contact_name?: Maybe<Scalars["String"]["output"]>;
  contact_phone?: Maybe<Scalars["String"]["output"]>;
  converted_at?: Maybe<Scalars["DateTime"]["output"]>;
  converted_to_deal?: Maybe<Deal>;
  converted_to_deal_id?: Maybe<Scalars["ID"]["output"]>;
  createdBy: User;
  created_at: Scalars["DateTime"]["output"];
  currentWfmStatus?: Maybe<WfmStatus>;
  currentWfmStep?: Maybe<WfmWorkflowStep>;
  customFieldValues: Array<CustomFieldValue>;
  custom_field_values?: Maybe<Scalars["JSON"]["output"]>;
  description?: Maybe<Scalars["String"]["output"]>;
  estimated_close_date?: Maybe<Scalars["DateTime"]["output"]>;
  estimated_value?: Maybe<Scalars["Float"]["output"]>;
  history?: Maybe<Array<LeadHistoryEntry>>;
  id: Scalars["ID"]["output"];
  is_qualified?: Maybe<Scalars["Boolean"]["output"]>;
  last_contacted_at?: Maybe<Scalars["DateTime"]["output"]>;
  lead_score?: Maybe<Scalars["Int"]["output"]>;
  lead_source?: Maybe<Scalars["String"]["output"]>;
  lead_source_detail?: Maybe<Scalars["String"]["output"]>;
  next_follow_up_date?: Maybe<Scalars["DateTime"]["output"]>;
  notes?: Maybe<Scalars["String"]["output"]>;
  organization?: Maybe<Organization>;
  organization_id?: Maybe<Scalars["ID"]["output"]>;
  person?: Maybe<Person>;
  person_id?: Maybe<Scalars["ID"]["output"]>;
  priority?: Maybe<LeadPriority>;
  qualification_notes?: Maybe<Scalars["String"]["output"]>;
  tags?: Maybe<Array<Scalars["String"]["output"]>>;
  title: Scalars["String"]["output"];
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
  amount?: InputMaybe<Scalars["Float"]["input"]>;
  deal_specific_probability?: InputMaybe<Scalars["Float"]["input"]>;
  expected_close_date?: InputMaybe<Scalars["DateTime"]["input"]>;
  name?: InputMaybe<Scalars["String"]["input"]>;
};

export type LeadConversionResult = {
  __typename?: "LeadConversionResult";
  deal: Deal;
  lead: Lead;
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
  company_name?: InputMaybe<Scalars["String"]["input"]>;
  contact_email?: InputMaybe<Scalars["String"]["input"]>;
  contact_name?: InputMaybe<Scalars["String"]["input"]>;
  contact_phone?: InputMaybe<Scalars["String"]["input"]>;
  customFields?: InputMaybe<Array<CustomFieldValueInput>>;
  description?: InputMaybe<Scalars["String"]["input"]>;
  estimated_close_date?: InputMaybe<Scalars["DateTime"]["input"]>;
  estimated_value?: InputMaybe<Scalars["Float"]["input"]>;
  lead_score?: InputMaybe<Scalars["Int"]["input"]>;
  lead_source?: InputMaybe<Scalars["String"]["input"]>;
  lead_source_detail?: InputMaybe<Scalars["String"]["input"]>;
  next_follow_up_date?: InputMaybe<Scalars["DateTime"]["input"]>;
  notes?: InputMaybe<Scalars["String"]["input"]>;
  organization_id?: InputMaybe<Scalars["ID"]["input"]>;
  person_id?: InputMaybe<Scalars["ID"]["input"]>;
  priority?: InputMaybe<LeadPriority>;
  qualification_notes?: InputMaybe<Scalars["String"]["input"]>;
  tags?: InputMaybe<Array<Scalars["String"]["input"]>>;
  title: Scalars["String"]["input"];
};

export enum LeadPriority {
  High = "HIGH",
  Low = "LOW",
  Medium = "MEDIUM",
  Urgent = "URGENT",
}

export type LeadUpdateInput = {
  assignedToUserId?: InputMaybe<Scalars["ID"]["input"]>;
  company_name?: InputMaybe<Scalars["String"]["input"]>;
  contact_email?: InputMaybe<Scalars["String"]["input"]>;
  contact_name?: InputMaybe<Scalars["String"]["input"]>;
  contact_phone?: InputMaybe<Scalars["String"]["input"]>;
  customFields?: InputMaybe<Array<CustomFieldValueInput>>;
  description?: InputMaybe<Scalars["String"]["input"]>;
  estimated_close_date?: InputMaybe<Scalars["DateTime"]["input"]>;
  estimated_value?: InputMaybe<Scalars["Float"]["input"]>;
  is_qualified?: InputMaybe<Scalars["Boolean"]["input"]>;
  lead_score?: InputMaybe<Scalars["Int"]["input"]>;
  lead_source?: InputMaybe<Scalars["String"]["input"]>;
  lead_source_detail?: InputMaybe<Scalars["String"]["input"]>;
  next_follow_up_date?: InputMaybe<Scalars["DateTime"]["input"]>;
  notes?: InputMaybe<Scalars["String"]["input"]>;
  organization_id?: InputMaybe<Scalars["ID"]["input"]>;
  person_id?: InputMaybe<Scalars["ID"]["input"]>;
  priority?: InputMaybe<LeadPriority>;
  qualification_notes?: InputMaybe<Scalars["String"]["input"]>;
  tags?: InputMaybe<Array<Scalars["String"]["input"]>>;
  title?: InputMaybe<Scalars["String"]["input"]>;
};

export type Mutation = {
  __typename?: "Mutation";
  addAgentThoughts: Array<AgentThought>;
  /** Calculates a preview of a price quote. dealId is optional. */
  calculatePriceQuotePreview: PriceQuote;
  convertLeadToDeal: LeadConversionResult;
  createActivity: Activity;
  createAgentConversation: AgentConversation;
  createCustomFieldDefinition: CustomFieldDefinition;
  createDeal: Deal;
  createLead: Lead;
  createOrganization: Organization;
  createPerson: Person;
  /** Creates a new price quote for a given deal. */
  createPriceQuote: PriceQuote;
  createWFMProjectType: WfmProjectType;
  createWFMStatus: WfmStatus;
  createWFMWorkflow: WfmWorkflow;
  createWFMWorkflowStep: WfmWorkflowStep;
  createWFMWorkflowTransition: WfmWorkflowTransition;
  deactivateCustomFieldDefinition: CustomFieldDefinition;
  deleteActivity: Scalars["ID"]["output"];
  deleteAgentConversation: Scalars["Boolean"]["output"];
  deleteDeal?: Maybe<Scalars["Boolean"]["output"]>;
  deleteLead: Scalars["Boolean"]["output"];
  deleteOrganization?: Maybe<Scalars["Boolean"]["output"]>;
  deletePerson?: Maybe<Scalars["Boolean"]["output"]>;
  /** Deletes a price quote. */
  deletePriceQuote?: Maybe<Scalars["Boolean"]["output"]>;
  deleteWFMWorkflowStep: WfmWorkflowStepMutationResponse;
  deleteWFMWorkflowTransition: WfmWorkflowTransitionMutationResponse;
  deleteWfmStatus: WfmStatusMutationResponse;
  executeAgentStep: AgentResponse;
  reactivateCustomFieldDefinition: CustomFieldDefinition;
  sendAgentMessage: AgentResponse;
  updateActivity: Activity;
  updateAgentConversation: AgentConversation;
  updateCustomFieldDefinition: CustomFieldDefinition;
  updateDeal?: Maybe<Deal>;
  updateDealWFMProgress: Deal;
  updateLead: Lead;
  updateLeadWFMProgress: Lead;
  updateOrganization?: Maybe<Organization>;
  updatePerson?: Maybe<Person>;
  /** Updates an existing price quote. */
  updatePriceQuote: PriceQuote;
  /** Updates the profile for the currently authenticated user. */
  updateUserProfile?: Maybe<User>;
  updateWFMProjectType: WfmProjectType;
  updateWFMStatus: WfmStatus;
  updateWFMWorkflow: WfmWorkflow;
  updateWFMWorkflowStep: WfmWorkflowStep;
  updateWFMWorkflowStepsOrder?: Maybe<WfmWorkflow>;
  updateWFMWorkflowTransition: WfmWorkflowTransition;
};

export type MutationAddAgentThoughtsArgs = {
  conversationId: Scalars["ID"]["input"];
  thoughts: Array<AgentThoughtInput>;
};

export type MutationCalculatePriceQuotePreviewArgs = {
  dealId?: InputMaybe<Scalars["ID"]["input"]>;
  input: PriceQuoteUpdateInput;
};

export type MutationConvertLeadToDealArgs = {
  dealData?: InputMaybe<LeadConversionInput>;
  leadId: Scalars["ID"]["input"];
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

export type MutationCreateLeadArgs = {
  input: LeadInput;
};

export type MutationCreateOrganizationArgs = {
  input: OrganizationInput;
};

export type MutationCreatePersonArgs = {
  input: PersonInput;
};

export type MutationCreatePriceQuoteArgs = {
  dealId: Scalars["ID"]["input"];
  input: PriceQuoteCreateInput;
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

export type MutationDeleteLeadArgs = {
  id: Scalars["ID"]["input"];
};

export type MutationDeleteOrganizationArgs = {
  id: Scalars["ID"]["input"];
};

export type MutationDeletePersonArgs = {
  id: Scalars["ID"]["input"];
};

export type MutationDeletePriceQuoteArgs = {
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

export type MutationExecuteAgentStepArgs = {
  conversationId: Scalars["ID"]["input"];
  stepId: Scalars["String"]["input"];
};

export type MutationReactivateCustomFieldDefinitionArgs = {
  id: Scalars["ID"]["input"];
};

export type MutationSendAgentMessageArgs = {
  input: SendMessageInput;
};

export type MutationUpdateActivityArgs = {
  id: Scalars["ID"]["input"];
  input: UpdateActivityInput;
};

export type MutationUpdateAgentConversationArgs = {
  input: UpdateConversationInput;
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

export type MutationUpdateLeadArgs = {
  id: Scalars["ID"]["input"];
  input: LeadUpdateInput;
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

export type MutationUpdatePriceQuoteArgs = {
  id: Scalars["ID"]["input"];
  input: PriceQuoteUpdateInput;
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

export type PersonUpdateInput = {
  customFields?: InputMaybe<Array<CustomFieldValueInput>>;
  email?: InputMaybe<Scalars["String"]["input"]>;
  first_name?: InputMaybe<Scalars["String"]["input"]>;
  last_name?: InputMaybe<Scalars["String"]["input"]>;
  notes?: InputMaybe<Scalars["String"]["input"]>;
  organization_id?: InputMaybe<Scalars["ID"]["input"]>;
  phone?: InputMaybe<Scalars["String"]["input"]>;
};

/** Represents a price quotation for a deal, including calculated financial metrics and payment terms. */
export type PriceQuote = {
  __typename?: "PriceQuote";
  /** List of additional costs associated with this price quote. */
  additional_costs: Array<AdditionalCost>;
  base_minimum_price_mp?: Maybe<Scalars["Float"]["output"]>;
  calculated_discounted_offer_price?: Maybe<Scalars["Float"]["output"]>;
  calculated_effective_markup_fop_over_mp?: Maybe<Scalars["Float"]["output"]>;
  calculated_full_target_price_ftp?: Maybe<Scalars["Float"]["output"]>;
  calculated_target_price_tp?: Maybe<Scalars["Float"]["output"]>;
  calculated_total_direct_cost?: Maybe<Scalars["Float"]["output"]>;
  created_at: Scalars["DateTime"]["output"];
  /** Associated deal for this price quote. */
  deal?: Maybe<Deal>;
  deal_id: Scalars["ID"]["output"];
  escalation_details?: Maybe<Scalars["JSON"]["output"]>;
  escalation_status?: Maybe<Scalars["String"]["output"]>;
  final_offer_price_fop?: Maybe<Scalars["Float"]["output"]>;
  id: Scalars["ID"]["output"];
  /** Generated invoice payment schedule for this price quote. */
  invoice_schedule_entries: Array<InvoiceScheduleEntry>;
  name?: Maybe<Scalars["String"]["output"]>;
  overall_discount_percentage?: Maybe<Scalars["Float"]["output"]>;
  status: Scalars["String"]["output"];
  subsequent_installments_count?: Maybe<Scalars["Int"]["output"]>;
  subsequent_installments_interval_days?: Maybe<Scalars["Int"]["output"]>;
  target_markup_percentage?: Maybe<Scalars["Float"]["output"]>;
  updated_at: Scalars["DateTime"]["output"];
  upfront_payment_due_days?: Maybe<Scalars["Int"]["output"]>;
  upfront_payment_percentage?: Maybe<Scalars["Float"]["output"]>;
  /** User who created or owns this price quote. */
  user?: Maybe<User>;
  user_id: Scalars["ID"]["output"];
  version_number: Scalars["Int"]["output"];
};

/** Input for creating a new price quote. */
export type PriceQuoteCreateInput = {
  additional_costs?: InputMaybe<Array<AdditionalCostInput>>;
  base_minimum_price_mp?: InputMaybe<Scalars["Float"]["input"]>;
  final_offer_price_fop?: InputMaybe<Scalars["Float"]["input"]>;
  name?: InputMaybe<Scalars["String"]["input"]>;
  overall_discount_percentage?: InputMaybe<Scalars["Float"]["input"]>;
  subsequent_installments_count?: InputMaybe<Scalars["Int"]["input"]>;
  subsequent_installments_interval_days?: InputMaybe<Scalars["Int"]["input"]>;
  target_markup_percentage?: InputMaybe<Scalars["Float"]["input"]>;
  upfront_payment_due_days?: InputMaybe<Scalars["Int"]["input"]>;
  upfront_payment_percentage?: InputMaybe<Scalars["Float"]["input"]>;
};

/** Input for updating an existing price quote. */
export type PriceQuoteUpdateInput = {
  additional_costs?: InputMaybe<Array<AdditionalCostInput>>;
  base_minimum_price_mp?: InputMaybe<Scalars["Float"]["input"]>;
  final_offer_price_fop?: InputMaybe<Scalars["Float"]["input"]>;
  name?: InputMaybe<Scalars["String"]["input"]>;
  overall_discount_percentage?: InputMaybe<Scalars["Float"]["input"]>;
  status?: InputMaybe<Scalars["String"]["input"]>;
  subsequent_installments_count?: InputMaybe<Scalars["Int"]["input"]>;
  subsequent_installments_interval_days?: InputMaybe<Scalars["Int"]["input"]>;
  target_markup_percentage?: InputMaybe<Scalars["Float"]["input"]>;
  upfront_payment_due_days?: InputMaybe<Scalars["Int"]["input"]>;
  upfront_payment_percentage?: InputMaybe<Scalars["Float"]["input"]>;
};

export type Query = {
  __typename?: "Query";
  activities: Array<Activity>;
  activity?: Maybe<Activity>;
  agentConversation?: Maybe<AgentConversation>;
  agentConversations: Array<AgentConversation>;
  agentThoughts: Array<AgentThought>;
  customFieldDefinition?: Maybe<CustomFieldDefinition>;
  customFieldDefinitions: Array<CustomFieldDefinition>;
  deal?: Maybe<Deal>;
  deals: Array<Deal>;
  discoverAgentTools: ToolDiscoveryResponse;
  /**
   * Get AI-powered activity recommendations for a specific deal.
   * Analyzes deal context, contact information, recent activities, and workflow status
   * to suggest the most effective next activities to advance the deal.
   */
  getAIActivityRecommendations: AiActivityRecommendationsResponse;
  getWfmAllowedTransitions: Array<WfmWorkflowTransition>;
  health: Scalars["String"]["output"];
  lead?: Maybe<Lead>;
  leads: Array<Lead>;
  me?: Maybe<User>;
  myPermissions?: Maybe<Array<Scalars["String"]["output"]>>;
  organization?: Maybe<Organization>;
  organizations: Array<Organization>;
  people: Array<Person>;
  person?: Maybe<Person>;
  personList: Array<PersonListItem>;
  /** Retrieves a single price quote by its ID. */
  priceQuote?: Maybe<PriceQuote>;
  /** Retrieves all price quotes associated with a specific deal. */
  priceQuotesForDeal: Array<PriceQuote>;
  supabaseConnectionTest: Scalars["String"]["output"];
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
  id: Scalars["ID"]["input"];
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

export type QueryGetAiActivityRecommendationsArgs = {
  dealId: Scalars["ID"]["input"];
};

export type QueryGetWfmAllowedTransitionsArgs = {
  fromStepId: Scalars["ID"]["input"];
  workflowId: Scalars["ID"]["input"];
};

export type QueryLeadArgs = {
  id: Scalars["ID"]["input"];
};

export type QueryOrganizationArgs = {
  id: Scalars["ID"]["input"];
};

export type QueryPersonArgs = {
  id: Scalars["ID"]["input"];
};

export type QueryPriceQuoteArgs = {
  id: Scalars["ID"]["input"];
};

export type QueryPriceQuotesForDealArgs = {
  dealId: Scalars["ID"]["input"];
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

export type SendMessageInput = {
  config?: InputMaybe<AgentConfigInput>;
  content: Scalars["String"]["input"];
  conversationId?: InputMaybe<Scalars["ID"]["input"]>;
};

export enum StageType {
  Lost = "LOST",
  Open = "OPEN",
  Won = "WON",
}

export type Subscription = {
  __typename?: "Subscription";
  agentConversationUpdated: AgentConversation;
  agentPlanUpdated: AgentPlan;
  agentThoughtsAdded: Array<AgentThought>;
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
  deal_id?: InputMaybe<Scalars["ID"]["input"]>;
  due_date?: InputMaybe<Scalars["DateTime"]["input"]>;
  is_done?: InputMaybe<Scalars["Boolean"]["input"]>;
  notes?: InputMaybe<Scalars["String"]["input"]>;
  organization_id?: InputMaybe<Scalars["ID"]["input"]>;
  person_id?: InputMaybe<Scalars["ID"]["input"]>;
  subject?: InputMaybe<Scalars["String"]["input"]>;
  type?: InputMaybe<ActivityType>;
};

export type UpdateConversationInput = {
  context?: InputMaybe<Scalars["JSON"]["input"]>;
  conversationId: Scalars["ID"]["input"];
  plan?: InputMaybe<Scalars["JSON"]["input"]>;
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

export type User = {
  __typename?: "User";
  avatar_url?: Maybe<Scalars["String"]["output"]>;
  display_name?: Maybe<Scalars["String"]["output"]>;
  email: Scalars["String"]["output"];
  id: Scalars["ID"]["output"];
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
  AIActivityRecommendation: ResolverTypeWrapper<AiActivityRecommendation>;
  AIActivityRecommendationsResponse: ResolverTypeWrapper<AiActivityRecommendationsResponse>;
  Activity: ResolverTypeWrapper<Activity>;
  ActivityFilterInput: ActivityFilterInput;
  ActivityType: ActivityType;
  AdditionalCost: ResolverTypeWrapper<AdditionalCost>;
  AdditionalCostInput: AdditionalCostInput;
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
  Boolean: ResolverTypeWrapper<Scalars["Boolean"]["output"]>;
  CreateActivityInput: CreateActivityInput;
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
  Date: ResolverTypeWrapper<Scalars["Date"]["output"]>;
  DateTime: ResolverTypeWrapper<Scalars["DateTime"]["output"]>;
  Deal: ResolverTypeWrapper<Deal>;
  DealHistoryEntry: ResolverTypeWrapper<DealHistoryEntry>;
  DealInput: DealInput;
  DealUpdateInput: DealUpdateInput;
  Float: ResolverTypeWrapper<Scalars["Float"]["output"]>;
  ID: ResolverTypeWrapper<Scalars["ID"]["output"]>;
  Int: ResolverTypeWrapper<Scalars["Int"]["output"]>;
  InvoiceScheduleEntry: ResolverTypeWrapper<InvoiceScheduleEntry>;
  JSON: ResolverTypeWrapper<Scalars["JSON"]["output"]>;
  Lead: ResolverTypeWrapper<Lead>;
  LeadConversionInput: LeadConversionInput;
  LeadConversionResult: ResolverTypeWrapper<LeadConversionResult>;
  LeadHistoryEntry: ResolverTypeWrapper<LeadHistoryEntry>;
  LeadInput: LeadInput;
  LeadPriority: LeadPriority;
  LeadUpdateInput: LeadUpdateInput;
  Mutation: ResolverTypeWrapper<{}>;
  Organization: ResolverTypeWrapper<Organization>;
  OrganizationInput: OrganizationInput;
  OrganizationUpdateInput: OrganizationUpdateInput;
  Person: ResolverTypeWrapper<Person>;
  PersonInput: PersonInput;
  PersonListItem: ResolverTypeWrapper<PersonListItem>;
  PersonUpdateInput: PersonUpdateInput;
  PriceQuote: ResolverTypeWrapper<PriceQuote>;
  PriceQuoteCreateInput: PriceQuoteCreateInput;
  PriceQuoteUpdateInput: PriceQuoteUpdateInput;
  Query: ResolverTypeWrapper<{}>;
  SendMessageInput: SendMessageInput;
  StageType: StageType;
  String: ResolverTypeWrapper<Scalars["String"]["output"]>;
  Subscription: ResolverTypeWrapper<{}>;
  ThinkingBudget: ThinkingBudget;
  ToolDiscoveryResponse: ResolverTypeWrapper<ToolDiscoveryResponse>;
  UpdateActivityInput: UpdateActivityInput;
  UpdateConversationInput: UpdateConversationInput;
  UpdateUserProfileInput: UpdateUserProfileInput;
  UpdateWFMProjectTypeInput: UpdateWfmProjectTypeInput;
  UpdateWFMStatusInput: UpdateWfmStatusInput;
  UpdateWFMWorkflowInput: UpdateWfmWorkflowInput;
  UpdateWFMWorkflowStepInput: UpdateWfmWorkflowStepInput;
  UpdateWfmWorkflowTransitionInput: UpdateWfmWorkflowTransitionInput;
  User: ResolverTypeWrapper<User>;
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
  AIActivityRecommendation: AiActivityRecommendation;
  AIActivityRecommendationsResponse: AiActivityRecommendationsResponse;
  Activity: Activity;
  ActivityFilterInput: ActivityFilterInput;
  AdditionalCost: AdditionalCost;
  AdditionalCostInput: AdditionalCostInput;
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
  Boolean: Scalars["Boolean"]["output"];
  CreateActivityInput: CreateActivityInput;
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
  Date: Scalars["Date"]["output"];
  DateTime: Scalars["DateTime"]["output"];
  Deal: Deal;
  DealHistoryEntry: DealHistoryEntry;
  DealInput: DealInput;
  DealUpdateInput: DealUpdateInput;
  Float: Scalars["Float"]["output"];
  ID: Scalars["ID"]["output"];
  Int: Scalars["Int"]["output"];
  InvoiceScheduleEntry: InvoiceScheduleEntry;
  JSON: Scalars["JSON"]["output"];
  Lead: Lead;
  LeadConversionInput: LeadConversionInput;
  LeadConversionResult: LeadConversionResult;
  LeadHistoryEntry: LeadHistoryEntry;
  LeadInput: LeadInput;
  LeadUpdateInput: LeadUpdateInput;
  Mutation: {};
  Organization: Organization;
  OrganizationInput: OrganizationInput;
  OrganizationUpdateInput: OrganizationUpdateInput;
  Person: Person;
  PersonInput: PersonInput;
  PersonListItem: PersonListItem;
  PersonUpdateInput: PersonUpdateInput;
  PriceQuote: PriceQuote;
  PriceQuoteCreateInput: PriceQuoteCreateInput;
  PriceQuoteUpdateInput: PriceQuoteUpdateInput;
  Query: {};
  SendMessageInput: SendMessageInput;
  String: Scalars["String"]["output"];
  Subscription: {};
  ToolDiscoveryResponse: ToolDiscoveryResponse;
  UpdateActivityInput: UpdateActivityInput;
  UpdateConversationInput: UpdateConversationInput;
  UpdateUserProfileInput: UpdateUserProfileInput;
  UpdateWFMProjectTypeInput: UpdateWfmProjectTypeInput;
  UpdateWFMStatusInput: UpdateWfmStatusInput;
  UpdateWFMWorkflowInput: UpdateWfmWorkflowInput;
  UpdateWFMWorkflowStepInput: UpdateWfmWorkflowStepInput;
  UpdateWfmWorkflowTransitionInput: UpdateWfmWorkflowTransitionInput;
  User: User;
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

export type AiActivityRecommendationResolvers<
  ContextType = GraphQLContext,
  ParentType extends
    ResolversParentTypes["AIActivityRecommendation"] = ResolversParentTypes["AIActivityRecommendation"],
> = {
  confidence?: Resolver<ResolversTypes["Float"], ParentType, ContextType>;
  notes?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  reasoning?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  subject?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  suggestedDueDate?: Resolver<ResolversTypes["Date"], ParentType, ContextType>;
  type?: Resolver<ResolversTypes["ActivityType"], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type AiActivityRecommendationsResponseResolvers<
  ContextType = GraphQLContext,
  ParentType extends
    ResolversParentTypes["AIActivityRecommendationsResponse"] = ResolversParentTypes["AIActivityRecommendationsResponse"],
> = {
  contextSummary?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  primaryRecommendation?: Resolver<
    ResolversTypes["AIActivityRecommendation"],
    ParentType,
    ContextType
  >;
  recommendations?: Resolver<
    Array<ResolversTypes["AIActivityRecommendation"]>,
    ParentType,
    ContextType
  >;
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

export type AdditionalCostResolvers<
  ContextType = GraphQLContext,
  ParentType extends
    ResolversParentTypes["AdditionalCost"] = ResolversParentTypes["AdditionalCost"],
> = {
  amount?: Resolver<ResolversTypes["Float"], ParentType, ContextType>;
  created_at?: Resolver<ResolversTypes["DateTime"], ParentType, ContextType>;
  description?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  id?: Resolver<ResolversTypes["ID"], ParentType, ContextType>;
  updated_at?: Resolver<ResolversTypes["DateTime"], ParentType, ContextType>;
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

export type InvoiceScheduleEntryResolvers<
  ContextType = GraphQLContext,
  ParentType extends
    ResolversParentTypes["InvoiceScheduleEntry"] = ResolversParentTypes["InvoiceScheduleEntry"],
> = {
  amount_due?: Resolver<ResolversTypes["Float"], ParentType, ContextType>;
  created_at?: Resolver<ResolversTypes["DateTime"], ParentType, ContextType>;
  description?: Resolver<
    Maybe<ResolversTypes["String"]>,
    ParentType,
    ContextType
  >;
  due_date?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  entry_type?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  id?: Resolver<ResolversTypes["ID"], ParentType, ContextType>;
  updated_at?: Resolver<ResolversTypes["DateTime"], ParentType, ContextType>;
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
  custom_field_values?: Resolver<
    Maybe<ResolversTypes["JSON"]>,
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
    Maybe<Array<ResolversTypes["LeadHistoryEntry"]>>,
    ParentType,
    ContextType,
    Partial<LeadHistoryArgs>
  >;
  id?: Resolver<ResolversTypes["ID"], ParentType, ContextType>;
  is_qualified?: Resolver<
    Maybe<ResolversTypes["Boolean"]>,
    ParentType,
    ContextType
  >;
  last_contacted_at?: Resolver<
    Maybe<ResolversTypes["DateTime"]>,
    ParentType,
    ContextType
  >;
  lead_score?: Resolver<Maybe<ResolversTypes["Int"]>, ParentType, ContextType>;
  lead_source?: Resolver<
    Maybe<ResolversTypes["String"]>,
    ParentType,
    ContextType
  >;
  lead_source_detail?: Resolver<
    Maybe<ResolversTypes["String"]>,
    ParentType,
    ContextType
  >;
  next_follow_up_date?: Resolver<
    Maybe<ResolversTypes["DateTime"]>,
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
  person?: Resolver<Maybe<ResolversTypes["Person"]>, ParentType, ContextType>;
  person_id?: Resolver<Maybe<ResolversTypes["ID"]>, ParentType, ContextType>;
  priority?: Resolver<
    Maybe<ResolversTypes["LeadPriority"]>,
    ParentType,
    ContextType
  >;
  qualification_notes?: Resolver<
    Maybe<ResolversTypes["String"]>,
    ParentType,
    ContextType
  >;
  tags?: Resolver<
    Maybe<Array<ResolversTypes["String"]>>,
    ParentType,
    ContextType
  >;
  title?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
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
  deal?: Resolver<ResolversTypes["Deal"], ParentType, ContextType>;
  lead?: Resolver<ResolversTypes["Lead"], ParentType, ContextType>;
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
  calculatePriceQuotePreview?: Resolver<
    ResolversTypes["PriceQuote"],
    ParentType,
    ContextType,
    RequireFields<MutationCalculatePriceQuotePreviewArgs, "input">
  >;
  convertLeadToDeal?: Resolver<
    ResolversTypes["LeadConversionResult"],
    ParentType,
    ContextType,
    RequireFields<MutationConvertLeadToDealArgs, "leadId">
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
  createPriceQuote?: Resolver<
    ResolversTypes["PriceQuote"],
    ParentType,
    ContextType,
    RequireFields<MutationCreatePriceQuoteArgs, "dealId" | "input">
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
  deleteLead?: Resolver<
    ResolversTypes["Boolean"],
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
  deletePriceQuote?: Resolver<
    Maybe<ResolversTypes["Boolean"]>,
    ParentType,
    ContextType,
    RequireFields<MutationDeletePriceQuoteArgs, "id">
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
  executeAgentStep?: Resolver<
    ResolversTypes["AgentResponse"],
    ParentType,
    ContextType,
    RequireFields<MutationExecuteAgentStepArgs, "conversationId" | "stepId">
  >;
  reactivateCustomFieldDefinition?: Resolver<
    ResolversTypes["CustomFieldDefinition"],
    ParentType,
    ContextType,
    RequireFields<MutationReactivateCustomFieldDefinitionArgs, "id">
  >;
  sendAgentMessage?: Resolver<
    ResolversTypes["AgentResponse"],
    ParentType,
    ContextType,
    RequireFields<MutationSendAgentMessageArgs, "input">
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
  updateLead?: Resolver<
    ResolversTypes["Lead"],
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
  updatePriceQuote?: Resolver<
    ResolversTypes["PriceQuote"],
    ParentType,
    ContextType,
    RequireFields<MutationUpdatePriceQuoteArgs, "id" | "input">
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

export type PriceQuoteResolvers<
  ContextType = GraphQLContext,
  ParentType extends
    ResolversParentTypes["PriceQuote"] = ResolversParentTypes["PriceQuote"],
> = {
  additional_costs?: Resolver<
    Array<ResolversTypes["AdditionalCost"]>,
    ParentType,
    ContextType
  >;
  base_minimum_price_mp?: Resolver<
    Maybe<ResolversTypes["Float"]>,
    ParentType,
    ContextType
  >;
  calculated_discounted_offer_price?: Resolver<
    Maybe<ResolversTypes["Float"]>,
    ParentType,
    ContextType
  >;
  calculated_effective_markup_fop_over_mp?: Resolver<
    Maybe<ResolversTypes["Float"]>,
    ParentType,
    ContextType
  >;
  calculated_full_target_price_ftp?: Resolver<
    Maybe<ResolversTypes["Float"]>,
    ParentType,
    ContextType
  >;
  calculated_target_price_tp?: Resolver<
    Maybe<ResolversTypes["Float"]>,
    ParentType,
    ContextType
  >;
  calculated_total_direct_cost?: Resolver<
    Maybe<ResolversTypes["Float"]>,
    ParentType,
    ContextType
  >;
  created_at?: Resolver<ResolversTypes["DateTime"], ParentType, ContextType>;
  deal?: Resolver<Maybe<ResolversTypes["Deal"]>, ParentType, ContextType>;
  deal_id?: Resolver<ResolversTypes["ID"], ParentType, ContextType>;
  escalation_details?: Resolver<
    Maybe<ResolversTypes["JSON"]>,
    ParentType,
    ContextType
  >;
  escalation_status?: Resolver<
    Maybe<ResolversTypes["String"]>,
    ParentType,
    ContextType
  >;
  final_offer_price_fop?: Resolver<
    Maybe<ResolversTypes["Float"]>,
    ParentType,
    ContextType
  >;
  id?: Resolver<ResolversTypes["ID"], ParentType, ContextType>;
  invoice_schedule_entries?: Resolver<
    Array<ResolversTypes["InvoiceScheduleEntry"]>,
    ParentType,
    ContextType
  >;
  name?: Resolver<Maybe<ResolversTypes["String"]>, ParentType, ContextType>;
  overall_discount_percentage?: Resolver<
    Maybe<ResolversTypes["Float"]>,
    ParentType,
    ContextType
  >;
  status?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  subsequent_installments_count?: Resolver<
    Maybe<ResolversTypes["Int"]>,
    ParentType,
    ContextType
  >;
  subsequent_installments_interval_days?: Resolver<
    Maybe<ResolversTypes["Int"]>,
    ParentType,
    ContextType
  >;
  target_markup_percentage?: Resolver<
    Maybe<ResolversTypes["Float"]>,
    ParentType,
    ContextType
  >;
  updated_at?: Resolver<ResolversTypes["DateTime"], ParentType, ContextType>;
  upfront_payment_due_days?: Resolver<
    Maybe<ResolversTypes["Int"]>,
    ParentType,
    ContextType
  >;
  upfront_payment_percentage?: Resolver<
    Maybe<ResolversTypes["Float"]>,
    ParentType,
    ContextType
  >;
  user?: Resolver<Maybe<ResolversTypes["User"]>, ParentType, ContextType>;
  user_id?: Resolver<ResolversTypes["ID"], ParentType, ContextType>;
  version_number?: Resolver<ResolversTypes["Int"], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type QueryResolvers<
  ContextType = GraphQLContext,
  ParentType extends
    ResolversParentTypes["Query"] = ResolversParentTypes["Query"],
> = {
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
  deals?: Resolver<Array<ResolversTypes["Deal"]>, ParentType, ContextType>;
  discoverAgentTools?: Resolver<
    ResolversTypes["ToolDiscoveryResponse"],
    ParentType,
    ContextType
  >;
  getAIActivityRecommendations?: Resolver<
    ResolversTypes["AIActivityRecommendationsResponse"],
    ParentType,
    ContextType,
    RequireFields<QueryGetAiActivityRecommendationsArgs, "dealId">
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
  health?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  lead?: Resolver<
    Maybe<ResolversTypes["Lead"]>,
    ParentType,
    ContextType,
    RequireFields<QueryLeadArgs, "id">
  >;
  leads?: Resolver<Array<ResolversTypes["Lead"]>, ParentType, ContextType>;
  me?: Resolver<Maybe<ResolversTypes["User"]>, ParentType, ContextType>;
  myPermissions?: Resolver<
    Maybe<Array<ResolversTypes["String"]>>,
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
  priceQuote?: Resolver<
    Maybe<ResolversTypes["PriceQuote"]>,
    ParentType,
    ContextType,
    RequireFields<QueryPriceQuoteArgs, "id">
  >;
  priceQuotesForDeal?: Resolver<
    Array<ResolversTypes["PriceQuote"]>,
    ParentType,
    ContextType,
    RequireFields<QueryPriceQuotesForDealArgs, "dealId">
  >;
  supabaseConnectionTest?: Resolver<
    ResolversTypes["String"],
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
  AIActivityRecommendation?: AiActivityRecommendationResolvers<ContextType>;
  AIActivityRecommendationsResponse?: AiActivityRecommendationsResponseResolvers<ContextType>;
  Activity?: ActivityResolvers<ContextType>;
  AdditionalCost?: AdditionalCostResolvers<ContextType>;
  AgentConfig?: AgentConfigResolvers<ContextType>;
  AgentConversation?: AgentConversationResolvers<ContextType>;
  AgentMessage?: AgentMessageResolvers<ContextType>;
  AgentPlan?: AgentPlanResolvers<ContextType>;
  AgentPlanStep?: AgentPlanStepResolvers<ContextType>;
  AgentResponse?: AgentResponseResolvers<ContextType>;
  AgentThought?: AgentThoughtResolvers<ContextType>;
  CustomFieldDefinition?: CustomFieldDefinitionResolvers<ContextType>;
  CustomFieldOption?: CustomFieldOptionResolvers<ContextType>;
  CustomFieldValue?: CustomFieldValueResolvers<ContextType>;
  Date?: GraphQLScalarType;
  DateTime?: GraphQLScalarType;
  Deal?: DealResolvers<ContextType>;
  DealHistoryEntry?: DealHistoryEntryResolvers<ContextType>;
  InvoiceScheduleEntry?: InvoiceScheduleEntryResolvers<ContextType>;
  JSON?: GraphQLScalarType;
  Lead?: LeadResolvers<ContextType>;
  LeadConversionResult?: LeadConversionResultResolvers<ContextType>;
  LeadHistoryEntry?: LeadHistoryEntryResolvers<ContextType>;
  Mutation?: MutationResolvers<ContextType>;
  Organization?: OrganizationResolvers<ContextType>;
  Person?: PersonResolvers<ContextType>;
  PersonListItem?: PersonListItemResolvers<ContextType>;
  PriceQuote?: PriceQuoteResolvers<ContextType>;
  Query?: QueryResolvers<ContextType>;
  Subscription?: SubscriptionResolvers<ContextType>;
  ToolDiscoveryResponse?: ToolDiscoveryResponseResolvers<ContextType>;
  User?: UserResolvers<ContextType>;
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
