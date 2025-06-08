import React, { useMemo } from 'react';
import { Badge, IconButton, HStack, Text, VStack, Spinner, Link, Icon } from '@chakra-ui/react';
import { StarIcon, EditIcon, DeleteIcon, ExternalLinkIcon, ViewIcon } from '@chakra-ui/icons';
import { Link as RouterLink } from 'react-router-dom';
import type { ColumnDefinition } from '../components/common/SortableTable';
import type { Lead } from '../stores/useLeadsStore';
import type { CustomFieldDefinition } from '../generated/graphql/graphql';
import { formatDate, formatCurrency } from '../lib/utils/formatters';
import { getLinkDisplayDetails } from '../lib/utils/linkUtils';
import { useThemeColors } from '../hooks/useThemeColors';

interface UseLeadsTableColumnsProps {
  leadCustomFieldDefinitions: CustomFieldDefinition[];
  handleEditClick: (lead: Lead) => void;
  handleDeleteClick: (leadId: string) => void;
  userPermissions: string[];
  currentUserId?: string;
  activeDeletingLeadId?: string | null;
}

interface UseLeadsTableColumnsReturn {
  standardColumns: ColumnDefinition<Lead>[];
  customFieldColumns: ColumnDefinition<Lead>[];
  actionsColumn: ColumnDefinition<Lead>;
}

