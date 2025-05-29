import { Button, ButtonGroup, HStack } from '@chakra-ui/react';

export interface QuickFilter {
  key: string;
  label: string;
  // Criteria will be handled by the parent component that uses this filter key
}

interface QuickFilterControlsProps {
  availableFilters: QuickFilter[];
  activeFilterKey: string | null;
  onSelectFilter: (key: string | null) => void;
  isModernTheme?: boolean;
  buttonProps?: Record<string, any>;
}

const QuickFilterControls: React.FC<QuickFilterControlsProps> = ({
  availableFilters,
  activeFilterKey,
  onSelectFilter,
  isModernTheme,
  buttonProps = {},
}) => {
  // Ensure "All" or a default filter is conceptually part of how filters are managed,
  // even if not explicitly in availableFilters prop.
  // Here, we assume the parent can pass a filter with key 'all' or handle null activeFilterKey as "All".

  return (
    <HStack spacing={2}>
      <ButtonGroup 
        size="sm" 
        isAttached 
        variant={isModernTheme ? "outline" : "outline"}
      >
        {availableFilters.map((filter) => {
          const isActive = activeFilterKey === filter.key;
          let modernButtonStyles = {};
          if (isModernTheme && buttonProps) {
            modernButtonStyles = {
              ...buttonProps,
              bg: isActive ? buttonProps._active?.bg || "blue.600" : buttonProps.bg || "gray.700",
              borderColor: isActive ? buttonProps._active?.borderColor || "blue.500" : buttonProps.borderColor || "gray.500",
              color: buttonProps.color || "white",
              _hover: buttonProps._hover || { bg: "gray.600" }
            };
          }

          return (
            <Button
              key={filter.key}
              isActive={isActive}
              onClick={() => onSelectFilter(isActive ? null : filter.key)}
              size={isModernTheme ? (buttonProps?.size || "sm") : "sm"}
              {...(isModernTheme ? modernButtonStyles : {})}
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