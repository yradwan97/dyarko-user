"use client";

import HeroSection from "@/components/sections/hero-section";
import ServicesSection from "@/components/sections/services-section";
import PropertiesFilterSection from "@/components/sections/properties-filter-section";
import LandingVideosSection from "@/components/sections/landing-videos-section";
import AboutUsSection from "@/components/sections/new-about-us";
import FeaturedCompaniesSection from "@/components/sections/new-featured-companies";
import NewsletterSection from "@/components/sections/new-newsletter-section";

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
