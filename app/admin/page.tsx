"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Navigation } from "@/components/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, BookOpen, FileText, Activity, TrendingUp, Clock } from "lucide-react"

interface DashboardStats {
  totalUsers: number
  totalCourses: number
  totalQuizzes: number
  activeStudents: number
  recentActivity: Array<{
    id: number
    action: string
    user: string
    timestamp: string
  }>
}

export default function AdminDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === "loading") return

    if (!session || !session.user || (session.user as any).role !== "admin") {
      router.push("/login")
      return
    }

    fetchDashboardStats()
  }, [session, status, router])

  const fetchDashboardStats = async () => {
    try {
      const response = await fetch("/api/admin/dashboard")
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
          <Activity className="h-12 w-12 animate-spin mx-auto mb-4" />
          <p>Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (!session || !session.user || (session.user as any).role !== "admin") {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">Welcome back, {session.user?.name}. Here's what's happening in your LMS.</p>
        </div>

        {stats && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalUsers}</div>
                  <p className="text-xs text-muted-foreground">Registered users in system</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalCourses}</div>
                  <p className="text-xs text-muted-foreground">Active courses available</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Quizzes</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalQuizzes}</div>
                  <p className="text-xs text-muted-foreground">Quizzes created</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Students</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.activeStudents}</div>
                  <p className="text-xs text-muted-foreground">Students enrolled in courses</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>Latest system activities and user actions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {stats.recentActivity.map((activity) => (
                      <div key={activity.id} className="flex items-center space-x-4">
                        <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{activity.action}</p>
                          <p className="text-xs text-muted-foreground">by {activity.user}</p>
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

              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>Common administrative tasks</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={() => router.push("/admin/users")}
                      className="p-4 border rounded-lg hover:bg-gray-50 text-left"
                    >
                      <Users className="h-6 w-6 mb-2 text-blue-600" />
                      <p className="font-medium">Manage Users</p>
                      <p className="text-xs text-muted-foreground">Add, edit, or remove users</p>
                    </button>
                    <button
                      onClick={() => router.push("/admin/courses")}
                      className="p-4 border rounded-lg hover:bg-gray-50 text-left"
                    >
                      <BookOpen className="h-6 w-6 mb-2 text-green-600" />
                      <p className="font-medium">Manage Courses</p>
                      <p className="text-xs text-muted-foreground">Create and manage courses</p>
                    </button>
                    <button
                      onClick={() => router.push("/admin/reports")}
                      className="p-4 border rounded-lg hover:bg-gray-50 text-left"
                    >
                      <FileText className="h-6 w-6 mb-2 text-purple-600" />
                      <p className="font-medium">View Reports</p>
                      <p className="text-xs text-muted-foreground">System and user reports</p>
                    </button>
                    <button
                      onClick={() => router.push("/admin/settings")}
                      className="p-4 border rounded-lg hover:bg-gray-50 text-left"
                    >
                      <Activity className="h-6 w-6 mb-2 text-orange-600" />
                      <p className="font-medium">System Settings</p>
                      <p className="text-xs text-muted-foreground">Configure LMS settings</p>
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
