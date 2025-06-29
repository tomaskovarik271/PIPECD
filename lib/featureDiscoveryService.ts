/**
 * PipeCD Feature Discovery Service
 * 
 * Provides intelligent, non-intrusive guidance for users discovering
 * innovative CRM features that break traditional patterns.
 */

// ============================================================================
// Type Definitions
// ============================================================================

export type FeatureCategory = 
  | 'crm-innovation'     // Unique CRM features (Schedule Meeting, Deal-to-Lead)
  | 'workflow'           // Complex workflows (WFM, Smart Stickers)
  | 'integration'        // Third-party integrations (Google, etc.)
  | 'power-user'         // Advanced features and shortcuts
  | 'ai-automation';     // AI-powered features

export type Priority = 'critical' | 'high' | 'medium' | 'low';

export type GuidanceType = 
  | 'tooltip'            // Hover tooltip with rich content
  | 'callout'            // Alert-style announcement
  | 'spotlight'          // Overlay highlighting
  | 'tour'               // Multi-step guided tour
  | 'panel';             // Help panel content

export type GuidanceLevel = 'minimal' | 'standard' | 'comprehensive';

export interface FeatureDefinition {
  id: string;
  title: string;
  description: string;
  category: FeatureCategory;
  priority: Priority;
  contexts: string[];              // Page/component contexts where relevant
  type: GuidanceType;
  prerequisites?: string[];        // Required features/setup
  learnMoreUrl?: string;
  videoUrl?: string;
  estimatedTime?: number;          // Minutes to learn
  keywords?: string[];             // For search/filtering
  icon?: string;                   // Icon name for UI
  isNew?: boolean;                 // Recently added feature
  version?: string;                // When feature was introduced
}

export interface UserProgress {
  userId: string;
  discoveredFeatures: Set<string>;    // Features user has seen
  completedTours: Set<string>;        // Tours user has finished
  dismissedCallouts: Set<string>;     // Callouts user has dismissed
  preferredGuidanceLevel: GuidanceLevel;
  lastActiveDate: Date;
  featureUsageCount: Map<string, number>; // How often user uses features
}

export interface ContextualSuggestion {
  feature: FeatureDefinition;
  relevanceScore: number;          // 0-1 based on context and user behavior
  reason: string;                  // Why this suggestion is relevant
  timing: 'immediate' | 'delayed' | 'on-demand';
}

// ============================================================================
// Feature Registry
// ============================================================================

export class FeatureRegistry {
  private features = new Map<string, FeatureDefinition>();
  private contextIndex = new Map<string, Set<string>>(); // context -> feature IDs

  register(feature: FeatureDefinition): void {
    this.features.set(feature.id, feature);
    
    // Index by contexts for fast lookup
    feature.contexts.forEach(context => {
      if (!this.contextIndex.has(context)) {
        this.contextIndex.set(context, new Set());
      }
      this.contextIndex.get(context)!.add(feature.id);
    });
  }

  getFeature(id: string): FeatureDefinition | undefined {
    return this.features.get(id);
  }

  getFeaturesForContext(context: string): FeatureDefinition[] {
    const featureIds = this.contextIndex.get(context) || new Set();
    return Array.from(featureIds)
      .map(id => this.features.get(id))
      .filter(Boolean) as FeatureDefinition[];
  }

  getAllFeatures(): FeatureDefinition[] {
    return Array.from(this.features.values());
  }

  searchFeatures(query: string): FeatureDefinition[] {
    const lowercaseQuery = query.toLowerCase();
    return this.getAllFeatures().filter(feature => 
      feature.title.toLowerCase().includes(lowercaseQuery) ||
      feature.description.toLowerCase().includes(lowercaseQuery) ||
      feature.keywords?.some(keyword => keyword.toLowerCase().includes(lowercaseQuery))
    );
  }
}

// ============================================================================
// User Progress Tracking
// ============================================================================

export class UserProgressTracker {
  private static STORAGE_KEY = 'pipecd-feature-discovery';

