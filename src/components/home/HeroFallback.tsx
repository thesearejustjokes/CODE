'use client'

import Link from 'next/link'
import { useRef, useCallback, useEffect, useLayoutEffect } from 'react'

// ─── Animation tunables ────────────────────────────────────────────────────────
// TEXT_LERP     : text-gradient tracking speed (0–1). Higher = snappier.
const TEXT_LERP = 0.12

// GLOW_LERP     : glow tracking speed (0–1). Keep lower for inertia/lag.
const GLOW_LERP = 0.055

// TILT_X_DEG    : max rotateX() angle. Controls top/bottom tilt depth.
const TILT_X_DEG = 22

// TILT_Y_DEG    : max rotateY() angle. Controls left/right tilt depth.
const TILT_Y_DEG = 28

// ELLIPSE_BASE  : baseline radii of the glow ellipse [rx%, ry%].
const ELLIPSE_BASE_RX = 62
const ELLIPSE_BASE_RY = 42

// ELLIPSE_DELTA : how much the radii compress/stretch at full tilt (percentage points).
// Positive rx delta → ellipse widens when tilted right (foreshortening flipped on Y).
const ELLIPSE_DELTA_RX = 18
const ELLIPSE_DELTA_RY = 14

// LIGHT_DRIFT   : how far (in %) the gradient center drifts to simulate light parallax.
const LIGHT_DRIFT = 6

// PERSPECTIVE   : CSS perspective distance (px). Smaller = more dramatic 3D.
const PERSPECTIVE = 550
// ──────────────────────────────────────────────────────────────────────────────

