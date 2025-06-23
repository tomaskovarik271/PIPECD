import React, { useState, useEffect } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Button,
  VStack,
  HStack,
  Text,
  Box,
  Select,
  useToast,
  Alert,
  AlertIcon,
  Input,
  InputGroup,
  InputLeftElement,
  Card,
  CardBody,
  Spinner,
  Center,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Badge,
  IconButton,
} from '@chakra-ui/react';
import { 
  FiFile, 
  FiPaperclip, 
  FiFolder, 
  FiHardDrive, 
  FiSearch, 
  FiClock 
} from 'react-icons/fi';
import { 
  SearchIcon, 
  ExternalLinkIcon, 
  ChevronRightIcon 
} from '@chakra-ui/icons';
import { useThemeColors } from '../../hooks/useThemeColors';
import { gqlClient } from '../../lib/graphqlClient';
import { 
  ATTACH_DOCUMENT_TO_NOTE_AND_DEAL,
  GET_SHARED_DRIVES,
  GET_SHARED_DRIVE_FILES,
  GET_SHARED_DRIVE_FOLDERS,
  SEARCH_SHARED_DRIVE_FILES,
  GET_RECENT_SHARED_DRIVE_FILES,
} from '../../lib/graphql/sharedDriveQueries';

interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  size?: number;
  modifiedTime: string;
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

interface DriveFolder {
  id: string;
  name: string;
  parents?: string[];
  webViewLink: string;
  createdTime: string;
  modifiedTime: string;
}

interface DocumentAttachmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  noteId: string;
  dealId: string;
  onAttachmentAdded?: () => void;
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

