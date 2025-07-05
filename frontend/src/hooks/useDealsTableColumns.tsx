import React, { useMemo } from 'react'; // Added React import for JSX
import { Link as RouterLink } from 'react-router-dom';
import { HStack, IconButton, Text, Link, Icon, Tag } from '@chakra-ui/react';
import { ViewIcon, EditIcon, DeleteIcon, ArrowBackIcon } from '@chakra-ui/icons';

import type { ColumnDefinition } from '../components/common/SortableTable';
import type { Deal } from '../stores/useDealsStore';
import type { Person as GeneratedPerson, CustomFieldDefinition as GQLCustomFieldDefinition } from '../generated/graphql/graphql';

import { getLinkDisplayDetails } from '../lib/utils/linkUtils';
import { formatPersonName, formatDate } from '../lib/utils/formatters';
import { CurrencyFormatter } from '../lib/utils/currencyFormatter';
import { useUserListStore } from '../stores/useUserListStore';

interface UseDealsTableColumnsProps {
  dealCustomFieldDefinitions: GQLCustomFieldDefinition[];
  handleEditClick: (deal: Deal) => void;
  handleDeleteClick: (dealId: string) => void;
  handleConvertClick?: (deal: Deal) => void;
  userPermissions: string[] | null | undefined;
  currentUserId: string | null | undefined;
  activeDeletingDealId: string | null | undefined;
}

interface UseDealsTableColumnsReturn {
  standardColumns: ColumnDefinition<Deal>[];
  actionsColumn: ColumnDefinition<Deal> | null;
  customFieldColumns: ColumnDefinition<Deal>[];
}

