import { createYoga, createSchema, Plugin } from 'graphql-yoga';
import type { Handler, HandlerContext } from '@netlify/functions';
import type { User } from '@supabase/supabase-js';
import { supabase } from '../../lib/supabaseClient';
import * as fs from 'fs';
import * as path from 'path';
import { createClient } from '@supabase/supabase-js';
import { SupabaseClient } from '@supabase/supabase-js';

import {
  GraphQLContext, 
} from './graphql/helpers'; 

import { 
} from './graphql/validators';

import { Query as BaseQuery } from './graphql/resolvers/query';
import { Mutation as BaseMutation } from './graphql/resolvers/mutation';
import { Person } from './graphql/resolvers/person';
import { Deal } from './graphql/resolvers/deal';
import { Lead } from './graphql/resolvers/lead';
import { Organization } from './graphql/resolvers/organization';
// Activity resolvers removed - using Google Calendar integration instead
import { DealHistoryEntry } from './graphql/resolvers/history';
import {
  queryResolvers as CustomFieldQueryResolvers,
  mutationResolvers as CustomFieldMutationResolvers,
} from './graphql/resolvers/customFields';

// Import WFM Resolvers
import { WFMStatusResolvers } from './graphql/resolvers/wfmStatus';
import { WFMWorkflowResolvers } from './graphql/resolvers/wfmWorkflow';
import { WFMProjectTypeResolvers } from './graphql/resolvers/wfmProjectType';
import { WFMProject } from './graphql/resolvers/wfmProject';
import { WFMWorkflowStep as WFMWorkflowStepResolver } from './graphql/resolvers/wfmWorkflowStep';

// Import Agent Resolvers
import { agentQueries, agentMutations } from './graphql/resolvers/agentResolvers';
import { agentV2Resolvers } from './graphql/resolvers/agentV2Resolvers';

// Import Relationship Resolvers


// Import Smart Sticker Resolvers
import {
  smartStickerQueries,
  smartStickerMutations
} from './graphql/resolvers/smartStickers';

// Import Email Resolvers
import { emailQueries } from './graphql/resolvers/queries/emailQueries';
import { emailMutations } from './graphql/resolvers/mutations/emailMutations';

// Import Drive Resolvers
import { driveQueries } from './graphql/resolvers/queries/driveQueries';
import { driveMutations } from './graphql/resolvers/mutations/driveMutations';

// Import Shared Drive Resolvers
import { sharedDriveQueries } from './graphql/resolvers/queries/sharedDriveQueries';
import { sharedDriveMutations } from './graphql/resolvers/mutations/sharedDriveMutations';
import { appSettingsQueries } from './graphql/resolvers/queries/appSettingsQueries';
import { appSettingsMutations } from './graphql/resolvers/mutations/appSettingsMutations';

// Import User Resolvers
import { User as UserResolver, userMutations } from './graphql/resolvers/user';

// Activity reminder resolvers removed - using Google Calendar integration instead

// Import Currency Resolvers
import { currencyResolvers } from './graphql/resolvers/currency';

// Import Conversion Resolvers
import { conversionResolvers } from './graphql/resolvers/conversionResolvers';

// Import Calendar Resolvers
import { calendarResolvers } from './graphql/resolvers/calendarResolvers';

// Import Task Resolvers
import taskResolvers from './graphql/resolvers/taskResolvers';

// Import Business Rules Resolvers
import { businessRulesResolvers } from './graphql/resolvers/businessRulesResolvers';

// Import Notification Resolvers
import { notificationQueries, notificationMutations, SystemNotification, UnifiedNotification } from './graphql/resolvers/notificationResolvers';

// Import Person Organization Role Resolvers
import { 
  PersonOrganizationRole, 
  PersonHistory, 
  PersonEnhanced,
  PersonOrganizationRoleQueries, 
  PersonOrganizationRoleMutations 
} from './graphql/resolvers/personOrganizationRole';

