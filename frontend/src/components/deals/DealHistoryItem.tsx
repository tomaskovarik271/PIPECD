import React from 'react';
import { Box, Text, VStack, HStack, Avatar, UnorderedList, ListItem, Code } from '@chakra-ui/react';
import { format, parseISO } from 'date-fns';
import { DealHistoryEntryDisplayItem } from './DealHistoryList'; // Import the type
import { useAppStore } from '../../stores/useAppStore'; // Added store import
import { useUserListStore } from '../../stores/useUserListStore'; // ADDED
import { CustomFieldDefinition, Person, Organization, WfmStatus } from '../../generated/graphql/graphql'; // For typing, changed Stage to WfmStatus
import { useEffect } from 'react'; // ADDED
import { useThemeColors } from '../../hooks/useThemeColors'; // ADDED

interface CustomFieldValue {
  oldValue?: unknown;
  newValue?: unknown;
}

interface HistoryChanges {
  [key: string]: unknown;
  custom_field_values?: Record<string, unknown | CustomFieldValue>;
}

interface DealHistoryItemProps {
  entry: DealHistoryEntryDisplayItem;
}

// Mapping for core field display names
const coreFieldDisplayNames: Record<string, string> = {
  'name': 'Deal Name',
  'amount': 'Amount',
  'expected_close_date': 'Expected Close Date',
  'person_id': 'Contact',
  'organization_id': 'Organization',
  'deal_specific_probability': 'Deal Probability',
  'assigned_to_user_id': 'Assigned To',
  'stage_id': 'Stage',
  'user_id': 'Created By'
};


