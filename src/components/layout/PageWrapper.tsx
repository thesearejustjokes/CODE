import { Navbar } from './Navbar'
import { Footer } from './Footer'

interface PageWrapperProps {
  children: React.ReactNode
  /** Remove top padding (e.g. for pages with full-bleed hero sections) */
  noTopPadding?: boolean
}

export function PageWrapper({ children, noTopPadding = false }: PageWrapperProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main
        id="main-content"
        className={noTopPadding ? 'flex-1' : 'flex-1 pt-16'}
        tabIndex={-1}
      >
        {children}
      </main>
      <Footer />
    </div>
  )
}
