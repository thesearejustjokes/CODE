import { z } from 'zod'

export const createEventSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(100),
  slug: z
    .string()
    .min(2)
    .max(80)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase letters, numbers, and hyphens only'),
  description: z.string().max(10000).optional().nullable(),
  short_description: z.string().max(300).optional().nullable(),
  banner_image_url: z.string().url().optional().nullable(),
  venue: z.string().max(200).optional().nullable(),
  starts_at: z.string().datetime().optional().nullable(),
  ends_at: z.string().datetime().optional().nullable(),
  registration_deadline: z.string().datetime().optional().nullable(),
  registration_open: z.boolean().default(false),
  published: z.boolean().default(false),
  is_featured: z.boolean().default(false),
  featured_button_text: z.string().max(50).optional().nullable(),
  team_min_size: z.number().int().min(1).max(10).default(1),
  team_max_size: z.number().int().min(1).max(10).default(4),
  fee_per_team: z.number().min(0).default(0),
  payment_methods_enabled: z.array(z.enum(['upi_manual', 'razorpay'])).default(['upi_manual']),
  eligibility: z.string().max(2000).optional().nullable(),
  rules: z.string().max(10000).optional().nullable(),
  schedule: z.string().max(10000).optional().nullable(),
  prizes: z.string().max(5000).optional().nullable(),
  faqs: z.string().max(10000).optional().nullable(),
  contact_email: z.string().email().optional().nullable(),
  contact_phone: z.string().max(20).optional().nullable(),
})

export const updateEventSchema = createEventSchema.partial()

export type CreateEventInput = z.infer<typeof createEventSchema>
export type UpdateEventInput = z.infer<typeof updateEventSchema>
