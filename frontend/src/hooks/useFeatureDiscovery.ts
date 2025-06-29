import { useEffect, useState, useCallback } from 'react';
import { featureDiscoveryService, FeatureHint, FeatureDiscoveryEvent, UserDiscoveryState } from '../../../lib/services/featureDiscoveryService';

export interface UseFeatureDiscoveryReturn {
  // Feature queries
  getFeature: (featureId: string) => FeatureHint | undefined;
  getAllFeatures: () => FeatureHint[];
  getFeaturesForContext: (context: string) => FeatureHint[];
  getUndiscoveredFeaturesForContext: (context: string) => FeatureHint[];
  
  // Discovery state
  isFeatureDiscovered: (featureId: string) => boolean;
  isFeatureDismissed: (featureId: string) => boolean;
  getFeatureUsageCount: (featureId: string) => number;
  shouldShowGuidance: (featureId: string, guidanceType?: 'tooltip' | 'callout' | 'spotlight') => boolean;
  
  // Discovery actions
  markFeatureDiscovered: (featureId: string, context?: string) => void;
  markFeatureUsed: (featureId: string, context?: string) => void;
  dismissFeature: (featureId: string, context?: string) => void;
  resetFeatureDiscovery: (featureId?: string) => void;
  
  // Preferences
  preferences: UserDiscoveryState['discoveryPreferences'];
  updatePreferences: (preferences: Partial<UserDiscoveryState['discoveryPreferences']>) => void;
  
  // Analytics
  discoveryStats: ReturnType<typeof featureDiscoveryService.getDiscoveryStats>;
  
  // Utilities
  getNextFeatureToDiscover: (context: string) => FeatureHint | null;
  hasPrerequisites: (featureId: string) => boolean;
}

export const useFeatureDiscovery = (): UseFeatureDiscoveryReturn => {
  const [preferences, setPreferences] = useState(featureDiscoveryService.getPreferences());
  const [discoveryStats, setDiscoveryStats] = useState(featureDiscoveryService.getDiscoveryStats());
  const [, forceUpdate] = useState({});

  // Force re-render when discovery state changes
  const triggerUpdate = useCallback(() => {
    setPreferences(featureDiscoveryService.getPreferences());
    setDiscoveryStats(featureDiscoveryService.getDiscoveryStats());
    forceUpdate({});
  }, []);

  useEffect(() => {
    // Listen for discovery events to update state
    const handleDiscoveryEvent = (event: FeatureDiscoveryEvent) => {
      triggerUpdate();
    };

    featureDiscoveryService.addEventListener(handleDiscoveryEvent);
    
    return () => {
      featureDiscoveryService.removeEventListener(handleDiscoveryEvent);
    };
  }, [triggerUpdate]);

  // Wrapped methods that trigger updates
  const markFeatureDiscovered = useCallback((featureId: string, context?: string) => {
    featureDiscoveryService.markFeatureDiscovered(featureId, context);
  }, []);

  const markFeatureUsed = useCallback((featureId: string, context?: string) => {
    featureDiscoveryService.markFeatureUsed(featureId, context);
  }, []);

  const dismissFeature = useCallback((featureId: string, context?: string) => {
    featureDiscoveryService.dismissFeature(featureId, context);
  }, []);

  const resetFeatureDiscovery = useCallback((featureId?: string) => {
    featureDiscoveryService.resetFeatureDiscovery(featureId);
  }, []);

  const updatePreferences = useCallback((newPreferences: Partial<UserDiscoveryState['discoveryPreferences']>) => {
    featureDiscoveryService.updatePreferences(newPreferences);
    setPreferences(featureDiscoveryService.getPreferences());
  }, []);

  return {
    // Feature queries (direct access, no state needed)
    getFeature: featureDiscoveryService.getFeature.bind(featureDiscoveryService),
    getAllFeatures: featureDiscoveryService.getAllFeatures.bind(featureDiscoveryService),
    getFeaturesForContext: featureDiscoveryService.getFeaturesForContext.bind(featureDiscoveryService),
    getUndiscoveredFeaturesForContext: featureDiscoveryService.getUndiscoveredFeaturesForContext.bind(featureDiscoveryService),
    
    // Discovery state (direct access, state updates via events)
    isFeatureDiscovered: featureDiscoveryService.isFeatureDiscovered.bind(featureDiscoveryService),
    isFeatureDismissed: featureDiscoveryService.isFeatureDismissed.bind(featureDiscoveryService),
    getFeatureUsageCount: featureDiscoveryService.getFeatureUsageCount.bind(featureDiscoveryService),
    shouldShowGuidance: featureDiscoveryService.shouldShowGuidance.bind(featureDiscoveryService),
    
    // Discovery actions (wrapped to trigger updates)
    markFeatureDiscovered,
    markFeatureUsed,
    dismissFeature,
    resetFeatureDiscovery,
    
    // Preferences (reactive state)
    preferences,
    updatePreferences,
    
    // Analytics (reactive state)
    discoveryStats,
    
    // Utilities (direct access)
    getNextFeatureToDiscover: featureDiscoveryService.getNextFeatureToDiscover.bind(featureDiscoveryService),
    hasPrerequisites: featureDiscoveryService.hasPrerequisites.bind(featureDiscoveryService),
  };
}; 