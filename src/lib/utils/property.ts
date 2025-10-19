import type { Property, PropertyType, Governorate } from "@/types/property";
import { type ReadonlyURLSearchParams } from "next/navigation";

export const getPropertyAddress = (property: Property): string => {
  return `${property?.code}, ${property?.region}, ${property?.city}`;
};

export const toParams = (params: Record<string, string> = {}): string => {
  const updatedSearchParams = new URLSearchParams(params);
  return updatedSearchParams.toString();
};

export const formatCurrency = (value: number, locale = "en-US"): string => {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    localeMatcher: "best fit",
    currency: "KWD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

export const capitalizeFirst = (value: string): string => {
  const words: string[] = [];
  const separator =
    value?.indexOf("_") > -1 ? "_" : value?.indexOf("-") > -1 ? "-" : " ";

  value?.split(separator).forEach((v: string) => {
    words.push(v);
  });

  return words
    .map((w: string) => {
      return w.substring(0, 1).toUpperCase().concat(w.substring(1));
    })
    .join(" ");
};

export const calculateDifference = (dateString: string, week: boolean) => {
  if (!week && dateString === undefined) {
    return 0;
  }
  const inputDate = new Date(dateString);
  const currentDate = new Date();
  const timeDifference = currentDate.getTime() - inputDate.getTime();

  if (week) {
    const weeksDifference = Math.floor(
      timeDifference / (1000 * 60 * 60 * 24 * 7)
    );
    return weeksDifference;
  }

  return timeDifference;
};

export const squareMetersToSquareFeet = (m2: number) => {
  const conversionFactor = 10.764;
  return m2 * conversionFactor;
};

export const getPropertyPeriod = (property: Property) => {
  return property?.is_daily
    ? "day"
    : property?.is_weekly
    ? "week"
    : property?.is_monthly
    ? "month"
    : null;
};

export const getPropertyPrice = (property: Property) => {
  return property?.payment_type === "rent"
    ? property?.is_daily
      ? property?.daily_price
      : property?.is_weekly
      ? property?.weekly_price
      : property?.monthly_price
    : property?.price;
};

export const useUrlSearchParams = (
  searchParams: ReadonlyURLSearchParams
): string => {
  const urlSearchParams = new URLSearchParams();
  if (searchParams.get("date"))
    urlSearchParams.append("date", searchParams.get("date")!);
  if (searchParams.get("location"))
    urlSearchParams.append("city", searchParams.get("location")!);
  if (searchParams.get("type"))
    urlSearchParams.append("type", searchParams.get("type")!);
  return urlSearchParams.toString() || "";
};

export const fixImageSource = (src: string | null) => {
  const baseUrl = "https://api.dyarko.com";

  if (src === null) {
    return undefined;
  } else if (!src?.startsWith("https://")) {
    return `${baseUrl}/properties/files/${src}`;
  } else if (
    src.indexOf("https://api.dyarko.com/properties/files/") !==
    src.lastIndexOf("https://api.dyarko.com/properties/files/")
  ) {
    return src.substring(
      src.lastIndexOf("https://api.dyarko.com/properties/files/")
    );
  }
  return src;
};

export const removePlusFromParam = (param: string) => {
  return param.replace("+", " ");
};

export const prettifyError = (error: string) => {
  const newError = error.replace(".", ": ").replaceAll("_", " ");
  return `${newError[0].toUpperCase()}${newError.substring(1)}`;
};

export const fixRefundUrl = (src: string) => {
  const baseUrl = "https://api.dyarko.com/refund_policy/files";
  if (src && !src.includes(baseUrl)) {
    return src[0] === "/" ? `${baseUrl}${src}` : `${baseUrl}/${src}`;
  } else {
    return "";
  }
};

export const filterPropertyTypes = (
  category: string,
  propertyTypes: PropertyType[] | undefined
) => {
  switch (category) {
    case "house":
      return (
        propertyTypes?.filter((type: PropertyType) => {
          if (
            [
              "stand_alone",
              "duplex",
              "twin_house",
              "town_house",
              "floor",
              "house",
              "palace",
              "under_construction",
              "villa",
              "studio",
              "penthouse",
            ].indexOf(type.value) > -1
          ) {
            return type;
          }
        }) || []
      );
    case "chalet":
      return (
        propertyTypes?.filter((type: PropertyType) => {
          if (["upper_chalet", "ground_chalet"].indexOf(type.value) > -1) {
            return type;
          }
        }) || []
      );
    case "caravan":
      return (
        propertyTypes?.filter((type: PropertyType) => {
          if (["fixed", "movable"].indexOf(type.value) > -1) {
            return type;
          }
        }) || []
      );
    case "tent_single":
      return (
        propertyTypes?.filter((type: PropertyType) => {
          if (["tent_single"].indexOf(type.value) > -1) {
            return type;
          }
        }) || []
      );
    case "tent_group":
      return (
        propertyTypes?.filter((type: PropertyType) => {
          if (["tent_group"].indexOf(type.value) > -1) {
            return type;
          }
        }) || []
      );
  }
};

export const governorates: Governorate[] = [
  { id: "al_ahmadi", icon: "Al Ahmadi" },
  { id: "al_asimah", icon: "Al-Asimah" },
  { id: "al_farwaniyah", icon: "Farwaniya" },
  { id: "hawalli", icon: "Hawalli" },
  { id: "al_jahra", icon: "Jahra" },
  { id: "mubarak_al_kabeer", icon: "Mubarak Al-Kabeer" },
  { id: "kuwait_city", icon: "Kuwait City" },
];
