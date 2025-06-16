import { useMemo } from 'react';
import { useDealsStore } from '../stores/useDealsStore';
import { usePeopleStore } from '../stores/usePeopleStore';
import { useOrganizationsStore } from '../stores/useOrganizationsStore';
import { useCustomFieldDefinitionStore } from '../stores/useCustomFieldDefinitionStore';

/**
 * Optimized deals store hooks with selective subscriptions
 * These hooks prevent unnecessary re-renders by only subscribing to specific state slices
 */

// Only subscribe to deals data, not loading states
export const useDealsData = () => {
  return useDealsStore(state => state.deals);
};

// Only subscribe to loading state
export const useDealsLoading = () => {
  return useDealsStore(state => state.dealsLoading);
};

// Only subscribe to error state
export const useDealsError = () => {
  return useDealsStore(state => state.dealsError);
};

// Only subscribe to view mode
export const useDealsViewMode = () => {
  return useDealsStore(state => ({
    viewMode: state.dealsViewMode,
    setViewMode: state.setDealsViewMode,
    isCompact: state.kanbanCompactMode,
    setCompact: state.setKanbanCompactMode
  }));
};

// Only subscribe to deals actions (these rarely change)
export const useDealsActions = () => {
  return useDealsStore(state => ({
    fetchDeals: state.fetchDeals,
    createDeal: state.createDeal,
    updateDeal: state.updateDeal,
    deleteDeal: state.deleteDeal,
    updateDealWFMProgress: state.updateDealWFMProgress
  }));
};

/**
 * Optimized people store hooks
 */

export const usePeopleData = () => {
  return usePeopleStore(state => state.people);
};

export const usePeopleLoading = () => {
  return usePeopleStore(state => state.peopleLoading);
};

export const usePeopleActions = () => {
  return usePeopleStore(state => ({
    fetchPeople: state.fetchPeople,
    createPerson: state.createPerson,
    updatePerson: state.updatePerson,
    deletePerson: state.deletePerson
  }));
};

/**
 * Optimized organizations store hooks
 */

export const useOrganizationsData = () => {
  return useOrganizationsStore(state => state.organizations);
};

export const useOrganizationsLoading = () => {
  return useOrganizationsStore(state => state.organizationsLoading);
};

export const useOrganizationsActions = () => {
  return useOrganizationsStore(state => ({
    fetchOrganizations: state.fetchOrganizations,
    createOrganization: state.createOrganization,
    updateOrganization: state.updateOrganization,
    deleteOrganization: state.deleteOrganization
  }));
};

/**
 * Optimized custom field definitions store hooks
 */

export const useCustomFieldDefinitionsData = () => {
  return useCustomFieldDefinitionStore(state => state.definitions);
};

export const useCustomFieldDefinitionsLoading = () => {
  return useCustomFieldDefinitionStore(state => state.loading);
};

export const useCustomFieldDefinitionsActions = () => {
  return useCustomFieldDefinitionStore(state => ({
    fetchCustomFieldDefinitions: state.fetchCustomFieldDefinitions,
    createCustomFieldDefinition: state.createCustomFieldDefinition,
    updateCustomFieldDefinition: state.updateCustomFieldDefinition,
    deactivateCustomFieldDefinition: state.deactivateCustomFieldDefinition,
    reactivateCustomFieldDefinition: state.reactivateCustomFieldDefinition
  }));
};

/**
 * Memoized filtered data hooks
 * These provide commonly used filtered/computed data with memoization
 */

export const useActiveCustomFieldDefinitions = (entityType?: string) => {
  const definitions = useCustomFieldDefinitionsData();
  
  return useMemo(() => {
    if (!definitions) return [];
    
    return definitions.filter((def: any) => 
      def.isActive && 
      (!entityType || def.entityType === entityType)
    );
  }, [definitions, entityType]);
};

export const usePersonCustomFieldDefinitions = () => {
  return useActiveCustomFieldDefinitions('PERSON');
};

export const useOrganizationCustomFieldDefinitions = () => {
  return useActiveCustomFieldDefinitions('ORGANIZATION');
};

export const useDealCustomFieldDefinitions = () => {
  return useActiveCustomFieldDefinitions('DEAL');
};

export const useLeadCustomFieldDefinitions = () => {
  return useActiveCustomFieldDefinitions('LEAD');
};

/**
 * Memoized deals by status/step hooks
 */

export const useDealsByStep = () => {
  const deals = useDealsData();
  
  return useMemo(() => {
    if (!deals) return new Map();
    
    const dealsByStep = new Map<string, typeof deals>();
    
    deals.forEach(deal => {
      const stepId = deal.currentWfmStep?.id || 'unassigned';
      if (!dealsByStep.has(stepId)) {
        dealsByStep.set(stepId, []);
      }
      dealsByStep.get(stepId)!.push(deal);
    });
    
    return dealsByStep;
  }, [deals]);
};

/**
 * Performance monitoring hook for debugging
 */

export const useRenderCount = (componentName: string) => {
  const renderCount = useMemo(() => {
    let count = 0;
    return () => {
      count++;
      if (process.env.NODE_ENV === 'development') {
        console.log(`[Performance] ${componentName} rendered ${count} times`);
      }
      return count;
    };
  }, [componentName]);
  
  renderCount();
}; 