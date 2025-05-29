import React, { useState } from 'react';
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
import { useWFMStatusStore } from '../../../stores/useWFMStatusStore';
import { CreateWfmStatusInput } from '../../../generated/graphql/graphql';
import { useForm, Controller } from 'react-hook-form';
// import { ColorPicker } from '../../common/ColorPicker'; // Removed import
import { useThemeColors, useThemeStyles } from '../../../hooks/useThemeColors'; // NEW: Use semantic tokens

interface CreateStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStatusCreated: () => void;
}

interface StatusFormData {
    name: string;
    description?: string | null;
    // color?: string | null; // Removed color field
    // isArchived: boolean; // Removed as it's not in CreateWfmStatusInput
}

const CreateStatusModal: React.FC<CreateStatusModalProps> = ({
  isOpen,
  onClose,
  onStatusCreated,
}) => {
  const { createWFMStatus } = useWFMStatusStore();
  const { control, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<StatusFormData>();
  const toast = useToast();

  // NEW: Use semantic tokens for automatic theme adaptation
  const colors = useThemeColors();
  const styles = useThemeStyles();

  const handleClose = () => {
    reset({ name: '', description: '' /*, color: '' */ /* isArchived: false */ }); // Removed color from reset
    onClose();
  }

  const onSubmitForm = async (data: StatusFormData) => {
    const input: CreateWfmStatusInput = {
      name: data.name,
      description: data.description || undefined,
      // color: data.color || undefined, // Removed color from input
      // isArchived: data.isArchived, // Removed from input object
    };

    const success = await createWFMStatus(input);

    if (success) {
      toast({ title: 'Status created', description: `Status "${data.name}" was successfully created.`, status: 'success', duration: 3000 });
      onStatusCreated();
      handleClose();
    } else {
      toast({ title: 'Error creating status', description: useWFMStatusStore.getState().error || 'An unknown error occurred.', status: 'error', duration: 5000 });
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="lg" isCentered closeOnOverlayClick={false}>
      <ModalOverlay bg={colors.component.modal.overlay} /> {/* NEW: Semantic token */}
      <ModalContent 
        as="form" 
        onSubmit={handleSubmit(onSubmitForm)}
        bg={colors.component.modal.background} // NEW: Semantic token
        color={colors.text.primary} // NEW: Semantic token
        borderWidth="1px"
        borderColor={colors.border.default} // NEW: Semantic token
      >
        <ModalHeader 
            color={colors.text.primary} // NEW: Semantic token
            borderBottomWidth="1px"
            borderColor={colors.border.default} // NEW: Semantic token
        >
            Create New WFM Status
        </ModalHeader>
        <ModalCloseButton 
          color={colors.text.primary} // NEW: Semantic token
          _hover={{ bg: colors.component.button.ghostHover }} // NEW: Semantic token
          isDisabled={isSubmitting}
        />
        <ModalBody pb={6}>
          <VStack spacing={4}>
            <FormControl isInvalid={!!errors.name} isRequired>
              <FormLabel htmlFor="name" color={colors.text.secondary}>Name</FormLabel> {/* NEW: Semantic token */}
              <Controller
                name="name"
                control={control}
                defaultValue=""
                rules={{ required: 'Name is required' }}
                render={({ field }) => <Input id="name" {...field} autoFocus />}
              />
              <FormErrorMessage>{errors.name && errors.name.message}</FormErrorMessage>
            </FormControl>

            <FormControl isInvalid={!!errors.description}>
              <FormLabel htmlFor="description" color={colors.text.secondary}>Description (Optional)</FormLabel> {/* NEW: Semantic token */}
              <Controller
                name="description"
                control={control}
                defaultValue=""
                render={({ field }) => <Textarea id="description" {...field} value={field.value || ''} />}
              />
              <FormErrorMessage>{errors.description && errors.description.message}</FormErrorMessage>
            </FormControl>

            {/* REMOVED: ColorPicker FormControl - not needed for this component
            */}

            {/* REMOVED: Archived Switch - not part of CreateWfmStatusInput
            */}
          </VStack>
        </ModalBody>

        <ModalFooter 
            borderTopWidth="1px"
            borderColor={colors.border.default} // NEW: Semantic token
        >
          <Button 
            variant="ghost" 
            mr={3} 
            onClick={handleClose} 
            color={colors.text.secondary} // NEW: Semantic token
            _hover={{ bg: colors.component.button.ghostHover }} // NEW: Semantic token
            isDisabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            isLoading={isSubmitting}
            {...styles.button.primary} // NEW: Theme-aware button styles
          >
            Create Status
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default CreateStatusModal; 