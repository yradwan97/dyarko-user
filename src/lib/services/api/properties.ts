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
  services: string[];
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
      total: number;
      page: number;
      size: number;
      totalPages: number;
    };
  
}

export interface GetPropertiesParams {
  page?: number;
  size?: number;
  isFeatured?: boolean;
  category?: string;
  type?: string;
  minPrice?: number;
  maxPrice?: number;
  city?: string;
  sortBy?: "mostPopular" | "bestOffer" | "nearest";
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
    minPrice,
    maxPrice,
    city,
    sortBy,
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

  if (minPrice !== undefined) {
    queryParams.append("minPrice", minPrice.toString());
  }

  if (maxPrice !== undefined) {
    queryParams.append("maxPrice", maxPrice.toString());
  }

  if (city) {
    queryParams.append("city", city);
  }

  if (sortBy) {
    queryParams.append("sortBy", sortBy);
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
