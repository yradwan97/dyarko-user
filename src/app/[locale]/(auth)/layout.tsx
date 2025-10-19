"use client";

import { useLocale } from "next-intl";
import AuthNavbar from "@/components/auth/auth-navbar";
import AuthCarousel from "@/components/auth/auth-carousel";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = useLocale();

  return (
    <div className="mx-auto">
      <div className={`flex ${locale === "ar" && "flex-row-reverse"}`}>
        <div className="flex-1">
          <AuthNavbar />
          {children}
        </div>
        <AuthCarousel />
      </div>
    </div>
  );
}
