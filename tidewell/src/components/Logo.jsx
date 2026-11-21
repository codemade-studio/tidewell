export function Logo({ className = 'size-8', light = false }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden>
      {!light && <rect width="64" height="64" rx="18" fill="#2457e6" />}
      <path d="M14 38c6-6 12-6 18 0s12 6 18 0" fill="none" stroke="#fff" strokeWidth="5.5" strokeLinecap="round" />
      <path d="M14 26c6-6 12-6 18 0s12 6 18 0" fill="none" stroke="#ff8f73" strokeWidth="5.5" strokeLinecap="round" />
    </svg>
  )
}

export function Wordmark({ light = false }) {
  return (
    <span className="flex items-center gap-2.5">
      <Logo className="size-9" />
      <span className={`text-lg leading-none font-extrabold tracking-tight ${light ? 'text-white' : 'text-navy'}`}>
        Tidewell
        <span className={`block text-[11px] font-semibold tracking-[0.18em] uppercase ${light ? 'text-white/60' : 'text-slate'}`}>Dental</span>
      </span>
    </span>
  )
}
