import { requireAuthentication } from '../helpers';
import type { GraphQLContext } from '../helpers';
import type { 
  QueryResolvers, 
  GraphData, 
  GraphNode, 
  GraphEdge, 
  GraphFilters,
  GraphSummary
} from '../../../lib/generated/graphql';

interface NodeData {
  id: string;
  type: string;
  label: string;
  color: string;
  size: number;
  data: any;
}

interface EdgeData {
  id: string;
  source: string;
  target: string;
  type: string;
  label?: string;
  color: string;
}

// Color schemes for different entity types
const NODE_COLORS = {
  PERSON: '#3182ce',      // Blue
  ORGANIZATION: '#38a169', // Green
  DEAL: '#d69e2e',        // Orange
  LEAD: '#805ad5',        // Purple
  ACTIVITY: '#e53e3e',    // Red
  WFM_PROJECT: '#319795', // Teal
};

const EDGE_COLORS = {
  WORKS_AT: '#4a5568',
  BELONGS_TO: '#2d3748',
  ASSIGNED_TO: '#1a202c',
  CONVERTED_TO: '#553c9a',
  HAS_ACTIVITY: '#c53030',
  HAS_PROJECT: '#2c7a7b',
};

async function fetchGraphData(
  userId: string, 
  accessToken: string, 
  supabaseClient: any,
  filters: GraphFilters = {}
): Promise<{ nodes: NodeData[], edges: EdgeData[] }> {
  const nodes: NodeData[] = [];
  const edges: EdgeData[] = [];
  const entityIds = new Set<string>();

  const { 
    entityTypes = ['PERSON', 'ORGANIZATION', 'DEAL', 'LEAD'], 
    maxNodes = 100,
    includeActivities = false,
    includeWFMProjects = false,
    centerNodeId,
    maxDepth = 2
  } = filters;

  try {
    // Fetch People
    if (entityTypes.includes('PERSON')) {
      const { data: people } = await supabaseClient
        .from('people')
        .select('id, first_name, last_name, email, organization_id')
        .limit(Math.min(maxNodes / entityTypes.length, 50));

      if (people) {
        people.forEach((person: any) => {
          const label = `${person.first_name || ''} ${person.last_name || ''}`.trim() || person.email || 'Unknown Person';
          nodes.push({
            id: person.id,
            type: 'PERSON',
            label,
            color: NODE_COLORS.PERSON,
            size: 10,
            data: person
          });
          entityIds.add(person.id);

          // Add edge to organization if exists
          if (person.organization_id) {
            edges.push({
              id: `${person.id}-works-at-${person.organization_id}`,
              source: person.id,
              target: person.organization_id,
              type: 'WORKS_AT',
              label: 'works at',
              color: EDGE_COLORS.WORKS_AT
            });
          }
        });
      }
    }

    // Fetch Organizations
    if (entityTypes.includes('ORGANIZATION')) {
      const { data: organizations } = await supabaseClient
        .from('organizations')
        .select('id, name, address')
        .limit(Math.min(maxNodes / entityTypes.length, 30));

      if (organizations) {
        organizations.forEach((org: any) => {
          nodes.push({
            id: org.id,
            type: 'ORGANIZATION',
            label: org.name,
            color: NODE_COLORS.ORGANIZATION,
            size: 15,
            data: org
          });
          entityIds.add(org.id);
        });
      }
    }

    // Fetch Deals
    if (entityTypes.includes('DEAL')) {
      const { data: deals } = await supabaseClient
        .from('deals')
        .select('id, name, amount, person_id, organization_id, wfm_project_id')
        .limit(Math.min(maxNodes / entityTypes.length, 40));

      if (deals) {
        deals.forEach((deal: any) => {
          nodes.push({
            id: deal.id,
            type: 'DEAL',
            label: deal.name,
            color: NODE_COLORS.DEAL,
            size: deal.amount ? Math.max(8, Math.min(20, deal.amount / 10000)) : 12,
            data: deal
          });
          entityIds.add(deal.id);

          // Add edges to related entities
          if (deal.person_id) {
            edges.push({
              id: `${deal.id}-belongs-to-${deal.person_id}`,
              source: deal.id,
              target: deal.person_id,
              type: 'BELONGS_TO',
              label: 'contact',
              color: EDGE_COLORS.BELONGS_TO
            });
          }

          if (deal.organization_id) {
            edges.push({
              id: `${deal.id}-belongs-to-${deal.organization_id}`,
              source: deal.id,
              target: deal.organization_id,
              type: 'BELONGS_TO',
              label: 'organization',
              color: EDGE_COLORS.BELONGS_TO
            });
          }

          if (deal.wfm_project_id && includeWFMProjects) {
            edges.push({
              id: `${deal.id}-has-project-${deal.wfm_project_id}`,
              source: deal.id,
              target: deal.wfm_project_id,
              type: 'HAS_PROJECT',
              label: 'workflow',
              color: EDGE_COLORS.HAS_PROJECT
            });
          }
        });
      }
    }

    // Fetch Leads
    if (entityTypes.includes('LEAD')) {
      const { data: leads } = await supabaseClient
        .from('leads')
        .select('id, name, contact_name, company_name, converted_to_deal_id, converted_to_person_id, converted_to_organization_id, wfm_project_id')
        .limit(Math.min(maxNodes / entityTypes.length, 30));

      if (leads) {
        leads.forEach((lead: any) => {
          nodes.push({
            id: lead.id,
            type: 'LEAD',
            label: lead.name || lead.contact_name || 'Unknown Lead',
            color: NODE_COLORS.LEAD,
            size: 10,
            data: lead
          });
          entityIds.add(lead.id);

          // Add conversion edges
          if (lead.converted_to_deal_id) {
            edges.push({
              id: `${lead.id}-converted-to-${lead.converted_to_deal_id}`,
              source: lead.id,
              target: lead.converted_to_deal_id,
              type: 'CONVERTED_TO',
              label: 'converted to deal',
              color: EDGE_COLORS.CONVERTED_TO
            });
          }

          if (lead.converted_to_person_id) {
            edges.push({
              id: `${lead.id}-converted-to-${lead.converted_to_person_id}`,
              source: lead.id,
              target: lead.converted_to_person_id,
              type: 'CONVERTED_TO',
              label: 'converted to contact',
              color: EDGE_COLORS.CONVERTED_TO
            });
          }

          if (lead.converted_to_organization_id) {
            edges.push({
              id: `${lead.id}-converted-to-${lead.converted_to_organization_id}`,
              source: lead.id,
              target: lead.converted_to_organization_id,
              type: 'CONVERTED_TO',
              label: 'converted to org',
              color: EDGE_COLORS.CONVERTED_TO
            });
          }

          if (lead.wfm_project_id && includeWFMProjects) {
            edges.push({
              id: `${lead.id}-has-project-${lead.wfm_project_id}`,
              source: lead.id,
              target: lead.wfm_project_id,
              type: 'HAS_PROJECT',
              label: 'workflow',
              color: EDGE_COLORS.HAS_PROJECT
            });
          }
        });
      }
    }

    // Fetch Activities if requested
    if (includeActivities) {
      const { data: activities } = await supabaseClient
        .from('activities')
        .select('id, subject, type, deal_id, person_id, organization_id, lead_id')
        .limit(20);

      if (activities) {
        activities.forEach((activity: any) => {
          nodes.push({
            id: activity.id,
            type: 'ACTIVITY',
            label: activity.subject,
            color: NODE_COLORS.ACTIVITY,
            size: 6,
            data: activity
          });

          // Add edges to related entities
          if (activity.deal_id && entityIds.has(activity.deal_id)) {
            edges.push({
              id: `${activity.id}-activity-${activity.deal_id}`,
              source: activity.deal_id,
              target: activity.id,
              type: 'HAS_ACTIVITY',
              color: EDGE_COLORS.HAS_ACTIVITY
            });
          }

          if (activity.person_id && entityIds.has(activity.person_id)) {
            edges.push({
              id: `${activity.id}-activity-${activity.person_id}`,
              source: activity.person_id,
              target: activity.id,
              type: 'HAS_ACTIVITY',
              color: EDGE_COLORS.HAS_ACTIVITY
            });
          }

          if (activity.organization_id && entityIds.has(activity.organization_id)) {
            edges.push({
              id: `${activity.id}-activity-${activity.organization_id}`,
              source: activity.organization_id,
              target: activity.id,
              type: 'HAS_ACTIVITY',
              color: EDGE_COLORS.HAS_ACTIVITY
            });
          }

          if (activity.lead_id && entityIds.has(activity.lead_id)) {
            edges.push({
              id: `${activity.id}-activity-${activity.lead_id}`,
              source: activity.lead_id,
              target: activity.id,
              type: 'HAS_ACTIVITY',
              color: EDGE_COLORS.HAS_ACTIVITY
            });
          }
        });
      }
    }

    // Fetch WFM Projects if requested
    if (includeWFMProjects) {
      const { data: wfmProjects } = await supabaseClient
        .from('wfm_projects')
        .select('id, name, description')
        .limit(20);

      if (wfmProjects) {
        wfmProjects.forEach((project: any) => {
          nodes.push({
            id: project.id,
            type: 'WFM_PROJECT',
            label: project.name,
            color: NODE_COLORS.WFM_PROJECT,
            size: 8,
            data: project
          });
        });
      }
    }

    return { nodes, edges };
  } catch (error) {
    console.error('Error fetching graph data:', error);
    return { nodes: [], edges: [] };
  }
}

export const graphQueries: QueryResolvers<GraphQLContext> = {
  getGraphData: async (_parent, { filters }, context): Promise<GraphData> => {
    const { userId, accessToken } = requireAuthentication(context);
    
    const { nodes, edges } = await fetchGraphData(
      userId, 
      accessToken, 
      context.supabaseClient,
      filters || {}
    );

    // Calculate summary statistics
    const nodesByType: Record<string, number> = {};
    const edgesByType: Record<string, number> = {};

    nodes.forEach(node => {
      nodesByType[node.type] = (nodesByType[node.type] || 0) + 1;
    });

    edges.forEach(edge => {
      edgesByType[edge.type] = (edgesByType[edge.type] || 0) + 1;
    });

    const summary: GraphSummary = {
      totalNodes: nodes.length,
      totalEdges: edges.length,
      nodesByType,
      edgesByType,
    };

    return {
      nodes: nodes as GraphNode[],
      edges: edges as GraphEdge[],
      summary,
    };
  },
}; 