"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Typography from "@/components/shared/typography";
import { getProxiedImageUrl } from "@/lib/utils";

export function PersonImage({ person, size = 40 }: { person: { image?: string; name: string }, size?: number }) {
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    setImageError(false);
  }, [person.image]);

  const hasValidImage = person.image && (person.image.startsWith('/') || person.image.startsWith('http'));
  console.log('PersonImage render:', { person, size, imageError, hasValidImage });

  if (hasValidImage && !imageError) {
    return (
      <Image
        src={getProxiedImageUrl(person.image)}
        alt={person.name}
        width={size}
        height={size}
        className={`rounded-full object-cover`}
        style={{ width: `${size}px`, height: `${size}px` }}
        onError={() => setImageError(true)}
      />
    );
  }

  return (
    <div
      className="rounded-full bg-gradient-to-br from-main-400 to-main-600 flex items-center justify-center"
      style={{ width: `${size}px`, height: `${size}px` }}
    >
      <Typography variant="body-sm" as="span" className="font-bold text-white">
        {person.name?.charAt(0).toUpperCase() || "?"}
      </Typography>
    </div>
  );
}

export const formatDate = (dateString: string, locale: string = "en-US") => {
  return new Date(dateString).toLocaleDateString(locale === "ar" ? "ar-EG" : "en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export const formatStatus = (status: string) => {
  if (!status) return "";
  return status
    .toLowerCase()
    .split("_")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

export const getStatusColor = (status: string) => {
  const normalizedStatus = status?.toLowerCase() || "";
  switch (normalizedStatus) {
    case "approved":
    case "accepted":
    case "completed":
    case "confirmed":
      return "text-green-600 bg-green-50 border-green-200";
    case "pending":
    case "under_review":
      return "text-yellow-600 bg-yellow-50 border-yellow-200";
    case "rejected":
    case "cancelled":
      return "text-red-600 bg-red-50 border-red-200";
    default:
      return "text-gray-600 bg-gray-50 border-gray-200";
  }
};

export const getCurrency = (countries: any[], countryCode?: string): string => {
  if (!countries || !countryCode) {
    return "KWD";
  }
  const country = countries.find(
    (c) => c.code.toUpperCase() === countryCode.toUpperCase()
  );
  return country?.currency || "KWD";
};
