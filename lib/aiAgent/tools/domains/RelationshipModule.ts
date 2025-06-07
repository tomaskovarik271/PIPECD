import { z } from 'zod';
import type { ToolResult, ToolExecutionContext } from '../../types/tools';
import { supabase } from '../../../../lib/supabaseClient';

/**
 * Relationship Intelligence Module
 * 
 * Provides AI tools for:
 * - Creating and managing organizational relationships
 * - Mapping person relationships and reporting structures
 * - Analyzing stakeholder networks and influence
 * - Generating relationship insights and recommendations
 */

// Input schemas for relationship tools
const CreateOrgRelationshipSchema = z.object({
  parentOrgId: z.string().uuid(),
  childOrgId: z.string().uuid(),
  relationshipType: z.enum(['subsidiary', 'division', 'partnership', 'supplier', 'customer', 'joint_venture', 'acquisition_target', 'competitor']),
  ownershipPercentage: z.number().min(0).max(100).optional(),
  relationshipStrength: z.number().min(1).max(10).optional(),
  startDate: z.string().optional(),
  notes: z.string().optional()
});

const CreatePersonRelationshipSchema = z.object({
  fromPersonId: z.string().uuid(),
  toPersonId: z.string().uuid(),
  relationshipType: z.enum(['reports_to', 'manages', 'influences', 'collaborates_with', 'mentors', 'partners_with', 'competes_with', 'refers_to']),
  relationshipStrength: z.number().min(1).max(10).optional(),
  isBidirectional: z.boolean().optional(),
  interactionFrequency: z.enum(['daily', 'weekly', 'monthly', 'quarterly', 'annually', 'rarely']).optional(),
  relationshipContext: z.string().optional(),
  notes: z.string().optional()
});

const CreateStakeholderAnalysisSchema = z.object({
  personId: z.string().uuid(),
  organizationId: z.string().uuid(),
  dealId: z.string().uuid().optional(),
  leadId: z.string().uuid().optional(),
  influenceScore: z.number().min(1).max(10).optional(),
  decisionAuthority: z.enum(['final_decision', 'strong_influence', 'recommender', 'influencer', 'gatekeeper', 'end_user', 'blocker']).optional(),
  budgetAuthorityLevel: z.enum(['unlimited', 'high', 'medium', 'low', 'none']).optional(),
  engagementLevel: z.enum(['champion', 'supporter', 'neutral', 'skeptic', 'blocker']).optional(),
  painPoints: z.array(z.string()).optional(),
  motivations: z.array(z.string()).optional(),
  approachStrategy: z.string().optional()
});

const AnalyzeStakeholderNetworkSchema = z.object({
  organizationId: z.string().uuid(),
  dealId: z.string().uuid().optional(),
  leadId: z.string().uuid().optional(),
  includeInactiveRoles: z.boolean().optional().default(false)
});

const FindMissingStakeholdersSchema = z.object({
  organizationId: z.string().uuid(),
  dealId: z.string().uuid().optional(),
  leadId: z.string().uuid().optional(),
  industryType: z.string().optional(),
  dealSize: z.string().optional()
});

interface RequiredStakeholderRole {
  title: string;
  priority: string;
  reason: string;
}

export class RelationshipModule {
  
