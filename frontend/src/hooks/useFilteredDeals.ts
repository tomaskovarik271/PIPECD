import { useMemo } from 'react';
import type { Deal } from '../stores/useDealsStore';

interface UseFilteredDealsProps {
  deals: Deal[];
  activeQuickFilterKey: string | null;
  currentUserId?: string;
  selectedAssignedUserIds: string[];
  searchTerm?: string;
  includeFinalSteps?: boolean;
  selectedLabels?: Array<{ labelText: string; colorHex: string }>;
  labelFilterLogic?: 'AND' | 'OR';
}

export function useFilteredDeals({
  deals,
  activeQuickFilterKey,
  currentUserId,
  selectedAssignedUserIds,
  searchTerm,
  includeFinalSteps = false,
  selectedLabels = [],
  labelFilterLogic = 'OR',
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
    // Add search term filter
    if (searchTerm && searchTerm.trim() !== '') {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(deal => 
        deal.name?.toLowerCase().includes(searchLower) ||
        deal.organization?.name?.toLowerCase().includes(searchLower) ||
        deal.person?.first_name?.toLowerCase().includes(searchLower) ||
        deal.person?.last_name?.toLowerCase().includes(searchLower)
      );
    }

    // Add label filtering
    if (selectedLabels.length > 0) {
      const selectedLabelTexts = selectedLabels.map(label => label.labelText);
      
      filtered = filtered.filter(deal => {
        if (!deal.labels || deal.labels.length === 0) return false;
        
        const dealLabelTexts = deal.labels.map(label => label.labelText);
        
        if (labelFilterLogic === 'AND') {
          // Deal must have ALL selected labels
          return selectedLabelTexts.every(labelText => 
            dealLabelTexts.includes(labelText)
      );
        } else {
          // Deal must have ANY of the selected labels
          return selectedLabelTexts.some(labelText => 
            dealLabelTexts.includes(labelText)
          );
        }
      });
    }

    return filtered;
  }, [deals, activeQuickFilterKey, currentUserId, selectedAssignedUserIds, searchTerm, includeFinalSteps, selectedLabels, labelFilterLogic]);
} 