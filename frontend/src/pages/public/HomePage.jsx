const projectItems = [
  {
    title: 'Portfolio CMS',
    summary: 'A Spring Boot and React system for managing projects, posts, and site settings from one admin flow.',
    stack: 'Spring Boot, React, PostgreSQL',
  },
  {
    title: 'Case Study Ready Layout',
    summary: 'A project presentation style built for long-form writeups, screenshots, and implementation notes.',
    stack: 'React Router, Tailwind CSS',
  },
]

const blogItems = [
  {
    title: 'Designing the First Real MVP',
    summary: 'What to build first when the backend already exists but the frontend is still mostly shell pages.',
  },
  {
    title: 'Keeping the Portfolio Simple',
    summary: 'Why a single-page public experience is a better first move than spreading effort across too many routes.',
  },
]

export function HomePage() {
  return (
    <div className="space-y-8">
      <section
        id="home"
        className="overflow-hidden rounded-[36px] border border-black/10 bg-[#1d3528] px-6 py-8 text-white shadow-[0_30px_80px_rgba(29,53,40,0.18)] scroll-mt-28 lg:px-10 lg:py-12"
      >
        <p className="text-sm uppercase tracking-[0.3em] text-white/60">BasharDev</p>
        <h1 className="mt-4 max-w-3xl font-['Space_Grotesk'] text-4xl font-semibold tracking-tight text-balance lg:text-6xl">
          One clean page for the work, the writing, and the contact path.
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-7 text-white/75 lg:text-lg">
          This public side is now intentionally small. Home, projects, blog, and contact live in one scrolling experience first,
          which keeps the product focused while the admin and API layers mature.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <a href="/#projects" className="rounded-full bg-[#f5efe3] px-5 py-3 font-medium text-[#1d3528]">
            View projects
          </a>
          <a href="/#blog" className="rounded-full border border-white/20 px-5 py-3 font-medium text-white">
            Read the blog
          </a>
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

      <section id="projects" className="scroll-mt-28 space-y-5">
        <div className="space-y-3">
          <p className="text-sm uppercase tracking-[0.25em] text-[#8b452c]">Projects</p>
          <h2 className="font-['Space_Grotesk'] text-3xl font-semibold tracking-tight lg:text-4xl">
            Selected work, kept compact for now.
          </h2>
          <p className="max-w-2xl text-black/70">
            This section will later be driven from the backend. For now it defines the shape of the single-page public experience.
          </p>
        </div>
        <div className="grid gap-5 lg:grid-cols-2">
          {projectItems.map((project) => (
            <article key={project.title} className="rounded-[28px] border border-black/10 bg-white/75 p-6">
              <p className="text-sm font-medium uppercase tracking-[0.2em] text-[#32543f]">{project.stack}</p>
              <h3 className="mt-3 font-['Space_Grotesk'] text-2xl font-semibold">{project.title}</h3>
              <p className="mt-3 text-black/70">{project.summary}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="blog" className="scroll-mt-28 space-y-5">
        <div className="space-y-3">
          <p className="text-sm uppercase tracking-[0.25em] text-[#8b452c]">Blog</p>
          <h2 className="font-['Space_Grotesk'] text-3xl font-semibold tracking-tight lg:text-4xl">
            Notes from the build process.
          </h2>
          <p className="max-w-2xl text-black/70">
            The blog will also become API-driven later. Right now this section keeps the writing visible without introducing another top-level page.
          </p>
        </div>
        <div className="grid gap-5">
          {blogItems.map((post) => (
            <article key={post.title} className="rounded-[28px] border border-black/10 bg-[#f0e4d5] p-6">
              <h3 className="font-['Space_Grotesk'] text-2xl font-semibold">{post.title}</h3>
              <p className="mt-3 max-w-3xl text-black/75">{post.summary}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="contact" className="scroll-mt-28">
        <div className="rounded-[32px] border border-black/10 bg-[#141816] px-6 py-8 text-white lg:px-10">
          <p className="text-sm uppercase tracking-[0.25em] text-white/55">Contact</p>
          <h2 className="mt-3 font-['Space_Grotesk'] text-3xl font-semibold tracking-tight lg:text-4xl">
            Have a build, idea, or collaboration in mind?
          </h2>
          <p className="mt-4 max-w-2xl text-white/72">
            Start with a direct conversation. The contact form can come later once the public messaging flow is backed by the API.
          </p>
          <div className="mt-6 flex flex-wrap gap-3 text-sm">
            <a href="mailto:admin@bashardev.local" className="rounded-full bg-[#f5efe3] px-5 py-3 font-medium text-[#141816]">
              admin@bashardev.local
            </a>
            <a href="/admin" className="rounded-full border border-white/20 px-5 py-3 font-medium text-white">
              Admin access
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}
