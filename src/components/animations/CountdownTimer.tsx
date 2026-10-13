'use client'

import { useState, useEffect } from 'react'

interface TimeLeft {
  days: number
  hours: number
  minutes: number
  seconds: number
}

interface CountdownTimerProps {
  targetDate: string | Date
  label?: string
  onExpired?: () => void
}

function getTimeLeft(target: Date): TimeLeft | null {
  const diff = target.getTime() - Date.now()
  if (diff <= 0) return null
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  }
}

function Segment({ value, unit }: { value: number; unit: string }) {
  return (
    <div className="flex flex-col items-center">
      <span className="tabular-nums text-3xl font-bold text-accent sm:text-4xl">
        {String(value).padStart(2, '0')}
      </span>
      <span className="mt-1 text-xs uppercase tracking-widest text-text-secondary">{unit}</span>
    </div>
  )
}

const SEPARATOR = (
  <span className="self-start pt-1 text-2xl font-bold text-text-tertiary">:</span>
)

export function CountdownTimer({ targetDate, label, onExpired }: CountdownTimerProps) {
  const target = new Date(targetDate)
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(() => getTimeLeft(target))

  useEffect(() => {
    if (!timeLeft) return
    const id = setInterval(() => {
      const next = getTimeLeft(target)
      setTimeLeft(next)
      if (!next) onExpired?.()
    }, 1000)
    return () => clearInterval(id)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetDate])

  if (!timeLeft) {
    return (
      <p className="text-sm text-status-rejected">
        Registration has closed.
      </p>
    )
  }

  return (
    <div>
      {label && (
        <p className="mb-3 text-xs uppercase tracking-widest text-text-secondary">{label}</p>
      )}
      <div className="flex items-center gap-3" role="timer" aria-live="off">
        <Segment value={timeLeft.days} unit="Days" />
        {SEPARATOR}
        <Segment value={timeLeft.hours} unit="Hrs" />
        {SEPARATOR}
        <Segment value={timeLeft.minutes} unit="Min" />
        {SEPARATOR}
        <Segment value={timeLeft.seconds} unit="Sec" />
      </div>
    </div>
  )
}
