/**
 * Utility class for common date operations and formatting
 */
export class DateUtils {
  /**
   * Format a date string to a localized date string
   * @param dateString - ISO date string or Date object
   * @param locale - Optional locale for formatting (defaults to user's locale)
   * @returns Formatted date string
   */
  static formatDate(dateString: string | Date, locale?: string): string {
    const date =
      typeof dateString === 'string' ? new Date(dateString) : dateString;
    return date.toLocaleDateString(locale);
  }

  /**
   * Format a date string to a localized date and time string
   * @param dateString - ISO date string or Date object
   * @param locale - Optional locale for formatting (defaults to user's locale)
   * @returns Formatted date and time string
   */
  static formatDateTime(dateString: string | Date, locale?: string): string {
    const date =
      typeof dateString === 'string' ? new Date(dateString) : dateString;
    return date.toLocaleString(locale);
  }

  /**
   * Format a date string to a relative time string (e.g., "2 hours ago")
   * @param dateString - ISO date string or Date object
   * @returns Relative time string
   */
  static formatRelativeTime(dateString: string | Date): string {
    const date =
      typeof dateString === 'string' ? new Date(dateString) : dateString;
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return 'just now';
    }

    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
      return `${diffInMinutes} minute${diffInMinutes === 1 ? '' : 's'} ago`;
    }

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours === 1 ? '' : 's'} ago`;
    }

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) {
      return `${diffInDays} day${diffInDays === 1 ? '' : 's'} ago`;
    }

    const diffInWeeks = Math.floor(diffInDays / 7);
    if (diffInWeeks < 4) {
      return `${diffInWeeks} week${diffInWeeks === 1 ? '' : 's'} ago`;
    }

    const diffInMonths = Math.floor(diffInDays / 30);
    if (diffInMonths < 12) {
      return `${diffInMonths} month${diffInMonths === 1 ? '' : 's'} ago`;
    }

    const diffInYears = Math.floor(diffInDays / 365);
    return `${diffInYears} year${diffInYears === 1 ? '' : 's'} ago`;
  }

  /**
   * Check if a date is today
   * @param dateString - ISO date string or Date object
   * @returns True if the date is today
   */
  static isToday(dateString: string | Date): boolean {
    const date =
      typeof dateString === 'string' ? new Date(dateString) : dateString;
    const today = new Date();
    return date.toDateString() === today.toDateString();
  }

  /**
   * Check if a date is within the last N days
   * @param dateString - ISO date string or Date object
   * @param days - Number of days to check
   * @returns True if the date is within the last N days
   */
  static isWithinLastDays(dateString: string | Date, days: number): boolean {
    const date =
      typeof dateString === 'string' ? new Date(dateString) : dateString;
    const now = new Date();
    const diffInDays = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
    );
    return diffInDays <= days;
  }
}
