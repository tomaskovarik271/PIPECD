import React from 'react';
import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Tag,
  IconButton,
  HStack,
} from '@chakra-ui/react';
import { EditIcon, CheckIcon, NotAllowedIcon } from '@chakra-ui/icons';
import { CustomFieldDefinition } from '../../../generated/graphql/graphql';

interface CustomFieldDefinitionsTableProps {
  definitions: CustomFieldDefinition[];
  onEdit: (definition: CustomFieldDefinition) => void;
  onDeactivate: (id: string, label: string) => void;
  onReactivate: (id: string, label: string) => void;
  isSubmitting?: boolean;
  entityTypeName?: string;
}

export const CustomFieldDefinitionsTable: React.FC<CustomFieldDefinitionsTableProps> = React.memo(({
  definitions,
  onEdit,
  onDeactivate,
  onReactivate,
  isSubmitting = false,
  entityTypeName = '',
}) => {
  return (
    <Table variant="simple" size="sm">
      <Thead>
        <Tr>
          <Th>Label</Th>
          <Th>Name (Internal)</Th>
          <Th>Type</Th>
          <Th>Required</Th>
          <Th>Status</Th>
          <Th>Order</Th>
          <Th>Actions</Th>
        </Tr>
      </Thead>
      <Tbody>
        {definitions.length === 0 && (
          <Tr>
            <Td colSpan={7} textAlign="center">
              No custom field definitions found for {entityTypeName.toLowerCase()}.
            </Td>
          </Tr>
        )}
        {definitions.map((def: CustomFieldDefinition) => (
          <Tr key={def.id}>
            <Td>{def.fieldLabel}</Td>
            <Td><code>{def.fieldName}</code></Td>
            <Td>{def.fieldType}</Td>
            <Td>{def.isRequired ? 'Yes' : 'No'}</Td>
            <Td>
              <Tag colorScheme={def.isActive ? 'green' : 'red'}>
                {def.isActive ? 'Active' : 'Inactive'}
              </Tag>
            </Td>
            <Td>{def.displayOrder}</Td>
            <Td>
              <HStack spacing={2}>
                <IconButton 
                  aria-label="Edit definition" 
                  icon={<EditIcon />} 
                  size="sm" 
                  onClick={() => onEdit(def)}
                  isDisabled={isSubmitting}
                />
                {def.isActive ? (
                  <IconButton 
                    aria-label="Deactivate definition" 
                    icon={<NotAllowedIcon />} 
                    size="sm" 
                    colorScheme="red"
                    onClick={() => onDeactivate(def.id, def.fieldLabel)}
                    isDisabled={isSubmitting}
                  />
                ) : (
                  <IconButton 
                    aria-label="Reactivate definition" 
                    icon={<CheckIcon />} 
                    size="sm" 
                    colorScheme="green"
                    onClick={() => onReactivate(def.id, def.fieldLabel)}
                    isDisabled={isSubmitting}
                  />
                )}
              </HStack>
            </Td>
          </Tr>
        ))}
      </Tbody>
    </Table>
  );
});

CustomFieldDefinitionsTable.displayName = 'CustomFieldDefinitionsTable'; 