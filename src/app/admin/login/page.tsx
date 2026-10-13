'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { Lock, Mail, Loader2, ShieldCheck, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const reason = searchParams.get('reason')

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(
    reason === 'unauthenticated'
      ? 'Please sign in to access the administrator portal.'
      : reason === 'unauthorized'
      ? 'Your account is not registered as an authorized club administrator.'
      : null
  )

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!email || !password) {
      toast.error('Please enter both email and password.')
      return
    }

    setLoading(true)

    try {
      const supabase = createClient()
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      })

      if (signInError) {
        setError(signInError.message || 'Invalid administrator credentials.')
        toast.error('Authentication failed')
        setLoading(false)
        return
      }

      if (!data.user) {
        setError('Login failed. Please check your credentials.')
        setLoading(false)
        return
      }

      toast.success('Welcome back, Admin!')
      router.push('/admin')
      router.refresh()
    } catch (err: unknown) {
      console.error(err)
      setError('An unexpected connection error occurred.')
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center px-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <Link
            href="/"
            className="mb-6 inline-flex items-center text-xs text-text-tertiary transition-colors hover:text-text-primary"
          >
            <ArrowLeft className="mr-1.5 h-3.5 w-3.5" /> Back to Public Site
          </Link>
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl border border-accent/30 bg-surface-1 shadow-accent">
            <ShieldCheck className="h-6 w-6 text-accent" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary">
            C.O.D.E. Admin Portal
          </h1>
          <p className="mt-1 text-xs text-text-secondary">
            Restricted access for authorized club leadership only
          </p>
        </div>

        <Card className="border-border bg-surface-1 shadow-lg">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg text-text-primary">Sign In</CardTitle>
            <CardDescription className="text-xs text-text-secondary">
              Enter your club administrator credentials to continue.
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleLogin}>
            <CardContent className="space-y-4">
              {error && (
                <div className="rounded border border-status-rejected/40 bg-status-rejected/10 p-3 text-xs text-status-rejected">
                  {error}
                </div>
              )}

              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs text-text-primary">
                  Admin Email
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-text-tertiary" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="admin@rnsit.ac.in"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="border-border bg-surface-2 pl-9 text-sm text-text-primary"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-xs text-text-primary">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-4 w-4 text-text-tertiary" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="border-border bg-surface-2 pl-9 text-sm text-text-primary"
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="pt-2">
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-accent text-surface-0 hover:bg-accent-dim"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Verifying...
                  </>
                ) : (
                  'Sign In'
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>

        <p className="text-center text-[11px] text-text-tertiary">
          Need access? Contact the C.O.D.E. faculty coordinator or club lead to have your administrator account provisioned in Supabase Auth.
        </p>
      </div>
    </div>
  )
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-sm text-text-secondary">Loading portal...</div>}>
      <LoginForm />
    </Suspense>
  )
}