  /**
   * Creates an organizational relationship between two companies
   */
  async createOrganizationRelationship(
    params: z.infer<typeof CreateOrgRelationshipSchema>,
    context: ToolExecutionContext
  ): Promise<ToolResult> {
    try {
      // Validate input
      const validatedParams = CreateOrgRelationshipSchema.parse(params);
      
      // Check if both organizations exist and user has access
      const { data: parentOrg, error: parentError } = await supabase
        .from('organizations')
        .select('id, name')
        .eq('id', validatedParams.parentOrgId)
        .single();
        
      const { data: childOrg, error: childError } = await supabase
        .from('organizations')
        .select('id, name')
        .eq('id', validatedParams.childOrgId)
        .single();
        
      if (parentError || childError || !parentOrg || !childOrg) {
        return {
          success: false,
          message: 'One or both organizations not found or access denied',
          metadata: {
            toolName: 'create_organization_relationship',
            parameters: params,
            timestamp: new Date().toISOString(),
          },
        };
      }
      
      // Create the relationship
      const { data: relationship, error } = await supabase
        .from('organization_relationships')
        .insert({
          parent_org_id: validatedParams.parentOrgId,
          child_org_id: validatedParams.childOrgId,
          relationship_type: validatedParams.relationshipType,
          ownership_percentage: validatedParams.ownershipPercentage,
          relationship_strength: validatedParams.relationshipStrength,
          start_date: validatedParams.startDate,
          notes: validatedParams.notes,
          created_by_user_id: context.userId
        })
        .select()
        .single();
        
      if (error) {
        return {
          success: false,
          message: `Failed to create relationship: ${error.message}`,
          metadata: {
            toolName: 'create_organization_relationship',
            parameters: params,
            timestamp: new Date().toISOString(),
          },
        };
      }
      
      return {
        success: true,
        data: relationship,
        message: `Successfully created ${validatedParams.relationshipType} relationship between ${parentOrg.name} and ${childOrg.name}`,
        metadata: {
          toolName: 'create_organization_relationship',
          parameters: params,
          timestamp: new Date().toISOString(),
        },
      };
      
    } catch (error) {
      return {
        success: false,
        message: `Error creating organization relationship: ${error instanceof Error ? error.message : 'Unknown error'}`,
        metadata: {
          toolName: 'create_organization_relationship',
          parameters: params,
          timestamp: new Date().toISOString(),
        },
      };
    }
  }
  
  /**
   * Creates a relationship between two people
   */
  async createPersonRelationship(
    params: z.infer<typeof CreatePersonRelationshipSchema>,
    context: ToolExecutionContext
  ): Promise<ToolResult> {
    try {
      const validatedParams = CreatePersonRelationshipSchema.parse(params);
      
      // Check if both people exist and user has access
      const { data: fromPerson, error: fromError } = await supabase
        .from('people')
        .select('id, first_name, last_name')
        .eq('id', validatedParams.fromPersonId)
        .single();
        
      const { data: toPerson, error: toError } = await supabase
        .from('people')
        .select('id, first_name, last_name')
        .eq('id', validatedParams.toPersonId)
        .single();
        
      if (fromError || toError || !fromPerson || !toPerson) {
        return {
          success: false,
          message: 'One or both people not found or access denied',
          metadata: {
            toolName: 'create_person_relationship',
            parameters: params,
            timestamp: new Date().toISOString(),
          },
        };
      }
      
      // Create the relationship
      const { data: relationship, error } = await supabase
        .from('person_relationships')
        .insert({
          from_person_id: validatedParams.fromPersonId,
          to_person_id: validatedParams.toPersonId,
          relationship_type: validatedParams.relationshipType,
          relationship_strength: validatedParams.relationshipStrength,
          is_bidirectional: validatedParams.isBidirectional,
          interaction_frequency: validatedParams.interactionFrequency,
          relationship_context: validatedParams.relationshipContext,
          notes: validatedParams.notes,
          created_by_user_id: context.userId
        })
        .select()
        .single();
        
      if (error) {
        return {
          success: false,
          message: `Failed to create relationship: ${error.message}`,
          metadata: {
            toolName: 'create_person_relationship',
            parameters: params,
            timestamp: new Date().toISOString(),
          },
        };
      }
      
      const fromName = `${fromPerson.first_name} ${fromPerson.last_name}`.trim();
      const toName = `${toPerson.first_name} ${toPerson.last_name}`.trim();
      
      return {
        success: true,
        data: relationship,
        message: `Successfully created ${validatedParams.relationshipType} relationship: ${fromName} → ${toName}`,
        metadata: {
          toolName: 'create_person_relationship',
          parameters: params,
          timestamp: new Date().toISOString(),
        },
      };
      
    } catch (error) {
      return {
        success: false,
        message: `Error creating person relationship: ${error instanceof Error ? error.message : 'Unknown error'}`,
        metadata: {
          toolName: 'create_person_relationship',
          parameters: params,
          timestamp: new Date().toISOString(),
        },
      };
    }
  }
  
