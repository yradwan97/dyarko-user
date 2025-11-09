import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
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
