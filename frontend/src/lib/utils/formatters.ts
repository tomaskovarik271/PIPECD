import type { Person as GeneratedPerson } from '../../generated/graphql/graphql';
import { CurrencyFormatter } from '../../../../lib/utils/currencyFormatter';

// Memoized date formatter
const dateFormatter = new Intl.DateTimeFormat('en-US', {
  dateStyle: 'medium'
});

const dateTimeFormatter = new Intl.DateTimeFormat('en-US', {
  dateStyle: 'medium',
  timeStyle: 'short'
});

// DEPRECATED: Use CurrencyFormatter.format() directly instead
// This wrapper exists only for backward compatibility
export const formatCurrency = (amount: number | null | undefined, includeCents: boolean = false): string => {
  const precision = includeCents ? 2 : 0;
  return CurrencyFormatter.format(amount, 'USD', { precision });
};

export const formatDate = (dateString: string | null | undefined): string => {
  if (!dateString) return '-';
  try {
    return dateFormatter.format(new Date(dateString));
  } catch (error) {
    console.warn('Invalid date string:', dateString);
    return '-';
  }
};

export const formatDateTime = (dateString: string | null | undefined): string => {
  if (!dateString) return '-';
  try {
    return dateTimeFormatter.format(new Date(dateString));
  } catch (error) {
    console.warn('Invalid date string:', dateString);
    return '-';
  }
};

export const formatPersonName = (person: GeneratedPerson | null | undefined): string => {
  if (!person) return '-';
  const firstName = person.first_name || '';
  const lastName = person.last_name || '';
  const fullName = `${firstName} ${lastName}`.trim();
  return fullName || person.email || '-';
};

export const formatPhoneNumber = (phone: string | null | undefined): string => {
  if (!phone) return '-';
  
  // Simple US phone number formatting
  const cleanPhone = phone.replace(/\D/g, '');
  if (cleanPhone.length === 10) {
    return `(${cleanPhone.slice(0, 3)}) ${cleanPhone.slice(3, 6)}-${cleanPhone.slice(6)}`;
  } else if (cleanPhone.length === 11 && cleanPhone.startsWith('1')) {
    return `+1 (${cleanPhone.slice(1, 4)}) ${cleanPhone.slice(4, 7)}-${cleanPhone.slice(7)}`;
  }
  
  return phone; // Return original if formatting fails
};

export const formatPercentage = (value: number | null | undefined, decimalPlaces: number = 0): string => {
  if (value === null || value === undefined) return '-';
  return `${(value * 100).toFixed(decimalPlaces)}%`;
};

export const truncateText = (text: string | null | undefined, maxLength: number = 50): string => {
  if (!text) return '-';
  if (text.length <= maxLength) return text;
  return `${text.substring(0, maxLength)}...`;
};

// Utility for consistent empty value display
export const displayEmpty = (value: any): string => {
  if (value === null || value === undefined || value === '') return '-';
  return String(value);
}; 