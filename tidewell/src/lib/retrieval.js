// A tiny TF-IDF retriever with typo tolerance. It runs fully in the browser:
// no API calls, no keys. Production builds swap this for an LLM + vector search
// grounded on the same knowledge base.

const STOP = new Set(
  'a an the and or but if of to in on at for from by with about as is are was were be been being am do does did doing i me my we our you your it its this that these those there here can could would should will shall may might must have has had having what which who whom how much many any some please tell know want need get got just also so than then too very really like there im ive id youre dont isnt hi hello hey'.split(' '),
)

// Map everyday words onto the terms the knowledge base uses.
const SYNONYMS = {
  cost: 'price', costs: 'price', fee: 'price', fees: 'price', charge: 'price', charges: 'price',
  pricing: 'price', prices: 'price', expensive: 'price', cheap: 'price', afford: 'price', quote: 'price', rate: 'price', rates: 'price',
  appointment: 'book', appointments: 'book', booking: 'book', bookings: 'book', reserve: 'book', schedule: 'book', slot: 'book', slots: 'book',
  opening: 'open', opened: 'open', closes: 'close', closing: 'close',
  doctor: 'dentist', dr: 'dentist', dentists: 'dentist',
  kid: 'child', kids: 'child', children: 'child', son: 'child', daughter: 'child', toddler: 'child', baby: 'child',
  toothache: 'pain', ache: 'pain', aching: 'pain', hurts: 'pain', hurt: 'pain', painful: 'pain', sore: 'pain',
  invisalign: 'aligner', braces: 'aligner', straighten: 'aligner', straight: 'aligner', crooked: 'aligner', orthodontic: 'aligner', orthodontics: 'aligner',
  whiten: 'whitening', white: 'whitening', whiter: 'whitening', bleach: 'whitening', bleaching: 'whitening',
  insurance: 'fund', insured: 'fund', funds: 'fund', hicaps: 'fund', rebate: 'fund', cover: 'fund', covered: 'fund',
  address: 'location', located: 'location', directions: 'location', where: 'location',
  telephone: 'phone', ring: 'phone', number: 'phone',
  xray: 'xray', 'x-ray': 'xray', xrays: 'xray',
  mouthguard: 'guard', grinding: 'grind', clenching: 'grind', clench: 'grind', bruxism: 'grind',
  scared: 'nervous', afraid: 'nervous', anxious: 'nervous', anxiety: 'nervous', fear: 'nervous', phobia: 'nervous',
  checkup: 'checkup', check: 'checkup', exam: 'checkup',
  instalments: 'instalment', installments: 'instalment', installment: 'instalment', afterpay: 'instalment',
}

export function stem(w) {
  if (w.length <= 3) return w
  if (w.endsWith('ies') && w.length > 4) return w.slice(0, -3) + 'y'
  if (w.endsWith('ing') && w.length > 5) return w.slice(0, -3)
  if (w.endsWith('ed') && w.length > 4) return w.slice(0, -2)
  if (w.endsWith('es') && /(ch|sh|x|ss)es$/.test(w)) return w.slice(0, -2)
  if (w.endsWith('s') && !w.endsWith('ss')) return w.slice(0, -1)
  return w
}

export function tokenize(text) {
  return text
    .toLowerCase()
    .replace(/x-rays?/g, 'xray')
    .replace(/check[\s-]?ups?/g, 'checkup')
    .replace(/[’']/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .split(' ')
    .filter((w) => w.length > 1 && !STOP.has(w))
    .map((w) => SYNONYMS[w] ?? stem(SYNONYMS[stem(w)] ?? w))
}

function editDistance(a, b, max) {
  if (Math.abs(a.length - b.length) > max) return max + 1
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i)
  for (let i = 1; i <= a.length; i++) {
    const cur = [i]
    let rowMin = i
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1
      cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + cost)
      rowMin = Math.min(rowMin, cur[j])
    }
    if (rowMin > max) return max + 1
    prev = cur
  }
  return prev[b.length]
}

