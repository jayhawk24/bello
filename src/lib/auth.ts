import NextAuth from "next-auth";
import { UserRole } from "@prisma/client";
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
                console.log('🔐 Authorization attempt started');
                console.log('🌍 Environment:', process.env.NODE_ENV);
                console.log('🔗 Database URL exists:', process.env.DATABASE_URL ? 'YES' : 'NO');
                console.log('🔑 NextAuth Secret exists:', process.env.NEXTAUTH_SECRET ? 'YES' : 'NO');
                console.log('🌐 NextAuth URL:', process.env.NEXTAUTH_URL);
                console.log('📧 Email provided:', credentials?.email ? '[PROVIDED]' : '[MISSING]');
                console.log('🔒 Password provided:', credentials?.password ? '[PROVIDED]' : '[MISSING]');
                
                if (!credentials?.email || !credentials?.password) {
                    console.log('❌ Missing credentials - authorization failed');
                    return null;
                }

                try {
                    console.log('🔍 Validating credentials format...');
                    // Validate input
                    const validatedFields = userLoginSchema.safeParse({
                        email: credentials.email,
                        password: credentials.password
                    });

                    if (!validatedFields.success) {
                        console.log('❌ Credential validation failed:', validatedFields.error);
                        return null;
                    }

                    const { email, password } = validatedFields.data;
                    console.log('✅ Credential format validated');
                    
                    // Test database connection
                    console.log('🔗 Testing database connection...');
                    try {
                        await prisma.$queryRaw`SELECT 1 as test`;
                        console.log('✅ Database connection successful');
                    } catch (dbError) {
                        console.error('❌ Database connection failed:', dbError);
                        return null;
                    }
                    
                    console.log('🔍 Searching for user:', email);

                    // Find user in database
                    const user = await prisma.user.findUnique({
                        where: { email },
                        include: {
                            managedHotel: true
                        }
                    });

                    console.log('👤 User found:', user ? 'YES' : 'NO');
                    if (user) {
                        console.log('👤 User details:', {
                            id: user.id,
                            email: user.email,
                            role: user.role,
                            hotelId: user.hotelId
                        });
                    }

                    if (!user) {
                        console.log('❌ User not found in database');
                        return null;
                    }

                    console.log('🔐 Verifying password...');
                    // Verify password
                    const isPasswordValid = await verifyPassword(
                        password,
                        user.password
                    );
                    console.log('✅ Password valid:', isPasswordValid ? 'YES' : 'NO');
                    
                    if (!isPasswordValid) {
                        console.log('❌ Invalid password - authorization failed');
                        return null;
                    }

                    console.log('💾 Updating last login...');
                    // Update last login
                    await prisma.user.update({
                        where: { id: user.id },
                        data: { lastLogin: new Date() }
                    });

                    console.log('🎉 Authorization successful! Returning user data');
                    const returnData = {
                        id: user.id,
                        email: user.email,
                        name: user.name,
                        role: user.role,
                        hotelId: user.hotelId,
                        hotel: user.managedHotel
                    };
                    console.log('📤 Return data:', returnData);

                    return returnData;
                } catch (error) {
                    console.error("💥 Auth error:", error);
                    console.error("📊 Error details:", {
                        message: error instanceof Error ? error.message : String(error),
                        stack: error instanceof Error ? error.stack : undefined,
                        name: error instanceof Error ? error.name : undefined
                    });
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
            console.log('🎫 JWT callback triggered');
            console.log('👤 User in JWT:', user ? 'YES' : 'NO');
            console.log('🎫 Token exists:', token ? 'YES' : 'NO');
            
            if (user) {
                console.log('👤 Adding user data to token:', {
                    role: user.role,
                    hotelId: user.hotelId,
                    hasHotel: !!user.hotel
                });
                token.role = user.role;
                token.hotelId = user.hotelId;
                token.hotel = user.hotel;
            }
            return token;
        },
        async session({ session, token }) {
            console.log('📋 Session callback triggered');
            console.log('🎫 Token exists:', token ? 'YES' : 'NO');
            console.log('📋 Session exists:', session ? 'YES' : 'NO');
            
            if (token) {
                console.log('📋 Adding token data to session');
                session.user.id = token.sub!;
                session.user.role = token.role as UserRole;
                session.user.hotelId = token.hotelId as string | null;
                session.user.hotel = token.hotel as any;
            }
            return session;
        },
        async redirect({ url, baseUrl }) {
            console.log('🔄 Redirect callback triggered');
            console.log('🎯 Redirect URL:', url);
            console.log('🏠 Base URL:', baseUrl);
            
            // Handle redirect after login based on user role
            if (url.startsWith("/")) {
                const finalUrl = `${baseUrl}${url}`;
                console.log('✅ Relative URL redirect to:', finalUrl);
                return finalUrl;
            }
            else if (new URL(url).origin === baseUrl) {
                console.log('✅ Same origin redirect to:', url);
                return url;
            }
            
            const dashboardUrl = `${baseUrl}/dashboard`;
            console.log('✅ Default redirect to dashboard:', dashboardUrl);
            return dashboardUrl;
        }
    },
    pages: {
        signIn: "/login"
    }
});