  /**
   * Creates a stakeholder analysis for a person in the context of a deal or lead
   */
  async createStakeholderAnalysis(
    params: z.infer<typeof CreateStakeholderAnalysisSchema>,
    context: ToolExecutionContext
  ): Promise<ToolResult> {
    try {
      const validatedParams = CreateStakeholderAnalysisSchema.parse(params);
      
      // Verify person and organization exist
      const { data: person, error: personError } = await supabase
        .from('people')
        .select('id, first_name, last_name')
        .eq('id', validatedParams.personId)
        .single();
        
      const { data: organization, error: orgError } = await supabase
        .from('organizations')
        .select('id, name')
        .eq('id', validatedParams.organizationId)
        .single();
        
      if (personError || orgError || !person || !organization) {
        return {
          success: false,
          message: 'Person or organization not found or access denied',
          metadata: {
            toolName: 'create_stakeholder_analysis',
            parameters: params,
            timestamp: new Date().toISOString(),
          },
        };
      }
      
      // Create stakeholder analysis
      const { data: analysis, error } = await supabase
        .from('stakeholder_analysis')
        .insert({
          person_id: validatedParams.personId,
          organization_id: validatedParams.organizationId,
          deal_id: validatedParams.dealId,
          lead_id: validatedParams.leadId,
          influence_score: validatedParams.influenceScore,
          decision_authority: validatedParams.decisionAuthority,
          budget_authority_level: validatedParams.budgetAuthorityLevel,
          engagement_level: validatedParams.engagementLevel,
          pain_points: validatedParams.painPoints,
          motivations: validatedParams.motivations,
          approach_strategy: validatedParams.approachStrategy,
          created_by_user_id: context.userId
        })
        .select()
        .single();
        
      if (error) {
        return {
          success: false,
          message: `Failed to create stakeholder analysis: ${error.message}`,
          metadata: {
            toolName: 'create_stakeholder_analysis',
            parameters: params,
            timestamp: new Date().toISOString(),
          },
        };
      }
      
      const personName = `${person.first_name} ${person.last_name}`.trim();
      
      return {
        success: true,
        data: analysis,
        message: `Successfully created stakeholder analysis for ${personName} at ${organization.name}`,
        metadata: {
          toolName: 'create_stakeholder_analysis',
          parameters: params,
          timestamp: new Date().toISOString(),
        },
      };
      
    } catch (error) {
      return {
        success: false,
        message: `Error creating stakeholder analysis: ${error instanceof Error ? error.message : 'Unknown error'}`,
        metadata: {
          toolName: 'create_stakeholder_analysis',
          parameters: params,
          timestamp: new Date().toISOString(),
        },
      };
    }
  }
  
