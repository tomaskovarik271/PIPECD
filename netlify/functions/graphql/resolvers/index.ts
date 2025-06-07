// Import new relationship resolvers
import {
  OrganizationRelationship,
  PersonRelationship,
  PersonOrganizationalRole,
  StakeholderAnalysis,
  relationshipQueries,
  relationshipMutations
} from './relationships';

export const resolvers = {
  Query: {
    // ... existing queries ...
    ...relationshipQueries
  },
  Mutation: {
    // ... existing mutations ...
    ...relationshipMutations
  },
  // ... existing type resolvers ...
  OrganizationRelationship,
  PersonRelationship,
  PersonOrganizationalRole,
  StakeholderAnalysis
}; 