const loadTypeDefs = (): string => {
  const schemaDir = path.join(process.cwd(), 'netlify/functions/graphql/schema');

  // List of all your .graphql schema files in the schema directory
  // Ensure this list is accurate and complete.
  const allSchemaFiles = [
    'activity.graphql', 
    'agent.graphql',
    'base.graphql', 
    'customFields.graphql', 
    'deal.graphql',
    'dealFolders.graphql',
    'emails.graphql',
    'googleDrive.graphql',
    'lead.graphql',
    'enums.graphql', 
    'googleIntegration.graphql',
    'history.graphql', 
    'organization.graphql', 
    'person.graphql', 
    'scalars.graphql', 
    'schema.graphql', 
    'smartStickers.graphql',
    'user.graphql', 
    'user_profile.graphql',
    'wfm_definitions.graphql',
    'wfm_project.graphql',
    'task.graphql'
  ];

  // !!! --- DEBUGGING: SELECT FILES TO LOAD --- !!!
  // To debug, comment out files from this list to try and isolate the problematic one.
  // Start by commenting out half, then a quarter, etc. (binary search).
  // Example: load only a few critical files to see if the base schema works.
  const filesToLoad = [
    'scalars.graphql',
    'enums.graphql',
    'base.graphql', 
    'schema.graphql',
    'user.graphql', 
    'user_profile.graphql',
    'person.graphql', 
    'organization.graphql', 
    'deal.graphql',
    'dealFolders.graphql',
    'lead.graphql',
    'history.graphql', 
    'customFields.graphql', 
    'emails.graphql',
    'googleDrive.graphql',
    'googleIntegration.graphql',
    'smartStickers.graphql',
    'wfm_definitions.graphql',
    'wfm_project.graphql',
    'agent.graphql',
    'agentV2.graphql',
    'appSettings.graphql',
    'conversion.graphql',
    'currency.graphql',
    'calendar.graphql',
    'task.graphql',
    'businessRules.graphql',
    'notifications.graphql'
  ];

  try {
    // const files = fs.readdirSync(schemaDir); // Original way
    let typeDefs = '';
    // files.forEach(file => { // Original way
    filesToLoad.forEach(file => { // Modified to use the selective list
      // if (file.endsWith('.graphql')) { // No longer needed as filesToLoad is explicit
        typeDefs += fs.readFileSync(path.join(schemaDir, file), 'utf-8') + '\n';
      // }
    });
    console.log('Loaded schema files:', filesToLoad);
    console.log('Schema length:', typeDefs.length);
    console.log('Business rules in schema:', typeDefs.includes('businessRules'));
    // console.log('Concatenated GraphQL Schema (potentially partial if filesToLoad is modified):\n', typeDefs);
    return typeDefs;
  } catch (error: unknown) {
      console.error("Failed to load GraphQL schema files:", error);
      let message = "Unknown error loading schema";
      if (error instanceof Error) {
        message = error.message;
      }
      throw new Error(`Failed to load GraphQL schema files: ${message}`);
  }
};

const loadedTypeDefs = loadTypeDefs();

export type { GraphQLContext };

export const resolvers = {
  Query: {
    ...BaseQuery,
    // Activity resolvers removed - using Google Calendar integration instead
    ...CustomFieldQueryResolvers,
    ...WFMStatusResolvers.Query,
    ...WFMWorkflowResolvers.Query,
    ...WFMProjectTypeResolvers.Query,
    ...agentQueries,
    ...agentV2Resolvers.Query,
    ...conversionResolvers.Query,
    ...smartStickerQueries,
    ...emailQueries,
    ...driveQueries,
    ...sharedDriveQueries,
    ...appSettingsQueries,
    // Activity reminder resolvers removed - using Google Calendar integration instead
    ...currencyResolvers.Query,
    ...calendarResolvers.Query,
    ...taskResolvers.Query,
    ...businessRulesResolvers.Query,
    ...notificationQueries,
    ...PersonOrganizationRoleQueries,
  },
  Mutation: {
    ...BaseMutation,
    // Activity resolvers removed - using Google Calendar integration instead
    ...CustomFieldMutationResolvers,
    ...WFMStatusResolvers.Mutation,
    ...WFMWorkflowResolvers.Mutation,
    ...WFMProjectTypeResolvers.Mutation,
    ...agentMutations,
    ...agentV2Resolvers.Mutation,
    ...conversionResolvers.Mutation,
    ...smartStickerMutations,
    ...emailMutations,
    ...driveMutations,
    ...sharedDriveMutations,
    ...appSettingsMutations,
    ...userMutations,
    // Activity reminder resolvers removed - using Google Calendar integration instead
    ...currencyResolvers.Mutation,
    ...calendarResolvers.Mutation,
    ...taskResolvers.Mutation,
    ...businessRulesResolvers.Mutation,
    ...notificationMutations,
    ...PersonOrganizationRoleMutations,
  },
  Person: {
    ...Person,
    ...PersonEnhanced,
  },
  PersonOrganizationRole,
  PersonHistory,
  Deal: {
    ...Deal,
    ...currencyResolvers.Deal,
  },
  Lead: {
    ...Lead,
    ...currencyResolvers.Lead,
  },
  Organization,
  // Activity resolver removed - using Google Calendar integration instead
  DealHistoryEntry,
  User: UserResolver,
  CurrencyAmount: currencyResolvers.CurrencyAmount,
  WFMStatus: WFMStatusResolvers.WFMStatus,
  WFMWorkflow: WFMWorkflowResolvers.WFMWorkflow,
  WFMWorkflowStep: WFMWorkflowStepResolver,
  WFMWorkflowTransition: WFMWorkflowResolvers.WFMWorkflowTransition,
  WFMProjectType: WFMProjectTypeResolvers.WFMProjectType,
  WFMProject,
  // V2 Agent field resolvers
  AgentConversation: {
    ...agentV2Resolvers.AgentConversation,
  },
  AgentThought: {
    ...agentV2Resolvers.AgentThought,
  },
  CalendarEvent: calendarResolvers.CalendarEvent,
  // Task type resolvers
  Task: taskResolvers.Task,
  TaskDependency: taskResolvers.TaskDependency,
  TaskHistory: taskResolvers.TaskHistory,
  // Business Rules type resolvers
  BusinessRule: businessRulesResolvers.BusinessRule,
  BusinessRuleNotification: businessRulesResolvers.BusinessRuleNotification,
  RuleExecution: businessRulesResolvers.RuleExecution,
  // Notification type resolvers
  SystemNotification,
  UnifiedNotification,
}; 

