import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Input,
  VStack,
  HStack,
  Text,
  Avatar,
  Spinner,
  useColorModeValue,
  Portal,
  InputProps,
  FormControl,
  FormLabel
} from '@chakra-ui/react';
import { useLazyQuery } from '@apollo/client';
import { FiMail } from 'react-icons/fi';
import { SEARCH_GOOGLE_CONTACTS } from '../../lib/graphql/calendarOperations';

interface ContactSuggestion {
  email: string;
  name?: string;
  photoUrl?: string;
}

interface EmailAutocompleteInputProps extends Omit<InputProps, 'value' | 'onChange'> {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  isRequired?: boolean;
}

export const EmailAutocompleteInput: React.FC<EmailAutocompleteInputProps> = ({
  value,
  onChange,
  label,
  placeholder = "Enter email addresses (comma-separated)",
  isRequired = false,
  ...inputProps
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<ContactSuggestion[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [currentInput, setCurrentInput] = useState('');
  
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const suggestionRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Theme colors
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const hoverBg = useColorModeValue('gray.50', 'gray.700');
  const selectedBg = useColorModeValue('blue.50', 'blue.900');

  // GraphQL query for contact suggestions
  const [searchContacts, { loading }] = useLazyQuery(SEARCH_GOOGLE_CONTACTS, {
    onCompleted: (data) => {
      setSuggestions(data.searchGoogleContacts || []);
      setSelectedIndex(-1);
    },
    onError: (error) => {
      console.error('Error fetching contact suggestions:', error);
      setSuggestions([]);
    }
  });

  // Extract current email being typed
  const getCurrentEmailInput = (inputValue: string, cursorPosition: number): string => {
    const emails = inputValue.split(',');
    let position = 0;
    
    for (const email of emails) {
      const emailEnd = position + email.length;
      if (cursorPosition <= emailEnd) {
        return email.trim();
      }
      position = emailEnd + 1; // +1 for comma
    }
    
    return emails[emails.length - 1]?.trim() || '';
  };

  // Handle input change
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value;
    onChange(newValue);
    
    const cursorPosition = event.target.selectionStart || 0;
    const currentEmail = getCurrentEmailInput(newValue, cursorPosition);
    setCurrentInput(currentEmail);

    // Search for contacts if we have at least 2 characters
    if (currentEmail.length >= 2) {
      searchContacts({ variables: { query: currentEmail } });
      setIsOpen(true);
    } else {
      setIsOpen(false);
      setSuggestions([]);
    }
  };

  // Handle suggestion selection
  const handleSuggestionClick = (suggestion: ContactSuggestion) => {
    const emails = value.split(',').map(e => e.trim());
    const cursorPosition = inputRef.current?.selectionStart || 0;
    
    // Find which email segment we're in
    let position = 0;
    let targetIndex = emails.length - 1;
    
    for (let i = 0; i < emails.length; i++) {
      const emailEnd = position + emails[i].length;
      if (cursorPosition <= emailEnd) {
        targetIndex = i;
        break;
      }
      position = emailEnd + 1;
    }

    // Replace the current email segment
    emails[targetIndex] = suggestion.email;
    
    // Clean up and join
    const newValue = emails.filter(email => email.length > 0).join(', ');
    onChange(newValue + (emails.length > 1 || newValue.endsWith(', ') ? '' : ', '));
    
    setIsOpen(false);
    setSuggestions([]);
    inputRef.current?.focus();
  };

  // Handle keyboard navigation
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (!isOpen || suggestions.length === 0) return;

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        event.preventDefault();
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        break;
      case 'Enter':
        event.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          handleSuggestionClick(suggestions[selectedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setSuggestions([]);
        setSelectedIndex(-1);
        break;
    }
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Scroll selected item into view
  useEffect(() => {
    if (selectedIndex >= 0 && suggestionRefs.current[selectedIndex]) {
      suggestionRefs.current[selectedIndex]?.scrollIntoView({
        block: 'nearest',
        behavior: 'smooth'
      });
    }
  }, [selectedIndex]);

  const renderSuggestion = (suggestion: ContactSuggestion, index: number) => (
    <Box
      key={`${suggestion.email}-${index}`}
      ref={el => { suggestionRefs.current[index] = el; }}
      p={3}
      bg={selectedIndex === index ? selectedBg : 'transparent'}
      _hover={{ bg: selectedIndex === index ? selectedBg : hoverBg }}
      cursor="pointer"
      onClick={() => handleSuggestionClick(suggestion)}
      borderRadius="md"
    >
      <HStack spacing={3}>
        <Avatar
          size="sm"
          name={suggestion.name || suggestion.email}
          src={suggestion.photoUrl}
          icon={<FiMail />}
        />
        <VStack align="start" spacing={0} flex={1} minW={0}>
          {suggestion.name && (
            <Text fontSize="sm" fontWeight="medium" isTruncated w="100%">
              {suggestion.name}
            </Text>
          )}
          <Text 
            fontSize="xs" 
            color="gray.500" 
            isTruncated 
            w="100%"
          >
            {suggestion.email}
          </Text>
        </VStack>
      </HStack>
    </Box>
  );

  return (
    <FormControl isRequired={isRequired}>
      {label && <FormLabel>{label}</FormLabel>}
      <Box position="relative" ref={containerRef}>
        <Input
          ref={inputRef}
          value={value}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (currentInput.length >= 2) {
              setIsOpen(true);
            }
          }}
          placeholder={placeholder}
          {...inputProps}
        />
        
        {isOpen && (
          <Portal>
            <Box
              position="fixed"
              zIndex={9999}
              bg={bgColor}
              border="1px solid"
              borderColor={borderColor}
              borderRadius="md"
              boxShadow="xl"
              maxH="300px"
              overflowY="auto"
              minW="200px"
              style={{
                width: containerRef.current?.offsetWidth || 'auto',
                left: containerRef.current?.getBoundingClientRect().left || 0,
                top: (containerRef.current?.getBoundingClientRect().bottom || 0) + 4
              }}
            >
              {loading && (
                <Box p={4} textAlign="center">
                  <Spinner size="sm" />
                  <Text fontSize="sm" color="gray.500" mt={2}>
                    Searching Gmail contacts...
                  </Text>
                </Box>
              )}
              
              {!loading && suggestions.length === 0 && currentInput.length >= 2 && (
                <Box p={4} textAlign="center">
                  <Text fontSize="sm" color="gray.500" mb={2}>
                    No contacts found for "{currentInput}"
                  </Text>
                  <Text fontSize="xs" color="gray.400">
                    Try searching by name or partial email
                  </Text>
                </Box>
              )}
              
              {!loading && suggestions.length === 0 && currentInput.length < 2 && isOpen && (
                <Box p={4} textAlign="center">
                  <Text fontSize="sm" color="gray.500">
                    Type at least 2 characters to search Gmail contacts
                  </Text>
                </Box>
              )}
              
              {!loading && suggestions.length > 0 && (
                <VStack spacing={0} align="stretch" p={2}>
                  {suggestions.map(renderSuggestion)}
                </VStack>
              )}
            </Box>
          </Portal>
        )}
      </Box>
    </FormControl>
  );
}; 