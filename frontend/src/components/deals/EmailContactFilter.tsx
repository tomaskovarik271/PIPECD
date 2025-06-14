import React, { useState } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Menu,
  MenuButton,
  MenuList,
  MenuOptionGroup,
  MenuItemOption,
  Tag,
  TagLabel,
  TagCloseButton,
  Badge,
  Spinner,
  Alert,
  AlertIcon,
  Divider,
  ButtonGroup,
  Avatar,
  Input,
  InputGroup,
  InputLeftElement,
} from '@chakra-ui/react';
import {
  ChevronDownIcon,
  SearchIcon,
  AddIcon,
  EmailIcon,
} from '@chakra-ui/icons';
import { useQuery, gql } from '@apollo/client';
import { useThemeColors } from '../../hooks/useThemeColors';

// GraphQL Queries
const GET_DEAL_PARTICIPANTS = gql`
  query GetDealParticipants($dealId: ID!) {
    getDealParticipants(dealId: $dealId) {
      id
      role
      addedFromEmail
      person {
        id
        first_name
        last_name
        email
      }
    }
  }
`;

const SUGGEST_EMAIL_PARTICIPANTS = gql`
  query SuggestEmailParticipants($dealId: ID!, $threadId: String) {
    suggestEmailParticipants(dealId: $dealId, threadId: $threadId) {
      id
      first_name
      last_name
      email
    }
  }
`;

// Types
interface DealParticipant {
  id: string;
  role: string;
  addedFromEmail: boolean;
  person: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
  };
}

interface EmailParticipantSuggestion {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
}

interface EmailContactFilterProps {
  dealId: string;
  primaryContactEmail?: string;
  selectedContacts: string[];
  contactScope: 'PRIMARY' | 'ALL' | 'CUSTOM' | 'SELECTED_ROLES';
  onContactsChange: (contacts: string[]) => void;
  onScopeChange: (scope: 'PRIMARY' | 'ALL' | 'CUSTOM' | 'SELECTED_ROLES') => void;
  isLoading?: boolean;
}

