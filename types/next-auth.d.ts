declare module "next-auth" {
  interface Session {
    user: {
      id: string
      username: string
      email: string
      name: string
      role: "admin" | "teacher" | "student"
    }
  }

  interface User {
    id: string
    username: string
    email: string
    name: string
    role: "admin" | "teacher" | "student"
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: string
    username: string
  }
}
