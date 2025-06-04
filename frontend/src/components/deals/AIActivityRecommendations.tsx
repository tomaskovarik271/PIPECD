import React, { useState } from 'react';
import {
  Box,
  Button,
  VStack,
  HStack,
  Text,
  Badge,
  Card,
  CardBody,
  CardHeader,
  Heading,
  Spinner,
  Alert,
  AlertIcon,
  useToast,
  Divider,
  Icon,
  Flex,
  Progress,
} from '@chakra-ui/react';
import { FiZap, FiPhone, FiMail, FiCalendar, FiCheckSquare, FiClock } from 'react-icons/fi';
import { gql } from 'graphql-request';
import { gqlClient } from '../../lib/graphqlClient';
import { useActivitiesStore } from '../../stores/useActivitiesStore';
import { useThemeColors } from '../../hooks/useThemeColors';
import type { ActivityType } from '../../generated/graphql/graphql';

const GET_AI_ACTIVITY_RECOMMENDATIONS = gql`
  query GetAIActivityRecommendations($dealId: ID!) {
    getAIActivityRecommendations(dealId: $dealId) {
      contextSummary
      primaryRecommendation {
        id
        title
        description
        priority
        suggestedDueDate
        confidence
        reasoning
      }
      recommendations {
        id
        title
        description
        priority
        suggestedDueDate
        confidence
        reasoning
      }
    }
  }
`;

interface AIActivityRecommendation {
  id: string;
  title: string;
  description: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  suggestedDueDate: string;
  confidence: number;
  reasoning: string;
}

interface AIActivityRecommendationsResponse {
  contextSummary: string;
  primaryRecommendation: AIActivityRecommendation;
  recommendations: AIActivityRecommendation[];
}

interface AIActivityRecommendationsProps {
  dealId: string;
}

const getActivityIcon = (type: ActivityType) => {
  switch (type) {
    case 'CALL': return FiPhone;
    case 'EMAIL': return FiMail;
    case 'MEETING': return FiCalendar;
    case 'TASK': return FiCheckSquare;
    case 'DEADLINE': return FiClock;
    default: return FiCheckSquare;
  }
};

const getActivityColor = (type: ActivityType) => {
  switch (type) {
    case 'CALL': return 'green';
    case 'EMAIL': return 'blue';
    case 'MEETING': return 'purple';
    case 'TASK': return 'orange';
    case 'DEADLINE': return 'red';
    default: return 'gray';
  }
};

