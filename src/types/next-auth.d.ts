import { type DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      accessToken?: string;
      refreshToken?: string;
      role?: string;
      device_token?: string;
      currency?: string;
      country?: string;
      phoneNumber?: string;
      points?: number;
      status?: string;
      isConfirmed?: boolean;
      nationalID?: string;
      bankInfo?: {
        IBAN?: string;
        bankName?: string;
        swiftCode?: string;
        ACCName?: string;
        _id?: string;
      };
      socialMedia?: {
        facebook?: string;
        X?: string;
        linkedin?: string;
        snapchat?: string;
        _id?: string;
      };
    } & DefaultSession["user"];
  }

  interface User {
    id: string; // Required by NextAuth v5
    accessToken?: string;
    refreshToken?: string;
    role?: string;
    country?: string;
    phoneNumber?: string;
    points?: number;
    status?: string;
    isConfirmed?: boolean;
    nationalID?: string;
    data?: Record<string, unknown>;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    user?: {
      accessToken?: string;
      refreshToken?: string;
      role?: string;
      country?: string;
      phoneNumber?: string;
      points?: number;
      status?: string;
      isConfirmed?: boolean;
      data?: Record<string, unknown>;
    };
  }
}
