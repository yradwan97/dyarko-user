"use client";

import { useState, useCallback, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import { GoogleMap, Marker } from "@react-google-maps/api";
import { Filter, X } from "lucide-react";
import Link from "next/link";
import { useCountryContext } from "@/components/providers/country-provider";
import { useGoogleMaps } from "@/components/providers/google-maps-provider";
import { useMapProperties } from "@/hooks/use-properties";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import PropertyCard from "@/components/shared/property-card";
import MapFiltersModal from "./components/map-filters-modal";
import type { MapProperty } from "@/lib/services/api/properties";
import { formatPrice } from "@/lib/utils/property-pricing";
import { getLocalizedPath } from "@/lib/utils";
import { useCurrency } from "@/hooks/use-currency";

const mapContainerStyle = {
  width: "100%",
  height: "calc(100vh - 80px)", // Account for header height
};

// Country center coordinates
const countryCenters: Record<string, { lat: number; lng: number }> = {
  KW: { lat: 29.3759, lng: 47.9774 }, // Kuwait
  SA: { lat: 23.8859, lng: 45.0792 }, // Saudi Arabia
  AE: { lat: 23.4241, lng: 53.8478 }, // UAE
  BH: { lat: 26.0667, lng: 50.5577 }, // Bahrain
  QA: { lat: 25.3548, lng: 51.1839 }, // Qatar
  OM: { lat: 21.4735, lng: 55.9754 }, // Oman
  EG: { lat: 26.8206, lng: 30.8025 }, // Egypt
  JO: { lat: 30.5852, lng: 36.2384 }, // Jordan
  LB: { lat: 33.8547, lng: 35.8623 }, // Lebanon
  IQ: { lat: 33.2232, lng: 43.6793 }, // Iraq
  YE: { lat: 15.5527, lng: 48.5164 }, // Yemen
};

export default function MapPage() {
  const t = useTranslations("Map");
  const tPrice = useTranslations("Properties.Price");
  const tGeneral = useTranslations("General");
  const locale = useLocale();
  const currency = useCurrency();
  const { selectedCountry } = useCountryContext();
  const { isLoaded, loadError } = useGoogleMaps();
  const [selectedProperty, setSelectedProperty] = useState<MapProperty | null>(null);
  const [isFiltersOpen, setIsFiltersOpen] = useState(true); // Open by default
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedClass, setSelectedClass] = useState<string>("");
  const [selectedCity, setSelectedCity] = useState<string>("");

  // Get center based on selected country
  const countryCenter = countryCenters[selectedCountry || "KW"] || countryCenters.KW;
  const [mapCenter, setMapCenter] = useState(countryCenter);
  const [mapZoom, setMapZoom] = useState(8);

  // Fetch properties based on filters
  const { data: propertiesData, isLoading } = useMapProperties(
    selectedCity,
    selectedCategory,
    selectedClass
  );

  const properties = propertiesData?.data || [];

  // Center map on first property when properties load
  useEffect(() => {
    if (properties.length > 0) {
      const firstProperty = properties.find((p: MapProperty) => p.lat && p.long);
      if (firstProperty) {
        setMapCenter({ lat: Number(firstProperty.lat), lng: Number(firstProperty.long) });
        setMapZoom(7);
      }
    }
  }, [properties]);

  // Update map center and clear filters when country changes
  useEffect(() => {
    const newCenter = countryCenters[selectedCountry || "KW"] || countryCenters.KW;
    setMapCenter(newCenter);
    // Clear all filters and reopen modal when country changes
    setSelectedCategory("");
    setSelectedClass("");
    setSelectedCity("");
    setSelectedProperty(null);
    setIsFiltersOpen(true);
  }, [selectedCountry]);

  const handleMarkerClick = useCallback((property: MapProperty) => {
    setSelectedProperty(property);
    // Center map on selected property
    if (property.lat && property.long) {
      setMapCenter({ lat: property.lat, lng: property.long });
    }
  }, []);

  const handleCloseCard = useCallback(() => {
    setSelectedProperty(null);
  }, []);

  const handleApplyFilters = useCallback((filters: { category?: string; class?: string; city?: string }) => {
    setSelectedCategory(filters.category || "");
    setSelectedClass(filters.class || "");
    setSelectedCity(filters.city || "");
    setSelectedProperty(null); // Close property popup on filter change
  }, []);

  // Helper to get period from MapProperty based on available prices
  const getMapPropertyPeriod = (property: MapProperty): string | null => {
    if (property.offerType !== "rent") return null;
    if (property.hourlyPrice) return "hour";
    if (property.dailyPrice) return "day";
    if (property.weeklyPrice) return "week";
    if (property.monthlyPrice) return "month";
    return null;
  };

  // Helper to get display price from MapProperty
  const getDisplayPrice = (property: MapProperty): string => {
    const price = property.price || property.dailyPrice || property.weeklyPrice || property.monthlyPrice || property.hourlyPrice;
    if (!price) return tGeneral("price-not-available");

    const period = getMapPropertyPeriod(property);
    const periodText = period ? ` / ${tPrice(period)}` : "";
    return `${formatPrice(price, currency, locale)}${periodText}`;
  };

  if (loadError) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-red-500">{t("error-loading-map")}</p>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Spinner className="h-12 w-12 text-main-400" />
      </div>
    );
  }

  return (
    <div className="relative w-full h-[calc(100vh-80px)]">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/80 dark:bg-gray-900/80 z-10">
          <Spinner className="h-12 w-12 text-main-400" />
        </div>
      )}

      {/* Filters Button - Top Left */}
      <div className="absolute top-6 left-6 z-10">
        <Button
          onClick={() => setIsFiltersOpen(true)}
          className="gap-2 bg-white text-gray-900 shadow-lg hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700"
          size="lg"
        >
          <Filter className="h-4 w-4" />
          {t("filters")}
        </Button>
      </div>

      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={mapCenter}
        zoom={mapZoom}
        options={{
          streetViewControl: false,
          mapTypeControl: false,
          fullscreenControl: true,
        }}
      >
        {/* Property Markers */}
        {properties.length > 0 && properties.map((property: MapProperty) => {
          if (!property.lat || !property.long) {
            return null;
          }

          return (
            <Marker
              key={property._id}
              position={{ lat: Number(property.lat), lng: Number(property.long) }}
              onClick={() => handleMarkerClick(property)}
              title={property.title}
            />
          );
        })}
      </GoogleMap>

      {/* Property Info Card - Bottom Left */}
      {selectedProperty && (
        <div className="absolute bottom-6 right-6 z-20 w-full max-w-sm">
          <div className="relative">
            {/* Close Button */}
            <button
              onClick={handleCloseCard}
              className="absolute -top-2 -right-2 z-30 bg-white dark:bg-gray-800 rounded-full p-1.5 shadow-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <X className="h-4 w-4 text-gray-600 dark:text-gray-400" />
            </button>
            <Link href={getLocalizedPath(`/properties/${selectedProperty._id}`, locale)}>
              <PropertyCard
                variant="featured"
                propertyId={selectedProperty._id}
                image={selectedProperty.image}
                name={selectedProperty.title}
                location={`${selectedProperty.city}, ${selectedProperty.region}`}
                price={getDisplayPrice(selectedProperty)}
                badge={selectedProperty.offerType}
                propertyType={selectedProperty.category}
              />
            </Link>
          </div>
        </div>
      )}

      {/* Filters Modal */}
      <MapFiltersModal
        isOpen={isFiltersOpen}
        onClose={() => setIsFiltersOpen(false)}
        onApplyFilters={handleApplyFilters}
        initialCategory={selectedCategory}
        initialClass={selectedClass}
        initialCity={selectedCity}
      />
    </div>
  );
}
