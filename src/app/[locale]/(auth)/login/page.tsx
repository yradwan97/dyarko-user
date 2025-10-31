"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useLogin } from "@/hooks/use-auth";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") ? decodeURIComponent(searchParams.get("redirect")!) : null;
  const { data: session, status } = useSession();
  const t = useTranslations("Login");
  const loginMutation = useLogin(redirect);
  const [showPassword, setShowPassword] = useState(false);

  console.log("🔵 Login page - redirect param:", redirect);

  const loginSchema = useMemo(() => z.object({
    email: z.string().min(1, t("Form.email.required")).email(t("Form.email.valid")),
    password: z.string().min(1, t("Form.password.required")).min(6, t("Form.password.valid")),
  }), [t]);

  type LoginFormData = z.infer<typeof loginSchema>;

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  useEffect(() => {
    if (session) {
      // If there's a redirect param, go there, otherwise go to home
      const destination = redirect || "/";
      console.log("🔵 Session exists, redirecting to:", destination);
      router.push(destination);
    }
  }, [session, router, redirect]);

  const onSubmit = (data: LoginFormData) => {
    loginMutation.mutate(data);
  };

  // Show loading skeleton while checking session
  if (status === "loading") {
    return (
      <div className="mx-auto w-full max-w-md px-4 py-16 md:py-24">
        <div className="mb-8 space-y-3 text-center">
          <Skeleton className="mx-auto h-8 w-48" />
          <Skeleton className="mx-auto h-4 w-64" />
        </div>
        <div className="space-y-6">
          <div className="space-y-2">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-12 w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-12 w-full" />
          </div>
          <Skeleton className="h-12 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-md px-4 py-16 md:py-24">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-900">
          {t("Page.main")}
        </h1>
        <p className="mt-2 text-gray-600">{t("Page.sub")}</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-700">{t("Form.email.label")}</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder={t("Form.email.placeholder")}
                    className="h-12"
                    disabled={loginMutation.isPending}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-700">{t("Form.password.label")}</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder={t("Form.password.placeholder")}
                      className="h-12 pr-12"
                      disabled={loginMutation.isPending}
                      {...field}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={loginMutation.isPending}
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5 text-gray-400" />
                      ) : (
                        <Eye className="h-5 w-5 text-gray-400" />
                      )}
                    </Button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-end">
            <Link
              href="/forgot-password"
              className="text-sm font-medium text-main-500 transition-colors hover:text-main-600 hover:underline"
              tabIndex={loginMutation.isPending ? -1 : 0}
            >
              {t("Form.buttons.forgot-password")}
            </Link>
          </div>

          <Button
            type="submit"
            className="h-12 w-full bg-main-500 text-white transition-colors hover:bg-main-600"
            disabled={loginMutation.isPending}
          >
            {loginMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t("Form.loading")}
              </>
            ) : (
              t("Form.buttons.login")
            )}
          </Button>
        </form>
      </Form>

      <div className="mt-8 space-y-3 text-center text-sm">
        <p className="text-gray-600">
          {t("Page.is-owner")}{" "}
          <Link
            href={process.env.NEXT_PUBLIC_OWNER_DASHBOARD_URL || "#"}
            className="font-semibold text-main-500 transition-colors hover:text-main-600 hover:underline"
          >
            {t("Page.owner-link")}
          </Link>
        </p>
        <p className="text-gray-600">
          {t("Page.no-account")}{" "}
          <Link
            href="/sign-up"
            className="font-semibold text-main-500 transition-colors hover:text-main-600 hover:underline"
          >
            {t("Page.sign-up")}
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="mx-auto w-full max-w-md px-4 py-16 md:py-24">
        <div className="mb-8 space-y-3 text-center">
          <Skeleton className="mx-auto h-8 w-48" />
          <Skeleton className="mx-auto h-4 w-64" />
        </div>
        <div className="space-y-6">
          <div className="space-y-2">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-12 w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-12 w-full" />
          </div>
          <Skeleton className="h-12 w-full" />
        </div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