export const DocumentAttachmentModal: React.FC<DocumentAttachmentModalProps> = ({
  isOpen,
  onClose,
  noteId,
  dealId,
  onAttachmentAdded,
}) => {
  const [selectedFile, setSelectedFile] = useState<DriveFile | null>(null);
  const [attachCategory, setAttachCategory] = useState('other');
  const [isAttaching, setIsAttaching] = useState(false);
  const [selectedDriveId, setSelectedDriveId] = useState<string>('');
  
  const colors = useThemeColors();
  const toast = useToast();

  const handleFileSelect = (file: DriveFile, driveId: string) => {
    setSelectedFile(file);
    setSelectedDriveId(driveId);
  };

  const handleAttachFile = async () => {
    if (!selectedFile) return;
    
    setIsAttaching(true);
    try {
      await gqlClient.request(ATTACH_DOCUMENT_TO_NOTE_AND_DEAL, {
        input: {
          noteId,
          dealId,
          googleFileId: selectedFile.id,
          fileName: selectedFile.name,
          fileUrl: selectedFile.webViewLink || '',
          sharedDriveId: selectedDriveId,
          category: attachCategory.toUpperCase(),
          mimeType: selectedFile.mimeType,
          fileSize: selectedFile.size,
        },
      });
      
      toast({
        title: 'Document attached',
        description: `${selectedFile.name} has been attached to the note and deal.`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      
      if (onAttachmentAdded) {
        onAttachmentAdded();
      }
      
      handleClose();
    } catch (error: unknown) {
      console.error('Error attaching document:', error);
      
      const errorMessage = error instanceof Error && 'response' in error 
        ? (error as any)?.response?.errors?.[0]?.message || 'Failed to attach document'
        : 'Failed to attach document';
      toast({
        title: 'Attachment failed',
        description: errorMessage,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsAttaching(false);
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    setAttachCategory('other');
    setSelectedDriveId('');
    onClose();
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

  const renderFileIcon = (mimeType: string) => {
    if (mimeType.includes('folder')) return <FiFolder />;
    if (mimeType.includes('document')) return <FiFile />;
    if (mimeType.includes('spreadsheet')) return <FiFile />;
    if (mimeType.includes('presentation')) return <FiFile />;
    if (mimeType.includes('pdf')) return <FiFile />;
    return <FiFile />;
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="6xl">
      <ModalOverlay />
      <ModalContent maxH="90vh">
        <ModalHeader>
          <HStack spacing={2}>
            <FiPaperclip />
            <Text>Attach Document to Note</Text>
          </HStack>
        </ModalHeader>
        <ModalCloseButton />
        
        <ModalBody pb={6} overflowY="auto">
          <VStack spacing={6} align="stretch">
            {/* Info Alert */}
            <Alert status="info" borderRadius="md">
              <AlertIcon />
              <Text fontSize="sm">
                Documents attached to notes are automatically attached to the deal as well, 
                creating a unified document management system.
              </Text>
            </Alert>

            {/* Selected File Preview */}
            {selectedFile && (
              <Box
                p={4}
                bg={colors.bg.elevated}
                borderRadius="md"
                border="2px solid"
                borderColor={colors.interactive.default}
              >
                <Text fontSize="sm" fontWeight="medium" mb={3} color={colors.text.primary}>
                  Selected File:
                </Text>
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

                <Box mt={4}>
                  <Text fontSize="sm" fontWeight="medium" mb={2}>
                    Document Category
                  </Text>
                  <Select
                    value={attachCategory}
                    onChange={(e) => setAttachCategory(e.target.value)}
                    size="sm"
                  >
                    {DOCUMENT_CATEGORIES.map((category) => (
                      <option key={category.value} value={category.value}>
                        {category.label}
                      </option>
                    ))}
                  </Select>
                </Box>
              </Box>
            )}

            {/* Document Browser - Full Google Drive Integration */}
            <Box>
              <Text fontSize="md" fontWeight="semibold" mb={4}>
                Browse Google Drive Documents
              </Text>
              <DocumentBrowserForSelection onFileSelect={handleFileSelect} />
            </Box>
          </VStack>
        </ModalBody>

        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={handleClose}>
            Cancel
          </Button>
          <Button
            colorScheme="blue"
            onClick={handleAttachFile}
            isDisabled={!selectedFile}
            isLoading={isAttaching}
            loadingText="Attaching..."
          >
            Attach Document
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

// Full Google Drive browser for file selection
interface DocumentBrowserForSelectionProps {
  onFileSelect: (file: DriveFile, driveId: string) => void;
}

const DocumentBrowserForSelection: React.FC<DocumentBrowserForSelectionProps> = ({
  onFileSelect,
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
  
  // UI State
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState(0); // 0: Browse, 1: Search, 2: Recent

  useEffect(() => {
    loadSharedDrives();
    loadRecentFiles();
  }, []);

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

  const renderFileIcon = (mimeType: string) => {
    if (mimeType.includes('folder')) return <FiFolder />;
    if (mimeType.includes('document')) return <FiFile />;
    if (mimeType.includes('spreadsheet')) return <FiFile />;
    if (mimeType.includes('presentation')) return <FiFile />;
    if (mimeType.includes('pdf')) return <FiFile />;
    return <FiFile />;
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

  const renderFileList = (fileList: DriveFile[]) => (
    <VStack spacing={2} align="stretch">
      {fileList.map((file) => (
        <Card 
          key={file.id} 
          size="sm" 
          cursor="pointer"
          _hover={{ 
            borderColor: colors.interactive.default,
            boxShadow: 'md',
            transform: 'translateY(-1px)',
          }}
          transition="all 0.2s ease"
          onClick={() => onFileSelect(file, selectedDrive?.id || '')}
        >
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
                    onClick={(e) => {
                      e.stopPropagation();
                      window.open(file.webViewLink, '_blank');
                    }}
                  />
                )}
                <Button
                  size="sm"
                  colorScheme="blue"
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    onFileSelect(file, selectedDrive?.id || '');
                  }}
                >
                  Select
                </Button>
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

  return (
    <Card>
      <CardBody>
        <VStack spacing={4} align="stretch">
          {/* Drive Selection and Search */}
          <VStack spacing={3} align="stretch">
            <HStack justify="space-between" align="center">
              <Text fontSize="md" fontWeight="medium">
                Google Drive Browser
              </Text>
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
                size="sm"
              />
              <Button
                ml={2}
                leftIcon={<FiSearch />}
                onClick={handleSearch}
                disabled={!searchQuery.trim()}
                size="sm"
              >
                Search
              </Button>
            </InputGroup>
          </VStack>

          {/* Tabs */}
          <Tabs index={activeTab} onChange={setActiveTab} size="sm">
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
                  <VStack spacing={4} align="stretch">
                    <Text fontSize="sm" color={colors.text.muted}>
                      Found {searchResults.length} results for "{searchQuery}"
                    </Text>
                    {renderFileList(searchResults)}
                  </VStack>
                ) : (
                  <Center py={8}>
                    <VStack spacing={3}>
                      <Box color={colors.text.muted} fontSize="2xl">
                        <FiSearch />
                      </Box>
                      <Text color={colors.text.muted} textAlign="center">
                        {searchQuery ? 'No files found for your search.' : 'Enter a search term to find documents.'}
                      </Text>
                    </VStack>
                  </Center>
                )}
              </TabPanel>

              {/* Recent Files Tab */}
              <TabPanel px={0}>
                {recentFiles.length > 0 ? (
                  <VStack spacing={4} align="stretch">
                    <Text fontSize="sm" color={colors.text.muted}>
                      Recently modified files
                    </Text>
                    {renderFileList(recentFiles)}
                  </VStack>
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
            </TabPanels>
          </Tabs>
        </VStack>
      </CardBody>
    </Card>
  );
}; 