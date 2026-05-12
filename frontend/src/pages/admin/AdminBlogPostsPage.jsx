import { useEffect, useRef, useState } from 'react'
import DOMPurify from 'isomorphic-dompurify'
import { createBlogPost, deleteBlogPost, getAdminBlogPosts, updateBlogPost } from '../../api/blogPosts'
import { getAdminTagOptions } from '../../api/tags'
import { deleteMediaAsset, getMediaAssets, uploadImage } from '../../api/uploads'
import { getApiErrorDetails } from '../../utils/apiError'
import { RichTextEditor } from '../../components/admin/RichTextEditor'
import { cn } from '../../lib/utils'

const initialFormData = {
  title: '',
  slug: '',
  excerpt: '',
  content: '',
  coverImageUrl: '',
  status: 'DRAFT',
  featured: false,
  publishedAt: '',
  readingTime: 1,
  seoTitle: '',
  seoDescription: '',
  tagIds: [],
  mediaAssetIds: [],
}

const statusOptions = ['DRAFT', 'PUBLISHED']

function slugify(value) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function formatDateTime(value) {
  if (!value) {
    return 'Not set'
  }

  return new Date(value).toLocaleString()
}

function toDateTimeLocalValue(value) {
  if (!value) {
    return ''
  }

  const date = new Date(value)
  const offset = date.getTimezoneOffset()
  const localDate = new Date(date.getTime() - offset * 60 * 1000)
  return localDate.toISOString().slice(0, 16)
}

function toPayload(formData) {
  return {
    ...formData,
    title: formData.title.trim(),
    slug: formData.slug.trim(),
    excerpt: formData.excerpt.trim(),
    content: formData.content.trim(),
    coverImageUrl: formData.coverImageUrl.trim(),
    seoTitle: formData.seoTitle.trim(),
    seoDescription: formData.seoDescription.trim(),
    readingTime: Number(formData.readingTime),
    publishedAt: formData.publishedAt ? new Date(formData.publishedAt).toISOString() : null,
    tagIds: formData.tagIds,
    mediaAssetIds: formData.mediaAssetIds,
  }
}

function validateForm(formData) {
  const errors = {}

  if (!formData.title.trim()) errors.title = 'Title is required.'
  if (!formData.slug.trim()) errors.slug = 'Slug is required.'
  if (!formData.excerpt.trim()) errors.excerpt = 'Excerpt is required.'
  if (!formData.content.trim()) errors.content = 'Content is required.'
  if (formData.title.trim().length > 180) errors.title = 'Title must be at most 180 characters.'
  if (formData.slug.trim().length > 200) errors.slug = 'Slug must be at most 200 characters.'
  if (formData.excerpt.trim().length > 500) errors.excerpt = 'Excerpt must be at most 500 characters.'
  if (formData.coverImageUrl.trim().length > 255) errors.coverImageUrl = 'Cover image URL must be at most 255 characters.'
  if (String(formData.readingTime).trim() === '') errors.readingTime = 'Reading time is required.'
  if (Number(formData.readingTime) < 1) errors.readingTime = 'Reading time must be at least 1 minute.'
  if (formData.seoTitle.trim().length > 160) errors.seoTitle = 'SEO title must be at most 160 characters.'
  if (formData.seoDescription.trim().length > 255) errors.seoDescription = 'SEO description must be at most 255 characters.'

  if (formData.status === 'PUBLISHED' && !formData.publishedAt) {
    errors.publishedAt = 'Published date is required when status is published.'
  }

  return errors
}

function ModalShell({ title, children, onClose }) {
  return (
    <div className="fixed inset-0 z-40 flex items-start justify-center overflow-y-auto bg-black/60 px-4 py-8 backdrop-blur-sm">
      <div className="w-full max-w-6xl rounded-[30px] border border-white/10 bg-[#111111] shadow-[0_32px_120px_rgba(0,0,0,0.45)]">
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-5 lg:px-8">
          <h2 className="font-['Space_Grotesk'] text-2xl font-semibold text-white">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-white/12 px-4 py-2 text-sm text-white/75 transition hover:bg-white/8"
          >
            Close
          </button>
        </div>
        <div className="p-6 lg:p-8">{children}</div>
      </div>
    </div>
  )
}

