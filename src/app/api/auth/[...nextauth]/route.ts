import NextAuth from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'

// Extend the default session type
declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
      provider?: string
    }
  }
}

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    })
  ],
  callbacks: {
    async signIn({ user, account }) {
      // Always allow Google sign-in
      console.log('Sign in attempt:', { user: user?.email, provider: account?.provider });
      return true;
    },
    async session({ session, token }) {
      // Store user info in session for client-side use
      if (session.user && token.sub) {
        session.user.id = token.sub;
        session.user.provider = 'google';
      }
      return session;
    },
    async jwt({ token, user, account }) {
      // Persist the OAuth access_token to the token right after signin
      if (account) {
        token.accessToken = account.access_token;
        token.provider = account.provider;
      }
      if (user) {
        token.id = user.id || token.sub || '';
      }
      return token;
    },
    async redirect({ url, baseUrl }) {
      // Handle redirect after successful authentication
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      else if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    }
  },
  pages: {
    signIn: '/login',
  },
  debug: process.env.NODE_ENV === 'development',
})

export { handler as GET, handler as POST }
