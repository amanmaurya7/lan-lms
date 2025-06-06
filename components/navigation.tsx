"use client"

import { useAuth } from "@/lib/useAuth"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { BookOpen, Users, FileText, Settings, LogOut, User } from "lucide-react"

export function Navigation() {
  const { user, logout } = useAuth()

  if (!user) return null

  const getInitials = (name: string | null | undefined) => {
    if (!name) return "U"
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }
  const getNavItems = () => {
    const role = user?.role
    const items = []

    if (role === "admin") {
      items.push(
        { href: "/admin", label: "Admin Dashboard", icon: Settings },
        { href: "/admin/users", label: "User Management", icon: Users },
        { href: "/admin/courses", label: "Course Management", icon: BookOpen },
        { href: "/admin/reports", label: "Reports", icon: FileText },
      )
    } else if (role === "teacher") {
      items.push(
        { href: "/teacher", label: "Teacher Dashboard", icon: BookOpen },
        { href: "/teacher/courses", label: "My Courses", icon: BookOpen },
        { href: "/teacher/quizzes", label: "Quizzes", icon: FileText },
        { href: "/teacher/assignments", label: "Assignments", icon: FileText },
      )
    } else if (role === "student") {
      items.push(
        { href: "/student", label: "Student Dashboard", icon: BookOpen },
        { href: "/student/courses", label: "My Courses", icon: BookOpen },
        { href: "/student/quizzes", label: "Quizzes", icon: FileText },
        { href: "/student/assignments", label: "Assignments", icon: FileText },
      )
    }

    return items
  }

  return (
    <nav className="border-b bg-background">
      <div className="flex h-16 items-center px-4">
        <Link href="/" className="flex items-center space-x-2">
          <BookOpen className="h-6 w-6" />
          <span className="font-bold">LAN-LMS</span>
        </Link>

        <div className="ml-8 flex space-x-4">
          {getNavItems().map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center space-x-1 text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              <item.icon className="h-4 w-4" />
              <span>{item.label}</span>
            </Link>
          ))}
        </div>

        <div className="ml-auto">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">                <Avatar className="h-8 w-8">
                  <AvatarFallback>{getInitials(user?.name)}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user?.name}</p>
                  <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                  <p className="text-xs leading-none text-muted-foreground capitalize">{user?.role}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/profile" className="flex items-center">
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-600" onClick={logout}>
                <LogOut className="mr-2 h-4 w-4" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  )
}
