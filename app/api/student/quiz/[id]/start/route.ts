import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { db, isSEBBrowser } from "@/lib/db"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions) as any

    if (!session || !session.user || session.user.role !== "student") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const quizId = Number.parseInt(params.id)
    const userAgent = request.headers.get("user-agent") || ""
    const headers = Object.fromEntries(request.headers.entries())

    // Get quiz details
    const [quizRows] = await db.execute(
      `
      SELECT q.*, c.title as course_title
      FROM quizzes q
      JOIN courses c ON q.course_id = c.id
      WHERE q.id = ? AND q.is_active = TRUE
    `,
      [quizId],
    )

    const quizzes = quizRows as any[]
    if (quizzes.length === 0) {
      return NextResponse.json({ error: "Quiz not found" }, { status: 404 })
    }

    const quiz = quizzes[0]

    // Check if student is enrolled in the course
    const [enrollmentRows] = await db.execute(
      `
      SELECT id FROM enrollments 
      WHERE course_id = ? AND student_id = ?
    `,
      [quiz.course_id, session.user.id],
    )

    if ((enrollmentRows as any[]).length === 0) {
      return NextResponse.json({ error: "Not enrolled in this course" }, { status: 403 })
    }

    // Check SEB requirement
    let sebVerified = true
    if (quiz.seb_required) {
      sebVerified = isSEBBrowser(userAgent, headers)
      if (!sebVerified) {
        return NextResponse.json(
          {
            error: "This quiz requires Safe Exam Browser (SEB)",
          },
          { status: 403 },
        )
      }
    }

    // Check if quiz is within time window
    const now = new Date()
    if (quiz.start_time && new Date(quiz.start_time) > now) {
      return NextResponse.json({ error: "Quiz has not started yet" }, { status: 403 })
    }
    if (quiz.end_time && new Date(quiz.end_time) < now) {
      return NextResponse.json({ error: "Quiz has ended" }, { status: 403 })
    }

    // Check existing attempts
    const [attemptRows] = await db.execute(
      `
      SELECT COUNT(*) as attempt_count
      FROM quiz_attempts
      WHERE quiz_id = ? AND student_id = ?
    `,
      [quizId, session.user.id],
    )

    const attemptCount = (attemptRows as any[])[0].attempt_count
    if (attemptCount >= quiz.attempts_allowed) {
      return NextResponse.json(
        {
          error: "Maximum attempts exceeded",
        },
        { status: 403 },
      )
    }

    // Create new attempt
    const [attemptResult] = await db.execute(
      `
      INSERT INTO quiz_attempts (quiz_id, student_id, attempt_number, seb_verified, ip_address, user_agent)
      VALUES (?, ?, ?, ?, ?, ?)
    `,
      [
        quizId,
        session.user.id,
        attemptCount + 1,
        sebVerified,
        request.headers.get("x-forwarded-for") || "127.0.0.1",
        userAgent,
      ],
    )

    const attemptId = (attemptResult as any).insertId

    // Get quiz questions with options
    const [questionRows] = await db.execute(
      `
      SELECT id, question_text, question_type, points, order_num
      FROM quiz_questions
      WHERE quiz_id = ?
      ORDER BY order_num, id
    `,
      [quizId],
    )

    const questions = questionRows as any[]

    // Get options for multiple choice questions
    for (const question of questions) {
      if (question.question_type === "multiple_choice") {
        const [optionRows] = await db.execute(
          `
          SELECT id, option_text, order_num
          FROM quiz_question_options
          WHERE question_id = ?
          ORDER BY order_num, id
        `,
          [question.id],
        )
        question.options = optionRows
      }
    }

    // Log activity
    await db.execute("INSERT INTO activity_logs (user_id, action, resource_type, resource_id) VALUES (?, ?, ?, ?)", [
      session.user.id,
      "start_quiz",
      "quiz",
      quizId,
    ])

    return NextResponse.json({
      quiz: {
        id: quiz.id,
        title: quiz.title,
        description: quiz.description,
        time_limit: quiz.time_limit,
        seb_required: quiz.seb_required,
        questions,
      },
      attemptId,
      sebVerified,
    })
  } catch (error) {
    console.error("Start quiz error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
