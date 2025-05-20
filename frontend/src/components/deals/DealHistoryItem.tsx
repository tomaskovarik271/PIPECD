import { Box, Text, VStack, HStack, Avatar, UnorderedList, ListItem, chakra } from '@chakra-ui/react';
import { format, parseISO } from 'date-fns';
import { DealHistoryEntryDisplayItem } from './DealHistoryList'; // Import the type
import { useStagesStore, Stage } from '../../stores/useStagesStore';
import { usePeopleStore, Person } from '../../stores/usePeopleStore';
import { useOrganizationsStore, Organization } from '../../stores/useOrganizationsStore';
import { useCustomFieldDefinitionStore } from '../../stores/useCustomFieldDefinitionStore';
import { CustomFieldEntityType, CustomFieldType, CustomFieldDefinition, CustomFieldOption } from '../../generated/graphql/graphql';
import React, { useEffect, useState } from 'react';

interface DealHistoryItemProps {
  entry: DealHistoryEntryDisplayItem;
  stages: Stage[];
  people: Person[];
  organizations: Organization[];
  customFieldDefinitions: CustomFieldDefinition[];
}

const fieldDisplayNames: Record<string, string> = {
  name: 'Name',
  stage_id: 'Stage',
  amount: 'Amount',
  expected_close_date: 'Expected Close Date',
  person_id: 'Person',
  organization_id: 'Organization',
  deal_specific_probability: 'Deal Specific Probability',
  custom_field_values: 'Custom Fields', // Added for clarity
};

const formatIndividualFieldValue = (
  field: string, 
  value: any,
  stages: Stage[],
  people: Person[],
  organizations: Organization[],
  // customFieldDefinitions are handled separately for the array
): string => {
  if (value === null || value === undefined) return 'N/A';
  switch (field) {
    case 'amount':
      return `$${Number(value).toLocaleString()}`;
    case 'deal_specific_probability':
      return `${Number(value) * 100}%`;
    case 'expected_close_date':
      try {
        return format(parseISO(value), 'MMM d, yyyy'); // Assuming ISO string
      } catch (e) {
        return String(value); // Fallback if not a valid date string
      }
    case 'stage_id': {
      const stage = stages.find(s => s.id === value);
      return stage ? stage.name : `${value} (ID not found)`;
    }
    case 'person_id': {
      const person = people.find(p => p.id === value);
      return person ? `${person.first_name || ''} ${person.last_name || ''}`.trim() || person.email || `${value} (ID not found)` : `${value} (ID not found)`;
    }
    case 'organization_id': {
      const org = organizations.find(o => o.id === value);
      return org ? org.name : `${value} (ID not found)`;
    }
    default:
      return String(value);
  }
};

