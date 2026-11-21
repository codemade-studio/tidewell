import { Link } from 'react-router'

export default function NotFound() {
  return (
    <section className="mx-auto max-w-xl px-5 py-28 text-center">
      <p className="text-sm font-bold tracking-[0.18em] text-tide uppercase">404</p>
      <h1 className="mt-3 text-4xl font-extrabold text-navy">This page has drifted off</h1>
      <p className="mt-4 text-slate">The page you’re after doesn’t exist. Try the home page — or ask the assistant in the corner.</p>
      <Link to="/" className="mt-8 inline-block rounded-full bg-tide px-6 py-3 font-semibold text-white hover:bg-tide-dark">Back to home</Link>
    </section>
  )
}
