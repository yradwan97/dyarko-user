"use client";

import Image from "next/image";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import LocalizationDropdown from "@/components/layout/header/localization-dropdown";

export default function AuthNavbar() {
  const locale = useLocale();
  const t = useTranslations("Auth.AuthNavbar");

  return (
    <div className="container hidden w-full py-2 lg:block">
      <div
        className={`flex items-center justify-between ${
          locale === "ar" && "flex-row-reverse"
        }`}
      >
        <Link href="/">
          <Image
            src="/logo.png"
            width={100}
            height={100}
            alt={t("logoAlt")}
            className="h-auto w-24"
          />
        </Link>
        <LocalizationDropdown />
      </div>
    </div>
  );
}
