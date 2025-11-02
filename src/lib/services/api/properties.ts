import { noAuthAxios } from "../axios-client";

export interface PropertyOwner {
  _id: string;
  role: string;
  name: string;
  email: string;
  status: string;
  isConfirmed: boolean;
  country: string;
  phoneNumber: string;
  points: number;
  isVerified: boolean;
  image?: string;
  averageRating?: number;
  numberOfReviewers?: number;
}

export interface Property {
  _id: string;
  owner: PropertyOwner;
  slug: string;
  code: string;
  category: string; // "house", "villa", etc.
  class: string; // "entertainment", etc.
  offerType: string; // "rent", "sale", etc.
  title: string;
  description: string;
  country: string;
  city: string;
  region: string;
  lat: number;
  long: number;
  video?: string;
  image?: string | null;
  images?: string[];
  amenities: string[];
  services: PropertyService[];
  saved: number;
  views: number;
  searchFeature?: string;
  homeFeature?: string;
  status: string; // "PUBLISHED", etc.
  isUserApproved: boolean;
  isVerified: boolean;
  discountRate?: string;
  discount: number;
  discountStartDate?: string | null;
  discountEndDate?: string | null;
  isTerminated: boolean;
  allowCountry: string;
  allowNationality: string;
  rules?: string
  __t?: string; // Property type discriminator
  // Physical characteristics
  bedrooms?: number;
  bathrooms?: number;
  area?: number;
  // Rent-specific fields
  hasTenant?: boolean;
  isDaily?: boolean;
  dailyPrice?: number;
  isWeekly?: boolean;
  weeklyPrice?: number;
  isMonthly?: boolean;
  monthlyPrice?: number;
  isWeekdays?: boolean;
  weekdaysPrice?: number;
  isHolidays?: boolean;
  holidaysPrice?: number;
  hasInsurance?: boolean;
  insurancePrice?: number;
  availableDate?: string;
  checkInTime?: string;
  checkOutTime?: string;
  rentManagement?: string;
  paciNumber?: number[];
  isFinished?: boolean;
  finishType?: string;
  isFurnished?: boolean;
  commissionRate?: string;
  commission?: number;
  minMonths?: number;
  // Replacement-specific
  replaceWith?: string;
  // Share-specific
  capacity?: number;
  availableCapacity?: number;
  // Chalet-specific
  hasGarden?: boolean;
  hasBeach?: boolean;
  hasPool?: boolean;
  // Documents
  contract?: string;
  interiorDesign?: string | null;
  reviews: any[];
  calendar: any[];
  createdAt: string;
  updatedAt: string;
  appearTo?: string;
  // Group-based pricing (camp, booth)
  groups?: Array<{
    price?: number;
    [key: string]: any;
  }>;
  // Hotel apartment pricing
  apartments?: Array<{
    dailyPrice?: number | string;
    weeklyPrice?: number | string;
    monthlyPrice?: number | string;
    isDaily?: boolean;
    isWeekly?: boolean;
    isMonthly?: boolean;
    [key: string]: any;
  }>;
}

export interface PropertiesResponse {
  status: string;
  message: string;

  data: {
    data: Property[];
    total?: number;
    itemsCount?: number;
    page: number;
    size: number;
    totalPages?: number;
    pages?: number;
  };

}

export interface GetPropertiesParams {
  page?: number;
  size?: number;
  isFeatured?: boolean;
  category?: string;
  type?: string;
  priceFrom?: number;
  priceTo?: number;
  city?: string;
  country?: string;
  sortBy?: "mostPopular" | "bestOffer" | "nearest";
  sort?: string;
  owner?: string;
  offerType?: "RENT" | "INSTALLMENT" | "SALE" | string;
  search?: string;
  bedrooms?: string | number;
  bathrooms?: string | number;
  isDaily?: boolean | string;
  isWeekly?: boolean | string;
  isMonthly?: boolean | string;
  isWeekdays?: boolean | string;
  isHolidays?: boolean | string;
}

export interface PropertyService {
  image: string
  accessType: string
  nameAr: string
  nameEn: string
  owner: string
  price: number
  _id: string
}

export const getProperties = async (
  params: GetPropertiesParams = {}
): Promise<PropertiesResponse> => {
  const {
    page = 1,
    size = 10,
    isFeatured,
    category,
    type,
    priceFrom,
    priceTo,
    city,
    country,
    sortBy,
    sort,
    owner,
    offerType,
    search,
    bedrooms,
    bathrooms,
    isDaily,
    isWeekly,
    isMonthly,
    isWeekdays,
    isHolidays,
  } = params;

  // Build query params
  const queryParams = new URLSearchParams();
  queryParams.append("page", page.toString());
  queryParams.append("size", size.toString());

  if (isFeatured) {
    queryParams.append("promoted", "homeFeature");
  }

  if (category) {
    queryParams.append("category", category);
  }

  if (type) {
    queryParams.append("type", type);
  }

  if (priceFrom !== undefined) {
    queryParams.append("priceFrom", priceFrom.toString());
  }

  if (priceTo !== undefined) {
    queryParams.append("priceTo", priceTo.toString());
  }

  if (city) {
    queryParams.append("city", city);
  }

  if (country) {
    queryParams.append("country", country);
  }

  // Handle both sortBy/sort naming conventions
  const effectiveSort = sortBy ?? sort;
  if (effectiveSort) {
    queryParams.append("sortBy", effectiveSort);
  }

  if (owner) {
    queryParams.append("owner", owner);
  }

  if (offerType) {
    queryParams.append("offerType", offerType);
  }

  if (search) {
    queryParams.append("search", search);
  }

  if (bedrooms) {
    queryParams.append("bedrooms", bedrooms.toString());
  }

  if (bathrooms) {
    queryParams.append("bathrooms", bathrooms.toString());
  }

  // Time-based availability filters
  if (isDaily) {
    queryParams.append("isDaily", "true");
  }

  if (isWeekly) {
    queryParams.append("isWeekly", "true");
  }

  if (isMonthly) {
    queryParams.append("isMonthly", "true");
  }

  if (isWeekdays) {
    queryParams.append("isWeekdays", "true");
  }

  if (isHolidays) {
    queryParams.append("isHolidays", "true");
  }

  const url = `/properties/?${queryParams.toString()}`;
  const response = await noAuthAxios.get<PropertiesResponse>(url);
  return response.data;
};

export const getPropertyById = async (id: string): Promise<Property> => {
  const response = await noAuthAxios.get<{
    status: string;
    message: string;
    data: Property;
  }>(`/properties/${id}/`);
  return response.data.data;
};
