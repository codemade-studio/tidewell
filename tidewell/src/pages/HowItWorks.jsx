import { useMemo, useState } from 'react'
import { ArrowRight, BookOpenText, ChartColumn, Check, Code2, Copy, Globe, Headset, Lock, MessageCircle, Palette, Search, Sparkles } from 'lucide-react'
import { useChat } from '../components/chat/ChatWidget.jsx'
import { index, kb, CONFIDENT, POSSIBLE } from '../lib/bot.js'
import { search } from '../lib/retrieval.js'

const SNIPPET = `<!-- Tidewell assistant: paste before </body> -->
<script
  src="https://cdn.your-agency.com/assistant.js"
  data-bot-id="tidewell-dental"
  data-accent="#2457e6"
  defer
></script>`

const STEPS = [
  { icon: Code2, title: 'Drop in one script tag', text: 'The widget loads on its own and works on WordPress, Webflow, Shopify, Squarespace or a custom React or Next.js site. No rebuild needed.' },
  { icon: BookOpenText, title: "Trained on the client's FAQ", text: 'We turn the client’s FAQ, price list and policies into a knowledge base. Answers stay grounded in it and show their source, so the bot doesn’t make things up.' },
  { icon: Headset, title: 'Hands off to a human', text: 'When the bot isn’t sure, or the visitor asks, it collects a name and email and sends the full chat to the client’s inbox, Slack or helpdesk.' },
]

const COMPARE = [
  ['Answers', 'TF-IDF retrieval with typo tolerance over 34 local Q&As', 'LLM (e.g. GPT or Claude) grounded on the client’s knowledge base with vector search'],
  ['Booking', 'Demo time slots, nothing is booked', 'Live availability from the practice’s booking system, with SMS confirmation'],
  ['Human handoff', 'Collects name + email in the chat, nothing is sent', 'Creates a ticket in Help Scout, Zendesk, HubSpot or email, with the transcript'],
  ['Data', 'Kept in your browser (localStorage) only', 'Hosted in the client’s region, with retention and privacy controls'],
  ['Insights', '—', 'Dashboard of top questions, unanswered questions and handoff rate'],
]

