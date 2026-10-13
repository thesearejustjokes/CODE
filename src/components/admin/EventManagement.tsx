'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Event } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog'
import { toast } from 'sonner'
import { formatDate, formatCurrency } from '@/lib/utils'
import {
  Plus,
  Star,
  CheckCircle,
  XCircle,
  Edit,
  ExternalLink,
  Calendar,
  Users,
  Loader2,
} from 'lucide-react'

interface EventManagementProps {
  initialEvents: Event[]
}

export function EventManagement({ initialEvents }: EventManagementProps) {
  const router = useRouter()
  const [events, setEvents] = useState<Event[]>(initialEvents)
  const [openModal, setOpenModal] = useState(false)
  const [editingEvent, setEditingEvent] = useState<Event | null>(null)
  const [saving, setSaving] = useState(false)

  // Form fields
  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [shortDesc, setShortDesc] = useState('')
  const [desc, setDesc] = useState('')
  const [venue, setVenue] = useState('')
  const [startsAt, setStartsAt] = useState('')
  const [endsAt, setEndsAt] = useState('')
  const [regDeadline, setRegDeadline] = useState('')
  const [teamMin, setTeamMin] = useState(1)
  const [teamMax, setTeamMax] = useState(4)
  const [fee, setFee] = useState(0)
  const [bannerUrl, setBannerUrl] = useState('')
  const [published, setPublished] = useState(true)
  const [regOpen, setRegOpen] = useState(true)
  const [isFeatured, setIsFeatured] = useState(false)
  const [eligibility, setEligibility] = useState('')
  const [rules, setRules] = useState('')
  const [prizes, setPrizes] = useState('')
  const [faqs, setFaqs] = useState('')

  const openCreateDialog = () => {
    setEditingEvent(null)
    setTitle('')
    setSlug('')
    setShortDesc('')
    setDesc('')
    setVenue('')
    setStartsAt('')
    setEndsAt('')
    setRegDeadline('')
    setTeamMin(1)
    setTeamMax(4)
    setFee(0)
    setBannerUrl('')
    setPublished(true)
    setRegOpen(true)
    setIsFeatured(false)
    setEligibility('')
    setRules('')
    setPrizes('')
    setFaqs('')
    setOpenModal(true)
  }

  const openEditDialog = (ev: Event) => {
    setEditingEvent(ev)
    setTitle(ev.title)
    setSlug(ev.slug)
    setShortDesc(ev.short_description || '')
    setDesc(ev.description || '')
    setVenue(ev.venue || '')
    setStartsAt(ev.starts_at ? new Date(ev.starts_at).toISOString().slice(0, 16) : '')
    setEndsAt(ev.ends_at ? new Date(ev.ends_at).toISOString().slice(0, 16) : '')
    setRegDeadline(ev.registration_deadline ? new Date(ev.registration_deadline).toISOString().slice(0, 16) : '')
    setTeamMin(ev.team_min_size)
    setTeamMax(ev.team_max_size)
    setFee(ev.fee_per_team)
    setBannerUrl(ev.banner_image_url || '')
    setPublished(ev.published)
    setRegOpen(ev.registration_open)
    setIsFeatured(ev.is_featured)
    setEligibility(ev.eligibility || '')
    setRules(ev.rules || '')
    setPrizes(ev.prizes || '')
    setFaqs(ev.faqs || '')
    setOpenModal(true)
  }

  const handleTitleChange = (val: string) => {
    setTitle(val)
    if (!editingEvent) {
      setSlug(
        val
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)+/g, '')
      )
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    const payload = {
      title,
      slug,
      short_description: shortDesc || null,
      description: desc || null,
      venue: venue || null,
      starts_at: startsAt ? new Date(startsAt).toISOString() : null,
      ends_at: endsAt ? new Date(endsAt).toISOString() : null,
      registration_deadline: regDeadline ? new Date(regDeadline).toISOString() : null,
      team_min_size: Number(teamMin),
      team_max_size: Number(teamMax),
      fee_per_team: Number(fee),
      banner_image_url: bannerUrl || null,
      published,
      registration_open: regOpen,
      is_featured: isFeatured,
      eligibility: eligibility || null,
      rules: rules || null,
      prizes: prizes || null,
      faqs: faqs || null,
    }

    try {
      let res
      if (editingEvent) {
        res = await fetch('/api/admin/events', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editingEvent.id, ...payload }),
        })
      } else {
        res = await fetch('/api/admin/events', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
      }

      const data = await res.json()
      if (!res.ok || !data.success) {
        toast.error(data.error || 'Failed to save event.')
        setSaving(false)
        return
      }

      toast.success(editingEvent ? 'Event updated!' : 'Event created successfully!')
      setOpenModal(false)
      router.refresh()
    } catch (err) {
      console.error(err)
      toast.error('An error occurred while saving the event.')
    } finally {
      setSaving(false)
    }
  }

  const handleSetFeatured = async (eventId: string) => {
    try {
      const res = await fetch('/api/admin/events', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: eventId, is_featured: true, published: true }),
      })
      const data = await res.json()
      if (res.ok && data.success) {
        toast.success('Event promoted to homepage featured slot!')
        router.refresh()
      } else {
        toast.error(data.error || 'Failed to set featured event')
      }
    } catch (err) {
      console.error(err)
      toast.error('Network error')
    }
  }

  const handleToggleRegistration = async (ev: Event) => {
    try {
      const res = await fetch('/api/admin/events', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: ev.id, registration_open: !ev.registration_open }),
      })
      const data = await res.json()
      if (res.ok && data.success) {
        toast.success(`Registration ${!ev.registration_open ? 'opened' : 'closed'}!`)
        router.refresh()
      }
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary">
            Event Management
          </h1>
          <p className="mt-1 text-xs text-text-secondary">
            Publish events, manage team registration windows, and choose the featured homepage event.
          </p>
        </div>
        <Button onClick={openCreateDialog} className="bg-accent text-surface-0 hover:bg-accent-dim">
          <Plus className="mr-1.5 h-4 w-4" /> New Event
        </Button>
      </div>

      {/* Events List */}
      <div className="grid grid-cols-1 gap-4">
        {events.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border p-12 text-center text-sm text-text-secondary">
            No events found. Click &quot;New Event&quot; to publish your first event!
          </div>
        ) : (
          events.map((ev) => (
            <Card
              key={ev.id}
              className={`border bg-surface-1 transition-colors ${
                ev.is_featured ? 'border-accent/40 shadow-accent' : 'border-border'
              }`}
            >
              <CardContent className="flex flex-col justify-between gap-4 p-5 sm:flex-row sm:items-center">
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-base font-bold text-text-primary">{ev.title}</h3>
                    {ev.is_featured && (
                      <span className="flex items-center gap-1 rounded bg-accent/15 px-2 py-0.5 text-xs font-semibold text-accent">
                        <Star className="h-3 w-3 fill-accent" /> Featured on Homepage
                      </span>
                    )}
                    <span
                      className={`rounded px-2 py-0.5 text-xs font-medium ${
                        ev.published
                          ? 'bg-status-confirmed/10 text-status-confirmed'
                          : 'bg-surface-2 text-text-tertiary'
                      }`}
                    >
                      {ev.published ? 'Published' : 'Draft'}
                    </span>
                    <span
                      className={`rounded px-2 py-0.5 text-xs font-medium ${
                        ev.registration_open
                          ? 'bg-status-review/10 text-status-review'
                          : 'bg-surface-2 text-text-secondary'
                      }`}
                    >
                      {ev.registration_open ? 'Reg Open' : 'Reg Closed'}
                    </span>
                  </div>

                  <p className="font-mono text-xs text-text-tertiary">
                    Slug: /{ev.slug} &bull; Team: {ev.team_min_size}&ndash;{ev.team_max_size} &bull; Fee:{' '}
                    {ev.fee_per_team > 0 ? formatCurrency(ev.fee_per_team) : 'Free'}
                  </p>

                  {ev.starts_at && (
                    <p className="text-xs text-text-secondary">
                      Date: {formatDate(ev.starts_at)} {ev.venue ? `\u2022 Venue: ${ev.venue}` : ''}
                    </p>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {!ev.is_featured && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleSetFeatured(ev.id)}
                      className="border-border text-xs hover:border-accent hover:text-accent"
                      title="Promote to homepage banner"
                    >
                      <Star className="mr-1.5 h-3.5 w-3.5" /> Feature
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleToggleRegistration(ev)}
                    className="border-border text-xs"
                  >
                    {ev.registration_open ? 'Close Reg' : 'Open Reg'}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => openEditDialog(ev)}
                    className="border-border text-xs"
                  >
                    <Edit className="mr-1.5 h-3.5 w-3.5" /> Edit
                  </Button>
                  <a
                    href={`/events/${ev.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex h-8 items-center rounded border border-border px-2 text-xs text-text-secondary hover:text-text-primary"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Create / Edit Dialog */}
      <Dialog open={openModal} onOpenChange={setOpenModal}>
        <DialogContent className="max-h-[90vh] overflow-y-auto border-border bg-surface-1 sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg text-text-primary">
              {editingEvent ? 'Edit Event' : 'Create New Event'}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSave} className="space-y-4 py-2">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label className="text-xs text-text-primary">Event Title *</Label>
                <Input
                  value={title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="e.g. DataStorm Hackathon 2026"
                  required
                  className="border-border bg-surface-2 text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs text-text-primary">URL Slug *</Label>
                <Input
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="datastorm-2026"
                  required
                  className="border-border bg-surface-2 font-mono text-sm"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-text-primary">Short Summary</Label>
              <Input
                value={shortDesc}
                onChange={(e) => setShortDesc(e.target.value)}
                placeholder="One sentence description shown on event cards"
                className="border-border bg-surface-2 text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-text-primary">Full Description</Label>
              <Textarea
                rows={3}
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                placeholder="Comprehensive overview of the event..."
                className="border-border bg-surface-2 text-sm"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="space-y-1.5">
                <Label className="text-xs text-text-primary">Start Date &amp; Time</Label>
                <Input
                  type="datetime-local"
                  value={startsAt}
                  onChange={(e) => setStartsAt(e.target.value)}
                  className="border-border bg-surface-2 text-xs"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-text-primary">End Date &amp; Time</Label>
                <Input
                  type="datetime-local"
                  value={endsAt}
                  onChange={(e) => setEndsAt(e.target.value)}
                  className="border-border bg-surface-2 text-xs"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-text-primary">Registration Deadline</Label>
                <Input
                  type="datetime-local"
                  value={regDeadline}
                  onChange={(e) => setRegDeadline(e.target.value)}
                  className="border-border bg-surface-2 text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="space-y-1.5">
                <Label className="text-xs text-text-primary">Min Team Size</Label>
                <Input
                  type="number"
                  min={1}
                  max={10}
                  value={teamMin}
                  onChange={(e) => setTeamMin(Number(e.target.value))}
                  className="border-border bg-surface-2 text-sm"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-text-primary">Max Team Size</Label>
                <Input
                  type="number"
                  min={1}
                  max={10}
                  value={teamMax}
                  onChange={(e) => setTeamMax(Number(e.target.value))}
                  className="border-border bg-surface-2 text-sm"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-text-primary">Fee Per Team (₹)</Label>
                <Input
                  type="number"
                  min={0}
                  value={fee}
                  onChange={(e) => setFee(Number(e.target.value))}
                  className="border-border bg-surface-2 text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label className="text-xs text-text-primary">Venue / Location</Label>
                <Input
                  value={venue}
                  onChange={(e) => setVenue(e.target.value)}
                  placeholder="e.g. CSE Seminar Hall / Online"
                  className="border-border bg-surface-2 text-sm"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-text-primary">Banner Image URL</Label>
                <Input
                  value={bannerUrl}
                  onChange={(e) => setBannerUrl(e.target.value)}
                  placeholder="https://..."
                  className="border-border bg-surface-2 text-sm"
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-6 pt-2">
              <label className="flex items-center gap-2 text-xs text-text-primary cursor-pointer">
                <input
                  type="checkbox"
                  checked={published}
                  onChange={(e) => setPublished(e.target.checked)}
                  className="rounded border-border"
                />
                Published (Visible on site)
              </label>

              <label className="flex items-center gap-2 text-xs text-text-primary cursor-pointer">
                <input
                  type="checkbox"
                  checked={regOpen}
                  onChange={(e) => setRegOpen(e.target.checked)}
                  className="rounded border-border"
                />
                Registration Open
              </label>

              <label className="flex items-center gap-2 text-xs text-text-primary cursor-pointer">
                <input
                  type="checkbox"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                  className="rounded border-border"
                />
                Featured Event (Promoted on homepage hero)
              </label>
            </div>

            <DialogFooter className="pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpenModal(false)}
                className="border-border text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={saving}
                className="bg-accent text-xs text-surface-0 hover:bg-accent-dim"
              >
                {saving ? (
                  <>
                    <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> Saving...
                  </>
                ) : (
                  'Save Event'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
