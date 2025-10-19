"use client";

import { useLocale, useTranslations } from "next-intl";
import Image from "next/image";
import Link from "next/link";
import { Property } from "@/lib/services/api/properties";
import { getLocalizedPath } from "@/lib/utils";
import { Bed, Bath, Square, CheckCircle2, XCircle, Paperclip } from "lucide-react";
import FeatureComponent from "./feature-component";
import AmenetiesComponent from "./ameneties-component";
import ServicesComponent from "./services-component";
import Location from "./location";
import ReservationBox from "./reservation-box";

interface AboutPropertyProps {
  property: Property;
}

export default function AboutProperty({ property }: AboutPropertyProps) {
  const locale = useLocale();
  const tListing = useTranslations("Properties.Listing");
  const t = useTranslations("Properties.Details");

  const { owner, lat, long, amenities, services, category } = property;
  const { _id: ownerId, name: ownerName, image: ownerImage } = owner;

  return (
    <div className="mt-9 grid grid-cols-3 gap-4">
      <div
        className={`order-2 col-span-3 lg:col-span-2 ${
          locale === "ar" ? "lg:order-2" : "lg:order-1"
        }`}
      >
        {/* Property Stats */}
        <div
          className={`flex ${
            locale === "ar" ? "flex-row-reverse" : "flex-row"
          } flex-wrap gap-6 rounded-md border-[1.5px] border-gray-200 p-6 dark:border-gray-700 lg:gap-10`}
        >
          {/* Bedrooms */}
          {property?.bedrooms && (
            <div className="w-3/12 sm:w-auto">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                {tListing("beds")}
              </p>
              <div className="mt-5 flex items-center space-x-2">
                <Bed className="h-6 w-6 text-gray-500 dark:text-gray-400" />
                <p className="text-lg font-bold">{property.bedrooms}</p>
              </div>
            </div>
          )}

          {/* Bathrooms */}
          {property?.bathrooms && (
            <div className="w-3/12 sm:w-auto">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                {tListing("baths")}
              </p>
              <div className="mt-5 flex items-center space-x-2">
                <Bath className="h-6 w-6 text-gray-500 dark:text-gray-400" />
                <p className="text-lg font-bold">{property.bathrooms}</p>
              </div>
            </div>
          )}

          {/* Area */}
          {property?.area && (
            <div className="w-4/12 sm:w-auto">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                {t("area")}
              </p>
              <div className="mt-5 flex items-center space-x-2">
                <Square className="h-6 w-6 text-gray-500 dark:text-gray-400" />
                <p
                  className={`flex text-lg font-bold ${
                    locale === "en" ? "flex-row" : "flex-row-reverse"
                  }`}
                >
                  {property.area}
                  <span>
                    <sup>2</sup>
                  </span>
                </p>
              </div>
            </div>
          )}

          {/* Status */}
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
              {t("status")}
            </p>
            <div className="mt-5 flex items-center space-x-2">
              {property.status === "PUBLISHED" ? (
                <CheckCircle2 className="h-6 w-6 text-green-500" />
              ) : (
                <XCircle className="h-6 w-6 text-gray-500 dark:text-gray-400" />
              )}
              <p className="text-lg font-bold">
                {property.status === "PUBLISHED" ? t("active") : t("inactive")}
              </p>
            </div>
          </div>

          {/* Is Finished */}
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
              {t("is-finished")}
            </p>
            <div className="mt-5 flex items-center space-x-2">
              {property.isFinished ? (
                <CheckCircle2 className="h-6 w-6 text-green-500" />
              ) : (
                <XCircle className="h-6 w-6 text-gray-500 dark:text-gray-400" />
              )}
              <p className="text-lg font-bold">
                {property.isFinished ? t("finished") : t("not-finished")}
              </p>
            </div>
          </div>

          {/* Finish Type */}
          {property?.isFinished && property.finishType && (
            <div className="w-3/12 sm:w-auto">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                {t("finishing")}
              </p>
              <div className="mt-5 flex items-center space-x-2">
                <p className="text-lg font-bold capitalize">{property.finishType}</p>
              </div>
            </div>
          )}
        </div>

        {/* Description */}
        {property?.description && (
          <div className="mt-12 flex flex-col space-y-4">
            <h4 className="text-2xl font-semibold">
              {t("about-this")} {locale === "en" && property.category}
            </h4>
            <p className="overflow-hidden text-gray-500 line-clamp-3 md:line-clamp-none dark:text-gray-400">
              {property.description}
            </p>
          </div>
        )}

        {/* Contract */}
        {property?.contract && (
          <Link
            href={property.contract}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 flex flex-row items-center space-x-4"
          >
            <div className="flex h-11 w-11 flex-row items-center justify-center rounded-2xl bg-gray-100 dark:bg-gray-800">
              <Paperclip className="h-6 w-6 text-primary" />
            </div>
            <p className="font-bold text-gray-800 dark:text-gray-200">{t("documents")}</p>
          </Link>
        )}

        {/* Listed By */}
        <div className="border-b border-gray-200 pb-12 dark:border-gray-700">
          <div className="mt-8 rounded-md border-[1.5px] border-primary bg-primary/10 p-6 dark:border-primary dark:bg-primary/20">
            <p className="text-center text-sm font-medium text-gray-700 dark:text-gray-300">
              {t("listed-by")}
            </p>
            <div
              className={`mt-6 flex flex-col ${
                locale === "ar" ? "sm:flex-row-reverse" : "sm:flex-row"
              } items-start justify-between gap-4 sm:items-center`}
            >
              <div
                className={`flex ${
                  locale === "ar" ? "flex-row-reverse" : "flex-row"
                } items-center`}
              >
                {ownerImage ? (
                  <Image
                    className="mx-4 h-12 w-12 rounded-full object-cover"
                    width={48}
                    height={48}
                    src={ownerImage}
                    alt={ownerName || "Owner"}
                  />
                ) : (
                  <div className="mx-4 flex h-12 w-12 items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700">
                    <span className="text-lg font-bold text-gray-500 dark:text-gray-400">
                      {ownerName?.[0]?.toUpperCase() || "U"}
                    </span>
                  </div>
                )}
                <p className="text-lg font-bold capitalize">{ownerName || "Company Name"}</p>
              </div>
              <Link
                href={getLocalizedPath(`/company-details/${ownerId}`, locale)}
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-primary px-4 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary hover:text-white sm:w-auto"
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                {t("more-info")}
              </Link>
            </div>
          </div>
        </div>

        {/* Feature Component */}
        <FeatureComponent property={property} />

        {/* Amenities */}
        {amenities && amenities.length > 0 && (
          <AmenetiesComponent amenities={amenities} />
        )}

        {/* Services */}
        {services && services.length > 0 && <ServicesComponent services={services} />}

        {/* Location */}
        <Location coords={{ long, lat }} />
      </div>

      {/* Reservation Box */}
      <div
        className={`order-1 col-span-3 lg:col-span-1 ${
          locale === "ar" ? "lg:order-1" : "lg:order-2"
        }`}
      >
        <ReservationBox property={property} />
      </div>
    </div>
  );
}
