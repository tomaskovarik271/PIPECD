import React from 'react';
import {
  HStack,
  Button,
  Menu,
  MenuButton,
  MenuList,
  MenuDivider,
  VStack,
  Text,
  Box,
  IconButton,
  Tooltip,
  Badge,
} from '@chakra-ui/react';
import { 
  ChevronDownIcon, 
  SettingsIcon,
  SearchIcon,
  CloseIcon,
} from '@chakra-ui/icons';
import { FiFilter, FiTag } from 'react-icons/fi';
import { LabelFilter } from './LabelFilter';
import { useThemeColors } from '../../hooks/useThemeColors';

interface ConsolidatedFilterBarProps {
  // Label filtering
  selectedLabels: Array<{ labelText: string; colorHex: string }>;
  onLabelsChange: (labels: Array<{ labelText: string; colorHex: string }>) => void;
  labelFilterLogic: 'AND' | 'OR';
  onLogicChange: (logic: 'AND' | 'OR') => void;
  
  // Advanced filtering
  isUsingAdvancedFilters: boolean;
  onOpenAdvancedFilter: () => void;
  onClearAdvancedFilters: () => void;
  
  // Column management
  showColumnSelector?: boolean;
  onOpenColumnSelector?: () => void;
  
  // General
  isDisabled?: boolean;
}

export const ConsolidatedFilterBar: React.FC<ConsolidatedFilterBarProps> = ({
  selectedLabels,
  onLabelsChange,
  labelFilterLogic,
  onLogicChange,
  isUsingAdvancedFilters,
  onOpenAdvancedFilter,
  onClearAdvancedFilters,
  showColumnSelector = true,
  onOpenColumnSelector,
  isDisabled = false,
}) => {
  const colors = useThemeColors();

  // Calculate total active filters for badge
  const activeFilterCount = (selectedLabels.length > 0 ? 1 : 0) + (isUsingAdvancedFilters ? 1 : 0);
  const hasActiveFilters = activeFilterCount > 0;

  return (
    <HStack spacing={3} align="center">
      {/* Filters Dropdown Menu */}
      <Menu>
        <MenuButton
          as={Button}
          rightIcon={<ChevronDownIcon />}
          leftIcon={<FiFilter />}
          size="md"
          height="40px"
          minW="120px"
          variant={hasActiveFilters ? "solid" : "outline"}
          colorScheme={hasActiveFilters ? "blue" : "gray"}
          isDisabled={isDisabled}
          position="relative"
        >
          <HStack spacing={2} align="center">
            <Text>Filters</Text>
            {hasActiveFilters && (
              <Badge
                colorScheme="blue"
                borderRadius="full"
                fontSize="xs"
                minW="18px"
                h="18px"
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                {activeFilterCount}
              </Badge>
            )}
          </HStack>
        </MenuButton>
        <MenuList minW="320px" p={4}>
          <VStack spacing={4} align="stretch">
            {/* Labels Section */}
            <Box>
              <HStack align="center" mb={3}>
                <FiTag />
                <Text fontWeight="semibold" fontSize="sm">
                  Label Filters
                </Text>
              </HStack>
                             <LabelFilter
                 selectedLabels={selectedLabels}
                 onLabelsChange={onLabelsChange}
                 filterLogic={labelFilterLogic}
                 onLogicChange={onLogicChange}
                 isDisabled={isDisabled || isUsingAdvancedFilters}
               />
            </Box>

            <MenuDivider />

            {/* Advanced Filters Section */}
            <Box>
              <HStack align="center" mb={3}>
                <SearchIcon />
                <Text fontWeight="semibold" fontSize="sm">
                  Advanced Filters
                </Text>
                {isUsingAdvancedFilters && (
                  <Badge colorScheme="blue" size="sm">
                    Active
                  </Badge>
                )}
              </HStack>
              <VStack spacing={2} align="stretch">
                <Button
                  leftIcon={<SearchIcon />}
                  onClick={onOpenAdvancedFilter}
                  size="sm"
                  variant={isUsingAdvancedFilters ? "solid" : "outline"}
                  colorScheme={isUsingAdvancedFilters ? "blue" : "gray"}
                  isDisabled={isDisabled}
                  w="full"
                >
                  {isUsingAdvancedFilters ? 'Edit Filters' : 'Advanced Filters'}
                </Button>
                {isUsingAdvancedFilters && (
                  <Button
                    leftIcon={<CloseIcon />}
                    onClick={onClearAdvancedFilters}
                    size="sm"
                    variant="ghost"
                    colorScheme="red"
                    w="full"
                  >
                    Clear All Filters
                  </Button>
                )}
              </VStack>
            </Box>
          </VStack>
        </MenuList>
      </Menu>

      {/* Quick Filter Status */}
      {hasActiveFilters && (
        <Text fontSize="sm" color={colors.text.muted}>
          {isUsingAdvancedFilters ? 'Advanced filters active' : 
           selectedLabels.length > 0 ? `${selectedLabels.length} label${selectedLabels.length > 1 ? 's' : ''} selected` : ''}
        </Text>
      )}

      {/* Column Selector */}
      {showColumnSelector && onOpenColumnSelector && (
        <Tooltip label="Manage Columns" placement="top">
          <Button 
            leftIcon={<SettingsIcon />} 
            onClick={onOpenColumnSelector}
            size="md"
            height="40px"
            minW="110px"
            variant="outline"
            isDisabled={isDisabled}
          >
            Columns
          </Button>
        </Tooltip>
      )}
    </HStack>
  );
}; 