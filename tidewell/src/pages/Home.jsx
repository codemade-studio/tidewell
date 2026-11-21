import { useState } from 'react'
import { Link } from 'react-router'
import { ArrowRight, Baby, CalendarDays, Car, Check, Clock, Gem, Headset, Mail, MapPin, MessageCircle, Minus, Phone, Plus, Quote, ShieldCheck, Siren, Smile, Sparkles, Star, Stethoscope, Train } from 'lucide-react'
import { useChat } from '../components/chat/ChatWidget.jsx'
import { Logo } from '../components/Logo.jsx'
import { kb } from '../lib/bot.js'
import { FAQ_IDS, HOURS, MORE_PRICES, PLANS, REVIEWS, SERVICES } from '../data/site.js'
import { RichText } from '../lib/richtext.jsx'

const ICONS = { Stethoscope, Baby, Sparkles, Smile, Gem, Siren }
const BOOK = { type: 'book', label: 'Book a slot' }

function Eyebrow({ children }) {
  return <p className="mb-3 text-xs font-bold tracking-[0.18em] text-tide uppercase">{children}</p>
}

export default function Home() {
  return (
    <>
      <Hero />
      <Funds />
      <Services />
      <AssistantBand />
      <Pricing />
      <Reviews />
      <Faq />
      <Contact />
    </>
  )
}

function Hero() {
  const { open, openWith } = useChat()
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-sky to-white">
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 pt-14 pb-20 lg:grid-cols-[1.05fr_1fr] lg:pt-20 lg:pb-24">
        <div>
          <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-tide/15 bg-white px-3 py-1.5 text-xs font-semibold text-tide-dark shadow-sm">
            <span className="size-2 rounded-full bg-emerald-500" aria-hidden /> Brunswick · Late nights Thursday · Open Saturday
          </p>
          <h1 className="text-[2.6rem] leading-[1.05] font-extrabold tracking-tight text-navy sm:text-6xl">
            Gentle dentistry, <span className="text-tide">minus the dread.</span>
          </h1>
          <p className="mt-6 max-w-lg text-lg leading-relaxed text-slate">
            Family check-ups, whitening, aligners and same-day emergencies on Sydney Road. Clear prices, health fund claims on the spot, and answers any time of day.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <button onClick={() => openWith(BOOK)} className="inline-flex items-center gap-2 rounded-full bg-tide px-6 py-3.5 font-semibold text-white shadow-lg shadow-tide/25 transition hover:bg-tide-dark">
              <CalendarDays className="size-5" aria-hidden /> Book a check-up
            </button>
            <button onClick={open} className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-6 py-3.5 font-semibold text-navy transition hover:border-tide hover:text-tide">
              <MessageCircle className="size-5" aria-hidden /> Ask the assistant
            </button>
          </div>
          <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-4 text-sm text-slate">
            <span className="flex items-center gap-2">
              <span className="flex text-amber-400" aria-hidden>
                {[...Array(5)].map((_, i) => <Star key={i} className="size-4 fill-current" />)}
              </span>
              <span><strong className="text-navy">4.9</strong> · 1,280 reviews</span>
            </span>
            <span className="flex items-center gap-2"><ShieldCheck className="size-5 text-tide" aria-hidden /> All health funds, HICAPS</span>
          </div>
        </div>
        <HeroVisual />
      </div>
    </section>
  )
}

