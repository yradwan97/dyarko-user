"use client";

import { useTranslations } from "next-intl";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { Governorate } from "@/types/property";

interface CustomSelectProps {
  values: Governorate[];
  containerClass?: string;
  selected: Governorate | undefined;
  setSelected: (value: Governorate) => void;
  isGov?: boolean;
  disabled?: boolean;
}

export default function CustomSelect({
  values,
  containerClass,
  selected,
  setSelected,
  isGov,
  disabled
}: CustomSelectProps) {
  const t = useTranslations("General.Regions");

  const handleChange = (value: string) => {
    const selectedItem = values.find((v) => v.id === value);
    console.log(selectedItem, "selectedItem");
    console.log(selected, "selected");
    if (selectedItem) {
      setSelected(selectedItem);
    }
  };

  return (
    <Select
      value={selected?.id || ""}
      onValueChange={handleChange}
      disabled={disabled}
    >
      <SelectTrigger
        className={cn(containerClass)}
      >
        <SelectValue>
          <div className="hidden sm:flex">
            {selected && (isGov ? t(selected.id) : selected.icon)}
          </div>
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {values.map((value, index) => (
          <SelectItem key={index} value={value.id}>
            {isGov ? t(value.id) : value.icon}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
