import Link from 'next/link'
import { Mail } from 'lucide-react'
import { GithubIcon, LinkedinIcon, InstagramIcon } from '@/components/ui/icons'

const quickLinks = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About Us' },
  { href: '/events', label: 'Events' },
  { href: '/contact', label: 'Contact' },
]

// TODO: Replace placeholder hrefs with actual club social media links
const socialLinks = [
  { href: 'https://github.com/codernsit8-sys', label: 'GitHub', icon: GithubIcon },
  { href: 'https://in.linkedin.com/company/code-data-science-club-rnsit', label: 'LinkedIn', icon: LinkedinIcon },
  { href: 'https://www.instagram.com/code.rnsit', label: 'Instagram', icon: InstagramIcon },
  { href: 'mailto:codernsit8@gmail.com', label: 'Email', icon: Mail },
]

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t border-border bg-surface-1">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-3">
          {/* Brand */}
          <div className="space-y-3">
            <p className="text-xl font-bold tracking-widest text-accent">C.O.D.E.</p>
            <p className="text-sm leading-relaxed text-text-secondary">
              Community of Data Engineers — the official technical club of the
              Data Science Department at RNS Institute of Technology, Bengaluru.
            </p>
          </div>

          {/* Quick links */}
          <div>
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-widest text-text-tertiary">
              Quick Links
            </h3>
            <ul className="space-y-2" role="list">
              {quickLinks.map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-sm text-text-secondary transition-colors hover:text-text-primary"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Connect */}
          <div>
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-widest text-text-tertiary">
              Connect
            </h3>
            <ul className="space-y-2" role="list">
              {socialLinks.map(({ href, label, icon: Icon }) => (
                <li key={label}>
                  <a
                    href={href}
                    target={href.startsWith('http') ? '_blank' : undefined}
                    rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
                    className="flex items-center gap-2 text-sm text-text-secondary transition-colors hover:text-accent"
                    aria-label={label}
                  >
                    <Icon size={15} aria-hidden="true" />
                    <span>{label}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-border-subtle pt-6 text-xs text-text-tertiary sm:flex-row">
          <p>
            &copy; {currentYear} C.O.D.E. Club, RNSIT. All rights reserved.
          </p>
          <p>Data Science Department &mdash; RNS Institute of Technology</p>
        </div>
      </div>
    </footer>
  )
}
