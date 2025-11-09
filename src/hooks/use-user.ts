"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { axiosClient } from "@/lib/services";

// Types
export interface WalletTransaction {
  _id: string;
  amount: number;
  type: string;
  status: string;
  description: string;
  paid_at: string;
  createdAt: string;
}

export interface WalletData {
  balance: number;
  transactions: WalletTransaction[];
  pages: number;
  itemsCount: number;
}

export interface SavedProperty {
  _id: string;
  property: any; // You can type this better based on your Property interface
  createdAt: string;
}

export interface BankInfo {
  IBAN: string;
  bankName: string;
  swiftCode: string;
  ACCName: string;
  _id?: string;
}

export interface SocialMedia {
  facebook: string;
  X: string;
  linkedin: string;
  snapchat: string;
  _id?: string;
}

export interface UserProfile {
  _id: string;
  name: string;
  email: string;
  phoneNumber: string;
  image?: string | null;
  role: string;
  status: string;
  country: string;
  points: number;
  isConfirmed: boolean;
  nationalID?: string;
  deviceToken?: string;
  bankInfo?: BankInfo;
  socialMedia?: SocialMedia;
  __v?: number;
}

// Wallet hooks
export function useGetWalletData(page: number = 1) {
  const { data: session, status } = useSession();

  return useQuery({
    queryKey: ["user-wallet", page],
    queryFn: async () => {
      const response = await axiosClient.get(`/wallet?page=${page}`);
      return response.data as { data: WalletData };
    },
    enabled: status === "authenticated" && !!session,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

// Saved Properties hooks
export function useGetSavedProperties(page: number = 1) {
  const { data: session, status } = useSession();

  return useQuery({
    queryKey: ["saved-properties", page],
    queryFn: async () => {
      const response = await axiosClient.get(`/favourites?type="PROPERTY"&page=${page}`);
      return response.data as {
        data: SavedProperty[];
        pages: number;
        itemsCount: number;
      };
    },
    enabled: status === "authenticated" && !!session,
    staleTime: 1000 * 60 * 5,
  });
}

// Transactions hooks
export function useGetTransactions(page: number = 1) {
  const { data: session, status } = useSession();

  return useQuery({
    queryKey: ["transactions", page],
    queryFn: async () => {
      const response = await axiosClient.get(`/wallet/transactions?page=${page}`);
      const data = response.data as { data: { wallet: WalletTransaction[] } };

      // Sort by date descending
      if (data.data.wallet) {
        data.data.wallet.sort((a, b) => {
          return new Date(b.paid_at).getTime() - new Date(a.paid_at).getTime();
        });
      }

      return data;
    },
    enabled: status === "authenticated" && !!session,
    staleTime: 1000 * 60 * 5,
  });
}

// Requests hooks
export function useGetRequests(endpoint: string, page: number = 1) {
  const { data: session, status } = useSession();

  return useQuery({
    queryKey: ["requests", endpoint, page],
    queryFn: async () => {
      // Check if endpoint already has query parameters
      const separator = endpoint.includes('?') ? '&' : '?';
      const response = await axiosClient.get(`${endpoint}${separator}page=${page}`);
      return response.data;
    },
    enabled: status === "authenticated" && !!session && !!endpoint,
    staleTime: 1000 * 60 * 5,
  });
}

// Real Estates hooks
export function useGetRealEstates(endpoint: string) {
  const { data: session, status } = useSession();

  return useQuery({
    queryKey: ["real-estates", endpoint],
    queryFn: async () => {
      const response = await axiosClient.get(endpoint);
      const data = response.data as { data: any[] };

      // Sort by creation date descending
      if (data.data) {
        data.data.sort((a, b) => {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });
      }

      return data;
    },
    enabled: status === "authenticated" && !!session && !!endpoint,
    staleTime: 1000 * 60 * 5,
  });
}

// User Profile hooks
export function useGetUser() {
  const { data: session, status } = useSession();

  return useQuery({
    queryKey: ["user-profile"],
    queryFn: async () => {
      const response = await axiosClient.get("/users");
      return response.data as { data: UserProfile };
    },
    enabled: status === "authenticated" && !!session,
    staleTime: 1000 * 60 * 5,
  });
}

// Update User Profile
export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Partial<UserProfile>) => {
      const response = await axiosClient.put("/users", data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-profile"] });
    },
  });
}

// Update User Image
export function useUpdateUserImage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("image", file);

      const response = await axiosClient.post("/users/image", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-profile"] });
    },
  });
}

// Change Password
export function useChangePassword() {
  return useMutation({
    mutationFn: async ({
      currentPassword,
      newPassword,
    }: {
      currentPassword: string;
      newPassword: string;
    }) => {
      const response = await axiosClient.put("/auth/change_password", {
        currentPassword,
        newPassword,
      });
      return response.data;
    },
  });
}
