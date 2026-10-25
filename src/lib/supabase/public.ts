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

/**
 * Fetch the single featured event for the homepage.
 * Returns null immediately if Supabase is unconfigured or if query times out.
 */
export async function getFeaturedEvent(): Promise<Event | null> {
  const client = getPublicClient()
  if (!client) return null

  const query = client
    .from('events')
    .select('*')
    .eq('is_featured', true)
    .eq('published', true)
    .single()
    .then(({ data, error }) => (error ? null : (data as Event)))

  return withTimeout(query, null, 2500)
}

/**
 * Fetch upcoming published events for the catalog and homepage.
 */
export async function getUpcomingEvents(limit = 6): Promise<Event[]> {
  const client = getPublicClient()
  if (!client) return []

  const query = client
    .from('events')
    .select('*')
    .eq('published', true)
    .order('starts_at', { ascending: true })
    .limit(limit)
    .then(({ data, error }) => (error || !data ? [] : (data as Event[])))

  return withTimeout(query, [], 2500)
}

/**
 * Fetch full event catalog (upcoming and past).
 */
export async function getAllEventsCatalog(): Promise<{ upcoming: Event[]; past: Event[] }> {
  const client = getPublicClient()
  if (!client) return { upcoming: [], past: [] }

  const now = new Date().toISOString()

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
  ]).then(([upcomingRes, pastRes]) => ({
    upcoming: (upcomingRes.data || []) as Event[],
    past: (pastRes.data || []) as Event[],
  }))

  return withTimeout(query, { upcoming: [], past: [] }, 2500)
}

/**
 * Fetch a single event by slug.
 */
export async function getEventBySlug(slug: string): Promise<Event | null> {
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
