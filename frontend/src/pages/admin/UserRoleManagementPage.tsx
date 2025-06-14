import React, { useEffect, useState } from 'react';
import {
  Container,
  Box,
  Heading,
  Text,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Select,
  Badge,
  Avatar,
  VStack,
  HStack,
  Spinner,
  Alert,
  AlertIcon,
  Card,
  CardBody,
  CardHeader,
} from '@chakra-ui/react';
import { gql } from 'graphql-request';
import { gqlClient } from '../../lib/graphqlClient';
import { useUserListStore } from '../../stores/useUserListStore';
import { isGraphQLErrorWithMessage } from '../../lib/graphqlUtils';
import { useThemeColors } from '../../hooks/useThemeColors';

interface Role {
  id: string;
  name: string;
  description: string;
}

const GET_ROLES_QUERY = gql`
  query GetRoles {
    roles {
      id
      name
      description
    }
  }
`;

const ASSIGN_USER_ROLE_MUTATION = gql`
  mutation AssignUserRole($userId: ID!, $roleName: String!) {
    assignUserRole(userId: $userId, roleName: $roleName) {
      id
      email
      roles {
        id
        name
        description
      }
    }
  }
`;

const REMOVE_USER_ROLE_MUTATION = gql`
  mutation RemoveUserRole($userId: ID!, $roleName: String!) {
    removeUserRole(userId: $userId, roleName: $roleName) {
      id
      email
      roles {
        id
        name
        description
      }
    }
  }
`;

