import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaClient } from "@/generated/prisma";
import bcrypt from "bcryptjs";
import type { Session } from "next-auth";
import type { JWT } from "next-auth/jwt";

const prisma = new PrismaClient();

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            console.log('Auth: Missing credentials');
            return null;
          }
          
          const user = await prisma.user.findUnique({
            where: { email: credentials.email },
          });
          
          if (!user) {
            console.log('Auth: User not found');
            return null;
          }
          
          const isValid = await bcrypt.compare(credentials.password, user.password);
          
          if (!isValid) {
            console.log('Auth: Invalid password');
            return null;
          }
          
          console.log('Auth: User authenticated successfully:', { id: user.id, email: user.email });
          return { id: user.id.toString(), email: user.email, name: user.name };
        } catch (error) {
          console.error('Auth: Error during authentication:', error);
          return null;
        }
      },
    }),
  ],
  session: { 
    strategy: "jwt" as const,
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // Update session every 24 hours
  },
  jwt: {
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user, account }: { token: JWT; user?: any; account?: any }) {
      try {
        if (user) {
          console.log('JWT callback - user data:', { id: user.id, email: user.email, name: user.name });
          token.id = user.id;
          token.email = user.email;
          token.name = user.name;
        }
        
        // Ensure token has required fields
        if (!token.id && token.sub) {
          token.id = token.sub;
        }
        
        console.log('JWT callback - final token:', token);
        return token;
      } catch (error) {
        console.error('JWT callback error:', error);
        return token;
      }
    },
    async session({ session, token }: { session: Session; token: JWT }) {
      try {
        console.log('Session callback - token:', token);
        console.log('Session callback - session before:', session);
        
        if (token && session.user) {
          (session.user as any).id = token.id as string;
          (session.user as any).email = token.email as string;
          (session.user as any).name = token.name as string;
        }
        
        console.log('Session callback - session after:', session);
        return session;
      } catch (error) {
        console.error('Session callback error:', error);
        return session;
      }
    },
    async redirect({ url, baseUrl }: { url: string; baseUrl: string }) {
      console.log('Redirect callback:', { url, baseUrl });
      // Allows relative callback URLs
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      // Allows callback URLs on the same origin
      else if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
  },
  secret: process.env.NEXTAUTH_SECRET || "your-secret-key-here",
  debug: process.env.NODE_ENV === 'development',
}; 