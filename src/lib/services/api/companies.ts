import axiosClient from "../axios-client";

export interface Owner {
  _id: string;
  role: string;
  name: string;
  organizationName?: string;
  email: string;
  status: string;
  isConfirmed: boolean;
  country: string;
  phoneNumber: string;
  points: number;
  deviceToken?: string;
  ownerType?: string;
  averageRating?: number;
  numberOfReviewers?: number;
  wallet?: number;
  totalBalance?: number;
  paidOutBalance?: number;
  isVerified: boolean;
  __v?: number;
  refundPolicy?: any[];
  iscompletedProfile?: boolean;
  image?: string | null;
  about?: string;
  // Legacy field names for backward compatibility
  average_rating?: number;
  number_of_properties?: number;
}

export interface BestCompany {
  _id: string;
  propertiesCount: number;
  owner: Owner;
}

export interface BestCompaniesResponse {
  status: string;
  message: string;
  data: {
    items: BestCompany[];
    total: number;
    page: number;
    size: number;
    totalPages: number;
  };
}

export interface OwnersResponse {
  status: string;
  message: string;
  data: {
    data: Owner[];
    itemsCount: number;
    pages: number;
  };
}

export interface OwnerDetailResponse {
  status: string;
  message: string;
  data: Owner;
}

export interface GetOwnersParams {
  page?: number;
  size?: number;
  type?: "owner" | "admin";
}

export const getBestCompanies = async (
  page: number = 1,
  size: number = 10,
  country: string = "KW"
): Promise<BestCompaniesResponse> => {
  const response = await axiosClient.get<BestCompaniesResponse>(
    `/companies/best?page=${page}&size=${size}&country=${country}`
  );
  return response.data;
};

export const getOwners = async (
  params: GetOwnersParams = {}
): Promise<OwnersResponse> => {
  const { page = 1, size = 10, type = "owner" } = params;

  const queryParams = new URLSearchParams();
  queryParams.append("page", page.toString());
  queryParams.append("size", size.toString());
  queryParams.append("type", type);

  const response = await axiosClient.get<OwnersResponse>(
    `/owners?${queryParams.toString()}`
  );
  return response.data;
};

export const getOwnerById = async (id: string): Promise<Owner> => {
  const response = await axiosClient.get<OwnerDetailResponse>(`/owners/${id}`);
  return response.data.data;
};

export const followOwner = async (ownerId: string): Promise<void> => {
  await axiosClient.post("/follow", { owner: ownerId });
};

export const unfollowOwner = async (ownerId: string): Promise<void> => {
  await axiosClient.delete(`/follow/${ownerId}`);
};

export const isOwnerFollowed = async (ownerId: string): Promise<boolean> => {
  try {
    const response = await axiosClient.get("/follow");
    const following = response.data.data || [];
    return following.some((f: { _id: string }) => f._id === ownerId);
  } catch (error) {
    console.error("Error checking follow status:", error);
    return false;
  }
};

export interface Review {
  _id: string;
  user: {
    _id: string;
    name: string;
    image?: string | null;
  };
  owner: string | {
    _id: string;
    role: string;
    name: string;
    image?: string | null;
    iscompletedProfile?: boolean;
  };
  rate: number;
  comment: string;
  createdAt?: string;
  updatedAt?: string;
  __v?: number;
}

export interface ReviewsResponse {
  status: string;
  message: string;
  data: {
    data: Review[];
    itemsCount: number;
    pages: number;
  };
}

export interface AddReviewParams {
  owner: string;
  rate: number;
  comment: string;
}

export const getOwnerReviews = async (ownerId: string): Promise<Review[]> => {
  const response = await axiosClient.get<ReviewsResponse>(`/rates?owner=${ownerId}`);
  return response.data.data.data;
};

export const addReview = async (params: AddReviewParams): Promise<void> => {
  await axiosClient.post("/rates", params);
};
