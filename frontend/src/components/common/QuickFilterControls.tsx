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
}

const QuickFilterControls: React.FC<QuickFilterControlsProps> = ({
  availableFilters,
  activeFilterKey,
  onSelectFilter,
}) => {
  // Ensure "All" or a default filter is conceptually part of how filters are managed,
  // even if not explicitly in availableFilters prop.
  // Here, we assume the parent can pass a filter with key 'all' or handle null activeFilterKey as "All".

  return (
    <HStack spacing={2}>
      <ButtonGroup size="sm" isAttached variant="outline">
        {availableFilters.map((filter) => (
          <Button
            key={filter.key}
            isActive={activeFilterKey === filter.key}
            onClick={() => onSelectFilter(filter.key === activeFilterKey ? null : filter.key)} // Toggle or select
            //variant={activeFilterKey === filter.key ? 'solid' : 'outline'} // Using isActive for styling
          >
            {filter.label}
          </Button>
        ))}
      </ButtonGroup>
    </HStack>
  );
};

export default QuickFilterControls; 