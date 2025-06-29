import { createClient } from '@supabase/supabase-js';

// Types and Interfaces
export interface FeatureHint {
  id: string;
  title: string;
  description: string;
  detailedDescription?: string;
  context: string[];
  priority: 'critical' | 'high' | 'medium' | 'low';
  type: 'tooltip' | 'callout' | 'spotlight' | 'badge';
  category: 'innovative' | 'standard' | 'advanced';
  prerequisites?: string[];
  demoUrl?: string;
  docsUrl?: string;
  icon?: string;
  placement?: 'top' | 'bottom' | 'left' | 'right';
}

export interface UserDiscoveryState {
  discoveredFeatures: Set<string>;
  dismissedFeatures: Set<string>;
  featureUsageCount: Map<string, number>;
  lastSeenVersion: string;
  discoveryPreferences: {
    showTooltips: boolean;
    showCallouts: boolean;
    showSpotlights: boolean;
    autoAdvance: boolean;
  };
}

export interface FeatureDiscoveryEvent {
  type: 'discovered' | 'used' | 'dismissed' | 'completed';
  featureId: string;
  timestamp: Date;
  context?: string;
}

// Feature Definitions
const FEATURE_DEFINITIONS: FeatureHint[] = [
  {
    id: 'schedule-meeting-deal',
    title: 'Calendar-Native Meeting Scheduling',
    description: 'Schedule meetings directly from deals with automatic Google Calendar integration',
    detailedDescription: 'Click to schedule meetings that automatically link to deal context, sync with Google Calendar, and create activity records. No need to switch between apps!',
    context: ['deal-detail', 'contact-detail', 'organization-detail'],
    priority: 'high',
    type: 'tooltip',
    category: 'innovative',
    icon: 'calendar',
    placement: 'top'
  },
  {
    id: 'deal-to-lead-conversion',
    title: 'Reverse Pipeline Flow',
    description: 'Convert deals back to leads when they need re-qualification',
    detailedDescription: 'Sometimes deals need to go back to the qualification stage. Use this feature to convert deals back to leads while preserving all history and context.',
    context: ['deals-table', 'deal-detail'],
    priority: 'high',
    type: 'tooltip',
    category: 'innovative',
    icon: 'repeat',
    placement: 'top'
  },
  {
    id: 'email-to-task-conversion',
    title: 'AI-Powered Task Generation',
    description: 'Convert emails to tasks with AI assistance',
    detailedDescription: 'Transform email conversations into actionable tasks with AI-generated content, due dates, and context linking.',
    context: ['deal-emails', 'email-panel'],
    priority: 'high',
    type: 'tooltip',
    category: 'innovative',
    icon: 'magic',
    placement: 'right'
  },
  {
    id: 'smart-stickers',
    title: 'Visual Note Organization',
    description: 'Create visual, interactive notes with smart stickers',
    detailedDescription: 'Organize thoughts and action items visually with color-coded, draggable stickers that can link to deals, contacts, and activities.',
    context: ['deal-notes', 'sticker-board'],
    priority: 'medium',
    type: 'tooltip',
    category: 'advanced',
    icon: 'sticky-note',
    placement: 'top'
  },
  {
    id: 'wfm-process-integration',
    title: 'Embedded Project Management',
    description: 'Manage deal workflows with built-in project management',
    detailedDescription: 'Every deal automatically gets a project workflow with stages, tasks, and progress tracking. No external PM tools needed.',
    context: ['deal-detail', 'wfm-board'],
    priority: 'medium',
    type: 'callout',
    category: 'innovative',
    icon: 'workflow',
    placement: 'bottom'
  },
  {
    id: 'google-drive-integration',
    title: 'Native Document Management',
    description: 'Access and attach Google Drive files directly from deals',
    detailedDescription: 'Browse your Google Drive, search files, and attach documents to deals without leaving PipeCD. Full integration with shared drives.',
    context: ['deal-documents', 'document-browser'],
    priority: 'medium',
    type: 'tooltip',
    category: 'advanced',
    icon: 'folder',
    placement: 'left'
  },
  {
    id: 'multi-currency-support',
    title: 'Global Currency Management',
    description: 'Handle deals in multiple currencies with automatic conversion',
    detailedDescription: 'Set deal amounts in any currency with real-time exchange rates. Perfect for international business operations.',
    context: ['deal-create', 'deal-edit', 'deal-detail'],
    priority: 'low',
    type: 'tooltip',
    category: 'standard',
    icon: 'dollar-sign',
    placement: 'top'
  },
  {
    id: 'ai-agent-assistant',
    title: 'AI Business Assistant',
    description: 'Get AI-powered insights and automation for your CRM data',
    detailedDescription: 'Ask questions about your pipeline, get insights, and automate routine tasks with our advanced AI agent.',
    context: ['agent-v2', 'sidebar'],
    priority: 'critical',
    type: 'spotlight',
    category: 'innovative',
    icon: 'robot',
    placement: 'center'
  }
];

