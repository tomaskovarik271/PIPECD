import { gql } from 'graphql-request';
import { gqlClient } from '../graphqlClient';

// GraphQL query for getting all organizations (for client-side similarity detection)
const GET_ORGANIZATIONS_FOR_SIMILARITY = gql`
  query GetOrganizationsForSimilarity {
    organizations {
      id
      name
      address
      notes
    }
  }
`;

// Interface for duplicate detection results
export interface SimilarOrganizationResult {
  id: string;
  name: string;
  similarity_score: number;
  suggestion: string;
}

export interface SimilarPersonResult {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  organization?: string;
  similarity_score: number;
  suggestion: string;
}

// Organization duplicate detection service
export class DuplicateDetectionService {
  /**
   * Find similar organizations using client-side similarity detection
   * Note: Uses existing organizations query since findSimilarOrganizations doesn't exist in schema
   */
  static async findSimilarOrganizations(
    name: string, 
    excludeId?: string
  ): Promise<SimilarOrganizationResult[]> {
    try {
      if (name.length < 3) {
        return [];
      }

      // Get all organizations and do client-side similarity detection
      // Using robust error handling for GraphQL schema mismatches
      let organizations: Array<{ id: string; name: string; address?: string; notes?: string }> = [];
      
      try {
        const response = await gqlClient.request(GET_ORGANIZATIONS_FOR_SIMILARITY) as { organizations: Array<{ id: string; name: string; address?: string; notes?: string }> };
        organizations = response.organizations || [];
      } catch (gqlError: any) {
        // Handle GraphQL schema mismatch gracefully
        if (gqlError?.message?.includes('Cannot query field') || gqlError?.message?.includes('findSimilarOrganizations')) {
          console.warn('GraphQL schema mismatch detected, falling back to empty results for duplicate detection');
          return [];
        }
        throw gqlError; // Re-throw if it's a different error
      }

      // Filter and score organizations by similarity
      const matches = organizations
        .filter((org) => excludeId ? org.id !== excludeId : true)
        .map((org) => {
          const similarity_score = this.calculateOrganizationSimilarity(name, org.name);
          return {
            id: org.id,
            name: org.name,
            similarity_score,
            suggestion: this.generateOrganizationSuggestion(name, org.name, similarity_score),
          };
        })
        .filter((org) => org.similarity_score > 0.6) // Only show high-confidence matches
        .sort((a, b) => b.similarity_score - a.similarity_score) // Sort by relevance
        .slice(0, 5); // Limit to 5 suggestions for UX

      return matches;

    } catch (error) {
      console.error('Error finding similar organizations:', error);
      return [];
    }
  }

  /**
   * Find similar people using in-memory search (until GraphQL query is implemented)
   */
  static async findSimilarPeople(
    searchTerm: string,
    existingPeople: any[],
    excludeId?: string
  ): Promise<SimilarPersonResult[]> {
    try {
      if (searchTerm.length < 2) {
        return [];
      }

      const searchLower = searchTerm.toLowerCase();
      
      const matches = existingPeople
        .filter(person => {
          if (excludeId && person.id === excludeId) return false;
          
          const fullName = `${person.first_name || ''} ${person.last_name || ''}`.trim().toLowerCase();
          const email = (person.email || '').toLowerCase();
          
          return fullName.includes(searchLower) || email.includes(searchLower);
        })
        .map(person => {
          const fullName = `${person.first_name || ''} ${person.last_name || ''}`.trim();
          const email = person.email || '';
          
          // Calculate similarity score
          const similarity_score = this.calculatePersonSimilarity(searchTerm, fullName, email);
          
          return {
            id: person.id,
            name: fullName,
            email: person.email,
            phone: person.phone,
            organization: (person as any).organization?.name,
            similarity_score,
            suggestion: this.generatePersonSuggestion(searchTerm, fullName, email, similarity_score),
          };
        })
        .filter(person => person.similarity_score > 0.5) // Only show relevant matches
        .sort((a, b) => b.similarity_score - a.similarity_score) // Sort by relevance
        .slice(0, 5); // Limit to 5 suggestions

      return matches;

    } catch (error) {
      console.error('Error finding similar people:', error);
      return [];
    }
  }

  /**
   * Find organization suggestions based on email domain
   */
  static async findOrganizationByEmailDomain(
    email: string,
    existingOrganizations: any[]
  ): Promise<SimilarOrganizationResult[]> {
    try {
      const domain = this.extractDomainFromEmail(email);
      if (!domain) return [];

      const matches = existingOrganizations
        .filter(org => {
          const website = (org.website || '').toLowerCase();
          const name = org.name.toLowerCase();
          
          return website.includes(domain) || 
                 name.includes(domain.split('.')[0]) || // Match company name part
                 this.checkDomainMatch(domain, org);
        })
        .map(org => ({
          id: org.id,
          name: org.name,
          similarity_score: 0.8, // High confidence for domain matches
          suggestion: `Link to ${org.name} (from ${domain} domain)`,
        }))
        .slice(0, 3); // Limit to 3 domain suggestions

      return matches;

    } catch (error) {
      console.error('Error finding organizations by email domain:', error);
      return [];
    }
  }

