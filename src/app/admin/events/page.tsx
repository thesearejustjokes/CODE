import { createServiceClient } from '@/lib/supabase/service'
import { EventManagement } from '@/components/admin/EventManagement'
import { isSupabaseConfigured, withTimeout } from '@/lib/supabase/config'
import type { Event } from '@/types'

export const dynamic = 'force-dynamic'

export default async function AdminEventsPage() {
  if (!isSupabaseConfigured()) {
    return <EventManagement initialEvents={[]} />
  }

  const supabase = createServiceClient()
  const eventsQuery = supabase
    .from('events')
    .select('*')
    .order('created_at', { ascending: false })
    .then(({ data }) => data || [])

  const events = await withTimeout(eventsQuery, [], 2500)

  return <EventManagement initialEvents={events as Event[]} />
}
