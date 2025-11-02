import axiosClient, { noAuthAxios } from "../axios-client";

const LOGIN_API_URI = `/auth/login`;
const VERIFY_AUTH_API_URI = `/auth/verify_auth`;
const SIGNUP_AUTH_API_URI = `/auth/register`;
const LOGOUT_AUTH_API_URI = `/auth/logout`;

export interface LoginCredentials {
  email: string;
  password: string;
  role?: string;
}

export interface SignupData {
  phoneNumber: string;
  email: string;
  name: string;
  country: string;
  nationality: string;
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
    role: "user",
    phoneNumber: newUser.phoneNumber,
    email: newUser.email,
    name: newUser.name,
    country: newUser.country,
    nationality: newUser.nationality,
    password: newUser.password,
  };

  console.log("🔵 API: Sending signup request to:", SIGNUP_AUTH_API_URI);
  console.log("🔵 API: Request body:", signUpBody);

  try {
    const res = await noAuthAxios.post(SIGNUP_AUTH_API_URI, signUpBody);
    console.log("🟢 API: Signup response status:", res.status);
    console.log("🟢 API: Signup response data:", res.data);
    return res.data;
  } catch (error: any) {
    console.error("🔴 API: Signup request failed");
    console.error("🔴 API: Error details:", {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      config: {
        url: error.config?.url,
        method: error.config?.method,
        baseURL: error.config?.baseURL,
      },
    });
    throw error;
  }
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
