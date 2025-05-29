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
import { useThemeStore } from '../../../stores/useThemeStore';

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

  // Get current theme
  const currentThemeName = useThemeStore((state) => state.currentTheme);
  const isModernTheme = currentThemeName === 'modern';

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
      <ModalOverlay bg={isModernTheme ? "blackAlpha.600" : undefined} />
      <ModalContent 
        as="form" 
        onSubmit={handleSubmit(onSubmitForm)}
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
            Create New WFM Status
        </ModalHeader>
        <ModalCloseButton color={isModernTheme ? "white" : undefined} _hover={isModernTheme ? {bg: "gray.700"} : {}} isDisabled={isSubmitting}/>
        <ModalBody pb={6}>
          <VStack spacing={4}>
            <FormControl isInvalid={!!errors.name} isRequired>
              <FormLabel htmlFor="name" color={isModernTheme ? "gray.200" : undefined}>Name</FormLabel>
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
              <FormLabel htmlFor="description" color={isModernTheme ? "gray.200" : undefined}>Description (Optional)</FormLabel>
              <Controller
                name="description"
                control={control}
                defaultValue=""
                render={({ field }) => <Textarea id="description" {...field} value={field.value || ''} />}
              />
              <FormErrorMessage>{errors.description && errors.description.message}</FormErrorMessage>
            </FormControl>

            {/* Removed ColorPicker FormControl
            <FormControl>
                <FormLabel htmlFor="color" color={isModernTheme ? "gray.200" : undefined}>Color (Optional)</FormLabel>
                <Controller
                    name="color"
                    control={control}
                    defaultValue=""
                    render={({ field }) => (
                        <ColorPicker 
                            value={field.value || ''} 
                            onChange={field.onChange} 
                            inputProps={{id: "color"}}
                        />
                    )}
                />
            </FormControl>
            */}

            {/* Removed Archived Switch as it's not part of CreateWfmStatusInput
            <FormControl>
              <HStack justifyContent="space-between">
                <FormLabel htmlFor="isArchived" mb="0" color={isModernTheme ? "gray.200" : undefined}>
                  Archived?
                </FormLabel>
                <Controller
                  name="isArchived"
                  control={control}
                  defaultValue={false}
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
            */}
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
            Create Status
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default CreateStatusModal; 