function FieldError({ message }) {
  if (!message) {
    return null
  }

  return <p className="text-sm text-[#f7a28c]">{message}</p>
}

function AdminBlogPostModal({ availableTags, post, onClose, onSubmit, isSubmitting }) {
  const [formData, setFormData] = useState(() =>
    post
      ? {
          title: post.title ?? '',
          slug: post.slug ?? '',
          excerpt: post.excerpt ?? '',
          content: post.content ?? '',
          coverImageUrl: post.coverImageUrl ?? '',
          status: post.status ?? 'DRAFT',
          featured: Boolean(post.featured),
          publishedAt: toDateTimeLocalValue(post.publishedAt),
          readingTime: post.readingTime ?? 1,
          seoTitle: post.seoTitle ?? '',
          seoDescription: post.seoDescription ?? '',
          tagIds: post.tags?.map((tag) => tag.id) ?? [],
          mediaAssetIds: post.mediaAssets?.map((media) => media.id) ?? [],
        }
      : initialFormData,
  )
  const [fieldErrors, setFieldErrors] = useState({})
  const [touchedFields, setTouchedFields] = useState({})
  const [formError, setFormError] = useState('')
  const [isSlugDirty, setIsSlugDirty] = useState(Boolean(post?.slug))
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const [deletingMediaId, setDeletingMediaId] = useState(null)
  const [availableMedia, setAvailableMedia] = useState([])
  const [mediaPage, setMediaPage] = useState(0)
  const [mediaSearchInput, setMediaSearchInput] = useState('')
  const [mediaSearch, setMediaSearch] = useState('')
  const [mediaHasNext, setMediaHasNext] = useState(false)
  const [isMediaLoading, setIsMediaLoading] = useState(true)
  const editorRef = useRef(null)

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setMediaSearch(mediaSearchInput.trim())
      setMediaPage(0)
    }, 250)

    return () => clearTimeout(timeoutId)
  }, [mediaSearchInput])

  useEffect(() => {
    loadMediaPage(mediaPage, mediaSearch)
  }, [mediaPage, mediaSearch])

  async function loadMediaPage(page, search) {
    setIsMediaLoading(true)

    try {
      const response = await getMediaAssets({
        page,
        size: 12,
        search,
      })
      setAvailableMedia(response.items ?? [])
      setMediaHasNext(Boolean(response.hasNext))
    } catch (error) {
      setFormError(getApiErrorDetails(error).message)
      setAvailableMedia([])
      setMediaHasNext(false)
    } finally {
      setIsMediaLoading(false)
    }
  }

  function validateField(name, nextState) {
    const errors = validateForm(nextState)
    return errors[name] || ''
  }

  function markFieldTouched(name) {
    setTouchedFields((current) => {
      if (current[name]) {
        return current
      }

      return {
        ...current,
        [name]: true,
      }
    })
  }

  function handleChange(event) {
    const { name, value, type, checked } = event.target
    const nextValue = type === 'checkbox' ? checked : value
    let nextFormState

    setFormData((current) => {
      nextFormState = {
        ...current,
        [name]: nextValue,
      }

      if (name === 'title' && !isSlugDirty) {
        nextFormState.slug = slugify(value)
      }

      if (name === 'status' && value === 'DRAFT') {
        nextFormState.publishedAt = ''
      }

      return nextFormState
    })

    if (name === 'slug') {
      setIsSlugDirty(true)
    }

    setFormError('')

    setFieldErrors((current) => {
      const nextErrors = {
        ...current,
      }

      if (touchedFields[name] || current[name]) {
        nextErrors[name] = validateField(name, nextFormState)
      }

      if (name === 'title' && !isSlugDirty && (touchedFields.slug || current.slug)) {
        nextErrors.slug = validateField('slug', nextFormState)
      }

      if (name === 'status' && (touchedFields.publishedAt || current.publishedAt)) {
        nextErrors.publishedAt = validateField('publishedAt', nextFormState)
      }

      return nextErrors
    })
  }

  function handleBlur(event) {
    const { name } = event.target
    markFieldTouched(name)
    setFieldErrors((current) => ({
      ...current,
      [name]: validateField(name, formData),
    }))
  }

  function handleContentChange(html) {
    const nextFormState = {
      ...formData,
      content: html,
    }

    setFormData(nextFormState)
    setFormError('')
    setFieldErrors((current) => ({
      ...current,
      content: touchedFields.content || current.content ? validateField('content', nextFormState) : current.content,
    }))
  }

  function handleContentBlur() {
    markFieldTouched('content')
    setFieldErrors((current) => ({
      ...current,
      content: validateField('content', formData),
    }))
  }

  async function handleSubmit(event) {
    event.preventDefault()

    const clientErrors = validateForm(formData)

    if (Object.keys(clientErrors).length > 0) {
      setFieldErrors(clientErrors)
      return
    }

    setFormError('')

    try {
      await onSubmit(toPayload(formData))
    } catch (error) {
      const details = getApiErrorDetails(error)
      setFieldErrors(details.fieldErrors)
      setFormError(details.message)
    }
  }

  async function handleImageUpload(event) {
    const file = event.target.files?.[0]

    if (!file) {
      return
    }

    setIsUploadingImage(true)
    setFormError('')

    try {
      const response = await uploadImage(file)
      setFormData((current) => ({
        ...current,
        coverImageUrl: response.url,
        mediaAssetIds: current.mediaAssetIds.includes(response.id)
          ? current.mediaAssetIds
          : [response.id, ...current.mediaAssetIds],
      }))
      setFieldErrors((current) => ({
        ...current,
        coverImageUrl: '',
      }))
      await loadMediaPage(mediaPage, mediaSearch)
    } catch (error) {
      setFormError(getApiErrorDetails(error).message)
    } finally {
      setIsUploadingImage(false)
      event.target.value = ''
    }
  }

  function handleTagToggle(tagId) {
    setFormData((current) => {
      const hasTag = current.tagIds.includes(tagId)

      return {
        ...current,
        tagIds: hasTag
          ? current.tagIds.filter((currentTagId) => currentTagId !== tagId)
          : [...current.tagIds, tagId],
      }
    })

    setFieldErrors((current) => ({
      ...current,
      tagIds: '',
    }))
  }

  async function handleMediaDelete(media) {
    const shouldDelete = window.confirm(`Delete "${media.originalFileName}" from the media library?`)

    if (!shouldDelete) {
      return
    }

    setDeletingMediaId(media.id)
    setFormError('')

    try {
      await deleteMediaAsset(media.id)

      if (formData.coverImageUrl === media.url) {
        setFormData((current) => ({
          ...current,
          coverImageUrl: '',
          mediaAssetIds: current.mediaAssetIds.filter((mediaAssetId) => mediaAssetId !== media.id),
        }))
      } else {
        setFormData((current) => ({
          ...current,
          mediaAssetIds: current.mediaAssetIds.filter((mediaAssetId) => mediaAssetId !== media.id),
        }))
      }

      await loadMediaPage(mediaPage, mediaSearch)
    } catch (error) {
      setFormError(getApiErrorDetails(error).message)
    } finally {
      setDeletingMediaId(null)
    }
  }

  function insertMediaIntoContent(media) {
    if (editorRef.current) {
      editorRef.current.insertImage(media.url, media.originalFileName)
    }

    setFormData((current) => ({
      ...current,
      mediaAssetIds: current.mediaAssetIds.includes(media.id)
        ? current.mediaAssetIds
        : [...current.mediaAssetIds, media.id],
    }))

    setFieldErrors((current) => ({
      ...current,
      content: '',
    }))
  }

  function handleMediaToggle(mediaId) {
    setFormData((current) => {
      const isSelected = current.mediaAssetIds.includes(mediaId)

      return {
        ...current,
        mediaAssetIds: isSelected
          ? current.mediaAssetIds.filter((currentMediaId) => currentMediaId !== mediaId)
          : [...current.mediaAssetIds, mediaId],
      }
    })
  }

  const selectedMedia = (post?.mediaAssets ?? [])
    .concat(availableMedia)
    .filter((media, index, array) => array.findIndex((current) => current.id === media.id) === index)

  return (
    <ModalShell title={post ? 'Edit blog post' : 'Create blog post'} onClose={onClose}>
      <form className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]" onSubmit={handleSubmit}>
        <div className="space-y-5">
          <label className="block space-y-2">
            <span className="text-sm text-white/75">Title</span>
            <input
              name="title"
              value={formData.title}
              onChange={handleChange}
              onBlur={handleBlur}
              className={cn(
                'w-full rounded-2xl border border-white/12 bg-white/6 px-4 py-3 text-white outline-none transition focus:border-white/30',
                fieldErrors.title && 'border-[#c96b53] bg-[#2a1713] focus:border-[#f0a991]',
              )}
            />
            <FieldError message={fieldErrors.title} />
          </label>

          <label className="block space-y-2">
            <span className="text-sm text-white/75">Slug</span>
            <input
              name="slug"
              value={formData.slug}
              onChange={handleChange}
              onBlur={handleBlur}
              className={cn(
                'w-full rounded-2xl border border-white/12 bg-white/6 px-4 py-3 text-white outline-none transition focus:border-white/30',
                fieldErrors.slug && 'border-[#c96b53] bg-[#2a1713] focus:border-[#f0a991]',
              )}
            />
            <FieldError message={fieldErrors.slug} />
          </label>

          <label className="block space-y-2">
            <span className="text-sm text-white/75">Excerpt</span>
            <textarea
              name="excerpt"
              rows="4"
              value={formData.excerpt}
              onChange={handleChange}
              onBlur={handleBlur}
              className={cn(
                'w-full rounded-2xl border border-white/12 bg-white/6 px-4 py-3 text-white outline-none transition focus:border-white/30',
                fieldErrors.excerpt && 'border-[#c96b53] bg-[#2a1713] focus:border-[#f0a991]',
              )}
            />
            <FieldError message={fieldErrors.excerpt} />
          </label>

          <label className="block space-y-2">
            <span className="text-sm text-white/75">Content</span>
            <RichTextEditor
              ref={editorRef}
              content={formData.content}
              onChange={handleContentChange}
              onBlur={handleContentBlur}
              className={cn(fieldErrors.content && 'border-[#c96b53] bg-[#2a1713]')}
            />
            <FieldError message={fieldErrors.content} />
          </label>

          <label className="block space-y-2">
            <span className="text-sm text-white/75">Cover image</span>
            <div className="flex flex-wrap gap-3">
              <label className="inline-flex cursor-pointer rounded-full border border-white/12 px-4 py-2 text-sm font-medium text-white/80 transition hover:bg-white/8">
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/gif"
                  onChange={handleImageUpload}
                  className="hidden"
                  disabled={isUploadingImage}
                />
                {isUploadingImage ? 'Uploading...' : 'Upload image'}
              </label>
              {formData.coverImageUrl ? (
                <a
                  href={formData.coverImageUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex rounded-full border border-white/12 px-4 py-2 text-sm text-white/65 transition hover:bg-white/8"
                >
                  Open image
                </a>
              ) : null}
            </div>
            <p className="text-xs text-white/45">JPG, PNG, WEBP, or GIF up to 5 MB. Upload stores the file locally on the backend and fills the URL automatically.</p>
            <input
              name="coverImageUrl"
              value={formData.coverImageUrl}
              onChange={handleChange}
              onBlur={handleBlur}
              className={cn(
                'w-full rounded-2xl border border-white/12 bg-white/6 px-4 py-3 text-white outline-none transition focus:border-white/30',
                fieldErrors.coverImageUrl && 'border-[#c96b53] bg-[#2a1713] focus:border-[#f0a991]',
              )}
              placeholder="Uploaded image URL will appear here"
            />
            <FieldError message={fieldErrors.coverImageUrl} />
          </label>

            <div className="space-y-3 rounded-[28px] border border-white/10 bg-white/4 p-5">
              <div>
                <p className="font-['Space_Grotesk'] text-lg font-semibold text-white">Media library</p>
                <p className="mt-1 text-sm text-white/55">Pick a cover image, attach reusable assets, or insert a markdown image directly into the post body.</p>
              </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex w-full gap-2 sm:max-w-sm">
                <input
                  type="search"
                  value={mediaSearchInput}
                  onChange={(event) => setMediaSearchInput(event.target.value)}
                  placeholder="Search media by filename"
                  className="w-full rounded-2xl border border-white/12 bg-white/6 px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/35 focus:border-white/30"
                />
                <button
                  type="button"
                  onClick={() => {
                    setMediaSearchInput('')
                    setMediaSearch('')
                    setMediaPage(0)
                  }}
                  disabled={!mediaSearchInput && !mediaSearch}
                  className="rounded-full border border-white/12 px-4 py-2 text-xs font-medium text-white/75 transition hover:bg-white/8 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Clear
                </button>
              </div>
              <div className="flex gap-2">
                <span className="inline-flex items-center rounded-full border border-white/12 px-3 py-2 text-xs font-medium text-white/70">
                  Page {mediaPage + 1}
                </span>
                <button
                  type="button"
                  disabled={mediaPage === 0 || isMediaLoading}
                  onClick={() => setMediaPage((current) => Math.max(current - 1, 0))}
                  className="rounded-full border border-white/12 px-4 py-2 text-xs font-medium text-white/75 transition hover:bg-white/8 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  type="button"
                  disabled={!mediaHasNext || isMediaLoading}
                  onClick={() => setMediaPage((current) => current + 1)}
                  className="rounded-full border border-white/12 px-4 py-2 text-xs font-medium text-white/75 transition hover:bg-white/8 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>

            {isMediaLoading ? (
              <p className="text-sm text-white/45">Loading media...</p>
            ) : null}

            {!isMediaLoading && availableMedia.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2">
                {availableMedia.map((media) => {
                  const isSelected = formData.coverImageUrl === media.url
                  const isAttached = formData.mediaAssetIds.includes(media.id)

                  return (
                    <div
                      key={media.id}
                      className={`overflow-hidden rounded-[22px] border ${isSelected ? 'border-[#d9c8b0]' : isAttached ? 'border-[#8bb3d8]' : 'border-white/10'} bg-[#0d0d0d]`}
                    >
                      <img src={media.url} alt={media.originalFileName} className="h-36 w-full object-cover" />
                      <div className="space-y-2 p-4">
                        <p className="truncate text-sm font-medium text-white">{media.originalFileName}</p>
                        <p className="text-xs text-white/45">{Math.round(media.sizeBytes / 1024)} KB</p>
                      </div>
                      <div className="flex items-center justify-between border-t border-white/8 px-4 py-3">
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              setFormData((current) => ({
                                ...current,
                                coverImageUrl: media.url,
                                mediaAssetIds: current.mediaAssetIds.includes(media.id)
                                  ? current.mediaAssetIds
                                  : [media.id, ...current.mediaAssetIds],
                              }))
                            }
                            className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
                              isSelected
                                ? 'border-[#d9c8b0] bg-[#f5efe3] text-[#111111]'
                                : 'border-white/12 text-white/75 hover:bg-white/8'
                            }`}
                          >
                            {isSelected ? 'Cover image' : 'Use as cover'}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleMediaToggle(media.id)}
                            className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
                              isAttached
                                ? 'border-[#8bb3d8] bg-[#173042] text-[#d8f0ff]'
                                : 'border-white/12 text-white/75 hover:bg-white/8'
                            }`}
                          >
                            {isAttached ? 'Attached' : 'Attach'}
                          </button>
                          <button
                            type="button"
                            onClick={() => insertMediaIntoContent(media)}
                            className="rounded-full border border-white/12 px-3 py-1 text-xs font-medium text-white/75 transition hover:bg-white/8"
                          >
                            Embed in post
                          </button>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleMediaDelete(media)}
                          disabled={deletingMediaId === media.id}
                          className="rounded-full border border-[#8b452c]/40 px-3 py-1 text-xs font-medium text-[#f7b39c] transition hover:bg-[#8b452c]/10 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {deletingMediaId === media.id ? 'Deleting...' : 'Delete'}
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              !isMediaLoading ? <p className="text-sm text-white/45">No media found for this page/search.</p> : null
            )}
          </div>

          {formData.coverImageUrl ? (
            <div className="overflow-hidden rounded-[24px] border border-white/10 bg-white/4">
              <img
                src={formData.coverImageUrl}
                alt="Cover preview"
                className="h-56 w-full object-cover"
              />
            </div>
          ) : null}

          {formData.mediaAssetIds.length > 0 ? (
            <div className="rounded-[24px] border border-white/10 bg-white/4 p-5">
              <div className="mb-4">
                <p className="font-['Space_Grotesk'] text-lg font-semibold text-white">Attached media</p>
                <p className="mt-1 text-sm text-white/55">These images are stored with the post for future gallery-style rendering.</p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {availableMedia
                  .concat(selectedMedia)
                  .filter((media) => formData.mediaAssetIds.includes(media.id))
                  .filter((media, index, array) => array.findIndex((current) => current.id === media.id) === index)
                  .map((media) => (
                    <div key={media.id} className="overflow-hidden rounded-[20px] border border-white/10 bg-[#0f0f0f]">
                      <img src={media.url} alt={media.originalFileName} className="h-28 w-full object-cover" />
                      <div className="flex items-center justify-between gap-3 p-3">
                        <p className="truncate text-sm text-white/80">{media.originalFileName}</p>
                        <button
                          type="button"
                          onClick={() => handleMediaToggle(media.id)}
                          className="rounded-full border border-white/12 px-3 py-1 text-xs text-white/70 transition hover:bg-white/8"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          ) : null}
        </div>

        <div className="space-y-5">
          <div className="grid gap-5 md:grid-cols-2">
            <label className="block space-y-2">
              <span className="text-sm text-white/75">Status</span>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                onBlur={handleBlur}
                className={cn(
                  'w-full rounded-2xl border border-white/12 bg-white/6 px-4 py-3 text-white outline-none transition focus:border-white/30',
                  fieldErrors.status && 'border-[#c96b53] bg-[#2a1713] focus:border-[#f0a991]',
                )}
              >
                {statusOptions.map((status) => (
                  <option key={status} value={status} className="bg-[#111111]">
                    {status}
                  </option>
                ))}
              </select>
              <FieldError message={fieldErrors.status} />
            </label>

            <label className="block space-y-2">
              <span className="text-sm text-white/75">Reading time (minutes)</span>
              <input
                name="readingTime"
                type="number"
                min="1"
                value={formData.readingTime}
                onChange={handleChange}
                onBlur={handleBlur}
                className={cn(
                  'w-full rounded-2xl border border-white/12 bg-white/6 px-4 py-3 text-white outline-none transition focus:border-white/30',
                  fieldErrors.readingTime && 'border-[#c96b53] bg-[#2a1713] focus:border-[#f0a991]',
                )}
              />
              <FieldError message={fieldErrors.readingTime} />
            </label>
          </div>

          <label className="block space-y-2">
            <span className="text-sm text-white/75">Published at</span>
            <input
              name="publishedAt"
              type="datetime-local"
              value={formData.publishedAt}
              onChange={handleChange}
              onBlur={handleBlur}
              disabled={formData.status === 'DRAFT'}
              className={cn(
                'w-full rounded-2xl border border-white/12 bg-white/6 px-4 py-3 text-white outline-none transition focus:border-white/30 disabled:cursor-not-allowed disabled:opacity-50',
                fieldErrors.publishedAt && 'border-[#c96b53] bg-[#2a1713] focus:border-[#f0a991]',
              )}
            />
            <FieldError message={fieldErrors.publishedAt} />
          </label>

          <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/6 px-4 py-4 text-white/80">
            <input
              name="featured"
              type="checkbox"
              checked={formData.featured}
              onChange={handleChange}
              className="h-4 w-4"
            />
            <span>Feature this post on the public site</span>
          </label>

          <div className="space-y-3 rounded-[28px] border border-white/10 bg-white/4 p-5">
            <div>
              <p className="font-['Space_Grotesk'] text-lg font-semibold text-white">Tags</p>
              <p className="mt-1 text-sm text-white/55">Assign zero or more tags to help organize posts.</p>
            </div>

            {availableTags.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {availableTags.map((tag) => {
                  const isSelected = formData.tagIds.includes(tag.id)

                  return (
                    <button
                      key={tag.id}
                      type="button"
                      onClick={() => handleTagToggle(tag.id)}
                      className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                        isSelected
                          ? 'border-[#d9c8b0] bg-[#f5efe3] text-[#111111]'
                          : 'border-white/12 bg-white/6 text-white/75 hover:bg-white/10'
                      }`}
                    >
                      {tag.name}
                    </button>
                  )
                })}
              </div>
            ) : (
              <p className="text-sm text-white/45">No tags exist yet. Create tags from the backend or a future admin tag screen.</p>
            )}
            <FieldError message={fieldErrors.tagIds} />
          </div>

          <div className="space-y-5 rounded-[28px] border border-white/10 bg-white/4 p-5">
            <div>
              <p className="font-['Space_Grotesk'] text-lg font-semibold text-white">SEO</p>
              <p className="mt-1 text-sm text-white/55">Keep this secondary so the content workflow stays fast.</p>
            </div>

            <label className="block space-y-2">
              <span className="text-sm text-white/75">SEO title</span>
              <input
                name="seoTitle"
                value={formData.seoTitle}
                onChange={handleChange}
                onBlur={handleBlur}
                className={cn(
                  'w-full rounded-2xl border border-white/12 bg-white/6 px-4 py-3 text-white outline-none transition focus:border-white/30',
                  fieldErrors.seoTitle && 'border-[#c96b53] bg-[#2a1713] focus:border-[#f0a991]',
                )}
              />
              <FieldError message={fieldErrors.seoTitle} />
            </label>

            <label className="block space-y-2">
              <span className="text-sm text-white/75">SEO description</span>
              <textarea
                name="seoDescription"
                rows="4"
                value={formData.seoDescription}
                onChange={handleChange}
                onBlur={handleBlur}
                className={cn(
                  'w-full rounded-2xl border border-white/12 bg-white/6 px-4 py-3 text-white outline-none transition focus:border-white/30',
                  fieldErrors.seoDescription && 'border-[#c96b53] bg-[#2a1713] focus:border-[#f0a991]',
                )}
              />
              <FieldError message={fieldErrors.seoDescription} />
            </label>
          </div>

          <div className="rounded-[28px] border border-white/10 bg-[#0b0b0b] p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="font-['Space_Grotesk'] text-lg font-semibold text-white">Preview</p>
                <p className="mt-1 text-sm text-white/55">Live markdown preview, including embedded post images.</p>
              </div>
            </div>
            <div className="prose prose-invert mt-5 max-w-none text-sm text-white/80 [&_img]:my-6 [&_img]:w-full [&_img]:rounded-[22px] [&_img]:border [&_img]:border-white/10">
              {formData.content.trim() ? (
                <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(formData.content) }} />
              ) : (
                <p className="text-white/45">Start writing to see a preview.</p>
              )}
            </div>
          </div>

          {formError ? <p className="rounded-2xl border border-[#8b452c]/40 bg-[#8b452c]/10 px-4 py-3 text-sm text-[#ffd4c4]">{formError}</p> : null}

          <div className="flex flex-wrap justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-white/12 px-5 py-3 font-medium text-white/75 transition hover:bg-white/8"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || isUploadingImage}
              className="rounded-full bg-[#f5efe3] px-5 py-3 font-medium text-[#111111] transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? 'Saving...' : isUploadingImage ? 'Uploading image...' : post ? 'Save changes' : 'Create post'}
            </button>
          </div>
        </div>
      </form>
    </ModalShell>
  )
}

export function AdminBlogPostsPage() {
  const [blogPage, setBlogPage] = useState(null)
  const [availableTags, setAvailableTags] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isTagsLoading, setIsTagsLoading] = useState(true)
  const [pageError, setPageError] = useState('')
  const [currentPage, setCurrentPage] = useState(0)
  const [activePost, setActivePost] = useState(null)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeletingId, setIsDeletingId] = useState(null)

  useEffect(() => {
    loadPage(currentPage)
  }, [currentPage])

  useEffect(() => {
    loadTags()
  }, [])

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

  async function handleCreate(payload) {
    setIsSaving(true)

    try {
      await createBlogPost(payload)
      setIsCreateOpen(false)
      setCurrentPage(0)
      await loadPage(0)
    } finally {
      setIsSaving(false)
    }
  }

  async function handleUpdate(payload) {
    setIsSaving(true)

    try {
      await updateBlogPost(activePost.id, payload)
      setActivePost(null)
      await loadPage(currentPage)
    } finally {
      setIsSaving(false)
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

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.25em] text-white/45">Admin blog</p>
          <h1 className="mt-3 font-['Space_Grotesk'] text-4xl font-semibold tracking-tight">Manage blog posts</h1>
          <p className="mt-3 max-w-3xl text-white/68">
            Full CRUD is available here. Create and edit posts in a modal, validate fields inline, preview markdown live, and publish when ready.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsCreateOpen(true)}
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

      <div className="overflow-hidden rounded-[30px] border border-white/10 bg-white/5">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm text-white/80">
            <thead className="bg-white/6 text-xs uppercase tracking-[0.18em] text-white/45">
              <tr>
                <th className="px-5 py-4">Title</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4">Featured</th>
                <th className="px-5 py-4">Tags</th>
                <th className="px-5 py-4">Media</th>
                <th className="px-5 py-4">Published</th>
                <th className="px-5 py-4">Reading</th>
                <th className="px-5 py-4">Slug</th>
                <th className="px-5 py-4">Updated</th>
                <th className="px-5 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan="10" className="px-5 py-16 text-center text-white/55">
                    Loading blog posts...
                  </td>
                </tr>
              ) : null}

              {!isLoading && blogPage?.items?.length === 0 ? (
                <tr>
                  <td colSpan="10" className="px-5 py-16 text-center text-white/55">
                    No blog posts yet. Create the first one from the button above.
                  </td>
                </tr>
              ) : null}

              {!isLoading
                ? blogPage?.items?.map((post) => (
                    <tr key={post.id} className="border-t border-white/8 align-top">
                      <td className="px-5 py-4">
                        <p className="font-medium text-white">{post.title}</p>
                        <p className="mt-2 max-w-sm text-xs text-white/50">{post.excerpt}</p>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`rounded-full px-3 py-1 text-xs font-medium ${post.status === 'PUBLISHED' ? 'bg-[#23422f] text-[#dff5e3]' : 'bg-white/10 text-white/70'}`}>
                          {post.status}
                        </span>
                      </td>
                      <td className="px-5 py-4">{post.featured ? 'Yes' : 'No'}</td>
                      <td className="px-5 py-4">
                        {post.tags?.length ? (
                          <div className="flex max-w-[220px] flex-wrap gap-2">
                            {post.tags.map((tag) => (
                              <span key={tag.id} className="rounded-full border border-white/10 bg-white/6 px-3 py-1 text-xs text-white/72">
                                {tag.name}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-white/40">No tags</span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-white/62">{post.mediaAssets?.length || 0}</td>
                      <td className="px-5 py-4 text-white/62">{formatDateTime(post.publishedAt)}</td>
                      <td className="px-5 py-4 text-white/62">{post.readingTime} min</td>
                      <td className="px-5 py-4 text-white/62">{post.slug}</td>
                      <td className="px-5 py-4 text-white/62">{formatDateTime(post.updatedAt)}</td>
                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setActivePost(post)}
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

      {isCreateOpen ? (
        <AdminBlogPostModal
          availableTags={availableTags}
          onClose={() => setIsCreateOpen(false)}
          onSubmit={handleCreate}
          isSubmitting={isSaving || isTagsLoading}
        />
      ) : null}

      {activePost ? (
        <AdminBlogPostModal
          availableTags={availableTags}
          post={activePost}
          onClose={() => setActivePost(null)}
          onSubmit={handleUpdate}
          isSubmitting={isSaving || isTagsLoading}
        />
      ) : null}

    </section>
  )
}
