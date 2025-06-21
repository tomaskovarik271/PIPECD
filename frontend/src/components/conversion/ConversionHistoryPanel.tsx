import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Badge,
  Icon,
  Button,
  Collapse,
  useDisclosure,
  Spinner,
  Alert,
  AlertIcon,
  Divider,
  Tooltip,
  Link
} from '@chakra-ui/react';
import {
  FiArrowRight,
  FiArrowLeft,
  FiClock,
  FiUser,
  FiChevronDown,
  FiChevronRight,
  FiExternalLink,
  FiRefreshCw
} from 'react-icons/fi';
import { useThemeColors } from '../../hooks/useThemeColors';

// Types
interface ConversionEvent {
  id: string;
  createdAt: string;
  sourceType: 'lead' | 'deal';
  targetType: 'lead' | 'deal';
  sourceId: string;
  targetId: string;
  sourceName: string;
  targetName: string;
  reason?: string;
  notes?: string;
  preservedActivities: boolean;
  createdConversionActivity: boolean;
  performedBy: {
    id: string;
    first_name: string;
    last_name: string;
    email?: string;
  };
  metadata?: {
    originalAmount?: number;
    originalCurrency?: string;
    originalCloseDate?: string;
    wfmTransition?: {
      fromStatus: string;
      toStatus: string;
    };
  };
}

interface ConversionHistoryPanelProps {
  entityType: 'lead' | 'deal';
  entityId: string;
  showTitle?: boolean;
}

export function ConversionHistoryPanel({ 
  entityType, 
  entityId, 
  showTitle = true 
}: ConversionHistoryPanelProps) {
  const colors = useThemeColors();
  const [conversions, setConversions] = useState<ConversionEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load conversion history
  useEffect(() => {
    loadConversionHistory();
  }, [entityType, entityId]);

  const loadConversionHistory = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // TODO: Call GraphQL query for conversion history
      // const result = await getConversionHistoryQuery({
      //   entityType,
      //   entityId
      // });

      // Mock data for now
      const mockConversions: ConversionEvent[] = [
        {
          id: 'conv_1',
          createdAt: '2024-01-15T10:30:00Z',
          sourceType: 'lead',
          targetType: 'deal',
          sourceId: 'lead_123',
          targetId: 'deal_456',
          sourceName: 'Microsoft Enterprise Deal',
          targetName: 'Microsoft Enterprise Deal',
          reason: 'qualified',
          notes: 'Lead qualified after demo call',
          preservedActivities: true,
          createdConversionActivity: true,
          performedBy: {
            id: 'user_1',
            first_name: 'John',
            last_name: 'Doe',
            email: 'john.doe@company.com'
          },
          metadata: {
            originalAmount: 50000,
            originalCurrency: 'USD',
            originalCloseDate: '2024-03-15',
            wfmTransition: {
              fromStatus: 'New Lead',
              toStatus: 'Prospecting'
            }
          }
        },
        {
          id: 'conv_2',
          createdAt: '2024-01-20T14:15:00Z',
          sourceType: 'deal',
          targetType: 'lead',
          sourceId: 'deal_456',
          targetId: 'lead_789',
          sourceName: 'Microsoft Enterprise Deal',
          targetName: 'Microsoft Enterprise Opportunity',
          reason: 'timing',
          notes: 'Customer needs more time, converting back to nurture',
          preservedActivities: true,
          createdConversionActivity: true,
          performedBy: {
            id: 'user_2',
            first_name: 'Jane',
            last_name: 'Smith',
            email: 'jane.smith@company.com'
          },
          metadata: {
            originalAmount: 50000,
            originalCurrency: 'USD',
            wfmTransition: {
              fromStatus: 'Proposal',
              toStatus: 'Archived'
            }
          }
        }
      ];

      setConversions(mockConversions);
    } catch (err) {
      console.error('Failed to load conversion history:', err);
      setError('Failed to load conversion history');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getConversionIcon = (sourceType: string, targetType: string) => {
    if (sourceType === 'lead' && targetType === 'deal') {
      return FiArrowRight;
    }
    if (sourceType === 'deal' && targetType === 'lead') {
      return FiArrowLeft;
    }
    return FiRefreshCw;
  };

  const getConversionBadgeColor = (sourceType: string, targetType: string) => {
    if (sourceType === 'lead' && targetType === 'deal') {
      return 'green';
    }
    if (sourceType === 'deal' && targetType === 'lead') {
      return 'orange';
    }
    return 'blue';
  };

  const getConversionLabel = (sourceType: string, targetType: string) => {
    if (sourceType === 'lead' && targetType === 'deal') {
      return 'Lead → Deal';
    }
    if (sourceType === 'deal' && targetType === 'lead') {
      return 'Deal → Lead';
    }
    return 'Conversion';
  };

  if (isLoading) {
    return (
      <Box p={4}>
        <HStack spacing={3}>
          <Spinner size="sm" />
          <Text color={colors.text.muted}>Loading conversion history...</Text>
        </HStack>
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={4}>
        <Alert status="error" size="sm">
          <AlertIcon />
          <Text fontSize="sm">{error}</Text>
          <Button size="xs" ml={2} onClick={loadConversionHistory}>
            Retry
          </Button>
        </Alert>
      </Box>
    );
  }

  if (conversions.length === 0) {
    return (
      <Box p={4} textAlign="center">
        <Text color={colors.text.muted} fontSize="sm">
          No conversion history found
        </Text>
      </Box>
    );
  }

  return (
    <Box>
      {showTitle && (
        <>
          <HStack justify="space-between" mb={4}>
            <Text fontWeight="semibold" color={colors.text.primary}>
              Conversion History
            </Text>
            <Button size="xs" variant="ghost" onClick={loadConversionHistory}>
              <Icon as={FiRefreshCw} />
            </Button>
          </HStack>
          <Divider mb={4} />
        </>
      )}

      <VStack spacing={4} align="stretch">
        {conversions.map((conversion) => (
          <ConversionEventCard key={conversion.id} conversion={conversion} colors={colors} />
        ))}
      </VStack>
    </Box>
  );
}

