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
};

export type Activity = {
  __typename?: 'Activity';
  created_at: Scalars['DateTime']['output'];
  deal?: Maybe<Deal>;
  deal_id?: Maybe<Scalars['ID']['output']>;
  due_date?: Maybe<Scalars['DateTime']['output']>;
  id: Scalars['ID']['output'];
  is_done: Scalars['Boolean']['output'];
  notes?: Maybe<Scalars['String']['output']>;
  organization?: Maybe<Organization>;
  organization_id?: Maybe<Scalars['ID']['output']>;
  person?: Maybe<Person>;
  person_id?: Maybe<Scalars['ID']['output']>;
  subject: Scalars['String']['output'];
  type: ActivityType;
  updated_at: Scalars['DateTime']['output'];
  user_id: Scalars['ID']['output'];
};

export type ActivityFilterInput = {
  dealId?: InputMaybe<Scalars['ID']['input']>;
  isDone?: InputMaybe<Scalars['Boolean']['input']>;
  organizationId?: InputMaybe<Scalars['ID']['input']>;
  personId?: InputMaybe<Scalars['ID']['input']>;
};

/** Defines the GraphQL schema for Activities. */
export type ActivityType =
  | 'CALL'
  | 'DEADLINE'
  | 'EMAIL'
  | 'MEETING'
  | 'TASK';

export type CreateActivityInput = {
  deal_id?: InputMaybe<Scalars['ID']['input']>;
  due_date?: InputMaybe<Scalars['DateTime']['input']>;
  is_done?: InputMaybe<Scalars['Boolean']['input']>;
  notes?: InputMaybe<Scalars['String']['input']>;
  organization_id?: InputMaybe<Scalars['ID']['input']>;
  person_id?: InputMaybe<Scalars['ID']['input']>;
  subject: Scalars['String']['input'];
  type: ActivityType;
};

export type CreateStageInput = {
  deal_probability?: InputMaybe<Scalars['Float']['input']>;
  name: Scalars['String']['input'];
  order: Scalars['Int']['input'];
  pipeline_id: Scalars['ID']['input'];
};

export type Deal = {
  __typename?: 'Deal';
  activities: Array<Activity>;
  amount?: Maybe<Scalars['Float']['output']>;
  created_at: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  person?: Maybe<Person>;
  person_id?: Maybe<Scalars['ID']['output']>;
  stage: Stage;
  stage_id: Scalars['ID']['output'];
  updated_at: Scalars['DateTime']['output'];
  user_id: Scalars['ID']['output'];
};

export type DealInput = {
  amount?: InputMaybe<Scalars['Float']['input']>;
  name: Scalars['String']['input'];
  person_id?: InputMaybe<Scalars['ID']['input']>;
  stage_id: Scalars['ID']['input'];
};

export type Mutation = {
  __typename?: 'Mutation';
  createActivity: Activity;
  createDeal: Deal;
  createOrganization: Organization;
  createPerson: Person;
  createPipeline: Pipeline;
  createStage: Stage;
  deleteActivity: Scalars['ID']['output'];
  deleteDeal?: Maybe<Scalars['Boolean']['output']>;
  deleteOrganization?: Maybe<Scalars['Boolean']['output']>;
  deletePerson?: Maybe<Scalars['Boolean']['output']>;
  deletePipeline: Scalars['Boolean']['output'];
  deleteStage: Scalars['Boolean']['output'];
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
  id: Scalars['ID']['input'];
};


export type MutationDeleteDealArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteOrganizationArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeletePersonArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeletePipelineArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteStageArgs = {
  id: Scalars['ID']['input'];
};


export type MutationUpdateActivityArgs = {
  id: Scalars['ID']['input'];
  input: UpdateActivityInput;
};


export type MutationUpdateDealArgs = {
  id: Scalars['ID']['input'];
  input: DealInput;
};


export type MutationUpdateOrganizationArgs = {
  id: Scalars['ID']['input'];
  input: OrganizationInput;
};


export type MutationUpdatePersonArgs = {
  id: Scalars['ID']['input'];
  input: PersonInput;
};


export type MutationUpdatePipelineArgs = {
  id: Scalars['ID']['input'];
  input: PipelineInput;
};


export type MutationUpdateStageArgs = {
  id: Scalars['ID']['input'];
  input: UpdateStageInput;
};

/** Defines the Organization type and related queries/mutations. */
export type Organization = {
  __typename?: 'Organization';
  activities: Array<Activity>;
  address?: Maybe<Scalars['String']['output']>;
  created_at: Scalars['DateTime']['output'];
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
  name: Scalars['String']['input'];
  notes?: InputMaybe<Scalars['String']['input']>;
};