// Local Storage Keys
const STORAGE_KEYS = {
  DISCOVERED_FEATURES: 'pipecd_discovered_features',
  DISMISSED_FEATURES: 'pipecd_dismissed_features',
  FEATURE_USAGE: 'pipecd_feature_usage',
  DISCOVERY_PREFERENCES: 'pipecd_discovery_preferences',
  LAST_SEEN_VERSION: 'pipecd_last_seen_version'
};

// Default preferences
const DEFAULT_PREFERENCES = {
  showTooltips: true,
  showCallouts: true,
  showSpotlights: true,
  autoAdvance: false
};

class FeatureDiscoveryService {
  private static instance: FeatureDiscoveryService;
  private features: Map<string, FeatureHint> = new Map();
  private userState: UserDiscoveryState;
  private listeners: ((event: FeatureDiscoveryEvent) => void)[] = [];

  private constructor() {
    // Initialize feature definitions
    FEATURE_DEFINITIONS.forEach(feature => {
      this.features.set(feature.id, feature);
    });

    // Load user state from localStorage
    this.userState = this.loadUserState();
  }

  public static getInstance(): FeatureDiscoveryService {
    if (!FeatureDiscoveryService.instance) {
      FeatureDiscoveryService.instance = new FeatureDiscoveryService();
    }
    return FeatureDiscoveryService.instance;
  }

  // User State Management
  private loadUserState(): UserDiscoveryState {
    try {
      const discovered = JSON.parse(localStorage.getItem(STORAGE_KEYS.DISCOVERED_FEATURES) || '[]');
      const dismissed = JSON.parse(localStorage.getItem(STORAGE_KEYS.DISMISSED_FEATURES) || '[]');
      const usage = JSON.parse(localStorage.getItem(STORAGE_KEYS.FEATURE_USAGE) || '{}');
      const preferences = JSON.parse(localStorage.getItem(STORAGE_KEYS.DISCOVERY_PREFERENCES) || 'null') || DEFAULT_PREFERENCES;
      const lastSeenVersion = localStorage.getItem(STORAGE_KEYS.LAST_SEEN_VERSION) || '1.0.0';

      return {
        discoveredFeatures: new Set(discovered),
        dismissedFeatures: new Set(dismissed),
        featureUsageCount: new Map(Object.entries(usage).map(([k, v]) => [k, Number(v)])),
        lastSeenVersion,
        discoveryPreferences: preferences
      };
    } catch (error) {
      console.warn('Failed to load feature discovery state:', error);
      return {
        discoveredFeatures: new Set(),
        dismissedFeatures: new Set(),
        featureUsageCount: new Map(),
        lastSeenVersion: '1.0.0',
        discoveryPreferences: DEFAULT_PREFERENCES
      };
    }
  }

  private saveUserState(): void {
    try {
      localStorage.setItem(STORAGE_KEYS.DISCOVERED_FEATURES, JSON.stringify([...this.userState.discoveredFeatures]));
      localStorage.setItem(STORAGE_KEYS.DISMISSED_FEATURES, JSON.stringify([...this.userState.dismissedFeatures]));
      localStorage.setItem(STORAGE_KEYS.FEATURE_USAGE, JSON.stringify(Object.fromEntries(this.userState.featureUsageCount)));
      localStorage.setItem(STORAGE_KEYS.DISCOVERY_PREFERENCES, JSON.stringify(this.userState.discoveryPreferences));
      localStorage.setItem(STORAGE_KEYS.LAST_SEEN_VERSION, this.userState.lastSeenVersion);
    } catch (error) {
      console.warn('Failed to save feature discovery state:', error);
    }
  }

  // Feature Management
  public getFeature(featureId: string): FeatureHint | undefined {
    return this.features.get(featureId);
  }

  public getAllFeatures(): FeatureHint[] {
    return Array.from(this.features.values());
  }

  public getFeaturesForContext(context: string): FeatureHint[] {
    return Array.from(this.features.values())
      .filter(feature => feature.context.includes(context))
      .sort((a, b) => {
        const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      });
  }

  public getUndiscoveredFeaturesForContext(context: string): FeatureHint[] {
    return this.getFeaturesForContext(context)
      .filter(feature => !this.isFeatureDiscovered(feature.id) && !this.isFeatureDismissed(feature.id));
  }

  // Discovery State Queries
  public isFeatureDiscovered(featureId: string): boolean {
    return this.userState.discoveredFeatures.has(featureId);
  }

  public isFeatureDismissed(featureId: string): boolean {
    return this.userState.dismissedFeatures.has(featureId);
  }

  public getFeatureUsageCount(featureId: string): number {
    return this.userState.featureUsageCount.get(featureId) || 0;
  }

