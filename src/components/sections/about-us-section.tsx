"use client";

import { useTranslations } from "next-intl";

export default function AboutUsSection() {
  const t = useTranslations("HomePage.AboutUsSection");

  return (
    <section className="py-16 bg-main-50">
      <div className="container">
        <h2 className="mb-8 text-center text-3xl font-bold">{t("title")}</h2>
        {/* TODO: Add about us content */}
      </div>
    </section>
  );
}
