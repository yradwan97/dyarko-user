"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { Instagram, Facebook, Linkedin, Twitter } from "lucide-react";
import Typography from "@/components/shared/typography";
import { axiosClient } from "@/lib/services/axios-client";
import { getLocalizedPath } from "@/lib/utils";

interface SocialLinks {
  instagram?: string;
  facebook?: string;
  linkedin?: string;
  twitter?: string;
  tiktok?: string;
}

export default function Footer() {
  const t = useTranslations("HomePage.Footer");
  const locale = useLocale();
  const [links, setLinks] = useState<SocialLinks>({});

  const getLinks = async () => {
    try {
      const res = await axiosClient.get("/settings/info");
      setLinks(res.data.data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    getLinks();
  }, []);

  return (
    <div>
      <div className="container mx-auto rounded-md bg-main-100 py-20 shadow-sm px-4 md:px-6">
        <div className="grid gap-8 grid-cols-1 md:grid-cols-4">
          {/* Logo - First on mobile, positioned by locale on md+ */}
          <div className={`flex flex-col p-4 order-1 ${locale === "ar" ? "md:order-4 md:ml-auto" : "md:order-1"}`}>
            <Image
              src="/logo.png"
              height={160}
              width={160}
              loading="lazy"
              alt="Dyarko Logo"
            />
          </div>

          {/* Services - Second on mobile, second or third on md+ based on locale */}
          <div className={`flex flex-col p-4 order-4 ${locale === "ar" ? "md:order-1 text-end" : "md:order-2 text-start"}`}>
            <Typography variant="h5" as="h5" className="mb-3">
              {t("Services.title")}
            </Typography>
            <Typography variant="body-sm-medium" as="p" className="mb-3 text-gray-600">
              <Link href={getLocalizedPath("/property-listing/rent", locale)}>{t("Services.rent")}</Link>
            </Typography>
            <Typography variant="body-sm-medium" as="p" className="mb-3 text-gray-600">
              <Link href={getLocalizedPath("/property-listing/installment", locale)}>{t("Services.installment")}</Link>
            </Typography>
            <Typography variant="body-sm-medium" as="p" className="mb-3 text-gray-600">
              <Link href={getLocalizedPath("/companies", locale)}>{t("Services.companies")}</Link>
            </Typography>
            <Typography variant="body-sm-medium" as="p" className="mb-3 text-gray-600">
              <Link href={getLocalizedPath("/videos", locale)}>{t("Services.videos")}</Link>
            </Typography>
          </div>

          {/* About - Third on mobile */}
          <div className={`flex flex-col p-4 order-3 ${locale === "ar" ? "md:order-2 text-end" : "md:order-3 text-start"}`}>
            <Typography variant="h5" as="h5" className="mb-3">
              {t("About.title")}
            </Typography>
            <Typography variant="body-sm-medium" as="p" className="mb-3 text-gray-600">
              <Link href={getLocalizedPath("/terms-conditions", locale)}>{t("About.terms")}</Link>
            </Typography>
            <Typography variant="body-sm-medium" as="p" className="mb-3 text-gray-600">
              <Link href={getLocalizedPath("/privacy-policy", locale)}>{t("About.privacy")}</Link>
            </Typography>
            <Typography variant="body-sm-medium" as="p" className="mb-3 text-gray-600">
              <Link href={getLocalizedPath("/refund-policy", locale)}>{t("About.refund")}</Link>
            </Typography>
          </div>

          {/* Social - Second on mobile (after logo) */}
          <div className={`flex flex-col p-4 order-2 ${locale === "ar" ? "md:order-3 text-end" : "md:order-4 text-start"}`}>
            <Typography variant="h5" as="h5" className="mb-3">
              {t("Social.title")}
            </Typography>
            <Typography variant="body-sm-medium" as="p" className="mb-3 text-gray-600">
              <Link href={links?.instagram || "/"}>{t("Social.instagram")}</Link>
            </Typography>
            <Typography variant="body-sm-medium" as="p" className="mb-3 text-gray-600">
              <Link href={links?.facebook || "/"}>{t("Social.facebook")}</Link>
            </Typography>
            <Typography variant="body-sm-medium" as="p" className="mb-3 text-gray-600">
              <Link href={links?.linkedin || "/"}>{t("Social.linkedin")}</Link>
            </Typography>
            <Typography variant="body-sm-medium" as="p" className="mb-3 text-gray-600">
              <Link href={links?.twitter || "/"}>{t("Social.twitter")}</Link>
            </Typography>
            <Typography variant="body-sm-medium" as="p" className="mb-3 text-gray-600">
              <Link href={links?.tiktok || "/"}>{t("Social.tiktok")}</Link>
            </Typography>
          </div>
        </div>
      </div>

      {/* Bottom section */}
      <div className="border-t border-main-100">
        <div className="container mx-auto py-5">
          <div className={`flex flex-col items-center px-8 ${locale === "ar" ? "md:flex-row-reverse" : "md:flex-row"} md:justify-between`}>
            <Typography
              variant="body-sm-medium"
              as="p"
              className="mb-6 text-center text-gray-400 md:mb-0 md:text-left"
            >
              {t("Copyright.1", { date: new Date().getFullYear().toString() })}
            </Typography>
            <div className={`flex items-center ${locale === "ar" ? "flex-row-reverse" : "flex-row"}`}>
              <Typography
                variant="body-sm-medium"
                as="p"
                className="mb-6 text-left text-gray-400 md:mb-0 md:text-left"
              >
                {t("Copyright.2")}
              </Typography>
              <Image src="/assets/echo soft.png" height={40} width={40} alt="Echosoft logo" className="mx-2" />
              <Typography
                variant="body-sm-medium"
                as="p"
                className="mb-6 text-left text-gray-400 md:mb-0 md:text-left"
              >
                {t("Copyright.3")}
              </Typography>
            </div>
            <div className="flex justify-center md:justify-end">
              <Link href={links?.instagram || "/"} className="mr-6">
                <Instagram className="h-5 w-5 text-gray-400 hover:text-main-500" />
              </Link>
              <Link href={links?.facebook || "/"} className="mr-6">
                <Facebook className="h-5 w-5 text-gray-400 hover:text-main-500" />
              </Link>
              <Link href={links?.linkedin || "/"} className="mr-6">
                <Linkedin className="h-5 w-5 text-gray-400 hover:text-main-500" />
              </Link>
              <Link href={links?.twitter || "/"} className="mr-6">
                <Twitter className="h-5 w-5 text-gray-400 hover:text-main-500" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
