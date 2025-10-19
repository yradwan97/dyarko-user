"use client";

import { useTranslations } from "next-intl";

export default function FeaturedCompaniesSection() {
  const t = useTranslations("HomePage.FeaturedCompaniesSection");

  return (
    <section className="py-16">
      <div className="container">
        <h2 className="mb-8 text-center text-3xl font-bold">{t("title")}</h2>
        {/* TODO: Add companies grid */}
      </div>
    </section>
  );
}
