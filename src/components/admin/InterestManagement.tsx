'use client'

import { useState } from 'react'
import { EventInterest, Event } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { toast } from 'sonner'
import { formatDate } from '@/lib/utils'
import {
  Search,
  Download,
  Users,
  Eye,
  Trash2,
  RefreshCw,
  Mail,
  Phone,
  Sparkles,
  ExternalLink,
} from 'lucide-react'

interface InterestManagementProps {
  initialInterests: EventInterest[]
  events: Event[]
}

export function InterestManagement({ initialInterests, events }: InterestManagementProps) {
  const [interests, setInterests] = useState<EventInterest[]>(initialInterests)
  const [search, setSearch] = useState('')
  const [selectedEventSlug, setSelectedEventSlug] = useState('all')
  const [refreshing, setRefreshing] = useState(false)
  const [selectedInterest, setSelectedInterest] = useState<EventInterest | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleRefresh = async () => {
    setRefreshing(true)
    try {
      const res = await fetch(`/api/admin/interests?slug=${selectedEventSlug}`)
      const data = await res.json()
      if (data.success) {
        setInterests(data.data)
        toast.success('Waitlist updated')
      }
    } catch {
      toast.error('Failed to refresh data')
    } finally {
      setRefreshing(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to remove this submission?')) return
    setIsDeleting(true)
    try {
      const res = await fetch(`/api/admin/interests?id=${id}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.success) {
        setInterests((prev) => prev.filter((i) => i.id !== id))
        if (selectedInterest?.id === id) setSelectedInterest(null)
        toast.success('Submission removed')
      } else {
        toast.error(data.error || 'Failed to remove')
      }
    } catch {
      toast.error('Network error')
    } finally {
      setIsDeleting(false)
    }
  }

  const exportCSV = () => {
    const headers = [
      'Event Slug',
      'Team Name',
      'Leader Name',
      'Leader Email',
      'Leader Phone',
      'Leader USN',
      'Member 2 Name',
      'Member 2 Email',
      'Member 2 USN',
      'Member 3 Name',
      'Member 3 Email',
      'Member 3 USN',
      'Notes',
      'Submitted At',
    ]

    const rows = filteredInterests.map((item) => {
      const m1 = item.members?.[0] || ({} as any)
      const m2 = item.members?.[1] || ({} as any)
      return [
        `"${item.event_slug}"`,
        `"${item.team_name.replace(/"/g, '""')}"`,
        `"${item.leader_name.replace(/"/g, '""')}"`,
        `"${item.leader_email}"`,
        `"${item.leader_phone}"`,
        `"${item.leader_usn}"`,
        `"${(m1.fullName || '').replace(/"/g, '""')}"`,
        `"${m1.email || ''}"`,
        `"${m1.rollNumber || ''}"`,
        `"${(m2.fullName || '').replace(/"/g, '""')}"`,
        `"${m2.email || ''}"`,
        `"${m2.rollNumber || ''}"`,
        `"${(item.notes || '').replace(/"/g, '""')}"`,
        `"${new Date(item.created_at).toLocaleString('en-IN')}"`,
      ].join(',')
    })

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `event_interests_${Date.now()}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const filteredInterests = interests.filter((item) => {
    if (selectedEventSlug !== 'all' && item.event_slug !== selectedEventSlug) return false
    if (!search.trim()) return true
    const q = search.toLowerCase()
    return (
      item.team_name.toLowerCase().includes(q) ||
      item.leader_name.toLowerCase().includes(q) ||
      item.leader_email.toLowerCase().includes(q) ||
      item.leader_usn.toLowerCase().includes(q) ||
      item.leader_phone.includes(q)
    )
  })

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-text-primary sm:text-3xl">
              Expressions of Interest
            </h1>
            <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-0.5 text-xs font-semibold text-amber-400">
              Waitlist
            </span>
          </div>
          <p className="mt-1 text-xs text-text-secondary">
            Manage teams who expressed interest while registrations are on hold
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
            className="border-border text-xs text-text-secondary hover:text-text-primary"
          >
            <RefreshCw className={`mr-1.5 h-3.5 w-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={exportCSV}
            disabled={filteredInterests.length === 0}
            className="border-border text-xs text-text-secondary hover:text-text-primary"
          >
            <Download className="mr-1.5 h-3.5 w-3.5" />
            Export CSV ({filteredInterests.length})
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="border-border bg-surface-1">
        <CardContent className="p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-text-tertiary" />
              <Input
                placeholder="Search by team, leader name, email, USN or phone..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 text-xs border-border bg-surface-2 text-text-primary"
              />
            </div>

            <select
              value={selectedEventSlug}
              onChange={(e) => setSelectedEventSlug(e.target.value)}
              className="rounded-md border border-border bg-surface-2 px-3 py-2 text-xs text-text-primary focus:outline-none focus:ring-1 focus:ring-accent"
            >
              <option value="all">All Events</option>
              <option value="arcade-c">Arcade.C</option>
              {events
                .filter((e) => e.slug !== 'arcade-c')
                .map((ev) => (
                  <option key={ev.id} value={ev.slug}>
                    {ev.title}
                  </option>
                ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Table / List */}
      <Card className="border-border bg-surface-1">
        <CardHeader className="pb-3 border-b border-border">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold text-text-primary">
              Submissions ({filteredInterests.length})
            </CardTitle>
            <span className="text-xs text-text-tertiary">
              Total interested teams: {interests.length}
            </span>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {filteredInterests.length === 0 ? (
            <div className="py-12 text-center">
              <Users className="mx-auto h-10 w-10 text-text-tertiary" />
              <p className="mt-2 text-sm font-medium text-text-secondary">No submissions found</p>
              <p className="text-xs text-text-tertiary">
                When students fill the &quot;Are you interested?&quot; form, their details appear here.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-border bg-surface-2/60 text-text-tertiary uppercase font-mono">
                  <tr>
                    <th className="px-4 py-3">Team Name</th>
                    <th className="px-4 py-3">Leader</th>
                    <th className="px-4 py-3">Leader USN</th>
                    <th className="px-4 py-3">Contact</th>
                    <th className="px-4 py-3">Members</th>
                    <th className="px-4 py-3">Event</th>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredInterests.map((item) => (
                    <tr key={item.id} className="hover:bg-surface-2/40 transition-colors">
                      <td className="px-4 py-3 font-semibold text-text-primary">
                        {item.team_name}
                      </td>
                      <td className="px-4 py-3 text-text-primary">
                        <div>{item.leader_name}</div>
                        <div className="text-[11px] text-text-tertiary">{item.leader_email}</div>
                      </td>
                      <td className="px-4 py-3 font-mono font-medium text-accent">
                        {item.leader_usn}
                      </td>
                      <td className="px-4 py-3 text-text-secondary">
                        <div className="flex items-center gap-1">
                          <Phone className="h-3 w-3 text-text-tertiary" />
                          <span>{item.leader_phone}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-text-secondary">
                        <span className="rounded bg-surface-2 px-2 py-0.5 text-[11px] font-medium text-text-primary">
                          {1 + (item.members?.length || 0)} members
                        </span>
                      </td>
                      <td className="px-4 py-3 text-text-tertiary font-mono">
                        {item.events?.title || item.event_slug}
                      </td>
                      <td className="px-4 py-3 text-text-tertiary whitespace-nowrap">
                        {formatDate(item.created_at)}
                      </td>
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedInterest(item)}
                            className="h-7 px-2 text-xs text-text-secondary hover:text-text-primary"
                          >
                            <Eye className="h-3.5 w-3.5 mr-1" />
                            View
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(item.id)}
                            className="h-7 px-2 text-xs text-text-tertiary hover:text-status-rejected"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Details Dialog */}
      <Dialog open={Boolean(selectedInterest)} onOpenChange={(open) => !open && setSelectedInterest(null)}>
        <DialogContent className="max-w-lg border-border bg-surface-1">
          {selectedInterest && (
            <>
              <DialogHeader>
                <DialogTitle className="text-lg font-bold text-text-primary flex items-center justify-between">
                  <span>{selectedInterest.team_name}</span>
                  <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-0.5 text-xs font-semibold text-amber-400">
                    Waitlist Response
                  </span>
                </DialogTitle>
                <div className="text-xs text-text-tertiary">
                  Submitted for <strong className="text-text-primary">{selectedInterest.events?.title || selectedInterest.event_slug}</strong> on{' '}
                  {new Date(selectedInterest.created_at).toLocaleString('en-IN')}
                </div>
              </DialogHeader>

              <div className="space-y-4 py-2 text-xs">
                {/* Team Leader Box */}
                <div className="rounded-lg border border-border bg-surface-2 p-3 space-y-2">
                  <div className="font-semibold text-text-primary uppercase tracking-wider text-[10px] text-accent">
                    Team Leader
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-text-secondary">
                    <div>
                      <span className="text-text-tertiary block">Name</span>
                      <strong className="text-text-primary">{selectedInterest.leader_name}</strong>
                    </div>
                    <div>
                      <span className="text-text-tertiary block">USN</span>
                      <strong className="text-accent font-mono">{selectedInterest.leader_usn}</strong>
                    </div>
                    <div>
                      <span className="text-text-tertiary block">Email</span>
                      <a href={`mailto:${selectedInterest.leader_email}`} className="text-accent underline">
                        {selectedInterest.leader_email}
                      </a>
                    </div>
                    <div>
                      <span className="text-text-tertiary block">Phone / WhatsApp</span>
                      <a href={`tel:${selectedInterest.leader_phone}`} className="text-text-primary">
                        {selectedInterest.leader_phone}
                      </a>
                    </div>
                  </div>
                </div>

                {/* Additional Members */}
                <div className="space-y-2">
                  <div className="font-semibold text-text-primary uppercase tracking-wider text-[10px] text-text-tertiary">
                    Additional Teammates ({selectedInterest.members?.length || 0})
                  </div>
                  {(!selectedInterest.members || selectedInterest.members.length === 0) ? (
                    <div className="text-text-tertiary italic">No additional members listed.</div>
                  ) : (
                    <div className="space-y-2">
                      {selectedInterest.members.map((m, idx) => (
                        <div key={idx} className="rounded-md border border-border bg-surface-2/40 p-2.5 flex justify-between items-center">
                          <div>
                            <div className="font-medium text-text-primary">{m.fullName}</div>
                            <div className="text-text-tertiary">{m.email} {m.college ? `• ${m.college}` : ''}</div>
                          </div>
                          {m.rollNumber && (
                            <span className="font-mono text-accent bg-accent/10 px-2 py-0.5 rounded text-[11px]">
                              {m.rollNumber}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Notes */}
                {selectedInterest.notes && (
                  <div className="rounded-md border border-border bg-surface-2 p-3 space-y-1">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-text-tertiary">
                      Student Notes / Comments
                    </span>
                    <p className="text-text-primary">{selectedInterest.notes}</p>
                  </div>
                )}
              </div>

              <DialogFooter className="flex justify-between sm:justify-between border-t border-border pt-3">
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(selectedInterest.id)}
                  disabled={isDeleting}
                  className="text-xs"
                >
                  Delete
                </Button>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const subject = encodeURIComponent(`Regarding your interest in ${selectedInterest.event_slug}`)
                      window.open(`mailto:${selectedInterest.leader_email}?subject=${subject}`)
                    }}
                    className="text-xs border-border"
                  >
                    <Mail className="h-3.5 w-3.5 mr-1.5" />
                    Email Leader
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => setSelectedInterest(null)}
                    className="text-xs bg-accent text-surface-0 hover:bg-accent-dim"
                  >
                    Close
                  </Button>
                </div>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
