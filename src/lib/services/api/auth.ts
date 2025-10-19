import axiosClient, { noAuthAxios } from "../axios-client";

const LOGIN_API_URI = `/auth/login`;
const VERIFY_AUTH_API_URI = `/auth/verify_auth`;
const SIGNUP_AUTH_API_URI = `/auth/users`;
const LOGOUT_AUTH_API_URI = `/auth/logout`;

export interface LoginCredentials {
  email: string;
  password: string;
  role?: string;
}

export interface SignupData {
  civilianId: string;
  phoneNumber: string;
  email: string;
  name: string;
  type: string;
  role: string;
  group?: string;
  password: string;
}

export const login = async (user: LoginCredentials) => {
  const res = await noAuthAxios.post(LOGIN_API_URI, {
    email: user.email,
    password: user.password,
    role: user.role || "user",
  });

  return res;
};

export const signup = async (newUser: SignupData) => {
  const signUpBody = {
    civilian_id: newUser.civilianId,
    phone: newUser.phoneNumber,
    email: newUser.email,
    name: newUser.name,
    type: newUser.type,
    role: newUser.role,
    group: newUser.group || "",
    password: newUser.password,
  };

  const res = await noAuthAxios.post(SIGNUP_AUTH_API_URI, signUpBody);
  return res.data;
};

export const logout = async (refreshToken: string) => {
  const res = await axiosClient.post(LOGOUT_AUTH_API_URI, {
    refresh_token: refreshToken,
  });

  return res.data;
};

export const verifyAuth = async () => {
  const res = await axiosClient.get(VERIFY_AUTH_API_URI);
  return res.data;
};
