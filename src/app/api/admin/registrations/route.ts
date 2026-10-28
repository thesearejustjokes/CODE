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
    const { teamId, action, rejectionReason, teamName, leaderName, leaderEmail, leaderPhone, registrationStatus, members } = body

    if (!teamId || !action || !['approve', 'reject', 'update'].includes(action)) {
      return NextResponse.json(
        { success: false, error: 'teamId and valid action (approve/reject/update) are required' },
        { status: 400 }
      )
    }

    const supabase = createServiceClient()

    // Handle team and member details update
    if (action === 'update') {
      if (!teamName || !leaderName || !leaderEmail) {
        return NextResponse.json(
          { success: false, error: 'Team name, leader name, and leader email are required.' },
          { status: 400 }
        )
      }

      // 1. Update team record
      const updateData: Record<string, any> = {
        team_name: teamName.trim(),
        leader_name: leaderName.trim(),
        leader_email: leaderEmail.trim().toLowerCase(),
        leader_phone: leaderPhone ? leaderPhone.trim() : '',
      }

      if (registrationStatus) {
        updateData.registration_status = registrationStatus
      }

      const { error: teamUpdateError } = await supabase
        .from('teams')
        .update(updateData)
        .eq('id', teamId)

      if (teamUpdateError) {
        return NextResponse.json({ success: false, error: teamUpdateError.message }, { status: 500 })
      }

      // 2. Update team members (including USN / roll_number)
      if (Array.isArray(members)) {
        for (const m of members) {
          if (m.id) {
            await supabase
              .from('team_members')
              .update({
                full_name: m.full_name?.trim() || m.fullName?.trim() || '',
                email: (m.email || '').trim().toLowerCase(),
                college: m.college ? m.college.trim() : null,
                roll_number: m.roll_number ? m.roll_number.trim() : (m.rollNumber ? m.rollNumber.trim() : null),
              })
              .eq('id', m.id)
              .eq('team_id', teamId)
          }
        }
      }

      // 3. Audit log
      await supabase.from('audit_logs').insert({
        action: 'team_update',
        entity_type: 'teams',
        entity_id: teamId,
        metadata: { teamName, leaderEmail },
      })

      return NextResponse.json({ success: true, message: 'Team details updated successfully' })
    }

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

export async function DELETE(request: Request) {
  try {
    const admin = await verifyAdminUser()
    if (!admin) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const teamId = searchParams.get('teamId')

    if (!teamId) {
      return NextResponse.json({ success: false, error: 'teamId is required' }, { status: 400 })
    }

    const supabase = createServiceClient()

    // 1. Fetch team details for logging and receipts
    const { data: team, error: teamFetchError } = await supabase
      .from('teams')
      .select('id, team_number, team_name, payments(id, receipt_path)')
      .eq('id', teamId)
      .single()

    if (teamFetchError || !team) {
      return NextResponse.json({ success: false, error: 'Team not found' }, { status: 404 })
    }

    // 2. Remove receipt files from storage if present
    const teamPayments = (team.payments || []) as Array<{ id: string; receipt_path: string | null }>
    if (teamPayments.length > 0) {
      const receiptPaths = teamPayments
        .map((p) => p.receipt_path)
        .filter((p): p is string => Boolean(p && !p.startsWith('storage_pending/')))

      if (receiptPaths.length > 0) {
        await supabase.storage.from('payment-receipts').remove(receiptPaths)
      }

      // 3. Delete payments first to satisfy ON DELETE RESTRICT foreign key
      await supabase.from('payments').delete().eq('team_id', teamId)
    }

    // 4. Delete team members
    await supabase.from('team_members').delete().eq('team_id', teamId)

    // 5. Delete team record
    const { error: deleteTeamError } = await supabase
      .from('teams')
      .delete()
      .eq('id', teamId)

    if (deleteTeamError) {
      return NextResponse.json({ success: false, error: deleteTeamError.message }, { status: 500 })
    }

    // 6. Audit log
    await supabase.from('audit_logs').insert({
      action: 'team_delete',
      entity_type: 'teams',
      entity_id: teamId,
      metadata: { teamNumber: team.team_number, teamName: team.team_name },
    })

    return NextResponse.json({ success: true, message: 'Team and associated records deleted permanently' })
  } catch (err: unknown) {
    console.error('Error deleting team registration:', err)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
