import React from 'react';
import {
  Box,
  Heading,
  Text,
  SimpleGrid,
  VStack,
  HStack,
  Card,
  CardBody,
  CardHeader,
  Spinner,
  Alert,
  AlertIcon,
  Avatar,
  Badge,
  Icon,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Button,
  Flex,
  Center,
} from '@chakra-ui/react';
import { useQuery } from '@apollo/client';
import { useNavigate } from 'react-router-dom';
import { FiDollarSign, FiTrendingUp, FiClock, FiUsers, FiAlertTriangle } from 'react-icons/fi';
import { AtSignIcon } from '@chakra-ui/icons';
import { GET_MY_ACCOUNTS, GET_MY_ACCOUNT_PORTFOLIO_STATS } from '../lib/graphql/accountOperations';
import { useThemeColors } from '../hooks/useThemeColors';
import { CurrencyFormatter } from '../lib/utils/currencyFormatter';
import UnifiedPageHeader from '../components/layout/UnifiedPageHeader';
import { usePageLayoutStyles } from '../utils/headerUtils';

// Account Card Component
interface AccountCardProps {
  organization: any;
  onViewDetails: () => void;
}

const AccountCard: React.FC<AccountCardProps> = ({ organization, onViewDetails }) => {
  const colors = useThemeColors();
  
  const formatLastActivity = (activity: any) => {
    if (!activity) return 'No recent activity';
    const date = new Date(activity.created_at);
    const daysAgo = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysAgo === 0) return 'Today';
    if (daysAgo === 1) return 'Yesterday';
    if (daysAgo < 7) return `${daysAgo} days ago`;
    if (daysAgo < 30) return `${Math.floor(daysAgo / 7)} weeks ago`;
    return `${Math.floor(daysAgo / 30)} months ago`;
  };

  const getActivityColor = (activity: any) => {
    if (!activity) return colors.status.warning;
    const daysAgo = Math.floor((Date.now() - new Date(activity.created_at).getTime()) / (1000 * 60 * 60 * 24));
    if (daysAgo <= 7) return colors.status.success;
    if (daysAgo <= 30) return colors.status.warning;
    return colors.status.error;
  };

  return (
    <Card
      bg={colors.bg.surface}
      borderColor={colors.border.default}
      borderWidth="1px"
      cursor="pointer"
      onClick={onViewDetails}
      _hover={{
        borderColor: colors.interactive.default,
        transform: 'translateY(-2px)',
        shadow: 'lg',
      }}
      transition="all 0.2s ease"
    >
      <CardHeader pb={2}>
        <HStack justify="space-between" align="start">
          <VStack align="start" spacing={1} flex={1}>
            <Heading size="md" color={colors.text.primary} noOfLines={1}>
              {organization.name}
            </Heading>
            {organization.industry && (
              <Badge colorScheme="blue" variant="subtle" fontSize="xs">
                {organization.industry}
              </Badge>
            )}
          </VStack>
          <Icon as={AtSignIcon} color={colors.text.muted} boxSize={5} />
        </HStack>
      </CardHeader>
      
      <CardBody pt={0}>
        <VStack spacing={3} align="stretch">
          {/* Financial Stats */}
          <HStack justify="space-between">
            <VStack align="start" spacing={0}>
              <Text fontSize="xs" color={colors.text.muted}>Pipeline Value</Text>
                             <Text fontWeight="bold" color={colors.text.primary}>
                 {CurrencyFormatter.format(organization.totalDealValue || 0)}
               </Text>
            </VStack>
            <VStack align="end" spacing={0}>
              <Text fontSize="xs" color={colors.text.muted}>Active Deals</Text>
              <Text fontWeight="bold" color={colors.text.primary}>
                {organization.activeDealCount || 0}
              </Text>
            </VStack>
          </HStack>

          {/* Last Activity */}
          <HStack justify="space-between" align="center">
            <Icon as={FiClock} color={getActivityColor(organization.lastActivity)} boxSize={4} />
            <Text fontSize="sm" color={colors.text.secondary} flex={1} textAlign="right">
              {formatLastActivity(organization.lastActivity)}
            </Text>
          </HStack>
        </VStack>
      </CardBody>
    </Card>
  );
};

// Stats Card Component
interface StatsCardProps {
  label: string;
  value: number | string;
  icon: any;
  helpText?: string;
  colorScheme?: string;
}