export const UserRoleManagementPage: React.FC = () => {
  const colors = useThemeColors();
  const { users, loading, error, fetchUsers, refreshUsers } = useUserListStore();
  const [roles, setRoles] = useState<Role[]>([]);
  const [rolesLoading, setRolesLoading] = useState(false);
  const [rolesError, setRolesError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
    fetchRoles();
  }, [fetchUsers]);

  const fetchRoles = async () => {
    setRolesLoading(true);
    setRolesError(null);
    try {
      const response = await gqlClient.request<{ roles: Role[] }>(GET_ROLES_QUERY);
      setRoles(response.roles);
    } catch (error) {
      console.error('Error fetching roles:', error);
      let message = 'Failed to fetch roles';
      if (isGraphQLErrorWithMessage(error) && error.response?.errors?.[0]?.message) {
        message = error.response.errors[0].message;
      }
      setRolesError(message);
    } finally {
      setRolesLoading(false);
    }
  };

  const handleRoleAction = async (userId: string, roleName: string, action: 'assign' | 'remove') => {
    const actionKey = `${userId}-${roleName}-${action}`;
    setActionLoading(actionKey);
    
    try {
      if (action === 'assign') {
        await gqlClient.request(ASSIGN_USER_ROLE_MUTATION, { userId, roleName });
      } else {
        await gqlClient.request(REMOVE_USER_ROLE_MUTATION, { userId, roleName });
      }
      
      // Refresh users to get updated roles
      await refreshUsers();
    } catch (error) {
      console.error(`Error ${action}ing role:`, error);
      let message = `Failed to ${action} role`;
      if (isGraphQLErrorWithMessage(error) && error.response?.errors?.[0]?.message) {
        message = error.response.errors[0].message;
      }
      alert(message);
    } finally {
      setActionLoading(null);
    }
  };

  const getUserRoleNames = (user: any) => {
    return user.roles?.map((role: any) => role.name) || [];
  };

  const getRoleDisplayBadge = (roleName: string) => {
    const colorScheme = {
      admin: 'red',
      member: 'blue', 
      read_only: 'green',
    };
    
    return (
      <Badge 
        colorScheme={colorScheme[roleName as keyof typeof colorScheme] || 'gray'}
        textTransform="uppercase"
        fontSize="xs"
      >
        {roleName.replace('_', ' ')}
      </Badge>
    );
  };

  if (loading || rolesLoading) {
    return (
      <Container maxW="6xl" py={8}>
        <VStack spacing={4} align="center" py={16}>
          <Spinner size="lg" color={colors.interactive.default} />
          <Text color={colors.text.secondary}>Loading users and roles...</Text>
        </VStack>
      </Container>
    );
  }

  if (error || rolesError) {
    return (
      <Container maxW="6xl" py={8}>
        <Alert status="error" bg={colors.bg.surface} borderColor={colors.border.error}>
          <AlertIcon color={colors.status.error} />
          <Text color={colors.text.primary}>Error: {error || rolesError}</Text>
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxW="6xl" py={8}>
      <Card 
        bg={colors.bg.surface}
        borderColor={colors.border.default}
        borderWidth="1px"
        shadow="md"
      >
        <CardHeader>
          <VStack spacing={4} align="start" width="100%">
            <Box>
              <Heading 
                as="h1" 
                size="xl" 
                mb={2}
                color={colors.text.primary}
              >
                User Role Management
              </Heading>
              <Text color={colors.text.secondary}>
                Assign and manage user roles. Only administrators can access this page.
              </Text>
            </Box>
          </VStack>
        </CardHeader>

        <CardBody>
          <Box width="100%" overflowX="auto">
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th 
                    color={colors.text.secondary}
                    borderColor={colors.border.default}
                    fontSize="sm"
                    fontWeight="600"
                    textTransform="uppercase"
                    letterSpacing="wider"
                  >
                    User
                  </Th>
                  <Th 
                    color={colors.text.secondary}
                    borderColor={colors.border.default}
                    fontSize="sm"
                    fontWeight="600"
                    textTransform="uppercase"
                    letterSpacing="wider"
                  >
                    Current Roles
                  </Th>
                  <Th 
                    color={colors.text.secondary}
                    borderColor={colors.border.default}
                    fontSize="sm"
                    fontWeight="600"
                    textTransform="uppercase"
                    letterSpacing="wider"
                  >
                    Assign Role
                  </Th>
                  <Th 
                    color={colors.text.secondary}
                    borderColor={colors.border.default}
                    fontSize="sm"
                    fontWeight="600"
                    textTransform="uppercase"
                    letterSpacing="wider"
                  >
                    Remove Role
                  </Th>
                </Tr>
              </Thead>
              <Tbody>
                {users.map((user) => {
                  const userRoleNames = getUserRoleNames(user);
                  
                  return (
                    <Tr 
                      key={user.id}
                      _hover={{ 
                        bg: colors.component.table.rowHover 
                      }}
                    >
                      <Td borderColor={colors.border.subtle}>
                        <HStack spacing={3}>
                          <Avatar 
                            size="sm" 
                            name={user.display_name || user.email} 
                            src={user.avatar_url || undefined}
                          />
                          <VStack align="start" spacing={0}>
                            <Text 
                              fontWeight="medium"
                              color={colors.text.primary}
                            >
                              {user.display_name || user.email}
                            </Text>
                            {user.display_name && (
                              <Text 
                                fontSize="sm" 
                                color={colors.text.muted}
                              >
                                {user.email}
                              </Text>
                            )}
                          </VStack>
                        </HStack>
                      </Td>
                      
                      <Td borderColor={colors.border.subtle}>
                        {userRoleNames.length > 0 ? (
                          <HStack spacing={2} wrap="wrap">
                            {userRoleNames.map((roleName: string) => (
                              <Box key={roleName}>
                                {getRoleDisplayBadge(roleName)}
                              </Box>
                            ))}
                          </HStack>
                        ) : (
                          <Text 
                            color={colors.text.muted} 
                            fontStyle="italic"
                            fontSize="sm"
                          >
                            No roles assigned
                          </Text>
                        )}
                      </Td>
                      
                      <Td borderColor={colors.border.subtle}>
                        <Select
                          placeholder="Select role to assign"
                          size="sm"
                          maxW="200px"
                          bg={colors.bg.input}
                          borderColor={colors.border.input}
                          color={colors.text.primary}
                          _hover={{
                            borderColor: colors.border.emphasis
                          }}
                          _focus={{
                            borderColor: colors.border.focus,
                            boxShadow: `0 0 0 1px ${colors.border.focus}`
                          }}
                          onChange={(e) => {
                            if (e.target.value) {
                              handleRoleAction(user.id, e.target.value, 'assign');
                              e.target.value = '';
                            }
                          }}
                          isDisabled={actionLoading !== null}
                        >
                          {roles
                            .filter(role => !userRoleNames.includes(role.name))
                            .map((role) => (
                              <option key={role.id} value={role.name}>
                                {role.name.replace('_', ' ')} - {role.description}
                              </option>
                            ))}
                        </Select>
                      </Td>
                      
                      <Td borderColor={colors.border.subtle}>
                        <Select
                          placeholder="Select role"
                          size="sm"
                          maxW="160px"
                          bg={colors.bg.input}
                          borderColor={colors.border.input}
                          color={colors.text.primary}
                          _hover={{
                            borderColor: colors.border.emphasis
                          }}
                          _focus={{
                            borderColor: colors.border.focus,
                            boxShadow: `0 0 0 1px ${colors.border.focus}`
                          }}
                          onChange={(e) => {
                            if (e.target.value) {
                              handleRoleAction(user.id, e.target.value, 'remove');
                              e.target.value = '';
                            }
                          }}
                          isDisabled={actionLoading !== null || userRoleNames.length === 0}
                        >
                          {userRoleNames.map((roleName: string) => (
                            <option key={roleName} value={roleName}>
                              {roleName.replace('_', ' ')}
                            </option>
                          ))}
                        </Select>
                      </Td>
                    </Tr>
                  );
                })}
              </Tbody>
            </Table>
          </Box>
        </CardBody>
      </Card>
    </Container>
  );
}; 