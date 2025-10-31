import axiosClient from "../axios-client";

export interface City {
  city: string;
  ref: string;
  key: string;
}

export interface CitiesResponse {
  data: City[];
}

export interface Country {
  countryAr: string;
  countryEn: string;
  code: string;
  nationality: string;
  countryCode: string;
  mobileLength: number;
  nationalIdLength: number;
  currency: string;
}

export interface CountriesResponse {
  status: string;
  message: string;
  data: Country[];
}

export const getCities = async (countryCode: string): Promise<City[]> => {
  const response = await axiosClient.get<CitiesResponse>(
    `/places/cities?countryCode=${countryCode}`
  );
  return response.data.data;
};

export const getCountries = async (): Promise<Country[]> => {
  const response = await axiosClient.get<CountriesResponse>("/static/countries");
  return response.data.data;
};
