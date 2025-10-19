"use client";

import React from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useLocale, useTranslations } from "next-intl";
import { MapPinIcon, BookmarkIcon, UserCircleIcon, BellIcon, SlidersHorizontalIcon, MenuIcon, SearchIcon } from "lucide-react";
import { cn, getLocalizedPath } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";

export default function MobileHeader() {
  const locale = useLocale();
  const t = useTranslations("Navbar");
  const tGeneral = useTranslations("General");
  const tMobile = useTranslations("HomePage.MobileHeader");
  const [selectedLocation, setSelectedLocation] = React.useState(tGeneral("defaultLocation"));
  const [isOpen, setIsOpen] = React.useState(false);
  const { data: session } = useSession();

  const navLinks = [
    { to: "/companies", text: "companies" },
    { to: "/videos", text: "videos" },
    { to: "/property-listing/rent", text: "rent" },
    { to: "/property-listing/buy", text: "buy" },
    { to: "/property-listing/share", text: "shared" },
    { to: "/categories", text: "categories" },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-gray-100 bg-white/80 px-4 py-3 backdrop-blur-lg">
      <div className="flex items-center justify-between">
        {/* Location Selector */}
        <Button variant="ghost" size="sm" className="gap-2 text-gray-700 hover:bg-gray-100">
          <MapPinIcon className="h-4 w-4" />
          <span className="text-sm font-medium">{selectedLocation}</span>
        </Button>

        {/* Desktop Navigation Links - Hidden on mobile */}
        <nav className="hidden items-center gap-2 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              href={getLocalizedPath(link.to, locale)}
              className="rounded-lg px-3 py-2 text-sm font-medium text-main-500 hover:bg-main-100"
            >
              {t(link.text)}
            </Link>
          ))}
        </nav>

        {/* Action Icons & Buttons */}
        <div className="flex items-center gap-3">
          {session ? (
            <>
              {/* Logged In - Desktop */}
              <Button variant="outline" size="icon" className="hidden md:flex">
                <BookmarkIcon className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" className="relative hidden md:flex">
                <BellIcon className="h-4 w-4" />
                <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-secondary-500 text-[10px] font-medium text-white">
                  3
                </span>
              </Button>
              <Button variant="outline" size="icon" className="hidden md:flex" asChild>
                <Link href="/user">
                  <UserCircleIcon className="h-4 w-4" />
                </Link>
              </Button>
            </>
          ) : (
            <>
              {/* Not Logged In - Desktop Auth Buttons */}
              <div className="hidden items-center gap-2 md:flex">
                <Button variant="outline" size="sm" asChild>
                  <Link href={getLocalizedPath("/login", locale)}>{tGeneral("login")}</Link>
                </Button>
                <Button size="sm" asChild>
                  <Link href={getLocalizedPath("/sign-up", locale)}>{tGeneral("sign-up")}</Link>
                </Button>
              </div>
            </>
          )}

          {/* Mobile Sheet Navigation */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="md:hidden">
                <MenuIcon className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[280px]">
              <SheetHeader>
                <SheetTitle>{tMobile("menuTitle")}</SheetTitle>
              </SheetHeader>

              {session && (
                <div className="mt-4 flex items-center gap-3 rounded-lg bg-gray-50 p-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-main-500 text-white">
                    <UserCircleIcon className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-main-500">
                      {session.user?.name || session.user?.email || tGeneral("defaultUser")}
                    </p>
                    <p className="text-xs text-gray-500">{session.user?.email}</p>
                  </div>
                </div>
              )}

              <nav className="mt-6 flex flex-col gap-2">
                {navLinks.map((link) => (
                  <Link
                    key={link.to}
                    href={getLocalizedPath(link.to, locale)}
                    onClick={() => setIsOpen(false)}
                    className="rounded-lg px-4 py-2 text-sm font-medium text-main-500 hover:bg-main-100"
                  >
                    {t(link.text)}
                  </Link>
                ))}
                {session && (
                  <Link
                    href="/user"
                    onClick={() => setIsOpen(false)}
                    className="rounded-lg px-4 py-2 text-sm font-medium text-main-500 hover:bg-main-100"
                  >
                    {tGeneral("profile")}
                  </Link>
                )}
              </nav>

              {!session && (
                <SheetFooter className="mt-auto">
                  <div className="flex w-full flex-col gap-2">
                    <Button variant="outline" asChild onClick={() => setIsOpen(false)}>
                      <Link href={getLocalizedPath("/login", locale)}>{tGeneral("login")}</Link>
                    </Button>
                    <Button asChild onClick={() => setIsOpen(false)}>
                      <Link href={getLocalizedPath("/sign-up", locale)}>{tGeneral("sign-up")}</Link>
                    </Button>
                  </div>
                </SheetFooter>
              )}
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Search Bar
      <div className="relative mt-3">
        <SearchIcon className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <Input
          type="text"
          placeholder={tMobile("searchPlaceholder")}
          className="h-11 rounded-xl border-gray-200 bg-gray-50/50 pl-11 pr-12 text-sm placeholder:text-gray-400 focus-visible:bg-white focus-visible:ring-2 focus-visible:ring-main-500/20"
        />
        <Button
          variant="ghost"
          size="icon-sm"
          className="absolute right-2 top-1/2 -translate-y-1/2 hover:bg-gray-100"
        >
          <SlidersHorizontalIcon className="h-4 w-4 text-gray-500" />
        </Button>
      </div> */}
    </header>
  );
}
