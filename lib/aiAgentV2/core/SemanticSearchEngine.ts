import type { SystemSnapshot } from '../types/system.js';

export interface SearchResult {
  id: string;
  type: 'deal' | 'organization' | 'person' | 'activity' | 'note' | 'email' | 'document';
  title: string;
  content: string;
  excerpt: string;
  relevanceScore: number;
  metadata: {
    entityId: string;
    entityType: string;
    lastUpdated: Date;
    permissions: string[];
    tags: string[];
  };
}

export interface SearchFilters {
  entityTypes?: string[];
  dateRange?: {
    start?: Date;
    end?: Date;
  };
  tags?: string[];
  userIds?: string[];
  minRelevanceScore?: number;
  permissions?: string[];
}

export interface SearchOptions {
  limit?: number;
  offset?: number;
  includePrivate?: boolean;
  sortBy?: 'relevance' | 'date' | 'title';
  sortOrder?: 'asc' | 'desc';
  highlightTerms?: boolean;
}

export class SemanticSearchEngine {
  private searchIndex: Map<string, any> = new Map();
  private entityContent: Map<string, SearchResult> = new Map();
  private userPermissions: Map<string, string[]> = new Map();
  private searchCache: Map<string, { results: SearchResult[]; timestamp: Date }> = new Map();
  private cacheTimeout = 5 * 60 * 1000; // 5 minutes

  constructor() {
    // In a full implementation, this would initialize vector embeddings
    // and connect to a proper search index like Elasticsearch or similar
  }

  async search(
    query: string,
    userId: string,
    filters: SearchFilters = {},
    options: SearchOptions = {}
  ): Promise<{
    results: SearchResult[];
    totalCount: number;
    searchTime: number;
    suggestions: string[];
  }> {
    const startTime = Date.now();

    // Check cache first
    const cacheKey = this.generateCacheKey(query, userId, filters, options);
    const cached = this.searchCache.get(cacheKey);
    
    if (cached && (Date.now() - cached.timestamp.getTime()) < this.cacheTimeout) {
      return {
        results: cached.results,
        totalCount: cached.results.length,
        searchTime: Date.now() - startTime,
        suggestions: []
      };
    }

    // Get user permissions
    const userPerms = this.userPermissions.get(userId) || [];

    // Perform search
    const allResults = await this.performSearch(query, userPerms, filters);
    
    // Apply options (sorting, limiting, etc.)
    const processedResults = this.processResults(allResults, options);
    
    // Generate suggestions
    const suggestions = this.generateSearchSuggestions(query, allResults);

    // Cache results
    this.searchCache.set(cacheKey, {
      results: processedResults,
      timestamp: new Date()
    });

    return {
      results: processedResults,
      totalCount: allResults.length,
      searchTime: Date.now() - startTime,
      suggestions
    };
  }

  async searchDeals(
    query: string,
    userId: string,
    filters: SearchFilters = {}
  ): Promise<SearchResult[]> {
    const searchFilters = {
      ...filters,
      entityTypes: ['deal']
    };

    const results = await this.search(query, userId, searchFilters);
    return results.results;
  }

  async searchOrganizations(
    query: string,
    userId: string,
    filters: SearchFilters = {}
  ): Promise<SearchResult[]> {
    const searchFilters = {
      ...filters,
      entityTypes: ['organization']
    };

    const results = await this.search(query, userId, searchFilters);
    return results.results;
  }

  async searchActivities(
    query: string,
    userId: string,
    filters: SearchFilters = {}
  ): Promise<SearchResult[]> {
    const searchFilters = {
      ...filters,
      entityTypes: ['activity', 'note', 'email']
    };

    const results = await this.search(query, userId, searchFilters);
    return results.results;
  }

  async searchSimilarContent(
    contentId: string,
    userId: string,
    limit: number = 10
  ): Promise<SearchResult[]> {
    const sourceContent = this.entityContent.get(contentId);
    if (!sourceContent) {
      return [];
    }

    // In a full implementation, this would use vector similarity
    // For now, we'll use keyword similarity
    const keywords = this.extractKeywords(sourceContent.content);
    const query = keywords.slice(0, 5).join(' ');

    const results = await this.search(query, userId, {}, { limit });
    
    // Filter out the source content
    return results.results.filter(result => result.id !== contentId);
  }

