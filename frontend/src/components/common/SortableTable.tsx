import React, { useState, useMemo } from 'react';
import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
} from '@chakra-ui/react';
import { TriangleDownIcon, TriangleUpIcon } from '@chakra-ui/icons';
import { useThemeColors, useThemeStyles } from '../../hooks/useThemeColors';

// Generic Column Definition
export interface ColumnDefinition<T> {
  key: keyof T | string; // Can be a key of T or a custom string for non-direct fields
  header: string;
  renderCell: (item: T) => React.ReactNode;
  isSortable: boolean;
  isNumeric?: boolean;
  sortAccessor?: (item: T) => unknown; // Changed any to unknown
}

// Sort Configuration
interface SortConfig {
  key: string;
  direction: 'ascending' | 'descending';
}

// Component Props
interface SortableTableProps<T extends { id: string }> {
  data: T[];
  columns: ColumnDefinition<T>[];
  initialSortKey: string; // Use string to match ColumnDefinition key type
  initialSortDirection?: 'ascending' | 'descending';
  // Include TableContainer props if needed, e.g., borderWidth, borderRadius
  borderWidth?: string | number;
  borderRadius?: string | number;
}

function SortableTable<T extends { id: string }>({ 
  data, 
  columns, 
  initialSortKey, 
  initialSortDirection = 'ascending',
  borderWidth: propBorderWidth, // Renamed to avoid conflict, will be conditional
  borderRadius: propBorderRadius // Renamed to avoid conflict
}: SortableTableProps<T>) {
  
  const colors = useThemeColors();
  const styles = useThemeStyles();

  const [sortConfig, setSortConfig] = useState<SortConfig>({ 
      key: initialSortKey,
      direction: initialSortDirection 
  });

  const requestSort = (key: string) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const sortedData = useMemo(() => {
    const sortableItems = [...data];
    const currentColumn = columns.find(col => col.key === sortConfig.key);
    
    if (!currentColumn?.isSortable) return sortableItems; // Return unsorted if column not found or not sortable

    sortableItems.sort((a, b) => {
        // Use sortAccessor if provided, otherwise direct key access
        const getSortValue = (item: T) => {
            if (currentColumn.sortAccessor) {
                return currentColumn.sortAccessor(item);
            }
            // Fallback to direct key access using sortConfig.key
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            return (item as any)[sortConfig.key]; 
        };

        let aValue = getSortValue(a);
        let bValue = getSortValue(b);

        // Basic type handling for comparison (can be expanded)
        if (typeof aValue === 'string' && typeof bValue === 'string') {
            aValue = aValue.toLowerCase();
            bValue = bValue.toLowerCase();
        } else if (aValue instanceof Date && bValue instanceof Date) {
             aValue = aValue.getTime();
             bValue = bValue.getTime();
        } else if (typeof aValue === 'boolean' && typeof bValue === 'boolean') {
             aValue = aValue ? 1 : 0;
             bValue = bValue ? 1 : 0;
        }
        
        // Handle null/undefined consistently (e.g., sort to end when ascending)
        const isAscending = sortConfig.direction === 'ascending';
        if (aValue == null && bValue != null) return isAscending ? 1 : -1;
        if (aValue != null && bValue == null) return isAscending ? -1 : 1;
        if (aValue == null && bValue == null) return 0;

        // Standard comparison
        if (aValue < bValue) return isAscending ? -1 : 1;
        if (aValue > bValue) return isAscending ? 1 : -1;
        return 0;
    });
    return sortableItems;
  }, [data, columns, sortConfig]);

  const renderSortIcon = (columnKey: string) => {
      if (sortConfig.key !== columnKey) return null;
      return sortConfig.direction === 'ascending' ? 
             <TriangleUpIcon aria-label="sorted ascending" ml={1} w={3} h={3} color={colors.text.secondary} /> : 
             <TriangleDownIcon aria-label="sorted descending" ml={1} w={3} h={3} color={colors.text.secondary} />;
  };

  return (
    <TableContainer 
      width="100%" 
      borderWidth={propBorderWidth || "1px"}
      borderRadius={propBorderRadius || "md"}
      borderColor={colors.border.default}
    >
      <Table variant="unstyled" size="sm" width="100%">
        <Thead>
          <Tr 
            borderBottomWidth="1px" 
            borderColor={colors.component.table.border}
          >
            {columns.map((column) => (
              <Th
                key={String(column.key)}
                isNumeric={column.isNumeric}
                cursor={column.isSortable ? "pointer" : "default"}
                bg={colors.component.table.header}
                color={colors.text.secondary}
                fontWeight="semibold"
                textTransform="uppercase"
                fontSize="xs"
                py={3}
                px={4}
                borderBottomWidth="0px"
                _hover={column.isSortable ? { 
                  bg: colors.component.table.rowHover
                } : {}}
                onClick={column.isSortable ? () => requestSort(String(column.key)) : undefined}
              >
                {column.header}
                {column.isSortable && renderSortIcon(String(column.key))}
              </Th>
            ))}
          </Tr>
        </Thead>
        <Tbody>
          {sortedData.map((item) => (
            <Tr 
              key={item.id} 
              bg={colors.component.table.row}
              borderBottomWidth="1px"
              borderColor={colors.component.table.border}
              _hover={{ 
                bg: colors.component.table.rowHover
              }}
            >
              {columns.map((column) => (
                <Td 
                  key={`${item.id}-${String(column.key)}`}
                  isNumeric={column.isNumeric}
                  color={colors.text.primary}
                  borderColor={colors.component.table.border}
                  py={3}
                  px={4}
                >
                  {column.renderCell(item)}
                </Td>
              ))}
            </Tr>
          ))}
        </Tbody>
      </Table>
    </TableContainer>
  );
}

export default SortableTable; 