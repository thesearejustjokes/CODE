import { createServiceClient } from '@/lib/supabase/service'
import { EventManagement } from '@/components/admin/EventManagement'
import { isSupabaseConfigured, withTimeout } from '@/lib/supabase/config'
import { getArcadeCInsertPayload } from '@/lib/events/constants'
import type { Event } from '@/types'

export const dynamic = 'force-dynamic'

export default async function AdminEventsPage() {
  if (!isSupabaseConfigured()) {
    return <EventManagement initialEvents={[]} />
  }

  const supabase = createServiceClient()
  const eventsQuery = (async () => {
    const { data } = await supabase
      .from('events')
      .select('*')
      .order('created_at', { ascending: false })

    // If database has 0 events, auto-seed Arcade.C with all its complete details
    if (!data || data.length === 0) {
      const { data: seeded } = await supabase
        .from('events')
        .insert(getArcadeCInsertPayload())
        .select()
        .single()
      if (seeded) return [seeded]
    }
    return data || []
  })()

  const events = await withTimeout(eventsQuery, [], 2500)

  return <EventManagement initialEvents={events as Event[]} />
}
