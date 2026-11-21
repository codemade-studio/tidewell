import { createContext, useCallback, useContext, useEffect, useId, useMemo, useRef, useState } from 'react'
import { ArrowUpRight, CalendarCheck, CalendarDays, ChevronDown, Headset, MessageCircle, RotateCcw, SendHorizontal, ShieldCheck, Sparkles, UserRound, X } from 'lucide-react'
import { GREETING, QUICK_REPLIES, nextSlots, reply } from '../../lib/bot.js'
import { RichText, plainLength } from '../../lib/richtext.jsx'
import { Logo } from '../Logo.jsx'

const STORAGE = 'tidewell-chat-v1'
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const ChatContext = createContext(null)
export const useChat = () => useContext(ChatContext)

const prefersReducedMotion = () => typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

function freshState() {
  return { messages: [{ id: 1, ...GREETING }], handoff: null, unread: 1, seq: 2 }
}

function loadState() {
  try {
    const s = JSON.parse(localStorage.getItem(STORAGE))
    if (s && Array.isArray(s.messages) && s.messages.length) return s
  } catch {
    /* ignore corrupt storage */
  }
  return freshState()
}

export function ChatProvider({ children }) {
  const [state, setState] = useState(loadState)
  const [isOpen, setOpen] = useState(false)
  const [typing, setTyping] = useState(false)
  const [streaming, setStreaming] = useState(null) // { id, n, total }
  const [teaser, setTeaser] = useState(false)
  const timers = useRef([])
  const openRef = useRef(isOpen)
  openRef.current = isOpen

  const { messages, handoff, unread } = state

  useEffect(() => {
    localStorage.setItem(STORAGE, JSON.stringify(state))
  }, [state])

  useEffect(() => () => timers.current.forEach(clearTimeout), [])

  // A short teaser bubble the first time someone lands with an unread greeting.
  useEffect(() => {
    if (unread > 0 && !isOpen && !sessionStorage.getItem('tidewell-teaser')) {
      const t = setTimeout(() => setTeaser(true), 1400)
      return () => clearTimeout(t)
    }
  }, [unread, isOpen])

  const dismissTeaser = () => {
    setTeaser(false)
    sessionStorage.setItem('tidewell-teaser', '1')
  }

  // Reveal the newest bot message a few characters at a time.
  useEffect(() => {
    if (!streaming) return
    if (streaming.n >= streaming.total) {
      setStreaming(null)
      return
    }
    const t = setTimeout(() => setStreaming((s) => s && { ...s, n: s.n + 3 }), 14)
    return () => clearTimeout(t)
  }, [streaming])

  const addMessage = useCallback((msg) => {
    setState((s) => ({ ...s, seq: s.seq + 1, messages: [...s.messages, { id: s.seq, ...msg }] }))
  }, [])

  const botSay = useCallback(
    (msg) => {
      const text = msg.text ?? ''
      setTyping(true)
      const delay = prefersReducedMotion() ? 150 : 450 + Math.min(700, text.length * 4)
      timers.current.push(
        setTimeout(() => {
          setTyping(false)
          setState((s) => {
            const id = s.seq
            if (!prefersReducedMotion()) setStreaming({ id, n: 0, total: plainLength(text) })
            return {
              ...s,
              seq: s.seq + 1,
              messages: [...s.messages, { id, role: 'bot', ...msg }],
              unread: !openRef.current ? s.unread + 1 : s.unread,
            }
          })
        }, delay),
      )
    },
    [],
  )

  const setHandoff = (h) => setState((s) => ({ ...s, handoff: h }))

  const startHandoff = useCallback(() => {
    setHandoff({ step: 'name' })
    botSay({
      text: "Sure — I'll hand this chat to our front desk team. First, **what's your name?**",
      actions: [{ type: 'cancel-handoff', label: 'Cancel' }],
    })
  }, [botSay])

  const sendText = useCallback(
    (raw) => {
      const text = raw.trim()
      if (!text) return
      addMessage({ role: 'user', text })

      if (handoff && handoff.step !== 'done') {
        if (/^(cancel|stop|never ?mind|back)$/i.test(text)) {
          setHandoff(null)
          botSay({ text: 'No problem — I\'ve cancelled that. What else can I help with?', chips: true })
          return
        }
        if (handoff.step === 'name') {
          if (text.length < 2 || /\d|@/.test(text)) {
            botSay({ text: 'Could you type just your name? For example **Sam Lee**.', actions: [{ type: 'cancel-handoff', label: 'Cancel' }] })
            return
          }
          const name = text.replace(/^(i'?m|my name is|it'?s)\s+/i, '').replace(/\b\w/g, (c) => c.toUpperCase())
          setHandoff({ step: 'email', name })
          botSay({
            text: `Thanks, ${name.split(' ')[0]}! **What's the best email** for the team to reply to?`,
            actions: [{ type: 'cancel-handoff', label: 'Cancel' }],
          })
          return
        }
        if (handoff.step === 'email') {
          if (!EMAIL.test(text)) {
            botSay({ text: "That doesn't look like an email address — could you check it? For example **sam@example.com**.", actions: [{ type: 'cancel-handoff', label: 'Cancel' }] })
            return
          }
          setHandoff(null)
          botSay({
            kind: 'handoff-card',
            text: "You're all set. I've passed this conversation to the Tidewell front desk — they usually reply within **1 business hour**.",
            data: { name: handoff.name, email: text, count: messages.filter((m) => m.role === 'user').length + 1 },
          })
          return
        }
      }

      const r = reply(text)
      if (r.kind === 'handoff-start') startHandoff()
      else botSay(r)
    },
    [addMessage, botSay, handoff, messages, startHandoff],
  )

  const runAction = useCallback(
    (a) => {
      if (a.type === 'ask') return sendText(a.query)
      if (a.type === 'human') {
        addMessage({ role: 'user', text: a.label })
        return startHandoff()
      }
      if (a.type === 'cancel-handoff') {
        addMessage({ role: 'user', text: 'Cancel' })
        setHandoff(null)
        return botSay({ text: "No problem — I've cancelled that. What else can I help with?", chips: true })
      }
      if (a.type === 'book') {
        addMessage({ role: 'user', text: a.label })
        return botSay({ kind: 'slots', text: 'Here are the next open times for a **check-up & clean** (60 min). Tap one to hold it:', slots: nextSlots() })
      }
      if (a.type === 'slot') {
        addMessage({ role: 'user', text: `${a.day} at ${a.time}` })
        return botSay({
          kind: 'booked',
          text: `Great — **${a.day} at ${a.time}** is pencilled in with Dr Maya Chen. In this demo nothing is booked; a production build would confirm it in the clinic's booking system and SMS you.`,
          data: { day: a.day, time: a.time },
          actions: [{ type: 'ask', label: 'What should I bring?', query: 'What happens at my first visit?' }, { type: 'human', label: 'Talk to a human' }],
        })
      }
    },
    [addMessage, botSay, sendText, startHandoff],
  )

  const open = useCallback(() => {
    setOpen(true)
    setTeaser(false)
    sessionStorage.setItem('tidewell-teaser', '1')
    setState((s) => (s.unread ? { ...s, unread: 0 } : s))
  }, [])

  const openWith = useCallback(
    (action) => {
      open()
      if (action) setTimeout(() => runAction(action), 250)
    },
    [open, runAction],
  )

  const reset = () => {
    timers.current.forEach(clearTimeout)
    timers.current = []
    setTyping(false)
    setStreaming(null)
    setState({ ...freshState(), unread: 0 })
  }

  const ctx = useMemo(() => ({ open, openWith }), [open, openWith])

  return (
    <ChatContext.Provider value={ctx}>
      {children}
      <ChatWindow
        {...{ messages, handoff, unread, isOpen, typing, streaming, teaser }}
        onOpen={open}
        onClose={() => setOpen(false)}
        onSend={sendText}
        onAction={runAction}
        onReset={reset}
        onDismissTeaser={dismissTeaser}
      />
    </ChatContext.Provider>
  )
}

