/**
 * Organizations Domain Module for PipeCD AI Agent
 * 
 * Refactored to use existing PipeCD organizationService infrastructure
 * instead of duplicating GraphQL operations and business logic.
 */

import type { ToolResult, ToolExecutionContext } from '../../types/tools';
import { organizationService } from '../../../organizationService';
import { OrganizationAdapter, type AIOrganizationSearchParams, type AICreateOrganizationParams, type AIUpdateOrganizationParams } from '../../adapters/OrganizationAdapter';

export class OrganizationsModule {
  /**
   * Search and filter organizations using existing organizationService
   */
  async searchOrganizations(
    params: AIOrganizationSearchParams,
    context: ToolExecutionContext
  ): Promise<ToolResult> {
    try {
      if (!context.userId || !context.authToken) {
        return OrganizationAdapter.createErrorResult(
          'search_organizations',
          new Error('Authentication required'),
          params
        );
      }

      // Get all organizations using existing service
      const allOrganizations = await organizationService.getOrganizations(
        context.userId,
        context.authToken
      );

      // Apply AI-specific search filtering
      const filteredOrganizations = OrganizationAdapter.applySearchFilters(allOrganizations, params);

      // Format for AI display
      const formattedMessage = OrganizationAdapter.formatOrganizationList(filteredOrganizations);

      return {
        success: true,
        data: filteredOrganizations,
        message: formattedMessage,
        metadata: {
          toolName: 'search_organizations',
          parameters: params,
          timestamp: new Date().toISOString(),
          executionTime: 0,
        },
      };
    } catch (error) {
      return OrganizationAdapter.createErrorResult('search_organizations', error, params);
    }
  }

  /**
   * Get comprehensive organization details using existing organizationService
   */
  async getOrganizationDetails(
    params: { organization_id: string },
    context: ToolExecutionContext
  ): Promise<ToolResult> {
    try {
      if (!context.userId || !context.authToken) {
        return OrganizationAdapter.createErrorResult(
          'get_organization_details',
          new Error('Authentication required'),
          params
        );
      }

      // Get organization details using existing service
      const organization = await organizationService.getOrganizationById(
        context.userId,
        params.organization_id,
        context.authToken
      );

      if (!organization) {
        return OrganizationAdapter.createErrorResult(
          'get_organization_details',
          new Error(`Organization with ID ${params.organization_id} not found`),
          params
        );
      }

      // Format for AI display
      const formattedMessage = OrganizationAdapter.formatOrganizationDetails(organization);

      return {
        success: true,
        data: organization,
        message: formattedMessage,
        metadata: {
          toolName: 'get_organization_details',
          parameters: params,
          timestamp: new Date().toISOString(),
          executionTime: 0,
        },
      };
    } catch (error) {
      return OrganizationAdapter.createErrorResult('get_organization_details', error, params);
    }
  }

  /**
   * Create a new organization using existing organizationService
   */
  async createOrganization(
    params: AICreateOrganizationParams,
    context: ToolExecutionContext
  ): Promise<ToolResult> {
    try {
      if (!context.userId || !context.authToken) {
        return OrganizationAdapter.createErrorResult(
          'create_organization',
          new Error('Authentication required'),
          params
        );
      }

      // Convert AI parameters to service input
      const organizationInput = OrganizationAdapter.toOrganizationInput(params);

      // Create organization using existing service
      const newOrganization = await organizationService.createOrganization(
        context.userId,
        organizationInput,
        context.authToken
      );

      // Format success message for AI
      const formattedMessage = OrganizationAdapter.formatCreationSuccess(newOrganization);

      return {
        success: true,
        data: newOrganization,
        message: formattedMessage,
        metadata: {
          toolName: 'create_organization',
          parameters: params,
          timestamp: new Date().toISOString(),
          executionTime: 0,
        },
      };
    } catch (error) {
      return OrganizationAdapter.createErrorResult('create_organization', error, params);
    }
  }

  /**
   * Update existing organization using existing organizationService
   */
  async updateOrganization(
    params: AIUpdateOrganizationParams,
    context: ToolExecutionContext
  ): Promise<ToolResult> {
    try {
      if (!context.userId || !context.authToken) {
        return OrganizationAdapter.createErrorResult(
          'update_organization',
          new Error('Authentication required'),
          params
        );
      }

      // Convert AI parameters to service input (excluding the ID)
      const { organization_id, ...updateData } = params;
      const organizationInput = OrganizationAdapter.toOrganizationInput(updateData as AICreateOrganizationParams);

      // Update organization using existing service
      const updatedOrganization = await organizationService.updateOrganization(
        context.userId,
        organization_id,
        organizationInput,
        context.authToken
      );

      const formattedMessage = `✅ **Organization Updated Successfully!**

**${updatedOrganization.name}**
- **Organization ID:** ${updatedOrganization.id}
- **Last Updated:** ${new Date(updatedOrganization.updated_at).toLocaleDateString()}

All changes have been saved to the organization record.`;

      return {
        success: true,
        data: updatedOrganization,
        message: formattedMessage,
        metadata: {
          toolName: 'update_organization',
          parameters: params,
          timestamp: new Date().toISOString(),
          executionTime: 0,
        },
      };
    } catch (error) {
      return OrganizationAdapter.createErrorResult('update_organization', error, params);
    }
  }
} 