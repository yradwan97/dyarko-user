"use client";

import { useSession } from "next-auth/react";
import { useEffect } from "react";

/**
 * Debug component to show session data in console
 * Add this to any page to see what's in the session
 *
 * Usage: <SessionDebug />
 */
export default function SessionDebug() {
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "loading") {
      console.log("🔄 Session loading...");
    } else if (status === "authenticated" && session) {
      console.log("✅ Session authenticated:");
      console.log("📦 Full session object:", session);
      console.log("👤 User data:", session.user);
      console.log("🔑 Access Token:", session.user?.accessToken);
      console.log("🔄 Refresh Token:", session.user?.refreshToken);
      console.log("👔 Role:", session.user?.role);
    } else {
      console.log("❌ Not authenticated");
    }
  }, [session, status]);

  return null; // This component is invisible - it just logs to console
}
