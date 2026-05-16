import { CalendarDays, Clock3, FileText, Images, Pencil, Plus, Search, Sparkles, Star, Trash2 } from 'lucide-react'
import { useDeferredValue, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { deleteBlogPost, getAdminBlogPosts } from '../../api/blogPosts'
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

export function AdminBlogPostsPage() {
  const navigate = useNavigate()
  const [blogPage, setBlogPage] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [pageError, setPageError] = useState('')
  const [currentPage, setCurrentPage] = useState(0)
  const [isDeletingId, setIsDeletingId] = useState(null)
  const [searchValue, setSearchValue] = useState('')
  const [activeFilter, setActiveFilter] = useState('ALL')
  const deferredSearch = useDeferredValue(searchValue.trim().toLowerCase())

  useEffect(() => {
    loadPage(currentPage)
  }, [currentPage])

  async function loadPage(page) {
    setIsLoading(true)
    setPageError('')

    try {
      const response = await getAdminBlogPosts(page, 10)
      setBlogPage(response)
    } catch (error) {
      setPageError(getApiErrorDetails(error).message)
    } finally {
      setIsLoading(false)
    }
  }

  async function handleDelete(post) {
    const shouldDelete = window.confirm(`Delete "${post.title}"? This action cannot be undone.`)

    if (!shouldDelete) {
      return
    }

    setIsDeletingId(post.id)

    try {
      await deleteBlogPost(post.id)
      const nextPage = blogPage?.items?.length === 1 && currentPage > 0 ? currentPage - 1 : currentPage
      setCurrentPage(nextPage)
      await loadPage(nextPage)
    } catch (error) {
      window.alert(getApiErrorDetails(error).message)
    } finally {
      setIsDeletingId(null)
    }
  }

  const filteredPosts = (blogPage?.items ?? []).filter((post) => {
    const matchesSearch =
      !deferredSearch ||
      post.title.toLowerCase().includes(deferredSearch) ||
      post.slug.toLowerCase().includes(deferredSearch)

    const matchesFilter =
      activeFilter === 'ALL' ||
      (activeFilter === 'FEATURED' && post.featured) ||
      post.status === activeFilter

    return matchesSearch && matchesFilter
  })

  const filterOptions = ['ALL', 'DRAFT', 'PUBLISHED', 'FEATURED']
  const publishedCount = filteredPosts.filter((post) => post.status === 'PUBLISHED').length
  const featuredCount = filteredPosts.filter((post) => post.featured).length
  const mediaCount = filteredPosts.reduce((sum, post) => sum + (post.mediaAssets?.length || 0), 0)

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.25em] text-white/45">Admin blog</p>
          <h1 className="mt-3 font-['Space_Grotesk'] text-4xl font-semibold tracking-tight">Manage blog posts</h1>
          <p className="mt-3 max-w-3xl text-white/68">
            Use this screen to scan, open, and manage posts. Writing and post settings now live in a dedicated full-page editor.
          </p>
        </div>

        <Button
          onClick={() => navigate('/admin/blog-posts/new')}
          className="w-full sm:w-auto"
        >
          <Plus className="size-4" />
          New post
        </Button>
      </div>

      {pageError ? (
        <div className="rounded-[28px] border border-[#8b452c]/40 bg-[#8b452c]/10 px-5 py-4 text-[#ffd4c4]">
          {pageError}
        </div>
      ) : null}

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.25fr)_minmax(320px,0.75fr)]">
        <div className="rounded-[28px] border border-white/10 bg-[linear-gradient(160deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))] p-5">
          <p className="text-xs uppercase tracking-[0.2em] text-white/38">Current page overview</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <StatCard icon={FileText} label="Visible posts" value={filteredPosts.length} tone="accent" />
            <StatCard icon={Sparkles} label="Published" value={publishedCount} tone="success" />
            <StatCard icon={Images} label="Media linked" value={mediaCount} />
          </div>
        </div>

        <div className="rounded-[28px] border border-white/10 bg-[linear-gradient(160deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))] p-5">
          <p className="text-xs uppercase tracking-[0.2em] text-white/38">Editorial signal</p>
          <div className="mt-4 flex items-center gap-3 rounded-[24px] border border-[#d9c8b0]/18 bg-[#f5efe3]/7 p-4">
            <span className="inline-flex size-11 items-center justify-center rounded-2xl border border-[#d9c8b0]/28 bg-[#f5efe3]/10 text-[#f5efe3]">
              <Star className="size-4" />
            </span>
            <div>
              <p className="text-sm text-white/55">Featured posts on this page</p>
              <p className="mt-1 text-2xl font-semibold text-white">{featuredCount}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-[28px] border border-white/10 bg-white/4 p-4">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-wrap gap-2">
            {filterOptions.map((filter) => (
              <Button
                key={filter}
                type="button"
                onClick={() => setActiveFilter(filter)}
                variant={activeFilter === filter ? 'default' : 'secondary'}
                className={cn(
                  'rounded-full',
                  activeFilter === filter
                    ? 'bg-[#f5efe3] text-[#111111] hover:bg-white'
                    : 'text-white/72'
                )}
              >
                {filter === 'ALL' ? 'All' : filter === 'FEATURED' ? 'Featured' : filter}
              </Button>
            ))}
          </div>

          <div className="relative w-full xl:max-w-sm">
            <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-white/35" />
            <Input
              type="search"
              value={searchValue}
              onChange={(event) => setSearchValue(event.target.value)}
              placeholder="Search current page by title or slug"
              className="pl-11"
            />
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-[30px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.03))] shadow-[0_24px_80px_rgba(0,0,0,0.22)]">
        <div className="hidden border-b border-white/8 px-6 py-4 xl:grid xl:grid-cols-[minmax(0,2.2fr)_140px_140px_170px_170px_170px] xl:gap-4">
          <p className="text-xs uppercase tracking-[0.18em] text-white/42">Post</p>
          <p className="text-xs uppercase tracking-[0.18em] text-white/42">Status</p>
          <p className="text-xs uppercase tracking-[0.18em] text-white/42">Priority</p>
          <p className="text-xs uppercase tracking-[0.18em] text-white/42">Published</p>
          <p className="text-xs uppercase tracking-[0.18em] text-white/42">Updated</p>
          <p className="text-right text-xs uppercase tracking-[0.18em] text-white/42">Actions</p>
        </div>

        <div className="divide-y divide-white/8">
          {isLoading ? (
            <div className="px-6 py-20 text-center text-white/55">Loading blog posts...</div>
          ) : null}

          {!isLoading && blogPage?.items?.length === 0 ? (
            <div className="px-6 py-20 text-center text-white/55">
              No blog posts yet. Create the first one from the button above.
            </div>
          ) : null}

          {!isLoading && blogPage?.items?.length > 0 && filteredPosts.length === 0 ? (
            <div className="px-6 py-20 text-center text-white/55">
              No posts match the current filter or search on this page.
            </div>
          ) : null}

          {!isLoading
            ? filteredPosts.map((post) => (
                <article key={post.id} className="px-5 py-5 transition hover:bg-white/[0.03] sm:px-6">
                  <div className="grid gap-5 xl:grid-cols-[minmax(0,2.2fr)_140px_140px_170px_170px_170px] xl:items-start xl:gap-4">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate text-lg font-medium text-white">{post.title}</p>
                          <p className="mt-2 line-clamp-2 max-w-2xl text-sm text-white/52">{post.excerpt || 'No excerpt added yet.'}</p>
                        </div>
                        {post.featured ? (
                          <span className="rounded-full bg-[#f5efe3] px-3 py-1 text-xs font-medium text-[#111111]">
                            Featured
                          </span>
                        ) : null}
                      </div>

                      <div className="mt-4 flex flex-wrap gap-2">
                        <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs text-white/58">
                          /{post.slug}
                        </span>
                        <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs text-white/58">
                          <Clock3 className="size-3.5" />
                          {post.readingTime} min read
                        </span>
                        <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs text-white/58">
                          <Images className="size-3.5" />
                          {post.mediaAssets?.length || 0} media
                        </span>
                      </div>

                      {post.tags?.length ? (
                        <div className="mt-4 flex flex-wrap gap-2">
                          {post.tags.map((tag) => (
                            <span
                              key={tag.id}
                              className="rounded-full border border-white/10 bg-white/6 px-3 py-1 text-xs text-white/72"
                            >
                              {tag.name}
                            </span>
                          ))}
                        </div>
                      ) : null}
                    </div>

                    <div className="space-y-2">
                      <p className="text-[11px] uppercase tracking-[0.18em] text-white/35 xl:hidden">Status</p>
                      <span
                        className={cn(
                          'inline-flex rounded-full px-3 py-1.5 text-xs font-medium',
                          post.status === 'PUBLISHED' ? 'bg-[#23422f] text-[#dff5e3]' : 'bg-white/10 text-white/70'
                        )}
                      >
                        {post.status}
                      </span>
                    </div>

                    <div className="space-y-2">
                      <p className="text-[11px] uppercase tracking-[0.18em] text-white/35 xl:hidden">Priority</p>
                      <span className="text-sm text-white/62">{post.featured ? 'Featured post' : 'Standard post'}</span>
                    </div>

                    <div className="space-y-2">
                      <p className="text-[11px] uppercase tracking-[0.18em] text-white/35 xl:hidden">Published</p>
                      <div className="inline-flex items-center gap-2 text-sm text-white/62">
                        <CalendarDays className="size-4 text-white/35" />
                        <span>{formatDateTime(post.publishedAt)}</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <p className="text-[11px] uppercase tracking-[0.18em] text-white/35 xl:hidden">Updated</p>
                      <div className="inline-flex items-center gap-2 text-sm text-white/62">
                        <CalendarDays className="size-4 text-white/35" />
                        <span>{formatDateTime(post.updatedAt)}</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 xl:justify-end">
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={() => navigate(`/admin/blog-posts/${post.id}/edit`)}
                      >
                        <Pencil className="size-4" />
                        Edit
                      </Button>
                      <Button
                        type="button"
                        variant="danger"
                        onClick={() => handleDelete(post)}
                        disabled={isDeletingId === post.id}
                      >
                        <Trash2 className="size-4" />
                        {isDeletingId === post.id ? 'Deleting...' : 'Delete'}
                      </Button>
                    </div>
                  </div>
                </article>
              ))
            : null}
        </div>
      </div>

      <div className="flex flex-col gap-3 rounded-[24px] border border-white/10 bg-white/4 px-5 py-4 text-sm text-white/62 md:flex-row md:items-center md:justify-between">
        <p>
          Page {(blogPage?.page ?? 0) + 1} of {blogPage?.totalPages || 1} | {blogPage?.totalElements ?? 0} posts total
        </p>
        <div className="flex gap-3">
          <Button
            type="button"
            variant="secondary"
            disabled={currentPage === 0 || isLoading}
            onClick={() => setCurrentPage((page) => Math.max(page - 1, 0))}
          >
            Previous
          </Button>
          <Button
            type="button"
            variant="secondary"
            disabled={!blogPage?.hasNext || isLoading}
            onClick={() => setCurrentPage((page) => page + 1)}
          >
            Next
          </Button>
        </div>
      </div>
    </section>
  )
}
