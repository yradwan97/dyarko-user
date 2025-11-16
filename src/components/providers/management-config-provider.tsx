"use client";

import { createContext, useContext, ReactNode } from "react";
import { useCountryContext } from "./country-provider";
import { useManagementConfig } from "@/hooks/use-management-config";
import type { ManagementConfig } from "@/lib/services/api/management";

interface ManagementConfigContextType {
  config: ManagementConfig | null;
  isLoading: boolean;
  currency: string | null;
}

const ManagementConfigContext = createContext<ManagementConfigContextType | undefined>(undefined);

export function ManagementConfigProvider({ children }: { children: ReactNode }) {
  const { selectedCountry } = useCountryContext();

  const { data: managementConfigData, isLoading } = useManagementConfig(selectedCountry);

  const config = managementConfigData?.data?.[0] || null;
  const currency = config?.currency || null;

  return (
    <ManagementConfigContext.Provider value={{ config, isLoading, currency }}>
      {children}
    </ManagementConfigContext.Provider>
  );
}

export function useManagementConfigContext() {
  const context = useContext(ManagementConfigContext);
  if (context === undefined) {
    throw new Error("useManagementConfigContext must be used within a ManagementConfigProvider");
  }
  return context;
}
