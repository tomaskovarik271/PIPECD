import type { MutationResolvers } from '../../../../../lib/generated/graphql';
import type { GraphQLContext } from '../../helpers';
import { requireAuthentication } from '../../helpers';
import { emailService } from '../../../../../lib/emailService';
import type { EmailMessage as ServiceEmailMessage } from '../../../../../lib/emailService';
import type { EmailMessage as GraphQLEmailMessage, EmailImportance } from '../../../../../lib/generated/graphql';
import Anthropic from '@anthropic-ai/sdk';

// Helper function to convert service types to GraphQL types
function convertEmailMessageToGraphQL(message: ServiceEmailMessage): GraphQLEmailMessage {
  return {
    ...message,
    importance: message.importance as EmailImportance,
    attachments: message.attachments || null,
    cc: message.cc || null,
    bcc: message.bcc || null,
    htmlBody: message.htmlBody || null,
    labels: message.labels || null,
  };
}

// Helper function to parse email contact information
function parseEmailContact(emailString: string): {
  email: string;
  name?: string;
  firstName?: string;
  lastName?: string;
} {
  const match = emailString.match(/^(.+?)\s*<(.+?)>$/) || [null, null, emailString];
  const name = match[1]?.trim();
  const email = match[2]?.trim() || emailString.trim();
  
  if (name) {
    const nameParts = name.split(' ');
    return {
      email,
      name,
      firstName: nameParts[0],
      lastName: nameParts.slice(1).join(' ') || undefined
    };
  }
  
  return { email };
}

// Enhanced Claude 3 Haiku integration for email-to-task content generation
const generateTaskContentFromEmail = async (
  emailMessage: any, 
  emailThread?: any, 
  useWholeThread: boolean = false
): Promise<{ subject: string; description: string; suggestedDueDate?: string; confidence: number; emailScope: string; sourceContent: string }> => {
  const anthropicApiKey = process.env.ANTHROPIC_API_KEY;
  
  // Determine what content to analyze
  const emailScope = useWholeThread && emailThread ? 'thread' : 'message';
  let sourceContent = '';
  let analysisContent = '';
  
  if (useWholeThread && emailThread?.messages?.length > 0) {
    // Analyze the entire thread
    sourceContent = emailThread.messages.map((msg: any) => 
      `From: ${msg.from}\nTo: ${msg.to?.join(', ')}\nDate: ${msg.timestamp}\nSubject: ${msg.subject}\n\n${msg.body}`
    ).join('\n\n---\n\n');
    analysisContent = `Email Thread (${emailThread.messages.length} messages):\n\n${sourceContent}`;
  } else {
    // Analyze just the single message
    sourceContent = `From: ${emailMessage.from}\nTo: ${emailMessage.to?.join(', ')}\nDate: ${emailMessage.timestamp}\nSubject: ${emailMessage.subject}\n\n${emailMessage.body}`;
    analysisContent = `Email Message:\n\n${sourceContent}`;
  }
  
  if (!anthropicApiKey) {
    // Enhanced fallback with better content extraction
    const fallbackSubject = useWholeThread 
      ? `Follow up on email thread: ${emailMessage.subject}`
      : `Follow up: ${emailMessage.subject}`;
    
    const fallbackDescription = `Task created from ${emailScope}:\n\n${sourceContent}`;
    
    return {
      subject: fallbackSubject,
      description: fallbackDescription,
      confidence: 0.7,
      emailScope,
      sourceContent
    };
  }

  // Define fallback values for use in try/catch
  const fallbackSubject = useWholeThread 
    ? `Follow up on email thread: ${emailMessage.subject}`
    : `Follow up: ${emailMessage.subject}`;
  
  const fallbackDescription = `Task created from ${emailScope}:\n\n${sourceContent}`;

  try {
    const client = new Anthropic({ apiKey: anthropicApiKey });
    
    const prompt = `You are helping to convert email content into a task. Based on the ${emailScope} content below, generate a clear task subject and description.

${analysisContent}

Please analyze this ${emailScope} and provide:
1. A clear, actionable task subject (max 100 characters)
2. A detailed task description that includes:
   - What specific action needs to be taken
   - Key context from the ${emailScope}
   - Email metadata (sender, date, participants if thread)
   - Any deadlines or urgency mentioned
   - Summary of the conversation if analyzing a thread
3. Suggested due date if any deadline is mentioned (format: YYYY-MM-DD)

Format your response as JSON:
{
  "subject": "Clear actionable task title",
  "description": "Detailed task description with context and next steps",
  "suggestedDueDate": "YYYY-MM-DD or null if no deadline mentioned",
  "confidence": 0.0-1.0
}`;

    const response = await client.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 1500,
      temperature: 0.3,
      messages: [{ role: 'user', content: prompt }]
    });

    if (response.content && response.content[0] && response.content[0].type === 'text') {
      try {
        const parsed = JSON.parse(response.content[0].text);
        return {
          subject: parsed.subject || fallbackSubject,
          description: parsed.description || fallbackDescription,
          suggestedDueDate: parsed.suggestedDueDate,
          confidence: parsed.confidence || 0.8,
          emailScope,
          sourceContent
        };
      } catch (parseError) {
        console.warn('Failed to parse Claude response, using fallback');
      }
    }
  } catch (error) {
    console.warn('Claude API call failed, using fallback:', error);
  }

  // Fallback if Claude call fails
  return {
    subject: fallbackSubject,
    description: fallbackDescription,
    confidence: 0.7,
    emailScope,
    sourceContent
  };
};

