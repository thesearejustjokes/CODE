import { createServiceClient } from '@/lib/supabase/service'
import { InterestManagement } from '@/components/admin/InterestManagement'
import { isSupabaseConfigured, withTimeout } from '@/lib/supabase/config'
import type { EventInterest, Event } from '@/types'

export const dynamic = 'force-dynamic'

export default async function AdminInterestsPage() {
  if (!isSupabaseConfigured()) {
    return <InterestManagement initialInterests={[]} events={[]} />
  }

  const supabase = createServiceClient()

  const dataQuery = Promise.all([
    supabase
      .from('event_interests')
      .select('*, events(id, title)')
      .order('created_at', { ascending: false })
      .then(({ data }) => data || []),
    supabase
      .from('events')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data }) => data || []),
  ])

  const [interests, events] = await withTimeout(dataQuery, [[], []], 2500)

  return (
    <InterestManagement
      initialInterests={(interests || []) as EventInterest[]}
      events={(events || []) as Event[]}
    />
  )
}
