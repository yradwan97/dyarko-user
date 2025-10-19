"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { useLocale, useTranslations } from "next-intl";
import { LogOutIcon, UserIcon } from "lucide-react";
import {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { cn, getLocalizedPath } from "@/lib/utils";

interface UserProfileDropdownProps {
  userName: string;
  userEmail?: string;
}

export default function UserProfileDropdown({
  userName,
  userEmail,
}: UserProfileDropdownProps) {
  const t = useTranslations("General");
  const locale = useLocale();
  const router = useRouter();

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push(getLocalizedPath("/", locale));
    router.refresh();
  };

  const handleProfileClick = () => {
    router.push(getLocalizedPath("/user/profile", locale));
  };

  return (
    <DropdownMenuContent
      align="end"
      className={cn("w-56", locale === "ar" ? "text-right" : "text-left")}
    >
      <div className="flex flex-col space-y-1 px-2 py-1.5">
        <p className="text-sm font-medium leading-none">{userName}</p>
        {userEmail && (
          <p className="text-xs leading-none text-muted-foreground">
            {userEmail}
          </p>
        )}
      </div>
      <DropdownMenuSeparator />
      <DropdownMenuItem
        onClick={handleProfileClick}
        className={cn(
          "cursor-pointer",
          locale === "ar" ? "flex-row-reverse" : ""
        )}
      >
        <UserIcon className="mr-2 h-4 w-4" />
        <span>{t("profile")}</span>
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem
        onClick={handleLogout}
        className={cn(
          "cursor-pointer text-red-600 focus:text-red-600",
          locale === "ar" ? "flex-row-reverse" : ""
        )}
      >
        <LogOutIcon className="mr-2 h-4 w-4" />
        <span>{t("logout")}</span>
      </DropdownMenuItem>
    </DropdownMenuContent>
  );
}
