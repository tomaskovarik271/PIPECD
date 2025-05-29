import React from 'react';
import {
  Box,
  Center,
  Flex,
  Heading,
  Icon,
  Link,
  Text,
  VStack,
} from '@chakra-ui/react';
import { ExternalLinkIcon, InfoIcon } from '@chakra-ui/icons';
import { CustomFieldDefinition, CustomFieldType, CustomFieldValue } from '../../generated/graphql/graphql';

interface DealCustomFieldsPanelProps {
  customFieldDefinitions: CustomFieldDefinition[];
  customFieldValues: CustomFieldValue[];
  getLinkDisplayDetails: (str: string | null | undefined) => {
    isUrl: boolean;
    displayText: string;
    fullUrl?: string;
    isKnownService?: boolean;
    icon?: React.ElementType;
  };
}

export const DealCustomFieldsPanel: React.FC<DealCustomFieldsPanelProps> = ({
  customFieldDefinitions,
  customFieldValues,
  getLinkDisplayDetails,
}) => {
  const hasCustomFields = customFieldDefinitions && customFieldValues && customFieldValues.length > 0;

  if (!hasCustomFields) {
    return (
      <>
        <Heading size="sm" mb={3} color="white">Custom Information</Heading>
        <Center minH="100px" flexDirection="column" bg="gray.750" borderRadius="md" p={4}>
          <Icon as={InfoIcon} w={6} h={6} color="gray.500" mb={3} />
          <Text color="gray.400" fontSize="sm">No custom information available.</Text>
        </Center>
      </>
    );
  }

  const processedCustomFields = customFieldValues
    .filter(cfv => customFieldDefinitions.find(cfd => cfd.id === cfv.definition.id)?.isActive)
    .sort((a, b) => {
      const defA = customFieldDefinitions.find(def => def.id === a.definition.id);
      const defB = customFieldDefinitions.find(def => def.id === b.definition.id);
      return (defA?.displayOrder || 0) - (defB?.displayOrder || 0);
    })
    .map(cfv => {
      let displayValue: string | React.ReactNode = '-';
      const definition = customFieldDefinitions.find(def => def.id === cfv.definition.id);
      
      if (!definition) return null;

      switch (definition.fieldType) {
        case CustomFieldType.Text:
          displayValue = cfv.stringValue || '-';
          if (cfv.stringValue && (cfv.stringValue.startsWith('http://') || cfv.stringValue.startsWith('https://'))) {
            const linkDetails = getLinkDisplayDetails(cfv.stringValue);
            if (linkDetails.isUrl) {
              displayValue = (
                <Link 
                  href={linkDetails.fullUrl} 
                  color="blue.400" 
                  isExternal 
                  _hover={{textDecoration: 'underline'}}
                >
                  {linkDetails.displayText} <ExternalLinkIcon mx='2px' />
                </Link>
              );
            }
          }
          break;
        case CustomFieldType.Number:
          displayValue = cfv.numberValue?.toString() || '-';
          break;
        case CustomFieldType.Boolean:
          displayValue = cfv.booleanValue ? 'Yes' : 'No';
          break;
        case CustomFieldType.Date:
          displayValue = cfv.dateValue ? new Date(cfv.dateValue).toLocaleDateString() : '-';
          break;
        case CustomFieldType.Dropdown:
        case CustomFieldType.MultiSelect:
          if (cfv.selectedOptionValues && cfv.selectedOptionValues.length > 0) {
            const selectedLabels = cfv.selectedOptionValues.map(val => {
              const opt = definition.dropdownOptions?.find(o => o.value === val);
              return opt ? opt.label : val;
            });
            displayValue = selectedLabels.join(', ');
          } else {
            displayValue = '-';
          }
          break;
        default:
          if (cfv.stringValue) displayValue = cfv.stringValue;
          else if (cfv.numberValue !== null && cfv.numberValue !== undefined) displayValue = cfv.numberValue.toString();
          else if (cfv.booleanValue !== null && cfv.booleanValue !== undefined) displayValue = cfv.booleanValue ? 'Yes' : 'No';
          else if (cfv.dateValue) displayValue = new Date(cfv.dateValue).toLocaleDateString();
          else displayValue = 'N/A';
          break;
      }

      return {
        id: definition.id,
        label: definition.fieldLabel || definition.fieldName,
        value: displayValue,
      };
    })
    .filter(Boolean);

  return (
    <>
      <Heading size="sm" mb={3} color="white">Custom Information</Heading>
      <VStack spacing={3} align="stretch" bg="gray.750" p={4} borderRadius="lg" borderWidth="1px" borderColor="gray.600">
        {processedCustomFields.map((field) => (
          <Flex 
            key={field!.id} 
            justifyContent="space-between" 
            alignItems="center" 
            py={1.5} 
            borderBottomWidth="1px" 
            borderColor="gray.650" 
            _last={{borderBottomWidth: 0}}
          >
            <Text fontSize="sm" color="gray.400" casing="capitalize">
              {field!.label}
            </Text>
            <Text fontSize="sm" color="gray.200" textAlign="right">
              {field!.value}
            </Text>
          </Flex>
        ))}
      </VStack>
    </>
  );
}; 