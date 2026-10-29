import Link from 'next/link'
import Image from 'next/image'
import { Calendar, MapPin, Users, IndianRupee } from 'lucide-react'
import type { Event } from '@/types'
import { formatDate, formatCurrency } from '@/lib/utils'
import { CountdownTimer } from '@/components/animations/CountdownTimer'
import { BubbleField } from '@/components/animations/BubbleField'

interface FeaturedEventProps {
  event: Event
}

export function FeaturedEvent({ event }: FeaturedEventProps) {
  const isRegistrationOpen =
    event.registration_open &&
    (!event.registration_deadline || new Date(event.registration_deadline) > new Date())

  const showCountdown =
    event.registration_deadline &&
    isRegistrationOpen &&
    new Date(event.registration_deadline) > new Date()

  return (
    <section className="relative overflow-hidden bg-surface-0 px-4 py-24 sm:px-6 lg:px-8">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 80% 50% at 50% 0%, var(--accent-glow) 0%, transparent 70%)',
        }}
        aria-hidden="true"
      />
      <BubbleField count={10} />

      <div className="relative z-10 mx-auto max-w-7xl">
        <p className="mb-6 text-xs font-semibold uppercase tracking-[0.3em] text-accent">
          Featured Event
        </p>

        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
          <div>
            <h1 className="mb-4 text-4xl font-bold leading-tight tracking-tight text-text-primary sm:text-5xl">
              {event.title}
            </h1>
            {event.short_description && (
              <p className="mb-6 text-lg leading-relaxed text-text-secondary">
                {event.short_description}
              </p>
            )}

            <ul className="mb-8 space-y-2" role="list">
              <li className="flex items-center gap-2 text-sm text-text-secondary">
                <Calendar size={15} className="text-accent" aria-hidden="true" />
                {event.starts_at ? (
                  <>
                    {formatDate(event.starts_at)}
                    {event.ends_at && event.ends_at !== event.starts_at && (
                      <> &ndash; {formatDate(event.ends_at)}</>
                    )}
                  </>
                ) : (
                  'Coming Soon'
                )}
              </li>
              {event.venue && (
                <li className="flex items-center gap-2 text-sm text-text-secondary">
                  <MapPin size={15} className="text-accent" aria-hidden="true" />
                  {event.venue}
                </li>
              )}
              <li className="flex items-center gap-2 text-sm text-text-secondary">
                <Users size={15} className="text-accent" aria-hidden="true" />
                Team size: {event.team_min_size}
                {event.team_max_size > event.team_min_size && `\u2013${event.team_max_size}`} members
              </li>
              {event.fee_per_team > 0 && (
                <li className="flex items-center gap-2 text-sm text-text-secondary">
                  <IndianRupee size={15} className="text-accent" aria-hidden="true" />
                  {formatCurrency(event.fee_per_team)} per team
                </li>
              )}
              {event.fee_per_team === 0 && (
                <li className="flex items-center gap-2 text-sm text-status-confirmed">
                  <IndianRupee size={15} aria-hidden="true" />
                  Free to participate
                </li>
              )}
            </ul>

            {showCountdown && (
              <div className="mb-8">
                <CountdownTimer
                  targetDate={event.registration_deadline!}
                  label="Registration closes in"
                />
              </div>
            )}

            <div className="flex flex-wrap gap-4">
              {isRegistrationOpen && (
                <Link
                  href={`/events/${event.slug}/register`}
                  className="rounded-md bg-accent px-6 py-3 text-sm font-semibold text-surface-0 transition-all hover:bg-accent-dim hover:shadow-accent focus-visible:ring-2 focus-visible:ring-accent"
                >
                  {event.featured_button_text ?? 'Register Now'}
                </Link>
              )}
              <Link
                href={`/events/${event.slug}`}
                className="rounded-md border border-border px-6 py-3 text-sm font-medium text-text-secondary transition-colors hover:border-accent/30 hover:text-text-primary"
              >
                View Details
              </Link>
            </div>
          </div>

          {event.banner_image_url && (
            <div className="relative aspect-video w-full overflow-hidden rounded-lg border border-border shadow-lg">
              <Image
                src={event.banner_image_url}
                alt={`${event.title} banner`}
                fill
                className="object-cover"
                unoptimized
                priority
              />
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
