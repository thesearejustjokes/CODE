import { PageWrapper } from '@/components/layout/PageWrapper'
import { ScrollReveal } from '@/components/animations/ScrollReveal'
import { Mail, MapPin } from 'lucide-react'
import { GithubIcon, LinkedinIcon, InstagramIcon } from '@/components/ui/icons'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Get in touch with the C.O.D.E. Club at RNSIT.',
}

// TODO: Replace placeholder contact info with verified club details before going live
const contactInfo = [
  {
    icon: Mail,
    label: 'Email',
    value: 'code.club@rnsit.ac.in',
    href: 'mailto:code.club@rnsit.ac.in',
  },
  {
    icon: MapPin,
    label: 'Location',
    value: 'RNS Institute of Technology, Channasandra, Bengaluru – 560 098',
    href: null,
  },
]

// TODO: Replace # with actual social media URLs
const socialLinks = [
  { icon: GithubIcon, label: 'GitHub', href: '#' },
  { icon: LinkedinIcon, label: 'LinkedIn', href: '#' },
  { icon: InstagramIcon, label: 'Instagram', href: '#' },
]

export default function ContactPage() {
  return (
    <PageWrapper>
      <div className="mx-auto max-w-4xl px-4 py-20 sm:px-6 lg:px-8">
        <ScrollReveal>
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.3em] text-accent">
            Reach Out
          </p>
          <h1 className="mb-4 text-4xl font-bold text-text-primary">Contact Us</h1>
          <p className="mb-12 text-base text-text-secondary">
            Have questions about an event or want to get involved? We&apos;d love to hear from you.
          </p>
        </ScrollReveal>

        <div className="grid grid-cols-1 gap-12 md:grid-cols-2">
          {/* Contact details */}
          <div className="space-y-6">
            <ScrollReveal>
              <h2 className="mb-5 text-lg font-semibold text-text-primary">Get in Touch</h2>
            </ScrollReveal>
            {contactInfo.map(({ icon: Icon, label, value, href }) => (
              <ScrollReveal key={label}>
                <div className="flex items-start gap-3">
                  <Icon size={16} className="mt-0.5 shrink-0 text-accent" aria-hidden="true" />
                  <div>
                    <p className="mb-0.5 text-xs font-medium uppercase tracking-wider text-text-tertiary">
                      {label}
                    </p>
                    {href ? (
                      <a href={href} className="text-sm text-text-secondary hover:text-text-primary">
                        {value}
                      </a>
                    ) : (
                      <p className="text-sm text-text-secondary">{value}</p>
                    )}
                  </div>
                </div>
              </ScrollReveal>
            ))}

            <ScrollReveal>
              <div className="mt-8">
                <p className="mb-3 text-xs font-medium uppercase tracking-wider text-text-tertiary">
                  Social
                </p>
                <div className="flex gap-4">
                  {socialLinks.map(({ icon: Icon, label, href }) => (
                    <a
                      key={label}
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-md border border-border p-2 text-text-secondary transition-colors hover:border-accent/30 hover:text-accent"
                      aria-label={label}
                    >
                      <Icon size={16} aria-hidden="true" />
                    </a>
                  ))}
                </div>
              </div>
            </ScrollReveal>
          </div>

          {/* Placeholder form / join info */}
          <ScrollReveal>
            <div className="rounded-lg border border-border bg-surface-1 p-8">
              <h2 className="mb-3 text-lg font-semibold text-text-primary">Join C.O.D.E.</h2>
              <p className="mb-6 text-sm leading-relaxed text-text-secondary">
                Interested in joining the club? Watch our events page for recruitment drives,
                or reach out to us directly via email.
              </p>
              <a
                href="/events"
                className="inline-block rounded-md bg-accent px-5 py-2.5 text-sm font-semibold text-surface-0 transition-all hover:bg-accent-dim hover:shadow-accent"
              >
                View Upcoming Events
              </a>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </PageWrapper>
  )
}
