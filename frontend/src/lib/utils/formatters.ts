import type { Person as GeneratedPerson } from '../../generated/graphql/graphql';

export const formatPersonName = (person: GeneratedPerson | null | undefined): string => {
  if (!person) return '-';
  return person.last_name && person.first_name 
    ? `${person.last_name}, ${person.first_name}` 
    : person.first_name || person.last_name || person.email || 'Unnamed Person';
};

export const formatDate = (dateString: string | null | undefined): string => {
  if (!dateString) return '-';
  try {
    return new Date(dateString).toLocaleDateString();
  } catch (e) {
    console.error("Error formatting date:", dateString, e);
    return '-'; // Return a fallback on error
  }
};

export const formatCurrency = (amount: number | null | undefined): string => {
  if (amount == null) return '-'; // Check for null or undefined
  try {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  } catch (e) {
    console.error("Error formatting currency:", amount, e);
    return '-'; // Return a fallback on error
  }
}; 