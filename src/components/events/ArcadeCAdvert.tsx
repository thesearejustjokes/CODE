import Image from 'next/image'
import Link from 'next/link'
import {
  Calendar,
  MapPin,
  Users,
  IndianRupee,
  Trophy,
  Terminal,
  Sparkles,
  Gavel,
  ShieldAlert,
  ArrowRight,
  CheckCircle2,
  Clock,
} from 'lucide-react'

export function ArcadeCAdvert() {
  return (
    <section className="relative overflow-hidden border-y border-border bg-gradient-to-b from-surface-1 via-surface-0 to-surface-1 px-4 py-20 sm:px-6 lg:px-8">
      {/* Ambient background glow */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 70% 40% at 50% 20%, var(--accent-glow) 0%, transparent 70%)',
        }}
        aria-hidden="true"
      />

      <div className="relative z-10 mx-auto max-w-7xl">
        {/* Institutional Credentials Header */}
        <div className="mb-12 flex flex-col items-center justify-between gap-6 rounded-2xl border border-border/80 bg-surface-2/60 p-6 backdrop-blur-sm sm:flex-row sm:p-8">
          <div className="flex items-center gap-5">
            <div className="relative h-14 w-14 shrink-0 sm:h-16 sm:w-16">
              <Image
                src="/images/brand/rnsit-crest.png"
                alt="RNS Institute of Technology Crest"
                fill
                className="object-contain"
                priority
              />
            </div>
            <div>
              <p className="text-[10px] font-mono tracking-widest text-text-tertiary uppercase">
                RN Shetty Trust&reg; &bull; Estd: 2001
              </p>
              <h4 className="text-base font-bold text-text-primary sm:text-lg">
                RNS INSTITUTE OF TECHNOLOGY
              </h4>
              <p className="text-xs text-text-secondary">
                Autonomous &bull; Affiliated to VTU &bull; NAAC &apos;A+&apos; Grade &bull; Bengaluru
              </p>
            </div>
          </div>


          <div className="flex items-center gap-4 border-t border-border/60 pt-4 sm:border-l sm:border-t-0 sm:pl-6 sm:pt-0">
            <div className="relative h-12 w-24 shrink-0 sm:h-14 sm:w-28">
              <Image
                src="/images/brand/rnsit-25.png"
                alt="RNSIT 25th Anniversary Celebration"
                fill
                className="object-contain"
                priority
              />
            </div>
            <div className="text-left sm:text-right">
              <span className="inline-block rounded bg-accent/15 px-2 py-0.5 text-[10px] font-mono font-bold tracking-wider text-accent uppercase">
                Dept. of CSE (Data Science)
              </span>
              <p className="text-xs font-semibold text-text-primary">
                C.O.D.E. Technical Club
              </p>
            </div>
          </div>

        </div>

        {/* Hero Banner Grid */}
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12">
          {/* Left Column: Event Pitch */}
          <div className="lg:col-span-7">
            <div className="inline-flex items-center gap-2 rounded-full border border-accent/40 bg-accent/10 px-3.5 py-1 text-xs font-semibold text-accent">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Flagship Technical Arena &bull; 30th October, 2026</span>
            </div>

            <h2 className="mt-4 text-4xl font-black tracking-tight text-text-primary sm:text-5xl lg:text-6xl">
              <span className="text-gradient-accent">Arcade.C</span>
            </h2>

            <p className="mt-4 text-lg font-medium leading-relaxed text-text-primary">
              The premier three-round technical arena combining C programming,
              prompt-based AI recreation, and a collaborative coding auction.
            </p>

            <p className="mt-2 text-sm leading-relaxed text-text-secondary">
              Engineered exclusively for <strong>1st-year &amp; 2nd-year</strong> engineering students.
              Sharpen your debugging instincts, master generative prompts, and bid for victory!
            </p>

            {/* Quick Metrics & Highlights */}
            <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="rounded-lg border border-border bg-surface-2 p-3 text-center">
                <Calendar className="mx-auto mb-1 h-4 w-4 text-accent" />
                <span className="block text-[10px] uppercase tracking-wider text-text-tertiary font-mono">Date</span>
                <span className="text-xs font-bold text-text-primary">30 Oct 2026</span>
              </div>

              <div className="rounded-lg border border-border bg-surface-2 p-3 text-center">
                <Trophy className="mx-auto mb-1 h-4 w-4 text-yellow-400" />
                <span className="block text-[10px] uppercase tracking-wider text-text-tertiary font-mono">Prize Money</span>
                <span className="text-xs font-bold text-yellow-400">&#8377;3,000 Cash</span>
              </div>

              <div className="rounded-lg border border-border bg-surface-2 p-3 text-center">
                <Users className="mx-auto mb-1 h-4 w-4 text-accent" />
                <span className="block text-[10px] uppercase tracking-wider text-text-tertiary font-mono">Team Size</span>
                <span className="text-xs font-bold text-text-primary">2–3 Members</span>
              </div>

              <div className="rounded-lg border border-border bg-surface-2 p-3 text-center">
                <IndianRupee className="mx-auto mb-1 h-4 w-4 text-accent" />
                <span className="block text-[10px] uppercase tracking-wider text-text-tertiary font-mono">Entry Fee</span>
                <span className="text-xs font-bold text-text-primary">&#8377;180 / Team</span>
              </div>
            </div>

            {/* Slots notice */}
            <div className="mt-4 flex items-center gap-2 text-xs font-medium text-text-secondary">
              <ShieldAlert className="h-4 w-4 text-accent shrink-0" />
              <span>Strictly limited to <strong>18 Teams</strong> &bull; First-come, first-served basis.</span>
            </div>

            {/* Action Buttons */}
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link
                href="/events/arcade-c/register"
                className="inline-flex items-center gap-2 rounded-md bg-accent px-6 py-3 text-sm font-semibold text-surface-0 transition-all hover:bg-accent-dim hover:shadow-accent focus-visible:ring-2 focus-visible:ring-accent"
              >
                <span>Register Your Team</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/events/arcade-c"
                className="rounded-md border border-border bg-surface-2 px-6 py-3 text-sm font-medium text-text-secondary transition-colors hover:border-accent/40 hover:text-text-primary"
              >
                Full Details &amp; Guidelines
              </Link>
            </div>
          </div>

          {/* Right Column: Visual Creative Poster Card */}
          <div className="lg:col-span-5">
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-border/80 shadow-2xl transition-all duration-300 hover:border-accent/50 hover:shadow-accent sm:aspect-video lg:aspect-[4/3]">
              <Image
                src="/images/events/arcade-c-banner.png"
                alt="Arcade.C Official Event Creative"
                fill
                className="object-cover"
                unoptimized
                priority
              />
            </div>
          </div>
        </div>

        {/* The 3 Rounds Walkthrough */}
        <div className="mt-16">
          <div className="mb-8 text-center sm:text-left">
            <span className="text-xs font-mono font-bold uppercase tracking-[0.3em] text-accent">
              Tournament Structure
            </span>
            <h3 className="mt-1 text-2xl font-bold tracking-tight text-text-primary sm:text-3xl">
              Three High-Stakes Rounds
            </h3>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {/* Round 1 Card */}
            <div className="relative flex flex-col justify-between rounded-xl border border-border bg-surface-2 p-6 transition-all hover:-translate-y-1 hover:border-accent/40 hover:shadow-md">
              <div>
                <div className="mb-4 flex items-center justify-between">
                  <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-accent/15 text-accent">
                    <Terminal className="h-5 w-5" />
                  </div>
                  <span className="rounded bg-surface-3 px-2 py-0.5 text-[10px] font-mono font-bold text-accent">
                    100 POINTS
                  </span>
                </div>

                <span className="text-xs font-mono uppercase tracking-wider text-text-tertiary">
                  Round 01
                </span>
                <h4 className="mt-1 text-lg font-bold text-text-primary">
                  Syntax Surgery
                </h4>
                <p className="mt-2 text-xs leading-relaxed text-text-secondary">
                  Each team receives two broken C code snippets (one easy, one medium) on paper.
                  Diagnose the errors and write the corrected code.
                </p>

                <ul className="mt-4 space-y-1.5 text-xs text-text-tertiary">
                  <li className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-text-secondary" />
                    <span>Duration: 45&ndash;60 mins</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-text-secondary" />
                    <span>50 marks per snippet</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-text-secondary" />
                    <span>No AI tools &bull; Submission time tie-breaker</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Round 2 Card */}
            <div className="relative flex flex-col justify-between rounded-xl border border-border bg-surface-2 p-6 transition-all hover:-translate-y-1 hover:border-accent/40 hover:shadow-md">
              <div>
                <div className="mb-4 flex items-center justify-between">
                  <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-accent/15 text-accent">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <span className="rounded bg-surface-3 px-2 py-0.5 text-[10px] font-mono font-bold text-accent">
                    100 POINTS
                  </span>
                </div>

                <span className="text-xs font-mono uppercase tracking-wider text-text-tertiary">
                  Round 02
                </span>
                <h4 className="mt-1 text-lg font-bold text-text-primary">
                  Prompt Pixel
                </h4>
                <p className="mt-2 text-xs leading-relaxed text-text-secondary">
                  Briefly view reference imagery on screen, then write precision prompts
                  in Bing Image Creator to generate images matching the reference.
                </p>

                <ul className="mt-4 space-y-1.5 text-xs text-text-tertiary">
                  <li className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-text-secondary" />
                    <span>Stage 1: 1 image (10 mins, 25 pts)</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-text-secondary" />
                    <span>Stage 2: 2 images (15 mins, 30 pts)</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-text-secondary" />
                    <span>Stage 3: 3 images (20 mins, 45 pts)</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Round 3 Card */}
            <div className="relative flex flex-col justify-between rounded-xl border border-border bg-surface-2 p-6 transition-all hover:-translate-y-1 hover:border-accent/40 hover:shadow-md">
              <div>
                <div className="mb-4 flex items-center justify-between">
                  <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-accent/15 text-accent">
                    <Gavel className="h-5 w-5" />
                  </div>
                  <span className="rounded bg-surface-3 px-2 py-0.5 text-[10px] font-mono font-bold text-accent">
                    200 POINTS
                  </span>
                </div>

                <span className="text-xs font-mono uppercase tracking-wider text-text-tertiary">
                  Round 03
                </span>
                <h4 className="mt-1 text-lg font-bold text-text-primary">
                  Bid &amp; Win (Code Auction)
                </h4>
                <p className="mt-2 text-xs leading-relaxed text-text-secondary">
                  Lab divided into 3 lanes forming 3 mega-teams. Questions drawn from a pool of 6
                  and auctioned using 1,000-point allocations.
                </p>

                <ul className="mt-4 space-y-1.5 text-xs text-text-tertiary">
                  <li className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-text-secondary" />
                    <span>Duration: 1&ndash;1.5 Hours</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-text-secondary" />
                    <span>Hints cost -10 to -30 points</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-text-secondary" />
                    <span>Points redistributed equally to lane teams</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
