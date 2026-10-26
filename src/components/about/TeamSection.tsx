'use client'

import { useState, useMemo } from 'react'

export interface TeamMembers {
  name: string
  role: string
  department: 'core' | 'technical' | 'events' | 'dmc'
  badgeId: string
}

const TEAM_MEMBERS: TeamMembers[] = [
  // Core Leadership
  { name: 'AKSHIT', role: 'FOUNDER', department: 'core', badgeId: 'CD-26-030' },
  { name: 'YASH', role: 'PRESIDENT', department: 'core', badgeId: 'CD-26-008' },
  { name: 'SANCHITA KULKARNI', role: 'VICE PRESIDENT', department: 'core', badgeId: 'CD-26-007' },
  { name: 'AYUSH SINGH', role: 'SECRETARY', department: 'core', badgeId: 'CD-26-029' },
  { name: 'PRIYANSHU', role: 'TREASURER', department: 'core', badgeId: 'CD-26-013' },

  // Department Heads
  { name: 'ABHINAV PANDEY', role: 'TECHNICAL HEAD', department: 'core', badgeId: 'CD-26-011' },
  { name: 'SAMBHAV GUPTA', role: 'DESIGN HEAD', department: 'core', badgeId: 'CD-26-010' },
  { name: 'SHREYA GOUR', role: 'EDITORIAL HEAD', department: 'core', badgeId: 'CD-26-009' },
  { name: 'UTKARSH TIWARI', role: 'PR HEAD', department: 'core', badgeId: 'CD-26-006' },
  //{ name: 'SHIKHA', role: 'R & D HEAD', department: 'core', badgeId: 'CD-26-012' },
  { name: 'SOURAV', role: 'OPERATION HEAD', department: 'core', badgeId: 'CD-26-014' },
  { name: 'SUMUKH BHAT', role: 'DMC HEAD', department: 'core', badgeId: 'CD-26-001' },

  // Technical
  { name: 'MANASVI L G', role: 'TECHNICAL', department: 'technical', badgeId: 'CD-26-015' },
  { name: 'P APARAJITHA', role: 'TECHNICAL', department: 'technical', badgeId: 'CD-26-016' },
  { name: 'DEV SUNDAR PATHAK', role: 'TECHNICAL', department: 'technical', badgeId: 'CD-26-017' },
  { name: 'SAHARIKA S M', role: 'TECHNICAL', department: 'technical', badgeId: 'CD-26-018' },
  { name: 'ABISHEK LOCHAN K', role: 'TECHNICAL', department: 'technical', badgeId: 'CD-26-019' },
  { name: 'ABHISHEK HEGDE', role: 'TECHNICAL', department: 'technical', badgeId: 'CD-26-020' },
  { name: 'SINCHANA BL', role: 'TECHNICAL', department: 'technical', badgeId: 'CD-26-021' },
  { name: 'ABDULLAH HUZAIFA', role: 'TECHNICAL', department: 'technical', badgeId: 'CD-26-022' },

  // Events
  { name: 'ASHISH KUMAR', role: 'EVENTS', department: 'events', badgeId: 'CD-26-023' },
  { name: 'ABHIJEET KUMAR', role: 'EVENTS', department: 'events', badgeId: 'CD-26-024' },
  { name: 'NEHA BHAT', role: 'EVENTS', department: 'events', badgeId: 'CD-26-025' },
  { name: 'KARAN URS K', role: 'EVENTS', department: 'events', badgeId: 'CD-26-026' },
  { name: 'NIRAJ SHETTY', role: 'EVENTS', department: 'events', badgeId: 'CD-26-027' },
  { name: 'KARTHIKEYAN R', role: 'EVENTS', department: 'events', badgeId: 'CD-26-028' },

  // DMC
  { name: 'VARADENDRA KALAKERI', role: 'DMC', department: 'dmc', badgeId: 'CD-26-002' },
  { name: 'SUMUKH S', role: 'DMC', department: 'dmc', badgeId: 'CD-26-003' },
  { name: 'VEERESH K M', role: 'DMC', department: 'dmc', badgeId: 'CD-26-004' },
  { name: 'JEYAVARDHAN', role: 'DMC', department: 'dmc', badgeId: 'CD-26-005' },
]

const DEPARTMENTS = [
  { id: 'all', label: 'All Members' },
  { id: 'core', label: 'Core' },
  //{ id: 'head', label: 'Heads' },
  { id: 'technical', label: 'Technical' },
  { id: 'events', label: 'Events' },
  { id: 'dmc', label: 'DMC' },
] as const

type DeptFilter = (typeof DEPARTMENTS)[number]['id']

// Decorative SVG Barcode inspired by the ID card header
function BarcodeGraphic() {
  return (
    <svg
      className="h-6 w-36 opacity-75"
      viewBox="0 0 144 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <rect x="0" y="0" width="3" height="24" />
      <rect x="5" y="0" width="1" height="24" />
      <rect x="8" y="0" width="2" height="24" />
      <rect x="12" y="0" width="4" height="24" />
      <rect x="18" y="0" width="1" height="24" />
      <rect x="21" y="0" width="3" height="24" />
      <rect x="26" y="0" width="2" height="24" />
      <rect x="30" y="0" width="1" height="24" />
      <rect x="33" y="0" width="5" height="24" />
      <rect x="40" y="0" width="2" height="24" />
      <rect x="44" y="0" width="1" height="24" />
      <rect x="47" y="0" width="3" height="24" />
      <rect x="52" y="0" width="4" height="24" />
      <rect x="58" y="0" width="1" height="24" />
      <rect x="61" y="0" width="2" height="24" />
      <rect x="65" y="0" width="3" height="24" />
      <rect x="70" y="0" width="1" height="24" />
      <rect x="73" y="0" width="5" height="24" />
      <rect x="80" y="0" width="2" height="24" />
      <rect x="84" y="0" width="3" height="24" />
      <rect x="89" y="0" width="1" height="24" />
      <rect x="92" y="0" width="4" height="24" />
      <rect x="98" y="0" width="2" height="24" />
      <rect x="102" y="0" width="1" height="24" />
      <rect x="105" y="0" width="3" height="24" />
      <rect x="110" y="0" width="5" height="24" />
      <rect x="117" y="0" width="2" height="24" />
      <rect x="121" y="0" width="1" height="24" />
      <rect x="124" y="0" width="3" height="24" />
      <rect x="129" y="0" width="2" height="24" />
      <rect x="133" y="0" width="4" height="24" />
      <rect x="139" y="0" width="2" height="24" />
      <rect x="142" y="0" width="2" height="24" />
    </svg>
  )
}

