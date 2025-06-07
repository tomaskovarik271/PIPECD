import React, { useState } from 'react';
import {
  Box,
  Flex,
  HStack,
  VStack,
  Text,
  Button,
  IconButton,
  Badge,
  Collapse,
  useDisclosure,
  Card,
  CardBody,
  CardHeader,
} from '@chakra-ui/react';
import { ChevronDownIcon, ChevronUpIcon } from '@chakra-ui/icons';
import { FiFileText } from 'react-icons/fi';
import { StickerBoard } from '../common/StickerBoard';
import { useThemeColors, useThemeStyles } from '../../hooks/useThemeColors';

interface DealStickerPanelProps {
  dealId: string;
  className?: string;
}

export const DealStickerPanel: React.FC<DealStickerPanelProps> = ({
  dealId,
  className = '',
}) => {
  const { isOpen: isExpanded, onToggle } = useDisclosure({ defaultIsOpen: true });
  const colors = useThemeColors();
  const styles = useThemeStyles();

  return (
    <Card {...styles.card} className={className} bg={colors.bg.elevated}>
      {/* Header */}
      <CardHeader borderBottom="1px solid" borderColor={colors.border.default}>
        <Flex justify="space-between" align="center">
          <HStack spacing={3}>
            <Box
              as={FiFileText}
              boxSize={5}
              color={colors.interactive.default}
            />
            <VStack align="start" spacing={0}>
              <Text fontSize="lg" fontWeight="semibold" color={colors.text.primary}>
                Smart Stickers
              </Text>
              <Text fontSize="sm" color={colors.text.secondary}>
                Visual Notes
              </Text>
            </VStack>
          </HStack>
          
          <IconButton
            aria-label={isExpanded ? "Collapse" : "Expand"}
            icon={isExpanded ? <ChevronUpIcon /> : <ChevronDownIcon />}
            variant="ghost"
            size="sm"
            onClick={onToggle}
            color={colors.text.secondary}
            _hover={{
              bg: colors.bg.elevated,
              color: colors.text.primary,
            }}
          />
        </Flex>
      </CardHeader>

      {/* Content */}
      <Collapse in={isExpanded} animateOpacity>
        <CardBody p={0}>
          <StickerBoard
            entityType="DEAL"
            entityId={dealId}
            className="min-h-[400px]"
          />
        </CardBody>
      </Collapse>
      
      {!isExpanded && (
        <CardBody>
          <Text textAlign="center" color={colors.text.secondary} fontSize="sm">
            Click to expand and view smart stickers
          </Text>
        </CardBody>
      )}
    </Card>
  );
}; 