interface ConversionEventCardProps {
  conversion: ConversionEvent;
  colors: any;
}

function ConversionEventCard({ conversion, colors }: ConversionEventCardProps) {
  const { isOpen, onToggle } = useDisclosure();

  const conversionIcon = getConversionIcon(conversion.sourceType, conversion.targetType);
  const badgeColor = getConversionBadgeColor(conversion.sourceType, conversion.targetType);
  const conversionLabel = getConversionLabel(conversion.sourceType, conversion.targetType);

  return (
    <Box
      p={4}
      bg={colors.background.elevated}
      borderRadius="md"
      border="1px"
      borderColor={colors.border.subtle}
      _hover={{ borderColor: colors.border.accent }}
      transition="border-color 0.2s"
    >
      <VStack spacing={3} align="stretch">
        {/* Header */}
        <HStack justify="space-between">
          <HStack spacing={3}>
            <Icon as={conversionIcon} color={colors.accent.primary} />
            <Badge colorScheme={badgeColor} variant="subtle">
              {conversionLabel}
            </Badge>
            <Text fontSize="sm" color={colors.text.muted}>
              {formatDate(conversion.createdAt)}
            </Text>
          </HStack>
          
          <Button size="xs" variant="ghost" onClick={onToggle}>
            <Icon as={isOpen ? FiChevronDown : FiChevronRight} />
          </Button>
        </HStack>

        {/* Summary */}
        <Box>
          <Text fontSize="sm" color={colors.text.primary}>
            <strong>{conversion.sourceName}</strong> → <strong>{conversion.targetName}</strong>
          </Text>
          {conversion.reason && (
            <Text fontSize="xs" color={colors.text.muted} mt={1}>
              Reason: {conversion.reason}
            </Text>
          )}
        </Box>

        {/* Performed by */}
        <HStack spacing={2} fontSize="xs" color={colors.text.muted}>
          <Icon as={FiUser} />
          <Text>
            {conversion.performedBy.first_name} {conversion.performedBy.last_name}
          </Text>
        </HStack>

        {/* Expandable details */}
        <Collapse in={isOpen}>
          <VStack spacing={3} align="stretch" pt={3}>
            <Divider />
            
            {/* Conversion options */}
            <Box>
              <Text fontSize="sm" fontWeight="semibold" mb={2} color={colors.text.primary}>
                Conversion Options
              </Text>
              <VStack spacing={1} align="start" fontSize="xs" color={colors.text.muted}>
                <HStack>
                  <Text>Activities Preserved:</Text>
                  <Badge size="sm" colorScheme={conversion.preservedActivities ? 'green' : 'red'}>
                    {conversion.preservedActivities ? 'Yes' : 'No'}
                  </Badge>
                </HStack>
                <HStack>
                  <Text>Conversion Activity Created:</Text>
                  <Badge size="sm" colorScheme={conversion.createdConversionActivity ? 'green' : 'red'}>
                    {conversion.createdConversionActivity ? 'Yes' : 'No'}
                  </Badge>
                </HStack>
              </VStack>
            </Box>

            {/* Metadata */}
            {conversion.metadata && (
              <Box>
                <Text fontSize="sm" fontWeight="semibold" mb={2} color={colors.text.primary}>
                  Details
                </Text>
                <VStack spacing={1} align="start" fontSize="xs" color={colors.text.muted}>
                  {conversion.metadata.originalAmount && (
                    <Text>
                      Original Amount: {conversion.metadata.originalCurrency || 'USD'} {conversion.metadata.originalAmount.toLocaleString()}
                    </Text>
                  )}
                  {conversion.metadata.originalCloseDate && (
                    <Text>
                      Original Close Date: {new Date(conversion.metadata.originalCloseDate).toLocaleDateString()}
                    </Text>
                  )}
                  {conversion.metadata.wfmTransition && (
                    <Text>
                      Status Change: {conversion.metadata.wfmTransition.fromStatus} → {conversion.metadata.wfmTransition.toStatus}
                    </Text>
                  )}
                </VStack>
              </Box>
            )}

            {/* Notes */}
            {conversion.notes && (
              <Box>
                <Text fontSize="sm" fontWeight="semibold" mb={2} color={colors.text.primary}>
                  Notes
                </Text>
                <Text fontSize="xs" color={colors.text.muted}>
                  {conversion.notes}
                </Text>
              </Box>
            )}

            {/* Entity links */}
            <Box>
              <Text fontSize="sm" fontWeight="semibold" mb={2} color={colors.text.primary}>
                Related Entities
              </Text>
              <HStack spacing={4} fontSize="xs">
                <Link color={colors.accent.primary} href={`/${conversion.sourceType}s/${conversion.sourceId}`}>
                  <HStack spacing={1}>
                    <Text>Source {conversion.sourceType}</Text>
                    <Icon as={FiExternalLink} />
                  </HStack>
                </Link>
                <Link color={colors.accent.primary} href={`/${conversion.targetType}s/${conversion.targetId}`}>
                  <HStack spacing={1}>
                    <Text>Target {conversion.targetType}</Text>
                    <Icon as={FiExternalLink} />
                  </HStack>
                </Link>
              </HStack>
            </Box>
          </VStack>
        </Collapse>
      </VStack>
    </Box>
  );
}

// Helper functions (duplicated from parent for clarity)
function getConversionIcon(sourceType: string, targetType: string) {
  if (sourceType === 'lead' && targetType === 'deal') {
    return FiArrowRight;
  }
  if (sourceType === 'deal' && targetType === 'lead') {
    return FiArrowLeft;
  }
  return FiRefreshCw;
}

function getConversionBadgeColor(sourceType: string, targetType: string) {
  if (sourceType === 'lead' && targetType === 'deal') {
    return 'green';
  }
  if (sourceType === 'deal' && targetType === 'lead') {
    return 'orange';
  }
  return 'blue';
}

function getConversionLabel(sourceType: string, targetType: string) {
  if (sourceType === 'lead' && targetType === 'deal') {
    return 'Lead → Deal';
  }
  if (sourceType === 'deal' && targetType === 'lead') {
    return 'Deal → Lead';
  }
  return 'Conversion';
} 