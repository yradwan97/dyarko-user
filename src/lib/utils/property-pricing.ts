import { Property } from "@/lib/services/api/properties";

/**
 * Get the rental period for a property
 * @param property - The property object
 * @returns The rental period string (e.g., "day", "week", "month") or null
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
  // Only rent properties have prices
  if (property.offerType !== "rent") {
    return null;
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

  if (property.isDaily && property.dailyPrice) {
    basePrice = property.dailyPrice;
  } else if (property.isWeekly && property.weeklyPrice) {
    basePrice = property.weeklyPrice;
  } else if (property.isMonthly && property.monthlyPrice) {
    basePrice = property.monthlyPrice;
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
 * @returns Formatted price string
 */
export const formatPrice = (price: number, currency: string = "KWD"): string => {
  return new Intl.NumberFormat("en-US", {
    style: "decimal",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(price) + ` ${currency}`;
};
