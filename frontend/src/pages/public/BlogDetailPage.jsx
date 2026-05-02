import { useEffect, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import { useParams } from 'react-router-dom'
import { getBlogPostBySlug } from '../../api/blogPosts'
import { getApiErrorDetails } from '../../utils/apiError'

export function BlogDetailPage() {
  const { slug } = useParams()
  const [post, setPost] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [pageError, setPageError] = useState('')

  useEffect(() => {
    let isActive = true

    async function loadPost() {
      setIsLoading(true)
      setPageError('')

      try {
        const response = await getBlogPostBySlug(slug)

        if (isActive) {
          setPost(response)
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

    loadPost()

    return () => {
      isActive = false
    }
  }, [slug])

  if (isLoading) {
    return (
      <section className="rounded-[30px] border border-black/10 bg-white px-6 py-16 text-center text-black/55">
        Loading post...
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

  if (!post) {
    return null
  }

  return (
    <article className="mx-auto max-w-4xl space-y-8">
      <header className="space-y-4">
        <p className="text-sm uppercase tracking-[0.25em] text-[#8b452c]">Blog</p>
        <h1 className="font-['Space_Grotesk'] text-4xl font-semibold tracking-tight text-[#111111] lg:text-5xl">
          {post.title}
        </h1>
        <p className="max-w-2xl text-base leading-7 text-black/68">{post.excerpt}</p>
        <div className="flex flex-wrap gap-3 text-sm text-black/52">
          <span>{post.readingTime} min read</span>
          {post.publishedAt ? <span>{new Date(post.publishedAt).toLocaleDateString()}</span> : null}
        </div>
      </header>

      {post.coverImageUrl ? (
        <div className="overflow-hidden rounded-[32px] border border-black/10 bg-[#f4efe7]">
          <img src={post.coverImageUrl} alt={post.title} className="h-auto w-full object-cover" />
        </div>
      ) : null}

      <div className="prose prose-lg max-w-none text-black/82">
        <ReactMarkdown
          components={{
            img: (props) => (
              <img
                {...props}
                className="my-8 w-full rounded-[24px] border border-black/8 object-cover shadow-[0_18px_50px_rgba(17,17,17,0.08)]"
                loading="lazy"
              />
            ),
          }}
        >
          {post.contentMarkdown}
        </ReactMarkdown>
      </div>
    </article>
  )
}
