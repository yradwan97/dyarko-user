"use client";

import { useTranslations } from "next-intl";

export default function NewsletterSection() {
  const t = useTranslations("HomePage.NewsletterSection");

  return (
    <section className="py-16 bg-main-600">
      <div className="container">
        <h2 className="mb-4 text-center text-3xl font-bold text-white">{t("title")}</h2>
        <p className="text-center text-white/90">{t("description")}</p>
        {/* TODO: Add newsletter form */}
      </div>
    </section>
  );
}
