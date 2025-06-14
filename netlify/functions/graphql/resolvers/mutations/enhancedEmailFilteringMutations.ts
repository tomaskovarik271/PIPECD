import { 
  contactAssociationService, 
  userEmailFilterPreferencesService, 
  emailContactDiscoveryService,
  CreateDealContactAssociationInput,
  UpdateDealContactAssociationInput,
  ContactRoleType
} from '../../../../lib/contactAssociationService';
import { validateUserPermissions } from '../validators';

// =============================================
// Contact Association Mutations
// =============================================

export const createDealContactAssociation = async (
  _: any,
  { input }: { input: CreateDealContactAssociationInput },
  context: any
) => {
  try {
    const { user } = context;
    if (!user) {
      throw new Error('Authentication required');
    }

    // Validate user has permission to update the deal
    await validateUserPermissions(user.id, 'deal:update_own', input.dealId);

    const association = await contactAssociationService.createDealContactAssociation(input, user.id);
    
    return {
      id: association.id,
      dealId: association.dealId,
      personId: association.personId,
      role: association.role,
      customRoleLabel: association.customRoleLabel,
      includeInEmailFilter: association.includeInEmailFilter,
      createdAt: association.createdAt,
      updatedAt: association.updatedAt,
      createdByUserId: association.createdByUserId,
    };
  } catch (error) {
    console.error('createDealContactAssociation mutation error:', error);
    throw error;
  }
};

export const updateDealContactAssociation = async (
  _: any,
  { input }: { input: UpdateDealContactAssociationInput },
  context: any
) => {
  try {
    const { user } = context;
    if (!user) {
      throw new Error('Authentication required');
    }

    // Get the existing association to validate permissions
    const existingAssociations = await contactAssociationService.getDealContactAssociations(input.id);
    if (existingAssociations.length === 0) {
      throw new Error('Contact association not found');
    }

    const existingAssociation = existingAssociations[0];
    await validateUserPermissions(user.id, 'deal:update_own', existingAssociation.dealId);

    const association = await contactAssociationService.updateDealContactAssociation(input);
    
    return {
      id: association.id,
      dealId: association.dealId,
      personId: association.personId,
      role: association.role,
      customRoleLabel: association.customRoleLabel,
      includeInEmailFilter: association.includeInEmailFilter,
      createdAt: association.createdAt,
      updatedAt: association.updatedAt,
      createdByUserId: association.createdByUserId,
    };
  } catch (error) {
    console.error('updateDealContactAssociation mutation error:', error);
    throw error;
  }
};

export const deleteDealContactAssociation = async (
  _: any,
  { id }: { id: string },
  context: any
) => {
  try {
    const { user } = context;
    if (!user) {
      throw new Error('Authentication required');
    }

    // Get the existing association to validate permissions
    const existingAssociations = await contactAssociationService.getDealContactAssociations(id);
    if (existingAssociations.length === 0) {
      throw new Error('Contact association not found');
    }

    const existingAssociation = existingAssociations[0];
    await validateUserPermissions(user.id, 'deal:update_own', existingAssociation.dealId);

    const success = await contactAssociationService.deleteDealContactAssociation(id);
    return success;
  } catch (error) {
    console.error('deleteDealContactAssociation mutation error:', error);
    throw error;
  }
};

export const bulkUpdateDealContactAssociations = async (
  _: any,
  { input }: { input: { dealId: string; associations: UpdateDealContactAssociationInput[] } },
  context: any
) => {
  try {
    const { user } = context;
    if (!user) {
      throw new Error('Authentication required');
    }

    // Validate user has permission to update the deal
    await validateUserPermissions(user.id, 'deal:update_own', input.dealId);

    const associations = await contactAssociationService.bulkUpdateDealContactAssociations(
      input.dealId,
      input.associations
    );
    
    return associations.map(association => ({
      id: association.id,
      dealId: association.dealId,
      personId: association.personId,
      role: association.role,
      customRoleLabel: association.customRoleLabel,
      includeInEmailFilter: association.includeInEmailFilter,
      createdAt: association.createdAt,
      updatedAt: association.updatedAt,
      createdByUserId: association.createdByUserId,
    }));
  } catch (error) {
    console.error('bulkUpdateDealContactAssociations mutation error:', error);
    throw error;
  }
};

// =============================================
// User Email Filter Preferences Mutations
// =============================================

export const updateUserEmailFilterPreferences = async (
  _: any,
  { input }: { 
    input: { 
      defaultContactScope?: string;
      includeNewParticipants?: boolean;
      autoDiscoverContacts?: boolean;
    } 
  },
  context: any
) => {
  try {
    const { user } = context;
    if (!user) {
      throw new Error('Authentication required');
    }

    const preferences = await userEmailFilterPreferencesService.updateUserEmailFilterPreferences(
      user.id,
      input
    );
    
    return {
      id: preferences.id,
      userId: preferences.userId,
      defaultContactScope: preferences.defaultContactScope,
      includeNewParticipants: preferences.includeNewParticipants,
      autoDiscoverContacts: preferences.autoDiscoverContacts,
      savedFilterPresets: preferences.savedFilterPresets,
      createdAt: preferences.createdAt,
      updatedAt: preferences.updatedAt,
    };
  } catch (error) {
    console.error('updateUserEmailFilterPreferences mutation error:', error);
    throw error;
  }
};

