"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import UserSidebar from "./components/user-sidebar";

export default function UserLayout({ children }: { children: React.ReactNode }) {
  const t = useTranslations("General");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, status } = useSession();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      const currentPath = pathname ? encodeURIComponent(pathname) : '';
      const redirectParam = currentPath ? `?redirect=${currentPath}` : '';
      const loginUrl = `/login${redirectParam}`;
      console.log("🔴 User not authenticated, redirecting from:", pathname);
      console.log("🔴 Login URL:", loginUrl);
      router.push(loginUrl);
    }
  }, [status, router, pathname]);

  // Periodically check session validity
  useEffect(() => {
    if (session) {
      // Check session every 5 minutes
      const interval = setInterval(async () => {
        // Force a session update to trigger JWT validation
        const { getSession } = await import("next-auth/react");
        const currentSession = await getSession();

        // If session is null, it means token expired
        if (!currentSession) {
          const currentPath = pathname ? encodeURIComponent(pathname) : '';
          const redirectParam = currentPath ? `?redirect=${currentPath}` : '';
          const loginUrl = `/login${redirectParam}`;
          console.log("🔴 Session expired, redirecting from:", pathname);
          console.log("🔴 Login URL:", loginUrl);
          router.push(loginUrl);
        }
      }, 5 * 60 * 1000); // 5 minutes

      return () => clearInterval(interval);
    }
  }, [session, router, pathname]);

  // Show loading spinner while checking authentication
  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner className="h-12 w-12 text-main-400" />
      </div>
    );
  }

  // Don't render anything if not authenticated (will redirect)
  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-linear-to-b from-main-100 to-white py-8">
      <div className="container">
        <div className="flex flex-col gap-6 lg:flex-row">
          {/* Mobile Sidebar Trigger */}
          <div className="lg:hidden">
            <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <Menu className="h-4 w-4" />
                  {t("navigation-menu")}
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-70 p-0">
                <SheetTitle className="sr-only">
                  {t("navigation-menu")}
                </SheetTitle>
                <UserSidebar
                  currentPath={pathname}
                  onNavigate={() => setSidebarOpen(false)}
                />
              </SheetContent>
            </Sheet>
          </div>

          {/* Desktop Sidebar */}
          <aside className="hidden lg:block lg:w-1/4">
            <UserSidebar currentPath={pathname} />
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            <div className="rounded-xl border border-main-100 bg-white p-6 shadow-sm">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
