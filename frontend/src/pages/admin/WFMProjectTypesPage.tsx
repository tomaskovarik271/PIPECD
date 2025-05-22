import React, { useEffect, useState, useRef } from 'react';
import {
  Box,
  Heading,
  Container,
  Text,
  Button,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  IconButton,
  useToast,
  Spinner,
  Flex,
  Tooltip,
  Badge,
  Icon,
  useDisclosure,
  VStack,
  HStack,
  Tag,
} from '@chakra-ui/react';
import { AddIcon, EditIcon, DeleteIcon, ViewIcon, LinkIcon } from '@chakra-ui/icons';
import { FaProjectDiagram, FaArchive, FaRegFolderOpen } from 'react-icons/fa';
import { useWFMProjectTypeStore, WFMProjectTypeState } from '../../stores/useWFMProjectTypeStore';
import type { WfmProjectType, CreateWfmProjectTypeInput, UpdateWfmProjectTypeInput } from '../../generated/graphql/graphql';
import ConfirmationDialog from '../../components/common/ConfirmationDialog';
import CreateProjectTypeModal from '../../components/admin/wfm/CreateProjectTypeModal';
import EditProjectTypeModal from '../../components/admin/wfm/EditProjectTypeModal';
import { IconType } from 'react-icons';
import * as AllFaIcons from 'react-icons/fa';

