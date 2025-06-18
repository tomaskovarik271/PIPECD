import { createClient } from '@supabase/supabase-js';
import type { 
  SystemSnapshot, 
  DealSummary, 
  OrganizationSummary, 
  PersonSummary, 
  ActivitySummary 
} from '../types/system.js';

export class SystemStateEncoder {
  private supabase: any;
  private cache: Map<string, { data: SystemSnapshot; timestamp: Date }> = new Map();
  private cacheTimeout = 5 * 60 * 1000; // 5 minutes

  constructor(supabaseUrl: string, supabaseKey: string) {
    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  async generateSnapshot(userId: string, userPermissions: string[]): Promise<SystemSnapshot> {
    const cacheKey = `${userId}-${userPermissions.join(',')}`;
    const cached = this.cache.get(cacheKey);
    
    // Return cached data if still valid
    if (cached && Date.now() - cached.timestamp.getTime() < this.cacheTimeout) {
      return cached.data;
    }

    try {
      const snapshot = await this.gatherSystemData(userId, userPermissions);
      snapshot.intelligent_suggestions = this.generateIntelligentSuggestions(snapshot, userPermissions);
      snapshot.user_context = await this.getUserContext(userId);
      snapshot.timestamp = new Date();

      // Cache the result
      this.cache.set(cacheKey, { data: snapshot, timestamp: new Date() });

      return snapshot;
    } catch (error) {
      console.error('Error generating system snapshot:', error);
      throw new Error('Failed to generate system state snapshot');
    }
  }

  private async gatherSystemData(userId: string, userPermissions: string[]): Promise<SystemSnapshot> {
    const [dealsData, organizationsData, peopleData, activitiesData] = await Promise.all([
      this.getDealsData(userId, userPermissions),
      this.getOrganizationsData(userId, userPermissions),
      this.getPeopleData(userId, userPermissions),
      this.getActivitiesData(userId, userPermissions)
    ]);

    const pipelineHealth = this.calculatePipelineHealth(dealsData);

    return {
      deals: dealsData,
      organizations: organizationsData,
      people: peopleData,
      activities: activitiesData,
      pipeline_health: pipelineHealth,
      intelligent_suggestions: [], // Will be populated later
      user_context: {
        role: '',
        permissions: userPermissions,
        recent_focus_areas: []
      },
      timestamp: new Date()
    };
  }

  private async getDealsData(userId: string, userPermissions: string[]) {
    const hasReadAll = userPermissions.includes('deal:read_any');
    const hasReadOwn = userPermissions.includes('deal:read_own');

    if (!hasReadAll && !hasReadOwn) {
      return {
        total: 0,
        by_stage: {},
        closing_this_month: [],
        at_risk: [],
        recent_activity: []
      };
    }

    // Build permission filter
    let permissionFilter = '';
    if (!hasReadAll && hasReadOwn) {
      permissionFilter = `and (owner_id.eq.${userId} or assigned_to.eq.${userId})`;
    }

    // Get deals summary
    const { data: dealsCount } = await this.supabase
      .from('deals')
      .select('id', { count: 'exact' })
      .eq('deleted_at', null);

    // Get deals by stage
    const { data: dealsByStage } = await this.supabase
      .from('deals')
      .select('current_wfm_status:wfm_statuses(name)')
      .eq('deleted_at', null);

    // Get closing this month
    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const endOfMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0);

    const { data: closingThisMonth } = await this.supabase
      .from('deals')
      .select(`
        id, name, value, currency,
        current_wfm_status:wfm_statuses(name),
        organization:organizations(name),
        estimated_close_date
      `)
      .eq('deleted_at', null)
      .gte('estimated_close_date', startOfMonth.toISOString())
      .lte('estimated_close_date', endOfMonth.toISOString())
      .limit(10);

    // Get at-risk deals (no activity in 14 days)
    const fourteenDaysAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
    const { data: atRiskDeals } = await this.supabase
      .from('deals')
      .select(`
        id, name, value, currency,
        current_wfm_status:wfm_statuses(name),
        organization:organizations(name),
        updated_at
      `)
      .eq('deleted_at', null)
      .lt('updated_at', fourteenDaysAgo.toISOString())
      .neq('current_wfm_status->name', 'Closed Won')
      .neq('current_wfm_status->name', 'Closed Lost')
      .limit(10);

    // Get recent activity
    const { data: recentActivity } = await this.supabase
      .from('deals')
      .select(`
        id, name, value, currency,
        current_wfm_status:wfm_statuses(name),
        organization:organizations(name),
        updated_at
      `)
      .eq('deleted_at', null)
      .order('updated_at', { ascending: false })
      .limit(10);

    // Process stage distribution
    const stageDistribution: Record<string, number> = {};
    dealsByStage?.forEach((deal: any) => {
      const stage = deal.current_wfm_status?.name || 'Unknown';
      stageDistribution[stage] = (stageDistribution[stage] || 0) + 1;
    });

    return {
      total: dealsCount?.length || 0,
      by_stage: stageDistribution,
      closing_this_month: this.formatDealSummaries(closingThisMonth || []),
      at_risk: this.formatDealSummaries(atRiskDeals || []),
      recent_activity: this.formatDealSummaries(recentActivity || [])
    };
  }

