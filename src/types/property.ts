export interface Property {
  popular: boolean;
  _id: string;
  image: string | null;
  title: string;
  description: string;
  code: string;
  city: string;
  region: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  area: number;
  payment_type?: string;
  is_daily?: boolean;
  is_weekly?: boolean;
  is_monthly?: boolean;
  daily_price?: number;
  weekly_price?: number;
  monthly_price?: number;
}

export interface SearchFilters {
  available_date?: Date | null;
  location?: string;
  price_from?: number;
  price_to?: number;
  property_type?: string;
}

export interface PropertiesFilter extends SearchFilters {
  page?: string;
  size?: string;
  payment_type?: string;
  owner?: string;
}

export interface Owner {
  number_of_properties: number;
  average_rating: number;
  _id: string;
  role: string;
  name: string;
  image: string | null;
}

export interface Review {
  _id: string;
  owner: string;
  user: User;
  rate: number;
  comment: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export class User {
  id: string;
  _id: string;
  name: string;
  image: string;

  constructor(id: string, name: string, image: string, _id: string) {
    this.id = id;
    this.name = name;
    this._id = _id;
    this.image = image;
  }
}

export type VideoLike = {
  id: string;
  user: User;
};

export type Video = {
  _id: string;
  name: string;
  title: string;
  user: User;
  thumbnail: string;
  comments: number;
  like: unknown;
  views: number;
};

export type PropertyType = {
  name: string;
  value: string;
};

export type Governorate = {
  id: string;
  icon: string;
};
