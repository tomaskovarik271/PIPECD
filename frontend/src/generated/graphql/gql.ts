/* eslint-disable */
import * as types from './graphql';
import type { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';

/**
 * Map of all GraphQL operations in the project.
 *
 * This map has several performance disadvantages:
 * 1. It is not tree-shakeable, so it will include all operations in the project.
 * 2. It is not minifiable, so the string of a GraphQL query will be multiple times inside the bundle.
 * 3. It does not support dead code elimination, so it will add unused operations.
 *
 * Therefore it is highly recommended to use the babel or swc plugin for production.
 * Learn more about it here: https://the-guild.dev/graphql/codegen/plugins/presets/preset-client#reducing-bundle-size
 */
type Documents = {
    "\n  mutation CreateOrganization($input: OrganizationInput!) {\n    createOrganization(input: $input) {\n      id # Request fields needed after creation\n      name\n      address\n      notes\n      created_at\n      updated_at\n    }\n  }\n": typeof types.CreateOrganizationDocument,
    "\n  mutation CreatePerson($input: PersonInput!) {\n    createPerson(input: $input) {\n      id\n      first_name\n      last_name\n      email\n      organization_id\n    }\n  }\n": typeof types.CreatePersonDocument,
    "\n  query GetOrganizations {\n    organizations {\n      id\n      name\n    }\n  }\n": typeof types.GetOrganizationsDocument,
    "\n  mutation DeletePerson($id: ID!) {\n    deletePerson(id: $id)\n  }\n": typeof types.DeletePersonDocument,
    "\n  mutation UpdateOrganization($id: ID!, $input: OrganizationInput!) {\n    updateOrganization(id: $id, input: $input) {\n      id # Request fields needed after update\n      name\n      address\n      notes\n      updated_at # Get updated timestamp\n    }\n  }\n": typeof types.UpdateOrganizationDocument,
    "\n  mutation UpdatePerson($id: ID!, $input: PersonInput!) {\n    updatePerson(id: $id, input: $input) {\n      id # Request fields needed to update the list or confirm success\n      first_name\n      last_name\n      email\n      organization_id\n    }\n  }\n": typeof types.UpdatePersonDocument,
};
const documents: Documents = {
    "\n  mutation CreateOrganization($input: OrganizationInput!) {\n    createOrganization(input: $input) {\n      id # Request fields needed after creation\n      name\n      address\n      notes\n      created_at\n      updated_at\n    }\n  }\n": types.CreateOrganizationDocument,
    "\n  mutation CreatePerson($input: PersonInput!) {\n    createPerson(input: $input) {\n      id\n      first_name\n      last_name\n      email\n      organization_id\n    }\n  }\n": types.CreatePersonDocument,
    "\n  query GetOrganizations {\n    organizations {\n      id\n      name\n    }\n  }\n": types.GetOrganizationsDocument,
    "\n  mutation DeletePerson($id: ID!) {\n    deletePerson(id: $id)\n  }\n": types.DeletePersonDocument,
    "\n  mutation UpdateOrganization($id: ID!, $input: OrganizationInput!) {\n    updateOrganization(id: $id, input: $input) {\n      id # Request fields needed after update\n      name\n      address\n      notes\n      updated_at # Get updated timestamp\n    }\n  }\n": types.UpdateOrganizationDocument,
    "\n  mutation UpdatePerson($id: ID!, $input: PersonInput!) {\n    updatePerson(id: $id, input: $input) {\n      id # Request fields needed to update the list or confirm success\n      first_name\n      last_name\n      email\n      organization_id\n    }\n  }\n": types.UpdatePersonDocument,
};

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 *
 *
 * @example
 * ```ts
 * const query = graphql(`query GetUser($id: ID!) { user(id: $id) { name } }`);
 * ```
 *
 * The query argument is unknown!
 * Please regenerate the types.
 */
export function graphql(source: string): unknown;

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation CreateOrganization($input: OrganizationInput!) {\n    createOrganization(input: $input) {\n      id # Request fields needed after creation\n      name\n      address\n      notes\n      created_at\n      updated_at\n    }\n  }\n"): (typeof documents)["\n  mutation CreateOrganization($input: OrganizationInput!) {\n    createOrganization(input: $input) {\n      id # Request fields needed after creation\n      name\n      address\n      notes\n      created_at\n      updated_at\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation CreatePerson($input: PersonInput!) {\n    createPerson(input: $input) {\n      id\n      first_name\n      last_name\n      email\n      organization_id\n    }\n  }\n"): (typeof documents)["\n  mutation CreatePerson($input: PersonInput!) {\n    createPerson(input: $input) {\n      id\n      first_name\n      last_name\n      email\n      organization_id\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query GetOrganizations {\n    organizations {\n      id\n      name\n    }\n  }\n"): (typeof documents)["\n  query GetOrganizations {\n    organizations {\n      id\n      name\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation DeletePerson($id: ID!) {\n    deletePerson(id: $id)\n  }\n"): (typeof documents)["\n  mutation DeletePerson($id: ID!) {\n    deletePerson(id: $id)\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation UpdateOrganization($id: ID!, $input: OrganizationInput!) {\n    updateOrganization(id: $id, input: $input) {\n      id # Request fields needed after update\n      name\n      address\n      notes\n      updated_at # Get updated timestamp\n    }\n  }\n"): (typeof documents)["\n  mutation UpdateOrganization($id: ID!, $input: OrganizationInput!) {\n    updateOrganization(id: $id, input: $input) {\n      id # Request fields needed after update\n      name\n      address\n      notes\n      updated_at # Get updated timestamp\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation UpdatePerson($id: ID!, $input: PersonInput!) {\n    updatePerson(id: $id, input: $input) {\n      id # Request fields needed to update the list or confirm success\n      first_name\n      last_name\n      email\n      organization_id\n    }\n  }\n"): (typeof documents)["\n  mutation UpdatePerson($id: ID!, $input: PersonInput!) {\n    updatePerson(id: $id, input: $input) {\n      id # Request fields needed to update the list or confirm success\n      first_name\n      last_name\n      email\n      organization_id\n    }\n  }\n"];

export function graphql(source: string) {
  return (documents as any)[source] ?? {};
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> = TDocumentNode extends DocumentNode<  infer TType,  any>  ? TType  : never;