"use client";

import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

interface PropertyTypeTabsProps {
  activeTab: "all" | "rent" | "installment";
  setActiveTab: (tab: "all" | "rent" | "installment") => void;
}

export default function PropertyTypeTabs({ activeTab, setActiveTab }: PropertyTypeTabsProps) {
  const t = useTranslations("General.PaymentMethods");

  const tabs: Array<"all" | "rent" | "installment"> = ["all", "rent", "installment"];

  return (
    <div className="mb-8 mt-6 flex gap-8 border-b-2 border-gray-200 md:mt-0">
      {tabs.map((tab) => (
        <button
          key={tab}
          className={cn(
            "pb-3 text-base capitalize outline-none transition-all duration-300 md:text-lg",
            "border-b-[3px]",
            activeTab === tab
              ? "border-main-600 font-bold text-main-600"
              : "border-transparent font-medium text-gray-600 hover:border-main-300 hover:text-main-500"
          )}
          onClick={() => setActiveTab(tab)}
        >
          {t(tab)}
        </button>
      ))}
    </div>
  );
}
