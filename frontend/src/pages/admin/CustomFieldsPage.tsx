import React from 'react';
import { Box, Heading, Text, Container } from '@chakra-ui/react';
import CustomFieldDefinitionList from '../../components/admin/customFields/CustomFieldDefinitionList';

const CustomFieldsPage: React.FC = () => {
  return (
    <Container maxW="container.xl" py={8}>
      <Box>
        <Heading as="h1" size="xl" mb={6}>
          Manage Custom Fields
        </Heading>
        <Text mb={4}>
          Here you can define and manage custom fields for Deals, People, and Organizations.
        </Text>
        <CustomFieldDefinitionList />
        {/* <Text mt={8} fontStyle="italic">
          (Custom Field List component will be rendered here)
        </Text> */}
      </Box>
    </Container>
  );
};

export default CustomFieldsPage; 