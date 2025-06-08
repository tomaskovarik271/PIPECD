// Relationship Intelligence GraphQL Resolvers
import { GraphQLError } from 'graphql';
import { GraphQLContext, requireAuthentication, getAccessToken } from '../helpers';
import { relationshipService } from '../../../../lib/relationshipService';
import type {
  QueryResolvers,
  MutationResolvers,
  OrganizationRelationshipResolvers,
  PersonRelationshipResolvers,
  PersonOrganizationalRoleResolvers,
  StakeholderAnalysisResolvers,



  CreatePersonOrganizationalRoleInput,
  CreateStakeholderAnalysisInput,
  UpdateStakeholderAnalysisInput,
  CreateTerritoryInput,
  UpdateRelationshipInsightInput
} from '../../../../lib/generated/graphql';

// Type resolvers for relationship entities
export const OrganizationRelationship: OrganizationRelationshipResolvers<GraphQLContext> = {
  parentOrg: async (parent, _args, context) => {
    const { userId } = requireAuthentication(context);
    const accessToken = getAccessToken(context);
    const { data, error } = await context.supabaseClient
      .from('organizations')
      .select('*')
      .eq('id', (parent as any).parent_org_id)
      .single();
    if (error) throw new GraphQLError(`Failed to fetch parent organization: ${error.message}`);
    return data;
  },
  
  childOrg: async (parent, _args, context) => {
    const { userId } = requireAuthentication(context);
    const accessToken = getAccessToken(context);
    const { data, error } = await context.supabaseClient
      .from('organizations')
      .select('*')
      .eq('id', (parent as any).child_org_id)
      .single();
    if (error) throw new GraphQLError(`Failed to fetch child organization: ${error.message}`);
    return data;
  },
  
  createdByUser: async (parent, _args, context) => {
    const userId = (parent as any).created_by_user_id;
    if (!userId) return null;
    const { userId: currentUserId } = requireAuthentication(context);
    const { data, error } = await context.supabaseClient
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();
    if (error) return null;
    return {
      id: data.user_id,
      email: data.email,
      display_name: data.display_name,
      avatar_url: data.avatar_url
    };
  }
};

export const PersonRelationship: PersonRelationshipResolvers<GraphQLContext> = {
  fromPerson: async (parent, _args, context) => {
    requireAuthentication(context);
    const { data, error } = await context.supabaseClient
      .from('people')
      .select('*')
      .eq('id', (parent as any).from_person_id)
      .single();
    if (error) throw new GraphQLError(`Failed to fetch from person: ${error.message}`);
    return data;
  },
  
  toPerson: async (parent, _args, context) => {
    requireAuthentication(context);
    const { data, error } = await context.supabaseClient
      .from('people')
      .select('*')
      .eq('id', (parent as any).to_person_id)
      .single();
    if (error) throw new GraphQLError(`Failed to fetch to person: ${error.message}`);
    return data;
  },
  
  createdByUser: async (parent, _args, context) => {
    const userId = (parent as any).created_by_user_id;
    if (!userId) return null;
    requireAuthentication(context);
    const { data, error } = await context.supabaseClient
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();
    if (error) return null;
    return {
      id: data.user_id,
      email: data.email,
      display_name: data.display_name,
      avatar_url: data.avatar_url
    };
  }
};

export const PersonOrganizationalRole: PersonOrganizationalRoleResolvers<GraphQLContext> = {
  person: async (parent, _args, context) => {
    requireAuthentication(context);
    const { data, error } = await context.supabaseClient
      .from('people')
      .select('*')
      .eq('id', (parent as any).person_id)
      .single();
    if (error) throw new GraphQLError(`Failed to fetch person: ${error.message}`);
    return data;
  },
  
  organization: async (parent, _args, context) => {
    requireAuthentication(context);
    const { data, error } = await context.supabaseClient
      .from('organizations')
      .select('*')
      .eq('id', (parent as any).organization_id)
      .single();
    if (error) throw new GraphQLError(`Failed to fetch organization: ${error.message}`);
    return data;
  },
  
  createdByUser: async (parent, _args, context) => {
    const userId = (parent as any).created_by_user_id;
    if (!userId) return null;
    requireAuthentication(context);
    const { data, error } = await context.supabaseClient
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();
    if (error) return null;
    return {
      id: data.user_id,
      email: data.email,
      display_name: data.display_name,
      avatar_url: data.avatar_url
    };
  },
  
  // Field resolvers to transform snake_case to camelCase
  roleTitle: (parent) => (parent as any).role_title,
  seniorityLevel: (parent) => {
    const seniorityLevel = (parent as any).seniority_level;
    return seniorityLevel ? transformSeniorityLevel(seniorityLevel) as any : null;
  },
  budgetAuthorityUsd: (parent) => (parent as any).budget_authority_usd,
  teamSize: (parent) => (parent as any).team_size,
  isPrimaryRole: (parent) => (parent as any).is_primary_role,
  startDate: (parent) => (parent as any).start_date,
  endDate: (parent) => (parent as any).end_date,
  reportingStructure: (parent) => (parent as any).reporting_structure,
  createdAt: (parent) => (parent as any).created_at,
  updatedAt: (parent) => (parent as any).updated_at
};

