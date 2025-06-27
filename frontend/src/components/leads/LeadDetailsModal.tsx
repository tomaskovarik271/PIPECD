import React from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  VStack,
  HStack,
  Text,
  Badge,
  Divider,
  Grid,
  GridItem,
  Icon,
  Box,
} from '@chakra-ui/react';
import { CheckCircleIcon, InfoIcon } from '@chakra-ui/icons';
import type { Lead } from '../../stores/useLeadsStore';
import { formatDate } from '../../lib/utils/formatters';
import { CurrencyFormatter } from '../../lib/utils/currencyFormatter';
import { useThemeColors } from '../../hooks/useThemeColors';

interface LeadDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  lead: Lead;
}

export function LeadDetailsModal({ isOpen, onClose, lead }: LeadDetailsModalProps) {
  const colors = useThemeColors();

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="2xl" scrollBehavior="inside">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          <HStack spacing={3}>
            <Icon as={InfoIcon} color={colors.text.accent} />
            <Text>Lead Details</Text>
            {lead.converted_at && (
              <Badge
                bg={colors.status.success}
                color={colors.text.onAccent}
                px={3}
                py={1}
                borderRadius="full"
                fontSize="sm"
                fontWeight="bold"
              >
                <HStack spacing={1}>
                  <CheckCircleIcon boxSize={3} />
                  <Text>CONVERTED</Text>
                </HStack>
              </Badge>
            )}
          </HStack>
        </ModalHeader>
        <ModalCloseButton />
        
        <ModalBody pb={6}>
          <VStack spacing={6} align="stretch">
            {/* Basic Information */}
            <Box>
              <Text fontSize="lg" fontWeight="bold" mb={3} color={colors.text.primary}>
                Basic Information
              </Text>
              <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                <GridItem>
                  <Text fontSize="sm" color={colors.text.secondary} mb={1}>Lead Name</Text>
                  <Text fontWeight="medium">{lead.name}</Text>
                </GridItem>
                <GridItem>
                  <Text fontSize="sm" color={colors.text.secondary} mb={1}>Source</Text>
                  <Text>{lead.source || '—'}</Text>
                </GridItem>
                <GridItem colSpan={2}>
                  <Text fontSize="sm" color={colors.text.secondary} mb={1}>Description</Text>
                  <Text>{lead.description || '—'}</Text>
                </GridItem>
              </Grid>
            </Box>

            <Divider />

            {/* Contact Information */}
            <Box>
              <Text fontSize="lg" fontWeight="bold" mb={3} color={colors.text.primary}>
                Contact Information
              </Text>
              <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                <GridItem>
                  <Text fontSize="sm" color={colors.text.secondary} mb={1}>Contact Name</Text>
                  <Text>{lead.contact_name || '—'}</Text>
                </GridItem>
                <GridItem>
                  <Text fontSize="sm" color={colors.text.secondary} mb={1}>Email</Text>
                  <Text>{lead.contact_email || '—'}</Text>
                </GridItem>
                <GridItem>
                  <Text fontSize="sm" color={colors.text.secondary} mb={1}>Phone</Text>
                  <Text>{lead.contact_phone || '—'}</Text>
                </GridItem>
                <GridItem>
                  <Text fontSize="sm" color={colors.text.secondary} mb={1}>Company</Text>
                  <Text>{lead.company_name || '—'}</Text>
                </GridItem>
              </Grid>
            </Box>

            <Divider />

            {/* Lead Qualification */}
            <Box>
              <Text fontSize="lg" fontWeight="bold" mb={3} color={colors.text.primary}>
                Lead Qualification
              </Text>
              <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                <GridItem>
                  <Text fontSize="sm" color={colors.text.secondary} mb={1}>Lead Score</Text>
                  <HStack>
                    <Text fontWeight="medium">{lead.lead_score || 0}</Text>
                    <Text fontSize="sm" color={colors.text.secondary}>/ 100</Text>
                  </HStack>
                </GridItem>
                <GridItem>
                  <Text fontSize="sm" color={colors.text.secondary} mb={1}>Status</Text>
                  <Badge
                    size="sm"
                    bg={lead.isQualified ? colors.status.success : colors.bg.input}
                    color={lead.isQualified ? colors.text.onAccent : colors.text.primary}
                    borderWidth="1px"
                    borderColor={lead.isQualified ? colors.status.success : colors.border.default}
                  >
                    {lead.isQualified ? 'Qualified' : 'Not Qualified'}
                  </Badge>
                </GridItem>
                <GridItem>
                  <Text fontSize="sm" color={colors.text.secondary} mb={1}>Estimated Value</Text>
                  <Text fontWeight="medium">
                    {lead.estimated_value 
                      ? CurrencyFormatter.format(lead.estimated_value, 'USD', { precision: 0 })
                      : '—'
                    }
                  </Text>
                </GridItem>
                <GridItem>
                  <Text fontSize="sm" color={colors.text.secondary} mb={1}>Estimated Close Date</Text>
                  <Text>{lead.estimated_close_date ? formatDate(lead.estimated_close_date) : '—'}</Text>
                </GridItem>
              </Grid>
            </Box>

            {/* Conversion Information (if converted) */}
            {lead.converted_at && (
              <>
                <Divider />
                <Box>
                  <Text fontSize="lg" fontWeight="bold" mb={3} color={colors.text.primary}>
                    Conversion Information
                  </Text>
                  <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                    <GridItem>
                      <Text fontSize="sm" color={colors.text.secondary} mb={1}>Converted At</Text>
                      <Text fontWeight="medium">{formatDate(lead.converted_at)}</Text>
                    </GridItem>
                    <GridItem>
                      <Text fontSize="sm" color={colors.text.secondary} mb={1}>Deal ID</Text>
                      <Text fontFamily="mono" fontSize="sm">{lead.converted_to_deal_id || '—'}</Text>
                    </GridItem>
                    <GridItem>
                      <Text fontSize="sm" color={colors.text.secondary} mb={1}>Person ID</Text>
                      <Text fontFamily="mono" fontSize="sm">{lead.converted_to_person_id || '—'}</Text>
                    </GridItem>
                    <GridItem>
                      <Text fontSize="sm" color={colors.text.secondary} mb={1}>Organization ID</Text>
                      <Text fontFamily="mono" fontSize="sm">{lead.converted_to_organization_id || '—'}</Text>
                    </GridItem>
                  </Grid>
                </Box>
              </>
            )}

            <Divider />

            {/* Timestamps */}
            <Box>
              <Text fontSize="lg" fontWeight="bold" mb={3} color={colors.text.primary}>
                Timeline
              </Text>
              <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                <GridItem>
                  <Text fontSize="sm" color={colors.text.secondary} mb={1}>Created At</Text>
                  <Text>{formatDate(lead.created_at)}</Text>
                </GridItem>
                <GridItem>
                  <Text fontSize="sm" color={colors.text.secondary} mb={1}>Last Updated</Text>
                  <Text>{formatDate(lead.updated_at)}</Text>
                </GridItem>
              </Grid>
            </Box>
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
} 