"use client";

import React, { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import Button from "@/components/shared/button";
import Typography from "@/components/shared/typography";
import { Input } from "@/components/ui/input";

export default function NewsletterSection() {
  const [email, setEmail] = useState("");
  const [emailValid, setEmailValid] = useState(false);
  const t = useTranslations("HomePage.Newsletter");

  useEffect(() => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (emailRegex.test(email)) {
      setEmailValid(true);
    } else {
      setEmailValid(false);
    }
  }, [email]);

  const handleNewsletterSubmit = async () => {
    const newsletterBody = {
      email: email.trim(),
    };
    console.log(newsletterBody);
    // TODO: Implement newsletter API call
    // const res = await axios.post("/newsletter", newsletterBody);
  };

  return (
    <section className="bg-gradient-to-b from-main-100 to-white">
      <div className="container mx-auto py-20 text-center">
        <Typography variant="h4" as="h4" className="text-main-600">
          {t("no-spam")}
        </Typography>
        <div className="mt-3 flex flex-col space-y-4">
          <Typography
            variant="h2"
            as="h2"
            className="text-2xl font-bold leading-[44px] text-black sm:text-4xl sm:leading-[56px]"
          >
            {t("main")}
          </Typography>
          <Typography variant="body-sm" as="p" className="text-gray-600">
            {t("sub")}
          </Typography>
        </div>
        <div className="relative mx-auto mt-8 w-full rounded-lg border border-gray-300 p-3 md:w-6/12 md:p-5">
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border-0 p-3 pr-24 text-sm outline-none md:p-5 md:pr-28 lg:text-lg"
            placeholder={t("placeholder")}
          />
          <Button
            variant={emailValid ? "primary" : "primary"}
            onClick={handleNewsletterSubmit}
            disabled={!emailValid}
            className="absolute right-3 top-1/2 -translate-y-1/2 px-3 py-2 text-sm md:right-5 md:px-4 md:py-2.5 md:text-base"
          >
            {t("submit")}
          </Button>
        </div>
        <Typography
          variant="body-sm-medium"
          as="p"
          className="mt-5 text-gray-400"
        >
          {t("footer-note.1")}{" "}
          <span className="text-main-600">{t("footer-note.2")}</span>{" "}
          {t("footer-note.3")}
        </Typography>
      </div>
    </section>
  );
}
