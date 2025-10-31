'use client';

import { useSession } from "next-auth/react";
import { axiosClient } from "@/lib/services/axios-client";
import { useEffect, type PropsWithChildren } from "react";
import { jwtDecode } from "jwt-decode";
import dayjs from "dayjs";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";

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

        if (session && currentAccessToken && !isExpired(currentAccessToken)) {
          config.headers["auth-token"] = `Bearer ${currentAccessToken}`;
          return config;
        }

        if (!session) {
          return config;
        }

        const refreshToken = session?.user?.refreshToken;
        try {
          const response = await axiosClient.post(`/refresh_token`, {
            refresh_token: refreshToken,
            role: session?.user?.role
          });

          config.headers["auth-token"] = `Bearer ${response.data.accessToken}`;
          await update();
        } catch (error) {
          if (error && typeof error === 'object' && 'response' in error) {
            const axiosError = error as { response?: { status?: number } };
            if (axiosError.response?.status === 401 || axiosError.response?.status === 403) {
              const currentPath = getCurrentPath();
              const encodedPath = currentPath ? encodeURIComponent(currentPath) : '';
              const redirectParam = encodedPath ? `?redirect=${encodedPath}` : '';
              const loginUrl = `/${locale}/login${redirectParam}`;
              console.log("🔴 AUTH FAILED: Redirecting from:", currentPath);
              console.log("🔴 AUTH FAILED: Login URL:", loginUrl);
              router.push(loginUrl);
            } else {
              console.error("Error refreshing token:", error);
            }
          } else {
            console.error("Error refreshing token:", error);
          }
        }

        return config;
      },
      (error) => {
        console.error(error);
        return Promise.reject(error);
      }
    );

    // Add response interceptor to handle 401 during session loading
    const responseInterceptor = axiosClient.interceptors.response.use(
      (response) => response,
      (error) => {
        // If we get a 401 and session is still loading, don't redirect
        if (status === "loading" && error?.response?.status === 401) {
          console.log("⚠️ Got 401 while session loading, ignoring...");
          return Promise.reject({ ...error, silent: true });
        }

        // If we get a 401/403 and we're authenticated but token refresh failed
        if (error?.response?.status === 401 || error?.response?.status === 403) {
          if (status === "authenticated") {
            const currentPath = getCurrentPath();
            const encodedPath = currentPath ? encodeURIComponent(currentPath) : '';
            const redirectParam = encodedPath ? `?redirect=${encodedPath}` : '';
            const loginUrl = `/${locale}/login${redirectParam}`;
            console.log("🔴 Got 401/403, redirecting to login");
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