export const emailMutations: MutationResolvers<GraphQLContext> = {
  composeEmail: async (_, { input }, context) => {
    const { userId, accessToken } = requireAuthentication(context);

    try {
      const emailMessage = await emailService.composeEmail(userId, accessToken, {
        to: input.to,
        cc: input.cc || [],
        bcc: input.bcc || [],
        subject: input.subject,
        body: input.body,
        attachments: input.attachments || [],
        dealId: input.dealId || undefined,
        entityType: input.entityType || undefined,
        entityId: input.entityId || undefined,
        threadId: input.threadId || undefined,
      });

      return convertEmailMessageToGraphQL(emailMessage);
    } catch (error) {
      console.error('Error composing email:', error);
      throw new Error('Failed to send email');
    }
  },

  markThreadAsRead: async (_, { threadId }, context) => {
    const { userId, accessToken } = requireAuthentication(context);

    try {
      return await emailService.markThreadAsRead(userId, accessToken, threadId);
    } catch (error) {
      console.error('Error marking thread as read:', error);
      return false;
    }
  },

  markThreadAsUnread: async (_, { threadId }, context) => {
    const { userId, accessToken } = requireAuthentication(context);

    try {
      return await emailService.markThreadAsUnread(userId, accessToken, threadId);
    } catch (error) {
      console.error('Error marking thread as unread:', error);
      return false;
    }
  },

  archiveThread: async (_, { threadId }, context) => {
    const { userId } = requireAuthentication(context);

    try {
      // Archive thread by removing from inbox
      // This would be implemented in the email service
      console.log(`Archiving thread ${threadId} for user ${userId}`);
      return true;
    } catch (error) {
      console.error('Error archiving thread:', error);
      return false;
    }
  },

  // createTaskFromEmail removed - using Google Calendar integration instead

  generateTaskContentFromEmail: async (_, { input }, context) => {
    const { userId, accessToken } = requireAuthentication(context);

    try {
      // Get the email message to extract context
      const emailMessage = await emailService.getEmailMessage(userId, accessToken, input.emailId);
      if (!emailMessage) {
        throw new Error('Email not found');
      }

      // Get email thread if needed for context
      let emailThread = null;
      if (input.useWholeThread && input.threadId) {
        emailThread = await emailService.getEmailThread(userId, accessToken, input.threadId);
      }

      // Generate intelligent task content using Claude 3 Haiku
      const generatedContent = await generateTaskContentFromEmail(
        emailMessage, 
        emailThread, 
        input.useWholeThread
      );

      return generatedContent;
    } catch (error) {
      console.error('Error generating task content from email:', error);
      throw new Error('Failed to generate task content from email');
    }
  },

  linkEmailToDeal: async (_, { emailId, dealId }, context) => {
    const { userId } = requireAuthentication(context);
    const { supabaseClient } = context;

    try {
      // Store the email-deal association in the database
      const { error } = await supabaseClient
        .from('emails')
        .upsert({
          email_id: emailId,
          entity_type: 'DEAL',
          entity_id: dealId,
          user_id: userId,
          linked_at: new Date().toISOString(),
        });

      if (error) {
        console.error('Error linking email to deal:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error linking email to deal:', error);
      return false;
    }
  },

  // Email pinning mutations
  pinEmail: async (_, { input }, context) => {
    const { userId } = requireAuthentication(context);
    const { supabaseClient } = context;

    try {
      const { data: emailPin, error } = await supabaseClient
        .from('email_pins')
        .insert({
          user_id: userId,
          deal_id: input.dealId,
          email_id: input.emailId,
          thread_id: input.threadId,
          subject: input.subject,
          from_email: input.fromEmail,
          notes: input.notes,
        })
        .select()
        .single();

      if (error) {
        if (error.code === '23505') { // Unique constraint violation
          throw new Error('Email is already pinned to this deal');
        }
        console.error('Error pinning email:', error);
        throw new Error('Failed to pin email');
      }

      return {
        id: emailPin.id,
        userId: emailPin.user_id,
        dealId: emailPin.deal_id,
        emailId: emailPin.email_id,
        threadId: emailPin.thread_id,
        subject: emailPin.subject,
        fromEmail: emailPin.from_email,
        pinnedAt: emailPin.pinned_at,
        notes: emailPin.notes,
        createdAt: emailPin.created_at,
        updatedAt: emailPin.updated_at,
      };
    } catch (error) {
      console.error('Error pinning email:', error);
      throw error;
    }
  },

  unpinEmail: async (_, { id }, context) => {
    const { userId } = requireAuthentication(context);
    const { supabaseClient } = context;

    try {
      const { error } = await supabaseClient
        .from('email_pins')
        .delete()
        .eq('id', id)
        .eq('user_id', userId); // Ensure user can only unpin their own emails

      if (error) {
        console.error('Error unpinning email:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error unpinning email:', error);
      return false;
    }
  },

  updateEmailPin: async (_, { id, input }, context) => {
    const { userId } = requireAuthentication(context);
    const { supabaseClient } = context;

    try {
      const { data: emailPin, error } = await supabaseClient
        .from('email_pins')
        .update({
          notes: input.notes,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .eq('user_id', userId) // Ensure user can only update their own pins
        .select()
        .single();

      if (error) {
        console.error('Error updating email pin:', error);
        throw new Error('Failed to update email pin');
      }

      return {
        id: emailPin.id,
        userId: emailPin.user_id,
        dealId: emailPin.deal_id,
        emailId: emailPin.email_id,
        threadId: emailPin.thread_id,
        subject: emailPin.subject,
        fromEmail: emailPin.from_email,
        pinnedAt: emailPin.pinned_at,
        notes: emailPin.notes,
        createdAt: emailPin.created_at,
        updatedAt: emailPin.updated_at,
      };
    } catch (error) {
      console.error('Error updating email pin:', error);
      throw error;
    }
  },

  // Contact creation from email mutation
  createContactFromEmail: async (_, { input }, context) => {
    const { userId, accessToken } = requireAuthentication(context);
    const { supabaseClient } = context;

    try {
      // Get the email message to extract additional context
      const emailMessage = await emailService.getEmailMessage(userId, accessToken, input.emailId);
      if (!emailMessage) {
        throw new Error('Email not found');
      }

      // Parse email contact information if not provided
      const contactInfo = parseEmailContact(input.emailAddress);
      const firstName = input.firstName || contactInfo.firstName || '';
      const lastName = input.lastName || contactInfo.lastName || '';

      // Create person record
      const { data: person, error: personError } = await supabaseClient
        .from('people')
        .insert({
          first_name: firstName,
          last_name: lastName,
          email: contactInfo.email,
          notes: input.notes || `Contact created from email: ${emailMessage.subject}`,
          organization_id: input.organizationId,
          user_id: userId,
          created_from_email_id: input.emailId,
          created_from_email_subject: emailMessage.subject,
        })
        .select()
        .single();

      if (personError) {
        console.error('Error creating person from email:', personError);
        throw new Error('Failed to create contact');
      }

      // Optionally add as deal participant
      if (input.addAsDealParticipant && input.dealId) {
        console.log('About to add deal participant:');
        console.log('- input.dealId:', input.dealId, 'type:', typeof input.dealId);
        console.log('- person.id:', person.id, 'type:', typeof person.id);
        console.log('- userId:', userId, 'type:', typeof userId);
        
        const participantData = {
          deal_id: input.dealId,
          person_id: person.id,
          role: 'participant',
          added_from_email: true,
          created_by_user_id: userId,
        };
        
        console.log('Inserting deal participant with data:', JSON.stringify(participantData, null, 2));
        console.log('Role value type:', typeof participantData.role);
        console.log('Role value length:', participantData.role.length);
        console.log('Role value charCodes:', Array.from(participantData.role).map(c => c.charCodeAt(0)));
        
        const { error: participantError } = await supabaseClient
          .from('deal_participants')
          .insert(participantData);

        if (participantError) {
          console.error('Error adding person as deal participant:', participantError);
          console.error('Full error details:', JSON.stringify(participantError, null, 2));
          // Don't throw error here, person was created successfully
        } else {
          console.log('Successfully added person as deal participant');
        }
      }

      return person;
    } catch (error) {
      console.error('Error creating contact from email:', error);
      throw error;
    }
  },
}; 