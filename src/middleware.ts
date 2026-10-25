import { type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  return updateSession(request)
}

export const config = {
  // Only run middleware on /admin routes (excluding static assets).
  // Public pages bypass middleware entirely for maximum TTFB performance.
  matcher: ['/admin/:path*'],
}
