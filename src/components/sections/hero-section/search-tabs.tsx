"use client";

import { useState, useEffect } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SearchTabContent } from "./search-tab-content";
import type { Session } from "next-auth";

type SearchTabsProps = {
  session: Session | null;
};

export function SearchTabs({ session }: SearchTabsProps) {
  const [activeTab, setActiveTab] = useState("rent");
  const [isMounted, setIsMounted] = useState(false);
  const tPayment = useTranslations("General.PaymentMethods");
  const locale = useLocale();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div className="mb-32 w-full md:mb-36 lg:w-full xl:w-4/6">
        <div className="h-64 w-full animate-pulse rounded-lg bg-white/50" />
      </div>
    );
  }

  return (
    <div className="mb-32 w-full md:mb-36 lg:w-full">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full min-w-[320px] sm:min-w-100 lg:min-w-125 xl:min-w-107.5">
        <TabsList className="grid w-full grid-cols-3 rounded-t-lg bg-white h-auto p-0 border-b border-gray-200">
          <TabsTrigger
            value="rent"
            className="bg-transparent! shadow-none! rounded-md! text-sm lg:text-base px-2 sm:px-4 xl:px-6 py-3 sm:py-4 text-gray-600 border-b-2 border-transparent data-[state=active]:border-main-600 data-[state=active]:text-main-600 data-[state=active]:font-semibold transition-all whitespace-nowrap"
          >
            {tPayment("rent")}
          </TabsTrigger>
          <TabsTrigger
            value="buy"
            className="bg-transparent! shadow-none! rounded-md! text-sm lg:text-base px-2 sm:px-4 xl:px-6 py-3 sm:py-4 text-gray-600 border-b-2 border-transparent data-[state=active]:border-main-600 data-[state=active]:text-main-600 data-[state=active]:font-semibold transition-all whitespace-nowrap"
          >
            {tPayment("cash")}
          </TabsTrigger>
          <TabsTrigger
            value="installment"
            className="bg-transparent! shadow-none! rounded-md! text-sm lg:text-base px-2 sm:px-4 xl:px-6 py-3 sm:py-4 text-gray-600 border-b-2 border-transparent data-[state=active]:border-main-600 data-[state=active]:text-main-600 data-[state=active]:font-semibold transition-all whitespace-nowrap"
          >
            {tPayment("installment")}
          </TabsTrigger>
        </TabsList>

        <div className="relative">
          <div className={`absolute ${locale === "ar" ? "end-0" : "start-0"} top-0 z-10 w-full max-w-full rounded-b-lg bg-white shadow-xl md:min-w-125 lg:min-w-160`}>
            <TabsContent value="rent" className="mt-0 p-4 md:p-6">
              <SearchTabContent tab="rent" session={session} />
            </TabsContent>
            <TabsContent value="buy" className="mt-0 p-4 md:p-6">
              <SearchTabContent tab="buy" session={session} />
            </TabsContent>
            <TabsContent value="installment" className="mt-0 p-4 md:p-6">
              <SearchTabContent tab="installment" session={session} />
            </TabsContent>
          </div>
        </div>
      </Tabs>
    </div>
  );
}
