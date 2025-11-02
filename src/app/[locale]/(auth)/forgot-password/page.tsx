"use client";

import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { Loader2 } from "lucide-react";
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
import { noAuthAxios } from "@/lib/services/axios-client";
import { toast } from "sonner";
import { getLocalizedPath } from "@/lib/utils";

export default function ForgotPasswordPage() {
  const t = useTranslations("ForgotPassword");
  const router = useRouter();
  const locale = useLocale();
  const [isLoading, setIsLoading] = useState(false);

  const forgotPasswordSchema = useMemo(
    () =>
      z.object({
        email: z
          .string()
          .min(1, t("Email.required"))
          .email(t("Email.valid")),
      }),
    [t]
  );

  type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

  const form = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsLoading(true);
    try {
      const response = await noAuthAxios.post("/auth/forget_password", {
        email: data.email,
      });

      if (response.status === 200) {
        toast.success(response.data.message || t("success"));
        form.reset();
        // Redirect to login after successful request
        setTimeout(() => {
          router.push(getLocalizedPath("/login", locale));
        }, 1500);
      }
    } catch (error: any) {
      console.error(error);
      toast.error(
        error.response?.data?.message || t("error")
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-md px-4 py-16 md:py-24">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-900">{t("title")}</h1>
        <p className="mt-2 text-gray-600">{t("header")}</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-700">
                  {t("Email.label")}
                </FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder={t("Email.placeholder")}
                    className="h-12"
                    disabled={isLoading}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex gap-4">
            <Button
              type="submit"
              className="h-12 flex-1 bg-main-500 text-white transition-colors hover:bg-main-600"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t("loading")}
                </>
              ) : (
                t("request-button")
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="h-12 flex-1 border-main-500 text-main-500 hover:bg-main-50"
              disabled={isLoading}
              asChild
            >
              <Link href="/login">{t("cancel")}</Link>
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
