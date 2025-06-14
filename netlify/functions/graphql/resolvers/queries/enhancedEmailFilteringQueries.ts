import { 
  contactAssociationService, 
  userEmailFilterPreferencesService, 
  emailContactDiscoveryService,
  EmailThreadsFilterInput
} from '../../../../lib/contactAssociationService';
import { validateUserPermissions } from '../validators';
import { emailService } from '../../../../lib/emailService';

// =============================================
// Contact Association Queries
// =============================================

export const getDealContactAssociations = async (
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

    const associations = await contactAssociationService.getDealContactAssociations(dealId);
    
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
    console.error('getDealContactAssociations query error:', error);
    throw error;
  }
};

export const getDealContactAssociationsWithDetails = async (
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

    const associations = await contactAssociationService.getDealContactAssociationsWithDetails(dealId);
    
    return associations.map(association => ({
      id: association.id,
      dealId: association.dealId,
      personId: association.personId,
      personFirstName: association.personFirstName,
      personLastName: association.personLastName,
      personEmail: association.personEmail,
      role: association.role,
      customRoleLabel: association.customRoleLabel,
      includeInEmailFilter: association.includeInEmailFilter,
      createdAt: association.createdAt,
      updatedAt: association.updatedAt,
    }));
  } catch (error) {
    console.error('getDealContactAssociationsWithDetails query error:', error);
    throw error;
  }
};

// =============================================
// User Email Filter Preferences Queries
// =============================================

export const getUserEmailFilterPreferences = async (
  _: any,
  __: any,
  context: any
) => {
  try {
    const { user } = context;
    if (!user) {
      throw new Error('Authentication required');
    }

    const preferences = await userEmailFilterPreferencesService.getUserEmailFilterPreferences(user.id);
    
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
    console.error('getUserEmailFilterPreferences query error:', error);
    throw error;
  }
};

// =============================================
// Email Contact Discovery Queries
// =============================================

export const getEmailContactSuggestions = async (
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
    console.error('getEmailContactSuggestions query error:', error);
    throw error;
  }
};

export const getPendingEmailContactSuggestions = async (
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
    console.error('getPendingEmailContactSuggestions query error:', error);
    throw error;
  }
};

// =============================================
// Enhanced Email Threads Query
// =============================================

export const getEmailThreadsEnhanced = async (
  _: any,
  { filter }: { filter: EmailThreadsFilterInput },
  context: any
) => {
  try {
    const { user } = context;
    if (!user) {
      throw new Error('Authentication required');
    }

    // Validate user has permission to read the deal
    if (filter.dealId) {
      await validateUserPermissions(user.id, 'deal:read_own', filter.dealId);
    }

    // Get contact emails based on the filter scope
    const contactEmails = await contactAssociationService.getContactEmailsForFiltering(filter);
    
    // If no contact emails found and no backward compatibility email, return empty
    if (contactEmails.length === 0 && !filter.contactEmail) {
      return {
        threads: [],
        nextPageToken: null,
        totalCount: 0,
      };
    }

    // Use the existing email service with enhanced filtering
    const emailThreadsFilter = {
      contactEmail: contactEmails.length > 0 ? contactEmails[0] : filter.contactEmail, // For now, use first email
      keywords: filter.keywords,
      dateFrom: filter.dateFrom,
      dateTo: filter.dateTo,
      isUnread: filter.isUnread,
      hasAttachments: filter.hasAttachments,
      limit: filter.limit || 50,
      pageToken: filter.pageToken,
    };

    // Get email threads using existing service
    const threadsResponse = await emailService.getEmailThreads(
      user.id,
      user.google_access_token,
      emailThreadsFilter
    );

    // Filter threads based on contact scope if multiple emails
    let filteredThreads = threadsResponse.threads;
    
    if (contactEmails.length > 1) {
      // Filter threads to include only those involving any of the contact emails
      filteredThreads = threadsResponse.threads.filter(thread => 
        thread.messages?.some(message => 
          contactEmails.some(email => 
            message.from?.includes(email) || 
            message.to?.some(to => to.includes(email)) ||
            message.cc?.some(cc => cc.includes(email))
          )
        )
      );
    }

    return {
      threads: filteredThreads,
      nextPageToken: threadsResponse.nextPageToken,
      totalCount: filteredThreads.length,
    };
  } catch (error) {
    console.error('getEmailThreadsEnhanced query error:', error);
    throw error;
  }
}; 