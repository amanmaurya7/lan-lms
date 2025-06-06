import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import bcrypt from "bcryptjs"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions as any) as any

    if (!session || !session.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { users } = await request.json()

    if (!users || !Array.isArray(users) || users.length === 0) {
      return NextResponse.json({ error: "No users provided" }, { status: 400 })
    }

    const results = {
      success: 0,
      failed: 0,
      errors: [] as string[],
    }

    for (const userData of users) {
      try {
        const { username, email, password, first_name, last_name, role, course_id } = userData

        // Validate required fields
        if (!username || !email || !password || !first_name || !last_name || !role) {
          results.failed++
          results.errors.push(`Missing required fields for user: ${username || email}`)
          continue
        }

        // Check if username or email already exists
        const [existingUsers] = await db.execute("SELECT id FROM users WHERE username = ? OR email = ?", [
          username,
          email,
        ])

        if ((existingUsers as any[]).length > 0) {
          results.failed++
          results.errors.push(`User already exists: ${username}`)
          continue
        }

        // Hash password
        const passwordHash = await bcrypt.hash(password, 10)

        // Insert new user
        const [result] = await db.execute(
          "INSERT INTO users (username, email, password_hash, first_name, last_name, role) VALUES (?, ?, ?, ?, ?, ?)",
          [username, email, passwordHash, first_name, last_name, role],
        )

        const userId = (result as any).insertId

        // If course_id is provided and user is a student, enroll them
        if (course_id && role === "student") {
          try {
            await db.execute("INSERT INTO enrollments (course_id, student_id) VALUES (?, ?)", [course_id, userId])
          } catch (enrollError) {
            // Log enrollment error but don't fail user creation
            console.error(`Failed to enroll user ${username} in course ${course_id}:`, enrollError)
          }
        }

        results.success++

        // Log activity
        await db.execute(
          "INSERT INTO activity_logs (user_id, action, resource_type, resource_id) VALUES (?, ?, ?, ?)",
          [session.user.id, "bulk_create_user", "user", userId],
        )
      } catch (error) {
        results.failed++
        results.errors.push(`Failed to create user ${userData.username || userData.email}: ${error}`)
      }
    }

    return NextResponse.json({
      message: `Bulk import completed. ${results.success} users created, ${results.failed} failed.`,
      results,
    })
  } catch (error) {
    console.error("Bulk create users error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
