/**
 * Base Adapter for PipeCD AI Agent
 * 
 * Provides common patterns for converting between:
 * - AI Agent tool parameters ↔ Service layer inputs
 * - Service layer outputs ↔ AI Agent responses
 */

import type { ToolResult } from '../types/tools';
import { ResponseFormatter } from '../utils/ResponseFormatter';

export abstract class BaseAdapter {
  /**
   * Create a successful AI tool result with formatted message
   */
  protected static createSuccessResult(
    toolName: string,
    message: string,
    data: any,
    parameters: Record<string, any>
  ): ToolResult {
    return {
      success: true,
      data,
      message,
      metadata: {
        toolName,
        parameters,
        timestamp: new Date().toISOString(),
        executionTime: 0,
      },
    };
  }

  /**
   * Create a failed AI tool result with error formatting
   */
  protected static createErrorResult(
    toolName: string,
    error: unknown,
    parameters: Record<string, any>
  ): ToolResult {
    return {
      success: false,
      message: ResponseFormatter.formatError('Operation failed', error),
      metadata: {
        toolName,
        parameters,
        timestamp: new Date().toISOString(),
        executionTime: 0,
      },
    };
  }

  /**
   * Remove undefined values from an object to prepare for service calls
   */
  protected static cleanInput<T extends Record<string, any>>(input: T): Partial<T> {
    const cleaned: Partial<T> = {};
    Object.entries(input).forEach(([key, value]) => {
      if (value !== undefined) {
        cleaned[key as keyof T] = value;
      }
    });
    return cleaned;
  }

  /**
   * Apply client-side filtering to an array of items
   */
  protected static applyFilters<T>(
    items: T[],
    filters: Record<string, any>,
    filterMappings: Record<string, (item: T, value: any) => boolean>
  ): T[] {
    let filtered = items;

    Object.entries(filters).forEach(([key, value]) => {
      const filterFn = filterMappings[key];
      if (value !== undefined && filterFn) {
        filtered = filtered.filter(item => filterFn(item, value));
      }
    });

    return filtered;
  }

  /**
   * Sort and limit results
   */
  protected static sortAndLimit<T>(
    items: T[],
    sortBy: keyof T = 'updated_at' as keyof T,
    limit: number = 20,
    ascending: boolean = false
  ): T[] {
    const sorted = [...items].sort((a, b) => {
      const aVal = a[sortBy];
      const bVal = b[sortBy];
      
      if (aVal instanceof Date && bVal instanceof Date) {
        return ascending ? aVal.getTime() - bVal.getTime() : bVal.getTime() - aVal.getTime();
      }
      
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        const aDate = new Date(aVal);
        const bDate = new Date(bVal);
        if (!isNaN(aDate.getTime()) && !isNaN(bDate.getTime())) {
          return ascending ? aDate.getTime() - bDate.getTime() : bDate.getTime() - aDate.getTime();
        }
      }
      
      return 0; // Default no sorting
    });

    return sorted.slice(0, limit);
  }
} 