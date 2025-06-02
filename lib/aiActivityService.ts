import { GraphQLError } from 'graphql';
import { getAuthenticatedClient } from './serviceUtils';

// Types for AI activity recommendations
export interface ActivityRecommendationContext {
  deal: {
    id: string;
    name: string;
    amount?: number;
    expected_close_date?: string;
    deal_specific_probability?: number;
    currentWfmStatus?: {
      name: string;
      metadata?: any;
    };
    daysInCurrentStage?: number;
  };
  person?: {
    first_name: string;
    last_name: string;
    email?: string;
    job_title?: string;
  };
  organization?: {
    name: string;
    industry?: string;
  };
  recentActivities: Array<{
    type: string;
    subject: string;
    created_at: string;
    is_done: boolean;
  }>;
  contextualInfo: {
    daysUntilExpectedClose?: number;
    isHighValue: boolean;
    stageDuration: number;
    hasOverdueActivities: boolean;
  };
}

export interface AIActivityRecommendation {
  type: string; // ActivityType enum value
  subject: string;
  notes: string;
  suggestedDueDate: string; // ISO date
  confidence: number; // 0-1
  reasoning: string;
}

export interface AIActivityRecommendationsResponse {
  recommendations: AIActivityRecommendation[];
  primaryRecommendation: AIActivityRecommendation;
  contextSummary: string;
}

/**
 * Gather comprehensive context about a deal for AI analysis
 */
