"use client";

import { useEffect, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Mail, MessageCircle } from "lucide-react";
import Image from "next/image";
import Typography from "@/components/shared/typography";
import Button from "@/components/shared/button";
import { Spinner } from "@/components/ui/spinner";
import axiosClient from "@/lib/services/axios-client";
import { cn } from "@/lib/utils";

interface ContactInfo {
  email: string;
  phone: string;
  whatsapp: string;
}

export default function ContactUsPage() {
  const t = useTranslations("User.ContactUs");
  const locale = useLocale();
  const [contactInfo, setContactInfo] = useState<ContactInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getContactInfo = async () => {
      try {
        setIsLoading(true);
        const res = await axiosClient.get("/settings/info");
        const data = res.data.data;
        setContactInfo({
          email: data.email || "",
          phone: data.phone || "",
          whatsapp: data.whatsapp || "",
        });
      } catch (e) {
        console.error(e);
        setError(t("error"));
      } finally {
        setIsLoading(false);
      }
    };

    getContactInfo();
  }, [t]);

  const handleEmailClick = () => {
    if (contactInfo?.email) {
      window.location.href = `mailto:${contactInfo.email}`;
    }
  };

  const handleWhatsAppClick = () => {
    if (contactInfo?.whatsapp) {
      window.open(contactInfo.whatsapp, "_blank");
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-b from-gray-50 to-white py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className={cn("text-center mb-12", locale === "ar" && "text-right")}>
          <Typography variant="h2" as="h1" className="font-bold text-gray-900 mb-4">
            {t("title")}
          </Typography>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center py-12">
            <Spinner className="h-12 w-12 text-main-400" />
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-center">
            <Typography variant="body-md" as="p" className="text-red-600">
              {error}
            </Typography>
          </div>
        )}

        {/* Content */}
        {!isLoading && !error && contactInfo && (
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            {/* Illustration Section */}
            <div className="bg-linear-to-r from-main-50 to-main-100 py-12 px-6 flex justify-center">
              <div className="relative w-full max-w-md">
                <Image
                  src="/assets/contact_us.svg"
                  alt="Contact Us"
                  width={300}
                  height={120}
                  className="mx-auto"
                  priority
                />
              </div>
            </div>

            {/* Content Section */}
            <div className={cn("px-6 py-8 sm:px-12 sm:py-12", locale === "ar" && "text-right")}>
              {/* Title and Subtitle */}
              <div className="text-center mb-10">
                <Typography variant="h3" as="h2" className="font-bold text-gray-900 mb-3">
                  {t("description")}
                </Typography>
                <Typography variant="body-md" as="p" className="text-gray-600 max-w-2xl mx-auto">
                  {t("subtitle")}
                </Typography>
              </div>

              {/* Contact Cards */}
              <div className="space-y-6 mb-10">
                {/* Email Card */}
                <div className={cn(
                  "bg-gray-50 rounded-xl p-6 border border-gray-200 hover:border-main-300 transition-colors",
                  locale === "ar" && "text-right"
                )}>
                  <Typography variant="body-sm" as="p" className="text-gray-500 mb-2">
                    {t("email-label")}
                  </Typography>
                  <Typography variant="h5" as="p" className="font-semibold text-gray-900">
                    {contactInfo.email}
                  </Typography>
                </div>

                {/* Phone Card */}
                <div className={cn(
                  "bg-gray-50 rounded-xl p-6 border border-gray-200 hover:border-main-300 transition-colors",
                  locale === "ar" && "text-right"
                )}>
                  <Typography variant="body-sm" as="p" className="text-gray-500 mb-2">
                    {t("hotline-label")}
                  </Typography>
                  <Typography variant="h5" as="p" className="font-semibold text-gray-900">
                    {contactInfo.phone}
                  </Typography>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Button
                  variant="primary"
                  onClick={handleEmailClick}
                  className={cn(
                    "w-full flex items-center justify-center gap-3 py-4 text-base font-semibold",
                    locale === "ar" && "flex-row-reverse"
                  )}
                >
                  <Mail className="h-5 w-5" />
                  <span>{t("email-button")}</span>
                </Button>

                <Button
                  variant="primary"
                  onClick={handleWhatsAppClick}
                  className={cn(
                    "w-full flex items-center justify-center gap-3 py-4 text-base font-semibold bg-green-600 hover:bg-green-700",
                    locale === "ar" && "flex-row-reverse"
                  )}
                >
                  <MessageCircle className="h-5 w-5" />
                  <span>{t("whatsapp-button")}</span>
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
