"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import Button from "@/components/shared/button";
import Typography from "@/components/shared/typography";
import { HomeIcon, ArrowRight, Shield } from "lucide-react";
import { getLocalizedPath } from "@/lib/utils";
import Image from "next/image";

export default function AboutUsSection() {
  const t = useTranslations("HomePage.AboutUs");
  const locale = useLocale();
  const [activeTab, setActiveTab] = useState<"1" | "2">("1");

  const tabstyle = "flex-1 py-3 px-5 cursor-pointer text-md border-b-3";

  return (
    <section className="bg-main-100 py-20 px-4">
      <div className="container flex flex-col lg:flex-row lg:space-x-28">
        {/* Left side - Image with info boxes */}
        <div className="relative h-125 rounded-lg bg-white bg-cover bg-center bg-no-repeat md:h-150 lg:h-auto lg:flex-1">
          <div className="absolute inset-0 rounded-lg bg-linear-to-br from-main-500/20 to-steelBlue-500/20" >
            <Image
              width={400}
              height={400}
              src="/assets/home 3.png"
              alt="About Us"
              className="size-full rounded-lg object-cover"
            />
          </div>

          {/* Tour Info Box */}
          <div className="absolute left-1/2 top-0 hidden -translate-x-1/2 -translate-y-1/2 sm:flex lg:left-auto lg:right-auto lg:top-8 lg:translate-x-0">
            <div className="flex items-center space-x-5 rounded-lg border border-main-200 bg-white px-4 py-5 drop-shadow-2xl md:px-12">
              <div className="h-14 w-14 rounded-full border border-secondary-400 bg-orange/10 p-1">
                <div className="flex h-full w-full items-center justify-center rounded-full bg-orange/10">
                  <HomeIcon className="h-6 w-6 stroke-secondary-400" />
                </div>
              </div>
              <div className="flex w-64 flex-col space-y-1">
                <Typography variant="h4" as="h4" className="text-xl! tracking-tight text-black">
                  {t("Tour.head")}
                </Typography>
                <Typography variant="body-sm" as="p" className="leading-6 text-gray-600">
                  {t("Tour.desc")}
                </Typography>
              </div>
            </div>
          </div>

          {/* Deal Info Box */}
          <div className="absolute left-1/2 top-full -translate-x-1/2 -translate-y-1/2">
            <div className="flex items-center space-x-5 rounded-lg border border-main-200 bg-white px-4 py-5 drop-shadow-2xl md:px-12">
              <div className="h-14 w-14 rounded-full border border-secondary-400 bg-orange/10 p-1">
                <div className="flex h-full w-full items-center justify-center rounded-full bg-orange">
                  <Shield className="h-6 w-6 stroke-secondary-400" />
                </div>
              </div>
              <div className="flex w-64 flex-col space-y-1">
                <Typography variant="h4" as="h4" className="text-xl! tracking-tight text-black">
                  {t("Deal.head")}
                </Typography>
                <Typography variant="body-sm" as="p" className="leading-6 text-gray-600">
                  {t("Deal.desc")}
                </Typography>
              </div>
            </div>
          </div>
        </div>

        {/* Right side - Tabs and content */}
        <div className="mt-20 py-0 md:flex-1 lg:mt-0 lg:py-24">
          <div className="w-full lg:w-8/12">
            <div className="relative">
              <ul className="flex flex-row rounded-md border-main-200 bg-white p-2">
                <li
                  className={`${
                    activeTab === "1"
                      ? "rounded-md border border-main-200! text-md! font-bold text-black shadow-basic"
                      : "border-white font-regular text-gray-500"
                  } ${tabstyle}`}
                  onClick={() => setActiveTab("1")}
                >
                  {t("Tabs.buyers")}
                </li>
                <li
                  className={`${
                    activeTab === "2"
                      ? "rounded-md border border-main-200! text-md! font-bold text-black shadow-basic"
                      : "border-white font-regular text-gray-500"
                  } ${tabstyle}`}
                  onClick={() => setActiveTab("2")}
                >
                  {t("Tabs.tenants")}
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-8 flex flex-col space-y-6 md:space-y-8">
            <Typography
              variant="h2"
              as="h2"
              className="text-2xl font-bold leading-11 text-black sm:text-4xl sm:leading-14"
            >
              {activeTab === "1" ? t("main-buyers") : t("main-tenants")}
            </Typography>
            <Typography variant="body-sm" as="p" className="text-gray-600">
              {activeTab === "1" ? t("sub-buyers") : t("sub-tenants")}
            </Typography>
          </div>

          <Button
            variant="primary"
            to={
              activeTab === "1"
                ? getLocalizedPath("/property-listing/cash", locale)
                : getLocalizedPath("/property-listing/rent", locale)
            }
            className="mt-8 flex w-full items-center px-6! py-2! sm:w-2/5 md:w-1/3"
          >
            {activeTab === "1" ? t("button-buyers") : t("button-tenants")}{" "}
            <ArrowRight className="ms-auto h-4 w-4 stroke-white rtl:rotate-180" />
          </Button>
        </div>
      </div>
    </section>
  );
}
