import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'
import { verifyAdminUser } from '@/lib/auth/admin'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    // 1. Verify admin session
    const admin = await verifyAdminUser()
    if (!admin) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized. Admin access required.' },
        { status: 401 }
      )
    }

    // 2. Parse & sanitize path parameter
    const { searchParams } = new URL(request.url)
    const filePath = searchParams.get('path')
    const isJson = searchParams.get('json') === '1'
    const isDownload = searchParams.get('download') === '1'

    if (!filePath || typeof filePath !== 'string') {
      return NextResponse.json(
        { success: false, error: 'File path parameter is required.' },
        { status: 400 }
      )
    }

    // Prevent directory traversal or malicious characters
    if (filePath.includes('..') || filePath.startsWith('/')) {
      return NextResponse.json(
        { success: false, error: 'Invalid file path.' },
        { status: 400 }
      )
    }

    if (filePath.startsWith('storage_pending/')) {
      return NextResponse.json(
        {
          success: false,
          error: 'This receipt was submitted before the storage bucket was created. No file was stored.',
        },
        { status: 404 }
      )
    }

    // 3. Create a temporary signed URL via service client (valid for 1 hour)
    const supabase = createServiceClient()
    const { data, error } = await supabase.storage
      .from('payment-receipts')
      .createSignedUrl(filePath, 60 * 60, {
        download: isDownload,
      })

    if (error || !data?.signedUrl) {
      console.warn('Storage signed URL generation error:', error?.message)
      return NextResponse.json(
        {
          success: false,
          error: error?.message || 'Receipt file not found in storage bucket.',
        },
        { status: 404 }
      )
    }

    if (isJson) {
      return NextResponse.json({ success: true, url: data.signedUrl })
    }

    // Redirect directly to the signed URL for <img> or <a href> usage
    return NextResponse.redirect(data.signedUrl)
  } catch (err: unknown) {
    console.error('Error serving admin receipt:', err)
    return NextResponse.json(
      { success: false, error: 'Internal server error while retrieving receipt.' },
      { status: 500 }
    )
  }
}
