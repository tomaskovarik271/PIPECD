import type { MutationResolvers } from '../../../../lib/generated/graphql'; // Adjusted path
import type { GraphQLContext } from '../helpers';

// Import specific mutation resolver groups from ./mutations/ directory
import { dealMutations } from './mutations/dealMutations';
import { organizationMutations } from './mutations/organizationMutations';
import { personMutations } from './mutations/personMutations';
// import { pipelineMutations } from './mutations/pipelineMutations'; // REMOVED
// import { stageMutations } from './mutations/stageMutations'; // REMOVED
import { userProfileMutations } from './mutations/userProfileMutations';
import { pricingMutationResolvers } from './mutations/pricingMutations'; // Added pricing mutations

// This file primarily aggregates mutations from the ./mutations subdirectory.
// Other mutations (like Activity or CustomFields) seem to be aggregated directly in graphql.ts
export const Mutation: MutationResolvers<GraphQLContext> = {
  ...dealMutations,
  ...organizationMutations,
    ...personMutations,
    // ...pipelineMutations, // REMOVED
    // ...stageMutations, // REMOVED
  ...userProfileMutations,
  ...pricingMutationResolvers,
}; 