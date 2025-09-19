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
    async signIn() {
      // Always allow Google sign-in
      return true
    },
    async session({ session, token }) {
      // Store user info in session for client-side use
      if (session.user && token.sub) {
        session.user.id = token.sub
        session.user.provider = 'google'
      }
      return session
    },
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id || ''
        token.provider = account?.provider
      }
      return token
    }
  },
  pages: {
    signIn: '/login',
  },
})

export { handler as GET, handler as POST }
