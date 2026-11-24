import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Please enter your email and password.");
        }

        try {
          const user = await prisma.user.findUnique({
            where: { email: credentials.email.toLowerCase().trim() },
          });

          if (!user) {
            throw new Error("No account found with this email address.");
          }

          if (user.isBlocked) {
            throw new Error("This account has been suspended. Please contact support.");
          }

          const isPasswordValid = await bcrypt.compare(credentials.password, user.password);
          if (!isPasswordValid) {
            throw new Error("Incorrect password. Please try again.");
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            activeMode: user.activeMode,
            isVerifiedStudent: user.isVerifiedStudent,
            avatar: user.avatar,
          };
        } catch (error: any) {
          throw new Error(error.message || "Authentication failed");
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.activeMode = user.activeMode;
        token.isVerifiedStudent = user.isVerifiedStudent;
        token.avatar = user.avatar;
      }

      // Handle session updates (e.g., when switching activeMode from client)
      if (trigger === "update" && session) {
        if (session.activeMode) token.activeMode = session.activeMode;
        if (session.name) token.name = session.name;
        if (session.avatar !== undefined) token.avatar = session.avatar;
        if (session.isVerifiedStudent !== undefined) token.isVerifiedStudent = session.isVerifiedStudent;
      }

      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as "STUDENT" | "CUSTOMER" | "ADMIN";
        session.user.activeMode = token.activeMode as "STUDENT" | "CUSTOMER";
        session.user.isVerifiedStudent = Boolean(token.isVerifiedStudent);
        session.user.avatar = token.avatar as string | null;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET || "skillora-super-secret-key-development-2026-secure-jwt",
};

