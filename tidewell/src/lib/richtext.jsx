// Minimal markdown: **bold**, [label](href) and line breaks.
// Text is parsed into segments first so streaming never shows half-built markup.
export function parse(text) {
  const segs = []
  const re = /\*\*(.+?)\*\*|\[(.+?)\]\((.+?)\)/g
  let last = 0
  let m
  while ((m = re.exec(text))) {
    if (m.index > last) segs.push({ t: 'text', v: text.slice(last, m.index) })
    if (m[1]) segs.push({ t: 'bold', v: m[1] })
    else segs.push({ t: 'link', v: m[2], href: m[3] })
    last = re.lastIndex
  }
  if (last < text.length) segs.push({ t: 'text', v: text.slice(last) })
  return segs
}

export function plainLength(text) {
  return parse(text).reduce((n, s) => n + s.v.length, 0)
}

function withBreaks(str, key) {
  const parts = str.split('\n')
  return parts.map((p, i) => (
    <span key={`${key}-${i}`}>
      {p}
      {i < parts.length - 1 && <br />}
    </span>
  ))
}

export function RichText({ text, limit = Infinity }) {
  let budget = limit
  const out = []
  for (const [i, s] of parse(text).entries()) {
    if (budget <= 0) break
    const v = s.v.slice(0, budget)
    budget -= v.length
    if (s.t === 'bold') out.push(<strong key={i} className="font-semibold text-navy">{withBreaks(v, i)}</strong>)
    else if (s.t === 'link')
      out.push(
        <a key={i} href={s.href} className="font-medium text-tide underline underline-offset-2 hover:text-tide-dark">
          {v}
        </a>,
      )
    else out.push(...withBreaks(v, i))
  }
  return <>{out}</>
}