export const StakeholderAnalysis: StakeholderAnalysisResolvers<GraphQLContext> = {
  person: async (parent, _args, context) => {
    requireAuthentication(context);
    const { data, error } = await context.supabaseClient
      .from('people')
      .select('*')
      .eq('id', (parent as any).person_id)
      .single();
    if (error) throw new GraphQLError(`Failed to fetch person: ${error.message}`);
    return data;
  },
  
  organization: async (parent, _args, context) => {
    requireAuthentication(context);
    const { data, error } = await context.supabaseClient
      .from('organizations')
      .select('*')
      .eq('id', (parent as any).organization_id)
      .single();
    if (error) throw new GraphQLError(`Failed to fetch organization: ${error.message}`);
    return data;
  },
  
  deal: async (parent, _args, context) => {
    const dealId = (parent as any).deal_id;
    if (!dealId) return null;
    requireAuthentication(context);
    const { data, error } = await context.supabaseClient
      .from('deals')
      .select('*')
      .eq('id', dealId)
      .single();
    if (error) return null;
    return data;
  },
  
  lead: async (parent, _args, context) => {
    const leadId = (parent as any).lead_id;
    if (!leadId) return null;
    requireAuthentication(context);
    const { data, error } = await context.supabaseClient
      .from('leads')
      .select('*')
      .eq('id', leadId)
      .single();
    if (error) return null;
    return data;
  },
  
  createdByUser: async (parent, _args, context) => {
    const userId = (parent as any).created_by_user_id;
    if (!userId) return null;
    requireAuthentication(context);
    const { data, error } = await context.supabaseClient
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();
    if (error) return null;
    return {
      id: data.user_id,
      email: data.email,
      display_name: data.display_name,
      avatar_url: data.avatar_url
    };
  }
};

// Query resolvers
export const relationshipQueries: Pick<QueryResolvers<GraphQLContext>, 
  'organizationRelationships' | 'personRelationships' | 'organizationPersonRelationships' |
  'personOrganizationalRoles' | 'organizationRoles' | 'stakeholderAnalyses' | 
  'stakeholderAnalysis' | 'analyzeStakeholderNetwork' | 'findMissingStakeholders'
