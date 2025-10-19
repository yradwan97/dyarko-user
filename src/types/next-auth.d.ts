import { type DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      accessToken?: string;
      refreshToken?: string;
      role?: string;
      device_token?: string;
      currency?: string;
    } & DefaultSession["user"];
  }

  interface User {
    id: string; // Required by NextAuth v5
    accessToken?: string;
    refreshToken?: string;
    role?: string;
    data?: Record<string, unknown>;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    user?: {
      accessToken?: string;
      refreshToken?: string;
      role?: string;
      data?: Record<string, unknown>;
    };
  }
}
