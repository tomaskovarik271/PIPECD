import { GraphQLError } from 'graphql';
import { getAuthenticatedClient, handleSupabaseError } from './serviceUtils';
import type { 
  OrganizationRelationship, 
  PersonRelationship, 
  PersonOrganizationalRole, 
  StakeholderAnalysis,
  CreateOrganizationRelationshipInput,
  CreatePersonRelationshipInput,
  CreatePersonOrganizationalRoleInput,
  CreateStakeholderAnalysisInput,
  UpdateStakeholderAnalysisInput
} from './generated/graphql';

// --- Relationship Service ---
export const relationshipService = {
  
  // === ORGANIZATION RELATIONSHIPS ===
  
  async getOrganizationRelationships(userId: string, organizationId: string, accessToken: string): Promise<OrganizationRelationship[]> {
    console.log('[relationshipService.getOrganizationRelationships] called for user:', userId, 'orgId:', organizationId);
    const supabase = getAuthenticatedClient(accessToken);
    
    const { data, error } = await supabase
      .from('organization_relationships')
      .select('*')
      .or(`parent_org_id.eq.${organizationId},child_org_id.eq.${organizationId}`);
    
    handleSupabaseError(error, 'fetching organization relationships');
    return (data || []) as OrganizationRelationship[];
  },

  async createOrganizationRelationship(userId: string, input: CreateOrganizationRelationshipInput, accessToken: string): Promise<OrganizationRelationship> {
    console.log('[relationshipService.createOrganizationRelationship] called for user:', userId, 'input:', input);
    const supabase = getAuthenticatedClient(accessToken);
    
    const { data, error } = await supabase
      .from('organization_relationships')
      .insert({
        parent_org_id: input.parentOrgId,
        child_org_id: input.childOrgId,
        relationship_type: input.relationshipType,
        ownership_percentage: input.ownershipPercentage,
        relationship_strength: input.relationshipStrength,
        start_date: input.startDate,
        notes: input.notes,
        created_by_user_id: userId
      })
      .select()
      .single();
    
    handleSupabaseError(error, 'creating organization relationship');
    if (!data) {
      throw new GraphQLError('Failed to create organization relationship, no data returned', { 
        extensions: { code: 'INTERNAL_SERVER_ERROR' } 
      });
    }
    return data as OrganizationRelationship;
  },

  // === PERSON RELATIONSHIPS ===
  
  async getPersonRelationships(userId: string, personId: string, accessToken: string): Promise<PersonRelationship[]> {
    console.log('[relationshipService.getPersonRelationships] called for user:', userId, 'personId:', personId);
    const supabase = getAuthenticatedClient(accessToken);
    
    const { data, error } = await supabase
      .from('person_relationships')
      .select('*')
      .or(`from_person_id.eq.${personId},to_person_id.eq.${personId}`);
    
    handleSupabaseError(error, 'fetching person relationships');
    return (data || []) as PersonRelationship[];
  },

  async getOrganizationPersonRelationships(userId: string, organizationId: string, accessToken: string): Promise<PersonRelationship[]> {
    console.log('[relationshipService.getOrganizationPersonRelationships] called for user:', userId, 'orgId:', organizationId);
    const supabase = getAuthenticatedClient(accessToken);
    
    // First get all people in the organization
    const { data: roles, error: rolesError } = await supabase
      .from('person_organizational_roles')
      .select('person_id')
      .eq('organization_id', organizationId)
      .is('end_date', null);
    
    handleSupabaseError(rolesError, 'fetching organization roles for person relationships');
    
    const personIds = roles?.map(role => role.person_id) || [];
    if (personIds.length === 0) return [];
    
    // Get relationships between these people
    const { data, error } = await supabase
      .from('person_relationships')
      .select('*')
      .or(`from_person_id.in.(${personIds.join(',')}),to_person_id.in.(${personIds.join(',')})`);
    
    handleSupabaseError(error, 'fetching organization person relationships');
    return (data || []) as PersonRelationship[];
  },

  async createPersonRelationship(userId: string, input: CreatePersonRelationshipInput, accessToken: string): Promise<PersonRelationship> {
    console.log('[relationshipService.createPersonRelationship] called for user:', userId, 'input:', input);
    const supabase = getAuthenticatedClient(accessToken);
    
    const { data, error } = await supabase
      .from('person_relationships')
      .insert({
        from_person_id: input.fromPersonId,
        to_person_id: input.toPersonId,
        relationship_type: input.relationshipType,
        relationship_strength: input.relationshipStrength,
        is_bidirectional: input.isBidirectional || false,
        interaction_frequency: input.interactionFrequency,
        relationship_context: input.relationshipContext,
        notes: input.notes,
        created_by_user_id: userId
      })
      .select()
      .single();
    
    handleSupabaseError(error, 'creating person relationship');
    if (!data) {
      throw new GraphQLError('Failed to create person relationship, no data returned', { 
        extensions: { code: 'INTERNAL_SERVER_ERROR' } 
      });
    }
    return data as PersonRelationship;
  },

  // === ORGANIZATIONAL ROLES ===
  
  async getPersonOrganizationalRoles(userId: string, accessToken: string, personId?: string): Promise<PersonOrganizationalRole[]> {
    console.log('[relationshipService.getPersonOrganizationalRoles] called for user:', userId, 'personId:', personId);
    const supabase = getAuthenticatedClient(accessToken);
    
    let query = supabase.from('person_organizational_roles').select('*');
    if (personId) {
      query = query.eq('person_id', personId);
    }
    
    const { data, error } = await query;
    handleSupabaseError(error, 'fetching person organizational roles');
    return (data || []) as PersonOrganizationalRole[];
  },

  async getOrganizationRoles(userId: string, organizationId: string, includeInactive: boolean = false, accessToken: string): Promise<PersonOrganizationalRole[]> {
    console.log('[relationshipService.getOrganizationRoles] called for user:', userId, 'orgId:', organizationId, 'includeInactive:', includeInactive);
    const supabase = getAuthenticatedClient(accessToken);
    
    let query = supabase
      .from('person_organizational_roles')
      .select('*')
      .eq('organization_id', organizationId);
    
    if (!includeInactive) {
      query = query.is('end_date', null);
    }
    
    const { data, error } = await query;
    handleSupabaseError(error, 'fetching organization roles');
    return (data || []) as PersonOrganizationalRole[];
  },

  async createPersonOrganizationalRole(userId: string, input: CreatePersonOrganizationalRoleInput, accessToken: string): Promise<PersonOrganizationalRole> {
    console.log('[relationshipService.createPersonOrganizationalRole] called for user:', userId, 'input:', input);
    const supabase = getAuthenticatedClient(accessToken);
    
    const { data, error } = await supabase
      .from('person_organizational_roles')
      .insert({
        person_id: input.personId,
        organization_id: input.organizationId,
        role_title: input.roleTitle,
        department: input.department,
        seniority_level: input.seniorityLevel?.toLowerCase().replace(/_/g, '_'), // Convert enum to db format
        is_primary_role: input.isPrimaryRole || false,
        start_date: input.startDate,
        end_date: input.endDate,
        reporting_structure: input.reportingStructure,
        responsibilities: input.responsibilities,
        budget_authority_usd: input.budgetAuthorityUsd,
        team_size: input.teamSize,
        notes: input.notes,
        created_by_user_id: userId
      })
      .select()
      .single();
    
    handleSupabaseError(error, 'creating organizational role');
    if (!data) {
      throw new GraphQLError('Failed to create organizational role, no data returned', { 
        extensions: { code: 'INTERNAL_SERVER_ERROR' } 
      });
    }
    return data as PersonOrganizationalRole;
  },

  // === STAKEHOLDER ANALYSIS ===
  
  async getStakeholderAnalyses(userId: string, accessToken: string, organizationId?: string, dealId?: string, leadId?: string): Promise<StakeholderAnalysis[]> {
    console.log('[relationshipService.getStakeholderAnalyses] called for user:', userId, 'filters:', { organizationId, dealId, leadId });
    const supabase = getAuthenticatedClient(accessToken);
    
    let query = supabase.from('stakeholder_analysis').select('*');
    
    if (organizationId) query = query.eq('organization_id', organizationId);
    if (dealId) query = query.eq('deal_id', dealId);
    if (leadId) query = query.eq('lead_id', leadId);
    
    const { data, error } = await query;
    handleSupabaseError(error, 'fetching stakeholder analyses');
    return (data || []) as StakeholderAnalysis[];
  },

  async getStakeholderAnalysisById(userId: string, id: string, accessToken: string): Promise<StakeholderAnalysis | null> {
    console.log('[relationshipService.getStakeholderAnalysisById] called for user:', userId, 'id:', id);
    const supabase = getAuthenticatedClient(accessToken);
    
    const { data, error } = await supabase
      .from('stakeholder_analysis')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error && error.code !== 'PGRST116') {
      handleSupabaseError(error, 'fetching stakeholder analysis by ID');
    }
    return data as StakeholderAnalysis | null;
  },

  async createStakeholderAnalysis(userId: string, input: CreateStakeholderAnalysisInput, accessToken: string): Promise<StakeholderAnalysis> {
    console.log('[relationshipService.createStakeholderAnalysis] called for user:', userId, 'input:', input);
    const supabase = getAuthenticatedClient(accessToken);
    
    const { data, error } = await supabase
      .from('stakeholder_analysis')
      .insert({
        person_id: input.personId,
        organization_id: input.organizationId,
        deal_id: input.dealId,
        lead_id: input.leadId,
        influence_score: input.influenceScore,
        decision_authority: input.decisionAuthority?.toLowerCase(),
        budget_authority_level: input.budgetAuthorityLevel,
        engagement_level: input.engagementLevel?.toLowerCase(),
        communication_preference: input.communicationPreference,
        preferred_meeting_time: input.preferredMeetingTime,
        pain_points: input.painPoints,
        motivations: input.motivations,
        success_metrics: input.successMetrics,
        concerns: input.concerns,
        approach_strategy: input.approachStrategy,
        next_best_action: input.nextBestAction,
        last_interaction_date: input.lastInteractionDate,
        last_interaction_type: input.lastInteractionType,
        created_by_user_id: userId
      })
      .select()
      .single();
    
    handleSupabaseError(error, 'creating stakeholder analysis');
    if (!data) {
      throw new GraphQLError('Failed to create stakeholder analysis, no data returned', { 
        extensions: { code: 'INTERNAL_SERVER_ERROR' } 
      });
    }
    return data as StakeholderAnalysis;
  },

  async updateStakeholderAnalysis(userId: string, id: string, input: UpdateStakeholderAnalysisInput, accessToken: string): Promise<StakeholderAnalysis> {
    console.log('[relationshipService.updateStakeholderAnalysis] called for user:', userId, 'id:', id, 'input:', input);
    const supabase = getAuthenticatedClient(accessToken);
    
    const { data, error } = await supabase
      .from('stakeholder_analysis')
      .update({
        influence_score: input.influenceScore,
        decision_authority: input.decisionAuthority?.toLowerCase(),
        budget_authority_level: input.budgetAuthorityLevel,
        engagement_level: input.engagementLevel?.toLowerCase(),
        communication_preference: input.communicationPreference,
        preferred_meeting_time: input.preferredMeetingTime,
        pain_points: input.painPoints,
        motivations: input.motivations,
        success_metrics: input.successMetrics,
        concerns: input.concerns,
        approach_strategy: input.approachStrategy,
        next_best_action: input.nextBestAction,
        last_interaction_date: input.lastInteractionDate,
        last_interaction_type: input.lastInteractionType,
        ai_personality_profile: input.aiPersonalityProfile,
        ai_communication_style: input.aiCommunicationStyle,
        ai_decision_pattern: input.aiDecisionPattern,
        ai_influence_network: input.aiInfluenceNetwork
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error && error.code === 'PGRST116') {
      throw new GraphQLError('Stakeholder analysis not found', { extensions: { code: 'NOT_FOUND' } });
    }
    handleSupabaseError(error, 'updating stakeholder analysis');
    if (!data) {
      throw new GraphQLError('Stakeholder analysis update failed, no data returned', { 
        extensions: { code: 'INTERNAL_SERVER_ERROR' } 
      });
    }
    return data as StakeholderAnalysis;
  },

  // === ADVANCED ANALYSIS FUNCTIONS ===
  
  async analyzeStakeholderNetwork(
    userId: string, 
    organizationId: string, 
    accessToken: string,
    dealId?: string, 
    leadId?: string, 
    includeInactiveRoles: boolean = false
  ): Promise<any> {
    console.log('[relationshipService.analyzeStakeholderNetwork] called for user:', userId, 'orgId:', organizationId);
    const supabase = getAuthenticatedClient(accessToken);
    
    try {
      // Get organization
      const { data: organization, error: orgError } = await supabase
        .from('organizations')
        .select('*')
        .eq('id', organizationId)
        .single();
      
      handleSupabaseError(orgError, 'fetching organization for stakeholder analysis');
      
      // Get stakeholder analyses
      const stakeholders = await this.getStakeholderAnalyses(userId, accessToken, organizationId, dealId, leadId);
      
      // Get organizational roles
      const roles = await this.getOrganizationRoles(userId, organizationId, includeInactiveRoles, accessToken);
      
      // Get relationships
      const relationships = await this.getOrganizationPersonRelationships(userId, organizationId, accessToken);
      
      // Generate insights (simplified analysis)
      const networkInsights = this.generateNetworkInsights(stakeholders, roles, relationships);
      const coverageAnalysis = this.analyzeCoverage(roles, stakeholders);
      const influenceMap = this.buildInfluenceMap(stakeholders, relationships);
      
      return {
        organization,
        stakeholderCount: stakeholders.length,
        roleCount: roles.length,
        relationshipCount: relationships.length,
        stakeholders,
        roles,
        relationships,
        networkInsights,
        coverageAnalysis,
        influenceMap
      };
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      throw new GraphQLError(`Failed to analyze stakeholder network: ${errorMessage}`);
    }
  },

  async findMissingStakeholders(
    userId: string, 
    organizationId: string, 
    accessToken: string,
    dealId?: string, 
    leadId?: string, 
    industryType?: string, 
    dealSize?: number
  ): Promise<any> {
    console.log('[relationshipService.findMissingStakeholders] called for user:', userId, 'orgId:', organizationId);
    const supabase = getAuthenticatedClient(accessToken);
    
    try {
      // Get current roles
      const currentRoles = await this.getOrganizationRoles(userId, organizationId, false, accessToken);
      
      // Generate missing stakeholder recommendations
      const recommendations = this.generateMissingStakeholderRecommendations(
        currentRoles,
        industryType,
        dealSize
      );
      
      return recommendations;
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      throw new GraphQLError(`Failed to find missing stakeholders: ${errorMessage}`);
    }
  },

  // === HELPER METHODS ===
  
  generateNetworkInsights(stakeholders: StakeholderAnalysis[], roles: PersonOrganizationalRole[], relationships: PersonRelationship[]): any {
    // Simplified network analysis
    return {
      keyInfluencers: stakeholders.filter(s => (s as any).influence_score >= 8).length,
      decisionMakers: stakeholders.filter(s => ['final_approver', 'budget_owner'].includes((s as any).decision_authority)).length,
      relationshipDensity: relationships.length / Math.max(roles.length * (roles.length - 1) / 2, 1),
      coverageGaps: roles.length - stakeholders.length
    };
  },

  analyzeCoverage(roles: PersonOrganizationalRole[], stakeholders: StakeholderAnalysis[]): any {
    const rolesWithAnalysis = roles.filter(role => 
      stakeholders.some(stakeholder => (stakeholder as any).person_id === (role as any).person_id)
    );
    
    return {
      totalRoles: roles.length,
      analyzedRoles: rolesWithAnalysis.length,
      coveragePercentage: roles.length > 0 ? (rolesWithAnalysis.length / roles.length) * 100 : 0,
      missingAnalysis: roles.length - rolesWithAnalysis.length
    };
  },

  buildInfluenceMap(stakeholders: StakeholderAnalysis[], relationships: PersonRelationship[]): any {
    // Simplified influence mapping
    const influenceNetwork = stakeholders.map(stakeholder => ({
      personId: (stakeholder as any).person_id,
      influenceScore: (stakeholder as any).influence_score,
      connections: relationships.filter(rel => 
        (rel as any).from_person_id === (stakeholder as any).person_id || (rel as any).to_person_id === (stakeholder as any).person_id
      ).length
    }));
    
    return {
      nodes: influenceNetwork,
      totalInfluence: influenceNetwork.reduce((sum, node) => sum + (node.influenceScore || 0), 0),
      averageConnections: influenceNetwork.length > 0 
        ? influenceNetwork.reduce((sum, node) => sum + node.connections, 0) / influenceNetwork.length 
        : 0
    };
  },

  generateMissingStakeholderRecommendations(
    currentRoles: PersonOrganizationalRole[], 
    industryType?: string, 
    dealSize?: number
  ): any {
    // Simplified recommendations logic
    const currentRoleTitles = currentRoles.map(role => (role as any).role_title?.toLowerCase() || '');
    const essentialRoles = ['ceo', 'cto', 'cfo', 'vp', 'director', 'manager'];
    
    const missingRoles = essentialRoles.filter(role => 
      !currentRoleTitles.some(current => current.includes(role))
    );
    
    return {
      missingRoles: missingRoles.map(role => ({ title: role, priority: 'HIGH' })),
      currentCoverage: currentRoles.length,
      recommendedCoverage: currentRoles.length + missingRoles.length,
      coveragePercentage: (currentRoles.length / (currentRoles.length + missingRoles.length)) * 100,
      priorityAdditions: missingRoles.slice(0, 3),
      suggestedActions: [
        'Identify key decision makers in missing roles',
        'Establish relationships with influential stakeholders',
        'Map reporting structure and approval chains'
      ]
    };
  }
};