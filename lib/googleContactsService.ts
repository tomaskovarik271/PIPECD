// Google Contacts Service - Fetches contacts from Google for autocomplete suggestions
// Follows PipeCD service patterns for consistency
import { google, people_v1 } from 'googleapis';
import { googleIntegrationService } from './googleIntegrationService';

export interface ContactSuggestion {
  email: string;
  name?: string;
  photoUrl?: string;
}

class GoogleContactsService {
  private contactsCache = new Map<string, { contacts: ContactSuggestion[]; timestamp: number }>();
  private readonly CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

  /**
   * Get authenticated Google People API client
   */
  private async getPeopleClient(userId: string, accessToken: string): Promise<people_v1.People> {
    const tokens = await googleIntegrationService.getValidTokens(userId, accessToken);
    
    if (!tokens) {
      throw new Error('No valid Google tokens found. Please reconnect your Google account.');
    }

    // Check if we have contacts scope
    const requiredScope = 'https://www.googleapis.com/auth/contacts.readonly';
    if (!tokens.granted_scopes.includes(requiredScope)) {
      throw new Error('CONTACTS_SCOPE_MISSING');
    }

    // Configure OAuth2Client with proper credentials for token refresh
    const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET;
    
    if (!clientId || !clientSecret) {
      throw new Error('Google OAuth configuration error. Please check server configuration.');
    }

    const oauth2Client = new google.auth.OAuth2(
      clientId,
      clientSecret,
      // No redirect URI needed for server-side token refresh
    );
    
    oauth2Client.setCredentials({
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
    });

    return google.people({ version: 'v1', auth: oauth2Client });
  }

  /**
   * Fetch user's contacts from Google
   */
  public async getContacts(userId: string, accessToken: string): Promise<ContactSuggestion[]> {
    // Check cache first
    const cached = this.contactsCache.get(userId);
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.contacts;
    }

    try {
      const people = await this.getPeopleClient(userId, accessToken);
      
      const response = await people.people.connections.list({
        resourceName: 'people/me',
        pageSize: 500, // Get more contacts for better suggestions
        personFields: 'names,emailAddresses,photos',
        sortOrder: 'LAST_MODIFIED_DESCENDING'
      });

      const contacts: ContactSuggestion[] = [];
      
      if (response.data.connections) {
        for (const person of response.data.connections) {
          if (person.emailAddresses) {
            for (const email of person.emailAddresses) {
              if (email.value && email.value.includes('@')) {
                const name = person.names?.[0] ? 
                  `${person.names[0].givenName || ''} ${person.names[0].familyName || ''}`.trim() : 
                  undefined;
                
                const photoUrl = person.photos?.[0]?.url;

                contacts.push({
                  email: email.value,
                  name: name || undefined,
                  photoUrl: photoUrl ?? undefined
                });
              }
            }
          }
        }
      }

      // Sort by name/email for better UX
      contacts.sort((a, b) => {
        const aSort = a.name || a.email;
        const bSort = b.name || b.email;
        return aSort.localeCompare(bSort);
      });

      // Cache the results
      this.contactsCache.set(userId, {
        contacts,
        timestamp: Date.now()
      });

      return contacts;
    } catch (error) {
      console.error('Error fetching Google contacts:', error);
      // Return empty array on error - don't break the UI
      return [];
    }
  }

  /**
   * Search contacts by email or name for autocomplete
   */
  public async searchContacts(
    userId: string, 
    accessToken: string, 
    query: string
  ): Promise<ContactSuggestion[]> {
    if (!query || query.length < 2) {
      return [];
    }

    const allContacts = await this.getContacts(userId, accessToken);
    const lowerQuery = query.toLowerCase();

    return allContacts
      .filter(contact => 
        contact.email.toLowerCase().includes(lowerQuery) ||
        (contact.name && contact.name.toLowerCase().includes(lowerQuery))
      )
      .slice(0, 8); // Limit to 8 suggestions for better UX
  }

  /**
   * Clear cache for a user (useful when tokens are refreshed)
   */
  public clearCache(userId: string): void {
    this.contactsCache.delete(userId);
  }

  /**
   * Clear all cached contacts (useful for memory management)
   */
  public clearAllCache(): void {
    this.contactsCache.clear();
  }
}

// Export singleton instance
export const googleContactsService = new GoogleContactsService(); 