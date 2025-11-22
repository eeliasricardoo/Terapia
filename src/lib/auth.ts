import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { db } from "@/lib/db";
import Credentials from "next-auth/providers/credentials";
import { z } from "zod";
import bcrypt from "bcryptjs";

// Define the schema for login validation
const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
});

export const { handlers, auth, signIn, signOut } = NextAuth({
    adapter: PrismaAdapter(db),
    providers: [
        Credentials({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            authorize: async (credentials) => {
                const validatedFields = loginSchema.safeParse(credentials);

                if (validatedFields.success) {
                    const { email, password } = validatedFields.data;

                    const user = await db.user.findUnique({
                        where: { email },
                    });

                    if (!user || !user.password) return null;

                    const passwordsMatch = await bcrypt.compare(password, user.password);

                    if (passwordsMatch) return user;
                }

                return null;
            },
        }),
    ],
    callbacks: {
        async session({ session, user, token }) {
            if (token.sub && session.user) {
                session.user.id = token.sub;
            }

            // Fetch user role and attach to session
            if (session.user.email) {
                const dbUser = await db.user.findUnique({ where: { email: session.user.email } });
                if (dbUser) {
                    // @ts-ignore - extending session type
                    session.user.role = dbUser.role;
                }
            }

            return session;
        },
        async jwt({ token }) {
            return token;
        }
    },
    session: { strategy: "jwt" },
    pages: {
        signIn: "/login",
    },
});
