import { google } from 'googleapis';
import { googleIntegrationService } from './googleIntegrationService';
import { getAuthenticatedClient } from './serviceUtils';

export interface EmailThread {
  id: string;
  subject: string;
  participants: string[];
  messageCount: number;
  latestMessage?: EmailMessage;
  isUnread: boolean;
  lastActivity: string;
  dealId?: string;
  entityType?: string;
  entityId?: string;
}

export interface EmailMessage {
  id: string;
  threadId: string;
  subject: string;
  from: string;
  to: string[];
  cc: string[];
  bcc: string[];
  body: string;
  htmlBody?: string;
  timestamp: string;
  isUnread: boolean;
  hasAttachments: boolean;
  attachments: EmailAttachment[];
  labels: string[];
  importance: 'LOW' | 'NORMAL' | 'HIGH';
}

export interface EmailAttachment {
  id: string;
  filename: string;
  mimeType: string;
  size: number;
  downloadUrl?: string;
}

export interface EmailThreadsFilter {
  dealId?: string;
  contactEmail?: string;
  selectedContacts?: string[];
  includeAllParticipants?: boolean;
  contactScope?: 'PRIMARY' | 'ALL' | 'CUSTOM' | 'SELECTED_ROLES';
  keywords?: string[];
  dateFrom?: string;
  dateTo?: string;
  isUnread?: boolean;
  hasAttachments?: boolean;
  limit?: number;
  pageToken?: string;
}

export interface ComposeEmailInput {
  to: string[];
  cc?: string[];
  bcc?: string[];
  subject: string;
  body: string;
  attachments?: Array<{
    filename: string;
    content: string;
    mimeType: string;
  }>;
  dealId?: string;
  entityType?: string;
  entityId?: string;
  threadId?: string;
}

