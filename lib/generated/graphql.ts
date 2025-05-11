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
  DateTime: { input: any; output: any };
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
};

export type Deal = {
  __typename?: "Deal";
  activities: Array<Activity>;
  amount?: Maybe<Scalars["Float"]["output"]>;
  created_at: Scalars["DateTime"]["output"];
  deal_specific_probability?: Maybe<Scalars["Float"]["output"]>;
  expected_close_date?: Maybe<Scalars["DateTime"]["output"]>;
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

export type DealInput = {
  amount?: InputMaybe<Scalars["Float"]["input"]>;
  deal_specific_probability?: InputMaybe<Scalars["Float"]["input"]>;
  expected_close_date?: InputMaybe<Scalars["DateTime"]["input"]>;
  name: Scalars["String"]["input"];
  organization_id?: InputMaybe<Scalars["ID"]["input"]>;
  person_id?: InputMaybe<Scalars["ID"]["input"]>;
  pipeline_id: Scalars["ID"]["input"];
  stage_id: Scalars["ID"]["input"];
};

export type Mutation = {
  __typename?: "Mutation";
  createActivity: Activity;
  createDeal: Deal;
  createOrganization: Organization;
  createPerson: Person;
  createPipeline: Pipeline;
  createStage: Stage;
  deleteActivity: Scalars["ID"]["output"];
  deleteDeal?: Maybe<Scalars["Boolean"]["output"]>;
  deleteOrganization?: Maybe<Scalars["Boolean"]["output"]>;
  deletePerson?: Maybe<Scalars["Boolean"]["output"]>;
  deletePipeline: Scalars["Boolean"]["output"];
  deleteStage: Scalars["Boolean"]["output"];
  updateActivity: Activity;
  updateDeal?: Maybe<Deal>;
  updateOrganization?: Maybe<Organization>;
  updatePerson?: Maybe<Person>;
  updatePipeline: Pipeline;
  updateStage: Stage;
};

export type MutationCreateActivityArgs = {
  input: CreateActivityInput;
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

export type MutationCreateStageArgs = {
  input: CreateStageInput;
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

export type MutationDeleteStageArgs = {
  id: Scalars["ID"]["input"];
};

export type MutationUpdateActivityArgs = {
  id: Scalars["ID"]["input"];
  input: UpdateActivityInput;
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

export type MutationUpdateStageArgs = {
  id: Scalars["ID"]["input"];
  input: UpdateStageInput;
};

/** Defines the Organization type and related queries/mutations. */
export type Organization = {
  __typename?: "Organization";
  activities: Array<Activity>;
  address?: Maybe<Scalars["String"]["output"]>;
  created_at: Scalars["DateTime"]["output"];
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
  name: Scalars["String"]["input"];
  notes?: InputMaybe<Scalars["String"]["input"]>;
};

/** Defines the Person type and related queries/mutations. */
export type Person = {
  __typename?: "Person";
  activities: Array<Activity>;
  created_at: Scalars["DateTime"]["output"];
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

export type Query = {
  __typename?: "Query";
  activities: Array<Activity>;
  activity?: Maybe<Activity>;
  deal?: Maybe<Deal>;
  deals: Array<Deal>;
  health: Scalars["String"]["output"];
  me?: Maybe<UserInfo>;
  myPermissions?: Maybe<Array<Scalars["String"]["output"]>>;
  organization?: Maybe<Organization>;
  organizations: Array<Organization>;
  people: Array<Person>;
  person?: Maybe<Person>;
  personList: Array<PersonListItem>;
  pipeline?: Maybe<Pipeline>;
  pipelines: Array<Pipeline>;
  stage?: Maybe<Stage>;
  stages: Array<Stage>;
  supabaseConnectionTest: Scalars["String"]["output"];
};

export type QueryActivitiesArgs = {
  filter?: InputMaybe<ActivityFilterInput>;
};

export type QueryActivityArgs = {
  id: Scalars["ID"]["input"];
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

export type QueryPipelineArgs = {
  id: Scalars["ID"]["input"];
};

export type QueryStageArgs = {
  id: Scalars["ID"]["input"];
};

export type QueryStagesArgs = {
  pipelineId: Scalars["ID"]["input"];
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
  updated_at: Scalars["String"]["output"];
  user_id: Scalars["ID"]["output"];
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
};

export type UserInfo = {
  __typename?: "UserInfo";
  email?: Maybe<Scalars["String"]["output"]>;
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
  Boolean: ResolverTypeWrapper<Scalars["Boolean"]["output"]>;
  CreateActivityInput: CreateActivityInput;
  CreateStageInput: CreateStageInput;
  DateTime: ResolverTypeWrapper<Scalars["DateTime"]["output"]>;
  Deal: ResolverTypeWrapper<Deal>;
  DealInput: DealInput;
  Float: ResolverTypeWrapper<Scalars["Float"]["output"]>;
  ID: ResolverTypeWrapper<Scalars["ID"]["output"]>;
  Int: ResolverTypeWrapper<Scalars["Int"]["output"]>;
  Mutation: ResolverTypeWrapper<{}>;
  Organization: ResolverTypeWrapper<Organization>;
  OrganizationInput: OrganizationInput;
  Person: ResolverTypeWrapper<Person>;
  PersonInput: PersonInput;
  PersonListItem: ResolverTypeWrapper<PersonListItem>;
  Pipeline: ResolverTypeWrapper<Pipeline>;
  PipelineInput: PipelineInput;
  Query: ResolverTypeWrapper<{}>;
  Stage: ResolverTypeWrapper<Stage>;
  String: ResolverTypeWrapper<Scalars["String"]["output"]>;
  UpdateActivityInput: UpdateActivityInput;
  UpdateStageInput: UpdateStageInput;
  UserInfo: ResolverTypeWrapper<UserInfo>;
};

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = {
  Activity: Activity;
  ActivityFilterInput: ActivityFilterInput;
  Boolean: Scalars["Boolean"]["output"];
  CreateActivityInput: CreateActivityInput;
  CreateStageInput: CreateStageInput;
  DateTime: Scalars["DateTime"]["output"];
  Deal: Deal;
  DealInput: DealInput;
  Float: Scalars["Float"]["output"];
  ID: Scalars["ID"]["output"];
  Int: Scalars["Int"]["output"];
  Mutation: {};
  Organization: Organization;
  OrganizationInput: OrganizationInput;
  Person: Person;
  PersonInput: PersonInput;
  PersonListItem: PersonListItem;
  Pipeline: Pipeline;
  PipelineInput: PipelineInput;
  Query: {};
  Stage: Stage;
  String: Scalars["String"]["output"];
  UpdateActivityInput: UpdateActivityInput;
  UpdateStageInput: UpdateStageInput;
  UserInfo: UserInfo;
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
  user_id?: Resolver<ResolversTypes["ID"], ParentType, ContextType>;
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

export type MutationResolvers<
  ContextType = GraphQLContext,
  ParentType extends
    ResolversParentTypes["Mutation"] = ResolversParentTypes["Mutation"],
> = {
  createActivity?: Resolver<
    ResolversTypes["Activity"],
    ParentType,
    ContextType,
    RequireFields<MutationCreateActivityArgs, "input">
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
  createStage?: Resolver<
    ResolversTypes["Stage"],
    ParentType,
    ContextType,
    RequireFields<MutationCreateStageArgs, "input">
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
  deleteStage?: Resolver<
    ResolversTypes["Boolean"],
    ParentType,
    ContextType,
    RequireFields<MutationDeleteStageArgs, "id">
  >;
  updateActivity?: Resolver<
    ResolversTypes["Activity"],
    ParentType,
    ContextType,
    RequireFields<MutationUpdateActivityArgs, "id" | "input">
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
  updateStage?: Resolver<
    ResolversTypes["Stage"],
    ParentType,
    ContextType,
    RequireFields<MutationUpdateStageArgs, "id" | "input">
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
  deal?: Resolver<
    Maybe<ResolversTypes["Deal"]>,
    ParentType,
    ContextType,
    RequireFields<QueryDealArgs, "id">
  >;
  deals?: Resolver<Array<ResolversTypes["Deal"]>, ParentType, ContextType>;
  health?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  me?: Resolver<Maybe<ResolversTypes["UserInfo"]>, ParentType, ContextType>;
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
  pipeline?: Resolver<
    Maybe<ResolversTypes["Pipeline"]>,
    ParentType,
    ContextType,
    RequireFields<QueryPipelineArgs, "id">
  >;
  pipelines?: Resolver<
    Array<ResolversTypes["Pipeline"]>,
    ParentType,
    ContextType
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
  updated_at?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  user_id?: Resolver<ResolversTypes["ID"], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type UserInfoResolvers<
  ContextType = GraphQLContext,
  ParentType extends
    ResolversParentTypes["UserInfo"] = ResolversParentTypes["UserInfo"],
> = {
  email?: Resolver<Maybe<ResolversTypes["String"]>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes["ID"], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type Resolvers<ContextType = GraphQLContext> = {
  Activity?: ActivityResolvers<ContextType>;
  DateTime?: GraphQLScalarType;
  Deal?: DealResolvers<ContextType>;
  Mutation?: MutationResolvers<ContextType>;
  Organization?: OrganizationResolvers<ContextType>;
  Person?: PersonResolvers<ContextType>;
  PersonListItem?: PersonListItemResolvers<ContextType>;
  Pipeline?: PipelineResolvers<ContextType>;
  Query?: QueryResolvers<ContextType>;
  Stage?: StageResolvers<ContextType>;
  UserInfo?: UserInfoResolvers<ContextType>;
};
