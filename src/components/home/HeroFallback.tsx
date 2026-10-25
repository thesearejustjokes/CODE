import Link from 'next/link'

export function HeroFallback() {
  return (
    <section className="relative flex min-h-[90vh] flex-col items-center justify-center overflow-hidden px-4 py-24 text-center">
      {/* Background grid pattern */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            'linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
          opacity: 0.3,
        }}
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 60% 40% at 50% 60%, rgba(74,222,128,0.08) 0%, transparent 70%)',
        }}
        aria-hidden="true"
      />

      <div className="relative z-10 max-w-3xl">
        <p className="mb-4 text-xs font-semibold uppercase tracking-[0.3em] text-accent">
          Data Science Department &bull; RNSIT
        </p>
        <h1 className="mb-6 text-5xl font-bold leading-tight tracking-tight sm:text-6xl lg:text-7xl">
          <span className="text-gradient-accent">C.O.D.E.</span>
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
