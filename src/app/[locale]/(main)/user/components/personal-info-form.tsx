"use client";

import { useState, useEffect } from "react";
import { UseFormReturn } from "react-hook-form";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { Camera, Trash2 } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { type UserProfile } from "@/hooks/use-user";

interface PersonalInfoFormProps {
  formMethods: UseFormReturn<any>;
  userProfile: UserProfile;
  imageFile: File | null;
  setImageFile: (file: File | null) => void;
}

export default function PersonalInfoForm({
  formMethods,
  userProfile,
  imageFile,
  setImageFile,
}: PersonalInfoFormProps) {
  const t = useTranslations("User.Profile.Personal");
  const [profileImg, setProfileImg] = useState<string>(userProfile.image || "/assets/profile.png");

  const {
    register,
    formState: { errors },
  } = formMethods;

  useEffect(() => {
    if (userProfile.image) {
      setProfileImg(userProfile.image);
    }
  }, [userProfile]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setImageFile(selectedFile);
      const reader = new FileReader();
      reader.onload = (event) => {
        setProfileImg(event.target?.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleRemovePicture = () => {
    setImageFile(null);
    setProfileImg(userProfile.image || "/assets/profile.png");
  };

  return (
    <div className="space-y-6">
      {/* Profile Image */}
      <div className="flex flex-col items-center gap-4 sm:flex-row">
        <div className="relative h-24 w-24 overflow-hidden rounded-full border-4 border-main-100">
          <Image
            src={profileImg}
            alt="Profile"
            fill
            className="object-cover"
            unoptimized
          />
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <label className="relative cursor-pointer inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors h-10 px-4 py-2 bg-main-500 text-white hover:bg-main-600">
            <Camera className="mr-2 h-4 w-4 rtl:mr-0 rtl:ml-2" />
            {t("upload")}
            <input
              type="file"
              accept="image/*"
              className="absolute inset-0 cursor-pointer opacity-0"
              onChange={handleFileChange}
            />
          </label>

          <button
            type="button"
            onClick={handleRemovePicture}
            disabled={!imageFile && !userProfile.image}
            className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors h-10 px-4 py-2 border border-main-500 text-main-500 hover:bg-main-50 disabled:opacity-50 disabled:pointer-events-none"
          >
            <Trash2 className="mr-2 h-4 w-4 rtl:mr-0 rtl:ml-2" />
            {t("remove")}
          </button>
        </div>
      </div>

      {/* Name */}
      <div className="space-y-2">
        <Label htmlFor="name" className="rtl:text-right block">{t("name")}</Label>
        <Input
          id="name"
          type="text"
          placeholder={t("name-placeholder")}
          {...register("name", { required: t("name-required") })}
          className="h-12 rtl:text-right rtl:placeholder:text-right"
        />
        {errors.name?.message && (
          <p className="text-sm text-red-600 rtl:text-right">{errors.name.message as string}</p>
        )}
      </div>

      {/* Phone */}
      <div className="space-y-2">
        <Label htmlFor="phone" className="rtl:text-right block">{t("phone")}</Label>
        <Input
          id="phone"
          type="tel"
          placeholder={t("phone-placeholder")}
          {...register("phone", { required: t("phone-required") })}
          className="h-12 rtl:text-right rtl:placeholder:text-right"
        />
        {errors.phone?.message && (
          <p className="text-sm text-red-600 rtl:text-right">{errors.phone.message as string}</p>
        )}
      </div>

      {/* Email */}
      <div className="space-y-2">
        <Label htmlFor="email" className="rtl:text-right block">{t("email")}</Label>
        <Input
          id="email"
          type="email"
          placeholder={t("email-placeholder")}
          {...register("email", {
            required: t("email-required"),
            pattern: {
              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
              message: t("email-invalid"),
            },
          })}
          className="h-12 rtl:text-right rtl:placeholder:text-right"
        />
        {errors.email?.message && (
          <p className="text-sm text-red-600 rtl:text-right">{errors.email.message as string}</p>
        )}
      </div>
    </div>
  );
}
