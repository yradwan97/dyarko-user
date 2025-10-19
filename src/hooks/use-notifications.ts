"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { axiosClient } from "@/lib/services";
import type { Notification } from "@/types";

export function useGetNotifications() {
  return useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      const response = await axiosClient.get("/notifications");
      return response.data as { data: Notification[] };
    },
    enabled: false, // Only fetch when user is logged in
  });
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const response = await axiosClient.put("/notifications/update_all", {
        is_read: true,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}
