import React, { useState, useEffect } from 'react';
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
  Card,
  CardHeader,
  CardBody,
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
  Flex,
  Grid,
  GridItem,
  useDisclosure,
  useToast,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
} from '@chakra-ui/react';
import {
  SearchIcon,
  ExternalLinkIcon,
  AttachmentIcon,
  ChevronRightIcon,
} from '@chakra-ui/icons';
import {
  FiFile,
  FiFolder,
  FiHardDrive,
  FiClock,
  FiSearch,
  FiPlus,
  FiX,
} from 'react-icons/fi';
import { useThemeColors } from '../../hooks/useThemeColors';
import { gqlClient } from '../../lib/graphqlClient';
import {
  GET_SHARED_DRIVES,
  GET_SHARED_DRIVE_FILES,
  GET_SHARED_DRIVE_FOLDERS,
  SEARCH_SHARED_DRIVE_FILES,
  GET_RECENT_SHARED_DRIVE_FILES,
  GET_DEAL_DOCUMENT_ATTACHMENTS,
  ATTACH_DOCUMENT_TO_DEAL,
  REMOVE_DOCUMENT_ATTACHMENT,
  UPDATE_DOCUMENT_ATTACHMENT_CATEGORY,
} from '../../lib/graphql/sharedDriveQueries';

// Types based on our GraphQL schema
interface SharedDrive {
  id: string;
  name: string;
  createdTime: string;
  capabilities?: {
    canAddChildren?: boolean;
    canListChildren?: boolean;
    canDownload?: boolean;
  };
}

interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  size?: number;
  modifiedTime: string;
  createdTime: string;
  webViewLink?: string;
  webContentLink?: string;
  owners?: Array<{
    displayName: string;
    emailAddress: string;
  }>;
  parents?: string[];
  thumbnailLink?: string;
  iconLink?: string;
}

interface DriveFolder {
  id: string;
  name: string;
  parents?: string[];
  webViewLink: string;
  createdTime: string;
  modifiedTime: string;
}

interface DealDocumentAttachment {
  id: string;
  dealId: string;
  googleFileId: string;
  fileName: string;
  fileUrl: string;
  sharedDriveId?: string;
  category?: string;
  attachedAt: string;
  attachedBy: string;
  mimeType?: string;
  fileSize?: number;
}

interface SharedDriveDocumentBrowserProps {
  dealId: string;
  dealName?: string;
}

const DOCUMENT_CATEGORIES = [
  { value: 'proposal', label: 'Proposal', color: 'blue' },
  { value: 'contract', label: 'Contract', color: 'green' },
  { value: 'presentation', label: 'Presentation', color: 'orange' },
  { value: 'client_request', label: 'Client Request', color: 'red' },
  { value: 'client_document', label: 'Client Document', color: 'purple' },
  { value: 'correspondence', label: 'Correspondence', color: 'cyan' },
  { value: 'other', label: 'Other', color: 'gray' },
];

