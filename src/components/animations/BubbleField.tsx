'use client'

import { useEffect, useRef, useCallback } from 'react'

interface Bubble {
  id: number
  x: number
  size: number
  duration: number
  delay: number
}

interface BubbleFieldProps {
  /** Total number of bubbles to spawn per trigger. Default: 8 */
  count?: number
  /** Tailwind/inline class for the container (should be relative + overflow-hidden) */
  className?: string
  /** Trigger once or every time the element enters viewport. Default: true */
  once?: boolean
}

let bubbleId = 0

export function BubbleField({
  count = 8,
  className = '',
  once = true,
}: BubbleFieldProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const hasTriggered = useRef(false)

  const spawnBubbles = useCallback(() => {
    const container = containerRef.current
    if (!container) return

    // Check reduced-motion preference
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    for (let i = 0; i < count; i++) {
      const bubble = document.createElement('div')
      const size = 6 + Math.random() * 20
      const x = 5 + Math.random() * 90 // percent
      const duration = 1.5 + Math.random() * 2
      const delay = Math.random() * 0.8

      bubble.className = 'bubble'
      bubble.style.cssText = [
        `left: ${x}%`,
        `bottom: ${Math.random() * 20}%`,
        `width: ${size}px`,
        `height: ${size}px`,
        `--duration: ${duration}s`,
        `animation-delay: ${delay}s`,
      ].join(';')

      container.appendChild(bubble)

      // Remove bubble from DOM after animation
      bubble.addEventListener(
        'animationend',
        () => bubble.remove(),
        { once: true }
      )
    }
  }, [count])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            if (once && hasTriggered.current) return
            hasTriggered.current = true
            spawnBubbles()
          }
        })
      },
      { threshold: 0.3 }
    )

    observer.observe(container)
    return () => observer.disconnect()
  }, [spawnBubbles, once])

  return (
    <div
      ref={containerRef}
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
      aria-hidden="true"
    />
  )
}
