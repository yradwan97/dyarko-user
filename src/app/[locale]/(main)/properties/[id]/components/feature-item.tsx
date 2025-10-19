"use client";

import { useLocale } from "next-intl";

interface FeatureItemProps {
  firstText: string;
  secondText?: string;
  className?: string;
  secondTextClassName?: string;
  companyName?: boolean;
}

export default function FeatureItem({
  firstText,
  secondText,
  className,
  secondTextClassName = "",
  companyName = false,
}: FeatureItemProps) {
  const locale = useLocale();

  return (
    <li
      className={`flex items-center justify-between ${
        locale === "ar" && "flex-row-reverse"
      }`}
    >
      <p
        className={
          className ||
          `flex space-x-2 text-gray-500 dark:text-gray-400 ${
            locale === "ar" && "flex-row-reverse"
          }`
        }
      >
        {firstText}
        {companyName && (
          <span className="ml-2 flex items-center">
            <span className="font-bold text-black dark:text-white">Dyarko &nbsp;</span>
          </span>
        )}
      </p>
      {secondText && (
        <p className={`text-right text-lg font-bold ${secondTextClassName}`}>
          {secondText}
        </p>
      )}
    </li>
  );
}
