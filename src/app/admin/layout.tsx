import { AdminNav } from '@/components/admin/AdminNav'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Admin Portal | C.O.D.E. Club',
  robots: {
    index: false,
    follow: false,
  },
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-surface-0 font-sans text-text-primary">
      <AdminNav />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  )
}
