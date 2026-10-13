import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from '@/components/ui/sonner'
import { cn } from '@/lib/utils'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'C.O.D.E. Club — Community of Data Engineers | RNSIT',
    template: '%s | C.O.D.E. Club',
  },
  description:
    'The official website of C.O.D.E. (Community of Data Engineers), the Data Science club at RNS Institute of Technology. Workshops, hackathons, and data engineering events.',
  keywords: ['RNSIT', 'data science', 'code club', 'hackathon', 'workshop', 'RNSIT club'],
  openGraph: {
    type: 'website',
    siteName: 'C.O.D.E. Club',
    title: 'C.O.D.E. Club — Community of Data Engineers | RNSIT',
    description:
      'Official website of the Data Science Club at RNS Institute of Technology.',
  },
}

export const viewport: Viewport = {
  themeColor: '#0d0d0d',
  colorScheme: 'dark',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={cn(inter.variable, 'dark')} suppressHydrationWarning>
      <body
        className={cn(
          'min-h-screen bg-surface-0 font-sans text-text-primary antialiased'
        )}
      >
        {children}
        <Toaster
          theme="dark"
          toastOptions={{
            style: {
              background: 'var(--surface-2)',
              border: '1px solid var(--border)',
              color: 'var(--text-primary)',
            },
          }}
        />
      </body>
    </html>
  )
}
