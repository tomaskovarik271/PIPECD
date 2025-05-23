import type { User as GraphQLUser, WfmProjectResolvers, WfmProject as GraphQLWfmProject, WfmProjectType as GraphQLWfmProjectType, WfmWorkflow as GraphQLWfmWorkflow, WfmWorkflowStep as GraphQLWfmWorkflowStep } from '../../../../lib/generated/graphql';
import type { GraphQLContext } from '../helpers';
import { wfmProjectTypeService } from '../../../../lib/wfmProjectTypeService';
import { wfmWorkflowService } from '../../../../lib/wfmWorkflowService';
import { GraphQLError } from 'graphql';
import { getServiceLevelUserProfileData, ServiceLevelUserProfile } from '../../../../lib/userProfileService';
// wfmWorkflowService also contains getStepById used for WFMWorkflowStep

// Placeholder for userService - replace with actual import and implementation
const userService = {
  getUserById: async (id: string, _context?: GraphQLContext): Promise<GraphQLUser | null> => {
    console.warn(`[userService.getUserById] STUB CALLED for ID: ${id}. Implement actual service.`);
    return null;
  }
};

// The parent type represents the raw data object that these resolvers will receive.
// This typically comes from a database query or a parent resolver that fetched the basic WFMProject data.
interface RawWfmProjectData {
  id: string;
  project_type_id: string;
  workflow_id: string;
  current_step_id: string | null;
  created_by_user_id: string | null;
  updated_by_user_id: string | null;
  completed_by_user_id: string | null;
  // Include any other scalar fields from wfm_projects table that GraphQLWfmProject type expects
  name: string;
  description: string | null;
  completedAt: Date | string | null; // Adjust based on what DB returns vs GQL expects
  isActive: boolean;
  metadata: any | null; // JSON
  createdAt: Date | string; // Adjust
  updatedAt: Date | string; // Adjust
}

// Helper to map ServiceLevelUserProfile to GraphQLUser
const mapServiceUserProfileToGraphQLUser = (serviceProfile: ServiceLevelUserProfile | null): GraphQLUser | null => {
  if (!serviceProfile) return null;
  return {
    id: serviceProfile.user_id, // GraphQL User type expects 'id', service has 'user_id'
    email: serviceProfile.email,
    display_name: serviceProfile.display_name,
    avatar_url: serviceProfile.avatar_url,
  };
};

