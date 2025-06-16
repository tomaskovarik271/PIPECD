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

  // NEW: Check for industrial theme for conditional 3D effects
  const isIndustrialTheme = colors.themeName === 'industrialMetal';

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
    <Box 
      className={className}
      bg={isIndustrialTheme ? 'linear-gradient(180deg, #1C1C1C 0%, #181818 50%, #141414 100%)' : 'transparent'}
      borderRadius="lg"
      p={isIndustrialTheme ? 4 : 0}
      position="relative"
      boxShadow={isIndustrialTheme ? '0 2px 6px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.05)' : 'none'}
      _before={isIndustrialTheme ? {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '3px',
        background: 'linear-gradient(90deg, rgba(255,170,0,0.3) 0%, rgba(255,170,0,0.1) 50%, rgba(255,170,0,0.3) 100%)',
        borderTopRadius: 'lg',
        zIndex: 1
      } : {}}
    >
      <Tabs 
        index={activeTab} 
        onChange={handleTabChange}
        variant="soft-rounded"
        colorScheme="blue"
      >
        <TabList 
          mb={4} 
          bg={isIndustrialTheme ? 'linear-gradient(135deg, #2A2A2A 0%, #1E1E1E 100%)' : colors.bg.surface} 
          p={1} 
          borderRadius="lg"
          border={isIndustrialTheme ? '1px solid rgba(255, 170, 0, 0.2)' : 'none'}
          boxShadow={isIndustrialTheme ? '0 2px 4px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.05)' : 'none'}
        >
          <Tab 
            flex={1} 
            fontSize="sm" 
            fontWeight="medium"
            _selected={{
              bg: isIndustrialTheme ? 'linear-gradient(135deg, #3A3A3A 0%, #2E2E2E 100%)' : colors.interactive.default,
              color: isIndustrialTheme ? '#FFAA00' : 'white',
              boxShadow: isIndustrialTheme ? '0 2px 4px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,170,0,0.1)' : 'none',
              borderColor: isIndustrialTheme ? 'rgba(255, 170, 0, 0.3)' : 'transparent',
            }}
            _hover={{
              bg: isIndustrialTheme ? 'linear-gradient(135deg, #353535 0%, #2A2A2A 100%)' : undefined,
              transform: isIndustrialTheme ? 'translateY(-1px)' : undefined,
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
              bg: isIndustrialTheme ? 'linear-gradient(135deg, #3A3A3A 0%, #2E2E2E 100%)' : colors.interactive.default,
              color: isIndustrialTheme ? '#FFAA00' : 'white',
              boxShadow: isIndustrialTheme ? '0 2px 4px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,170,0,0.1)' : 'none',
              borderColor: isIndustrialTheme ? 'rgba(255, 170, 0, 0.3)' : 'transparent',
            }}
            _hover={{
              bg: isIndustrialTheme ? 'linear-gradient(135deg, #353535 0%, #2A2A2A 100%)' : undefined,
              transform: isIndustrialTheme ? 'translateY(-1px)' : undefined,
            }}
          >
            <HStack spacing={2}>
              <Icon as={FiGrid} />
              <Text>Sticker Board</Text>
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
            <EnhancedSimpleNotes
              entityType="DEAL"
              entityId={dealId}
              dealId={dealId}
              readonly={readonly}
              onNoteCountChange={handleNotesCountChange}
            />
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