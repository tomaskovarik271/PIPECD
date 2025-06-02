import React, { useEffect, useState, useRef } from 'react';
import {
  Box,
  Button,
  Heading,
  Spinner,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  IconButton,
  useDisclosure,
  Text,
  VStack,
  HStack,
  Tag,
  useToast,
  Flex,
  Container,
  Tooltip,
  Icon,
  FormControl,
  FormLabel,
  Switch,
} from '@chakra-ui/react';
import { AddIcon, EditIcon, SettingsIcon } from '@chakra-ui/icons';
import { FaArchive, FaRegFolderOpen } from 'react-icons/fa';
import { useWFMWorkflowStore } from '../../stores/useWFMWorkflowStore';
import type { WfmWorkflow, CreateWfmWorkflowInput, UpdateWfmWorkflowInput } from '../../generated/graphql/graphql';
import ConfirmationDialog from '../../components/common/ConfirmationDialog';
import CreateWorkflowModal from '../../components/admin/wfm/CreateWorkflowModal';
import EditWorkflowModal from '../../components/admin/wfm/EditWorkflowModal';
import EditWorkflowStepsModal from '../../components/admin/wfm/EditWorkflowStepsModal';

const WFMWorkflowsPage: React.FC = () => {
  const workflows = useWFMWorkflowStore((state) => state.workflows);
  const loading = useWFMWorkflowStore((state) => state.loading);
  const error = useWFMWorkflowStore((state) => state.error);
  const fetchWFMWorkflows = useWFMWorkflowStore((state) => state.fetchWFMWorkflows);
  const createWFMWorkflow = useWFMWorkflowStore((state) => state.createWFMWorkflow);
  const updateWFMWorkflow = useWFMWorkflowStore((state) => state.updateWFMWorkflow);
  const archiveWFMWorkflow = useWFMWorkflowStore((state) => state.archiveWFMWorkflow);
  const submitting = useWFMWorkflowStore((state) => state.submitting);

  const toast = useToast();
  const { isOpen: isCreateOpen, onOpen: onCreateOpen, onClose: onCreateClose } = useDisclosure();
  const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure();
  const { isOpen: isArchiveOpen, onOpen: onArchiveOpen, onClose: onArchiveClose } = useDisclosure();
  const { isOpen: isStepsEditorOpen, onOpen: onStepsEditorOpen, onClose: onStepsEditorClose } = useDisclosure();

  const [selectedWorkflow, setSelectedWorkflow] = useState<WfmWorkflow | null>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);
  const [showArchived, setShowArchived] = useState(false);

  useEffect(() => {
    fetchWFMWorkflows(showArchived);
  }, [fetchWFMWorkflows, showArchived]);

  useEffect(() => {
    if (error) {
      toast({
        title: 'An error occurred',
        description: error,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  }, [error, toast]);

  const handleCreate = async (data: CreateWfmWorkflowInput) => {
    try {
      await createWFMWorkflow(data);
      toast({ title: 'Workflow created', status: 'success', duration: 3000, isClosable: true });
      onCreateClose();
      fetchWFMWorkflows(showArchived);
    } catch (e: any) {
      // Error is handled by the store (which sets state.error) and then toasted by the useEffect above.
    }
  };

  const handleEdit = (workflow: WfmWorkflow) => {
    setSelectedWorkflow(workflow);
    onEditOpen();
  };

  const handleOpenStepsEditor = (workflow: WfmWorkflow) => {
    setSelectedWorkflow(workflow);
    onStepsEditorOpen();
  };

  const handleUpdate = async (id: string, data: UpdateWfmWorkflowInput) => {
    try {
      await updateWFMWorkflow(id, data);
      toast({ title: 'Workflow updated', status: 'success', duration: 3000, isClosable: true });
      onEditClose();
      setSelectedWorkflow(null);
      fetchWFMWorkflows(showArchived);
    } catch (e: any) {
      // Error handled by store and useEffect
    }
  };

  const handleArchivePrompt = (workflow: WfmWorkflow) => {
    setSelectedWorkflow(workflow);
    onArchiveOpen();
  };

  const handleArchiveConfirm = async () => {
    if (selectedWorkflow) {
      try {
        await archiveWFMWorkflow(selectedWorkflow.id);
        toast({ title: 'Workflow Archived', description: `"${selectedWorkflow.name}" has been archived.`, status: 'success', duration: 3000, isClosable: true });
        onArchiveClose();
        setSelectedWorkflow(null);
        fetchWFMWorkflows(showArchived);
      } catch (e: any) {
        // Error handled by store and useEffect
      }
    }
  };

  if (loading && workflows.length === 0) {
    return <Container centerContent><Spinner size="xl" mt={10} /></Container>;
  }

  return (
    <Box p={5}>
      <VStack spacing={4} align="stretch">
        <Flex justify="space-between" align="center" mb={4}>
          <Heading size="lg">WFM Workflows</Heading>
          <HStack spacing={4}>
            <FormControl display="flex" alignItems="center">
              <FormLabel htmlFor="show-archived-workflows" mb="0" mr={2} whiteSpace="nowrap">
                Show Archived
              </FormLabel>
              <Switch 
                id="show-archived-workflows" 
                isChecked={showArchived} 
                onChange={(e) => setShowArchived(e.target.checked)}
              />
            </FormControl>
            <Button leftIcon={<AddIcon />} colorScheme="blue" onClick={onCreateOpen} isLoading={submitting} isDisabled={submitting}>
              New Workflow
            </Button>
          </HStack>
        </Flex>

        {workflows.length === 0 && !loading ? (
          <Container centerContent p={10} borderWidth="1px" borderRadius="md">
            <Text fontSize="lg">No workflows found.</Text>
            <Text>Click "New Workflow" to create one.</Text>
          </Container>
        ) : (
          <Box borderWidth="1px" borderRadius="lg" overflow="hidden">
            <Table variant="simple" size="sm">
              <Thead bg="gray.50" _dark={{ bg: "gray.700" }}>
                <Tr>
                  <Th>Name</Th>
                  <Th>Description</Th>
                  <Th>Status</Th>
                  <Th w="150px">Actions</Th>
                </Tr>
              </Thead>
              <Tbody>
                {workflows.map((wf) => (
                  <Tr key={wf.id} _hover={{ bg: "gray.50", _dark: { bg: "gray.800" } }}>
                    <Td fontWeight="medium">{wf.name}</Td>
                    <Td maxW="400px" whiteSpace="normal" wordBreak="break-word">
                      {wf.description || <Text fontStyle="italic" color="gray.400">N/A</Text>}
                    </Td>
                    <Td>
                      {wf.isArchived ? (
                        <Tag colorScheme="orange" size="sm"><HStack spacing={1}><Icon as={FaArchive} /> <Text>Archived</Text></HStack></Tag>
                      ) : (
                        <Tag colorScheme="green" size="sm">Active</Tag>
                      )}
                    </Td>
                    <Td>
                      <HStack spacing={1}>
                        <Tooltip label="Edit Workflow Details" hasArrow>
                          <IconButton
                            aria-label="Edit Workflow Details"
                            icon={<EditIcon />}
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEdit(wf)}
                            isDisabled={submitting}
                          />
                        </Tooltip>
                        <Tooltip label="Edit Steps & Transitions" hasArrow>
                          <IconButton
                            aria-label="Edit Steps & Transitions"
                            icon={<SettingsIcon />}
                            size="sm"
                            variant="ghost"
                            onClick={() => handleOpenStepsEditor(wf)}
                            isDisabled={submitting || wf.isArchived}
                          />
                        </Tooltip>
                        <Tooltip label={wf.isArchived ? "Unarchive (Edit & Save)" : "Archive Workflow"} hasArrow>
                          <IconButton
                            aria-label={wf.isArchived ? "Unarchive Workflow" : "Archive Workflow"}
                            icon={wf.isArchived ? <Icon as={FaRegFolderOpen}/> : <Icon as={FaArchive} />}
                            size="sm"
                            variant="ghost"
                            colorScheme={wf.isArchived ? "teal" : "orange"}
                            onClick={() => {
                              if (wf.isArchived) {
                                handleEdit(wf);
                                toast({ title: 'Unarchiving Workflow', description: 'Please uncheck the "Archived" box and save.', status: 'info', duration: 5000, isClosable: true });
                              } else {
                                handleArchivePrompt(wf);
                              }
                            }}
                            isDisabled={submitting}
                          />
                        </Tooltip>
                      </HStack>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Box>
        )}
      </VStack>

      {isCreateOpen && (
        <CreateWorkflowModal
          isOpen={isCreateOpen}
          onClose={onCreateClose}
        />
      )}

      {isEditOpen && selectedWorkflow && (
        <EditWorkflowModal
          isOpen={isEditOpen}
          onClose={() => { onEditClose(); setSelectedWorkflow(null); }}
          workflow={selectedWorkflow}
        />
      )}

      {isStepsEditorOpen && selectedWorkflow && (
        <EditWorkflowStepsModal
          isOpen={isStepsEditorOpen}
          onClose={() => { 
            onStepsEditorClose(); 
            setSelectedWorkflow(null); 
          }}
          workflowId={selectedWorkflow?.id}
        />
      )}

      {isArchiveOpen && selectedWorkflow && (
        <ConfirmationDialog
          isOpen={isArchiveOpen}
          onClose={() => { onArchiveClose(); setSelectedWorkflow(null); }}
          onConfirm={handleArchiveConfirm}
          title={`Archive Workflow: ${selectedWorkflow.name}`}
          body={`Are you sure you want to archive the workflow "${selectedWorkflow.name}"?`}
          confirmButtonText="Archive"
          confirmButtonColor="orange"
          leastDestructiveRef={cancelRef}
        />
      )}

    </Box>
  );
};

export default WFMWorkflowsPage; 