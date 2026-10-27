import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { redirect } from 'next/navigation'

/**
 * Gets the currently authenticated admin user.
 * Returns null if no user is logged in.
 */
export async function getAdminUser() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) return null
  return user
}

export async function requireAdmin() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    redirect('/admin/login?reason=unauthenticated')
  }

  // Verify admin_users table membership (second authorization layer)
  const serviceClient = createServiceClient()
  const { data: adminRecord, error: adminError } = await serviceClient
    .from('admin_users')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (adminError || !adminRecord) {
    redirect('/admin/login?reason=unauthorized')
  }

  return user
}

/**
 * Verifies whether the current session belongs to an authorized admin.
 * Returns null instead of redirecting (ideal for API Route Handlers).
 */
export async function verifyAdminUser() {
  const user = await getAdminUser()
  if (!user) return null

  const serviceClient = createServiceClient()
  const { data: adminRecord, error: adminError } = await serviceClient
    .from('admin_users')
    .select('id, user_id, email')
    .eq('user_id', user.id)
    .single()

  if (adminError || !adminRecord) return null
  return { user, adminRecord }
}

/**
 * Server Action: sign the admin out.
 */
export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/admin/login')
}
