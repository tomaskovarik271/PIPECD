import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Input,
  VStack,
  HStack,
  Text,
  Button,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverBody,
  Tag,
  TagCloseButton,
  useOutsideClick,
  Spinner,
  Alert,
  AlertIcon,
} from '@chakra-ui/react';
import { AddIcon } from '@chakra-ui/icons';
import { useThemeColors } from '../../hooks/useThemeColors';
import { gqlClient } from '../../lib/graphqlClient';
import { 
  GET_LABEL_SUGGESTIONS_QUERY, 
  ADD_DEAL_LABEL_MUTATION,
  GET_POPULAR_LABELS_QUERY 
} from '../../lib/graphql/dealLabelsOperations';

// Types
interface LabelSuggestion {
  labelText: string;
  usageCount: number;
  colorHex: string;
  isExactMatch: boolean;
  similarityScore: number;
}

interface LabelInputProps {
  dealId: string;
  onLabelAdded?: (labelText: string, colorHex: string) => void;
  placeholder?: string;
  isDisabled?: boolean;
}

// Random colors for new labels
const LABEL_COLORS = [
  '#3182CE', // blue.500
  '#38A169', // green.500
  '#DD6B20', // orange.500
  '#9F7AEA', // purple.500
  '#E53E3E', // red.500
  '#00B5D8', // cyan.500
  '#D69E2E', // yellow.500
  '#EC407A', // pink.500
  '#26A69A', // teal.500
  '#8D4E85', // purple.600
];

const getRandomColor = (): string => {
  return LABEL_COLORS[Math.floor(Math.random() * LABEL_COLORS.length)];
};

