"use client";

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
  disabled?: boolean;
}

export default function CustomSelect({
  values,
  containerClass,
  selected,
  setSelected,
  disabled
}: CustomSelectProps) {

  const handleChange = (value: string) => {
    const selectedItem = values.find((v) => v.id === value);
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
            {selected && selected.icon}
          </div>
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {values.map((value, index) => (
          <SelectItem key={index} value={value.id}>
            {value.icon}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
