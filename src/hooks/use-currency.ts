"use client";

import { useSession } from "next-auth/react";

/**
 * Hook to get the user's currency from the session
 * @returns The user's currency code (default: "KWD")
 */
export function useCurrency(): string {
  const { data: session } = useSession();

  // Extract currency from session user data, fallback to "KWD"
  return session?.user?.currency || "KWD";
}
