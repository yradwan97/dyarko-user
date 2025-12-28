"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { ChevronDownIcon } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useSession } from "next-auth/react";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("Navbar");
  const {data: session} = useSession();

  const navLinks = [
    { to: "/property-listing/rent", text: "rent", visibleWithoutSession: true },
    { to: "/property-listing/buy", text: "buy", hasSubMenu: true, visibleWithoutSession: true },
    { to: "/user/my-real-estates", text: "my-real-estates", visibleWithoutSession: false },
    { to: "/user/my-requests", text: "my-requests", visibleWithoutSession: false },
    { to: "/categories", text: "categories", visibleWithoutSession: true },
    { to: "/companies", text: "companies", visibleWithoutSession: true },
    { to: "/videos", text: "videos", visibleWithoutSession: true },
  ];

  // Reverse nav links for Arabic
  const displayLinks = locale === "ar" ? [...navLinks].reverse() : navLinks;

  const buyLinksArray = [
    { link: "/property-listing/cash", name: "cash" },
    { link: "/property-listing/installment", name: "installment" },
  ];

  const determinePathName = (path: string) => {
    return path.split("/")[2] ? path.split("/")[2] : path.split("/")[1];
  };

  const linkStyle =
    "capitalize text-base font-medium text-black !px-1 !py-2 hover:bg-gray-200 hover:shadow-md rounded-lg dark:text-gray-200 dark:hover:bg-gray-700";
  const activeClass = cn(
    linkStyle,
    "!text-main-600 !font-bold bg-main-100 dark:!text-main-400 dark:bg-main-900/30"
  );

  const isBuyPathActive =
    pathname?.includes("/property-listing/cash") ||
    pathname?.includes("/property-listing/installment");

  // Get current buy option value
  const getCurrentBuyValue = () => {
    if (pathname?.includes("/property-listing/cash")) return "/property-listing/cash";
    if (pathname?.includes("/property-listing/installment")) return "/property-listing/installment";
    return "/property-listing/cash"; // default
  };

  return (
    <>
      {(session ? displayLinks : displayLinks.filter(link => link.visibleWithoutSession)).map((navLink, i) => (
        <div key={i} className="m-2 flex w-auto justify-center" suppressHydrationWarning>
          {navLink.hasSubMenu ? (
            <Select
              value={getCurrentBuyValue()}
              onValueChange={(value) => router.push(value)}
            >
              <SelectTrigger
                className={cn(
                  "border-none shadow-none bg-transparent",
                  isBuyPathActive ? "text-main-600 font-bold dark:text-main-400" : "text-black font-medium dark:text-gray-200",
                  "hover:bg-gray-200 hover:shadow-md dark:hover:bg-gray-700",
                  "capitalize text-base",
                  locale === "ar" && "flex-row-reverse"
                )}
              >
                <SelectValue>
                  {t(navLink.text)}
                </SelectValue>
              </SelectTrigger>
              <SelectContent align={locale === "ar" ? "end" : "start"}>
                {buyLinksArray.map((link, index) => (
                  <SelectItem
                    key={index}
                    value={link.link}
                    className={cn("capitalize", locale === "ar" && "text-right")}
                  >
                    {t(link.name)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <Link
              id={navLink.text}
              href={navLink.to}
              className={cn(
                determinePathName(pathname || "") ===
                determinePathName(navLink.to)
                  ? activeClass
                  : linkStyle,
                locale === "ar" && "text-right"
              )}
            >
              {t(navLink.text)}
            </Link>
          )}
        </div>
      ))}
    </>
  );
}
