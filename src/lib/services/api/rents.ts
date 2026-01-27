import axiosClient from "../axios-client";

export interface CreateRentPayload {
  property: string;
  rentType: string;
  startDate: string;
  endDate: string;
  services?: string[];
  apartments?: Array<{
    type: string;
    units: number;
  }>;
  tents?: string[];
  startTime?: string;
  endTime?: string;
  lat?: string;
  long?: string;
  paymentMethod?: string;
}

export interface ProceedRentRequestPayload {
  request: string;
  paymentMethod?: string;
}

export interface PriceDetails {
  totalAmount: number;
  rent: number;
  insurance: number;
  commission: number;
  tax: number;
  services: number;
}

export interface CreateRentResponse {
  status: string;
  message: string;
  data: {
    PayUrl: string;
    sessionId: string;
    priceDetails: PriceDetails;
  };
}

export interface ProceedRentRequestResponse {
  status: string;
  message: string;
  data: {
    PayUrl: string;
    sessionId: string;
    priceDetails: PriceDetails;
  };
}

export interface CreateRentRequestResponse {
  status: string;
  message: string;
  data?: any;
}

export interface RentOwner {
  _id: string;
  name: string;
  phoneNumber?: string;
  image?: string;
}

export interface RentPropertyGroup {
  _id: string;
  name: string;
  color: string;
  area: number;
  ids: number[];
  description: string;
  price: number;
  insurance: number;
}

export interface RentPropertyApartment {
  _id: string;
  name: string;
  description?: string;
  price: number;
  area?: number;
}

export interface RentProperty {
  _id: string;
  type?: string;
  code: string;
  category: string;
  title: string;
  country: string;
  city: string;
  lat: number;
  long: number;
  image: string | null;
  contract: string | null;
  __t: string;
  video: string | null;
  interiorDesign: string | null;
  purchaseContract: string | null;
  checkInTime?: string;
  checkOutTime?: string;
  groups?: RentPropertyGroup[];
  apartments?: RentPropertyApartment[];
}

export interface RentUser {
  name: string;
  phoneNumber: string;
  nationalID: string;
  image: string;
}

export interface RentService {
  _id: string;
  name: string;
  amount: number;
}

export interface Rent {
  _id: string;
  owner: RentOwner;
  property: RentProperty;
  user: RentUser;
  status: string;
  startDate: string;
  endDate: string;
  services: RentService[];
  rentType: string;
  transaction: string;
  amount: number;
  lat?: string;
  long?: string;
  lastPaidAt?: string;
  tents?: number[];
  apartments?: string[];
  endContract: {
    _id: string
    reason: string
    file: string
  }
}

export interface RentsResponse {
  status: string;
  message: string;
  data: {
    data: Rent[];
    itemsCount: number;
    pages: number;
  };
}

export interface RentDetailsResponse {
  status: string;
  message: string;
  data: Rent;
}

export const createRent = async (
  payload: CreateRentPayload
): Promise<CreateRentResponse> => {
  const response = await axiosClient.post<CreateRentResponse>(
    "/rents",
    payload
  );
  return response.data;
};

export const proceedRentRequest = async (
  payload: ProceedRentRequestPayload
): Promise<ProceedRentRequestResponse> => {
  const response = await axiosClient.post<ProceedRentRequestResponse>(
    "/requests/rents/proceed",
    payload
  );
  return response.data;
};

export const getRents = async (page: number = 1): Promise<RentsResponse> => {
  const response = await axiosClient.get<RentsResponse>(
    `/rents?page=${page}&size=12`
  );
  return response.data;
};

export const getRentById = async (id: string): Promise<Rent> => {
  const response = await axiosClient.get<RentDetailsResponse>(`/rents/${id}`);
  return response.data.data;
};

export const createRentRequest = async (
  payload: CreateRentPayload
): Promise<CreateRentRequestResponse> => {
  const response = await axiosClient.post<CreateRentRequestResponse>(
    "/requests/rents",
    payload
  );
  return response.data;
};

export interface ValidateRentTimePayload {
  startDate: string;
  endDate: string;
  rentType: string;
  property: string;
}

export interface ValidateRentTimeResponse {
  status: string;
  message: string;
  data: {
    isValid: boolean;
    message: string;
  };
}

export const validateRentTime = async (
  payload: ValidateRentTimePayload
): Promise<ValidateRentTimeResponse> => {
  const response = await axiosClient.post<ValidateRentTimeResponse>(
    "/rents/validateTime",
    payload
  );
  return response.data;
};
