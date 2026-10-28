import { z } from 'zod'

const teamMemberSchema = z.object({
  fullName: z
    .string()
    .min(2, 'Full name must be at least 2 characters')
    .max(100, 'Full name must be at most 100 characters'),
  email: z.string().email('Please enter a valid email address'),
  college: z.string().max(200).optional(),
  rollNumber: z.string().min(1, 'USN is required').max(50),
})

export const registrationSchema = z.object({
  eventSlug: z.string().min(1),
  teamName: z
    .string()
    .min(2, 'Team name must be at least 2 characters')
    .max(80, 'Team name must be at most 80 characters'),
  leaderName: z
    .string()
    .min(2, 'Leader name must be at least 2 characters')
    .max(100),
  leaderEmail: z.string().email('Please enter a valid email address'),
  leaderPhone: z
    .string()
    .regex(/^[6-9]\d{9}$/, 'Please enter a valid 10-digit Indian mobile number'),
  members: z.array(teamMemberSchema).max(9),
})

export type RegistrationInput = z.infer<typeof registrationSchema>
