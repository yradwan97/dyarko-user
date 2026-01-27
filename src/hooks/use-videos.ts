"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getVideos,
  getVideoById,
  getVideoComments,
  addVideoComment,
  deleteVideoComment,
  type GetVideosParams,
  type GetCommentsParams,
} from "@/lib/services/api/reels";

export function useVideos(params: GetVideosParams = {}) {
  return useQuery({
    queryKey: ["videos", params],
    queryFn: () => getVideos(params),
    staleTime: 1000 * 60 * 15, // 15 minutes
  });
}

export function useVideo(id: string) {
  return useQuery({
    queryKey: ["video", id],
    queryFn: () => getVideoById(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 30, // 30 minutes
  });
}

export function useVideoComments(id: string, params: GetCommentsParams = {}) {
  return useQuery({
    queryKey: ["video-comments", id, params],
    queryFn: () => getVideoComments(id, params),
    enabled: !!id && params.enabled !== false,
    staleTime: 1000 * 60, // 1 minute
  });
}

export function useAddVideoComment(videoId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (comment: string) => addVideoComment(videoId, comment),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["video-comments", videoId] });
    },
  });
}

export function useDeleteVideoComment(videoId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (commentId: string) => deleteVideoComment(commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["video-comments", videoId] });
    },
  });
}