export const LabelInput: React.FC<LabelInputProps> = ({
  dealId,
  onLabelAdded,
  placeholder = "Add label...",
  isDisabled = false
}) => {
  const colors = useThemeColors();
  const [inputValue, setInputValue] = useState('');
  const [suggestions, setSuggestions] = useState<LabelSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  useOutsideClick({
    ref: popoverRef,
    handler: () => setIsOpen(false),
  });

  // Fetch suggestions when input changes
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (inputValue.trim().length < 2) {
        setSuggestions([]);
        setIsOpen(false);
        return;
      }

      console.log('🏷️ LabelInput: Fetching suggestions for:', inputValue.trim());
      setIsLoading(true);
      setError(null);

      try {
        // Fetch suggestions from GraphQL API
        const response = await gqlClient.request<{
          suggestLabels: LabelSuggestion[];
        }>(GET_LABEL_SUGGESTIONS_QUERY, {
          input: inputValue.trim(),
          dealId: dealId,
          limit: 10
        });

        console.log('🏷️ LabelInput: Raw GraphQL response:', response);
        
        // Create a copy to avoid mutations
        const apiSuggestions = response.suggestLabels || [];
        const suggestions = [...apiSuggestions];
        
        console.log('🏷️ LabelInput: Found', apiSuggestions.length, 'API suggestions:', apiSuggestions);
        
        // Check if there's an exact match in API suggestions
        const hasExactMatch = apiSuggestions.some(s => s.isExactMatch);
        
        // If no exact match found and input is not empty, add the input as a new suggestion
        if (!hasExactMatch && inputValue.trim().length > 0) {
          // Check if the input is very similar to existing API suggestions
          const similarSuggestion = apiSuggestions.find(s => 
            s.similarityScore > 0.7 && 
            s.labelText.toLowerCase() !== inputValue.trim().toLowerCase()
          );
          
          if (similarSuggestion) {
            console.log('🏷️ LabelInput: Found similar suggestion:', similarSuggestion);
            // Add a note about the similar existing label
            suggestions.unshift({
              labelText: inputValue.trim(),
              usageCount: 0,
              colorHex: getRandomColor(),
              isExactMatch: false,
              similarityScore: 1.0
            });
          } else {
            // Add as new suggestion (only if no API suggestions found)
            if (apiSuggestions.length === 0) {
              console.log('🏷️ LabelInput: No API suggestions, adding input as new option');
              suggestions.unshift({
                labelText: inputValue.trim(),
                usageCount: 0,
                colorHex: getRandomColor(),
                isExactMatch: false,
                similarityScore: 1.0
              });
            }
          }
        }

        setSuggestions(suggestions);
        setIsOpen(suggestions.length > 0);
        console.log('🏷️ LabelInput: Set suggestions and isOpen:', { suggestions: suggestions.length, isOpen: suggestions.length > 0 });
      } catch (err) {
        console.error('🏷️ LabelInput: Error fetching suggestions:', err);
        setError('Failed to fetch suggestions');
        console.error('Error fetching suggestions:', err);
      } finally {
        setIsLoading(false);
      }
    };

    const debounceTimer = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(debounceTimer);
  }, [inputValue, dealId]);

  const handleAddLabel = async (labelText: string, colorHex: string) => {
    try {
      setIsLoading(true);
      setError(null);

      // Add label via GraphQL mutation
      const response = await gqlClient.request<{
        addLabelToDeal: {
          id: string;
          name: string;
          labels: Array<{
            id: string;
            labelText: string;
            colorHex: string;
          }>;
        };
      }>(ADD_DEAL_LABEL_MUTATION, {
        input: {
          dealId,
          labelText: labelText.trim(),
          colorHex
        }
      });

      // Success callback
      if (onLabelAdded) {
        onLabelAdded(labelText, colorHex);
      }

      // Reset form
      setInputValue('');
      setSuggestions([]);
      setIsOpen(false);
    } catch (err: any) {
      console.error('Error adding label:', err);
      
      // Extract the actual error message from GraphQL error
      let errorMessage = 'Failed to add label';
      
      if (err?.response?.errors?.[0]?.message) {
        errorMessage = err.response.errors[0].message;
      } else if (err?.message) {
        errorMessage = err.message;
      }
      
      // Show user-friendly error messages
      if (errorMessage.includes('already exists')) {
        setError('This label already exists on this deal');
      } else if (errorMessage.includes('Similar label')) {
        // Extract the similar label name from the error message
        const match = errorMessage.match(/Similar label "([^"]+)" already exists/);
        if (match) {
          setError(`Similar label "${match[1]}" already exists on this deal`);
        } else {
          setError('A similar label already exists on this deal');
        }
      } else {
        setError(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      e.preventDefault();
      const suggestion = suggestions.find(s => s.isExactMatch) || suggestions[0];
      if (suggestion) {
        handleAddLabel(suggestion.labelText, suggestion.colorHex);
      }
    }
    if (e.key === 'Escape') {
      setIsOpen(false);
      inputRef.current?.blur();
    }
  };

  return (
    <Box position="relative" ref={popoverRef}>
      <Popover 
        isOpen={isOpen} 
        placement="bottom-start"
        closeOnBlur={false}
        closeOnEsc={true}
      >
        <PopoverTrigger>
          <Input
            ref={inputRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyPress}
            onFocus={() => inputValue.trim().length >= 2 && setIsOpen(true)}
            placeholder={placeholder}
            size="sm"
            isDisabled={isDisabled}
            bg={colors.bg.input}
            borderColor={colors.border.default}
            _hover={{ borderColor: colors.border.emphasis }}
            _focus={{ 
              borderColor: colors.text.link, 
              boxShadow: `0 0 0 1px ${colors.text.link}` 
            }}
          />
        </PopoverTrigger>
        
        <PopoverContent
          bg={colors.bg.elevated}
          borderColor={colors.border.default}
          boxShadow="lg"
          maxW="300px"
          w="auto"
        >
          <PopoverBody p={2}>
            {isLoading ? (
              <HStack spacing={2} p={2}>
                <Spinner size="sm" />
                <Text fontSize="sm" color={colors.text.muted}>
                  Loading suggestions...
                </Text>
              </HStack>
            ) : error ? (
              <Alert status="error" size="sm">
                <AlertIcon />
                {error}
              </Alert>
            ) : suggestions.length > 0 ? (
              <VStack spacing={1} align="stretch">
                {suggestions.map((suggestion, index) => (
                  <HStack
                    key={index}
                    p={2}
                    borderRadius="md"
                    cursor="pointer"
                    _hover={{ bg: colors.bg.elevated }}
                    onClick={() => handleAddLabel(suggestion.labelText, suggestion.colorHex)}
                    justify="space-between"
                  >
                    <HStack spacing={2}>
                      <Tag
                        size="sm"
                        colorScheme="blue"
                        bg={suggestion.colorHex}
                        color="white"
                        borderRadius="full"
                      >
                        {suggestion.labelText}
                      </Tag>
                      {suggestion.usageCount > 0 && (
                        <Text fontSize="xs" color={colors.text.muted}>
                          Used {suggestion.usageCount} time{suggestion.usageCount !== 1 ? 's' : ''}
                        </Text>
                      )}
                      {suggestion.usageCount === 0 && (
                        <Text fontSize="xs" color={colors.text.muted} fontStyle="italic">
                          New label
                        </Text>
                      )}
                    </HStack>
                    {suggestion.isExactMatch && (
                      <Text fontSize="xs" color={colors.text.success}>
                        Exact match
                      </Text>
                    )}
                  </HStack>
                ))}
              </VStack>
            ) : (
              <Text fontSize="sm" color={colors.text.muted} p={2}>
                No suggestions found
              </Text>
            )}
          </PopoverBody>
        </PopoverContent>
      </Popover>
    </Box>
  );
}; 