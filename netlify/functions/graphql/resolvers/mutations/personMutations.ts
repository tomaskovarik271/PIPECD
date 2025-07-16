import { GraphQLError } from 'graphql';
import { GraphQLContext, requireAuthentication, getAccessToken, processZodError } from '../../helpers'; // Adjusted path
import { PersonCreateSchema, PersonUpdateSchema } from '../../validators'; // Adjusted path
import { inngest } from '../../../../../lib/inngestClient'; // Adjusted path
import { personService } from '../../../../../lib/personService'; // Adjusted path
import type { MutationResolvers } from '../../../../../lib/generated/graphql'; // Adjusted path

export const personMutations: Pick<MutationResolvers<GraphQLContext>, 'createPerson' | 'updatePerson' | 'deletePerson'> = {
    createPerson: async (_parent, args, context) => {
      console.log('[Mutation.createPerson] received input:', args.input);
      const action = 'creating person';
      try {
          requireAuthentication(context);
          const userId = context.currentUser!.id;
          const accessToken = getAccessToken(context)!;

          const validatedInput = PersonCreateSchema.parse(args.input);
          console.log('[Mutation.createPerson] validated input:', validatedInput);

          if (!context.userPermissions?.includes('person:create')) {
              throw new GraphQLError('Forbidden', { extensions: { code: 'FORBIDDEN' } });
          }

          const newPersonRecord = await personService.createPerson(userId, validatedInput, accessToken);
          console.log('[Mutation.createPerson] successfully created:', newPersonRecord.id);

          inngest.send({
            name: 'crm/person.created',
            data: { person: newPersonRecord as any },
            user: { id: userId, email: context.currentUser!.email! }
          }).catch((err: unknown) => console.error('Failed to send person.created event to Inngest:', err));
          
          return {
            id: newPersonRecord.id,
            created_at: newPersonRecord.created_at,
            updated_at: newPersonRecord.updated_at,
            user_id: newPersonRecord.user_id,
            first_name: newPersonRecord.first_name,
            last_name: newPersonRecord.last_name,
            email: newPersonRecord.email,
            phone: newPersonRecord.phone,
            notes: newPersonRecord.notes,
            job_title: newPersonRecord.job_title,
            organization_id: newPersonRecord.organization_id,
            db_custom_field_values: (newPersonRecord as any).custom_field_values,
          } as any;
      } catch (error) {
          throw processZodError(error, action);
      }
    },
    updatePerson: async (_parent, args, context) => {
      // console.log('[Mutation.updatePerson] received id:', args.id, 'input:', args.input);
      const action = 'updating person';
      try {
          requireAuthentication(context);
          const userId = context.currentUser!.id;
          const accessToken = getAccessToken(context)!;

          const validatedInput = PersonUpdateSchema.parse(args.input);
          // console.log('[Mutation.updatePerson] validated input:', validatedInput);
          
          if (!context.userPermissions?.includes('person:update_any')) {
               throw new GraphQLError('Forbidden', { extensions: { code: 'FORBIDDEN' } });
          }
          
          if (Object.keys(validatedInput).length === 0) {
             throw new GraphQLError('Update input cannot be empty.', { extensions: { code: 'BAD_USER_INPUT' } });
          }

          const updatedPersonRecord = await personService.updatePerson(userId, args.id, validatedInput, accessToken);
          // console.log('[Mutation.updatePerson] successfully updated:', updatedPersonRecord.id);

          inngest.send({ 
            name: 'crm/person.updated',
            data: { person: updatedPersonRecord as any },
            user: { id: userId, email: context.currentUser!.email! }
          }).catch((err: unknown) => console.error('Failed to send person.updated event to Inngest:', err));
          
          return {
            id: updatedPersonRecord.id,
            created_at: updatedPersonRecord.created_at,
            updated_at: updatedPersonRecord.updated_at,
            user_id: updatedPersonRecord.user_id,
            first_name: updatedPersonRecord.first_name,
            last_name: updatedPersonRecord.last_name,
            email: updatedPersonRecord.email,
            phone: updatedPersonRecord.phone,
            notes: updatedPersonRecord.notes,
            job_title: updatedPersonRecord.job_title,
            organization_id: updatedPersonRecord.organization_id,
            db_custom_field_values: (updatedPersonRecord as any).custom_field_values,
          } as any;
      } catch (error) {
          throw processZodError(error, action);
      }
    },
    deletePerson: async (_parent, args, context) => {
      console.log('[Mutation.deletePerson] received id:', args.id);
      const action = 'deleting person';
      try {
          requireAuthentication(context);
          const userId = context.currentUser!.id;
          const accessToken = getAccessToken(context)!;
          
          if (!context.userPermissions?.includes('person:delete_any')) {
              throw new GraphQLError('Forbidden', { extensions: { code: 'FORBIDDEN' } });
          }
          
          const success = await personService.deletePerson(userId, args.id, accessToken);
          console.log('[Mutation.deletePerson] success status:', success);
          
          if (success) {
            inngest.send({ 
              name: 'crm/person.deleted',
              data: { personId: args.id },
              user: { id: userId, email: context.currentUser!.email! }
            }).catch((err: unknown) => console.error('Failed to send person.deleted event to Inngest:', err));
          }
          
          return success;
      } catch (error) {
          throw processZodError(error, action);
      }
    },
}; 