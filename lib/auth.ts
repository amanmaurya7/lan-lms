import type { NextAuthOptions } from "next-auth/next"
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { db } from "./db"

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          return null
        }

        try {
          const [rows] = await db.execute("SELECT * FROM users WHERE username = ? AND is_active = TRUE", [
            credentials.username,
          ])

          const users = rows as any[]
          const user = users[0]

          if (!user) {
            return null
          }

          const isPasswordValid = await bcrypt.compare(credentials.password, user.password_hash)

          if (!isPasswordValid) {
            return null
          }

          // Log login activity
          await db.execute(
            "INSERT INTO activity_logs (user_id, action, ip_address) VALUES (?, ?, ?)",
            [user.id, "login", "127.0.0.1"], // In real implementation, get actual IP
          )

          return {
            id: user.id.toString(),
            username: user.username,
            email: user.email,
            role: user.role,
            name: `${user.first_name} ${user.last_name}`,
          }
        } catch (error) {
          console.error("Auth error:", error)
          return null
        }
      },
    }),
  ],  callbacks: {
    async jwt({ token, user }: { token: any; user: any }) {
      if (user) {
        token.role = user.role
        token.username = user.username
      }
      return token
    },
    async session({ session, token }: { session: any; token: any }) {
      if (token) {
        session.user.id = token.sub!
        session.user.role = token.role as string
        session.user.username = token.username as string
      }
      return session
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
}
