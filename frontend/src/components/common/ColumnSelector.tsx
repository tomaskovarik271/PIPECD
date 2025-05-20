import React, { useState, useEffect } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  VStack,
  Checkbox,
  Text,
  InputGroup,
  InputLeftElement,
  Input,
  Box,
  Divider,
  HStack,
} from '@chakra-ui/react';
import { SearchIcon } from '@chakra-ui/icons';
import type { ColumnDefinition } from './SortableTable'; // Assuming SortableTable exports this

interface ColumnSelectorProps<T> {
  isOpen: boolean;
  onClose: () => void;
  allAvailableColumns: ColumnDefinition<T>[];
  currentVisibleColumnKeys: string[];
  defaultVisibleColumnKeys: string[];
  onApply: (newVisibleColumnKeys: string[]) => void;
  onReset: () => void;
  // tableKey: string; // Not directly needed by this component if callbacks handle it
}

function ColumnSelector<T>({
  isOpen,
  onClose,
  allAvailableColumns,
  currentVisibleColumnKeys,
  defaultVisibleColumnKeys,
  onApply,
  onReset,
}: ColumnSelectorProps<T>) {
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set(currentVisibleColumnKeys));
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    setSelectedKeys(new Set(currentVisibleColumnKeys));
  }, [currentVisibleColumnKeys, isOpen]); // Reset internal state when currentVisibleKeys change or modal opens

  const handleToggle = (key: string) => {
    setSelectedKeys(prev => {
      const newSet = new Set(prev);
      if (newSet.has(key)) {
        // Prevent unchecking the 'actions' column if it's the only one and meant to be sticky
        // This logic can be enhanced or made configurable if 'actions' is not always special
        if (key === 'actions' && newSet.size === 1) {
            return newSet; // Don't allow unchecking the last item if it's actions
        }
        newSet.delete(key);
      } else {
        newSet.add(key);
      }
      return newSet;
    });
  };

  const handleApply = () => {
    onApply(Array.from(selectedKeys));
    onClose();
  };

  const handleReset = () => {
    setSelectedKeys(new Set(defaultVisibleColumnKeys));
    // Intentionally not calling onApply here, user must explicitly apply reset
    // Or, if direct reset is preferred: 
    // onReset(); 
    // onClose(); 
  };

  const filteredColumns = allAvailableColumns.filter(col => 
    col.header.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Separate standard and custom fields for display, excluding 'actions' from main list if handled separately
  const standardFields = filteredColumns.filter(col => {
    const keyStr = String(col.key);
    return !keyStr.startsWith('cf_') && keyStr !== 'actions';
  });
  const customFields = filteredColumns.filter(col => String(col.key).startsWith('cf_'));
  const actionsField = filteredColumns.find(col => String(col.key) === 'actions');

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md" scrollBehavior="inside">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Select Columns to Display</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          <VStack spacing={4} align="stretch">
            <InputGroup>
              <InputLeftElement pointerEvents="none">
                <SearchIcon color="gray.300" />
              </InputLeftElement>
              <Input 
                placeholder="Search columns..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </InputGroup>
            
            <Box maxHeight="40vh" overflowY="auto" borderWidth="1px" borderRadius="md" p={3}>
              <VStack spacing={3} align="stretch">
                {actionsField && (
                  <Checkbox 
                    key={String(actionsField.key)} 
                    isChecked={selectedKeys.has(String(actionsField.key))} 
                    onChange={() => handleToggle(String(actionsField.key))}
                    isDisabled={selectedKeys.has(String(actionsField.key)) && selectedKeys.size === 1} // Cannot uncheck if it's the only one selected
                  >
                    {actionsField.header}
                  </Checkbox>
                )}
                {actionsField && (standardFields.length > 0 || customFields.length > 0) && <Divider my={2}/>}

                {standardFields.length > 0 && <Text fontWeight="semibold">Standard Fields</Text>}
                {standardFields.map(col => (
                  <Checkbox 
                    key={String(col.key)} 
                    isChecked={selectedKeys.has(String(col.key))} 
                    onChange={() => handleToggle(String(col.key))}
                  >
                    {col.header}
                  </Checkbox>
                ))}

                {standardFields.length > 0 && customFields.length > 0 && <Divider my={2}/>}

                {customFields.length > 0 && <Text fontWeight="semibold">Custom Fields</Text>}
                {customFields.map(col => (
                  <Checkbox 
                    key={String(col.key)} 
                    isChecked={selectedKeys.has(String(col.key))} 
                    onChange={() => handleToggle(String(col.key))}
                  >
                    {col.header}
                  </Checkbox>
                ))}
                
                {filteredColumns.length === 0 && searchTerm && (
                    <Text textAlign="center" color="gray.500">{`No columns match "${searchTerm}".`}</Text>
                )}
              </VStack>
            </Box>
          </VStack>
        </ModalBody>

        <ModalFooter>
          <HStack justifyContent="space-between" width="100%">
            <Button variant="outline" onClick={handleReset} isDisabled={JSON.stringify(Array.from(selectedKeys).sort()) === JSON.stringify(defaultVisibleColumnKeys.sort())}>
              Reset to Defaults
            </Button>
            <Box>
              <Button variant="ghost" mr={3} onClick={onClose}>
                Cancel
              </Button>
              <Button colorScheme="blue" onClick={handleApply}>
                Apply
              </Button>
            </Box>
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

export default ColumnSelector; 