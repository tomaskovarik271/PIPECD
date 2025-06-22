import React, { useState, useEffect, useCallback } from 'react';
import { gqlClient } from '../../lib/graphqlClient';
import {
  GET_DEAL_DOCUMENTS,
  GET_DEAL_FOLDER,
  GET_DRIVE_FILES,
  CREATE_DEAL_FOLDER,
  ATTACH_FILE_TO_DEAL,
  DETACH_FILE_FROM_DEAL,
} from '../../lib/graphql/driveQueries';
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Input,
  InputGroup,
  InputLeftElement,
  Select,
  Badge,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Alert,
  AlertIcon,
  Spinner,
  Center,
  useDisclosure,
  useToast,
  FormControl,
  FormLabel,
  Textarea,
} from '@chakra-ui/react';
import {
  SearchIcon,
  AttachmentIcon,
  DownloadIcon,
  ExternalLinkIcon,
  DeleteIcon,
} from '@chakra-ui/icons';
import { FiFile, FiFolder, FiMoreVertical, FiRefreshCw, FiExternalLink } from 'react-icons/fi';
import { useThemeColors } from '../../hooks/useThemeColors';

// Types
interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  size?: number;
  modifiedTime: string;
  webViewLink: string;
  iconLink?: string;
  parents?: string[];
  thumbnailLink?: string;
}

interface DriveFolder {
  id: string;
  name: string;
  path?: string;
  webViewLink: string;
  parents?: string[];
  createdTime?: string;
  modifiedTime?: string;
}

interface DealDocument {
  id: string;
  fileName: string;
  category: string;
  attachedAt: string;
  attachedBy: string;
  driveFileId: string;
  webViewLink: string;
  fileSize?: number;
  mimeType: string;
}

interface DealDocumentsPanelProps {
  dealId: string;
  dealName?: string;
}

const DOCUMENT_CATEGORIES = [
  { value: 'proposals', label: 'Proposals', color: 'blue' },
  { value: 'contracts', label: 'Contracts', color: 'green' },
  { value: 'legal', label: 'Legal Documents', color: 'purple' },
  { value: 'presentations', label: 'Presentations', color: 'orange' },
  { value: 'correspondence', label: 'Correspondence', color: 'cyan' },
  { value: 'financial', label: 'Financial', color: 'teal' },
  { value: 'technical', label: 'Technical', color: 'red' },
  { value: 'other', label: 'Other', color: 'gray' },
];

