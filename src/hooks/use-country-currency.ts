import { useCountries } from "./use-countries";

/**
 * Hook to get currency from a country code
 * @param countryCode - The country code (e.g., "KW", "EG")
 * @returns The currency code for that country (default: "KWD")
 */
export function useCountryCurrency(countryCode?: string): string {
  const { data: countries } = useCountries();

  if (!countries || !countryCode) {
    return "KWD"; // Default currency
  }

  const country = countries.find(
    (c) => c.code.toUpperCase() === countryCode.toUpperCase()
  );

  return country?.currency || "KWD";
}
