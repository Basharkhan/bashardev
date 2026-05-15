import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { BlogPostEditorForm } from '../../components/admin/BlogPostEditorForm'
import { createBlogPost, getAdminBlogPostById, getAdminBlogPostOptions, updateBlogPost } from '../../api/blogPosts'
import { getAdminTagOptions } from '../../api/tags'
import { getApiErrorDetails } from '../../utils/apiError'

export function AdminBlogPostEditorPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEditMode = Boolean(id)

  const [post, setPost] = useState(null)
  const [availableTags, setAvailableTags] = useState([])
  const [availablePostOptions, setAvailablePostOptions] = useState([])
  const [isLoading, setIsLoading] = useState(isEditMode)
  const [isTagsLoading, setIsTagsLoading] = useState(true)
  const [isPostOptionsLoading, setIsPostOptionsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [pageError, setPageError] = useState('')

  useEffect(() => {
    loadTags()
    loadPostOptions()
  }, [])

  useEffect(() => {
    if (!isEditMode) {
      setPost(null)
      setIsLoading(false)
      return
    }

    loadPost(id)
  }, [id, isEditMode])

  async function loadTags() {
    setIsTagsLoading(true)

    try {
      const response = await getAdminTagOptions()
      setAvailableTags(response)
    } catch (error) {
      setPageError((current) => current || getApiErrorDetails(error).message)
    } finally {
      setIsTagsLoading(false)
    }
  }

  async function loadPost(postId) {
    setIsLoading(true)
    setPageError('')

    try {
      const response = await getAdminBlogPostById(postId)
      setPost(response)
    } catch (error) {
      setPageError(getApiErrorDetails(error).message)
    } finally {
      setIsLoading(false)
    }
  }

  async function loadPostOptions() {
    setIsPostOptionsLoading(true)

    try {
      const response = await getAdminBlogPostOptions()
      setAvailablePostOptions(response)
    } catch (error) {
      setPageError((current) => current || getApiErrorDetails(error).message)
    } finally {
      setIsPostOptionsLoading(false)
    }
  }

  async function handleSubmit(payload) {
    setIsSaving(true)

    try {
      if (isEditMode) {
        await updateBlogPost(id, payload)
      } else {
        await createBlogPost(payload)
      }

      navigate('/admin/blog-posts')
    } finally {
      setIsSaving(false)
    }
  }

  function handleBack() {
    navigate('/admin/blog-posts')
  }

  if (isLoading) {
    return (
      <section className="rounded-[28px] border border-white/10 bg-white/4 px-6 py-16 text-center text-white/55">
        Loading editor...
      </section>
    )
  }

  if (pageError && isEditMode && !post) {
    return (
      <section className="space-y-5">
        <div className="rounded-[28px] border border-[#8b452c]/40 bg-[#8b452c]/10 px-5 py-4 text-[#ffd4c4]">
          {pageError}
        </div>
        <button
          type="button"
          onClick={handleBack}
          className="rounded-full border border-white/12 px-5 py-3 font-medium text-white/75 transition hover:bg-white/8"
        >
          Back to posts
        </button>
      </section>
    )
  }

  return (
    <section className="space-y-6">
      {pageError && !isEditMode ? (
        <div className="rounded-[28px] border border-[#8b452c]/40 bg-[#8b452c]/10 px-5 py-4 text-[#ffd4c4]">
          {pageError}
        </div>
      ) : null}

      <BlogPostEditorForm
        availableTags={availableTags}
        availablePostOptions={availablePostOptions}
        post={post}
        onBack={handleBack}
        onSubmit={handleSubmit}
        isSubmitting={isSaving || isTagsLoading || isPostOptionsLoading}
      />
    </section>
  )
}
