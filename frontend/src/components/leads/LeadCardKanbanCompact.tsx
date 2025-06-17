import React from 'react';
import {
  Box,
  Text,
  HStack,
  Tooltip,
  Progress,
  Avatar,
  Badge,
  Flex,
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { Lead } from '../../stores/useLeadsStore';
import { Draggable, DraggableProvided, DraggableStateSnapshot } from '@hello-pangea/dnd';
import { useThemeColors } from '../../hooks/useThemeColors';
import { useLeadTheme } from '../../hooks/useLeadTheme';
import { StarIcon } from '@chakra-ui/icons';
import { formatDistanceToNowStrict, isPast } from 'date-fns';
import { CurrencyFormatter } from '../../lib/utils/currencyFormatter';

interface LeadCardKanbanCompactProps {
  lead: Lead;
  index: number;
}

const LeadCardKanbanCompact: React.FC<LeadCardKanbanCompactProps> = React.memo(({ lead, index }) => {
  const colors = useThemeColors();
  const leadTheme = useLeadTheme();
  const navigate = useNavigate();

  const handleCardClick = (e: React.MouseEvent) => {
    // Don't navigate if it's a drag event
    if (e.defaultPrevented) return;
    
    navigate(`/leads/${lead.id}`);
  };

  const leadScore = lead.lead_score || 0;
  const scoreColor = leadScore >= 75 ? colors.text.success : leadScore >= 50 ? 'orange.400' : colors.text.muted;

  const estimatedCloseDate = lead.estimated_close_date ? new Date(lead.estimated_close_date) : null;
  let dueDateColor = colors.text.muted;
  if (estimatedCloseDate && isPast(estimatedCloseDate)) {
    dueDateColor = colors.text.error;
  }

  const baseStyle = {
    bg: leadTheme.colors.bg.card,
    p: 3, // Reduced from 5 to 3
    borderRadius: "md", // Reduced from lg to md
    borderWidth: "1px",
    borderColor: leadTheme.colors.border.default,
    transition: "all 0.2s ease", // Faster transition
    cursor: "pointer",
    _hover: {
      transform: "translateY(-2px)", // Reduced from -4px
      boxShadow: `0 8px 15px -3px rgba(245, 158, 11, 0.1)`, // Smaller shadow
      borderColor: leadTheme.colors.border.accent,
      bg: leadTheme.colors.bg.hover,
    }
  };

  const draggingStyle = {
    ...baseStyle,
    borderColor: leadTheme.colors.border.accent,
    boxShadow: `0 15px 25px -5px rgba(245, 158, 11, 0.15)`,
    transform: 'translateY(-3px) rotate(1deg)',
    bg: leadTheme.colors.bg.hover,
  };

  return (
    <Draggable draggableId={lead.id} index={index}>
      {(provided: DraggableProvided, snapshot: DraggableStateSnapshot) => (
        <Box
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          style={{ ...provided.draggableProps.style }}
          mb={2} // Reduced from 4 to 2
          onClick={handleCardClick}
          {...(snapshot.isDragging ? draggingStyle : baseStyle)}
        >
          {/* Header Row: Name + Amount */}
          <HStack justify="space-between" mb={2}>
            <Text 
              fontWeight="semibold" 
              color={colors.text.primary}
              fontSize="sm"
              noOfLines={1}
              flex={1}
              minWidth={0}
            >
              {lead.name}
            </Text>
            <Text fontSize="sm" fontWeight="bold" color={colors.text.success} ml={2}>
              {lead.estimated_value ? CurrencyFormatter.format(lead.estimated_value, 'USD', { precision: 0 }) : '-'}
            </Text>
          </HStack>

          {/* Company + Lead Score */}
          <HStack justify="space-between" mb={2}>
            <Text fontSize="xs" color={colors.text.muted} noOfLines={1} flex={1} minWidth={0}>
              {lead.company_name || lead.contact_name || 'No company'}
            </Text>
            <HStack spacing={1}>
              <StarIcon boxSize={2.5} color={scoreColor} />
              <Text fontSize="xs" fontWeight="semibold" color={scoreColor}>
                {leadScore}
              </Text>
            </HStack>
          </HStack>

          {/* Progress Bar */}
          <Progress 
            value={leadScore}
            size="xs" // Smaller than sm
            colorScheme={leadScore >= 75 ? "green" : leadScore >= 50 ? "orange" : "gray"}
            bg={colors.bg.input}
            borderRadius="full"
            mb={2}
          />

          {/* Footer Row: User + Qualified Status + Due Date */}
          <HStack justify="space-between" align="center">
            <HStack spacing={1}>
              <Tooltip 
                label={lead.assignedToUser?.display_name || lead.assignedToUser?.email || 'Unassigned'} 
                aria-label="Assigned user"
                placement="top"
              >
                <Avatar 
                  size="xs" // Smaller avatar
                  name={lead.assignedToUser?.display_name || lead.assignedToUser?.email || 'U'} 
                  src={lead.assignedToUser?.avatar_url || undefined}
                  bg={lead.assignedToUser ? colors.interactive.default : colors.bg.input}
                  color={lead.assignedToUser ? colors.text.onAccent : colors.text.muted}
                />
              </Tooltip>
              <Text fontSize="xs" color={colors.text.secondary} noOfLines={1} maxW="50px">
                {lead.assignedToUser?.display_name || lead.assignedToUser?.email || 'Unassigned'}
              </Text>
            </HStack>
            
            <Flex direction="column" align="end" minWidth={0}>
              <Badge
                size="xs"
                bg={lead.isQualified ? colors.status.success : colors.bg.input}
                color={lead.isQualified ? colors.text.onAccent : colors.text.primary}
                fontSize="xs"
                px={1}
                py={0.5}
              >
                {lead.isQualified ? 'Q' : 'NQ'}
              </Badge>
              {estimatedCloseDate && (
                <Text fontSize="xs" color={dueDateColor} noOfLines={1} mt={0.5}>
                  {isPast(estimatedCloseDate) ? 'Overdue' : formatDistanceToNowStrict(estimatedCloseDate)}
                </Text>
              )}
            </Flex>
          </HStack>
        </Box>
      )}
    </Draggable>
  );
});

LeadCardKanbanCompact.displayName = 'LeadCardKanbanCompact';

export default LeadCardKanbanCompact; 