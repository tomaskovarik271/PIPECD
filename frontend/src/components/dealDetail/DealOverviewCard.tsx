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
import { useThemeColors } from '../../hooks/useThemeColors';
import { CurrencyFormatter } from '../../lib/utils/currencyFormatter';

interface DealOverviewCardProps {
  deal: Deal;
  onUpdateDeal: (dealId: string, updates: Record<string, any>) => Promise<void>;
  userList?: Array<{ id: string; display_name?: string; email: string }>;
}

export const DealOverviewCard: React.FC<DealOverviewCardProps> = ({
  deal,
  onUpdateDeal,
  userList = []
}) => {
  const colors = useThemeColors();

  // Deal object inspection (debug info available)

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

  const formatDisplay = (value: string | number | null | undefined) => {
    return CurrencyFormatter.format(Number(value) || 0, 'USD', { precision: 0 });
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
      bg={colors.bg.elevated}
      p={6} 
      borderRadius="xl"
      borderWidth="1px"
      borderColor={colors.border.default}
      boxShadow="sm"
    >
      <Heading 
        size="md" 
        mb={5} 
        color={colors.text.primary}
      >
        Key Information
      </Heading>
      
      <VStack spacing={4} align="stretch">
        <InlineEditableField
          label="Value"
          value={deal.amount}
          formatDisplay={formatDisplay}
          inputType="number"
          onSave={handleAmountSave}
          validate={validateAmount}
          textColor={colors.text.success}
        />

        <HStack justifyContent="space-between" alignItems="center">
          <Text fontSize="sm" color={colors.text.muted}>Probability</Text>
          <HStack flex={1} justifyContent="flex-end" spacing={2} maxW="60%">
            <Progress 
              value={getEffectiveProbabilityDisplay.value ? getEffectiveProbabilityDisplay.value * 100 : 0} 
              size="xs" 
              colorScheme="blue" 
              flex={1} 
              borderRadius="full" 
              bg={colors.bg.input}
            />
            <Text 
              fontSize="sm" 
              fontWeight="medium" 
              color={colors.interactive.default}
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
          textColor={colors.text.secondary}
        />

        <InlineEditableField
          label="Owner"
          value={deal.assigned_to_user_id}
          displayValue={currentOwnerDisplay}
          inputType="select"
          selectOptions={ownerSelectOptions}
          onSave={handleOwnerSave}
          textColor={colors.text.secondary}
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
          textColor={colors.interactive.default}
        />
      </VStack>
    </Box>
  );
}; 