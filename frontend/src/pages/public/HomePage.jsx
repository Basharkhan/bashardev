import { Link } from 'react-router-dom'

export function HomePage() {
  return (
    <div className="space-y-8">
      <section className="overflow-hidden rounded-[36px] border border-black/10 bg-[#1d3528] px-6 py-8 text-white shadow-[0_30px_80px_rgba(29,53,40,0.18)] lg:px-10 lg:py-12">
        <p className="text-sm uppercase tracking-[0.3em] text-white/60">BasharDev</p>
        <h1 className="mt-4 max-w-3xl font-['Space_Grotesk'] text-4xl font-semibold tracking-tight text-balance lg:text-6xl">
          Dynamic portfolio, thoughtful case studies, and a blog that can grow with the work.
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-7 text-white/75 lg:text-lg">
          The frontend is scaffolded, the backend domain is in place, and the next pass will connect both sides with real API-driven content.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link to="/projects" className="rounded-full bg-[#f5efe3] px-5 py-3 font-medium text-[#1d3528]">
            View projects
          </Link>
          <Link to="/blog" className="rounded-full border border-white/20 px-5 py-3 font-medium text-white">
            Read the blog
          </Link>
        </div>
      </section>

      <section className="grid gap-5 md:grid-cols-2">
        <div className="rounded-[28px] border border-black/10 bg-white/70 p-6">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-[#32543f]">Current focus</p>
          <h2 className="mt-3 font-['Space_Grotesk'] text-2xl font-semibold">Backend-first CMS architecture</h2>
          <p className="mt-3 text-black/70">
            JWT auth, PostgreSQL, Flyway migrations, and content entities are now the source of truth for the site.
          </p>
        </div>
        <div className="rounded-[28px] border border-black/10 bg-[#ead7c3] p-6">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-[#8b452c]">Next build slice</p>
          <h2 className="mt-3 font-['Space_Grotesk'] text-2xl font-semibold">Real CRUD and public content fetches</h2>
          <p className="mt-3 text-black/75">
            Site settings, projects, and blog posts will be the first entities exposed through admin and public API endpoints.
          </p>
        </div>
      </section>
    </div>
  )
}
