import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'
import { verifyAdminUser } from '@/lib/auth/admin'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const admin = await verifyAdminUser()
    if (!admin) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const eventId = searchParams.get('eventId')
    const status = searchParams.get('status')
    const search = searchParams.get('search')

    const supabase = createServiceClient()

    let query = supabase
      .from('teams')
      .select(`
        *,
        events (id, title, fee_per_team),
        team_members (id, full_name, email, college, roll_number),
        payments (*)
      `)
      .order('created_at', { ascending: false })

    if (eventId) {
      query = query.eq('event_id', eventId)
    }

    if (status && status !== 'all') {
      query = query.eq('registration_status', status)
    }

    if (search) {
      query = query.or(
        `team_name.ilike.%${search}%,leader_name.ilike.%${search}%,leader_email.ilike.%${search}%,team_number.ilike.%${search}%`
      )
    }

    const { data: teams, error } = await query

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, data: teams })
  } catch (err: unknown) {
    console.error(err)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const admin = await verifyAdminUser()
    if (!admin) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { teamId, action, rejectionReason } = body

    if (!teamId || !action || !['approve', 'reject'].includes(action)) {
      return NextResponse.json(
        { success: false, error: 'teamId and valid action (approve/reject) are required' },
        { status: 400 }
      )
    }

    const supabase = createServiceClient()

    // Find the latest payment for this team
    const { data: payments, error: paymentFindError } = await supabase
      .from('payments')
      .select('*')
      .eq('team_id', teamId)
      .order('created_at', { ascending: false })
      .limit(1)

    const latestPayment = payments && payments.length > 0 ? payments[0] : null

    if (action === 'approve') {
      // 1. Update team status to confirmed
      const { error: teamError } = await supabase
        .from('teams')
        .update({ registration_status: 'confirmed' })
        .eq('id', teamId)

      if (teamError) {
        return NextResponse.json({ success: false, error: teamError.message }, { status: 500 })
      }

      // 2. Update payment status if exists
      if (latestPayment) {
        await supabase
          .from('payments')
          .update({
            status: 'approved',
            verified_at: new Date().toISOString(),
          })
          .eq('id', latestPayment.id)
      }

      // 3. Audit log
      await supabase.from('audit_logs').insert({
        action: 'payment_approve',
        entity_type: 'teams',
        entity_id: teamId,
        metadata: { paymentId: latestPayment?.id },
      })

      return NextResponse.json({ success: true, status: 'confirmed' })
    } else {
      // Reject action
      const reason = rejectionReason || 'Payment verification failed (e.g. invalid reference or amount mismatch).'

      const { error: teamError } = await supabase
        .from('teams')
        .update({ registration_status: 'rejected' })
        .eq('id', teamId)

      if (teamError) {
        return NextResponse.json({ success: false, error: teamError.message }, { status: 500 })
      }

      if (latestPayment) {
        await supabase
          .from('payments')
          .update({
            status: 'rejected',
            rejection_reason: reason,
            verified_at: new Date().toISOString(),
          })
          .eq('id', latestPayment.id)
      }

      // Audit log
      await supabase.from('audit_logs').insert({
        action: 'payment_reject',
        entity_type: 'teams',
        entity_id: teamId,
        metadata: { paymentId: latestPayment?.id, reason },
      })

      return NextResponse.json({ success: true, status: 'rejected' })
    }
  } catch (err: unknown) {
    console.error(err)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
