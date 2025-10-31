"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useSession } from "next-auth/react";

interface CountryContextType {
  selectedCountry: string;
  setSelectedCountry: (country: string) => void;
}

const CountryContext = createContext<CountryContextType | undefined>(undefined);

export function CountryProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const [selectedCountry, setSelectedCountry] = useState<string>("KW");

  // Initialize from session
  useEffect(() => {
    if (session?.user?.country) {
      setSelectedCountry(session.user.country);
    }
  }, [session]);

  return (
    <CountryContext.Provider value={{ selectedCountry, setSelectedCountry }}>
      {children}
    </CountryContext.Provider>
  );
}

export function useCountryContext() {
  const context = useContext(CountryContext);
  if (context === undefined) {
    throw new Error("useCountryContext must be used within a CountryProvider");
  }
  return context;
}
