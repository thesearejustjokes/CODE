'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { LayoutDashboard, Calendar, Users, ExternalLink, LogOut } from 'lucide-react'
import { toast } from 'sonner'

export function AdminNav() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut()
      toast.success('Signed out successfully')
      router.push('/admin/login')
      router.refresh()
    } catch (err) {
      console.error(err)
      toast.error('Failed to sign out')
    }
  }

  const links = [
    { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/events', label: 'Events', icon: Calendar },
    { href: '/admin/registrations', label: 'Registrations', icon: Users },
  ]

  // Don't render admin navigation on the login page
  if (pathname === '/admin/login') {
    return null
  }

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-surface-1/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex items-center gap-8">
          <Link href="/admin" className="flex items-center gap-2">
            <span className="font-bold tracking-wider text-accent">C.O.D.E.</span>
            <span className="rounded bg-surface-2 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-text-secondary">
              Admin Portal
            </span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex" aria-label="Admin Navigation">
            {links.map(({ href, label, icon: Icon }) => {
              const active = pathname === href || (href !== '/admin' && pathname.startsWith(href))
              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                    active
                      ? 'bg-accent/10 text-accent font-semibold'
                      : 'text-text-secondary hover:bg-surface-2 hover:text-text-primary'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {label}
                </Link>
              )
            })}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/"
            target="_blank"
            className="hidden items-center gap-1.5 text-xs text-text-tertiary transition-colors hover:text-text-primary sm:flex"
          >
            <span>Live Site</span>
            <ExternalLink className="h-3 w-3" />
          </Link>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleSignOut}
            className="h-8 gap-1.5 px-2.5 text-xs text-text-secondary hover:bg-status-rejected/10 hover:text-status-rejected"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Sign Out</span>
          </Button>
        </div>
      </div>

      {/* Mobile nav bar */}
      <div className="flex border-t border-border-subtle bg-surface-1 px-4 py-2 md:hidden">
        {links.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== '/admin' && pathname.startsWith(href))
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-1 items-center justify-center gap-1.5 rounded py-1.5 text-xs font-medium ${
                active ? 'text-accent font-semibold' : 'text-text-secondary'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
            </Link>
          )
        })}
      </div>
    </header>
  )
}
