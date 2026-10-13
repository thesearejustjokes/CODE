import { PageWrapper } from '@/components/layout/PageWrapper'
import { ScrollReveal } from '@/components/animations/ScrollReveal'
import { BubbleField } from '@/components/animations/BubbleField'
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

      {/* Placeholder: Team */}
      <section className="border-t border-border bg-surface-1 px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <ScrollReveal>
            <h2 className="mb-4 text-3xl font-bold text-text-primary">Our Team</h2>
            <p className="mb-10 text-sm text-text-secondary">
              Meet the people who make C.O.D.E. happen.
            </p>
          </ScrollReveal>
          {/* PLACEHOLDER: Replace with actual team member data */}
          <div className="rounded-lg border border-dashed border-border p-12 text-center">
            <p className="text-sm text-text-tertiary">
              [Team member profiles will appear here. Add team data to display this section.]
            </p>
          </div>
        </div>
      </section>
    </PageWrapper>
  )
}
