"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import dynamic from "next/dynamic";
import HeroSection from "@/components/sections/hero-section";
import ServicesSection from "@/components/sections/services-section";
import PaymentResultDialog from "@/components/dialogs/payment-result-dialog";

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
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const isSuccess = searchParams.get("isSuccess");
  const [showPaymentResult, setShowPaymentResult] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  useEffect(() => {
    if (isSuccess !== null) {
      setPaymentSuccess(isSuccess === "true");
      setShowPaymentResult(true);
    }
  }, [isSuccess]);

  const handleClosePaymentResult = () => {
    setShowPaymentResult(false);
    // Clean up the isSuccess query param from URL
    const params = new URLSearchParams(searchParams.toString());
    params.delete("isSuccess");
    const newUrl = params.toString() ? `${pathname}?${params.toString()}` : pathname;
    router.replace(newUrl, { scroll: false });
  };

  return (
    <div className="container">
      <HeroSection />
      <ServicesSection />
      <PropertiesFilterSection />
      <LandingVideosSection />
      <AboutUsSection />
      <FeaturedCompaniesSection />
      <NewsletterSection />

      <PaymentResultDialog
        open={showPaymentResult}
        onClose={handleClosePaymentResult}
        isSuccess={paymentSuccess}
      />
    </div>
  );
}
