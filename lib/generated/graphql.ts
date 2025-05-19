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

export type AddTeamMembersInput = {
  memberUserIds: Array<Scalars["ID"]["input"]>;
  teamId: Scalars["ID"]["input"];
};

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

export type CreateTeamInput = {
  description?: InputMaybe<Scalars["String"]["input"]>;
  memberUserIds?: InputMaybe<Array<Scalars["ID"]["input"]>>;
  name: Scalars["String"]["input"];
  teamLeadUserId?: InputMaybe<Scalars["ID"]["input"]>;
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
  /** Adds members to a team. */
  addTeamMembers: TeamWithMembers;
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
  /** Creates a new team. */
  createTeam: Team;
  deactivateCustomFieldDefinition: CustomFieldDefinition;
  deleteActivity: Scalars["ID"]["output"];
  deleteDeal?: Maybe<Scalars["Boolean"]["output"]>;
  deleteOrganization?: Maybe<Scalars["Boolean"]["output"]>;
  deletePerson?: Maybe<Scalars["Boolean"]["output"]>;
  deletePipeline: Scalars["Boolean"]["output"];
  /** Deletes a price quote. */
  deletePriceQuote?: Maybe<Scalars["Boolean"]["output"]>;
  deleteStage: Scalars["Boolean"]["output"];
  /** Deletes a team. */
  deleteTeam: Scalars["Boolean"]["output"];
  reactivateCustomFieldDefinition: CustomFieldDefinition;
  /** Removes members from a team. */
  removeTeamMembers: TeamWithMembers;
  updateActivity: Activity;
  updateCustomFieldDefinition: CustomFieldDefinition;
  updateDeal?: Maybe<Deal>;
  updateOrganization?: Maybe<Organization>;
  updatePerson?: Maybe<Person>;
  updatePipeline: Pipeline;
  /** Updates an existing price quote. */
  updatePriceQuote: PriceQuote;
  updateStage: Stage;
  /** Updates an existing team. */
  updateTeam: Team;
  /** Updates the profile for the currently authenticated user. */
  updateUserProfile?: Maybe<User>;
};