const yoga = createYoga<GraphQLContext>({
  schema: createSchema({
    typeDefs: loadedTypeDefs,
    resolvers,
  }),
  context: async (initialContext): Promise<GraphQLContext> => {
    let currentUser: User | null = null;
    let token: string | null = null;
    let userPermissions: string[] | null = null;
    let clientForRequest: SupabaseClient<any, "public", any> = supabase; // Default to the global client
    
    const authHeader = initialContext.request.headers.get('authorization');
    if (authHeader?.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }

    if (token) {
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser(token);
        
        if (userError) {
          console.warn('Error fetching user from token:', userError.message);
        } else if (user) {
          currentUser = user;
          
          const authenticatedSupabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!, {
              global: { headers: { Authorization: `Bearer ${token}` } },
          });
          clientForRequest = authenticatedSupabase; // Use authenticated client for this request
          
          const { data: permissionsData, error: permissionsError } = await authenticatedSupabase.rpc('get_user_permissions', { p_user_id: user.id });

          if (permissionsError) {
            console.error('Error fetching user permissions:', permissionsError.message);
            userPermissions = null; 
          } else {
            userPermissions = Array.isArray(permissionsData) && permissionsData.every(p => typeof p === 'string') 
              ? permissionsData 
              : [];
          }
        }
      } catch (err) {
        console.error('Unexpected error during user/permission fetching:', err);
        currentUser = null;
        userPermissions = null;
      }
    }

    return {
      ...initialContext, 
      currentUser,
      token,
      userPermissions,
      supabaseClient: clientForRequest, // Provide the determined Supabase client
    };
  },
  graphqlEndpoint: '/.netlify/functions/graphql',
  healthCheckEndpoint: '/.netlify/functions/graphql/health',
  landingPage: process.env.NODE_ENV !== 'production',
  plugins: [
    {
      onParams({ params }) {
        // console.log('[Yoga onParams] Received parameters:', JSON.stringify(params, null, 2));
      }
    } as Plugin
  ]
});

export const handler: Handler = async (event, _: HandlerContext) => {
  try {
    const url = new URL(event.path, `http://${event.headers.host || 'localhost'}`);

  const response = await yoga.fetch(
      url,
    {
      method: event.httpMethod,
      headers: event.headers as HeadersInit,
      body: event.body ? Buffer.from(event.body, event.isBase64Encoded ? 'base64' : 'utf8') : undefined,
      }
  );

  const responseHeaders: { [key: string]: string } = {};
  response.headers.forEach((value, key) => {
    responseHeaders[key] = value;
  });

  return {
    statusCode: response.status,
    headers: responseHeaders,
    body: await response.text(),
      isBase64Encoded: false,
    };
  } catch (error: unknown) {
    console.error("Error in GraphQL handler:", error);
    let message = "Internal Server Error";
    if (error instanceof Error) {
      message = error.message;
    } else if (typeof error === 'string') {
      message = error;
    } else if (typeof error === 'object' && error !== null && 'message' in error && typeof (error as {message: unknown}).message === 'string') {
      message = (error as {message: string}).message;
    }
    return {
      statusCode: 500,
      body: JSON.stringify({ message }),
      headers: { "Content-Type": "application/json" },
    };
  }
}; 