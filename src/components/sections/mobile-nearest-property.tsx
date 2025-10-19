"use client";

import React from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { ChevronDownIcon } from "lucide-react";
import PropertyCard from "@/components/shared/property-card";
import { getLocalizedPath } from "@/lib/utils";

const nearestProperties = [
  {
    id: 1,
    image: "/service.png", // Placeholder
    name: "New Chalet",
    location: "Hawaii , Kuwait",
    price: "220 KWD",
    originalPrice: "250 KWD",
    badge: "Rent",
    secondaryBadge: "Chalet",
    propertyId: "DK_163",
  },
  {
    id: 2,
    image: "/service.png", // Placeholder
    name: "Beach House",
    location: "Salmiya , Kuwait",
    price: "350 KWD",
    originalPrice: "400 KWD",
    badge: "Rent",
    secondaryBadge: "House",
    propertyId: "DK_164",
  },
  {
    id: 3,
    image: "/service.png", // Placeholder
    name: "Modern Apartment",
    location: "Hawally , Kuwait",
    price: "180 KWD",
    badge: "Rent",
    secondaryBadge: "Apartment",
    propertyId: "DK_165",
  },
];

import { Button } from "@/components/ui/button";

export default function MobileNearestProperty() {
  const locale = useLocale();
  const t = useTranslations("HomePage.MobileNearestProperty");

  return (
    <section className="px-4 py-8">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-xl font-bold text-main-500">{t("title")}</h2>
        <Button variant="ghost" size="icon-sm" className="hover:bg-gray-100">
          <ChevronDownIcon className="h-4 w-4 text-main-500" />
        </Button>
      </div>
      <div className="flex flex-col gap-3">
        {nearestProperties.map((property) => (
          <Link
            key={property.id}
            href={getLocalizedPath(`/properties/${property.id}`, locale)}
          >
            <PropertyCard
              variant="list"
              image={property.image}
              name={property.name}
              location={property.location}
              price={property.price}
              originalPrice={property.originalPrice}
              badge={property.badge}
              secondaryBadge={property.secondaryBadge}
              propertyId={property.propertyId}
            />
          </Link>
        ))}
      </div>
    </section>
  );
}
