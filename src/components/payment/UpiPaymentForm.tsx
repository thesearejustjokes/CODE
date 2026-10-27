'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { formatCurrency } from '@/lib/utils'
import { Copy, Check, UploadCloud, Loader2, QrCode, Smartphone, X, FileText, Image as ImageIcon } from 'lucide-react'

interface UpiPaymentFormProps {
  publicReference: string
  feeAmount: number
  eventTitle: string
}

export function UpiPaymentForm({
  publicReference,
  feeAmount,
  eventTitle,
}: UpiPaymentFormProps) {
  const router = useRouter()
  const [transactionRef, setTransactionRef] = useState('')
  const [receiptFile, setReceiptFile] = useState<File | null>(null)
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const upiId = process.env.NEXT_PUBLIC_UPI_ID || ''
  const upiPayee = process.env.NEXT_PUBLIC_UPI_PAYEE_NAME || 'C.O.D.E. Club RNSIT'
  const qrImageUrl = process.env.NEXT_PUBLIC_UPI_QR_IMAGE_URL || ''

  const upiDeepLink = upiId
    ? `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(upiPayee)}&am=${encodeURIComponent(feeAmount)}&cu=INR&tn=${encodeURIComponent(eventTitle)}`
    : null

  // Fallback QR code generated if custom hosted QR is not configured yet
  const effectiveQrUrl =
    qrImageUrl ||
    (upiDeepLink
      ? `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(upiDeepLink)}`
      : '')

  useEffect(() => {
    return () => {
      if (receiptPreview) {
        URL.revokeObjectURL(receiptPreview)
      }
    }
  }, [receiptPreview])

  const handleCopy = () => {
    if (!upiId) return
    navigator.clipboard.writeText(upiId)
    setCopied(true)
    toast.success('UPI ID copied to clipboard!')
    setTimeout(() => setCopied(false), 2000)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size exceeds 5MB limit')
        return
      }
      setReceiptFile(file)
      if (file.type.startsWith('image/')) {
        setReceiptPreview(URL.createObjectURL(file))
      } else {
        setReceiptPreview(null)
      }
    }
  }

  const handleRemoveFile = () => {
    if (receiptPreview) {
      URL.revokeObjectURL(receiptPreview)
    }
    setReceiptFile(null)
    setReceiptPreview(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!transactionRef.trim() || transactionRef.trim().length < 6) {
      toast.error('Please enter a valid 12-digit UTR or Transaction Reference number')
      return
    }

    if (!receiptFile) {
      toast.error('Please attach your payment receipt screenshot or document')
      return
    }

    setUploading(true)

    try {
      const formData = new FormData()
      formData.append('publicReference', publicReference)
      formData.append('transactionReference', transactionRef.trim())
      formData.append('receipt', receiptFile)

      const res = await fetch('/api/payments/upi', {
        method: 'POST',
        body: formData,
      })

      const data = await res.json()

      if (!res.ok || !data.success) {
        const msg = data.error || 'Failed to submit payment details.'
        setError(msg)
        toast.error(msg)
        setUploading(false)
        return
      }

      toast.success('Payment receipt submitted for manual review!')
      router.refresh()
    } catch (err) {
      console.error(err)
      const msg = 'A network error occurred. Please try again.'
      setError(msg)
      toast.error(msg)
      setUploading(false)
    }
  }

  return (
    <Card className="border-border bg-surface-1">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl text-text-primary">
          <QrCode className="h-5 w-5 text-accent" /> UPI Payment &amp; Receipt Submission
        </CardTitle>
        <CardDescription className="text-text-secondary">
          Transfer the exact registration fee of <strong className="text-text-primary">{formatCurrency(feeAmount)}</strong> for {eventTitle} and upload your payment proof below.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* UPI Details Box */}
        <div className="rounded-lg border border-border bg-surface-2/60 p-5 space-y-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-text-tertiary">
                Payee Details
              </p>
              <p className="text-base font-semibold text-text-primary mt-1">{upiPayee}</p>
              {upiId ? (
                <p className="font-mono text-sm text-accent mt-0.5">{upiId}</p>
              ) : (
                <p className="text-xs text-text-tertiary mt-0.5 italic">
                  [UPI ID will be published prior to registration launch]
                </p>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              {upiId && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleCopy}
                  className="border-border bg-surface-2 text-xs"
                >
                  {copied ? <Check className="mr-1.5 h-3.5 w-3.5 text-accent" /> : <Copy className="mr-1.5 h-3.5 w-3.5" />}
                  {copied ? 'Copied' : 'Copy UPI ID'}
                </Button>
              )}

              {upiDeepLink && (
                <Button
                  asChild
                  size="sm"
                  variant="outline"
                  className="border-accent/40 bg-accent/10 text-accent hover:bg-accent/20 text-xs sm:hidden"
                >
                  <a href={upiDeepLink}>
                    <Smartphone className="mr-1.5 h-3.5 w-3.5" /> Open in UPI App
                  </a>
                </Button>
              )}
            </div>
          </div>

          {effectiveQrUrl && (
            <div className="flex flex-col items-center justify-center border-t border-border pt-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-text-tertiary mb-2">
                Scan QR Code with any UPI App
              </p>
              <div className="rounded-xl border border-border bg-white p-3 shadow-md">
                <img
                  src={effectiveQrUrl}
                  alt="Authorized Club UPI QR Code"
                  className="h-48 w-48 object-contain"
                />
              </div>
              <p className="mt-2 text-xs text-text-secondary text-center">
                Supported apps: Google Pay, PhonePe, Paytm, BHIM, Cred, and all bank UPI apps
              </p>
            </div>
          )}

          <div className="rounded border border-border-subtle bg-surface-1/60 p-3 text-xs text-text-secondary">
            <span className="font-semibold text-text-primary">Payment Instructions:</span>
            <ol className="mt-1 list-inside list-decimal space-y-0.5 text-text-secondary">
              <li>Scan the QR code or send payment to the UPI ID above.</li>
              <li>Ensure the exact amount of {formatCurrency(feeAmount)} is sent.</li>
              <li>Note down the <strong>12-digit UTR / UPI Transaction ID</strong>.</li>
              <li>Take a screenshot of the payment confirmation page and upload it below.</li>
            </ol>
          </div>
        </div>

        {error && (
          <div className="rounded-md border border-status-rejected/40 bg-status-rejected/10 p-3 text-xs text-status-rejected">
            {error}
          </div>
        )}

        {/* Submission Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="transactionRef" className="text-sm font-medium text-text-primary">
              12-Digit UPI Reference / UTR Number <span className="text-accent">*</span>
            </Label>
            <Input
              id="transactionRef"
              placeholder="e.g. 412384759281"
              value={transactionRef}
              onChange={(e) => setTransactionRef(e.target.value)}
              className="border-border bg-surface-2 font-mono text-sm text-text-primary"
              required
            />
            <p className="text-xs text-text-tertiary">
              Look for &quot;UPI Ref No.&quot;, &quot;UTR&quot;, or &quot;Transaction ID&quot; in your payment receipt.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="receipt" className="text-sm font-medium text-text-primary">
              Payment Screenshot / Receipt Proof <span className="text-accent">*</span>
            </Label>

            {!receiptFile ? (
              <div className="relative flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-surface-2/40 p-6 transition-colors hover:border-accent/40">
                <UploadCloud className="mb-2 h-8 w-8 text-text-tertiary" />
                <p className="text-xs font-medium text-text-secondary">
                  Click or drag your payment screenshot here
                </p>
                <p className="text-[11px] text-text-tertiary mt-1">
                  Supported formats: PNG, JPG, WEBP, PDF (up to 5MB)
                </p>
                <input
                  id="receipt"
                  type="file"
                  accept="image/png,image/jpeg,image/webp,application/pdf"
                  onChange={handleFileChange}
                  className="absolute inset-0 cursor-pointer opacity-0"
                  required
                />
              </div>
            ) : (
              <div className="rounded-lg border border-border bg-surface-2 p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 overflow-hidden">
                    {receiptPreview ? (
                      <ImageIcon className="h-4 w-4 text-accent shrink-0" />
                    ) : (
                      <FileText className="h-4 w-4 text-accent shrink-0" />
                    )}
                    <span className="truncate text-xs font-semibold text-text-primary">
                      {receiptFile.name}
                    </span>
                    <span className="text-[11px] text-text-tertiary shrink-0">
                      ({(receiptFile.size / 1024).toFixed(1)} KB)
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveFile}
                    className="rounded p-1 text-text-tertiary hover:bg-surface-3 hover:text-status-rejected transition-colors"
                    title="Remove file"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                {receiptPreview && (
                  <div className="flex justify-center rounded border border-border bg-black/30 p-2">
                    <img
                      src={receiptPreview}
                      alt="Selected receipt preview"
                      className="max-h-48 w-auto rounded object-contain"
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          <Button
            type="submit"
            disabled={uploading}
            className="w-full bg-accent text-surface-0 hover:bg-accent-dim font-medium"
          >
            {uploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting for Review...
              </>
            ) : (
              'Submit Proof of Payment'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
