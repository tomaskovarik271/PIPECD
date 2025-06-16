/**
 * Centralized validation utilities
 * Consolidates duplicate validation functions across the codebase
 * Features: Pre-compiled regex patterns for optimal performance
 */
export class Validators {
  // Pre-compiled regex patterns for performance optimization
  private static readonly UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  private static readonly EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  private static readonly PHONE_REGEX = /^[\+]?[1-9][\d]{0,15}$/;
  private static readonly CURRENCY_REGEX = /^[A-Z]{3}$/;

  /**
   * Validate UUID format
   * Replaces multiple UUID validation implementations
   */
  static isValidUUID(str: string): boolean {
    return this.UUID_REGEX.test(str);
  }

  /**
   * Validate URL format
   * Replaces duplicate URL validation logic
   */
  static isUrl(str: string): boolean {
    try {
      new URL(str);
      return str.startsWith('http://') || str.startsWith('https://');
    } catch (_) {
      return false;
    }
  }

  /**
   * Validate email format
   * Standard email validation
   */
  static isEmail(str: string): boolean {
    return this.EMAIL_REGEX.test(str);
  }

  /**
   * Validate phone number format (flexible)
   * Accepts various phone number formats
   */
  static isPhoneNumber(str: string): boolean {
    const cleanedPhone = str.replace(/[\s\-\(\)\.]/g, '');
    return this.PHONE_REGEX.test(cleanedPhone);
  }

  /**
   * Validate positive number
   * Used for amounts, quantities, etc.
   */
  static isPositiveNumber(value: string | number): boolean {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    return !isNaN(num) && num > 0;
  }

  /**
   * Validate percentage (0-100)
   * Used for deal probabilities, completion rates, etc.
   */
  static isValidPercentage(value: string | number): boolean {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    return !isNaN(num) && num >= 0 && num <= 100;
  }

  /**
   * Validate currency code (ISO 4217)
   * 3-letter currency codes
   */
  static isCurrencyCode(str: string): boolean {
    return this.CURRENCY_REGEX.test(str);
  }

  /**
   * Validate date string (ISO format)
   * Validates ISO date strings
   */
  static isISODate(str: string): boolean {
    const date = new Date(str);
    return date instanceof Date && !isNaN(date.getTime()) && str.includes('T');
  }

  /**
   * Validate non-empty string
   * Common validation for required text fields
   */
  static isNonEmptyString(str: unknown): str is string {
    return typeof str === 'string' && str.trim().length > 0;
  }
} 