const WFMProjectTypesPage: React.FC = () => {
  const projectTypes = useWFMProjectTypeStore((state: WFMProjectTypeState) => state.projectTypes);
  const loading = useWFMProjectTypeStore((state: WFMProjectTypeState) => state.loading);
  const error = useWFMProjectTypeStore((state: WFMProjectTypeState) => state.error);
  const fetchWFMProjectTypes = useWFMProjectTypeStore((state: WFMProjectTypeState) => state.fetchWFMProjectTypes);
  const createWFMProjectType = useWFMProjectTypeStore((state: WFMProjectTypeState) => state.createWFMProjectType);
  const updateWFMProjectType = useWFMProjectTypeStore((state: WFMProjectTypeState) => state.updateWFMProjectType);
  const archiveWFMProjectType = useWFMProjectTypeStore((state: WFMProjectTypeState) => state.archiveWFMProjectType);
  const submitting = useWFMProjectTypeStore((state: WFMProjectTypeState) => state.submitting);

  const toast = useToast();
  const { isOpen: isCreateOpen, onOpen: onCreateOpen, onClose: onCreateClose } = useDisclosure();
  const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure();
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();
  const cancelRef = useRef<HTMLButtonElement>(null);
  const [selectedProjectType, setSelectedProjectType] = useState<WfmProjectType | null>(null);

  useEffect(() => {
    fetchWFMProjectTypes();
  }, [fetchWFMProjectTypes]);

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

  const handleCreate = async (data: CreateWfmProjectTypeInput) => {
    try {
      await createWFMProjectType(data);
      toast({ title: 'Project Type created', status: 'success', duration: 3000, isClosable: true });
      onCreateClose();
      fetchWFMProjectTypes();
    } catch (e: any) {
      // Error already toasted by useEffect or store handling if it sets state.error
      // If store re-throws without setting state.error, this toast would be a fallback.
      // toast({ title: 'Failed to create project type', description: e?.message || 'Unknown error', status: 'error', duration: 5000, isClosable: true });
    }
  };

  const handleEdit = (projectType: WfmProjectType) => {
    setSelectedProjectType(projectType);
    onEditOpen();
  };

  const handleUpdate = async (id: string, data: UpdateWfmProjectTypeInput) => {
    try {
      await updateWFMProjectType(id, data);
      toast({ title: 'Project Type updated', status: 'success', duration: 3000, isClosable: true });
      onEditClose();
      setSelectedProjectType(null);
      fetchWFMProjectTypes();
    } catch (e: any) {
      // Error already toasted by useEffect or store handling
    }
  };

  const handleDeletePrompt = (projectType: WfmProjectType) => {
    setSelectedProjectType(projectType);
    onDeleteOpen();
  };

  const handleArchiveConfirm = async () => {
    if (selectedProjectType) {
      try {
        await archiveWFMProjectType(selectedProjectType.id);
        toast({ title: 'Project Type Archived', description: `"${selectedProjectType.name}" has been archived.`, status: 'success', duration: 3000, isClosable: true });
        onDeleteClose();
        setSelectedProjectType(null);
        fetchWFMProjectTypes();
      } catch (e: any) {
        // Error already toasted by useEffect or store handling
      }
    }
  };

  const getIconComponent = (iconName?: string | null): React.ReactElement => {
    if (!iconName) return <Icon as={FaRegFolderOpen} boxSize={5} color="gray.400" />;
    const IconComponent = (AllFaIcons as Record<string, IconType>)[iconName];
    return IconComponent ? <Icon as={IconComponent} boxSize={5} /> : <Icon as={FaRegFolderOpen} boxSize={5} color="gray.400" />;
  };

  if (loading && projectTypes.length === 0) {
    return <Container centerContent><Spinner size="xl" mt={10} /></Container>;
  }

  return (
    <Box p={5}>
      <VStack spacing={4} align="stretch">
        <Flex justify="space-between" align="center" mb={4}>
          <Heading size="lg">WFM Project Types</Heading>
          <Button leftIcon={<AddIcon />} colorScheme="blue" onClick={onCreateOpen} isLoading={submitting} isDisabled={submitting}>
            New Project Type
          </Button>
        </Flex>

        {projectTypes.length === 0 && !loading ? (
          <Container centerContent p={10} borderWidth="1px" borderRadius="md">
            <Text fontSize="lg">No project types found.</Text>
            <Text>Click "New Project Type" to create one.</Text>
          </Container>
        ) : (
          <Box borderWidth="1px" borderRadius="lg" overflow="hidden">
            <Table variant="simple" size="sm">
              <Thead bg="gray.50" _dark={{ bg: "gray.700" }}>
                <Tr>
                  <Th textAlign="center" w="80px">Icon</Th>
                  <Th>Name</Th>
                  <Th>Description</Th>
                  <Th>Default Workflow</Th>
                  <Th>Status</Th>
                  <Th w="120px">Actions</Th>
                </Tr>
              </Thead>
              <Tbody>
                {projectTypes.map((pt) => (
                  <Tr key={pt.id} _hover={{ bg: "gray.50", _dark: { bg: "gray.800"} }}>
                    <Td textAlign="center">{getIconComponent(pt.iconName)}</Td>
                    <Td fontWeight="medium">{pt.name}</Td>
                    <Td maxW="300px" whiteSpace="normal" wordBreak="break-word">
                      {pt.description || <Text fontStyle="italic" color="gray.400">N/A</Text>}
                    </Td>
                    <Td>{pt.defaultWorkflow ? pt.defaultWorkflow.name : <Tag size="sm" colorScheme="gray">None</Tag>}</Td>
                    <Td>
                      {pt.isArchived ? (
                        <Tag colorScheme="orange" size="sm"><HStack spacing={1}><Icon as={FaArchive} /> <Text>Archived</Text></HStack></Tag>
                      ) : (
                        <Tag colorScheme="green" size="sm">Active</Tag>
                      )}
                    </Td>
                    <Td>
                      <HStack spacing={1}>
                        <Tooltip label="Edit Project Type" hasArrow>
                          <IconButton
                            aria-label="Edit Project Type"
                            icon={<EditIcon />}
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEdit(pt)}
                            isLoading={submitting && selectedProjectType?.id === pt.id}
                            isDisabled={submitting}
                          />
                        </Tooltip>
                        <Tooltip label={pt.isArchived ? "Unarchive (Edit & Save)" : "Archive Project Type"} hasArrow>
                          <IconButton
                            aria-label={pt.isArchived ? "Unarchive Project Type" : "Archive Project Type"}
                            icon={pt.isArchived ? <Icon as={FaRegFolderOpen}/> : <Icon as={FaArchive} />}
                            size="sm"
                            variant="ghost"
                            colorScheme={pt.isArchived ? "teal" : "orange"}
                            onClick={() => {
                              if (pt.isArchived) {
                                handleEdit(pt);
                                toast({ title: 'Unarchiving Project Type', description: 'Please uncheck the "Archived" box and save.', status: 'info', duration: 5000, isClosable: true });
                              } else {
                                handleDeletePrompt(pt);
                              }
                            }}
                            isLoading={submitting && selectedProjectType?.id === pt.id}
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
        <CreateProjectTypeModal
          isOpen={isCreateOpen}
          onClose={onCreateClose}
          onSubmit={handleCreate}
          isSubmitting={submitting}
        />
      )}

      {isEditOpen && selectedProjectType && (
        <EditProjectTypeModal
          isOpen={isEditOpen}
          onClose={() => { onEditClose(); setSelectedProjectType(null); }}
          onSubmit={handleUpdate}
          projectType={selectedProjectType}
          isSubmitting={submitting}
        />
      )}

      {isDeleteOpen && selectedProjectType && (
        <ConfirmationDialog
          isOpen={isDeleteOpen}
          onClose={() => { onDeleteClose(); setSelectedProjectType(null); }}
          onConfirm={handleArchiveConfirm}
          title={`Archive Project Type: ${selectedProjectType.name}`}
          body={`Are you sure you want to archive the project type "${selectedProjectType.name}"? It can be unarchived later by editing it and unchecking the 'Archived' status.`}
          confirmButtonText="Archive"
          confirmButtonColor="orange"
          leastDestructiveRef={cancelRef}
        />
      )}

    </Box>
  );
};

export default WFMProjectTypesPage; 