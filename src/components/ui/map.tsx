"use client";

import React from "react";
import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";

interface MapProps {
  latitude: number;
  longitude: number;
  zoom?: number;
}

const containerStyle = {
  width: "100%",
  height: "400px",
};

export default function Map({ latitude, longitude, zoom = 15 }: MapProps) {
  const center = {
    lat: latitude,
    lng: longitude,
  };

  // You'll need to add your Google Maps API key to environment variables
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";

  if (!apiKey) {
    return (
      <div className="flex h-96 items-center justify-center rounded-lg border border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Map requires Google Maps API key
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
      <LoadScript googleMapsApiKey={apiKey}>
        <GoogleMap mapContainerStyle={containerStyle} center={center} zoom={zoom}>
          <Marker position={center} />
        </GoogleMap>
      </LoadScript>
    </div>
  );
}
