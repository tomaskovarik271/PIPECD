import React, { useState, useEffect } from 'react';
import { gqlClient } from '../../lib/graphqlClient';
import {
  GET_DEAL_DOCUMENTS,
  GET_DEAL_FOLDER,
  GET_DRIVE_FILES,
  GET_DRIVE_FOLDERS,
  CREATE_DEAL_FOLDER,
  ATTACH_FILE_TO_DEAL,
  DETACH_FILE_FROM_DEAL,
} from '../../lib/graphql/driveQueries';
// Future: Deal folder auto-creation queries will go here
// import {
//   GET_DEAL_FOLDER_INFO,
//   GET_DEAL_FOLDER_FILES,
//   DealFolderInfo,
//   DealFolderFile,
// } from '../../lib/graphql/dealFolderQueries';
import {
  Box,
  Grid,
  GridItem,
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
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Image,
  FormControl,
  FormLabel,
  Textarea,
} from '@chakra-ui/react';
import {
  SearchIcon,
  AddIcon,
  AttachmentIcon,
  DownloadIcon,
  ExternalLinkIcon,
  ChevronRightIcon,
  SettingsIcon,
  ViewIcon,
  DeleteIcon,
} from '@chakra-ui/icons';
import { FiFile, FiFolder, FiMoreVertical, FiUpload, FiRefreshCw } from 'react-icons/fi';
import { useThemeColors } from '../../hooks/useThemeColors';

