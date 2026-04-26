import { Link } from 'react-router-dom'

export function NotFoundPage() {
  return (
    <section className="mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center justify-center gap-4 text-center">
      <p className="text-sm uppercase tracking-[0.25em] text-[#8b452c]">404</p>
      <h1 className="font-['Space_Grotesk'] text-4xl font-semibold tracking-tight">This route does not exist.</h1>
      <Link to="/" className="rounded-full bg-[#1d3528] px-5 py-3 font-medium text-white">
        Return home
      </Link>
    </section>
  )
}