export async function gatherDealContext(
  dealId: string,
  accessToken: string
): Promise<ActivityRecommendationContext> {
  const supabase = getAuthenticatedClient(accessToken);

  try {
    // Get deal with related data
    const { data: dealData, error: dealError } = await supabase
      .from('deals')
      .select(`
        id,
        name,
        amount,
        expected_close_date,
        deal_specific_probability,
        created_at,
        wfm_project_id,
        person:people(
          first_name,
          last_name,
          email
        ),
        organization:organizations(
          name
        )
      `)
      .eq('id', dealId)
      .single();

    if (dealError || !dealData) {
      throw new GraphQLError(`Deal not found: ${dealError?.message || 'Unknown error'}`);
    }

    // Get WFM status if available
    let currentWfmStatus: { name: string; metadata?: any } | undefined = undefined;
    if (dealData.wfm_project_id) {
      const { data: wfmData } = await supabase
        .from('wfm_projects')
        .select(`
          id,
          current_step_id
        `)
        .eq('id', dealData.wfm_project_id)
        .single();
      
      if (wfmData?.current_step_id) {
        const { data: stepData } = await supabase
          .from('workflow_steps')
          .select(`
            metadata,
            status:statuses(name)
          `)
          .eq('id', wfmData.current_step_id)
          .single();
          
        if (stepData && stepData.status) {
          currentWfmStatus = {
            name: (stepData.status as any).name || 'Unknown',
            metadata: stepData.metadata
          };
        }
      }
    }

    // Get recent activities (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const { data: activities } = await supabase
      .from('activities')
      .select('type, subject, created_at, is_done, due_date')
      .eq('deal_id', dealId)
      .gte('created_at', thirtyDaysAgo.toISOString())
      .order('created_at', { ascending: false })
      .limit(10);

    // Calculate contextual information
    const now = new Date();
    const expectedCloseDate = dealData.expected_close_date ? new Date(dealData.expected_close_date) : null;
    const daysUntilExpectedClose = expectedCloseDate 
      ? Math.ceil((expectedCloseDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      : undefined;

    const isHighValue = (dealData.amount || 0) > 50000; // Configurable threshold
    
    const hasOverdueActivities = (activities || []).some(activity => {
      if (!activity.due_date || activity.is_done) return false;
      return new Date(activity.due_date) < now;
    });

    // Calculate stage duration (simplified - could be enhanced with actual stage change tracking)
    const createdAt = new Date(dealData.created_at);
    const stageDuration = Math.ceil((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24));

    return {
      deal: {
        id: dealData.id,
        name: dealData.name || 'Unnamed Deal',
        amount: dealData.amount,
        expected_close_date: dealData.expected_close_date,
        deal_specific_probability: dealData.deal_specific_probability,
        currentWfmStatus,
        daysInCurrentStage: stageDuration,
      },
      person: dealData.person ? {
        first_name: (dealData.person as any).first_name || '',
        last_name: (dealData.person as any).last_name || '',
        email: (dealData.person as any).email || undefined,
        job_title: undefined,
      } : undefined,
      organization: dealData.organization ? {
        name: (dealData.organization as any).name || '',
        industry: undefined,
      } : undefined,
      recentActivities: (activities || []).map(activity => ({
        type: activity.type || 'TASK',
        subject: activity.subject || '',
        created_at: activity.created_at || '',
        is_done: activity.is_done || false,
      })),
      contextualInfo: {
        daysUntilExpectedClose,
        isHighValue,
        stageDuration,
        hasOverdueActivities,
      },
    };
  } catch (error) {
    console.error('Error gathering deal context:', error);
    throw new GraphQLError(`Failed to gather deal context: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Generate AI-powered activity recommendations using Claude API
 */
export async function generateActivityRecommendations(
  context: ActivityRecommendationContext
): Promise<AIActivityRecommendationsResponse> {
  const anthropicApiKey = process.env.ANTHROPIC_API_KEY;
  
  // Temporarily disable AI API calls in production to avoid timeouts
  // TODO: Re-enable once we have proper async processing or longer timeouts
  if (!anthropicApiKey || process.env.NODE_ENV === 'production') {
    console.warn('Using fallback recommendations (AI disabled in production)');
    return generateFallbackRecommendations(context);
  }

  try {
    const prompt = buildClaudePrompt(context);
    
    // Define the JSON schema for structured output
    const structuredOutputTool = {
      name: "activity_recommendations",
      description: "Generate AI-powered activity recommendations for a sales deal",
      input_schema: {
        type: "object",
        properties: {
          contextSummary: {
            type: "string",
            description: "Brief analysis of the deal situation"
          },
          primaryRecommendation: {
            type: "object",
            properties: {
              type: {
                type: "string",
                enum: ["CALL", "EMAIL", "MEETING", "TASK", "DEADLINE"],
                description: "Type of activity"
              },
              subject: {
                type: "string",
                description: "Specific activity title"
              },
              notes: {
                type: "string",
                description: "Detailed description of what to do"
              },
              suggestedDueDate: {
                type: "string",
                description: "Suggested due date in YYYY-MM-DD format"
              },
              confidence: {
                type: "number",
                minimum: 0,
                maximum: 1,
                description: "Confidence level between 0 and 1"
              },
              reasoning: {
                type: "string",
                description: "Why this is the best next step"
              }
            },
            required: ["type", "subject", "notes", "suggestedDueDate", "confidence", "reasoning"]
          },
          recommendations: {
            type: "array",
            items: {
              type: "object",
              properties: {
                type: {
                  type: "string",
                  enum: ["CALL", "EMAIL", "MEETING", "TASK", "DEADLINE"],
                  description: "Type of activity"
                },
                subject: {
                  type: "string",
                  description: "Specific activity title"
                },
                notes: {
                  type: "string",
                  description: "Detailed description of what to do"
                },
                suggestedDueDate: {
                  type: "string",
                  description: "Suggested due date in YYYY-MM-DD format"
                },
                confidence: {
                  type: "number",
                  minimum: 0,
                  maximum: 1,
                  description: "Confidence level between 0 and 1"
                },
                reasoning: {
                  type: "string",
                  description: "Why this activity is recommended"
                }
              },
              required: ["type", "subject", "notes", "suggestedDueDate", "confidence", "reasoning"]
            },
            minItems: 3,
            maxItems: 3,
            description: "Array of 3 activity recommendations including the primary one"
          }
        },
        required: ["contextSummary", "primaryRecommendation", "recommendations"]
      }
    };
    
    // Create a timeout wrapper for the API call
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Claude API timeout after 8 seconds')), 8000);
    });
    
    const apiCallPromise = fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': anthropicApiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-3-5-haiku-20241022', // Latest Claude 3.5 Haiku (fastest)
        max_tokens: 800, // Reduced for faster response
        tools: [structuredOutputTool],
        tool_choice: { type: "tool", name: "activity_recommendations" },
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      })
    });

    const response = await Promise.race([apiCallPromise, timeoutPromise]);

    if (!response.ok) {
      throw new Error(`Claude API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    // Extract the structured output from the tool use response
    const toolUse = data.content.find((block: any) => block.type === 'tool_use');
    if (!toolUse || !toolUse.input) {
      throw new Error('No structured output received from Claude API');
    }
    
    return toolUse.input as AIActivityRecommendationsResponse;
    
  } catch (error) {
    console.error('Error calling Claude API:', error);
    return generateFallbackRecommendations(context);
  }
}

/**
 * Build a comprehensive prompt for Claude to analyze the deal context
 */
function buildClaudePrompt(context: ActivityRecommendationContext): string {
  const { deal, person, organization, recentActivities, contextualInfo } = context;
  
  return `Sales AI: Analyze this deal and recommend 3 priority activities.

DEAL: "${deal.name}" - ${deal.amount ? `$${deal.amount.toLocaleString()}` : 'No amount'}
CONTACT: ${person ? `${person.first_name} ${person.last_name}` : 'Unknown'}
COMPANY: ${organization?.name || 'Unknown'}
CLOSE DATE: ${deal.expected_close_date || 'Not set'} (${contextualInfo.daysUntilExpectedClose || '?'} days)
STAGE: ${deal.currentWfmStatus?.name || 'Unknown'} (${contextualInfo.stageDuration} days)
VALUE: ${contextualInfo.isHighValue ? 'High' : 'Standard'} | OVERDUE: ${contextualInfo.hasOverdueActivities ? 'Yes' : 'No'}

RECENT ACTIVITIES:
${recentActivities.length > 0 
  ? recentActivities.slice(0, 3).map(a => `${a.type}: ${a.subject} (${a.is_done ? 'Done' : 'Open'})`).join('\n')
  : 'None'
}

Generate 3 specific, actionable activities to advance this deal. Use activity_recommendations tool.`;
}

/**
 * Generate fallback recommendations when AI is unavailable
 */
function generateFallbackRecommendations(
  context: ActivityRecommendationContext
): AIActivityRecommendationsResponse {
  const { deal, person, organization, contextualInfo } = context;
  
  const personName = person ? `${person.first_name} ${person.last_name}` : 'contact';
  const orgName = organization?.name || 'company';
  const dealName = deal.name || 'deal';
  
  // Determine primary activity based on context
  let primaryRec: AIActivityRecommendation;
  
  if (contextualInfo.hasOverdueActivities) {
    primaryRec = {
      type: 'CALL',
      subject: `Urgent follow-up call with ${personName} re: ${dealName}`,
      notes: `Check on overdue items and get deal back on track. Address any blockers.`,
      suggestedDueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0] || '', // Tomorrow
      confidence: 0.9,
      reasoning: 'Deal has overdue activities that need immediate attention to prevent stalling.'
    };
  } else if (contextualInfo.daysUntilExpectedClose && contextualInfo.daysUntilExpectedClose <= 7) {
    primaryRec = {
      type: 'MEETING',
      subject: `Closing meeting with ${personName} for ${dealName}`,
      notes: `Schedule final decision meeting to close the deal. Prepare proposal and contracts.`,
      suggestedDueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] || '', // 3 days
      confidence: 0.85,
      reasoning: 'Deal is approaching close date and needs final push to completion.'
    };
  } else {
    primaryRec = {
      type: 'EMAIL',
      subject: `Follow-up email to ${personName} about ${dealName}`,
      notes: `Send value-focused follow-up email with next steps and timeline.`,
      suggestedDueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] || '', // 2 days
      confidence: 0.75,
      reasoning: 'Regular follow-up to maintain momentum and engagement.'
    };
  }

  const allRecommendations = [
    primaryRec,
    {
      type: 'TASK',
      subject: `Research ${orgName} competitive landscape`,
      notes: `Analyze competitors and prepare differentiation talking points for next conversation.`,
      suggestedDueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] || '',
      confidence: 0.7,
      reasoning: 'Understanding competitive position strengthens sales approach.'
    },
    {
      type: 'CALL',
      subject: `Discovery call with ${personName}`,
      notes: `Deeper dive into requirements, budget, and decision-making process.`,
      suggestedDueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] || '',
      confidence: 0.65,
      reasoning: 'Additional discovery helps qualify the opportunity better.'
    }
  ];

  return {
    recommendations: allRecommendations,
    primaryRecommendation: primaryRec,
    contextSummary: `${dealName} with ${orgName} is ${contextualInfo.isHighValue ? 'a high-value opportunity' : 'an active deal'} ${
      contextualInfo.daysUntilExpectedClose 
        ? `with ${contextualInfo.daysUntilExpectedClose} days until expected close` 
        : 'with no set close date'
    }. ${contextualInfo.hasOverdueActivities ? 'Has overdue activities requiring attention.' : 'Activities are up to date.'}`
  };
} 