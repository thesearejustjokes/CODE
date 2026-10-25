import { createServiceClient } from '@/lib/supabase/service'
import { RegistrationManagement } from '@/components/admin/RegistrationManagement'
import { isSupabaseConfigured, withTimeout } from '@/lib/supabase/config'
import type { Team, Event } from '@/types'

export const dynamic = 'force-dynamic'

interface Props {
  searchParams: Promise<{ eventId?: string; status?: string }>
}

export default async function AdminRegistrationsPage({ searchParams }: Props) {
  const { eventId, status } = await searchParams

  if (!isSupabaseConfigured()) {
    return (
      <RegistrationManagement
        initialTeams={[]}
        events={[]}
        initialEventId={eventId || ''}
        initialStatus={status || 'all'}
      />
    )
  }

  const supabase = createServiceClient()

  const dataQuery = Promise.all([
    supabase
      .from('teams')
      .select(`
        *,
        events (id, title, fee_per_team),
        team_members (id, full_name, email, college, roll_number),
        payments (*)
      `)
      .order('created_at', { ascending: false })
      .then(({ data }) => data || []),
    supabase
      .from('events')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data }) => data || []),
  ])

  const [teams, events] = await withTimeout(dataQuery, [[], []], 2500)

  return (
    <RegistrationManagement
      initialTeams={teams as Team[]}
      events={events as Event[]}
      initialEventId={eventId || ''}
      initialStatus={status || 'all'}
    />
  )
}
