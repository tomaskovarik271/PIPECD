import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// =============================================
// Types
// =============================================

export type ContactRoleType = 'primary' | 'decision_maker' | 'influencer' | 'technical' | 'legal' | 'other';
export type ContactScopeType = 'primary' | 'all' | 'custom' | 'selected_roles';
export type EmailContactDiscoveryStatus = 'pending' | 'accepted' | 'rejected' | 'auto_associated';

export interface DealContactAssociation {
  id: string;
  dealId: string;
  personId: string;
  role: ContactRoleType;
  customRoleLabel?: string;
  includeInEmailFilter: boolean;
  createdAt: string;
  updatedAt: string;
  createdByUserId: string;
}

export interface DealContactAssociationWithDetails {
  id: string;
  dealId: string;
  personId: string;
  personFirstName?: string;
  personLastName?: string;
  personEmail?: string;
  role: ContactRoleType;
  customRoleLabel?: string;
  includeInEmailFilter: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserEmailFilterPreferences {
  id: string;
  userId: string;
  defaultContactScope: ContactScopeType;
  includeNewParticipants: boolean;
  autoDiscoverContacts: boolean;
  savedFilterPresets: EmailFilterPreset[];
  createdAt: string;
  updatedAt: string;
}

export interface EmailFilterPreset {
  id: string;
  name: string;
  description?: string;
  contactScope: ContactScopeType;
  selectedContactIds: string[];
  selectedRoles: ContactRoleType[];
  includeNewParticipants: boolean;
  keywords: string[];
  dateFrom?: string;
  dateTo?: string;
  isUnread?: boolean;
  hasAttachments?: boolean;
  isDefault: boolean;
  createdAt: string;
}

export interface EmailContactSuggestion {
  id: string;
  dealId: string;
  emailAddress: string;
  discoveredName?: string;
  suggestedRole: ContactRoleType;
  confidenceScore?: number;
  firstSeenThreadId?: string;
  emailCount: number;
  isExistingContact: boolean;
  existingPersonId?: string;
  status: EmailContactDiscoveryStatus;
  createdAt: string;
  processedAt?: string;
  processedByUserId?: string;
}

export interface CreateDealContactAssociationInput {
  dealId: string;
  personId: string;
  role: ContactRoleType;
  customRoleLabel?: string;
  includeInEmailFilter?: boolean;
}

export interface UpdateDealContactAssociationInput {
  id: string;
  role?: ContactRoleType;
  customRoleLabel?: string;
  includeInEmailFilter?: boolean;
}

export interface EmailThreadsFilterInput {
  dealId?: string;
  contactScope: ContactScopeType;
  selectedContactIds?: string[];
  selectedRoles?: ContactRoleType[];
  includeNewParticipants?: boolean;
  contactEmail?: string; // Backward compatibility
  keywords?: string[];
  dateFrom?: string;
  dateTo?: string;
  isUnread?: boolean;
  hasAttachments?: boolean;
  emailDirection?: 'inbound' | 'outbound' | 'all';
  hasReplies?: boolean;
  limit?: number;
  pageToken?: string;
}

// =============================================
// Contact Association Service
// =============================================

export class ContactAssociationService {
  
  // Get deal contact associations
  async getDealContactAssociations(dealId: string): Promise<DealContactAssociation[]> {
    try {
      const { data, error } = await supabase
        .from('deal_contact_associations')
        .select('*')
        .eq('deal_id', dealId)
        .eq('include_in_email_filter', true)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching deal contact associations:', error);
        throw new Error(`Failed to fetch deal contact associations: ${error.message}`);
      }

      return data?.map(row => ({
        id: row.id,
        dealId: row.deal_id,
        personId: row.person_id,
        role: row.role as ContactRoleType,
        customRoleLabel: row.custom_role_label,
        includeInEmailFilter: row.include_in_email_filter,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        createdByUserId: row.created_by_user_id,
      })) || [];
    } catch (error) {
      console.error('ContactAssociationService.getDealContactAssociations error:', error);
      throw error;
    }
  }

