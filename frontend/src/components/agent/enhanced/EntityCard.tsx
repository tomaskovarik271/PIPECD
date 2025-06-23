/**
 * EntityCard Component
 * Displays detected entities with contextual actions
 */

import React from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Badge,
  useColorModeValue,
  Divider,
  Wrap,
  WrapItem,
} from '@chakra-ui/react';
import { FiUser, FiHome, FiDollarSign, FiActivity } from 'react-icons/fi';
import { ActionButton } from './ActionButton';
import { CopyButton } from './CopyButton';
import { SuggestedAction } from './types';

interface EntityMetadata {
  status?: string;
  stage?: string;
  organizationId?: string;
  createdAt?: string;
  updatedAt?: string;
  industry?: string;
  size?: string;
  [key: string]: unknown;
}

interface Entity {
  id: string;
  type: string;
  name?: string;
  amount?: number;
  organizationName?: string;
  metadata?: EntityMetadata;
}

interface EntityCardProps {
  entity: Entity;
  actions?: SuggestedAction[];
  onAction?: (action: SuggestedAction) => void;
  compact?: boolean;
}

// Icon mapping for entity types
const getEntityIcon = (type: string) => {
  switch (type) {
    case 'deal': return <FiDollarSign />;
    case 'contact': return <FiUser />;
    case 'organization': return <FiHome />;
    case 'activity': return <FiActivity />;
    default: return <FiUser />;
  }
};

// Color scheme for entity types
const getEntityColorScheme = (type: string) => {
  switch (type) {
    case 'deal': return 'green';
    case 'contact': return 'blue';
    case 'organization': return 'purple';
    case 'activity': return 'orange';
    default: return 'gray';
  }
};

// Helper function to get deal status from stage or metadata
const getDealStatus = (entity: Entity) => {
  // First try to get status field (the actual status from deals table)
  if (entity.metadata?.status && entity.metadata.status !== null) {
    return entity.metadata.status;
  }
  
  // Fallback to stage if status not available
  if (entity.metadata?.stage && entity.metadata.stage !== null) {
    return entity.metadata.stage;
  }
  
  return 'New'; // Default status for new deals
};

// Helper function to format display name
const getDisplayName = (entity: Entity) => {
  if (entity.name && entity.name !== 'Unnamed' && !entity.name.startsWith('Deal ')) {
    return entity.name;
  }
  
  // Generate a more meaningful name for deals
  if (entity.type === 'deal') {
    if (entity.organizationName) {
      return `${entity.organizationName} Deal`;
    }
    if (entity.amount) {
      return `$${entity.amount.toLocaleString()} Deal`;
    }
  }
  
  return entity.name || 'Unnamed';
};

// Helper function to get relevant metadata (filter out unhelpful fields)
const getRelevantMetadata = (entity: Entity, compact: boolean) => {
  if (!entity.metadata) return [];
  
  const metadata = { ...entity.metadata };
  
  // Remove unhelpful fields
  delete metadata.stage; // We show this separately as status
  delete metadata.organizationId; // We show organization name instead
  delete metadata.createdAt; // Too verbose for cards
  delete metadata.updatedAt; // Too verbose for cards
  
  // Rename/format fields for better display
  const displayMetadata: Record<string, unknown> = {};
  
  if (metadata.industry) {
    displayMetadata.Industry = metadata.industry;
  }
  
  if (metadata.size) {
    displayMetadata.Size = metadata.size;
  }
  
  // Add status for deals
  if (entity.type === 'deal') {
    displayMetadata.Status = getDealStatus(entity);
  }
  
  return Object.entries(displayMetadata).slice(0, compact ? 2 : 3);
};

export const EntityCard: React.FC<EntityCardProps> = ({
  entity,
  actions = [],
  onAction,
  compact = false,
}) => {
  const bgColor = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const headerBg = useColorModeValue('gray.50', 'gray.600');
  
  const colorScheme = getEntityColorScheme(entity.type);
  const icon = getEntityIcon(entity.type);

  return (
    <Box
      borderWidth="1px"
      borderColor={borderColor}
      borderRadius="lg"
      bg={bgColor}
      overflow="hidden"
      shadow="sm"
      _hover={{
        shadow: 'md',
        transform: 'translateY(-1px)',
      }}
      transition="all 0.2s"
      maxW={compact ? "300px" : "400px"}
    >
      {/* Header */}
      <HStack
        bg={headerBg}
        px={4}
        py={2}
        spacing={3}
      >
        <Box color={`${colorScheme}.500`}>
          {icon}
        </Box>
        <VStack align="start" spacing={0} flex={1}>
          <HStack>
            <Badge colorScheme={colorScheme} size="sm">
              {entity.type.toUpperCase()}
            </Badge>
            <CopyButton 
              value={entity.id} 
              label={`${entity.type} ID`}
              size="sm"
            />
          </HStack>
          <Text fontWeight="bold" fontSize="sm" color={useColorModeValue('gray.800', 'gray.200')}>
            {getDisplayName(entity)}
          </Text>
        </VStack>
      </HStack>

      {/* Content */}
      <VStack align="start" spacing={2} p={4}>
        {/* Entity-specific details */}
        {entity.type === 'deal' && (
          <>
            {entity.amount && (
              <HStack>
                <Text fontSize="xs" color="gray.500">Amount:</Text>
                <Text fontWeight="semibold" color="green.600">
                  ${entity.amount.toLocaleString()}
                </Text>
                <CopyButton 
                  value={entity.amount} 
                  label="amount"
                  size="sm"
                />
              </HStack>
            )}
            {entity.organizationName && (
              <HStack>
                <Text fontSize="xs" color="gray.500">Organization:</Text>
                <Text fontSize="sm">{entity.organizationName}</Text>
              </HStack>
            )}
          </>
        )}

        {entity.type === 'contact' && entity.organizationName && (
          <HStack>
            <Text fontSize="xs" color="gray.500">Organization:</Text>
            <Text fontSize="sm">{entity.organizationName}</Text>
          </HStack>
        )}

        {/* Metadata */}
        {getRelevantMetadata(entity, compact).length > 0 && (
          <Box w="full">
            {getRelevantMetadata(entity, compact).map(([key, value]) => (
              <HStack key={key} fontSize="xs">
                <Text color="gray.500" textTransform="capitalize">
                  {key.replace(/([A-Z])/g, ' $1').trim()}:
                </Text>
                <Text>{String(value)}</Text>
              </HStack>
            ))}
          </Box>
        )}

        {/* Actions */}
        {actions.length > 0 && (
          <>
            <Divider />
            <Wrap spacing={2} w="full">
              {actions.map((action) => (
                <WrapItem key={action.id}>
                  <ActionButton
                    action={action}
                    onClick={onAction}
                    size="sm"
                  />
                </WrapItem>
              ))}
            </Wrap>
          </>
        )}
      </VStack>
    </Box>
  );
}; 