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
  Box,
  Icon,
} from '@chakra-ui/react';
import { TimeIcon, CheckCircleIcon, ArrowForwardIcon, InfoIcon } from '@chakra-ui/icons';
import type { Lead } from '../../stores/useLeadsStore';
import { formatDate } from '../../lib/utils/formatters';
import { useThemeColors } from '../../hooks/useThemeColors';

interface ConversionHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  lead: Lead;
}

export function ConversionHistoryModal({ isOpen, onClose, lead }: ConversionHistoryModalProps) {
  const colors = useThemeColors();

  // Create timeline events
  const timelineEvents = [
    {
      id: 'created',
      title: 'Lead Created',
      description: `Lead "${lead.name}" was created in the system`,
      timestamp: lead.created_at,
      icon: InfoIcon,
      color: 'blue',
    },
    ...(lead.assigned_at ? [{
      id: 'assigned',
      title: 'Lead Assigned',
      description: 'Lead was assigned to a team member',
      timestamp: lead.assigned_at,
      icon: InfoIcon,
      color: 'orange',
    }] : []),
    ...(lead.converted_at ? [{
      id: 'converted',
      title: 'Lead Converted',
      description: 'Lead was successfully converted to a deal',
      timestamp: lead.converted_at,
      icon: CheckCircleIcon,
      color: 'green',
    }] : []),
  ].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl" scrollBehavior="inside">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          <HStack spacing={3}>
            <Icon as={TimeIcon} color={colors.text.accent} />
            <Text>Conversion History</Text>
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
                CONVERTED
              </Badge>
            )}
          </HStack>
        </ModalHeader>
        <ModalCloseButton />
        
        <ModalBody pb={6}>
          <VStack spacing={6} align="stretch">
            {/* Lead Summary */}
            <Box
              p={4}
              borderRadius="md"
              bg={colors.bg.elevated}
              borderWidth="1px"
              borderColor={colors.border.default}
            >
              <Text fontSize="lg" fontWeight="bold" mb={2} color={colors.text.primary}>
                {lead.name}
              </Text>
              <HStack spacing={4} fontSize="sm" color={colors.text.secondary}>
                <Text>Source: {lead.source || '—'}</Text>
                <Text>Score: {lead.lead_score || 0}/100</Text>
                {lead.estimated_value && (
                  <Text>Value: ${lead.estimated_value.toLocaleString()}</Text>
                )}
              </HStack>
            </Box>

            {/* Timeline */}
            <Box>
              <Text fontSize="lg" fontWeight="bold" mb={4} color={colors.text.primary}>
                Timeline
              </Text>
              
              <VStack spacing={4} align="stretch">
                {timelineEvents.map((event, index) => (
                  <Box key={event.id} position="relative">
                    <HStack spacing={4} align="start">
                      {/* Timeline Icon */}
                      <Box
                        position="relative"
                        bg={`${event.color}.500`}
                        borderRadius="full"
                        p={2}
                        color="white"
                        minW="40px"
                        h="40px"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                      >
                        <Icon as={event.icon} boxSize={4} />
                      </Box>

                      {/* Timeline Content */}
                      <VStack align="start" spacing={1} flex={1}>
                        <HStack justify="space-between" w="full">
                          <Text fontWeight="bold" color={colors.text.primary}>
                            {event.title}
                          </Text>
                          <Text fontSize="sm" color={colors.text.secondary}>
                            {formatDate(event.timestamp)}
                          </Text>
                        </HStack>
                        <Text fontSize="sm" color={colors.text.secondary}>
                          {event.description}
                        </Text>
                      </VStack>
                    </HStack>

                    {/* Timeline Connector */}
                    {index < timelineEvents.length - 1 && (
                      <Box
                        position="absolute"
                        left="19px"
                        top="40px"
                        w="2px"
                        h="20px"
                        bg={colors.border.default}
                      />
                    )}
                  </Box>
                ))}
              </VStack>
            </Box>

            {/* Conversion Details */}
            {lead.converted_at && (
              <Box
                p={4}
                borderRadius="md"
                bg={colors.status.success}
                color={colors.text.onAccent}
              >
                <Text fontSize="lg" fontWeight="bold" mb={2}>
                  Conversion Results
                </Text>
                <VStack spacing={2} align="start">
                  {lead.converted_to_deal_id && (
                    <HStack>
                      <ArrowForwardIcon />
                      <Text fontSize="sm">
                        Deal created: {lead.converted_to_deal_id}
                      </Text>
                    </HStack>
                  )}
                  {lead.converted_to_person_id && (
                    <HStack>
                      <ArrowForwardIcon />
                      <Text fontSize="sm">
                        Person created: {lead.converted_to_person_id}
                      </Text>
                    </HStack>
                  )}
                  {lead.converted_to_organization_id && (
                    <HStack>
                      <ArrowForwardIcon />
                      <Text fontSize="sm">
                        Organization created: {lead.converted_to_organization_id}
                      </Text>
                    </HStack>
                  )}
                  <Text fontSize="sm" fontStyle="italic" mt={2}>
                    Converted on {formatDate(lead.converted_at)}
                  </Text>
                </VStack>
              </Box>
            )}

            {/* Next Steps */}
            {lead.converted_at && (
              <Box
                p={4}
                borderRadius="md"
                bg={colors.bg.input}
                borderWidth="1px"
                borderColor={colors.border.default}
              >
                <Text fontSize="md" fontWeight="bold" mb={2} color={colors.text.primary}>
                  What's Next?
                </Text>
                <VStack spacing={2} align="start" fontSize="sm" color={colors.text.secondary}>
                  <Text>• The lead has been successfully converted and is now read-only</Text>
                  <Text>• Continue working with the created deal in the Deals section</Text>
                  <Text>• All lead data has been preserved for audit and reporting purposes</Text>
                  <Text>• Use the "View Deal" button to navigate to the active deal</Text>
                </VStack>
              </Box>
            )}
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
} 