  // Get deal contact associations with person details
  async getDealContactAssociationsWithDetails(dealId: string): Promise<DealContactAssociationWithDetails[]> {
    try {
      const { data, error } = await supabase
        .rpc('get_deal_contact_associations_with_details', { p_deal_id: dealId });

      if (error) {
        console.error('Error fetching deal contact associations with details:', error);
        throw new Error(`Failed to fetch deal contact associations with details: ${error.message}`);
      }

      return data?.map((row: any) => ({
        id: row.id,
        dealId: row.deal_id,
        personId: row.person_id,
        personFirstName: row.person_first_name,
        personLastName: row.person_last_name,
        personEmail: row.person_email,
        role: row.role as ContactRoleType,
        customRoleLabel: row.custom_role_label,
        includeInEmailFilter: row.include_in_email_filter,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      })) || [];
    } catch (error) {
      console.error('ContactAssociationService.getDealContactAssociationsWithDetails error:', error);
      throw error;
    }
  }

  // Create deal contact association
  async createDealContactAssociation(
    input: CreateDealContactAssociationInput,
    userId: string
  ): Promise<DealContactAssociation> {
    try {
      const { data, error } = await supabase
        .from('deal_contact_associations')
        .insert({
          deal_id: input.dealId,
          person_id: input.personId,
          role: input.role,
          custom_role_label: input.customRoleLabel,
          include_in_email_filter: input.includeInEmailFilter ?? true,
          created_by_user_id: userId,
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating deal contact association:', error);
        throw new Error(`Failed to create deal contact association: ${error.message}`);
      }

      return {
        id: data.id,
        dealId: data.deal_id,
        personId: data.person_id,
        role: data.role as ContactRoleType,
        customRoleLabel: data.custom_role_label,
        includeInEmailFilter: data.include_in_email_filter,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        createdByUserId: data.created_by_user_id,
      };
    } catch (error) {
      console.error('ContactAssociationService.createDealContactAssociation error:', error);
      throw error;
    }
  }

  // Update deal contact association
  async updateDealContactAssociation(input: UpdateDealContactAssociationInput): Promise<DealContactAssociation> {
    try {
      const updateData: any = {};
      if (input.role !== undefined) updateData.role = input.role;
      if (input.customRoleLabel !== undefined) updateData.custom_role_label = input.customRoleLabel;
      if (input.includeInEmailFilter !== undefined) updateData.include_in_email_filter = input.includeInEmailFilter;

      const { data, error } = await supabase
        .from('deal_contact_associations')
        .update(updateData)
        .eq('id', input.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating deal contact association:', error);
        throw new Error(`Failed to update deal contact association: ${error.message}`);
      }

      return {
        id: data.id,
        dealId: data.deal_id,
        personId: data.person_id,
        role: data.role as ContactRoleType,
        customRoleLabel: data.custom_role_label,
        includeInEmailFilter: data.include_in_email_filter,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        createdByUserId: data.created_by_user_id,
      };
    } catch (error) {
      console.error('ContactAssociationService.updateDealContactAssociation error:', error);
      throw error;
    }
  }

  // Delete deal contact association
  async deleteDealContactAssociation(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('deal_contact_associations')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting deal contact association:', error);
        throw new Error(`Failed to delete deal contact association: ${error.message}`);
      }

      return true;
    } catch (error) {
      console.error('ContactAssociationService.deleteDealContactAssociation error:', error);
      throw error;
    }
  }

  // Bulk update deal contact associations
  async bulkUpdateDealContactAssociations(
    dealId: string,
    associations: UpdateDealContactAssociationInput[]
  ): Promise<DealContactAssociation[]> {
    try {
      const results: DealContactAssociation[] = [];
      
      for (const association of associations) {
        const updated = await this.updateDealContactAssociation(association);
        results.push(updated);
      }

      return results;
    } catch (error) {
      console.error('ContactAssociationService.bulkUpdateDealContactAssociations error:', error);
      throw error;
    }
  }

  // Get contact emails for filtering based on scope and roles
  async getContactEmailsForFiltering(filter: EmailThreadsFilterInput): Promise<string[]> {
    try {
      if (!filter.dealId) {
        return [];
      }

      // Handle backward compatibility
      if (filter.contactEmail) {
        return [filter.contactEmail];
      }

      switch (filter.contactScope) {
        case 'primary':
          return await this.getPrimaryContactEmails(filter.dealId);
        
        case 'all':
          return await this.getAllDealContactEmails(filter.dealId);
        
        case 'custom':
          return await this.getCustomSelectedContactEmails(filter.selectedContactIds || []);
        
        case 'selected_roles':
          return await this.getContactEmailsByRoles(filter.dealId, filter.selectedRoles || []);
        
        default:
          return await this.getPrimaryContactEmails(filter.dealId);
      }
    } catch (error) {
      console.error('ContactAssociationService.getContactEmailsForFiltering error:', error);
      throw error;
    }
  }

  // Get primary contact emails
  private async getPrimaryContactEmails(dealId: string): Promise<string[]> {
    const { data, error } = await supabase
      .from('deal_contact_associations')
      .select(`
        persons!inner(email)
      `)
      .eq('deal_id', dealId)
      .eq('role', 'primary')
      .eq('include_in_email_filter', true);

    if (error) {
      console.error('Error fetching primary contact emails:', error);
      return [];
    }

    return data?.map((row: any) => row.persons.email).filter(Boolean) || [];
  }

  // Get all deal contact emails
  private async getAllDealContactEmails(dealId: string): Promise<string[]> {
    const { data, error } = await supabase
      .from('deal_contact_associations')
      .select(`
        persons!inner(email)
      `)
      .eq('deal_id', dealId)
      .eq('include_in_email_filter', true);

    if (error) {
      console.error('Error fetching all deal contact emails:', error);
      return [];
    }

    return data?.map((row: any) => row.persons.email).filter(Boolean) || [];
  }

  // Get custom selected contact emails
  private async getCustomSelectedContactEmails(personIds: string[]): Promise<string[]> {
    if (personIds.length === 0) return [];

    const { data, error } = await supabase
      .from('persons')
      .select('email')
      .in('id', personIds);

    if (error) {
      console.error('Error fetching custom selected contact emails:', error);
      return [];
    }

    return data?.map(row => row.email).filter(Boolean) || [];
  }

  // Get contact emails by roles
  private async getContactEmailsByRoles(dealId: string, roles: ContactRoleType[]): Promise<string[]> {
    if (roles.length === 0) return [];

    const { data, error } = await supabase
      .from('deal_contact_associations')
      .select(`
        persons!inner(email)
      `)
      .eq('deal_id', dealId)
      .in('role', roles)
      .eq('include_in_email_filter', true);

    if (error) {
      console.error('Error fetching contact emails by roles:', error);
      return [];
    }

    return data?.map((row: any) => row.persons.email).filter(Boolean) || [];
  }
}

