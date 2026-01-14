import NextAuth from "next-auth";
import type { AuthOptions } from "next-auth";
import { UserRole } from "@prisma/client";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/utils";
import { userLoginSchema } from "@/lib/validations";
import { getServerSession } from "next-auth/next";
import { createHotelAccount } from "@/lib/hotel-setup";

export const authOptions: AuthOptions = {
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID || "",
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || ""
        }),
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

                    // Test database connection
                    try {
                        await prisma.$queryRaw`SELECT 1 as test`;
                    } catch (dbError) {
                        console.error("Database connection failed:", dbError);
                        return null;
                    }

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
        async signIn({ user, account, profile }) {
            if (account?.provider === "google") {
                try {
                    // Check if user exists
                    const existingUser = await prisma.user.findUnique({
                        where: { email: user.email! }
                    });

                    if (!existingUser) {
                        // Create new user with Google account and hotel
                        const newUser = await prisma.$transaction(
                            async (tx) => {
                                const createdUser = await tx.user.create({
                                    data: {
                                        email: user.email!,
                                        name: user.name || "",
                                        password: "", // No password for OAuth users
                                        role: "hotel_admin",
                                        phone: ""
                                    }
                                });

                                // Create hotel account for new Google user
                                await createHotelAccount(
                                    tx,
                                    createdUser.id,
                                    user.name?.split(" ")[0] || "My Hotel", // Use first name as hotel name
                                    user.email!,
                                    ""
                                );

                                return createdUser;
                            }
                        );
                    } else {
                        // Update last login
                        await prisma.user.update({
                            where: { id: existingUser.id },
                            data: { lastLogin: new Date() }
                        });
                    }
                    return true;
                } catch (error) {
                    console.error("Google sign-in error:", error);
                    return false;
                }
            }
            return true;
        },
        async jwt({ token, user, account }) {
            // Always prefer database state for Google users to populate role/hotel
            if (account?.provider === "google") {
                const email = user?.email || token.email;
                if (email) {
                    const dbUser = await prisma.user.findUnique({
                        where: { email },
                        include: { managedHotel: true }
                    });
                    if (dbUser) {
                        token.sub = dbUser.id;
                        token.role = dbUser.role;
                        token.hotelId = dbUser.hotelId;
                        token.hotel = dbUser.managedHotel;
                        return token;
                    }
                }
            }

            if (user) {
                // Credentials login already supplies role/hotel
                token.role = (user as any).role;
                token.hotelId = (user as any).hotelId;
                token.hotel = (user as any).hotel;
            }

            return token;
        },
        async session({ session, token }) {
            if (token && session.user) {
                session.user.id = token.sub!;
                session.user.role = token.role as UserRole;
                session.user.hotelId = token.hotelId as string | null;
                session.user.hotel = token.hotel as any;
            }
            return session;
        },
        async redirect({ url, baseUrl }) {
            // Handle redirect after login based on user role
            if (url.startsWith("/")) {
                return `${baseUrl}${url}`;
            } else if (new URL(url).origin === baseUrl) {
                return url;
            }

            return `${baseUrl}/dashboard`;
        }
    },
    pages: {
        signIn: "/login"
    }
};

// Server-side auth helper for NextAuth v4
export const auth = () => getServerSession(authOptions);

export default NextAuth(authOptions);