export function TeamSection() {
  const [selectedDept, setSelectedDept] = useState<DeptFilter>('all')
  const [searchQuery, setSearchQuery] = useState('')

  const filteredMembers = useMemo(() => {
    return TEAM_MEMBERS.filter((member) => {
      const matchesDept =
        selectedDept === 'all' ? true : member.department === selectedDept
      const matchesQuery =
        searchQuery.trim() === '' ||
        member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.role.toLowerCase().includes(searchQuery.toLowerCase())
      return matchesDept && matchesQuery
    })
  }, [selectedDept, searchQuery])

  return (
    <div className="space-y-10">
      {/* Filter and search controls */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Department tabs */}
        <div className="flex flex-wrap items-center gap-2">
          {DEPARTMENTS.map((dept) => {
            const count =
              dept.id === 'all'
                ? TEAM_MEMBERS.length
                : TEAM_MEMBERS.filter((m) => m.department === dept.id).length
            const isActive = selectedDept === dept.id

            return (
              <button
                key={dept.id}
                onClick={() => setSelectedDept(dept.id)}
                className={`inline-flex items-center gap-1.5 rounded-md px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider transition-all duration-200 ${isActive
                  ? 'bg-accent text-surface-0 shadow-sm'
                  : 'border border-border bg-surface-2 text-text-secondary hover:border-accent/40 hover:text-text-primary'
                  }`}
              >
                <span>{dept.label}</span>
                <span
                  className={`rounded-full px-1.5 py-0.2 text-[10px] ${isActive
                    ? 'bg-black/20 text-surface-0'
                    : 'bg-surface-3 text-text-tertiary'
                    }`}
                >
                  {count}
                </span>
              </button>
            )
          })}
        </div>

        {/* Quick search input */}
        <div className="relative w-full sm:w-64">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search member or role..."
            className="w-full rounded-md border border-border bg-surface-2 px-3.5 py-2 text-xs text-text-primary placeholder:text-text-tertiary focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-text-tertiary hover:text-text-primary"
              aria-label="Clear search"
            >
              &times;
            </button>
          )}
        </div>
      </div>

      {/* Grid of ID Badge style cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filteredMembers.map((member) => (
          <div
            key={member.name}
            className="group relative flex flex-col justify-between overflow-hidden rounded-xl border border-border bg-surface-1 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-accent/40 hover:shadow-accent"
          >
            {/* Lanyard punch-hole notch */}
            <div
              className="mx-auto mb-4 h-1.5 w-10 rounded-full bg-surface-3 transition-colors group-hover:bg-accent/40"
              aria-hidden="true"
            />

            {/* Top row: RNSIT & C.O.D.E© identity */}
            <div className="mb-4 flex items-center justify-between text-[11px] font-mono text-text-tertiary">
              <span className="font-semibold tracking-wide text-text-secondary">
                RNSIT
              </span>
              <span className="font-semibold tracking-wider text-text-primary">
                C.O.D.E©
              </span>
            </div>

            {/* Decorative barcode & serial */}
            <div className="mb-6 flex flex-col items-center">
              <div className="text-text-tertiary transition-colors group-hover:text-text-secondary">
                <BarcodeGraphic />
              </div>
              <span className="mt-1 font-mono text-[10px] tracking-widest text-text-tertiary">
                {member.badgeId} &bull; 2026&ndash;27
              </span>
            </div>

            {/* Member Name — Styled in the vibrant accent color matching the ID cards */}
            <div className="my-auto py-4 text-center">
              <h3 className="text-xl font-black uppercase tracking-tight text-accent transition-transform duration-200 group-hover:scale-[1.02] sm:text-2xl">
                {member.name}
              </h3>

              {/* Designation */}
              <p className="mt-3 text-[11px] font-medium tracking-[0.25em] text-text-secondary uppercase">
                &bull; {member.role} &bull;
              </p>
            </div>

            {/* Bottom watermark spray-style code branding */}
            <div className="mt-6 flex items-end justify-between border-t border-border/50 pt-3">
              <span className="rounded bg-surface-2 px-2 py-0.5 text-[9px] font-mono uppercase tracking-wider text-text-tertiary">
                {member.department}
              </span>
              <span className="select-none font-mono text-2xl font-black tracking-tighter text-text-tertiary/20 group-hover:text-accent/20 transition-colors">
                code
              </span>
            </div>
          </div>
        ))}
      </div>

      {filteredMembers.length === 0 && (
        <div className="rounded-lg border border-dashed border-border p-12 text-center">
          <p className="text-sm text-text-tertiary">
            No team members found matching &quot;{searchQuery}&quot;.
          </p>
        </div>
      )}
    </div>
  )
}
