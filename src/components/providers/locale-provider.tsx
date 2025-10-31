"use client";

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  // Locale is now handled directly in AxiosInterceptorProvider
  // This component is kept for compatibility but no longer needs logic
  return <>{children}</>;
}