  static loadProgress(userId: string): UserProgress {
    try {
      const stored = localStorage.getItem(`${this.STORAGE_KEY}-${userId}`);
      if (stored) {
        const data = JSON.parse(stored);
        return {
          userId,
          discoveredFeatures: new Set(data.discoveredFeatures || []),
          completedTours: new Set(data.completedTours || []),
          dismissedCallouts: new Set(data.dismissedCallouts || []),
          preferredGuidanceLevel: data.preferredGuidanceLevel || 'standard',
          lastActiveDate: new Date(data.lastActiveDate || Date.now()),
          featureUsageCount: new Map(data.featureUsageCount || [])
        };
      }
    } catch (error) {
      console.warn('Failed to load feature discovery progress:', error);
    }

    return {
      userId,
      discoveredFeatures: new Set(),
      completedTours: new Set(),
      dismissedCallouts: new Set(),
      preferredGuidanceLevel: 'standard',
      lastActiveDate: new Date(),
      featureUsageCount: new Map()
    };
  }

  static saveProgress(progress: UserProgress): void {
    try {
      const data = {
        discoveredFeatures: Array.from(progress.discoveredFeatures),
        completedTours: Array.from(progress.completedTours),
        dismissedCallouts: Array.from(progress.dismissedCallouts),
        preferredGuidanceLevel: progress.preferredGuidanceLevel,
        lastActiveDate: progress.lastActiveDate.toISOString(),
        featureUsageCount: Array.from(progress.featureUsageCount.entries())
      };
      localStorage.setItem(`${this.STORAGE_KEY}-${progress.userId}`, JSON.stringify(data));
    } catch (error) {
      console.warn('Failed to save feature discovery progress:', error);
    }
  }

  static markFeatureDiscovered(userId: string, featureId: string): void {
    const progress = this.loadProgress(userId);
    progress.discoveredFeatures.add(featureId);
    progress.lastActiveDate = new Date();
    this.saveProgress(progress);
  }

  static markTourCompleted(userId: string, tourId: string): void {
    const progress = this.loadProgress(userId);
    progress.completedTours.add(tourId);
    progress.lastActiveDate = new Date();
    this.saveProgress(progress);
  }

  static markCalloutDismissed(userId: string, calloutId: string): void {
    const progress = this.loadProgress(userId);
    progress.dismissedCallouts.add(calloutId);
    progress.lastActiveDate = new Date();
    this.saveProgress(progress);
  }

  static incrementFeatureUsage(userId: string, featureId: string): void {
    const progress = this.loadProgress(userId);
    const currentCount = progress.featureUsageCount.get(featureId) || 0;
    progress.featureUsageCount.set(featureId, currentCount + 1);
    progress.lastActiveDate = new Date();
    this.saveProgress(progress);
  }

  static setGuidanceLevel(userId: string, level: GuidanceLevel): void {
    const progress = this.loadProgress(userId);
    progress.preferredGuidanceLevel = level;
    this.saveProgress(progress);
  }
}

// ============================================================================
// Contextual Suggestion Engine
// ============================================================================

export class SuggestionEngine {
  constructor(
    private registry: FeatureRegistry,
    private progressTracker: typeof UserProgressTracker
  ) {}

  getSuggestionsForContext(
    context: string, 
    userId: string, 
    limit: number = 3
  ): ContextualSuggestion[] {
    const progress = this.progressTracker.loadProgress(userId);
    const contextFeatures = this.registry.getFeaturesForContext(context);
    
    const suggestions = contextFeatures
      .map(feature => this.scoreFeature(feature, progress, context))
      .filter(suggestion => suggestion.relevanceScore > 0)
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, limit);

