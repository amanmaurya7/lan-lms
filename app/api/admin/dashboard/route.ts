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

    // Get total users
    const [userRows] = await db.execute("SELECT COUNT(*) as count FROM users WHERE is_active = TRUE")
    const totalUsers = (userRows as any[])[0].count

    // Get total courses
    const [courseRows] = await db.execute("SELECT COUNT(*) as count FROM courses WHERE is_active = TRUE")
    const totalCourses = (courseRows as any[])[0].count

    // Get total quizzes
    const [quizRows] = await db.execute("SELECT COUNT(*) as count FROM quizzes WHERE is_active = TRUE")
    const totalQuizzes = (quizRows as any[])[0].count

    // Get active students (students enrolled in at least one course)
    const [studentRows] = await db.execute(`
      SELECT COUNT(DISTINCT student_id) as count 
      FROM enrollments e 
      JOIN users u ON e.student_id = u.id 
      WHERE u.role = 'student' AND u.is_active = TRUE
    `)
    const activeStudents = (studentRows as any[])[0].count

    // Get recent activity
    const [activityRows] = await db.execute(`
      SELECT 
        al.id,
        al.action,
        CONCAT(u.first_name, ' ', u.last_name) as user,
        DATE_FORMAT(al.created_at, '%M %d, %Y at %h:%i %p') as timestamp
      FROM activity_logs al
      LEFT JOIN users u ON al.user_id = u.id
      ORDER BY al.created_at DESC
      LIMIT 10
    `)

    const recentActivity = (activityRows as any[]).map((row) => ({
      id: row.id,
      action: row.action,
      user: row.user || "System",
      timestamp: row.timestamp,
    }))

    return NextResponse.json({
      totalUsers,
      totalCourses,
      totalQuizzes,
      activeStudents,
      recentActivity,
    })
  } catch (error) {
    console.error("Dashboard API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