export const useDealsTableColumns = (props: UseDealsTableColumnsProps): UseDealsTableColumnsReturn => {
  const {
    dealCustomFieldDefinitions,
    handleEditClick,
    handleDeleteClick,
    handleConvertClick,
    userPermissions,
    currentUserId,
    activeDeletingDealId,
  } = props;

  const { users, refreshUsers } = useUserListStore();

  const standardColumns = useMemo((): ColumnDefinition<Deal>[] => [
    { key: 'name', header: 'Name', renderCell: (d) => d.name, isSortable: true },
    { 
      key: 'project_id', 
      header: 'Project ID', 
      renderCell: (d) => (
        <Text fontFamily="mono" fontSize="sm" fontWeight="medium" color="blue.600">
          {(d as any).project_id || '-'}
        </Text>
      ), 
      isSortable: true, 
      sortAccessor: (d) => (d as any).project_id || ''
    },
    {
      key: 'person',
      header: 'Person',
      renderCell: (d) => formatPersonName(d.person as GeneratedPerson | null | undefined),
      isSortable: true,
      sortAccessor: (d) => formatPersonName(d.person as GeneratedPerson | null | undefined).toLowerCase(),
    },
    {
      key: 'organization',
      header: 'Organization',
      renderCell: (d) => d.organization?.name || '-',
      isSortable: true,
      sortAccessor: (d) => d.organization?.name?.toLowerCase(),
    },
    {
      key: 'assignedToUser',
      header: 'Assigned To',
      renderCell: (d) => d.assignedToUser?.display_name || 'Unassigned',
      isSortable: true,
      sortAccessor: (d) => d.assignedToUser?.display_name?.toLowerCase() || '',
    },
    {
      key: 'stage',
      header: 'Status',
      renderCell: (d) => {
        const statusName = d.currentWfmStatus?.name || '-';
        const statusColor = d.currentWfmStatus?.color?.toLowerCase() || 'gray';
        // Ensure a valid colorScheme for Tag, fallback to gray if color is unusual
        const validChakraColorSchemes = ['whiteAlpha', 'blackAlpha', 'gray', 'red', 'orange', 'yellow', 'green', 'teal', 'blue', 'cyan', 'purple', 'pink'];
        const colorScheme = validChakraColorSchemes.includes(statusColor) ? statusColor : 'gray';

        return statusName !== '-' ? (
            <Tag size="sm" colorScheme={colorScheme} variant="solid">
                {statusName}
            </Tag>
        ) : (
            statusName
        );
      },
      isSortable: true,
      sortAccessor: (d) => d.currentWfmStatus?.name?.toLowerCase() ?? '',
    },
    {
      key: 'amount',
      header: 'Amount',
      renderCell: (d) => CurrencyFormatter.format(d.amount, d.currency || 'USD', { precision: 0 }),
      isSortable: true,
      isNumeric: true,
      sortAccessor: (d) => d.amount,
    },
    {
      key: 'deal_specific_probability',
      header: 'Specific Prob. (%)',
      renderCell: (d) => d.deal_specific_probability != null ? `${Math.round(d.deal_specific_probability * 100)}%` : '-',
      isSortable: true,
      sortAccessor: (d) => d.deal_specific_probability,
    },
    {
      key: 'weighted_amount',
      header: 'Weighted Amount',
      renderCell: (d) => CurrencyFormatter.format(d.weighted_amount, d.currency || 'USD', { precision: 0 }),
      isSortable: true,
      isNumeric: true,
      sortAccessor: (d) => d.weighted_amount,
    },
    {
      key: 'expected_close_date',
      header: 'Expected Close',
      renderCell: (d) => formatDate(d.expected_close_date),
      isSortable: true,
      sortAccessor: (d) => d.expected_close_date ? new Date(d.expected_close_date).getTime() : 0,
    },
    {
      key: 'created_at',
      header: 'Created',
      renderCell: (d) => formatDate(d.created_at),
      isSortable: true,
      sortAccessor: (d) => d.created_at ? new Date(d.created_at).getTime() : 0,
    },
  ], []);

  const actionsColumn = useMemo((): ColumnDefinition<Deal> | null => {
    return {
      key: 'actions',
      header: 'Actions',
      renderCell: (deal: Deal) => (
        <HStack spacing={2}>
          <IconButton as={RouterLink} to={`/deals/${deal.id}`} aria-label="View deal" icon={<ViewIcon />} size="sm" variant="ghost" />
          {handleConvertClick && (
            <IconButton
              aria-label="Convert to Lead"
              icon={<ArrowBackIcon />}
              size="sm"
              variant="ghost"
              colorScheme="orange"
              onClick={() => handleConvertClick(deal)}
              title="Convert to Lead"
            />
          )}
          <IconButton
            aria-label="Edit deal"
            icon={<EditIcon />}
            size="sm"
            variant="ghost"
            onClick={() => handleEditClick(deal)}
            isDisabled={!!activeDeletingDealId || !userPermissions?.includes('deal:update_any')}
          />
          <IconButton
            aria-label="Delete deal"
            icon={<DeleteIcon />}
            colorScheme="red"
            size="sm"
            variant="ghost"
            onClick={() => handleDeleteClick(deal.id)}
            isLoading={activeDeletingDealId === deal.id}
            isDisabled={(!!activeDeletingDealId && activeDeletingDealId !== deal.id) || !(userPermissions?.includes('deal:delete_any') || (userPermissions?.includes('deal:delete_own') && deal.user_id === currentUserId))}
          />
        </HStack>
      ),
      isSortable: false,
    };
  }, [handleEditClick, handleDeleteClick, handleConvertClick, userPermissions, currentUserId, activeDeletingDealId]);

  const customFieldColumns = useMemo((): ColumnDefinition<Deal>[] => {
    if (!dealCustomFieldDefinitions) return []; // Guard clause
    return dealCustomFieldDefinitions.map(def => ({
      key: `cf_${def.fieldName}`,
      header: def.fieldLabel,
      isSortable: true,
      sortAccessor: (deal: Deal) => {
        const cfValue = deal.customFieldValues?.find(cf => cf.definition.fieldName === def.fieldName);
        if (!cfValue) return '';
        switch (def.fieldType) {
          case 'TEXT': return cfValue.stringValue?.toLowerCase() || '';
          case 'NUMBER': return cfValue.numberValue || 0;
          case 'DATE': return cfValue.dateValue ? new Date(cfValue.dateValue).getTime() : 0;
          case 'BOOLEAN': return cfValue.booleanValue ? 'true' : 'false';
          case 'USER_MULTISELECT': return cfValue.selectedOptionValues?.length || 0;
          default: return cfValue.stringValue?.toLowerCase() || '';
        }
      },
      renderCell: (deal: Deal): React.ReactNode => { // Added React.ReactNode return type
        const cfValue = deal.customFieldValues?.find(cf => cf.definition.fieldName === def.fieldName);
        if (!cfValue) return '-';
        let displayValue: React.ReactNode = '-';
        const { stringValue, numberValue, booleanValue, dateValue, selectedOptionValues } = cfValue;
        switch (def.fieldType) {
          case 'TEXT': {
            const linkDetails = getLinkDisplayDetails(stringValue);
            if (linkDetails.isUrl && linkDetails.fullUrl) {
              displayValue = (
                <Link href={linkDetails.fullUrl} isExternal color={{ base: 'blue.500', _dark: 'blue.300' }} textDecoration="underline" display="inline-flex" alignItems="center">
                  {linkDetails.icon && <Icon as={linkDetails.icon} mr={1.5} />}
                  <Text as="span" style={!linkDetails.isKnownService ? { display: 'inline-block', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } : {}}>
                    {linkDetails.displayText}
                  </Text>
                </Link>
              );
            } else { displayValue = stringValue || '-'; }
            break;
          }
          case 'NUMBER': 
            displayValue = numberValue?.toString() ?? '-'; 
            break;
          case 'DATE': 
            displayValue = dateValue ? new Date(dateValue).toLocaleDateString() : '-'; 
            break;
          case 'BOOLEAN': 
            displayValue = booleanValue ? 'Yes' : 'No'; 
            break;
          case 'DROPDOWN': {
            const optValD = stringValue;
            const optD = def.dropdownOptions?.find(o => o.value === optValD);
            displayValue = optD?.label || optValD || '-';
            break;
          }
          case 'MULTI_SELECT': {
            const sVals = selectedOptionValues || [];
            displayValue = sVals.map(v => def.dropdownOptions?.find(o => o.value === v)?.label || v).join(', ') || '-';
            break;
          }
          case 'USER_MULTISELECT': {
            const userIds = selectedOptionValues || [];
            if (userIds.length > 0) {
              // Resolve user IDs to user names for display
              const selectedUsers = userIds
                .map(userId => users.find(user => user.id === userId))
                .filter((user): user is NonNullable<typeof user> => Boolean(user))
                .map(user => user.display_name || user.email);
              
              if (selectedUsers.length > 0) {
                displayValue = selectedUsers.join(', ');
              } else {
                // If no users found but we have user IDs, refresh the user store
                // This handles cases where users were deleted but the store is stale
                if (userIds.length > 0) {
                  refreshUsers().catch(console.error);
                }
                // Fallback if users aren't loaded yet or user not found
                displayValue = `${userIds.length} user(s) selected`;
              }
            } else {
              displayValue = '-';
            }
            break;
          }
          default: 
            displayValue = stringValue || '-';
        }
        return displayValue;
      },
    }));
  }, [dealCustomFieldDefinitions, users, refreshUsers]);

  return {
    standardColumns,
    actionsColumn,
    customFieldColumns,
  };
}; 