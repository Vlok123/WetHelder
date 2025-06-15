import { DefaultSession, DefaultUser } from "next-auth";
import { JWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      role: string;
      isBlocked: boolean;
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    role: string;
    isBlocked: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: string;
    isBlocked?: boolean;
  }
} 