function HeroVisual() {
  return (
    <div className="relative mx-auto w-full max-w-md lg:max-w-none" aria-hidden>
      <div className="relative aspect-[5/4] overflow-hidden rounded-[2rem] bg-gradient-to-br from-tide to-navy shadow-2xl shadow-tide/25">
        <svg viewBox="0 0 500 400" className="absolute inset-0 size-full" preserveAspectRatio="none">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <path key={i} d={`M-20 ${120 + i * 48} C 90 ${80 + i * 48}, 160 ${170 + i * 48}, 260 ${125 + i * 48} S 430 ${90 + i * 48}, 520 ${130 + i * 48}`} fill="none" stroke={i % 2 ? '#ffffff' : '#ff8f73'} strokeOpacity={i % 2 ? 0.12 : 0.28} strokeWidth="2" />
          ))}
        </svg>
        <div className="absolute top-8 left-8 flex items-center gap-3 text-white">
          <Logo className="size-11" />
          <div>
            <p className="text-lg font-bold">Tidewell Dental</p>
            <p className="text-sm text-white/70">214 Sydney Road, Brunswick</p>
          </div>
        </div>
        <div className="absolute right-6 bottom-6 left-6 rounded-2xl bg-white/95 p-4 shadow-xl backdrop-blur sm:right-auto sm:w-72">
          <p className="flex items-center gap-2 text-xs font-semibold text-slate"><Clock className="size-4 text-tide" /> Next available</p>
          <p className="mt-1 text-lg font-bold text-navy">Tomorrow · 9:30am</p>
          <p className="text-sm text-slate">Check-up & clean with Dr Maya Chen</p>
        </div>
      </div>
      <div className="absolute -top-5 -right-2 w-60 rounded-2xl max-sm:hidden border border-line bg-white p-3.5 shadow-xl shadow-navy/10 sm:-right-6 sm:w-64">
        <p className="ml-auto w-fit rounded-xl rounded-br-sm bg-tide px-3 py-2 text-[13px] text-white">Do you take Bupa?</p>
        <div className="mt-2 flex items-end gap-2">
          <span className="grid size-6 shrink-0 place-items-center rounded-full bg-navy"><Logo className="size-3.5" light /></span>
          <p className="rounded-xl rounded-bl-sm bg-mist px-3 py-2 text-[13px] text-slate-ink">Yes — we claim on the spot with HICAPS, so you only pay the gap.</p>
        </div>
      </div>
    </div>
  )
}

function Funds() {
  return (
    <section className="border-y border-line bg-white">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-10 gap-y-3 px-5 py-6 text-sm font-bold tracking-wide text-slate/70">
        <span className="text-xs font-semibold tracking-[0.18em] text-slate uppercase">Claim on the spot with</span>
        {['Bupa', 'Medibank', 'HCF', 'nib', 'ahm', 'HICAPS'].map((f) => <span key={f}>{f}</span>)}
      </div>
    </section>
  )
}

function Services() {
  return (
    <section id="services" className="mx-auto max-w-6xl px-5 py-20 sm:py-24">
      <div className="max-w-2xl">
        <Eyebrow>Services</Eyebrow>
        <h2 className="text-3xl font-extrabold tracking-tight text-balance text-navy sm:text-4xl">Everything your smile needs, under one roof</h2>
        <p className="mt-4 text-lg text-slate">Four dentists, one hygienist and a front desk that actually picks up the phone.</p>
      </div>
      <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {SERVICES.map((s) => {
          const Icon = ICONS[s.icon]
          return (
            <article key={s.title} className="group rounded-3xl border border-line bg-white p-7 transition hover:-translate-y-0.5 hover:border-tide/30 hover:shadow-xl hover:shadow-navy/5">
              <span className="grid size-12 place-items-center rounded-2xl bg-sky text-tide transition group-hover:bg-tide group-hover:text-white">
                <Icon className="size-6" aria-hidden />
              </span>
              <h3 className="mt-5 text-lg font-bold text-navy">{s.title}</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-slate">{s.text}</p>
              <p className="mt-4 text-sm font-bold text-coral-dark">{s.from}</p>
            </article>
          )
        })}
      </div>
    </section>
  )
}

