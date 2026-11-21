import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router'
import { ArrowRight, Menu, Sparkles, X } from 'lucide-react'
import { Wordmark } from './Logo.jsx'
import { useChat } from './chat/ChatWidget.jsx'

const NAV = [
  { label: 'Services', to: '/#services' },
  { label: 'Pricing', to: '/#pricing' },
  { label: 'FAQ', to: '/#faq' },
  { label: 'Contact', to: '/#contact' },
]

function ScrollManager() {
  const { pathname, hash } = useLocation()
  useEffect(() => {
    if (hash) {
      const el = document.getElementById(hash.slice(1))
      if (el) return el.scrollIntoView()
    }
    window.scrollTo(0, 0)
  }, [pathname, hash])
  return null
}

export default function Layout() {
  const { open, openWith } = useChat()
  const [menu, setMenu] = useState(false)
  const { pathname } = useLocation()
  useEffect(() => setMenu(false), [pathname])

  return (
    <div className="flex min-h-dvh flex-col">
      <ScrollManager />
      <a href="#main" className="sr-only z-[60] rounded bg-white px-3 py-2 focus:not-sr-only focus:fixed focus:top-2 focus:left-2">
        Skip to content
      </a>
      <div className="bg-navy px-4 py-2 text-center text-xs text-white/85 sm:text-[13px]">
        <span className="font-semibold text-white">Concept project by Codemade Studio</span> — Tidewell Dental is a fictional clinic.{' '}
        <button onClick={open} className="inline-flex items-center gap-1 font-semibold text-[#ffb19f] underline-offset-2 hover:underline">
          Try the AI assistant <ArrowRight className="size-3.5" aria-hidden />
        </button>
      </div>
      <header className="sticky top-0 z-30 border-b border-line/80 bg-white/90 backdrop-blur">
        <nav className="mx-auto flex h-18 max-w-6xl items-center justify-between gap-6 px-5" aria-label="Main">
          <Link to="/" aria-label="Tidewell Dental home">
            <Wordmark />
          </Link>
          <ul className="hidden items-center gap-7 text-sm font-semibold text-slate lg:flex">
            {NAV.map((n) => (
              <li key={n.label}>
                <Link to={n.to} className="transition hover:text-navy">
                  {n.label}
                </Link>
              </li>
            ))}
            <li>
              <NavLink to="/how-it-works" className={({ isActive }) => `inline-flex items-center gap-1.5 transition hover:text-navy ${isActive ? 'text-tide' : ''}`}>
                <Sparkles className="size-4 text-coral" aria-hidden /> How the assistant works
              </NavLink>
            </li>
          </ul>
          <div className="flex items-center gap-2">
            <a href="tel:+61391234567" className="hidden text-sm font-semibold text-navy xl:block">
              (03) 9123 4567
            </a>
            <button onClick={() => openWith({ type: 'book', label: 'Book a slot' })} className="hidden rounded-full bg-tide px-5 py-2.5 text-sm font-semibold text-white shadow-sm shadow-tide/30 transition hover:bg-tide-dark sm:block">
              Book online
            </button>
            <button onClick={() => setMenu((m) => !m)} className="rounded-full p-2 text-navy lg:hidden" aria-label={menu ? 'Close menu' : 'Open menu'} aria-expanded={menu}>
              {menu ? <X className="size-6" /> : <Menu className="size-6" />}
            </button>
          </div>
        </nav>
        {menu && (
          <div className="border-t border-line bg-white px-5 pt-2 pb-5 lg:hidden">
            <ul className="space-y-1 text-base font-semibold text-navy">
              {[...NAV, { label: 'How the assistant works', to: '/how-it-works' }].map((n) => (
                <li key={n.label}>
                  <Link to={n.to} onClick={() => setMenu(false)} className="block rounded-xl px-3 py-2.5 hover:bg-mist">
                    {n.label}
                  </Link>
                </li>
              ))}
            </ul>
            <button onClick={() => { setMenu(false); openWith({ type: 'book', label: 'Book a slot' }) }} className="mt-3 w-full rounded-full bg-tide py-3 text-sm font-semibold text-white">
              Book online
            </button>
          </div>
        )}
      </header>
      <main id="main" className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}

function Footer() {
  return (
    <footer className="bg-navy text-white/70">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div className="lg:col-span-2">
          <Wordmark light />
          <p className="mt-4 max-w-sm text-sm leading-relaxed">Gentle, modern family dentistry on Sydney Road, Brunswick. Same-day emergency slots, late nights on Thursday.</p>
        </div>
        <div className="text-sm">
          <h2 className="mb-3 font-semibold text-white">Visit</h2>
          <p>214 Sydney Road</p>
          <p>Brunswick VIC 3056</p>
          <p className="mt-2">(03) 9123 4567</p>
          <p>hello@tidewell.example</p>
        </div>
        <div className="text-sm">
          <h2 className="mb-3 font-semibold text-white">Explore</h2>
          <ul className="space-y-1.5">
            <li><Link to="/#services" className="hover:text-white">Services</Link></li>
            <li><Link to="/#pricing" className="hover:text-white">Pricing</Link></li>
            <li><Link to="/#faq" className="hover:text-white">FAQ</Link></li>
            <li><Link to="/how-it-works" className="hover:text-white">How the assistant works</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <p className="mx-auto max-w-6xl px-5 py-5 text-xs leading-relaxed text-white/55">
          Concept project designed and built by{' '}
          <a href="https://codemade.studio" className="font-semibold text-white/80 underline-offset-2 hover:underline">
            Codemade Studio
          </a>
          . Tidewell Dental, its team, reviews and prices are fictional. The chat assistant is a demo running on a local knowledge base — no messages or bookings are sent.
        </p>
      </div>
    </footer>
  )
}
