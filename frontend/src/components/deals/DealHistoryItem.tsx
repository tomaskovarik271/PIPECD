import { Box, Text, VStack, HStack, Avatar, UnorderedList, ListItem, chakra } from '@chakra-ui/react';
import { format, parseISO } from 'date-fns';
import { DealHistoryEntryDisplayItem } from './DealHistoryList'; // Import the type
import { useAppStore, DealWithHistory } from '../../stores/useAppStore'; // Added store import and DealWithHistory
import { CustomFieldDefinition, Stage, Person, Organization } from '../../generated/graphql/graphql'; // For typing

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
  deal_specific_probability: 'Deal Specific Probability',
  // We will handle custom_field_values explicitly in renderChanges
};


const DealHistoryItem: React.FC<DealHistoryItemProps> = ({ entry }) => {
  // Access currentDeal which contains the current deal's stage, person, org, and CF definitions
  const currentDeal = useAppStore((state) => state.currentDeal);

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
        const stage = currentDeal?.stage;
        return (stage && stage.id === value) ? stage.name : String(value); // Use current deal's stage if ID matches
      }
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
          {Object.entries(changes).map(([key, value]) => 
            renderListItem(key, coreFieldDisplayNames[key] || key, value)
          )}
        </UnorderedList>
      );
    }

    if (eventType === 'DEAL_UPDATED') {
      return (
        <UnorderedList spacing={1} styleType="none" ml={0}>
          {Object.entries(changes).map(([key, valueObj]: [string, any]) => 
            renderListItem(key, coreFieldDisplayNames[key] || key, valueObj.newValue, valueObj.oldValue)
          )}
        </UnorderedList>
      );
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