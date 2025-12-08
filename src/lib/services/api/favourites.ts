import { useSession } from "next-auth/react";
import axiosClient from "../axios-client";
import { Property } from "./properties";

export interface AddFavouritePayload {
  item: string;
  type: "PROPERTY" | "COMPANY";
}

export interface FavouriteResponse {
  status: string;
  message: string;
  data?: any;
}

export interface FavouriteItem {
  _id: string;
  type: string;
  item: Property;
  user: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface GetFavouritesResponse {
  status: string;
  message: string;
  data: {
    data: FavouriteItem[];
    itemsCount: number;
    pages: number;
  };
}

/**
 * Check if a property is favorited
 * Returns status 200 if favorited, 400 if not
 */
export const checkFavourite = async (propertyId: string): Promise<boolean> => {
  try {
    const response = await axiosClient.get<FavouriteResponse>(
      `/favourites/${propertyId}`
    );
    return response.status === 200;
  } catch (error: any) {
    // Status 400 means not favorited
    return false;
  }
};

/**
 * Add a property to favorites
 */
export const addFavourite = async (
  propertyId: string
): Promise<FavouriteResponse> => {
  const response = await axiosClient.post<FavouriteResponse>(
    "/favourites",
    {
      item: propertyId,
      type: "PROPERTY",
    }
  );
  return response.data;
};

/**
 * Remove a property from favorites
 */
export const removeFavourite = async (
  propertyId: string
): Promise<FavouriteResponse> => {
  const response = await axiosClient.delete<FavouriteResponse>(
    `/favourites/${propertyId}`
  );
  return response.data;
};

/**
 * Get all favorited properties with pagination
 */
export const getFavourites = async (page: number = 1): Promise<{
  data: FavouriteItem[];
  itemsCount: number;
  pages: number;
}> => {
  const response = await axiosClient.get<GetFavouritesResponse>(
    `/favourites?type=PROPERTY&page=${page}`
  );
  return response.data.data;
};

/**
 * Check if a company is favorited
 * Returns status 200 if favorited, 400 if not
 */
export const checkCompanyFavourite = async (companyId: string): Promise<boolean> => {
  try {
    const response = await axiosClient.get<FavouriteResponse>(
      `/favourites/${companyId}?type=COMPANY`
    );
    return response.status === 200;
  } catch (error: any) {
    // Status 400 means not favorited
    return false;
  }
};

/**
 * Add a company to favorites
 */
export const addCompanyFavourite = async (
  companyId: string
): Promise<FavouriteResponse> => {
  const response = await axiosClient.post<FavouriteResponse>(
    "/favourites",
    {
      item: companyId,
      type: "COMPANY",
    }
  );
  return response.data;
};

/**
 * Remove a company from favorites
 */
export const removeCompanyFavourite = async (
  companyId: string
): Promise<FavouriteResponse> => {
  const response = await axiosClient.delete<FavouriteResponse>(
    `/favourites/${companyId}?type=COMPANY`
  );
  return response.data;
};

/**
 * Get all favorited companies with pagination
 */
export const getCompanyFavourites = async (page: number = 1): Promise<{
  data: FavouriteItem[];
  itemsCount: number;
  pages: number;
}> => {
  const response = await axiosClient.get<GetFavouritesResponse>(
    `/favourites?type=COMPANY&page=${page}`
  );
  return response.data.data;
};