  /**
   * Analyzes the stakeholder network for an organization/deal/lead
   */
  async analyzeStakeholderNetwork(
    params: z.infer<typeof AnalyzeStakeholderNetworkSchema>,
    context: ToolExecutionContext
  ): Promise<ToolResult> {
    try {
      const validatedParams = AnalyzeStakeholderNetworkSchema.parse(params);
      
      // Get organization details
      const { data: organization, error: orgError } = await supabase
        .from('organizations')
        .select('id, name')
        .eq('id', validatedParams.organizationId)
        .single();
        
      if (orgError || !organization) {
        return {
          success: false,
          message: 'Organization not found or access denied',
          metadata: {
            toolName: 'analyze_stakeholder_network',
            parameters: params,
            timestamp: new Date().toISOString(),
          },
        };
      }
      
      // Get all stakeholder analyses for this context
      let stakeholderQuery = supabase
        .from('stakeholder_analysis')
        .select(`
          *,
          people:person_id (
            id, first_name, last_name, email, phone
          )
        `)
        .eq('organization_id', validatedParams.organizationId);
        
      if (validatedParams.dealId) {
        stakeholderQuery = stakeholderQuery.eq('deal_id', validatedParams.dealId);
      }
      if (validatedParams.leadId) {
        stakeholderQuery = stakeholderQuery.eq('lead_id', validatedParams.leadId);
      }
      
      const { data: stakeholders, error: stakeholderError } = await stakeholderQuery;
      
      if (stakeholderError) {
        return {
          success: false,
          message: `Failed to fetch stakeholders: ${stakeholderError.message}`,
          metadata: {
            toolName: 'analyze_stakeholder_network',
            parameters: params,
            timestamp: new Date().toISOString(),
          },
        };
      }
      
      // Get organizational roles
      let rolesQuery = supabase
        .from('person_organizational_roles')
        .select(`
          *,
          people:person_id (
            id, first_name, last_name, email
          )
        `)
        .eq('organization_id', validatedParams.organizationId);
        
      if (!validatedParams.includeInactiveRoles) {
        rolesQuery = rolesQuery.is('end_date', null);
      }
      
      const { data: roles, error: rolesError } = await rolesQuery;
      
      if (rolesError) {
        return {
          success: false,
          message: `Failed to fetch organizational roles: ${rolesError.message}`,
          metadata: {
            toolName: 'analyze_stakeholder_network',
            parameters: params,
            timestamp: new Date().toISOString(),
          },
        };
      }
      
      // Get person relationships within the organization
      const personIds = roles?.map(role => role.person_id) || [];
      
      const { data: relationships, error: relationshipsError } = await supabase
        .from('person_relationships')
        .select(`
          *,
          from_person:from_person_id (
            id, first_name, last_name
          ),
          to_person:to_person_id (
            id, first_name, last_name
          )
        `)
        .or(`from_person_id.in.(${personIds.join(',')}),to_person_id.in.(${personIds.join(',')})`);
        
      // Analyze the network
      const analysis = {
        organization: organization,
        stakeholder_count: stakeholders?.length || 0,
        role_count: roles?.length || 0,
        relationship_count: relationships?.length || 0,
        stakeholders: stakeholders || [],
        roles: roles || [],
        relationships: relationships || [],
        network_insights: this.generateNetworkInsights(stakeholders || [], roles || [], relationships || []),
        coverage_analysis: this.analyzeCoverage(roles || [], stakeholders || []),
        influence_map: this.buildInfluenceMap(stakeholders || [], relationships || [])
      };
      
      return {
        success: true,
        data: analysis,
        message: `Successfully analyzed stakeholder network for ${organization.name}. Found ${analysis.stakeholder_count} stakeholders, ${analysis.role_count} roles, and ${analysis.relationship_count} relationships.`,
        metadata: {
          toolName: 'analyze_stakeholder_network',
          parameters: params,
          timestamp: new Date().toISOString(),
        },
      };
      
    } catch (error) {
      return {
        success: false,
        message: `Error analyzing stakeholder network: ${error instanceof Error ? error.message : 'Unknown error'}`,
        metadata: {
          toolName: 'analyze_stakeholder_network',
          parameters: params,
          timestamp: new Date().toISOString(),
        },
      };
    }
  }
  
  /**
   * Identifies missing stakeholders based on typical organizational structures
   */
  async findMissingStakeholders(
    params: z.infer<typeof FindMissingStakeholdersSchema>,
    context: ToolExecutionContext
  ): Promise<ToolResult> {
    try {
      const validatedParams = FindMissingStakeholdersSchema.parse(params);
      
      // Get current stakeholders and roles
      const { data: currentRoles, error: rolesError } = await supabase
        .from('person_organizational_roles')
        .select('role_title, seniority_level, department')
        .eq('organization_id', validatedParams.organizationId)
        .is('end_date', null);
        
      if (rolesError) {
        return {
          success: false,
          message: `Failed to fetch current roles: ${rolesError.message}`,
          metadata: {
            toolName: 'find_missing_stakeholders',
            parameters: params,
            timestamp: new Date().toISOString(),
          },
        };
      }
      
      // Define typical stakeholder patterns based on deal context
      const requiredRoles = this.getRequiredStakeholdersByContext(
        validatedParams.industryType,
        validatedParams.dealSize
      );
      
      // Find missing roles
      const currentRoleTypes = new Set(
        currentRoles?.map(role => this.normalizeRoleTitle(role.role_title)) || []
      );
      
      const missingRoles = requiredRoles.filter(
        required => !this.hasRoleMatch(required, currentRoleTypes)
      );
      
      // Generate recommendations
      const recommendations = {
        missing_roles: missingRoles,
        current_coverage: currentRoles?.length || 0,
        recommended_coverage: requiredRoles.length,
        coverage_percentage: ((currentRoles?.length || 0) / requiredRoles.length) * 100,
        priority_additions: missingRoles.slice(0, 3), // Top 3 priorities
        suggested_actions: this.generateStakeholderActionPlan(missingRoles)
      };
      
      return {
        success: true,
        data: recommendations,
        message: `Found ${missingRoles.length} missing stakeholder roles. Current coverage: ${recommendations.coverage_percentage.toFixed(1)}%`,
        metadata: {
          toolName: 'find_missing_stakeholders',
          parameters: params,
          timestamp: new Date().toISOString(),
        },
      };
      
    } catch (error) {
      return {
        success: false,
        message: `Error finding missing stakeholders: ${error instanceof Error ? error.message : 'Unknown error'}`,
        metadata: {
          toolName: 'find_missing_stakeholders',
          parameters: params,
          timestamp: new Date().toISOString(),
        },
      };
    }
  }
  
