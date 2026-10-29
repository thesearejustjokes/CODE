import { getEventBySlug } from '@/lib/supabase/public'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { RegistrationForm } from '@/components/registration/RegistrationForm'
import { InterestForm } from '@/components/events/InterestForm'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { isDeadlinePassed } from '@/lib/utils'
import type { Metadata } from 'next'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const event = await getEventBySlug(slug)

  return {
    title: event ? `Register for ${event.title}` : 'Register for Event',
  }
}

export default async function RegisterPage({ params }: Props) {
  const { slug } = await params
  const event = await getEventBySlug(slug)

  if (!event) {
    notFound()
  }

  // If registrations are closed or deadline has passed
  const isClosed = !event.registration_open || isDeadlinePassed(event.registration_deadline)

  return (
    <PageWrapper>
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link
            href={`/events/${event.slug}`}
            className="inline-flex items-center text-xs font-medium uppercase tracking-wider text-text-tertiary transition-colors hover:text-accent"
          >
            <ArrowLeft className="mr-1.5 h-3.5 w-3.5" /> Back to Event Details
          </Link>
          <h1 className="mt-4 text-3xl font-bold tracking-tight text-text-primary sm:text-4xl">
            Register for {event.title}
          </h1>
          <p className="mt-2 text-sm text-text-secondary">
            Fill in your team details below. Make sure all email addresses are accurate.
          </p>
        </div>

        {isClosed ? (
          <div className="space-y-8">
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-6 text-center">
              <h2 className="text-lg font-bold text-amber-400">
                {isDeadlinePassed(event.registration_deadline)
                  ? 'Registrations are Closed'
                  : 'Registrations are Currently on Hold!'}
              </h2>
              <p className="mt-2 text-sm text-text-secondary">
                {isDeadlinePassed(event.registration_deadline)
                  ? 'The deadline to register for this event has passed.'
                  : 'Direct registration is paused for the time being. You can express your interest below to secure a priority slot.'}
              </p>
            </div>

            <InterestForm event={event} />
          </div>
        ) : (
          <RegistrationForm event={event} />
        )}
      </div>
    </PageWrapper>
  )
}
