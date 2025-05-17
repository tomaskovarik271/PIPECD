# Refactoring Plan: `mutation.ts` Resolvers

**ID:** TECH-TASK-01
**Status:** Done

**Goal:** Split `netlify/functions/graphql/resolvers/mutation.ts` into multiple files, organized by entity or logical grouping, within a new `mutations` subdirectory. This will improve code organization, readability, and maintainability.

**Current State:** `netlify/functions/graphql/resolvers/mutation.ts` contains all GraphQL mutation resolvers for various entities (People, Organizations, Deals, Pipelines, Stages, User Profiles).

**Proposed Structure:**

```
netlify/
└── functions/
    └── graphql/
        ├── resolvers/
        │   ├── mutations/  <-- NEW DIRECTORY
        │   │   ├── dealMutations.ts
        │   │   ├── organizationMutations.ts
        │   │   ├── personMutations.ts
        │   │   ├── pipelineMutations.ts
        │   │   ├── stageMutations.ts
        │   │   └── userProfileMutations.ts
        │   ├── mutation.ts       <-- Will be refactored to import and aggregate
        │   ├── query.ts
        │   ├── customFields.ts
        │   └── ... (other resolver files)
        ├── helpers.ts
        └── ... (other GraphQL related files)
```

**Detailed Steps:**

1.  **Create New Directory:**
    *   Create the directory: `netlify/functions/graphql/resolvers/mutations/`

2.  **Move Helper Function `convertToDateOrNull`:**
    *   Locate the `convertToDateOrNull` function currently in `netlify/functions/graphql/resolvers/mutation.ts`.
    *   Move this function to `netlify/functions/graphql/helpers.ts`.
    *   Ensure it is exported from `helpers.ts`.
    *   Update any files that use this function (initially `dealMutations.ts` once created) to import it from `netlify/functions/graphql/helpers.ts`.

3.  **Create Individual Mutation Files:**
    *   For each logical entity grouping, create a new TypeScript file within the `netlify/functions/graphql/resolvers/mutations/` directory.

    *   **File: `personMutations.ts`**
        *   Move `createPerson`, `updatePerson`, `deletePerson` resolvers from `mutation.ts` into this file.
        *   Ensure all necessary imports (e.g., `GraphQLError`, `GraphQLContext`, `personService`, `PersonCreateSchema`, `PersonUpdateSchema`, `inngest`, `requireAuthentication`, `getAccessToken`, `processZodError`, generated types) are present at the top of this file.
        *   Export an object containing these mutations:
            ```typescript
            export const personMutations = {
              createPerson: async (_parent, args, context) => { /* ... */ },
              updatePerson: async (_parent, args, context) => { /* ... */ },
              deletePerson: async (_parent, args, context) => { /* ... */ },
            };
            ```

    *   **File: `organizationMutations.ts`**
        *   Move `createOrganization`, `updateOrganization`, `deleteOrganization` resolvers.
        *   Add necessary imports.
        *   Export `organizationMutations` object.

    *   **File: `dealMutations.ts`**
        *   Move `createDeal`, `updateDeal`, `deleteDeal` resolvers.
        *   Add necessary imports (including `convertToDateOrNull` from `../helpers.ts`).
        *   Export `dealMutations` object.

    *   **File: `pipelineMutations.ts`**
        *   Move `createPipeline`, `updatePipeline`, `deletePipeline` resolvers.
        *   Add necessary imports.
        *   Export `pipelineMutations` object.

    *   **File: `stageMutations.ts`**
        *   Move `createStage`, `updateStage`, `deleteStage` resolvers.
        *   Add necessary imports.
        *   Export `stageMutations` object.

    *   **File: `userProfileMutations.ts`**
        *   Move `updateUserProfile` resolver.
        *   Add necessary imports.
        *   Export `userProfileMutations` object.

4.  **Refactor Main `netlify/functions/graphql/resolvers/mutation.ts`:**
    *   Remove all the individual resolver function implementations that were moved.
    *   Remove associated imports that are no longer needed in this specific file (as they've been moved to the new individual files).
    *   Keep imports like `GraphQLContext` (if used for `MutationResolvers` type) and `MutationResolvers` from generated types.
    *   Import the exported mutation objects from each new file:
        ```typescript
        import { GraphQLContext } from '../helpers'; // Or specific context type
        import type { MutationResolvers } from '../../../../lib/generated/graphql';

        import { personMutations } from './mutations/personMutations';
        import { organizationMutations } from './mutations/organizationMutations';
        import { dealMutations } from './mutations/dealMutations';
        import { pipelineMutations } from './mutations/pipelineMutations';
        import { stageMutations } from './mutations/stageMutations';
        import { userProfileMutations } from './mutations/userProfileMutations';

        export const Mutation: MutationResolvers<GraphQLContext> = {
          ...personMutations,
          ...organizationMutations,
          ...dealMutations,
          ...pipelineMutations,
          ...stageMutations,
          ...userProfileMutations,
        };
        ```

5.  **Verification:**
    *   The main GraphQL handler (`netlify/functions/graphql.ts`) should continue to work without changes, as it imports the `Mutation` object from `netlify/functions/graphql/resolvers/mutation.ts`, which will still export the fully aggregated mutations.
    *   After refactoring, run type checking (e.g., `tsc --noEmit` or your IDE's checker) to catch any import/export issues.
    *   Restart the development server and test a few mutations from different entities to ensure they still function correctly.

**Execution Order Suggestion:**

1.  Create the `netlify/functions/graphql/resolvers/mutations/` directory.
2.  Move `convertToDateOrNull` to `helpers.ts`, ensure it's exported, and update `dealMutations.ts` (once created) to import it.
3.  Refactor one entity group at a time (e.g., start with `personMutations.ts`):
    *   Create the new file.
    *   Move the relevant resolvers and their imports.
    *   Export the mutations object from the new file.
    *   Update the main `mutation.ts` to import and spread this new mutations object.
    *   Remove the moved code and now-unused imports from `mutation.ts`.
4.  Repeat step 3 for all other entity groups.
5.  Perform final cleanup of `mutation.ts`.
6.  Thoroughly test.

This incremental approach allows for easier debugging and verification at each stage of the refactor. 