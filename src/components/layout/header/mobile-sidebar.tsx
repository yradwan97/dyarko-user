"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { useLocale, useTranslations } from "next-intl";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import Button from "@/components/shared/button";
import LocalizationDropdown from "./localization-dropdown";
import { cn, getLocalizedPath } from "@/lib/utils";

const navLinks = [
  { to: "/property-listing/rent", text: "rent" },
  { to: "/property-listing/installment", text: "installment" },
  { to: "/property-listing/cash", text: "cash" },
  { to: "/property-listing/shared", text: "shared" },
  { to: "/property-listing/replacement", text: "replacement" },
  { to: "/categories", text: "categories" },
  { to: "/companies", text: "companies" },
  { to: "/videos", text: "videos" },
];

type MobileSidebarProps = {
  visible: boolean;
  setVisible: (visible: boolean) => void;
};

export default function MobileSidebar({
  visible,
  setVisible,
}: MobileSidebarProps) {
  const t = useTranslations("Navbar");
  const tGeneral = useTranslations("General");
  const locale = useLocale();
  const { data: session } = useSession();
  const pathname = usePathname();

  const determinePathName = (path: string) => {
    return path.split("/")[2] ? path.split("/")[2] : path.split("/")[1];
  };

  const linkStyle = "capitalize text-base font-medium text-black px-1 py-2 rounded-lg";
  const activeClass = cn(linkStyle, "!text-main-600 !font-bold bg-main-100");

  return (
    <Sheet open={visible} onOpenChange={setVisible}>
      <SheetContent
        side="left"
        className="h-full w-[285px] overflow-y-scroll bg-gradient-to-b from-main-100 to-white p-5"
      >
        <SheetHeader>
          <SheetTitle className="sr-only">
            {tGeneral("navigation-menu")}
          </SheetTitle>
          <Image
            className="mx-auto"
            width={150}
            height={150}
            src="/logo.png"
            alt={tGeneral("logoAlt")}
          />
        </SheetHeader>
        <div className="mt-4">
          <LocalizationDropdown showLanguage />
        </div>
        <div
          className={cn(
            "mt-4 flex flex-col space-y-1",
            locale === "ar" && "text-end"
          )}
        >
          {navLinks.map((navLink, index) => (
            <Link
              id={navLink.text}
              href={navLink.to}
              key={index}
              className={
                determinePathName(pathname || "") ===
                determinePathName(navLink.to)
                  ? activeClass
                  : linkStyle
              }
              onClick={() => setVisible(false)}
            >
              {t(navLink.text)}
            </Link>
          ))}
        </div>

        {!session && (
          <div className="mt-4 flex flex-col space-y-2">
            <Button
              variant="primary-outline"
              to={getLocalizedPath("/login", locale)}
              className="text-center"
            >
              {tGeneral("login")}
            </Button>
            <Button variant="primary" to={getLocalizedPath("/sign-up", locale)} className="text-center">
              {tGeneral("sign-up")}
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
