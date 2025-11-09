import axiosClient from "../axios-client";

export interface Service {
  _id: string;
  nameAr: string;
  nameEn: string;
  price: number;
  image: string;
}

export interface ServicesResponse {
  status: string;
  message: string;
  data: {
    data: Service[];
    itemsCount: number;
    pages: number;
  };
}

export interface RequestServicesPayload {
  rent: string;
  services: string[];
}

export interface RequestServicesResponse {
  status: string;
  message: string;
  data: any;
}

export const getPublicServices = async (): Promise<Service[]> => {
  const response = await axiosClient.get<ServicesResponse>(
    "/free-services"
  );
  return response.data.data.data;
};

export const requestServices = async (
  payload: RequestServicesPayload
): Promise<RequestServicesResponse> => {
  const response = await axiosClient.post<RequestServicesResponse>(
    "/requests/services",
    payload
  );
  return response.data;
};
