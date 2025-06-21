import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  Box,
  Input,
  VStack,
  Text,
  Button,
  useOutsideClick,
  Spinner,
  Alert,
  AlertIcon,
  HStack,
  Icon,
  Flex,
  useColorModeValue,
} from '@chakra-ui/react';
import { FiChevronDown, FiPlus, FiSearch } from 'react-icons/fi';
import { useThemeColors } from '../../hooks/useThemeColors';

export interface SearchableSelectOption {
  value: string;
  label: string;
  disabled?: boolean;
  // Additional properties for enhanced functionality
  isFromSelectedOrg?: boolean;
  organizationName?: string;
  personName?: string;
}

interface SearchableSelectProps {
  options: SearchableSelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  isLoading?: boolean;
  error?: string;
  isDisabled?: boolean;
  allowCreate?: boolean;
  createLabel?: string;
  onCreateNew?: () => void;
  maxHeight?: string;
}

const SearchableSelect: React.FC<SearchableSelectProps> = ({
  options,
  value,
  onChange,
  placeholder = "Select an option...",
  isLoading = false,
  error,
  isDisabled = false,
  allowCreate = false,
  createLabel = "Create New",
  onCreateNew,
  maxHeight = "200px",
}) => {
  const colors = useThemeColors();
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close dropdown when clicking outside
  useOutsideClick({
    ref: containerRef,
    handler: () => setIsOpen(false),
  });

  // Filter options based on search term
  const filteredOptions = useMemo(() => {
    if (!searchTerm.trim()) return options;
    return options.filter(option =>
      option.label.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [options, searchTerm]);

  // Get selected option for display
  const selectedOption = options.find(opt => opt.value === value);

  // Reset search and highlight when opening/closing
  useEffect(() => {
    if (isOpen) {
      setSearchTerm('');
      setHighlightedIndex(-1);
      // Focus the input when opening
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
        e.preventDefault();
        setIsOpen(true);
      }
      return;
    }

    const totalOptions = filteredOptions.length + (allowCreate ? 1 : 0);

    switch (e.key) {
      case 'Escape':
        setIsOpen(false);
        break;
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev => (prev + 1) % totalOptions);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => prev <= 0 ? totalOptions - 1 : prev - 1);
        break;
      case 'Enter':
        e.preventDefault();
        if (allowCreate && highlightedIndex === 0) {
          // Create new option (now at index 0)
          onCreateNew?.();
          setIsOpen(false);
        } else if (allowCreate && highlightedIndex > 0 && highlightedIndex <= filteredOptions.length) {
          // Select highlighted option (adjusted for create option at top)
          onChange(filteredOptions[highlightedIndex - 1].value);
          setIsOpen(false);
        } else if (!allowCreate && highlightedIndex >= 0 && highlightedIndex < filteredOptions.length) {
          // Select highlighted option (no create option)
          onChange(filteredOptions[highlightedIndex].value);
          setIsOpen(false);
        }
        break;
    }
  };

  const handleOptionClick = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  const handleCreateClick = () => {
    onCreateNew?.();
    setIsOpen(false);
  };

  return (
    <Box position="relative" ref={containerRef}>
      {/* Main Input/Button */}
      <Button
        width="100%"
        height="40px"
        justifyContent="space-between"
        rightIcon={<Icon as={FiChevronDown} transform={isOpen ? 'rotate(180deg)' : 'none'} transition="transform 0.2s" />}
        onClick={() => !isDisabled && setIsOpen(!isOpen)}
        isDisabled={isDisabled}
        variant="outline"
        bg={colors.bg.input}
        borderColor={colors.border.input}
        _hover={{
          borderColor: colors.interactive.hover,
          bg: colors.bg.elevated,
        }}
        _focus={{
          borderColor: colors.border.focus,
          boxShadow: `0 0 0 1px ${colors.border.focus}`,
        }}
        fontWeight="normal"
        textAlign="left"
        onKeyDown={handleKeyDown}
      >
        <Text
          color={selectedOption ? colors.text.primary : colors.text.muted}
          isTruncated
        >
          {selectedOption ? selectedOption.label : placeholder}
        </Text>
      </Button>

      {/* Dropdown Menu */}
      {isOpen && (
        <Box
          position="absolute"
          top="100%"
          left={0}
          right={0}
          zIndex={1000}
          mt={1}
          bg={colors.bg.elevated}
          border="1px solid"
          borderColor={colors.border.subtle}
          borderRadius="md"
          boxShadow="lg"
          maxHeight={maxHeight}
          overflow="hidden"
        >
          {/* Search Input */}
          <Box p={2} borderBottom="1px solid" borderColor={colors.border.subtle}>
            <HStack>
              <Icon as={FiSearch} color={colors.text.muted} />
              <Input
                ref={inputRef}
                placeholder="Type to search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                size="sm"
                border="none"
                bg="transparent"
                _focus={{ boxShadow: 'none' }}
                onKeyDown={handleKeyDown}
              />
            </HStack>
          </Box>

          {/* Loading State */}
          {isLoading && (
            <Flex justify="center" align="center" p={4}>
              <Spinner size="sm" mr={2} />
              <Text fontSize="sm" color={colors.text.muted}>Loading...</Text>
            </Flex>
          )}

          {/* Error State */}
          {error && (
            <Alert status="error" size="sm">
              <AlertIcon />
              <Text fontSize="sm">{error}</Text>
            </Alert>
          )}

          {/* Options List */}
          {!isLoading && !error && (
            <VStack spacing={0} align="stretch" maxHeight="160px" overflowY="auto">
              {filteredOptions.length === 0 && !allowCreate ? (
                <Box p={3} textAlign="center">
                  <Text fontSize="sm" color={colors.text.muted}>
                    No options found
                  </Text>
                </Box>
              ) : (
                <>
                  {/* Create New Option - MOVED TO TOP for better UX */}
                  {allowCreate && (
                    <>
                      <Button
                        variant="ghost"
                        justifyContent="flex-start"
                        height="auto"
                        p={3}
                        borderRadius={0}
                        bg={highlightedIndex === 0 ? colors.interactive.hover : 'transparent'}
                        _hover={{
                          bg: colors.interactive.hover,
                        }}
                        onClick={handleCreateClick}
                        fontWeight="semibold"
                        color={colors.text.accent}
                      >
                        <HStack spacing={2}>
                          <Icon as={FiPlus} />
                          <Text>{createLabel}</Text>
                        </HStack>
                      </Button>
                      {filteredOptions.length > 0 && (
                        <Box height="1px" bg={colors.border.subtle} mx={2} />
                      )}
                    </>
                  )}
                  
                  {filteredOptions.map((option, index) => (
                    <Button
                      key={option.value}
                      variant="ghost"
                      justifyContent="flex-start"
                      height="auto"
                      p={3}
                      borderRadius={0}
                      fontWeight={option.isFromSelectedOrg ? "semibold" : "normal"}
                      isDisabled={option.disabled}
                      bg={highlightedIndex === (allowCreate ? index + 1 : index) ? colors.interactive.hover : 'transparent'}
                      _hover={{
                        bg: colors.interactive.hover,
                      }}
                      onClick={() => handleOptionClick(option.value)}
                      borderLeft={option.isFromSelectedOrg ? "3px solid" : "3px solid transparent"}
                      borderLeftColor={option.isFromSelectedOrg ? colors.text.accent : "transparent"}
                    >
                      <Text 
                        isTruncated 
                        color={option.isFromSelectedOrg ? colors.text.accent : colors.text.primary}
                      >
                        {option.label}
                      </Text>
                    </Button>
                  ))}
                </>
              )}
            </VStack>
          )}
        </Box>
      )}
    </Box>
  );
};

export default SearchableSelect; 