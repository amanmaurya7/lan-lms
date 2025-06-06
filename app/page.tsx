"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, Users, FileText, Shield } from "lucide-react"

export default function HomePage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "loading") return

        if (!session) {
      router.push("/login")
      return
    }

    // Redirect based on role
    if ((session as any).user?.role === "admin") {
      router.push("/admin")
    } else if ((session as any).user?.role === "teacher") {
      router.push("/teacher")
    } else {
      router.push("/student")
    }
  }, [session, status, router])

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="h-12 w-12 animate-spin mx-auto mb-4" />
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Welcome to LAN-LMS</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            A comprehensive Learning Management System designed for LAN environments with Safe Exam Browser integration
            and offline-first capabilities.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader>
              <Shield className="h-8 w-8 text-blue-600 mb-2" />
              <CardTitle>Admin Control</CardTitle>
              <CardDescription>
                Complete system administration with user management and course oversight
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Users className="h-8 w-8 text-green-600 mb-2" />
              <CardTitle>Role-Based Access</CardTitle>
              <CardDescription>Secure access control for administrators, teachers, and students</CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <FileText className="h-8 w-8 text-purple-600 mb-2" />
              <CardTitle>Quiz & Assignments</CardTitle>
              <CardDescription>
                Create and manage quizzes with SEB integration and assignment submissions
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <BookOpen className="h-8 w-8 text-orange-600 mb-2" />
              <CardTitle>Course Management</CardTitle>
              <CardDescription>Comprehensive course creation, enrollment, and content management</CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    </div>
  )
}
