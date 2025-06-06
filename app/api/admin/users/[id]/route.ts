import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import bcrypt from "bcryptjs"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions) as any

    if (!session || !session.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = Number.parseInt(params.id)
    const { username, email, password, first_name, last_name, role } = await request.json()

    // Validate required fields
    if (!username || !email || !first_name || !last_name || !role) {
      return NextResponse.json({ error: "All fields except password are required" }, { status: 400 })
    }

    // Check if username or email already exists for other users
    const [existingUsers] = await db.execute("SELECT id FROM users WHERE (username = ? OR email = ?) AND id != ?", [
      username,
      email,
      userId,
    ])

    if ((existingUsers as any[]).length > 0) {
      return NextResponse.json({ error: "Username or email already exists" }, { status: 400 })
    }

    // Prepare update query
    let updateQuery = "UPDATE users SET username = ?, email = ?, first_name = ?, last_name = ?, role = ?"
    const updateParams = [username, email, first_name, last_name, role]

    // Add password to update if provided
    if (password) {
      const passwordHash = await bcrypt.hash(password, 10)
      updateQuery += ", password_hash = ?"
      updateParams.push(passwordHash)
    }

    updateQuery += " WHERE id = ?"
    updateParams.push(userId)

    await db.execute(updateQuery, updateParams)

    // Log activity
    await db.execute("INSERT INTO activity_logs (user_id, action, resource_type, resource_id) VALUES (?, ?, ?, ?)", [
      session.user.id,
      "update_user",
      "user",
      userId,
    ])

    return NextResponse.json({ message: "User updated successfully" })
  } catch (error) {
    console.error("Update user error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions) as any

    if (!session || !session.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = Number.parseInt(params.id)

    // Don't allow deleting the current admin user
    if (userId.toString() === session.user.id) {
      return NextResponse.json({ error: "Cannot delete your own account" }, { status: 400 })
    }

    // Soft delete by setting is_active to false
    await db.execute("UPDATE users SET is_active = FALSE WHERE id = ?", [userId])

    // Log activity
    await db.execute("INSERT INTO activity_logs (user_id, action, resource_type, resource_id) VALUES (?, ?, ?, ?)", [
      session.user.id,
      "delete_user",
      "user",
      userId,
    ])

    return NextResponse.json({ message: "User deleted successfully" })
  } catch (error) {
    console.error("Delete user error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
