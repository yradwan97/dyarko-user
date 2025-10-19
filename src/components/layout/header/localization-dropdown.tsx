"use client";

import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

type LocalizationDropdownProps = {
  showLanguage?: boolean;
};

export default function LocalizationDropdown({
  showLanguage = false,
}: LocalizationDropdownProps) {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations("Localization");

  const countries = [
    { id: 1, value: "en", name: t("languages.en"), icon: "/us.svg" },
    { id: 2, value: "ar", name: t("languages.ar"), icon: "/kuwait.svg" },
  ];

  const currentCountry = countries.find((c) => c.value === locale) || countries[0];

  const cleanPathname = () => {
    const prefixes = ["/en", "/ar"];
    for (const prefix of prefixes) {
      if (pathname === prefix) {
        return "/";
      } else if (pathname?.startsWith(prefix + "/")) {
        return pathname.slice(prefix.length);
      }
    }
    return pathname || "/";
  };

  const handleLocaleChange = (localeValue: string) => {
    const newPath = `/${localeValue}${cleanPathname()}`;
    router.push(newPath);
  };

  return (
    <Select value={locale} onValueChange={handleLocaleChange}>
      <SelectTrigger
        className={cn(
          "h-9 w-auto gap-2",
          showLanguage ? "min-w-32" : "min-w-fit"
        )}
      >
        <SelectValue>
          <div className="flex items-center gap-2">
            <Image
              src={currentCountry.icon}
              alt={currentCountry.name}
              width={20}
              height={20}
              unoptimized
              className="h-5 w-5 rounded-sm object-cover"
            />
            {showLanguage && (
              <span className="text-sm font-medium">
                {currentCountry.name}
              </span>
            )}
          </div>
        </SelectValue>
      </SelectTrigger>
      <SelectContent align="end" side="bottom">
        {countries.map((country) => (
          <SelectItem
            key={country.id}
            value={country.value}
            className={cn(
              "cursor-pointer",
              locale === "ar" && "flex-row-reverse"
            )}
          >
            <div className="flex items-center gap-2">
              <Image
                src={country.icon}
                alt={country.name}
                width={20}
                height={20}
                unoptimized
                className="h-5 w-5 rounded-sm object-cover"
              />
              <span className="text-sm font-medium">
                {country.name}
              </span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