> = {
  
  organizationRelationships: async (_parent, { organizationId }, context) => {
    const { userId } = requireAuthentication(context);
    const accessToken = getAccessToken(context);
    if (!accessToken) throw new GraphQLError('Authentication token required');
    return await relationshipService.getOrganizationRelationships(userId, organizationId, accessToken);
  },
  
  personRelationships: async (_parent, { personId }, context) => {
    const { userId } = requireAuthentication(context);
    const accessToken = getAccessToken(context);
    if (!accessToken) throw new GraphQLError('Authentication token required');
    return await relationshipService.getPersonRelationships(userId, personId, accessToken);
  },
  
  organizationPersonRelationships: async (_parent, { organizationId }, context) => {
    const { userId } = requireAuthentication(context);
    const accessToken = getAccessToken(context);
    if (!accessToken) throw new GraphQLError('Authentication token required');
    return await relationshipService.getOrganizationPersonRelationships(userId, organizationId, accessToken);
  },
  
  personOrganizationalRoles: async (_parent, { personId }, context) => {
    const { userId } = requireAuthentication(context);
    const accessToken = getAccessToken(context);
    if (!accessToken) throw new GraphQLError('Authentication token required');
    return await relationshipService.getPersonOrganizationalRoles(userId, accessToken, personId || undefined);
  },
  
  organizationRoles: async (_parent, { organizationId, includeInactive }, context) => {
    const { userId } = requireAuthentication(context);
    let query = context.supabaseClient
      .from('person_organizational_roles')
      .select('*')
      .eq('organization_id', organizationId);
    
    if (!includeInactive) {
      query = query.is('end_date', null);
    }
    
    const { data, error } = await query;
    if (error) throw new GraphQLError(`Failed to fetch organization roles: ${error.message}`);
    
    // Transform field names from snake_case to camelCase
    return (data || []).map(role => ({
      ...role,
      roleTitle: role.role_title,
      seniorityLevel: role.seniority_level ? transformSeniorityLevel(role.seniority_level) : null,
      budgetAuthorityUsd: role.budget_authority_usd,
      teamSize: role.team_size,
      isPrimaryRole: role.is_primary_role,
      startDate: role.start_date,
      endDate: role.end_date,
      reportingStructure: role.reporting_structure,
      createdAt: role.created_at,
      updatedAt: role.updated_at
    }));
  },
  
  stakeholderAnalyses: async (_parent, { organizationId, dealId, leadId }, context) => {
    const { userId } = requireAuthentication(context);
    const accessToken = getAccessToken(context);
    if (!accessToken) throw new GraphQLError('Authentication token required');
    
    return await relationshipService.getStakeholderAnalyses(
      userId, 
      accessToken,
      organizationId || undefined, 
      dealId || undefined, 
      leadId || undefined
    ) as any;
  },
  
  stakeholderAnalysis: async (_parent, { id }, context) => {
    const { userId } = requireAuthentication(context);
    const { data, error } = await context.supabaseClient
      .from('stakeholder_analysis')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new GraphQLError(`Failed to fetch stakeholder analysis: ${error.message}`);
    }
    return data;
  },
  
  analyzeStakeholderNetwork: async (_parent, { organizationId, dealId, leadId, includeInactiveRoles }, context) => {
    const { userId } = requireAuthentication(context);
    
    try {
      // Get organization using authenticated client
      const { data: organization, error: orgError } = await context.supabaseClient
        .from('organizations')
        .select('*')
        .eq('id', organizationId)
        .single();
      
      if (orgError) throw new GraphQLError(`Organization not found: ${orgError.message}`);
      
      // Get stakeholder analyses
      let stakeholderQuery = context.supabaseClient
        .from('stakeholder_analysis')
        .select('*')
        .eq('organization_id', organizationId);
      
      if (dealId) stakeholderQuery = stakeholderQuery.eq('deal_id', dealId);
      if (leadId) stakeholderQuery = stakeholderQuery.eq('lead_id', leadId);
      
      const { data: stakeholders, error: stakeholderError } = await stakeholderQuery;
      if (stakeholderError) throw new GraphQLError(`Failed to fetch stakeholders: ${stakeholderError.message}`);
      
      // Get organizational roles
      let rolesQuery = context.supabaseClient
        .from('person_organizational_roles')
        .select('*')
        .eq('organization_id', organizationId);
      
      if (!includeInactiveRoles) {
        rolesQuery = rolesQuery.is('end_date', null);
      }
      
      const { data: roles, error: rolesError } = await rolesQuery;
      if (rolesError) throw new GraphQLError(`Failed to fetch roles: ${rolesError.message}`);
      
      // Get relationships - only include relationships between people in this organization
      const personIds = roles?.map(role => role.person_id) || [];
      let relationships = [];
      
      if (personIds.length > 0) {
        const { data: relationshipData, error: relationshipError } = await context.supabaseClient
          .from('person_relationships')
          .select('*')
          .in('from_person_id', personIds)
          .in('to_person_id', personIds); // Both from AND to must be in current org
        
        if (relationshipError) throw new GraphQLError(`Failed to fetch relationships: ${relationshipError.message}`);
        relationships = relationshipData || [];
      }
      
      // Generate insights (simplified AI analysis)
      const networkInsights = generateNetworkInsights(stakeholders || [], roles || [], relationships);
      const coverageAnalysis = analyzeCoverage(roles || [], stakeholders || []);
      const influenceMap = buildInfluenceMap(stakeholders || [], relationships);
      
      return {
        organization,
        stakeholderCount: stakeholders?.length || 0,
        roleCount: roles?.length || 0,
        relationshipCount: relationships.length,
        stakeholders: (stakeholders || []).map(stakeholder => ({
          ...stakeholder,
          influenceScore: stakeholder.influence_score,
          decisionAuthority: stakeholder.decision_authority ? transformDecisionAuthority(stakeholder.decision_authority) : null,
          engagementLevel: stakeholder.engagement_level ? transformEngagementLevel(stakeholder.engagement_level) : null,
          approachStrategy: stakeholder.approach_strategy,
          nextBestAction: stakeholder.next_best_action,
          aiPersonalityProfile: stakeholder.ai_personality_profile,
          aiCommunicationStyle: stakeholder.ai_communication_style
        })),
        roles: (roles || []).map(role => ({
          ...role,
          roleTitle: role.role_title,
          seniorityLevel: role.seniority_level ? transformSeniorityLevel(role.seniority_level) : null,
          budgetAuthorityUsd: role.budget_authority_usd,
          teamSize: role.team_size,
          isPrimaryRole: role.is_primary_role,
          startDate: role.start_date,
          endDate: role.end_date,
          reportingStructure: role.reporting_structure,
          createdAt: role.created_at,
          updatedAt: role.updated_at
        })),
        relationships: relationships.map(rel => ({
          ...rel,
          relationshipType: rel.relationship_type ? transformRelationshipType(rel.relationship_type) : null,
          relationshipStrength: rel.relationship_strength,
          isBidirectional: rel.is_bidirectional,
          interactionFrequency: rel.interaction_frequency ? transformInteractionFrequency(rel.interaction_frequency) : null,
          relationshipContext: rel.relationship_context
        })),
        networkInsights,
        coverageAnalysis,
        influenceMap
      };
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      throw new GraphQLError(`Failed to analyze stakeholder network: ${errorMessage}`);
    }
  },
  
  findMissingStakeholders: async (_parent, { organizationId, dealId, leadId, industryType, dealSize }, context) => {
    const { userId } = requireAuthentication(context);
    
    try {
      // Get current roles using authenticated client
      const { data: currentRoles, error: rolesError } = await context.supabaseClient
        .from('person_organizational_roles')
        .select('role_title, seniority_level, department')
        .eq('organization_id', organizationId)
        .is('end_date', null);
      
      if (rolesError) throw new GraphQLError(`Failed to fetch current roles: ${rolesError.message}`);
      
      // Generate missing stakeholder recommendations
      const recommendations = generateMissingStakeholderRecommendations(
        currentRoles || [],
        industryType || undefined,
        dealSize || undefined
      );
      
      return {
        missingRoles: recommendations.missingRoles,
        currentCoverage: recommendations.currentCoverage,
        recommendedCoverage: recommendations.recommendedCoverage,
        coveragePercentage: recommendations.coveragePercentage,
        priorityAdditions: recommendations.priorityAdditions,
        suggestedActions: recommendations.suggestedActions
      };
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      throw new GraphQLError(`Failed to find missing stakeholders: ${errorMessage}`);
    }
  }
};