export function HeroFallback() {
  const sectionRef = useRef<HTMLElement>(null)
  const headingRef = useRef<HTMLHeadingElement>(null)
  const glowRef    = useRef<HTMLDivElement>(null)

  // pos: normalised cursor position over the heading bounding rect [-1, 1]
  // Stored as target (t) and current-lerped (c) values.
  const pos = useRef({ tx: 0, ty: 0, cx: 0, cy: 0 })

  // glo: lerped 2-axis tilt [-1, 1] for the 3D glow effect.
  // tx/ty are targets; cx/cy are lerped current values.
  const glo = useRef({ tx: 0, ty: 0, cx: 0, cy: 0 })

  const rafId  = useRef<number | null>(null)
  const active = useRef(false)

  // Apply styles directly to DOM — zero React re-renders per frame
  const applyStyles = useCallback(() => {
    const h = headingRef.current
    const g = glowRef.current
    if (!h || !g) return

    // ── Text gradient (unchanged) ─────────────────────────────────────────────
    const { cx, cy } = pos.current
    const px = (cx + 1) / 2 * 100   // [-1,1] → [0,100]%
    const py = (cy + 1) / 2 * 100
    h.style.setProperty(
      '--grad',
      `radial-gradient(ellipse 70% 120% at ${px}% ${py}%, #FFB0A0 0%, #FF462D 40%, #CC2A14 100%)`
    )

    // ── 3D glow field ─────────────────────────────────────────────────────────
    const gx = glo.current.cx   // [-1, 1]
    const gy = glo.current.cy   // [-1, 1]

    // 1. CSS 3D transform: perspective + rotateX/Y gives the foreshortening.
    //    rotateY: positive = tilts right face toward viewer → left side recedes.
    //    rotateX: positive = tilts top face away → bottom comes forward.
    //    We negate gy so cursor-up tilts the top toward viewer (natural feel).
    const rotY =  gx * TILT_Y_DEG   // deg
    const rotX = -gy * TILT_X_DEG   // deg

    // 2. Dynamic gradient shape: foreshortening compresses the axis being tilted.
    //    As rotateY increases (right tilt), horizontal extent compresses → smaller rx.
    //    As rotateX increases (top tilt), vertical extent compresses → smaller ry.
    //    Math: cos(angle) gives the foreshortened fraction.
    const cosY = Math.cos(rotY * Math.PI / 180)  // 1 at 0°, ~0.88 at 28°
    const cosX = Math.cos(rotX * Math.PI / 180)
    const rx = ELLIPSE_BASE_RX + ELLIPSE_DELTA_RX * (cosY - 1) * -0.5   // compresses
    const ry = ELLIPSE_BASE_RY + ELLIPSE_DELTA_RY * (cosX - 1) * -0.5

    // 3. Light parallax: the visible hot-spot appears to drift slightly opposite
    //    to the tilt direction, as if the light source is fixed in space while
    //    the surface tilts beneath it.
    const gcx = 50 - gx * LIGHT_DRIFT   // %
    const gcy = 58 - gy * LIGHT_DRIFT   // % (default center slightly below mid)

    g.style.transform =
      `perspective(${PERSPECTIVE}px) rotateX(${rotX.toFixed(2)}deg) rotateY(${rotY.toFixed(2)}deg)`
    g.style.background =
      `radial-gradient(ellipse ${rx.toFixed(1)}% ${ry.toFixed(1)}% at ${gcx.toFixed(1)}% ${gcy.toFixed(1)}%, var(--accent-glow) 0%, transparent 70%)`
  }, [])

  // Store tick in a ref — avoids the "accessed before declaration" lint error
  // on a self-referencing useCallback.
  const tickRef = useRef<() => void>(() => {})

  useLayoutEffect(() => {
    tickRef.current = () => {
      const p = pos.current
      const g = glo.current

      // Lerp text position (both axes)
      p.cx += (p.tx - p.cx) * TEXT_LERP
      p.cy += (p.ty - p.cy) * TEXT_LERP

      // Lerp glow tilt (both axes, slower for inertia)
      g.cx += (g.tx - g.cx) * GLOW_LERP
      g.cy += (g.ty - g.cy) * GLOW_LERP

      applyStyles()

      const settled =
        Math.abs(p.tx - p.cx) < 0.002 &&
        Math.abs(p.ty - p.cy) < 0.002 &&
        Math.abs(g.tx - g.cx) < 0.005 &&
        Math.abs(g.ty - g.cy) < 0.005

      if (!settled || active.current) {
        rafId.current = requestAnimationFrame(() => tickRef.current())
      } else {
        rafId.current = null
      }
    }
  })

  const startRaf = useCallback(() => {
    if (!rafId.current) rafId.current = requestAnimationFrame(() => tickRef.current())
  }, [tickRef])

  const onPointerMove = useCallback((e: PointerEvent) => {
    if (e.pointerType === 'touch' && e.pressure === 0) return

    const heading = headingRef.current
    const section = sectionRef.current
    if (!heading || !section) return

    // Text: normalise over heading bounding rect → [-1, 1]
    const hr = heading.getBoundingClientRect()
    pos.current.tx = ((e.clientX - hr.left) / hr.width)  * 2 - 1
    pos.current.ty = ((e.clientY - hr.top)  / hr.height) * 2 - 1

    // Glow: normalise over section rect → [-1, 1]
    const sr = section.getBoundingClientRect()
    glo.current.tx = ((e.clientX - sr.left) / sr.width)  * 2 - 1
    glo.current.ty = ((e.clientY - sr.top)  / sr.height) * 2 - 1

    startRaf()
  }, [startRaf])

  const onPointerEnter = useCallback(() => {
    active.current = true
    startRaf()
  }, [startRaf])

  const onPointerLeave = useCallback(() => {
    active.current = false
    // Ease back to neutral (center of heading / zero tilt)
    pos.current.tx = 0
    pos.current.ty = 0
    glo.current.tx = 0
    glo.current.ty = 0
    startRaf()
  }, [startRaf])

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const section = sectionRef.current
    if (!section) return

    section.addEventListener('pointermove',  onPointerMove,  { passive: true })
    section.addEventListener('pointerenter', onPointerEnter, { passive: true })
    section.addEventListener('pointerleave', onPointerLeave, { passive: true })

    applyStyles()

    return () => {
      section.removeEventListener('pointermove',  onPointerMove)
      section.removeEventListener('pointerenter', onPointerEnter)
      section.removeEventListener('pointerleave', onPointerLeave)
      if (rafId.current) cancelAnimationFrame(rafId.current)
    }
  }, [onPointerMove, onPointerEnter, onPointerLeave, applyStyles])

  return (
    <section
      ref={sectionRef}
      className="relative flex min-h-[90vh] flex-col items-center justify-center overflow-hidden px-4 py-24 text-center"
    >
      {/*
        3D glow field — an elliptical radial gradient whose shape, aspect ratio,
        and apparent position all shift via CSS perspective + rotateX/Y transforms.
        The element is inset-0 and position:absolute so tilting it never affects layout.
        overflow-hidden on the section clips any corners that emerge from the tilt.
        JS rewrites both `transform` and `background` each RAF frame.
      */}
      <div
        ref={glowRef}
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            `radial-gradient(ellipse ${ELLIPSE_BASE_RX}% ${ELLIPSE_BASE_RY}% at 50% 58%, var(--accent-glow) 0%, transparent 70%)`,
          transformOrigin: 'center center',
          willChange: 'transform, background',
        }}
        aria-hidden="true"
      />

      <div className="relative z-10 max-w-3xl">
        <p className="mb-4 text-xs font-semibold uppercase tracking-[0.3em] text-accent">
          Data Science Department &bull; RNSIT
        </p>

        {/*
          JS writes `--grad` (a radial-gradient value) onto the h1 each RAF frame.
          The inline backgroundImage: 'var(--grad, none)' picks it up while
          -webkit-background-clip:text (from .text-gradient-accent) clips it.
          SSR / no-JS fallback: the class provides the static coral gradient.
        */}
        <h1
          ref={headingRef}
          className="mb-6 text-5xl font-bold leading-tight tracking-tight sm:text-6xl lg:text-7xl"
        >
          <span
            className="hero-code-text text-gradient-accent"
            style={{ backgroundImage: 'var(--grad, none)' } as React.CSSProperties}
          >
            C.O.D.E.
          </span>
          <br />
          <span className="text-text-primary">CLUB</span>
        </h1>

        <p className="mx-auto mb-3 max-w-xl text-lg leading-relaxed text-text-secondary">
          Community of Data Engineers
        </p>
        <p className="mx-auto mb-10 max-w-xl text-base leading-relaxed text-text-secondary">
          We are the official technical club of the Data Science Department at
          RNS Institute of Technology. We build, explore, and grow together through
          workshops, hackathons, and real-world data projects.
        </p>

        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Link
            href="/events"
            className="rounded-md bg-accent px-6 py-3 text-sm font-semibold text-surface-0 transition-all hover:bg-accent-dim hover:shadow-accent focus-visible:ring-2 focus-visible:ring-accent"
          >
            Explore Events
          </Link>
          <Link
            href="/about"
            className="rounded-md border border-border px-6 py-3 text-sm font-medium text-text-secondary transition-colors hover:border-accent/30 hover:text-text-primary"
          >
            About C.O.D.E.
          </Link>
        </div>
      </div>
    </section>
  )
}
