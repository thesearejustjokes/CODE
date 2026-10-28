import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'
import { registrationSchema } from '@/lib/validation/registration'
import { isDeadlinePassed } from '@/lib/utils'
import { ARCADE_C_EVENT, getArcadeCInsertPayload } from '@/lib/events/constants'
import crypto from 'crypto'

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // 1. Zod input validation
    const parsed = registrationSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed',
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      )
    }

    const { eventSlug, teamName, leaderName, leaderEmail, leaderPhone, members } = parsed.data

    // 2. Fetch event to verify registration eligibility
    const supabase = createServiceClient()
    let { data: event, error: eventError } = await supabase
      .from('events')
      .select('*')
      .eq('slug', eventSlug)
      .eq('published', true)
      .maybeSingle()

    // If Arcade.C details exist in constants but not yet in the DB table, auto-insert all its rich details
    if (!event && eventSlug === ARCADE_C_EVENT.slug) {
      const payload = getArcadeCInsertPayload()
      const { data: insertedEvent, error: insertErr } = await supabase
        .from('events')
        .insert(payload)
        .select()
        .single()

      if (insertErr) {
        console.error('Failed to auto-seed Arcade.C event:', insertErr)
      } else if (insertedEvent) {
        event = insertedEvent
      }
    } else if (event && eventSlug === ARCADE_C_EVENT.slug && event.fee_per_team !== ARCADE_C_EVENT.fee_per_team) {
      // Keep DB fee in sync with ARCADE_C_EVENT constants
      await supabase.from('events').update({ fee_per_team: ARCADE_C_EVENT.fee_per_team }).eq('id', event.id)
      event.fee_per_team = ARCADE_C_EVENT.fee_per_team
    }

    if (!event) {
      return NextResponse.json(
        { success: false, error: 'Event not found or not published' },
        { status: 404 }
      )
    }

    // 3. Check registration status and deadlines
    if (!event.registration_open) {
      return NextResponse.json(
        { success: false, error: 'Registration is currently closed for this event.' },
        { status: 400 }
      )
    }

    if (isDeadlinePassed(event.registration_deadline)) {
      return NextResponse.json(
        { success: false, error: 'Registration deadline for this event has passed.' },
        { status: 400 }
      )
    }

    // 4. Validate team size (Leader counts as 1 + members)
    const totalMembersCount = 1 + members.length
    if (totalMembersCount < event.team_min_size || totalMembersCount > event.team_max_size) {
      return NextResponse.json(
        {
          success: false,
          error: `Team size must be between ${event.team_min_size} and ${event.team_max_size} members (including the leader). You submitted ${totalMembersCount}.`,
        },
        { status: 400 }
      )
    }

    // 5. Check for duplicate registration by leader email for this event
    const { data: existingTeam } = await supabase
      .from('teams')
      .select('id')
      .eq('event_id', event.id)
      .ilike('leader_email', leaderEmail.trim())
      .maybeSingle()

    if (existingTeam) {
      return NextResponse.json(
        {
          success: false,
          error: 'A team with this leader email is already registered for this event.',
        },
        { status: 409 }
      )
    }

    // 6. Generate secure public reference (32 hex characters)
    const publicReference = crypto.randomBytes(16).toString('hex')
    const initialStatus = event.fee_per_team === 0 ? 'confirmed' : 'pending_payment'

    // 7. Insert team record
    const { data: newTeam, error: teamInsertError } = await supabase
      .from('teams')
      .insert({
        event_id: event.id,
        team_name: teamName.trim(),
        leader_name: leaderName.trim(),
        leader_email: leaderEmail.trim().toLowerCase(),
        leader_phone: leaderPhone.trim(),
        registration_status: initialStatus,
        public_reference: publicReference,
      })
      .select()
      .single()

    if (teamInsertError || !newTeam) {
      console.error('Failed to create team:', teamInsertError)
      return NextResponse.json(
        { success: false, error: 'Failed to create team registration. Please try again.' },
        { status: 500 }
      )
    }

    // 8. Insert team members (Leader + additional members)
    const membersToInsert = [
      {
        team_id: newTeam.id,
        full_name: leaderName.trim(),
        email: leaderEmail.trim().toLowerCase(),
        college: null,
        roll_number: null,
      },
      ...members.map((m) => ({
        team_id: newTeam.id,
        full_name: m.fullName.trim(),
        email: m.email.trim().toLowerCase(),
        college: m.college?.trim() || null,
        roll_number: m.rollNumber?.trim() || null,
      })),
    ]

    const { error: membersError } = await supabase
      .from('team_members')
      .insert(membersToInsert)

    if (membersError) {
      console.error('Failed to insert team members:', membersError)
      // Note: Team record was created, but member insertion failed.
      // Log for investigation
    }

    return NextResponse.json({
      success: true,
      data: {
        publicReference,
        teamNumber: newTeam.team_number,
        status: initialStatus,
        feePerTeam: event.fee_per_team,
      },
    })
  } catch (err: unknown) {
    console.error('Unexpected error in registration handler:', err)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