export default function HowItWorks() {
  const { open } = useChat()
  const [copied, setCopied] = useState(false)
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(SNIPPET)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {
      /* clipboard blocked */
    }
  }

  return (
    <>
      <section className="bg-gradient-to-b from-sky to-white">
        <div className="mx-auto max-w-4xl px-5 pt-16 pb-14 text-center sm:pt-20">
          <p className="mx-auto mb-5 inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-tide-dark shadow-sm">
            <Sparkles className="size-3.5 text-coral" aria-hidden /> For agencies · white-label by Codemade Studio
          </p>
          <h1 className="text-4xl leading-tight font-extrabold tracking-tight text-balance text-navy sm:text-5xl">An AI support assistant for any client site</h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-slate">
            Tidewell Dental is a fictional clinic we built to show the integration end to end. The chat in the corner is the real widget UI.{' '}
            <strong className="text-navy">This demo runs on a local knowledge base</strong>; production builds connect to an LLM.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <button onClick={open} className="inline-flex items-center gap-2 rounded-full bg-tide px-6 py-3.5 font-semibold text-white shadow-lg shadow-tide/25 hover:bg-tide-dark">
              <MessageCircle className="size-5" aria-hidden /> Open the demo chat
            </button>
            <a href="https://codemade.studio" className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-6 py-3.5 font-semibold text-navy hover:border-tide hover:text-tide">
              Work with Codemade <ArrowRight className="size-4" aria-hidden />
            </a>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-16">
        <ol className="grid gap-5 md:grid-cols-3">
          {STEPS.map((s, i) => (
            <li key={s.title} className="rounded-3xl border border-line bg-white p-7">
              <div className="flex items-center justify-between">
                <span className="grid size-12 place-items-center rounded-2xl bg-sky text-tide"><s.icon className="size-6" aria-hidden /></span>
                <span className="text-sm font-bold text-slate/50">0{i + 1}</span>
              </div>
              <h2 className="mt-5 text-lg font-bold text-navy">{s.title}</h2>
              <p className="mt-2 text-[15px] leading-relaxed text-slate">{s.text}</p>
            </li>
          ))}
        </ol>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1.15fr_1fr]">
          <div className="overflow-hidden rounded-3xl bg-navy text-white">
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-3">
              <p className="text-sm font-semibold text-white/80">Embed code (example)</p>
              <button onClick={copy} className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold hover:bg-white/20">
                {copied ? <Check className="size-3.5" aria-hidden /> : <Copy className="size-3.5" aria-hidden />} {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
            <pre className="overflow-x-auto p-5 text-[13px] leading-relaxed text-[#cfe0ff]"><code>{SNIPPET}</code></pre>
          </div>
          <ul className="grid gap-3 sm:grid-cols-2">
            {[
              [Palette, 'Matches the brand', 'Colours, fonts, avatar and tone of voice set per client.'],
              [Globe, 'Works on any stack', 'One script tag, or a React component for custom builds.'],
              [Lock, 'Privacy-minded', 'No tracking cookies. Handoffs only go where the client says.'],
              [ChartColumn, 'Learns what’s missing', 'Unanswered questions are flagged so the FAQ can grow.'],
            ].map(([Icon, t, d]) => (
              <li key={t} className="rounded-2xl border border-line bg-mist p-5">
                <Icon className="size-5 text-tide" aria-hidden />
                <p className="mt-3 font-bold text-navy">{t}</p>
                <p className="mt-1 text-sm text-slate">{d}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <Playground />

      <section className="mx-auto max-w-6xl px-5 py-16">
        <h2 className="text-3xl font-extrabold tracking-tight text-navy">This demo vs. a production build</h2>
        <p className="mt-3 text-slate">We keep the demo honest: nothing here calls a paid API, and nothing you type leaves your browser.</p>
        <div className="mt-8 overflow-x-auto rounded-3xl border border-line">
          <table className="w-full min-w-[640px] text-left text-[15px]">
            <thead className="bg-mist text-sm text-navy">
              <tr>
                <th scope="col" className="px-5 py-4 font-bold"> </th>
                <th scope="col" className="px-5 py-4 font-bold">This demo</th>
                <th scope="col" className="px-5 py-4 font-bold">Production</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {COMPARE.map(([k, a, b]) => (
                <tr key={k}>
                  <th scope="row" className="w-36 px-5 py-4 font-semibold text-navy">{k}</th>
                  <td className="px-5 py-4 text-slate">{a}</td>
                  <td className="px-5 py-4 text-slate-ink">{b}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 pb-20">
        <div className="flex flex-col items-start justify-between gap-6 rounded-[2rem] bg-tide px-8 py-10 text-white sm:flex-row sm:items-center sm:px-12">
          <div>
            <h2 className="text-2xl font-extrabold sm:text-3xl">Want this for your clients?</h2>
            <p className="mt-2 text-white/80">Codemade Studio builds it under your agency’s brand — design, build and handoff setup.</p>
          </div>
          <a href="https://codemade.studio" className="inline-flex shrink-0 items-center gap-2 rounded-full bg-white px-6 py-3.5 font-semibold text-tide hover:bg-sky">
            Talk to Codemade <ArrowRight className="size-4" aria-hidden />
          </a>
        </div>
      </section>
    </>
  )
}

function Playground() {
  const [q, setQ] = useState('how much r braces')
  const { results, terms } = useMemo(() => search(index, q, 3), [q])
  const top = results[0]?.score ?? 0
  const verdict = top >= CONFIDENT ? ['Answers directly', 'bg-emerald-100 text-emerald-800'] : top >= POSSIBLE ? ['Suggests options', 'bg-amber-100 text-amber-800'] : ['Offers human handoff', 'bg-coral/15 text-coral-dark']
  return (
    <section className="bg-mist py-16">
      <div className="mx-auto max-w-6xl px-5">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.4fr]">
          <div>
            <p className="mb-3 text-xs font-bold tracking-[0.18em] text-tide uppercase">Under the hood</p>
            <h2 className="text-3xl font-extrabold tracking-tight text-navy">See how the demo picks an answer</h2>
            <p className="mt-4 leading-relaxed text-slate">
              Type a question. The demo scores all {kb.length} knowledge-base entries with TF-IDF, synonyms and typo matching. Above {Math.round(CONFIDENT * 100)}% it answers; between {Math.round(POSSIBLE * 100)}% and {Math.round(CONFIDENT * 100)}% it asks “did you mean…?”; below that it offers a human.
            </p>
          </div>
          <div className="rounded-3xl border border-line bg-white p-6 shadow-sm">
            <label htmlFor="pg" className="text-sm font-semibold text-navy">Visitor question</label>
            <div className="mt-2 flex items-center gap-2 rounded-2xl border border-line bg-mist px-3 focus-within:border-tide focus-within:ring-2 focus-within:ring-tide/20">
              <Search className="size-4.5 text-slate" aria-hidden />
              <input id="pg" value={q} onChange={(e) => setQ(e.target.value)} className="min-w-0 flex-1 bg-transparent py-3 text-navy focus:outline-none" />
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-1.5 text-xs" aria-label="Matched terms">
              {terms.map((t, i) => (
                <span key={i} className={`rounded-md px-2 py-1 font-medium ${t.t ? 'bg-sky text-tide-dark' : 'bg-mist text-slate line-through'}`}>
                  {t.raw}{t.fuzzy && t.t ? ` → ${t.t}` : ''}
                </span>
              ))}
            </div>
            <div aria-live="polite">
              <p className="mt-5 flex items-center gap-2 text-sm text-slate">
                Result: <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${verdict[1]}`}>{q.trim() ? verdict[0] : '—'}</span>
              </p>
              <ul className="mt-3 space-y-2.5">
                {results.map((r) => (
                  <li key={r.entry.id} className="rounded-xl border border-line p-3">
                    <div className="flex items-center justify-between gap-3 text-sm">
                      <span className="font-semibold text-navy">{r.entry.q}</span>
                      <span className="font-mono text-xs text-slate">{Math.round(Math.min(r.score, 1) * 100)}%</span>
                    </div>
                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-mist">
                      <div className="h-full rounded-full bg-tide" style={{ width: `${Math.min(r.score, 1) * 100}%` }} />
                    </div>
                  </li>
                ))}
                {!results.length && q.trim() && <li className="rounded-xl border border-dashed border-line p-3 text-sm text-slate">No match — the assistant would offer a human handoff.</li>}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