// =============================================
// User Email Filter Preferences Service
// =============================================

export class UserEmailFilterPreferencesService {
  
  // Get or create user email filter preferences
  async getUserEmailFilterPreferences(userId: string): Promise<UserEmailFilterPreferences> {
    try {
      const { data, error } = await supabase
        .rpc('get_or_create_user_email_filter_preferences', { p_user_id: userId });

      if (error) {
        console.error('Error getting user email filter preferences:', error);
        throw new Error(`Failed to get user email filter preferences: ${error.message}`);
      }

      return {
        id: data.id,
        userId: data.user_id,
        defaultContactScope: data.default_contact_scope as ContactScopeType,
        includeNewParticipants: data.include_new_participants,
        autoDiscoverContacts: data.auto_discover_contacts,
        savedFilterPresets: data.saved_filter_presets || [],
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      };
    } catch (error) {
      console.error('UserEmailFilterPreferencesService.getUserEmailFilterPreferences error:', error);
      throw error;
    }
  }

  // Update user email filter preferences
  async updateUserEmailFilterPreferences(
    userId: string,
    updates: Partial<Pick<UserEmailFilterPreferences, 'defaultContactScope' | 'includeNewParticipants' | 'autoDiscoverContacts'>>
  ): Promise<UserEmailFilterPreferences> {
    try {
      const updateData: any = {};
      if (updates.defaultContactScope !== undefined) updateData.default_contact_scope = updates.defaultContactScope;
      if (updates.includeNewParticipants !== undefined) updateData.include_new_participants = updates.includeNewParticipants;
      if (updates.autoDiscoverContacts !== undefined) updateData.auto_discover_contacts = updates.autoDiscoverContacts;

      const { data, error } = await supabase
        .from('user_email_filter_preferences')
        .upsert({
          user_id: userId,
          ...updateData,
        })
        .select()
        .single();

      if (error) {
        console.error('Error updating user email filter preferences:', error);
        throw new Error(`Failed to update user email filter preferences: ${error.message}`);
      }

      return {
        id: data.id,
        userId: data.user_id,
        defaultContactScope: data.default_contact_scope as ContactScopeType,
        includeNewParticipants: data.include_new_participants,
        autoDiscoverContacts: data.auto_discover_contacts,
        savedFilterPresets: data.saved_filter_presets || [],
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      };
    } catch (error) {
      console.error('UserEmailFilterPreferencesService.updateUserEmailFilterPreferences error:', error);
      throw error;
    }
  }
}

