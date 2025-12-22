"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { Phone, Mail, Building2 } from "lucide-react";
import { FaInstagram, FaLinkedin, FaFacebook, FaSnapchat } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { IconType } from "react-icons";

import Typography from "@/components/shared/typography";
import { Owner } from "@/lib/services/api/companies";

interface CompanyInfoTabProps {
  owner: Owner;
}

interface SocialLink {
  icon: IconType;
  href: string;
  label: string;
}

// Helper to ensure URL has protocol
const ensureProtocol = (url: string): string => {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }
  return `https://${url}`;
};

export default function CompanyInfoTab({ owner }: CompanyInfoTabProps) {
  const t = useTranslations("Companies.Info");

  // Build social links from owner.socialMedia
  const socialLinks = useMemo<SocialLink[]>(() => {
    const links: SocialLink[] = [];
    const social = owner.socialMedia;

    if (!social) return links;

    if (social.instagram) {
      links.push({ icon: FaInstagram, href: ensureProtocol(social.instagram), label: "Instagram" });
    }
    if (social.linkedin) {
      links.push({ icon: FaLinkedin, href: ensureProtocol(social.linkedin), label: "LinkedIn" });
    }
    if (social.facebook) {
      links.push({ icon: FaFacebook, href: ensureProtocol(social.facebook), label: "Facebook" });
    }
    if (social.snapchat) {
      links.push({ icon: FaSnapchat, href: ensureProtocol(social.snapchat), label: "Snapchat" });
    }
    if (social.X) {
      links.push({ icon: FaXTwitter, href: ensureProtocol(social.X), label: "X" });
    }

    return links;
  }, [owner.socialMedia]);

  const hasSocialMedia = socialLinks.length > 0;

  return (
    <div className="flex md:flex-row md:justify-around flex-col items-center gap-6 pt-8 pb-4">
      {/* Phone Number */}
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-100">
          <Phone className="h-5 w-5 text-gray-600" />
        </div>
        <div>
          <Typography variant="body-sm" as="p" className="text-gray-500">
            {t("phone")}
          </Typography>
          <Typography variant="body-md-bold" as="p" className="text-gray-900">
            {owner.phoneNumber ? (
              <a href={`tel:${owner.phoneNumber}`} className="hover:text-main-600 hover:underline">
                {owner.phoneNumber}
              </a>
            ) : (
              t("not-available")
            )}
          </Typography>
        </div>
      </div>

      {/* Email */}
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-100">
          <Mail className="h-5 w-5 text-gray-600" />
        </div>
        <div>
          <Typography variant="body-sm" as="p" className="text-gray-500">
            {t("email")}
          </Typography>
          <Typography variant="body-md-bold" as="p" className="text-gray-900">
            {owner.email ? (
              <a href={`mailto:${owner.email}`} className="hover:text-main-600 hover:underline">
                {owner.email}
              </a>
            ) : (
              t("not-available")
            )}
          </Typography>
        </div>
      </div>

      {/* Social Media */}
      <div className="flex items-start gap-3 mt-8 md:mt-0">
        <div>
          {hasSocialMedia ? (
            <div className="flex items-center gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 text-gray-600 transition-colors hover:border-main-500 hover:text-main-500"
                  aria-label={social.label}
                >
                  <social.icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          ) : (
            <Typography variant="body-md" as="p" className="text-gray-400">
              {t("not-available")}
            </Typography>
          )}
        </div>
      </div>
    </div>
  );
}
