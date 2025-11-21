'use client';

import { useSession } from "next-auth/react";
import { axiosClient, noAuthAxios } from "@/lib/services/axios-client";
import { useEffect, useRef, type PropsWithChildren } from "react";
import { jwtDecode } from "jwt-decode";
import dayjs from "dayjs";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { AxiosError, InternalAxiosRequestConfig } from "axios";

interface DecodedToken {
  exp: number;
}

const isExpired = (accessToken: string) => {
  try {
    const decodedAccessToken = jwtDecode<DecodedToken>(accessToken);
    return dayjs.unix(decodedAccessToken.exp).diff(dayjs()) < 1;
  } catch {
    return true;
  }
};

// Helper function to get current pathname from window
const getCurrentPath = (): string => {
  if (typeof window === 'undefined') return '';
  return window.location.pathname;
};

export function AxiosInterceptorProvider({ children }: PropsWithChildren) {
  const { data: session, update, status } = useSession();
  const router = useRouter();
  const locale = useLocale();

  // Ref to prevent multiple simultaneous refresh attempts
  const isRefreshing = useRef(false);
  const refreshSubscribers = useRef<((token: string) => void)[]>([]);

  // Subscribe to token refresh
  const subscribeTokenRefresh = (callback: (token: string) => void) => {
    refreshSubscribers.current.push(callback);
  };

  // Notify all subscribers with new token
  const onTokenRefreshed = (newToken: string) => {
    refreshSubscribers.current.forEach(callback => callback(newToken));
    refreshSubscribers.current = [];
  };

  useEffect(() => {
    const requestInterceptor = axiosClient.interceptors.request.use(
      async (config) => {
        const currentAccessToken = session?.user?.accessToken;
        config.headers["Accept-Language"] = locale;

        // If session is still loading, abort the request silently
        if (status === "loading") {
          const controller = new AbortController();
          config.signal = controller.signal;
          controller.abort();
          return config;
        }

        // If unauthenticated or no session, proceed without auth header
        if (status === "unauthenticated" || !session) {
          return config;
        }

        // If access token is missing, don't try to refresh - user needs to login
        if (!currentAccessToken) {
          return config;
        }

        // If we have a valid (non-expired) access token, use it
        if (!isExpired(currentAccessToken)) {
          config.headers["auth-token"] = `Bearer ${currentAccessToken}`;
          return config;
        }

        // Token is expired, attempt to refresh
        const refreshToken = session?.user?.refreshToken;
        try {
          // Use noAuthAxios to avoid infinite loop in interceptor
          const response = await noAuthAxios.post(`/auth/token`, {
            refreshToken: refreshToken
          });

          const newAccessToken = response.data.data?.accessToken || response.data.accessToken;

          if (newAccessToken) {
            config.headers["auth-token"] = `Bearer ${newAccessToken}`;

            // Update session with new access token
            await update({
              ...session,
              user: {
                ...session.user,
                accessToken: newAccessToken,
              },
            });
          }
        } catch (error) {
          if (error && typeof error === 'object' && 'response' in error) {
            const axiosError = error as { response?: { status?: number } };
            if (axiosError.response?.status === 401 || axiosError.response?.status === 403) {
              const currentPath = getCurrentPath();
              const encodedPath = currentPath ? encodeURIComponent(currentPath) : '';
              const redirectParam = encodedPath ? `?redirect=${encodedPath}` : '';
              const loginUrl = `/${locale}/login${redirectParam}`;
              router.push(loginUrl);
            }
          }
        }

        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Add response interceptor to handle 401 and refresh token
    const responseInterceptor = axiosClient.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

        // If we get a 401 and session is still loading, don't redirect
        if (status === "loading" && error?.response?.status === 401) {
          return Promise.reject({ ...error, silent: true });
        }

        // Handle 401 errors - attempt to refresh token
        if (error?.response?.status === 401 && !originalRequest._retry) {
          if (status === "authenticated" && session?.user?.refreshToken) {
            // Mark this request as retried to prevent infinite loops
            originalRequest._retry = true;

            // If already refreshing, wait for the new token
            if (isRefreshing.current) {
              return new Promise((resolve) => {
                subscribeTokenRefresh((newToken: string) => {
                  originalRequest.headers["auth-token"] = `Bearer ${newToken}`;
                  resolve(axiosClient(originalRequest));
                });
              });
            }

            isRefreshing.current = true;

            try {
              // Attempt to refresh the token
              const response = await noAuthAxios.post(`/auth/token`, {
                refreshToken: session.user.refreshToken
              });

              const newAccessToken = response.data.data?.accessToken || response.data.accessToken;

              if (newAccessToken) {
                // Update session with new access token
                await update({
                  ...session,
                  user: {
                    ...session.user,
                    accessToken: newAccessToken,
                  },
                });

                // Notify all waiting requests
                onTokenRefreshed(newAccessToken);

                // Retry the original request with new token
                originalRequest.headers["auth-token"] = `Bearer ${newAccessToken}`;
                return axiosClient(originalRequest);
              }
            } catch (refreshError) {
              // Refresh failed, redirect to login
              const currentPath = getCurrentPath();
              const encodedPath = currentPath ? encodeURIComponent(currentPath) : '';
              const redirectParam = encodedPath ? `?redirect=${encodedPath}` : '';
              const loginUrl = `/${locale}/login${redirectParam}`;
              router.push(loginUrl);
              return Promise.reject(refreshError);
            } finally {
              isRefreshing.current = false;
            }
          } else {
            // No refresh token or not authenticated, redirect to login
            const currentPath = getCurrentPath();
            const encodedPath = currentPath ? encodeURIComponent(currentPath) : '';
            const redirectParam = encodedPath ? `?redirect=${encodedPath}` : '';
            const loginUrl = `/${locale}/login${redirectParam}`;
            router.push(loginUrl);
          }
        }

        // Handle 403 errors
        if (error?.response?.status === 403) {
          if (status === "authenticated") {
            const currentPath = getCurrentPath();
            const encodedPath = currentPath ? encodeURIComponent(currentPath) : '';
            const redirectParam = encodedPath ? `?redirect=${encodedPath}` : '';
            const loginUrl = `/${locale}/login${redirectParam}`;
            router.push(loginUrl);
          }
        }

        return Promise.reject(error);
      }
    );

    return () => {
      axiosClient.interceptors.request.eject(requestInterceptor);
      axiosClient.interceptors.response.eject(responseInterceptor);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, locale, status]);

  return <>{children}</>;
}
