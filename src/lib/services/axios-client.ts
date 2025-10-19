import axios from "axios";

const API_URI = process.env.NEXT_PUBLIC_API_URI;

// Token store to avoid circular dependencies with getSession
let cachedToken: string | null = null;

// Function to set the token (call this after login)
export const setAuthToken = (token: string | null) => {
  cachedToken = token;
};

// Function to get the current token
export const getAuthToken = () => cachedToken;

// Create axios instance for non-authenticated requests
export const noAuthAxios = axios.create({
  baseURL: API_URI,
  timeout: 30000, // Increased timeout to 30 seconds
  headers: {
    "Content-Type": "application/json",
  },
});

// Add response interceptor to handle non-JSON responses
noAuthAxios.interceptors.response.use(
  (response) => response,
  (error) => {
    // If the error response is not JSON, try to extract meaningful info
    if (error.response) {
      const contentType = error.response.headers?.["content-type"];

      // If response is not JSON, wrap it in a proper error object
      if (contentType && !contentType.includes("application/json")) {
        console.error("Non-JSON response received:", error.response.data);

        return Promise.reject({
          response: {
            status: error.response.status,
            data: {
              message: "Server error occurred. Please try again later.",
              error: typeof error.response.data === 'string'
                ? error.response.data.substring(0, 100)
                : "Unknown error"
            }
          }
        });
      }
    }

    return Promise.reject(error);
  }
);

// Create axios instance for authenticated requests
export const axiosClient = axios.create({
  baseURL: API_URI,
  timeout: 5000, // 5 seconds to prevent browser freeze
  headers: {
    "Content-Type": "application/json",
  },
  maxRedirects: 5,
  validateStatus: (status) => status >= 200 && status < 400,
});

// Add request interceptor to attach token to every request
axiosClient.interceptors.request.use(
  (config) => {
    // Use cached token to avoid circular dependencies
    if (cachedToken) {
      config.headers.Authorization = `Bearer ${cachedToken}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add same response interceptor to authenticated client
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const contentType = error.response.headers?.["content-type"];

      if (contentType && !contentType.includes("application/json")) {
        return Promise.reject({
          response: {
            status: error.response.status,
            data: {
              message: "Server error occurred. Please try again later.",
              error: typeof error.response.data === 'string'
                ? error.response.data.substring(0, 100)
                : "Unknown error"
            }
          }
        });
      }
    }

    return Promise.reject(error);
  }
);

export default axiosClient;
