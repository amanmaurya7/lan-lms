import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions as any) as any

    if (!session || !session.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const [rows] = await db.execute(`
      SELECT c.*, 
             CONCAT(u.first_name, ' ', u.last_name) as teacher_name,
             COUNT(e.student_id) as enrolled_students
      FROM courses c
      LEFT JOIN users u ON c.teacher_id = u.id
      LEFT JOIN enrollments e ON c.id = e.course_id
      WHERE c.is_active = TRUE
      GROUP BY c.id
      ORDER BY c.created_at DESC
    `)

    return NextResponse.json(rows)
  } catch (error) {
    console.error("Courses API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions as any) as any

    if (!session || !session.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { title, description, course_code, teacher_id, category } = await request.json()

    // Validate required fields
    if (!title || !course_code || !teacher_id) {
      return NextResponse.json({ error: "Title, course code, and teacher are required" }, { status: 400 })
    }

    // Check if course code already exists
    const [existingCourses] = await db.execute("SELECT id FROM courses WHERE course_code = ?", [course_code])

    if ((existingCourses as any[]).length > 0) {
      return NextResponse.json({ error: "Course code already exists" }, { status: 400 })
    }

    // Verify teacher exists
    const [teacherRows] = await db.execute("SELECT id FROM users WHERE id = ? AND role IN ('admin', 'teacher')", [
      teacher_id,
    ])

    if ((teacherRows as any[]).length === 0) {
      return NextResponse.json({ error: "Invalid teacher selected" }, { status: 400 })
    }

    // Insert new course
    const [result] = await db.execute(
      "INSERT INTO courses (title, description, course_code, teacher_id, category) VALUES (?, ?, ?, ?, ?)",
      [title, description, course_code, teacher_id, category],
    )

    // Log activity
    await db.execute("INSERT INTO activity_logs (user_id, action, resource_type, resource_id) VALUES (?, ?, ?, ?)", [
      session.user.id,
      "create_course",
      "course",
      (result as any).insertId,
    ])

    return NextResponse.json({ message: "Course created successfully" })
  } catch (error) {
    console.error("Create course error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