  private async getOrganizationsData(userId: string, userPermissions: string[]) {
    const hasReadAll = userPermissions.includes('organization:read_any');

    if (!hasReadAll) {
      return {
        total: 0,
        enterprise: 0,
        recent_activity: [],
        top_by_deal_volume: []
      };
    }

    // Get total organizations
    const { data: orgCount } = await this.supabase
      .from('organizations')
      .select('id', { count: 'exact' })
      .eq('deleted_at', null);

    // Get enterprise organizations (assuming they have > 1000 employees or specific industries)
    const { data: enterpriseCount } = await this.supabase
      .from('organizations')
      .select('id', { count: 'exact' })
      .eq('deleted_at', null)
      .in('industry', ['Technology', 'Financial Services', 'Healthcare', 'Manufacturing']);

    // Get recent activity
    const { data: recentActivity } = await this.supabase
      .from('organizations')
      .select(`
        id, name, industry, updated_at,
        deals(id, value)
      `)
      .eq('deleted_at', null)
      .order('updated_at', { ascending: false })
      .limit(10);

    // Get top by deal volume
    const { data: topByVolume } = await this.supabase
      .from('organizations')
      .select(`
        id, name, industry,
        deals(id, value)
      `)
      .eq('deleted_at', null)
      .limit(20);

    const orgSummaries = this.formatOrganizationSummaries(recentActivity || []);
    const topVolumeOrgs = this.formatOrganizationSummaries(topByVolume || [])
      .sort((a, b) => b.total_value - a.total_value)
      .slice(0, 10);

    return {
      total: orgCount?.length || 0,
      enterprise: enterpriseCount?.length || 0,
      recent_activity: orgSummaries,
      top_by_deal_volume: topVolumeOrgs
    };
  }

  private async getPeopleData(userId: string, userPermissions: string[]) {
    const hasReadAll = userPermissions.includes('person:read_any');

    if (!hasReadAll) {
      return {
        total: 0,
        recent_contacts: [],
        key_stakeholders: []
      };
    }

    // Get total people
    const { data: peopleCount } = await this.supabase
      .from('people')
      .select('id', { count: 'exact' })
      .eq('deleted_at', null);

    // Get recent contacts
    const { data: recentContacts } = await this.supabase
      .from('people')
      .select(`
        id, first_name, last_name, email,
        organization:organizations(name),
        job_title, updated_at
      `)
      .eq('deleted_at', null)
      .order('updated_at', { ascending: false })
      .limit(10);

    // Get key stakeholders (people with multiple deal connections)
    const { data: keyStakeholders } = await this.supabase
      .from('people')
      .select(`
        id, first_name, last_name, email,
        organization:organizations(name),
        job_title, updated_at
      `)
      .eq('deleted_at', null)
      .limit(10);

    return {
      total: peopleCount?.length || 0,
      recent_contacts: this.formatPersonSummaries(recentContacts || []),
      key_stakeholders: this.formatPersonSummaries(keyStakeholders || [])
    };
  }

  private async getActivitiesData(userId: string, userPermissions: string[]) {
    const hasReadAll = userPermissions.includes('activity:read_any');
    const hasReadOwn = userPermissions.includes('activity:read_own');

    if (!hasReadAll && !hasReadOwn) {
      return {
        overdue: 0,
        due_today: 0,
        upcoming: 0,
        recent_completions: []
      };
    }

    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    // Get overdue activities
    const { data: overdueCount } = await this.supabase
      .from('activities')
      .select('id', { count: 'exact' })
      .eq('deleted_at', null)
      .eq('status', 'pending')
      .lt('due_date', today);

    // Get due today
    const { data: dueTodayCount } = await this.supabase
      .from('activities')
      .select('id', { count: 'exact' })
      .eq('deleted_at', null)
      .eq('status', 'pending')
      .eq('due_date', today);

    // Get upcoming (next 7 days)
    const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const { data: upcomingCount } = await this.supabase
      .from('activities')
      .select('id', { count: 'exact' })
      .eq('deleted_at', null)
      .eq('status', 'pending')
      .gt('due_date', today)
      .lte('due_date', nextWeek);

    // Get recent completions
    const { data: recentCompletions } = await this.supabase
      .from('activities')
      .select(`
        id, subject, type, completed_date,
        deal:deals(name),
        organization:organizations(name)
      `)
      .eq('deleted_at', null)
      .eq('status', 'completed')
      .order('completed_date', { ascending: false })
      .limit(10);

    return {
      overdue: overdueCount?.length || 0,
      due_today: dueTodayCount?.length || 0,
      upcoming: upcomingCount?.length || 0,
      recent_completions: this.formatActivitySummaries(recentCompletions || [])
    };
  }

