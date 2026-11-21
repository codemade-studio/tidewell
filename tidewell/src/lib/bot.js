import kb from '../data/kb.json'
import { createIndex, search } from './retrieval.js'

export const index = createIndex(kb)
export { kb }

export const CONFIDENT = 0.5
export const POSSIBLE = 0.3

export const QUICK_REPLIES = [
  { label: 'Prices', query: 'How much is a check-up and clean?' },
  { label: 'Opening hours', query: 'What are your opening hours?' },
  { label: 'Book a slot', intent: 'book' },
  { label: 'Health funds', query: 'Do you accept my health insurance?' },
  { label: 'Talk to a human', intent: 'human' },
]

export const GREETING = {
  role: 'bot',
  text: "Hi, I'm the **Tidewell assistant** 👋 I can help with prices, opening hours, bookings, health funds and more. What can I help you with?",
  chips: true,
}

const HUMAN = /\b(human|real person|a person|someone|somebody|agent|staff|receptionist|operator|talk to (a|the|your) (team|people|dentist)|speak (to|with))\b/i
const GREET = /^\s*(hi|hello|hey|hiya|g'?day|good (morning|afternoon|evening))[\s!.,]*(there)?[\s!.]*$/i
const THANKS = /\b(thanks|thank you|thx|cheers|ta|appreciate it|great|perfect|awesome)\b[\s!.]*$/i
const BYE = /^\s*(bye|goodbye|see ya|that'?s all|no thanks|nope)[\s!.]*$/i

export function reply(text) {
  if (HUMAN.test(text)) return { kind: 'handoff-start' }
  if (GREET.test(text)) return { kind: 'text', text: 'Hello! Ask me anything about the clinic — for example "How much is whitening?" or "Are you open on Saturday?"', chips: true }
  if (BYE.test(text)) return { kind: 'text', text: 'No worries — have a great day! If anything comes up, I\'m right here.' }
  if (THANKS.test(text) && text.length < 40) return { kind: 'text', text: "You're welcome! Is there anything else I can help with?", chips: true }

  const { results } = search(index, text)
  const [top, second] = results
  if (top && top.score >= CONFIDENT) {
    const close = second && top.score - second.score < 0.05 && top.score < 0.85
    if (!close) return { kind: 'answer', text: top.entry.a, actions: top.entry.actions, source: top.entry, score: top.score }
  }
  if (top && top.score >= POSSIBLE) {
    return {
      kind: 'suggest',
      text: "I'm not 100% sure I understood. Did you mean one of these?",
      actions: [
        ...results.filter((r) => r.score >= POSSIBLE * 0.9).map((r) => ({ type: 'ask', label: r.entry.q, query: r.entry.q })),
        { type: 'human', label: 'Talk to a human' },
      ],
      score: top.score,
    }
  }
  return {
    kind: 'fallback',
    text: "Sorry, I don't have an answer for that yet. I can pass your question to our front desk team — they usually reply within an hour during opening hours.",
    actions: [{ type: 'human', label: 'Talk to a human' }, { type: 'ask', label: 'What services do you offer?', query: 'What services do you offer?' }],
    score: top?.score ?? 0,
  }
}

// Demo availability: deterministic "open" slots for the next three clinic days.
const HOURS = { 1: [8, 18], 2: [8, 18], 3: [8, 18], 4: [8, 20], 5: [8, 18], 6: [9, 14] }
export function nextSlots(from = new Date()) {
  const days = []
  const d = new Date(from)
  d.setHours(0, 0, 0, 0)
  while (days.length < 3) {
    d.setDate(d.getDate() + 1)
    const h = HOURS[d.getDay()]
    if (!h) continue
    const seed = d.getDate() * 7 + d.getMonth() * 13
    const times = []
    for (let m = h[0] * 60; m < (h[1] - 1) * 60; m += 30) if ((m / 30 + seed) % 5 === 0) times.push(m)
    days.push({
      date: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`,
      label: d.toLocaleDateString('en-AU', { weekday: 'short', day: 'numeric', month: 'short' }),
      times: times.slice(0, 4).map((m) => {
        const hh = Math.floor(m / 60)
        const mm = String(m % 60).padStart(2, '0')
        return `${((hh + 11) % 12) + 1}:${mm}${hh < 12 ? 'am' : 'pm'}`
      }),
    })
  }
  return days
}
