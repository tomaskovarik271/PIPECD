import React, { useState, useRef } from 'react';
import {
  HStack,
  Button,
  useToast,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  useDisclosure,
} from '@chakra-ui/react';
import { FiTrendingUp, FiTrendingDown, FiArrowRight } from 'react-icons/fi';
import { useMutation } from '@apollo/client';
import { useWFMOutcomes } from '../../hooks/useWFMOutcomes';
import { WFM_EXECUTE_OUTCOME } from '../../lib/graphql/wfmOutcomeOperations';
import { ConvertDealModal } from '../conversion/ConvertDealModal';
import { Deal } from '../../generated/graphql/graphql';

interface DealOutcomeButtonsProps {
  deal: Deal;
  onOutcomeComplete?: () => void;
}

export const DealOutcomeButtons: React.FC<DealOutcomeButtonsProps> = ({ deal, onOutcomeComplete }) => {
  const toast = useToast();
  const cancelRef = useRef<HTMLButtonElement>(null);

  // Get available outcomes for the deal's workflow
  // The workflow ID is available via deal.wfmProject.workflow.id
  const workflowId = (deal as any).wfmProject?.workflow?.id;
  const { outcomeTypes, loading } = useWFMOutcomes(workflowId);

  // State for outcome execution
  const [selectedOutcome, setSelectedOutcome] = useState<'WON' | 'LOST' | 'CONVERTED' | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);

  // Modals
  const { isOpen: isAlertOpen, onOpen: onAlertOpen, onClose: onAlertClose } = useDisclosure();
  const { isOpen: isConvertModalOpen, onOpen: onConvertModalOpen, onClose: onConvertModalClose } = useDisclosure();

  // GraphQL mutation for WFM outcome execution
  const [executeWFMOutcome] = useMutation(WFM_EXECUTE_OUTCOME);

  // Don't render if loading, no workflow, or no outcomes available
  if (loading || !workflowId || outcomeTypes.length === 0) {
    return null;
  }

  // Don't render if deal is already in a final step (won, lost, or converted)
  if ((deal as any).currentWfmStep?.isFinalStep) {
    return null;
  }

  const handleOutcomeClick = (outcome: 'WON' | 'LOST' | 'CONVERTED') => {
    setSelectedOutcome(outcome);
    
    if (outcome === 'CONVERTED') {
      // For CONVERTED outcomes, open the comprehensive conversion modal
      onConvertModalOpen();
    } else {
      // For WON/LOST outcomes, show confirmation dialog
      onAlertOpen();
    }
  };

  const executeOutcome = async () => {
    if (!selectedOutcome) return;

    setIsExecuting(true);
    try {
      const result = await executeWFMOutcome({
        variables: {
          input: {
            entityId: deal.id,
            entityType: 'DEAL',
            outcome: selectedOutcome
          }
        }
      });

      if (result.data?.wfmExecuteOutcome?.success) {
        const outcomeData = result.data.wfmExecuteOutcome;
        
        // Check if entity conversion was triggered as a side effect
        const sideEffects = outcomeData.sideEffectsApplied || {};
        const conversionResult = sideEffects.entity_conversion;
        
        if (conversionResult?.success) {
          toast({
            title: `Deal Marked as ${selectedOutcome} and Converted!`,
            description: `Deal "${deal.name}" has been marked as ${selectedOutcome.toLowerCase()} and successfully converted to a lead.`,
            status: 'success',
            duration: 5000,
            isClosable: true,
          });
        } else {
          toast({
            title: `Deal Marked as ${selectedOutcome}`,
            description: `Deal "${deal.name}" has been successfully marked as ${selectedOutcome.toLowerCase()}.`,
            status: 'success',
            duration: 5000,
            isClosable: true,
          });
        }

        onAlertClose();
        if (onOutcomeComplete) {
          onOutcomeComplete();
        }
      } else {
        const errors = result.data?.wfmExecuteOutcome?.errors || ['Unknown error'];
        throw new Error(errors.join(', '));
      }
    } catch (error) {
      console.error('Error executing outcome:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to execute outcome',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsExecuting(false);
    }
  };

  const handleConversionComplete = (result: any) => {
    toast({
      title: 'Conversion Successful!',
      description: `Deal "${deal.name}" has been converted to a lead successfully.`,
      status: 'success',
      duration: 5000,
      isClosable: true,
    });
    
    onConvertModalClose();
    if (onOutcomeComplete) {
      onOutcomeComplete();
    }
  };

  return (
    <>
      <HStack spacing={3}>
        {outcomeTypes.includes('WON') && (
          <Button
            leftIcon={<FiTrendingUp />}
            colorScheme="green"
            size="sm"
            onClick={() => handleOutcomeClick('WON')}
            isDisabled={isExecuting}
          >
            Mark as Won
          </Button>
        )}
        
        {outcomeTypes.includes('LOST') && (
          <Button
            leftIcon={<FiTrendingDown />}
            colorScheme="red"
            variant="outline"
            size="sm"
            onClick={() => handleOutcomeClick('LOST')}
            isDisabled={isExecuting}
          >
            Mark as Lost
          </Button>
        )}
        
        {outcomeTypes.includes('CONVERTED') && (
          <Button
            leftIcon={<FiArrowRight />}
            colorScheme="orange"
            variant="outline"
            size="sm"
            onClick={() => handleOutcomeClick('CONVERTED')}
            isDisabled={isExecuting}
          >
            Convert to Lead
          </Button>
        )}
      </HStack>

      {/* Confirmation Dialog for WON/LOST */}
      <AlertDialog
        isOpen={isAlertOpen && selectedOutcome !== 'CONVERTED'}
        leastDestructiveRef={cancelRef}
        onClose={onAlertClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Mark Deal as {selectedOutcome}
            </AlertDialogHeader>

            <AlertDialogBody>
              Are you sure you want to mark "{deal.name}" as {selectedOutcome?.toLowerCase()}? 
              This action will move the deal to the final stage.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onAlertClose}>
                Cancel
              </Button>
              <Button 
                colorScheme={selectedOutcome === 'WON' ? 'green' : 'red'} 
                onClick={executeOutcome} 
                ml={3}
                isLoading={isExecuting}
              >
                Mark as {selectedOutcome}
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>

      {/* Comprehensive Conversion Modal for CONVERTED outcomes */}
      {isConvertModalOpen && (
        <ConvertDealModal
          isOpen={isConvertModalOpen}
          onClose={onConvertModalClose}
          deal={deal as any}
          onConversionComplete={handleConversionComplete}
        />
      )}
    </>
  );
}; 