/** Defines the Person type and related queries/mutations. */
export type Person = {
  __typename?: 'Person';
  activities: Array<Activity>;
  created_at: Scalars['DateTime']['output'];
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

export type Pipeline = {
  __typename?: 'Pipeline';
  created_at: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  updated_at: Scalars['String']['output'];
  user_id: Scalars['ID']['output'];
};

export type PipelineInput = {
  name: Scalars['String']['input'];
};

export type Query = {
  __typename?: 'Query';
  activities: Array<Activity>;
  activity?: Maybe<Activity>;
  deal?: Maybe<Deal>;
  deals: Array<Deal>;
  health: Scalars['String']['output'];
  me?: Maybe<UserInfo>;
  myPermissions?: Maybe<Array<Scalars['String']['output']>>;
  organization?: Maybe<Organization>;
  organizations: Array<Organization>;
  people: Array<Person>;
  person?: Maybe<Person>;
  personList: Array<PersonListItem>;
  pipeline?: Maybe<Pipeline>;
  pipelines: Array<Pipeline>;
  stage?: Maybe<Stage>;
  stages: Array<Stage>;
  supabaseConnectionTest: Scalars['String']['output'];
};


export type QueryActivitiesArgs = {
  filter?: InputMaybe<ActivityFilterInput>;
};


export type QueryActivityArgs = {
  id: Scalars['ID']['input'];
};


export type QueryDealArgs = {
  id: Scalars['ID']['input'];
};


export type QueryOrganizationArgs = {
  id: Scalars['ID']['input'];
};


export type QueryPersonArgs = {
  id: Scalars['ID']['input'];
};


export type QueryPipelineArgs = {
  id: Scalars['ID']['input'];
};


export type QueryStageArgs = {
  id: Scalars['ID']['input'];
};


export type QueryStagesArgs = {
  pipelineId: Scalars['ID']['input'];
};

export type Stage = {
  __typename?: 'Stage';
  created_at: Scalars['String']['output'];
  deal_probability?: Maybe<Scalars['Float']['output']>;
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  order: Scalars['Int']['output'];
  pipeline: Pipeline;
  pipeline_id: Scalars['ID']['output'];
  updated_at: Scalars['String']['output'];
  user_id: Scalars['ID']['output'];
};

export type UpdateActivityInput = {
  deal_id?: InputMaybe<Scalars['ID']['input']>;
  due_date?: InputMaybe<Scalars['DateTime']['input']>;
  is_done?: InputMaybe<Scalars['Boolean']['input']>;
  notes?: InputMaybe<Scalars['String']['input']>;
  organization_id?: InputMaybe<Scalars['ID']['input']>;
  person_id?: InputMaybe<Scalars['ID']['input']>;
  subject?: InputMaybe<Scalars['String']['input']>;
  type?: InputMaybe<ActivityType>;
};

export type UpdateStageInput = {
  deal_probability?: InputMaybe<Scalars['Float']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  order?: InputMaybe<Scalars['Int']['input']>;
};

export type UserInfo = {
  __typename?: 'UserInfo';
  email?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
};

export type CreateOrganizationMutationVariables = Exact<{
  input: OrganizationInput;
}>;


export type CreateOrganizationMutation = { __typename?: 'Mutation', createOrganization: { __typename?: 'Organization', id: string, name: string, address?: string | null, notes?: string | null, created_at: string, updated_at: string } };

export type CreatePersonMutationVariables = Exact<{
  input: PersonInput;
}>;


export type CreatePersonMutation = { __typename?: 'Mutation', createPerson: { __typename?: 'Person', id: string, first_name?: string | null, last_name?: string | null, email?: string | null, organization_id?: string | null } };

export type GetOrganizationsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetOrganizationsQuery = { __typename?: 'Query', organizations: Array<{ __typename?: 'Organization', id: string, name: string }> };

export type DeletePersonMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type DeletePersonMutation = { __typename?: 'Mutation', deletePerson?: boolean | null };

export type UpdateOrganizationMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  input: OrganizationInput;
}>;


export type UpdateOrganizationMutation = { __typename?: 'Mutation', updateOrganization?: { __typename?: 'Organization', id: string, name: string, address?: string | null, notes?: string | null, updated_at: string } | null };

export type UpdatePersonMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  input: PersonInput;
}>;


export type UpdatePersonMutation = { __typename?: 'Mutation', updatePerson?: { __typename?: 'Person', id: string, first_name?: string | null, last_name?: string | null, email?: string | null, organization_id?: string | null } | null };


export const CreateOrganizationDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateOrganization"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"OrganizationInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createOrganization"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"address"}},{"kind":"Field","name":{"kind":"Name","value":"notes"}},{"kind":"Field","name":{"kind":"Name","value":"created_at"}},{"kind":"Field","name":{"kind":"Name","value":"updated_at"}}]}}]}}]} as unknown as DocumentNode<CreateOrganizationMutation, CreateOrganizationMutationVariables>;
export const CreatePersonDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreatePerson"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"PersonInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createPerson"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"first_name"}},{"kind":"Field","name":{"kind":"Name","value":"last_name"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"organization_id"}}]}}]}}]} as unknown as DocumentNode<CreatePersonMutation, CreatePersonMutationVariables>;
export const GetOrganizationsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetOrganizations"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"organizations"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]} as unknown as DocumentNode<GetOrganizationsQuery, GetOrganizationsQueryVariables>;
export const DeletePersonDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DeletePerson"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deletePerson"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}]}]}}]} as unknown as DocumentNode<DeletePersonMutation, DeletePersonMutationVariables>;
export const UpdateOrganizationDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateOrganization"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"OrganizationInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateOrganization"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"address"}},{"kind":"Field","name":{"kind":"Name","value":"notes"}},{"kind":"Field","name":{"kind":"Name","value":"updated_at"}}]}}]}}]} as unknown as DocumentNode<UpdateOrganizationMutation, UpdateOrganizationMutationVariables>;
export const UpdatePersonDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdatePerson"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"PersonInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updatePerson"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"first_name"}},{"kind":"Field","name":{"kind":"Name","value":"last_name"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"organization_id"}}]}}]}}]} as unknown as DocumentNode<UpdatePersonMutation, UpdatePersonMutationVariables>;