import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "student") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get enrolled courses count
    const [courseRows] = await db.execute(
      `
      SELECT COUNT(*) as count 
      FROM enrollments e
      JOIN courses c ON e.course_id = c.id
      WHERE e.student_id = ? AND c.is_active = TRUE
    `,
      [session.user.id],
    )
    const enrolledCourses = (courseRows as any[])[0].count

    // Get available quizzes count
    const [availableQuizRows] = await db.execute(
      `
      SELECT COUNT(*) as count 
      FROM quizzes q
      JOIN courses c ON q.course_id = c.id
      JOIN enrollments e ON c.id = e.course_id
      WHERE e.student_id = ? AND q.is_active = TRUE
      AND (q.start_time IS NULL OR q.start_time <= NOW())
      AND (q.end_time IS NULL OR q.end_time >= NOW())
    `,
      [session.user.id],
    )
    const availableQuizzes = (availableQuizRows as any[])[0].count

    // Get completed quizzes count
    const [completedQuizRows] = await db.execute(
      `
      SELECT COUNT(*) as count 
      FROM quiz_attempts qa
      WHERE qa.student_id = ? AND qa.is_completed = TRUE
    `,
      [session.user.id],
    )
    const completedQuizzes = (completedQuizRows as any[])[0].count

    // Get average score
    const [scoreRows] = await db.execute(
      `
      SELECT AVG(CASE WHEN max_score > 0 THEN (score / max_score) * 100 ELSE 0 END) as avg_score
      FROM quiz_attempts
      WHERE student_id = ? AND is_completed = TRUE
    `,
      [session.user.id],
    )
    const averageScore = Math.round((scoreRows as any[])[0].avg_score || 0)

    // Get upcoming quizzes
    const [upcomingQuizRows] = await db.execute(
      `
      SELECT q.id, q.title, c.title as course, 
             COALESCE(q.end_time, 'No deadline') as due_date
      FROM quizzes q
      JOIN courses c ON q.course_id = c.id
      JOIN enrollments e ON c.id = e.course_id
      LEFT JOIN quiz_attempts qa ON q.id = qa.quiz_id AND qa.student_id = e.student_id AND qa.is_completed = TRUE
      WHERE e.student_id = ? AND q.is_active = TRUE
      AND (q.start_time IS NULL OR q.start_time <= NOW())
      AND (q.end_time IS NULL OR q.end_time >= NOW())
      AND qa.id IS NULL
      ORDER BY q.end_time ASC
      LIMIT 5
    `,
      [session.user.id],
    )

    const upcomingQuizzes = (upcomingQuizRows as any[]).map((row) => ({
      id: row.id,
      title: row.title,
      course: row.course,
      dueDate: row.due_date === "No deadline" ? "No deadline" : new Date(row.due_date).toLocaleDateString(),
    }))

    // Get recent activity
    const [activityRows] = await db.execute(
      `
      SELECT al.id, al.action, 
             DATE_FORMAT(al.created_at, '%M %d, %Y at %h:%i %p') as timestamp
      FROM activity_logs al
      WHERE al.user_id = ?
      ORDER BY al.created_at DESC
      LIMIT 10
    `,
      [session.user.id],
    )

    const recentActivity = (activityRows as any[]).map((row) => ({
      id: row.id,
      action: row.action,
      timestamp: row.timestamp,
    }))

    return NextResponse.json({
      enrolledCourses,
      availableQuizzes,
      completedQuizzes,
      averageScore,
      upcomingQuizzes,
      recentActivity,
    })
  } catch (error) {
    console.error("Student dashboard API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
