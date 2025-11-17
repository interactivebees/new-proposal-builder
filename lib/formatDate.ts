const DEFAULT_LOCALE = 'en-US'
const DEFAULT_OPTIONS: Intl.DateTimeFormatOptions = {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
  timeZone: 'UTC'
}

export function formatDate(
  value?: string | number | Date | null,
  locale: string = DEFAULT_LOCALE,
  options: Intl.DateTimeFormatOptions = DEFAULT_OPTIONS
): string {
  if (value === undefined || value === null) {
    return 'N/A'
  }

  const date = value instanceof Date ? value : new Date(value)

  if (Number.isNaN(date.getTime())) {
    return 'N/A'
  }

  return new Intl.DateTimeFormat(locale, options).format(date)
}
