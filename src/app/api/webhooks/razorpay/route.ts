import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'
import { verifyRazorpayWebhookSignature } from '@/lib/payments/razorpay'

export async function POST(request: Request) {
  try {
    const rawBody = await request.text()
    const signature = request.headers.get('x-razorpay-signature')

    if (!signature) {
      return NextResponse.json({ error: 'Missing webhook signature' }, { status: 400 })
    }

    const isValid = verifyRazorpayWebhookSignature({ rawBody, signature })
    if (!isValid) {
      console.warn('Rejected invalid Razorpay webhook signature')
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    const event = JSON.parse(rawBody)
    const eventType = event.event

    // Idempotent handling of payment.captured event
    if (eventType === 'payment.captured') {
      const paymentPayload = event.payload.payment.entity
      const paymentId = paymentPayload.id
      const orderId = paymentPayload.order_id
      const notes = paymentPayload.notes || {}
      const teamId = notes.teamId

      if (teamId) {
        const supabase = createServiceClient()

        // 1. Check if already processed
        const { data: existingPayment } = await supabase
          .from('payments')
          .select('id, status')
          .eq('provider_payment_id', paymentId)
          .maybeSingle()

        if (existingPayment && existingPayment.status === 'approved') {
          // Already handled idempotently
          return NextResponse.json({ status: 'ok', message: 'Already processed' })
        }

        // 2. Mark payment as approved
        await supabase
          .from('payments')
          .update({
            status: 'approved',
            provider_payment_id: paymentId,
            verified_at: new Date().toISOString(),
          })
          .eq('provider_order_id', orderId)

        // 3. Confirm team
        await supabase
          .from('teams')
          .update({ registration_status: 'confirmed' })
          .eq('id', teamId)

        // 4. Audit log
        await supabase.from('audit_logs').insert({
          action: 'razorpay_webhook_confirmed',
          entity_type: 'teams',
          entity_id: teamId,
          metadata: { paymentId, orderId },
        })
      }
    }

    return NextResponse.json({ status: 'ok' })
  } catch (err: unknown) {
    console.error('Error handling Razorpay webhook:', err)
    return NextResponse.json({ error: 'Webhook processing failure' }, { status: 500 })
  }
}