function ChatWindow({ messages, handoff, unread, isOpen, typing, streaming, teaser, onOpen, onClose, onSend, onAction, onReset, onDismissTeaser }) {
  const panelId = useId()
  const [draft, setDraft] = useState('')
  const inputRef = useRef(null)
  const launcherRef = useRef(null)
  const logRef = useRef(null)
  const wasOpen = useRef(false)
  const busy = typing || !!streaming

  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus({ preventScroll: true }), 220)
    else if (wasOpen.current) launcherRef.current?.focus()
    wasOpen.current = isOpen
  }, [isOpen])

  useEffect(() => {
    const el = logRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [messages, typing, streaming, isOpen])

  useEffect(() => {
    if (!isOpen) return
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isOpen, onClose])

  const submit = (e) => {
    e.preventDefault()
    if (busy || !draft.trim()) return
    onSend(draft)
    setDraft('')
  }

  const lastBotId = [...messages].reverse().find((m) => m.role === 'bot')?.id
  const step = handoff?.step
  const placeholder = step === 'name' ? 'Type your name…' : step === 'email' ? 'you@example.com' : 'Ask about prices, hours, bookings…'

  return (
    <>
      {/* Teaser bubble */}
      <div
        className={`fixed right-5 bottom-24 z-40 w-72 origin-bottom-right transition duration-300 sm:right-6 ${
          teaser && !isOpen ? 'translate-y-0 scale-100 opacity-100' : 'pointer-events-none translate-y-2 scale-95 opacity-0'
        }`}
        inert={!(teaser && !isOpen)}
      >
        <div className="relative rounded-2xl border border-line bg-white p-4 pr-9 text-sm text-slate shadow-xl shadow-navy/10">
          <button onClick={onDismissTeaser} className="absolute top-2 right-2 rounded-full p-1 text-slate hover:bg-mist hover:text-navy" aria-label="Dismiss message">
            <X className="size-4" />
          </button>
          <button onClick={onOpen} className="text-left">
            <span className="block font-semibold text-navy">Hi there 👋</span>
            Questions about prices, health funds or bookings? I can help right now.
          </button>
        </div>
      </div>

      {/* Launcher */}
      <button
        ref={launcherRef}
        onClick={isOpen ? onClose : onOpen}
        aria-expanded={isOpen}
        aria-controls={panelId}
        aria-label={isOpen ? 'Close chat' : unread ? `Open chat, ${unread} unread message${unread > 1 ? 's' : ''}` : 'Open chat'}
        className={`fixed right-5 bottom-5 z-50 grid size-15 place-items-center rounded-full bg-tide text-white shadow-lg shadow-tide/30 transition hover:bg-tide-dark focus-visible:ring-4 focus-visible:ring-tide/30 focus-visible:outline-none sm:right-6 sm:bottom-6 ${
          isOpen ? 'max-sm:hidden' : ''
        }`}
      >
        <MessageCircle className={`absolute size-6.5 transition duration-300 ${isOpen ? 'scale-50 rotate-90 opacity-0' : 'scale-100 opacity-100'}`} aria-hidden />
        <ChevronDown className={`absolute size-7 transition duration-300 ${isOpen ? 'scale-100 opacity-100' : 'scale-50 -rotate-90 opacity-0'}`} aria-hidden />
        {!isOpen && unread > 0 && (
          <span className="absolute -top-1 -right-1 grid h-5.5 min-w-5.5 place-items-center rounded-full bg-coral px-1.5 text-xs font-bold text-white ring-2 ring-white" aria-hidden>
            {unread}
          </span>
        )}
      </button>

      {/* Mobile backdrop */}
      <div
        onClick={onClose}
        className={`fixed inset-0 z-40 bg-navy/40 transition-opacity duration-300 sm:hidden ${isOpen ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
        aria-hidden
      />

      {/* Panel */}
      <section
        id={panelId}
        role="dialog"
        aria-label="Tidewell assistant chat"
        inert={!isOpen}
        className={`fixed z-50 flex flex-col overflow-hidden bg-white shadow-2xl shadow-navy/20 transition duration-300 ease-out max-sm:inset-x-0 max-sm:bottom-0 max-sm:h-[88dvh] max-sm:rounded-t-3xl sm:right-6 sm:bottom-24 sm:h-[min(660px,calc(100dvh-8rem))] sm:w-[400px] sm:origin-bottom-right sm:rounded-3xl sm:border sm:border-line ${
          isOpen ? 'translate-y-0 scale-100 opacity-100' : 'pointer-events-none translate-y-6 opacity-0 sm:scale-95'
        }`}
      >
        <header className="flex items-center gap-3 bg-navy px-4 py-3.5 text-white">
          <span className="relative grid size-10 shrink-0 place-items-center rounded-full bg-white/10">
            <Logo className="size-6" light />
            <span className="absolute right-0 bottom-0 size-2.5 rounded-full bg-emerald-400 ring-2 ring-navy" aria-hidden />
          </span>
          <div className="min-w-0 flex-1">
            <h2 className="text-[15px] leading-tight font-semibold">Tidewell assistant</h2>
            <p className="flex items-center gap-1 text-xs text-white/70">
              <Sparkles className="size-3" aria-hidden /> Demo · <span className="max-sm:hidden">answers from the</span> clinic FAQ
            </p>
          </div>
          <button onClick={onReset} className="rounded-full p-2 text-white/80 transition hover:bg-white/10 hover:text-white" aria-label="Restart conversation" title="Restart conversation">
            <RotateCcw className="size-4.5" />
          </button>
          <button onClick={onClose} className="rounded-full p-2 text-white/80 transition hover:bg-white/10 hover:text-white" aria-label="Close chat" title="Close">
            <X className="size-5" />
          </button>
        </header>

        {step && step !== 'done' && (
          <div className="flex items-center gap-2 border-b border-line bg-sky px-4 py-2 text-xs font-medium text-tide-dark">
            <Headset className="size-4" aria-hidden />
            Connecting you to the front desk · step {step === 'name' ? 1 : 2} of 2
          </div>
        )}

        <div ref={logRef} role="log" aria-live="polite" aria-busy={busy} className="flex-1 space-y-4 overflow-y-auto bg-mist px-4 py-5">
          <p className="text-center text-[11px] font-medium tracking-wide text-slate/80 uppercase">Today</p>
          {messages.map((m) => (
            <Message
              key={m.id}
              m={m}
              limit={streaming?.id === m.id ? streaming.n : Infinity}
              done={streaming?.id !== m.id}
              latest={m.id === lastBotId}
              onAction={onAction}
              busy={busy}
            />
          ))}
          {typing && (
            <div className="flex items-start gap-2" role="status" aria-label="Assistant is typing">
              <BotAvatar />
              <div className="flex gap-1 rounded-2xl rounded-bl-md bg-white px-4 py-3.5 shadow-sm">
                {[0, 1, 2].map((i) => (
                  <span key={i} className="typing-dot size-2 rounded-full bg-slate/50" style={{ animationDelay: `${i * 0.15}s` }} />
                ))}
              </div>
            </div>
          )}
        </div>

        <form onSubmit={submit} noValidate className="border-t border-line bg-white px-3 pt-3 pb-2">
          <div className="flex items-center gap-2 rounded-2xl border border-line bg-mist px-2 py-1.5 focus-within:border-tide focus-within:ring-2 focus-within:ring-tide/20">
            <label htmlFor={`${panelId}-input`} className="sr-only">
              {step === 'name' ? 'Your name' : step === 'email' ? 'Your email' : 'Message'}
            </label>
            <input
              id={`${panelId}-input`}
              ref={inputRef}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder={placeholder}
              type={step === 'email' ? 'email' : 'text'}
              autoComplete={step === 'name' ? 'name' : step === 'email' ? 'email' : 'off'}
              maxLength={300}
              className="min-w-0 flex-1 bg-transparent px-2 py-1.5 text-[15px] text-navy placeholder:text-slate/70 focus:outline-none"
            />
            <button
              type="submit"
              disabled={busy || !draft.trim()}
              className="grid size-9 shrink-0 place-items-center rounded-xl bg-tide text-white transition hover:bg-tide-dark disabled:bg-slate/30"
              aria-label="Send message"
            >
              <SendHorizontal className="size-4.5" />
            </button>
          </div>
          <p className="mt-2 px-1 text-center text-[11px] leading-snug text-slate">
            Concept demo — runs on a local knowledge base. Production builds connect to an LLM.
          </p>
        </form>
      </section>
    </>
  )
}

function BotAvatar() {
  return (
    <span className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-full bg-navy" aria-hidden>
      <Logo className="size-4" light />
    </span>
  )
}

function Message({ m, limit, done, latest, onAction, busy }) {
  if (m.role === 'user') {
    return (
      <div className="flex justify-end">
        <p className="max-w-[82%] rounded-2xl rounded-br-md bg-tide px-3.5 py-2.5 text-[14.5px] leading-relaxed whitespace-pre-wrap text-white">{m.text}</p>
      </div>
    )
  }
  const showExtras = done
  return (
    <div className="flex items-start gap-2">
      <BotAvatar />
      <div className="max-w-[86%] min-w-0 space-y-2">
        <div className="rounded-2xl rounded-bl-md bg-white px-3.5 py-2.5 text-[14.5px] leading-relaxed text-slate-ink shadow-sm">
          <span className="sr-only">Assistant: </span>
          <RichText text={m.text} limit={limit} />
          {!done && <span className="ml-0.5 inline-block h-4 w-1.5 translate-y-0.5 animate-pulse rounded-sm bg-tide/60" aria-hidden />}
          {showExtras && m.kind === 'answer' && m.source && (
            <p className="mt-2 flex items-center gap-1 border-t border-line pt-2 text-[11px] text-slate">
              <ShieldCheck className="size-3.5 text-tide" aria-hidden />
              Source: clinic FAQ · {m.source.topic} · {Math.round(Math.min(m.score, 1) * 100)}% match
            </p>
          )}
        </div>

        {showExtras && m.kind === 'slots' && (
          <div className="space-y-2 rounded-2xl border border-line bg-white p-3 shadow-sm">
            {m.slots.map((d) => (
              <div key={d.date}>
                <p className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-navy">
                  <CalendarDays className="size-3.5 text-tide" aria-hidden /> {d.label}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {d.times.map((t) => (
                    <button
                      key={t}
                      disabled={!latest || busy}
                      onClick={() => onAction({ type: 'slot', day: d.label, time: t })}
                      className="rounded-lg border border-tide/30 bg-sky px-2.5 py-1.5 text-xs font-semibold text-tide-dark transition hover:border-tide hover:bg-tide hover:text-white disabled:pointer-events-none disabled:opacity-50"
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            ))}
            <p className="text-[11px] text-slate">Demo availability — no real bookings are made.</p>
          </div>
        )}

        {showExtras && m.kind === 'booked' && (
          <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-3 text-sm">
            <CalendarCheck className="size-8 shrink-0 text-emerald-600" aria-hidden />
            <div>
              <p className="font-semibold text-navy">Slot held (demo)</p>
              <p className="text-xs text-slate">
                {m.data.day} · {m.data.time} · 214 Sydney Rd
              </p>
            </div>
          </div>
        )}

        {showExtras && m.kind === 'handoff-card' && (
          <div className="rounded-2xl border border-line bg-white p-3.5 text-sm shadow-sm">
            <p className="mb-2 flex items-center gap-2 font-semibold text-navy">
              <Headset className="size-4 text-tide" aria-hidden /> Handed to the front desk
            </p>
            <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-xs">
              <dt className="text-slate">Name</dt>
              <dd className="truncate font-medium text-navy">{m.data.name}</dd>
              <dt className="text-slate">Email</dt>
              <dd className="truncate font-medium text-navy">{m.data.email}</dd>
              <dt className="text-slate">Chat</dt>
              <dd className="font-medium text-navy">{m.data.count} messages attached</dd>
            </dl>
            <p className="mt-2.5 rounded-lg bg-amber-50 px-2.5 py-1.5 text-[11px] text-amber-800">Demo only — nothing was sent. In production this lands in the clinic's inbox or helpdesk.</p>
          </div>
        )}

        {showExtras && m.actions?.some((a) => latest || a.type !== 'cancel-handoff') && (
          <div className="flex flex-wrap gap-1.5">
            {m.actions.filter((a) => latest || a.type !== 'cancel-handoff').map((a) =>
              a.type === 'link' ? (
                <a
                  key={a.label}
                  href={a.href}
                  target={a.href.startsWith('http') ? '_blank' : undefined}
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 rounded-full border border-line bg-white px-3 py-1.5 text-xs font-semibold text-navy transition hover:border-tide hover:text-tide"
                >
                  {a.label} <ArrowUpRight className="size-3.5" aria-hidden />
                </a>
              ) : (
                <button
                  key={a.label}
                  onClick={() => onAction(a)}
                  disabled={busy || (!latest && a.type === 'cancel-handoff')}
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-left text-xs font-semibold transition disabled:opacity-50 ${
                    a.type === 'book'
                      ? 'bg-tide text-white hover:bg-tide-dark'
                      : a.type === 'human'
                        ? 'border border-coral/40 bg-coral/10 text-coral-dark hover:bg-coral hover:text-white'
                        : 'border border-line bg-white text-navy hover:border-tide hover:text-tide'
                  }`}
                >
                  {a.type === 'book' && <CalendarDays className="size-3.5" aria-hidden />}
                  {a.type === 'human' && <UserRound className="size-3.5" aria-hidden />}
                  {a.label}
                </button>
              ),
            )}
          </div>
        )}

        {showExtras && m.chips && latest && (
          <div className="flex flex-wrap gap-1.5 pt-0.5">
            {QUICK_REPLIES.map((q) => (
              <button
                key={q.label}
                disabled={busy}
                onClick={() => onAction(q.intent === 'book' ? { type: 'book', label: q.label } : q.intent === 'human' ? { type: 'human', label: q.label } : { type: 'ask', query: q.query })}
                className="rounded-full border border-tide/30 bg-white px-3 py-1.5 text-xs font-semibold text-tide-dark transition hover:bg-tide hover:text-white disabled:opacity-50"
              >
                {q.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
