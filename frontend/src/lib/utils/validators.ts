/**
 * Centralized validation utilities
 * Consolidates duplicate validation functions across the codebase
 */
export class Validators {
  /**
   * Validate UUID format
   * Replaces multiple UUID validation implementations
   */
  static isValidUUID(str: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(str);
  }

  /**
   * Validate URL format
   * Replaces duplicate URL validation logic
   */
  static isUrl(str: string): boolean {
    try {
      new URL(str);
      return str.startsWith('http://') || str.startsWith('https://');
    } catch (_error) {
      return false;
    }
  }

  /**
   * Validate email format
   * Standard email validation
   */
  static isEmail(str: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(str);
  }

  /**
   * Validate phone number format (flexible)
   * Accepts various phone number formats
   */
  static isPhoneNumber(str: string): boolean {
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    const cleanedPhone = str.replace(/[\s\-\(\)\.]/g, '');
    return phoneRegex.test(cleanedPhone);
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
    const currencyRegex = /^[A-Z]{3}$/;
    return currencyRegex.test(str);
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