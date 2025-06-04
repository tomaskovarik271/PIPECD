import { useMemo } from 'react';
import type { Lead } from '../stores/useLeadsStore';

interface UseFilteredLeadsProps {
  leads: Lead[];
  activeQuickFilterKey?: string | null;
  currentUserId?: string;
  selectedAssignedUserIds: string[];
  searchTerm: string;
}

export function useFilteredLeads({
  leads,
  activeQuickFilterKey,
  currentUserId,
  selectedAssignedUserIds,
  searchTerm,
}: UseFilteredLeadsProps): Lead[] {
  
  return useMemo(() => {
    let filtered = [...leads];

    // Apply quick filter if provided
    if (activeQuickFilterKey) {
      switch (activeQuickFilterKey) {
        case 'my_leads':
          filtered = filtered.filter(lead => lead.assigned_to_user_id === currentUserId);
          break;
        case 'qualified_leads':
          filtered = filtered.filter(lead => lead.isQualified);
          break;
        case 'unqualified_leads':
          filtered = filtered.filter(lead => !lead.isQualified);
          break;
        case 'high_score_leads':
          filtered = filtered.filter(lead => (lead.lead_score || 0) >= 75);
          break;
        case 'converted_leads':
          filtered = filtered.filter(lead => lead.converted_at);
          break;
        default:
          // No filter applied
          break;
      }
    }

    // Apply assigned user filter
    if (selectedAssignedUserIds.length > 0) {
      filtered = filtered.filter(lead => 
        lead.assigned_to_user_id && selectedAssignedUserIds.includes(lead.assigned_to_user_id)
      );
    }

    // Apply search term filter
    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase().trim();
      filtered = filtered.filter(lead => {
        // Search in lead name
        if (lead.name?.toLowerCase().includes(search)) return true;
        
        // Search in contact information
        if (lead.contact_name?.toLowerCase().includes(search)) return true;
        if (lead.contact_email?.toLowerCase().includes(search)) return true;
        if (lead.company_name?.toLowerCase().includes(search)) return true;
        
        // Search in source
        if (lead.source?.toLowerCase().includes(search)) return true;
        
        return false;
      });
    }

    return filtered;
  }, [leads, activeQuickFilterKey, currentUserId, selectedAssignedUserIds, searchTerm]);
} 