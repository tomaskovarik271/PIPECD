import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Switch,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  FormControl,
  FormLabel,
  FormHelperText,
  Card,
  CardHeader,
  CardBody,
  Heading,
  Divider,
  useToast,
  Button,
  Select,
  Spinner,
  Alert,
  AlertIcon,
} from '@chakra-ui/react';
import { useThemeColors } from '../../hooks/useThemeColors';
import { gql } from 'graphql-request';
import { gqlClient } from '../../lib/graphqlClient';
import { isGraphQLErrorWithMessage } from '../../lib/graphqlUtils';

// GraphQL response types
interface UserReminderPreferences {
  id: string;
  userId: string;
  emailRemindersEnabled: boolean;
  emailReminderMinutesBefore: number;
  emailDailyDigestEnabled: boolean;
  emailDailyDigestTime: string;
  inAppRemindersEnabled: boolean;
  inAppReminderMinutesBefore: number;
  pushRemindersEnabled: boolean;
  pushReminderMinutesBefore: number;
  overdueNotificationsEnabled: boolean;
  overdueNotificationFrequencyHours: number;
  createdAt: string;
  updatedAt: string;
}

interface GetReminderPreferencesResponse {
  myReminderPreferences: UserReminderPreferences | null;
}

interface UpdateReminderPreferencesResponse {
  updateMyReminderPreferences: UserReminderPreferences;
}

// GraphQL queries and mutations
const GET_REMINDER_PREFERENCES = gql`
  query GetMyReminderPreferences {
    myReminderPreferences {
      id
      userId
      emailRemindersEnabled
      emailReminderMinutesBefore
      emailDailyDigestEnabled
      emailDailyDigestTime
      inAppRemindersEnabled
      inAppReminderMinutesBefore
      pushRemindersEnabled
      pushReminderMinutesBefore
      overdueNotificationsEnabled
      overdueNotificationFrequencyHours
      createdAt
      updatedAt
    }
  }
`;

const UPDATE_REMINDER_PREFERENCES = gql`
  mutation UpdateMyReminderPreferences($input: UpdateUserReminderPreferencesInput!) {
    updateMyReminderPreferences(input: $input) {
      id
      userId
      emailRemindersEnabled
      emailReminderMinutesBefore
      emailDailyDigestEnabled
      emailDailyDigestTime
      inAppRemindersEnabled
      inAppReminderMinutesBefore
      pushRemindersEnabled
      pushReminderMinutesBefore
      overdueNotificationsEnabled
      overdueNotificationFrequencyHours
      updatedAt
    }
  }
`;

interface NotificationPreferencesProps {
  className?: string;
}

