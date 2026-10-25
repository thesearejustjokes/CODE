/**
 * Checks whether Supabase is configured with valid, reachable credentials
 * (not dummy or placeholder values).
 */
export function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !key) return false
  if (
    url.includes('placeholder') ||
    url.includes('your-project') ||
    key.includes('dummy') ||
    key === 'your-supabase-anon-key'
  ) {
    return false
  }

  return true
}

/**
 * Executes an async query with an AbortSignal timeout guard.
 * Prevents paused or slow Supabase connections from hanging the SSR render.
 */
export async function withTimeout<T>(
  promise: Promise<T> | PromiseLike<T>,
  fallbackValue: T,
  timeoutMs = 2000
): Promise<T> {
  let timer: NodeJS.Timeout
  const timeoutPromise = new Promise<T>((resolve) => {
    timer = setTimeout(() => {
      resolve(fallbackValue)
    }, timeoutMs)
  })

  try {
    const result = await Promise.race([Promise.resolve(promise), timeoutPromise])
    clearTimeout(timer!)
    return result
  } catch {
    clearTimeout(timer!)
    return fallbackValue
  }
}
