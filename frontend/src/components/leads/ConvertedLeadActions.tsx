import React, { useState } from 'react';
import {
  HStack,
  IconButton,
  Tooltip,
  useDisclosure,
} from '@chakra-ui/react';
import { ViewIcon, ExternalLinkIcon, TimeIcon } from '@chakra-ui/icons';
import { useNavigate } from 'react-router-dom';
import type { Lead } from '../../stores/useLeadsStore';
import { LeadDetailsModal } from './LeadDetailsModal';
import { ConversionHistoryModal } from './ConversionHistoryModal';

interface ConvertedLeadActionsProps {
  lead: Lead;
}

export function ConvertedLeadActions({ lead }: ConvertedLeadActionsProps) {
  const navigate = useNavigate();
  const { isOpen: isDetailsOpen, onOpen: onDetailsOpen, onClose: onDetailsClose } = useDisclosure();
  const { isOpen: isHistoryOpen, onOpen: onHistoryOpen, onClose: onHistoryClose } = useDisclosure();

  const handleViewDeal = () => {
    if (lead.converted_to_deal_id) {
      navigate(`/deals/${lead.converted_to_deal_id}`);
    }
  };

  return (
    <>
      <HStack spacing={2}>
        {/* View Deal Button */}
        {lead.converted_to_deal_id && (
          <Tooltip label="View Deal" hasArrow>
            <IconButton
              size="sm"
              variant="ghost"
              colorScheme="blue"
              aria-label="View Deal"
              icon={<ExternalLinkIcon />}
              onClick={handleViewDeal}
            />
          </Tooltip>
        )}

        {/* View Details Button */}
        <Tooltip label="View Lead Details" hasArrow>
          <IconButton
            size="sm"
            variant="ghost"
            colorScheme="gray"
            aria-label="View Lead Details"
            icon={<ViewIcon />}
            onClick={onDetailsOpen}
          />
        </Tooltip>

        {/* Conversion History Button */}
        <Tooltip label="Conversion History" hasArrow>
          <IconButton
            size="sm"
            variant="ghost"
            colorScheme="purple"
            aria-label="Conversion History"
            icon={<TimeIcon />}
            onClick={onHistoryOpen}
          />
        </Tooltip>
      </HStack>

      {/* Lead Details Modal */}
      <LeadDetailsModal 
        isOpen={isDetailsOpen}
        onClose={onDetailsClose}
        lead={lead}
      />

      {/* Conversion History Modal */}
      <ConversionHistoryModal
        isOpen={isHistoryOpen}
        onClose={onHistoryClose}
        lead={lead}
      />
    </>
  );
} 