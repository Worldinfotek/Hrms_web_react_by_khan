import dayjs from 'dayjs';

export const DATE_FORMAT = 'DD MMM YYYY';
export const DATE_TIME_FORMAT = 'DD MMM YYYY, hh:mm A';

/** Formats an ISO date (UTC from the API) for display in the user's local time. */
export function formatDate(value: string | Date | null | undefined, format = DATE_FORMAT): string {
  if (!value) return '—';
  const date = dayjs(value);
  return date.isValid() ? date.format(format) : '—';
}

export function formatDateTime(value: string | Date | null | undefined): string {
  return formatDate(value, DATE_TIME_FORMAT);
}