export const AIActivityRecommendations: React.FC<AIActivityRecommendationsProps> = ({ dealId }) => {
  const [recommendations, setRecommendations] = useState<AIActivityRecommendationsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCreatingActivity, setIsCreatingActivity] = useState<string | null>(null);
  
  const { createActivity } = useActivitiesStore();
  const colors = useThemeColors();
  const toast = useToast();

  const fetchRecommendations = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await gqlClient.request<{ getAIActivityRecommendations: AIActivityRecommendationsResponse }>(
        GET_AI_ACTIVITY_RECOMMENDATIONS,
        { dealId }
      );
      setRecommendations(response.getAIActivityRecommendations);
    } catch (err) {
      console.error('Error fetching AI recommendations:', err);
      setError('Failed to get AI recommendations. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const createActivityFromRecommendation = async (recommendation: AIActivityRecommendation) => {
    setIsCreatingActivity(recommendation.title);
    
    try {
      await createActivity({
        type: recommendation.priority as ActivityType,
        subject: recommendation.title,
        notes: recommendation.description,
        due_date: recommendation.suggestedDueDate,
        deal_id: dealId,
        is_done: false,
      });
      
      toast({
        title: 'Activity Created',
        description: `"${recommendation.title}" has been added to your activities.`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (err) {
      console.error('Error creating activity:', err);
      toast({
        title: 'Error',
        description: 'Failed to create activity. Please try again.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsCreatingActivity(null);
    }
  };

  const RecommendationCard: React.FC<{ recommendation: AIActivityRecommendation; isPrimary?: boolean }> = ({ 
    recommendation, 
    isPrimary = false 
  }) => {
    const ActivityIcon = getActivityIcon(recommendation.priority as ActivityType);
    const activityColor = getActivityColor(recommendation.priority as ActivityType);
    
    return (
      <Card 
        bg={colors.bg.surface} 
        borderColor={isPrimary ? colors.border.accent : colors.border.subtle}
        borderWidth={isPrimary ? 2 : 1}
        _hover={{ borderColor: colors.border.accent, transform: 'translateY(-2px)' }}
        transition="all 0.2s"
      >
        <CardHeader pb={2}>
          <Flex justify="space-between" align="center">
            <HStack>
              <Icon as={ActivityIcon} color={`${activityColor}.500`} boxSize={5} />
              <Badge colorScheme={activityColor} variant="subtle">
                {recommendation.priority}
              </Badge>
              {isPrimary && (
                <Badge colorScheme="yellow" variant="solid">
                  ⭐ TOP PICK
                </Badge>
              )}
            </HStack>
            <VStack align="end" spacing={0}>
              <Text fontSize="xs" color={colors.text.secondary}>
                Confidence
              </Text>
              <Progress 
                value={recommendation.confidence * 100} 
                size="sm" 
                colorScheme="green" 
                w="60px"
                bg={colors.bg.elevated}
              />
              <Text fontSize="xs" color={colors.text.secondary}>
                {Math.round(recommendation.confidence * 100)}%
              </Text>
            </VStack>
          </Flex>
        </CardHeader>
        
        <CardBody pt={0}>
          <VStack align="stretch" spacing={3}>
            <Box>
              <Heading size="sm" color={colors.text.primary} mb={1}>
                {recommendation.title}
              </Heading>
              <Text fontSize="sm" color={colors.text.secondary}>
                {recommendation.description}
              </Text>
            </Box>
            
            <Divider borderColor={colors.border.subtle} />
            
            <Box>
              <Text fontSize="xs" color={colors.text.secondary} mb={1}>
                💡 Why this makes sense:
              </Text>
              <Text fontSize="sm" color={colors.text.primary} fontStyle="italic">
                {recommendation.reasoning}
              </Text>
            </Box>
            
            <HStack justify="space-between" align="center">
              <Text fontSize="sm" color={colors.text.secondary}>
                📅 Due: {new Date(recommendation.suggestedDueDate).toLocaleDateString()}
              </Text>
              <Button
                size="sm"
                colorScheme="blue"
                variant={isPrimary ? "solid" : "outline"}
                leftIcon={<Icon as={ActivityIcon} />}
                onClick={() => createActivityFromRecommendation(recommendation)}
                isLoading={isCreatingActivity === recommendation.title}
                loadingText="Creating..."
              >
                Create Activity
              </Button>
            </HStack>
          </VStack>
        </CardBody>
      </Card>
    );
  };

  return (
    <Box>
      <Card bg={colors.bg.surface} borderColor={colors.border.subtle}>
        <CardHeader>
          <HStack justify="space-between">
            <HStack>
              <Icon as={FiZap} color="yellow.500" boxSize={6} />
              <Heading size="md" color={colors.text.primary}>
                🤖 AI Activity Recommendations
              </Heading>
            </HStack>
            <Button
              onClick={fetchRecommendations}
              isLoading={isLoading}
              loadingText="Analyzing..."
              colorScheme="purple"
              variant="outline"
              size="sm"
            >
              Get Smart Suggestions
            </Button>
          </HStack>
        </CardHeader>
        
        <CardBody>
          {error && (
            <Alert status="error" mb={4} bg={colors.bg.elevated}>
              <AlertIcon />
              {error}
            </Alert>
          )}
          
          {isLoading && (
            <VStack spacing={4} py={8}>
              <Spinner size="lg" color="purple.500" />
              <Text color={colors.text.secondary}>
                🧠 Claude is analyzing your deal context...
              </Text>
            </VStack>
          )}
          
          {recommendations && !isLoading && (
            <VStack spacing={4} align="stretch">
              <Alert status="info" bg={colors.bg.elevated}>
                <AlertIcon />
                <Box>
                  <Text fontWeight="bold" color={colors.text.primary}>
                    Deal Analysis Summary
                  </Text>
                  <Text fontSize="sm" color={colors.text.secondary}>
                    {recommendations.contextSummary}
                  </Text>
                </Box>
              </Alert>
              
              <RecommendationCard 
                recommendation={recommendations.primaryRecommendation} 
                isPrimary={true} 
              />
              
              {recommendations.recommendations.length > 1 && (
                <>
                  <Divider borderColor={colors.border.subtle} />
                  <Text fontWeight="bold" color={colors.text.primary}>
                    Alternative Recommendations
                  </Text>
                  {recommendations.recommendations.slice(1).map((rec, index) => (
                    <RecommendationCard key={index} recommendation={rec} />
                  ))}
                </>
              )}
            </VStack>
          )}
          
          {!recommendations && !isLoading && !error && (
            <VStack spacing={4} py={8} textAlign="center">
              <Icon as={FiZap} boxSize={12} color="gray.400" />
              <Text color={colors.text.secondary}>
                Click "Get Smart Suggestions" to let AI analyze this deal and recommend the best next activities.
              </Text>
            </VStack>
          )}
        </CardBody>
      </Card>
    </Box>
  );
}; 