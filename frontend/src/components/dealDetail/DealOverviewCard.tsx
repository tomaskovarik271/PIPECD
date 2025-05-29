import React, { useMemo } from 'react';
import {
  Box,
  Heading,
  VStack,
  HStack,
  Text,
  Progress,
} from '@chakra-ui/react';
import { InlineEditableField } from '../common/InlineEditableField';
import type { Deal } from '../../stores/useDealsStore';

interface DealOverviewCardProps {
  deal: Deal;
  onUpdateDeal: (dealId: string, updates: Record<string, any>) => Promise<void>;
  isModernTheme?: boolean;
  userList?: Array<{ id: string; display_name?: string; email: string }>;
}

export const DealOverviewCard: React.FC<DealOverviewCardProps> = ({
  deal,
  onUpdateDeal,
  isModernTheme = false,
  userList = []
}) => {
  const getEffectiveProbabilityDisplay = useMemo(() => {
    let probability = deal.deal_specific_probability;
    let source = 'manual';
    
    if (probability == null) {
      if (deal.currentWfmStep?.metadata && 
          typeof deal.currentWfmStep.metadata === 'object' && 
          'deal_probability' in deal.currentWfmStep.metadata) {
        const stepProbability = (deal.currentWfmStep.metadata as { deal_probability?: number }).deal_probability;
        if (stepProbability != null) {
          probability = stepProbability;
          source = 'step';
        }
      }
    }
    
    if (probability == null) return { display: 'N/A', value: null, source: '' };
    
    return {
      display: `${Math.round(probability * 100)}% (${source})`,
      value: probability,
      source
    };
  }, [deal]);

  const formatCurrency = (value: string | number | null | undefined) => {
    if (!value || (typeof value === 'string' && value === '')) return '-';
    const amount = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(amount)) return '-';
    return new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: 'USD', 
      minimumFractionDigits: 0, 
      maximumFractionDigits: 0 
    }).format(amount);
  };

  const formatDate = (value: string | number | null | undefined) => {
    if (!value) return '-';
    const dateString = typeof value === 'number' ? new Date(value).toISOString() : String(value);
    return new Date(dateString).toLocaleDateString();
  };

  const validateAmount = (value: string) => {
    const numericAmount = parseFloat(value);
    if (value !== '' && (isNaN(numericAmount) || numericAmount < 0)) {
      return { 
        isValid: false, 
        errorMessage: 'Please enter a valid positive number.' 
      };
    }
    return { isValid: true };
  };

  const validateProbability = (value: string) => {
    if (value === '') return { isValid: true }; // Allow clearing
    const numericProbability = parseFloat(value);
    if (isNaN(numericProbability) || numericProbability < 0 || numericProbability > 100) {
      return { 
        isValid: false, 
        errorMessage: 'Please enter a value between 0 and 100.' 
      };
    }
    return { isValid: true };
  };

  const handleAmountSave = async (value: string | number | null) => {
    await onUpdateDeal(deal.id, { amount: value });
  };

  const handleCloseDateSave = async (value: string | number | null) => {
    await onUpdateDeal(deal.id, { expected_close_date: value });
  };

  const handleProbabilitySave = async (value: string | number | null) => {
    let probabilityToSet: number | null = null;
    if (value !== null && value !== '') {
      probabilityToSet = typeof value === 'number' ? value / 100 : parseFloat(String(value)) / 100;
    }
    await onUpdateDeal(deal.id, { deal_specific_probability: probabilityToSet });
  };

  const handleOwnerSave = async (value: string | number | null) => {
    await onUpdateDeal(deal.id, { assigned_to_user_id: value || null });
  };

  const ownerSelectOptions = [
    { value: '', label: 'Unassigned' },
    ...userList.map(user => ({
      value: user.id,
      label: user.display_name || user.email
    }))
  ];

  const currentOwnerDisplay = deal.assignedToUser?.display_name || 
                            deal.assignedToUser?.email || 
                            'Unassigned';

  return (
    <Box 
      bg={isModernTheme ? "gray.700" : "white"}
      p={6} 
      borderRadius="xl"
      border="1px solid"
      borderColor={isModernTheme ? "gray.600" : "gray.200"}
      shadow={isModernTheme ? "none" : "sm"}
    >
      <Heading 
        size="md" 
        mb={5} 
        color={isModernTheme ? "white" : "gray.900"}
      >
        Key Information
      </Heading>
      
      <VStack spacing={4} align="stretch">
        <InlineEditableField
          label="Value"
          value={deal.amount}
          formatDisplay={formatCurrency}
          inputType="number"
          onSave={handleAmountSave}
          validate={validateAmount}
          textColor={isModernTheme ? "green.300" : "green.600"}
        />

        <HStack justifyContent="space-between" alignItems="center">
          <Text fontSize="sm" color="gray.400">Probability</Text>
          <HStack flex={1} justifyContent="flex-end" spacing={2} maxW="60%">
            <Progress 
              value={getEffectiveProbabilityDisplay.value ? getEffectiveProbabilityDisplay.value * 100 : 0} 
              size="xs" 
              colorScheme="blue" 
              flex={1} 
              borderRadius="full" 
              bg={isModernTheme ? "gray.600" : "gray.200"}
            />
            <Text 
              fontSize="sm" 
              fontWeight="medium" 
              color={isModernTheme ? "blue.300" : "blue.600"}
              minW="40px" 
              textAlign="right"
            >
              {getEffectiveProbabilityDisplay.value != null 
                ? `${(getEffectiveProbabilityDisplay.value * 100).toFixed(0)}%` 
                : 'N/A'
              }
            </Text>
          </HStack>
        </HStack>

        <InlineEditableField
          label="Expected Close Date"
          value={deal.expected_close_date}
          formatDisplay={formatDate}
          inputType="date"
          onSave={handleCloseDateSave}
          textColor={isModernTheme ? "gray.200" : "gray.800"}
        />

        <InlineEditableField
          label="Owner"
          value={deal.assigned_to_user_id}
          displayValue={currentOwnerDisplay}
          inputType="select"
          selectOptions={ownerSelectOptions}
          onSave={handleOwnerSave}
          textColor={isModernTheme ? "gray.200" : "gray.800"}
          inputWidth="180px"
        />

        {/* Probability edit field (manual override) */}
        <InlineEditableField
          label="Manual Probability Override"
          value={deal.deal_specific_probability ? deal.deal_specific_probability * 100 : null}
          formatDisplay={(value) => value ? `${value}%` : 'Using step default'}
          inputType="number"
          onSave={handleProbabilitySave}
          validate={validateProbability}
          textColor={isModernTheme ? "blue.300" : "blue.600"}
        />
      </VStack>
    </Box>
  );
}; 