export const WFMProject: WfmProjectResolvers<GraphQLContext> = {
  projectType: async (parentObj, _args, context): Promise<GraphQLWfmProjectType> => {
    const parent = parentObj as unknown as RawWfmProjectData;
    console.log(`[Resolver.WFMProject.projectType] for project ID ${parent.id}, resolving project_type_id: ${parent.project_type_id}`);
    if (!parent.project_type_id) {
        const msg = `[Resolver.WFMProject.projectType] project_type_id missing for project ${parent.id}`;
        console.error(msg);
        throw new GraphQLError(msg, { extensions: { code: 'INTERNAL_SERVER_ERROR' } });
    }
    try {
        const projectType = await wfmProjectTypeService.getById(parent.project_type_id, context);
        if (!projectType) {
            const msg = `[Resolver.WFMProject.projectType] ProjectType not found for ID: ${parent.project_type_id} (Project ID: ${parent.id})`;
            console.error(msg);
            throw new GraphQLError(msg, { extensions: { code: 'NOT_FOUND' } });
        }
        return projectType;
    } catch (error: any) {
        console.error(`[Resolver.WFMProject.projectType] Error fetching ProjectType ID ${parent.project_type_id} for project ${parent.id}:`, error);
        throw new GraphQLError(error.message || 'Error fetching project type', { extensions: { code: 'INTERNAL_SERVER_ERROR' }, originalError: error });
    }
  },
  workflow: async (parentObj, _args, context): Promise<GraphQLWfmWorkflow> => {
    const parent = parentObj as unknown as RawWfmProjectData;
    console.log(`[Resolver.WFMProject.workflow] for project ID ${parent.id}, resolving workflow_id: ${parent.workflow_id}`);
    if (!parent.workflow_id) {
        const msg = `[Resolver.WFMProject.workflow] workflow_id missing for project ${parent.id}`;
        console.error(msg);
        throw new GraphQLError(msg, { extensions: { code: 'INTERNAL_SERVER_ERROR' } });
    }
    try {
        const workflow = await wfmWorkflowService.getById(parent.workflow_id, context);
        if (!workflow) {
            const msg = `[Resolver.WFMProject.workflow] Workflow not found for ID: ${parent.workflow_id} (Project ID: ${parent.id})`;
            console.error(msg);
            throw new GraphQLError(msg, { extensions: { code: 'NOT_FOUND' } });
        }
        return workflow;
    } catch (error: any) {
        console.error(`[Resolver.WFMProject.workflow] Error fetching Workflow ID ${parent.workflow_id} for project ${parent.id}:`, error);
        throw new GraphQLError(error.message || 'Error fetching workflow', { extensions: { code: 'INTERNAL_SERVER_ERROR' }, originalError: error });
    }
  },
  currentStep: async (parentObj, _args, context): Promise<GraphQLWfmWorkflowStep | null> => {
    const parent = parentObj as unknown as RawWfmProjectData;
    console.log(`[Resolver.WFMProject.currentStep] for project ID ${parent.id}, resolving current_step_id: ${parent.current_step_id}`);
    if (!parent.current_step_id) {
      return null; 
    }
    try {
        const step = await wfmWorkflowService.getStepById(parent.current_step_id, context);
        if (!step) {
            // console.warn because current_step_id might be stale if a step was deleted, or it might be an actual issue.
            console.warn(`[Resolver.WFMProject.currentStep] Step not found for ID: ${parent.current_step_id} (Project ID: ${parent.id})`);
            return null; // Return null if step not found, as field is nullable
        }
        return step as unknown as GraphQLWfmWorkflowStep;
    } catch (error: any) {
        console.error(`[Resolver.WFMProject.currentStep] Error fetching Step ID ${parent.current_step_id} for project ${parent.id}:`, error);
        // Do not throw for nullable fields if the error is just "not found" implicitly, but log it.
        // If it's a more severe error, it might be appropriate to throw.
        return null; 
    }
  },
  createdBy: async (parentObj, _args, _context): Promise<GraphQLUser | null> => { // context might not be needed by getServiceLevelUserProfileData if it uses admin client
    const parent = parentObj as unknown as RawWfmProjectData;
    console.log(`[Resolver.WFMProject.createdBy] for project ID ${parent.id}, resolving created_by_user_id: ${parent.created_by_user_id}`);
    if (!parent.created_by_user_id) return null;
    try {
        const userProfile = await getServiceLevelUserProfileData(parent.created_by_user_id); 
        if (!userProfile) console.warn(`[Resolver.WFMProject.createdBy] UserProfile not found for ID: ${parent.created_by_user_id}`);
        return mapServiceUserProfileToGraphQLUser(userProfile);
    } catch (error) {
        console.error(`[Resolver.WFMProject.createdBy] Error fetching User ID ${parent.created_by_user_id} for project ${parent.id}:`, error);
        return null; 
    }
  },
  updatedBy: async (parentObj, _args, _context): Promise<GraphQLUser | null> => {
    const parent = parentObj as unknown as RawWfmProjectData;
    console.log(`[Resolver.WFMProject.updatedBy] for project ID ${parent.id}, resolving updated_by_user_id: ${parent.updated_by_user_id}`);
    if (!parent.updated_by_user_id) return null;
    try {
        const userProfile = await getServiceLevelUserProfileData(parent.updated_by_user_id);
        if (!userProfile) console.warn(`[Resolver.WFMProject.updatedBy] UserProfile not found for ID: ${parent.updated_by_user_id}`);
        return mapServiceUserProfileToGraphQLUser(userProfile);
    } catch (error) {
        console.error(`[Resolver.WFMProject.updatedBy] Error fetching User ID ${parent.updated_by_user_id} for project ${parent.id}:`, error);
        return null;
    }
  },
  completedBy: async (parentObj, _args, _context): Promise<GraphQLUser | null> => {
    const parent = parentObj as unknown as RawWfmProjectData;
    console.log(`[Resolver.WFMProject.completedBy] for project ID ${parent.id}, resolving completed_by_user_id: ${parent.completed_by_user_id}`);
    if (!parent.completed_by_user_id) return null;
    try {
        const userProfile = await getServiceLevelUserProfileData(parent.completed_by_user_id);
        if (!userProfile) console.warn(`[Resolver.WFMProject.completedBy] UserProfile not found for ID: ${parent.completed_by_user_id}`);
        return mapServiceUserProfileToGraphQLUser(userProfile);
    } catch (error) {
        console.error(`[Resolver.WFMProject.completedBy] Error fetching User ID ${parent.completed_by_user_id} for project ${parent.id}:`, error);
        return null;
    }
  },
  // Scalar fields like id, name, description, isActive, metadata, createdAt, updatedAt, completedAt
  // are typically resolved by the default resolver if the parent object (RawWfmProjectData)
  // has properties with the same names and compatible types.
  // Ensure RawWfmProjectData includes all scalar fields from the wfm_projects table
  // that are defined in the GraphQLWfmProject type, with correct naming (camelCase vs snake_case) if necessary.
  // For example, if DB has `created_at` and GQL has `createdAt`, a simple resolver might be needed if default doesn't map.
  // However, wfmProjectService.getWFMProjectById returns `*`, so names should match DB (snake_case generally).
  // If GQL types expect camelCase for dates (e.g. `createdAt: DateTime!`), then mappers or specific resolvers are needed for those scalars too.
  // For now, assuming default resolver handles matching scalar names, or the service layer maps them.
}; 