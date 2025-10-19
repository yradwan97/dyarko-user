"use client";

import { useLocale } from "next-intl";

interface HeadTitleProps {
  text: string;
  className?: string;
}

export default function HeadTitle({ text, className = "" }: HeadTitleProps) {
  const locale = useLocale();

  return (
    <h4
      className={`mb-8 text-2xl font-semibold ${
        locale === "ar" && "text-end"
      } ${className}`}
    >
      {text}
    </h4>
  );
}
