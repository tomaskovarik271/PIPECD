import React, { useMemo } from 'react'; // Added React import for JSX
import { Link as RouterLink } from 'react-router-dom';
import { HStack, IconButton, Text, Link, Icon, Tag } from '@chakra-ui/react';
import { ViewIcon, EditIcon, DeleteIcon } from '@chakra-ui/icons';

import type { ColumnDefinition } from '../components/common/SortableTable';
import type { Deal } from '../stores/useDealsStore';
import type { Person as GeneratedPerson, CustomFieldDefinition as GQLCustomFieldDefinition } from '../generated/graphql/graphql';

import { getLinkDisplayDetails } from '../lib/utils/linkUtils';
import { formatPersonName, formatDate, formatCurrency } from '../lib/utils/formatters';

interface UseDealsTableColumnsProps {
  dealCustomFieldDefinitions: GQLCustomFieldDefinition[];
  handleEditClick: (deal: Deal) => void;
  handleDeleteClick: (dealId: string) => void;
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
    userPermissions,
    currentUserId,
    activeDeletingDealId,
  } = props;

  const standardColumns = useMemo((): ColumnDefinition<Deal>[] => [
    { key: 'name', header: 'Name', renderCell: (d) => d.name, isSortable: true },
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
      renderCell: (d) => formatCurrency(d.amount),
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
      renderCell: (d) => formatCurrency(d.weighted_amount),
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
          <IconButton
            aria-label="Edit deal"
            icon={<EditIcon />}
            size="sm"
            variant="ghost"
            onClick={() => handleEditClick(deal)}
            isDisabled={!!activeDeletingDealId || !(userPermissions?.includes('deal:update_any') || (userPermissions?.includes('deal:update_own') && (deal.user_id === currentUserId || deal.assigned_to_user_id === currentUserId)))}
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
  }, [handleEditClick, handleDeleteClick, userPermissions, currentUserId, activeDeletingDealId]);

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
          default: return cfValue.stringValue?.toLowerCase() || '';
        }
      },
      renderCell: (deal: Deal): React.ReactNode => { // Added React.ReactNode return type
        const cfValue = deal.customFieldValues?.find(cf => cf.definition.fieldName === def.fieldName);
        if (!cfValue) return '-';
        let displayValue: React.ReactNode = '-';
        const { stringValue, numberValue, booleanValue, dateValue, selectedOptionValues } = cfValue;
        switch (def.fieldType) {
          case 'TEXT':
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
          case 'NUMBER': displayValue = numberValue?.toString() ?? '-'; break;
          case 'DATE': displayValue = dateValue ? new Date(dateValue).toLocaleDateString() : '-'; break;
          case 'BOOLEAN': displayValue = booleanValue ? 'Yes' : 'No'; break;
          case 'DROPDOWN':
            const optValD = stringValue;
            const optD = def.dropdownOptions?.find(o => o.value === optValD);
            displayValue = optD?.label || optValD || '-';
            break;
          case 'MULTI_SELECT':
            const sVals = selectedOptionValues || [];
            displayValue = sVals.map(v => def.dropdownOptions?.find(o => o.value === v)?.label || v).join(', ') || '-';
            break;
          default: displayValue = stringValue || '-';
        }
        return displayValue;
      },
    }));
  }, [dealCustomFieldDefinitions]);

  return {
    standardColumns,
    actionsColumn,
    customFieldColumns,
  };
}; 