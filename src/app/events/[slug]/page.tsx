import { getEventBySlug } from '@/lib/supabase/public'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { ScrollReveal } from '@/components/animations/ScrollReveal'
import { CountdownTimer } from '@/components/animations/CountdownTimer'
import { BubbleField } from '@/components/animations/BubbleField'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Calendar, MapPin, Users, IndianRupee, Clock, Mail, Phone } from 'lucide-react'
import type { Event } from '@/types'
import { formatDate, formatDateTime, formatCurrency, isDeadlinePassed } from '@/lib/utils'
import { InterestForm } from '@/components/events/InterestForm'
import type { Metadata } from 'next'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const event = await getEventBySlug(slug)

  if (!event) return { title: 'Event Not Found' }

  return {
    title: event.title,
    description: event.short_description ?? undefined,
  }
}

export const revalidate = 60

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <ScrollReveal>
      <div className="mb-10">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-widest text-accent">
          {title}
        </h2>
        <div className="prose prose-sm prose-invert max-w-none text-text-secondary">{children}</div>
      </div>
    </ScrollReveal>
  )
}

export default async function EventDetailPage({ params }: Props) {
  const { slug } = await params
  const event = await getEventBySlug(slug)

  if (!event) notFound()

  const registrationOpen =
    event.registration_open &&
    !isDeadlinePassed(event.registration_deadline)

  return (
    <PageWrapper noTopPadding>
      {/* Banner */}
      <div className="relative pt-16 h-72 w-full overflow-hidden bg-surface-1 sm:h-96 lg:h-[28rem]">
        {event.banner_image_url ? (
          <Image
            src={event.banner_image_url}
            alt={`${event.title} banner`}
            fill
            className="object-cover"
            unoptimized
            priority
          />
        ) : (
          <div className="flex h-full items-center justify-center border-b border-border">
            <span className="text-4xl font-bold tracking-widest text-text-tertiary">C.O.D.E.</span>
          </div>
        )}
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(to bottom, transparent 40%, rgba(13,13,13,0.95) 100%)',
          }}
        />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 pb-24 pt-8 sm:px-6 lg:px-8">
        <BubbleField count={6} className="opacity-40" />

        <div className="relative z-10 grid grid-cols-1 gap-12 lg:grid-cols-3">
          {/* Main content */}
          <div className="lg:col-span-2">
            <ScrollReveal>
              <h1 className="mb-4 text-4xl font-bold leading-tight text-text-primary">
                {event.title}
              </h1>
            </ScrollReveal>

            {/* If registrations are paused, show the Expression of Interest Form right here */}
            {!registrationOpen && (
              <div id="interest-form" className="mb-12">
                <ScrollReveal>
                  <InterestForm event={event} />
                </ScrollReveal>
              </div>
            )}

            {event.description && (
              <Section title="About">
                <p className="whitespace-pre-line">{event.description}</p>
              </Section>
            )}

            {event.round1 && (
              <Section title="ROUND 1 — SYNTAX SURGERY (100 Points)">
                <p className="whitespace-pre-line">{event.round1}</p>
              </Section>
            )}

            {event.round2 && (
              <Section title="ROUND 2 — PROMPT PIXEL / REVERSE PROMPT IMAGING (100 Points)">
                <p className="whitespace-pre-line">{event.round2}</p>
              </Section>
            )}

            {event.round3 && (
              <Section title="ROUND 3 — BID & WIN / CODE AUCTION (200 Points)">
                <p className="whitespace-pre-line">{event.round3}</p>
              </Section>
            )}

            {event.decidingW && (
              <Section title="DECIDING THE WINNER">
                <p className="whitespace-pre-line">{event.decidingW}</p>
              </Section>
            )}

            {event.eligibility && (
              <Section title="Eligibility">
                <p className="whitespace-pre-line">{event.eligibility}</p>
              </Section>
            )}

            {event.rules && (
              <Section title="Rules &amp; Guidelines">
                <p className="whitespace-pre-line">{event.rules}</p>
              </Section>
            )}

            {event.schedule && (
              <Section title="Schedule">
                <p className="whitespace-pre-line">{event.schedule}</p>
              </Section>
            )}

            {event.prizes && (
              <Section title="Prizes">
                <p className="whitespace-pre-line">{event.prizes}</p>
              </Section>
            )}

            {event.faqs && (
              <Section title="FAQs">
                <p className="whitespace-pre-line">{event.faqs}</p>
              </Section>
            )}
          </div>

          {/* Sidebar */}
          <aside className="space-y-6">
            {/* Registration card */}
            <ScrollReveal>
              <div className="rounded-lg border border-border bg-surface-1 p-6">
                <h2 className="mb-4 text-sm font-semibold uppercase tracking-widest text-text-secondary">
                  Registration
                </h2>

                <ul className="mb-6 space-y-3" role="list">
                  <li className="flex items-start gap-2 text-sm text-text-secondary">
                    <Calendar size={14} className="mt-0.5 shrink-0 text-accent" aria-hidden="true" />
                    <span>
                      {event.starts_at ? (
                        <>
                          {formatDate(event.starts_at)}
                          {event.ends_at && formatDate(event.ends_at) !== formatDate(event.starts_at) && (
                            <> to {formatDate(event.ends_at)}</>
                          )}
                        </>
                      ) : (
                        'Coming Soon'
                      )}
                    </span>
                  </li>
                  {event.venue && (
                    <li className="flex items-start gap-2 text-sm text-text-secondary">
                      <MapPin size={14} className="mt-0.5 shrink-0 text-accent" aria-hidden="true" />
                      {event.venue}
                    </li>
                  )}
                  <li className="flex items-start gap-2 text-sm text-text-secondary">
                    <Users size={14} className="mt-0.5 shrink-0 text-accent" aria-hidden="true" />
                    {event.team_min_size === event.team_max_size
                      ? `${event.team_min_size} member${event.team_min_size > 1 ? 's' : ''} per team`
                      : `${event.team_min_size}–${event.team_max_size} members per team`}
                  </li>
                  <li className="flex items-start gap-2 text-sm text-text-secondary">
                    <IndianRupee size={14} className="mt-0.5 shrink-0 text-accent" aria-hidden="true" />
                    {event.fee_per_team > 0
                      ? `${formatCurrency(event.fee_per_team)} per team`
                      : 'Free to participate'}
                  </li>
                  {event.registration_deadline && (
                    <li className="flex items-start gap-2 text-sm text-text-secondary">
                      <Clock size={14} className="mt-0.5 shrink-0 text-accent" aria-hidden="true" />
                      <span>
                        Deadline:{' '}
                        <span className={isDeadlinePassed(event.registration_deadline) ? 'text-status-rejected' : ''}>
                          {formatDateTime(event.registration_deadline)}
                        </span>
                      </span>
                    </li>
                  )}
                </ul>

                {/* Countdown to Event */}
                {event.starts_at && new Date(event.starts_at) > new Date() && (
                  <div className="mb-6 border-t border-border pt-4">
                    <CountdownTimer
                      targetDate={event.starts_at}
                      label={`${event.title.toUpperCase()} HAPPENING IN:`}
                    />
                  </div>
                )}

                {/* CTA */}
                {registrationOpen ? (
                  <Link
                    href={`/events/${event.slug}/register`}
                    className="block w-full rounded-md bg-accent py-3 text-center text-sm font-semibold text-surface-0 transition-all hover:bg-accent-dim hover:shadow-accent focus-visible:ring-2 focus-visible:ring-accent"
                  >
                    Register Now
                  </Link>
                ) : (
                  <div className="space-y-3">
                    <div className="rounded-md border border-amber-500/30 bg-amber-500/10 py-3 text-center text-sm font-medium text-amber-400">
                      {isDeadlinePassed(event.registration_deadline)
                        ? 'Registration has closed'
                        : 'Registrations on Hold!'}
                    </div>
                    <a
                      href="#interest-form"
                      className="block w-full rounded-md border border-accent/40 bg-accent/10 py-2.5 text-center text-xs font-semibold text-accent transition-all hover:bg-accent hover:text-surface-0"
                    >
                      Express Interest / Join Waitlist &darr;
                    </a>
                  </div>
                )}
              </div>
            </ScrollReveal>

            {/* Contact */}
            {(event.contact_email || event.contact_phone) && (
              <ScrollReveal>
                <div className="rounded-lg border border-border bg-surface-1 p-6">
                  <h2 className="mb-4 text-sm font-semibold uppercase tracking-widest text-text-secondary">
                    Contact
                  </h2>
                  <ul className="space-y-2" role="list">
                    {event.contact_email && (
                      <li className="flex items-center gap-2 text-sm text-text-secondary">
                        <Mail size={14} className="shrink-0 text-accent" aria-hidden="true" />
                        <a
                          href={`mailto:${event.contact_email}`}
                          className="hover:text-text-primary"
                        >
                          {event.contact_email}
                        </a>
                      </li>
                    )}
                    {event.contact_phone && (
                      <li className="flex items-center gap-2 text-sm text-text-secondary">
                        <Phone size={14} className="shrink-0 text-accent" aria-hidden="true" />
                        <a
                          href={`tel:${event.contact_phone}`}
                          className="hover:text-text-primary"
                        >
                          {event.contact_phone}
                        </a>
                      </li>
                    )}
                  </ul>
                </div>
              </ScrollReveal>
            )}
          </aside>
        </div>
      </div>
    </PageWrapper>
  )
}
