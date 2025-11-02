"use client";

import { useEffect } from "react";
import { useLocale } from "next-intl";
import AuthNavbar from "@/components/auth/auth-navbar";
import AuthCarousel from "@/components/auth/auth-carousel";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = useLocale();

  // Prevent body scroll on auth pages
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  return (
    <div className="fixed inset-0 overflow-hidden">
      <div className={`flex h-full ${locale === "ar" && "flex-row-reverse"}`}>
        <div className="flex flex-1 flex-col overflow-y-auto">
          <AuthNavbar />
          {children}
        </div>
        <AuthCarousel />
      </div>
    </div>
  );
}