// =============================================
// Email Contact Discovery Service
// =============================================

export class EmailContactDiscoveryService {
  
  // Analyze email content to suggest contact role
  detectContactRole(emailContent: string, senderEmail: string): { role: ContactRoleType; confidence: number } {
    const content = emailContent.toLowerCase();
    
    // Decision maker patterns
    const decisionMakerPatterns = [
      /\b(approve|decision|budget|authorize|sign off|final approval)\b/gi,
      /\b(ceo|cto|cfo|director|vp|vice president|manager|head of|chief)\b/gi,
      /\b(purchase|procurement|buying decision|approval authority)\b/gi,
    ];
    
    // Technical patterns
    const technicalPatterns = [
      /\b(technical|integration|api|development|engineer|developer)\b/gi,
      /\b(specs|requirements|architecture|implementation|coding)\b/gi,
      /\b(system|platform|infrastructure|database|server)\b/gi,
    ];
    
    // Legal patterns
    const legalPatterns = [
      /\b(legal|contract|terms|compliance|attorney|lawyer|counsel)\b/gi,
      /\b(review|approval|legal team|legal department|general counsel)\b/gi,
      /\b(liability|indemnity|privacy|gdpr|terms of service)\b/gi,
    ];
    
    // Influencer patterns
    const influencerPatterns = [
      /\b(recommend|suggest|influence|advise|consultant)\b/gi,
      /\b(stakeholder|key user|champion|advocate)\b/gi,
      /\b(feedback|input|opinion|evaluation)\b/gi,
    ];

    let maxScore = 0;
    let suggestedRole: ContactRoleType = 'other';

    // Calculate scores for each role
    const decisionScore = this.calculatePatternScore(content, decisionMakerPatterns);
    const technicalScore = this.calculatePatternScore(content, technicalPatterns);
    const legalScore = this.calculatePatternScore(content, legalPatterns);
    const influencerScore = this.calculatePatternScore(content, influencerPatterns);

    if (decisionScore > maxScore) {
      maxScore = decisionScore;
      suggestedRole = 'decision_maker';
    }
    if (technicalScore > maxScore) {
      maxScore = technicalScore;
      suggestedRole = 'technical';
    }
    if (legalScore > maxScore) {
      maxScore = legalScore;
      suggestedRole = 'legal';
    }
    if (influencerScore > maxScore) {
      maxScore = influencerScore;
      suggestedRole = 'influencer';
    }

    // Normalize confidence score (0-1)
    const confidence = Math.min(maxScore / 3, 1); // Divide by 3 as max realistic matches

    return { role: suggestedRole, confidence };
  }