  // Helper methods for stakeholder analysis
  private generateNetworkInsights(stakeholders: any[], roles: any[], relationships: any[]) {
    const insights = [];
    
    // Analyze influence distribution
    const influenceScores = stakeholders?.map(s => s.influence_score).filter(Boolean) || [];
    if (influenceScores.length > 0) {
      const avgInfluence = influenceScores.reduce((a, b) => a + b, 0) / influenceScores.length;
      insights.push({
        type: 'influence_distribution',
        message: `Average influence score: ${avgInfluence.toFixed(1)}/10`,
        data: { average: avgInfluence, scores: influenceScores }
      });
    }
    
    // Analyze decision authority
    const decisionMakers = stakeholders?.filter(s => 
      ['final_decision', 'strong_influence'].includes(s.decision_authority)
    ).length || 0;
    
    if (decisionMakers === 0) {
      insights.push({
        type: 'risk_alert',
        message: 'No final decision makers identified',
        priority: 'high'
      });
    }
    
    // Analyze engagement levels
    const champions = stakeholders?.filter(s => s.engagement_level === 'champion').length || 0;
    const blockers = stakeholders?.filter(s => s.engagement_level === 'blocker').length || 0;
    
    if (blockers > champions) {
      insights.push({
        type: 'risk_alert',
        message: `More blockers (${blockers}) than champions (${champions})`,
        priority: 'high'
      });
    }
    
    return insights;
  }
  
  private analyzeCoverage(roles: any[], stakeholders: any[]) {
    const seniorityCoverage: Record<string, number> = {};
    const departmentCoverage: Record<string, number> = {};
    
    roles?.forEach(role => {
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
      total_roles: roles?.length || 0,
      analyzed_stakeholders: stakeholders?.length || 0
    };
  }
  
  private buildInfluenceMap(stakeholders: any[], relationships: any[]) {
    const influenceMap: Record<string, any> = {};
    
    stakeholders?.forEach(stakeholder => {
      influenceMap[stakeholder.person_id] = {
        influence_score: stakeholder.influence_score,
        decision_authority: stakeholder.decision_authority,
        engagement_level: stakeholder.engagement_level,
        connections: []
      };
    });
    
    relationships?.forEach(rel => {
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
  
  private getRequiredStakeholdersByContext(industryType?: string, dealSize?: string): RequiredStakeholderRole[] {
    const baseRoles: RequiredStakeholderRole[] = [
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
    
    return baseRoles;
  }
  
  private normalizeRoleTitle(title: string): string {
    return title.toLowerCase().replace(/[^a-z0-9]/g, '');
  }
  
  private hasRoleMatch(requiredRole: RequiredStakeholderRole, currentRoles: Set<string>): boolean {
    const normalizedRequired = this.normalizeRoleTitle(requiredRole.title);
    return Array.from(currentRoles).some(current => 
      current.includes(normalizedRequired) || normalizedRequired.includes(current)
    );
  }
  
  private generateStakeholderActionPlan(missingRoles: RequiredStakeholderRole[]) {
    return missingRoles.map(role => ({
      role: role.title,
      action: `Identify and engage ${role.title}`,
      priority: role.priority,
      reason: role.reason,
      suggested_approach: this.getSuggestedApproach(role.title)
    }));
  }
  
  private getSuggestedApproach(roleTitle: string): string {
    const approaches: Record<string, string> = {
      'CEO': 'Schedule executive briefing, focus on strategic value and ROI',
      'CFO': 'Prepare detailed business case with cost justification',
      'CTO': 'Provide technical deep-dive and architecture review',
      'End User': 'Arrange product demonstration and trial period'
    };
    
    return approaches[roleTitle] || 'Research background and schedule introductory meeting';
  }
} 