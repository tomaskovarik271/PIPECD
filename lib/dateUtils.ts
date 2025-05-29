/**
 * Returns the current date as a string in YYYY-MM-DD format, representing the end of the day.
 * This is suitable for setting due dates that are for "today".
 */
export const getISOEndOfDay = (): string => {
  const today = new Date();
  // No time component needed, just the date for "due by end of day"
  return (today.toISOString().split('T')[0] as string);
};

/**
 * Formats a Date object or a date string into 'YYYY-MM-DD HH:MM' format.
 * If the input is invalid, it returns a placeholder or throws an error.
 */
export const formatDateTimeReadable = (dateInput: Date | string | null | undefined): string => {
  if (!dateInput) return 'N/A';
  try {
    const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
    if (isNaN(date.getTime())) return 'Invalid Date';

    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');

    return `${year}-${month}-${day} ${hours}:${minutes}`;
  } catch (error) {
    console.error('[formatDateTimeReadable] Error formatting date:', dateInput, error);
    return 'Error Formatting Date';
  }
}; 