  private calculatePatternScore(content: string, patterns: RegExp[]): number {
    let score = 0;
    for (const pattern of patterns) {
      const matches = content.match(pattern);
      if (matches) {
        score += matches.length;
      }
    }
    return score;
  }

  // Create email contact suggestion
  async createEmailContactSuggestion(
    dealId: string,
    emailAddress: string,
    discoveredName?: string,
    suggestedRole: ContactRoleType = 'other',
    confidenceScore?: number,
    firstSeenThreadId?: string
  ): Promise<EmailContactSuggestion> {
    try {
      // Check if this is an existing contact
      const { data: existingPerson } = await supabase
        .from('persons')
        .select('id, first_name, last_name')
        .eq('email', emailAddress)
        .single();

      const { data, error } = await supabase
        .from('email_contact_discovery_log')
        .insert({
          deal_id: dealId,
          email_address: emailAddress,
          discovered_name: discoveredName,
          suggested_role: suggestedRole,
          confidence_score: confidenceScore,
          first_seen_thread_id: firstSeenThreadId,
          is_existing_contact: !!existingPerson,
          existing_person_id: existingPerson?.id,
          status: 'pending',
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating email contact suggestion:', error);
        throw new Error(`Failed to create email contact suggestion: ${error.message}`);
      }

      return {
        id: data.id,
        dealId: data.deal_id,
        emailAddress: data.email_address,
        discoveredName: data.discovered_name,
        suggestedRole: data.suggested_role as ContactRoleType,
        confidenceScore: data.confidence_score,
        firstSeenThreadId: data.first_seen_thread_id,
        emailCount: data.email_count,
        isExistingContact: data.is_existing_contact,
        existingPersonId: data.existing_person_id,
        status: data.status as EmailContactDiscoveryStatus,
        createdAt: data.created_at,
        processedAt: data.processed_at,
        processedByUserId: data.processed_by_user_id,
      };
    } catch (error) {
      console.error('EmailContactDiscoveryService.createEmailContactSuggestion error:', error);
      throw error;
    }
  }

  // Get pending email contact suggestions for a deal
  async getPendingEmailContactSuggestions(dealId: string): Promise<EmailContactSuggestion[]> {
    try {
      const { data, error } = await supabase
        .from('email_contact_discovery_log')
        .select('*')
        .eq('deal_id', dealId)
        .eq('status', 'pending')
        .order('confidence_score', { ascending: false })
        .order('email_count', { ascending: false });

      if (error) {
        console.error('Error fetching pending email contact suggestions:', error);
        throw new Error(`Failed to fetch pending email contact suggestions: ${error.message}`);
      }

      return data?.map(row => ({
        id: row.id,
        dealId: row.deal_id,
        emailAddress: row.email_address,
        discoveredName: row.discovered_name,
        suggestedRole: row.suggested_role as ContactRoleType,
        confidenceScore: row.confidence_score,
        firstSeenThreadId: row.first_seen_thread_id,
        emailCount: row.email_count,
        isExistingContact: row.is_existing_contact,
        existingPersonId: row.existing_person_id,
        status: row.status as EmailContactDiscoveryStatus,
        createdAt: row.created_at,
        processedAt: row.processed_at,
        processedByUserId: row.processed_by_user_id,
      })) || [];
    } catch (error) {
      console.error('EmailContactDiscoveryService.getPendingEmailContactSuggestions error:', error);
      throw error;
    }
  }
}

// Export service instances
export const contactAssociationService = new ContactAssociationService();
export const userEmailFilterPreferencesService = new UserEmailFilterPreferencesService();
export const emailContactDiscoveryService = new EmailContactDiscoveryService(); 