import React, { useState, useEffect } from 'react';
import {
  Box,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Badge,
  HStack,
  Text,
  Icon,
  Tooltip,
} from '@chakra-ui/react';
import { FiEdit3, FiGrid, FiInfo } from 'react-icons/fi';
import { useThemeColors } from '../../hooks/useThemeColors';
import { SimpleNotes } from '../common/SimpleNotes';
import { EnhancedSimpleNotes } from '../common/EnhancedSimpleNotes';
import { StickerBoard } from '../common/StickerBoard';

interface DealNotesPanelProps {
  dealId: string;
  readonly?: boolean;
  className?: string;
  onNoteCountChange?: (count: number) => void;
}

export const DealNotesPanel: React.FC<DealNotesPanelProps> = ({
  dealId,
  readonly = false,
  className = '',
  onNoteCountChange,
}) => {
  const [totalNotesCount, setTotalNotesCount] = useState(0);
  const [activeTab, setActiveTab] = useState(0);
  
  const colors = useThemeColors();

  const handleTabChange = (index: number) => {
    setActiveTab(index);
  };

  // Handle count updates from either view (they show the same data, so use the max count)
  const handleNotesCountChange = (count: number) => {
    setTotalNotesCount(count);
  };

  const handleStickersCountChange = (count: number) => {
    // Since stickers include all notes, use the stickers count as the total
    setTotalNotesCount(count);
  };

  // Report total count to parent
  useEffect(() => {
    if (onNoteCountChange) {
      onNoteCountChange(totalNotesCount);
    }
  }, [totalNotesCount, onNoteCountChange]);

  return (
    <Box className={className}>
      <Tabs 
        index={activeTab} 
        onChange={handleTabChange}
        variant="soft-rounded"
        colorScheme="blue"
      >
        <TabList mb={4} bg={colors.bg.surface} p={1} borderRadius="lg">
          <Tab 
            flex={1} 
            fontSize="sm" 
            fontWeight="medium"
            _selected={{
              bg: colors.interactive.default,
              color: 'white',
            }}
          >
            <HStack spacing={2}>
              <Icon as={FiEdit3} />
              <Text>Quick Notes</Text>
              {totalNotesCount > 0 && activeTab === 0 && (
                <Badge 
                  size="sm" 
                  colorScheme="whiteAlpha"
                  variant="solid"
                >
                  {totalNotesCount}
                </Badge>
              )}
              <Tooltip 
                label="Simple text notes, similar to Pipedrive. Perfect for quick thoughts and meeting notes."
                placement="top"
              >
                <Box>
                  <Icon as={FiInfo} size={12} opacity={0.6} />
                </Box>
              </Tooltip>
            </HStack>
          </Tab>
          
          <Tab 
            flex={1} 
            fontSize="sm" 
            fontWeight="medium"
            _selected={{
              bg: colors.interactive.default,
              color: 'white',
            }}
          >
            <HStack spacing={2}>
              <Icon as={FiGrid} />
              <Text>Smart Stickers</Text>
              {totalNotesCount > 0 && activeTab === 1 && (
                <Badge 
                  size="sm" 
                  colorScheme="whiteAlpha"
                  variant="solid"
                >
                  {totalNotesCount}
                </Badge>
              )}
              <Tooltip 
                label="Advanced visual sticky notes with categories, colors, and spatial organization. Great for complex project planning."
                placement="top"
              >
                <Box>
                  <Icon as={FiInfo} size={12} opacity={0.6} />
                </Box>
              </Tooltip>
            </HStack>
          </Tab>
        </TabList>

        <TabPanels>
          {/* Simple Notes Panel */}
          <TabPanel p={0}>
            <Box>
              <Text 
                fontSize="sm" 
                color={colors.text.secondary} 
                mb={4}
                fontStyle="italic"
              >
                💡 <strong>Enhanced Notes:</strong> Rich text formatting, email-to-note conversion, file attachments, and templates! 
                Perfect for detailed meeting notes, follow-ups, and structured documentation.
              </Text>
              
              <EnhancedSimpleNotes
                entityType="DEAL"
                entityId={dealId}
                dealId={dealId}
                readonly={readonly}
                onNoteCountChange={handleNotesCountChange}
              />
            </Box>
          </TabPanel>

          {/* Smart Stickers Panel */}
          <TabPanel p={0}>
            <Box>
              <Text 
                fontSize="sm" 
                color={colors.text.secondary} 
                mb={4}
                fontStyle="italic"
              >
                🎨 <strong>Visual Board View:</strong> The same notes displayed as draggable sticky notes with categories, colors, and spatial organization. 
                Drag, resize, and organize your thoughts visually - perfect for complex deal planning!
              </Text>
              
              <StickerBoard
                entityType="DEAL"
                entityId={dealId}
                readonly={readonly}
                onStickerCountChange={handleStickersCountChange}
              />
            </Box>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
}; 