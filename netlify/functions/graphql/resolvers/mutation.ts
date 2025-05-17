import { GraphQLContext } from '../helpers'; // Only GraphQLContext might be needed if all specific helpers moved
// import { GraphQLError } from 'graphql'; // No longer needed here
// import { requireAuthentication, getAccessToken, processZodError } from '../helpers'; // Moved to individual files
// import {} from '../validators'; // All validator schemas moved
// import * as userProfileService from '../../../../lib/userProfileService'; // Moved

import type { 
    MutationResolvers,
    // User as GraphQLUser, // Moved
    // UpdateUserProfileInput // Moved
} from '../../../../lib/generated/graphql';

import { personMutations } from './mutations/personMutations';
import { organizationMutations } from './mutations/organizationMutations';
import { dealMutations } from './mutations/dealMutations';
import { pipelineMutations } from './mutations/pipelineMutations';
import { stageMutations } from './mutations/stageMutations';
import { userProfileMutations } from './mutations/userProfileMutations'; // Import user profile mutations

export const Mutation: MutationResolvers<GraphQLContext> = {
    ...personMutations,
    ...organizationMutations,
    ...dealMutations,
    ...pipelineMutations,
    ...stageMutations,
    ...userProfileMutations, // Spread user profile mutations
}; 