"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { useLocale, useTranslations } from "next-intl";
import { LogOutIcon, UserIcon, MoonIcon, SunIcon } from "lucide-react";
import { useTheme } from "next-themes";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import Avatar from "@/components/shared/avatar";
import { cn, getLocalizedPath } from "@/lib/utils";

interface UserProfilePopoverProps {
  userName: string;
  userEmail?: string;
  userImage?: string;
}

export default function UserProfilePopover({
  userName,
  userEmail,
  userImage,
}: UserProfilePopoverProps) {
  const t = useTranslations("General");
  const locale = useLocale();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push(getLocalizedPath("/", locale));
    router.refresh();
  };

  const handleProfileClick = () => {
    router.push(getLocalizedPath("/user/profile", locale));
  };

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          className={cn(
            "flex items-center gap-3 rounded-lg border border-gray-200 px-3 py-2 transition-colors hover:bg-gray-50 focus:outline-none dark:border-gray-700 dark:hover:bg-gray-700",
            locale === "ar" ? "flex-row-reverse" : ""
          )}
        >
          <Avatar
            userName={userName}
            userImg={userImage}
            isVerified={false}
            className="size-6 sm:size-7 md:size-8"
          />
          <span className="hidden text-sm font-medium md:inline dark:text-gray-200">
            {userName}
          </span>
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className={cn("w-72", locale === "ar" ? "text-right" : "text-left")}
      >
        {/* User Info Section */}
        <div
          className={cn(
            "flex items-center justify-between gap-3 pb-4",
            locale === "ar" ? "flex-row-reverse" : ""
          )}
        >
          <div
            className={cn(
              "flex items-center gap-3",
              locale === "ar" ? "flex-row-reverse" : ""
            )}
          >
            <Avatar
              userName={userName}
              userImg={userImage}
              isVerified={false}
              className="h-12 w-12"
            />
            <div className="flex flex-col overflow-hidden">
              <p className="truncate text-sm font-semibold dark:text-gray-200">{userName}</p>
              {userEmail && (
                <p className="truncate text-xs text-muted-foreground dark:text-gray-400">
                  {userEmail}
                </p>
              )}
            </div>
          </div>

          {/* Dark Mode Toggle */}
          {mounted && (
            <button
              onClick={toggleTheme}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 transition-colors hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? (
                <SunIcon className="h-4 w-4 text-gray-700 dark:text-gray-200" />
              ) : (
                <MoonIcon className="h-4 w-4 text-gray-700 dark:text-gray-200" />
              )}
            </button>
          )}
        </div>

        {/* Divider */}
        <div className="mb-4 h-px bg-gray-200 dark:bg-gray-700" />

        {/* Action Buttons */}
        <div className="flex flex-col gap-2">
          <Button
            variant="outline"
            className={cn(
              "w-full justify-start",
              locale === "ar" ? "flex-row-reverse" : ""
            )}
            onClick={handleProfileClick}
          >
            <UserIcon className="mr-2 h-4 w-4" />
            <span>{t("profile")}</span>
          </Button>
          <Button
            variant="outline"
            className={cn(
              "w-full justify-start text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-950/30 dark:hover:text-red-300",
              locale === "ar" ? "flex-row-reverse" : ""
            )}
            onClick={handleLogout}
          >
            <LogOutIcon className="mr-2 h-4 w-4" />
            <span>{t("logout")}</span>
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
