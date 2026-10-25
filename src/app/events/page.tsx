import { getAllEventsCatalog } from '@/lib/supabase/public'
import { EventCard } from '@/components/events/EventCard'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { ScrollReveal } from '@/components/animations/ScrollReveal'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Events',
  description: 'Upcoming and past events by the C.O.D.E. Club at RNSIT.',
}

export const revalidate = 60

function EmptyState({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-16 text-center">
      <p className="text-sm text-text-secondary">{label}</p>
    </div>
  )
}

export default async function EventsPage() {
  const { upcoming, past } = await getAllEventsCatalog()

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
