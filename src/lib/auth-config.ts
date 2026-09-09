import CredentialsProvider from "next-auth/providers/credentials"
import prisma from "@/lib/prisma"
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { NextAuthOptions } from "next-auth";
import { sendVerificationEmail } from "@/lib/email";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { studentEmail: credentials.email.toLowerCase() }
        });

        if (!user) {
          return null;
        }

        if (!user.isVerified) {
          const verificationToken = crypto.randomUUID();
          const expiresAt = new Date();
          expiresAt.setHours(expiresAt.getHours() + 24);
          await prisma.verificationToken.create({
            data: {
              email: user.studentEmail,
              token: verificationToken,
              expiresAt,
            },
          });
          try {
            await sendVerificationEmail(user.studentEmail, verificationToken);
          } catch (e) {
            console.error("Failed to send verification email on login:", e);
          }
          throw new Error("unverified");
        }

        // 3-month re-verification rule
        if (user.lastVerifiedAt) {
          const threeMonthsAgo = new Date();
          threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
          if (user.lastVerifiedAt < threeMonthsAgo) {
            throw new Error("expired_verification");
          }
        } else {
          // Fallback if lastVerifiedAt is somehow missing but they are verified
          throw new Error("unverified");
        }

        const isPasswordValid = await bcrypt.compare(credentials.password, user.passwordHash);

        if (!isPasswordValid) {
          return null;
        }

        return {
          id: user.id,
          email: user.studentEmail,
          name: user.displayName,
          isFirstLogin: user.isFirstLogin,
        };
      }
    })
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
}
