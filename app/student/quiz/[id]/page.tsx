"use client"

import { useSession } from "next-auth/react"
import { useRouter, useParams } from "next/navigation"
import { useEffect, useState } from "react"
import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Clock, AlertTriangle, CheckCircle } from "lucide-react"

interface Quiz {
  id: number
  title: string
  description: string
  time_limit: number
  seb_required: boolean
  questions: Question[]
}

interface Question {
  id: number
  question_text: string
  question_type: "multiple_choice" | "true_false" | "short_answer"
  points: number
  options?: QuestionOption[]
}

interface QuestionOption {
  id: number
  option_text: string
}

export default function TakeQuiz() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const quizId = params.id as string

  const [quiz, setQuiz] = useState<Quiz | null>(null)
  const [loading, setLoading] = useState(true)
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [timeRemaining, setTimeRemaining] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [sebVerified, setSebVerified] = useState(false)
  const [attemptId, setAttemptId] = useState<number | null>(null)
  useEffect(() => {
    if (status === "loading") return

    if (!session || (session as any).user?.role !== "student") {
      router.push("/login")
      return
    }

    checkSEBAndStartQuiz()
  }, [session, status, router, quizId])

  useEffect(() => {
    if (timeRemaining > 0) {
      const timer = setTimeout(() => {
        setTimeRemaining(timeRemaining - 1)
      }, 1000)
      return () => clearTimeout(timer)
    } else if (timeRemaining === 0 && quiz && quiz.time_limit > 0) {
      handleSubmitQuiz()
    }
  }, [timeRemaining, quiz])

  const checkSEBAndStartQuiz = async () => {
    try {
      // Check if SEB is required and verify browser
      const response = await fetch(`/api/student/quiz/${quizId}/start`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "User-Agent": navigator.userAgent,
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        setError(errorData.error || "Failed to start quiz")
        return
      }

      const data = await response.json()
      setQuiz(data.quiz)
      setAttemptId(data.attemptId)
      setSebVerified(data.sebVerified)

      if (data.quiz.time_limit > 0) {
        setTimeRemaining(data.quiz.time_limit * 60) // Convert minutes to seconds
      }
    } catch (error) {
      setError("Failed to load quiz")
    } finally {
      setLoading(false)
    }
  }

  const handleAnswerChange = (questionId: number, answer: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: answer,
    }))
  }

  const handleSubmitQuiz = async () => {
    if (isSubmitting) return

    setIsSubmitting(true)

    try {
      const response = await fetch(`/api/student/quiz/${quizId}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          attemptId,
          answers,
        }),
      })

      if (response.ok) {
        router.push(`/student/quiz/${quizId}/results`)
      } else {
        const errorData = await response.json()
        setError(errorData.error || "Failed to submit quiz")
      }
    } catch (error) {
      setError("Failed to submit quiz")
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`
  }

  const getProgress = () => {
    if (!quiz) return 0
    const answeredQuestions = Object.keys(answers).length
    return (answeredQuestions / quiz.questions.length) * 100
  }

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p>Loading quiz...</p>
        </div>
      </div>
    )
  }
  if (!session || (session as any).user?.role !== "student") {
    return null
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      </div>
    )
  }

  if (!quiz) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <Alert>
            <AlertDescription>Quiz not found</AlertDescription>
          </Alert>
        </div>
      </div>
    )
  }

  if (quiz.seb_required && !sebVerified) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              This quiz requires Safe Exam Browser (SEB). Please open this quiz using SEB with the proper configuration
              file.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    )
  }

  const currentQ = quiz.questions[currentQuestion]

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Quiz Header */}
          <Card className="mb-6">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>{quiz.title}</CardTitle>
                  <CardDescription>{quiz.description}</CardDescription>
                </div>
                <div className="text-right">
                  {quiz.time_limit > 0 && (
                    <div className="flex items-center text-lg font-semibold">
                      <Clock className="h-5 w-5 mr-2" />
                      {formatTime(timeRemaining)}
                    </div>
                  )}
                  {quiz.seb_required && sebVerified && (
                    <div className="flex items-center text-green-600 text-sm mt-1">
                      <CheckCircle className="h-4 w-4 mr-1" />
                      SEB Verified
                    </div>
                  )}
                </div>
              </div>
              <div className="mt-4">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>
                    Progress: {Object.keys(answers).length} of {quiz.questions.length} answered
                  </span>
                  <span>{Math.round(getProgress())}% complete</span>
                </div>
                <Progress value={getProgress()} className="w-full" />
              </div>
            </CardHeader>
          </Card>

          {/* Question Navigation */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex flex-wrap gap-2">
                {quiz.questions.map((_, index) => (
                  <Button
                    key={index}
                    variant={
                      currentQuestion === index ? "default" : answers[quiz.questions[index].id] ? "outline" : "ghost"
                    }
                    size="sm"
                    onClick={() => setCurrentQuestion(index)}
                    className={answers[quiz.questions[index].id] ? "border-green-500" : ""}
                  >
                    {index + 1}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Current Question */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>
                Question {currentQuestion + 1} of {quiz.questions.length}
                <span className="text-sm font-normal text-gray-600 ml-2">
                  ({currentQ.points} {currentQ.points === 1 ? "point" : "points"})
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-6">
                <p className="text-lg mb-4">{currentQ.question_text}</p>

                {currentQ.question_type === "multiple_choice" && currentQ.options && (
                  <RadioGroup
                    value={answers[currentQ.id] || ""}
                    onValueChange={(value) => handleAnswerChange(currentQ.id, value)}
                  >
                    {currentQ.options.map((option) => (
                      <div key={option.id} className="flex items-center space-x-2">
                        <RadioGroupItem value={option.id.toString()} id={`option-${option.id}`} />
                        <Label htmlFor={`option-${option.id}`} className="flex-1 cursor-pointer">
                          {option.option_text}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                )}

                {currentQ.question_type === "true_false" && (
                  <RadioGroup
                    value={answers[currentQ.id] || ""}
                    onValueChange={(value) => handleAnswerChange(currentQ.id, value)}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="true" id="true" />
                      <Label htmlFor="true" className="cursor-pointer">
                        True
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="false" id="false" />
                      <Label htmlFor="false" className="cursor-pointer">
                        False
                      </Label>
                    </div>
                  </RadioGroup>
                )}

                {currentQ.question_type === "short_answer" && (
                  <Textarea
                    placeholder="Enter your answer here..."
                    value={answers[currentQ.id] || ""}
                    onChange={(e) => handleAnswerChange(currentQ.id, e.target.value)}
                    rows={4}
                  />
                )}
              </div>

              <div className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
                  disabled={currentQuestion === 0}
                >
                  Previous
                </Button>

                {currentQuestion < quiz.questions.length - 1 ? (
                  <Button onClick={() => setCurrentQuestion(currentQuestion + 1)}>Next</Button>
                ) : (
                  <Button
                    onClick={handleSubmitQuiz}
                    disabled={isSubmitting}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {isSubmitting ? "Submitting..." : "Submit Quiz"}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Submit Button (always visible) */}
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <Button
                  onClick={handleSubmitQuiz}
                  disabled={isSubmitting}
                  size="lg"
                  className="bg-green-600 hover:bg-green-700"
                >
                  {isSubmitting ? "Submitting Quiz..." : "Submit Quiz"}
                </Button>
                <p className="text-sm text-gray-600 mt-2">Make sure to review all your answers before submitting</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
