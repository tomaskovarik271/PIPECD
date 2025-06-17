import React from 'react';
import {
  Box,
  Center,
  Flex,
  Heading,
  Icon,
  Text,
} from '@chakra-ui/react';
import { InfoIcon } from '@chakra-ui/icons';
import { useThemeColors } from '../../hooks/useThemeColors';
import { useThemeStore } from '../../stores/useThemeStore';
import DealHistoryList, { DealHistoryEntryDisplayItem } from './DealHistoryList';

interface DealHistoryPanelProps {
  historyEntries?: DealHistoryEntryDisplayItem[] | null;
}

export const DealHistoryPanel: React.FC<DealHistoryPanelProps> = ({
  historyEntries,
}) => {
  const colors = useThemeColors();
  const currentThemeName = useThemeStore((state) => state.currentTheme);
  const hasHistory = historyEntries && historyEntries.length > 0;

  return (
    <Box
      bg={colors.component.kanban.column} 
      borderRadius="xl" 
      borderWidth="1px"
      borderColor={colors.component.kanban.cardBorder}
      boxShadow="steelPlate"
      p={6}
      position="relative"
      _before={{
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '2px',
        background: `linear-gradient(90deg, transparent 0%, ${currentThemeName === 'industrialMetal' ? 'rgba(255, 170, 0, 0.6)' : 'transparent'} 50%, transparent 100%)`,
        pointerEvents: 'none',
      }}
    >
      <Flex justifyContent="space-between" alignItems="center" mb={4}>
        <Heading size="sm" color={colors.text.primary}>Deal History</Heading>
      </Flex>
      
      {hasHistory ? (
        <Box bg={colors.component.kanban.card} p={4} borderRadius="lg" borderWidth="1px" borderColor={colors.component.kanban.cardBorder} boxShadow="metallic">
          <DealHistoryList historyEntries={historyEntries} />
        </Box>
      ) : (
        <Center minH="100px" flexDirection="column" bg={colors.component.kanban.card} borderRadius="md" p={4} borderWidth="1px" borderColor={colors.component.kanban.cardBorder} boxShadow="metallic">
          <Icon as={InfoIcon} w={6} h={6} color={colors.text.muted} mb={3} />
          <Text color={colors.text.secondary} fontSize="sm">No history found for this deal.</Text>
        </Center>
      )}
    </Box>
  );
}; 