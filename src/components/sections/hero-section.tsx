"use client";

import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import CountUp from "react-countup";
import Image from "next/image";
import { CircleIcon } from "@/components/icons/circle-icon";
import { KeyIcon, SearchIcon } from "@/components/icons";
import Typography from "@/components/shared/typography";
import { SearchTabs } from "./hero-section/search-tabs";

export default function HeroSection() {
  const t = useTranslations("HomePage.Slider");
  const { data: session } = useSession();

  return (
    <div className="flex bg-linear-to-br from-main-100 to-white bg-cover bg-center bg-no-repeat">
      <div className="w-full px-4 pb-12 pt-20 md:px-8 lg:container lg:w-1/2 lg:px-16 lg:pl-40">
        <Typography
          variant="h1"
          as="h1"
          className="mb-8 text-center text-4xl text-foreground sm:text-5xl md:text-start"
        >
          {t("main")}
        </Typography>
        <Typography
          variant="body-xl"
          as="p"
          className="mb-10 text-center text-xl text-foreground md:text-start"
        >
          {t("sub")}
        </Typography>

        {/* Search Tabs */}
        <div className="mb-60 w-full md:mb-36 lg:mb-48 xl:w-4/6">
          <SearchTabs session={session} />
        </div>

        {/* Stats/Counters */}
        <div className="mb-12 flex translate-y-24 gap-8 md:translate-y-40 lg:translate-y-0">
          <div className="flex-1">
            <CircleIcon
              className="mx-auto hidden sm:mx-0 sm:block"
              icon={
                <Image
                  src="/icon-1.png"
                  alt="Renters"
                  width={32}
                  height={32}
                  className="h-8 w-8"
                />
              }
              subIcon={<KeyIcon className="size-4 stroke-white" strokeWidth={2} />}
            />
            <div className="mt-4">
              <Typography
                variant="h4"
                as="h3"
                className="mb-2 text-center text-2xl font-bold text-main-400 sm:text-start"
              >
                <CountUp end={50} enableScrollSpy scrollSpyDelay={1000} />
                {`${t("counters.renters.unit")}`}
              </Typography>
              <Typography
                variant="body-md-medium"
                as="p"
                className="hidden text-foreground sm:block"
              >
                {t("counters.renters.msg")}
              </Typography>
            </div>
          </div>

          <div className="flex-1">
            <CircleIcon
              className="mx-auto hidden sm:mx-0 sm:block"
              icon={
                <Image
                  src="/icon-2.png"
                  alt="Properties"
                  width={32}
                  height={32}
                  className="h-8 w-8"
                />
              }
              subIcon={<SearchIcon className="size-4 stroke-white" strokeWidth={2} />}
            />
            <div className="mt-4">
              <Typography
                variant="h4"
                as="h3"
                className="mb-2 text-center text-2xl font-bold text-main-400 sm:text-start"
              >
                <CountUp end={10} enableScrollSpy scrollSpyDelay={1000} />
                {`${t("counters.properties.unit")}`}
              </Typography>
              <Typography
                variant="body-md-medium"
                as="p"
                className="mb-1 hidden text-foreground sm:block lg:mb-0"
              >
                {t("counters.properties.msg")}
              </Typography>
            </div>
          </div>
        </div>
      </div>
      <div className="hidden grow bg-cover bg-bottom-left bg-no-repeat xl:block">
        <Image
          src="/home-1.png"
          alt="Property"
          width={800}
          height={600}
          className="h-full w-full object-cover"
          priority
        />
      </div>
    </div>
  );
}
