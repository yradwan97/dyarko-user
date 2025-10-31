import axiosClient from "../axios-client";

export interface Category {
  _id: number;
  image: string;
  key: string;
  name: string;
}

export interface CategoriesResponse {
  data: Category[];
}

export const getCategories = async (): Promise<Category[]> => {
  const response = await axiosClient.get<CategoriesResponse>("/properties/categories");
  return response.data.data;
};
