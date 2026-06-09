'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Trophy, Calendar, BarChart3, Users, Menu, X } from 'lucide-react'

export function Navbar() {
  const [open, setOpen] = useState(false)

  const links = [
    { href: '/', label: 'Home', icon: Trophy },
    { href: '/matches/', label: 'Matches', icon: Calendar },
    { href: '/teams/', label: 'Teams', icon: Users },
    { href: '/leaderboard/', label: 'Leaderboard', icon: BarChart3 },
  ]

  return (
    <nav className="sticky top-0 z-50 glass border-b border-slate-800/50">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold text-lg tracking-tight">
          <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center text-white text-sm">⚽</span>
          <span className="text-gradient">SportMind AI</span>
        </Link>

        <div className="hidden md:flex items-center gap-1">
          {links.map(l => (
            <Link
              key={l.href}
              href={l.href}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800/50 transition-colors"
            >
              <l.icon size={16} />
              {l.label}
            </Link>
          ))}
        </div>

        <button className="md:hidden p-2 text-slate-400" onClick={() => setOpen(!open)}>
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t border-slate-800/50 px-4 py-3 space-y-1">
          {links.map(l => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-slate-300 hover:bg-slate-800/50"
            >
              <l.icon size={16} />
              {l.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  )
}
