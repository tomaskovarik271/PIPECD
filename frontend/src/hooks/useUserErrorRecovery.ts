import { useCallback } from 'react';
import { useToast } from '@chakra-ui/react';
import { useUserListStore } from '../stores/useUserListStore';

export const useUserErrorRecovery = () => {
  const toast = useToast();
  const { refreshUsers, clearUsers } = useUserListStore();

  const handleUserNotFoundError = useCallback(async (error: string) => {
    // Check if error is related to user not found
    const isUserNotFoundError = 
      error.includes('violates foreign key constraint') ||
      error.includes('not present in table') ||
      error.includes('User ID') && error.includes('does not exist');

    if (isUserNotFoundError) {
      toast({
        title: 'User Data Out of Sync',
        description: 'Refreshing user list to fix the issue...',
        status: 'info',
        duration: 3000,
        isClosable: true,
      });

      try {
        // Clear and refresh user list
        clearUsers();
        await refreshUsers();
        
        toast({
          title: 'User List Updated',
          description: 'Please try your action again.',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        
        return true; // Indicates recovery was attempted
      } catch (_refreshError) {
        toast({
          title: 'Failed to Update User List',
          description: 'Please refresh the page manually.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
        return false;
      }
    }

    return false; // Not a user-related error
  }, [toast, refreshUsers, clearUsers]);

  const forceRefreshUsers = useCallback(async () => {
    try {
      clearUsers();
      await refreshUsers();
      toast({
        title: 'User List Refreshed',
        description: 'User data has been updated.',
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
    } catch (_error) {
      toast({
        title: 'Refresh Failed',
        description: 'Could not refresh user list. Please try reloading the page.',
        status: 'error',
        duration: 4000,
        isClosable: true,
      });
    }
  }, [toast, refreshUsers, clearUsers]);

  return {
    handleUserNotFoundError,
    forceRefreshUsers,
  };
}; 