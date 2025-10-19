"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface DropDownSelectProps {
  list: string[];
  onSelect: (selectedIndx: number) => void;
  selectedValue?: number;
}

export default function DropDownSelect({
  list,
  onSelect,
  selectedValue,
}: DropDownSelectProps) {
  const t = useTranslations("General");
  const [selected, setSelected] = useState(
    selectedValue !== undefined ? String(selectedValue) : "0"
  );

  useEffect(() => {
    if (selectedValue !== undefined) {
      setSelected(String(selectedValue));
    }
  }, [selectedValue]);

  const handleChange = (value: string) => {
    setSelected(value);
    onSelect(parseInt(value));
  };

  return (
    <Select value={selected} onValueChange={handleChange}>
      <SelectTrigger className="w-full h-full">
        <SelectValue placeholder={t("selectOption")} />
      </SelectTrigger>
      <SelectContent>
        {list.map((value, indx) => (
          <SelectItem key={indx} value={String(indx)}>
            {value}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
