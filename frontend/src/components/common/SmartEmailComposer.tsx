import React, { useState, useEffect } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  VStack,
  useToast,
  HStack,
  Badge,
  Text,
  IconButton,
  Tooltip,
  Icon,
} from '@chakra-ui/react';
import { gql, useMutation } from '@apollo/client';
import { EmailIcon } from '@chakra-ui/icons';
import { FiEdit } from 'react-icons/fi';
import { useThemeColors } from '../../hooks/useThemeColors';

const COMPOSE_EMAIL = gql`
  mutation ComposeEmail($input: ComposeEmailInput!) {
    composeEmail(input: $input) {
      id
      subject
      from
      to
      timestamp
    }
  }
`;

interface EmailComposeData {
  to: string[];
  cc: string[];
  subject: string;
  body: string;
}

interface SmartEmailContext {
  dealId?: string;
  dealName?: string;
  personId?: string;
  personName?: string;
  organizationId?: string;
  organizationName?: string;
  threadId?: string; // For replies
}

interface SmartEmailComposerProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTo?: string;
  defaultSubject?: string;
  context?: SmartEmailContext;
  onSuccess?: () => void;
}

interface SmartEmailButtonProps {
  to: string;
  context?: SmartEmailContext;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  variant?: 'solid' | 'outline' | 'ghost';
  children?: React.ReactNode;
  tooltip?: string;
  isIconButton?: boolean;
  width?: string | 'full';
  icon?: 'email' | 'edit';
}

