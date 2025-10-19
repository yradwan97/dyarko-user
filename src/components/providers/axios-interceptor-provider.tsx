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

export function AxiosInterceptorProvider({ children }: PropsWithChildren) {
  const { data: session, update } = useSession();
  const router = useRouter();
  const locale = useLocale();

  useEffect(() => {
    const axiosInterceptor = axiosClient.interceptors.request.use(
      async (config) => {
        const currentAccessToken = session?.user?.accessToken;
        config.headers["Accept-Language"] = locale;

        if (session && currentAccessToken && !isExpired(currentAccessToken)) {
          config.headers['auth-token'] = `Bearer ${currentAccessToken}`;
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
              router.push(`/${locale}/login`);
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

    return () => {
      axiosClient.interceptors.request.eject(axiosInterceptor);
    };
  }, [session, router, update, locale]);

  return <>{children}</>;
}
