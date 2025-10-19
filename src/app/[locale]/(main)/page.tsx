"use client";

import { useSession } from "next-auth/react";

import MobileFeaturedProperties from "@/components/sections/mobile-featured-properties";
import MobileBestCompanies from "@/components/sections/mobile-best-companies";
import PropertiesSection from "@/components/sections/properties-section";
import SessionDebug from "@/components/shared/session-debug";

export default function Home() {
  const { data: session } = useSession();

  return (
    <>
      <SessionDebug />
      <MobileFeaturedProperties />
      <MobileBestCompanies />
      <PropertiesSection />
    </>
  );
}
