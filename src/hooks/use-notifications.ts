"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { axiosClient } from "@/lib/services";
import type { Notification } from "@/types";
import { Session } from "next-auth";

export function useGetNotifications(session: Session, page: number = 1) {
  return useQuery<{data: Notification[], pages: number, itemsCount: number, unreadCount: number}>({
    queryKey: ["notifications", page],
    queryFn: async () => {
      let response = await axiosClient.get(`/notifications?page=${page}&sort=1`);
      return response.data.data
    },
    enabled: !!session, // Only fetch when user is logged in
  });
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const response = await axiosClient.put("/notifications/update_all", {
        isRead: true,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await axiosClient.put(`/notifications/${id}`, {
        isRead: true,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}
