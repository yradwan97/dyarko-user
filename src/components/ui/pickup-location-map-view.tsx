"use client";

import React from "react";
import { GoogleMap, Marker } from "@react-google-maps/api";
import { useGoogleMaps } from "@/components/providers/google-maps-provider";
import { MapPin } from "lucide-react";

interface PickupLocationMapViewProps {
  latitude: number;
  longitude: number;
  zoom?: number;
  height?: string;
}

const defaultContainerStyle = {
  width: "100%",
  height: "300px",
};

export default function PickupLocationMapView({
  latitude,
  longitude,
  zoom = 15,
  height = "300px",
}: PickupLocationMapViewProps) {
  const { isLoaded, loadError } = useGoogleMaps();

  const containerStyle = {
    ...defaultContainerStyle,
    height,
  };

  const center = {
    lat: latitude,
    lng: longitude,
  };

  if (loadError) {
    return (
      <div className="flex items-center justify-center rounded-lg border border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800 p-6">
        <div className="text-center">
          <MapPin className="h-8 w-8 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-red-500 dark:text-red-400">
            Error loading map
          </p>
        </div>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center rounded-lg border border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800 p-6">
        <div className="text-center">
          <MapPin className="h-8 w-8 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Loading map...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={zoom}
        options={{
          streetViewControl: false,
          mapTypeControl: false,
          fullscreenControl: false,
          zoomControl: true,
          draggable: true,
          scrollwheel: false,
          disableDoubleClickZoom: true,
        }}
      >
        <Marker position={center} />
      </GoogleMap>
    </div>
  );
}