  public shouldShowGuidance(featureId: string, guidanceType?: 'tooltip' | 'callout' | 'spotlight'): boolean {
    // Don't show if feature is dismissed
    if (this.isFeatureDismissed(featureId)) {
      return false;
    }

    // Don't show if feature is already well-used (>3 times)
    if (this.getFeatureUsageCount(featureId) > 3) {
      return false;
    }

    // Check user preferences
    const preferences = this.userState.discoveryPreferences;
    if (guidanceType === 'tooltip' && !preferences.showTooltips) return false;
    if (guidanceType === 'callout' && !preferences.showCallouts) return false;
    if (guidanceType === 'spotlight' && !preferences.showSpotlights) return false;

    return true;
  }

  // Discovery Actions
  public markFeatureDiscovered(featureId: string, context?: string): void {
    if (!this.userState.discoveredFeatures.has(featureId)) {
      this.userState.discoveredFeatures.add(featureId);
      this.saveUserState();
      this.emitEvent({
        type: 'discovered',
        featureId,
        timestamp: new Date(),
        context
      });
    }
  }

  public markFeatureUsed(featureId: string, context?: string): void {
    const currentCount = this.userState.featureUsageCount.get(featureId) || 0;
    this.userState.featureUsageCount.set(featureId, currentCount + 1);
    
    // Also mark as discovered if not already
    this.markFeatureDiscovered(featureId, context);
    
    this.saveUserState();
    this.emitEvent({
      type: 'used',
      featureId,
      timestamp: new Date(),
      context
    });
  }

  public dismissFeature(featureId: string, context?: string): void {
    this.userState.dismissedFeatures.add(featureId);
    this.saveUserState();
    this.emitEvent({
      type: 'dismissed',
      featureId,
      timestamp: new Date(),
      context
    });
  }

  public resetFeatureDiscovery(featureId?: string): void {
    if (featureId) {
      this.userState.discoveredFeatures.delete(featureId);
      this.userState.dismissedFeatures.delete(featureId);
      this.userState.featureUsageCount.delete(featureId);
    } else {
      this.userState.discoveredFeatures.clear();
      this.userState.dismissedFeatures.clear();
      this.userState.featureUsageCount.clear();
    }
    this.saveUserState();
  }

  // Preferences Management
  public getPreferences() {
    return { ...this.userState.discoveryPreferences };
  }

  public updatePreferences(preferences: Partial<typeof DEFAULT_PREFERENCES>): void {
    this.userState.discoveryPreferences = {
      ...this.userState.discoveryPreferences,
      ...preferences
    };
    this.saveUserState();
  }

  // Analytics and Insights
  public getDiscoveryStats() {
    const totalFeatures = this.features.size;
    const discoveredCount = this.userState.discoveredFeatures.size;
    const dismissedCount = this.userState.dismissedFeatures.size;
    
    const categoryStats = {
      innovative: { total: 0, discovered: 0 },
      advanced: { total: 0, discovered: 0 },
      standard: { total: 0, discovered: 0 }
    };

    this.features.forEach(feature => {
      categoryStats[feature.category].total++;
      if (this.isFeatureDiscovered(feature.id)) {
        categoryStats[feature.category].discovered++;
      }
    });

    return {
      totalFeatures,
      discoveredCount,
      dismissedCount,
      discoveryRate: totalFeatures > 0 ? (discoveredCount / totalFeatures) * 100 : 0,
      categoryStats,
      mostUsedFeatures: Array.from(this.userState.featureUsageCount.entries())
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([featureId, count]) => ({
          feature: this.getFeature(featureId),
          usageCount: count
        }))
    };
  }

  // Event System
  public addEventListener(listener: (event: FeatureDiscoveryEvent) => void): void {
    this.listeners.push(listener);
  }

  public removeEventListener(listener: (event: FeatureDiscoveryEvent) => void): void {
    const index = this.listeners.indexOf(listener);
    if (index > -1) {
      this.listeners.splice(index, 1);
    }
  }

  private emitEvent(event: FeatureDiscoveryEvent): void {
    this.listeners.forEach(listener => {
      try {
        listener(event);
      } catch (error) {
        console.warn('Error in feature discovery event listener:', error);
      }
    });
  }

  // Utility Methods
  public getNextFeatureToDiscover(context: string): FeatureHint | null {
    const undiscovered = this.getUndiscoveredFeaturesForContext(context);
    
    // Prioritize by category and priority
    const innovative = undiscovered.filter(f => f.category === 'innovative');
    if (innovative.length > 0) return innovative[0];
    
    const advanced = undiscovered.filter(f => f.category === 'advanced');
    if (advanced.length > 0) return advanced[0];
    
    return undiscovered[0] || null;
  }

  public hasPrerequisites(featureId: string): boolean {
    const feature = this.getFeature(featureId);
    if (!feature?.prerequisites?.length) return true;
    
    return feature.prerequisites.every(prereqId => 
      this.isFeatureDiscovered(prereqId) && this.getFeatureUsageCount(prereqId) > 0
    );
  }
}

// Export singleton instance
export const featureDiscoveryService = FeatureDiscoveryService.getInstance();

// Export types for use in components
export type { FeatureDiscoveryEvent, UserDiscoveryState }; 