import React from 'react';
import { Modal, ModalProps } from '@chakra-ui/react';
import { useResponsiveLayout } from '../../hooks/useResponsiveLayout';

interface ResponsiveModalProps extends Omit<ModalProps, 'size'> {
  baseSize?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | 'full';
  children: React.ReactNode;
}

/**
 * ResponsiveModal automatically adjusts modal sizes based on screen size
 * to prevent overflow on smaller screens while maintaining your beautiful designs on larger screens
 */
export const ResponsiveModal: React.FC<ResponsiveModalProps> = ({ 
  baseSize = 'xl',
  children,
  ...modalProps 
}) => {
  const { getModalSize } = useResponsiveLayout();
  
  // Get responsive size based on the base size you want
  const responsiveSize = getModalSize(baseSize);
  
  return (
    <Modal 
      {...modalProps}
      size={responsiveSize}
      // Responsive max width for very large modals
      {...(baseSize === '6xl' || baseSize === '5xl' ? {
        // On large screens, use your beautiful large sizes
        // On smaller screens, adapt gracefully
      } : {})}
    >
      {children}
    </Modal>
  );
}; 