const EmailContactFilter: React.FC<EmailContactFilterProps> = ({
  dealId,
  primaryContactEmail,
  selectedContacts,
  contactScope,
  onContactsChange,
  onScopeChange,
  isLoading = false,
}) => {
  const colors = useThemeColors();
  const [searchTerm, setSearchTerm] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  // GraphQL Hooks
  const { data: participantsData, loading: participantsLoading } = useQuery(GET_DEAL_PARTICIPANTS, {
    variables: { dealId },
    skip: !dealId,
  });

  const { data: suggestionsData, loading: suggestionsLoading } = useQuery(SUGGEST_EMAIL_PARTICIPANTS, {
    variables: { dealId },
    skip: !dealId || !showSuggestions,
  });

  const participants = participantsData?.getDealParticipants || [];
  const suggestions = suggestionsData?.suggestEmailParticipants || [];

  // Helper functions
  const getContactDisplayName = (email: string): string => {
    const participant = participants.find((p: DealParticipant) => p.person.email === email);
    if (participant) {
      const { first_name, last_name } = participant.person;
      return `${first_name} ${last_name}`.trim() || email;
    }
    
    const suggestion = suggestions.find((s: EmailParticipantSuggestion) => s.email === email);
    if (suggestion) {
      return `${suggestion.first_name} ${suggestion.last_name}`.trim() || email;
    }
    
    return email;
  };

  const getContactRole = (email: string): string => {
    const participant = participants.find((p: DealParticipant) => p.person.email === email);
    return participant?.role || 'participant';
  };

  const getAllAvailableContacts = (): string[] => {
    const participantEmails = participants.map((p: DealParticipant) => p.person.email);
    const suggestionEmails = suggestions.map((s: EmailParticipantSuggestion) => s.email);
    const allEmails = [...new Set([...participantEmails, ...suggestionEmails])];
    
    if (primaryContactEmail && !allEmails.includes(primaryContactEmail)) {
      allEmails.unshift(primaryContactEmail);
    }
    
    return allEmails;
  };

  const filteredContacts = getAllAvailableContacts().filter(email =>
    email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    getContactDisplayName(email).toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handlers
  const handleScopeChange = (newScope: 'PRIMARY' | 'ALL' | 'CUSTOM' | 'SELECTED_ROLES') => {
    onScopeChange(newScope);
    
    // Auto-set contacts based on scope
    switch (newScope) {
      case 'PRIMARY':
        onContactsChange(primaryContactEmail ? [primaryContactEmail] : []);
        break;
      case 'ALL':
        onContactsChange(getAllAvailableContacts());
        break;
      case 'CUSTOM':
        // Keep current selection
        break;
      case 'SELECTED_ROLES':
        // Filter by primary and participant roles
        const roleBasedContacts = participants
          .filter((p: DealParticipant) => ['primary', 'participant'].includes(p.role))
          .map((p: DealParticipant) => p.person.email);
        onContactsChange(roleBasedContacts);
        break;
    }
  };

  const handleRemoveContact = (email: string) => {
    onContactsChange(selectedContacts.filter(c => c !== email));
  };

  const getScopeButtonText = () => {
    switch (contactScope) {
      case 'PRIMARY':
        return 'Primary Contact';
      case 'ALL':
        return 'All Participants';
      case 'SELECTED_ROLES':
        return 'Key Participants';
      case 'CUSTOM':
      default:
        return selectedContacts.length === 0 
          ? 'Select Contacts' 
          : `${selectedContacts.length} selected`;
    }
  };

  const getScopeDescription = () => {
    switch (contactScope) {
      case 'PRIMARY':
        return 'Show emails from the primary deal contact only';
      case 'ALL':
        return 'Show emails from all known participants';
      case 'SELECTED_ROLES':
        return 'Show emails from primary and key participants';
      case 'CUSTOM':
        return 'Show emails from selected contacts';
      default:
        return '';
    }
  };

  return (
    <VStack spacing={3} align="stretch">
      {/* Contact Scope Toggle */}
      <HStack spacing={2}>
        <Text fontSize="sm" fontWeight="medium" color={colors.text.primary}>
          Email Scope:
        </Text>
        <ButtonGroup size="sm" isAttached variant="outline">
          <Button
            isActive={contactScope === 'PRIMARY'}
            onClick={() => handleScopeChange('PRIMARY')}
            bg={contactScope === 'PRIMARY' ? colors.interactive.active : colors.bg.input}
            borderColor={contactScope === 'PRIMARY' ? colors.interactive.active : colors.border.input}
            color={contactScope === 'PRIMARY' ? colors.text.onAccent : colors.text.primary}
            _hover={{ 
              bg: contactScope === 'PRIMARY' ? colors.interactive.active : colors.component.button.secondaryHover,
            }}
          >
            Primary
          </Button>
          <Button
            isActive={contactScope === 'ALL'}
            onClick={() => handleScopeChange('ALL')}
            bg={contactScope === 'ALL' ? colors.interactive.active : colors.bg.input}
            borderColor={contactScope === 'ALL' ? colors.interactive.active : colors.border.input}
            color={contactScope === 'ALL' ? colors.text.onAccent : colors.text.primary}
            _hover={{ 
              bg: contactScope === 'ALL' ? colors.interactive.active : colors.component.button.secondaryHover,
            }}
          >
            All
          </Button>
          <Button
            isActive={contactScope === 'CUSTOM'}
            onClick={() => handleScopeChange('CUSTOM')}
            bg={contactScope === 'CUSTOM' ? colors.interactive.active : colors.bg.input}
            borderColor={contactScope === 'CUSTOM' ? colors.interactive.active : colors.border.input}
            color={contactScope === 'CUSTOM' ? colors.text.onAccent : colors.text.primary}
            _hover={{ 
              bg: contactScope === 'CUSTOM' ? colors.interactive.active : colors.component.button.secondaryHover,
            }}
          >
            Custom
          </Button>
        </ButtonGroup>
      </HStack>

      {/* Scope Description */}
      <Text fontSize="xs" color={colors.text.secondary}>
        {getScopeDescription()}
      </Text>

      {/* Custom Contact Selection */}
      {contactScope === 'CUSTOM' && (
        <VStack spacing={2} align="stretch">
          <Menu closeOnSelect={false}>
            <MenuButton
              as={Button}
              rightIcon={<ChevronDownIcon />}
              size="sm"
              minW="200px"
              bg={colors.bg.input}
              color={colors.text.primary}
              borderColor={colors.border.input}
              _hover={{
                bg: colors.component.button.secondaryHover,
                borderColor: colors.border.focus
              }}
              textAlign="left"
              fontWeight="normal"
              isLoading={participantsLoading || isLoading}
            >
              {getScopeButtonText()}
            </MenuButton>
            <MenuList maxH="300px" overflowY="auto">
              {/* Search Input */}
              <Box p={2}>
                <InputGroup size="sm">
                  <InputLeftElement>
                    <SearchIcon color={colors.text.secondary} />
                  </InputLeftElement>
                  <Input
                    placeholder="Search contacts..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    bg={colors.bg.input}
                    borderColor={colors.border.input}
                  />
                </InputGroup>
              </Box>
              
              <Divider />
              
              {/* Contact Options */}
              <MenuOptionGroup 
                type="checkbox" 
                value={selectedContacts}
                onChange={(values) => onContactsChange(values as string[])}
              >
                {filteredContacts.length === 0 ? (
                  <Box p={3} textAlign="center">
                    <Text fontSize="sm" color={colors.text.secondary}>
                      No contacts found
                    </Text>
                  </Box>
                ) : (
                  filteredContacts.map(email => {
                    const displayName = getContactDisplayName(email);
                    const role = getContactRole(email);
                    const isPrimary = email === primaryContactEmail;
                    
                    return (
                      <MenuItemOption key={email} value={email}>
                        <HStack spacing={2} w="full">
                          <Avatar size="xs" name={displayName} />
                          <VStack spacing={0} align="start" flex={1}>
                            <Text fontSize="sm" fontWeight={isPrimary ? 'bold' : 'normal'}>
                              {displayName}
                            </Text>
                            <Text fontSize="xs" color={colors.text.secondary}>
                              {email}
                            </Text>
                          </VStack>
                          <VStack spacing={1}>
                            {isPrimary && (
                              <Badge size="sm" colorScheme="blue" variant="subtle">
                                Primary
                              </Badge>
                            )}
                            <Badge size="sm" colorScheme="gray" variant="outline">
                              {role}
                            </Badge>
                          </VStack>
                        </HStack>
                      </MenuItemOption>
                    );
                  })
                )}
              </MenuOptionGroup>
              
              {/* Suggestions Toggle */}
              {!showSuggestions && suggestions.length === 0 && (
                <>
                  <Divider />
                  <Box p={2}>
                    <Button
                      size="sm"
                      variant="ghost"
                      leftIcon={<AddIcon />}
                      onClick={() => setShowSuggestions(true)}
                      isLoading={suggestionsLoading}
                      w="full"
                    >
                      Find more contacts
                    </Button>
                  </Box>
                </>
              )}
            </MenuList>
          </Menu>

          {/* Selected Contacts Tags */}
          {selectedContacts.length > 0 && (
            <HStack spacing={1} wrap="wrap">
              {selectedContacts.map(email => {
                const displayName = getContactDisplayName(email);
                const isPrimary = email === primaryContactEmail;
                
                return (
                  <Tag 
                    key={email} 
                    size="sm" 
                    colorScheme={isPrimary ? "blue" : "gray"}
                    variant="subtle"
                  >
                    <TagLabel>{displayName}</TagLabel>
                    <TagCloseButton onClick={() => handleRemoveContact(email)} />
                  </Tag>
                );
              })}
            </HStack>
          )}
        </VStack>
      )}

      {/* Contact Count Summary */}
      <HStack justify="space-between" align="center">
        <HStack spacing={2}>
          <EmailIcon color={colors.text.secondary} boxSize={4} />
          <Text fontSize="sm" color={colors.text.secondary}>
            {contactScope === 'PRIMARY' && primaryContactEmail ? '1 contact' :
             contactScope === 'ALL' ? `${getAllAvailableContacts().length} contacts` :
             contactScope === 'SELECTED_ROLES' ? `${participants.filter((p: DealParticipant) => ['primary', 'participant'].includes(p.role)).length} contacts` :
             `${selectedContacts.length} contacts`}
          </Text>
        </HStack>
        
        {participantsLoading && (
          <Spinner size="sm" color={colors.interactive.default} />
        )}
      </HStack>

      {/* No Primary Contact Warning */}
      {!primaryContactEmail && contactScope === 'PRIMARY' && (
        <Alert status="warning" size="sm">
          <AlertIcon />
          <Text fontSize="sm">
            No primary contact email found. Please add a primary contact to the deal.
          </Text>
        </Alert>
      )}
    </VStack>
  );
};

export default EmailContactFilter; 