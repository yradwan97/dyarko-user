import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { Plus_Jakarta_Sans } from "next/font/google";
import { routing } from '@/i18n/routing';
import { SessionProvider } from '@/components/providers/session-provider';
import { QueryProvider } from '@/components/providers/query-provider';
import { AxiosInterceptorProvider } from '@/components/providers/axios-interceptor-provider';
import { ThemeProvider } from '@/components/providers/theme-provider';
import { CountryProvider } from '@/components/providers/country-provider';
import { GoogleMapsProvider } from '@/components/providers/google-maps-provider';
import { Toaster } from "@/components/ui/sonner";
import "../globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
});

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // Ensure that the incoming `locale` is valid
  if (!routing.locales.includes(locale as 'en' | 'ar')) {
    notFound();
  }

  // Providing all messages to the client
  // side is the easiest way to get started
  const messages = await getMessages();

  return (
    <html lang={locale} dir={locale === 'ar' ? 'rtl' : 'ltr'} suppressHydrationWarning>
      <body className={`${plusJakartaSans.variable} antialiased`}>
        <NextIntlClientProvider messages={messages}>
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem={false}
            disableTransitionOnChange
          >
            <SessionProvider>
              <CountryProvider>
                <AxiosInterceptorProvider>
                  <QueryProvider>
                    <GoogleMapsProvider>
                      {children}
                    </GoogleMapsProvider>
                  </QueryProvider>
                </AxiosInterceptorProvider>
              </CountryProvider>
            </SessionProvider>
          </ThemeProvider>
        </NextIntlClientProvider>
        <Toaster />
      </body>
    </html>
  );
}