// Types for the Google Drive integration
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
  
  // Traditional Google Drive browser state (for Import from Drive)
  const [currentPath, setCurrentPath] = useState<DriveFolder[]>([]);
  const [currentFiles, setCurrentFiles] = useState<DriveFile[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [loading, setLoading] = useState(false);
  const [browsing, setBrowsing] = useState(false);
  
  // Folder browser state for create modal
  const [parentFolderPath, setParentFolderPath] = useState<DriveFolder[]>([]);
  const [availableFolders, setAvailableFolders] = useState<DriveFolder[]>([]);
  const [loadingFolders, setLoadingFolders] = useState(false);
  const [selectedParentFolderId, setSelectedParentFolderId] = useState<string>('');

  // Modals
  const { isOpen: isCreateFolderOpen, onOpen: onCreateFolderOpen, onClose: onCreateFolderClose } = useDisclosure();
  const { isOpen: isUploadOpen, onOpen: onUploadOpen, onClose: onUploadClose } = useDisclosure();
  const { isOpen: isAttachModalOpen, onOpen: onAttachModalOpen, onClose: onAttachModalClose } = useDisclosure();

  // Form state
  const [newFolderName, setNewFolderName] = useState('');
  const [selectedParentFolder, setSelectedParentFolder] = useState('');
  const [selectedFileForAttach, setSelectedFileForAttach] = useState<DriveFile | null>(null);
  const [attachCategory, setAttachCategory] = useState('other');
  const [attachNotes, setAttachNotes] = useState('');

  useEffect(() => {
    loadDealFolderInfo();
    loadDealDocuments();
  }, [dealId]);

  // Load folders for parent folder selection
  const loadAvailableFolders = async (parentFolderId?: string) => {
    setLoadingFolders(true);
    try {
      const response = await gqlClient.request(GET_DRIVE_FOLDERS, { 
        input: { 
          parentFolderId: parentFolderId,
          includeFiles: false
        } 
      });
      setAvailableFolders(response.getDriveFolders.folders || []);
    } catch (error) {
      console.error('Error loading folders:', error);
      toast({
        title: 'Error loading folders',
        description: 'Failed to load Google Drive folders',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoadingFolders(false);
    }
  };

  const navigateToParentFolder = (folder: DriveFolder) => {
    const newPath = [...parentFolderPath, folder];
    setParentFolderPath(newPath);
    setSelectedParentFolderId(folder.id);
    loadAvailableFolders(folder.id);
  };

  const navigateToParentLevel = (targetIndex: number) => {
    const newPath = parentFolderPath.slice(0, targetIndex + 1);
    setParentFolderPath(newPath);
    const parentId = targetIndex >= 0 ? newPath[targetIndex].id : undefined;
    setSelectedParentFolderId(parentId || '');
    loadAvailableFolders(parentId);
  };

  const openCreateFolderModal = () => {
    // Reset state and load root folders
    setParentFolderPath([]);
    setSelectedParentFolderId('');
    setNewFolderName(`${dealName} - Documents`);
    loadAvailableFolders(); // Load root level folders
    onCreateFolderOpen();
  };

  // Load deal folder info (auto-creates if needed)
  const loadDealFolderInfo = async () => {
    setLoading(true);
    try {
      const response = await gqlClient.request(GET_DEAL_FOLDER_INFO, { dealId });
      setDealFolderInfo(response.dealFolderInfo);
      
      if (response.dealFolderInfo.exists) {
        // Load files from the main deal folder
        loadDealFolderFiles();
        
        toast({
          title: 'Deal folder ready',
          description: `Your deal folder "${response.dealFolderInfo.dealFolder?.name}" is ready!`,
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      } else {
        toast({
          title: 'Setup required',
          description: 'Please configure Google Drive settings in Admin panel to enable auto-folder creation.',
          status: 'warning',
          duration: 5000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error('Error loading deal folder info:', error);
      toast({
        title: 'Error loading deal folder',
        description: 'Failed to load or create deal folder. Please check your Google Drive integration.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  // Load files from deal folder or subfolder
  const loadDealFolderFiles = async (folderId?: string) => {
    try {
      const response = await gqlClient.request(GET_DEAL_FOLDER_FILES, { 
        dealId, 
        folderId: folderId || undefined 
      });
      setDealFolderFiles(response.dealFolderFiles || []);
    } catch (error) {
      console.error('Error loading deal folder files:', error);
      toast({
        title: 'Error loading files',
        description: 'Failed to load files from deal folder.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const loadDealDocuments = async () => {
    setLoading(true);
    try {
      const response = await gqlClient.request(GET_DEAL_DOCUMENTS, { dealId });
      const documents = response.getDealDocuments.map((doc: any) => ({
        id: doc.id,
        fileName: doc.fileName,
        category: doc.category?.toLowerCase() || 'other',
        attachedAt: doc.attachedAt,
        attachedBy: doc.attachedBy,
        driveFileId: doc.fileId,
        webViewLink: doc.fileUrl,
        fileSize: 0, // Not returned by current schema
        mimeType: '' // Not returned by current schema
      }));
      setAttachedDocuments(documents);
    } catch (error) {
      console.error('Error loading deal documents:', error);
      toast({
        title: 'Error loading documents',
        description: 'Failed to load attached documents',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const checkDealFolder = async () => {
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
      console.error('Error checking deal folder:', error);
    }
  };

  const loadMyDriveFiles = async () => {
    setBrowsing(true);
    try {
      console.log('Loading Drive files with input:', { 
        folderId: currentPath.length > 0 ? currentPath[currentPath.length - 1].id : undefined,
        limit: 20 
      });
      const response = await gqlClient.request(GET_DRIVE_FILES, { 
        input: { 
          folderId: currentPath.length > 0 ? currentPath[currentPath.length - 1].id : undefined,
          limit: 20 
        } 
      });
      console.log('Drive files response:', response);
      setCurrentFiles(response.getDriveFiles.files);
    } catch (error) {
      console.error('Error loading Drive files:', error);
      toast({
        title: 'Error browsing Drive',
        description: `Failed to load Google Drive files. ${error instanceof Error ? error.message : 'Unknown error'}`,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setBrowsing(false);
    }
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;

    setFolderCreationLoading(true);
    try {
      await gqlClient.request(CREATE_DEAL_FOLDER, {
        input: {
          dealName: newFolderName || dealName,
          dealId: dealId,
          parentFolderId: selectedParentFolderId || undefined,
          templateStructure: true
        }
      });
      
      const parentLocation = selectedParentFolderId 
        ? `in ${parentFolderPath[parentFolderPath.length - 1]?.name || 'selected folder'}`
        : 'in My Drive';
      
      toast({
        title: 'Folder created successfully',
        description: `Deal folder "${newFolderName}" has been created ${parentLocation}`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      
      // Reset form state
      setNewFolderName('');
      setSelectedParentFolder('');
      setParentFolderPath([]);
      setSelectedParentFolderId('');
      setAvailableFolders([]);
      onCreateFolderClose();
      checkDealFolder();
    } catch (_error) {
      toast({
        title: 'Error creating folder',
        description: 'Failed to create deal folder in Google Drive',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setFolderCreationLoading(false);
      onAttachModalClose();
      loadDealDocuments();
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
        description: `"${selectedFileForAttach.name}" has been attached to this deal`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      
      setSelectedFileForAttach(null);
      setAttachCategory('other');
      setAttachNotes('');
      onAttachModalClose();
      loadDealDocuments();
    } catch (_error) {
      toast({
        title: 'Error attaching file',
        description: 'Failed to attach file to deal',
        status: 'error',
        duration: 5000,
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
        description: 'Document has been removed from this deal',
        status: 'info',
        duration: 3000,
        isClosable: true,
      });
      
      loadDealDocuments();
    } catch (_error) {
      toast({
        title: 'Error removing document',
        description: 'Failed to remove document from deal',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const openAttachModal = (file: DriveFile) => {
    setSelectedFileForAttach(file);
    onAttachModalOpen();
  };

  const filteredDocuments = attachedDocuments.filter(doc => {
    const matchesSearch = doc.fileName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || doc.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const formatFileSize = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.includes('folder')) return FiFolder;
    return FiFile;
  };

  const getCategoryBadgeColor = (category: string) => {
    const cat = DOCUMENT_CATEGORIES.find(c => c.value === category);
    return cat?.color || 'gray';
  };

  return (
    <Grid templateColumns="1fr 2fr" gap={6} h="600px">
      {/* Left Panel - Navigation & Attached Documents */}
      <GridItem>
        <VStack spacing={4} align="stretch" h="full">
          {/* Deal Folder Status */}
          <Box p={4} bg={colors.bg.surface} borderRadius="lg" border="1px solid" borderColor={colors.border.default}>
            <VStack spacing={3} align="stretch">
              <HStack justify="space-between">
                <Text fontWeight="semibold" color={colors.text.primary}>Deal Folder</Text>
                {!dealFolder && (
                  <Button size="sm" colorScheme="blue" onClick={openCreateFolderModal} leftIcon={<AddIcon />}>
                    Create
                  </Button>
                )}
              </HStack>
              
              {dealFolder ? (
                <VStack spacing={2} align="stretch">
                  <HStack>
                    <FiFolder color={colors.text.muted} />
                    <Text fontSize="sm" color={colors.text.primary} fontWeight="medium">
                      {dealFolder.name}
                    </Text>
                  </HStack>
                  <Text fontSize="xs" color={colors.text.muted}>
                    {dealFolder.path}
                  </Text>
                  <HStack spacing={2}>
                    <Button 
                      size="xs" 
                      variant="outline" 
                      leftIcon={<ViewIcon />}
                      onClick={() => window.open(dealFolder.webViewLink, '_blank')}
                    >
                      Open in Drive
                    </Button>
                    <Button size="xs" variant="outline" leftIcon={<FiUpload />} onClick={onUploadOpen}>
                      Upload
                    </Button>
                  </HStack>
                </VStack>
              ) : (
                <Alert status="info" borderRadius="md">
                  <AlertIcon />
                  <Box>
                    <Text fontSize="sm">No deal folder created yet</Text>
                    <Text fontSize="xs" color={colors.text.muted}>
                      Create a dedicated folder to organize all deal documents
                    </Text>
                  </Box>
                </Alert>
              )}
            </VStack>
          </Box>

          {/* Search & Filter */}
          <VStack spacing={3} align="stretch">
            <InputGroup size="sm">
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
            >
              <option value="all">All Categories</option>
              {DOCUMENT_CATEGORIES.map(cat => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </Select>
          </VStack>

          {/* Attached Documents */}
          <Box flex="1" overflowY="auto">
            <HStack justify="space-between" mb={3}>
              <Text fontWeight="semibold" color={colors.text.primary}>
                Attached Documents ({filteredDocuments.length})
              </Text>
              <IconButton
                aria-label="Refresh"
                icon={<FiRefreshCw />}
                size="sm"
                variant="ghost"
                onClick={loadDealDocuments}
                isLoading={loading}
              />
            </HStack>
            
            {loading ? (
              <Center py={8}>
                <Spinner />
              </Center>
            ) : filteredDocuments.length > 0 ? (
              <VStack spacing={2} align="stretch">
                {filteredDocuments.map(doc => (
                  <Box
                    key={doc.id}
                    p={3}
                    bg={colors.bg.elevated}
                    borderRadius="md"
                    border="1px solid"
                    borderColor={colors.border.default}
                    _hover={{ borderColor: colors.interactive.default }}
                  >
                    <VStack spacing={2} align="stretch">
                      <HStack justify="space-between">
                        <HStack spacing={2} flex="1" minW="0">
                          <FiFile color={colors.text.muted} />
                          <VStack spacing={0} align="start" flex="1" minW="0">
                            <Text
                              fontSize="sm"
                              fontWeight="medium"
                              color={colors.text.primary}
                              noOfLines={1}
                            >
                              {doc.fileName}
                            </Text>
                            {doc.fileSize && (
                              <Text fontSize="xs" color={colors.text.muted}>
                                {formatFileSize(doc.fileSize)}
                              </Text>
                            )}
                          </VStack>
                        </HStack>
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
                      
                      <HStack justify="space-between">
                        <Badge size="sm" colorScheme={getCategoryBadgeColor(doc.category)}>
                          {DOCUMENT_CATEGORIES.find(cat => cat.value === doc.category)?.label || doc.category}
                        </Badge>
                        <Text fontSize="xs" color={colors.text.muted}>
                          {formatDate(doc.attachedAt)}
                        </Text>
                      </HStack>
                    </VStack>
                  </Box>
                ))}
              </VStack>
            ) : (
              <Center py={8}>
                <VStack spacing={2}>
                  <AttachmentIcon color={colors.text.muted} boxSize={8} />
                  <Text color={colors.text.muted} fontSize="sm" textAlign="center">
                    {searchQuery ? 'No documents match your search' : 'No documents attached yet'}
                  </Text>
                  {!searchQuery && (
                    <Text fontSize="xs" color={colors.text.muted} textAlign="center">
                      Browse Google Drive files on the right to attach documents
                    </Text>
                  )}
                </VStack>
              </Center>
            )}
          </Box>
        </VStack>
      </GridItem>

      {/* Right Panel - Google Drive Browser */}
      <GridItem>
        <VStack spacing={4} align="stretch" h="full">
          {/* Header */}
          <HStack justify="space-between">
            <Text fontWeight="semibold" color={colors.text.primary}>Browse Google Drive</Text>
            <Button 
              size="sm" 
              variant="outline" 
              leftIcon={<FiRefreshCw />}
              onClick={loadMyDriveFiles}
              isLoading={browsing}
            >
              Refresh
            </Button>
          </HStack>

          {/* Breadcrumbs */}
          <Breadcrumb spacing="8px" separator={<ChevronRightIcon color="gray.500" />}>
            <BreadcrumbItem>
              <BreadcrumbLink onClick={() => { setCurrentPath([]); loadMyDriveFiles(); }}>
                My Drive
              </BreadcrumbLink>
            </BreadcrumbItem>
            {currentPath.map((folder, index) => (
              <BreadcrumbItem key={folder.id}>
                <BreadcrumbLink onClick={() => {
                  setCurrentPath(currentPath.slice(0, index + 1));
                  loadMyDriveFiles();
                }}>
                  {folder.name}
                </BreadcrumbLink>
              </BreadcrumbItem>
            ))}
          </Breadcrumb>

          {/* File Browser */}
          <Box
            flex="1"
            overflowY="auto"
            border="1px solid"
            borderColor={colors.border.default}
            borderRadius="lg"
            p={4}
          >
            {browsing ? (
              <Center py={12}>
                <VStack spacing={3}>
                  <Spinner size="lg" />
                  <Text color={colors.text.muted}>Loading files...</Text>
                </VStack>
              </Center>
            ) : currentFiles.length > 0 ? (
              <VStack spacing={2} align="stretch">
                {currentFiles.map(file => {
                  const Icon = getFileIcon(file.mimeType);
                  const isFolder = file.mimeType.includes('folder');
                  
                  return (
                    <HStack
                      key={file.id}
                      p={3}
                      bg={colors.bg.surface}
                      borderRadius="md"
                      _hover={{ bg: colors.bg.elevated }}
                      justify="space-between"
                      cursor={isFolder ? 'pointer' : 'default'}
                      onClick={isFolder ? () => {
                        setCurrentPath([...currentPath, { 
                          id: file.id, 
                          name: file.name, 
                          path: `${currentPath.map(p => p.name).join('/')}/${file.name}`,
                          webViewLink: file.webViewLink 
                        }]);
                        loadMyDriveFiles();
                      } : undefined}
                    >
                      <HStack spacing={3} flex="1" minW="0">
                        {file.iconLink ? (
                          <Image src={file.iconLink} boxSize="20px" />
                        ) : (
                          <Icon color={colors.text.muted} />
                        )}
                        <VStack spacing={0} align="start" flex="1" minW="0">
                          <Text fontSize="sm" fontWeight="medium" noOfLines={1}>
                            {file.name}
                          </Text>
                          <HStack spacing={2}>
                            {file.size && (
                              <Text fontSize="xs" color={colors.text.muted}>
                                {formatFileSize(file.size)}
                              </Text>
                            )}
                            <Text fontSize="xs" color={colors.text.muted}>
                              {formatDate(file.modifiedTime)}
                            </Text>
                          </HStack>
                        </VStack>
                      </HStack>
                      
                      {!isFolder && (
                        <Menu>
                          <MenuButton
                            as={IconButton}
                            icon={<FiMoreVertical />}
                            size="sm"
                            variant="ghost"
                          />
                          <MenuList>
                            <MenuItem 
                              icon={<AttachmentIcon />}
                              onClick={() => openAttachModal(file)}
                            >
                              Attach to Deal
                            </MenuItem>
                            <MenuItem 
                              icon={<ExternalLinkIcon />} 
                              onClick={() => window.open(file.webViewLink, '_blank')}
                            >
                              Open in Drive
                            </MenuItem>
                          </MenuList>
                        </Menu>
                      )}
                    </HStack>
                  );
                })}
              </VStack>
            ) : (
              <Center py={12}>
                <VStack spacing={3}>
                  <FiFolder size={48} color={colors.text.muted} />
                  <Text color={colors.text.muted}>No files found</Text>
                  <Text fontSize="sm" color={colors.text.muted} textAlign="center">
                    This folder is empty or you don't have permission to view its contents
                  </Text>
                </VStack>
              </Center>
            )}
          </Box>
        </VStack>
      </GridItem>

      {/* Create Folder Modal */}
      <Modal isOpen={isCreateFolderOpen} onClose={onCreateFolderClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Create Deal Folder</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4} align="stretch">
              <FormControl>
                <FormLabel>Folder Name</FormLabel>
                <Input
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  placeholder={`${dealName} - Documents`}
                />
              </FormControl>
              
              <FormControl>
                <FormLabel>Parent Folder (Optional)</FormLabel>
                
                {/* Breadcrumb navigation */}
                {parentFolderPath.length > 0 && (
                  <Breadcrumb spacing="8px" separator={<ChevronRightIcon color="gray.500" />} mb={2}>
                    <BreadcrumbItem>
                      <BreadcrumbLink onClick={() => navigateToParentLevel(-1)} color="blue.500">
                        My Drive
                      </BreadcrumbLink>
                    </BreadcrumbItem>
                    {parentFolderPath.map((folder, index) => (
                      <BreadcrumbItem key={folder.id} isCurrentPage={index === parentFolderPath.length - 1}>
                        <BreadcrumbLink 
                          onClick={() => navigateToParentLevel(index)}
                          color={index === parentFolderPath.length - 1 ? "gray.500" : "blue.500"}
                        >
                          {folder.name}
                        </BreadcrumbLink>
                      </BreadcrumbItem>
                    ))}
                  </Breadcrumb>
                )}
                
                {/* Folder browser */}
                <Box 
                  border="1px solid" 
                  borderColor={colors.border.default} 
                  borderRadius="md" 
                  maxH="200px" 
                  overflowY="auto"
                  bg={colors.bg.surface}
                >
                  {loadingFolders ? (
                    <Center p={4}>
                      <Spinner size="sm" />
                    </Center>
                  ) : availableFolders.length > 0 ? (
                    <VStack spacing={0} align="stretch">
                      {availableFolders.map((folder) => (
                        <HStack
                          key={folder.id}
                          p={2}
                          spacing={3}
                          _hover={{ bg: colors.bg.hover }}
                          cursor="pointer"
                          onClick={() => navigateToParentFolder(folder)}
                        >
                          <FiFolder color={colors.text.muted} />
                          <Text fontSize="sm" flex={1}>{folder.name}</Text>
                          <ChevronRightIcon color={colors.text.muted} />
                        </HStack>
                      ))}
                    </VStack>
                  ) : (
                    <Center p={4}>
                      <Text fontSize="sm" color={colors.text.muted}>
                        {parentFolderPath.length === 0 ? "Loading folders..." : "No subfolders found"}
                      </Text>
                    </Center>
                  )}
                </Box>
                
                {selectedParentFolderId && (
                  <HStack mt={2} p={2} bg={colors.bg.surface} borderRadius="md" border="1px solid" borderColor="blue.200">
                    <FiFolder color="blue" />
                    <Text fontSize="sm" fontWeight="medium">
                      Selected: {parentFolderPath.length > 0 ? parentFolderPath[parentFolderPath.length - 1].name : 'My Drive'}
                    </Text>
                  </HStack>
                )}
                
                <Text fontSize="xs" color={colors.text.muted} mt={1}>
                  Browse and select a folder location for your deal folder
                </Text>
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onCreateFolderClose}>
              Cancel
            </Button>
            <Button
              colorScheme="blue"
              onClick={handleCreateFolder}
              isLoading={folderCreationLoading}
              isDisabled={!newFolderName.trim()}
            >
              Create Folder
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Attach File Modal */}
      <Modal isOpen={isAttachModalOpen} onClose={onAttachModalClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Attach File to Deal</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selectedFileForAttach && (
              <VStack spacing={4} align="stretch">
                <Box p={3} bg={colors.bg.surface} borderRadius="md">
                  <HStack spacing={3}>
                    {selectedFileForAttach.iconLink ? (
                      <Image src={selectedFileForAttach.iconLink} boxSize="24px" />
                    ) : (
                      <FiFile color={colors.text.muted} />
                    )}
                    <VStack spacing={0} align="start">
                      <Text fontWeight="medium">{selectedFileForAttach.name}</Text>
                      {selectedFileForAttach.size && (
                        <Text fontSize="sm" color={colors.text.muted}>
                          {formatFileSize(selectedFileForAttach.size)}
                        </Text>
                      )}
                    </VStack>
                  </HStack>
                </Box>

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
                  <FormLabel>Notes (Optional)</FormLabel>
                  <Textarea
                    value={attachNotes}
                    onChange={(e) => setAttachNotes(e.target.value)}
                    placeholder="Add any notes about this document..."
                    rows={3}
                  />
                </FormControl>
              </VStack>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onAttachModalClose}>
              Cancel
            </Button>
            <Button
              colorScheme="blue"
              onClick={handleAttachFile}
              leftIcon={<AttachmentIcon />}
            >
              Attach to Deal
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Upload Modal */}
      <Modal isOpen={isUploadOpen} onClose={onUploadClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Upload to Deal Folder</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4} align="stretch">
              <Alert status="info">
                <AlertIcon />
                <Box>
                  <Text fontSize="sm">
                    Upload functionality will open Google Drive in a new tab
                  </Text>
                  <Text fontSize="xs" color={colors.text.muted}>
                    Files uploaded to the deal folder will appear here automatically
                  </Text>
                </Box>
              </Alert>
              
              {dealFolder && (
                <Button
                  colorScheme="blue"
                  leftIcon={<FiUpload />}
                  onClick={() => window.open(dealFolder.webViewLink, '_blank')}
                >
                  Open Deal Folder in Google Drive
                </Button>
              )}
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button onClick={onUploadClose}>Close</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Grid>
  );
};

export default DealDocumentsPanel;
