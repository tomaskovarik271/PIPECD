/**
 * EnhancedResponse Component
 * Wraps AI responses with entity detection and contextual actions
 */

import React from 'react';
import {
  Box,
  VStack,
  Text,
  Divider,
  Wrap,
  WrapItem,
  useColorModeValue,
} from '@chakra-ui/react';
import ReactMarkdown from 'react-markdown';
import { EntityCard } from './EntityCard';
import { ActionButton } from './ActionButton';
import { ResponseParser } from './ResponseParser';
import type { ResponseEnhancementProps, SuggestedAction } from './types';

export const EnhancedResponse: React.FC<ResponseEnhancementProps> = ({
  content,
  thoughts,
  onAction,
  className,
}) => {
  const dividerColor = useColorModeValue('gray.200', 'gray.600');
  const sectionBg = useColorModeValue('gray.50', 'gray.700');
  const labelColor = useColorModeValue('gray.600', 'gray.400');
  const codeBg = useColorModeValue('gray.100', 'gray.700');
  const blockquoteBg = useColorModeValue('blue.50', 'blue.900');

  // Parse the response for enhancements
  const enhancementData = ResponseParser.parseResponse(content, thoughts);

  const handleAction = (action: SuggestedAction) => {
    if (onAction) {
      onAction(action);
    } else {
      // Default action handling
      switch (action.action) {
        case 'navigate':
          if (action.target) {
            window.location.href = action.target;
          }
          break;
        case 'copy':
          if (action.payload?.value) {
            navigator.clipboard.writeText(String(action.payload.value));
          }
          break;
        default:
          console.log('Action triggered:', action);
      }
    }
  };

  return (
    <VStack align="stretch" spacing={4} className={className}>
      {/* Main AI Response */}
      <Box>
        <ReactMarkdown 
          components={{
            // Custom styling for markdown elements
            h1: ({ children }) => (
              <Text as="h1" fontSize="xl" fontWeight="bold" mb={3}>
                {children}
              </Text>
            ),
            h2: ({ children }) => (
              <Text as="h2" fontSize="lg" fontWeight="semibold" mb={2}>
                {children}
              </Text>
            ),
            h3: ({ children }) => (
              <Text as="h3" fontSize="md" fontWeight="medium" mb={2}>
                {children}
              </Text>
            ),
            p: ({ children }) => (
              <Text mb={2} lineHeight="tall">
                {children}
              </Text>
            ),
            strong: ({ children }) => (
              <Text as="span" fontWeight="bold">
                {children}
              </Text>
            ),
            em: ({ children }) => (
              <Text as="span" fontStyle="italic">
                {children}
              </Text>
            ),
            ul: ({ children }) => (
              <Box as="ul" pl={4} mb={2}>
                {children}
              </Box>
            ),
            ol: ({ children }) => (
              <Box as="ol" pl={4} mb={2}>
                {children}
              </Box>
            ),
            li: ({ children }) => (
              <Text as="li" mb={1}>
                {children}
              </Text>
            ),
            code: ({ children }) => (
              <Text
                as="code"
                bg={codeBg}
                px={1}
                borderRadius="sm"
                fontFamily="mono"
                fontSize="sm"
              >
                {children}
              </Text>
            ),
            blockquote: ({ children }) => (
              <Box
                borderLeft="4px solid"
                borderColor="blue.300"
                pl={4}
                py={2}
                bg={blockquoteBg}
                borderRadius="md"
                mb={2}
              >
                {children}
              </Box>
            ),
          }}
        >
          {content}
        </ReactMarkdown>
      </Box>

      {/* Enhanced Sections - Only show if we have enhancements */}
      {enhancementData.hasEnhancements && (
        <>
          <Divider color={dividerColor} />
          
          {/* Detected Entities */}
          {enhancementData.entities.length > 0 && (
            <VStack align="stretch" spacing={3}>
              <Text fontSize="sm" fontWeight="medium" color={labelColor}>
                📊 Detected Entities
              </Text>
              <Wrap spacing={3}>
                {enhancementData.entities.map((entity) => (
                  <WrapItem key={`${entity.type}-${entity.id}`}>
                    <EntityCard
                      entity={entity}
                      actions={enhancementData.suggestedActions.filter(
                        action => action.id.includes(entity.id)
                      )}
                      onAction={handleAction}
                      compact={true}
                    />
                  </WrapItem>
                ))}
              </Wrap>
            </VStack>
          )}

          {/* Quick Actions */}
          {enhancementData.suggestedActions.some(action => !enhancementData.entities.some(entity => action.id.includes(entity.id))) && (
            <VStack align="stretch" spacing={3}>
              <Text fontSize="sm" fontWeight="medium" color={labelColor}>
                ⚡ Quick Actions
              </Text>
              <Box
                bg={sectionBg}
                p={3}
                borderRadius="md"
              >
                <Wrap spacing={2}>
                  {enhancementData.suggestedActions
                    .filter(action => !enhancementData.entities.some(entity => action.id.includes(entity.id)))
                    .map((action) => (
                      <WrapItem key={action.id}>
                        <ActionButton
                          action={action}
                          onClick={handleAction}
                          size="sm"
                        />
                      </WrapItem>
                    ))}
                </Wrap>
              </Box>
            </VStack>
          )}
        </>
      )}
    </VStack>
  );
}; 