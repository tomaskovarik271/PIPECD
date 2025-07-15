import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  VStack,
  HStack,
  Text,
  Tag,
  TagCloseButton,
  Checkbox,
  Select,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverHeader,
  PopoverBody,
  PopoverCloseButton,
  Badge,
  Divider,
  Spinner,
  Alert,
  AlertIcon,
} from '@chakra-ui/react';
import { ChevronDownIcon, CloseIcon } from '@chakra-ui/icons';
import { FiFilter as FilterIcon } from 'react-icons/fi';
import { useThemeColors } from '../../hooks/useThemeColors';
import { gqlClient } from '../../lib/graphqlClient';
import { GET_POPULAR_LABELS_QUERY } from '../../lib/graphql/dealLabelsOperations';

// Types
interface LabelSuggestion {
  labelText: string;
  colorHex: string;
  usageCount: number;
  isExactMatch: boolean;
  similarityScore?: number;
}

interface SelectedLabel {
  labelText: string;
  colorHex: string;
}

interface LabelFilterProps {
  selectedLabels: SelectedLabel[];
  onLabelsChange: (labels: SelectedLabel[]) => void;
  filterLogic: 'AND' | 'OR';
  onLogicChange: (logic: 'AND' | 'OR') => void;
  isDisabled?: boolean;
}

