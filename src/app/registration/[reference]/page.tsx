import { createServiceClient } from '@/lib/supabase/service'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { UpiPaymentForm } from '@/components/payment/UpiPaymentForm'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatDate, formatDateTime, formatCurrency } from '@/lib/utils'
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  XCircle,
  Calendar,
  MapPin,
  Users,
  ShieldCheck,
  ArrowRight,
} from 'lucide-react'
import type { Metadata } from 'next'
import type { Event as ClubEvent } from '@/types'

interface Props {
  params: Promise<{ reference: string }>
}

export const metadata: Metadata = {
  title: 'Registration Status',
  description: 'Check your team registration and payment status for C.O.D.E. Club events.',
}

function StatusIndicator({ status }: { status: string }) {
  switch (status) {
    case 'confirmed':
      return (
        <div className="flex items-center gap-2 rounded-full border border-status-confirmed/40 bg-status-confirmed/10 px-3 py-1 text-xs font-semibold text-status-confirmed">
          <CheckCircle2 className="h-4 w-4" /> Confirmed
        </div>
      )
    case 'payment_review':
      return (
        <div className="flex items-center gap-2 rounded-full border border-status-review/40 bg-status-review/10 px-3 py-1 text-xs font-semibold text-status-review">
          <Clock className="h-4 w-4" /> Awaiting Verification
        </div>
      )
    case 'rejected':
      return (
        <div className="flex items-center gap-2 rounded-full border border-status-rejected/40 bg-status-rejected/10 px-3 py-1 text-xs font-semibold text-status-rejected">
          <XCircle className="h-4 w-4" /> Action Required / Rejected
        </div>
      )
    case 'cancelled':
      return (
        <div className="flex items-center gap-2 rounded-full border border-status-cancelled/40 bg-status-cancelled/10 px-3 py-1 text-xs font-semibold text-status-cancelled">
          <AlertTriangle className="h-4 w-4" /> Cancelled
        </div>
      )
    case 'pending_payment':
    default:
      return (
        <div className="flex items-center gap-2 rounded-full border border-status-pending/40 bg-status-pending/10 px-3 py-1 text-xs font-semibold text-status-pending">
          <Clock className="h-4 w-4" /> Payment Pending
        </div>
      )
  }
}

