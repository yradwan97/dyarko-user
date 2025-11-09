"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Button from "@/components/shared/button";
import Typography from "@/components/shared/typography";
import { useChangePassword } from "@/hooks/use-user";
import { Spinner } from "@/components/ui/spinner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface FormData {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export default function ChangePasswordPage() {
  const t = useTranslations("User.ChangePassword");
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);

  const changePasswordMutation = useChangePassword();

  const {
    register,
    formState: { errors, isDirty },
    handleSubmit,
    watch,
    reset,
    setError,
  } = useForm<FormData>();

  const newPassword = watch("newPassword");

  const onSubmit = async (data: FormData) => {
    // Validate passwords match
    if (data.newPassword !== data.confirmPassword) {
      setError("confirmPassword", {
        type: "manual",
        message: t("dont-match"),
      });
      return;
    }

    try {
      await changePasswordMutation.mutateAsync({
        currentPassword: data.oldPassword,
        newPassword: data.newPassword,
      });

      setSuccessDialogOpen(true);
      reset();
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || t("error");
      toast.error(errorMessage);
    }
  };

  return (
    <>
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="text-center">
          <Typography variant="h3" as="h3" className="font-bold">
            {t("title")}
          </Typography>
          <Typography variant="body-md" as="p" className="text-gray-500">
            {t("description")}
          </Typography>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Old Password */}
          <div className="space-y-2">
            <Label htmlFor="oldPassword">{t("old-password")}</Label>
            <div className="relative">
              <Input
                id="oldPassword"
                type={showOldPassword ? "text" : "password"}
                placeholder={t("old-password-placeholder")}
                {...register("oldPassword", {
                  required: t("required"),
                  minLength: {
                    value: 6,
                    message: t("min"),
                  },
                })}
                className="h-12 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowOldPassword(!showOldPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showOldPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
            {errors.oldPassword && (
              <p className="text-sm text-red-600">{errors.oldPassword.message}</p>
            )}
          </div>

          {/* New Password */}
          <div className="space-y-2">
            <Label htmlFor="newPassword">{t("new-password")}</Label>
            <div className="relative">
              <Input
                id="newPassword"
                type={showNewPassword ? "text" : "password"}
                placeholder={t("new-password-placeholder")}
                {...register("newPassword", {
                  required: t("required"),
                  minLength: {
                    value: 6,
                    message: t("min"),
                  },
                })}
                className="h-12 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showNewPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
            {errors.newPassword && (
              <p className="text-sm text-red-600">{errors.newPassword.message}</p>
            )}
          </div>

          {/* Confirm Password */}
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">{t("confirm-password")}</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder={t("confirm-password-placeholder")}
                {...register("confirmPassword", {
                  required: t("required"),
                  validate: (value) =>
                    value === newPassword || t("dont-match"),
                })}
                className="h-12 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-sm text-red-600">{errors.confirmPassword.message}</p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <Button
              type="submit"
              variant={isDirty ? "primary" : "primary-outline"}
              disabled={!isDirty || changePasswordMutation.isPending}
              className="min-w-[120px]"
            >
              {changePasswordMutation.isPending ? (
                <Spinner className="h-4 w-4" />
              ) : (
                t("save")
              )}
            </Button>

            <Button
              type="button"
              variant="primary-outline"
              onClick={() => reset()}
              disabled={!isDirty || changePasswordMutation.isPending}
            >
              {t("cancel")}
            </Button>
          </div>
        </form>
      </div>

      {/* Success Dialog */}
      <Dialog open={successDialogOpen} onOpenChange={setSuccessDialogOpen}>
        <DialogContent className="sm:max-w-md bg-white">
          <DialogHeader>
            <div className="mx-auto mb-4">
              <svg
                width="82"
                height="82"
                viewBox="0 0 82 82"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <rect width="82" height="82" rx="41" fill="#20B2AA" />
                <path
                  d="M36.5477 51C36.1133 51.0008 35.6829 50.9191 35.2816 50.7597C34.8803 50.6002 34.5161 50.3662 34.2099 50.0711L25.3879 41.6267C24.8035 41.0264 24.4854 40.2324 24.5005 39.412C24.5156 38.5916 24.8628 37.8089 25.469 37.2287C26.0751 36.6485 26.8928 36.3162 27.7499 36.3017C28.607 36.2872 29.4364 36.5918 30.0636 37.1511L36.8565 43.6533L52.2068 32.6333C52.9087 32.1294 53.791 31.9131 54.6596 32.0318C55.5282 32.1506 56.3119 32.5948 56.8383 33.2667C57.3648 33.9386 57.5908 34.7831 57.4667 35.6145C57.3427 36.4459 56.8786 37.1961 56.1767 37.7L38.5327 50.3667C37.9599 50.7775 37.2635 50.9997 36.5477 51Z"
                  fill="white"
                />
              </svg>
            </div>
            <DialogTitle className="text-center text-xl font-bold text-gray-900">
              {t("success-title")}
            </DialogTitle>
            <DialogDescription className="text-center text-gray-600 pt-2">
              {t("success-message")}
            </DialogDescription>
          </DialogHeader>
          <Button
            variant="primary"
            onClick={() => setSuccessDialogOpen(false)}
            className="w-full mt-4 bg-[#1e3a5f] hover:bg-[#152a45] h-12"
          >
            {t("ok")}
          </Button>
        </DialogContent>
      </Dialog>
    </>
  );
}
