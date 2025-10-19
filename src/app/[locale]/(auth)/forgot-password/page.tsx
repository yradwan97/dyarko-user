"use client";

import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useTranslations } from "next-intl";
import * as z from "zod";

import { FormInput } from "@/components/shared/form-input";
import Typography from "@/components/shared/typography";
import { Button } from "@/components/ui/button";

export default function ForgotPasswordPage() {
  const t = useTranslations("ForgotPassword");

  const forgotPasswordSchema = useMemo(() => z.object({
    email: z.string().email(t("Email.valid")),
  }), [t]);

  type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    // TODO: Implement forgot password logic
    console.warn("Forgot password:", data);
  };

  return (
    <div className="mx-auto w-5/6 py-16 md:w-4/6 md:py-24 lg:w-4/6">
      {/* Header */}
      <Typography variant="h3" as="h3" className="mb-3 text-center capitalize">
        {t("title")}
      </Typography>
      <Typography
        variant="body-md-medium"
        as="p"
        className="mb-2 text-center opacity-50"
      >
        {t("sub")}
      </Typography>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <FormInput
            id="email"
            label={t("emailLabel")}
            placeholder={t("emailPlaceholder")}
            type="email"
            error={errors.email}
            {...register("email")}
          />

          <Button
            type="submit"
            className="w-full bg-main-600 hover:bg-main-500"
            size="lg"
          >
            {t("submitButton")}
          </Button>
        </form>

      {/* Footer Links */}
      <div className="pt-6 text-center text-sm">
        <Link
          href="/login"
          className="font-medium text-main-600 hover:text-main-500"
        >
          {t("back-to-login")}
        </Link>
      </div>
    </div>
  );
}
