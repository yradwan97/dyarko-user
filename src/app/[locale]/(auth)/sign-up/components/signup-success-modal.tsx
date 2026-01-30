"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { VerifiedCheck } from "@/components/icons/verified-check";
import { toast } from "sonner";
import { axiosClient } from "@/lib/services";
import { getLocalizedPath } from "@/lib/utils";
import Image from "next/image";

interface SignupSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  email: string;
}

const RESEND_COOLDOWN = 60; // 60 seconds cooldown

export function SignupSuccessModal({
  isOpen,
  onClose,
  email,
}: SignupSuccessModalProps) {
  const t = useTranslations("SignUp.SuccessModal");
  const router = useRouter();
  const locale = useLocale();
  const [isResending, setIsResending] = useState(false);
  const [countdown, setCountdown] = useState(RESEND_COOLDOWN);
  const [canResend, setCanResend] = useState(false);

  const handleClose = () => {
    onClose();
    router.push(getLocalizedPath("/login", locale));
  };

  // Start countdown when modal opens
  useEffect(() => {
    if (isOpen) {
      setCountdown(RESEND_COOLDOWN);
      setCanResend(false);
    }
  }, [isOpen]);

  // Countdown timer
  useEffect(() => {
    if (!isOpen || canResend) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, canResend]);

  const handleResendConfirmation = async () => {
    if (!canResend || isResending) return;

    setIsResending(true);
    try {
      await axiosClient.post("/auth/resend-confirmation", { email });
      toast.success(t("resend-success"));
      // Reset countdown after successful resend
      setCountdown(RESEND_COOLDOWN);
      setCanResend(false);
    } catch (error) {
      toast.error(t("resend-error"));
    } finally {
      setIsResending(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent showCloseButton={false} className="sm:max-w-md">
        <DialogHeader className="items-center text-center">
          <div className="mx-auto mb-4">
            <Image alt="success-check" src="/icons/successIcon.svg" width={80} height={80} className="text-main-500" />
          </div>
          <DialogTitle className="text-xl font-bold text-gray-900">
            {t("title")}
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            {t("description")}
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 space-y-3">
          <Button
            onClick={handleResendConfirmation}
            disabled={!canResend || isResending}
            variant="outline"
            className="w-full"
          >
            {isResending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t("resending")}
              </>
            ) : canResend ? (
              t("resend-button")
            ) : (
              t("resend-countdown", { time: formatTime(countdown) })
            )}
          </Button>

          <Button
            onClick={handleClose}
            className="w-full bg-main-500 text-white hover:bg-main-600"
          >
            {t("close-button")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
