"use client";

import dynamic from "next/dynamic";
import HeroSection from "@/components/sections/hero-section";
import ServicesSection from "@/components/sections/services-section";

// Lazy load below-the-fold sections
const PropertiesFilterSection = dynamic(() => import("@/components/sections/properties-filter-section"), {
  loading: () => <div className="h-96 animate-pulse bg-gray-50 rounded-lg my-8" />,
});

const LandingVideosSection = dynamic(() => import("@/components/sections/landing-videos-section"), {
  loading: () => <div className="h-96 animate-pulse bg-gray-50 rounded-lg my-8" />,
});

const AboutUsSection = dynamic(() => import("@/components/sections/new-about-us"), {
  loading: () => <div className="h-64 animate-pulse bg-gray-50 rounded-lg my-8" />,
});

const FeaturedCompaniesSection = dynamic(() => import("@/components/sections/new-featured-companies"), {
  loading: () => <div className="h-96 animate-pulse bg-gray-50 rounded-lg my-8" />,
});

const NewsletterSection = dynamic(() => import("@/components/sections/new-newsletter-section"), {
  loading: () => <div className="h-48 animate-pulse bg-gray-50 rounded-lg my-8" />,
});

export default function Home() {

  return (
    <div className="container">
      <HeroSection />
      <ServicesSection />
      <PropertiesFilterSection />
      <LandingVideosSection />
      <AboutUsSection />
      <FeaturedCompaniesSection />
      <NewsletterSection />
    </div>
  );
}
