import NextAuth, { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { noAuthAxios } from "./services/axios-client";

export const authOptions: NextAuthConfig = {
  providers: [
    Credentials({
      credentials: {
        email: {},
        password: {},
        role: {}
      },
      async authorize(credentials) {
        try {
          console.log("🔵 SERVER: Attempting to authorize credentials...");
          console.log("🔵 SERVER: Email:", credentials?.email);
          console.log("🔵 SERVER: Role:", credentials?.role || "user");

          const response = await noAuthAxios.post("/auth/login", {
            email: credentials?.email,
            password: credentials?.password,
            role: credentials?.role || "user",
          });

          console.log("🔵 SERVER: API Response status:", response.status);
          console.log("🔵 SERVER: API Response data:", JSON.stringify(response.data, null, 2));

          if (response.status === 200 && response.data) {
            // NextAuth v5 requires a properly structured user object with an 'id' field
            const apiData = response.data;
            const userData = apiData.data?.user || apiData.user || apiData;
            const userId = userData._id || userData.id || credentials?.email;

            // Return a flattened user object that NextAuth expects
            const user = {
              id: userId, // Required by NextAuth v5
              email: userData.email || credentials?.email,
              name: userData.name,
              image: userData.image,
              // Include all authentication tokens and user data
              accessToken: apiData.data?.accessToken || apiData.accessToken,
              refreshToken: apiData.data?.refreshToken || apiData.refreshToken,
              role: userData.role || credentials?.role || "user",
              // Store the complete user data for later use
              data: userData,
            };

            console.log("✅ SERVER: Authorization successful, returning user with id:", userId);
            console.log("✅ SERVER: User object:", JSON.stringify(user, null, 2));
            return user;
          }

          console.log("❌ SERVER: Authorization failed - invalid response");
          return null;
        } catch (error: any) {
          console.error("❌ SERVER: Authentication error:", error.message);
          console.error("❌ SERVER: Error status:", error.response?.status);
          console.error("❌ SERVER: Error data:", error.response?.data);
          console.error("❌ SERVER: Request URL:", error.config?.baseURL + error.config?.url);
          return null;
        }
      }
    })
  ],
  pages: {
    signIn: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        return {
          ...token,
          user: {
            ...user,
            data: user.data || {}
          }
        };
      }
      return token;
    },
    async session({ session, token }) {
      if (token.user) {
        const userData = token.user as Record<string, unknown>;
        session.user = {
          ...session.user,
          accessToken: userData.accessToken as string,
          refreshToken: userData.refreshToken as string,
          role: userData.role as string,
          // Spread all data from the API response
          ...(userData.data as Record<string, unknown> || {}),
          // Also spread top-level user data for backward compatibility
          ...userData
        };
      }
      return session;
    }
  },
  session: {
    strategy: "jwt",
    maxAge: 60 * 60 * 2 // 2 hours
  },
  trustHost: true,
};

export const { handlers, signIn, signOut, auth } = NextAuth(authOptions);
