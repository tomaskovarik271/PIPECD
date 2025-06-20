import { ToolDefinition, ToolExecutor, ToolExecutionContext } from './ToolRegistry';
import { personService } from '../../personService';
import { PersonInput, Person } from '../../generated/graphql';

interface CreatePersonParams {
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  organization_id?: string;
  notes?: string;
}

export class CreatePersonTool implements ToolExecutor {
  static definition: ToolDefinition = {
    name: 'create_person',
    description: 'Create a new person/contact with intelligent duplicate detection and organization linking',
    input_schema: {
      type: 'object',
      properties: {
        first_name: {
          type: 'string',
          description: 'First name of the person (optional but recommended)'
        },
        last_name: {
          type: 'string', 
          description: 'Last name of the person (optional but recommended)'
        },
        email: {
          type: 'string',
          description: 'Email address (optional) - will be checked for duplicates'
        },
        phone: {
          type: 'string',
          description: 'Phone number (optional) - will be auto-formatted'
        },
        organization_id: {
          type: 'string',
          description: 'Organization ID to link this person to (optional)'
        },
        notes: {
          type: 'string',
          description: 'Additional notes about the person (optional)'
        }
      },
      required: []
    }
  };

  async execute(params: CreatePersonParams, context?: ToolExecutionContext): Promise<any> {
    try {
      if (!context?.authToken || !context?.userId) {
        throw new Error('Authentication required for person creation');
      }

      const { first_name, last_name, email, phone, organization_id, notes } = params;

      // Validate that at least one meaningful field is provided
      if (!first_name && !last_name && !email) {
        throw new Error('At least first name, last name, or email is required');
      }

      // 1. COGNITIVE DUPLICATE DETECTION - Check for existing people
      console.log(`[CreatePersonTool] Checking for existing person with email: "${email}"`);
      
      if (email) {
        const existingPeople = await personService.getPeople(context.userId, context.authToken);
        
        // Check for exact email match
        const exactEmailMatch = existingPeople.find((person: Person) => 
          person.email?.toLowerCase() === email.toLowerCase()
        );
        
        if (exactEmailMatch) {
          return {
            success: false,
            error: 'DUPLICATE_PERSON',
            message: `❌ Person with email "${email}" already exists`,
            existing_person: {
              id: exactEmailMatch.id,
              first_name: exactEmailMatch.first_name,
              last_name: exactEmailMatch.last_name,
              email: exactEmailMatch.email,
              phone: exactEmailMatch.phone,
              created_at: exactEmailMatch.created_at
            },
            suggestion: `Use existing person ID: ${exactEmailMatch.id} or use a different email address`
          };
        }

        // Check for similar name combinations (if names provided)
        if (first_name || last_name) {
          const nameMatches = existingPeople.filter((person: Person) => {
            const personFirstName = person.first_name?.toLowerCase() || '';
            const personLastName = person.last_name?.toLowerCase() || '';
            const inputFirstName = first_name?.toLowerCase() || '';
            const inputLastName = last_name?.toLowerCase() || '';
            
            return (inputFirstName && personFirstName.includes(inputFirstName)) ||
                   (inputLastName && personLastName.includes(inputLastName)) ||
                   (inputFirstName && personLastName.includes(inputFirstName)) ||
                   (inputLastName && personFirstName.includes(inputLastName));
          });

          if (nameMatches.length > 0) {
            console.log(`[CreatePersonTool] Found ${nameMatches.length} similar name matches`);
          }
        }
      }

      // 2. PHONE NUMBER FORMATTING
      let processedPhone = phone;
      if (phone) {
        // Basic phone formatting - remove non-digits and format
        const digitsOnly = phone.replace(/\D/g, '');
        if (digitsOnly.length === 10) {
          processedPhone = `(${digitsOnly.slice(0,3)}) ${digitsOnly.slice(3,6)}-${digitsOnly.slice(6)}`;
        } else if (digitsOnly.length === 11 && digitsOnly.startsWith('1')) {
          processedPhone = `+1 (${digitsOnly.slice(1,4)}) ${digitsOnly.slice(4,7)}-${digitsOnly.slice(7)}`;
        }
      }

      // 3. SERVICE LAYER INTEGRATION (Direct service call, not GraphQL)
      console.log(`[CreatePersonTool] Creating person with service layer`);
      
      const personInput: PersonInput = {
        first_name: first_name || null,
        last_name: last_name || null,
        email: email || null,
        phone: processedPhone || null,
        organization_id: organization_id || null,
        notes: notes || null
      };

      const newPerson = await personService.createPerson(
        context.userId,
        personInput,
        context.authToken
      );

      // 4. SUCCESS VALIDATION & STRUCTURED RESPONSE
      const success = !!(newPerson && newPerson.id);
      
      const fullName = [first_name, last_name].filter(Boolean).join(' ') || 'Unnamed Person';
      
      return {
        success,
        person: newPerson,
        message: `✅ Successfully created person "${fullName}"`,
        details: {
          id: newPerson.id,
          full_name: fullName,
          first_name: newPerson.first_name || 'Not specified',
          last_name: newPerson.last_name || 'Not specified',
          email: newPerson.email || 'Not specified',
          phone: newPerson.phone || 'Not specified',
          organization_linked: !!organization_id,
          created_at: newPerson.created_at,
          phone_auto_formatted: phone !== processedPhone
        }
      };

    } catch (error: any) {
      console.error('[CreatePersonTool] Error:', error);
      
      return {
        success: false,
        error: error.code || 'CREATION_FAILED',
        message: `❌ Failed to create person: ${error.message}`,
        details: {
          error_type: error.name || 'Unknown',
          error_code: error.code || 'UNKNOWN_ERROR'
        }
      };
    }
  }
} 