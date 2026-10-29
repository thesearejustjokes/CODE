import { z } from 'zod'

export const interestMemberSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Please enter a valid email address'),
  college: z.string().max(100).optional().or(z.literal('')),
  rollNumber: z.string().max(50).optional().or(z.literal('')),
})

export const eventInterestSchema = z.object({
  eventSlug: z.string().min(1, 'Event slug is required'),
  teamName: z
    .string()
    .min(2, 'Team name must be at least 2 characters')
    .max(50, 'Team name cannot exceed 50 characters')
    .trim(),
  leaderName: z
    .string()
    .min(2, 'Leader name must be at least 2 characters')
    .max(100, 'Leader name cannot exceed 100 characters')
    .trim(),
  leaderEmail: z.string().email('Please enter a valid email address').trim().toLowerCase(),
  leaderPhone: z
    .string()
    .regex(/^[6-9]\d{9}$/, 'Please enter a valid 10-digit Indian mobile number')
    .trim(),
  leaderRollNumber: z.string().min(1, 'Leader USN is required').max(50).trim().toUpperCase(),
  members: z.array(interestMemberSchema).default([]),
  notes: z.string().max(500).optional().or(z.literal('')),
})

export type EventInterestInput = z.infer<typeof eventInterestSchema>
