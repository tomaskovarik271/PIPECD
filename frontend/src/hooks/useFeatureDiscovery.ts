import { useCallback, useEffect, useState } from 'react';
import { featureDiscoveryService, type ContextualSuggestion } from '../../../lib/featureDiscoveryService';
import { useAppStore } from '../stores/useAppStore';

export const useFeatureDiscovery = () => {
  const { user } = useAppStore();
  const userId = user?.id;

  const markFeatureDiscovered = useCallback((featureId: string) => {
    if (userId) {
      featureDiscoveryService.markFeatureDiscovered(userId, featureId);
    }
  }, [userId]);

  const markTourCompleted = useCallback((tourId: string) => {
    if (userId) {
      featureDiscoveryService.markTourCompleted(userId, tourId);
    }
  }, [userId]);

  const markCalloutDismissed = useCallback((calloutId: string) => {
    if (userId) {
      featureDiscoveryService.markCalloutDismissed(userId, calloutId);
    }
  }, [userId]);

  const incrementFeatureUsage = useCallback((featureId: string) => {
    if (userId) {
      featureDiscoveryService.incrementFeatureUsage(userId, featureId);
    }
  }, [userId]);

  const shouldShowGuidance = useCallback((featureId: string) => {
    if (!userId) return false;
    return featureDiscoveryService.shouldShowGuidance(userId, featureId);
  }, [userId]);

  const getFeature = useCallback((featureId: string) => {
    return featureDiscoveryService.getFeature(featureId);
  }, []);

  const getSuggestionsForContext = useCallback((context: string) => {
    if (!userId) return [];
    return featureDiscoveryService.getSuggestionsForContext(context, userId);
  }, [userId]);

  const getUserProgress = useCallback(() => {
    if (!userId) return null;
    return featureDiscoveryService.getUserProgress(userId);
  }, [userId]);

  const setUserGuidanceLevel = useCallback((level: 'minimal' | 'standard' | 'comprehensive') => {
    if (userId) {
      featureDiscoveryService.setUserGuidanceLevel(userId, level);
    }
  }, [userId]);

  const searchFeatures = useCallback((query: string) => {
    return featureDiscoveryService.searchFeatures(query);
  }, []);

  return {
    // Core methods
    markFeatureDiscovered,
    markTourCompleted,
    markCalloutDismissed,
    incrementFeatureUsage,
    shouldShowGuidance,
    getFeature,
    getSuggestionsForContext,
    getUserProgress,
    setUserGuidanceLevel,
    searchFeatures,
    
    // Utility properties
    isAuthenticated: !!userId,
    userId
  };
};

export const useContextualSuggestions = (context: string) => {
  const { getSuggestionsForContext, isAuthenticated } = useFeatureDiscovery();
  const [suggestions, setSuggestions] = useState<ContextualSuggestion[]>([]);

  useEffect(() => {
    if (isAuthenticated) {
      const contextSuggestions = getSuggestionsForContext(context);
      setSuggestions(contextSuggestions);
    }
  }, [context, getSuggestionsForContext, isAuthenticated]);

  return suggestions;
}; 