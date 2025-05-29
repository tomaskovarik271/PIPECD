import React from 'react';
import { Box, Heading, Tabs, TabList, TabPanels, Tab, TabPanel, Container } from '@chakra-ui/react';
import { Outlet, Link as RouterLink, useLocation } from 'react-router-dom';
import { useThemeColors, useThemeStyles } from '../../hooks/useThemeColors';

// Import the page components we'll be linking to
// Assuming these are the correct paths based on the previous discovery
import WFMStatusesPage from './WFMStatusesPage';
import WFMWorkflowsPage from './WFMWorkflowsPage';
import WFMProjectTypesPage from './WFMProjectTypesPage';

const WfmAdminPage: React.FC = () => {
  const location = useLocation();
  
  const colors = useThemeColors();
  const styles = useThemeStyles();

  // Determine the default tab index based on the current route
  // This helps keep the selected tab in sync with the URL if navigated to directly
  const getTabIndex = () => {
    if (location.pathname.includes('/admin/wfm/workflows')) return 1;
    if (location.pathname.includes('/admin/wfm/project-types')) return 2;
    // Default to Statuses or if the path is just /admin/wfm
    if (location.pathname.includes('/admin/wfm/statuses') || location.pathname === '/admin/wfm') return 0; 
    return 0; 
  };

  const tabIndex = getTabIndex();

  // NEW: Theme-aware tab styles
  const tabStyles = {
    color: colors.text.secondary,
    _hover: {
      color: colors.text.primary,
      bg: colors.bg.elevated,
    },
    _selected: { 
      color: colors.text.onAccent,
      bg: colors.interactive.default
    }
  };

  // Note: For this setup to work seamlessly with nested routes and direct URL access
  // to specific tabs, we will define routes for /admin/wfm/statuses, /admin/wfm/workflows, etc.
  // The TabPanels here will render the content of those routes via <Outlet />
  // OR, we can directly embed the page components if we don't use further nested routing for these tabs.
  // For simplicity in this first step, let's embed them. If complex sub-routing within each tab is needed,
  // <Outlet /> would be better.

  return (
    <Container 
      maxW="container.xl" 
      py={8}
      bg={colors.bg.surface}
      borderRadius="xl"
      borderWidth="1px"
      borderColor={colors.border.default}
      mt={4}
    >
      <Heading 
        as="h1" 
        size="xl" 
        mb={6}
        color={colors.text.primary}
      >
        Workflow Management
      </Heading>
      <Tabs 
        index={tabIndex} 
        variant="soft-rounded" 
        colorScheme="blue"
      >
        <TabList mb={4}>
          <Tab 
            as={RouterLink} 
            to="/admin/wfm/statuses" 
            {...tabStyles}
          >
            Statuses
          </Tab>
          <Tab 
            as={RouterLink} 
            to="/admin/wfm/workflows" 
            {...tabStyles}
          >
            Workflows
          </Tab>
          <Tab 
            as={RouterLink} 
            to="/admin/wfm/project-types" 
            {...tabStyles}
          >
            Project Types
          </Tab>
        </TabList>
        <TabPanels>
          <TabPanel p={0}> {/* Statuses - path: /admin/wfm/statuses or /admin/wfm */}
            {/* We expect WFMStatusesPage to be rendered by the route */}
            {/* If not using nested routes for tabs, directly render: <WFMStatusesPage /> */}
             <Outlet /> 
          </TabPanel>
          <TabPanel p={0}> {/* Workflows - path: /admin/wfm/workflows */}
            {/* <WFMWorkflowsPage /> */}
             <Outlet />
          </TabPanel>
          <TabPanel p={0}> {/* Project Types - path: /admin/wfm/project-types */}
            {/* <WFMProjectTypesPage /> */}
            <Outlet />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Container>
  );
};

export default WfmAdminPage; 