export const SharedDriveDocumentBrowser: React.FC<SharedDriveDocumentBrowserProps> = ({
  dealId,
  dealName = 'Deal'
}) => {
  const colors = useThemeColors();
  const toast = useToast();
  
  // State
  const [sharedDrives, setSharedDrives] = useState<SharedDrive[]>([]);
  const [selectedDrive, setSelectedDrive] = useState<SharedDrive | null>(null);
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [folderPath, setFolderPath] = useState<{ id: string; name: string }[]>([]);
  const [files, setFiles] = useState<DriveFile[]>([]);
  const [folders, setFolders] = useState<DriveFolder[]>([]);
  const [searchResults, setSearchResults] = useState<DriveFile[]>([]);
  const [recentFiles, setRecentFiles] = useState<DriveFile[]>([]);
  const [attachments, setAttachments] = useState<DealDocumentAttachment[]>([]);
  
  // UI State
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState(0); // 0: Browse, 1: Search, 2: Recent, 3: Attachments
  const [selectedFile, setSelectedFile] = useState<DriveFile | null>(null);
  const [attachCategory, setAttachCategory] = useState('other');
  
  // Modals
  const { isOpen: isAttachModalOpen, onOpen: onAttachModalOpen, onClose: onAttachModalClose } = useDisclosure();

  useEffect(() => {
    loadSharedDrives();
    loadDealAttachments();
    loadRecentFiles();
  }, [dealId]);

  useEffect(() => {
    if (selectedDrive) {
      loadDriveContents();
    }
  }, [selectedDrive, currentFolderId]);

  const loadSharedDrives = async () => {
    try {
      const response = await gqlClient.request(GET_SHARED_DRIVES);
      setSharedDrives(response.getSharedDrives);
      
      // Auto-select first drive if available
      if (response.getSharedDrives.length > 0 && !selectedDrive) {
        setSelectedDrive(response.getSharedDrives[0]);
      }
    } catch (error) {
      console.error('Error loading shared drives:', error);
      toast({
        title: 'Error loading shared drives',
        description: 'Failed to load your shared drives. Please check your Google Drive access.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const loadDriveContents = async () => {
    if (!selectedDrive) return;
    
    setLoading(true);
    try {
      const [filesResponse, foldersResponse] = await Promise.all([
        gqlClient.request(GET_SHARED_DRIVE_FILES, {
          sharedDriveId: selectedDrive.id,
          folderId: currentFolderId,
        }),
        gqlClient.request(GET_SHARED_DRIVE_FOLDERS, {
          sharedDriveId: selectedDrive.id,
          parentFolderId: currentFolderId,
        }),
      ]);
      
      setFiles(filesResponse.getSharedDriveFiles);
      setFolders(foldersResponse.getSharedDriveFolders);
    } catch (error) {
      console.error('Error loading drive contents:', error);
      toast({
        title: 'Error loading folder contents',
        description: 'Failed to load files and folders.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const loadRecentFiles = async () => {
    try {
      const response = await gqlClient.request(GET_RECENT_SHARED_DRIVE_FILES, { limit: 20 });
      setRecentFiles(response.getRecentSharedDriveFiles);
    } catch (error) {
      console.error('Error loading recent files:', error);
    }
  };

  const loadDealAttachments = async () => {
    try {
      const response = await gqlClient.request(GET_DEAL_DOCUMENT_ATTACHMENTS, { dealId });
      setAttachments(response.getDealDocumentAttachments);
    } catch (error) {
      console.error('Error loading deal attachments:', error);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setLoading(true);
    try {
      const response = await gqlClient.request(SEARCH_SHARED_DRIVE_FILES, {
        query: searchQuery,
        sharedDriveId: selectedDrive?.id,
      });
      setSearchResults(response.searchSharedDriveFiles);
      setActiveTab(1); // Switch to search tab
    } catch (error) {
      console.error('Error searching files:', error);
      toast({
        title: 'Search failed',
        description: 'Failed to search for files.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const navigateToFolder = (folder: DriveFolder) => {
    setCurrentFolderId(folder.id);
    setFolderPath([...folderPath, { id: folder.id, name: folder.name }]);
  };

  const navigateToPath = (index: number) => {
    if (index === -1) {
      // Navigate to root
      setCurrentFolderId(null);
      setFolderPath([]);
    } else {
      // Navigate to specific path level
      const newPath = folderPath.slice(0, index + 1);
      setCurrentFolderId(newPath[newPath.length - 1]?.id || null);
      setFolderPath(newPath);
    }
  };

  const openAttachModal = (file: DriveFile) => {
    setSelectedFile(file);
    setAttachCategory('other');
    onAttachModalOpen();
  };

  const handleAttachFile = async () => {
    if (!selectedFile) return;
    
    try {
      await gqlClient.request(ATTACH_DOCUMENT_TO_DEAL, {
        input: {
          dealId,
          googleFileId: selectedFile.id,
          fileName: selectedFile.name,
          fileUrl: selectedFile.webViewLink || '',
          sharedDriveId: selectedDrive?.id,
          category: attachCategory,
          mimeType: selectedFile.mimeType,
          fileSize: selectedFile.size,
        },
      });
      
      toast({
        title: 'Document attached',
        description: `${selectedFile.name} has been attached to the deal.`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      
      loadDealAttachments(); // Refresh attachments list
      onAttachModalClose();
    } catch (error: any) {
      console.error('Error attaching document:', error);
      
      const errorMessage = error?.response?.errors?.[0]?.message || 'Failed to attach document';
      toast({
        title: 'Attachment failed',
        description: errorMessage,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleRemoveAttachment = async (attachmentId: string) => {
    try {
      await gqlClient.request(REMOVE_DOCUMENT_ATTACHMENT, { attachmentId });
      
      toast({
        title: 'Document removed',
        description: 'Document attachment has been removed from the deal.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      
      loadDealAttachments(); // Refresh attachments list
    } catch (error) {
      console.error('Error removing document attachment:', error);
      toast({
        title: 'Removal failed',
        description: 'Failed to remove document attachment.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'Unknown size';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${Math.round(bytes / Math.pow(1024, i) * 100) / 100} ${sizes[i]}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getCategoryColor = (category?: string) => {
    const cat = DOCUMENT_CATEGORIES.find(c => c.value === category);
    return cat?.color || 'gray';
  };

  const renderFileIcon = (mimeType: string) => {
    if (mimeType.includes('folder')) return <FiFolder />;
    return <FiFile />;
  };

  const renderFileList = (fileList: DriveFile[], showAttachButton = true) => (
    <VStack spacing={2} align="stretch">
      {fileList.map((file) => (
        <Card key={file.id} size="sm">
          <CardBody>
            <HStack justify="space-between" align="center">
              <HStack spacing={3} flex={1} minW={0}>
                <Box color={colors.text.muted}>
                  {renderFileIcon(file.mimeType)}
                </Box>
                <VStack align="start" spacing={0} flex={1} minW={0}>
                  <Text fontSize="sm" fontWeight="medium" noOfLines={1}>
                    {file.name}
                  </Text>
                  <HStack spacing={4} fontSize="xs" color={colors.text.muted}>
                    <Text>{formatFileSize(file.size)}</Text>
                    <Text>{formatDate(file.modifiedTime)}</Text>
                    {file.owners?.[0] && (
                      <Text noOfLines={1}>{file.owners[0].displayName}</Text>
                    )}
                  </HStack>
                </VStack>
              </HStack>
              <HStack spacing={2}>
                {file.webViewLink && (
                  <IconButton
                    aria-label="Open in Google Drive"
                    icon={<ExternalLinkIcon />}
                    size="sm"
                    variant="ghost"
                    onClick={() => window.open(file.webViewLink, '_blank')}
                  />
                )}
                {showAttachButton && (
                  <Button
                    size="sm"
                    leftIcon={<AttachmentIcon />}
                    colorScheme="blue"
                    variant="outline"
                    onClick={() => openAttachModal(file)}
                  >
                    Attach
                  </Button>
                )}
              </HStack>
            </HStack>
          </CardBody>
        </Card>
      ))}
    </VStack>
  );

  const renderFolderList = (folderList: DriveFolder[]) => (
    <VStack spacing={2} align="stretch">
      {folderList.map((folder) => (
        <Card key={folder.id} size="sm" cursor="pointer" onClick={() => navigateToFolder(folder)}>
          <CardBody>
            <HStack spacing={3}>
              <Box color={colors.text.muted}>
                <FiFolder />
              </Box>
              <VStack align="start" spacing={0} flex={1}>
                <Text fontSize="sm" fontWeight="medium">
                  {folder.name}
                </Text>
                <Text fontSize="xs" color={colors.text.muted}>
                  Modified {formatDate(folder.modifiedTime)}
                </Text>
              </VStack>
              <ChevronRightIcon color={colors.text.muted} />
            </HStack>
          </CardBody>
        </Card>
      ))}
    </VStack>
  );

  const renderAttachments = () => (
    <VStack spacing={2} align="stretch">
      {attachments.map((attachment) => (
        <Card key={attachment.id} size="sm">
          <CardBody>
            <HStack justify="space-between" align="center">
              <HStack spacing={3} flex={1} minW={0}>
                <Box color={colors.text.muted}>
                  {renderFileIcon(attachment.mimeType || '')}
                </Box>
                <VStack align="start" spacing={0} flex={1} minW={0}>
                  <Text fontSize="sm" fontWeight="medium" noOfLines={1}>
                    {attachment.fileName}
                  </Text>
                  <HStack spacing={4} fontSize="xs" color={colors.text.muted}>
                    {attachment.category && (
                      <Badge colorScheme={getCategoryColor(attachment.category)} size="sm">
                        {DOCUMENT_CATEGORIES.find(c => c.value === attachment.category)?.label || attachment.category}
                      </Badge>
                    )}
                    <Text>{formatDate(attachment.attachedAt)}</Text>
                    {attachment.fileSize && (
                      <Text>{formatFileSize(attachment.fileSize)}</Text>
                    )}
                  </HStack>
                </VStack>
              </HStack>
              <HStack spacing={2}>
                {attachment.fileUrl && (
                  <IconButton
                    aria-label="Open in Google Drive"
                    icon={<ExternalLinkIcon />}
                    size="sm"
                    variant="ghost"
                    onClick={() => window.open(attachment.fileUrl, '_blank')}
                  />
                )}
                <IconButton
                  aria-label="Remove attachment"
                  icon={<FiX />}
                  size="sm"
                  variant="ghost"
                  colorScheme="red"
                  onClick={() => handleRemoveAttachment(attachment.id)}
                />
              </HStack>
            </HStack>
          </CardBody>
        </Card>
      ))}
      {attachments.length === 0 && (
        <Center py={8}>
          <VStack spacing={3}>
            <Box color={colors.text.muted} fontSize="2xl">
              <AttachmentIcon />
            </Box>
            <Text color={colors.text.muted} textAlign="center">
              No documents attached to this deal yet.
              <br />
              Browse shared drives to attach documents.
            </Text>
          </VStack>
        </Center>
      )}
    </VStack>
  );

  return (
    <Box>
      <Card>
        <CardHeader>
          <VStack spacing={4} align="stretch">
            <HStack justify="space-between" align="center">
              <Text fontSize="lg" fontWeight="semibold">
                Document Browser
              </Text>
              <HStack spacing={2}>
                <Select
                  size="sm"
                  placeholder="Select shared drive"
                  value={selectedDrive?.id || ''}
                  onChange={(e) => {
                    const drive = sharedDrives.find(d => d.id === e.target.value);
                    setSelectedDrive(drive || null);
                    setCurrentFolderId(null);
                    setFolderPath([]);
                  }}
                  minW="200px"
                >
                  {sharedDrives.map((drive) => (
                    <option key={drive.id} value={drive.id}>
                      {drive.name}
                    </option>
                  ))}
                </Select>
              </HStack>
            </HStack>

            {/* Search Bar */}
            <InputGroup>
              <InputLeftElement pointerEvents="none">
                <SearchIcon color={colors.text.muted} />
              </InputLeftElement>
              <Input
                placeholder="Search documents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
              <Button
                ml={2}
                leftIcon={<FiSearch />}
                onClick={handleSearch}
                disabled={!searchQuery.trim()}
                size="md"
              >
                Search
              </Button>
            </InputGroup>
          </VStack>
        </CardHeader>

        <CardBody>
          <Tabs index={activeTab} onChange={setActiveTab}>
            <TabList>
              <Tab>
                <HStack spacing={2}>
                  <FiHardDrive />
                  <Text>Browse</Text>
                </HStack>
              </Tab>
              <Tab>
                <HStack spacing={2}>
                  <FiSearch />
                  <Text>Search Results</Text>
                  {searchResults.length > 0 && (
                    <Badge colorScheme="blue" size="sm">
                      {searchResults.length}
                    </Badge>
                  )}
                </HStack>
              </Tab>
              <Tab>
                <HStack spacing={2}>
                  <FiClock />
                  <Text>Recent</Text>
                </HStack>
              </Tab>
              <Tab>
                <HStack spacing={2}>
                  <AttachmentIcon />
                  <Text>Attached</Text>
                  {attachments.length > 0 && (
                    <Badge colorScheme="green" size="sm">
                      {attachments.length}
                    </Badge>
                  )}
                </HStack>
              </Tab>
            </TabList>

            <TabPanels>
              {/* Browse Tab */}
              <TabPanel px={0}>
                {selectedDrive ? (
                  <VStack spacing={4} align="stretch">
                    {/* Breadcrumb */}
                    <Breadcrumb separator={<ChevronRightIcon />} fontSize="sm">
                      <BreadcrumbItem>
                        <BreadcrumbLink onClick={() => navigateToPath(-1)}>
                          {selectedDrive.name}
                        </BreadcrumbLink>
                      </BreadcrumbItem>
                      {folderPath.map((folder, index) => (
                        <BreadcrumbItem key={folder.id}>
                          <BreadcrumbLink onClick={() => navigateToPath(index)}>
                            {folder.name}
                          </BreadcrumbLink>
                        </BreadcrumbItem>
                      ))}
                    </Breadcrumb>

                    {loading ? (
                      <Center py={8}>
                        <Spinner />
                      </Center>
                    ) : (
                      <VStack spacing={4} align="stretch">
                        {folders.length > 0 && (
                          <Box>
                            <Text fontSize="sm" fontWeight="medium" mb={2} color={colors.text.muted}>
                              Folders
                            </Text>
                            {renderFolderList(folders)}
                          </Box>
                        )}
                        
                        {files.length > 0 && (
                          <Box>
                            <Text fontSize="sm" fontWeight="medium" mb={2} color={colors.text.muted}>
                              Files
                            </Text>
                            {renderFileList(files)}
                          </Box>
                        )}
                        
                        {folders.length === 0 && files.length === 0 && (
                          <Center py={8}>
                            <Text color={colors.text.muted}>
                              This folder is empty.
                            </Text>
                          </Center>
                        )}
                      </VStack>
                    )}
                  </VStack>
                ) : (
                  <Center py={8}>
                    <VStack spacing={3}>
                      <Box color={colors.text.muted} fontSize="2xl">
                        <FiHardDrive />
                      </Box>
                      <Text color={colors.text.muted} textAlign="center">
                        Select a shared drive to browse documents.
                      </Text>
                    </VStack>
                  </Center>
                )}
              </TabPanel>

              {/* Search Results Tab */}
              <TabPanel px={0}>
                {searchResults.length > 0 ? (
                  renderFileList(searchResults)
                ) : (
                  <Center py={8}>
                    <VStack spacing={3}>
                      <Box color={colors.text.muted} fontSize="2xl">
                        <FiSearch />
                      </Box>
                      <Text color={colors.text.muted} textAlign="center">
                        {searchQuery ? 'No files found matching your search.' : 'Enter a search term to find documents.'}
                      </Text>
                    </VStack>
                  </Center>
                )}
              </TabPanel>

              {/* Recent Files Tab */}
              <TabPanel px={0}>
                {recentFiles.length > 0 ? (
                  renderFileList(recentFiles)
                ) : (
                  <Center py={8}>
                    <VStack spacing={3}>
                      <Box color={colors.text.muted} fontSize="2xl">
                        <FiClock />
                      </Box>
                      <Text color={colors.text.muted} textAlign="center">
                        No recent files found.
                      </Text>
                    </VStack>
                  </Center>
                )}
              </TabPanel>

              {/* Attachments Tab */}
              <TabPanel px={0}>
                {renderAttachments()}
              </TabPanel>
            </TabPanels>
          </Tabs>
        </CardBody>
      </Card>

      {/* Attach Document Modal */}
      <Modal isOpen={isAttachModalOpen} onClose={onAttachModalClose} size="md">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Attach Document</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4} align="stretch">
              {selectedFile && (
                <Box p={3} bg={colors.bg.muted} borderRadius="md">
                  <HStack spacing={3}>
                    <Box color={colors.text.muted}>
                      {renderFileIcon(selectedFile.mimeType)}
                    </Box>
                    <VStack align="start" spacing={0} flex={1}>
                      <Text fontWeight="medium" fontSize="sm">
                        {selectedFile.name}
                      </Text>
                      <Text fontSize="xs" color={colors.text.muted}>
                        {formatFileSize(selectedFile.size)} • {formatDate(selectedFile.modifiedTime)}
                      </Text>
                    </VStack>
                  </HStack>
                </Box>
              )}

              <Box>
                <Text fontSize="sm" fontWeight="medium" mb={2}>
                  Document Category
                </Text>
                <Select
                  value={attachCategory}
                  onChange={(e) => setAttachCategory(e.target.value)}
                >
                  {DOCUMENT_CATEGORIES.map((category) => (
                    <option key={category.value} value={category.value}>
                      {category.label}
                    </option>
                  ))}
                </Select>
              </Box>
            </VStack>
          </ModalBody>

          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onAttachModalClose}>
              Cancel
            </Button>
            <Button colorScheme="blue" onClick={handleAttachFile}>
              Attach Document
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}; 