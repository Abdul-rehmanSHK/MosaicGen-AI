import NextAuth, { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface User {
    id?: string;
    role?: "ADMIN" | "CONTENT_EDITOR" | string;
  }

  interface Session {
    user: {
      id: string;
      role: "ADMIN" | "CONTENT_EDITOR" | string;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: "ADMIN" | "CONTENT_EDITOR" | string;
  }
}
