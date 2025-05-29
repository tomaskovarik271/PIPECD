import { useMemo } from 'react';
import { useUserListStore, UserListItem } from '../stores/useUserListStore';
import { useAppStore } from '../stores/useAppStore';
import type { Deal } from '../stores/useDealsStore';

interface UseUserAssignmentOptions {
  deal?: Deal | null;
}

interface UseUserAssignmentResult {
  assignableUsers: UserListItem[];
  isAssignToDisabled: boolean;
  userListLoading: boolean;
  userListError: string | null;
  isAdmin: boolean;
  canAssignOwn: boolean;
}

export const useUserAssignment = (options: UseUserAssignmentOptions = {}): UseUserAssignmentResult => {
  const { deal } = options;
  
  const { 
    users: allUsersFromStore, 
    loading: userListLoading, 
    error: userListError, 
    fetchUsers: fetchUserList, 
    hasFetched: userListHasFetched 
  } = useUserListStore();
  
  const { session, userPermissions } = useAppStore();
  const currentUserId = session?.user?.id;
  const isAdmin = userPermissions?.includes('deal:assign_any') || false;
  const canAssignOwn = userPermissions?.includes('deal:assign_own') || false;

  // Determine if the "Assign To" dropdown should be disabled
  const isAssignToDisabled = useMemo(() => {
    if (userListLoading) {
      return true; // Always disable if user list is loading
    }
    
    if (isAdmin) {
      return false; // Admins can always assign
    }
    
    if (canAssignOwn && deal && currentUserId) {
      const isCreator = deal.user_id === currentUserId;
      const isCurrentAssignee = deal.assigned_to_user_id === currentUserId;
      const isUnassigned = !deal.assigned_to_user_id;
      
      return !(isCreator || isCurrentAssignee || isUnassigned);
    }
    
    return true; // Default to disabled if no permissions
  }, [userListLoading, isAdmin, canAssignOwn, deal, currentUserId]);

  // Determine the list of users that can be assigned based on permissions
  const assignableUsers = useMemo(() => {
    if (userListLoading || !currentUserId || !allUsersFromStore) {
      return [];
    }
    
    if (isAdmin) {
      return allUsersFromStore; // Admins can see everyone
    }
    
    // For non-admin users with assign_own permission, show all users
    // The backend will enforce the actual assignment rules
    return allUsersFromStore;
  }, [allUsersFromStore, userListLoading, isAdmin, currentUserId]);

  return {
    assignableUsers,
    isAssignToDisabled,
    userListLoading,
    userListError,
    isAdmin,
    canAssignOwn,
  };
}; 