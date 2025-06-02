/**
 * Contacts Domain Module for PipeCD AI Agent
 * 
 * Refactored to use existing PipeCD personService infrastructure
 * instead of duplicating GraphQL operations and business logic.
 */

import type { ToolResult, ToolExecutionContext } from '../../types/tools';
import { personService } from '../../../personService';
import { PersonAdapter, type AIContactSearchParams, type AICreateContactParams, type AIUpdateContactParams } from '../../adapters/PersonAdapter';

export class ContactsModule {
  /**
   * Search and filter contacts using existing personService
   */
  async searchContacts(
    params: AIContactSearchParams,
    context: ToolExecutionContext
  ): Promise<ToolResult> {
    try {
      if (!context.userId || !context.authToken) {
        return PersonAdapter.createErrorResult('search_contacts', new Error('Authentication required'), params);
      }

      // Use existing personService to get all people
      const allPeople = await personService.getPeople(
        context.userId,
        context.authToken
      );

      // Apply AI-specific filtering and sorting
      const filteredPeople = PersonAdapter.applySearchFilters(allPeople, params);

      // Return formatted result
      return PersonAdapter.createSearchResult(filteredPeople, params);

    } catch (error) {
      return PersonAdapter.createErrorResult('search_contacts', error, params);
    }
  }

  /**
   * Get comprehensive contact details using existing personService
   */
  async getContactDetails(
    params: { contact_id: string },
    context: ToolExecutionContext
  ): Promise<ToolResult> {
    try {
      if (!context.userId || !context.authToken) {
        return PersonAdapter.createErrorResult('get_contact_details', new Error('Authentication required'), params);
      }

      const person = await personService.getPersonById(
        context.userId,
        params.contact_id,
        context.authToken
      );

      if (!person) {
        return PersonAdapter.createErrorResult(
          'get_contact_details', 
          new Error(`Contact with ID ${params.contact_id} not found`), 
          params
        );
      }

      return PersonAdapter.createDetailsResult(person, params);

    } catch (error) {
      return PersonAdapter.createErrorResult('get_contact_details', error, params);
    }
  }

  /**
   * Create a new contact using existing personService with validation and events
   */
  async createContact(
    params: AICreateContactParams,
    context: ToolExecutionContext
  ): Promise<ToolResult> {
    try {
      if (!context.userId || !context.authToken) {
        return PersonAdapter.createErrorResult('create_contact', new Error('Authentication required'), params);
      }

      // Convert AI parameters to service format
      const personInput = PersonAdapter.toPersonInput(params);

      // Use existing personService (includes validation, auth, events)
      const newPerson = await personService.createPerson(
        context.userId,
        personInput,
        context.authToken
      );

      return PersonAdapter.createCreateResult(newPerson, params);

    } catch (error) {
      return PersonAdapter.createErrorResult('create_contact', error, params);
    }
  }

  /**
   * Update existing contact using existing personService with validation and events
   */
  async updateContact(
    params: AIUpdateContactParams,
    context: ToolExecutionContext
  ): Promise<ToolResult> {
    try {
      if (!context.userId || !context.authToken) {
        return PersonAdapter.createErrorResult('update_contact', new Error('Authentication required'), params);
      }

      // Convert AI parameters to service format
      const personUpdateInput = PersonAdapter.toPersonUpdateInput(params);

      // Use existing personService (includes validation, auth, events)
      const updatedPerson = await personService.updatePerson(
        context.userId,
        params.contact_id,
        personUpdateInput,
        context.authToken
      );

      return PersonAdapter.createUpdateResult(updatedPerson, params);

    } catch (error) {
      return PersonAdapter.createErrorResult('update_contact', error, params);
    }
  }
} 