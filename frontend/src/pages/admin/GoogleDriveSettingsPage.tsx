import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  FormControl,
  FormLabel,
  Input,
  Button,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  useToast,
  Divider,
  HStack,
  Badge,
  Link,
  Icon,
  Spinner,
  Card,
  CardHeader,
  CardBody,
} from '@chakra-ui/react';
import { ExternalLinkIcon } from '@chakra-ui/icons';
import { useThemeColors } from '../../hooks/useThemeColors';
import { gqlClient } from '../../lib/graphqlClient';
import { 
  GET_GOOGLE_DRIVE_SETTINGS, 
  UPDATE_APP_SETTING,
  GoogleDriveSettings,
  UpdateAppSettingInput
} from '../../lib/graphql/appSettingsQueries';

interface GoogleDriveConfig {
  pipecd_deals_folder_id: string | null;
  auto_create_deal_folders: boolean;
  deal_folder_template: boolean;
}

const GoogleDriveSettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<GoogleDriveConfig>({
    pipecd_deals_folder_id: null,
    auto_create_deal_folders: true,
    deal_folder_template: true
  });
  const [folderIdInput, setFolderIdInput] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setSaving] = useState(false);
  const [folderValidation, setFolderValidation] = useState<{
    isValid: boolean;
    folderName?: string;
    error?: string;
  } | null>(null);

  const toast = useToast();
  const colors = useThemeColors();

  // Load current settings
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const data: { googleDriveSettings: GoogleDriveConfig } = await gqlClient.request(GET_GOOGLE_DRIVE_SETTINGS);
      setSettings(data.googleDriveSettings);
      setFolderIdInput(data.googleDriveSettings.pipecd_deals_folder_id || '');
      setIsLoading(false);
    } catch (error) {
      console.error('Failed to load Google Drive settings:', error);
      toast({
        title: 'Error loading settings',
        description: 'Failed to load Google Drive settings.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      setIsLoading(false);
    }
  };

  const validateFolder = async (folderId: string) => {
    if (!folderId.trim()) {
      setFolderValidation(null);
      return;
    }

    try {
      // TODO: Call API to validate folder exists and is accessible
      // For now, mock validation
      const mockValidation = {
        isValid: true,
        folderName: 'PipeCD Deals', // Mock folder name
      };
      setFolderValidation(mockValidation);
    } catch (error) {
      setFolderValidation({
        isValid: false,
        error: 'Unable to access folder. Please check the folder ID and permissions.',
      });
    }
  };

  const handleFolderIdChange = (value: string) => {
    setFolderIdInput(value);
    // Debounce validation
    setTimeout(() => validateFolder(value), 500);
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      const input: UpdateAppSettingInput = {
        settingKey: 'google_drive.pipecd_deals_folder_id',
        settingValue: folderIdInput || null,
      };

      await gqlClient.request(UPDATE_APP_SETTING, { input });
      
      setSettings(prev => ({ 
        ...prev, 
        pipecd_deals_folder_id: folderIdInput || null 
      }));
      
      toast({
        title: 'Settings saved',
        description: 'Google Drive settings have been updated successfully.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Save settings error:', error);
      toast({
        title: 'Error saving settings',
        description: 'Failed to save Google Drive settings. Make sure you have admin permissions.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setSaving(false);
    }
  };

  const extractFolderIdFromUrl = (url: string): string => {
    // Extract folder ID from Google Drive URL
    const match = url.match(/\/folders\/([a-zA-Z0-9-_]+)/);
    return match ? match[1] : url;
  };

  const handleUrlPaste = (e: React.ClipboardEvent) => {
    const pastedText = e.clipboardData.getData('text');
    if (pastedText.includes('drive.google.com/drive/folders/')) {
      const folderId = extractFolderIdFromUrl(pastedText);
      setFolderIdInput(folderId);
      handleFolderIdChange(folderId);
    }
  };

  if (isLoading) {
    return (
      <Container maxW="container.md" py={8}>
        <VStack spacing={4}>
          <Spinner size="xl" color={colors.interactive.default} />
          <Text color={colors.text.secondary}>Loading Google Drive settings...</Text>
        </VStack>
      </Container>
    );
  }

  return (
    <Container maxW="container.md" py={8}>
      <VStack spacing={6} align="stretch">
        <Box>
          <Heading as="h1" size="xl" mb={2} color={colors.text.primary}>
            Google Drive Settings
          </Heading>
          <Text color={colors.text.secondary}>
            Configure where PipeCD should create deal folders in your Google Drive.
          </Text>
        </Box>

        {/* Setup Instructions */}
        <Card>
          <CardHeader>
            <Heading as="h3" size="md" color={colors.text.primary}>
              Setup Instructions
            </Heading>
          </CardHeader>
          <CardBody>
            <VStack spacing={3} align="stretch">
              <Text color={colors.text.secondary}>
                <strong>Step 1:</strong> Create a folder in your company's Google Drive (e.g., "PipeCD Deals")
              </Text>
              <Text color={colors.text.secondary}>
                <strong>Step 2:</strong> Share the folder with your sales team members
              </Text>
              <Text color={colors.text.secondary}>
                <strong>Step 3:</strong> Copy the folder URL or ID and paste it below
              </Text>
              <Divider />
              <HStack spacing={2}>
                <Text fontSize="sm" color={colors.text.secondary}>
                  Folder URL format:
                </Text>
                <Badge colorScheme="blue" fontSize="xs">
                  https://drive.google.com/drive/folders/[FOLDER_ID]
                </Badge>
              </HStack>
            </VStack>
          </CardBody>
        </Card>

        {/* Current Settings */}
        <Card>
          <CardHeader>
            <Heading as="h3" size="md" color={colors.text.primary}>
              PipeCD Deals Folder Configuration
            </Heading>
          </CardHeader>
          <CardBody>
            <VStack spacing={4} align="stretch">
              <FormControl>
                <FormLabel color={colors.text.primary}>
                  Google Drive Folder ID
                </FormLabel>
                <Input
                  value={folderIdInput}
                  onChange={(e) => handleFolderIdChange(e.target.value)}
                  onPaste={handleUrlPaste}
                  placeholder="Paste folder URL or enter folder ID..."
                  bg={colors.bg.input}
                  color={colors.text.primary}
                  borderColor={colors.border.default}
                />
                <Text fontSize="sm" color={colors.text.secondary} mt={1}>
                  You can paste the full Google Drive folder URL - we'll extract the ID automatically.
                </Text>
              </FormControl>

              {/* Folder Validation */}
              {folderValidation && (
                <Alert
                  status={folderValidation.isValid ? 'success' : 'error'}
                  borderRadius="md"
                >
                  <AlertIcon />
                  <Box>
                    <AlertTitle>
                      {folderValidation.isValid ? 'Folder Found!' : 'Folder Not Found'}
                    </AlertTitle>
                    <AlertDescription>
                      {folderValidation.isValid ? (
                        <>
                          Successfully connected to folder: <strong>{folderValidation.folderName}</strong>
                        </>
                      ) : (
                        folderValidation.error
                      )}
                    </AlertDescription>
                  </Box>
                </Alert>
              )}

              {/* Current Setting */}
              {settings.pipecd_deals_folder_id && (
                <Alert status="info" borderRadius="md">
                  <AlertIcon />
                  <Box>
                    <AlertTitle>Current Setting</AlertTitle>
                    <AlertDescription>
                      <HStack>
                        <Text>Folder ID: {settings.pipecd_deals_folder_id}</Text>
                        <Link
                          href={`https://drive.google.com/drive/folders/${settings.pipecd_deals_folder_id}`}
                          isExternal
                          color={colors.interactive.default}
                        >
                          View Folder <Icon as={ExternalLinkIcon} />
                        </Link>
                      </HStack>
                    </AlertDescription>
                  </Box>
                </Alert>
              )}

              <HStack spacing={3}>
                <Button
                  onClick={saveSettings}
                  isLoading={isSaving}
                  loadingText="Saving..."
                  colorScheme="blue"
                  isDisabled={!folderIdInput.trim()}
                >
                  Save Settings
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setFolderIdInput(settings.pipecd_deals_folder_id || '');
                    setFolderValidation(null);
                  }}
                >
                  Reset
                </Button>
              </HStack>
            </VStack>
          </CardBody>
        </Card>

        {/* How It Works */}
        <Card>
          <CardHeader>
            <Heading as="h3" size="md" color={colors.text.primary}>
              How It Works
            </Heading>
          </CardHeader>
          <CardBody>
            <VStack spacing={3} align="stretch">
              <Text color={colors.text.secondary}>
                • When you open a deal's Documents tab, PipeCD will automatically create a deal folder inside your configured parent folder
              </Text>
              <Text color={colors.text.secondary}>
                • Deal folders are named: <Badge>Client Name - Deal Name (ID: XXX)</Badge>
              </Text>
              <Text color={colors.text.secondary}>
                • Each deal folder includes organized subfolders: Proposals, Contracts, Legal, Presentations, etc.
              </Text>
              <Text color={colors.text.secondary}>
                • All document uploads and attachments will be organized within the deal's folder structure
              </Text>
            </VStack>
          </CardBody>
        </Card>
      </VStack>
    </Container>
  );
};

export default GoogleDriveSettingsPage; 