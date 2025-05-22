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

export type Activity = {
  __typename?: "Activity";
  created_at: Scalars["DateTime"]["output"];
  deal?: Maybe<Deal>;
  deal_id?: Maybe<Scalars["ID"]["output"]>;
  due_date?: Maybe<Scalars["DateTime"]["output"]>;
  id: Scalars["ID"]["output"];
  is_done: Scalars["Boolean"]["output"];
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

export type CreateStageInput = {
  deal_probability?: InputMaybe<Scalars["Float"]["input"]>;
  name: Scalars["String"]["input"];
  order: Scalars["Int"]["input"];
  pipeline_id: Scalars["ID"]["input"];
  stage_type?: InputMaybe<StageType>;
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
  created_at: Scalars["DateTime"]["output"];
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
  pipeline: Pipeline;
  pipeline_id: Scalars["ID"]["output"];
  stage: Stage;
  stage_id: Scalars["ID"]["output"];
  updated_at: Scalars["DateTime"]["output"];
  user_id: Scalars["ID"]["output"];
  weighted_amount?: Maybe<Scalars["Float"]["output"]>;
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
  customFields?: InputMaybe<Array<CustomFieldValueInput>>;
  deal_specific_probability?: InputMaybe<Scalars["Float"]["input"]>;
  expected_close_date?: InputMaybe<Scalars["DateTime"]["input"]>;
  name: Scalars["String"]["input"];
  organization_id?: InputMaybe<Scalars["ID"]["input"]>;
  person_id?: InputMaybe<Scalars["ID"]["input"]>;
  pipeline_id: Scalars["ID"]["input"];
  stage_id: Scalars["ID"]["input"];
};

export type DealUpdateInput = {
  amount?: InputMaybe<Scalars["Float"]["input"]>;
  customFields?: InputMaybe<Array<CustomFieldValueInput>>;
  deal_specific_probability?: InputMaybe<Scalars["Float"]["input"]>;
  expected_close_date?: InputMaybe<Scalars["DateTime"]["input"]>;
  name?: InputMaybe<Scalars["String"]["input"]>;
  organization_id?: InputMaybe<Scalars["ID"]["input"]>;
  person_id?: InputMaybe<Scalars["ID"]["input"]>;
  stage_id?: InputMaybe<Scalars["ID"]["input"]>;
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
  /** Calculates a preview of a price quote. dealId is optional. */
  calculatePriceQuotePreview: PriceQuote;
  createActivity: Activity;
  createCustomFieldDefinition: CustomFieldDefinition;
  createDeal: Deal;
  createOrganization: Organization;
  createPerson: Person;
  createPipeline: Pipeline;
  /** Creates a new price quote for a given deal. */
  createPriceQuote: PriceQuote;
  createStage: Stage;
  createWFMProjectType: WfmProjectType;
  createWFMStatus: WfmStatus;
  createWFMWorkflow: WfmWorkflow;
  createWFMWorkflowStep: WfmWorkflowStep;
  createWFMWorkflowTransition: WfmWorkflowTransition;
  deactivateCustomFieldDefinition: CustomFieldDefinition;
  deleteActivity: Scalars["ID"]["output"];
  deleteDeal?: Maybe<Scalars["Boolean"]["output"]>;
  deleteOrganization?: Maybe<Scalars["Boolean"]["output"]>;
  deletePerson?: Maybe<Scalars["Boolean"]["output"]>;
  deletePipeline: Scalars["Boolean"]["output"];
  /** Deletes a price quote. */
  deletePriceQuote?: Maybe<Scalars["Boolean"]["output"]>;
  deleteStage: Scalars["Boolean"]["output"];
  deleteWFMWorkflowStep: WfmWorkflowStepMutationResponse;
  deleteWFMWorkflowTransition: WfmWorkflowTransitionMutationResponse;
  deleteWfmStatus: WfmStatusMutationResponse;
  reactivateCustomFieldDefinition: CustomFieldDefinition;
  updateActivity: Activity;
  updateCustomFieldDefinition: CustomFieldDefinition;
  updateDeal?: Maybe<Deal>;
  updateOrganization?: Maybe<Organization>;
  updatePerson?: Maybe<Person>;
  updatePipeline: Pipeline;
  /** Updates an existing price quote. */
  updatePriceQuote: PriceQuote;
  updateStage: Stage;
  /** Updates the profile for the currently authenticated user. */
  updateUserProfile?: Maybe<User>;
  updateWFMProjectType: WfmProjectType;
  updateWFMStatus: WfmStatus;
  updateWFMWorkflow: WfmWorkflow;
  updateWFMWorkflowStep: WfmWorkflowStep;
  updateWFMWorkflowStepsOrder?: Maybe<WfmWorkflow>;
  updateWFMWorkflowTransition: WfmWorkflowTransition;
};

export type MutationCalculatePriceQuotePreviewArgs = {
  dealId?: InputMaybe<Scalars["ID"]["input"]>;
  input: PriceQuoteUpdateInput;
};

export type MutationCreateActivityArgs = {
  input: CreateActivityInput;
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

export type MutationCreatePipelineArgs = {
  input: PipelineInput;
};

export type MutationCreatePriceQuoteArgs = {
  dealId: Scalars["ID"]["input"];
  input: PriceQuoteCreateInput;
};

export type MutationCreateStageArgs = {
  input: CreateStageInput;
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

export type MutationDeleteDealArgs = {
  id: Scalars["ID"]["input"];
};

export type MutationDeleteOrganizationArgs = {
  id: Scalars["ID"]["input"];
};

export type MutationDeletePersonArgs = {
  id: Scalars["ID"]["input"];
};

export type MutationDeletePipelineArgs = {
  id: Scalars["ID"]["input"];
};

export type MutationDeletePriceQuoteArgs = {
  id: Scalars["ID"]["input"];
};

export type MutationDeleteStageArgs = {
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

export type MutationReactivateCustomFieldDefinitionArgs = {
  id: Scalars["ID"]["input"];
};

export type MutationUpdateActivityArgs = {
  id: Scalars["ID"]["input"];
  input: UpdateActivityInput;
};

export type MutationUpdateCustomFieldDefinitionArgs = {
  id: Scalars["ID"]["input"];
  input: CustomFieldDefinitionInput;
};

export type MutationUpdateDealArgs = {
  id: Scalars["ID"]["input"];
  input: DealInput;
};

export type MutationUpdateOrganizationArgs = {
  id: Scalars["ID"]["input"];
  input: OrganizationInput;
};

export type MutationUpdatePersonArgs = {
  id: Scalars["ID"]["input"];
  input: PersonInput;
};

export type MutationUpdatePipelineArgs = {
  id: Scalars["ID"]["input"];
  input: PipelineInput;
};

export type MutationUpdatePriceQuoteArgs = {
  id: Scalars["ID"]["input"];
  input: PriceQuoteUpdateInput;
};

export type MutationUpdateStageArgs = {
  id: Scalars["ID"]["input"];
  input: UpdateStageInput;
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

export type Pipeline = {
  __typename?: "Pipeline";
  created_at: Scalars["String"]["output"];
  id: Scalars["ID"]["output"];
  name: Scalars["String"]["output"];
  updated_at: Scalars["String"]["output"];
  user_id: Scalars["ID"]["output"];
};

export type PipelineInput = {
  name: Scalars["String"]["input"];
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
  customFieldDefinition?: Maybe<CustomFieldDefinition>;
  customFieldDefinitions: Array<CustomFieldDefinition>;
  deal?: Maybe<Deal>;
  deals: Array<Deal>;
  health: Scalars["String"]["output"];
  me?: Maybe<User>;
  myPermissions?: Maybe<Array<Scalars["String"]["output"]>>;
  organization?: Maybe<Organization>;
  organizations: Array<Organization>;
  people: Array<Person>;
  person?: Maybe<Person>;
  personList: Array<PersonListItem>;
  pipelines: Array<Pipeline>;
  /** Retrieves a single price quote by its ID. */
  priceQuote?: Maybe<PriceQuote>;
  /** Retrieves all price quotes associated with a specific deal. */
  priceQuotesForDeal: Array<PriceQuote>;
  stage?: Maybe<Stage>;
  stages: Array<Stage>;
  supabaseConnectionTest: Scalars["String"]["output"];
  wfmProjectType?: Maybe<WfmProjectType>;
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

export type QueryStageArgs = {
  id: Scalars["ID"]["input"];
};

export type QueryStagesArgs = {
  pipelineId: Scalars["ID"]["input"];
};

export type QueryWfmProjectTypeArgs = {
  id: Scalars["ID"]["input"];
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

export type Stage = {
  __typename?: "Stage";
  created_at: Scalars["String"]["output"];
  deal_probability?: Maybe<Scalars["Float"]["output"]>;
  id: Scalars["ID"]["output"];
  name: Scalars["String"]["output"];
  order: Scalars["Int"]["output"];
  pipeline: Pipeline;
  pipeline_id: Scalars["ID"]["output"];
  stage_type: StageType;
  updated_at: Scalars["String"]["output"];
  user_id: Scalars["ID"]["output"];
};

export enum StageType {
  Lost = "LOST",
  Open = "OPEN",
  Won = "WON",
}

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

export type UpdateStageInput = {
  deal_probability?: InputMaybe<Scalars["Float"]["input"]>;
  name?: InputMaybe<Scalars["String"]["input"]>;
  order?: InputMaybe<Scalars["Int"]["input"]>;
  stage_type?: InputMaybe<StageType>;
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
