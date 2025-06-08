/**
 * CopyButton Component
 * Reusable button for copying actionable data with toast feedback
 */

import React, { useState } from 'react';
import {
  IconButton,
  Button,
  useToast,
  Tooltip,
  HStack,
  Text,
  useColorModeValue,
} from '@chakra-ui/react';
import { FiCopy, FiCheck } from 'react-icons/fi';
import type { CopyButtonProps } from './types';

export const CopyButton: React.FC<CopyButtonProps> = ({
  value,
  label,
  size = 'sm',
  variant = 'ghost',
  showLabel = false,
}) => {
  const [isCopied, setIsCopied] = useState(false);
  const toast = useToast();
  
  const copyColor = useColorModeValue('gray.600', 'gray.400');
  const successColor = useColorModeValue('green.600', 'green.400');
  const hoverBg = useColorModeValue('gray.100', 'gray.700');

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(String(value));
      setIsCopied(true);
      
      toast({
        title: 'Copied!',
        description: `${label || 'Value'} copied to clipboard`,
        status: 'success',
        duration: 2000,
        isClosable: true,
        size: 'sm',
      });

      // Reset the icon after 2 seconds
      setTimeout(() => setIsCopied(false), 2000);
    } catch (error) {
      toast({
        title: 'Copy failed',
        description: 'Unable to copy to clipboard',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const icon = isCopied ? <FiCheck /> : <FiCopy />;
  const tooltipLabel = isCopied ? 'Copied!' : `Copy ${label || 'value'}`;
  const iconColor = isCopied ? successColor : copyColor;

  if (showLabel) {
    return (
      <Tooltip label={tooltipLabel} hasArrow>
        <Button
          size={size}
          variant={variant}
          onClick={handleCopy}
          leftIcon={React.cloneElement(icon, { color: iconColor })}
          color={iconColor}
          _hover={{
            backgroundColor: hoverBg,
          }}
        >
          <HStack spacing={1}>
            <Text fontSize="xs" fontFamily="mono">
              {String(value).substring(0, 8)}...
            </Text>
          </HStack>
        </Button>
      </Tooltip>
    );
  }

  return (
    <Tooltip label={tooltipLabel} hasArrow>
      <IconButton
        aria-label={`Copy ${label || 'value'}`}
        icon={React.cloneElement(icon, { color: iconColor })}
        size={size}
        variant={variant}
        onClick={handleCopy}
        _hover={{
          backgroundColor: hoverBg,
        }}
      />
    </Tooltip>
  );
}; 