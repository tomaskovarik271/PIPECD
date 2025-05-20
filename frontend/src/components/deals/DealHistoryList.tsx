import React, { useEffect, useState } from 'react';
import { VStack, Text, Spinner, Alert, AlertIcon } from '@chakra-ui/react';
import { DealWithHistory } from '../../stores/useAppStore'; // Assuming DealWithHistory exports the history entry structure
import DealHistoryItem from './DealHistoryItem';
import { useStagesStore } from '../../stores/useStagesStore';
import { usePeopleStore } from '../../stores/usePeopleStore';
import { useOrganizationsStore } from '../../stores/useOrganizationsStore';
import { useCustomFieldDefinitionStore } from '../../stores/useCustomFieldDefinitionStore';
import { usePipelinesStore } from '../../stores/usePipelinesStore'; // Import usePipelinesStore
import { CustomFieldEntityType } from '../../generated/graphql/graphql';

// We need the specific type for a single history entry from DealWithHistory
// This can be DealWithHistory['history'][number] if DealWithHistory is correctly typed
// Or we can import the generated GraphQLDealHistoryEntry type and build upon it.
// For now, let's use the structure from DealWithHistory['history'][number]

export type DealHistoryEntryDisplayItem = DealWithHistory['history'][number];

interface DealHistoryListProps {
  historyEntries: DealHistoryEntryDisplayItem[];
  dealId: string; // Assuming dealId is available to fetch relevant history if needed, or for context
}

const DealHistoryList: React.FC<DealHistoryListProps> = ({ historyEntries, dealId }) => {
  const { stages, fetchStages, stagesLoading, stagesError } = useStagesStore();
  const { people, fetchPeople, peopleLoading, peopleError } = usePeopleStore();
  const { organizations, fetchOrganizations, organizationsLoading, organizationsError } = useOrganizationsStore();
  const {
    definitions: customFieldDefinitions,
    fetchCustomFieldDefinitions,
    loading: customFieldDefinitionsLoading,
    error: customFieldDefinitionsError,
  } = useCustomFieldDefinitionStore();
  const { pipelines, fetchPipelines, pipelinesLoading, pipelinesError } = usePipelinesStore();

  const [allStagesFetched, setAllStagesFetched] = useState(false);

  useEffect(() => {
    fetchPeople();
    fetchOrganizations();
    fetchCustomFieldDefinitions(CustomFieldEntityType.Deal, true);
    fetchPipelines(); // Fetch all pipelines first
  }, [fetchPeople, fetchOrganizations, fetchCustomFieldDefinitions, fetchPipelines]);

  useEffect(() => {
    // Once pipelines are loaded, fetch stages for each pipeline
    if (pipelines.length > 0 && !pipelinesLoading && !stagesLoading) {
      const fetchAllPipelineStages = async () => {
        // Set loading true for this aggregate operation if not already handled by individual fetchStages
        // For simplicity, we rely on individual stagesLoading from the store here.
        // A more granular loading state for this specific loop could be added.
        for (const pipeline of pipelines) {
          await fetchStages(pipeline.id);
        }
        setAllStagesFetched(true); // Mark that all stages fetching process has been initiated/completed
      };
      
      // Check if stages for all pipelines are already being fetched or are fetched.
      // This simple check assumes that if `fetchStages` was called for all, `stagesLoading` would cover it,
      // or `allStagesFetched` will be true.
      // A more robust check might involve comparing fetched pipeline stage sets.
      if(!allStagesFetched) {
        fetchAllPipelineStages();
      }
    }
  }, [pipelines, pipelinesLoading, fetchStages, stagesLoading, allStagesFetched]);

  // The main loading condition now also considers pipelinesLoading and allStagesFetched
  const isLoadingReferenceData = pipelinesLoading || 
                                 peopleLoading || 
                                 organizationsLoading || 
                                 customFieldDefinitionsLoading ||
                                 (!allStagesFetched && pipelines.length > 0) || // Still waiting for stages if pipelines are loaded but not all stages fetched
                                 (stagesLoading && !allStagesFetched); // Actively loading stages for pipelines

  if (isLoadingReferenceData) {
    return (
      <VStack spacing={4} align="center" justify="center" minH="100px">
        <Spinner />
        <Text>Loading reference data for history...</Text>
      </VStack>
    );
  }

  const combinedError = pipelinesError || stagesError || peopleError || organizationsError || customFieldDefinitionsError;
  if (combinedError) {
    return (
      <Alert status="error">
        <AlertIcon />
        <Text>Error loading reference data: {combinedError}</Text>
      </Alert>
    );
  }

  if (!historyEntries || historyEntries.length === 0) {
    return <Text>No history available for this deal.</Text>;
  }

  return (
    <VStack spacing={4} align="stretch">
      {historyEntries.map((entry) => (
        <DealHistoryItem 
          key={entry.id} 
          entry={entry} 
          stages={stages} // Pass all accumulated stages
          people={people}
          organizations={organizations}
          customFieldDefinitions={customFieldDefinitions.filter(def => def.entityType === CustomFieldEntityType.Deal)}
        />
      ))}
    </VStack>
  );
};

export default DealHistoryList; 