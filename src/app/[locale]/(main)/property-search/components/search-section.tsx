"use client";

import { useTranslations } from "next-intl";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Typography from "@/components/shared/typography";

interface SearchSectionProps {
  priceTo: string;
  setPriceTo: (value: string) => void;
  propertyTypes: { name: string; value: string }[];
  selectedPropertyType: { name: string; value: string } | undefined;
  setSelectedPropertyType: (type: { name: string; value: string }) => void;
  selectedSort: { id: string; name: string };
  setSelectedSort: (sort: { id: string; name: string }) => void;
}

const SORT_OPTIONS = [
  { id: "price", name: "Lowest Price" },
  { id: "-price", name: "Highest Price" },
];

export default function SearchSection({
  priceTo,
  setPriceTo,
  propertyTypes,
  selectedPropertyType,
  setSelectedPropertyType,
  selectedSort,
  setSelectedSort,
}: SearchSectionProps) {
  const t = useTranslations("PropertySearch.filters");

  return (
    <div className="grid flex-1 gap-4 md:grid-cols-3">
      {/* Max Price */}
      <div>
        <Typography variant="body-sm" as="p" className="mb-2 block text-gray-600">
          {t("max-price")}
        </Typography>
        <Input
          type="number"
          placeholder={t("enter-price")}
          value={priceTo}
          onChange={(e) => setPriceTo(e.target.value)}
          className="h-10"
        />
      </div>

      {/* Property Type */}
      <div>
        <Typography variant="body-sm" as="p" className="mb-2 block text-gray-600">
          {t("property-type")}
        </Typography>
        <Select
          value={selectedPropertyType?.value}
          onValueChange={(value) => {
            const type = propertyTypes.find((t) => t.value === value);
            if (type) setSelectedPropertyType(type);
          }}
        >
          <SelectTrigger className="h-10">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {propertyTypes.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                {type.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Sort By */}
      <div>
        <Typography variant="body-sm" as="p" className="mb-2 block text-gray-600">
          {t("sort-by")}
        </Typography>
        <Select
          value={selectedSort.id}
          onValueChange={(value) => {
            const sort = SORT_OPTIONS.find((s) => s.id === value);
            if (sort) setSelectedSort(sort);
          }}
        >
          <SelectTrigger className="h-10">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS.map((option) => (
              <SelectItem key={option.id} value={option.id}>
                {option.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
