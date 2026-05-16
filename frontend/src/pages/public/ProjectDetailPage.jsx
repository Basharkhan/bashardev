import { ExternalLink, GitBranch } from 'lucide-react'
import { useEffect, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import { useParams } from 'react-router-dom'
import { getProjectBySlug } from '../../api/projects'
import { getApiErrorDetails } from '../../utils/apiError'

export function ProjectDetailPage() {
  const { slug } = useParams()
  const [project, setProject] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [pageError, setPageError] = useState('')

  useEffect(() => {
    let isActive = true

    async function loadProject() {
      setIsLoading(true)
      setPageError('')

      try {
        const response = await getProjectBySlug(slug)

        if (isActive) {
          setProject(response)
        }
      } catch (error) {
        if (isActive) {
          setPageError(getApiErrorDetails(error).message)
        }
      } finally {
        if (isActive) {
          setIsLoading(false)
        }
      }
    }

    loadProject()

    return () => {
      isActive = false
    }
  }, [slug])

  if (isLoading) {
    return (
      <section className="rounded-[30px] border border-black/10 bg-white px-6 py-16 text-center text-black/55">
        Loading project...
      </section>
    )
  }

  if (pageError) {
    return (
      <section className="rounded-[30px] border border-[#8b452c]/20 bg-[#fff7f3] px-6 py-16 text-center text-[#8b452c]">
        {pageError}
      </section>
    )
  }

  if (!project) {
    return null
  }

  return (
    <article className="mx-auto max-w-5xl space-y-8">
      <header className="space-y-5">
        <p className="text-sm uppercase tracking-[0.25em] text-[#8b452c]">Project detail</p>
        <div className="space-y-4">
          <h1 className="font-['Space_Grotesk'] text-4xl font-semibold tracking-tight text-[#111111] lg:text-5xl">
            {project.title}
          </h1>
          <p className="max-w-3xl text-base leading-7 text-black/68">{project.summary}</p>
        </div>

        <div className="flex flex-wrap gap-3 text-sm text-black/55">
          {project.publishedAt ? <span>{new Date(project.publishedAt).toLocaleDateString()}</span> : null}
          <span>{project.featured ? 'Featured project' : 'Project archive'}</span>
        </div>

        {(project.liveUrl || project.repositoryUrl) ? (
          <div className="flex flex-wrap gap-3">
            {project.liveUrl ? (
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-[#1d3528] px-5 py-3 text-sm font-medium text-white"
              >
                <ExternalLink className="size-4" />
                Visit live project
              </a>
            ) : null}
            {project.repositoryUrl ? (
              <a
                href={project.repositoryUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-black/12 bg-white px-5 py-3 text-sm font-medium text-black/82"
              >
                <GitBranch className="size-4" />
                View repository
              </a>
            ) : null}
          </div>
        ) : null}
      </header>

      {project.coverImageUrl ? (
        <div className="overflow-hidden rounded-[32px] border border-black/10 bg-[#f4efe7]">
          <img src={project.coverImageUrl} alt={project.title} className="h-auto w-full object-cover" />
        </div>
      ) : null}

      {project.techStack?.length ? (
        <section className="rounded-[28px] border border-black/10 bg-white/70 p-6">
          <p className="text-sm uppercase tracking-[0.2em] text-[#32543f]">Tech stack</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {project.techStack.map((item) => (
              <span
                key={`${item.position}-${item.name}`}
                className="rounded-full border border-black/10 bg-[#f0e4d5] px-3 py-1.5 text-sm text-black/72"
              >
                {item.name}
              </span>
            ))}
          </div>
        </section>
      ) : null}

      {project.contentMarkdown ? (
        <section className="rounded-[28px] border border-black/10 bg-white/85 px-6 py-7 shadow-[0_18px_50px_rgba(17,17,17,0.05)]">
          <div className="prose prose-lg max-w-none text-black/82">
            <ReactMarkdown>{project.contentMarkdown}</ReactMarkdown>
          </div>
        </section>
      ) : null}

      {project.gallery?.length ? (
        <section className="space-y-4">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-[#8b452c]">Gallery</p>
            <h2 className="mt-2 font-['Space_Grotesk'] text-3xl font-semibold tracking-tight text-[#111111]">
              Supporting views
            </h2>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            {project.gallery.map((item) => (
              <figure key={`${item.position}-${item.imageUrl}`} className="overflow-hidden rounded-[28px] border border-black/10 bg-white/80">
                <img src={item.imageUrl} alt={item.altText || project.title} className="h-full w-full object-cover" />
                {item.altText ? (
                  <figcaption className="border-t border-black/8 px-5 py-4 text-sm text-black/60">
                    {item.altText}
                  </figcaption>
                ) : null}
              </figure>
            ))}
          </div>
        </section>
      ) : null}
    </article>
  )
}
