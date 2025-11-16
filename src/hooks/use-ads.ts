import { useMutation, useQuery } from "@tanstack/react-query";
import axiosClient from "@/lib/services/axios-client";

export interface CreateAdData {
  title: string;
  description: string;
  price: number;
  priceType: "daily" | "weekly" | "monthly";
  paymentMethod: string;
}

export interface UserAd {
  _id: string;
  user: {
    _id: string;
    name: string;
    country: string;
  };
  title: string;
  description: string;
  price: number | { from: number; to: number };
  priceType: "daily" | "weekly" | "monthly";
  __v: number;
  comment: string | null;
}

export interface UserAdsResponse {
  status: string;
  message: string;
  data: {
    data: UserAd[];
    itemsCount: number;
    pages: number;
  };
}

export function useCreateAd() {
  return useMutation({
    mutationFn: async (data: CreateAdData) => {
      const response = await axiosClient.post("/ads", data);
      return response.data;
    },
  });
}

export interface AdComment {
  _id: string;
  owner: {
    _id: string;
    role: string;
    name: string;
    image?: string;
    iscompletedProfile: boolean;
  };
  comment: string;
  property: any;
  userAd: string;
  __v: number;
}

export interface AdCommentsResponse {
  status: string;
  message: string;
  data: AdComment[];
}

export interface AdDetailsResponse {
  status: string;
  message: string;
  data: UserAd;
}

export function useUserAds(userId: string | undefined, page: number = 1) {
  return useQuery({
    queryKey: ["user-ads", userId, page],
    queryFn: async () => {
      if (!userId) throw new Error("User ID is required");
      const response = await axiosClient.get<UserAdsResponse>(
        `/ads?user=${userId}&page=${page}`
      );
      return response.data;
    },
    enabled: !!userId,
  });
}

export function useAdDetails(adId: string | undefined) {
  return useQuery({
    queryKey: ["ad-details", adId],
    queryFn: async () => {
      if (!adId) throw new Error("Ad ID is required");
      const response = await axiosClient.get<AdDetailsResponse>(`/ads/${adId}`);
      return response.data;
    },
    enabled: !!adId,
  });
}

export function useAdComments(adId: string | undefined) {
  return useQuery({
    queryKey: ["ad-comments", adId],
    staleTime: 5 * 60 * 1000, // 5 minutes
    queryFn: async () => {
      if (!adId) throw new Error("Ad ID is required");
      const response = await axiosClient.get<AdCommentsResponse>(`/ads/comments/${adId}`);
      return response.data;
    },
    enabled: !!adId,
  });
}
