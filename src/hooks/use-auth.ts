"use client";

import { useMutation } from "@tanstack/react-query";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "sonner";
import axios from "axios";

import type { LoginCredentials, SignupData } from "@/lib/services/api/auth";
import { signup as signupApi } from "@/lib/services/api/auth";
import { getLocalizedPath } from "@/lib/utils";

// Helper to extract error messages from various error formats
function extractErrorMessage(error: unknown, t: (key: string) => string): string {
  if (axios.isAxiosError(error)) {
    // Handle axios errors
    const data = error.response?.data;

    if (typeof data === "string") {
      return data;
    }

    if (data?.message) {
      return data.message;
    }

    if (data?.errors && Array.isArray(data.errors) && data.errors.length > 0) {
      return data.errors[0].msg || data.errors[0].message || t("errors.generic");
    }

    if (error.response?.status === 401) {
      return t("errors.invalidCredentials");
    }

    if (error.response?.status === 500) {
      return t("errors.serverError");
    }

    if (error.code === "ECONNABORTED" || error.code === "ERR_NETWORK") {
      return t("errors.networkError");
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return t("errors.unexpected");
}

export function useLogin(redirectPath?: string | null) {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("Auth.Messages");

  console.log("🔵 useLogin hook initialized with redirectPath:", redirectPath);

  return useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      try {
        console.log("🔵 CLIENT: Attempting login with:", credentials.email);

        const response = await signIn("credentials", {
          ...credentials,
          role: credentials.role || "user",
          redirect: false,
        });

        console.log("🔵 CLIENT: NextAuth response:", response);

        // Return the response with error info - we'll handle it in onSuccess/onError
        return {
          ...response,
          hasError: !!response?.error || !response?.ok,
        };
      } catch (error) {
        // Catch any unexpected errors and return them in a controlled way
        console.log("🔴 CLIENT: Unexpected error during login:", error);
        return {
          error: "UnexpectedError",
          hasError: true,
          ok: false,
          status: 500,
          url: null,
        };
      }
    },
    onSuccess: (data) => {
      // Check if there was actually an error
      if (data.hasError || data.error) {
        console.log("🔴 CLIENT: Login failed - error present:", data.error);
        toast.error(t("errors.invalidCredentials"));
        return;
      }

      console.log("🟢 CLIENT: Login successful!");
      toast.success(t("loginSuccess"));

      // Redirect to the specified path or home
      const destination = redirectPath || getLocalizedPath("/", locale);
      console.log("🟢 CLIENT: Redirecting to:", destination);
      router.push(destination);
      router.refresh();
    },
    onError: (error: unknown) => {
      // This handles network errors or other exceptions
      const message = extractErrorMessage(error, t);
      toast.error(message);
    },
    throwOnError: false, // Prevent React Query from re-throwing errors
  });
}

export function useSignup() {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("Auth.Messages");

  return useMutation({
    mutationFn: async (data: SignupData) => {
      try {
        const response = await signupApi(data);
        return response;
      } catch (error) {
        throw error;
      }
    },
    onSuccess: () => {
      toast.success(t("signupSuccess"));
      router.push(getLocalizedPath("/login", locale));
    },
    onError: (error: unknown) => {
      const message = extractErrorMessage(error, t);
      toast.error(message);
    },
  });
}