export const LabelFilter: React.FC<LabelFilterProps> = ({
  selectedLabels,
  onLabelsChange,
  filterLogic,
  onLogicChange,
  isDisabled = false
}) => {
  const colors = useThemeColors();
  const [availableLabels, setAvailableLabels] = useState<LabelSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  // Fetch available labels
  useEffect(() => {
    const fetchAvailableLabels = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await gqlClient.request<{
          popularLabels: LabelSuggestion[];
        }>(GET_POPULAR_LABELS_QUERY, {
          limit: 10, // Fetch a few popular labels
        });

        if (response && response.popularLabels) {
          setAvailableLabels(response.popularLabels);
        } else {
          setError('Failed to fetch popular labels from the backend.');
        }
      } catch (err) {
        setError('Failed to fetch labels');
        console.error('Error fetching available labels:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAvailableLabels();
  }, []);

  const handleLabelToggle = (label: LabelSuggestion, isChecked: boolean) => {
    if (isChecked) {
      // Add label
      const newLabel: SelectedLabel = {
        labelText: label.labelText,
        colorHex: label.colorHex
      };
      onLabelsChange([...selectedLabels, newLabel]);
    } else {
      // Remove label
      onLabelsChange(selectedLabels.filter(l => l.labelText !== label.labelText));
    }
  };

  const handleRemoveLabel = (labelText: string) => {
    onLabelsChange(selectedLabels.filter(l => l.labelText !== labelText));
  };

  const clearAllFilters = () => {
    onLabelsChange([]);
  };

  const isLabelSelected = (labelText: string): boolean => {
    return selectedLabels.some(l => l.labelText === labelText);
  };

  const hasActiveFilters = selectedLabels.length > 0;

  return (
    <Box>
      <Popover 
        isOpen={isOpen} 
        onClose={() => setIsOpen(false)}
        placement="bottom-start"
      >
        <PopoverTrigger>
          <Button
            size="sm"
            variant="outline"
            leftIcon={<FilterIcon />}
            rightIcon={<ChevronDownIcon />}
            onClick={() => setIsOpen(!isOpen)}
            isDisabled={isDisabled}
            bg={hasActiveFilters ? colors.status.info : colors.bg.surface}
            borderColor={hasActiveFilters ? colors.status.info : colors.border.default}
            color={hasActiveFilters ? 'white' : colors.text.primary}
            _hover={{
              bg: hasActiveFilters ? colors.status.info : colors.bg.elevated,
              borderColor: hasActiveFilters ? colors.status.info : colors.border.emphasis
            }}
          >
            Labels
            {hasActiveFilters && (
              <Badge 
                ml={1} 
                colorScheme="white" 
                variant="solid" 
                fontSize="xs"
                bg="whiteAlpha.300"
              >
                {selectedLabels.length}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>

        <PopoverContent
          bg={colors.bg.elevated}
          borderColor={colors.border.default}
          boxShadow="lg"
          w="320px"
        >
          <PopoverHeader
            borderBottomColor={colors.border.default}
            fontWeight="semibold"
            color={colors.text.primary}
          >
            <HStack justify="space-between">
              <Text>Filter by Labels</Text>
              <PopoverCloseButton />
            </HStack>
          </PopoverHeader>

          <PopoverBody p={4}>
            <VStack spacing={4} align="stretch">
              {/* Filter Logic Selection */}
              {selectedLabels.length > 1 && (
                <Box>
                  <Text fontSize="sm" mb={2} color={colors.text.secondary}>
                    Filter Logic:
                  </Text>
                  <Select
                    size="sm"
                    value={filterLogic}
                    onChange={(e) => onLogicChange(e.target.value as 'AND' | 'OR')}
                    bg={colors.bg.input}
                    borderColor={colors.border.default}
                  >
                    <option value="AND">AND (match all labels)</option>
                    <option value="OR">OR (match any label)</option>
                  </Select>
                </Box>
              )}

              {/* Selected Labels */}
              {hasActiveFilters && (
                <Box>
                  <HStack justify="space-between" mb={2}>
                    <Text fontSize="sm" color={colors.text.secondary}>
                      Active Filters:
                    </Text>
                    <Button
                      size="xs"
                      variant="ghost"
                      colorScheme="red"
                      onClick={clearAllFilters}
                      leftIcon={<CloseIcon />}
                    >
                      Clear All
                    </Button>
                  </HStack>
                  <HStack spacing={2} wrap="wrap">
                    {selectedLabels.map((label) => (
                      <Tag
                        key={label.labelText}
                        size="sm"
                        bg={label.colorHex}
                        color="white"
                        borderRadius="full"
                      >
                        {label.labelText}
                        <TagCloseButton 
                          onClick={() => handleRemoveLabel(label.labelText)}
                          color="white"
                          _hover={{ bg: 'whiteAlpha.300' }}
                        />
                      </Tag>
                    ))}
                  </HStack>
                  <Divider mt={3} borderColor={colors.border.default} />
                </Box>
              )}

              {/* Available Labels */}
              <Box>
                <Text fontSize="sm" mb={3} color={colors.text.secondary}>
                  Available Labels:
                </Text>
                
                {isLoading ? (
                  <HStack spacing={2} justify="center" p={4}>
                    <Spinner size="sm" />
                    <Text fontSize="sm" color={colors.text.muted}>
                      Loading labels...
                    </Text>
                  </HStack>
                ) : error ? (
                  <Alert status="error" size="sm">
                    <AlertIcon />
                    {error}
                  </Alert>
                ) : availableLabels.length > 0 ? (
                  <VStack spacing={2} align="stretch" maxH="200px" overflowY="auto">
                    {availableLabels.map((label) => (
                      <HStack
                        key={label.labelText}
                        p={2}
                        borderRadius="md"
                        _hover={{ bg: colors.bg.surface }}
                        cursor="pointer"
                        onClick={() => handleLabelToggle(label, !isLabelSelected(label.labelText))}
                      >
                        <Checkbox
                          isChecked={isLabelSelected(label.labelText)}
                          onChange={(e) => handleLabelToggle(label, e.target.checked)}
                          colorScheme="blue"
                          size="sm"
                        />
                        <HStack flex={1} justify="space-between">
                          <HStack spacing={2}>
                            <Tag
                              size="sm"
                              bg={label.colorHex}
                              color="white"
                              borderRadius="full"
                            >
                              {label.labelText}
                            </Tag>
                          </HStack>
                          <VStack spacing={0} align="end">
                            <Text fontSize="xs" color={colors.text.muted}>
                              {label.usageCount} total
                            </Text>
                          </VStack>
                        </HStack>
                      </HStack>
                    ))}
                  </VStack>
                ) : (
                  <Text fontSize="sm" color={colors.text.muted} textAlign="center" p={4}>
                    No labels found
                  </Text>
                )}
              </Box>
            </VStack>
          </PopoverBody>
        </PopoverContent>
      </Popover>
    </Box>
  );
}; 