"use client";

import { useEffect, useState } from "react";
import type { Session } from "next-auth";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

import { CalendarIcon } from "@/components/icons";
import Button from "@/components/shared/button";
import CustomSelect from "@/components/shared/custom-select";
import DropDownSelect from "@/components/shared/dropdown-select";
import Typography from "@/components/shared/typography";
import { useGetPropertyTypes } from "@/hooks/use-properties";
import { governorates } from "@/lib/utils/property";
import type { Governorate } from "@/types/property";
import { getLocalizedPath } from "@/lib/utils";

interface SearchTabContentProps {
  tab: string;
  session: Session | null;
}

export function SearchTabContent({ tab, session }: SearchTabContentProps) {
  const t = useTranslations("HomePage.Slider.TabsContent");
  const router = useRouter();
  const locale = useLocale();
  const { data: propertyTypes } = useGetPropertyTypes();
  const [date, setDate] = useState<Date | null>(null);
  const [selectedGov, setSelectedGov] = useState<Governorate | undefined>(governorates[0]);
  const [selectedPropertyType, setSelectedPropertyType] = useState<{ name: string; value: string } | undefined>();

  useEffect(() => {
    if (propertyTypes && propertyTypes.length > 0) {
      setSelectedPropertyType(propertyTypes[0]);
    }
  }, [propertyTypes]);

  const handleSearch = () => {
    const params = new URLSearchParams();
    params.append("payment_type", tab);
    if (date) params.append("date", date.toISOString());
    if (selectedGov) params.append("city", selectedGov.id);
    if (selectedPropertyType) params.append("type", selectedPropertyType.value);

    router.push(getLocalizedPath(`/property-search?${params.toString()}`, locale));
  };

  return (
    <div className="flex w-full flex-col gap-4 lg:flex-row lg:items-end">
      {/* Location */}
      <div className="flex-1">
        <Typography variant="body-md" as="p" className="mb-2 text-gray-600">
          {t("location")}
        </Typography>
        <CustomSelect
          isGov
          containerClass="w-full rounded-lg py-2 px-4"
          values={governorates}
          selected={selectedGov}
          setSelected={setSelectedGov}
        />
      </div>

      {/* Date */}
      <div className="flex-1">
        <Typography variant="body-md" as="p" className="mb-2 text-gray-600">
          {t("when")}
        </Typography>
        <div className="relative">
          <DatePicker
            className="w-full rounded-lg border border-gray-200 px-4 py-2 text-base font-medium text-foreground placeholder:text-gray-400 focus:border-main-400 focus:outline-none"
            selected={date}
            onChange={(date) => setDate(date)}
            placeholderText={t("date-placeholder")}
            dateFormat="dd/MM/yyyy"
          />
          <CalendarIcon className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 stroke-gray-600" />
        </div>
      </div>

      {/* Property Type - Only for rent/installment and logged in users */}
      {session && tab !== "buy" && propertyTypes && (
        <div className="flex-1">
          <Typography variant="body-md" as="p" className="mb-2 text-gray-600">
            {t("type")}
          </Typography>
          <DropDownSelect
            list={propertyTypes.map((type) => type.name)}
            selectedValue={selectedPropertyType ? propertyTypes.indexOf(selectedPropertyType) : 0}
            onSelect={(indx) => setSelectedPropertyType(propertyTypes[indx])}
          />
        </div>
      )}

      {/* Search Button */}
      <div className="flex-1">
        <Button
          variant="primary"
          onClick={handleSearch}
          className="w-full"
        >
          {t("browse")}
        </Button>
      </div>
    </div>
  );
}