    return suggestions;
  }

  private scoreFeature(
    feature: FeatureDefinition, 
    progress: UserProgress, 
    context: string
  ): ContextualSuggestion {
    let score = 0;
    let reason = '';

    // Skip if user has already discovered this feature
    if (progress.discoveredFeatures.has(feature.id)) {
      return { feature, relevanceScore: 0, reason: 'Already discovered', timing: 'on-demand' };
    }

    // Skip if user has dismissed callouts for this feature
    if (progress.dismissedCallouts.has(feature.id) && feature.type === 'callout') {
      return { feature, relevanceScore: 0, reason: 'User dismissed', timing: 'on-demand' };
    }

    // Base score from priority
    const priorityScores = { critical: 1.0, high: 0.8, medium: 0.6, low: 0.4 };
    score += priorityScores[feature.priority];

    // Boost for new features
    if (feature.isNew) {
      score += 0.3;
      reason = 'New feature available';
    }

    // Boost for features with prerequisites met
    if (feature.prerequisites) {
      const prereqsMet = feature.prerequisites.every(prereq => 
        progress.discoveredFeatures.has(prereq)
      );
      if (prereqsMet) {
        score += 0.2;
        reason = reason || 'Prerequisites met';
      } else {
        score *= 0.3; // Significantly reduce score if prerequisites not met
      }
    }

    // Adjust based on user's guidance preference
    const guidanceLevelMultipliers = { minimal: 0.5, standard: 1.0, comprehensive: 1.5 };
    score *= guidanceLevelMultipliers[progress.preferredGuidanceLevel];

    // Determine timing
    let timing: ContextualSuggestion['timing'] = 'on-demand';
    if (feature.priority === 'critical' || feature.isNew) {
      timing = 'immediate';
    } else if (feature.priority === 'high') {
      timing = 'delayed';
    }

    return {
      feature,
      relevanceScore: Math.min(score, 1.0), // Cap at 1.0
      reason: reason || 'Contextually relevant',
      timing
    };
  }
}

// ============================================================================
// Main Service
// ============================================================================

export class FeatureDiscoveryService {
  private registry = new FeatureRegistry();
  private suggestionEngine = new SuggestionEngine(this.registry, UserProgressTracker);

  // Registry methods
  registerFeature(feature: FeatureDefinition): void {
    this.registry.register(feature);
  }

  getFeature(id: string): FeatureDefinition | undefined {
    return this.registry.getFeature(id);
  }

  // Progress tracking methods
  markFeatureDiscovered(userId: string, featureId: string): void {
    UserProgressTracker.markFeatureDiscovered(userId, featureId);
  }

  markTourCompleted(userId: string, tourId: string): void {
    UserProgressTracker.markTourCompleted(userId, tourId);
  }

  markCalloutDismissed(userId: string, calloutId: string): void {
    UserProgressTracker.markCalloutDismissed(userId, calloutId);
  }

  incrementFeatureUsage(userId: string, featureId: string): void {
    UserProgressTracker.incrementFeatureUsage(userId, featureId);
  }

  // Suggestion methods
  getSuggestionsForContext(context: string, userId: string): ContextualSuggestion[] {
    return this.suggestionEngine.getSuggestionsForContext(context, userId);
  }

  // Utility methods
  shouldShowGuidance(userId: string, featureId: string): boolean {
    const progress = UserProgressTracker.loadProgress(userId);
    const feature = this.registry.getFeature(featureId);
    
    if (!feature) return false;
    if (progress.discoveredFeatures.has(featureId)) return false;
    if (progress.dismissedCallouts.has(featureId) && feature.type === 'callout') return false;
    
    // Check prerequisites
    if (feature.prerequisites) {
      return feature.prerequisites.every(prereq => 
        progress.discoveredFeatures.has(prereq)
      );
    }
    
    return true;
  }

  getUserProgress(userId: string): UserProgress {
    return UserProgressTracker.loadProgress(userId);
  }

  setUserGuidanceLevel(userId: string, level: GuidanceLevel): void {
    UserProgressTracker.setGuidanceLevel(userId, level);
  }

  searchFeatures(query: string): FeatureDefinition[] {
    return this.registry.searchFeatures(query);
  }
}

// ============================================================================
// Feature Definitions
// ============================================================================

