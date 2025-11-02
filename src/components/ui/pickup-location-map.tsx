"use client";

import React, { useState, useCallback } from "react";
import { GoogleMap, Marker } from "@react-google-maps/api";
import { useGoogleMaps } from "@/components/providers/google-maps-provider";
import { useTranslations } from "next-intl";

interface PickupLocationMapProps {
  onLocationSelect: (lat: number, lng: number) => void;
  initialLat?: number;
  initialLng?: number;
  zoom?: number;
}

const containerStyle = {
  width: "100%",
  height: "400px",
};

// Default center - Kuwait City
const defaultCenter = {
  lat: 29.3759,
  lng: 47.9774,
};

export default function PickupLocationMap({
  onLocationSelect,
  initialLat,
  initialLng,
  zoom = 12,
}: PickupLocationMapProps) {
  const { isLoaded, loadError } = useGoogleMaps();
  const t = useTranslations("Rent.Step1");

  const [selectedPosition, setSelectedPosition] = useState<{ lat: number; lng: number } | null>(
    initialLat && initialLng ? { lat: initialLat, lng: initialLng } : null
  );

  const [mapCenter, setMapCenter] = useState(
    initialLat && initialLng
      ? { lat: initialLat, lng: initialLng }
      : defaultCenter
  );

  const handleMapClick = useCallback(
    (e: google.maps.MapMouseEvent) => {
      if (e.latLng) {
        const lat = e.latLng.lat();
        const lng = e.latLng.lng();
        setSelectedPosition({ lat, lng });
        onLocationSelect(lat, lng);
      }
    },
    [onLocationSelect]
  );

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";

  if (!apiKey) {
    return (
      <div className="flex h-96 items-center justify-center rounded-lg border border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {t("map-api-key-required") || "Map requires Google Maps API key"}
        </p>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="flex h-96 items-center justify-center rounded-lg border border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800">
        <p className="text-sm text-red-500 dark:text-red-400">
          {t("map-error") || "Error loading map"}
        </p>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="flex h-96 items-center justify-center rounded-lg border border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {t("map-loading") || "Loading map..."}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={mapCenter}
          zoom={zoom}
          onClick={handleMapClick}
          options={{
            streetViewControl: false,
            mapTypeControl: false,
          }}
        >
          {selectedPosition && <Marker position={selectedPosition} />}
        </GoogleMap>
      </div>
      {selectedPosition && (
        <div className="text-sm text-gray-600 dark:text-gray-400">
          <span className="font-medium">{t("selected-location") || "Selected location"}:</span>{" "}
          {selectedPosition.lat.toFixed(6)}, {selectedPosition.lng.toFixed(6)}
        </div>
      )}
    </div>
  );
}
