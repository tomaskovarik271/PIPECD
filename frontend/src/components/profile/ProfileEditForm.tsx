import React, { useState, useEffect } from 'react';
import { Box, VStack, FormControl, FormLabel, Input, Button, useToast, FormErrorMessage } from '@chakra-ui/react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { gql } from 'graphql-request';
import { gqlClient } from '../../lib/graphqlClient';
import { isGraphQLErrorWithMessage } from '../../lib/graphqlUtils';
import type { User, UpdateUserProfileInput as UserProfileUpdateInput } from '../../generated/graphql/graphql';

interface ProfileEditFormProps {
  user: User;
  onUpdateSuccess: (updatedUser: User) => void;
  onCancel?: () => void;
}

interface FormValues {
  display_name: string;
  avatar_url: string;
}

// Define the mutation string directly for graphql-request
const UPDATE_USER_PROFILE_MUTATION = gql`
  mutation UpdateUserProfile($input: UpdateUserProfileInput!) {
    updateUserProfile(input: $input) {
      id
      email
      display_name
      avatar_url
    }
  }
`;

const ProfileEditForm: React.FC<ProfileEditFormProps> = ({ user, onUpdateSuccess, onCancel }) => {
  // console.log('[ProfileEditForm] Rendering, current user:', user);
  const toast = useToast();
  // const { updateProfile, loading, error: storeError } = useUserProfileStore(); // Ensure this is commented or removed
  const [mutationLoading, setMutationLoading] = useState(false);
  const {
    handleSubmit,
    register,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    defaultValues: {
      display_name: user.display_name || '',
      avatar_url: user.avatar_url || '',
    },
  });

  // console.log('[ProfileEditForm] RHF errors object:', errors);

  useEffect(() => {
    reset({
      display_name: user.display_name || '',
      avatar_url: user.avatar_url || '',
    });
  }, [user, reset]);

  const onSubmit: SubmitHandler<FormValues> = async (values) => {
    // setFormError(null); // Ensure this is commented or removed
    // console.log('[ProfileEditForm] RHF errors object:', errors);

    const input: UserProfileUpdateInput = {};
    // Only include fields if they have changed or are being set
    // For simplicity, we send them if they are different or if they were empty and now have value.
    // More robust: check against initial values if truly only sending deltas is critical.
    if (values.display_name !== (user.display_name || '')) {
      input.display_name = values.display_name.trim() === '' ? null : values.display_name.trim();
    }
    if (values.avatar_url !== (user.avatar_url || '')) {
      input.avatar_url = values.avatar_url.trim() === '' ? null : values.avatar_url.trim();
    }

    // If no actual changes to submit (e.g., user made fields empty that were already null)
    // This can be refined to check if input object is empty if submitting nulls is expensive
    if (Object.keys(input).length === 0 && 
        (values.display_name.trim() === (user.display_name || '')) && 
        (values.avatar_url.trim() === (user.avatar_url || ''))) {
      toast({
        title: 'No Changes',
        description: 'No changes were made to your profile.',
        status: 'info',
        duration: 3000,
        isClosable: true,
      });
      if (onCancel) onCancel(); // Optionally close form if no changes
      return;
    }

    setMutationLoading(true);
    try {
      // Replace useMutation call with gqlClient.request
      const { updateUserProfile: updatedUser } = await gqlClient.request<
        { updateUserProfile: User },
        { input: UserProfileUpdateInput }
      >(UPDATE_USER_PROFILE_MUTATION, { input });

      if (updatedUser) {
        toast({
          title: 'Profile Updated',
          description: 'Your profile has been successfully updated.',
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
        onUpdateSuccess(updatedUser);
      } else {
        throw new Error('Failed to update profile: No data returned');
      }
    } catch (error: any) { // Type error as any for broader catch
      console.error('Error updating profile:', error);
      let errorMessage = 'Could not update your profile.';
      if (isGraphQLErrorWithMessage(error)) {
        errorMessage = error.response!.errors[0].message || errorMessage;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      toast({
        title: 'Update Failed',
        description: errorMessage,
        status: 'error',
        duration: 9000,
        isClosable: true,
      });
    } finally {
      setMutationLoading(false);
    }
  };

  return (
    <Box as="form" onSubmit={handleSubmit(onSubmit)} width="100%">
      <VStack spacing={4}>
        <FormControl isInvalid={!!errors.display_name}>
          <FormLabel htmlFor="display_name">Display Name</FormLabel>
          <Input
            id="display_name"
            {...register('display_name')}
          />
          <FormErrorMessage>
            {errors.display_name && errors.display_name.message}
          </FormErrorMessage>
        </FormControl>

        <FormControl isInvalid={!!errors.avatar_url}>
          <FormLabel htmlFor="avatar_url">Avatar URL</FormLabel>
          <Input
            id="avatar_url"
            type="url"
            {...register('avatar_url', {
              pattern: {
                value: /^(ftp|http|https):\/\/[^ "]+$/,
                message: 'Please enter a valid URL.',
              },
            })}
          />
          <FormErrorMessage>
            {errors.avatar_url && errors.avatar_url.message}
          </FormErrorMessage>
        </FormControl>

        <Button 
          type="submit" 
          colorScheme="blue" 
          isLoading={isSubmitting || mutationLoading}
          width="full"
        >
          Save Changes
        </Button>
        {onCancel && (
          <Button variant="ghost" onClick={onCancel} width="full">
            Cancel
          </Button>
        )}
      </VStack>
    </Box>
  );
};

export default ProfileEditForm; 