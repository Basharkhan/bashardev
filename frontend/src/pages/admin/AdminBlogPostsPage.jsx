import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { deleteBlogPost, getAdminBlogPosts } from '../../api/blogPosts'
import { getApiErrorDetails } from '../../utils/apiError'

function formatDateTime(value) {
  if (!value) {
    return 'Not set'
  }

  return new Date(value).toLocaleString()
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
      !searchValue.trim() ||
      post.title.toLowerCase().includes(searchValue.trim().toLowerCase()) ||
      post.slug.toLowerCase().includes(searchValue.trim().toLowerCase())

    const matchesFilter =
      activeFilter === 'ALL' ||
      (activeFilter === 'FEATURED' && post.featured) ||
      post.status === activeFilter

    return matchesSearch && matchesFilter
  })

  const filterOptions = ['ALL', 'DRAFT', 'PUBLISHED', 'FEATURED']

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

        <button
          type="button"
          onClick={() => navigate('/admin/blog-posts/new')}
          className="rounded-full bg-[#f5efe3] px-5 py-3 font-medium text-[#111111] transition hover:bg-white"
        >
          New post
        </button>
      </div>

      {pageError ? (
        <div className="rounded-[28px] border border-[#8b452c]/40 bg-[#8b452c]/10 px-5 py-4 text-[#ffd4c4]">
          {pageError}
        </div>
      ) : null}

      <div className="rounded-[28px] border border-white/10 bg-white/4 p-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-2">
            {filterOptions.map((filter) => (
              <button
                key={filter}
                type="button"
                onClick={() => setActiveFilter(filter)}
                className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                  activeFilter === filter
                    ? 'border-[#d9c8b0] bg-[#f5efe3] text-[#111111]'
                    : 'border-white/12 bg-white/6 text-white/72 hover:bg-white/10'
                }`}
              >
                {filter === 'ALL' ? 'All' : filter === 'FEATURED' ? 'Featured' : filter}
              </button>
            ))}
          </div>

          <div className="w-full lg:max-w-sm">
            <input
              type="search"
              value={searchValue}
              onChange={(event) => setSearchValue(event.target.value)}
              placeholder="Search current page by title or slug"
              className="w-full rounded-2xl border border-white/12 bg-white/6 px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/35 focus:border-white/30"
            />
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-[30px] border border-white/10 bg-white/5">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm text-white/80">
            <thead className="bg-white/6 text-xs uppercase tracking-[0.18em] text-white/45">
              <tr>
                <th className="px-5 py-4">Title</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4">Featured</th>
                <th className="px-5 py-4">Published</th>
                <th className="px-5 py-4">Updated</th>
                <th className="px-5 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan="6" className="px-5 py-16 text-center text-white/55">
                    Loading blog posts...
                  </td>
                </tr>
              ) : null}

              {!isLoading && blogPage?.items?.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-5 py-16 text-center text-white/55">
                    No blog posts yet. Create the first one from the button above.
                  </td>
                </tr>
              ) : null}

              {!isLoading && blogPage?.items?.length > 0 && filteredPosts.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-5 py-16 text-center text-white/55">
                    No posts match the current filter or search on this page.
                  </td>
                </tr>
              ) : null}

              {!isLoading
                ? filteredPosts.map((post) => (
                    <tr key={post.id} className="border-t border-white/8 align-top">
                      <td className="px-5 py-4">
                        <p className="font-medium text-white">{post.title}</p>
                        <p className="mt-2 max-w-sm text-xs text-white/50">{post.excerpt}</p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          <span className="rounded-full border border-white/10 bg-white/6 px-3 py-1 text-xs text-white/58">
                            {post.slug}
                          </span>
                          <span className="rounded-full border border-white/10 bg-white/6 px-3 py-1 text-xs text-white/58">
                            {post.readingTime} min read
                          </span>
                          <span className="rounded-full border border-white/10 bg-white/6 px-3 py-1 text-xs text-white/58">
                            {post.mediaAssets?.length || 0} media
                          </span>
                        </div>
                        {post.tags?.length ? (
                          <div className="mt-3 flex max-w-[360px] flex-wrap gap-2">
                            {post.tags.map((tag) => (
                              <span key={tag.id} className="rounded-full border border-white/10 bg-white/6 px-3 py-1 text-xs text-white/72">
                                {tag.name}
                              </span>
                            ))}
                          </div>
                        ) : null}
                      </td>
                      <td className="px-5 py-4">
                        <span className={`rounded-full px-3 py-1 text-xs font-medium ${post.status === 'PUBLISHED' ? 'bg-[#23422f] text-[#dff5e3]' : 'bg-white/10 text-white/70'}`}>
                          {post.status}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        {post.featured ? (
                          <span className="rounded-full bg-[#f5efe3] px-3 py-1 text-xs font-medium text-[#111111]">Featured</span>
                        ) : (
                          <span className="text-white/40">No</span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-white/62">{formatDateTime(post.publishedAt)}</td>
                      <td className="px-5 py-4 text-white/62">{formatDateTime(post.updatedAt)}</td>
                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => navigate(`/admin/blog-posts/${post.id}/edit`)}
                            className="rounded-full border border-white/12 px-4 py-2 text-xs font-medium text-white/75 transition hover:bg-white/8"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(post)}
                            disabled={isDeletingId === post.id}
                            className="rounded-full border border-[#8b452c]/40 px-4 py-2 text-xs font-medium text-[#f7b39c] transition hover:bg-[#8b452c]/10 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {isDeletingId === post.id ? 'Deleting...' : 'Delete'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                : null}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex flex-col gap-3 rounded-[24px] border border-white/10 bg-white/4 px-5 py-4 text-sm text-white/62 md:flex-row md:items-center md:justify-between">
        <p>
          Page {(blogPage?.page ?? 0) + 1} of {blogPage?.totalPages || 1} | {blogPage?.totalElements ?? 0} posts total
        </p>
        <div className="flex gap-3">
          <button
            type="button"
            disabled={currentPage === 0 || isLoading}
            onClick={() => setCurrentPage((page) => Math.max(page - 1, 0))}
            className="rounded-full border border-white/12 px-4 py-2 text-white/75 transition hover:bg-white/8 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Previous
          </button>
          <button
            type="button"
            disabled={!blogPage?.hasNext || isLoading}
            onClick={() => setCurrentPage((page) => page + 1)}
            className="rounded-full border border-white/12 px-4 py-2 text-white/75 transition hover:bg-white/8 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </section>
  )
}
