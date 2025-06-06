import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value

    if (!token) {
      return NextResponse.json({ user: null })
    }

    // Verify the JWT token
    const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET || 'fallback-secret') as any

    return NextResponse.json({
      user: {
        id: decoded.id,
        username: decoded.username,
        email: decoded.email,
        role: decoded.role,
        name: decoded.name
      }
    })
  } catch (error) {
    console.error('Session error:', error)
    // If token is invalid, return null user
    return NextResponse.json({ user: null })
  }
}
