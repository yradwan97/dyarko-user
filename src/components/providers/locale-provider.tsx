"use client";

import { useEffect } from "react";
import { useLocale } from "next-intl";
import { setLocale } from "@/lib/services/axios-client";

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const locale = useLocale();

  useEffect(() => {
    // Set the locale in axios interceptor whenever it changes
    setLocale(locale);
  }, [locale]);

  return <>{children}</>;
}
