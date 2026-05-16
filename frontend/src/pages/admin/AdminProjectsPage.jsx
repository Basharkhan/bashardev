import { ArrowRight, CalendarDays, FolderKanban, Pencil, Plus, Search, Sparkles, Star, Trash2 } from 'lucide-react'
import { useDeferredValue, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { deleteProject, getAdminProjects } from '../../api/projects'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { cn } from '../../lib/utils'
import { getApiErrorDetails } from '../../utils/apiError'

function formatDateTime(value) {
  if (!value) {
    return 'Not set'
  }

  return new Date(value).toLocaleString()
}

function StatCard({ icon: Icon, label, value, tone = 'default' }) {
  const tones = {
    default: 'border-white/10 bg-white/[0.03]',
    accent: 'border-[#d9c8b0]/20 bg-[#f5efe3]/10',
    success: 'border-[#2f5a41]/30 bg-[#23422f]/22',
  }

  return (
    <div className={cn('rounded-[24px] border p-4', tones[tone])}>
      <div className="flex items-center gap-3">
        <span className="inline-flex size-10 items-center justify-center rounded-2xl border border-white/10 bg-black/10 text-white/72">
          <Icon className="size-4" />
        </span>
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-white/40">{label}</p>
          <p className="mt-2 text-2xl font-semibold text-white">{value}</p>
        </div>
      </div>
    </div>
  )
}

const statusOptions = ['ALL', 'DRAFT', 'PUBLISHED']
const featuredOptions = ['ALL', 'FEATURED']

export function AdminProjectsPage() {
  const navigate = useNavigate()
  const [projectPage, setProjectPage] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [pageError, setPageError] = useState('')
  const [currentPage, setCurrentPage] = useState(0)
  const [isDeletingId, setIsDeletingId] = useState(null)
  const [searchValue, setSearchValue] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [featuredFilter, setFeaturedFilter] = useState('ALL')
  const deferredSearch = useDeferredValue(searchValue.trim())

  useEffect(() => {
    loadPage(currentPage, deferredSearch, statusFilter, featuredFilter)
  }, [currentPage, deferredSearch, statusFilter, featuredFilter])

  async function loadPage(page, search, status, featured) {
    setIsLoading(true)
    setPageError('')

    try {
      const response = await getAdminProjects({
        page,
        size: 10,
        search,
        status,
        featured,
      })
      setProjectPage(response)
    } catch (error) {
      const details = getApiErrorDetails(error)

      if (details.status === 401) {
        navigate('/admin/login', { replace: true })
        return
      }

      setPageError(details.message)
    } finally {
      setIsLoading(false)
    }
  }

  async function handleDelete(project) {
    const shouldDelete = window.confirm(`Delete "${project.title}"? This action cannot be undone.`)

    if (!shouldDelete) {
      return
    }

    setIsDeletingId(project.id)

    try {
      await deleteProject(project.id)
      const nextPage = projectPage?.items?.length === 1 && currentPage > 0 ? currentPage - 1 : currentPage
      setCurrentPage(nextPage)
      await loadPage(nextPage, deferredSearch, statusFilter, featuredFilter)
    } catch (error) {
      const details = getApiErrorDetails(error)

      if (details.status === 401) {
        navigate('/admin/login', { replace: true })
        return
      }

      window.alert(details.message)
    } finally {
      setIsDeletingId(null)
    }
  }

  function handleSearchChange(event) {
    setSearchValue(event.target.value)
    setCurrentPage(0)
  }

  function handleStatusFilterChange(nextStatus) {
    setStatusFilter(nextStatus)
    setCurrentPage(0)
  }

  function handleFeaturedFilterChange(nextFilter) {
    setFeaturedFilter(nextFilter)
    setCurrentPage(0)
  }

  const projects = projectPage?.items ?? []
  const publishedCount = projects.filter((project) => project.status === 'PUBLISHED').length
  const featuredCount = projects.filter((project) => project.featured).length

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.25em] text-white/45">Admin projects</p>
          <h1 className="mt-3 font-['Space_Grotesk'] text-4xl font-semibold tracking-tight">Manage projects</h1>
          <p className="mt-3 max-w-3xl text-white/68">
            Projects are case-study style portfolio entries. Use this screen to scan status, feature order, and edit or remove them without losing the public presentation shape.
          </p>
        </div>

        <Button onClick={() => navigate('/admin/projects/new')} className="w-full sm:w-auto">
          <Plus className="size-4" />
          New project
        </Button>
      </div>

      {pageError ? (
        <div className="rounded-[28px] border border-[#8b452c]/40 bg-[#8b452c]/10 px-5 py-4 text-[#ffd4c4]">
          {pageError}
        </div>
      ) : null}

      <div className="grid gap-4 xl:grid-cols-3">
        <StatCard icon={FolderKanban} label="Projects on page" value={projects.length} tone="accent" />
        <StatCard icon={Sparkles} label="Published" value={publishedCount} tone="success" />
        <StatCard icon={Star} label="Featured" value={featuredCount} />
      </div>

      <div className="rounded-[28px] border border-white/10 bg-white/4 p-4">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-wrap gap-2">
            {statusOptions.map((status) => (
              <Button
                key={status}
                type="button"
                onClick={() => handleStatusFilterChange(status)}
                variant={statusFilter === status ? 'default' : 'secondary'}
                className={cn(
                  'rounded-full',
                  statusFilter === status
                    ? 'bg-[#f5efe3] text-[#111111] hover:bg-white'
                    : 'text-white/72'
                )}
              >
                {status === 'ALL' ? 'All' : status}
              </Button>
            ))}

            {featuredOptions.map((option) => (
              <Button
                key={option}
                type="button"
                onClick={() => handleFeaturedFilterChange(option)}
                variant={featuredFilter === option ? 'default' : 'secondary'}
                className={cn(
                  'rounded-full',
                  featuredFilter === option
                    ? 'bg-[#f5efe3] text-[#111111] hover:bg-white'
                    : 'text-white/72'
                )}
              >
                {option === 'ALL' ? 'All visibility' : 'Featured only'}
              </Button>
            ))}
          </div>

          <div className="relative w-full xl:max-w-sm">
            <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-white/35" />
            <Input
              type="search"
              value={searchValue}
              onChange={handleSearchChange}
              placeholder="Search title or slug"
              className="pl-11"
            />
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-[30px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.03))] shadow-[0_24px_80px_rgba(0,0,0,0.22)]">
        <div className="hidden border-b border-white/8 px-6 py-4 xl:grid xl:grid-cols-[minmax(0,2.2fr)_140px_130px_160px_160px_170px] xl:gap-4">
          <p className="text-xs uppercase tracking-[0.18em] text-white/42">Project</p>
          <p className="text-xs uppercase tracking-[0.18em] text-white/42">Status</p>
          <p className="text-xs uppercase tracking-[0.18em] text-white/42">Priority</p>
          <p className="text-xs uppercase tracking-[0.18em] text-white/42">Published</p>
          <p className="text-xs uppercase tracking-[0.18em] text-white/42">Updated</p>
          <p className="text-right text-xs uppercase tracking-[0.18em] text-white/42">Actions</p>
        </div>

        <div className="divide-y divide-white/8">
          {isLoading ? (
            <div className="px-6 py-20 text-center text-white/55">Loading projects...</div>
          ) : null}

          {!isLoading && projects.length === 0 ? (
            <div className="px-6 py-20 text-center text-white/55">
              No projects match the current search or filter.
            </div>
          ) : null}

          {!isLoading
            ? projects.map((project) => (
                <article key={project.id} className="px-5 py-5 transition hover:bg-white/[0.03] sm:px-6">
                  <div className="grid gap-5 xl:grid-cols-[minmax(0,2.2fr)_140px_130px_160px_160px_170px] xl:items-start xl:gap-4">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate text-lg font-medium text-white">{project.title}</p>
                          <p className="mt-2 line-clamp-2 max-w-2xl text-sm text-white/52">{project.summary}</p>
                        </div>
                        {project.featured ? (
                          <span className="rounded-full bg-[#f5efe3] px-3 py-1 text-xs font-medium text-[#111111]">
                            Featured
                          </span>
                        ) : null}
                      </div>

                      <div className="mt-4 flex flex-wrap gap-2">
                        <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs text-white/58">
                          /{project.slug}
                        </span>
                        <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs text-white/58">
                          Order {project.displayOrder}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <p className="text-[11px] uppercase tracking-[0.18em] text-white/35 xl:hidden">Status</p>
                      <span
                        className={cn(
                          'inline-flex rounded-full px-3 py-1.5 text-xs font-medium',
                          project.status === 'PUBLISHED' ? 'bg-[#23422f] text-[#dff5e3]' : 'bg-white/10 text-white/70'
                        )}
                      >
                        {project.status}
                      </span>
                    </div>

                    <div className="space-y-2">
                      <p className="text-[11px] uppercase tracking-[0.18em] text-white/35 xl:hidden">Priority</p>
                      <span className="text-sm text-white/62">{project.featured ? 'Featured project' : 'Standard project'}</span>
                    </div>

                    <div className="space-y-2">
                      <p className="text-[11px] uppercase tracking-[0.18em] text-white/35 xl:hidden">Published</p>
                      <div className="inline-flex items-center gap-2 text-sm text-white/62">
                        <CalendarDays className="size-4 text-white/35" />
                        <span>{formatDateTime(project.publishedAt)}</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <p className="text-[11px] uppercase tracking-[0.18em] text-white/35 xl:hidden">Updated</p>
                      <div className="inline-flex items-center gap-2 text-sm text-white/62">
                        <CalendarDays className="size-4 text-white/35" />
                        <span>{formatDateTime(project.updatedAt)}</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 xl:justify-end">
                      <Button type="button" variant="secondary" onClick={() => navigate(`/admin/projects/${project.id}/edit`)}>
                        <Pencil className="size-4" />
                        Edit
                      </Button>
                      <Button
                        type="button"
                        variant="danger"
                        onClick={() => handleDelete(project)}
                        disabled={isDeletingId === project.id}
                      >
                        <Trash2 className="size-4" />
                        {isDeletingId === project.id ? 'Deleting...' : 'Delete'}
                      </Button>
                    </div>
                  </div>
                </article>
              ))
            : null}
        </div>

        <div className="flex flex-col gap-3 border-t border-white/8 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="text-sm text-white/48">
            Page {projectPage?.page != null ? projectPage.page + 1 : 1} of {Math.max(projectPage?.totalPages || 1, 1)}
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setCurrentPage((current) => Math.max(current - 1, 0))}
              disabled={!projectPage || projectPage.page === 0 || isLoading}
            >
              Previous
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setCurrentPage((current) => current + 1)}
              disabled={!projectPage?.hasNext || isLoading}
            >
              Next
              <ArrowRight className="size-4" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
