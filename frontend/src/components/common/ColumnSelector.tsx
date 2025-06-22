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
import { useThemeColors, useThemeStyles } from '../../hooks/useThemeColors'; // NEW: Use semantic tokens

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

  // NEW: Use semantic tokens instead of manual theme checking
  const colors = useThemeColors();
  const styles = useThemeStyles();

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
    // Call the onReset callback to notify parent component
    onReset();
    onClose();
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
      <ModalOverlay bg={colors.component.modal.overlay} /> {/* NEW: Semantic token */}
      <ModalContent {...styles.modal.content}> {/* NEW: Theme-aware styles */}
        <ModalHeader 
          color={colors.text.primary} // NEW: Semantic token
          borderBottomWidth="1px"
          borderColor={colors.border.default} // NEW: Semantic token
        >
          Select Columns to Display
        </ModalHeader>
        <ModalCloseButton 
          color={colors.text.primary} // NEW: Semantic token
          _hover={{ bg: colors.component.button.ghostHover }} // NEW: Semantic token
        />
        <ModalBody pb={6}>
          <VStack spacing={4} align="stretch">
            <InputGroup>
              <InputLeftElement pointerEvents="none">
                <SearchIcon color={colors.text.muted} /> {/* NEW: Semantic token */}
              </InputLeftElement>
              <Input 
                placeholder="Search columns..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                {...styles.input} // NEW: Theme-aware styles
              />
            </InputGroup>
            
            <Box 
              maxHeight="40vh" 
              overflowY="auto" 
              borderWidth="1px" 
              borderColor={colors.border.default} // NEW: Semantic token
              borderRadius="md" 
              p={3}
              bg={colors.bg.elevated} // NEW: Semantic token
            >
              <VStack spacing={3} align="stretch">
                {actionsField && (
                  <Checkbox 
                    key={String(actionsField.key)} 
                    isChecked={selectedKeys.has(String(actionsField.key))} 
                    onChange={() => handleToggle(String(actionsField.key))}
                    isDisabled={selectedKeys.has(String(actionsField.key)) && selectedKeys.size === 1}
                    colorScheme="blue" // Keep colorScheme for the checkmark itself
                  >
                    <Text color={colors.text.primary}>{actionsField.header}</Text> {/* NEW: Semantic token */}
                  </Checkbox>
                )}
                {actionsField && (standardFields.length > 0 || customFields.length > 0) && (
                  <Divider my={2} borderColor={colors.border.divider}/> 
                )}

                {standardFields.length > 0 && (
                  <Text 
                    color={colors.text.secondary} // NEW: Semantic token
                    fontWeight="semibold"
                    borderBottomWidth="1px"
                    borderColor={colors.border.divider} // NEW: Semantic token
                    pb={1}
                    mb={2}
                  >
                    Standard Fields
                  </Text>
                )}
                {standardFields.map(col => (
                  <Checkbox 
                    key={String(col.key)} 
                    isChecked={selectedKeys.has(String(col.key))} 
                    onChange={() => handleToggle(String(col.key))}
                    colorScheme="blue"
                  >
                    <Text color={colors.text.primary}>{col.header}</Text> {/* NEW: Semantic token */}
                  </Checkbox>
                ))}

                {standardFields.length > 0 && customFields.length > 0 && (
                  <Divider my={2} borderColor={colors.border.divider}/> 
                )}

                {customFields.length > 0 && (
                  <Text 
                    color={colors.text.secondary} // NEW: Semantic token
                    fontWeight="semibold"
                    borderBottomWidth="1px"
                    borderColor={colors.border.divider} // NEW: Semantic token
                    pb={1}
                    mb={2}
                  >
                    Custom Fields
                  </Text>
                )}
                {customFields.map(col => (
                  <Checkbox 
                    key={String(col.key)} 
                    isChecked={selectedKeys.has(String(col.key))} 
                    onChange={() => handleToggle(String(col.key))}
                    colorScheme="blue"
                  >
                    <Text color={colors.text.primary}>{col.header}</Text> {/* NEW: Semantic token */}
                  </Checkbox>
                ))}
                
                {filteredColumns.length === 0 && searchTerm && (
                    <Text textAlign="center" color={colors.text.muted}> {/* NEW: Semantic token */}
                      No columns match "{searchTerm}".
                    </Text>
                )}
              </VStack>
            </Box>
          </VStack>
        </ModalBody>

        <ModalFooter 
          borderTopWidth="1px"
          borderColor={colors.border.default} // NEW: Semantic token
        >
          <HStack justifyContent="space-between" width="100%">
            <Button 
              variant="outline" 
              onClick={handleReset} 
              isDisabled={JSON.stringify(Array.from(selectedKeys).sort()) === JSON.stringify(defaultVisibleColumnKeys.sort())}
              {...styles.button.secondary} // NEW: Theme-aware styles
            >
              Reset to Defaults
            </Button>
            <Box>
              <Button 
                variant="ghost" 
                mr={3} 
                onClick={onClose}
                {...styles.button.ghost} // NEW: Theme-aware styles
              >
                Cancel
              </Button>
              <Button 
                colorScheme="blue" 
                onClick={handleApply}
                {...styles.button.primary} // NEW: Theme-aware styles
              >
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