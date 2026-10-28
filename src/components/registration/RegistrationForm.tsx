'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Event } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { toast } from 'sonner'
import { formatCurrency } from '@/lib/utils'
import { UserPlus, Trash2, ArrowRight, ArrowLeft, CheckCircle2, Loader2, Users } from 'lucide-react'

interface RegistrationFormProps {
  event: Event
}

interface MemberInput {
  fullName: string
  email: string
  college: string
  rollNumber: string
}

export function RegistrationForm({ event }: RegistrationFormProps) {
  const router = useRouter()
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Form states
  const [teamName, setTeamName] = useState('')
  const [leaderName, setLeaderName] = useState('')
  const [leaderEmail, setLeaderEmail] = useState('')
  const [leaderPhone, setLeaderPhone] = useState('')

  // Minimum additional members needed: max(0, event.team_min_size - 1)
  const minAdditionalMembers = Math.max(0, event.team_min_size - 1)
  const maxAdditionalMembers = Math.max(0, event.team_max_size - 1)

  const [members, setMembers] = useState<MemberInput[]>([])

  const addMember = () => {
    if (members.length >= maxAdditionalMembers) {
      toast.error(`Maximum team size is ${event.team_max_size} (including leader).`)
      return
    }
    setMembers([...members, { fullName: '', email: '', college: '', rollNumber: '' }])
  }

  const removeMember = (index: number) => {
    setMembers(members.filter((_, i) => i !== index))
  }

  const updateMember = (index: number, field: keyof MemberInput, value: string) => {
    const updated = [...members]
    updated[index][field] = value
    setMembers(updated)
  }

  const validateStep1 = () => {
    if (!teamName.trim()) {
      toast.error('Please enter a team name')
      return false
    }
    if (!leaderName.trim()) {
      toast.error('Please enter team leader name')
      return false
    }
    if (!leaderEmail.trim() || !/\S+@\S+\.\S+/.test(leaderEmail)) {
      toast.error('Please enter a valid leader email address')
      return false
    }
    if (!/^[6-9]\d{9}$/.test(leaderPhone.trim())) {
      toast.error('Please enter a valid 10-digit Indian phone number')
      return false
    }
    return true
  }

  const validateStep2 = () => {
    const totalMembers = 1 + members.length
    if (totalMembers < event.team_min_size) {
      toast.error(`This event requires at least ${event.team_min_size} members per team.`)
      return false
    }
    for (let i = 0; i < members.length; i++) {
      const m = members[i]
      if (!m.fullName.trim()) {
        toast.error(`Member #${i + 2}: Full name is required`)
        return false
      }
      if (!m.email.trim() || !/\S+@\S+\.\S+/.test(m.email)) {
        toast.error(`Member #${i + 2}: Valid email address is required`)
        return false
      }
      if (!m.rollNumber.trim()) {
        toast.error(`Member #${i + 2}: USN is required`)
        return false
      }
    }
    return true
  }

  const handleNext = () => {
    setError(null)
    if (step === 1) {
      if (validateStep1()) {
        // If event only allows 1 member, skip to review step
        if (event.team_max_size === 1) {
          setStep(3)
        } else {
          setStep(2)
        }
      }
    } else if (step === 2) {
      if (validateStep2()) {
        setStep(3)
      }
    }
  }

  const handleBack = () => {
    setError(null)
    if (step === 3) {
      if (event.team_max_size === 1) {
        setStep(1)
      } else {
        setStep(2)
      }
    } else if (step === 2) {
      setStep(1)
    }
  }

  const handleSubmit = async () => {
    setSubmitting(true)
    setError(null)

    try {
      const res = await fetch('/api/registrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventSlug: event.slug,
          teamName,
          leaderName,
          leaderEmail,
          leaderPhone,
          members,
        }),
      })

      const data = await res.json()

      if (!res.ok || !data.success) {
        const errorMsg = data.error || 'Failed to submit registration. Please check your inputs.'
        setError(errorMsg)
        toast.error(errorMsg)
        setSubmitting(false)
        return
      }

      toast.success('Registration submitted successfully!')
      router.push(`/registration/${data.data.publicReference}`)
    } catch (err) {
      console.error(err)
      const errorMsg = 'A network error occurred. Please check your connection and try again.'
      setError(errorMsg)
      toast.error(errorMsg)
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      {/* Steps indicator */}
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${
              step >= 1 ? 'bg-accent text-surface-0' : 'bg-surface-2 text-text-secondary'
            }`}
          >
            1
          </div>
          <span className={`text-xs font-medium uppercase tracking-wider ${step >= 1 ? 'text-accent' : 'text-text-tertiary'}`}>
            Leader & Team
          </span>
        </div>
        <div className="h-0.5 w-12 bg-border sm:w-20" />
        {event.team_max_size > 1 && (
          <>
            <div className="flex items-center gap-3">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${
                  step >= 2 ? 'bg-accent text-surface-0' : 'bg-surface-2 text-text-secondary'
                }`}
              >
                2
              </div>
              <span className={`text-xs font-medium uppercase tracking-wider ${step >= 2 ? 'text-accent' : 'text-text-tertiary'}`}>
                Members
              </span>
            </div>
            <div className="h-0.5 w-12 bg-border sm:w-20" />
          </>
        )}
        <div className="flex items-center gap-3">
          <div
            className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${
              step === 3 ? 'bg-accent text-surface-0' : 'bg-surface-2 text-text-secondary'
            }`}
          >
            {event.team_max_size === 1 ? '2' : '3'}
          </div>
          <span className={`text-xs font-medium uppercase tracking-wider ${step === 3 ? 'text-accent' : 'text-text-tertiary'}`}>
            Review
          </span>
        </div>
      </div>

      {error && (
        <div className="mb-6 rounded-md border border-status-rejected/40 bg-status-rejected/10 p-4 text-sm text-status-rejected">
          {error}
        </div>
      )}

      {/* Step 1: Leader & Team */}
      {step === 1 && (
        <Card className="border-border bg-surface-1">
          <CardHeader>
            <CardTitle className="text-xl text-text-primary">Team & Leader Details</CardTitle>
            <CardDescription className="text-text-secondary">
              Provide basic information about your team and primary contact person.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="teamName" className="text-text-primary">
                Team Name <span className="text-accent">*</span>
              </Label>
              <Input
                id="teamName"
                placeholder="e.g. Data Wizards"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                className="border-border bg-surface-2 text-text-primary"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="leaderName" className="text-text-primary">
                Team Leader Full Name <span className="text-accent">*</span>
              </Label>
              <Input
                id="leaderName"
                placeholder="e.g. Rahul Sharma"
                value={leaderName}
                onChange={(e) => setLeaderName(e.target.value)}
                className="border-border bg-surface-2 text-text-primary"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="leaderEmail" className="text-text-primary">
                Team Leader Email <span className="text-accent">*</span>
              </Label>
              <Input
                id="leaderEmail"
                type="email"
                placeholder="e.g. rahul@example.com"
                value={leaderEmail}
                onChange={(e) => setLeaderEmail(e.target.value)}
                className="border-border bg-surface-2 text-text-primary"
              />
              <p className="text-xs text-text-tertiary">
                Confirmation updates and access credentials will be sent to this email.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="leaderPhone" className="text-text-primary">
                Team Leader Phone (WhatsApp preferred) <span className="text-accent">*</span>
              </Label>
              <Input
                id="leaderPhone"
                type="tel"
                placeholder="e.g. 9876543210"
                value={leaderPhone}
                onChange={(e) => setLeaderPhone(e.target.value)}
                className="border-border bg-surface-2 text-text-primary"
              />
              <p className="text-xs text-text-tertiary">10-digit Indian mobile number</p>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end border-t border-border pt-4">
            <Button
              type="button"
              onClick={handleNext}
              className="bg-accent text-surface-0 hover:bg-accent-dim"
            >
              Continue <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
      )}

      {/* Step 2: Additional Members */}
      {step === 2 && event.team_max_size > 1 && (
        <Card className="border-border bg-surface-1">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl text-text-primary">Additional Team Members</CardTitle>
                <CardDescription className="text-text-secondary">
                  Team size requirement: {event.team_min_size} to {event.team_max_size} members (leader + {members.length} added).
                </CardDescription>
              </div>
              {members.length < maxAdditionalMembers && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addMember}
                  className="border-accent/40 text-accent hover:bg-accent/10"
                >
                  <UserPlus className="mr-1.5 h-3.5 w-3.5" /> Add Member
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {members.length === 0 ? (
              <div className="rounded-lg border border-dashed border-border p-8 text-center">
                <Users className="mx-auto mb-2 h-8 w-8 text-text-tertiary" />
                <p className="text-sm text-text-secondary">
                  {minAdditionalMembers > 0
                    ? `You need to add at least ${minAdditionalMembers} more member(s) to meet the minimum team size.`
                    : 'No additional members added yet. You can participate solo or add members using the button above.'}
                </p>
                {members.length < maxAdditionalMembers && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addMember}
                    className="mt-4 border-accent/40 text-accent hover:bg-accent/10"
                  >
                    <UserPlus className="mr-1.5 h-3.5 w-3.5" /> Add Member
                  </Button>
                )}
              </div>
            ) : (
              members.map((member, idx) => (
                <div
                  key={idx}
                  className="relative space-y-3 rounded-lg border border-border bg-surface-2/40 p-4"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wider text-accent">
                      Member #{idx + 2}
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeMember(idx)}
                      className="h-7 px-2 text-status-rejected hover:bg-status-rejected/10"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <div className="space-y-1">
                      <Label className="text-xs text-text-secondary">Full Name *</Label>
                      <Input
                        placeholder="Full Name"
                        value={member.fullName}
                        onChange={(e) => updateMember(idx, 'fullName', e.target.value)}
                        required
                        className="h-9 border-border bg-surface-2 text-sm"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-text-secondary">Email *</Label>
                      <Input
                        type="email"
                        placeholder="Email"
                        value={member.email}
                        onChange={(e) => updateMember(idx, 'email', e.target.value)}
                        required
                        className="h-9 border-border bg-surface-2 text-sm"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-text-secondary">USN *</Label>
                      <Input
                        placeholder="e.g. 1RN23CS001"
                        value={member.rollNumber}
                        onChange={(e) => updateMember(idx, 'rollNumber', e.target.value)}
                        required
                        className="h-9 border-border bg-surface-2 font-mono text-sm uppercase"
                      />
                    </div>
                  </div>
                </div>
              ))
            )}
          </CardContent>
          <CardFooter className="flex justify-between border-t border-border pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleBack}
              className="border-border text-text-secondary hover:text-text-primary"
            >
              <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Button>
            <Button
              type="button"
              onClick={handleNext}
              className="bg-accent text-surface-0 hover:bg-accent-dim"
            >
              Review <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
      )}

      {/* Step 3: Review & Submit */}
      {step === 3 && (
        <Card className="border-border bg-surface-1">
          <CardHeader>
            <CardTitle className="text-xl text-text-primary">Review & Confirm</CardTitle>
            <CardDescription className="text-text-secondary">
              Please double-check your registration details before final submission.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="rounded-lg border border-border bg-surface-2/40 p-4">
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-text-tertiary">
                Event Summary
              </h3>
              <p className="text-base font-semibold text-text-primary">{event.title}</p>
              <p className="mt-1 text-sm text-text-secondary">
                Fee: {event.fee_per_team > 0 ? `${formatCurrency(event.fee_per_team)} per team` : 'Free'}
              </p>
            </div>

            <div className="rounded-lg border border-border bg-surface-2/40 p-4">
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-text-tertiary">
                Team Info
              </h3>
              <div className="space-y-1 text-sm">
                <p>
                  <span className="text-text-secondary">Team Name:</span>{' '}
                  <span className="font-medium text-text-primary">{teamName}</span>
                </p>
                <p>
                  <span className="text-text-secondary">Leader:</span>{' '}
                  <span className="font-medium text-text-primary">{leaderName} ({leaderEmail}, {leaderPhone})</span>
                </p>
                <p>
                  <span className="text-text-secondary">Total Members:</span>{' '}
                  <span className="font-medium text-text-primary">{1 + members.length}</span>
                </p>
              </div>

              {members.length > 0 && (
                <div className="mt-3 border-t border-border/60 pt-3">
                  <h4 className="mb-2 text-xs font-medium text-text-secondary">Additional Members:</h4>
                  <ul className="space-y-1 text-xs text-text-secondary">
                    {members.map((m, idx) => (
                      <li key={idx}>
                        • {m.fullName} ({m.email})
                        {m.rollNumber ? ` — USN: ${m.rollNumber}` : ''}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {event.fee_per_team > 0 ? (
              <div className="rounded-lg border border-accent/30 bg-accent/5 p-4 text-sm text-text-secondary">
                <p className="font-medium text-accent">Payment Step Follows</p>
                <p className="mt-1">
                  After submitting this form, you will receive a registration reference and instructions to complete the UPI payment ({formatCurrency(event.fee_per_team)}).
                </p>
              </div>
            ) : (
              <div className="rounded-lg border border-status-confirmed/30 bg-status-confirmed/5 p-4 text-sm text-status-confirmed">
                <CheckCircle2 className="mb-1 inline-block h-4 w-4 mr-1" /> This event has free registration. Your spot will be confirmed immediately upon submission.
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-between border-t border-border pt-4">
            <Button
              type="button"
              variant="outline"
              disabled={submitting}
              onClick={handleBack}
              className="border-border text-text-secondary hover:text-text-primary"
            >
              <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Button>
            <Button
              type="button"
              disabled={submitting}
              onClick={handleSubmit}
              className="bg-accent text-surface-0 hover:bg-accent-dim"
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...
                </>
              ) : (
                'Confirm & Register'
              )}
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  )
}