// =============================================
// Email Contact Discovery Mutations
// =============================================

export const discoverEmailContacts = async (
  _: any,
  { dealId }: { dealId: string },
  context: any
) => {
  try {
    const { user } = context;
    if (!user) {
      throw new Error('Authentication required');
    }

    // Validate user has permission to read the deal
    await validateUserPermissions(user.id, 'deal:read_own', dealId);

    // This would typically analyze recent email threads for the deal
    // For now, return pending suggestions
    const suggestions = await emailContactDiscoveryService.getPendingEmailContactSuggestions(dealId);
    
    return suggestions.map(suggestion => ({
      id: suggestion.id,
      dealId: suggestion.dealId,
      emailAddress: suggestion.emailAddress,
      discoveredName: suggestion.discoveredName,
      suggestedRole: suggestion.suggestedRole,
      confidenceScore: suggestion.confidenceScore,
      firstSeenThreadId: suggestion.firstSeenThreadId,
      emailCount: suggestion.emailCount,
      isExistingContact: suggestion.isExistingContact,
      existingPersonId: suggestion.existingPersonId,
      status: suggestion.status,
      createdAt: suggestion.createdAt,
      processedAt: suggestion.processedAt,
      processedByUserId: suggestion.processedByUserId,
    }));
  } catch (error) {
    console.error('discoverEmailContacts mutation error:', error);
    throw error;
  }
};

export const processEmailContactSuggestion = async (
  _: any,
  { input }: { 
    input: { 
      id: string;
      action: string;
      associationRole?: ContactRoleType;
      customRoleLabel?: string;
    } 
  },
  context: any
) => {
  try {
    const { user } = context;
    if (!user) {
      throw new Error('Authentication required');
    }

    // Get the suggestion to validate permissions
    const suggestions = await emailContactDiscoveryService.getPendingEmailContactSuggestions(''); // This would need to be updated
    const suggestion = suggestions.find(s => s.id === input.id);
    
    if (!suggestion) {
      throw new Error('Email contact suggestion not found');
    }

    // Validate user has permission to update the deal
    await validateUserPermissions(user.id, 'deal:update_own', suggestion.dealId);

    // Process the suggestion based on action
    switch (input.action) {
      case 'accept':
        // Create contact association if accepted
        if (suggestion.existingPersonId && input.associationRole) {
          await contactAssociationService.createDealContactAssociation(
            {
              dealId: suggestion.dealId,
              personId: suggestion.existingPersonId,
              role: input.associationRole,
              customRoleLabel: input.customRoleLabel,
              includeInEmailFilter: true,
            },
            user.id
          );
        }
        break;
      case 'reject':
        // Mark as rejected
        break;
      case 'associate':
        // Create association with specified role
        if (suggestion.existingPersonId && input.associationRole) {
          await contactAssociationService.createDealContactAssociation(
            {
              dealId: suggestion.dealId,
              personId: suggestion.existingPersonId,
              role: input.associationRole,
              customRoleLabel: input.customRoleLabel,
              includeInEmailFilter: true,
            },
            user.id
          );
        }
        break;
    }

    // Return the updated suggestion (this would need to be implemented in the service)
    return {
      id: suggestion.id,
      dealId: suggestion.dealId,
      emailAddress: suggestion.emailAddress,
      discoveredName: suggestion.discoveredName,
      suggestedRole: suggestion.suggestedRole,
      confidenceScore: suggestion.confidenceScore,
      firstSeenThreadId: suggestion.firstSeenThreadId,
      emailCount: suggestion.emailCount,
      isExistingContact: suggestion.isExistingContact,
      existingPersonId: suggestion.existingPersonId,
      status: input.action === 'accept' || input.action === 'associate' ? 'accepted' : 'rejected',
      createdAt: suggestion.createdAt,
      processedAt: new Date().toISOString(),
      processedByUserId: user.id,
    };
  } catch (error) {
    console.error('processEmailContactSuggestion mutation error:', error);
    throw error;
  }
};

export const bulkProcessEmailContactSuggestions = async (
  _: any,
  { inputs }: { 
    inputs: Array<{ 
      id: string;
      action: string;
      associationRole?: ContactRoleType;
      customRoleLabel?: string;
    }> 
  },
  context: any
) => {
  try {
    const { user } = context;
    if (!user) {
      throw new Error('Authentication required');
    }

    const results = [];
    
    for (const input of inputs) {
      try {
        const result = await processEmailContactSuggestion(_, { input }, context);
        results.push(result);
      } catch (error) {
        console.error(`Error processing suggestion ${input.id}:`, error);
        // Continue processing other suggestions
      }
    }
    
    return results;
  } catch (error) {
    console.error('bulkProcessEmailContactSuggestions mutation error:', error);
    throw error;
  }
}; 