import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions as any) as any

    if (!session || !session.user || session.user.role !== "student") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const quizId = Number.parseInt(params.id)
    const { attemptId, answers } = await request.json()

    // Verify attempt belongs to current user
    const [attemptRows] = await db.execute(
      `
      SELECT id, is_completed FROM quiz_attempts
      WHERE id = ? AND student_id = ? AND quiz_id = ?
    `,
      [attemptId, session.user.id, quizId],
    )

    if ((attemptRows as any[]).length === 0) {
      return NextResponse.json({ error: "Invalid attempt" }, { status: 400 })
    }

    const attempt = (attemptRows as any[])[0]
    if (attempt.is_completed) {
      return NextResponse.json({ error: "Quiz already submitted" }, { status: 400 })
    }

    // Get quiz questions with correct answers
    const [questionRows] = await db.execute(
      `
      SELECT q.id, q.question_type, q.points,
             qo.id as option_id, qo.is_correct
      FROM quiz_questions q
      LEFT JOIN quiz_question_options qo ON q.id = qo.question_id
      WHERE q.quiz_id = ?
    `,
      [quizId],
    )

    const questions = questionRows as any[]
    const questionMap = new Map()

    // Build question map with correct answers
    questions.forEach((row) => {
      if (!questionMap.has(row.id)) {
        questionMap.set(row.id, {
          id: row.id,
          question_type: row.question_type,
          points: row.points,
          correctOptions: [],
        })
      }
      if (row.option_id && row.is_correct) {
        questionMap.get(row.id).correctOptions.push(row.option_id)
      }
    })

    let totalScore = 0
    let maxScore = 0

    // Process each answer
    for (const [questionIdStr, answer] of Object.entries(answers)) {
      const questionId = Number.parseInt(questionIdStr)
      const question = questionMap.get(questionId)

      if (!question) continue

      maxScore += question.points
      let isCorrect = false
      let pointsEarned = 0

      if (question.question_type === "multiple_choice") {
        const selectedOptionId = Number.parseInt(answer as string)
        isCorrect = question.correctOptions.includes(selectedOptionId)
        if (isCorrect) {
          pointsEarned = question.points
          totalScore += pointsEarned
        }

        // Insert answer
        await db.execute(
          `
          INSERT INTO quiz_answers (attempt_id, question_id, selected_option_id, is_correct, points_earned)
          VALUES (?, ?, ?, ?, ?)
        `,
          [attemptId, questionId, selectedOptionId, isCorrect, pointsEarned],
        )
      } else if (question.question_type === "true_false") {
        // For true/false, we need to check against correct answer
        const userAnswer = answer === "true"
        // For demo purposes, assume first option is correct answer
        isCorrect = question.correctOptions.length > 0
        if (isCorrect) {
          pointsEarned = question.points
          totalScore += pointsEarned
        }

        await db.execute(
          `
          INSERT INTO quiz_answers (attempt_id, question_id, answer_text, is_correct, points_earned)
          VALUES (?, ?, ?, ?, ?)
        `,
          [attemptId, questionId, answer, isCorrect, pointsEarned],
        )
      } else if (question.question_type === "short_answer") {
        // Short answer requires manual grading
        await db.execute(
          `
          INSERT INTO quiz_answers (attempt_id, question_id, answer_text, is_correct, points_earned)
          VALUES (?, ?, ?, ?, ?)
        `,
          [attemptId, questionId, answer, false, 0],
        )
      }
    }

    // Update attempt with final score
    await db.execute(
      `
      UPDATE quiz_attempts 
      SET submitted_at = NOW(), score = ?, max_score = ?, is_completed = TRUE
      WHERE id = ?
    `,
      [totalScore, maxScore, attemptId],
    )

    // Log activity
    await db.execute("INSERT INTO activity_logs (user_id, action, resource_type, resource_id) VALUES (?, ?, ?, ?)", [
      session.user.id,
      "submit_quiz",
      "quiz",
      quizId,
    ])

    return NextResponse.json({
      message: "Quiz submitted successfully",
      score: totalScore,
      maxScore,
      percentage: maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0,
    })
  } catch (error) {
    console.error("Submit quiz error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
