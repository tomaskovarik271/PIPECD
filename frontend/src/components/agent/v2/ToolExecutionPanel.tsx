import React from 'react';
import {
  Box,
  HStack,
  Text,
  Progress,
  Badge,
  useColorModeValue,
  Spinner,
  Icon
} from '@chakra-ui/react';
import { FiTool, FiClock } from 'react-icons/fi';
import { useThemeColors } from '../../../hooks/useThemeColors';

interface Props {
  currentTool: string;
  progress: number;
  estimatedTime?: string;
}

export const ToolExecutionPanel: React.FC<Props> = ({
  currentTool,
  progress,
  estimatedTime
}) => {
  const colors = useThemeColors();
  const panelBg = useColorModeValue('blue.50', 'blue.900');
  const borderColor = useColorModeValue('blue.200', 'blue.700');

  return (
    <Box
      w="full"
      bg={panelBg}
      border="1px"
      borderColor={borderColor}
      borderRadius="lg"
      p={3}
    >
      <HStack spacing={3}>
        <Spinner size="sm" color="blue.500" />
        
        <Icon as={FiTool} color="blue.500" />
        
        <Box flex="1">
          <HStack justify="space-between" mb={1}>
            <HStack spacing={2}>
              <Text fontSize="sm" fontWeight="medium" color={colors.text.primary}>
                Executing: {currentTool}
              </Text>
              <Badge colorScheme="blue" variant="subtle" size="sm">
                Running
              </Badge>
            </HStack>
            
            {estimatedTime && (
              <HStack spacing={1}>
                <Icon as={FiClock} size={12} color={colors.text.secondary} />
                <Text fontSize="xs" color={colors.text.secondary}>
                  {estimatedTime}
                </Text>
              </HStack>
            )}
          </HStack>
          
          <Progress
            value={progress * 100}
            size="sm"
            colorScheme="blue"
            borderRadius="full"
            bg={useColorModeValue('gray.200', 'gray.700')}
          />
        </Box>
      </HStack>
    </Box>
  );
}; 