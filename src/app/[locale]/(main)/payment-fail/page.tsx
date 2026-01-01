"use client";

import { useTranslations } from "next-intl";
import { useLocale } from "next-intl";
import Image from "next/image";
import Typography from "@/components/shared/typography";
import Link from "next/link";

export default function PaymentFailPage() {
  const t = useTranslations("PaymentFail");
  const locale = useLocale();

  return (
    <div className="container mx-auto py-16 px-4 min-h-[58vh] flex items-center justify-center">
      <div className="max-w-md mx-auto text-center">
        <div className="flex justify-center mb-6">
          <Image
            src="/icons/failIcon.svg"
            alt={t("title")}
            width={96}
            height={96}
          />
        </div>

        <Typography variant="h2" as="h1" className="mb-4 text-gray-900 dark:text-white">
          {t("title")}
        </Typography>

        <Typography variant="body-lg-medium" as="p" className="mb-8 text-gray-600 dark:text-gray-400">
          {t("description")}
        </Typography>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href={`/${locale}`}
            className="inline-flex items-center justify-center px-6 py-3 text-white border border-gray-300 font-medium bg-main-600 rounded-lg transition-colors"
          >
            {t("back-home")}
          </Link>

          <Link
            href={`/${locale}/user/contact-us`}
            className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            {t("contact-support")}
          </Link>
        </div>
      </div>
    </div>
  );
}
