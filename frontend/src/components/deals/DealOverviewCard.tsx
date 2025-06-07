import React, { useState } from 'react';
import {
  Box,
  Heading,
  VStack,
  HStack,
  Text,
  IconButton,
  Input,
  Select,
  Progress,
  Avatar,
  useToast,
} from '@chakra-ui/react';
import { EditIcon, CheckIcon, SmallCloseIcon } from '@chakra-ui/icons';
import { Deal } from '../../stores/useDealsStore';

interface DealOverviewCardProps {
  deal: Deal;
  onUpdate: (dealId: string, updates: any) => Promise<void>;
  onRefresh: () => void;
  userList: Array<{ id: string; display_name?: string; email: string; avatar_url?: string }>;
  effectiveProbabilityDisplay: {
    display: string;
    value: number | null;
    source: string;
  };
}

export const DealOverviewCard: React.FC<DealOverviewCardProps> = ({
  deal,
  onUpdate,
  onRefresh,
  userList,
  effectiveProbabilityDisplay,
}) => {
  const [isEditingAmount, setIsEditingAmount] = useState(false);
  const [newAmount, setNewAmount] = useState<string>('');
  const [isEditingCloseDate, setIsEditingCloseDate] = useState(false);
  const [newCloseDateStr, setNewCloseDateStr] = useState<string>('');
  const [isEditingOwner, setIsEditingOwner] = useState(false);
  const [newOwnerId, setNewOwnerId] = useState<string | null>(null);
  
  const toast = useToast();

  const handleAmountUpdate = async () => {
    const numericAmount = parseFloat(newAmount);
    if (isNaN(numericAmount) || numericAmount < 0) {
      toast({ 
        title: 'Invalid Amount', 
        description: 'Please enter a valid positive number.', 
        status: 'error', 
        duration: 3000, 
        isClosable: true 
      });
      return;
    }
    try {
      await onUpdate(deal.id, { amount: numericAmount });
      toast({ title: 'Amount Updated', status: 'success', duration: 2000, isClosable: true });
      setIsEditingAmount(false);
      onRefresh();
    } catch (e) {
      toast({ 
        title: 'Error Updating Amount', 
        description: (e as Error).message, 
        status: 'error', 
        duration: 3000, 
        isClosable: true 
      });
    }
  };

  const handleCloseDateUpdate = async () => {
    try {
      const dateValue = newCloseDateStr ? newCloseDateStr : null;
      await onUpdate(deal.id, { expected_close_date: dateValue });
      toast({ 
        title: dateValue ? 'Expected Close Date Updated' : 'Expected Close Date Cleared', 
        status: 'success', 
        duration: 2000, 
        isClosable: true 
      });
      setIsEditingCloseDate(false);
      onRefresh();
    } catch (e) {
      toast({ 
        title: 'Error Updating Date', 
        description: (e as Error).message, 
        status: 'error', 
        duration: 3000, 
        isClosable: true 
      });
    }
  };

  const handleOwnerUpdate = async () => {
    try {
      // Validate user selection
      if (newOwnerId && !userList.find(user => user.id === newOwnerId)) {
        toast({ 
          title: 'Invalid User Selection', 
          description: 'The selected user is no longer available. Please refresh the page and try again.', 
          status: 'warning', 
          duration: 4000, 
          isClosable: true 
        });
        setIsEditingOwner(false);
        return;
      }

      await onUpdate(deal.id, { assignedToUserId: newOwnerId });
      toast({ title: 'Owner Updated', status: 'success', duration: 2000, isClosable: true });
      setIsEditingOwner(false);
      onRefresh();
    } catch (e) {
      const errorMessage = (e as Error).message;
      
      // Handle specific foreign key constraint error
      if (errorMessage.includes('violates foreign key constraint') || errorMessage.includes('not present in table')) {
        toast({ 
          title: 'User Not Found', 
          description: 'The selected user no longer exists. Please refresh the page to update the user list.', 
          status: 'error', 
          duration: 5000, 
          isClosable: true 
        });
      } else {
        toast({ 
          title: 'Error Updating Owner', 
          description: errorMessage, 
          status: 'error', 
          duration: 3000, 
          isClosable: true 
        });
      }
      setIsEditingOwner(false);
    }
  };

  return (
    <Box 
      bg="gray.700" 
      p={6} 
      borderRadius="xl"
      border="1px solid"
      borderColor="gray.600"
    >
      <Heading size="md" mb={5} color="white">Key Information</Heading>
      <VStack spacing={4} align="stretch">
        {/* Amount Field */}
        <HStack justifyContent="space-between" alignItems="center">
          <Text fontSize="sm" color="gray.400">Value</Text>
          {!isEditingAmount ? (
            <HStack spacing={2}>
              <Text fontSize="md" fontWeight="semibold" color="green.300">
                {deal.amount ? new Intl.NumberFormat('en-US', { 
                  style: 'currency', 
                  currency: 'USD', 
                  minimumFractionDigits: 0, 
                  maximumFractionDigits: 0 
                }).format(deal.amount) : '-'}
              </Text>
              <IconButton 
                icon={<EditIcon />} 
                size="xs" 
                variant="ghost" 
                aria-label="Edit Amount" 
                onClick={() => {
                  setIsEditingAmount(true);
                  setNewAmount(deal.amount ? String(deal.amount) : '');
                }}
                color="gray.400"
                _hover={{color: "blue.300"}}
              />
            </HStack>
          ) : (
            <HStack spacing={2} flex={1} justifyContent="flex-end">
              <Input 
                type="number" 
                value={newAmount} 
                onChange={(e) => setNewAmount(e.target.value)} 
                placeholder="Enter amount" 
                size="sm" 
                w="120px"
                textAlign="right"
                bg="gray.800"
                borderColor="gray.500"
                _hover={{borderColor: "gray.400"}}
                _focus={{borderColor: "blue.400", boxShadow: "0 0 0 1px var(--chakra-colors-blue-400)"}}
              />
              <IconButton 
                icon={<CheckIcon />} 
                size="xs" 
                colorScheme="green" 
                aria-label="Save Amount" 
                onClick={handleAmountUpdate}
              />
              <IconButton 
                icon={<SmallCloseIcon />} 
                size="xs" 
                variant="ghost" 
                colorScheme="red" 
                aria-label="Cancel Edit Amount" 
                onClick={() => setIsEditingAmount(false)}
              />
            </HStack>
          )}
        </HStack>

        {/* Probability Field */}
        <HStack justifyContent="space-between" alignItems="center">
          <Text fontSize="sm" color="gray.400">Probability</Text>
          <HStack flex={1} justifyContent="flex-end" spacing={2} maxW="60%">
            <Progress 
              value={effectiveProbabilityDisplay.value ? effectiveProbabilityDisplay.value * 100 : 0} 
              size="xs" 
              colorScheme="blue" 
              flex={1} 
              borderRadius="full" 
              bg="gray.600" 
            />
            <Text fontSize="sm" fontWeight="medium" color="blue.300" minW="40px" textAlign="right">
              {effectiveProbabilityDisplay.value != null ? 
                `${(effectiveProbabilityDisplay.value * 100).toFixed(0)}%` : 'N/A'}
            </Text>
          </HStack>
        </HStack>

        {/* Expected Close Date Field */}
        <HStack justifyContent="space-between" alignItems="center">
          <Text fontSize="sm" color="gray.400">Expected Close Date</Text>
          {!isEditingCloseDate ? (
            <HStack spacing={2}>
              <Text fontSize="md" fontWeight="medium" color="gray.200">
                {deal.expected_close_date ? new Date(deal.expected_close_date).toLocaleDateString() : '-'}
              </Text>
              <IconButton 
                icon={<EditIcon />} 
                size="xs" 
                variant="ghost" 
                aria-label="Edit Expected Close Date" 
                onClick={() => {
                  setIsEditingCloseDate(true);
                  if (deal.expected_close_date) {
                    const date = new Date(deal.expected_close_date);
                    setNewCloseDateStr(date.toISOString().split('T')[0]);
                  } else {
                    setNewCloseDateStr('');
                  }
                }}
                color="gray.400"
                _hover={{color: "blue.300"}}
              />
            </HStack>
          ) : (
            <HStack spacing={2} flex={1} justifyContent="flex-end">
              <Input 
                type="date" 
                value={newCloseDateStr} 
                onChange={(e) => setNewCloseDateStr(e.target.value)} 
                size="sm" 
                w="160px"
                bg="gray.800"
                borderColor="gray.500"
                _hover={{borderColor: "gray.400"}}
                _focus={{borderColor: "blue.400", boxShadow: "0 0 0 1px var(--chakra-colors-blue-400)"}}
              />
              <IconButton 
                icon={<CheckIcon />} 
                size="xs" 
                colorScheme="green" 
                aria-label="Save Expected Close Date" 
                onClick={handleCloseDateUpdate}
              />
              <IconButton 
                icon={<SmallCloseIcon />} 
                size="xs" 
                variant="ghost" 
                colorScheme="red" 
                aria-label="Cancel Edit Date" 
                onClick={() => setIsEditingCloseDate(false)}
              />
            </HStack>
          )}
        </HStack>

        {/* Owner Field */}
        <HStack justifyContent="space-between">
          <Text fontSize="sm" color="gray.400">Owner</Text>
          {!isEditingOwner ? (
            <HStack spacing={2}>
              <Avatar 
                size="xs" 
                name={deal.assignedToUser?.display_name || 'Unassigned'} 
                src={deal.assignedToUser?.avatar_url || undefined}
                bg="gray.500"
              />
              <Text fontSize="md" fontWeight="medium" color="gray.200">
                {deal.assignedToUser?.display_name || 'Unassigned'}
              </Text>
              <IconButton 
                icon={<EditIcon />} 
                size="xs" 
                variant="ghost" 
                aria-label="Edit Owner" 
                onClick={() => {
                  setIsEditingOwner(true);
                  setNewOwnerId(deal.assigned_to_user_id || null);
                }}
                color="gray.400"
                _hover={{color: "blue.300"}}
              />
            </HStack>
          ) : (
            <HStack spacing={2} flex={1} justifyContent="flex-end">
              <Select 
                value={newOwnerId || ''}
                onChange={(e) => setNewOwnerId(e.target.value || null)}
                size="sm" 
                w="180px"
                bg="gray.800"
                borderColor="gray.500"
                _hover={{borderColor: "gray.400"}}
                _focus={{borderColor: "blue.400", boxShadow: "0 0 0 1px var(--chakra-colors-blue-400)"}}
              >
                <option value="">Unassigned</option>
                {userList.map(user => (
                  <option key={user.id} value={user.id}>
                    {user.display_name || user.email}
                  </option>
                ))}
              </Select>
              <IconButton 
                icon={<CheckIcon />} 
                size="xs" 
                colorScheme="green" 
                aria-label="Save Owner" 
                onClick={handleOwnerUpdate}
              />
              <IconButton 
                icon={<SmallCloseIcon />} 
                size="xs" 
                variant="ghost" 
                colorScheme="red" 
                aria-label="Cancel Edit Owner" 
                onClick={() => setIsEditingOwner(false)}
              />
            </HStack>
          )}
        </HStack>

        {/* Project ID Field */}
        <HStack justifyContent="space-between" alignItems="center">
          <Text fontSize="sm" color="gray.400">Project ID</Text>
          <Text 
            fontSize="md" 
            fontWeight="bold" 
            color="blue.300"
            fontFamily="mono"
            bg="gray.800"
            px={3}
            py={1}
            borderRadius="md"
            border="1px solid"
            borderColor="gray.600"
          >
            #{(deal as any).project_id || '-'}
          </Text>
        </HStack>
      </VStack>
    </Box>
  );
}; 