"use client";

import { useTranslations } from "next-intl";

export default function Footer() {
  const t = useTranslations("General");

  return (
    <footer className="border-t bg-muted/50">
      <div className="container py-8">
        <p className="text-center text-sm text-muted-foreground">
          {t("copyright", { year: new Date().getFullYear() })}
        </p>
      </div>
    </footer>
  );
}
