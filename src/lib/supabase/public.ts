import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { isSupabaseConfigured, withTimeout } from './config'
import type { Event } from '@/types'

let cachedPublicClient: ReturnType<typeof createSupabaseClient> | null = null

export function getPublicClient() {
  if (!isSupabaseConfigured()) {
    return null
  }

  if (!cachedPublicClient) {
    cachedPublicClient = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      }
    )
  }

  return cachedPublicClient
}

import { ARCADE_C_EVENT, FALLBACK_EVENTS } from '@/lib/events/constants'

/**
 * Fetch the single featured event for the homepage.
 * Returns ARCADE_C_EVENT if Supabase is unconfigured or if query returns null.
 */
export async function getFeaturedEvent(): Promise<Event | null> {
  const client = getPublicClient()
  if (!client) return ARCADE_C_EVENT

  try {
    const query = client
      .from('events')
      .select('*')
      .eq('is_featured', true)
      .eq('published', true)
      .single()
      .then(({ data, error }) => (error || !data ? ARCADE_C_EVENT : (data as Event)))

    const result = await withTimeout(query, ARCADE_C_EVENT, 2500)
    return result || ARCADE_C_EVENT
  } catch {
    return ARCADE_C_EVENT
  }
}

/**
 * Fetch upcoming published events for the catalog and homepage.
 */
export async function getUpcomingEvents(limit = 6): Promise<Event[]> {
  const client = getPublicClient()
  if (!client) return FALLBACK_EVENTS

  try {
    const query = client
      .from('events')
      .select('*')
      .eq('published', true)
      .order('starts_at', { ascending: true })
      .limit(limit)
      .then(({ data, error }) => {
        if (error || !data || data.length === 0) return FALLBACK_EVENTS
        return data as Event[]
      })

    const result = await withTimeout(query, FALLBACK_EVENTS, 2500)
    return result && result.length > 0 ? result : FALLBACK_EVENTS
  } catch {
    return FALLBACK_EVENTS
  }
}

/**
 * Fetch full event catalog (upcoming and past).
 */
export async function getAllEventsCatalog(): Promise<{ upcoming: Event[]; past: Event[] }> {
  const client = getPublicClient()
  if (!client) return { upcoming: FALLBACK_EVENTS, past: [] }

  const now = new Date().toISOString()

  try {
    const query = Promise.all([
      client
        .from('events')
        .select('*')
        .eq('published', true)
        .or(`ends_at.is.null,ends_at.gte.${now}`)
        .order('starts_at', { ascending: true }),
      client
        .from('events')
        .select('*')
        .eq('published', true)
        .lt('ends_at', now)
        .order('ends_at', { ascending: false })
        .limit(12),
    ]).then(([upcomingRes, pastRes]) => {
      const upcoming = (upcomingRes.data || []) as Event[]
      const past = (pastRes.data || []) as Event[]

      // If no upcoming events in DB, use our default active event
      const finalUpcoming = upcoming.length > 0 ? upcoming : FALLBACK_EVENTS
      return { upcoming: finalUpcoming, past }
    })

    return withTimeout(query, { upcoming: FALLBACK_EVENTS, past: [] }, 2500)
  } catch {
    return { upcoming: FALLBACK_EVENTS, past: [] }
  }
}

/**
 * Fetch a single event by slug.
 */
export async function getEventBySlug(slug: string): Promise<Event | null> {
  if (slug === 'arcade-c') {
    const client = getPublicClient()
    if (!client) return ARCADE_C_EVENT

    try {
      const query = client
        .from('events')
        .select('*')
        .eq('slug', slug)
        .eq('published', true)
        .single()
        .then(({ data, error }) => (error || !data ? ARCADE_C_EVENT : (data as Event)))

      const result = await withTimeout(query, ARCADE_C_EVENT, 2500)
      return result || ARCADE_C_EVENT
    } catch {
      return ARCADE_C_EVENT
    }
  }

  const client = getPublicClient()
  if (!client) return null

  const query = client
    .from('events')
    .select('*')
    .eq('slug', slug)
    .eq('published', true)
    .single()
    .then(({ data, error }) => (error ? null : (data as Event)))

  return withTimeout(query, null, 2500)
}
