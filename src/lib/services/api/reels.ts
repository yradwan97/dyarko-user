import { axiosClient } from "../axios-client";

export interface VideoUser {
  _id: string;
  name?: string;
  username?: string;
  image?: string | null;
  profilePicture?: string;
  role?: string;
}

export interface VideoLike {
  count: number;
  isLiked?: boolean;
}

// Interface for reels in list view
export interface Video {
  _id: string;
  title: string;
  user: VideoUser;
  thumbnail: string;
  video: string;
  comments?: number;
  like?: VideoLike;
  views?: number;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
  expirationDate?: string;
}

// Interface for detailed reel data from getReelById
export interface ReelDetail {
  _id: string;
  status: "APPROVED" | "PENDING" | "REJECTED";
  title: string;
  description: string;
  thumbnail: string;
  views: number;
  expirationDate: string;
  pinned: boolean;
  path: string;
  owner: string; // User ID
  createdByAdmin: boolean;
  createdAt: string;
  updatedAt: string;
  __v: number;
  adminComment?: string;
}

// Interface for likes data
export interface ReelLikes {
  count: number;
  status: boolean; // true if liked, false if not
}

// Interface for the complete detailed reel response
export interface DetailedReelData {
  reel: ReelDetail;
  likes: ReelLikes;
  commentsCount: number;
}

export interface VideosResponse {
  status: string;
  message: string;
  data: {
    data: Video[];
    total: number;
    page: number;
    size: number;
    totalPages: number;
  };
}

export interface VideoResponse {
  status: string;
  message: string;
  data: Video;
}

export interface DetailedReelResponse {
  status: string;
  message: string;
  data: DetailedReelData;
}

export interface GetVideosParams {
  page?: number;
  size?: number;
  search?: string;
  owner?: string;
}

export const getVideos = async (
  params: GetVideosParams = {}
): Promise<VideosResponse> => {
  const { page = 1, size = 9, search, owner } = params;

  // Build query params
  const queryParams = new URLSearchParams();
  queryParams.append("page", page.toString());
  queryParams.append("size", size.toString());

  if (search) {
    queryParams.append("search", search);
  }

  if (owner) {
    queryParams.append("owner", owner);
  }

  const url = `/reels?${queryParams.toString()}`;
  const response = await axiosClient.get<VideosResponse>(url);
  return response.data;
};

export const getVideoById = async (id: string): Promise<DetailedReelData> => {
  const response = await axiosClient.get<DetailedReelResponse>(`/reels/${id}`);
  return response.data.data;
};

export const createVideoView = async (id: string): Promise<void> => {
  try {
    await axiosClient.post(`/reels/${id}/views`);
  } catch (error) {
    console.error("Error creating video view:", error);
  }
};

export const likeVideo = async (
  id: string,
  isLiked: boolean
): Promise<void> => {
  if (isLiked) {
    await axiosClient.delete(`/reels/${id}/likes`);
  } else {
    await axiosClient.post(`/reels/${id}/likes`);
  }
};

// Comments interfaces
export interface CommentUser {
  _id: string;
  name?: string;
  username?: string;
  profilePicture?: string;
  image?: string;
}

export interface Comment {
  _id: string;
  user: CommentUser;
  comment: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CommentsResponse {
  status: string;
  message: string;
  data: {
    data: Comment[];
    total: number;
    page: number;
    size: number;
    totalPages: number;
  };
}

export interface GetCommentsParams {
  page?: number;
  size?: number;
}

// Comments API functions
export const getVideoComments = async (
  id: string,
  params: GetCommentsParams = {}
): Promise<CommentsResponse> => {
  const { page = 1, size = 10 } = params;

  const queryParams = new URLSearchParams();
  queryParams.append("page", page.toString());
  queryParams.append("size", size.toString());

  const url = `/reels/${id}/comments?${queryParams.toString()}`;
  const response = await axiosClient.get<CommentsResponse>(url);
  return response.data;
};

export const addVideoComment = async (
  id: string,
  comment: string
): Promise<void> => {
  await axiosClient.post(`/reels/${id}/comments`, { comment });
};

export const deleteVideoComment = async (
  commentId: string
): Promise<void> => {
  await axiosClient.delete(`/reels/comments/${commentId}`);
};

// Alternative comment creation endpoint
export const createReelComment = async (
  reelId: string,
  comment: string
): Promise<void> => {
  await axiosClient.post("/reels/comments", {
    reel: reelId,
    comment: comment,
  });
};
