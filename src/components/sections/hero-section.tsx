"use client";

import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import CountUp from "react-countup";

import { BuildingIcon, KeyIcon, SearchIcon, UsersIcon } from "@/components/icons";
import { CircleIcon } from "@/components/icons/circle-icon";
import Typography from "@/components/shared/typography";
import { SearchTabs } from "./hero-section/search-tabs";

export default function HeroSection() {
  const t = useTranslations("HomePage.Slider");
  const { data: session } = useSession();

  return (
    <div className="flex bg-gradient-to-br from-main-100 to-white bg-cover bg-center bg-no-repeat">
      <div className="container px-4 pb-12 pt-20 md:px-8 lg:px-16">
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
        <SearchTabs session={session} />

        {/* Stats/Counters */}
        <div className="mb-12 flex translate-y-16 gap-8 md:translate-y-40 lg:translate-y-0">
          <div className="flex-1">
            <CircleIcon
              className="mx-auto hidden sm:mx-0 sm:block"
              icon={<UsersIcon className="h-8 w-8 stroke-white" strokeWidth={2} />}
              subIcon={<KeyIcon className="h-3.5 w-3.5 stroke-white" strokeWidth={2} />}
            />
            <div className="mt-4">
              <Typography
                variant="h4"
                as="h3"
                className="mb-2 text-center text-2xl font-bold text-main-400 sm:text-start"
              >
                <CountUp end={50} enableScrollSpy scrollSpyDelay={1000} />
                {" +"}
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
              icon={<BuildingIcon className="h-8 w-8 stroke-white" strokeWidth={2} />}
              subIcon={<SearchIcon className="h-3.5 w-3.5 stroke-white" strokeWidth={2} />}
            />
            <div className="mt-4">
              <Typography
                variant="h4"
                as="h3"
                className="mb-2 text-center text-2xl font-bold text-main-400 sm:text-start"
              >
                <CountUp end={10} enableScrollSpy scrollSpyDelay={1000} />
                {" +"}
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
    </div>
  );
}
