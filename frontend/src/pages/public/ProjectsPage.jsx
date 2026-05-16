import { ArrowRight } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getProjects } from '../../api/projects'
import { Button } from '../../components/ui/button'
import { getApiErrorDetails } from '../../utils/apiError'

export function ProjectsPage() {
  const [projectPage, setProjectPage] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [pageError, setPageError] = useState('')
  const [currentPage, setCurrentPage] = useState(0)

  useEffect(() => {
    let isActive = true

    async function loadProjects() {
      setIsLoading(true)
      setPageError('')

      try {
        const response = await getProjects({ page: currentPage, size: 6 })

        if (isActive) {
          setProjectPage(response)
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

    loadProjects()

    return () => {
      isActive = false
    }
  }, [currentPage])

  if (isLoading) {
    return (
      <section className="rounded-[30px] border border-black/10 bg-white px-6 py-16 text-center text-black/55">
        Loading projects...
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

  const projects = projectPage?.items ?? []

  return (
    <section className="space-y-8">
      <header className="space-y-4">
        <p className="text-sm uppercase tracking-[0.25em] text-[#8b452c]">Projects</p>
        <h1 className="font-['Space_Grotesk'] text-4xl font-semibold tracking-tight text-[#111111] lg:text-5xl">
          Case studies, product builds, and implementation notes.
        </h1>
        <p className="max-w-3xl text-base leading-7 text-black/68">
          Each project keeps the public view compact first, then opens into a deeper case-study style page with context, gallery, and technical stack.
        </p>
      </header>

      {projects.length === 0 ? (
        <div className="rounded-[28px] border border-black/10 bg-white/70 px-6 py-16 text-center text-black/55">
          No published projects yet.
        </div>
      ) : (
        <div className="grid gap-5 lg:grid-cols-2">
          {projects.map((project) => (
            <article key={project.id} className="overflow-hidden rounded-[30px] border border-black/10 bg-white/80 shadow-[0_18px_50px_rgba(17,17,17,0.06)]">
              {project.coverImageUrl ? (
                <div className="aspect-[16/9] overflow-hidden bg-[#e8dfd2]">
                  <img src={project.coverImageUrl} alt={project.title} className="h-full w-full object-cover" />
                </div>
              ) : (
                <div className="aspect-[16/9] bg-[linear-gradient(135deg,#1d3528,#32543f)]" />
              )}

              <div className="space-y-4 p-6">
                <div className="flex flex-wrap items-center gap-2">
                  {project.featured ? (
                    <span className="rounded-full bg-[#1d3528] px-3 py-1 text-xs font-medium uppercase tracking-[0.16em] text-white">
                      Featured
                    </span>
                  ) : null}
                  {project.publishedAt ? (
                    <span className="text-xs uppercase tracking-[0.16em] text-black/48">
                      {new Date(project.publishedAt).toLocaleDateString()}
                    </span>
                  ) : null}
                </div>

                <div>
                  <h2 className="font-['Space_Grotesk'] text-2xl font-semibold text-[#111111]">{project.title}</h2>
                  <p className="mt-3 text-black/70">{project.summary}</p>
                </div>

                <Link
                  to={`/projects/${project.slug}`}
                  className="inline-flex items-center gap-2 text-sm font-medium text-[#1d3528] transition hover:text-[#32543f]"
                >
                  View project
                  <ArrowRight className="size-4" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-black/52">
          Page {projectPage?.page != null ? projectPage.page + 1 : 1} of {Math.max(projectPage?.totalPages || 1, 1)}
        </p>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="secondary"
            className="border-black/10 bg-white/70 text-black/80 hover:bg-white"
            onClick={() => setCurrentPage((current) => Math.max(current - 1, 0))}
            disabled={!projectPage || projectPage.page === 0}
          >
            Previous
          </Button>
          <Button
            type="button"
            variant="secondary"
            className="border-black/10 bg-white/70 text-black/80 hover:bg-white"
            onClick={() => setCurrentPage((current) => current + 1)}
            disabled={!projectPage?.hasNext}
          >
            Next
          </Button>
        </div>
      </div>
    </section>
  )
}
