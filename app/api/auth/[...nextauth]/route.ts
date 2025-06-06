import NextAuth, { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { db } from "@/lib/db"

export const dynamic = 'force-dynamic'

const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          return null
        }

        try {
          const [rows] = await db.execute(
            'SELECT id, username, password, email, role, first_name, last_name FROM users WHERE username = ?',
            [credentials.username]
          )

          const users = rows as any[]
          if (users.length === 0) {
            return null
          }

          const user = users[0]
          const isValid = await bcrypt.compare(credentials.password, user.password)

          if (isValid) {
            return {
              id: user.id.toString(),
              username: user.username,
              email: user.email,
              role: user.role,
              name: `${user.first_name} ${user.last_name}`,
            }
          }

          return null
        } catch (error) {
          console.error('Auth error:', error)
          return null
        }
      }
    })
  ],
  session: {
    strategy: "jwt"
  },
  callbacks: {
    async jwt({ token, user }: any) {
      if (user) {
        token.role = user.role
        token.username = user.username
      }
      return token
    },
    async session({ session, token }: any) {
      if (token) {
        (session as any).user.id = token.sub
        (session as any).user.role = token.role
        (session as any).user.username = token.username
      }
      return session
    }
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  secret: process.env.NEXTAUTH_SECRET,
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
