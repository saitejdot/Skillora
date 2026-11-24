import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      role: "STUDENT" | "CUSTOMER" | "ADMIN";
      activeMode: "STUDENT" | "CUSTOMER";
      isVerifiedStudent: boolean;
      avatar?: string | null;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    email: string;
    name: string;
    role: "STUDENT" | "CUSTOMER" | "ADMIN";
    activeMode: "STUDENT" | "CUSTOMER";
    isVerifiedStudent: boolean;
    avatar?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: "STUDENT" | "CUSTOMER" | "ADMIN";
    activeMode: "STUDENT" | "CUSTOMER";
    isVerifiedStudent: boolean;
    avatar?: string | null;
  }
}

