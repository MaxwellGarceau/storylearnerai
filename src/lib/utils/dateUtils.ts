/**
 * Utility class for common date operations and formatting
 */
export class DateUtils {
  /**
   * Format a date to a localized date string
   * @param dateString - ISO date string or Date object
   * @param locale - Optional locale (defaults to user's locale)
   * @param options - Optional Intl.DateTimeFormatOptions for custom formatting
   * @returns Formatted date string
   */
  static formatDate(
    dateString: string | Date,
    locale?: string,
    options?: Intl.DateTimeFormatOptions
  ): string {
    const date =
      typeof dateString === 'string' ? new Date(dateString) : dateString;
    return date.toLocaleDateString(locale, options);
  }
}
