'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Team, Event } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
  Copy,
  Check,
  FileText,
  Image as ImageIcon,
  Pencil,
  Trash2,
  AlertTriangle,
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
  const [copiedUtr, setCopiedUtr] = useState<string | null>(null)

  // Edit modal state
  const [editingTeam, setEditingTeam] = useState<Team | null>(null)
  const [editTeamName, setEditTeamName] = useState('')
  const [editStatus, setEditStatus] = useState('')
  const [editLeaderName, setEditLeaderName] = useState('')
  const [editLeaderEmail, setEditLeaderEmail] = useState('')
  const [editLeaderPhone, setEditLeaderPhone] = useState('')
  const [editMembers, setEditMembers] = useState<
    Array<{ id: string; full_name: string; email: string; college: string; roll_number: string }>
  >([])
  const [savingEdit, setSavingEdit] = useState(false)

  // Delete modal state
  const [deletingTeam, setDeletingTeam] = useState<Team | null>(null)
  const [deletingInProgress, setDeletingInProgress] = useState(false)

  const handleCopyUtr = (utr: string) => {
    navigator.clipboard.writeText(utr)
    setCopiedUtr(utr)
    toast.success('UTR copied to clipboard!')
    setTimeout(() => setCopiedUtr(null), 2000)
  }

  const openEditModal = (team: Team) => {
    setEditingTeam(team)
    setEditTeamName(team.team_name)
    setEditStatus(team.registration_status)
    setEditLeaderName(team.leader_name)
    setEditLeaderEmail(team.leader_email)
    setEditLeaderPhone(team.leader_phone)
    setEditMembers(
      (team.team_members || []).map((m) => ({
        id: m.id,
        full_name: m.full_name || '',
        email: m.email || '',
        college: m.college || '',
        roll_number: m.roll_number || '', // USN
      }))
    )
  }

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingTeam) return
    setSavingEdit(true)

    try {
      const res = await fetch('/api/admin/registrations', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teamId: editingTeam.id,
          action: 'update',
          teamName: editTeamName,
          leaderName: editLeaderName,
          leaderEmail: editLeaderEmail,
          leaderPhone: editLeaderPhone,
          registrationStatus: editStatus,
          members: editMembers,
        }),
      })

      const data = await res.json()
      if (!res.ok || !data.success) {
        toast.error(data.error || 'Failed to update team details')
        return
      }

      toast.success('Team details updated successfully!')
      setEditingTeam(null)
      handleRefresh()
      router.refresh()
    } catch (err) {
      console.error(err)
      toast.error('Network error updating team details')
    } finally {
      setSavingEdit(false)
    }
  }

  const handleDeleteTeam = async () => {
    if (!deletingTeam) return
    setDeletingInProgress(true)

    try {
      const res = await fetch(`/api/admin/registrations?teamId=${deletingTeam.id}`, {
        method: 'DELETE',
      })

      const data = await res.json()
      if (!res.ok || !data.success) {
        toast.error(data.error || 'Failed to delete team')
        return
      }

      toast.success(`Registration for ${deletingTeam.team_name} permanently removed`)
      setTeams((prev) => prev.filter((t) => t.id !== deletingTeam.id))
      setDeletingTeam(null)
      if (reviewTeam?.id === deletingTeam.id) {
        setReviewTeam(null)
      }
      router.refresh()
    } catch (err) {
      console.error(err)
      toast.error('Network error deleting registration')
    } finally {
      setDeletingInProgress(false)
    }
  }

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

                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openEditModal(team)}
                              className="h-7 w-7 p-0 border-border text-text-tertiary hover:text-accent hover:border-accent"
                              title="Edit Team, Members & USN"
                            >
                              <Pencil className="h-3 w-3" />
                            </Button>

                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setDeletingTeam(team)}
                              className="h-7 w-7 p-0 border-border text-text-tertiary hover:text-status-rejected hover:border-status-rejected/40 hover:bg-status-rejected/10"
                              title="Delete Team / Fraudulent Attempt"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>

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
                  <div className="flex items-center justify-between mb-1.5">
                    <h4 className="font-semibold uppercase tracking-wider text-text-tertiary text-[10px]">
                      Roster ({reviewTeam.team_members.length} members)
                    </h4>
                    <button
                      type="button"
                      onClick={() => {
                        const t = reviewTeam
                        setReviewTeam(null)
                        openEditModal(t)
                      }}
                      className="text-[11px] text-accent hover:underline flex items-center gap-1 font-medium"
                    >
                      <Pencil className="h-3 w-3" /> Edit USN &amp; Info
                    </button>
                  </div>
                  <div className="rounded border border-border divide-y divide-border">
                    {reviewTeam.team_members.map((m, idx) => (
                      <div key={idx} className="p-2.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5">
                        <div>
                          <span className="font-medium text-text-primary text-xs">{m.full_name}</span>
                          {m.college && (
                            <span className="text-[11px] text-text-tertiary ml-2">({m.college})</span>
                          )}
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          {m.roll_number ? (
                            <span className="font-mono text-[11px] text-accent bg-surface-1 px-1.5 py-0.5 rounded border border-border font-medium">
                              USN: {m.roll_number}
                            </span>
                          ) : (
                            <span className="text-[10px] text-text-tertiary italic">No USN</span>
                          )}
                          <span className="text-text-secondary font-mono text-xs">{m.email}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Payment Receipt Review */}
              {reviewTeam.payments && reviewTeam.payments.length > 0 && (
                <div className="rounded border border-border bg-surface-2/40 p-3 space-y-3">
                  <h4 className="font-semibold uppercase tracking-wider text-accent text-[10px]">
                    Payment Submission &amp; Verification
                  </h4>
                  {reviewTeam.payments.map((p, idx) => {
                    const isImage = p.receipt_path && /\.(png|jpe?g|webp)$/i.test(p.receipt_path)
                    const isPdf = p.receipt_path && /\.pdf$/i.test(p.receipt_path)
                    const isPendingBucket = p.receipt_path && p.receipt_path.startsWith('storage_pending/')
                    const receiptUrl = p.receipt_path
                      ? `/api/admin/receipts?path=${encodeURIComponent(p.receipt_path)}`
                      : null

                    return (
                      <div key={idx} className="space-y-2 border-t border-border/60 pt-2 first:border-0 first:pt-0">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="text-text-secondary">UTR / Ref:</span>{' '}
                            <span className="font-mono font-bold text-text-primary text-xs bg-surface-1 px-1.5 py-0.5 rounded border border-border">
                              {p.transaction_reference || 'N/A'}
                            </span>
                            {p.transaction_reference && (
                              <button
                                type="button"
                                onClick={() => handleCopyUtr(p.transaction_reference!)}
                                className="text-text-tertiary hover:text-accent p-0.5 transition-colors"
                                title="Copy UTR to clipboard"
                              >
                                {copiedUtr === p.transaction_reference ? (
                                  <Check className="h-3.5 w-3.5 text-status-confirmed" />
                                ) : (
                                  <Copy className="h-3.5 w-3.5" />
                                )}
                              </button>
                            )}
                          </div>
                          <span className="text-[11px] capitalize text-text-secondary">
                            {p.method.replace('_', ' ')} &bull;{' '}
                            <strong className="text-text-primary">{formatCurrency(p.amount)}</strong>
                          </span>
                        </div>

                        {/* Receipt display */}
                        {receiptUrl && !isPendingBucket && (
                          <div className="space-y-2 pt-1">
                            <div className="flex items-center justify-between">
                              <span className="text-text-secondary text-[11px] font-medium flex items-center gap-1.5">
                                {isImage ? (
                                  <ImageIcon className="h-3.5 w-3.5 text-accent" />
                                ) : (
                                  <FileText className="h-3.5 w-3.5 text-accent" />
                                )}
                                Proof of Payment:
                              </span>
                              <a
                                href={receiptUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-[11px] text-accent hover:underline font-semibold"
                              >
                                <ExternalLink className="h-3 w-3" /> Open in New Tab
                              </a>
                            </div>

                            {isImage && (
                              <div className="relative overflow-hidden rounded-md border border-border bg-black/40 p-2 flex items-center justify-center">
                                <img
                                  src={receiptUrl}
                                  alt="Payment Proof Screenshot"
                                  className="max-h-72 w-auto max-w-full rounded object-contain shadow-sm"
                                  onError={(e) => {
                                    const target = e.target as HTMLElement
                                    target.style.display = 'none'
                                  }}
                                />
                              </div>
                            )}

                            {isPdf && (
                              <div className="rounded border border-border bg-surface-2 p-2.5 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <FileText className="h-4 w-4 text-accent" />
                                  <span className="text-xs text-text-primary font-medium">
                                    PDF Document Attached
                                  </span>
                                </div>
                                <a
                                  href={receiptUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 text-xs text-accent hover:underline font-medium"
                                >
                                  <ExternalLink className="h-3.5 w-3.5" /> View PDF
                                </a>
                              </div>
                            )}
                          </div>
                        )}

                        {isPendingBucket && (
                          <p className="rounded bg-status-review/10 border border-status-review/30 p-2 text-[11px] text-status-review">
                            Note: Receipt proof was uploaded prior to storage bucket creation. Verify transfer using the UTR number above.
                          </p>
                        )}

                        {!p.receipt_path && (
                          <p className="text-[11px] text-text-tertiary italic">No receipt file uploaded.</p>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}

              {/* Rejection input */}
              {showRejectInput && (
                <div className="space-y-2 pt-2 border-t border-border">
                  <div className="flex items-center justify-between">
                    <label className="text-text-secondary font-medium">Rejection Reason</label>
                    <span className="text-[10px] text-text-tertiary">Select a preset or type below:</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      'UTR not found in bank statement',
                      'Incorrect fee amount transferred',
                      'Receipt screenshot is unreadable / blurry',
                    ].map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setRejectionReason(preset)}
                        className="rounded border border-border bg-surface-2 px-2 py-0.5 text-[10px] text-text-secondary hover:border-accent hover:text-text-primary transition-colors"
                      >
                        {preset}
                      </button>
                    ))}
                  </div>
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

          <DialogFooter className="flex flex-wrap justify-between gap-2 border-t border-border pt-4">
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setReviewTeam(null)}
                className="border-border text-xs"
              >
                Close
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  if (reviewTeam) {
                    const t = reviewTeam
                    setReviewTeam(null)
                    openEditModal(t)
                  }
                }}
                className="border-border text-xs"
              >
                <Pencil className="mr-1 h-3.5 w-3.5 text-accent" /> Edit Info
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setDeletingTeam(reviewTeam)}
                className="border-status-rejected/40 text-status-rejected text-xs hover:bg-status-rejected/10"
              >
                <Trash2 className="mr-1 h-3.5 w-3.5" /> Delete Attempt
              </Button>
            </div>

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

      {/* Edit Team & Members Dialog */}
      <Dialog open={!!editingTeam} onOpenChange={(open) => !open && setEditingTeam(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto border-border bg-surface-1 sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg text-text-primary flex items-center gap-2">
              <Pencil className="h-4 w-4 text-accent" /> Edit Team — {editingTeam?.team_number}
            </DialogTitle>
          </DialogHeader>

          {editingTeam && (
            <form onSubmit={handleSaveEdit} className="space-y-4 py-2 text-xs">
              {/* Primary Team Details */}
              <div className="rounded-lg border border-border bg-surface-2/40 p-4 space-y-3">
                <h4 className="font-semibold uppercase tracking-wider text-accent text-[11px]">
                  Team Information
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs text-text-secondary">Team Name</Label>
                    <Input
                      value={editTeamName}
                      onChange={(e) => setEditTeamName(e.target.value)}
                      required
                      className="border-border bg-surface-2 text-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs text-text-secondary">Registration Status</Label>
                    <select
                      value={editStatus}
                      onChange={(e) => setEditStatus(e.target.value)}
                      className="h-9 w-full rounded-md border border-border bg-surface-2 px-3 py-1 text-xs text-text-primary focus:outline-none focus:ring-1 focus:ring-accent"
                    >
                      <option value="confirmed">Confirmed</option>
                      <option value="payment_review">Awaiting Payment Review</option>
                      <option value="pending_payment">Pending Payment</option>
                      <option value="rejected">Rejected</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                  <div className="space-y-1">
                    <Label className="text-xs text-text-secondary">Leader Name</Label>
                    <Input
                      value={editLeaderName}
                      onChange={(e) => setEditLeaderName(e.target.value)}
                      required
                      className="border-border bg-surface-2 text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-text-secondary">Leader Email</Label>
                    <Input
                      type="email"
                      value={editLeaderEmail}
                      onChange={(e) => setEditLeaderEmail(e.target.value)}
                      required
                      className="border-border bg-surface-2 text-xs font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-text-secondary">Leader Phone</Label>
                    <Input
                      value={editLeaderPhone}
                      onChange={(e) => setEditLeaderPhone(e.target.value)}
                      className="border-border bg-surface-2 text-xs font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Roster & USN / Roll Numbers */}
              <div className="rounded-lg border border-border bg-surface-2/40 p-4 space-y-3">
                <h4 className="font-semibold uppercase tracking-wider text-accent text-[11px]">
                  Team Members &amp; USN ({editMembers.length})
                </h4>

                <div className="space-y-3">
                  {editMembers.map((m, idx) => (
                    <div
                      key={m.id || idx}
                      className="rounded border border-border bg-surface-1/60 p-3 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-text-primary text-[11px]">
                          Member #{idx + 1} {idx === 0 ? '(Leader)' : ''}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <Label className="text-[10px] text-text-tertiary">Full Name</Label>
                          <Input
                            value={m.full_name}
                            onChange={(e) => {
                              const updated = [...editMembers]
                              updated[idx].full_name = e.target.value
                              setEditMembers(updated)
                            }}
                            required
                            className="h-8 border-border bg-surface-2 text-xs"
                          />
                        </div>

                        <div className="space-y-1">
                          <Label className="text-[10px] text-text-tertiary">Email Address</Label>
                          <Input
                            type="email"
                            value={m.email}
                            onChange={(e) => {
                              const updated = [...editMembers]
                              updated[idx].email = e.target.value
                              setEditMembers(updated)
                            }}
                            required
                            className="h-8 border-border bg-surface-2 text-xs font-mono"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <Label className="text-[10px] text-accent font-semibold">
                            USN / University Seat No.
                          </Label>
                          <Input
                            placeholder="e.g. 1RN23CS001"
                            value={m.roll_number}
                            onChange={(e) => {
                              const updated = [...editMembers]
                              updated[idx].roll_number = e.target.value
                              setEditMembers(updated)
                            }}
                            className="h-8 border-border bg-surface-2 font-mono text-xs uppercase"
                          />
                        </div>

                        <div className="space-y-1">
                          <Label className="text-[10px] text-text-tertiary">College / Department</Label>
                          <Input
                            placeholder="e.g. RNSIT"
                            value={m.college}
                            onChange={(e) => {
                              const updated = [...editMembers]
                              updated[idx].college = e.target.value
                              setEditMembers(updated)
                            }}
                            className="h-8 border-border bg-surface-2 text-xs"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <DialogFooter className="flex justify-between gap-2 border-t border-border pt-4">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setEditingTeam(null)}
                  className="border-border text-xs"
                >
                  Cancel
                </Button>

                <Button
                  type="submit"
                  size="sm"
                  disabled={savingEdit}
                  className="bg-accent text-surface-0 hover:bg-accent-dim text-xs font-medium"
                >
                  {savingEdit ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : null}
                  Save Team Changes
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete / Fraudulent Removal Confirmation Dialog */}
      <Dialog open={!!deletingTeam} onOpenChange={(open) => !open && setDeletingTeam(null)}>
        <DialogContent className="border-border bg-surface-1 sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base text-status-rejected flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-status-rejected shrink-0" /> Confirm Permanent Removal
            </DialogTitle>
          </DialogHeader>

          {deletingTeam && (
            <div className="space-y-3 py-2 text-xs text-text-secondary">
              <p>
                Are you sure you want to permanently delete registration for:
              </p>
              <div className="rounded border border-border bg-surface-2 p-3 space-y-1">
                <p className="font-semibold text-text-primary text-sm">
                  {deletingTeam.team_name}
                </p>
                <p className="font-mono text-accent text-xs">
                  {deletingTeam.team_number}
                </p>
                <p className="text-text-tertiary text-[11px]">
                  Leader: {deletingTeam.leader_name} ({deletingTeam.leader_email})
                </p>
              </div>
              <p className="text-status-rejected font-medium">
                This will delete the team, its members roster, and all associated payment receipts from Supabase storage. Use this to permanently eliminate fraudulent submissions or uncompleted pending registrations.
              </p>
            </div>
          )}

          <DialogFooter className="flex justify-between gap-2 border-t border-border pt-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={deletingInProgress}
              onClick={() => setDeletingTeam(null)}
              className="border-border text-xs"
            >
              Cancel
            </Button>

            <Button
              type="button"
              variant="destructive"
              size="sm"
              disabled={deletingInProgress}
              onClick={handleDeleteTeam}
              className="text-xs font-medium"
            >
              {deletingInProgress ? (
                <>
                  <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="mr-1.5 h-3.5 w-3.5" /> Delete Permanently
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