  async indexContent(content: {
    id: string;
    type: SearchResult['type'];
    title: string;
    content: string;
    entityId: string;
    permissions: string[];
    tags?: string[];
    lastUpdated?: Date;
  }): Promise<void> {
    const searchResult: SearchResult = {
      id: content.id,
      type: content.type,
      title: content.title,
      content: content.content,
      excerpt: this.generateExcerpt(content.content),
      relevanceScore: 0, // Will be calculated during search
      metadata: {
        entityId: content.entityId,
        entityType: content.type,
        lastUpdated: content.lastUpdated || new Date(),
        permissions: content.permissions,
        tags: content.tags || []
      }
    };

    this.entityContent.set(content.id, searchResult);
    
    // Index keywords and create search vectors
    await this.indexKeywords(content.id, content.content);
    
    // Clear related caches
    this.clearRelevantCaches(content.type);
  }

  async removeFromIndex(contentId: string): Promise<boolean> {
    const existed = this.entityContent.has(contentId);
    this.entityContent.delete(contentId);
    this.searchIndex.delete(contentId);
    
    // Clear caches
    this.searchCache.clear();
    
    return existed;
  }

  async updateUserPermissions(userId: string, permissions: string[]): Promise<void> {
    this.userPermissions.set(userId, permissions);
    
    // Clear user-specific caches
    this.clearUserCaches(userId);
  }

  private async performSearch(
    query: string,
    userPermissions: string[],
    filters: SearchFilters
  ): Promise<SearchResult[]> {
    const queryTerms = this.preprocessQuery(query);
    const results: SearchResult[] = [];

    for (const [contentId, content] of this.entityContent) {
      // Check permissions
      if (!this.hasPermissionToView(content, userPermissions)) {
        continue;
      }

      // Apply entity type filters
      if (filters.entityTypes && !filters.entityTypes.includes(content.type)) {
        continue;
      }

      // Apply date filters
      if (filters.dateRange) {
        if (filters.dateRange.start && content.metadata.lastUpdated < filters.dateRange.start) {
          continue;
        }
        if (filters.dateRange.end && content.metadata.lastUpdated > filters.dateRange.end) {
          continue;
        }
      }

      // Apply tag filters
      if (filters.tags && filters.tags.length > 0) {
        const hasRequiredTags = filters.tags.some(tag => 
          content.metadata.tags.includes(tag)
        );
        if (!hasRequiredTags) {
          continue;
        }
      }

      // Calculate relevance score
      const relevanceScore = this.calculateRelevanceScore(queryTerms, content);
      
      // Apply minimum relevance filter
      if (filters.minRelevanceScore && relevanceScore < filters.minRelevanceScore) {
        continue;
      }

      const resultCopy = { ...content, relevanceScore };
      results.push(resultCopy);
    }

    return results;
  }

  private preprocessQuery(query: string): string[] {
    return query
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(term => term.length > 2)
      .slice(0, 10); // Limit query terms
  }

  private calculateRelevanceScore(queryTerms: string[], content: SearchResult): number {
    let score = 0;
    const contentText = `${content.title} ${content.content}`.toLowerCase();

    for (const term of queryTerms) {
      // Title matches are worth more
      const titleMatches = (content.title.toLowerCase().match(new RegExp(term, 'g')) || []).length;
      score += titleMatches * 3;

      // Content matches
      const contentMatches = (contentText.match(new RegExp(term, 'g')) || []).length;
      score += contentMatches;

      // Exact phrase bonus
      if (contentText.includes(queryTerms.join(' '))) {
        score += 5;
      }

      // Tag matches
      const tagMatches = content.metadata.tags.filter(tag => 
        tag.toLowerCase().includes(term)
      ).length;
      score += tagMatches * 2;
    }

    // Normalize score (0-1 range)
    return Math.min(score / (queryTerms.length * 10), 1);
  }

  private hasPermissionToView(content: SearchResult, userPermissions: string[]): boolean {
    // If content has no permission requirements, it's public
    if (!content.metadata.permissions || content.metadata.permissions.length === 0) {
      return true;
    }

    // Check if user has any of the required permissions
    return content.metadata.permissions.some(perm => 
      userPermissions.includes(perm)
    );
  }

