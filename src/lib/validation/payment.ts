import { z } from 'zod'

export const upiPaymentSchema = z.object({
  teamId: z.string().uuid('Invalid team ID'),
  transactionReference: z
    .string()
    .min(6, 'Transaction reference must be at least 6 characters')
    .max(100, 'Transaction reference is too long'),
})

export const paymentReviewSchema = z.object({
  paymentId: z.string().uuid(),
  action: z.enum(['approve', 'reject']),
  rejectionReason: z.string().max(500).optional(),
})

export type UpiPaymentInput = z.infer<typeof upiPaymentSchema>
export type PaymentReviewInput = z.infer<typeof paymentReviewSchema>