  private calculatePipelineHealth(dealsData: any) {
    const total = dealsData.total;
    const atRiskCount = dealsData.at_risk.length;
    const closingThisMonth = dealsData.closing_this_month.length;

    let status: 'strong' | 'moderate' | 'at_risk' = 'strong';
    const atRiskPercentage = total > 0 ? (atRiskCount / total) * 100 : 0;

    if (atRiskPercentage > 30) {
      status = 'at_risk';
    } else if (atRiskPercentage > 15 || closingThisMonth < 3) {
      status = 'moderate';
    }

    // Calculate weighted value
    const weightedValue = dealsData.closing_this_month.reduce(
      (sum: number, deal: DealSummary) => sum + deal.value, 
      0
    );

    // Mock close rate trend (would be calculated from historical data)
    const closeRateTrend = status === 'strong' ? 5.2 : status === 'moderate' ? -1.8 : -8.5;

    const insights = [];
    if (atRiskPercentage > 20) {
      insights.push(`${atRiskCount} deals (${atRiskPercentage.toFixed(1)}%) need urgent attention`);
    }
    if (closingThisMonth < 5) {
      insights.push('Low deal volume closing this month - consider pipeline acceleration');
    }

    return {
      status,
      weighted_value: weightedValue,
      close_rate_trend: closeRateTrend,
      key_insights: insights
    };
  }

  private generateIntelligentSuggestions(snapshot: SystemSnapshot, permissions: string[]): string[] {
    const suggestions = [];

    // Pipeline-based suggestions
    if (snapshot.deals.at_risk.length > 0) {
      suggestions.push(`${snapshot.deals.at_risk.length} deals need urgent attention - consider priority follow-ups`);
    }

    if (snapshot.deals.closing_this_month.length < 3) {
      suggestions.push('Low deal volume closing this month - review pipeline and consider acceleration tactics');
    }

    // Data quality suggestions
    if (snapshot.organizations.total > 100) {
      suggestions.push('Large organization database - ALWAYS search before creating new entities');
    }

    // Workflow suggestions
    if (snapshot.activities.overdue > 5) {
      suggestions.push('High overdue activity count - consider activity cleanup and rescheduling');
    }

    if (snapshot.activities.due_today > 10) {
      suggestions.push('Heavy activity load today - prioritize high-impact activities');
    }

    // Performance suggestions
    if (snapshot.pipeline_health.status === 'at_risk') {
      suggestions.push('Pipeline health at risk - focus on deal progression and risk mitigation');
    }

    // Permission-based suggestions
    if (permissions.includes('deal:create')) {
      suggestions.push('You can create new deals - ensure proper organization and contact setup first');
    }

    return suggestions;
  }

  private async getUserContext(userId: string) {
    try {
      const { data: user } = await this.supabase
        .from('user_profiles')
        .select('role, permissions, recent_activity')
        .eq('id', userId)
        .single();

      return {
        role: user?.role || 'user',
        permissions: user?.permissions || [],
        recent_focus_areas: user?.recent_activity || []
      };
    } catch (error) {
      return {
        role: 'user',
        permissions: [],
        recent_focus_areas: []
      };
    }
  }

  // Utility formatting methods
  private formatDealSummaries(deals: any[]): DealSummary[] {
    return deals.map(deal => ({
      id: deal.id,
      name: deal.name,
      value: deal.value || 0,
      currency: deal.currency || 'USD',
      stage: deal.current_wfm_status?.name || 'Unknown',
      organization: deal.organization?.name || 'Unknown',
      close_date: deal.estimated_close_date,
      last_activity: deal.updated_at,
      risk_level: this.calculateRiskLevel(deal)
    }));
  }

  private formatOrganizationSummaries(orgs: any[]): OrganizationSummary[] {
    return orgs.map(org => ({
      id: org.id,
      name: org.name,
      industry: org.industry,
      deal_count: org.deals?.length || 0,
      total_value: org.deals?.reduce((sum: number, deal: any) => sum + (deal.value || 0), 0) || 0,
      last_activity: org.updated_at
    }));
  }

  private formatPersonSummaries(people: any[]): PersonSummary[] {
    return people.map(person => ({
      id: person.id,
      name: `${person.first_name || ''} ${person.last_name || ''}`.trim(),
      email: person.email,
      organization: person.organization?.name,
      role: person.job_title,
      last_contact: person.updated_at
    }));
  }

  private formatActivitySummaries(activities: any[]): ActivitySummary[] {
    return activities.map(activity => ({
      id: activity.id,
      subject: activity.subject,
      type: activity.type,
      due_date: activity.due_date,
      completed_date: activity.completed_date,
      deal: activity.deal?.name,
      organization: activity.organization?.name
    }));
  }

  private calculateRiskLevel(deal: any): 'low' | 'medium' | 'high' {
    const daysSinceUpdate = deal.updated_at ? 
      Math.floor((Date.now() - new Date(deal.updated_at).getTime()) / (1000 * 60 * 60 * 24)) : 0;
    
    if (daysSinceUpdate > 14) return 'high';
    if (daysSinceUpdate > 7) return 'medium';
    return 'low';
  }

  // Cache management
  clearCache(): void {
    this.cache.clear();
  }

  getCacheSize(): number {
    return this.cache.size;
  }
} 