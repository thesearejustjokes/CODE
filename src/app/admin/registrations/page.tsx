import { createServiceClient } from '@/lib/supabase/service'
import { RegistrationManagement } from '@/components/admin/RegistrationManagement'
import type { Team, Event } from '@/types'

export const dynamic = 'force-dynamic'

interface Props {
  searchParams: Promise<{ eventId?: string; status?: string }>
}

export default async function AdminRegistrationsPage({ searchParams }: Props) {
  const { eventId, status } = await searchParams
  const supabase = createServiceClient()

  const [
    { data: teams },
    { data: events },
  ] = await Promise.all([
    supabase
      .from('teams')
      .select(`
        *,
        events (id, title, fee_per_team),
        team_members (id, full_name, email, college, roll_number),
        payments (*)
      `)
      .order('created_at', { ascending: false }),
    supabase.from('events').select('*').order('created_at', { ascending: false }),
  ])

  return (
    <RegistrationManagement
      initialTeams={(teams || []) as Team[]}
      events={(events || []) as Event[]}
      initialEventId={eventId || ''}
      initialStatus={status || 'all'}
    />
  )
}
