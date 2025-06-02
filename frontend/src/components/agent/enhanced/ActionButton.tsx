/**
 * ActionButton Component
 * Reusable button for contextual actions like 'View Deal', 'Edit', etc.
 */

import React from 'react';
import {
  Button,
  Tooltip,
  useColorModeValue,
} from '@chakra-ui/react';
import { 
  FiEye, 
  FiEdit, 
  FiPlus, 
  FiPhone, 
  FiMail, 
  FiCalendar,
  FiDollarSign,
  FiUser,
  FiHome,
  FiActivity,
  FiExternalLink
} from 'react-icons/fi';
import type { ActionButtonProps } from './types';

// Icon mapping for different action types
const getActionIcon = (action: string, iconName?: string) => {
  if (iconName) {
    // If specific icon provided, use it
    const iconMap: Record<string, React.ReactElement> = {
      eye: <FiEye />,
      edit: <FiEdit />,
      plus: <FiPlus />,
      phone: <FiPhone />,
      mail: <FiMail />,
      calendar: <FiCalendar />,
      dollar: <FiDollarSign />,
      user: <FiUser />,
      building: <FiHome />,
      activity: <FiActivity />,
      external: <FiExternalLink />,
    };
    return iconMap[iconName] || <FiEye />;
  }

  // Default icons based on action type
  switch (action) {
    case 'view': return <FiEye />;
    case 'edit': return <FiEdit />;
    case 'create': return <FiPlus />;
    case 'call': return <FiPhone />;
    case 'navigate': return <FiExternalLink />;
    default: return <FiEye />;
  }
};

// Color scheme mapping for different variants
const getColorScheme = (variant?: string, action?: string) => {
  if (variant === 'primary') return 'blue';
  if (variant === 'secondary') return 'gray';
  
  // Action-based color schemes
  switch (action) {
    case 'create': return 'green';
    case 'edit': return 'yellow';
    case 'call': return 'purple';
    case 'view':
    case 'navigate':
    default: return 'blue';
  }
};

export const ActionButton: React.FC<ActionButtonProps> = ({
  action,
  onClick,
  size = 'sm',
  isLoading = false,
}) => {
  const handleClick = () => {
    if (onClick && !action.disabled) {
      onClick(action);
    }
  };

  const icon = getActionIcon(action.action, action.icon);
  const colorScheme = getColorScheme(action.variant, action.action);
  
  const buttonVariant = action.variant === 'outline' ? 'outline' : 'solid';
  
  const bgColor = useColorModeValue(
    action.variant === 'outline' ? 'transparent' : `${colorScheme}.500`,
    action.variant === 'outline' ? 'transparent' : `${colorScheme}.600`
  );
  
  const hoverBgColor = useColorModeValue(
    action.variant === 'outline' ? `${colorScheme}.50` : `${colorScheme}.600`,
    action.variant === 'outline' ? `${colorScheme}.800` : `${colorScheme}.700`
  );

  const button = (
    <Button
      size={size}
      variant={buttonVariant}
      colorScheme={colorScheme}
      leftIcon={icon}
      onClick={handleClick}
      isLoading={isLoading}
      isDisabled={action.disabled}
      bg={action.variant === 'outline' ? 'transparent' : bgColor}
      _hover={{
        bg: hoverBgColor,
        transform: 'translateY(-1px)',
        shadow: 'sm',
      }}
      _active={{
        transform: 'translateY(0)',
      }}
      transition="all 0.2s"
      borderWidth={action.variant === 'outline' ? '1px' : '0'}
    >
      {action.label}
    </Button>
  );

  if (action.tooltip) {
    return (
      <Tooltip label={action.tooltip} hasArrow>
        {button}
      </Tooltip>
    );
  }

  return button;
}; 