class EmailService {
  private async getGmailClient(userId: string, accessToken: string) {
    try {
      const tokens = await googleIntegrationService.getStoredTokens(userId, accessToken);
      if (!tokens) {
        throw new Error('GMAIL_NOT_CONNECTED');
      }

      const oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_OAUTH_CLIENT_ID,
        process.env.GOOGLE_OAUTH_CLIENT_SECRET,
        process.env.GOOGLE_REDIRECT_URI
      );

      oauth2Client.setCredentials({
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
      });

      // Set up automatic token refresh
      oauth2Client.on('tokens', async (newTokens) => {
        if (newTokens.refresh_token) {
          console.log('New refresh token received, updating database...');
          // If we get a new refresh token, update our stored tokens
          await googleIntegrationService.storeExtendedTokens(
            userId,
            {
              access_token: newTokens.access_token!,
              refresh_token: newTokens.refresh_token,
              expires_at: newTokens.expiry_date ? new Date(newTokens.expiry_date).toISOString() : undefined,
              granted_scopes: tokens.granted_scopes // Preserve existing scopes
            },
            accessToken
          );
        } else if (newTokens.access_token) {
          console.log('Access token refreshed, updating database...');
          // Just update the access token and expiry
          const supabase = getAuthenticatedClient(accessToken);
          await supabase
            .from('google_oauth_tokens')
            .update({
              access_token: newTokens.access_token,
              expires_at: newTokens.expiry_date ? new Date(newTokens.expiry_date).toISOString() : null,
              last_used_at: new Date().toISOString()
            })
            .eq('user_id', userId);
        }
      });

      return google.gmail({ version: 'v1', auth: oauth2Client });
    } catch (error) {
      console.error('Failed to get Gmail client:', error);
      if (error instanceof Error && error.message === 'GMAIL_NOT_CONNECTED') {
        throw new Error('Gmail integration not connected. Please reconnect your Google account.');
      }
      if (error instanceof Error && (error.message.includes('JWSError') || error.message.includes('Invalid number of parts'))) {
        throw new Error('Gmail authentication expired. Please reconnect your Google account.');
      }
      if (error instanceof Error && error.message.includes('refresh')) {
        throw new Error('Gmail authentication expired. Please reconnect your Google account.');
      }
      throw new Error('Failed to authenticate with Gmail. Please check your Google integration.');
    }
  }

  async getEmailThreads(userId: string, accessToken: string, filter: EmailThreadsFilter) {
    try {
      const gmail = await this.getGmailClient(userId, accessToken);

      // Build query string for Gmail API
      const queryParts: string[] = [];
      
      // Enhanced: Multi-contact filtering using Gmail API native capabilities
      if (filter.selectedContacts && filter.selectedContacts.length > 0) {
        // Use Gmail's native OR operators for multiple contacts
        const contactQueries = filter.selectedContacts.map(email => 
          `(from:${email} OR to:${email} OR cc:${email} OR bcc:${email})`
        );
        queryParts.push(`(${contactQueries.join(' OR ')})`);
      } else if (filter.includeAllParticipants && filter.dealId) {
        // Get all deal participants and build query
        try {
          const { dealParticipantService } = await import('./dealParticipantService.js');
          const participantEmails = await dealParticipantService.getDealParticipantEmails(
            userId, 
            filter.dealId, 
            accessToken
          );
          
          if (participantEmails.length > 0) {
            const contactQueries = participantEmails.map((email: string) => 
              `(from:${email} OR to:${email} OR cc:${email} OR bcc:${email})`
            );
            queryParts.push(`(${contactQueries.join(' OR ')})`);
          }
        } catch (error) {
          console.error('Error fetching deal participants for email filtering:', error);
          // Fallback to single contact if deal participants fetch fails
          if (filter.contactEmail) {
            queryParts.push(`(from:${filter.contactEmail} OR to:${filter.contactEmail})`);
          }
        }
      } else if (filter.contactEmail) {
        // Legacy single contact filtering (backward compatibility)
        queryParts.push(`(from:${filter.contactEmail} OR to:${filter.contactEmail})`);
      }
      
      if (filter.keywords && filter.keywords.length > 0) {
        const keywordQuery = filter.keywords.map(k => `"${k}"`).join(' OR ');
        queryParts.push(`(${keywordQuery})`);
      }
      
      if (filter.dateFrom) {
        queryParts.push(`after:${filter.dateFrom.split('T')[0]}`);
      }
      
      if (filter.dateTo) {
        queryParts.push(`before:${filter.dateTo.split('T')[0]}`);
      }
      
      if (filter.isUnread) {
        queryParts.push('is:unread');
      }
      
      if (filter.hasAttachments) {
        queryParts.push('has:attachment');
      }

      const query = queryParts.join(' ');
      console.log('Enhanced Gmail query:', query);

      // Get threads list
      const threadsResponse = await gmail.users.threads.list({
        userId: 'me',
        q: query || undefined,
        maxResults: filter.limit || 20,
        pageToken: filter.pageToken,
      });

      if (!threadsResponse.data.threads) {
        return {
          threads: [],
          totalCount: 0,
          hasNextPage: false,
          nextPageToken: null,
        };
      }

      // Get detailed thread information
      const threadsWithDetails = await Promise.all(
        threadsResponse.data.threads.map(async (thread) => {
          const threadDetail = await gmail.users.threads.get({
            userId: 'me',
            id: thread.id!,
            format: 'metadata',
            metadataHeaders: ['Subject', 'From', 'To', 'Date'],
          });

          return this.formatEmailThread(threadDetail.data, filter.dealId);
        })
      );

      return {
        threads: threadsWithDetails,
        totalCount: threadsResponse.data.resultSizeEstimate || 0,
        hasNextPage: !!threadsResponse.data.nextPageToken,
        nextPageToken: threadsResponse.data.nextPageToken || null,
      };
    } catch (error) {
      console.error('Failed to get email threads:', error);
      throw new Error('Failed to fetch email threads');
    }
  }

  async getEmailThread(userId: string, accessToken: string, threadId: string): Promise<EmailThread | null> {
    try {
      const gmail = await this.getGmailClient(userId, accessToken);
      
      const threadResponse = await gmail.users.threads.get({
        userId: 'me',
        id: threadId,
        format: 'full',
      });

      return this.formatEmailThread(threadResponse.data);
    } catch (error) {
      console.error('Failed to get email thread:', error);
      return null;
    }
  }

  async getEmailMessage(userId: string, accessToken: string, messageId: string): Promise<EmailMessage | null> {
    try {
      const gmail = await this.getGmailClient(userId, accessToken);
      
      const messageResponse = await gmail.users.messages.get({
        userId: 'me',
        id: messageId,
        format: 'full',
      });

      return this.formatEmailMessage(messageResponse.data);
    } catch (error) {
      console.error('Failed to get email message:', error);
      return null;
    }
  }

  async composeEmail(userId: string, accessToken: string, emailData: ComposeEmailInput): Promise<EmailMessage> {
    try {
      const gmail = await this.getGmailClient(userId, accessToken);

      // Create email message
      const message = this.createEmailMessage(emailData);
      
      const request: any = {
        userId: 'me',
        requestBody: {
          raw: message,
        },
      };

      if (emailData.threadId) {
        request.requestBody.threadId = emailData.threadId;
      }

      const response = await gmail.users.messages.send(request);
      
      // Get the sent message details
      const sentMessage = await gmail.users.messages.get({
        userId: 'me',
        id: response.data.id!,
        format: 'full',
      });

      const formattedMessage = this.formatEmailMessage(sentMessage.data);

      // If this email is related to a deal, store the association
      if (emailData.dealId) {
        await this.linkEmailToDeal(sentMessage.data.id!, emailData.dealId, userId);
      }

      return formattedMessage;
    } catch (error) {
      console.error('Failed to compose email:', error);
      throw new Error('Failed to send email');
    }
  }

  async markThreadAsRead(userId: string, accessToken: string, threadId: string): Promise<boolean> {
    try {
      const gmail = await this.getGmailClient(userId, accessToken);
      
      await gmail.users.threads.modify({
        userId: 'me',
        id: threadId,
        requestBody: {
          removeLabelIds: ['UNREAD'],
        },
      });

      return true;
    } catch (error) {
      console.error('Failed to mark thread as read:', error);
      return false;
    }
  }

  async markThreadAsUnread(userId: string, accessToken: string, threadId: string): Promise<boolean> {
    try {
      const gmail = await this.getGmailClient(userId, accessToken);
      
      await gmail.users.threads.modify({
        userId: 'me',
        id: threadId,
        requestBody: {
          addLabelIds: ['UNREAD'],
        },
      });

      return true;
    } catch (error) {
      console.error('Failed to mark thread as unread:', error);
      return false;
    }
  }

  async linkEmailToDeal(emailId: string, dealId: string, userId: string): Promise<boolean> {
    try {
      // Store the email-deal association in database
      // This would typically be done through your database service
      console.log(`Linking email ${emailId} to deal ${dealId} for user ${userId}`);
      return true;
    } catch (error) {
      console.error('Failed to link email to deal:', error);
      return false;
    }
  }

  private formatEmailThread(threadData: any, dealId?: string): EmailThread {
    const messages = threadData.messages || [];
    const latestMessage = messages[messages.length - 1];
    
    const subject = this.getHeaderValue(latestMessage?.payload?.headers, 'Subject') || '(No Subject)';
    const participants = this.extractParticipants(messages);
    const isUnread = latestMessage?.labelIds?.includes('UNREAD') || false;
    const lastActivity = new Date(parseInt(latestMessage?.internalDate || '0')).toISOString();

    return {
      id: threadData.id,
      subject,
      participants,
      messageCount: messages.length,
      latestMessage: latestMessage ? this.formatEmailMessage(latestMessage) : undefined,
      isUnread,
      lastActivity,
      dealId,
    };
  }

  private formatEmailMessage(messageData: any): EmailMessage {
    const headers = messageData.payload?.headers || [];
    const subject = this.getHeaderValue(headers, 'Subject') || '(No Subject)';
    const from = this.getHeaderValue(headers, 'From') || '';
    const to = this.parseEmailList(this.getHeaderValue(headers, 'To') || '');
    const cc = this.parseEmailList(this.getHeaderValue(headers, 'Cc') || '');
    const bcc = this.parseEmailList(this.getHeaderValue(headers, 'Bcc') || '');
    const date = this.getHeaderValue(headers, 'Date') || '';
    
    const body = this.extractMessageBody(messageData.payload);
    const htmlBody = this.extractMessageBody(messageData.payload, 'text/html');
    
    const isUnread = messageData.labelIds?.includes('UNREAD') || false;
    const hasAttachments = this.hasAttachments(messageData.payload);
    const attachments = this.extractAttachments(messageData.payload);

    return {
      id: messageData.id,
      threadId: messageData.threadId,
      subject,
      from,
      to,
      cc,
      bcc,
      body,
      htmlBody,
      timestamp: new Date(parseInt(messageData.internalDate)).toISOString(),
      isUnread,
      hasAttachments,
      attachments,
      labels: messageData.labelIds || [],
      importance: this.determineImportance(headers),
    };
  }

  private getHeaderValue(headers: any[], name: string): string | null {
    const header = headers.find(h => h.name.toLowerCase() === name.toLowerCase());
    return header?.value || null;
  }

  private parseEmailList(emailString: string): string[] {
    if (!emailString) return [];
    return emailString.split(',').map(email => email.trim()).filter(Boolean);
  }

  private extractParticipants(messages: any[]): string[] {
    const participants = new Set<string>();
    
    messages.forEach(message => {
      const headers = message.payload?.headers || [];
      const from = this.getHeaderValue(headers, 'From');
      const to = this.getHeaderValue(headers, 'To');
      const cc = this.getHeaderValue(headers, 'Cc');
      
      if (from) participants.add(from);
      if (to) this.parseEmailList(to).forEach(email => participants.add(email));
      if (cc) this.parseEmailList(cc).forEach(email => participants.add(email));
    });
    
    return Array.from(participants);
  }

  private extractMessageBody(payload: any, mimeType: string = 'text/plain'): string {
    if (payload.mimeType === mimeType && payload.body?.data) {
      return Buffer.from(payload.body.data, 'base64').toString('utf-8');
    }
    
    if (payload.parts) {
      for (const part of payload.parts) {
        const body = this.extractMessageBody(part, mimeType);
        if (body) return body;
      }
    }
    
    return '';
  }

  private hasAttachments(payload: any): boolean {
    if (payload.parts) {
      return payload.parts.some((part: any) => 
        part.filename && part.filename.length > 0
      );
    }
    return false;
  }

  private extractAttachments(payload: any): EmailAttachment[] {
    const attachments: EmailAttachment[] = [];
    
    if (payload.parts) {
      payload.parts.forEach((part: any) => {
        if (part.filename && part.filename.length > 0) {
          attachments.push({
            id: part.body?.attachmentId || '',
            filename: part.filename,
            mimeType: part.mimeType,
            size: part.body?.size || 0,
          });
        }
      });
    }
    
    return attachments;
  }

  private determineImportance(headers: any[]): 'LOW' | 'NORMAL' | 'HIGH' {
    const importance = this.getHeaderValue(headers, 'Importance');
    const priority = this.getHeaderValue(headers, 'X-Priority');
    
    if (importance === 'high' || priority === '1') return 'HIGH';
    if (importance === 'low' || priority === '5') return 'LOW';
    return 'NORMAL';
  }

  private createEmailMessage(emailData: ComposeEmailInput): string {
    const headers = [
      `To: ${emailData.to.join(', ')}`,
      emailData.cc && emailData.cc.length > 0 ? `Cc: ${emailData.cc.join(', ')}` : '',
      emailData.bcc && emailData.bcc.length > 0 ? `Bcc: ${emailData.bcc.join(', ')}` : '',
      `Subject: ${emailData.subject}`,
      'Content-Type: text/plain; charset=utf-8',
      '',
      emailData.body,
    ].filter(Boolean).join('\r\n');

    return Buffer.from(headers).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }
}

export const emailService = new EmailService(); 