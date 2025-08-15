import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/utils";
import { userLoginSchema } from "@/lib/validations";

export const { handlers, signIn, signOut, auth } = NextAuth({
    providers: [
        CredentialsProvider({
            name: "credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    return null;
                }

                try {
                    // Validate input
                    const validatedFields = userLoginSchema.safeParse({
                        email: credentials.email,
                        password: credentials.password
                    });

                    if (!validatedFields.success) {
                        return null;
                    }

                    const { email, password } = validatedFields.data;

                    // Find user in database
                    const user = await prisma.user.findUnique({
                        where: { email },
                        include: {
                            managedHotel: true
                        }
                    });

                    if (!user) {
                        return null;
                    }

                    // Verify password
                    const isPasswordValid = await verifyPassword(
                        password,
                        user.password
                    );
                    if (!isPasswordValid) {
                        return null;
                    }

                    // Update last login
                    await prisma.user.update({
                        where: { id: user.id },
                        data: { lastLogin: new Date() }
                    });

                    return {
                        id: user.id,
                        email: user.email,
                        name: user.name,
                        role: user.role,
                        hotelId: user.hotelId,
                        hotel: user.managedHotel
                    };
                } catch (error) {
                    console.error("Auth error:", error);
                    return null;
                }
            }
        })
    ],
    session: {
        strategy: "jwt"
    },
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.role = user.role;
                token.hotelId = user.hotelId;
                token.hotel = user.hotel;
            }
            return token;
        },
        async session({ session, token }) {
            if (token) {
                session.user.id = token.sub!;
                session.user.role = token.role as string;
                session.user.hotelId = token.hotelId as string | null;
                session.user.hotel = token.hotel as any;
            }
            return session;
        }
    },
    pages: {
        signIn: "/auth/login"
    }
});
