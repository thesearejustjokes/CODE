import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'
import { isRazorpayConfigured, verifyRazorpaySignature } from '@/lib/payments/razorpay'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { action, publicReference } = body

    if (!publicReference) {
      return NextResponse.json(
        { success: false, error: 'Registration reference is required' },
        { status: 400 }
      )
    }

    const supabase = createServiceClient()

    // 1. Fetch team and event
    const { data: team, error: teamError } = await supabase
      .from('teams')
      .select('*, events(*)')
      .eq('public_reference', publicReference)
      .single()

    if (teamError || !team) {
      return NextResponse.json(
        { success: false, error: 'Registration not found' },
        { status: 404 }
      )
    }

    const event = team.events
    if (!event) {
      return NextResponse.json(
        { success: false, error: 'Event could not be determined' },
        { status: 400 }
      )
    }

    // ── Action: Create Order ──────────────────────────────────────
    if (action === 'create_order') {
      if (!isRazorpayConfigured()) {
        return NextResponse.json({
          success: false,
          configured: false,
          error:
            'Razorpay gateway is not configured with live credentials. Please use UPI payment or configure RAZORPAY_KEY_ID & RAZORPAY_KEY_SECRET in .env.local.',
        })
      }

      // Amount in paise (1 INR = 100 paise)
      const amountPaise = event.fee_per_team * 100
      const authHeader = Buffer.from(
        `${process.env.RAZORPAY_KEY_ID}:${process.env.RAZORPAY_KEY_SECRET}`
      ).toString('base64')

      const response = await fetch('https://api.razorpay.com/v1/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Basic ${authHeader}`,
        },
        body: JSON.stringify({
          amount: amountPaise,
          currency: 'INR',
          receipt: team.team_number,
          notes: {
            teamId: team.id,
            teamName: team.team_name,
            publicReference: team.public_reference,
          },
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('Razorpay order creation failed:', errorText)
        return NextResponse.json(
          { success: false, error: 'Failed to create payment order with provider' },
          { status: 502 }
        )
      }

      const orderData = await response.json()

      // Record initiated payment in database
      await supabase.from('payments').insert({
        team_id: team.id,
        amount: event.fee_per_team,
        method: 'razorpay',
        provider_order_id: orderData.id,
        status: 'submitted',
      })

      return NextResponse.json({
        success: true,
        configured: true,
        orderId: orderData.id,
        amount: event.fee_per_team,
        currency: 'INR',
        keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID,
      })
    }

    // ── Action: Verify Payment ────────────────────────────────────
    if (action === 'verify_payment') {
      const { orderId, paymentId, signature } = body

      if (!orderId || !paymentId || !signature) {
        return NextResponse.json(
          { success: false, error: 'Missing payment signature verification parameters' },
          { status: 400 }
        )
      }

      const isValid = verifyRazorpaySignature({ orderId, paymentId, signature })

      if (!isValid) {
        console.warn('Invalid Razorpay signature for team:', team.id)
        return NextResponse.json(
          { success: false, error: 'Invalid payment signature. Verification failed.' },
          { status: 400 }
        )
      }

      // Valid signature — update payment and confirm team
      await supabase
        .from('payments')
        .update({
          status: 'approved',
          provider_payment_id: paymentId,
          verified_at: new Date().toISOString(),
        })
        .eq('provider_order_id', orderId)

      await supabase
        .from('teams')
        .update({ registration_status: 'confirmed' })
        .eq('id', team.id)

      await supabase.from('audit_logs').insert({
        action: 'razorpay_verified',
        entity_type: 'teams',
        entity_id: team.id,
        metadata: { orderId, paymentId },
      })

      return NextResponse.json({
        success: true,
        status: 'confirmed',
      })
    }

    return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 })
  } catch (err: unknown) {
    console.error('Unexpected error in Razorpay route:', err)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
