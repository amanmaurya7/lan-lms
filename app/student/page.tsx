"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Navigation } from "@/components/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BookOpen, FileText, Clock, Users, TrendingUp } from "lucide-react"

interface DashboardStats {
  enrolledCourses: number
  availableQuizzes: number
  completedQuizzes: number
  averageScore: number
  recentActivity: Array<{
    id: number
    action: string
    timestamp: string
  }>
  upcomingQuizzes: Array<{
    id: number
    title: string
    course: string
    dueDate: string
  }>
}

export default function StudentDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
        if (status === "loading") return

    if (!session || (session as any).user?.role !== "student") {
      router.push("/login")
      return
    }

    fetchDashboardStats()
  }, [session, status, router])

  const fetchDashboardStats = async () => {
    try {
      const response = await fetch("/api/student/dashboard")
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error("Failed to fetch dashboard stats:", error)
    } finally {
      setLoading(false)
    }
  }

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="h-12 w-12 animate-spin mx-auto mb-4" />
          <p>Loading dashboard...</p>
        </div>
      </div>
    )
  }
  if (!session || (session as any).user?.role !== "student") {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Student Dashboard</h1>
          <p className="text-gray-600 mt-2">Welcome back, {(session as any).user?.name}. Here's your learning progress.</p>
        </div>

        {stats && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Enrolled Courses</CardTitle>
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.enrolledCourses}</div>
                  <p className="text-xs text-muted-foreground">Active enrollments</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Available Quizzes</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.availableQuizzes}</div>
                  <p className="text-xs text-muted-foreground">Ready to attempt</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Completed Quizzes</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.completedQuizzes}</div>
                  <p className="text-xs text-muted-foreground">Successfully submitted</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Average Score</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.averageScore}%</div>
                  <p className="text-xs text-muted-foreground">Overall performance</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Upcoming Quizzes</CardTitle>
                  <CardDescription>Quizzes available for you to take</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {stats.upcomingQuizzes.length > 0 ? (
                      stats.upcomingQuizzes.map((quiz) => (
                        <div key={quiz.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <p className="font-medium">{quiz.title}</p>
                            <p className="text-sm text-muted-foreground">{quiz.course}</p>
                            <p className="text-xs text-muted-foreground">Due: {quiz.dueDate}</p>
                          </div>
                          <Button size="sm" onClick={() => router.push(`/student/quiz/${quiz.id}`)}>
                            Take Quiz
                          </Button>
                        </div>
                      ))
                    ) : (
                      <p className="text-muted-foreground">No upcoming quizzes</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>Your recent learning activities</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {stats.recentActivity.map((activity) => (
                      <div key={activity.id} className="flex items-center space-x-4">
                        <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{activity.action}</p>
                        </div>
                        <div className="flex items-center text-xs text-muted-foreground">
                          <Clock className="h-3 w-3 mr-1" />
                          {activity.timestamp}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="mt-8">
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>Common student tasks</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <button
                      onClick={() => router.push("/student/courses")}
                      className="p-4 border rounded-lg hover:bg-gray-50 text-left"
                    >
                      <BookOpen className="h-6 w-6 mb-2 text-blue-600" />
                      <p className="font-medium">My Courses</p>
                      <p className="text-xs text-muted-foreground">View enrolled courses</p>
                    </button>
                    <button
                      onClick={() => router.push("/student/quizzes")}
                      className="p-4 border rounded-lg hover:bg-gray-50 text-left"
                    >
                      <FileText className="h-6 w-6 mb-2 text-green-600" />
                      <p className="font-medium">Quizzes</p>
                      <p className="text-xs text-muted-foreground">Take available quizzes</p>
                    </button>
                    <button
                      onClick={() => router.push("/student/assignments")}
                      className="p-4 border rounded-lg hover:bg-gray-50 text-left"
                    >
                      <FileText className="h-6 w-6 mb-2 text-purple-600" />
                      <p className="font-medium">Assignments</p>
                      <p className="text-xs text-muted-foreground">Submit assignments</p>
                    </button>
                    <button
                      onClick={() => router.push("/student/grades")}
                      className="p-4 border rounded-lg hover:bg-gray-50 text-left"
                    >
                      <TrendingUp className="h-6 w-6 mb-2 text-orange-600" />
                      <p className="font-medium">Grades</p>
                      <p className="text-xs text-muted-foreground">View your grades</p>
                    </button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
