import NextAuth, { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface User {
    id?: string;
    role?: "ADMIN" | "USER" | string;
  }

  interface Session {
    user: {
      id: string;
      role: "ADMIN" | "USER" | string;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: "ADMIN" | "USER" | string;
  }
}
