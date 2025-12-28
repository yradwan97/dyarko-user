"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { useLocale, useTranslations } from "next-intl";
import { BellIcon, MenuIcon, ChevronDown, PlusCircle, Map } from "lucide-react";
import { DropdownMenu, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import Navbar from "./header/navbar";
import MobileSidebar from "./header/mobile-sidebar";
import NotificationDropdown from "./header/notification-dropdown";
import LocalizationDropdown from "./header/localization-dropdown";
import CountryDropdown from "./header/country-dropdown";
import UserProfilePopover from "./header/user-profile-popover";
import Button from "@/components/shared/button";
import CreateAdDialog from "@/components/dialogs/create-ad-dialog";
import { useGetNotifications, useMarkAllNotificationsRead } from "@/hooks/use-notifications";
import { useGetUser } from "@/hooks/use-user";
import type { Notification } from "@/types";
import { cn, getLocalizedPath } from "@/lib/utils";

export default function Header() {
  const t = useTranslations("General");
  const locale = useLocale();
  const [visible, setVisible] = useState(false);
  const [createAdOpen, setCreateAdOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { data: session } = useSession();
  const { data: userData } = useGetUser();
  const [notificationCount, setNotificationCount] = useState(0);

  // Get user profile from API (more up-to-date than session)
  const userProfile = userData?.data;
  // const { data, isSuccess, refetch } = useGetNotifications();
  const markAllReadMutation = useMarkAllNotificationsRead();

  // useEffect(() => {
  //   if (session) {
  //     refetch();
  //   }
  // }, [session, refetch]);

  // useEffect(() => {
  //   if (isSuccess && data?.data) {
  //     const unreadNotifications = data.data.filter((n) => !n.is_read);
  //     setNotifications(unreadNotifications);
  //     setNotificationCount(unreadNotifications?.length || 0);
  //   }
  // }, [data, isSuccess]);

  // const handleReadAllNotifications = () => {
  //   markAllReadMutation.mutate(undefined, {
  //     onSuccess: () => {
  //       refetch();
  //     },
  //   });
  // };

  // User section - Icons and User (logged in)
  const UserSectionLoggedIn = (
    <div
      className={cn(
        "flex items-center gap-2 sm:gap-3",
        // locale === "ar" ? "flex-row-reverse" : "flex-row"
      )}
    >
      <LocalizationDropdown />

      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={() => setCreateAdOpen(true)}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700"
          >
            <PlusCircle className="h-5 w-5 text-gray-700 dark:text-gray-300" />
          </button>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          {t("create-ad")}
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Link
            href={getLocalizedPath("/map", locale)}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700"
          >
            <Map className="h-5 w-5 text-gray-700 dark:text-gray-300" />
          </Link>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          {t("map")}
        </TooltipContent>
      </Tooltip>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700">
            <BellIcon className="relative z-10 h-5 w-5 text-gray-700 dark:text-gray-300" />
            {notificationCount > 0 && (
              <span className="absolute -right-1 -top-1 z-20 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-medium text-white">
                {notificationCount < 9 ? notificationCount : "9+"}
              </span>
            )}
          </button>
        </DropdownMenuTrigger>
        {/* <NotificationDropdown
          onReadAll={handleReadAllNotifications}
          notifications={notifications}
        /> */}
      </DropdownMenu>

      <UserProfilePopover
        userName={userProfile?.name || session?.user?.name || t("defaultUser")}
        userEmail={userProfile?.email || session?.user?.email || undefined}
        userImage={userProfile?.image || session?.user?.image || undefined}
      />

      <button
        className="inline-block xl:hidden"
        onClick={() => setVisible(true)}
      >
        <MenuIcon className="h-6 w-6 text-gray-700 dark:text-gray-300" />
      </button>
    </div>
  );

  // User section - Icons and Sign In (logged out)
  const UserSectionLoggedOut = (
    <div className={cn(
      "flex items-center gap-3",
      locale === "ar" ? "flex-row-reverse" : "flex-row"
    )}>
      <div className="hidden xl:flex items-center gap-3">
        <LocalizationDropdown />
        <Popover>
          <PopoverTrigger asChild suppressHydrationWarning>
            <button className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700">
              <span>{t("helloSignIn")}</span>
              <ChevronDown className="h-4 w-4" />
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-64 p-4" align={locale === "ar" ? "start" : "end"}>
            <div className="space-y-3">
              <Button
                variant="primary"
                to={getLocalizedPath("/login", locale)}
                className="w-full"
              >
                {t("login")}
              </Button>
              <Button
                variant="primary-outline"
                to={getLocalizedPath("/sign-up", locale)}
                className="w-full"
              >
                {t("sign-up")}
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>
      <button
        className="inline-block xl:hidden"
        onClick={() => setVisible(true)}
      >
        <MenuIcon className="h-6 w-6 text-gray-700 dark:text-gray-300" />
      </button>
    </div>
  );

  return (
    <>
      <header className={`top-0 z-20 bg-white flex ${locale === "ar" ? "flex-row-reverse" : "flex-row"} justify-between p-4 shadow-md sm:sticky dark:bg-gray-800 dark:shadow-gray-700/50 items-center gap-2`}>
        {/* Left/Right side - Blue section */}
        <div className={locale === "ar" ? "order-3" : "order-1"}>
          <div className={cn(
            "flex items-center gap-3",
            // locale === "ar" ? "flex-row-reverse" : "flex-row"
          )}>
            <Link href={getLocalizedPath("/", locale)} className="shrink-0">
              <Image
                src="/logo.png"
                alt={t("logoAlt")}
                width={40}
                height={40}
                className="h-10 w-10 object-contain"
              />
            </Link>
            <CountryDropdown />
          </div>
        </div>

        {/* Center navigation */}
        <nav className={cn(
          "hidden flex-1 items-center justify-center xl:flex order-2",
          locale === "ar" ? "xl:flex-row-reverse" : "xl:flex-row"
        )}>
          <Navbar />
        </nav>

        {/* Right/Left side - Red section */}
        <div className={locale === "ar" ? "order-1" : "order-3"}>
          {session ? UserSectionLoggedIn : UserSectionLoggedOut}
        </div>
      </header>
      <MobileSidebar visible={visible} setVisible={setVisible} />
      <CreateAdDialog open={createAdOpen} onOpenChange={setCreateAdOpen} />
    </>
  );
}