const StatsCard: React.FC<StatsCardProps> = ({ label, value, icon, helpText, colorScheme = "blue" }) => {
  const colors = useThemeColors();
  
  return (
    <Card bg={colors.bg.surface} borderColor={colors.border.default} borderWidth="1px">
      <CardBody>
        <Stat>
          <Flex justify="space-between" align="center" mb={2}>
            <StatLabel color={colors.text.muted} fontSize="sm">
              {label}
            </StatLabel>
            <Icon as={icon} color={colors.interactive.default} boxSize={5} />
          </Flex>
          <StatNumber color={colors.text.primary} fontSize="2xl">
            {value}
          </StatNumber>
          {helpText && (
            <StatHelpText color={colors.text.secondary} fontSize="xs">
              {helpText}
            </StatHelpText>
          )}
        </Stat>
      </CardBody>
    </Card>
  );
};

const MyAccountsPage: React.FC = () => {
  const navigate = useNavigate();
  const colors = useThemeColors();
  const pageLayoutStyles = usePageLayoutStyles(true); // true for statistics

  const { 
    data: accountsData, 
    loading: accountsLoading, 
    error: accountsError 
  } = useQuery(GET_MY_ACCOUNTS);

  const { 
    data: statsData, 
    loading: statsLoading, 
    error: statsError 
  } = useQuery(GET_MY_ACCOUNT_PORTFOLIO_STATS);

  const accounts = accountsData?.myAccounts || [];
  const stats = statsData?.myAccountPortfolioStats;

  const handleViewOrganization = (organizationId: string) => {
    navigate(`/organizations/${organizationId}`);
  };

  if (accountsLoading || statsLoading) {
    return (
      <>
        <UnifiedPageHeader
          title="My Accounts"
          statistics={[
            { label: "Total Accounts", value: "..." },
            { label: "Pipeline Value", value: "..." },
            { label: "Active Deals", value: "..." },
            { label: "Need Attention", value: "..." },
          ]}
        />
        <Box sx={pageLayoutStyles.container}>
          <Center h="200px">
            <Spinner size="xl" color={colors.interactive.default} />
          </Center>
        </Box>
      </>
    );
  }

  if (accountsError || statsError) {
    return (
      <>
        <UnifiedPageHeader
          title="My Accounts"
        />
        <Box sx={pageLayoutStyles.container}>
          <Alert status="error" borderRadius="md">
            <AlertIcon />
            <Text>
              Error loading account data: {accountsError?.message || statsError?.message}
            </Text>
          </Alert>
        </Box>
      </>
    );
  }

  return (
    <>
      <UnifiedPageHeader
        title="My Accounts"
        statistics={stats ? [
          {
            label: "Total Accounts",
            value: stats.totalAccounts,
          },
          {
            label: "Pipeline Value",
            value: CurrencyFormatter.format(stats.totalDealValue),
          },
          {
            label: "Active Deals",
            value: stats.activeDealCount,
          },
          {
            label: "Need Attention",
            value: stats.accountsNeedingAttention,
          },
        ] : undefined}
      />

      <Box sx={pageLayoutStyles.container}>
        <VStack spacing={6} align="stretch" maxW="1400px" mx="auto">
          {/* Accounts Grid */}
          {accounts.length > 0 ? (
            <Box>
              <Heading size="md" color={colors.text.primary} mb={4}>
                Your Organizations
              </Heading>
              <SimpleGrid columns={{ base: 1, md: 2, lg: 3, xl: 4 }} spacing={4}>
                {accounts.map((account: any) => (
                  <AccountCard
                    key={account.id}
                    organization={account}
                    onViewDetails={() => handleViewOrganization(account.id)}
                  />
                ))}
              </SimpleGrid>
            </Box>
          ) : (
            <Card bg={colors.bg.surface} borderColor={colors.border.default} borderWidth="1px">
              <CardBody>
                <VStack spacing={4} py={8}>
                  <Icon as={AtSignIcon} color={colors.text.muted} boxSize={12} />
                  <VStack spacing={2}>
                    <Heading size="md" color={colors.text.primary}>
                      No Accounts Assigned
                    </Heading>
                    <Text color={colors.text.secondary} textAlign="center" maxW="400px">
                      You don't have any organizations assigned to you as an account manager yet. 
                      Contact your administrator to get organizations assigned.
                    </Text>
                  </VStack>
                  <Button
                    colorScheme="blue"
                    variant="outline"
                    onClick={() => navigate('/organizations')}
                    leftIcon={<Icon as={AtSignIcon} />}
                  >
                    View All Organizations
                  </Button>
                </VStack>
              </CardBody>
            </Card>
          )}
        </VStack>
      </Box>
    </>
  );
};

export default MyAccountsPage; 