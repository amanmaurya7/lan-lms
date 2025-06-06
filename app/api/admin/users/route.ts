import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import bcrypt from "bcryptjs"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions) as any

    if (!session || !session.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const [rows] = await db.execute(`
      SELECT id, username, email, first_name, last_name, role, is_active, created_at
      FROM users
      ORDER BY created_at DESC
    `)

    return NextResponse.json(rows)
  } catch (error) {
    console.error("Users API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions) as any

    if (!session || !session.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { username, email, password, first_name, last_name, role } = await request.json()

    // Validate required fields
    if (!username || !email || !password || !first_name || !last_name || !role) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 })
    }

    // Check if username or email already exists
    const [existingUsers] = await db.execute("SELECT id FROM users WHERE username = ? OR email = ?", [username, email])

    if ((existingUsers as any[]).length > 0) {
      return NextResponse.json({ error: "Username or email already exists" }, { status: 400 })
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10)

    // Insert new user
    const [result] = await db.execute(
      "INSERT INTO users (username, email, password_hash, first_name, last_name, role) VALUES (?, ?, ?, ?, ?, ?)",
      [username, email, passwordHash, first_name, last_name, role],
    )

    // Log activity
    await db.execute("INSERT INTO activity_logs (user_id, action, resource_type, resource_id) VALUES (?, ?, ?, ?)", [
      session.user.id,
      "create_user",
      "user",
      (result as any).insertId,
    ])

    return NextResponse.json({ message: "User created successfully" })
  } catch (error) {
    console.error("Create user error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
