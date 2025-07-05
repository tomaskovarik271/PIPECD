import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Checkbox,
  Avatar,
  Input,
  InputGroup,
  InputLeftElement,
  Badge,
  Flex,
  Spinner,
  Alert,
  AlertIcon,
} from '@chakra-ui/react';
import { SearchIcon, CloseIcon } from '@chakra-ui/icons';
import { useUserListStore } from '../../stores/useUserListStore';
import { useThemeColors } from '../../hooks/useThemeColors';

interface UserMultiSelectFieldProps {
  value: string[]; // Array of user IDs
  onChange: (userIds: string[]) => void;
  isDisabled?: boolean;
  placeholder?: string;
}

export const UserMultiSelectField: React.FC<UserMultiSelectFieldProps> = ({
  value = [],
  onChange,
  isDisabled = false,
  placeholder = "Select users...",
}) => {
  const colors = useThemeColors();
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  
  const { users, loading, error, fetchUsers, hasFetched } = useUserListStore();

  // Fetch users on mount if not already fetched
  useEffect(() => {
    if (!hasFetched && !loading) {
      fetchUsers();
    }
  }, [hasFetched, loading, fetchUsers]);

  // Filter users based on search term
  const filteredUsers = useMemo(() => {
    if (!searchTerm) return users;
    const term = searchTerm.toLowerCase();
    return users.filter(user => 
      user.display_name?.toLowerCase().includes(term) ||
      user.email.toLowerCase().includes(term)
    );
  }, [users, searchTerm]);

  // Get selected users for display
  const selectedUsers = useMemo(() => {
    return users.filter(user => value.includes(user.id));
  }, [users, value]);

  const handleUserToggle = (userId: string) => {
    if (isDisabled) return;
    
    const newValue = value.includes(userId)
      ? value.filter(id => id !== userId)
      : [...value, userId];
    
    onChange(newValue);
  };

  const handleRemoveUser = (userId: string) => {
    if (isDisabled) return;
    onChange(value.filter(id => id !== userId));
  };

  const handleClearAll = () => {
    if (isDisabled) return;
    onChange([]);
  };

  if (loading) {
    return (
      <Box p={4} textAlign="center">
        <Spinner size="sm" />
        <Text fontSize="sm" color={colors.text.secondary} mt={2}>
          Loading users...
        </Text>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert status="error" size="sm">
        <AlertIcon />
        <Text fontSize="sm">Failed to load users: {error}</Text>
      </Alert>
    );
  }

  return (
    <Box>
      {/* Selected Users Display */}
      {selectedUsers.length > 0 && (
        <Box mb={3}>
          <HStack justify="space-between" mb={2}>
            <Text fontSize="sm" fontWeight="medium" color={colors.text.primary}>
              Selected Users ({selectedUsers.length})
            </Text>
            <Button
              size="xs"
              variant="ghost"
              colorScheme="red"
              onClick={handleClearAll}
              isDisabled={isDisabled}
            >
              Clear All
            </Button>
          </HStack>
          <Flex wrap="wrap" gap={2}>
            {selectedUsers.map(user => (
              <Badge
                key={user.id}
                variant="solid"
                colorScheme="blue"
                p={2}
                borderRadius="md"
                display="flex"
                alignItems="center"
                gap={2}
              >
                <Avatar size="xs" name={user.display_name || user.email} src={user.avatar_url || undefined} />
                <Text fontSize="xs">{user.display_name || user.email}</Text>
                {!isDisabled && (
                  <CloseIcon
                    w={2}
                    h={2}
                    cursor="pointer"
                    onClick={() => handleRemoveUser(user.id)}
                    _hover={{ color: 'red.200' }}
                  />
                )}
              </Badge>
            ))}
          </Flex>
        </Box>
      )}

      {/* Search and Select Interface */}
      <Box>
        <InputGroup size="sm" mb={2}>
          <InputLeftElement>
            <SearchIcon color={colors.text.muted} />
          </InputLeftElement>
          <Input
            placeholder={placeholder}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={() => setIsOpen(true)}
            isDisabled={isDisabled}
            bg={colors.bg.input}
            borderColor={colors.border.input}
          />
        </InputGroup>

        {isOpen && (
          <Box
            maxH="200px"
            overflowY="auto"
            border="1px solid"
            borderColor={colors.border.default}
            borderRadius="md"
            bg={colors.bg.surface}
            boxShadow="sm"
          >
            {filteredUsers.length === 0 ? (
              <Box p={3} textAlign="center">
                <Text fontSize="sm" color={colors.text.muted}>
                  {searchTerm ? 'No users found matching your search' : 'No users available'}
                </Text>
              </Box>
            ) : (
              <VStack spacing={0} align="stretch">
                {filteredUsers.map(user => (
                  <Box
                    key={user.id}
                    p={3}
                    _hover={{ bg: colors.bg.elevated }}
                    cursor="pointer"
                    onClick={() => handleUserToggle(user.id)}
                  >
                    <HStack spacing={3}>
                      <Checkbox
                        isChecked={value.includes(user.id)}
                        onChange={() => handleUserToggle(user.id)}
                        isDisabled={isDisabled}
                      />
                      <Avatar size="sm" name={user.display_name || user.email} src={user.avatar_url || undefined} />
                      <VStack spacing={0} align="start" flex={1}>
                        <Text fontSize="sm" fontWeight="medium" color={colors.text.primary}>
                          {user.display_name || user.email}
                        </Text>
                        {user.display_name && (
                          <Text fontSize="xs" color={colors.text.muted}>
                            {user.email}
                          </Text>
                        )}
                      </VStack>
                    </HStack>
                  </Box>
                ))}
              </VStack>
            )}
          </Box>
        )}

        {/* Close dropdown when clicking outside */}
        {isOpen && (
          <Box
            position="fixed"
            top={0}
            left={0}
            right={0}
            bottom={0}
            zIndex={-1}
            onClick={() => setIsOpen(false)}
          />
        )}
      </Box>
    </Box>
  );
}; 