// Helper function to render changes
const renderChanges = (
  eventType: string, 
  changes: any,
  stages: Stage[],
  people: Person[],
  organizations: Organization[],
  customFieldDefinitions: CustomFieldDefinition[]
): JSX.Element | string => {
  if (eventType === 'DEAL_DELETED') {
    return 'This deal was deleted.';
  }
  if (!changes || Object.keys(changes).length === 0) {
    return 'No specific changes logged.';
  }

  if (eventType === 'DEAL_CREATED') {
    return (
      <UnorderedList spacing={1} styleType="none" ml={0}>
        {Object.entries(changes).map(([key, value]) => {
          if (key === 'custom_field_values' && Array.isArray(value)) {
            if (value.length === 0) {
              return (
                <ListItem key={key}>
                  <Text as="span" fontWeight="medium">{fieldDisplayNames[key] || key}:</Text> No custom fields set.
                </ListItem>
              );
            }
            return (
              <ListItem key={key}>
                <Text as="span" fontWeight="medium" mb={1} display="block">{fieldDisplayNames[key] || key}:</Text>
                <UnorderedList spacing={1} styleType="none" ml={2} pl={2} borderLeft="2px solid" borderColor="gray.200">
                  {value.map((cfValue: any, index: number) => {
                    const definition = customFieldDefinitions.find(def => def.id === cfValue.definitionId);
                    if (!definition) {
                      return <ListItem key={index}>Unknown custom field (ID: {cfValue.definitionId})</ListItem>;
                    }
                    let displayVal: React.ReactNode = 'N/A';
                    if (cfValue.stringValue !== undefined && cfValue.stringValue !== null) displayVal = cfValue.stringValue;
                    else if (cfValue.numberValue !== undefined && cfValue.numberValue !== null) displayVal = cfValue.numberValue.toString();
                    else if (cfValue.dateValue !== undefined && cfValue.dateValue !== null) {
                      try {
                        displayVal = format(parseISO(cfValue.dateValue), 'MMM d, yyyy');
                      } catch {
                        displayVal = cfValue.dateValue;
                      }
                    } else if (cfValue.booleanValue !== undefined && cfValue.booleanValue !== null) displayVal = cfValue.booleanValue ? 'Yes' : 'No';
                    else if (cfValue.selectedOptionValues && Array.isArray(cfValue.selectedOptionValues)) {
                      if (definition.fieldType === CustomFieldType.Dropdown) {
                        const opt = definition.dropdownOptions?.find((o: CustomFieldOption) => o.value === cfValue.selectedOptionValues[0]);
                        displayVal = opt ? opt.label : cfValue.selectedOptionValues[0] || 'N/A';
                      } else if (definition.fieldType === CustomFieldType.MultiSelect) {
                        displayVal = cfValue.selectedOptionValues.map((val: string) => {
                          const opt = definition.dropdownOptions?.find((o: CustomFieldOption) => o.value === val);
                          return opt ? opt.label : val;
                        }).join(', ') || 'N/A';
                      }
                    }
                     // Fallback for simple stringValue if type is DROPDOWN but no options matched or for TEXT
                    else if (definition.fieldType === CustomFieldType.Dropdown && cfValue.stringValue) {
                        const opt = definition.dropdownOptions?.find((o: CustomFieldOption) => o.value === cfValue.stringValue);
                        displayVal = opt ? opt.label : cfValue.stringValue;
                    }


                    return (
                      <ListItem key={definition.id}>
                        <Text as="span" fontWeight="normal">{definition.fieldLabel}:</Text> {displayVal}
                      </ListItem>
                    );
                  })}
                </UnorderedList>
              </ListItem>
            );
          }
          return (
            <ListItem key={key}>
              <Text as="span" fontWeight="medium">{fieldDisplayNames[key] || key}:</Text> {formatIndividualFieldValue(key, value, stages, people, organizations)}
            </ListItem>
          );
        })}
      </UnorderedList>
    );
  }

  if (eventType === 'DEAL_UPDATED') {
    return (
      <UnorderedList spacing={1} styleType="none" ml={0}>
        {Object.entries(changes).map(([key, value]: [string, any]) => {
           if (key === 'custom_field_values') {
            // For updates, custom_field_values might be complex.
            // A simple representation for now. Could be enhanced to show diff.
            return (
                <ListItem key={key}>
                    <Text as="span" fontWeight="medium">{fieldDisplayNames[key] || key}:</Text> Updated (details not fully displayed for custom field array changes).
                </ListItem>
            );
           }
          return (
          <ListItem key={key}>
            <Text as="span" fontWeight="medium">{fieldDisplayNames[key] || key}:</Text>
            {` changed from "${formatIndividualFieldValue(key, value.oldValue, stages, people, organizations)}" to "${formatIndividualFieldValue(key, value.newValue, stages, people, organizations)}"`}
          </ListItem>
        );
        })}
      </UnorderedList>
    );
  }
  // Fallback for other event types or if structure is unexpected
  return <chakra.pre fontSize="xs" fontFamily="mono">{JSON.stringify(changes, null, 2)}</chakra.pre>;
};

const DealHistoryItem: React.FC<DealHistoryItemProps> = ({ entry, stages, people, organizations, customFieldDefinitions }) => {
  const userName = entry.user?.display_name || 'System Action';
  // Placeholder for avatar, replace with actual avatar URL if available
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
              {renderChanges(entry.eventType, entry.changes, stages, people, organizations, customFieldDefinitions)}
            </Box>
          )}
        </VStack>
      </HStack>
    </Box>
  );
};

export default DealHistoryItem; 