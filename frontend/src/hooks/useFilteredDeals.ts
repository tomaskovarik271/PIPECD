import { useMemo } from 'react';
import type { Deal } from '../stores/useDealsStore';

interface UseFilteredDealsProps {
  deals: Deal[];
  activeQuickFilterKey: string | null;
  currentUserId?: string;
  selectedAssignedUserIds: string[];
  searchTerm?: string;
  includeFinalSteps?: boolean;
}

export function useFilteredDeals({
  deals,
  activeQuickFilterKey,
  currentUserId,
  selectedAssignedUserIds,
  searchTerm,
  includeFinalSteps = false,
}: UseFilteredDealsProps): Deal[] {
  return useMemo(() => {
    let filtered = deals;
    
    // BASE FILTER: Exclude deals with final steps (like "Converted to Lead") unless explicitly requested
    if (!includeFinalSteps) {
      filtered = filtered.filter(deal => 
        !deal.currentWfmStep?.isFinalStep
      );
    }
    
    if (activeQuickFilterKey && activeQuickFilterKey !== 'all') {
      filtered = filtered.filter(deal => {
        switch (activeQuickFilterKey) {
          case 'myOpen':
            return deal.user_id === currentUserId && deal.currentWfmStep && !deal.currentWfmStep.isFinalStep;
          case 'closingThisMonth': {
            if (!deal.expected_close_date) return false;
            const closeDate = new Date(deal.expected_close_date);
            const today = new Date();
            return closeDate.getFullYear() === today.getFullYear() && closeDate.getMonth() === today.getMonth();
          }
          default:
            return true;
        }
      });
    }
    // Add assigned user filter - now supports multiple users
    if (selectedAssignedUserIds && selectedAssignedUserIds.length > 0) {
      filtered = filtered.filter(deal => {
        // Check if "unassigned" is selected
        if (selectedAssignedUserIds.includes('unassigned') && !deal.assigned_to_user_id) {
          return true;
        }
        // Check if deal is assigned to any of the selected users
        return deal.assigned_to_user_id && selectedAssignedUserIds.includes(deal.assigned_to_user_id);
      });
    }
    // Search Term Filter (on deal name)
    if (searchTerm && searchTerm.trim() !== '') {
      const lowerSearchTerm = searchTerm.toLowerCase();
      filtered = filtered.filter(deal => 
        deal.name?.toLowerCase().includes(lowerSearchTerm)
      );
    }
    return filtered;
  }, [deals, activeQuickFilterKey, currentUserId, selectedAssignedUserIds, searchTerm, includeFinalSteps]);
} 