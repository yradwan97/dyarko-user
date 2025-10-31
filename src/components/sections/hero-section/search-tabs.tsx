"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
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
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 rounded-t-lg bg-white">
          <TabsTrigger
            value="rent"
            className="text-base data-[state=active]:border-b-2 data-[state=active]:border-main-600 data-[state=active]:text-main-600"
          >
            {tPayment("rent")}
          </TabsTrigger>
          <TabsTrigger
            value="buy"
            className="text-base data-[state=active]:border-b-2 data-[state=active]:border-main-600 data-[state=active]:text-main-600"
          >
            {tPayment("cash")}
          </TabsTrigger>
          <TabsTrigger
            value="installment"
            className="text-base data-[state=active]:border-b-2 data-[state=active]:border-main-600 data-[state=active]:text-main-600"
          >
            {tPayment("installment")}
          </TabsTrigger>
        </TabsList>

        <div className="relative">
          <div className="absolute start-0 top-0 z-10 w-full max-w-full rounded-b-lg bg-white shadow-xl md:min-w-[500px] lg:min-w-[640px] xl:min-w-[700px]">
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
