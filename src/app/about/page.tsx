import { PageWrapper } from '@/components/layout/PageWrapper'
import { ScrollReveal } from '@/components/animations/ScrollReveal'
import { BubbleField } from '@/components/animations/BubbleField'
import { TeamSection } from '@/components/about/TeamSection'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'About',
  description: 'Learn about C.O.D.E. — the Community of Data Engineers at RNSIT.',
}

const pillars = [
  {
    title: 'Learn',
    description:
      'Hands-on workshops and sessions on data engineering, machine learning, Python, SQL, and modern data stacks.',
  },
  {
    title: 'Build',
    description:
      'Collaborative projects and hackathons where members solve real-world data problems as a team.',
  },
  {
    title: 'Grow',
    description:
      'Industry interactions, mentorship, peer learning, and a community of engineers who share the same curiosity.',
  },
]

export default function AboutPage() {
  return (
    <PageWrapper>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border px-4 py-24 sm:px-6 lg:px-8">
        <BubbleField count={8} />
        <div className="relative z-10 mx-auto max-w-3xl text-center">
          <ScrollReveal>
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.3em] text-accent">
              Who We Are
            </p>
            <h1 className="mb-6 text-5xl font-bold tracking-tight text-text-primary">
              About C.O.D.E.
            </h1>
            <p className="text-lg leading-relaxed text-text-secondary">
              C.O.D.E. &mdash; Community of Data Engineers &mdash; is the official technical club
              of the Data Science Department at RNS Institute of Technology, Bengaluru.
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* Three pillars */}
      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <ScrollReveal>
            <h2 className="mb-10 text-center text-3xl font-bold text-text-primary">What We Do</h2>
          </ScrollReveal>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {pillars.map((pillar, i) => (
              <ScrollReveal key={pillar.title} delay={i * 100}>
                <div className="rounded-lg border border-border bg-surface-1 p-8">
                  <h3 className="mb-3 text-xl font-bold text-accent">{pillar.title}</h3>
                  <p className="text-sm leading-relaxed text-text-secondary">
                    {pillar.description}
                  </p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Our Team */}
      <section className="border-t border-border bg-surface-0 px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <ScrollReveal>
            <div className="mb-10 text-center sm:text-left">
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.3em] text-accent">
                The Community
              </p>
              <h2 className="mb-4 text-3xl font-bold tracking-tight text-text-primary sm:text-4xl">
                Our Team
              </h2>
              <p className="max-w-2xl text-sm leading-relaxed text-text-secondary">
                Meet the minds behind C.O.D.E. 2026&ndash;27 &mdash; leading initiatives,
                designing technical workshops, and building community.
              </p>
            </div>
          </ScrollReveal>
          <TeamSection />
        </div>
      </section>
    </PageWrapper>
  )
}
