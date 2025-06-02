import { Box, Text, VStack, HStack, Avatar, UnorderedList, ListItem, chakra } from '@chakra-ui/react';
import { format, parseISO } from 'date-fns';
import { DealHistoryEntryDisplayItem } from './DealHistoryList'; // Import the type
import { useAppStore, DealWithHistory } from '../../stores/useAppStore'; // Added store import and DealWithHistory
import { useUserListStore, UserListItem } from '../../stores/useUserListStore'; // ADDED
import { CustomFieldDefinition, Person, Organization, WfmStatus } from '../../generated/graphql/graphql'; // For typing, changed Stage to WfmStatus
import { useEffect } from 'react'; // ADDED

interface DealHistoryItemProps {
  entry: DealHistoryEntryDisplayItem;
}

// Keep fieldDisplayNames for core fields, custom fields will be handled separately
const coreFieldDisplayNames: Record<string, string> = {
  name: 'Name',
  stage_id: 'Stage',
  amount: 'Amount',
  expected_close_date: 'Expected Close Date',
  person_id: 'Person',
  organization_id: 'Organization',
  assigned_to_user_id: 'Assigned To', // ADDED for clarity
  deal_specific_probability: 'Deal Specific Probability',
  // We will handle custom_field_values explicitly in renderChanges
};


