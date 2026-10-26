import Link from 'next/link'
import Image from 'next/image'
import { Calendar, MapPin, Users } from 'lucide-react'
import type { Event } from '@/types'
import { formatDate, formatCurrency, isDeadlinePassed, cn } from '@/lib/utils'

interface EventCardProps {
  event: Event
}

function RegistrationBadge({ event }: { event: Event }) {
  if (!event.registration_open || isDeadlinePassed(event.registration_deadline)) {
    return (
      <span className="rounded-full border border-border bg-surface-2 px-2.5 py-0.5 text-xs font-medium text-text-secondary">
        Closed
      </span>
    )
  }
  return (
    <span className="rounded-full border border-accent/30 bg-accent/10 px-2.5 py-0.5 text-xs font-medium text-accent">
      Open
    </span>
  )
}

export function EventCard({ event }: EventCardProps) {
  return (
    <Link
      href={`/events/${event.slug}`}
      className={cn(
        'group flex flex-col overflow-hidden rounded-lg border border-border bg-surface-1',
        'transition-all duration-300 hover:border-accent/30 hover:shadow-accent hover:-translate-y-0.5'
      )}
    >
      <div className="relative aspect-video w-full overflow-hidden bg-surface-2">
        {event.banner_image_url ? (
          <Image
            src={event.banner_image_url}
            alt={`${event.title} banner`}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            unoptimized
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <span className="text-3xl font-bold tracking-widest text-text-tertiary">C.O.D.E.</span>
          </div>
        )}
        <div className="absolute right-3 top-3">
          <RegistrationBadge event={event} />
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="mb-2 text-base font-semibold leading-snug text-text-primary transition-colors group-hover:text-accent">
          {event.title}
        </h3>
        {event.short_description && (
          <p className="mb-4 line-clamp-2 text-sm leading-relaxed text-text-secondary">
            {event.short_description}
          </p>
        )}
        <ul className="mt-auto space-y-1.5" role="list">
          {event.starts_at && (
            <li className="flex items-center gap-1.5 text-xs text-text-secondary">
              <Calendar size={12} className="shrink-0 text-accent" aria-hidden="true" />
              {formatDate(event.starts_at)}
            </li>
          )}
          {event.venue && (
            <li className="flex items-center gap-1.5 text-xs text-text-secondary">
              <MapPin size={12} className="shrink-0 text-accent" aria-hidden="true" />
              {event.venue}
            </li>
          )}
          <li className="flex items-center gap-1.5 text-xs text-text-secondary">
            <Users size={12} className="shrink-0 text-accent" aria-hidden="true" />
            {event.team_min_size === event.team_max_size
              ? `${event.team_min_size} member${event.team_min_size > 1 ? 's' : ''}`
              : `${event.team_min_size}\u2013${event.team_max_size} members`}
            {event.fee_per_team > 0 ? ` \u00b7 ${formatCurrency(event.fee_per_team)}` : ' \u00b7 Free'}
          </li>
        </ul>
      </div>
    </Link>
  )
}
