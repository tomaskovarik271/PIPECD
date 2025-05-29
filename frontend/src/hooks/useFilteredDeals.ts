import { useMemo } from 'react';
import type { Deal } from '../stores/useDealsStore';

interface UseFilteredDealsProps {
  deals: Deal[];
  activeQuickFilterKey: string | null;
  currentUserId?: string;
  selectedAssignedUserId: string | null;
  searchTerm?: string;
}

export function useFilteredDeals({
  deals,
  activeQuickFilterKey,
  currentUserId,
  selectedAssignedUserId,
  searchTerm,
}: UseFilteredDealsProps): Deal[] {
  return useMemo(() => {
    let filtered = deals;
    if (activeQuickFilterKey && activeQuickFilterKey !== 'all') {
      filtered = deals.filter(deal => {
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
    // Add assigned user filter
    if (selectedAssignedUserId && selectedAssignedUserId !== 'all') {
      if (selectedAssignedUserId === 'unassigned') {
        filtered = filtered.filter(deal => !deal.assigned_to_user_id);
      } else {
        filtered = filtered.filter(deal => deal.assigned_to_user_id === selectedAssignedUserId);
      }
    }
    // Search Term Filter (on deal name)
    if (searchTerm && searchTerm.trim() !== '') {
      const lowerSearchTerm = searchTerm.toLowerCase();
      filtered = filtered.filter(deal => 
        deal.name?.toLowerCase().includes(lowerSearchTerm)
      );
    }
    return filtered;
  }, [deals, activeQuickFilterKey, currentUserId, selectedAssignedUserId, searchTerm]);
} 