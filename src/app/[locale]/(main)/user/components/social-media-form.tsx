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
        <Label htmlFor="facebook" className="flex items-center gap-2">
          <Facebook className="h-4 w-4 text-blue-600" />
          {t("facebook")}
        </Label>
        <Input
          id="facebook"
          type="text"
          placeholder={t("facebook-placeholder")}
          {...register("facebook")}
          className="h-12"
        />
        {errors.facebook && (
          <p className="text-sm text-red-600">{errors.facebook.message}</p>
        )}
      </div>

      {/* X (Twitter) */}
      <div className="space-y-2">
        <Label htmlFor="X" className="flex items-center gap-2">
          <Twitter className="h-4 w-4 text-sky-500" />
          {t("twitter")}
        </Label>
        <Input
          id="X"
          type="text"
          placeholder={t("twitter-placeholder")}
          {...register("X")}
          className="h-12"
        />
        {errors.X && (
          <p className="text-sm text-red-600">{errors.X.message}</p>
        )}
      </div>

      {/* LinkedIn */}
      <div className="space-y-2">
        <Label htmlFor="linkedin" className="flex items-center gap-2">
          <Linkedin className="h-4 w-4 text-blue-700" />
          {t("linkedin")}
        </Label>
        <Input
          id="linkedin"
          type="text"
          placeholder={t("linkedin-placeholder")}
          {...register("linkedin")}
          className="h-12"
        />
        {errors.linkedin && (
          <p className="text-sm text-red-600">{errors.linkedin.message}</p>
        )}
      </div>

      {/* Snapchat */}
      <div className="space-y-2">
        <Label htmlFor="snapchat" className="flex items-center gap-2">
          <Snapchat className="h-4 w-4 text-yellow-400" />
          {t("snapchat")}
        </Label>
        <Input
          id="snapchat"
          type="text"
          placeholder={t("snapchat-placeholder")}
          {...register("snapchat")}
          className="h-12"
        />
        {errors.snapchat && (
          <p className="text-sm text-red-600">{errors.snapchat.message}</p>
        )}
      </div>
    </div>
  );
}
