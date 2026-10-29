import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'
import { eventInterestSchema } from '@/lib/validation/interest'
import { ARCADE_C_EVENT } from '@/lib/events/constants'

export async function POST(request: Request) {
  try {
    const json = await request.json()
    const parsed = eventInterestSchema.safeParse(json)

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

    const {
      eventSlug,
      teamName,
      leaderName,
      leaderEmail,
      leaderPhone,
      leaderRollNumber,
      members,
      notes,
    } = parsed.data

    const supabase = createServiceClient()

    // Find event if exists in DB
    let eventId: string | null = null
    const { data: eventData } = await supabase
      .from('events')
      .select('id')
      .eq('slug', eventSlug)
      .maybeSingle()

    if (eventData?.id) {
      eventId = eventData.id
    }

    // Insert into event_interests
    const { data: inserted, error: insertError } = await supabase
      .from('event_interests')
      .insert({
        event_id: eventId,
        event_slug: eventSlug,
        team_name: teamName,
        leader_name: leaderName,
        leader_email: leaderEmail,
        leader_phone: leaderPhone,
        leader_usn: leaderRollNumber,
        members: members,
        notes: notes || null,
      })
      .select()
      .single()

    if (insertError) {
      console.error('Error inserting event interest:', insertError)
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to record interest. Please try again.',
          details: insertError.message,
        },
        { status: 500 }
      )
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Your expression of interest has been recorded successfully!',
        data: inserted,
      },
      { status: 201 }
    )
  } catch (err: any) {
    console.error('API Error in /api/interests:', err)
    return NextResponse.json(
      { success: false, error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}
