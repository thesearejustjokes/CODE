import { createServiceClient } from '@/lib/supabase/service'
import { EventManagement } from '@/components/admin/EventManagement'
import type { Event } from '@/types'

export const dynamic = 'force-dynamic'

export default async function AdminEventsPage() {
  const supabase = createServiceClient()
  const { data: events } = await supabase
    .from('events')
    .select('*')
    .order('created_at', { ascending: false })

  return <EventManagement initialEvents={(events || []) as Event[]} />
}
