import { getFeaturedEvent, getUpcomingEvents } from '@/lib/supabase/public'
import { FeaturedEvent } from '@/components/home/FeaturedEvent'
import { HeroFallback } from '@/components/home/HeroFallback'
import { ArcadeCAdvert } from '@/components/events/ArcadeCAdvert'
import { EventCard } from '@/components/events/EventCard'
import { ScrollReveal } from '@/components/animations/ScrollReveal'
import { BubbleField } from '@/components/animations/BubbleField'
import { PageWrapper } from '@/components/layout/PageWrapper'

// Revalidate homepage every 60 seconds
export const revalidate = 60

export default async function HomePage() {
  const [featuredEvent, upcomingEvents] = await Promise.all([
    getFeaturedEvent(),
    getUpcomingEvents(),
  ])

  // Filter out the featured event from the upcoming grid
  const otherEvents = upcomingEvents.filter((e) => !e.is_featured && e.id !== featuredEvent?.id)

  return (
    <PageWrapper noTopPadding>
      {/* Hero */}
      {featuredEvent ? (
        <FeaturedEvent event={featuredEvent} />
      ) : (
        <HeroFallback />
      )}

      {/* Flagship Event Advert & Showcase */}
      <ArcadeCAdvert />

      {/* Upcoming events */}
      {otherEvents.length > 0 && (
        <section className="relative px-4 py-20 sm:px-6 lg:px-8">
          <BubbleField count={6} className="opacity-50" />
          <div className="relative z-10 mx-auto max-w-7xl">
            <ScrollReveal>
              <h2 className="mb-2 text-xs font-semibold uppercase tracking-[0.3em] text-accent">
                Coming Up
              </h2>
              <h3 className="mb-10 text-3xl font-bold text-text-primary">
                Upcoming Events
              </h3>
            </ScrollReveal>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {otherEvents.map((event, i) => (
                <ScrollReveal key={event.id} delay={i * 80}>
                  <EventCard event={event} />
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* About the club strip */}
      <section className="relative overflow-hidden border-y border-border bg-surface-1 px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <ScrollReveal>
            <h2 className="mb-4 text-3xl font-bold text-text-primary">What is C.O.D.E.?</h2>
            <p className="mb-6 text-base leading-relaxed text-text-secondary">
              C.O.D.E. &mdash; Community of Data Engineers &mdash; is the official technical club
              of the Data Science Department at RNS Institute of Technology, Bengaluru.
              We exist to bridge the gap between academic learning and real-world data engineering.
            </p>
            <p className="text-base leading-relaxed text-text-secondary">
              Through hands-on workshops, collaborative hackathons, and industry interactions,
              we help students develop practical skills in data science, machine learning,
              data engineering, and software development.
            </p>
          </ScrollReveal>
        </div>
      </section>
    </PageWrapper>
  )
}
