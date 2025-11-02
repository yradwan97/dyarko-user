"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Typography from "@/components/shared/typography";
import Button from "@/components/shared/button";
import { useUpdateUser, useUpdateUserImage } from "@/hooks/use-user";
import { Spinner } from "@/components/ui/spinner";
import PersonalInfoForm from "../components/personal-info-form";
import BankingInfoForm from "../components/banking-info-form";
import SocialMediaForm from "../components/social-media-form";

interface ProfileFormData {
  // Personal Info
  name: string;
  phone: string;
  email: string;
  // Banking Info
  ACCName: string;
  bankName: string;
  IBAN: string;
  swiftCode: string;
  // Social Media
  facebook: string;
  X: string;
  linkedin: string;
  snapchat: string;
}

export default function ProfilePage() {
  const t = useTranslations("User.Profile");
  const { data: session, status } = useSession();
  const updateUserMutation = useUpdateUser();
  const updateImageMutation = useUpdateUserImage();
  const [activeTab, setActiveTab] = useState("personal");
  const [imageFile, setImageFile] = useState<File | null>(null);

  // Convert session user to UserProfile format
  const userProfile = session?.user
    ? ({
        _id: session.user.id || "",
        name: session.user.name || "",
        email: session.user.email || "",
        phoneNumber: session.user.phoneNumber || "",
        image: session.user.image,
        role: session.user.role || "user",
        status: session.user.status || "",
        country: session.user.country || "",
        points: session.user.points || 0,
        isConfirmed: session.user.isConfirmed || false,
        nationalID: session.user.nationalID,
        deviceToken: session.user.device_token,
        bankInfo: session.user.bankInfo,
        socialMedia: session.user.socialMedia,
      } as any)
    : null;

  const formMethods = useForm<ProfileFormData>({
    defaultValues: {
      // Personal
      name: "",
      phone: "",
      email: "",
      // Banking
      ACCName: "",
      bankName: "",
      IBAN: "",
      swiftCode: "",
      // Social Media
      facebook: "",
      X: "",
      linkedin: "",
      snapchat: "",
    },
  });

  const { handleSubmit, formState: { isDirty }, reset } = formMethods;

  // Update form when session data is available
  useEffect(() => {
    if (session?.user && status === "authenticated") {
      const formData = {
        // Personal
        name: session.user.name || "",
        phone: session.user.phoneNumber || "",
        email: session.user.email || "",
        // Banking
        ACCName: session.user.bankInfo?.ACCName || "",
        bankName: session.user.bankInfo?.bankName || "",
        IBAN: session.user.bankInfo?.IBAN || "",
        swiftCode: session.user.bankInfo?.swiftCode || "",
        // Social Media
        facebook: session.user.socialMedia?.facebook || "",
        X: session.user.socialMedia?.X || "",
        linkedin: session.user.socialMedia?.linkedin || "",
        snapchat: session.user.socialMedia?.snapchat || "",
      };
      reset(formData);
    }
  }, [session?.user, status, reset]);

  if (status === "loading") {
    return (
      <div className="flex justify-center py-12">
        <Spinner className="h-12 w-12 text-main-400" />
      </div>
    );
  }

  if (!userProfile) {
    return (
      <div className="flex justify-center py-12">
        <Typography variant="body-md" as="p" className="text-gray-500">
          {t("no-session")}
        </Typography>
      </div>
    );
  }

  const onSubmit = async (data: ProfileFormData) => {
    try {
      // Upload image if changed
      if (imageFile) {
        await updateImageMutation.mutateAsync(imageFile);
        toast.success(t("Personal.image-success"));
        setImageFile(null);
      }

      // Prepare update payload
      const updatePayload: any = {};

      // Personal info changes
      if (data.name !== userProfile?.name) updatePayload.name = data.name;
      if (data.phone !== userProfile?.phoneNumber) updatePayload.phoneNumber = data.phone;
      if (data.email !== userProfile?.email) updatePayload.email = data.email;

      // Banking info changes
      const bankingChanged =
        data.ACCName !== userProfile?.bankInfo?.ACCName ||
        data.bankName !== userProfile?.bankInfo?.bankName ||
        data.IBAN !== userProfile?.bankInfo?.IBAN ||
        data.swiftCode !== userProfile?.bankInfo?.swiftCode;

      if (bankingChanged) {
        updatePayload.bankInfo = {
          ACCName: data.ACCName,
          bankName: data.bankName,
          IBAN: data.IBAN,
          swiftCode: data.swiftCode,
        };
      }

      // Social media changes
      const socialChanged =
        data.facebook !== userProfile?.socialMedia?.facebook ||
        data.X !== userProfile?.socialMedia?.X ||
        data.linkedin !== userProfile?.socialMedia?.linkedin ||
        data.snapchat !== userProfile?.socialMedia?.snapchat;

      if (socialChanged) {
        updatePayload.socialMedia = {
          facebook: data.facebook,
          X: data.X,
          linkedin: data.linkedin,
          snapchat: data.snapchat,
        };
      }

      // Update profile if there are changes
      if (Object.keys(updatePayload).length > 0) {
        await updateUserMutation.mutateAsync(updatePayload);
        toast.success(t("Personal.profile-success"));
      }

      reset(data);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || t("Personal.profile-fail"));
    }
  };

  const isSubmitting = updateUserMutation.isPending || updateImageMutation.isPending;
  const hasChanges = isDirty || imageFile !== null;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="text-center">
        <Typography variant="h3" as="h3" className="font-bold">
          {t("title")}
        </Typography>
        <Typography variant="body-md" as="p" className="text-gray-500">
          {t("description")}
        </Typography>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="flex w-full max-w-3xl mx-auto rtl:flex-row-reverse">
          <TabsTrigger value="personal" type="button" className="flex-1">{t("tabs.personal")}</TabsTrigger>
          <TabsTrigger value="banking" type="button" className="flex-1">{t("tabs.banking")}</TabsTrigger>
          <TabsTrigger value="social" type="button" className="flex-1">{t("tabs.social")}</TabsTrigger>
        </TabsList>

        <TabsContent value="personal" className="mt-6">
          <Typography variant="h4" as="h4" className="mb-6 text-center font-bold">
            {t("sections.personal")}
          </Typography>
          {userProfile && (
            <PersonalInfoForm
              formMethods={formMethods}
              userProfile={userProfile}
              imageFile={imageFile}
              setImageFile={setImageFile}
            />
          )}
        </TabsContent>

        <TabsContent value="banking" className="mt-6">
          <Typography variant="h4" as="h4" className="mb-6 text-center font-bold">
            {t("sections.banking")}
          </Typography>
          {userProfile && <BankingInfoForm formMethods={formMethods} />}
        </TabsContent>

        <TabsContent value="social" className="mt-6">
          <Typography variant="h4" as="h4" className="mb-6 text-center font-bold">
            {t("sections.social")}
          </Typography>
          {userProfile && <SocialMediaForm formMethods={formMethods} />}
        </TabsContent>
      </Tabs>

      {/* Unified Action Buttons */}
      <div className="flex gap-4 justify-center pt-6 border-t">
        <Button
          type="submit"
          variant={hasChanges ? "primary" : "primary-outline"}
          disabled={!hasChanges || isSubmitting}
          className="min-w-[120px]"
        >
          {isSubmitting ? <Spinner className="h-4 w-4" /> : t("Personal.save")}
        </Button>

        <Button
          type="button"
          variant="primary-outline"
          onClick={() => {
            reset();
            setImageFile(null);
          }}
          disabled={!hasChanges || isSubmitting}
        >
          {t("Personal.cancel")}
        </Button>
      </div>
    </form>
  );
}