export type MutationAddTeamMembersArgs = {
  input: AddTeamMembersInput;
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

export type MutationCreateTeamArgs = {
  input: CreateTeamInput;
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

export type MutationDeleteTeamArgs = {
  id: Scalars["ID"]["input"];
};

export type MutationReactivateCustomFieldDefinitionArgs = {
  id: Scalars["ID"]["input"];
};

export type MutationRemoveTeamMembersArgs = {
  input: RemoveTeamMembersInput;
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

export type MutationUpdateTeamArgs = {
  id: Scalars["ID"]["input"];
  input: UpdateTeamInput;
};

export type MutationUpdateUserProfileArgs = {
  input: UpdateUserProfileInput;
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
  /** Fetches all teams the currently authenticated user leads. */
  myLedTeams: Array<Team>;
  myPermissions?: Maybe<Array<Scalars["String"]["output"]>>;
  /** Fetches all teams the currently authenticated user is a member of. */
  myTeams: Array<Team>;
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
  /** Fetches a specific team by ID, including its members. */
  team?: Maybe<TeamWithMembers>;
  /** Fetches all teams accessible to the current user (admins see all, leads see their teams, members see teams they belong to). */
  teams: Array<Team>;
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

export type QueryTeamArgs = {
  id: Scalars["ID"]["input"];
};

export type RemoveTeamMembersInput = {
  memberUserIds: Array<Scalars["ID"]["input"]>;
  teamId: Scalars["ID"]["input"];
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

/** GraphQL schema for Teams functionality */
export type Team = {
  __typename?: "Team";
  createdAt: Scalars["DateTime"]["output"];
  createdBy?: Maybe<User>;
  description?: Maybe<Scalars["String"]["output"]>;
  id: Scalars["ID"]["output"];
  members: Array<User>;
  name: Scalars["String"]["output"];
  teamLead?: Maybe<User>;
  updatedAt: Scalars["DateTime"]["output"];
};

/** Represents a user's membership in a team, primarily for paginated member lists. */
export type TeamMemberEdge = {
  __typename?: "TeamMemberEdge";
  joinedAt: Scalars["DateTime"]["output"];
  user: User;
};

/** Connection type for paginated lists of team members. */
export type TeamMembersConnection = {
  __typename?: "TeamMembersConnection";
  edges: Array<TeamMemberEdge>;
};

/**
 * Comprehensive Team object, potentially including paginated member lists.
 * Used when fetching a single team's details.
 */
export type TeamWithMembers = {
  __typename?: "TeamWithMembers";
  createdAt: Scalars["DateTime"]["output"];
  createdBy?: Maybe<User>;
  description?: Maybe<Scalars["String"]["output"]>;
  id: Scalars["ID"]["output"];
  membersConnection: TeamMembersConnection;
  name: Scalars["String"]["output"];
  teamLead?: Maybe<User>;
  updatedAt: Scalars["DateTime"]["output"];
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

export type UpdateStageInput = {
  deal_probability?: InputMaybe<Scalars["Float"]["input"]>;
  name?: InputMaybe<Scalars["String"]["input"]>;
  order?: InputMaybe<Scalars["Int"]["input"]>;
  stage_type?: InputMaybe<StageType>;
};

export type UpdateTeamInput = {
  description?: InputMaybe<Scalars["String"]["input"]>;
  name?: InputMaybe<Scalars["String"]["input"]>;
  teamLeadUserId?: InputMaybe<Scalars["ID"]["input"]>;
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

export type User = {
  __typename?: "User";
  avatar_url?: Maybe<Scalars["String"]["output"]>;
  display_name?: Maybe<Scalars["String"]["output"]>;
  email: Scalars["String"]["output"];
  id: Scalars["ID"]["output"];
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
  Activity: ResolverTypeWrapper<Activity>;
  ActivityFilterInput: ActivityFilterInput;
  ActivityType: ActivityType;
  AddTeamMembersInput: AddTeamMembersInput;
  AdditionalCost: ResolverTypeWrapper<AdditionalCost>;
  AdditionalCostInput: AdditionalCostInput;
  Boolean: ResolverTypeWrapper<Scalars["Boolean"]["output"]>;
  CreateActivityInput: CreateActivityInput;
  CreateStageInput: CreateStageInput;
  CreateTeamInput: CreateTeamInput;
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
  DealHistoryEntry: ResolverTypeWrapper<DealHistoryEntry>;
  DealInput: DealInput;
  DealUpdateInput: DealUpdateInput;
  Float: ResolverTypeWrapper<Scalars["Float"]["output"]>;
  ID: ResolverTypeWrapper<Scalars["ID"]["output"]>;
  Int: ResolverTypeWrapper<Scalars["Int"]["output"]>;
  InvoiceScheduleEntry: ResolverTypeWrapper<InvoiceScheduleEntry>;
  JSON: ResolverTypeWrapper<Scalars["JSON"]["output"]>;
  Mutation: ResolverTypeWrapper<{}>;
  Organization: ResolverTypeWrapper<Organization>;
  OrganizationInput: OrganizationInput;
  OrganizationUpdateInput: OrganizationUpdateInput;
  Person: ResolverTypeWrapper<Person>;
  PersonInput: PersonInput;
  PersonListItem: ResolverTypeWrapper<PersonListItem>;
  PersonUpdateInput: PersonUpdateInput;
  Pipeline: ResolverTypeWrapper<Pipeline>;
  PipelineInput: PipelineInput;
  PriceQuote: ResolverTypeWrapper<PriceQuote>;
  PriceQuoteCreateInput: PriceQuoteCreateInput;
  PriceQuoteUpdateInput: PriceQuoteUpdateInput;
  Query: ResolverTypeWrapper<{}>;
  RemoveTeamMembersInput: RemoveTeamMembersInput;
  Stage: ResolverTypeWrapper<Stage>;
  StageType: StageType;
  String: ResolverTypeWrapper<Scalars["String"]["output"]>;
  Team: ResolverTypeWrapper<Team>;
  TeamMemberEdge: ResolverTypeWrapper<TeamMemberEdge>;
  TeamMembersConnection: ResolverTypeWrapper<TeamMembersConnection>;
  TeamWithMembers: ResolverTypeWrapper<TeamWithMembers>;
  UpdateActivityInput: UpdateActivityInput;
  UpdateStageInput: UpdateStageInput;
  UpdateTeamInput: UpdateTeamInput;
  UpdateUserProfileInput: UpdateUserProfileInput;
  User: ResolverTypeWrapper<User>;
};

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = {
  Activity: Activity;
  ActivityFilterInput: ActivityFilterInput;
  AddTeamMembersInput: AddTeamMembersInput;
  AdditionalCost: AdditionalCost;
  AdditionalCostInput: AdditionalCostInput;
  Boolean: Scalars["Boolean"]["output"];
  CreateActivityInput: CreateActivityInput;
  CreateStageInput: CreateStageInput;
  CreateTeamInput: CreateTeamInput;
  CustomFieldDefinition: CustomFieldDefinition;
  CustomFieldDefinitionInput: CustomFieldDefinitionInput;
  CustomFieldOption: CustomFieldOption;
  CustomFieldOptionInput: CustomFieldOptionInput;
  CustomFieldValue: CustomFieldValue;
  CustomFieldValueInput: CustomFieldValueInput;
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
  Mutation: {};
  Organization: Organization;
  OrganizationInput: OrganizationInput;
  OrganizationUpdateInput: OrganizationUpdateInput;
  Person: Person;
  PersonInput: PersonInput;
  PersonListItem: PersonListItem;
  PersonUpdateInput: PersonUpdateInput;
  Pipeline: Pipeline;
  PipelineInput: PipelineInput;
  PriceQuote: PriceQuote;
  PriceQuoteCreateInput: PriceQuoteCreateInput;
  PriceQuoteUpdateInput: PriceQuoteUpdateInput;
  Query: {};
  RemoveTeamMembersInput: RemoveTeamMembersInput;
  Stage: Stage;
  String: Scalars["String"]["output"];
  Team: Team;
  TeamMemberEdge: TeamMemberEdge;
  TeamMembersConnection: TeamMembersConnection;
  TeamWithMembers: TeamWithMembers;
  UpdateActivityInput: UpdateActivityInput;
  UpdateStageInput: UpdateStageInput;
  UpdateTeamInput: UpdateTeamInput;
  UpdateUserProfileInput: UpdateUserProfileInput;
  User: User;
};

export type ActivityResolvers<
  ContextType = GraphQLContext,
  ParentType extends
    ResolversParentTypes["Activity"] = ResolversParentTypes["Activity"],
> = {
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
  created_at?: Resolver<ResolversTypes["DateTime"], ParentType, ContextType>;
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
  pipeline?: Resolver<ResolversTypes["Pipeline"], ParentType, ContextType>;
  pipeline_id?: Resolver<ResolversTypes["ID"], ParentType, ContextType>;
  stage?: Resolver<ResolversTypes["Stage"], ParentType, ContextType>;
  stage_id?: Resolver<ResolversTypes["ID"], ParentType, ContextType>;
  updated_at?: Resolver<ResolversTypes["DateTime"], ParentType, ContextType>;
  user_id?: Resolver<ResolversTypes["ID"], ParentType, ContextType>;
  weighted_amount?: Resolver<
    Maybe<ResolversTypes["Float"]>,
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

export type MutationResolvers<
  ContextType = GraphQLContext,
  ParentType extends
    ResolversParentTypes["Mutation"] = ResolversParentTypes["Mutation"],
> = {
  addTeamMembers?: Resolver<
    ResolversTypes["TeamWithMembers"],
    ParentType,
    ContextType,
    RequireFields<MutationAddTeamMembersArgs, "input">
  >;
  calculatePriceQuotePreview?: Resolver<
    ResolversTypes["PriceQuote"],
    ParentType,
    ContextType,
    RequireFields<MutationCalculatePriceQuotePreviewArgs, "input">
  >;
  createActivity?: Resolver<
    ResolversTypes["Activity"],
    ParentType,
    ContextType,
    RequireFields<MutationCreateActivityArgs, "input">
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
  createPipeline?: Resolver<
    ResolversTypes["Pipeline"],
    ParentType,
    ContextType,
    RequireFields<MutationCreatePipelineArgs, "input">
  >;
  createPriceQuote?: Resolver<
    ResolversTypes["PriceQuote"],
    ParentType,
    ContextType,
    RequireFields<MutationCreatePriceQuoteArgs, "dealId" | "input">
  >;
  createStage?: Resolver<
    ResolversTypes["Stage"],
    ParentType,
    ContextType,
    RequireFields<MutationCreateStageArgs, "input">
  >;
  createTeam?: Resolver<
    ResolversTypes["Team"],
    ParentType,
    ContextType,
    RequireFields<MutationCreateTeamArgs, "input">
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
  deleteDeal?: Resolver<
    Maybe<ResolversTypes["Boolean"]>,
    ParentType,
    ContextType,
    RequireFields<MutationDeleteDealArgs, "id">
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
  deletePipeline?: Resolver<
    ResolversTypes["Boolean"],
    ParentType,
    ContextType,
    RequireFields<MutationDeletePipelineArgs, "id">
  >;
  deletePriceQuote?: Resolver<
    Maybe<ResolversTypes["Boolean"]>,
    ParentType,
    ContextType,
    RequireFields<MutationDeletePriceQuoteArgs, "id">
  >;
  deleteStage?: Resolver<
    ResolversTypes["Boolean"],
    ParentType,
    ContextType,
    RequireFields<MutationDeleteStageArgs, "id">
  >;
  deleteTeam?: Resolver<
    ResolversTypes["Boolean"],
    ParentType,
    ContextType,
    RequireFields<MutationDeleteTeamArgs, "id">
  >;
  reactivateCustomFieldDefinition?: Resolver<
    ResolversTypes["CustomFieldDefinition"],
    ParentType,
    ContextType,
    RequireFields<MutationReactivateCustomFieldDefinitionArgs, "id">
  >;
  removeTeamMembers?: Resolver<
    ResolversTypes["TeamWithMembers"],
    ParentType,
    ContextType,
    RequireFields<MutationRemoveTeamMembersArgs, "input">
  >;
  updateActivity?: Resolver<
    ResolversTypes["Activity"],
    ParentType,
    ContextType,
    RequireFields<MutationUpdateActivityArgs, "id" | "input">
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
  updatePipeline?: Resolver<
    ResolversTypes["Pipeline"],
    ParentType,
    ContextType,
    RequireFields<MutationUpdatePipelineArgs, "id" | "input">
  >;
  updatePriceQuote?: Resolver<
    ResolversTypes["PriceQuote"],
    ParentType,
    ContextType,
    RequireFields<MutationUpdatePriceQuoteArgs, "id" | "input">
  >;
  updateStage?: Resolver<
    ResolversTypes["Stage"],
    ParentType,
    ContextType,
    RequireFields<MutationUpdateStageArgs, "id" | "input">
  >;
  updateTeam?: Resolver<
    ResolversTypes["Team"],
    ParentType,
    ContextType,
    RequireFields<MutationUpdateTeamArgs, "id" | "input">
  >;
  updateUserProfile?: Resolver<
    Maybe<ResolversTypes["User"]>,
    ParentType,
    ContextType,
    RequireFields<MutationUpdateUserProfileArgs, "input">
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

export type PipelineResolvers<
  ContextType = GraphQLContext,
  ParentType extends
    ResolversParentTypes["Pipeline"] = ResolversParentTypes["Pipeline"],
> = {
  created_at?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  id?: Resolver<ResolversTypes["ID"], ParentType, ContextType>;
  name?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  updated_at?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  user_id?: Resolver<ResolversTypes["ID"], ParentType, ContextType>;
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
  health?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  me?: Resolver<Maybe<ResolversTypes["User"]>, ParentType, ContextType>;
  myLedTeams?: Resolver<Array<ResolversTypes["Team"]>, ParentType, ContextType>;
  myPermissions?: Resolver<
    Maybe<Array<ResolversTypes["String"]>>,
    ParentType,
    ContextType
  >;
  myTeams?: Resolver<Array<ResolversTypes["Team"]>, ParentType, ContextType>;
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
  pipelines?: Resolver<
    Array<ResolversTypes["Pipeline"]>,
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
  stage?: Resolver<
    Maybe<ResolversTypes["Stage"]>,
    ParentType,
    ContextType,
    RequireFields<QueryStageArgs, "id">
  >;
  stages?: Resolver<
    Array<ResolversTypes["Stage"]>,
    ParentType,
    ContextType,
    RequireFields<QueryStagesArgs, "pipelineId">
  >;
  supabaseConnectionTest?: Resolver<
    ResolversTypes["String"],
    ParentType,
    ContextType
  >;
  team?: Resolver<
    Maybe<ResolversTypes["TeamWithMembers"]>,
    ParentType,
    ContextType,
    RequireFields<QueryTeamArgs, "id">
  >;
  teams?: Resolver<Array<ResolversTypes["Team"]>, ParentType, ContextType>;
};

export type StageResolvers<
  ContextType = GraphQLContext,
  ParentType extends
    ResolversParentTypes["Stage"] = ResolversParentTypes["Stage"],
> = {
  created_at?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  deal_probability?: Resolver<
    Maybe<ResolversTypes["Float"]>,
    ParentType,
    ContextType
  >;
  id?: Resolver<ResolversTypes["ID"], ParentType, ContextType>;
  name?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  order?: Resolver<ResolversTypes["Int"], ParentType, ContextType>;
  pipeline?: Resolver<ResolversTypes["Pipeline"], ParentType, ContextType>;
  pipeline_id?: Resolver<ResolversTypes["ID"], ParentType, ContextType>;
  stage_type?: Resolver<ResolversTypes["StageType"], ParentType, ContextType>;
  updated_at?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  user_id?: Resolver<ResolversTypes["ID"], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type TeamResolvers<
  ContextType = GraphQLContext,
  ParentType extends
    ResolversParentTypes["Team"] = ResolversParentTypes["Team"],
> = {
  createdAt?: Resolver<ResolversTypes["DateTime"], ParentType, ContextType>;
  createdBy?: Resolver<Maybe<ResolversTypes["User"]>, ParentType, ContextType>;
  description?: Resolver<
    Maybe<ResolversTypes["String"]>,
    ParentType,
    ContextType
  >;
  id?: Resolver<ResolversTypes["ID"], ParentType, ContextType>;
  members?: Resolver<Array<ResolversTypes["User"]>, ParentType, ContextType>;
  name?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  teamLead?: Resolver<Maybe<ResolversTypes["User"]>, ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes["DateTime"], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type TeamMemberEdgeResolvers<
  ContextType = GraphQLContext,
  ParentType extends
    ResolversParentTypes["TeamMemberEdge"] = ResolversParentTypes["TeamMemberEdge"],
> = {
  joinedAt?: Resolver<ResolversTypes["DateTime"], ParentType, ContextType>;
  user?: Resolver<ResolversTypes["User"], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type TeamMembersConnectionResolvers<
  ContextType = GraphQLContext,
  ParentType extends
    ResolversParentTypes["TeamMembersConnection"] = ResolversParentTypes["TeamMembersConnection"],
> = {
  edges?: Resolver<
    Array<ResolversTypes["TeamMemberEdge"]>,
    ParentType,
    ContextType
  >;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type TeamWithMembersResolvers<
  ContextType = GraphQLContext,
  ParentType extends
    ResolversParentTypes["TeamWithMembers"] = ResolversParentTypes["TeamWithMembers"],
> = {
  createdAt?: Resolver<ResolversTypes["DateTime"], ParentType, ContextType>;
  createdBy?: Resolver<Maybe<ResolversTypes["User"]>, ParentType, ContextType>;
  description?: Resolver<
    Maybe<ResolversTypes["String"]>,
    ParentType,
    ContextType
  >;
  id?: Resolver<ResolversTypes["ID"], ParentType, ContextType>;
  membersConnection?: Resolver<
    ResolversTypes["TeamMembersConnection"],
    ParentType,
    ContextType
  >;
  name?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  teamLead?: Resolver<Maybe<ResolversTypes["User"]>, ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes["DateTime"], ParentType, ContextType>;
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

export type Resolvers<ContextType = GraphQLContext> = {
  Activity?: ActivityResolvers<ContextType>;
  AdditionalCost?: AdditionalCostResolvers<ContextType>;
  CustomFieldDefinition?: CustomFieldDefinitionResolvers<ContextType>;
  CustomFieldOption?: CustomFieldOptionResolvers<ContextType>;
  CustomFieldValue?: CustomFieldValueResolvers<ContextType>;
  DateTime?: GraphQLScalarType;
  Deal?: DealResolvers<ContextType>;
  DealHistoryEntry?: DealHistoryEntryResolvers<ContextType>;
  InvoiceScheduleEntry?: InvoiceScheduleEntryResolvers<ContextType>;
  JSON?: GraphQLScalarType;
  Mutation?: MutationResolvers<ContextType>;
  Organization?: OrganizationResolvers<ContextType>;
  Person?: PersonResolvers<ContextType>;
  PersonListItem?: PersonListItemResolvers<ContextType>;
  Pipeline?: PipelineResolvers<ContextType>;
  PriceQuote?: PriceQuoteResolvers<ContextType>;
  Query?: QueryResolvers<ContextType>;
  Stage?: StageResolvers<ContextType>;
  Team?: TeamResolvers<ContextType>;
  TeamMemberEdge?: TeamMemberEdgeResolvers<ContextType>;
  TeamMembersConnection?: TeamMembersConnectionResolvers<ContextType>;
  TeamWithMembers?: TeamWithMembersResolvers<ContextType>;
  User?: UserResolvers<ContextType>;
};
