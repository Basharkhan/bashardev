import { Link } from 'react-router-dom'

export function AdminDashboardPage() {
  return (
    <section className="space-y-6">
      <p className="text-sm uppercase tracking-[0.25em] text-white/50">Admin dashboard</p>
      <h1 className="font-['Space_Grotesk'] text-4xl font-semibold tracking-tight">
        Blog administration is now the first real admin workflow.
      </h1>
      <p className="max-w-2xl text-white/70">
        Start with posts. The CRUD flow lives behind protected routes, includes inline validation, and uses a modal editor with markdown preview.
      </p>
      <div className="rounded-[28px] border border-white/10 bg-white/5 p-6">
        <p className="text-sm uppercase tracking-[0.2em] text-white/45">Primary action</p>
        <h2 className="mt-3 font-['Space_Grotesk'] text-2xl font-semibold">Open blog post management</h2>
        <p className="mt-3 max-w-2xl text-white/65">
          Create drafts, publish posts, edit SEO fields, and delete entries from a single admin screen.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link
            to="/admin/blog-posts"
            className="inline-flex rounded-full bg-[#f5efe3] px-5 py-3 font-medium text-[#111111] transition hover:bg-white"
          >
            Go to blog posts
          </Link>
          <Link
            to="/admin/tags"
            className="inline-flex rounded-full border border-white/12 px-5 py-3 font-medium text-white/80 transition hover:bg-white/8"
          >
            Manage tags
          </Link>
          <Link
            to="/admin/media"
            className="inline-flex rounded-full border border-white/12 px-5 py-3 font-medium text-white/80 transition hover:bg-white/8"
          >
            Open media
          </Link>
        </div>
      </div>
    </section>
  )
}
