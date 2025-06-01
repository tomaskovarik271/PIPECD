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
  Date: { input: any; output: any };
  DateTime: { input: string; output: string };
  JSON: { input: Record<string, any>; output: Record<string, any> };
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

export type Mutation = {
  __typename?: "Mutation";
  addAgentThoughts: Array<AgentThought>;
  /** Calculates a preview of a price quote. dealId is optional. */
  calculatePriceQuotePreview: PriceQuote;
  createActivity: Activity;
  createAgentConversation: AgentConversation;
  createCustomFieldDefinition: CustomFieldDefinition;
  createDeal: Deal;
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

export type GetAiActivityRecommendationsQueryVariables = Exact<{
  dealId: Scalars["ID"]["input"];
}>;

export type GetAiActivityRecommendationsQuery = {
  __typename?: "Query";
  getAIActivityRecommendations: {
    __typename?: "AIActivityRecommendationsResponse";
    contextSummary: string;
    primaryRecommendation: {
      __typename?: "AIActivityRecommendation";
      type: ActivityType;
      subject: string;
      notes: string;
      suggestedDueDate: any;
      confidence: number;
      reasoning: string;
    };
    recommendations: Array<{
      __typename?: "AIActivityRecommendation";
      type: ActivityType;
      subject: string;
      notes: string;
      suggestedDueDate: any;
      confidence: number;
      reasoning: string;
    }>;
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
  }>;
};

export type GetWfmProjectTypeByNameQueryVariables = Exact<{
  name: Scalars["String"]["input"];
}>;

export type GetWfmProjectTypeByNameQuery = {
  __typename?: "Query";
  wfmProjectTypeByName?: {
    __typename?: "WFMProjectType";
    id: string;
    name: string;
    defaultWorkflow?: { __typename?: "WFMWorkflow"; id: string } | null;
  } | null;
};