  private processResults(results: SearchResult[], options: SearchOptions): SearchResult[] {
    let processed = [...results];

    // Sort results
    if (options.sortBy) {
      processed.sort((a, b) => {
        let comparison = 0;
        
        switch (options.sortBy) {
          case 'relevance':
            comparison = b.relevanceScore - a.relevanceScore;
            break;
          case 'date':
            comparison = b.metadata.lastUpdated.getTime() - a.metadata.lastUpdated.getTime();
            break;
          case 'title':
            comparison = a.title.localeCompare(b.title);
            break;
        }

        return options.sortOrder === 'desc' ? comparison : -comparison;
      });
    }

    // Apply pagination
    const offset = options.offset || 0;
    const limit = options.limit || 50;
    processed = processed.slice(offset, offset + limit);

    return processed;
  }

  private generateSearchSuggestions(query: string, results: SearchResult[]): string[] {
    const suggestions: string[] = [];
    
    // Common entity type suggestions based on results
    const entityTypes = [...new Set(results.map(r => r.type))];
    if (entityTypes.length > 1) {
      entityTypes.forEach(type => {
        suggestions.push(`${query} in:${type}`);
      });
    }

    // Tag suggestions
    const allTags = results.flatMap(r => r.metadata.tags);
    const uniqueTags = [...new Set(allTags)].slice(0, 3);
    uniqueTags.forEach(tag => {
      suggestions.push(`${query} tag:${tag}`);
    });

    return suggestions.slice(0, 5);
  }

  private async indexKeywords(contentId: string, content: string): Promise<void> {
    const keywords = this.extractKeywords(content);
    
    for (const keyword of keywords) {
      if (!this.searchIndex.has(keyword)) {
        this.searchIndex.set(keyword, new Set());
      }
      this.searchIndex.get(keyword)!.add(contentId);
    }
  }

  private extractKeywords(content: string): string[] {
    return content
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 3)
      .filter(word => !this.isStopWord(word))
      .slice(0, 100); // Limit keywords per content
  }

  private isStopWord(word: string): boolean {
    const stopWords = new Set([
      'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with',
      'by', 'from', 'up', 'about', 'into', 'through', 'during', 'before',
      'after', 'above', 'below', 'between', 'among', 'this', 'that', 'these',
      'those', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have',
      'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should'
    ]);

    return stopWords.has(word);
  }

  private generateExcerpt(content: string, maxLength: number = 150): string {
    if (content.length <= maxLength) {
      return content;
    }

    const words = content.split(' ');
    let excerpt = '';
    
    for (const word of words) {
      if ((excerpt + word).length > maxLength - 3) {
        break;
      }
      excerpt += (excerpt ? ' ' : '') + word;
    }

    return excerpt + '...';
  }

  private generateCacheKey(
    query: string,
    userId: string,
    filters: SearchFilters,
    options: SearchOptions
  ): string {
    return `${query}:${userId}:${JSON.stringify(filters)}:${JSON.stringify(options)}`;
  }

  private clearRelevantCaches(entityType: string): void {
    // Clear caches that might be affected by this entity type
    for (const [cacheKey] of this.searchCache) {
      if (cacheKey.includes(entityType)) {
        this.searchCache.delete(cacheKey);
      }
    }
  }

  private clearUserCaches(userId: string): void {
    // Clear all caches for this user
    for (const [cacheKey] of this.searchCache) {
      if (cacheKey.includes(userId)) {
        this.searchCache.delete(cacheKey);
      }
    }
  }

  // Analytics and monitoring
  getSearchMetrics(): {
    totalIndexedContent: number;
    searchCacheSize: number;
    entityTypeDistribution: Record<string, number>;
    averageContentLength: number;
  } {
    const entityTypes: Record<string, number> = {};
    let totalContentLength = 0;

    for (const content of this.entityContent.values()) {
      entityTypes[content.type] = (entityTypes[content.type] || 0) + 1;
      totalContentLength += content.content.length;
    }

    return {
      totalIndexedContent: this.entityContent.size,
      searchCacheSize: this.searchCache.size,
      entityTypeDistribution: entityTypes,
      averageContentLength: this.entityContent.size > 0 
        ? Math.round(totalContentLength / this.entityContent.size)
        : 0
    };
  }

  // Index management
  async rebuildIndex(): Promise<void> {
    this.searchIndex.clear();
    
    for (const [contentId, content] of this.entityContent) {
      await this.indexKeywords(contentId, content.content);
    }
    
    this.searchCache.clear();
  }

  clearCache(): void {
    this.searchCache.clear();
  }

  // Health check
  async healthCheck(): Promise<boolean> {
    try {
      // Perform a simple search to verify the engine is working
      const testResults = await this.search('test', 'health-check-user', {}, { limit: 1 });
      return true;
    } catch {
      return false;
    }
  }
} 