const DealHistoryItem: React.FC<DealHistoryItemProps> = ({ entry }) => {
  // Access currentDeal which contains the current deal's stage, person, org, and CF definitions
  const currentDeal = useAppStore((state) => state.currentDeal);
  const { users, fetchUsers, hasFetched: usersHaveBeenFetched } = useUserListStore(); // ADDED
  const colors = useThemeColors(); // ADDED

  // ADDED: Fetch users if not already fetched
  useEffect(() => {
    if (!usersHaveBeenFetched) {
      fetchUsers();
    }
  }, [usersHaveBeenFetched, fetchUsers]);

  // ADDED: Helper to get user display name
  const getUserDisplayNameById = (userId: string): string => {
    const user = users.find(u => u.id === userId);
    return user?.display_name || user?.email || `User ID: ${userId}`;
  };

  // Helper to get all unique custom field definitions from the current deal
  const getCustomFieldDefinitionsFromCurrentDeal = (): CustomFieldDefinition[] => {
    if (!currentDeal || !currentDeal.customFieldValues) return [];
    const definitionsMap = new Map<string, CustomFieldDefinition>();
    currentDeal.customFieldValues.forEach(cfValue => {
      if (cfValue.definition) {
        definitionsMap.set(cfValue.definition.id, cfValue.definition as CustomFieldDefinition);
      }
    });
    const definitions = Array.from(definitionsMap.values());
    
    return definitions;
  };
  const availableCustomFieldDefinitions = getCustomFieldDefinitionsFromCurrentDeal();

  const formatSingleCustomFieldValue = (definitionId: string, value: unknown): string => {
    if (value === null || value === undefined) return 'Not set';
    
    const definition = availableCustomFieldDefinitions.find(def => def.id === definitionId);
    
    if (!definition) {
      // Fallback if definition not found
      if (typeof value === 'boolean') return value ? 'Yes' : 'No';
      return String(value);
    }

    switch (definition.fieldType) {
      case 'BOOLEAN':
        if (typeof value === 'boolean') return value ? 'Yes' : 'No';
        if (typeof value === 'string') {
          const lowerValue = value.toLowerCase();
          if (lowerValue === 'true' || lowerValue === 'yes' || lowerValue === '1') return 'Yes';
          if (lowerValue === 'false' || lowerValue === 'no' || lowerValue === '0') return 'No';
          return value;
        }
        return value ? 'Yes' : 'No';
      case 'NUMBER': {
        const num = Number(value);
        return isNaN(num) ? 'Not set' : num.toLocaleString();
      }
      case 'DATE':
        if (!value) return 'Not set';
        try {
          return format(parseISO(String(value)), 'MMM d, yyyy');
        } catch (e) {
          return String(value);
        }
      case 'DROPDOWN':
        if (Array.isArray(value)) {
          // Multi-select dropdown
          if (value.length === 0) return 'None selected';
          return value.map(val => {
            const option = definition.dropdownOptions?.find(opt => opt.value === val);
            return option ? option.label : val;
          }).join(', ');
        } else {
          // Single-select dropdown
          const option = definition.dropdownOptions?.find(opt => opt.value === value);
          return option ? option.label : String(value);
        }
      case 'TEXT':
      case 'TEXT_AREA':
      default:
        return String(value);
    }
  };
  
  const formatHistoryFieldValue = (field: string, value: unknown): string => {
    if (value === null || value === undefined) return 'Not set';
    
    // Handle object values that shouldn't be displayed as [object Object]
    if (typeof value === 'object') {
      return JSON.stringify(value);
    }
    
    switch (field) {
      case 'amount': {
        const numAmount = Number(value);
        if (isNaN(numAmount)) return 'Not set';
        return `$${numAmount.toLocaleString()}`;
      }
      case 'deal_specific_probability': {
        const numProb = Number(value);
        if (isNaN(numProb)) return 'Not set';
        return `${(numProb * 100).toFixed(0)}%`;
      }
      case 'expected_close_date':
        if (!value) return 'Not set';
        try {
          return format(parseISO(String(value)), 'MMM d, yyyy');
        } catch (e) {
          return String(value);
        }
      case 'stage_id': {
        // Attempt to find the stage name from currentDeal if it matches the ID
        // This is a best-effort for display and might not always find a match if stages change over time.
        // The raw ID will be shown if no match.
        const wfmStatus = currentDeal?.currentWfmStatus;
        return (wfmStatus && wfmStatus.id === value) ? wfmStatus.name : String(value);
      }
      case 'assigned_to_user_id': // ADDED: case for assigned_to_user_id
        if (!value) return 'Unassigned';
        return getUserDisplayNameById(String(value));
      case 'person_id': {
        if (!value) return 'No contact';
        const person = currentDeal?.person;
        return (person && person.id === value) ? `${person.first_name || ''} ${person.last_name || ''}`.trim() || String(value) : String(value);
      }
      case 'organization_id': {
        if (!value) return 'No organization';
        const org = currentDeal?.organization;
        return (org && org.id === value) ? org.name : String(value);
      }
      case 'name':
        return value || 'Untitled Deal';
      // custom_field_values are handled by renderCustomFieldChanges
      default:
        return String(value);
    }
  };

  // Helper function to render changes
  const renderChanges = (eventType: string, changes: HistoryChanges): JSX.Element | string => {
    if (eventType === 'DEAL_DELETED') {
      return 'This deal was deleted.';
    }

    // Handle DEAL_WFM_STATUS_CHANGED specifically
    if (eventType === 'DEAL_WFM_STATUS_CHANGED' && changes) {
      try {
        // The 'changes' object itself is the change_data for this event type
        const changeData = typeof changes === 'string' ? JSON.parse(changes) : changes;
        const oldStatusName = changeData.old_wfm_status?.name || 'Unknown Status';
        const newStatusName = changeData.new_wfm_status?.name || 'Unknown Status';
        // Make sure to check if old/new status are the same (can happen if only metadata changed on step)
        if (oldStatusName === newStatusName && changeData.old_wfm_status?.id === changeData.new_wfm_status?.id) {
            return <Text>Deal progress updated within status <Text as="span" fontWeight="bold">{newStatusName}</Text>.</Text>;
        }    
        return (
          <Text>
            Status changed from <Text as="span" fontWeight="bold">{oldStatusName}</Text> to <Text as="span" fontWeight="bold">{newStatusName}</Text>.
          </Text>
        );
      } catch (e) {
        console.error("Error parsing DEAL_WFM_STATUS_CHANGED data:", e, changes);
        // Fallback to JSON if parsing fails
        return <Code fontSize="xs" display="block" p={2} borderRadius="md">{JSON.stringify(changes, null, 2)}</Code>;
      }
    }

    if (!changes || Object.keys(changes).length === 0) {
      return 'No specific changes logged.';
    }

    const renderListItem = (key: string, displayKey: string, value: unknown, oldValue?: unknown) => {
       if (key === 'custom_field_values') {
        // Special rendering for custom_field_values object
        if (typeof value === 'object' && value !== null) {
          return (
            <>
              {Object.entries(value).map(([cfId, cfVal]) => {
                // For DEAL_CREATED, cfVal is the direct value.
                // For DEAL_UPDATED, cfVal is an object { oldValue: ..., newValue: ... }
                const definition = availableCustomFieldDefinitions.find(def => def.id === cfId);
                const fieldLabel = definition?.fieldLabel || cfId.replace(/^custom_field_values\./, '').replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                
                let changeText;
                if (eventType === 'DEAL_CREATED') {
                  changeText = formatSingleCustomFieldValue(cfId, cfVal);
                } else if (eventType === 'DEAL_UPDATED' && typeof cfVal === 'object' && cfVal !== null && 'oldValue' in cfVal && 'newValue' in cfVal) {
                  const oldF = formatSingleCustomFieldValue(cfId, (cfVal as any).oldValue);
                  const newF = formatSingleCustomFieldValue(cfId, (cfVal as any).newValue);
                  changeText = `changed from "${oldF}" to "${newF}"`;
                } else {
                  changeText = formatSingleCustomFieldValue(cfId, cfVal); // Fallback for other cases
                }

                return (
                  <ListItem key={cfId} ml={4}> {/* Indent custom fields slightly */}
                    <Text as="span" fontWeight="medium">{fieldLabel}:</Text> {changeText}
                  </ListItem>
                );
              })}
            </>
          );
        } else {
          // if custom_field_values is not an object (e.g. direct value in DEAL_CREATED), format it.
          // This case might not be hit if custom_field_values in 'changes' is always an object.
           return <ListItem key={key}><Text as="span" fontWeight="medium">{displayKey}:</Text> {formatHistoryFieldValue(key, value)}</ListItem>;
        }
      }
      // Default rendering for non-custom fields
      return (
        <ListItem key={key}>
          <Text as="span" fontWeight="medium">{displayKey}:</Text> 
          {eventType === 'DEAL_CREATED' && ` ${formatHistoryFieldValue(key, value)}`}
          {eventType === 'DEAL_UPDATED' && ` changed from "${formatHistoryFieldValue(key, oldValue)}" to "${formatHistoryFieldValue(key, value)}"`}
        </ListItem>
      );
    }

    if (eventType === 'DEAL_CREATED') {
      return (
        <UnorderedList spacing={1} styleType="none" ml={0}>
          {Object.entries(changes)
            .filter(([key]) => !['newValue', 'oldValue'].includes(key)) // Filter out these problematic keys
            .map(([key, value]) => {
            // Special handling for custom_field_values during creation
            if (key === 'custom_field_values' && typeof value === 'object' && value !== null) {
              return Object.entries(value).map(([cfId, cfVal]) => {
                const definition = availableCustomFieldDefinitions.find(def => def.id === cfId);
                const fieldLabel = definition?.fieldLabel || cfId.replace(/^custom_field_values\./, '').replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                return (
                  <ListItem key={cfId}>
                    <Text as="span" fontWeight="medium">{fieldLabel}:</Text> {formatSingleCustomFieldValue(cfId, cfVal)}
                  </ListItem>
                );
              });
            }
            
            // Handle JSON objects with newValue/oldValue structure
            if (typeof value === 'object' && value !== null && 'newValue' in value) {
              const displayName = coreFieldDisplayNames[key] || key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
              const formattedValue = formatHistoryFieldValue(key, (value as any).newValue);
              return (
                <ListItem key={key}>
                  <Text as="span" fontWeight="medium">{displayName}:</Text> {formattedValue}
                </ListItem>
              );
            }
            
            // For other core fields during creation
            const displayName = coreFieldDisplayNames[key] || key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
            return (
              <ListItem key={key}>
                <Text as="span" fontWeight="medium">{displayName}:</Text> {formatHistoryFieldValue(key, value)}
              </ListItem>
            );
          })}
        </UnorderedList>
      );
    }

    if (eventType === 'DEAL_UPDATED') {
      const changeItems: JSX.Element[] = [];
      
      Object.entries(changes).forEach(([key, valueObj]: [string, any]) => {
        if (key.startsWith('custom_field_values.')) {
          // Handle individual custom field changes
          const cfId = key.replace('custom_field_values.', '');
          const definition = availableCustomFieldDefinitions.find(def => def.id === cfId);
          const fieldLabel = definition?.fieldLabel || cfId.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
          
          if (typeof valueObj === 'object' && valueObj !== null) {
            if ('oldValue' in valueObj && 'newValue' in valueObj) {
              // Standard update case (old value -> new value)
              const oldF = formatSingleCustomFieldValue(cfId, valueObj.oldValue);
              const newF = formatSingleCustomFieldValue(cfId, valueObj.newValue);
              if (oldF !== newF) {
                changeItems.push(
                  <ListItem key={cfId}>
                    <Text as="span" fontWeight="medium">{fieldLabel}:</Text> changed from "{oldF}" to "{newF}"
                  </ListItem>
                );
              }
            } else if ('newValue' in valueObj) {
              // Field creation case (only newValue, no oldValue)
              const newF = formatSingleCustomFieldValue(cfId, valueObj.newValue);
              changeItems.push(
                <ListItem key={cfId}>
                  <Text as="span" fontWeight="medium">{fieldLabel}:</Text> set to "{newF}"
                </ListItem>
              );
            } else if ('oldValue' in valueObj) {
              // Field deletion case (only oldValue, no newValue)
              const oldF = formatSingleCustomFieldValue(cfId, valueObj.oldValue);
              changeItems.push(
                <ListItem key={cfId}>
                  <Text as="span" fontWeight="medium">{fieldLabel}:</Text> removed (was "{oldF}")
                </ListItem>
              );
            } else {
              // Unknown structure - show raw data
              changeItems.push(
                <ListItem key={cfId}>
                  <Text as="span" fontWeight="medium">{fieldLabel}:</Text> {JSON.stringify(valueObj)}
                </ListItem>
              );
            }
          }
        } else if (key === 'custom_field_values') {
          // Handle nested custom field changes (fallback)
          if (typeof valueObj === 'object' && valueObj !== null) {
            Object.entries(valueObj).forEach(([cfId, cfChange]) => {
              const definition = availableCustomFieldDefinitions.find(def => def.id === cfId);
              const fieldLabel = definition?.fieldLabel || cfId.replace(/^custom_field_values\./, '').replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
              if (typeof cfChange === 'object' && cfChange !== null && 'oldValue' in cfChange && 'newValue' in cfChange) {
                const oldF = formatSingleCustomFieldValue(cfId, (cfChange as any).oldValue);
                const newF = formatSingleCustomFieldValue(cfId, (cfChange as any).newValue);
                 // Only add if old and new values are different
                if (oldF !== newF) {
                    changeItems.push(
                        <ListItem key={cfId}>
                        <Text as="span" fontWeight="medium">{fieldLabel}:</Text> changed from "{oldF}" to "{newF}"
                        </ListItem>
                    );
                }
              }
            });
          }
        } else {
          // Handle other core field updates
          const displayName = coreFieldDisplayNames[key] || key;
          // Only add if old and new values are different
          if (typeof valueObj === 'object' && valueObj !== null && 'oldValue' in valueObj && 'newValue' in valueObj) {
            const oldF = formatHistoryFieldValue(key, valueObj.oldValue);
            const newF = formatHistoryFieldValue(key, valueObj.newValue);
            if (oldF !== newF) {
              changeItems.push(renderListItem(key, displayName, valueObj.newValue, valueObj.oldValue));
            }
          }
        }
      });
      
      if (changeItems.length === 0) {
        return <Text>No visible field changes.</Text>;
      }
      return <UnorderedList spacing={1} styleType="none" ml={0}>{changeItems}</UnorderedList>;
    }
    // Fallback for other event types or if structure is unexpected
    return <Code fontSize="xs" display="block" p={2} borderRadius="md">{JSON.stringify(changes, null, 2)}</Code>;
  };

  const userName = entry.user?.display_name || 'System Action';
  const userAvatarSrc = entry.user?.display_name ? `https://ui-avatars.com/api/?name=${encodeURIComponent(entry.user.display_name)}&background=random&color=fff` : undefined;

  let eventDescription = 'made changes to this deal.';
  if (entry.eventType === 'DEAL_CREATED') eventDescription = 'created this deal.';
  if (entry.eventType === 'DEAL_UPDATED') eventDescription = 'updated this deal.';
  if (entry.eventType === 'DEAL_DELETED') eventDescription = 'deleted this deal.';

  return (
    <Box 
      borderWidth="1px" 
      borderRadius="md" 
      p={4} 
      bg={colors.bg.surface} 
      borderColor={colors.border.default} 
      shadow="sm"
    >
      <HStack spacing={3} align="start">
        <Avatar size="sm" name={userName} src={userAvatarSrc} mt={1} />
        <VStack align="start" spacing={1} flex={1}>
          <HStack justifyContent="space-between" w="full">
            <Text fontWeight="bold" fontSize="sm">{userName}</Text>
            <Text fontSize="xs" color={colors.text.muted}>
              {format(parseISO(entry.createdAt), 'MMM d, yyyy • h:mm a')} 
            </Text>
          </HStack>
          <Text fontSize="sm" color={colors.text.secondary}>
            {eventDescription}
          </Text>
          {entry.changes && (
            <Box pt={1} fontSize="sm">
              {renderChanges(entry.eventType, entry.changes)}
            </Box>
          )}
        </VStack>
      </HStack>
    </Box>
  );
};

export default DealHistoryItem; 