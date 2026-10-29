import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const slug = searchParams.get('slug')

    const supabase = createServiceClient()

    let query = supabase
      .from('event_interests')
      .select('*, events(id, title)')
      .order('created_at', { ascending: false })

    if (slug && slug !== 'all') {
      query = query.eq('event_slug', slug)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching event interests:', error)
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, data: data || [] })
  } catch (err: any) {
    console.error('Error in /api/admin/interests GET:', err)
    return NextResponse.json(
      { success: false, error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Interest ID required' },
        { status: 400 }
      )
    }

    const supabase = createServiceClient()
    const { error } = await supabase.from('event_interests').delete().eq('id', id)

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, message: 'Deleted successfully' })
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}
