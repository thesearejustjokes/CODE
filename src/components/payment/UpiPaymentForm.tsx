'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { formatCurrency } from '@/lib/utils'
import { Copy, Check, UploadCloud, Loader2, QrCode } from 'lucide-react'

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
  const [copied, setCopied] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const upiId = process.env.NEXT_PUBLIC_UPI_ID || ''
  const upiPayee = process.env.NEXT_PUBLIC_UPI_PAYEE_NAME || 'C.O.D.E. Club RNSIT'
  const qrImageUrl = process.env.NEXT_PUBLIC_UPI_QR_IMAGE_URL || ''

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
    }
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
          Transfer the exact fee of {formatCurrency(feeAmount)} for {eventTitle} and upload proof of payment below.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* UPI Details Box */}
        <div className="rounded-lg border border-border bg-surface-2/60 p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-text-tertiary">
                Payee Details
              </p>
              <p className="text-sm font-medium text-text-primary mt-1">{upiPayee}</p>
              {upiId ? (
                <p className="font-mono text-sm text-accent mt-0.5">{upiId}</p>
              ) : (
                <p className="text-xs text-text-tertiary mt-0.5 italic">
                  [UPI ID will be published prior to registration launch]
                </p>
              )}
            </div>

            {upiId && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleCopy}
                className="self-start border-border bg-surface-2 text-xs sm:self-center"
              >
                {copied ? <Check className="mr-1.5 h-3.5 w-3.5 text-accent" /> : <Copy className="mr-1.5 h-3.5 w-3.5" />}
                {copied ? 'Copied' : 'Copy UPI ID'}
              </Button>
            )}
          </div>

          {qrImageUrl && (
            <div className="mt-4 flex justify-center border-t border-border pt-4">
              <img
                src={qrImageUrl}
                alt="Authorized Club UPI QR Code"
                className="h-48 w-48 rounded-lg border border-border object-contain"
              />
            </div>
          )}

          <div className="mt-4 rounded border border-border-subtle bg-surface-1/60 p-3 text-xs text-text-secondary">
            <span className="font-semibold text-text-primary">Important:</span> Note the 12-digit UTR / UPI Reference Number from your payment app (Google Pay, PhonePe, Paytm, BHIM) and take a screenshot of the completed transaction.
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
            <Label htmlFor="transactionRef" className="text-sm text-text-primary">
              UPI Reference / UTR Number <span className="text-accent">*</span>
            </Label>
            <Input
              id="transactionRef"
              placeholder="e.g. 412384759281"
              value={transactionRef}
              onChange={(e) => setTransactionRef(e.target.value)}
              className="border-border bg-surface-2 font-mono text-sm text-text-primary"
            />
            <p className="text-xs text-text-tertiary">
              This is the unique 12-digit number found on your UPI receipt.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="receipt" className="text-sm text-text-primary">
              Payment Screenshot / Receipt <span className="text-accent">*</span>
            </Label>
            <div className="relative flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-surface-2/40 p-6 transition-colors hover:border-accent/40">
              <UploadCloud className="mb-2 h-8 w-8 text-text-tertiary" />
              <p className="text-xs text-text-secondary">
                {receiptFile ? (
                  <span className="font-semibold text-accent">{receiptFile.name} ({(receiptFile.size / 1024).toFixed(1)} KB)</span>
                ) : (
                  'Click or drag receipt screenshot here (PNG, JPG, PDF up to 5MB)'
                )}
              </p>
              <input
                id="receipt"
                type="file"
                accept="image/png,image/jpeg,image/webp,application/pdf"
                onChange={handleFileChange}
                className="absolute inset-0 cursor-pointer opacity-0"
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={uploading}
            className="w-full bg-accent text-surface-0 hover:bg-accent-dim"
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