// Helper function to convert GraphQL SeniorityLevel enum to database format
function convertSeniorityLevelToDb(seniorityLevel?: string | null): string | undefined {
  if (!seniorityLevel) return undefined;
  
  // Convert from GraphQL enum format (e.g., "C_LEVEL") to database format (e.g., "c_level")
  const conversionMap: Record<string, string> = {
    'C_LEVEL': 'c_level',
    'VP': 'vp',
    'DIRECTOR': 'director',
    'MANAGER': 'manager',
    'LEAD': 'lead',
    'SENIOR': 'senior',
    'MID': 'mid',
    'ENTRY': 'entry',
    'FOUNDER': 'founder'
  };
  
  return conversionMap[seniorityLevel] || seniorityLevel.toLowerCase();
}

// Mutation resolvers
export const relationshipMutations: Pick<MutationResolvers<GraphQLContext>,
  'createOrganizationRelationship' | 'createPersonRelationship' | 'createPersonOrganizationalRole' |
  'createStakeholderAnalysis' | 'updateStakeholderAnalysis'
> = {
  
  createOrganizationRelationship: async (_parent, { input }, context) => {
    const { userId } = requireAuthentication(context);
    const accessToken = getAccessToken(context);
    if (!accessToken) throw new GraphQLError('Authentication token required');
    
    return await relationshipService.createOrganizationRelationship(userId, input, accessToken);
  },
  
  createPersonRelationship: async (_parent, { input }, context) => {
    const { userId } = requireAuthentication(context);
    const accessToken = getAccessToken(context);
    if (!accessToken) throw new GraphQLError('Authentication token required');
    
    return await relationshipService.createPersonRelationship(userId, input, accessToken);
  },
  
  createPersonOrganizationalRole: async (_parent, { input }, context) => {
    const { userId } = requireAuthentication(context);
    
    const { data, error } = await context.supabaseClient
      .from('person_organizational_roles')
      .insert({
        person_id: input.personId,
        organization_id: input.organizationId,
        role_title: input.roleTitle,
        department: input.department,
        seniority_level: convertSeniorityLevelToDb(input.seniorityLevel),
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
    
    if (error) throw new GraphQLError(`Failed to create organizational role: ${error.message}`);
    return data;
  },
  
  createStakeholderAnalysis: async (_parent, { input }, context) => {
    const { userId } = requireAuthentication(context);
    
    const { data, error } = await context.supabaseClient
      .from('stakeholder_analysis')
      .insert({
        person_id: input.personId,
        organization_id: input.organizationId,
        deal_id: input.dealId,
        lead_id: input.leadId,
        influence_score: input.influenceScore,
        decision_authority: input.decisionAuthority,
        budget_authority_level: input.budgetAuthorityLevel,
        engagement_level: input.engagementLevel,
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
    
    if (error) throw new GraphQLError(`Failed to create stakeholder analysis: ${error.message}`);
    return data;
  },
  
  updateStakeholderAnalysis: async (_parent, { id, input }, context) => {
    const { userId } = requireAuthentication(context);
    
    const { data, error } = await context.supabaseClient
      .from('stakeholder_analysis')
      .update({
        influence_score: input.influenceScore,
        decision_authority: input.decisionAuthority,
        budget_authority_level: input.budgetAuthorityLevel,
        engagement_level: input.engagementLevel,
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
    
    if (error) throw new GraphQLError(`Failed to update stakeholder analysis: ${error.message}`);
    return data;
  }
};

// Helper functions for AI analysis
function generateNetworkInsights(stakeholders: any[], roles: any[], relationships: any[]) {
  const insights = [];
  
  // Analyze influence distribution
  const influenceScores = stakeholders.map(s => s.influence_score).filter(Boolean);
  if (influenceScores.length > 0) {
    const avgInfluence = influenceScores.reduce((a, b) => a + b, 0) / influenceScores.length;
    const highInfluence = influenceScores.filter(s => s >= 8).length;
    const lowInfluence = influenceScores.filter(s => s <= 3).length;
    
    insights.push({
      type: 'influence_distribution',
      message: `Network has ${highInfluence} high-influence stakeholders (8-10) and ${lowInfluence} low-influence ones (1-3). Average influence: ${avgInfluence.toFixed(1)}/10`,
      priority: avgInfluence < 5 ? 'medium' : undefined,
      data: { average: avgInfluence, scores: influenceScores, high: highInfluence, low: lowInfluence }
    });
  }
  
  // Analyze decision authority
  const finalDecisionMakers = stakeholders.filter(s => 
    s.decision_authority === 'final_decision'
  ).length;
  const strongInfluencers = stakeholders.filter(s => 
    s.decision_authority === 'strong_influence'
  ).length;
  
  if (finalDecisionMakers === 0) {
    insights.push({
      type: 'risk_alert',
      message: '🚨 No final decision makers identified in your network. Focus on finding C-level executives or business owners.',
      priority: 'high'
    });
  } else if (finalDecisionMakers === 1) {
    insights.push({
      type: 'decision_authority',
      message: `✅ Found ${finalDecisionMakers} final decision maker and ${strongInfluencers} strong influencers. Consider expanding decision-maker coverage.`,
      priority: 'medium'
    });
  } else {
    insights.push({
      type: 'decision_authority',
      message: `💪 Strong decision-maker coverage with ${finalDecisionMakers} final decision makers and ${strongInfluencers} influencers.`,
      priority: undefined
    });
  }
  
  // Analyze engagement levels
  const champions = stakeholders.filter(s => s.engagement_level === 'champion').length;
  const supporters = stakeholders.filter(s => s.engagement_level === 'supporter').length;
  const blockers = stakeholders.filter(s => s.engagement_level === 'blocker').length;
  const skeptics = stakeholders.filter(s => s.engagement_level === 'skeptic').length;
  
  if (blockers > champions) {
    insights.push({
      type: 'engagement_risk',
      message: `⚠️ Warning: ${blockers} blockers vs only ${champions} champions. Prioritize converting skeptics and neutrals.`,
      priority: 'high'
    });
  } else if (champions === 0) {
    insights.push({
      type: 'engagement_opportunity',
      message: `📈 No champions identified yet. Focus on building stronger relationships with ${supporters + skeptics} potential supporters.`,
      priority: 'medium'
    });
  } else {
    const positiveEngagement = champions + supporters;
    const negativeEngagement = blockers + skeptics;
    insights.push({
      type: 'engagement_analysis',
      message: `🎯 Engagement balance: ${positiveEngagement} positive (${champions} champions, ${supporters} supporters) vs ${negativeEngagement} negative.`,
      priority: negativeEngagement > positiveEngagement ? 'medium' : undefined
    });
  }
  
  // Analyze network connectivity
  if (relationships.length > 0) {
    const avgConnections = (relationships.length * 2) / stakeholders.length; // bidirectional
    if (avgConnections < 2) {
      insights.push({
        type: 'connectivity',
        message: `🔗 Low network connectivity detected. Average ${avgConnections.toFixed(1)} connections per person. Map more relationships.`,
        priority: 'medium'
      });
    } else {
      insights.push({
        type: 'connectivity',
        message: `🌐 Good network connectivity with ${relationships.length} mapped relationships (${avgConnections.toFixed(1)} avg per person).`,
        priority: undefined
      });
    }
  } else {
    insights.push({
      type: 'connectivity_missing',
      message: '🔍 No relationships mapped yet. Understanding stakeholder connections is crucial for deal success.',
      priority: 'high'
    });
  }
  
  // Analyze seniority coverage
  const seniorityLevels = roles.map(r => r.seniority_level).filter(Boolean);
  const executiveRoles = seniorityLevels.filter(s => ['c_level', 'vp', 'founder'].includes(s)).length;
  const managerRoles = seniorityLevels.filter(s => ['director', 'manager'].includes(s)).length;
  const individualRoles = seniorityLevels.filter(s => ['senior', 'mid', 'entry'].includes(s)).length;
  
  if (executiveRoles === 0) {
    insights.push({
      type: 'seniority_gap',
      message: `👔 Missing executive-level contacts. Focus on reaching C-level, VPs, or founders for deal approval.`,
      priority: 'high'
    });
  } else {
    insights.push({
      type: 'seniority_coverage',
      message: `📊 Seniority mix: ${executiveRoles} executives, ${managerRoles} managers, ${individualRoles} individual contributors.`,
      priority: undefined
    });
  }
  
  return insights;
}

// Helper functions to transform database enum values to GraphQL enum values
function transformDecisionAuthority(dbValue: string): string {
  const mapping: Record<string, string> = {
    'final_decision': 'FINAL_DECISION',
    'strong_influence': 'STRONG_INFLUENCE',
    'recommender': 'RECOMMENDER',
    'influencer': 'INFLUENCER',
    'gatekeeper': 'GATEKEEPER',
    'end_user': 'END_USER',
    'blocker': 'BLOCKER'
  };
  return mapping[dbValue] || dbValue.toUpperCase();
}

function transformEngagementLevel(dbValue: string): string {
  const mapping: Record<string, string> = {
    'champion': 'CHAMPION',
    'supporter': 'SUPPORTER',
    'neutral': 'NEUTRAL',
    'skeptic': 'SKEPTIC',
    'blocker': 'BLOCKER'
  };
  return mapping[dbValue] || dbValue.toUpperCase();
}

function transformSeniorityLevel(dbValue: string): string {
  const mapping: Record<string, string> = {
    'entry': 'ENTRY',
    'mid': 'MID',
    'senior': 'SENIOR',
    'lead': 'LEAD',
    'manager': 'MANAGER',
    'director': 'DIRECTOR',
    'vp': 'VP',
    'c_level': 'C_LEVEL',
    'founder': 'FOUNDER'
  };
  return mapping[dbValue] || dbValue.toUpperCase();
}

function transformRelationshipType(dbValue: string): string {
  const mapping: Record<string, string> = {
    'reports_to': 'REPORTS_TO',
    'manages': 'MANAGES',
    'influences': 'INFLUENCES',
    'collaborates_with': 'COLLABORATES_WITH',
    'mentors': 'MENTORS',
    'partners_with': 'PARTNERS_WITH',
    'competes_with': 'COMPETES_WITH',
    'refers_to': 'REFERS_TO'
  };
  return mapping[dbValue] || dbValue.toUpperCase();
}

function transformInteractionFrequency(dbValue: string): string {
  const mapping: Record<string, string> = {
    'daily': 'DAILY',
    'weekly': 'WEEKLY',
    'monthly': 'MONTHLY',
    'quarterly': 'QUARTERLY',
    'annually': 'ANNUALLY',
    'rarely': 'RARELY'
  };
  return mapping[dbValue] || dbValue.toUpperCase();
}

function analyzeCoverage(roles: any[], stakeholders: any[]) {
  const seniorityCoverage: Record<string, number> = {};
  const departmentCoverage: Record<string, number> = {};
  
  roles.forEach(role => {
    if (role.seniority_level) {
      seniorityCoverage[role.seniority_level] = (seniorityCoverage[role.seniority_level] || 0) + 1;
    }
    if (role.department) {
      departmentCoverage[role.department] = (departmentCoverage[role.department] || 0) + 1;
    }
  });
  
  return {
    seniority_coverage: seniorityCoverage,
    department_coverage: departmentCoverage,
    total_roles: roles.length,
    analyzed_stakeholders: stakeholders.length
  };
}

function buildInfluenceMap(stakeholders: any[], relationships: any[]) {
  const influenceMap: Record<string, any> = {};
  
  stakeholders.forEach(stakeholder => {
    influenceMap[stakeholder.person_id] = {
      influence_score: stakeholder.influence_score,
      decision_authority: stakeholder.decision_authority,
      engagement_level: stakeholder.engagement_level,
      connections: []
    };
  });
  
  relationships.forEach(rel => {
    if (influenceMap[rel.from_person_id]) {
      influenceMap[rel.from_person_id].connections.push({
        to: rel.to_person_id,
        type: rel.relationship_type,
        strength: rel.relationship_strength
      });
    }
  });
  
  return influenceMap;
}

function generateMissingStakeholderRecommendations(currentRoles: any[], industryType?: string, dealSize?: string) {
  const baseRoles = [
    { title: 'CEO', priority: 'high', reason: 'Final decision authority' },
    { title: 'CFO', priority: 'high', reason: 'Budget approval' },
    { title: 'CTO', priority: 'medium', reason: 'Technical evaluation' },
    { title: 'Procurement Manager', priority: 'medium', reason: 'Vendor management' },
    { title: 'End User', priority: 'high', reason: 'User adoption' }
  ];
  
  // Add industry-specific roles
  if (industryType === 'technology') {
    baseRoles.push(
      { title: 'VP Engineering', priority: 'high', reason: 'Technical decision maker' },
      { title: 'Security Officer', priority: 'medium', reason: 'Security compliance' }
    );
  }
  
  // Add deal-size specific roles
  if (dealSize === 'enterprise') {
    baseRoles.push(
      { title: 'Board Member', priority: 'high', reason: 'Strategic approval' },
      { title: 'Legal Counsel', priority: 'medium', reason: 'Contract review' }
    );
  }
  
  // Find missing roles
  const currentRoleTypes = new Set(
    currentRoles.map(role => role.role_title.toLowerCase().replace(/[^a-z0-9]/g, ''))
  );
  
  const missingRoles = baseRoles.filter(required => {
    const normalizedRequired = required.title.toLowerCase().replace(/[^a-z0-9]/g, '');
    return !Array.from(currentRoleTypes).some(current => 
      current.includes(normalizedRequired) || normalizedRequired.includes(current)
    );
  });
  
  return {
    missingRoles,
    currentCoverage: currentRoles.length,
    recommendedCoverage: baseRoles.length,
    coveragePercentage: (currentRoles.length / baseRoles.length) * 100,
    priorityAdditions: missingRoles.slice(0, 3),
    suggestedActions: missingRoles.map(role => ({
      role: role.title,
      action: `Identify and engage ${role.title}`,
      priority: role.priority,
      reason: role.reason,
      suggested_approach: getSuggestedApproach(role.title)
    }))
  };
}

function getSuggestedApproach(roleTitle: string): string {
  const approaches: Record<string, string> = {
    'CEO': 'Schedule executive briefing, focus on strategic value and ROI',
    'CFO': 'Prepare detailed business case with cost justification',
    'CTO': 'Provide technical deep-dive and architecture review',
    'End User': 'Arrange product demonstration and trial period'
  };
  
  return approaches[roleTitle] || 'Research background and schedule introductory meeting';
} 