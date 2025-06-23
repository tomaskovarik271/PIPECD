import { Button, ButtonGroup, HStack } from '@chakra-ui/react';
import { useThemeColors } from '../../hooks/useThemeColors';

export interface QuickFilter {
  key: string;
  label: string;
  // Criteria will be handled by the parent component that uses this filter key
}

interface QuickFilterControlsProps {
  availableFilters: QuickFilter[];
  activeFilterKey: string | null;
  onSelectFilter: (key: string | null) => void;
}

const QuickFilterControls: React.FC<QuickFilterControlsProps> = ({
  availableFilters,
  activeFilterKey,
  onSelectFilter,
}) => {
  const colors = useThemeColors();

  // Ensure "All" or a default filter is conceptually part of how filters are managed,
  // even if not explicitly in availableFilters prop.
  // Here, we assume the parent can pass a filter with key 'all' or handle null activeFilterKey as "All".

  return (
    <HStack spacing={2}>
      <ButtonGroup 
        size="sm" 
        isAttached 
        variant="outline"
      >
        {availableFilters.map((filter) => {
          const isActive = activeFilterKey === filter.key;

          return (
            <Button
              key={filter.key}
              isActive={isActive}
              onClick={() => onSelectFilter(isActive ? null : filter.key)}
              size="sm"
              variant="outline"
              bg={isActive ? colors.interactive.active : colors.bg.input}
              borderColor={isActive ? colors.interactive.active : colors.border.input}
              color={isActive ? colors.text.onAccent : colors.text.primary}
              _hover={{ 
                bg: isActive ? colors.interactive.active : colors.component.button.secondaryHover,
                borderColor: colors.border.focus
              }}
            >
              {filter.label}
            </Button>
          );
        })}
      </ButtonGroup>
    </HStack>
  );
};

export default QuickFilterControls; 