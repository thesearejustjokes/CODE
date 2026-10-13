// Registration statuses
export type RegistrationStatus =
  | 'pending_payment'
  | 'payment_review'
  | 'confirmed'
  | 'rejected'
  | 'cancelled'

// Payment statuses
export type PaymentStatus = 'submitted' | 'approved' | 'rejected' | 'refunded'

// Payment methods
export type PaymentMethod = 'upi_manual' | 'razorpay'

// Event row from database
export interface Event {
  id: string
  title: string
  slug: string
  description: string | null
  short_description: string | null
  banner_image_url: string | null
  venue: string | null
  starts_at: string | null
  ends_at: string | null
  registration_deadline: string | null
  registration_open: boolean
  published: boolean
  is_featured: boolean
  featured_button_text: string | null
  team_min_size: number
  team_max_size: number
  fee_per_team: number
  payment_methods_enabled: PaymentMethod[]
  eligibility: string | null
  rules: string | null
  schedule: string | null
  prizes: string | null
  faqs: string | null
  contact_email: string | null
  contact_phone: string | null
  created_at: string
  updated_at: string
}

// Team row from database
export interface Team {
  id: string
  team_number: string
  event_id: string
  team_name: string
  leader_name: string
  leader_email: string
  leader_phone: string
  registration_status: RegistrationStatus
  public_reference: string
  created_at: string
  updated_at: string
  // Joined
  events?: Event
  team_members?: TeamMember[]
  payments?: Payment[]
}

// Team member row
export interface TeamMember {
  id: string
  team_id: string
  full_name: string
  email: string
  college: string | null
  roll_number: string | null
}

// Payment row
export interface Payment {
  id: string
  team_id: string
  amount: number
  method: PaymentMethod
  transaction_reference: string | null
  receipt_path: string | null
  provider_order_id: string | null
  provider_payment_id: string | null
  status: PaymentStatus
  rejection_reason: string | null
  verified_by: string | null
  verified_at: string | null
  created_at: string
}

// Admin user
export interface AdminUser {
  id: string
  user_id: string
  email: string
  created_at: string
}

// Audit log entry
export interface AuditLog {
  id: string
  admin_user_id: string
  action: string
  entity_type: string
  entity_id: string
  metadata: Record<string, unknown>
  created_at: string
}

// API response wrapper
export interface ApiResponse<T = null> {
  success: boolean
  data?: T
  error?: string
}

// Dashboard metrics
export interface DashboardMetrics {
  totalRegistrations: number
  confirmedTeams: number
  pendingPaymentReview: number
  upcomingEvents: number
  registrationsByEvent: Array<{ event_title: string; count: number }>
}

// Registration form data (client-side)
export interface RegistrationFormData {
  teamName: string
  leaderName: string
  leaderEmail: string
  leaderPhone: string
  members: Array<{
    fullName: string
    email: string
    college?: string
    rollNumber?: string
  }>
}

// UPI payment submission
export interface UpiPaymentSubmission {
  teamId: string
  transactionReference: string
  receiptFile: File
}
