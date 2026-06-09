import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Navbar } from '@/components/Navbar'
import { Toaster } from '@/components/Toaster'

const inter = Inter({ subsets: ['latin'], display: 'swap' })

export const metadata: Metadata = {
  title: 'SportMind AI — 2026 World Cup Intelligence',
  description: 'AI-powered match preview, predictions, and data analytics for 2026 FIFA World Cup. 48 teams, 104 matches, one intelligent platform.',
  openGraph: {
    title: 'SportMind AI — 2026 World Cup',
    description: 'Data-driven match intelligence and AI predictions',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'SportMind AI — 2026 World Cup',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={inter.className}>
      <body className="min-h-screen bg-[#0b1120] text-slate-100">
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl" />
        </div>
        <Navbar />
        <main className="relative z-10">{children}</main>
        <footer className="relative z-10 border-t border-slate-800/50 mt-20 py-10 text-center text-slate-500 text-sm">
          <p>SportMind AI — 2026 FIFA World Cup Intelligence Platform</p>
          <p className="mt-2 text-xs text-slate-600">
            For entertainment and research only. Not betting advice. Please gamble responsibly and comply with local laws.
          </p>
        </footer>
      </body>
    </html>
  )
}
