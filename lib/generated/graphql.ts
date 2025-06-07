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

export type ConvertedEntities = {
  __typename?: "ConvertedEntities";
  deal?: Maybe<Deal>;
  organization?: Maybe<Organization>;
  person?: Maybe<Person>;
};

export type CreateActivityInput = {
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

export enum DecisionAuthority {
  Blocker = "BLOCKER",
  EndUser = "END_USER",
  FinalDecision = "FINAL_DECISION",
  Gatekeeper = "GATEKEEPER",
  Influencer = "INFLUENCER",
  Recommender = "RECOMMENDER",
  StrongInfluence = "STRONG_INFLUENCE",
}

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
  assignAccountToTerritory: AccountTerritory;
  convertLead: LeadConversionResult;
  createActivity: Activity;
  createAgentConversation: AgentConversation;
  createCustomFieldDefinition: CustomFieldDefinition;
  createDeal: Deal;
  createLead: Lead;
  createOrganization: Organization;
  createOrganizationRelationship: OrganizationRelationship;
  createPerson: Person;
  createPersonOrganizationalRole: PersonOrganizationalRole;
  createPersonRelationship: PersonRelationship;
  createStakeholderAnalysis: StakeholderAnalysis;
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
  deleteLead?: Maybe<Scalars["Boolean"]["output"]>;
  deleteOrganization?: Maybe<Scalars["Boolean"]["output"]>;
  deleteOrganizationRelationship: Scalars["Boolean"]["output"];
  deletePerson?: Maybe<Scalars["Boolean"]["output"]>;
  deletePersonOrganizationalRole: Scalars["Boolean"]["output"];
  deletePersonRelationship: Scalars["Boolean"]["output"];
  deleteStakeholderAnalysis: Scalars["Boolean"]["output"];
  deleteTerritory: Scalars["Boolean"]["output"];
  deleteWFMWorkflowStep: WfmWorkflowStepMutationResponse;
  deleteWFMWorkflowTransition: WfmWorkflowTransitionMutationResponse;
  deleteWfmStatus: WfmStatusMutationResponse;
  dismissRelationshipInsight: Scalars["Boolean"]["output"];
  executeAgentStep: AgentResponse;
  reactivateCustomFieldDefinition: CustomFieldDefinition;
  recalculateLeadScore: Lead;
  removeAccountFromTerritory: Scalars["Boolean"]["output"];
  sendAgentMessage: AgentResponse;
  updateActivity: Activity;
  updateAgentConversation: AgentConversation;
  updateCustomFieldDefinition: CustomFieldDefinition;
  updateDeal?: Maybe<Deal>;
  updateDealWFMProgress: Deal;
  updateLead?: Maybe<Lead>;
  updateLeadWFMProgress: Lead;
  updateOrganization?: Maybe<Organization>;
  updatePerson?: Maybe<Person>;
  updatePersonOrganizationalRole: PersonOrganizationalRole;
  updateRelationshipInsight: RelationshipInsight;
  updateStakeholderAnalysis: StakeholderAnalysis;
  updateTerritory: Territory;
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

export type MutationAssignAccountToTerritoryArgs = {
  assignmentReason?: InputMaybe<Scalars["String"]["input"]>;
  isPrimary?: InputMaybe<Scalars["Boolean"]["input"]>;
  organizationId: Scalars["ID"]["input"];
  territoryId: Scalars["ID"]["input"];
};

export type MutationConvertLeadArgs = {
  id: Scalars["ID"]["input"];
  input: LeadConversionInput;
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

export type MutationDeleteLeadArgs = {
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

export type MutationDismissRelationshipInsightArgs = {
  id: Scalars["ID"]["input"];
};

export type MutationExecuteAgentStepArgs = {
  conversationId: Scalars["ID"]["input"];
  stepId: Scalars["String"]["input"];
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
  agentConversation?: Maybe<AgentConversation>;
  agentConversations: Array<AgentConversation>;
  agentThoughts: Array<AgentThought>;
  analyzeStakeholderNetwork: StakeholderNetworkAnalysis;
  customFieldDefinition?: Maybe<CustomFieldDefinition>;
  customFieldDefinitions: Array<CustomFieldDefinition>;
  deal?: Maybe<Deal>;
  deals: Array<Deal>;
  discoverAgentTools: ToolDiscoveryResponse;
  findMissingStakeholders: MissingStakeholderRecommendations;
  getWfmAllowedTransitions: Array<WfmWorkflowTransition>;
  health: Scalars["String"]["output"];
  lead?: Maybe<Lead>;
  leads: Array<Lead>;
  leadsStats: LeadsStats;
  me?: Maybe<User>;
  myPermissions?: Maybe<Array<Scalars["String"]["output"]>>;
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
  stakeholderAnalyses: Array<StakeholderAnalysis>;
  stakeholderAnalysis?: Maybe<StakeholderAnalysis>;
  supabaseConnectionTest: Scalars["String"]["output"];
  territories: Array<Territory>;
  territory?: Maybe<Territory>;
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

export type QueryFindMissingStakeholdersArgs = {
  dealId?: InputMaybe<Scalars["ID"]["input"]>;
  dealSize?: InputMaybe<Scalars["String"]["input"]>;
  industryType?: InputMaybe<Scalars["String"]["input"]>;
  leadId?: InputMaybe<Scalars["ID"]["input"]>;
  organizationId: Scalars["ID"]["input"];
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
  AccountTerritory: ResolverTypeWrapper<AccountTerritory>;
  Activity: ResolverTypeWrapper<Activity>;
  ActivityFilterInput: ActivityFilterInput;
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
  Boolean: ResolverTypeWrapper<Scalars["Boolean"]["output"]>;
  BudgetAuthorityLevel: BudgetAuthorityLevel;
  CommunicationPreference: CommunicationPreference;
  ConvertedEntities: ResolverTypeWrapper<ConvertedEntities>;
  CreateActivityInput: CreateActivityInput;
  CreateOrganizationRelationshipInput: CreateOrganizationRelationshipInput;
  CreatePersonOrganizationalRoleInput: CreatePersonOrganizationalRoleInput;
  CreatePersonRelationshipInput: CreatePersonRelationshipInput;
  CreateStakeholderAnalysisInput: CreateStakeholderAnalysisInput;
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
  DealHistoryEntry: ResolverTypeWrapper<DealHistoryEntry>;
  DealInput: DealInput;
  DealUpdateInput: DealUpdateInput;
  DecisionAuthority: DecisionAuthority;
  EngagementLevel: EngagementLevel;
  EntityType: EntityType;
  Float: ResolverTypeWrapper<Scalars["Float"]["output"]>;
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
  SendMessageInput: SendMessageInput;
  SeniorityLevel: SeniorityLevel;
  StageType: StageType;
  StakeholderAnalysis: ResolverTypeWrapper<StakeholderAnalysis>;
  StakeholderNetworkAnalysis: ResolverTypeWrapper<StakeholderNetworkAnalysis>;
  String: ResolverTypeWrapper<Scalars["String"]["output"]>;
  Subscription: ResolverTypeWrapper<{}>;
  Territory: ResolverTypeWrapper<Territory>;
  TerritoryType: TerritoryType;
  ThinkingBudget: ThinkingBudget;
  ToolDiscoveryResponse: ResolverTypeWrapper<ToolDiscoveryResponse>;
  UpdateActivityInput: UpdateActivityInput;
  UpdateConversationInput: UpdateConversationInput;
  UpdateRelationshipInsightInput: UpdateRelationshipInsightInput;
  UpdateStakeholderAnalysisInput: UpdateStakeholderAnalysisInput;
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
  AccountTerritory: AccountTerritory;
  Activity: Activity;
  ActivityFilterInput: ActivityFilterInput;
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
  ConvertedEntities: ConvertedEntities;
  CreateActivityInput: CreateActivityInput;
  CreateOrganizationRelationshipInput: CreateOrganizationRelationshipInput;
  CreatePersonOrganizationalRoleInput: CreatePersonOrganizationalRoleInput;
  CreatePersonRelationshipInput: CreatePersonRelationshipInput;
  CreateStakeholderAnalysisInput: CreateStakeholderAnalysisInput;
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
  DealHistoryEntry: DealHistoryEntry;
  DealInput: DealInput;
  DealUpdateInput: DealUpdateInput;
  Float: Scalars["Float"]["output"];
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
  SendMessageInput: SendMessageInput;
  StakeholderAnalysis: StakeholderAnalysis;
  StakeholderNetworkAnalysis: StakeholderNetworkAnalysis;
  String: Scalars["String"]["output"];
  Subscription: {};
  Territory: Territory;
  ToolDiscoveryResponse: ToolDiscoveryResponse;
  UpdateActivityInput: UpdateActivityInput;
  UpdateConversationInput: UpdateConversationInput;
  UpdateRelationshipInsightInput: UpdateRelationshipInsightInput;
  UpdateStakeholderAnalysisInput: UpdateStakeholderAnalysisInput;
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
  assignAccountToTerritory?: Resolver<
    ResolversTypes["AccountTerritory"],
    ParentType,
    ContextType,
    RequireFields<
      MutationAssignAccountToTerritoryArgs,
      "isPrimary" | "organizationId" | "territoryId"
    >
  >;
  convertLead?: Resolver<
    ResolversTypes["LeadConversionResult"],
    ParentType,
    ContextType,
    RequireFields<MutationConvertLeadArgs, "id" | "input">
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
  findMissingStakeholders?: Resolver<
    ResolversTypes["MissingStakeholderRecommendations"],
    ParentType,
    ContextType,
    RequireFields<QueryFindMissingStakeholdersArgs, "organizationId">
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
  leads?: Resolver<
    Array<ResolversTypes["Lead"]>,
    ParentType,
    ContextType,
    Partial<QueryLeadsArgs>
  >;
  leadsStats?: Resolver<ResolversTypes["LeadsStats"], ParentType, ContextType>;
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
  AgentConfig?: AgentConfigResolvers<ContextType>;
  AgentConversation?: AgentConversationResolvers<ContextType>;
  AgentMessage?: AgentMessageResolvers<ContextType>;
  AgentPlan?: AgentPlanResolvers<ContextType>;
  AgentPlanStep?: AgentPlanStepResolvers<ContextType>;
  AgentResponse?: AgentResponseResolvers<ContextType>;
  AgentThought?: AgentThoughtResolvers<ContextType>;
  ConvertedEntities?: ConvertedEntitiesResolvers<ContextType>;
  CustomFieldDefinition?: CustomFieldDefinitionResolvers<ContextType>;
  CustomFieldOption?: CustomFieldOptionResolvers<ContextType>;
  CustomFieldValue?: CustomFieldValueResolvers<ContextType>;
  DateTime?: GraphQLScalarType;
  Deal?: DealResolvers<ContextType>;
  DealHistoryEntry?: DealHistoryEntryResolvers<ContextType>;
  JSON?: GraphQLScalarType;
  Lead?: LeadResolvers<ContextType>;
  LeadConversionResult?: LeadConversionResultResolvers<ContextType>;
  LeadHistoryEntry?: LeadHistoryEntryResolvers<ContextType>;
  LeadsStats?: LeadsStatsResolvers<ContextType>;
  MissingStakeholderRecommendations?: MissingStakeholderRecommendationsResolvers<ContextType>;
  Mutation?: MutationResolvers<ContextType>;
  Organization?: OrganizationResolvers<ContextType>;
  OrganizationRelationship?: OrganizationRelationshipResolvers<ContextType>;
  Person?: PersonResolvers<ContextType>;
  PersonListItem?: PersonListItemResolvers<ContextType>;
  PersonOrganizationalRole?: PersonOrganizationalRoleResolvers<ContextType>;
  PersonRelationship?: PersonRelationshipResolvers<ContextType>;
  Query?: QueryResolvers<ContextType>;
  RelationshipInsight?: RelationshipInsightResolvers<ContextType>;
  StakeholderAnalysis?: StakeholderAnalysisResolvers<ContextType>;
  StakeholderNetworkAnalysis?: StakeholderNetworkAnalysisResolvers<ContextType>;
  Subscription?: SubscriptionResolvers<ContextType>;
  Territory?: TerritoryResolvers<ContextType>;
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