export default async function RegistrationStatusPage({ params }: Props) {
  const { reference } = await params

  // Fetch using service client (bypasses RLS to read strictly by unguessable token)
  const supabase = createServiceClient()

  const { data: team, error: teamError } = await supabase
    .from('teams')
    .select(`
      id,
      team_number,
      team_name,
      leader_name,
      leader_email,
      leader_phone,
      registration_status,
      public_reference,
      created_at,
      events (*),
      team_members (full_name, email, college, roll_number),
      payments (status, rejection_reason, created_at, method, transaction_reference)
    `)
    .eq('public_reference', reference)
    .single()

  if (teamError || !team) {
    notFound()
  }

  const rawEvent = team.events
  const event = (Array.isArray(rawEvent) ? rawEvent[0] : rawEvent) as unknown as ClubEvent
  if (!event) {
    notFound()
  }

  const latestPayment = team.payments && team.payments.length > 0
    ? team.payments[team.payments.length - 1]
    : null

  return (
    <PageWrapper>
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex flex-col justify-between gap-4 border-b border-border pb-6 sm:flex-row sm:items-center">
          <div>
            <div className="flex items-center gap-3">
              <span className="font-mono text-xs uppercase tracking-wider text-accent">
                {team.team_number}
              </span>
              <span className="text-xs text-text-tertiary">&bull;</span>
              <span className="text-xs text-text-secondary">
                Registered on {formatDate(team.created_at)}
              </span>
            </div>
            <h1 className="mt-1 text-3xl font-bold tracking-tight text-text-primary">
              {team.team_name}
            </h1>
          </div>
          <StatusIndicator status={team.registration_status} />
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Main Column */}
          <div className="space-y-6 lg:col-span-2">
            {/* Status explanation card */}
            {team.registration_status === 'confirmed' && (
              <div className="rounded-lg border border-status-confirmed/40 bg-status-confirmed/5 p-6">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-6 w-6 text-status-confirmed shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-base font-semibold text-status-confirmed">
                      Your Registration is Confirmed!
                    </h3>
                    <p className="mt-1 text-sm text-text-secondary">
                      Your team spot is officially reserved. Check your email ({team.leader_email}) for event updates and communication channels.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {team.registration_status === 'payment_review' && (
              <div className="rounded-lg border border-status-review/40 bg-status-review/5 p-6">
                <div className="flex items-start gap-3">
                  <Clock className="h-6 w-6 text-status-review shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-base font-semibold text-status-review">
                      Payment Verification in Progress
                    </h3>
                    <p className="mt-1 text-sm text-text-secondary">
                      Thank you! Your transaction reference ({latestPayment?.transaction_reference || 'submitted'}) and receipt have been received. An authorized club administrator will verify the payment against our records shortly.
                    </p>
                    <p className="mt-2 text-xs text-text-tertiary">
                      Bookmark this page to track your confirmation status anytime.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {team.registration_status === 'rejected' && (
              <div className="rounded-lg border border-status-rejected/40 bg-status-rejected/5 p-6">
                <div className="flex items-start gap-3">
                  <XCircle className="h-6 w-6 text-status-rejected shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-base font-semibold text-status-rejected">
                      Payment Needs Attention
                    </h3>
                    <p className="mt-1 text-sm text-text-secondary">
                      Your previous payment submission could not be verified.
                    </p>
                    {latestPayment?.rejection_reason && (
                      <p className="mt-2 rounded bg-surface-2 p-2 font-mono text-xs text-status-rejected">
                        Reason: {latestPayment.rejection_reason}
                      </p>
                    )}
                    <p className="mt-2 text-xs text-text-secondary">
                      You can submit a corrected payment receipt below without losing your team registration.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Payment Form (if pending or rejected) */}
            {(team.registration_status === 'pending_payment' || team.registration_status === 'rejected') && (
              <UpiPaymentForm
                publicReference={team.public_reference}
                feeAmount={event.fee_per_team}
                eventTitle={event.title}
              />
            )}

            {/* Team details card */}
            <Card className="border-border bg-surface-1">
              <CardHeader>
                <CardTitle className="text-base text-text-primary">Team Members</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-lg border border-border bg-surface-2/40 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-text-primary">{team.leader_name}</p>
                      <p className="text-xs text-text-secondary">{team.leader_email} &bull; {team.leader_phone}</p>
                    </div>
                    <Badge variant="outline" className="border-accent/40 text-accent">
                      Leader
                    </Badge>
                  </div>
                </div>

                {team.team_members && team.team_members.slice(1).map((member, idx) => (
                  <div
                    key={idx}
                    className="rounded-lg border border-border bg-surface-2/40 p-4"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-text-primary">{member.full_name}</p>
                        <p className="text-xs text-text-secondary">
                          {member.email}
                          {member.college ? ` &bull; ${member.college}` : ''}
                          {member.roll_number ? ` &bull; ${member.roll_number}` : ''}
                        </p>
                      </div>
                      <Badge variant="outline" className="border-border text-text-tertiary">
                        Member
                      </Badge>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar: Event details */}
          <div className="space-y-6">
            <Card className="border-border bg-surface-1">
              <CardHeader>
                <CardTitle className="text-base text-text-primary">Event Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div>
                  <h4 className="font-semibold text-text-primary">{event.title}</h4>
                  {event.short_description && (
                    <p className="mt-1 text-xs text-text-secondary">{event.short_description}</p>
                  )}
                </div>

                {event.starts_at && (
                  <div className="flex items-center gap-2 text-xs text-text-secondary">
                    <Calendar size={14} className="text-accent shrink-0" />
                    <span>{formatDate(event.starts_at)}</span>
                  </div>
                )}

                {event.venue && (
                  <div className="flex items-center gap-2 text-xs text-text-secondary">
                    <MapPin size={14} className="text-accent shrink-0" />
                    <span>{event.venue}</span>
                  </div>
                )}

                <div className="flex items-center gap-2 text-xs text-text-secondary">
                  <Users size={14} className="text-accent shrink-0" />
                  <span>{event.team_min_size}&ndash;{event.team_max_size} members per team</span>
                </div>

                <div className="border-t border-border pt-3">
                  <Link
                    href={`/events/${event.slug}`}
                    className="inline-flex items-center text-xs font-medium text-accent hover:underline"
                  >
                    View Full Event Page <ArrowRight className="ml-1 h-3 w-3" />
                  </Link>
                </div>
              </CardContent>
            </Card>

            <div className="rounded-lg border border-border bg-surface-1/50 p-4 text-xs text-text-tertiary space-y-2">
              <div className="flex items-center gap-1.5 font-medium text-text-secondary">
                <ShieldCheck className="h-4 w-4 text-accent" /> Security Note
              </div>
              <p>
                This status page is uniquely accessible via your secure reference token. Do not share your URL publicly if you wish to keep your registration private.
              </p>
            </div>
          </div>
        </div>
      </div>
    </PageWrapper>
  )
}
