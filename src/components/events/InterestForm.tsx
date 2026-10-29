'use client'

import { useState } from 'react'
import { Event } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { toast } from 'sonner'
import { UserPlus, Trash2, ArrowRight, ArrowLeft, CheckCircle2, Loader2, Sparkles, AlertCircle } from 'lucide-react'

interface InterestFormProps {
  event: Event
  onSuccess?: () => void
}

interface MemberInput {
  fullName: string
  email: string
  college: string
  rollNumber: string
}

export function InterestForm({ event, onSuccess }: InterestFormProps) {
  const [step, setStep] = useState<1 | 2>(1)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Form states
  const [teamName, setTeamName] = useState('')
  const [leaderName, setLeaderName] = useState('')
  const [leaderEmail, setLeaderEmail] = useState('')
  const [leaderPhone, setLeaderPhone] = useState('')
  const [leaderRollNumber, setLeaderRollNumber] = useState('')
  const [notes, setNotes] = useState('')

  const maxAdditionalMembers = Math.max(0, (event.team_max_size || 3) - 1)
  const minAdditionalMembers = Math.max(0, (event.team_min_size || 2) - 1)

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
    if (!leaderRollNumber.trim()) {
      toast.error('Please enter team leader USN')
      return false
    }
    return true
  }

  const validateStep2 = () => {
    if (members.length < minAdditionalMembers) {
      toast.error(`This event requires at least ${event.team_min_size} members per team (${minAdditionalMembers} additional member).`)
      return false
    }

    for (let i = 0; i < members.length; i++) {
      const m = members[i]
      if (!m.fullName.trim()) {
        toast.error(`Please enter Member ${i + 2}'s full name`)
        return false
      }
      if (!m.email.trim() || !/\S+@\S+\.\S+/.test(m.email)) {
        toast.error(`Please enter a valid email for Member ${i + 2}`)
        return false
      }
      if (m.email.trim().toLowerCase() === leaderEmail.trim().toLowerCase()) {
        toast.error(`Member ${i + 2} cannot have the same email as the team leader`)
        return false
      }
    }
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateStep1() || !validateStep2()) return

    setSubmitting(true)
    setError(null)

    try {
      const res = await fetch('/api/interests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventSlug: event.slug,
          teamName: teamName.trim(),
          leaderName: leaderName.trim(),
          leaderEmail: leaderEmail.trim(),
          leaderPhone: leaderPhone.trim(),
          leaderRollNumber: leaderRollNumber.trim().toUpperCase(),
          members,
          notes: notes.trim(),
        }),
      })

      const data = await res.json()

      if (!res.ok || !data.success) {
        throw new Error(data.details || data.error || 'Failed to submit expression of interest')
      }

      setSubmitted(true)
      toast.success('Your interest has been registered! We will notify you when slots open.')
      if (onSuccess) onSuccess()
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.')
      toast.error(err.message || 'Submission failed')
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <Card className="border-accent/40 bg-surface-1 shadow-lg">
        <CardContent className="pt-8 pb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-accent/10 text-accent">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <h3 className="text-xl font-bold text-text-primary">Interest Registered!</h3>
          <p className="mt-2 text-sm text-text-secondary max-w-md mx-auto">
            Thank you, <strong className="text-text-primary">{leaderName}</strong>! We have saved your team{' '}
            <strong className="text-text-primary">({teamName})</strong> details. Our team will contact you as soon as registrations resume.
          </p>
          <div className="mt-6">
            <Button
              variant="outline"
              onClick={() => {
                setSubmitted(false)
                setStep(1)
                setTeamName('')
                setLeaderName('')
                setLeaderEmail('')
                setLeaderPhone('')
                setLeaderRollNumber('')
                setMembers([])
                setNotes('')
              }}
              className="border-border text-text-secondary hover:text-text-primary"
            >
              Submit Another Response
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-border/80 bg-surface-1 shadow-xl">
      <CardHeader>
        <div className="flex items-center gap-2 text-amber-400 text-xs font-semibold uppercase tracking-wider mb-1">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Priority Waitlist / Interest Form</span>
        </div>
        <CardTitle className="text-xl sm:text-2xl text-text-primary">
          Interested in participating in {event.title}?
        </CardTitle>
        <CardDescription className="text-text-secondary">
          Registrations are currently on hold. Drop your team details below and you will get first priority as soon as slots open!
        </CardDescription>

        {/* Stepper */}
        <div className="mt-4 flex items-center justify-between border-t border-border pt-4 text-xs font-medium">
          <div className={`flex items-center gap-2 ${step === 1 ? 'text-accent font-semibold' : 'text-text-tertiary'}`}>
            <span className={`flex h-5 w-5 items-center justify-center rounded-full border text-[10px] ${step === 1 ? 'border-accent bg-accent/10 text-accent' : 'border-border text-text-tertiary'}`}>
              1
            </span>
            <span>Team &amp; Leader Info</span>
          </div>
          <div className="h-px w-12 bg-border" />
          <div className={`flex items-center gap-2 ${step === 2 ? 'text-accent font-semibold' : 'text-text-tertiary'}`}>
            <span className={`flex h-5 w-5 items-center justify-center rounded-full border text-[10px] ${step === 2 ? 'border-accent bg-accent/10 text-accent' : 'border-border text-text-tertiary'}`}>
              2
            </span>
            <span>Team Members</span>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {error && (
          <div className="mb-4 flex items-center gap-2 rounded-md border border-status-rejected/30 bg-status-rejected/10 p-3 text-xs text-status-rejected">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="teamName" className="text-text-primary">
                Team Name <span className="text-accent">*</span>
              </Label>
              <Input
                id="teamName"
                placeholder="e.g. Byte Busters"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                className="border-border bg-surface-2 text-text-primary"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
                <Label htmlFor="leaderRollNumber" className="text-text-primary">
                  Team Leader USN <span className="text-accent">*</span>
                </Label>
                <Input
                  id="leaderRollNumber"
                  placeholder="e.g. 1RN23CS001"
                  value={leaderRollNumber}
                  onChange={(e) => setLeaderRollNumber(e.target.value.toUpperCase())}
                  className="border-border bg-surface-2 text-text-primary uppercase"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="leaderEmail" className="text-text-primary">
                  Leader Email Address <span className="text-accent">*</span>
                </Label>
                <Input
                  id="leaderEmail"
                  type="email"
                  placeholder="name@example.com"
                  value={leaderEmail}
                  onChange={(e) => setLeaderEmail(e.target.value)}
                  className="border-border bg-surface-2 text-text-primary"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="leaderPhone" className="text-text-primary">
                  Leader Phone / WhatsApp <span className="text-accent">*</span>
                </Label>
                <Input
                  id="leaderPhone"
                  type="tel"
                  placeholder="9876543210"
                  value={leaderPhone}
                  onChange={(e) => setLeaderPhone(e.target.value)}
                  className="border-border bg-surface-2 text-text-primary"
                />
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-semibold text-text-primary">Additional Team Members</h4>
                <p className="text-xs text-text-secondary">
                  Leader + {members.length} member{members.length === 1 ? '' : 's'} (Allowed: {event.team_min_size} to {event.team_max_size} members)
                </p>
              </div>
              {members.length < maxAdditionalMembers && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addMember}
                  className="border-accent/40 text-accent hover:bg-accent/10"
                >
                  <UserPlus className="mr-1.5 h-3.5 w-3.5" />
                  Add Member
                </Button>
              )}
            </div>

            {members.length === 0 ? (
              <div className="rounded-lg border border-dashed border-border p-6 text-center">
                <p className="text-xs text-text-secondary">
                  This event requires a team of at least {event.team_min_size} members. Click above to add your teammates.
                </p>
              </div>
            ) : (
              members.map((member, idx) => (
                <div key={idx} className="rounded-lg border border-border bg-surface-2/50 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-text-primary">Member {idx + 2}</span>
                    <button
                      type="button"
                      onClick={() => removeMember(idx)}
                      className="text-text-tertiary hover:text-status-rejected transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div className="space-y-1">
                      <Label className="text-xs text-text-secondary">Full Name *</Label>
                      <Input
                        value={member.fullName}
                        onChange={(e) => updateMember(idx, 'fullName', e.target.value)}
                        placeholder="Teammate name"
                        className="h-8 border-border bg-surface-1 text-xs text-text-primary"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-text-secondary">USN</Label>
                      <Input
                        value={member.rollNumber}
                        onChange={(e) => updateMember(idx, 'rollNumber', e.target.value.toUpperCase())}
                        placeholder="e.g. 1RN23CS002"
                        className="h-8 border-border bg-surface-1 text-xs text-text-primary uppercase"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div className="space-y-1">
                      <Label className="text-xs text-text-secondary">Email Address *</Label>
                      <Input
                        type="email"
                        value={member.email}
                        onChange={(e) => updateMember(idx, 'email', e.target.value)}
                        placeholder="teammate@example.com"
                        className="h-8 border-border bg-surface-1 text-xs text-text-primary"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-text-secondary">College / Branch</Label>
                      <Input
                        value={member.college}
                        onChange={(e) => updateMember(idx, 'college', e.target.value)}
                        placeholder="RNSIT - CSE (Data Science)"
                        className="h-8 border-border bg-surface-1 text-xs text-text-primary"
                      />
                    </div>
                  </div>
                </div>
              ))
            )}

            <div className="space-y-2 pt-2 border-t border-border">
              <Label htmlFor="notes" className="text-xs text-text-secondary">
                Any questions or comments for the organizers? (Optional)
              </Label>
              <Input
                id="notes"
                placeholder="e.g. We are ready with our team!"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="border-border bg-surface-2 text-text-primary text-xs"
              />
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter className="flex justify-between border-t border-border pt-4">
        {step === 1 ? (
          <div className="flex w-full justify-end">
            <Button
              type="button"
              onClick={() => {
                if (validateStep1()) setStep(2)
              }}
              className="bg-accent text-surface-0 hover:bg-accent-dim text-xs font-semibold"
            >
              Next: Add Teammates
              <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
            </Button>
          </div>
        ) : (
          <div className="flex w-full justify-between items-center">
            <Button
              type="button"
              variant="outline"
              onClick={() => setStep(1)}
              className="border-border text-xs text-text-secondary hover:text-text-primary"
            >
              <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
              Back
            </Button>
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className="bg-accent text-surface-0 hover:bg-accent-dim text-xs font-semibold"
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                  Saving Details...
                </>
              ) : (
                <>
                  Submit Expression of Interest
                  <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                </>
              )}
            </Button>
          </div>
        )}
      </CardFooter>
    </Card>
  )
}
