"use client";

import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { setAuthToken } from "@/lib/services/axios-client";

export default function AuthTokenSync() {
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "authenticated" && session?.user?.accessToken) {
      setAuthToken(session.user.accessToken);
    } else if (status === "unauthenticated") {
      setAuthToken(null);
    }
  }, [session, status]);

  return null;
}
