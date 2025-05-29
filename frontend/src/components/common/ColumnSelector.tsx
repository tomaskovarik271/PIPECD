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
import { useThemeStore } from '../../stores/useThemeStore';

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

  // Determine if modern theme is active for modal styling
  const currentThemeName = useThemeStore((state) => state.currentTheme);
  const isModernTheme = currentThemeName === 'modern';

  const modalContentStyles = isModernTheme ? {
    bg: "gray.800",
    color: "white",
    border: "1px solid",
    borderColor: "gray.600"
  } : {};

  const modalHeaderStyles = isModernTheme ? {
    color: "white",
    borderBottomWidth: "1px", // Add a divider below header
    borderColor: "gray.600"
  } : {};

  const modalCloseButtonStyles = isModernTheme ? {
    color: "white",
    _hover: { bg: "gray.700" }
  } : {};

  const checkboxTextStyles = isModernTheme ? {
    color: "gray.200" // Lighter gray for checkbox text for readability
  } : {};
  
  const sectionTextStyles = isModernTheme ? {
    color: "gray.100",
    borderBottomWidth: "1px",
    borderColor: "gray.700",
    pb: 1,
    mb: 2
  } : { fontWeight: "semibold" };

  const searchIconColor = isModernTheme ? "gray.400" : "gray.300";
  const inputStyles = isModernTheme ? {} : {}; // Will pick up from theme if modern

  const footerStyles = isModernTheme ? {
    borderTopWidth: "1px",
    borderColor: "gray.600"
  } : {};

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md" scrollBehavior="inside">
      <ModalOverlay bg={isModernTheme ? "blackAlpha.600" : undefined} />
      <ModalContent {...modalContentStyles}>
        <ModalHeader {...modalHeaderStyles}>Select Columns to Display</ModalHeader>
        <ModalCloseButton {...modalCloseButtonStyles} />
        <ModalBody pb={6}>
          <VStack spacing={4} align="stretch">
            <InputGroup>
              <InputLeftElement pointerEvents="none">
                <SearchIcon color={searchIconColor} />
              </InputLeftElement>
              <Input 
                placeholder="Search columns..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                // Theme should handle styling for modern: bg, color, borderColor, _placeholder, _focus
                // sx={inputStyles} // No longer needed if theme is applied correctly
              />
            </InputGroup>
            
            <Box maxHeight="40vh" overflowY="auto" borderWidth={isModernTheme ? "1px" : "1px"} borderColor={isModernTheme ? "gray.600" : "gray.200"} borderRadius="md" p={3}>
              <VStack spacing={3} align="stretch">
                {actionsField && (
                  <Checkbox 
                    key={String(actionsField.key)} 
                    isChecked={selectedKeys.has(String(actionsField.key))} 
                    onChange={() => handleToggle(String(actionsField.key))}
                    isDisabled={selectedKeys.has(String(actionsField.key)) && selectedKeys.size === 1}
                    colorScheme="blue" // Keep colorScheme for the checkmark itself
                  >
                    <Text {...checkboxTextStyles}>{actionsField.header}</Text>
                  </Checkbox>
                )}
                {actionsField && (standardFields.length > 0 || customFields.length > 0) && <Divider my={2} borderColor={isModernTheme ? "gray.600" : "gray.200"}/>}

                {standardFields.length > 0 && <Text {...sectionTextStyles}>Standard Fields</Text>}
                {standardFields.map(col => (
                  <Checkbox 
                    key={String(col.key)} 
                    isChecked={selectedKeys.has(String(col.key))} 
                    onChange={() => handleToggle(String(col.key))}
                    colorScheme="blue"
                  >
                    <Text {...checkboxTextStyles}>{col.header}</Text>
                  </Checkbox>
                ))}

                {standardFields.length > 0 && customFields.length > 0 && <Divider my={2} borderColor={isModernTheme ? "gray.600" : "gray.200"}/>}

                {customFields.length > 0 && <Text {...sectionTextStyles}>Custom Fields</Text>}
                {customFields.map(col => (
                  <Checkbox 
                    key={String(col.key)} 
                    isChecked={selectedKeys.has(String(col.key))} 
                    onChange={() => handleToggle(String(col.key))}
                    colorScheme="blue"
                  >
                    <Text {...checkboxTextStyles}>{col.header}</Text>
                  </Checkbox>
                ))}
                
                {filteredColumns.length === 0 && searchTerm && (
                    <Text textAlign="center" color={isModernTheme ? "gray.400" : "gray.500"}>No columns match "{searchTerm}".</Text>
                )}
              </VStack>
            </Box>
          </VStack>
        </ModalBody>

        <ModalFooter {...footerStyles}>
          <HStack justifyContent="space-between" width="100%">
            <Button variant="outline" onClick={handleReset} isDisabled={JSON.stringify(Array.from(selectedKeys).sort()) === JSON.stringify(defaultVisibleColumnKeys.sort())}>
              Reset to Defaults
            </Button>
            <Box>
              <Button variant={isModernTheme? "outline" : "ghost"} mr={3} onClick={onClose} sx={isModernTheme ? {color: "gray.300", _hover:{bg:"gray.700"}} : {}}>
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