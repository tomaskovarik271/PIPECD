import React, { useState, useMemo, useCallback } from 'react';
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
  // NEW: Modern UX props
  onRowClick?: (item: T) => void; // Optional row click handler
  excludeClickableColumns?: string[]; // Columns that shouldn't trigger row click (like actions)
  isRowClickable?: (item: T) => boolean; // Optional function to determine if row is clickable
}

function SortableTable<T extends { id: string }>({ 
  data, 
  columns, 
  initialSortKey, 
  initialSortDirection = 'ascending',
  borderWidth: propBorderWidth, // Renamed to avoid conflict, will be conditional
  borderRadius: propBorderRadius, // Renamed to avoid conflict
  onRowClick,
  excludeClickableColumns,
  isRowClickable
}: SortableTableProps<T>) {
  
  const colors = useThemeColors();
  const styles = useThemeStyles();

  const [sortConfig, setSortConfig] = useState<SortConfig>({ 
      key: initialSortKey,
      direction: initialSortDirection 
  });

  const requestSort = useCallback((key: string) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  }, [sortConfig.key, sortConfig.direction]);

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

  const renderSortIcon = useCallback((columnKey: string) => {
      if (sortConfig.key !== columnKey) return null;
      return sortConfig.direction === 'ascending' ? 
             <TriangleUpIcon aria-label="sorted ascending" ml={1} w={3} h={3} color={colors.text.secondary} /> : 
             <TriangleDownIcon aria-label="sorted descending" ml={1} w={3} h={3} color={colors.text.secondary} />;
  }, [sortConfig.key, sortConfig.direction, colors.text.secondary]);

  return (
    <TableContainer 
      width="100%" 
      borderWidth={propBorderWidth || "1px"}
      borderRadius={propBorderRadius || "md"}
      borderColor={colors.border.default}
      bg={colors.component.table.row}
      boxShadow={colors.shadows.table}
      position="relative"
      _before={styles.theme === 'industrialMetal' ? {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '3px',
        background: 'linear-gradient(90deg, rgba(255,170,0,0.3) 0%, rgba(255,170,0,0.1) 50%, rgba(255,170,0,0.3) 100%)',
        borderTopRadius: 'md'
      } : {}}
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
                position="relative"
                _hover={column.isSortable ? { 
                  bg: colors.component.table.rowHover,
                  color: colors.text.primary,
                  transform: styles.theme === 'industrialMetal' ? 'translateY(-1px)' : 'none',
                  boxShadow: styles.theme === 'industrialMetal' ? '0 2px 4px rgba(255,170,0,0.2)' : 'none',
                  transition: 'all 0.2s ease-in-out'
                } : {}}
                _before={styles.theme === 'industrialMetal' ? {
                  content: '""',
                  position: 'absolute',
                  left: '0',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: '2px',
                  height: '60%',
                  background: 'linear-gradient(180deg, transparent 0%, rgba(255,170,0,0.3) 50%, transparent 100%)',
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
          {sortedData.map((item) => {
            const isClickable = onRowClick && (!isRowClickable || isRowClickable(item));
            
            return (
              <Tr 
                key={item.id} 
                bg={colors.component.table.row}
                borderBottomWidth="1px"
                borderColor={colors.component.table.border}
                cursor={isClickable ? "pointer" : "default"}
                position="relative"
                _hover={{ 
                  bg: colors.component.table.rowHover,
                  transform: isClickable ? "translateY(-1px)" : "none",
                  boxShadow: isClickable ? colors.shadows.cardHover : colors.shadows.card,
                  transition: "all 0.2s ease-in-out",
                  ...(styles.theme === 'industrialMetal' && isClickable ? {
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      left: 0,
                      top: 0,
                      bottom: 0,
                      width: '3px',
                      background: 'linear-gradient(180deg, rgba(255,170,0,0.6) 0%, rgba(255,170,0,0.3) 50%, rgba(255,170,0,0.6) 100%)',
                      borderTopLeftRadius: 'md',
                      borderBottomLeftRadius: 'md',
                      opacity: 1,
                    }
                  } : {})
                }}
                onClick={isClickable ? () => onRowClick(item) : undefined}
              >
                {columns.map((column) => {
                  const shouldPreventClick = excludeClickableColumns?.includes(String(column.key));
                  
                  return (
                    <Td 
                      key={`${item.id}-${String(column.key)}`}
                      isNumeric={column.isNumeric}
                      color={colors.text.primary}
                      borderColor={colors.component.table.border}
                      py={3}
                      px={4}
                      onClick={shouldPreventClick ? (e) => e.stopPropagation() : undefined}
                    >
                      {column.renderCell(item)}
                    </Td>
                  );
                })}
              </Tr>
            );
          })}
        </Tbody>
      </Table>
    </TableContainer>
  );
}

// Memoize the component to prevent unnecessary re-renders
export default React.memo(SortableTable) as typeof SortableTable; 