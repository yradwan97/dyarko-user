import axios from "axios";

// Extend Window interface to include our redirect flag
declare global {
  interface Window {
    __redirectingToLogin?: boolean;
  }
}

const API_URI = process.env.NEXT_PUBLIC_API_URI;

// Create axios instance for non-authenticated requests
export const noAuthAxios = axios.create({
  baseURL: API_URI,
  timeout: 30000, // Increased timeout to 30 seconds
  headers: {
    "Content-Type": "application/json",
  },
});

// No request interceptor needed for non-authenticated requests
// Accept-Language will be handled by the provider

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

// Request interceptor removed - token and locale handling moved to AxiosInterceptorProvider
// This allows for reactive token management with NextAuth session

// Response interceptor for handling non-JSON responses
// Note: 401/403 auth errors are handled in AxiosInterceptorProvider
axiosClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Handle non-JSON responses
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