const DealDocumentsPanel: React.FC<DealDocumentsPanelProps> = ({ dealId, dealName = 'Deal' }) => {
  const colors = useThemeColors();
  const toast = useToast();
  
  // State
  const [dealFolder, setDealFolder] = useState<DriveFolder | null>(null);
  const [attachedDocuments, setAttachedDocuments] = useState<DealDocument[]>([]);
  const [importFiles, setImportFiles] = useState<DriveFile[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [loading, setLoading] = useState(false);
  const [importLoading, setImportLoading] = useState(false);
  
  // Modals
  const { isOpen: isImportModalOpen, onOpen: onImportModalOpen, onClose: onImportModalClose } = useDisclosure();
  const { isOpen: isCreateFolderModalOpen, onOpen: onCreateFolderModalOpen, onClose: onCreateFolderModalClose } = useDisclosure();
  const { isOpen: isAttachModalOpen, onOpen: onAttachModalOpen, onClose: onAttachModalClose } = useDisclosure();

  // Form state
  const [selectedFileForAttach, setSelectedFileForAttach] = useState<DriveFile | null>(null);
  const [attachCategory, setAttachCategory] = useState('other');
  const [attachNotes, setAttachNotes] = useState('');

  useEffect(() => {
    loadDealFolder();
    loadDealDocuments();
  }, [dealId, loadDealFolder, loadDealDocuments]);

  const loadDealFolder = useCallback(async () => {
    try {
      const response = await gqlClient.request(GET_DEAL_FOLDER, { dealId });
      const folder = response.getDealFolder;
      if (folder) {
        setDealFolder({
          id: folder.id,
          name: folder.name,
          path: folder.webViewLink,
          webViewLink: folder.webViewLink
        });
      }
    } catch (error) {
      console.error('Error loading deal folder:', error);
    }
  }, [dealId]);

  const loadDealDocuments = useCallback(async () => {
    setLoading(true);
    try {
      const response = await gqlClient.request(GET_DEAL_DOCUMENTS, { dealId });
      const documents = response.getDealDocuments.map((doc: any) => ({
        id: doc.id,
        fileName: doc.fileName,
        category: doc.category?.toLowerCase() || 'other',
        attachedAt: doc.attachedAt,
        attachedBy: doc.attachedBy,
        driveFileId: doc.googleFileId,
        webViewLink: doc.fileUrl,
        fileSize: 0,
        mimeType: ''
      }));
      setAttachedDocuments(documents);
    } catch (error) {
      console.error('Error loading deal documents:', error);
    } finally {
      setLoading(false);
    }
  }, [dealId]);

  const loadImportFiles = async () => {
    setImportLoading(true);
    try {
      const response = await gqlClient.request(GET_DRIVE_FILES, { 
        input: { limit: 20 } 
      });
      setImportFiles(response.getDriveFiles.files || []);
    } catch (error) {
      console.error('Error loading import files:', error);
      toast({
        title: 'Error loading Drive files',
        description: 'Failed to load Google Drive files for import.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setImportLoading(false);
    }
  };

  const openImportModal = () => {
    loadImportFiles();
    onImportModalOpen();
  };

  const openAttachModal = (file: DriveFile) => {
    setSelectedFileForAttach(file);
    setAttachCategory('other');
    setAttachNotes('');
    onAttachModalOpen();
  };

  const handleCreateFolder = async () => {
    try {
      await gqlClient.request(CREATE_DEAL_FOLDER, {
        input: {
          dealName: dealName,
          dealId: dealId,
          templateStructure: true
        }
      });
      
      toast({
        title: 'Folder created successfully',
        description: `Deal folder "${dealName}" has been created`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      
      onCreateFolderModalClose();
      loadDealFolder();
    } catch (error) {
      toast({
        title: 'Error creating folder',
        description: 'Failed to create deal folder in Google Drive',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleAttachFile = async () => {
    if (!selectedFileForAttach) return;

    try {
      await gqlClient.request(ATTACH_FILE_TO_DEAL, {
        input: {
          dealId: dealId,
          fileId: selectedFileForAttach.id,
          category: attachCategory.toUpperCase()
        }
      });

      toast({
        title: 'File attached successfully',
        description: `"${selectedFileForAttach.name}" has been attached to the deal`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      onAttachModalClose();
      loadDealDocuments();
    } catch (error) {
      toast({
        title: 'Error attaching file',
        description: 'Failed to attach file to deal',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleRemoveDocument = async (documentId: string) => {
    try {
      await gqlClient.request(DETACH_FILE_FROM_DEAL, { 
        attachmentId: documentId 
      });
      
      toast({
        title: 'Document removed',
        description: 'Document has been removed from the deal',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      
      loadDealDocuments();
    } catch (error) {
      toast({
        title: 'Error removing document',
        description: 'Failed to remove document from deal',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const formatFileSize = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getCategoryBadgeColor = (category: string) => {
    return DOCUMENT_CATEGORIES.find(cat => cat.value === category)?.color || 'gray';
  };

  // Filter documents by search and category
  const filteredDocuments = attachedDocuments.filter(doc => {
    const matchesSearch = !searchQuery || doc.fileName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || doc.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Group documents by category
  const documentsByCategory = DOCUMENT_CATEGORIES.reduce((acc, category) => {
    acc[category.value] = filteredDocuments.filter(doc => doc.category === category.value);
    return acc;
  }, {} as Record<string, DealDocument[]>);

  return (
    <Box p={6}>
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <HStack justify="space-between">
          <VStack spacing={1} align="start">
            <Text fontSize="xl" fontWeight="bold" color={colors.text.primary}>
              Deal Documents
            </Text>
            {dealFolder && (
              <Text fontSize="sm" color={colors.text.secondary}>
                📁 {dealFolder.name}
              </Text>
            )}
          </VStack>
          
          <HStack spacing={2}>
            {!dealFolder && (
              <Button
                leftIcon={<FiFolder />}
                colorScheme="blue"
                variant="outline"
                onClick={onCreateFolderModalOpen}
              >
                Create Deal Folder
              </Button>
            )}
            <Button
              leftIcon={<FiExternalLink />}
              variant="outline"
              onClick={openImportModal}
            >
              Import from Drive
            </Button>
            {dealFolder && (
              <IconButton
                aria-label="Open in Google Drive"
                icon={<ExternalLinkIcon />}
                variant="outline"
                onClick={() => window.open(dealFolder.webViewLink, '_blank')}
              />
            )}
          </HStack>
        </HStack>

        {/* Deal Folder Status */}
        {dealFolder ? (
          <Alert status="success" borderRadius="md">
            <AlertIcon />
            <Box>
              <Text fontWeight="bold">Deal folder ready</Text>
              <Text fontSize="sm">
                Your dedicated Google Drive folder for this deal is set up and ready to use.
              </Text>
            </Box>
          </Alert>
        ) : (
          <Alert status="info" borderRadius="md">
            <AlertIcon />
            <Box>
              <Text fontWeight="bold">No deal folder yet</Text>
              <Text fontSize="sm">
                Create a dedicated Google Drive folder to organize all documents for this deal.
              </Text>
            </Box>
          </Alert>
        )}

        {/* Search & Filter */}
        <HStack spacing={4}>
          <InputGroup size="sm" flex="1">
            <InputLeftElement pointerEvents="none">
              <SearchIcon color="gray.300" />
            </InputLeftElement>
            <Input
              placeholder="Search documents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </InputGroup>
          
          <Select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            size="sm"
            w="200px"
          >
            <option value="all">All Categories</option>
            {DOCUMENT_CATEGORIES.map(cat => (
              <option key={cat.value} value={cat.value}>{cat.label}</option>
            ))}
          </Select>

          <IconButton
            aria-label="Refresh"
            icon={<FiRefreshCw />}
            size="sm"
            variant="ghost"
            onClick={loadDealDocuments}
            isLoading={loading}
          />
        </HStack>

        {/* Documents organized by category */}
        {loading ? (
          <Center py={8}>
            <VStack spacing={4}>
              <Spinner size="xl" color={colors.interactive.default} />
              <Text color={colors.text.secondary}>Loading documents...</Text>
            </VStack>
          </Center>
        ) : filteredDocuments.length > 0 ? (
          <VStack spacing={4} align="stretch">
            {DOCUMENT_CATEGORIES.map(category => {
              const categoryDocs = documentsByCategory[category.value];
              if (categoryDocs.length === 0 && selectedCategory !== 'all' && selectedCategory !== category.value) {
                return null;
              }
              
              return (
                <Box key={category.value}>
                  <HStack p={3} bg={colors.bg.elevated} borderRadius="md" mb={2}>
                    <Badge colorScheme={category.color} mr={2}>
                      {category.label}
                    </Badge>
                    <Text fontSize="sm" color={colors.text.secondary}>
                      ({categoryDocs.length} files)
                    </Text>
                  </HStack>
                  
                  {categoryDocs.length > 0 ? (
                    <VStack spacing={2} align="stretch" pl={4}>
                      {categoryDocs.map(doc => (
                        <HStack
                          key={doc.id}
                          p={3}
                          bg={colors.bg.surface}
                          borderRadius="md"
                          border="1px solid"
                          borderColor={colors.border.default}
                          _hover={{ borderColor: colors.interactive.default }}
                        >
                          <FiFile color={colors.text.muted} />
                          <VStack spacing={0} align="start" flex="1" minW="0">
                            <Text fontSize="sm" fontWeight="medium" color={colors.text.primary} noOfLines={1}>
                              {doc.fileName}
                            </Text>
                            <Text fontSize="xs" color={colors.text.muted}>
                              {formatDate(doc.attachedAt)} • {doc.attachedBy}
                            </Text>
                          </VStack>
                          <Menu>
                            <MenuButton
                              as={IconButton}
                              icon={<FiMoreVertical />}
                              size="xs"
                              variant="ghost"
                            />
                            <MenuList>
                              <MenuItem 
                                icon={<ExternalLinkIcon />} 
                                onClick={() => window.open(doc.webViewLink, '_blank')}
                              >
                                Open in Drive
                              </MenuItem>
                              <MenuItem icon={<DownloadIcon />}>
                                Download
                              </MenuItem>
                              <MenuItem 
                                icon={<DeleteIcon />} 
                                color="red.500"
                                onClick={() => handleRemoveDocument(doc.id)}
                              >
                                Remove from Deal
                              </MenuItem>
                            </MenuList>
                          </Menu>
                        </HStack>
                      ))}
                    </VStack>
                  ) : selectedCategory === category.value && (
                    <Box p={4} textAlign="center" bg={colors.bg.surface} borderRadius="md" ml={4}>
                      <Text fontSize="sm" color={colors.text.muted}>
                        No {category.label.toLowerCase()} documents yet
                      </Text>
                    </Box>
                  )}
                </Box>
              );
            })}
          </VStack>
        ) : (
          <Center py={8}>
            <VStack spacing={4}>
              <AttachmentIcon color={colors.text.muted} boxSize={12} />
              <Text color={colors.text.muted} fontSize="lg" textAlign="center">
                {searchQuery ? 'No documents match your search' : 'No documents attached yet'}
              </Text>
              <Text fontSize="sm" color={colors.text.muted} textAlign="center">
                {searchQuery ? 'Try adjusting your search terms' : 'Use "Import from Drive" to add documents to this deal'}
              </Text>
            </VStack>
          </Center>
        )}
      </VStack>

      {/* Create Folder Modal */}
      <Modal isOpen={isCreateFolderModalOpen} onClose={onCreateFolderModalClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Create Deal Folder</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4} align="stretch">
              <Text fontSize="sm" color={colors.text.secondary}>
                This will create a dedicated Google Drive folder for this deal with organized subfolders for different document types.
              </Text>
              <Text fontSize="sm" fontWeight="bold">
                Folder name: {dealName} - Documents
              </Text>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onCreateFolderModalClose}>
              Cancel
            </Button>
            <Button colorScheme="blue" onClick={handleCreateFolder}>
              Create Folder
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Import from Drive Modal */}
      <Modal isOpen={isImportModalOpen} onClose={onImportModalClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Import from Google Drive</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {importLoading ? (
              <Center py={8}>
                <Spinner />
              </Center>
            ) : (
              <VStack spacing={3} align="stretch" maxH="400px" overflowY="auto">
                {importFiles.map(file => (
                  <HStack
                    key={file.id}
                    p={3}
                    bg={colors.bg.elevated}
                    borderRadius="md"
                    border="1px solid"
                    borderColor={colors.border.default}
                    _hover={{ borderColor: colors.interactive.default }}
                  >
                    <FiFile color={colors.text.muted} />
                    <VStack spacing={0} align="start" flex="1" minW="0">
                      <Text fontSize="sm" fontWeight="medium" color={colors.text.primary} noOfLines={1}>
                        {file.name}
                      </Text>
                      <Text fontSize="xs" color={colors.text.muted}>
                        {file.size ? formatFileSize(file.size) : ''} • {formatDate(file.modifiedTime)}
                      </Text>
                    </VStack>
                    <Button
                      size="sm"
                      colorScheme="blue"
                      onClick={() => openAttachModal(file)}
                    >
                      Import
                    </Button>
                  </HStack>
                ))}
              </VStack>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* Attach File Modal */}
      <Modal isOpen={isAttachModalOpen} onClose={onAttachModalClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Import File to Deal</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selectedFileForAttach && (
              <VStack spacing={4} align="stretch">
                <HStack>
                  <FiFile color={colors.text.muted} />
                  <Text fontSize="sm" fontWeight="medium">
                    {selectedFileForAttach.name}
                  </Text>
                </HStack>
                
                <FormControl>
                  <FormLabel>Category</FormLabel>
                  <Select 
                    value={attachCategory} 
                    onChange={(e) => setAttachCategory(e.target.value)}
                  >
                    {DOCUMENT_CATEGORIES.map(cat => (
                      <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                  </Select>
                </FormControl>

                <FormControl>
                  <FormLabel>Notes (optional)</FormLabel>
                  <Textarea
                    value={attachNotes}
                    onChange={(e) => setAttachNotes(e.target.value)}
                    placeholder="Add any notes about this document..."
                  />
                </FormControl>
              </VStack>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onAttachModalClose}>
              Cancel
            </Button>
            <Button colorScheme="blue" onClick={handleAttachFile}>
              Import to Deal
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default DealDocumentsPanel; 