  /**
   * Calculate similarity between organization names using client-side algorithm
   */
  private static calculateOrganizationSimilarity(inputName: string, existingName: string): number {
    const input = this.normalizeOrganizationName(inputName);
    const existing = this.normalizeOrganizationName(existingName);

    // Exact match after normalization
    if (input === existing) return 1.0;

    // One contains the other
    if (input.includes(existing) || existing.includes(input)) {
      const longer = Math.max(input.length, existing.length);
      const shorter = Math.min(input.length, existing.length);
      return 0.8 + (shorter / longer) * 0.15; // 0.8-0.95 range
    }

    // Word-based similarity
    const inputWords = input.split(' ').filter(w => w.length > 2);
    const existingWords = existing.split(' ').filter(w => w.length > 2);
    
    if (inputWords.length === 0 || existingWords.length === 0) return 0.0;

    let matchingWords = 0;
    inputWords.forEach(inputWord => {
      if (existingWords.some(existingWord => 
          existingWord.includes(inputWord) || inputWord.includes(existingWord))) {
        matchingWords++;
      }
    });

    const wordSimilarity = matchingWords / Math.max(inputWords.length, existingWords.length);
    
    // Boost score if significant word overlap
    if (wordSimilarity > 0.5) {
      return 0.6 + wordSimilarity * 0.3; // 0.6-0.9 range
    }

    // Levenshtein-like character similarity for remaining cases
    return this.calculateLevenshteinSimilarity(input, existing);
  }

  /**
   * Normalize organization name for comparison
   */
  private static normalizeOrganizationName(name: string): string {
    return name
      .toLowerCase()
      .trim()
      // Remove common legal suffixes
      .replace(/\b(inc|llc|corp|corporation|ltd|limited|gmbh|ag|sa|bv|co|company)\b\.?/g, '')
      // Remove extra whitespace
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Calculate character-level similarity (simplified Levenshtein)
   */
  private static calculateLevenshteinSimilarity(str1: string, str2: string): number {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    if (longer.length === 0) return 1.0;
    
    // Simple character overlap calculation
    let matches = 0;
    for (let i = 0; i < shorter.length; i++) {
      if (longer.includes(shorter[i])) matches++;
    }
    
    const similarity = matches / longer.length;
    return similarity > 0.4 ? similarity * 0.6 : 0.0; // Scale down and threshold
  }

  /**
   * Generate human-readable suggestion for organizations
   */
  private static generateOrganizationSuggestion(
    inputName: string, 
    existingName: string, 
    similarity: number
  ): string {
    if (similarity > 0.9) {
      return `${existingName} (exact match)`;
    } else if (similarity > 0.8) {
      return `${existingName} (very similar)`;
    } else if (inputName.toLowerCase().includes('division') || 
               inputName.toLowerCase().includes('dept') ||
               inputName.toLowerCase().includes('team')) {
      return `${existingName} (${inputName} division?)`;
    } else {
      return `${existingName} (similar company)`;
    }
  }

  /**
   * Generate human-readable suggestion for people
   */
  private static generatePersonSuggestion(
    searchTerm: string,
    fullName: string,
    email: string,
    similarity: number
  ): string {
    if (similarity > 0.9) {
      return `${fullName} (exact match)`;
    } else if (email && searchTerm.toLowerCase().includes(email.toLowerCase())) {
      return `${fullName} <${email}>`;
    } else {
      return `${fullName} (similar name)`;
    }
  }

  /**
   * Calculate similarity between search term and person data
   */
  private static calculatePersonSimilarity(
    searchTerm: string,
    fullName: string,
    email: string
  ): number {
    const searchLower = searchTerm.toLowerCase();
    const nameLower = fullName.toLowerCase();
    const emailLower = email.toLowerCase();

    // Exact email match gets highest score
    if (emailLower === searchLower) return 1.0;
    
    // Email contains search term
    if (emailLower.includes(searchLower)) return 0.9;
    
    // Exact name match
    if (nameLower === searchLower) return 0.95;
    
    // Name contains search term
    if (nameLower.includes(searchLower)) return 0.8;
    
    // Partial name match (words)
    const searchWords = searchLower.split(' ').filter(w => w.length > 1);
    const nameWords = nameLower.split(' ').filter(w => w.length > 1);
    
    let matchingWords = 0;
    searchWords.forEach(searchWord => {
      if (nameWords.some(nameWord => nameWord.includes(searchWord))) {
        matchingWords++;
      }
    });
    
    if (matchingWords > 0) {
      return 0.6 + (matchingWords / searchWords.length) * 0.2;
    }
    
    return 0.0;
  }

  /**
   * Extract domain from email address
   */
  private static extractDomainFromEmail(email: string): string | null {
    const match = email.match(/@([^@]+)$/);
    return match ? match[1].toLowerCase() : null;
  }

  /**
   * Check if domain matches organization
   */
  private static checkDomainMatch(domain: string, organization: any): boolean {
    const domainParts = domain.split('.');
    const companyName = organization.name.toLowerCase();
    
    // Check if main domain part matches company name
    if (domainParts.length >= 2) {
      const mainDomain = domainParts[0];
      return companyName.includes(mainDomain) || mainDomain.includes(companyName.split(' ')[0]);
    }
    
    return false;
  }

  /**
   * Batch duplicate detection for multiple entities
   */
  static async batchDetectDuplicates(
    entities: Array<{ type: 'organization' | 'person'; name: string; email?: string }>,
    existingData: { organizations: any[]; people: any[] }
  ): Promise<{
    organizations: SimilarOrganizationResult[];
    people: SimilarPersonResult[];
  }> {
    const organizationPromises = entities
      .filter(e => e.type === 'organization')
      .map(e => this.findSimilarOrganizations(e.name));
    
    const personPromises = entities
      .filter(e => e.type === 'person')
      .map(e => this.findSimilarPeople(e.name, existingData.people));

    const [organizationResults, personResults] = await Promise.all([
      Promise.all(organizationPromises),
      Promise.all(personPromises),
    ]);

    return {
      organizations: organizationResults.flat(),
      people: personResults.flat(),
    };
  }
}

// Export singleton instance
export const duplicateDetectionService = DuplicateDetectionService; 