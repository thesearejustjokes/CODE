'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Team, Event } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { toast } from 'sonner'
import { formatDate, formatCurrency } from '@/lib/utils'
import {
  Search,
  Download,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  FileCheck2,
  ExternalLink,
  Loader2,
  RefreshCw,
} from 'lucide-react'

interface RegistrationManagementProps {
  initialTeams: Team[]
  events: Event[]
  initialEventId?: string
  initialStatus?: string
}

export function RegistrationManagement({
  initialTeams,
  events,
  initialEventId = '',
  initialStatus = 'all',
}: RegistrationManagementProps) {
  const router = useRouter()
  const [teams, setTeams] = useState<Team[]>(initialTeams)
  const [search, setSearch] = useState('')
  const [selectedEventId, setSelectedEventId] = useState(initialEventId)
  const [selectedStatus, setSelectedStatus] = useState(initialStatus)
  const [refreshing, setRefreshing] = useState(false)

  // Review modal state
  const [reviewTeam, setReviewTeam] = useState<Team | null>(null)
  const [rejectionReason, setRejectionReason] = useState('')
  const [showRejectInput, setShowRejectInput] = useState(false)
  const [processingAction, setProcessingAction] = useState(false)

  const handleRefresh = async () => {
    setRefreshing(true)
    try {
      const params = new URLSearchParams()
      if (selectedEventId) params.set('eventId', selectedEventId)
      if (selectedStatus && selectedStatus !== 'all') params.set('status', selectedStatus)
      if (search.trim()) params.set('search', search.trim())

      const res = await fetch(`/api/admin/registrations?${params.toString()}`)
      const data = await res.json()
      if (res.ok && data.success) {
        setTeams(data.data)
      } else {
        toast.error(data.error || 'Failed to refresh')
      }
    } catch (err) {
      console.error(err)
    } finally {
      setRefreshing(false)
    }
  }

  // Filter teams locally for fast reactivity
  const filteredTeams = teams.filter((t) => {
    if (selectedEventId && t.event_id !== selectedEventId) return false
    if (selectedStatus !== 'all' && t.registration_status !== selectedStatus) return false
    if (search.trim()) {
      const q = search.toLowerCase()
      const matchName = t.team_name.toLowerCase().includes(q)
      const matchNum = t.team_number.toLowerCase().includes(q)
      const matchLeader = t.leader_name.toLowerCase().includes(q)
      const matchEmail = t.leader_email.toLowerCase().includes(q)
      if (!matchName && !matchNum && !matchLeader && !matchEmail) return false
    }
    return true
  })

  // Export to CSV
  const handleExportCsv = () => {
    if (filteredTeams.length === 0) {
      toast.error('No registrations to export.')
      return
    }

    const headers = [
      'Team Number',
      'Team Name',
      'Event',
      'Registration Status',
      'Leader Name',
      'Leader Email',
      'Leader Phone',
      'Members Count',
      'All Members',
      'Created At',
      'Public Reference',
    ]

    const rows = filteredTeams.map((t) => {
      const eventTitle = t.events?.title || 'Unknown Event'
      const membersList = (t.team_members || [])
        .map((m) => `${m.full_name} (${m.email})`)
        .join('; ')

      return [
        `"${t.team_number}"`,
        `"${t.team_name.replace(/"/g, '""')}"`,
        `"${eventTitle.replace(/"/g, '""')}"`,
        `"${t.registration_status}"`,
        `"${t.leader_name.replace(/"/g, '""')}"`,
        `"${t.leader_email}"`,
        `"${t.leader_phone}"`,
        (t.team_members?.length || 1).toString(),
        `"${membersList.replace(/"/g, '""')}"`,
        `"${formatDate(t.created_at)}"`,
        `"${t.public_reference}"`,
      ]
    })

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `code_club_registrations_${new Date().toISOString().slice(0, 10)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast.success('CSV exported successfully!')
  }

  // Handle Approve or Reject
  const handleReviewAction = async (action: 'approve' | 'reject') => {
    if (!reviewTeam) return
    setProcessingAction(true)

    try {
      const res = await fetch('/api/admin/registrations', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teamId: reviewTeam.id,
          action,
          rejectionReason: action === 'reject' ? rejectionReason : undefined,
        }),
      })

      const data = await res.json()
      if (!res.ok || !data.success) {
        toast.error(data.error || 'Failed to update registration status')
        setProcessingAction(false)
        return
      }

      toast.success(action === 'approve' ? 'Payment approved and registration confirmed!' : 'Payment rejected.')
      setReviewTeam(null)
      setShowRejectInput(false)
      setRejectionReason('')
      handleRefresh()
      router.refresh()
    } catch (err) {
      console.error(err)
      toast.error('Network error occurred')
    } finally {
      setProcessingAction(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary">
            Registration Management
          </h1>
          <p className="mt-1 text-xs text-text-secondary">
            View team rosters, verify payment receipts, and export participant data
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
            className="border-border text-xs"
          >
            <RefreshCw className={`mr-1.5 h-3.5 w-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCsv}
            className="border-border text-xs hover:border-accent hover:text-accent"
          >
            <Download className="mr-1.5 h-3.5 w-3.5" /> Export CSV
          </Button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <Card className="border-border bg-surface-1">
        <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-text-tertiary" />
            <Input
              placeholder="Search by team, leader name, email, or CODE ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9 border-border bg-surface-2 pl-9 text-xs"
            />
          </div>

          <div className="flex gap-2">
            <select
              value={selectedEventId}
              onChange={(e) => setSelectedEventId(e.target.value)}
              className="h-9 rounded-md border border-border bg-surface-2 px-3 text-xs text-text-primary focus:outline-none focus:ring-1 focus:ring-accent"
            >
              <option value="">All Events</option>
              {events.map((ev) => (
                <option key={ev.id} value={ev.id}>
                  {ev.title}
                </option>
              ))}
            </select>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="h-9 rounded-md border border-border bg-surface-2 px-3 text-xs text-text-primary focus:outline-none focus:ring-1 focus:ring-accent"
            >
              <option value="all">All Statuses</option>
              <option value="payment_review">Awaiting Review</option>
              <option value="confirmed">Confirmed</option>
              <option value="pending_payment">Pending Payment</option>
              <option value="rejected">Rejected</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Table of Teams */}
      <Card className="border-border bg-surface-1">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-border bg-surface-2/50 text-[11px] uppercase tracking-wider text-text-secondary">
                <tr>
                  <th className="px-4 py-3">Team # / Name</th>
                  <th className="px-4 py-3">Event</th>
                  <th className="px-4 py-3">Leader</th>
                  <th className="px-4 py-3">Members</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredTeams.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-text-tertiary">
                      No registrations match your search or filter.
                    </td>
                  </tr>
                ) : (
                  filteredTeams.map((team) => {
                    const latestPayment = team.payments && team.payments.length > 0
                      ? team.payments[team.payments.length - 1]
                      : null

                    return (
                      <tr key={team.id} className="hover:bg-surface-2/30">
                        <td className="px-4 py-3.5">
                          <p className="font-mono font-semibold text-accent">{team.team_number}</p>
                          <p className="font-medium text-text-primary mt-0.5">{team.team_name}</p>
                        </td>

                        <td className="px-4 py-3.5">
                          <p className="font-medium text-text-primary">{team.events?.title || '—'}</p>
                          <p className="text-[11px] text-text-tertiary">
                            {formatDate(team.created_at)}
                          </p>
                        </td>

                        <td className="px-4 py-3.5">
                          <p className="font-medium text-text-primary">{team.leader_name}</p>
                          <p className="text-text-secondary">{team.leader_email}</p>
                          <p className="text-text-tertiary font-mono">{team.leader_phone}</p>
                        </td>

                        <td className="px-4 py-3.5">
                          <span className="font-medium text-text-primary">
                            {team.team_members?.length || 1}
                          </span>
                        </td>

                        <td className="px-4 py-3.5">
                          {team.registration_status === 'confirmed' && (
                            <span className="inline-flex items-center gap-1 rounded bg-status-confirmed/10 px-2 py-0.5 text-[11px] font-semibold text-status-confirmed">
                              <CheckCircle2 className="h-3 w-3" /> Confirmed
                            </span>
                          )}
                          {team.registration_status === 'payment_review' && (
                            <span className="inline-flex items-center gap-1 rounded bg-status-review/10 px-2 py-0.5 text-[11px] font-semibold text-status-review">
                              <Clock className="h-3 w-3" /> Awaiting Review
                            </span>
                          )}
                          {team.registration_status === 'pending_payment' && (
                            <span className="inline-flex items-center gap-1 rounded bg-status-pending/10 px-2 py-0.5 text-[11px] font-medium text-status-pending">
                              <Clock className="h-3 w-3" /> Pending Payment
                            </span>
                          )}
                          {team.registration_status === 'rejected' && (
                            <span className="inline-flex items-center gap-1 rounded bg-status-rejected/10 px-2 py-0.5 text-[11px] font-medium text-status-rejected">
                              <XCircle className="h-3 w-3" /> Rejected
                            </span>
                          )}
                        </td>

                        <td className="px-4 py-3.5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {team.registration_status === 'payment_review' ? (
                              <Button
                                size="sm"
                                onClick={() => {
                                  setReviewTeam(team)
                                  setShowRejectInput(false)
                                  setRejectionReason('')
                                }}
                                className="h-7 bg-accent px-2.5 text-[11px] text-surface-0 hover:bg-accent-dim"
                              >
                                <FileCheck2 className="mr-1 h-3 w-3" /> Review
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setReviewTeam(team)
                                  setShowRejectInput(false)
                                  setRejectionReason('')
                                }}
                                className="h-7 border-border px-2 text-[11px] text-text-secondary hover:text-text-primary"
                              >
                                Details
                              </Button>
                            )}

                            <a
                              href={`/registration/${team.public_reference}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="rounded p-1 text-text-tertiary hover:bg-surface-2 hover:text-text-primary"
                              title="Public Status Page"
                            >
                              <ExternalLink className="h-3.5 w-3.5" />
                            </a>
                          </div>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Review Modal Dialog */}
      <Dialog open={!!reviewTeam} onOpenChange={(open) => !open && setReviewTeam(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto border-border bg-surface-1 sm:max-w-xl">
          <DialogHeader>
            <DialogTitle className="text-lg text-text-primary">
              Registration &amp; Payment Review
            </DialogTitle>
          </DialogHeader>

          {reviewTeam && (
            <div className="space-y-4 py-2 text-xs">
              {/* Team Info */}
              <div className="rounded border border-border bg-surface-2/40 p-3 space-y-1">
                <div className="flex justify-between font-medium">
                  <span className="text-text-secondary">Team Name:</span>
                  <span className="text-text-primary">{reviewTeam.team_name} ({reviewTeam.team_number})</span>
                </div>
                <div className="flex justify-between font-medium">
                  <span className="text-text-secondary">Event:</span>
                  <span className="text-text-primary">{reviewTeam.events?.title}</span>
                </div>
                <div className="flex justify-between font-medium">
                  <span className="text-text-secondary">Leader:</span>
                  <span className="text-text-primary">{reviewTeam.leader_name} ({reviewTeam.leader_email}, {reviewTeam.leader_phone})</span>
                </div>
              </div>

              {/* Members */}
              {reviewTeam.team_members && reviewTeam.team_members.length > 0 && (
                <div>
                  <h4 className="font-semibold uppercase tracking-wider text-text-tertiary text-[10px] mb-1.5">
                    Roster ({reviewTeam.team_members.length} members)
                  </h4>
                  <div className="rounded border border-border divide-y divide-border">
                    {reviewTeam.team_members.map((m, idx) => (
                      <div key={idx} className="p-2 flex justify-between">
                        <span className="font-medium text-text-primary">{m.full_name}</span>
                        <span className="text-text-secondary font-mono">{m.email}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Payment Receipt Review */}
              {reviewTeam.payments && reviewTeam.payments.length > 0 && (
                <div className="rounded border border-border bg-surface-2/40 p-3 space-y-2">
                  <h4 className="font-semibold uppercase tracking-wider text-accent text-[10px]">
                    Payment Submission
                  </h4>
                  {reviewTeam.payments.map((p, idx) => (
                    <div key={idx} className="space-y-1">
                      <p>
                        <span className="text-text-secondary">UTR / Ref:</span>{' '}
                        <span className="font-mono font-semibold text-text-primary">{p.transaction_reference || 'N/A'}</span>
                      </p>
                      <p>
                        <span className="text-text-secondary">Method:</span> {p.method} &bull;{' '}
                        <span className="text-text-secondary">Amount:</span> {formatCurrency(p.amount)}
                      </p>
                      <p>
                        <span className="text-text-secondary">Receipt File:</span>{' '}
                        <span className="font-mono text-text-tertiary">{p.receipt_path || 'None uploaded'}</span>
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {/* Rejection input */}
              {showRejectInput && (
                <div className="space-y-1.5 pt-2">
                  <label className="text-text-secondary font-medium">Rejection Reason</label>
                  <Input
                    placeholder="e.g. UTR not found on statement or amount mismatch"
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    className="border-border bg-surface-2 text-xs"
                  />
                </div>
              )}
            </div>
          )}

          <DialogFooter className="flex justify-between gap-2 border-t border-border pt-4">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setReviewTeam(null)}
              className="border-border text-xs"
            >
              Close
            </Button>

            <div className="flex gap-2">
              {!showRejectInput ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowRejectInput(true)}
                  className="border-status-rejected/40 text-status-rejected text-xs hover:bg-status-rejected/10"
                >
                  <XCircle className="mr-1 h-3.5 w-3.5" /> Reject
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  disabled={processingAction}
                  onClick={() => handleReviewAction('reject')}
                  className="text-xs"
                >
                  {processingAction ? <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" /> : null}
                  Confirm Rejection
                </Button>
              )}

              <Button
                type="button"
                size="sm"
                disabled={processingAction}
                onClick={() => handleReviewAction('approve')}
                className="bg-accent text-surface-0 hover:bg-accent-dim text-xs"
              >
                {processingAction ? <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="mr-1 h-3.5 w-3.5" />}
                Approve Payment
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
