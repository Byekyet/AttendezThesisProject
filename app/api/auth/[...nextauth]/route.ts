import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcrypt";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

// Use authOptions from lib/auth.ts for consistency
export const { GET, POST } = NextAuth(authOptions);
