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
  useToast,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Input,
  Textarea,
  VStack,
  HStack,
  Switch,
} from '@chakra-ui/react';
import { useForm, Controller } from 'react-hook-form';
import { useWFMStatusStore } from '../../../stores/useWFMStatusStore';
import { WfmStatus, UpdateWfmStatusInput } from '../../../generated/graphql/graphql';
import { useThemeStore } from '../../../stores/useThemeStore';

interface EditStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  statusToEdit: WfmStatus | null;
  onStatusUpdated: () => void; // To refresh the list
}

// Define StatusFormData locally, without color
interface StatusFormData {
  name: string;
  description?: string | null;
  isArchived: boolean;
  // color?: string | null; // Removed color
}

const EditStatusModal: React.FC<EditStatusModalProps> = ({
  isOpen,
  onClose,
  statusToEdit,
  onStatusUpdated,
}) => {
  const { updateWFMStatus } = useWFMStatusStore();
  const { control, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<StatusFormData>();
  const toast = useToast();

  // Get current theme
  const currentThemeName = useThemeStore((state) => state.currentTheme);
  const isModernTheme = currentThemeName === 'modern';

  useEffect(() => {
    if (statusToEdit) {
      reset({
        name: statusToEdit.name,
        description: statusToEdit.description,
        isArchived: statusToEdit.isArchived,
        // color: statusToEdit.color, // Removed color
      });
    } else {
      // Reset to default empty state if statusToEdit is null (e.g. modal closed and reopened without a selection)
      reset({ name: '', description: '', isArchived: false /*, color: ''*/ });
    }
  }, [statusToEdit, reset, isOpen]); // Added isOpen to reset if modal is reopened with different/no status

  if (!statusToEdit) return null;

  const handleClose = () => {
    // Reset form to current statusToEdit or empty if it's gone
    if (statusToEdit) {
        reset({ name: statusToEdit.name, description: statusToEdit.description, isArchived: statusToEdit.isArchived });
    } else {
        reset({ name: '', description: '', isArchived: false });
    }
    onClose();
  };

  const onSubmitForm = async (data: StatusFormData) => {
    if (!statusToEdit) return; // Should not happen

    const input: UpdateWfmStatusInput = {
      name: data.name,
      description: data.description || undefined,
      isArchived: data.isArchived,
      // color: data.color || undefined, // Removed color
    };

    const success = await updateWFMStatus(statusToEdit.id, input);

    if (success) {
      toast({ title: 'Status updated', description: `Status "${data.name}" updated.`, status: 'success', duration: 3000 });
      onStatusUpdated();
      handleClose();
    } else {
      toast({ title: 'Error updating status', description: useWFMStatusStore.getState().error || 'An unknown error occurred.', status: 'error', duration: 5000 });
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="lg" isCentered closeOnOverlayClick={false}>
      <ModalOverlay bg={isModernTheme ? "blackAlpha.600" : undefined} />
      <ModalContent 
        as="form" 
        onSubmit={handleSubmit(onSubmitForm)} // Use react-hook-form's handleSubmit
        bg={isModernTheme ? "gray.800" : undefined}
        color={isModernTheme ? "white" : undefined}
        border={isModernTheme ? "1px solid" : undefined}
        borderColor={isModernTheme ? "gray.600" : undefined}
      >
        <ModalHeader 
            color={isModernTheme ? "white" : undefined} 
            borderBottomWidth={isModernTheme ? "1px" : undefined} 
            borderColor={isModernTheme ? "gray.600" : undefined}
        >
            Edit WFM Status: {statusToEdit.name}
        </ModalHeader>
        <ModalCloseButton color={isModernTheme ? "white" : undefined} _hover={isModernTheme ? {bg: "gray.700"} : {}} isDisabled={isSubmitting} />
        <ModalBody pb={6}>
          <VStack spacing={4}>
            <FormControl isInvalid={!!errors.name} isRequired>
              <FormLabel htmlFor="name" color={isModernTheme ? "gray.200" : undefined}>Name</FormLabel>
              <Controller
                name="name"
                control={control}
                rules={{ required: 'Name is required' }}
                render={({ field }) => <Input id="name" {...field} autoFocus />}
              />
              <FormErrorMessage>{errors.name && errors.name.message}</FormErrorMessage>
            </FormControl>

            <FormControl isInvalid={!!errors.description}>
              <FormLabel htmlFor="description" color={isModernTheme ? "gray.200" : undefined}>Description (Optional)</FormLabel>
              <Controller
                name="description"
                control={control}
                render={({ field }) => <Textarea id="description" {...field} value={field.value || ''} />}
              />
              <FormErrorMessage>{errors.description && errors.description.message}</FormErrorMessage>
            </FormControl>

            <FormControl>
              <HStack justifyContent="space-between">
                <FormLabel htmlFor="isArchived" mb="0" color={isModernTheme ? "gray.200" : undefined}>
                  Archived?
                </FormLabel>
                <Controller
                  name="isArchived"
                  control={control}
                  render={({ field }) => (
                    <Switch 
                        id="isArchived" 
                        isChecked={field.value} 
                        onChange={(e) => field.onChange(e.target.checked)} 
                        colorScheme="blue"
                    />
                  )}
                />
              </HStack>
            </FormControl>
          </VStack>
        </ModalBody>

        <ModalFooter 
            borderTopWidth={isModernTheme ? "1px" : undefined} 
            borderColor={isModernTheme ? "gray.600" : undefined}
        >
          <Button variant={isModernTheme? "outline" : "ghost"} mr={3} onClick={handleClose} sx={isModernTheme ? {color: "gray.300", _hover:{bg:"gray.700"}} : {}} isDisabled={isSubmitting}>
            Cancel
          </Button>
          <Button colorScheme="blue" type="submit" isLoading={isSubmitting}>
            Save Changes
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default EditStatusModal; 