import React from 'react';
import {
  Box,
  Text,
  VStack,
  Tooltip,
  Badge,
  HStack,
  Progress,
  Avatar,
  Tag,
} from '@chakra-ui/react';
import { Lead } from '../../stores/useLeadsStore';
import { Draggable, DraggableProvided, DraggableStateSnapshot } from '@hello-pangea/dnd';
import { useThemeColors } from '../../hooks/useThemeColors';
import { StarIcon } from '@chakra-ui/icons';
import { formatDistanceToNowStrict, isPast } from 'date-fns';

interface LeadCardKanbanProps {
  lead: Lead;
  index: number;
}

const LeadCardKanban: React.FC<LeadCardKanbanProps> = React.memo(({ lead, index }) => {
  const colors = useThemeColors();

  const placeholderTags = [lead.currentWfmStatus?.name].filter(Boolean) as string[];
  if (lead.estimated_value && lead.estimated_value > 50000) placeholderTags.push('High Value');
  if (lead.isQualified) placeholderTags.push('Qualified');

  const leadScore = lead.lead_score || 0;
  const scoreColor = leadScore >= 75 ? colors.text.success : leadScore >= 50 ? 'orange.400' : colors.text.muted;

  const estimatedCloseDate = lead.estimated_close_date ? new Date(lead.estimated_close_date) : null;
  let dueDateStatus = "";
  let dueDateColor = colors.text.muted;
  if (estimatedCloseDate) {
    if (isPast(estimatedCloseDate)) {
      dueDateStatus = `${formatDistanceToNowStrict(estimatedCloseDate, { addSuffix: true })} overdue`;
      dueDateColor = colors.text.error;
    } else {
      dueDateStatus = `Due in ${formatDistanceToNowStrict(estimatedCloseDate)}`;
    }
  }

  const baseStyle = {
    bg: colors.bg.elevated,
    p: 5,
    borderRadius: "lg",
    borderWidth: "1px",
    borderColor: colors.border.default,
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    _hover: {
      transform: "translateY(-4px) scale(1.02)",
      boxShadow: `
        0 20px 25px -5px rgba(59, 130, 246, 0.15),
        0 10px 10px -5px rgba(59, 130, 246, 0.1),
        0 0 20px rgba(59, 130, 246, 0.2),
        0 0 40px rgba(59, 130, 246, 0.1)
      `,
      borderColor: 'rgba(59, 130, 246, 0.5)',
      bg: colors.bg.elevated,
      filter: 'brightness(1.05)'
    }
  };

  const draggingStyle = {
    ...baseStyle,
    borderColor: 'rgba(59, 130, 246, 0.8)',
    boxShadow: `
      0 25px 50px -12px rgba(59, 130, 246, 0.25),
      0 15px 15px -5px rgba(59, 130, 246, 0.15),
      0 0 30px rgba(59, 130, 246, 0.3),
      0 0 60px rgba(59, 130, 246, 0.15)
    `,
    transform: 'translateY(-6px) rotate(2deg) scale(1.05)',
    filter: 'brightness(1.1)',
    bg: colors.bg.elevated,
  };

  return (
    <Draggable draggableId={lead.id} index={index}>
      {(provided: DraggableProvided, snapshot: DraggableStateSnapshot) => (
        <Box
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          style={{ ...provided.draggableProps.style }}
          mb={4}
          {...(snapshot.isDragging ? draggingStyle : baseStyle)}
          position="relative"
        >
          <VStack align="stretch" spacing={3}>
            <HStack justify="space-between" mb={2}>
              <VStack align="start" spacing={0.5}>
                <Text 
                  fontWeight="bold" 
                  color={colors.text.primary}
                  noOfLines={2} 
                  fontSize="md"
                >
                  {lead.name}
                </Text>
                <Text fontSize="sm" color={colors.text.muted} noOfLines={1}>
                  {lead.company_name || lead.contact_name || '-'}
                </Text>
                {lead.contact_email && (
                  <Text fontSize="xs" color={colors.text.secondary} noOfLines={1}>
                    {lead.contact_email}
                  </Text>
                )}
              </VStack>
              <VStack align="end" spacing={1}>
                <Text fontSize="lg" fontWeight="bold" color={colors.text.success}>
                  {lead.estimated_value ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits:0, maximumFractionDigits:0 }).format(lead.estimated_value) : '-'}
                </Text>
                <HStack spacing={1}>
                  <StarIcon boxSize={3} color={scoreColor} />
                  <Text fontSize="sm" fontWeight="semibold" color={scoreColor}>
                    {leadScore}
                  </Text>
                </HStack>
              </VStack>
            </HStack>

            {/* Lead Score Progress */}
            <Box mb={2}>
              <Progress 
                value={leadScore}
                size="sm" 
                colorScheme={leadScore >= 75 ? "green" : leadScore >= 50 ? "orange" : "gray"}
                bg={colors.bg.input}
                borderRadius="full"
              />
              <HStack justify="space-between" mt={1}>
                <Text fontSize="xs" color={colors.text.muted}>
                  Lead Score
                </Text>
                <Badge
                  size="sm"
                  bg={lead.isQualified ? colors.status.success : colors.bg.input}
                  color={lead.isQualified ? colors.text.onAccent : colors.text.primary}
                  borderWidth="1px"
                  borderColor={lead.isQualified ? colors.status.success : colors.border.default}
                >
                  {lead.isQualified ? 'Qualified' : 'Not Qualified'}
                </Badge>
              </HStack>
            </Box>

            {/* Source and Tags */}
            {(lead.source || placeholderTags.length > 0) && (
              <HStack spacing={1} wrap="wrap">
                {lead.source && (
                  <Tag size="sm" variant="outline" colorScheme="blue">
                    {lead.source}
                  </Tag>
                )}
                {placeholderTags.slice(0, 2).map((tag, idx) => (
                  <Tag key={idx} size="sm" variant="subtle" colorScheme="gray">
                    {tag}
                  </Tag>
                ))}
              </HStack>
            )}

            <HStack justify="space-between" borderTopWidth="1px" borderColor={colors.border.default} pt={2} mt="auto">
              <HStack spacing={2}>
                <Tooltip 
                  label={lead.assignedToUser?.display_name || lead.assignedToUser?.email || 'Unassigned'} 
                  aria-label="Assigned user"
                  placement="top"
                >
                  <Avatar 
                    size="sm"
                    name={lead.assignedToUser?.display_name || lead.assignedToUser?.email || 'Unassigned'} 
                    src={lead.assignedToUser?.avatar_url || undefined}
                    bg={lead.assignedToUser ? colors.interactive.default : colors.bg.input}
                    color={lead.assignedToUser ? colors.text.onAccent : colors.text.muted}
                    borderWidth="2px"
                    borderColor={lead.assignedToUser ? colors.border.accent : colors.border.default}
                    cursor="pointer"
                    _hover={{ 
                      transform: 'scale(1.05)',
                      borderColor: colors.interactive.hover 
                    }}
                    transition="all 0.2s ease-in-out"
                  />
                </Tooltip>
                {lead.assignedToUser && (
                  <Text fontSize="xs" color={colors.text.secondary} noOfLines={1} maxW="80px">
                    {lead.assignedToUser.display_name || lead.assignedToUser.email}
                  </Text>
                )}
                {!lead.assignedToUser && (
                  <Text fontSize="xs" color={colors.text.muted} fontStyle="italic">
                    Unassigned
                  </Text>
                )}
              </HStack>
              <Text fontSize="xs" color={dueDateColor} textAlign="right" maxW="100px" noOfLines={1}>
                {estimatedCloseDate ? dueDateStatus : 'No due date'}
              </Text>
            </HStack>
          </VStack>
        </Box>
      )}
    </Draggable>
  );
});

LeadCardKanban.displayName = 'LeadCardKanban';

export default LeadCardKanban; 