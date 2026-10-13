import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'
import { createEventSchema } from '@/lib/validation/event'

export async function GET() {
  try {
    const supabase = createServiceClient()
    const { data: events, error } = await supabase
      .from('events')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, data: events })
  } catch (err: unknown) {
    console.error(err)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const parsed = createEventSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const eventData = parsed.data
    const supabase = createServiceClient()

    // If making this event featured, ensure no other event is marked featured first
    if (eventData.is_featured) {
      await supabase
        .from('events')
        .update({ is_featured: false })
        .neq('id', '00000000-0000-0000-0000-000000000000')
    }

    const { data: newEvent, error: insertError } = await supabase
      .from('events')
      .insert(eventData)
      .select()
      .single()

    if (insertError) {
      return NextResponse.json({ success: false, error: insertError.message }, { status: 400 })
    }

    return NextResponse.json({ success: true, data: newEvent })
  } catch (err: unknown) {
    console.error(err)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json()
    const { id, ...updates } = body

    if (!id) {
      return NextResponse.json({ success: false, error: 'Event ID is required' }, { status: 400 })
    }

    const supabase = createServiceClient()

    // If setting is_featured = true, remove featured status from any other event first
    if (updates.is_featured === true) {
      await supabase
        .from('events')
        .update({ is_featured: false })
        .neq('id', id)
    }

    const { data: updatedEvent, error } = await supabase
      .from('events')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 })
    }

    return NextResponse.json({ success: true, data: updatedEvent })
  } catch (err: unknown) {
    console.error(err)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