// Smart Email Composer Modal Component
export const SmartEmailComposer: React.FC<SmartEmailComposerProps> = ({
  isOpen,
  onClose,
  defaultTo,
  defaultSubject,
  context,
  onSuccess,
}) => {
  const colors = useThemeColors();
  const toast = useToast();

  const [formData, setFormData] = useState({
    to: defaultTo || '',
    cc: '',
    subject: defaultSubject || '',
    body: '',
  });

  // Update form data when props change
  useEffect(() => {
    if (isOpen) {
      const subject = generateSmartSubject(defaultSubject, context);
      setFormData({
        to: defaultTo || '',
        cc: '',
        subject,
        body: generateSmartBody(context),
      });
    }
  }, [isOpen, defaultTo, defaultSubject, context]);

  const [composeEmail, { loading }] = useMutation(COMPOSE_EMAIL, {
    onCompleted: () => {
      toast({
        title: 'Email sent successfully',
        status: 'success',
        duration: 3000,
      });
      onClose();
      onSuccess?.();
    },
    onError: (error) => {
      toast({
        title: 'Failed to send email',
        description: error.message,
        status: 'error',
        duration: 5000,
      });
    },
  });

  const handleSend = () => {
    if (!formData.to.trim()) {
      toast({
        title: 'Recipient Required',
        description: 'Please enter at least one recipient email address.',
        status: 'warning',
        duration: 3000,
      });
      return;
    }

    if (!formData.subject.trim()) {
      toast({
        title: 'Subject Required',
        description: 'Please enter an email subject.',
        status: 'warning',
        duration: 3000,
      });
      return;
    }

    const emailData: EmailComposeData = {
      to: formData.to.split(',').map(email => email.trim()).filter(Boolean),
      cc: formData.cc ? formData.cc.split(',').map(email => email.trim()).filter(Boolean) : [],
      subject: formData.subject,
      body: formData.body,
    };

    composeEmail({
      variables: {
        input: {
          ...emailData,
          dealId: context?.dealId,
          personId: context?.personId,
          organizationId: context?.organizationId,
          threadId: context?.threadId,
        },
      },
    });
  };

  const handleClose = () => {
    onClose();
    // Reset form
    setFormData({
      to: '',
      cc: '',
      subject: '',
      body: '',
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          <HStack spacing={3}>
            <Text>Compose Email</Text>
            {context && (
              <HStack spacing={2}>
                {context.dealName && (
                  <Badge colorScheme="blue" variant="subtle">
                    Deal: {context.dealName}
                  </Badge>
                )}
                {context.personName && (
                  <Badge colorScheme="green" variant="subtle">
                    Contact: {context.personName}
                  </Badge>
                )}
                {context.organizationName && (
                  <Badge colorScheme="purple" variant="subtle">
                    Org: {context.organizationName}
                  </Badge>
                )}
              </HStack>
            )}
          </HStack>
        </ModalHeader>
        <ModalCloseButton />
        
        <ModalBody>
          <VStack spacing={4}>
            <FormControl isRequired>
              <FormLabel>To</FormLabel>
              <Input
                value={formData.to}
                onChange={(e) => setFormData({ ...formData, to: e.target.value })}
                placeholder="recipient@example.com"
                bg={colors.bg.input}
                borderColor={colors.border.input}
              />
            </FormControl>
            
            <FormControl>
              <FormLabel>CC</FormLabel>
              <Input
                value={formData.cc}
                onChange={(e) => setFormData({ ...formData, cc: e.target.value })}
                placeholder="cc@example.com (optional)"
                bg={colors.bg.input}
                borderColor={colors.border.input}
              />
            </FormControl>
            
            <FormControl isRequired>
              <FormLabel>Subject</FormLabel>
              <Input
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                placeholder="Email subject"
                bg={colors.bg.input}
                borderColor={colors.border.input}
              />
            </FormControl>
            
            <FormControl>
              <FormLabel>Message</FormLabel>
              <Textarea
                value={formData.body}
                onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                placeholder="Type your message here..."
                rows={8}
                bg={colors.bg.input}
                borderColor={colors.border.input}
              />
            </FormControl>
          </VStack>
        </ModalBody>
        
        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={handleClose}>
            Cancel
          </Button>
          <Button
            colorScheme="blue"
            onClick={handleSend}
            isLoading={loading}
            loadingText="Sending..."
          >
            Send Email
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

// Smart Email Button Component
export const SmartEmailButton: React.FC<SmartEmailButtonProps> = ({
  to,
  context,
  size = 'sm',
  variant = 'ghost',
  children,
  tooltip = 'Send email',
  isIconButton = false,
  width,
  icon = 'email',
}) => {
  const [isComposerOpen, setIsComposerOpen] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsComposerOpen(true);
  };

  const handleSuccess = () => {
    // Optional: Trigger any parent refresh logic
  };

  const getIcon = () => {
    switch (icon) {
      case 'edit':
        return <Icon as={FiEdit} />;
      case 'email':
      default:
        return <EmailIcon />;
    }
  };

  if (isIconButton) {
    return (
      <>
        <Tooltip label={tooltip}>
          <IconButton
            icon={getIcon()}
            aria-label={tooltip}
            size={size}
            variant={variant}
            onClick={handleClick}
          />
        </Tooltip>
        
        <SmartEmailComposer
          isOpen={isComposerOpen}
          onClose={() => setIsComposerOpen(false)}
          defaultTo={to}
          context={context}
          onSuccess={handleSuccess}
        />
      </>
    );
  }

  return (
    <>
      <Button
        size={size}
        variant={variant}
        leftIcon={<EmailIcon />}
        onClick={handleClick}
        width={width}
      >
        {children || 'Send Email'}
      </Button>
      
      <SmartEmailComposer
        isOpen={isComposerOpen}
        onClose={() => setIsComposerOpen(false)}
        defaultTo={to}
        context={context}
        onSuccess={handleSuccess}
      />
    </>
  );
};

// Utility functions for smart content generation
function generateSmartSubject(defaultSubject?: string, context?: SmartEmailContext): string {
  if (defaultSubject) return defaultSubject;
  
  if (context?.dealName) {
    return `Re: ${context.dealName}`;
  }
  
  if (context?.organizationName) {
    return `Following up on ${context.organizationName}`;
  }
  
  return '';
}

function generateSmartBody(context?: SmartEmailContext): string {
  if (!context) return '';
  
  let body = 'Hi,\n\n';
  
  if (context.dealName) {
    body += `I wanted to follow up regarding ${context.dealName}.\n\n`;
  } else if (context.organizationName) {
    body += `I wanted to reach out regarding our collaboration with ${context.organizationName}.\n\n`;
  }
  
  body += 'Best regards';
  
  return body;
} 