const FIELD_WEIGHTS = { q: 2, alt: 1.5, keywords: 2, topic: 1, a: 0.35 }

export function createIndex(entries) {
  const docs = entries.map((e) => {
    const tf = new Map()
    const add = (text, w) => tokenize(text).forEach((t) => tf.set(t, (tf.get(t) ?? 0) + w))
    add(e.q, FIELD_WEIGHTS.q)
    e.alt?.forEach((s) => add(s, FIELD_WEIGHTS.alt))
    add((e.keywords ?? []).join(' '), FIELD_WEIGHTS.keywords)
    add(e.topic ?? '', FIELD_WEIGHTS.topic)
    add(e.a.replace(/\*\*/g, ''), FIELD_WEIGHTS.a)
    // dampen repeated terms so long entries don't dominate
    for (const [t, v] of tf) tf.set(t, 1 + Math.log(v + 1))
    return { entry: e, tf }
  })
  const df = new Map()
  docs.forEach((d) => d.tf.forEach((_, t) => df.set(t, (df.get(t) ?? 0) + 1)))
  const N = docs.length
  const idf = new Map([...df].map(([t, n]) => [t, Math.log(1 + N / n)]))
  const maxIdf = Math.log(1 + N)
  docs.forEach((d) => {
    let norm = 0
    d.vec = new Map()
    d.tf.forEach((v, t) => {
      const w = v * idf.get(t)
      d.vec.set(t, w)
      norm += w * w
    })
    d.norm = Math.sqrt(norm)
  })
  return { docs, idf, maxIdf, vocab: [...idf.keys()] }
}

// Resolve each query token to known vocabulary: exact, then prefix, then typo match.
function resolve(index, tokens) {
  const out = []
  for (const t of tokens) {
    if (index.idf.has(t)) { out.push({ t, w: 1, raw: t }); continue }
    let best = null
    if (t.length >= 4) {
      const max = t.length >= 7 ? 2 : 1
      for (const v of index.vocab) {
        if (v.length >= 5 && (v.startsWith(t) || t.startsWith(v))) {
          if (!best || best.d > 0.5) best = { v, d: 0.5 }
          continue
        }
        const d = editDistance(t, v, max)
        if (d <= max && (!best || d < best.d)) best = { v, d }
      }
      // typos of words we map through the synonym table (e.g. "invisalgn")
      for (const [k, v] of Object.entries(SYNONYMS)) {
        if (!index.idf.has(v) || k.length < 5) continue
        const d = editDistance(t, k, max)
        if (d <= max && (!best || d < best.d)) best = { v, d }
      }
    }
    out.push(best ? { t: best.v, w: best.d <= 0.5 ? 0.75 : 0.8 - 0.15 * best.d, raw: t, fuzzy: true } : { t: null, w: 1, raw: t })
  }
  return out
}

export function search(index, query, limit = 3) {
  const resolved = resolve(index, tokenize(query))
  if (!resolved.length) return { results: [], terms: [] }
  const qvec = new Map()
  let qIdfTotal = 0
  for (const r of resolved) {
    const idf = r.t ? index.idf.get(r.t) : index.maxIdf
    qIdfTotal += idf
    if (r.t) qvec.set(r.t, (qvec.get(r.t) ?? 0) + r.w * idf)
  }
  const qnorm = Math.sqrt([...qvec.values()].reduce((s, v) => s + v * v, 0)) || 1
  const results = index.docs
    .map((d) => {
      let dot = 0
      let covered = 0
      qvec.forEach((qw, t) => {
        const dw = d.vec.get(t)
        if (dw) {
          dot += qw * dw
          covered += qw
        }
      })
      const cosine = dot / (qnorm * d.norm)
      const coverage = covered / qIdfTotal
      const score = 0.55 * coverage + 0.45 * Math.min(1, cosine * 2.2)
      return { entry: d.entry, score, cosine, coverage }
    })
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
  return { results, terms: resolved }
}
