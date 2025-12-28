import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Rounds a time UP to the next half hour
 * e.g., 18:46 → 19:00, 18:00 → 18:00, 18:01 → 18:30
 */
export function roundUpToHalfHour(date: Date): Date {
  const result = new Date(date);
  const minutes = result.getMinutes();

  if (minutes === 0 || minutes === 30) {
    return result; // Already on a half hour
  }

  if (minutes < 30) {
    result.setMinutes(30, 0, 0);
  } else {
    result.setMinutes(0, 0, 0);
    result.setHours(result.getHours() + 1);
  }

  return result;
}

/**
 * Rounds a time DOWN to the previous half hour
 * e.g., 23:51 → 23:30, 23:30 → 23:30, 23:29 → 23:00
 */
export function roundDownToHalfHour(date: Date): Date {
  const result = new Date(date);
  const minutes = result.getMinutes();

  if (minutes === 0 || minutes === 30) {
    return result; // Already on a half hour
  }

  if (minutes < 30) {
    result.setMinutes(0, 0, 0);
  } else {
    result.setMinutes(30, 0, 0);
  }

  return result;
}

/**
 * Normalizes a time slot to half-hour boundaries
 * Start time rounds UP, end time rounds DOWN
 * e.g., 18:46 - 23:51 → 19:00 - 23:30
 */
export function normalizeTimeSlot(startTime: Date, endTime: Date): { start: Date; end: Date } {
  return {
    start: roundUpToHalfHour(startTime),
    end: roundDownToHalfHour(endTime),
  };
}

/**
 * Formats a Date to HH:mm string
 */
export function formatTimeHHMM(date: Date): string {
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  return `${hours}:${minutes}`;
}

/**
 * Creates a locale-aware path by prepending the locale to the path
 * @param path - The path to navigate to
 * @param locale - The current locale (e.g., 'en', 'ar')
 * @returns The path with locale prepended
 */
export function getLocalizedPath(path: string, locale: string): string {
  // Remove leading slash if present
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;

  // Return locale-prefixed path
  return `/${locale}${cleanPath ? `/${cleanPath}` : ''}`;
}

/**
 * Converts an image URL to use the authenticated proxy route
 * @param url - The original image URL
 * @returns Proxied URL for authenticated image fetching
 */
export function getProxiedImageUrl(url: string | null | undefined): string {
  if (!url) return "/no-apartment.png"; // Default fallback

  // If it's already a local path or relative URL, return as-is
  if (url.startsWith("/") || !url.startsWith("http")) {
    return url;
  }

  // If it's from the API domain (new.dyarko.com), proxy it
  if (url.includes("new.dyarko.com")) {
    return `/api/proxy-image?url=${encodeURIComponent(url)}`;
  }

  // Other external URLs can be used directly
  return url;
}