export const NotificationPreferences: React.FC<NotificationPreferencesProps> = ({ 
  className = '' 
}) => {
  const [preferences, setPreferences] = useState({
    emailRemindersEnabled: true,
    emailReminderMinutesBefore: 60,
    emailDailyDigestEnabled: true,
    emailDailyDigestTime: '09:00:00',
    inAppRemindersEnabled: true,
    inAppReminderMinutesBefore: 15,
    pushRemindersEnabled: false,
    pushReminderMinutesBefore: 30,
    overdueNotificationsEnabled: true,
    overdueNotificationFrequencyHours: 24,
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const colors = useThemeColors();
  const toast = useToast();

  // Load user preferences from GraphQL API
  useEffect(() => {
    const loadPreferences = async () => {
      setLoading(true);
      setError(null);
      
      try {
        console.log('[NotificationPreferences] Loading preferences...');
        const response = await gqlClient.request<GetReminderPreferencesResponse>(GET_REMINDER_PREFERENCES);
        
        console.log('[NotificationPreferences] Load response:', response);
        
        if (response.myReminderPreferences) {
          console.log('[NotificationPreferences] Setting preferences from API:', response.myReminderPreferences);
          setPreferences({
            emailRemindersEnabled: response.myReminderPreferences.emailRemindersEnabled,
            emailReminderMinutesBefore: response.myReminderPreferences.emailReminderMinutesBefore,
            emailDailyDigestEnabled: response.myReminderPreferences.emailDailyDigestEnabled,
            emailDailyDigestTime: response.myReminderPreferences.emailDailyDigestTime,
            inAppRemindersEnabled: response.myReminderPreferences.inAppRemindersEnabled,
            inAppReminderMinutesBefore: response.myReminderPreferences.inAppReminderMinutesBefore,
            pushRemindersEnabled: response.myReminderPreferences.pushRemindersEnabled,
            pushReminderMinutesBefore: response.myReminderPreferences.pushReminderMinutesBefore,
            overdueNotificationsEnabled: response.myReminderPreferences.overdueNotificationsEnabled,
            overdueNotificationFrequencyHours: response.myReminderPreferences.overdueNotificationFrequencyHours,
          });
        } else {
          console.log('[NotificationPreferences] No preferences found, using defaults');
        }
      } catch (err: any) {
        console.error('[NotificationPreferences] Error loading notification preferences:', err);
        console.error('[NotificationPreferences] Load error details:', {
          message: err.message,
          response: err.response,
          stack: err.stack
        });
        
        let errorMessage = 'Failed to load notification preferences.';
        
        if (isGraphQLErrorWithMessage(err)) {
          console.error('[NotificationPreferences] GraphQL load error details:', err.response?.errors);
          errorMessage = err.response?.errors?.[0]?.message || errorMessage;
        } else if (err instanceof Error) {
          errorMessage = err.message;
        }
        
        setError(errorMessage);
        toast({
          title: 'Error Loading Preferences',
          description: errorMessage,
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      } finally {
        setLoading(false);
      }
    };

    loadPreferences();
  }, [toast]);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    
    try {
      console.log('[NotificationPreferences] Starting save operation...');
      console.log('[NotificationPreferences] Current preferences:', preferences);
      
      const response = await gqlClient.request<UpdateReminderPreferencesResponse>(UPDATE_REMINDER_PREFERENCES, {
        input: {
          emailRemindersEnabled: preferences.emailRemindersEnabled,
          emailReminderMinutesBefore: preferences.emailReminderMinutesBefore,
          emailDailyDigestEnabled: preferences.emailDailyDigestEnabled,
          emailDailyDigestTime: preferences.emailDailyDigestTime,
          inAppRemindersEnabled: preferences.inAppRemindersEnabled,
          inAppReminderMinutesBefore: preferences.inAppReminderMinutesBefore,
          pushRemindersEnabled: preferences.pushRemindersEnabled,
          pushReminderMinutesBefore: preferences.pushReminderMinutesBefore,
          overdueNotificationsEnabled: preferences.overdueNotificationsEnabled,
          overdueNotificationFrequencyHours: preferences.overdueNotificationFrequencyHours,
        }
      });

      console.log('[NotificationPreferences] API response:', response);

      if (response.updateMyReminderPreferences) {
        console.log('[NotificationPreferences] Successfully updated preferences:', response.updateMyReminderPreferences);
        
        // Update local state with server response to ensure consistency
        setPreferences(prev => ({
          ...prev,
          emailRemindersEnabled: response.updateMyReminderPreferences.emailRemindersEnabled,
          emailReminderMinutesBefore: response.updateMyReminderPreferences.emailReminderMinutesBefore,
          emailDailyDigestEnabled: response.updateMyReminderPreferences.emailDailyDigestEnabled,
          emailDailyDigestTime: response.updateMyReminderPreferences.emailDailyDigestTime,
          inAppRemindersEnabled: response.updateMyReminderPreferences.inAppRemindersEnabled,
          inAppReminderMinutesBefore: response.updateMyReminderPreferences.inAppReminderMinutesBefore,
          pushRemindersEnabled: response.updateMyReminderPreferences.pushRemindersEnabled,
          pushReminderMinutesBefore: response.updateMyReminderPreferences.pushReminderMinutesBefore,
          overdueNotificationsEnabled: response.updateMyReminderPreferences.overdueNotificationsEnabled,
          overdueNotificationFrequencyHours: response.updateMyReminderPreferences.overdueNotificationFrequencyHours,
        }));
        
        toast({
          title: 'Preferences saved',
          description: 'Your notification preferences have been updated successfully.',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      } else {
        console.error('[NotificationPreferences] API returned null response');
        throw new Error('API returned null response');
      }
    } catch (err: any) {
      console.error('[NotificationPreferences] Error saving notification preferences:', err);
      console.error('[NotificationPreferences] Error details:', {
        message: err.message,
        response: err.response,
        stack: err.stack
      });
      
      let errorMessage = 'Failed to save preferences. Please try again.';
      
      if (isGraphQLErrorWithMessage(err)) {
        console.error('[NotificationPreferences] GraphQL error details:', err.response?.errors);
        errorMessage = err.response?.errors?.[0]?.message || errorMessage;
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setSaving(false);
    }
  };

  const formatMinutesToReadable = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    
    if (remainingMinutes === 0) {
      return `${hours} hour${hours !== 1 ? 's' : ''}`;
    }
    return `${hours}h ${remainingMinutes}m`;
  };

  const formatHoursToReadable = (hours: number) => {
    if (hours === 24) return 'Daily';
    if (hours === 168) return 'Weekly';
    if (hours < 24) return `Every ${hours} hours`;
    const days = Math.floor(hours / 24);
    return `Every ${days} day${days !== 1 ? 's' : ''}`;
  };

  return (
    <Box className={className} maxW="800px" mx="auto">
      <Card bg={colors.bg.surface} borderColor={colors.border.default}>
        <CardHeader>
          <Heading size="md" color={colors.text.primary}>
            Notification Preferences
          </Heading>
          <Text fontSize="sm" color={colors.text.secondary} mt={2}>
            Configure when and how you receive activity reminders
          </Text>
        </CardHeader>

        <CardBody>
          {loading ? (
            <VStack spacing={4} align="center" py={8}>
              <Spinner size="lg" color={colors.interactive.default} />
              <Text color={colors.text.secondary}>Loading notification preferences...</Text>
            </VStack>
          ) : error ? (
            <Alert status="error" mb={6}>
              <AlertIcon />
              <Text>{error}</Text>
            </Alert>
          ) : (
            <VStack spacing={6} align="stretch">
              {/* Email Reminders Section */}
              <Box>
                <Heading size="sm" color={colors.text.primary} mb={4}>
                  Email Reminders
                </Heading>
                
                <VStack spacing={4} align="stretch">
                  <HStack justify="space-between">
                    <Box>
                      <Text fontWeight="medium" color={colors.text.primary}>
                        Email reminders for activities
                      </Text>
                      <Text fontSize="sm" color={colors.text.secondary}>
                        Receive email notifications before activities are due
                      </Text>
                    </Box>
                    <Switch
                      isChecked={preferences.emailRemindersEnabled}
                      onChange={(e) => setPreferences(prev => ({
                        ...prev,
                        emailRemindersEnabled: e.target.checked
                      }))}
                      isDisabled={saving}
                    />
                  </HStack>

                  {preferences.emailRemindersEnabled && (
                    <FormControl>
                      <FormLabel color={colors.text.primary}>
                        Send email reminder
                      </FormLabel>
                      <HStack>
                        <NumberInput
                          value={preferences.emailReminderMinutesBefore}
                          onChange={(_, valueAsNumber) => setPreferences(prev => ({
                            ...prev,
                            emailReminderMinutesBefore: isNaN(valueAsNumber) ? 60 : valueAsNumber
                          }))}
                          min={5}
                          max={1440}
                          w="120px"
                          isDisabled={saving}
                        >
                          <NumberInputField />
                          <NumberInputStepper>
                            <NumberIncrementStepper />
                            <NumberDecrementStepper />
                          </NumberInputStepper>
                        </NumberInput>
                        <Text color={colors.text.primary}>minutes before due time</Text>
                      </HStack>
                      <FormHelperText color={colors.text.secondary}>
                        {formatMinutesToReadable(preferences.emailReminderMinutesBefore)} before activity is due
                      </FormHelperText>
                    </FormControl>
                  )}

                  <HStack justify="space-between">
                    <Box>
                      <Text fontWeight="medium" color={colors.text.primary}>
                        Daily digest email
                      </Text>
                      <Text fontSize="sm" color={colors.text.secondary}>
                        Summary of upcoming activities for the day
                      </Text>
                    </Box>
                    <Switch
                      isChecked={preferences.emailDailyDigestEnabled}
                      onChange={(e) => setPreferences(prev => ({
                        ...prev,
                        emailDailyDigestEnabled: e.target.checked
                      }))}
                      isDisabled={saving}
                    />
                  </HStack>

                  {preferences.emailDailyDigestEnabled && (
                    <FormControl>
                      <FormLabel color={colors.text.primary}>
                        Send daily digest at
                      </FormLabel>
                      <Select
                        value={preferences.emailDailyDigestTime}
                        onChange={(e) => setPreferences(prev => ({
                          ...prev,
                          emailDailyDigestTime: e.target.value
                        }))}
                        w="200px"
                        isDisabled={saving}
                      >
                        <option value="07:00:00">7:00 AM</option>
                        <option value="08:00:00">8:00 AM</option>
                        <option value="09:00:00">9:00 AM</option>
                        <option value="10:00:00">10:00 AM</option>
                      </Select>
                    </FormControl>
                  )}
                </VStack>
              </Box>

              <Divider />

              {/* In-App Notifications Section */}
              <Box>
                <Heading size="sm" color={colors.text.primary} mb={4}>
                  In-App Notifications
                </Heading>
                
                <VStack spacing={4} align="stretch">
                  <HStack justify="space-between">
                    <Box>
                      <Text fontWeight="medium" color={colors.text.primary}>
                        In-app notifications
                      </Text>
                      <Text fontSize="sm" color={colors.text.secondary}>
                        Show notifications in the notification center
                      </Text>
                    </Box>
                    <Switch
                      isChecked={preferences.inAppRemindersEnabled}
                      onChange={(e) => setPreferences(prev => ({
                        ...prev,
                        inAppRemindersEnabled: e.target.checked
                      }))}
                      isDisabled={saving}
                    />
                  </HStack>

                  {preferences.inAppRemindersEnabled && (
                    <FormControl>
                      <FormLabel color={colors.text.primary}>
                        Show notification
                      </FormLabel>
                      <HStack>
                        <NumberInput
                          value={preferences.inAppReminderMinutesBefore}
                          onChange={(_, valueAsNumber) => setPreferences(prev => ({
                            ...prev,
                            inAppReminderMinutesBefore: isNaN(valueAsNumber) ? 15 : valueAsNumber
                          }))}
                          min={1}
                          max={1440}
                          w="120px"
                          isDisabled={saving}
                        >
                          <NumberInputField />
                          <NumberInputStepper>
                            <NumberIncrementStepper />
                            <NumberDecrementStepper />
                          </NumberInputStepper>
                        </NumberInput>
                        <Text color={colors.text.primary}>minutes before due time</Text>
                      </HStack>
                      <FormHelperText color={colors.text.secondary}>
                        {formatMinutesToReadable(preferences.inAppReminderMinutesBefore)} before activity is due
                      </FormHelperText>
                    </FormControl>
                  )}
                </VStack>
              </Box>

              <Divider />

              {/* Push Notifications Section */}
              <Box>
                <Heading size="sm" color={colors.text.primary} mb={4}>
                  Push Notifications
                </Heading>
                
                <VStack spacing={4} align="stretch">
                  <HStack justify="space-between">
                    <Box>
                      <Text fontWeight="medium" color={colors.text.primary}>
                        Push notifications
                      </Text>
                      <Text fontSize="sm" color={colors.text.secondary}>
                        Browser or mobile push notifications (coming soon)
                      </Text>
                    </Box>
                    <Switch
                      isChecked={preferences.pushRemindersEnabled}
                      onChange={(e) => setPreferences(prev => ({
                        ...prev,
                        pushRemindersEnabled: e.target.checked
                      }))}
                      isDisabled={true} // Disabled until push notifications are implemented
                    />
                  </HStack>

                  {preferences.pushRemindersEnabled && (
                    <FormControl>
                      <FormLabel color={colors.text.primary}>
                        Send push notification
                      </FormLabel>
                      <HStack>
                        <NumberInput
                          value={preferences.pushReminderMinutesBefore}
                          onChange={(_, valueAsNumber) => setPreferences(prev => ({
                            ...prev,
                            pushReminderMinutesBefore: isNaN(valueAsNumber) ? 30 : valueAsNumber
                          }))}
                          min={1}
                          max={1440}
                          w="120px"
                          isDisabled={true}
                        >
                          <NumberInputField />
                          <NumberInputStepper>
                            <NumberIncrementStepper />
                            <NumberDecrementStepper />
                          </NumberInputStepper>
                        </NumberInput>
                        <Text color={colors.text.primary}>minutes before due time</Text>
                      </HStack>
                    </FormControl>
                  )}
                </VStack>
              </Box>

              <Divider />

              {/* Overdue Notifications Section */}
              <Box>
                <Heading size="sm" color={colors.text.primary} mb={4}>
                  Overdue Activities
                </Heading>
                
                <VStack spacing={4} align="stretch">
                  <HStack justify="space-between">
                    <Box>
                      <Text fontWeight="medium" color={colors.text.primary}>
                        Overdue notifications
                      </Text>
                      <Text fontSize="sm" color={colors.text.secondary}>
                        Get notified about activities that are overdue
                      </Text>
                    </Box>
                    <Switch
                      isChecked={preferences.overdueNotificationsEnabled}
                      onChange={(e) => setPreferences(prev => ({
                        ...prev,
                        overdueNotificationsEnabled: e.target.checked
                      }))}
                      isDisabled={saving}
                    />
                  </HStack>

                  {preferences.overdueNotificationsEnabled && (
                    <FormControl>
                      <FormLabel color={colors.text.primary}>
                        Notification frequency
                      </FormLabel>
                      <Select
                        value={preferences.overdueNotificationFrequencyHours.toString()}
                        onChange={(e) => setPreferences(prev => ({
                          ...prev,
                          overdueNotificationFrequencyHours: parseInt(e.target.value)
                        }))}
                        w="200px"
                        isDisabled={saving}
                      >
                        <option value="1">Every hour</option>
                        <option value="3">Every 3 hours</option>
                        <option value="6">Every 6 hours</option>
                        <option value="12">Every 12 hours</option>
                        <option value="24">Daily</option>
                        <option value="168">Weekly</option>
                      </Select>
                      <FormHelperText color={colors.text.secondary}>
                        {formatHoursToReadable(preferences.overdueNotificationFrequencyHours)}
                      </FormHelperText>
                    </FormControl>
                  )}
                </VStack>
              </Box>

              {/* Save Button */}
              <Box pt={4}>
                <Button
                  colorScheme="blue"
                  onClick={handleSave}
                  isLoading={saving}
                  loadingText="Saving..."
                  size="lg"
                >
                  Save Preferences
                </Button>
              </Box>
            </VStack>
          )}
        </CardBody>
      </Card>
    </Box>
  );
}; 