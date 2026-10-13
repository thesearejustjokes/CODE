import { createServiceClient } from '@/lib/supabase/service'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  Users,
  CheckCircle2,
  Clock,
  Calendar,
  ArrowRight,
  TrendingUp,
  FileCheck2,
  ExternalLink,
} from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

export const dynamic = 'force-dynamic'

async function getDashboardMetrics() {
  const supabase = createServiceClient()

  const [
    { count: totalRegistrations },
    { count: confirmedTeams },
    { count: pendingPaymentReviews },
    { data: events },
    { data: teamsByEvent },
  ] = await Promise.all([
    supabase.from('teams').select('*', { count: 'exact', head: true }),
    supabase.from('teams').select('*', { count: 'exact', head: true }).eq('registration_status', 'confirmed'),
    supabase.from('teams').select('*', { count: 'exact', head: true }).eq('registration_status', 'payment_review'),
    supabase.from('events').select('*').order('created_at', { ascending: false }),
    supabase.from('teams').select('event_id'),
  ])

  // Count registrations by event
  const eventCounts: Record<string, number> = {}
  if (teamsByEvent) {
    for (const t of teamsByEvent) {
      eventCounts[t.event_id] = (eventCounts[t.event_id] || 0) + 1
    }
  }

  const upcomingCount = (events || []).filter(
    (e) => !e.ends_at || new Date(e.ends_at) >= new Date()
  ).length

  return {
    totalRegistrations: totalRegistrations || 0,
    confirmedTeams: confirmedTeams || 0,
    pendingPaymentReviews: pendingPaymentReviews || 0,
    upcomingEventsCount: upcomingCount,
    events: events || [],
    eventCounts,
  }
}

export default async function AdminDashboardPage() {
  const metrics = await getDashboardMetrics()

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary sm:text-3xl">
            Club Overview &amp; Analytics
          </h1>
          <p className="mt-1 text-xs text-text-secondary">
            Live database metrics for C.O.D.E. Club events and registrations
          </p>
        </div>

        <div className="flex gap-3">
          <Link href="/admin/events">
            <Button size="sm" variant="outline" className="border-border text-xs">
              <Calendar className="mr-1.5 h-3.5 w-3.5" /> Events
            </Button>
          </Link>
          <Link href="/admin/registrations">
            <Button size="sm" className="bg-accent text-xs text-surface-0 hover:bg-accent-dim">
              <Users className="mr-1.5 h-3.5 w-3.5" /> Registrations
            </Button>
          </Link>
        </div>
      </div>

      {/* Primary KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-border bg-surface-1">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
              Total Registrations
            </CardTitle>
            <Users className="h-4 w-4 text-text-tertiary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tracking-tight text-text-primary">
              {metrics.totalRegistrations}
            </div>
            <p className="mt-1 text-[11px] text-text-secondary">All-time teams registered</p>
          </CardContent>
        </Card>

        <Card className="border-border bg-surface-1">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
              Confirmed Teams
            </CardTitle>
            <CheckCircle2 className="h-4 w-4 text-status-confirmed" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tracking-tight text-status-confirmed">
              {metrics.confirmedTeams}
            </div>
            <p className="mt-1 text-[11px] text-text-secondary">Verified &amp; active spots</p>
          </CardContent>
        </Card>

        <Card className="border-border bg-surface-1">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
              Awaiting Verification
            </CardTitle>
            <Clock className="h-4 w-4 text-status-review" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tracking-tight text-status-review">
              {metrics.pendingPaymentReviews}
            </div>
            <p className="mt-1 text-[11px] text-text-secondary">
              {metrics.pendingPaymentReviews > 0 ? (
                <Link
                  href="/admin/registrations?status=payment_review"
                  className="font-medium text-accent hover:underline"
                >
                  Action needed &rarr;
                </Link>
              ) : (
                'All receipts verified'
              )}
            </p>
          </CardContent>
        </Card>

        <Card className="border-border bg-surface-1">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
              Active Events
            </CardTitle>
            <Calendar className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tracking-tight text-text-primary">
              {metrics.upcomingEventsCount}
            </div>
            <p className="mt-1 text-[11px] text-text-secondary">
              {metrics.events.length} total event records
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Event Breakdown Table */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="border-border bg-surface-1 lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base text-text-primary">Event Registration Volume</CardTitle>
                <CardDescription className="text-xs text-text-secondary">
                  Breakdown of team sign-ups by event
                </CardDescription>
              </div>
              <Link
                href="/admin/events"
                className="text-xs font-medium text-accent hover:underline"
              >
                Manage Events &rarr;
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {metrics.events.length === 0 ? (
              <div className="rounded-lg border border-dashed border-border py-8 text-center text-xs text-text-secondary">
                No events in the database yet. Click below to create your first event!
              </div>
            ) : (
              <div className="divide-y divide-border">
                {metrics.events.map((event) => {
                  const count = metrics.eventCounts[event.id] || 0
                  return (
                    <div
                      key={event.id}
                      className="flex items-center justify-between py-3.5 first:pt-0 last:pb-0"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-text-primary">
                            {event.title}
                          </span>
                          {event.is_featured && (
                            <span className="rounded bg-accent/10 px-1.5 py-0.5 text-[10px] font-semibold text-accent">
                              Featured
                            </span>
                          )}
                          {!event.published && (
                            <span className="rounded bg-surface-2 px-1.5 py-0.5 text-[10px] text-text-tertiary">
                              Draft
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-text-secondary font-mono">
                          /{event.slug} &bull; {event.fee_per_team > 0 ? formatCurrency(event.fee_per_team) : 'Free'}
                        </p>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <span className="text-base font-bold text-text-primary">{count}</span>
                          <span className="ml-1 text-xs text-text-secondary">teams</span>
                        </div>
                        <Link
                          href={`/admin/registrations?eventId=${event.id}`}
                          className="rounded p-1 text-text-tertiary hover:bg-surface-2 hover:text-text-primary"
                          title="View teams"
                        >
                          <ArrowRight className="h-4 w-4" />
                        </Link>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions Panel */}
        <div className="space-y-6">
          <Card className="border-border bg-surface-1">
            <CardHeader>
              <CardTitle className="text-base text-text-primary">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href="/admin/events" className="block">
                <Button variant="outline" className="w-full justify-between border-border text-xs">
                  <span>Create / Edit Events</span>
                  <Calendar className="h-3.5 w-3.5 text-accent" />
                </Button>
              </Link>
              <Link href="/admin/registrations?status=payment_review" className="block">
                <Button variant="outline" className="w-full justify-between border-border text-xs">
                  <span>Review Pending Payments</span>
                  <FileCheck2 className="h-3.5 w-3.5 text-status-review" />
                </Button>
              </Link>
              <Link href="/admin/registrations" className="block">
                <Button variant="outline" className="w-full justify-between border-border text-xs">
                  <span>Export Registration CSV</span>
                  <TrendingUp className="h-3.5 w-3.5 text-status-confirmed" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="border-border bg-surface-1">
            <CardHeader>
              <CardTitle className="text-base text-text-primary">System Notes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs text-text-secondary">
              <p>
                &bull; <strong className="text-text-primary">One Featured Event:</strong> Database constraint enforces that at most one event is marked as featured for the homepage hero.
              </p>
              <p>
                &bull; <strong className="text-text-primary">Manual Verification:</strong> Registrations requiring fees stay in <span className="text-status-review">Awaiting Verification</span> until approved by an admin.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
