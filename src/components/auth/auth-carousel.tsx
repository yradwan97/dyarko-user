"use client";

import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";
import Typography from "@/components/shared/typography";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";

const loginImages = [
  "/assets/login/login-1.png",
  "/assets/login/login-2.png",
  "/assets/login/login-3.png",
];

export default function AuthCarousel() {
  const t = useTranslations("General.PoweredBy");
  const tCarousel = useTranslations("Auth.AuthCarousel");

  return (
    <section className="hidden flex-1 bg-gradient-to-b from-main-100 lg:block">
      <div className="container flex h-full flex-col items-center justify-center gap-y-20 px-14 py-10">
        <Carousel
          opts={{
            align: "start",
            loop: true,
          }}
          plugins={[
            Autoplay({
              delay: 2000,
            }),
          ]}
          className="w-full max-w-md"
        >
          <CarouselContent>
            {loginImages.map((image, index) => (
              <CarouselItem key={index}>
                <div className="flex items-center justify-center p-6">
                  <Image
                    src={image}
                    width={500}
                    height={500}
                    alt={tCarousel("imageAlt", { number: index + 1 })}
                    priority
                    className="rounded-lg"
                  />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
        <div>
          <Typography variant="body-sm-medium" as="p" className="mb-6">
            {t("main")}
          </Typography>
          <Typography variant="body-xs" as="p" className="text-gray-500">
            {t("sub")}{" "}
            <Link href="/terms-conditions" className="font-medium text-main-600">
              {t("link")}
            </Link>{" "}
            {t("long-text")}
          </Typography>
        </div>
      </div>
    </section>
  );
}
