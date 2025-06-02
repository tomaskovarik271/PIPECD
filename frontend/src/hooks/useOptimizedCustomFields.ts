import { useState, useEffect, useMemo, useCallback } from 'react';
import { gqlClient } from '../lib/graphqlClient';
import { gql } from 'graphql-request';
import type { CustomFieldDefinition, CustomFieldEntityType } from '../generated/graphql/graphql';

interface UseOptimizedCustomFieldsOptions {
  entityTypes?: CustomFieldEntityType[];
  includeInactive?: boolean;
}

interface UseOptimizedCustomFieldsResult {
  definitions: Record<CustomFieldEntityType, CustomFieldDefinition[]>;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  getDefinitionsForEntity: (entityType: CustomFieldEntityType) => CustomFieldDefinition[];
}

// Centralized query to fetch all custom field definitions at once
const GET_ALL_CUSTOM_FIELD_DEFINITIONS = gql`
  query GetAllCustomFieldDefinitions($includeInactive: Boolean = false) {
    dealCustomFields: customFieldDefinitions(entityType: DEAL, includeInactive: $includeInactive) {
      id
      fieldName
      fieldLabel
      fieldType
      entityType
      isActive
      dropdownOptions { value label }
    }
    personCustomFields: customFieldDefinitions(entityType: PERSON, includeInactive: $includeInactive) {
      id
      fieldName
      fieldLabel
      fieldType
      entityType
      isActive
      dropdownOptions { value label }
    }
    organizationCustomFields: customFieldDefinitions(entityType: ORGANIZATION, includeInactive: $includeInactive) {
      id
      fieldName
      fieldLabel
      fieldType
      entityType
      isActive
      dropdownOptions { value label }
    }
  }
`;

// Cache to prevent multiple simultaneous requests
let customFieldsCache: Record<string, CustomFieldDefinition[]> | null = null;
let customFieldsPromise: Promise<Record<string, CustomFieldDefinition[]>> | null = null;

const fetchAllCustomFields = async (includeInactive: boolean = false): Promise<Record<string, CustomFieldDefinition[]>> => {
  const cacheKey = `includeInactive:${includeInactive}`;
  
  // Return cached data if available and fresh (cache for 5 minutes)
  if (customFieldsCache && Date.now() - (customFieldsCache as any)._timestamp < 5 * 60 * 1000) {
    return customFieldsCache;
  }

  // If there's already a request in flight, wait for it
  if (customFieldsPromise) {
    return customFieldsPromise;
  }

  customFieldsPromise = (async () => {
    try {
      const data = await gqlClient.request<{
        dealCustomFields: CustomFieldDefinition[];
        personCustomFields: CustomFieldDefinition[];
        organizationCustomFields: CustomFieldDefinition[];
      }>(GET_ALL_CUSTOM_FIELD_DEFINITIONS, { includeInactive });

      const result = {
        DEAL: data.dealCustomFields || [],
        PERSON: data.personCustomFields || [],
        ORGANIZATION: data.organizationCustomFields || [],
      };

      // Add timestamp for cache invalidation
      (result as any)._timestamp = Date.now();
      customFieldsCache = result;
      
      return result;
    } finally {
      customFieldsPromise = null;
    }
  })();

  return customFieldsPromise;
};

export const useOptimizedCustomFields = (
  options: UseOptimizedCustomFieldsOptions = {}
): UseOptimizedCustomFieldsResult => {
  const { entityTypes, includeInactive = false } = options;
  
  const [definitions, setDefinitions] = useState<Record<CustomFieldEntityType, CustomFieldDefinition[]>>({
    DEAL: [],
    PERSON: [],
    ORGANIZATION: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDefinitions = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const allDefinitions = await fetchAllCustomFields(includeInactive);
      
      // Filter by entity types if specified
      if (entityTypes && entityTypes.length > 0) {
        const filteredDefinitions = {} as Record<CustomFieldEntityType, CustomFieldDefinition[]>;
        entityTypes.forEach(entityType => {
          filteredDefinitions[entityType] = allDefinitions[entityType] || [];
        });
        setDefinitions(filteredDefinitions);
      } else {
        setDefinitions(allDefinitions);
      }
    } catch (err) {
      console.error('Error fetching custom field definitions:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch custom field definitions');
    } finally {
      setLoading(false);
    }
  }, [entityTypes, includeInactive]);

  useEffect(() => {
    fetchDefinitions();
  }, [fetchDefinitions]);

  const getDefinitionsForEntity = useCallback((entityType: CustomFieldEntityType) => {
    return definitions[entityType] || [];
  }, [definitions]);

  const refetch = useCallback(async () => {
    // Clear cache to force fresh data
    customFieldsCache = null;
    await fetchDefinitions();
  }, [fetchDefinitions]);

  const memoizedResult = useMemo(() => ({
    definitions,
    loading,
    error,
    refetch,
    getDefinitionsForEntity,
  }), [definitions, loading, error, refetch, getDefinitionsForEntity]);

  return memoizedResult;
};

// Utility to invalidate the cache (useful for after creating/updating custom fields)
export const invalidateCustomFieldsCache = () => {
  customFieldsCache = null;
}; 