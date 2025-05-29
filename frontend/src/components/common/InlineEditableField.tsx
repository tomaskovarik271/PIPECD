import React, { useState } from 'react';
import {
  HStack,
  Text,
  IconButton,
  Input,
  Select,
  useToast,
} from '@chakra-ui/react';
import { EditIcon, CheckIcon, SmallCloseIcon } from '@chakra-ui/icons';

interface InlineEditableFieldProps {
  label: string;
  value: string | number | null | undefined;
  displayValue?: string;
  inputType?: 'text' | 'number' | 'date' | 'select';
  selectOptions?: Array<{ value: string; label: string }>;
  onSave: (value: string | number | null) => Promise<void>;
  validate?: (value: string) => { isValid: boolean; errorMessage?: string };
  formatDisplay?: (value: string | number | null | undefined) => string;
  isEditable?: boolean;
  textColor?: string;
  editIconColor?: string;
  inputWidth?: string;
}

export const InlineEditableField: React.FC<InlineEditableFieldProps> = ({
  label,
  value,
  displayValue,
  inputType = 'text',
  selectOptions = [],
  onSave,
  validate,
  formatDisplay,
  isEditable = true,
  textColor = "gray.200",
  editIconColor = "gray.400",
  inputWidth = "120px",
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [newValue, setNewValue] = useState<string>('');
  const toast = useToast();

  const getDisplayValue = () => {
    if (displayValue !== undefined) return displayValue;
    if (formatDisplay) return formatDisplay(value);
    if (value === null || value === undefined) return '-';
    return String(value);
  };

  const handleStartEdit = () => {
    setIsEditing(true);
    setNewValue(value ? String(value) : '');
  };

  const handleSave = async () => {
    if (validate) {
      const validation = validate(newValue);
      if (!validation.isValid) {
        toast({
          title: `Invalid ${label}`,
          description: validation.errorMessage,
          status: 'error',
          duration: 3000,
          isClosable: true
        });
        return;
      }
    }

    try {
      let valueToSave: string | number | null = newValue;
      
      if (inputType === 'number') {
        const numericValue = parseFloat(newValue);
        valueToSave = isNaN(numericValue) ? null : numericValue;
      } else if (newValue === '') {
        valueToSave = null;
      }

      await onSave(valueToSave);
      
      toast({
        title: `${label} Updated`,
        status: 'success',
        duration: 2000,
        isClosable: true
      });
      
      setIsEditing(false);
    } catch (error) {
      toast({
        title: `Error Updating ${label}`,
        description: (error as Error).message,
        status: 'error',
        duration: 3000,
        isClosable: true
      });
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setNewValue('');
  };

  if (!isEditable) {
    return (
      <HStack justifyContent="space-between" alignItems="center">
        <Text fontSize="sm" color="gray.400">{label}</Text>
        <Text fontSize="md" fontWeight="medium" color={textColor}>
          {getDisplayValue()}
        </Text>
      </HStack>
    );
  }

  return (
    <HStack justifyContent="space-between" alignItems="center">
      <Text fontSize="sm" color="gray.400">{label}</Text>
      {!isEditing ? (
        <HStack spacing={2}>
          <Text fontSize="md" fontWeight="medium" color={textColor}>
            {getDisplayValue()}
          </Text>
          <IconButton 
            icon={<EditIcon />} 
            size="xs" 
            variant="ghost" 
            aria-label={`Edit ${label}`}
            onClick={handleStartEdit}
            color={editIconColor}
            _hover={{ color: "blue.300" }}
          />
        </HStack>
      ) : (
        <HStack spacing={2} flex={1} justifyContent="flex-end">
          {inputType === 'select' ? (
            <Select 
              value={newValue} 
              onChange={(e) => setNewValue(e.target.value)}
              size="sm" 
              w={inputWidth}
              bg="gray.800"
              borderColor="gray.500"
              _hover={{ borderColor: "gray.400" }}
              _focus={{ borderColor: "blue.400", boxShadow: "0 0 0 1px var(--chakra-colors-blue-400)" }}
            >
              <option value="">Select...</option>
              {selectOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          ) : (
            <Input 
              type={inputType} 
              value={newValue} 
              onChange={(e) => setNewValue(e.target.value)} 
              placeholder={`Enter ${label.toLowerCase()}`}
              size="sm" 
              w={inputWidth}
              textAlign={inputType === 'number' ? "right" : "left"}
              bg="gray.800"
              borderColor="gray.500"
              _hover={{ borderColor: "gray.400" }}
              _focus={{ borderColor: "blue.400", boxShadow: "0 0 0 1px var(--chakra-colors-blue-400)" }}
            />
          )}
          <IconButton 
            icon={<CheckIcon />} 
            size="xs" 
            colorScheme="green" 
            aria-label={`Save ${label}`}
            onClick={handleSave}
          />
          <IconButton 
            icon={<SmallCloseIcon />} 
            size="xs" 
            variant="ghost" 
            colorScheme="red" 
            aria-label={`Cancel Edit ${label}`}
            onClick={handleCancel}
          />
        </HStack>
      )}
    </HStack>
  );
}; 