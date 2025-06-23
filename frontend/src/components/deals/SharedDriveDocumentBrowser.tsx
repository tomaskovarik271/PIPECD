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
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Spinner,
  Center,
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
  FiX,
  FiFileText,
  FiImage,
  FiVideo,
  FiMusic,
  FiArchive,
  FiCode,
} from 'react-icons/fi';
import {
  SiAdobeacrobatreader,
  SiGoogle,
} from 'react-icons/si';
import { useThemeColors } from '../../hooks/useThemeColors';
import { useThemeStore } from '../../stores/useThemeStore';
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
  onDocumentCountChange?: (count: number) => void;
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
  dealName: _dealName = 'Deal',
  onDocumentCountChange
}) => {
  const colors = useThemeColors();
  const currentThemeName = useThemeStore((state) => state.currentTheme);
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
      const response = await gqlClient.request(GET_SHARED_DRIVES) as any;
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
      
      setFiles((filesResponse as any).getSharedDriveFiles);
      setFolders((foldersResponse as any).getSharedDriveFolders);
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
      const response = await gqlClient.request(GET_RECENT_SHARED_DRIVE_FILES, { limit: 20 }) as any;
      setRecentFiles(response.getRecentSharedDriveFiles);
    } catch (error) {
      console.error('Error loading recent files:', error);
    }
  };

  const loadDealAttachments = async () => {
    try {
      const response: any = await gqlClient.request(GET_DEAL_DOCUMENT_ATTACHMENTS, { dealId });
      const attachments = response.getDealDocumentAttachments;
      setAttachments(attachments);
      // Notify parent component of document count
      if (onDocumentCountChange) {
        onDocumentCountChange(attachments.length);
      }
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
      }) as any;
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
          category: attachCategory.toUpperCase(),
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
      
      loadDealAttachments(); // Refresh attachments list (will trigger count update)
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
      
      loadDealAttachments(); // Refresh attachments list (will trigger count update)
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

  const getFileTypeLabel = (mimeType: string): string => {
    // Google Workspace files
    if (mimeType === 'application/vnd.google-apps.document') return 'Google Doc';
    if (mimeType === 'application/vnd.google-apps.spreadsheet') return 'Google Sheet';
    if (mimeType === 'application/vnd.google-apps.presentation') return 'Google Slides';
    
    // Microsoft Office files
    if (mimeType.includes('application/vnd.openxmlformats-officedocument.wordprocessingml') || 
        mimeType.includes('application/msword')) return 'Word';
    if (mimeType.includes('application/vnd.openxmlformats-officedocument.spreadsheetml') || 
        mimeType.includes('application/vnd.ms-excel')) return 'Excel';
    if (mimeType.includes('application/vnd.openxmlformats-officedocument.presentationml') || 
        mimeType.includes('application/vnd.ms-powerpoint')) return 'PowerPoint';
    
    // Common file types
    if (mimeType === 'application/pdf') return 'PDF';
    if (mimeType.startsWith('image/')) return 'Image';
    if (mimeType.startsWith('video/')) return 'Video';
    if (mimeType.startsWith('audio/')) return 'Audio';
    if (mimeType.startsWith('text/')) return 'Text';
    
    // Archive files
    if (mimeType.includes('zip') || mimeType.includes('rar') || mimeType.includes('tar') || 
        mimeType.includes('7z') || mimeType.includes('compressed')) return 'Archive';
    
    // Code files
    if (mimeType.includes('javascript')) return 'JavaScript';
    if (mimeType.includes('json')) return 'JSON';
    if (mimeType.includes('xml')) return 'XML';
    if (mimeType.includes('html')) return 'HTML';
    if (mimeType.includes('css')) return 'CSS';
    
    return 'File';
  };

  const renderFileIcon = (mimeType: string) => {
    const iconSize = 16;
    const iconProps = { size: iconSize };

    // Folder detection
    if (mimeType.includes('folder') || mimeType === 'application/vnd.google-apps.folder') {
      return <FiFolder {...iconProps} color="#4285f4" />; // Google Drive blue for folders
    }

    // Google Workspace files
    if (mimeType === 'application/vnd.google-apps.document') {
      return <SiGoogle {...iconProps} color="#4285f4" />; // Google Docs blue
    }
    if (mimeType === 'application/vnd.google-apps.spreadsheet') {
      return <SiGoogle {...iconProps} color="#34a853" />; // Google Sheets green
    }
    if (mimeType === 'application/vnd.google-apps.presentation') {
      return <SiGoogle {...iconProps} color="#fbbc04" />; // Google Slides yellow
    }

    // Microsoft Office files
    if (mimeType.includes('application/vnd.openxmlformats-officedocument.wordprocessingml') || 
        mimeType.includes('application/msword')) {
      return <FiFileText {...iconProps} color="#2b579a" />; // Word blue
    }
    if (mimeType.includes('application/vnd.openxmlformats-officedocument.spreadsheetml') || 
        mimeType.includes('application/vnd.ms-excel')) {
      return <FiFile {...iconProps} color="#217346" />; // Excel green
    }
    if (mimeType.includes('application/vnd.openxmlformats-officedocument.presentationml') || 
        mimeType.includes('application/vnd.ms-powerpoint')) {
      return <FiFile {...iconProps} color="#d24726" />; // PowerPoint red
    }

    // PDF files
    if (mimeType === 'application/pdf') {
      return <SiAdobeacrobatreader {...iconProps} color="#dc143c" />; // PDF red
    }

    // Text files
    if (mimeType.startsWith('text/') || 
        mimeType === 'application/rtf' ||
        mimeType === 'application/vnd.google-apps.script') {
      return <FiFileText {...iconProps} color="#6b7280" />; // Gray for text files
    }

    // Image files
    if (mimeType.startsWith('image/')) {
      return <FiImage {...iconProps} color="#10b981" />; // Green for images
    }

    // Video files
    if (mimeType.startsWith('video/')) {
      return <FiVideo {...iconProps} color="#8b5cf6" />; // Purple for videos
    }

    // Audio files
    if (mimeType.startsWith('audio/')) {
      return <FiMusic {...iconProps} color="#f59e0b" />; // Orange for audio
    }

    // Archive files
    if (mimeType.includes('zip') || 
        mimeType.includes('rar') || 
        mimeType.includes('tar') || 
        mimeType.includes('7z') ||
        mimeType.includes('compressed')) {
      return <FiArchive {...iconProps} color="#6366f1" />; // Indigo for archives
    }

    // Code files
    if (mimeType.includes('javascript') || 
        mimeType.includes('json') || 
        mimeType.includes('xml') || 
        mimeType.includes('html') ||
        mimeType.includes('css')) {
      return <FiCode {...iconProps} color="#ef4444" />; // Red for code files
    }

    // Default file icon
    return <FiFile {...iconProps} color="#6b7280" />; // Gray for unknown files
  };

  const renderFileList = (fileList: DriveFile[], showAttachButton = true) => (
    <VStack spacing={2} align="stretch">
      {fileList.map((file) => (
        <Box
          key={file.id}
          p={4}
          borderRadius="lg"
          borderWidth="1px"
          borderColor={colors.component.kanban.cardBorder}
          bg={colors.component.kanban.card}
          boxShadow="metallic"
          position="relative"
          _before={{
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            width: '3px',
            height: '100%',
            background: currentThemeName === 'industrialMetal' 
        ? 'linear-gradient(180deg, rgba(255, 170, 0, 0.6) 0%, rgba(255, 170, 0, 0.8) 50%, rgba(255, 170, 0, 0.6) 100%)'
        : 'transparent',
            borderRadius: '0 0 0 lg',
          }}
          _hover={{ 
            bg: colors.component.kanban.cardHover,
            transform: 'translateX(4px) translateY(-1px)',
            boxShadow: 'industrial3d',
            borderColor: colors.component.kanban.cardBorder,
          }}
          transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
        >
          <HStack justify="space-between" align="center">
            <HStack spacing={3} flex={1} minW={0}>
              <Box>
                {renderFileIcon(file.mimeType)}
              </Box>
              <VStack align="start" spacing={0} flex={1} minW={0}>
                <Text fontSize="sm" fontWeight="medium" noOfLines={1}>
                  {file.name}
                </Text>
                <HStack spacing={4} fontSize="xs" color={colors.text.muted}>
                  <Badge size="sm" colorScheme="gray" variant="subtle">
                    {getFileTypeLabel(file.mimeType)}
                  </Badge>
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
        </Box>
      ))}
    </VStack>
  );

  const renderFolderList = (folderList: DriveFolder[]) => (
    <VStack spacing={2} align="stretch">
      {folderList.map((folder) => (
        <Box
          key={folder.id}
          p={4}
          borderRadius="lg"
          borderWidth="1px"
          borderColor={colors.component.kanban.cardBorder}
          bg={colors.component.kanban.card}
          boxShadow="metallic"
          cursor="pointer"
          onClick={() => navigateToFolder(folder)}
          position="relative"
          _before={{
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            width: '3px',
            height: '100%',
            background: 'linear-gradient(180deg, rgba(68, 133, 244, 0.6) 0%, rgba(68, 133, 244, 0.8) 50%, rgba(68, 133, 244, 0.6) 100%)',
            borderRadius: '0 0 0 lg',
          }}
          _hover={{ 
            bg: colors.component.kanban.cardHover,
            transform: 'translateX(4px) translateY(-1px)',
            boxShadow: 'industrial3d',
            borderColor: colors.component.kanban.cardBorder,
          }}
          transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
        >
          <HStack spacing={3}>
            <Box>
              <FiFolder size={16} color="#4285f4" />
            </Box>
            <VStack align="start" spacing={0} flex={1}>
              <Text fontSize="sm" fontWeight="medium" color={colors.text.primary}>
                {folder.name}
              </Text>
              <Text fontSize="xs" color={colors.text.muted}>
                Modified {formatDate(folder.modifiedTime)}
              </Text>
            </VStack>
            <ChevronRightIcon color={colors.text.muted} />
          </HStack>
        </Box>
      ))}
    </VStack>
  );

  const renderAttachments = () => (
    <VStack spacing={2} align="stretch">
      {attachments.map((attachment) => (
        <Box
          key={attachment.id}
          p={4}
          borderRadius="lg"
          borderWidth="1px"
          borderColor={colors.component.kanban.cardBorder}
          bg={colors.component.kanban.card}
          boxShadow="metallic"
          position="relative"
          _before={{
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            width: '3px',
            height: '100%',
            background: 'linear-gradient(180deg, rgba(34, 197, 94, 0.6) 0%, rgba(34, 197, 94, 0.8) 50%, rgba(34, 197, 94, 0.6) 100%)',
            borderRadius: '0 0 0 lg',
          }}
          _hover={{ 
            bg: colors.component.kanban.cardHover,
            transform: 'translateX(4px) translateY(-1px)',
            boxShadow: 'industrial3d',
            borderColor: colors.component.kanban.cardBorder,
          }}
          transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
        >
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
                    <Badge colorScheme={getCategoryColor(attachment.category.toLowerCase())} size="sm">
                      {DOCUMENT_CATEGORIES.find(c => c.value === attachment.category?.toLowerCase())?.label || attachment.category}
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
        </Box>
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
    <Box
      bg={colors.component.kanban.column} 
      borderRadius="xl" 
      borderWidth="1px"
      borderColor={colors.component.kanban.cardBorder}
      boxShadow="steelPlate"
      p={6}
      position="relative"
      _before={{
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '2px',
        background: currentThemeName === 'industrialMetal' 
          ? 'linear-gradient(90deg, transparent 0%, rgba(255, 170, 0, 0.6) 50%, transparent 100%)'
          : 'transparent',
        pointerEvents: 'none',
      }}
    >
      <VStack spacing={4} align="stretch">
        <HStack justify="space-between" align="center">
          <Text fontSize="lg" fontWeight="semibold" color={colors.text.primary}>
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
              bg={colors.component.kanban.card}
              borderColor={colors.component.kanban.cardBorder}
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

      <Tabs 
        index={activeTab} 
        onChange={setActiveTab}
        bg={colors.component.kanban.card}
        borderRadius="lg"
        borderWidth="1px"
        borderColor={colors.component.kanban.cardBorder}
        boxShadow="metallic"
        mt={4}
      >
        <TabList 
          borderBottomColor={colors.component.kanban.cardBorder}
          bg={colors.component.kanban.card}
          borderTopRadius="lg"
          position="relative"
          _after={{
            content: '""',
            position: 'absolute',
            bottom: 0,
            left: '8px',
            right: '8px',
            height: '1px',
            background: currentThemeName === 'industrialMetal' 
              ? 'linear-gradient(90deg, transparent 0%, rgba(255, 170, 0, 0.6) 50%, transparent 100%)'
              : 'transparent',
          }}
        >
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

      {/* Attach Document Modal */}
      <Modal isOpen={isAttachModalOpen} onClose={onAttachModalClose} size="md">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Attach Document</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4} align="stretch">
              {selectedFile && (
                <Box p={3} bg={colors.bg.surface} borderRadius="md">
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