function AssistantBand() {
  const { open } = useChat()
  return (
    <section className="mx-auto max-w-6xl px-5">
      <div className="grid items-center gap-10 overflow-hidden rounded-[2rem] bg-navy px-7 py-12 text-white sm:px-12 lg:grid-cols-2">
        <div>
          <p className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-[#ffb19f]">
            <Sparkles className="size-3.5" aria-hidden /> Concept demo · AI support assistant
          </p>
          <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Answers at 11pm, not just 9–5</h2>
          <p className="mt-4 text-lg leading-relaxed text-white/75">
            Our assistant answers questions about prices, hours and health funds instantly, holds an appointment slot, and hands you to a real person when it isn’t sure.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <button onClick={open} className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 font-semibold text-navy transition hover:bg-sky">
              <MessageCircle className="size-5" aria-hidden /> Try it now
            </button>
            <Link to="/how-it-works" className="inline-flex items-center gap-2 rounded-full border border-white/25 px-5 py-3 font-semibold transition hover:bg-white/10">
              How it works <ArrowRight className="size-4" aria-hidden />
            </Link>
          </div>
        </div>
        <ul className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
          {[
            [MessageCircle, 'Trained on the clinic FAQ', '34 answers on pricing, bookings, policies and more.'],
            [CalendarDays, 'Books straight from the chat', 'Shows open times and holds a slot.'],
            [Headset, 'Human handoff', 'Collects a name and email and passes the chat on.'],
          ].map(([Icon, t, d]) => (
            <li key={t} className="flex gap-4 rounded-2xl bg-white/5 p-4 ring-1 ring-white/10">
              <Icon className="mt-0.5 size-5 shrink-0 text-[#ffb19f]" aria-hidden />
              <div>
                <p className="font-semibold">{t}</p>
                <p className="text-sm text-white/65">{d}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

function Pricing() {
  const { openWith } = useChat()
  return (
    <section id="pricing" className="mx-auto max-w-6xl px-5 py-20 sm:py-24">
      <div className="mx-auto max-w-2xl text-center">
        <Eyebrow>Pricing</Eyebrow>
        <h2 className="text-3xl font-extrabold tracking-tight text-balance text-navy sm:text-4xl">Clear prices, before you sit down</h2>
        <p className="mt-4 text-lg text-slate">You'll always get a written quote first. Health fund rebates are claimed on the spot.</p>
      </div>
      <div className="mt-12 grid gap-5 lg:grid-cols-3">
        {PLANS.map((p) => (
          <article key={p.name} className={`relative flex flex-col rounded-3xl p-8 ${p.featured ? 'bg-tide text-white shadow-2xl shadow-tide/30' : 'border border-line bg-white'}`}>
            {p.featured && <span className="absolute -top-3 left-8 rounded-full bg-coral px-3 py-1 text-xs font-bold text-white">Most popular</span>}
            <h3 className={`text-lg font-bold ${p.featured ? '' : 'text-navy'}`}>{p.name}</h3>
            <p className={`mt-1 text-sm ${p.featured ? 'text-white/75' : 'text-slate'}`}>{p.blurb}</p>
            <p className="mt-6 flex items-baseline gap-1">
              <span className={`text-5xl font-extrabold tracking-tight ${p.featured ? '' : 'text-navy'}`}>{p.price}</span>
              <span className={p.featured ? 'text-white/75' : 'text-slate'}>{p.unit}</span>
            </p>
            <ul className="mt-6 flex-1 space-y-3 text-[15px]">
              {p.items.map((i) => (
                <li key={i} className="flex gap-3">
                  <Check className={`mt-0.5 size-5 shrink-0 ${p.featured ? 'text-white' : 'text-tide'}`} aria-hidden /> {i}
                </li>
              ))}
            </ul>
            <button
              onClick={() => openWith(p.featured ? { type: 'ask', query: 'Do you have a membership or care plan?' } : BOOK)}
              className={`mt-8 rounded-full py-3 font-semibold transition ${p.featured ? 'bg-white text-tide hover:bg-sky' : 'bg-navy text-white hover:bg-navy-soft'}`}
            >
              {p.cta}
            </button>
          </article>
        ))}
      </div>
      <div className="mt-8 rounded-3xl border border-line bg-mist p-6 sm:p-8">
        <h3 className="font-bold text-navy">Other common treatments</h3>
        <dl className="mt-4 grid gap-x-10 sm:grid-cols-2">
          {MORE_PRICES.map(([k, v]) => (
            <div key={k} className="flex justify-between gap-4 border-b border-line py-3 text-[15px] last:border-0 sm:[&:nth-last-child(2)]:border-0">
              <dt className="text-slate">{k}</dt>
              <dd className="font-semibold whitespace-nowrap text-navy">{v}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  )
}

function Reviews() {
  return (
    <section className="bg-mist py-20 sm:py-24">
      <div className="mx-auto max-w-6xl px-5">
        <Eyebrow>Patient stories</Eyebrow>
        <h2 className="max-w-xl text-3xl font-extrabold tracking-tight text-balance text-navy sm:text-4xl">People who used to dread the dentist</h2>
        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {REVIEWS.map((r) => (
            <figure key={r.name} className="rounded-3xl bg-white p-7 shadow-sm">
              <Quote className="size-7 text-coral" aria-hidden />
              <blockquote className="mt-4 leading-relaxed text-slate-ink">{r.text}</blockquote>
              <figcaption className="mt-5 flex items-center justify-between text-sm">
                <span className="font-bold text-navy">{r.name}</span>
                <span className="flex text-amber-400" aria-label="5 out of 5 stars">
                  {[...Array(5)].map((_, i) => <Star key={i} className="size-3.5 fill-current" aria-hidden />)}
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  )
}

function Faq() {
  const { openWith } = useChat()
  const items = FAQ_IDS.map((id) => kb.find((k) => k.id === id))
  const [openId, setOpenId] = useState(items[0].id)
  return (
    <section id="faq" className="mx-auto grid max-w-6xl gap-12 px-5 py-20 sm:py-24 lg:grid-cols-[1fr_1.6fr]">
      <div>
        <Eyebrow>FAQ</Eyebrow>
        <h2 className="text-3xl font-extrabold tracking-tight text-balance text-navy sm:text-4xl">Questions, answered</h2>
        <p className="mt-4 text-lg text-slate">These come from the same knowledge base the assistant uses — so the answers always match.</p>
        <button onClick={() => openWith({ type: 'ask', query: 'What services do you offer?' })} className="mt-7 inline-flex items-center gap-2 rounded-full bg-navy px-5 py-3 font-semibold text-white transition hover:bg-navy-soft">
          <MessageCircle className="size-5" aria-hidden /> Ask something else
        </button>
      </div>
      <div className="divide-y divide-line border-y border-line">
        {items.map((f) => {
          const isOpen = openId === f.id
          return (
            <div key={f.id}>
              <h3>
                <button
                  onClick={() => setOpenId(isOpen ? null : f.id)}
                  aria-expanded={isOpen}
                  aria-controls={`faq-${f.id}`}
                  className="flex w-full items-center justify-between gap-6 py-5 text-left text-[17px] font-semibold text-navy"
                >
                  {f.q}
                  <span className="grid size-8 shrink-0 place-items-center rounded-full bg-sky text-tide">
                    {isOpen ? <Minus className="size-4" aria-hidden /> : <Plus className="size-4" aria-hidden />}
                  </span>
                </button>
              </h3>
              <div id={`faq-${f.id}`} hidden={!isOpen} className="pr-12 pb-6 leading-relaxed whitespace-pre-line text-slate">
                <RichText text={f.a} />
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}

function Contact() {
  const { openWith } = useChat()
  return (
    <section id="contact" className="bg-gradient-to-b from-white to-sky pb-24">
      <div className="mx-auto max-w-6xl px-5">
        <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
          <div className="rounded-3xl border border-line bg-white p-8 sm:p-10">
            <Eyebrow>Contact & hours</Eyebrow>
            <h2 className="text-3xl font-extrabold tracking-tight text-navy">Come and say hello</h2>
            <ul className="mt-7 space-y-4 text-[15px]">
              <li className="flex gap-3"><MapPin className="size-5 shrink-0 text-tide" aria-hidden /> 214 Sydney Road, Brunswick VIC 3056</li>
              <li className="flex gap-3"><Phone className="size-5 shrink-0 text-tide" aria-hidden /> <a href="tel:+61391234567" className="font-semibold text-navy hover:text-tide">(03) 9123 4567</a></li>
              <li className="flex gap-3"><Mail className="size-5 shrink-0 text-tide" aria-hidden /> hello@tidewell.example</li>
              <li className="flex gap-3"><Train className="size-5 shrink-0 text-tide" aria-hidden /> Tram 19, stop 21 · Jewell Station 4 min walk</li>
              <li className="flex gap-3"><Car className="size-5 shrink-0 text-tide" aria-hidden /> Free 2-hour parking on Ballarat Street</li>
            </ul>
            <h3 className="mt-9 font-bold text-navy">Opening hours</h3>
            <dl className="mt-3 text-[15px]">
              {HOURS.map(([d, h]) => (
                <div key={d} className="flex justify-between border-b border-line py-2.5 last:border-0">
                  <dt className="text-slate">{d}</dt>
                  <dd className={`font-semibold ${h === 'Closed' ? 'text-slate' : 'text-navy'}`}>{h}</dd>
                </div>
              ))}
            </dl>
            <div className="mt-8 flex flex-wrap gap-3">
              <button onClick={() => openWith(BOOK)} className="rounded-full bg-tide px-5 py-3 font-semibold text-white hover:bg-tide-dark">Book online</button>
              <button onClick={() => openWith({ type: 'human', label: 'Talk to a human' })} className="inline-flex items-center gap-2 rounded-full border border-line px-5 py-3 font-semibold text-navy hover:border-tide hover:text-tide">
                <Headset className="size-5" aria-hidden /> Message the team
              </button>
            </div>
          </div>
          <MapCard />
        </div>
      </div>
    </section>
  )
}

function MapCard() {
  return (
    <div className="relative min-h-80 overflow-hidden rounded-3xl border border-line bg-[#e9eef7]" role="img" aria-label="Map: Tidewell Dental on Sydney Road, Brunswick, next to tram stop 21">
      <svg viewBox="0 0 400 420" className="absolute inset-0 size-full" preserveAspectRatio="xMidYMid slice" aria-hidden>
        <rect width="400" height="420" fill="#e9eef7" />
        {[40, 120, 250, 330].map((y) => <rect key={y} x="0" y={y} width="400" height="14" fill="#fff" />)}
        {[60, 290].map((x) => <rect key={x} x={x} y="0" width="12" height="420" fill="#fff" />)}
        <rect x="170" y="0" width="30" height="420" fill="#fff" />
        <line x1="185" y1="0" x2="185" y2="420" stroke="#f26b4f" strokeWidth="2" strokeDasharray="6 6" opacity=".6" />
        <rect x="215" y="150" width="60" height="85" rx="8" fill="#d5dff0" />
        <rect x="90" y="150" width="65" height="85" rx="8" fill="#d5dff0" />
        <rect x="215" y="270" width="60" height="50" rx="8" fill="#cfe6d8" />
        <text x="178" y="400" fontSize="11" fill="#5a6782" transform="rotate(-90 178 400)">Sydney Road</text>
        <text x="215" y="137" fontSize="11" fill="#5a6782">Ballarat St</text>
      </svg>
      <div className="absolute top-[38%] left-[52%] -translate-x-1/2 -translate-y-full">
        <div className="rounded-2xl bg-navy px-3.5 py-2 text-sm font-semibold whitespace-nowrap text-white shadow-lg">Tidewell Dental</div>
        <div className="mx-auto size-3 -translate-y-1.5 rotate-45 bg-navy" />
      </div>
      <a href="https://maps.google.com/?q=Sydney+Road+Brunswick+VIC" target="_blank" rel="noreferrer" className="absolute bottom-4 left-4 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2.5 text-sm font-semibold text-navy shadow-md hover:text-tide">
        <MapPin className="size-4" aria-hidden /> Open in Maps
      </a>
    </div>
  )
}
