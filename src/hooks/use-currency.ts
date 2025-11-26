"use client";

import { useSession } from "next-auth/react";
import { useCountryCurrency } from "./use-country-currency";

/**
 * Hook to get the user's currency based on their country
 * @returns The user's currency code (default: "KWD")
 */
export function useCurrency(): string {
  const { data: session } = useSession();
  const countryCode = session?.user?.country as string | undefined;

  // Get currency from country metadata hook
  const currency = useCountryCurrency(countryCode);

  return currency;
}
