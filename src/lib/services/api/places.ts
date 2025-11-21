import axiosClient, { noAuthAxios } from "../axios-client";

export interface City {
  city: string;
  cityAr: string;
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

export interface Nationality {
  nameAr: string;
  nameEn: string;
  code: string;
}

export interface NationalitiesResponse {
  status: string;
  message: string;
  data: Nationality[];
}

export const getCities = async (countryCode: string): Promise<City[]> => {
  const response = await axiosClient.get<CitiesResponse>(
    `/places/cities?countryCode=${countryCode}`
  );
  console.log("Fetched cities:", response.data.data);
  return response.data.data;
};

export const getCountries = async (): Promise<Country[]> => {
  const response = await axiosClient.get<CountriesResponse>("/static/countries");
  return response.data.data;
};

export const getAllNationalities = async (): Promise<Nationality[]> => {
  const response = await noAuthAxios.get<NationalitiesResponse>("/static/countries/all");
  return response.data.data;
};