export const FEATURE_DEFINITIONS: FeatureDefinition[] = [
  {
    id: 'schedule-meeting-deal',
    title: 'Schedule Meeting from Deal',
    description: 'Schedule meetings directly from deal pages with automatic Google Calendar integration and deal context linking.',
    category: 'crm-innovation',
    priority: 'high',
    contexts: ['deal-detail'],
    type: 'tooltip',
    keywords: ['meeting', 'calendar', 'schedule', 'google'],
    icon: 'Calendar',
    isNew: true,
    estimatedTime: 2
  },
  {
    id: 'deal-to-lead-conversion',
    title: 'Deal to Lead Conversion',
    description: 'Convert deals back to leads when they need re-qualification or additional nurturing.',
    category: 'crm-innovation',
    priority: 'high',
    contexts: ['deals-table', 'deal-detail'],
    type: 'callout',
    keywords: ['convert', 'lead', 'qualification', 'nurture'],
    icon: 'ArrowBack',
    isNew: true,
    estimatedTime: 3
  },
  {
    id: 'smart-stickers',
    title: 'Smart Stickers System',
    description: 'Visual note-taking system with intelligent organization and contextual suggestions.',
    category: 'workflow',
    priority: 'medium',
    contexts: ['deal-detail', 'notes'],
    type: 'tour',
    keywords: ['notes', 'stickers', 'visual', 'organization'],
    icon: 'Note',
    estimatedTime: 5
  },
  {
    id: 'google-workspace-integration',
    title: 'Google Workspace Integration',
    description: 'Seamless integration with Gmail, Google Drive, and Google Calendar for a unified workflow.',
    category: 'integration',
    priority: 'critical',
    contexts: ['google-integration', 'deal-detail', 'emails'],
    type: 'callout',
    keywords: ['google', 'gmail', 'drive', 'calendar', 'integration'],
    icon: 'ExternalLink',
    estimatedTime: 10
  },
  {
    id: 'ai-agent',
    title: 'AI-Powered Assistant',
    description: 'Intelligent assistant for CRM tasks, data analysis, and workflow automation.',
    category: 'ai-automation',
    priority: 'high',
    contexts: ['agent-v2', 'navigation'],
    type: 'tour',
    keywords: ['ai', 'assistant', 'automation', 'analysis'],
    icon: 'Bot',
    isNew: true,
    estimatedTime: 8
  },
  {
    id: 'email-to-task',
    title: 'Email to Task Conversion',
    description: 'Convert emails into actionable tasks with AI-powered content analysis.',
    category: 'ai-automation',
    priority: 'medium',
    contexts: ['emails', 'deal-detail'],
    type: 'tooltip',
    prerequisites: ['google-workspace-integration'],
    keywords: ['email', 'task', 'convert', 'ai'],
    icon: 'Mail',
    estimatedTime: 3
  },
  {
    id: 'wfm-integration',
    title: 'Workflow Management Integration',
    description: 'Advanced project management capabilities integrated directly into your CRM workflow.',
    category: 'workflow',
    priority: 'medium',
    contexts: ['deal-detail', 'projects', 'wfm'],
    type: 'tour',
    keywords: ['workflow', 'project', 'management', 'kanban'],
    icon: 'Kanban',
    estimatedTime: 10
  },
  {
    id: 'calendar-native-crm',
    title: 'Calendar-Native CRM Concept',
    description: 'Revolutionary approach using Google Calendar as the primary interface with CRM intelligence overlay.',
    category: 'crm-innovation',
    priority: 'critical',
    contexts: ['dashboard', 'calendar'],
    type: 'spotlight',
    keywords: ['calendar', 'native', 'revolutionary', 'concept'],
    icon: 'Calendar',
    isNew: true,
    estimatedTime: 15
  }
];

// ============================================================================
// Singleton Instance
// ============================================================================

export const featureDiscoveryService = new FeatureDiscoveryService();

// Register all predefined features
FEATURE_DEFINITIONS.forEach(feature => {
  featureDiscoveryService.registerFeature(feature);
}); 