const DealHistoryItem: React.FC<DealHistoryItemProps> = ({ entry }) => {
  // Access currentDeal which contains the current deal's stage, person, org, and CF definitions
  const currentDeal = useAppStore((state) => state.currentDeal);
  const { users, fetchUsers, hasFetched: usersHaveBeenFetched } = useUserListStore(); // ADDED

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
    return Array.from(definitionsMap.values());
  };
  const availableCustomFieldDefinitions = getCustomFieldDefinitionsFromCurrentDeal();

  const formatSingleCustomFieldValue = (definitionId: string, value: any): string => {
    const definition = availableCustomFieldDefinitions.find(def => def.id === definitionId);
    if (value === null || value === undefined) return 'N/A';
    if (!definition) return String(value); // Fallback if no definition found

    switch (definition.fieldType) {
      case 'TEXT':
        return String(value);
      case 'NUMBER':
        return Number(value).toLocaleString();
      case 'BOOLEAN':
        return value ? 'Yes' : 'No';
      case 'DATE':
        try {
          return format(parseISO(String(value)), 'MMM d, yyyy');
        } catch (e) {
          return String(value);
        }
      case 'DROPDOWN': {
        const option = definition.dropdownOptions?.find(opt => opt.value === String(value));
        return option?.label || String(value);
      }
      case 'MULTI_SELECT': {
        if (Array.isArray(value)) {
          return value.map((v: string) => {
            const option = definition.dropdownOptions?.find(opt => opt.value === v);
            return option?.label || v;
          }).join(', ');
        }
        return String(value);
      }
      default:
        return String(value);
    }
  };
  
  const formatHistoryFieldValue = (field: string, value: any): string => {
    if (value === null || value === undefined) return 'N/A';
    switch (field) {
      case 'amount':
        return `$${Number(value).toLocaleString()}`;
      case 'deal_specific_probability':
        return `${Number(value) * 100}%`;
      case 'expected_close_date':
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
        return getUserDisplayNameById(String(value));
      case 'person_id': {
        const person = currentDeal?.person;
        return (person && person.id === value) ? `${person.first_name || ''} ${person.last_name || ''}`.trim() || String(value) : String(value);
      }
      case 'organization_id': {
        const org = currentDeal?.organization;
        return (org && org.id === value) ? org.name : String(value);
      }
      // custom_field_values are handled by renderCustomFieldChanges
      default:
        return String(value);
    }
  };

  // Helper function to render changes
  const renderChanges = (eventType: string, changes: any): JSX.Element | string => {
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
            return <Text>Deal progress updated within status <chakra.strong>{newStatusName}</chakra.strong>.</Text>;
        }    
        return (
          <Text>
            Status changed from <chakra.strong>{oldStatusName}</chakra.strong> to <chakra.strong>{newStatusName}</chakra.strong>.
          </Text>
        );
      } catch (e) {
        console.error("Error parsing DEAL_WFM_STATUS_CHANGED data:", e, changes);
        // Fallback to JSON if parsing fails
        return <chakra.pre fontSize="xs" fontFamily="mono">{JSON.stringify(changes, null, 2)}</chakra.pre>;
      }
    }

    if (!changes || Object.keys(changes).length === 0) {
      return 'No specific changes logged.';
    }

    const renderListItem = (key: string, displayKey: string, value: any, oldValue?: any) => {
       if (key === 'custom_field_values') {
        // Special rendering for custom_field_values object
        if (typeof value === 'object' && value !== null) {
          return (
            <>
              {Object.entries(value).map(([cfId, cfVal]) => {
                // For DEAL_CREATED, cfVal is the direct value.
                // For DEAL_UPDATED, cfVal is an object { oldValue: ..., newValue: ... }
                const definition = availableCustomFieldDefinitions.find(def => def.id === cfId);
                const fieldLabel = definition?.fieldLabel || cfId;
                
                let changeText;
                if (eventType === 'DEAL_CREATED') {
                  changeText = formatSingleCustomFieldValue(cfId, cfVal);
                } else if (eventType === 'DEAL_UPDATED' && typeof cfVal === 'object' && cfVal !== null && 'oldValue' in cfVal && 'newValue' in cfVal) {
                  const oldF = formatSingleCustomFieldValue(cfId, (cfVal as any).oldValue);
                  const newF = formatSingleCustomFieldValue(cfId, (cfVal as any).newValue);
                  changeText = <>changed from "{oldF}" to "{newF}"</>;
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
          {Object.entries(changes).map(([key, value]) => {
            // Special handling for custom_field_values during creation
            if (key === 'custom_field_values' && typeof value === 'object' && value !== null) {
              return Object.entries(value).map(([cfId, cfVal]) => {
                const definition = availableCustomFieldDefinitions.find(def => def.id === cfId);
                const fieldLabel = definition?.fieldLabel || cfId;
                return (
                  <ListItem key={cfId}>
                    <Text as="span" fontWeight="medium">{fieldLabel}:</Text> {formatSingleCustomFieldValue(cfId, cfVal)}
                  </ListItem>
                );
              });
            }
            // For other core fields during creation
            const displayName = coreFieldDisplayNames[key] || key;
            return renderListItem(key, displayName, value);
          })}
        </UnorderedList>
      );
    }

    if (eventType === 'DEAL_UPDATED') {
      const changeItems: JSX.Element[] = [];
      Object.entries(changes).forEach(([key, valueObj]: [string, any]) => {
        if (key === 'custom_field_values') {
          // Iterate through changed custom fields
          if (typeof valueObj === 'object' && valueObj !== null) {
            Object.entries(valueObj).forEach(([cfId, cfChange]) => {
              const definition = availableCustomFieldDefinitions.find(def => def.id === cfId);
              const fieldLabel = definition?.fieldLabel || cfId;
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
          const oldF = formatHistoryFieldValue(key, valueObj.oldValue);
          const newF = formatHistoryFieldValue(key, valueObj.newValue);
          if (oldF !== newF) {
            changeItems.push(renderListItem(key, displayName, valueObj.newValue, valueObj.oldValue));
          }
        }
      });
      if (changeItems.length === 0) return <Text>No visible field changes.</Text>; // Or specific message
      return <UnorderedList spacing={1} styleType="none" ml={0}>{changeItems}</UnorderedList>;
    }
    // Fallback for other event types or if structure is unexpected
    return <chakra.pre fontSize="xs" fontFamily="mono">{JSON.stringify(changes, null, 2)}</chakra.pre>;
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
      bg={{ base: 'white', _dark: 'gray.700' }} 
      borderColor={{ base: 'gray.200', _dark: 'gray.600' }} 
      shadow="sm"
    >
      <HStack spacing={3} align="start">
        <Avatar size="sm" name={userName} src={userAvatarSrc} mt={1} />
        <VStack align="start" spacing={1} flex={1}>
          <HStack justifyContent="space-between" w="full">
            <Text fontWeight="bold" fontSize="sm">{userName}</Text>
            <Text fontSize="xs" color={{ base: 'gray.500', _dark: 'gray.400' }}>
              {format(parseISO(entry.createdAt), 'MMM d, yyyy, h:mm a')} 
            </Text>
          </HStack>
          <Text fontSize="sm" color={{ base: 'gray.700', _dark: 'gray.200' }}>
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