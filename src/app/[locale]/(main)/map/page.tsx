"use client";

import { useState, useCallback, useEffect } from "react";
import { GoogleMap, Marker } from "@react-google-maps/api";
import { useCountryContext } from "@/components/providers/country-provider";
import { useGoogleMaps } from "@/components/providers/google-maps-provider";
import { useGetPropertiesByCountry } from "@/hooks/use-properties";
import { Spinner } from "@/components/ui/spinner";
import PropertyMapCard from "./components/property-map-card";
import type { Property } from "@/lib/services/api/properties";

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
  const { selectedCountry } = useCountryContext();
  const { isLoaded, loadError } = useGoogleMaps();
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);

  // Get center based on selected country
  const countryCenter = countryCenters[selectedCountry || "KW"] || countryCenters.KW;
  const [mapCenter, setMapCenter] = useState(countryCenter);

  // Fetch properties based on selected country
  const { data: propertiesData, isLoading } = useGetPropertiesByCountry(
    selectedCountry || "KW",
    1,
    30
  );

  const properties = propertiesData?.data?.data || [];

  // Update map center when country changes
  useEffect(() => {
    const newCenter = countryCenters[selectedCountry || "KW"] || countryCenters.KW;
    setMapCenter(newCenter);
  }, [selectedCountry]);

  // Debug: Log properties to check lat/long
  console.log("Properties:", properties);
  console.log("Properties with coordinates:", properties.filter((p: Property) => p.lat && p.long));

  const handleMarkerClick = useCallback((property: Property) => {
    setSelectedProperty(property);
    // Center map on selected property
    if (property.lat && property.long) {
      setMapCenter({ lat: property.lat, lng: property.long });
    }
  }, []);

  const handleCloseCard = useCallback(() => {
    setSelectedProperty(null);
  }, []);

  if (loadError) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-red-500">Error loading map</p>
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

      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={mapCenter}
        zoom={8}
        options={{
          streetViewControl: false,
          mapTypeControl: false,
          fullscreenControl: true,
        }}
      >
        {/* Property Markers */}
        {properties.length > 0 && properties.map((property: Property) => {
          console.log("Rendering marker for:", property.title, "Lat:", property.lat, "Long:", property.long);

          if (!property.lat || !property.long) {
            console.log("Skipping property without coordinates:", property.title);
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
        <div className="absolute bottom-6 left-6 z-20">
          <PropertyMapCard
            property={selectedProperty}
            onClose={handleCloseCard}
          />
        </div>
      )}
    </div>
  );
}
