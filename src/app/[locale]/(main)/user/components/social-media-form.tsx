"use client";

import { UseFormReturn } from "react-hook-form";
import { useTranslations } from "next-intl";
import { Facebook, Twitter, Linkedin, Camera as Snapchat } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface SocialMediaFormProps {
  formMethods: UseFormReturn<any>;
}

export default function SocialMediaForm({ formMethods }: SocialMediaFormProps) {
  const t = useTranslations("User.Profile.SocialMedia");

  const {
    register,
    formState: { errors },
  } = formMethods;

  return (
    <div className="space-y-6">
      {/* Facebook */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 rtl:flex-row-reverse rtl:justify-start">
          <Facebook className="h-4 w-4 text-blue-600" />
          <Label htmlFor="facebook">{t("facebook")}</Label>
        </div>
        <Input
          id="facebook"
          type="text"
          placeholder={t("facebook-placeholder")}
          {...register("facebook")}
          className="h-12 rtl:text-right rtl:placeholder:text-right"
        />
        {errors.facebook?.message && (
          <p className="text-sm text-red-600 rtl:text-right">{errors.facebook.message as string}</p>
        )}
      </div>

      {/* X (Twitter) */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 rtl:flex-row-reverse rtl:justify-start">
          <Twitter className="h-4 w-4 text-sky-500" />
          <Label htmlFor="X">{t("twitter")}</Label>
        </div>
        <Input
          id="X"
          type="text"
          placeholder={t("twitter-placeholder")}
          {...register("X")}
          className="h-12 rtl:text-right rtl:placeholder:text-right"
        />
        {errors.X?.message && (
          <p className="text-sm text-red-600 rtl:text-right">{errors.X.message as string}</p>
        )}
      </div>

      {/* LinkedIn */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 rtl:flex-row-reverse rtl:justify-start">
          <Linkedin className="h-4 w-4 text-blue-700" />
          <Label htmlFor="linkedin">{t("linkedin")}</Label>
        </div>
        <Input
          id="linkedin"
          type="text"
          placeholder={t("linkedin-placeholder")}
          {...register("linkedin")}
          className="h-12 rtl:text-right rtl:placeholder:text-right"
        />
        {errors.linkedin?.message && (
          <p className="text-sm text-red-600 rtl:text-right">{errors.linkedin.message as string}</p>
        )}
      </div>

      {/* Snapchat */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 rtl:flex-row-reverse rtl:justify-start">
          <Snapchat className="h-4 w-4 text-yellow-400" />
          <Label htmlFor="snapchat">{t("snapchat")}</Label>
        </div>
        <Input
          id="snapchat"
          type="text"
          placeholder={t("snapchat-placeholder")}
          {...register("snapchat")}
          className="h-12 rtl:text-right rtl:placeholder:text-right"
        />
        {errors.snapchat?.message && (
          <p className="text-sm text-red-600 rtl:text-right">{errors.snapchat.message as string}</p>
        )}
      </div>
    </div>
  );
}
