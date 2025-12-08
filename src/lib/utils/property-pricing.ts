import { Property } from "@/lib/services/api/properties";

/**
 * Get the rental period for a property
 * @param property - The property object
 * @returns The rental period string (e.g., "day", "week", "month", "weekdays", "holidays") or null
 */
export const getPropertyPeriod = (property: Property): string | null => {
  // Only rent properties have periods
  if (property.offerType !== "rent") {
    return null;
  }

  // Check standard rental periods
  if (property.isDaily) return "day";
  if (property.isWeekly) return "week";
  if (property.isMonthly) return "month";
  if (property.isWeekdays) return "weekdays";
  if (property.isHolidays) return "holidays";

  // Court category uses hourly pricing
  if (property.category === "court") {
    return "hour";
  }

  // Group-based categories (camp, booth)
  if (property.category === "camp" || property.category === "booth") {
    return "day";
  }

  return null;
};

/**
 * Get the price for a property
 * @param property - The property object
 * @param getDiscountedPrice - Whether to apply discount (default: false)
 * @returns The price or null
 */
export const getPropertyPrice = (
  property: Property,
  getDiscountedPrice: boolean = false
): number | null => {
  // Non-rent properties use the price field directly
  if (property.offerType !== "rent") {
    return property.price ? Number(property.price) : null;
  }

  // Calculate discount fraction (if applicable)
  const discountFraction = property.discount
    ? 1 - property.discount / 100
    : 1;

  // Helper function to apply discount
  const applyDiscount = (price: number | undefined | null): number | null => {
    if (!price) return null;
    return getDiscountedPrice ? price * discountFraction : price;
  };

  // Get price based on rental period
  let basePrice: number | null = null;

  // Court category uses property.price field for hourly pricing
  if (property.category === "court" && property.price) {
    basePrice = property.price;
    return applyDiscount(basePrice);
  }

  if (property.isDaily && property.dailyPrice) {
    basePrice = property.dailyPrice;
  } else if (property.isWeekly && property.weeklyPrice) {
    basePrice = property.weeklyPrice;
  } else if (property.isMonthly && property.monthlyPrice) {
    basePrice = property.monthlyPrice;
  } else if (property.isWeekdays && property.weekdaysPrice) {
    basePrice = property.weekdaysPrice;
  } else if (property.isHolidays && property.holidaysPrice) {
    basePrice = property.holidaysPrice;
  }

  // If we found a standard price, apply discount and return
  if (basePrice !== null) {
    return applyDiscount(basePrice);
  }

  // Handle group-based categories (camp, booth, hotelapartment)
  const hasGroupPricing =
    property.category === "camp" ||
    property.category === "booth" ||
    property.category === "hotelapartment";

  if (!hasGroupPricing) {
    return null;
  }

  // Get first group price (camp, booth)
  if (property.groups && property.groups.length > 0 && property.groups[0].price) {
    return applyDiscount(property.groups[0].price);
  }

  // Get first apartment price (hotel apartment)
  if (property.apartments && property.apartments.length > 0) {
    const firstApartment = property.apartments[0];
    const apartmentPrice =
      firstApartment.dailyPrice ||
      firstApartment.weeklyPrice ||
      firstApartment.monthlyPrice;

    if (apartmentPrice) {
      // Convert to number if it's a string
      const numericPrice = typeof apartmentPrice === 'string'
        ? parseFloat(apartmentPrice)
        : apartmentPrice;
      return applyDiscount(numericPrice);
    }
  }

  return null;
};

/**
 * Format price with currency
 * @param price - The price to format
 * @param currency - The currency code (default: "KWD")
 * @param locale - The locale for formatting (default: "en-US")
 * @returns Formatted price string
 */
export const formatPrice = (
  price: number,
  currency: string = "KWD",
  locale: string = "en-US"
): string => {
  return new Intl.NumberFormat(locale, {
    style: "decimal",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(price) + ` ${currency}`;
};

export interface OtherPrice {
  period: string;
  price: string;
}

/**
 * Get all available prices for a property (excluding the primary displayed one)
 * @param property - The property object
 * @param primaryPeriod - The primary period being displayed (to exclude from other prices)
 * @param currency - The currency code
 * @param locale - The locale for formatting
 * @param tPrice - Translation function for price periods
 * @returns Array of other available prices
 */
export function getOtherPrices(
  property: Property,
  primaryPeriod: string | null,
  currency: string,
  locale: string,
  tPrice: (key: string) => string
): OtherPrice[] {
  // Only rent properties have multiple price periods
  if (property.offerType !== "rent") {
    return [];
  }

  const prices: OtherPrice[] = [];

  // Check each price period and add if available and not the primary
  if (property.isDaily && property.dailyPrice && primaryPeriod !== "day") {
    prices.push({
      period: tPrice("day"),
      price: formatPrice(property.dailyPrice, currency, locale),
    });
  }

  if (property.isWeekly && property.weeklyPrice && primaryPeriod !== "week") {
    prices.push({
      period: tPrice("week"),
      price: formatPrice(property.weeklyPrice, currency, locale),
    });
  }

  if (property.isMonthly && property.monthlyPrice && primaryPeriod !== "month") {
    prices.push({
      period: tPrice("month"),
      price: formatPrice(property.monthlyPrice, currency, locale),
    });
  }

  if (property.isWeekdays && property.weekdaysPrice && primaryPeriod !== "weekdays") {
    prices.push({
      period: tPrice("weekdays"),
      price: formatPrice(property.weekdaysPrice, currency, locale),
    });
  }

  if (property.isHolidays && property.holidaysPrice && primaryPeriod !== "holidays") {
    prices.push({
      period: tPrice("holidays"),
      price: formatPrice(property.holidaysPrice, currency, locale),
    });
  }

  return prices;
}
