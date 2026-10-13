import { createClient } from '@/lib/supabase/server'
import { EventCard } from '@/components/events/EventCard'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { ScrollReveal } from '@/components/animations/ScrollReveal'
import type { Event } from '@/types'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Events',
  description: 'Upcoming and past events by the C.O.D.E. Club at RNSIT.',
}

export const revalidate = 60

async function getEvents() {
  const supabase = await createClient()
  const now = new Date().toISOString()

  const [upcoming, past] = await Promise.all([
    supabase
      .from('events')
      .select('*')
      .eq('published', true)
      .or(`ends_at.is.null,ends_at.gte.${now}`)
      .order('starts_at', { ascending: true }),
    supabase
      .from('events')
      .select('*')
      .eq('published', true)
      .lt('ends_at', now)
      .order('ends_at', { ascending: false })
      .limit(12),
  ])

  return {
    upcoming: (upcoming.data ?? []) as Event[],
    past: (past.data ?? []) as Event[],
  }
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-16 text-center">
      <p className="text-sm text-text-secondary">{label}</p>
    </div>
  )
}

export default async function EventsPage() {
  const { upcoming, past } = await getEvents()

  return (
    <PageWrapper>
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <ScrollReveal>
          <h1 className="mb-2 text-xs font-semibold uppercase tracking-[0.3em] text-accent">
            C.O.D.E. Club
          </h1>
          <h2 className="mb-12 text-4xl font-bold text-text-primary">Events</h2>
        </ScrollReveal>

        {/* Upcoming */}
        <section className="mb-20">
          <ScrollReveal>
            <h3 className="mb-6 text-lg font-semibold text-text-primary">Upcoming Events</h3>
          </ScrollReveal>
          {upcoming.length === 0 ? (
            <EmptyState label="No upcoming events at the moment. Check back soon!" />
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {upcoming.map((event, i) => (
                <ScrollReveal key={event.id} delay={i * 70}>
                  <EventCard event={event} />
                </ScrollReveal>
              ))}
            </div>
          )}
        </section>

        {/* Past */}
        {past.length > 0 && (
          <section>
            <ScrollReveal>
              <h3 className="mb-6 text-lg font-semibold text-text-secondary">Past Events</h3>
            </ScrollReveal>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 opacity-60">
              {past.map((event, i) => (
                <ScrollReveal key={event.id} delay={i * 70}>
                  <EventCard event={event} />
                </ScrollReveal>
              ))}
            </div>
          </section>
        )}
      </div>
    </PageWrapper>
  )
}