export function useLeadsTableColumns({
  leadCustomFieldDefinitions,
  handleEditClick,
  handleDeleteClick,
  userPermissions,
  currentUserId,
  activeDeletingLeadId,
}: UseLeadsTableColumnsProps): UseLeadsTableColumnsReturn {

  const colors = useThemeColors();

  const standardColumns = useMemo((): ColumnDefinition<Lead>[] => [
    {
      key: 'name',
      header: 'Lead Name',
      isSortable: true,
      renderCell: (lead: Lead) => (
        <VStack align="start" spacing={1}>
          <Text fontWeight="medium" color="text.primary">
            {lead.name}
          </Text>
          {lead.source && (
            <Text fontSize="sm" color="text.secondary">
              Source: {lead.source}
            </Text>
          )}
        </VStack>
      ),
    },
    {
      key: 'contact',
      header: 'Contact',
      isSortable: false,
      renderCell: (lead: Lead) => (
        <VStack align="start" spacing={1}>
          {lead.contact_name && (
            <Text fontSize="sm" fontWeight="medium">
              {lead.contact_name}
            </Text>
          )}
          {lead.contact_email && (
            <Text fontSize="sm" color="text.secondary">
              {lead.contact_email}
            </Text>
          )}
          {lead.contact_phone && (
            <Text fontSize="sm" color="text.secondary">
              {lead.contact_phone}
            </Text>
          )}
        </VStack>
      ),
    },
    {
      key: 'company',
      header: 'Company',
      isSortable: true,
      renderCell: (lead: Lead) => lead.company_name ? (
        <Text>{lead.company_name}</Text>
      ) : (
        <Text color="text.secondary" fontStyle="italic">—</Text>
      ),
      sortAccessor: (lead: Lead) => lead.company_name?.toLowerCase(),
    },
    {
      key: 'assignedToUser',
      header: 'Assigned To',
      isSortable: false,
      renderCell: (lead: Lead) => lead.assignedToUser ? (
        <Text>{lead.assignedToUser.display_name || lead.assignedToUser.email}</Text>
      ) : (
        <Text color="text.secondary" fontStyle="italic">Unassigned</Text>
      ),
    },
    {
      key: 'leadScore',
      header: 'Score',
      isSortable: true,
      renderCell: (lead: Lead) => (
        <HStack spacing={2}>
          <Text fontWeight="medium">
            {lead.lead_score || 0}
          </Text>
          <StarIcon
            boxSize={3}
            color={
              (lead.lead_score || 0) >= 75 ? 'yellow.400' :
              (lead.lead_score || 0) >= 50 ? 'orange.400' :
              'gray.400'
            }
          />
        </HStack>
      ),
      sortAccessor: (lead: Lead) => lead.lead_score || 0,
    },
    {
      key: 'qualification',
      header: 'Status',
      isSortable: false,
      renderCell: (lead: Lead) => (
        <VStack align="start" spacing={1}>
          <Badge
            size="sm"
            bg={lead.isQualified ? colors.status.success : colors.bg.input}
            color={lead.isQualified ? colors.text.onAccent : colors.text.primary}
            borderWidth="1px"
            borderColor={lead.isQualified ? colors.status.success : colors.border.default}
          >
            {lead.isQualified ? 'Qualified' : 'Not Qualified'}
          </Badge>
          {lead.currentWfmStatus && (
            <Badge
              bg={colors.bg.input}
              color={colors.text.primary}
              borderWidth="1px"
              borderColor={colors.border.default}
              fontSize="xs"
            >
              {lead.currentWfmStatus.name}
            </Badge>
          )}
        </VStack>
      ),
    },
    {
      key: 'estimatedValue',
      header: 'Est. Value',
      isSortable: true,
      renderCell: (lead: Lead) => lead.estimated_value ? (
        <Text>{formatCurrency(lead.estimated_value)}</Text>
      ) : (
        <Text color="text.secondary" fontStyle="italic">—</Text>
      ),
      sortAccessor: (lead: Lead) => lead.estimated_value || 0,
      isNumeric: true,
    },
    {
      key: 'estimatedCloseDate',
      header: 'Est. Close Date',
      isSortable: true,
      renderCell: (lead: Lead) => lead.estimated_close_date ? (
        <Text>{formatDate(lead.estimated_close_date)}</Text>
      ) : (
        <Text color="text.secondary" fontStyle="italic">—</Text>
      ),
      sortAccessor: (lead: Lead) => lead.estimated_close_date ? new Date(lead.estimated_close_date).getTime() : 0,
    },
    {
      key: 'created_at',
      header: 'Created',
      isSortable: true,
      renderCell: (lead: Lead) => (
        <Text fontSize="sm" color="text.secondary">
          {formatDate(lead.created_at)}
        </Text>
      ),
      sortAccessor: (lead: Lead) => lead.created_at ? new Date(lead.created_at).getTime() : 0,
    },
  ], []);

  const customFieldColumns = useMemo((): ColumnDefinition<Lead>[] => {
    if (!leadCustomFieldDefinitions) return []; // Guard clause
    return leadCustomFieldDefinitions.map(def => ({
      key: `cf_${def.fieldName}`,
      header: def.fieldLabel,
      isSortable: true,
      sortAccessor: (lead: Lead) => {
        const cfValue = lead.customFieldValues?.find(cf => cf.definition.fieldName === def.fieldName);
        if (!cfValue) return '';
        switch (def.fieldType) {
          case 'TEXT': return cfValue.stringValue?.toLowerCase() || '';
          case 'NUMBER': return cfValue.numberValue || 0;
          case 'DATE': return cfValue.dateValue ? new Date(cfValue.dateValue).getTime() : 0;
          case 'BOOLEAN': return cfValue.booleanValue ? 'true' : 'false';
          default: return cfValue.stringValue?.toLowerCase() || '';
        }
      },
      renderCell: (lead: Lead): React.ReactNode => {
        const cfValue = lead.customFieldValues?.find(cf => cf.definition.fieldName === def.fieldName);
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
          default: 
            displayValue = stringValue || '-';
        }
        return displayValue;
      },
    }));
  }, [leadCustomFieldDefinitions]);

  const actionsColumn = useMemo((): ColumnDefinition<Lead> => ({
    key: 'actions',
    header: 'Actions',
    isSortable: false,
    renderCell: (lead: Lead) => {
      // Temporary fix: always show actions for development
      const canEdit = true; // userPermissions.includes('lead.update_own') || userPermissions.includes('lead.update_any');
      const canDelete = true; // userPermissions.includes('lead.delete_own') || userPermissions.includes('lead.delete_any');

      const isLeadOwner = lead.user_id === currentUserId;
      const isAssigned = lead.assigned_to_user_id === currentUserId;
      const hasAccess = true; // isLeadOwner || isAssigned;

      const showEdit = canEdit; // && (userPermissions.includes('lead.update_any') || hasAccess);
      const showDelete = canDelete; // && (userPermissions.includes('lead.delete_any') || hasAccess);

      if (!showEdit && !showDelete) {
        return null;
      }

      const isDeleting = activeDeletingLeadId === lead.id;

      return (
        <HStack spacing={2}>
          <IconButton
            as={RouterLink}
            to={`/leads/${lead.id}`}
            size="sm"
            variant="ghost"
            aria-label="View lead details"
            icon={<ViewIcon />}
          />
          {showEdit && (
            <IconButton
              size="sm"
              variant="ghost"
              aria-label="Edit"
              icon={<EditIcon />}
              onClick={() => handleEditClick(lead)}
              isDisabled={isDeleting}
            />
          )}
          {showDelete && (
            <IconButton
              size="sm"
              variant="ghost"
              colorScheme="red"
              aria-label="Delete"
              icon={isDeleting ? <Spinner size="xs" /> : <DeleteIcon />}
              onClick={() => handleDeleteClick(lead.id)}
              isDisabled={isDeleting}
              isLoading={isDeleting}
            />
          )}
        </HStack>
      );
    },
  }), [userPermissions, currentUserId, activeDeletingLeadId, handleEditClick, handleDeleteClick]);

  return {
    standardColumns,
    customFieldColumns,
    actionsColumn,
  };
} 