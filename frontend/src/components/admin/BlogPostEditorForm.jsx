import { useEffect, useRef, useState } from 'react'
import DOMPurify from 'isomorphic-dompurify'
import { ArrowLeft } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog'
import { deleteMediaAsset, getMediaAssets, uploadImage } from '../../api/uploads'
import { getApiErrorDetails } from '../../utils/apiError'
import { RichTextEditor } from './RichTextEditor'
import { cn } from '../../lib/utils'

export const initialFormData = {
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
  relatedPostIds: [],
}

const statusOptions = ['DRAFT', 'PUBLISHED']

export function slugify(value) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function toDateTimeLocalValue(value) {
  if (!value) {
    return ''
  }

  const date = new Date(value)
  const offset = date.getTimezoneOffset()
  const localDate = new Date(date.getTime() - offset * 60 * 1000)
  return localDate.toISOString().slice(0, 16)
}

export function toPayload(formData) {
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
    relatedPostIds: formData.relatedPostIds,
  }
}

export function validateForm(formData) {
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

function FieldError({ message }) {
  if (!message) {
    return null
  }

  return <p className="text-sm text-[#f7a28c]">{message}</p>
}

function SidebarSection({ title, description, defaultOpen = true, children }) {
  return (
    <details
      open={defaultOpen}
      className="rounded-[24px] border border-white/10 bg-white/4 p-5 open:bg-white/[0.05]"
    >
      <summary className="cursor-pointer list-none">
        <p className="font-['Space_Grotesk'] text-lg font-semibold text-white">{title}</p>
        {description ? <p className="mt-1 pr-8 text-sm text-white/55">{description}</p> : null}
      </summary>
      <div className="mt-5 space-y-5">{children}</div>
    </details>
  )
}

function serializeFormState(formData) {
  return JSON.stringify(toPayload(formData))
}

function MediaBrowserDialog({
  isOpen,
  onOpenChange,
  mode,
  availableMedia,
  formData,
  isMediaLoading,
  mediaSearchInput,
  setMediaSearchInput,
  mediaSearch,
  setMediaSearch,
  mediaPage,
  setMediaPage,
  mediaHasNext,
  handleMediaToggle,
  insertMediaIntoContent,
  replaceEditorImage,
  handleMediaDelete,
  deletingMediaId,
  setFormData,
}) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl">
        <DialogHeader>
          <DialogTitle>Media browser</DialogTitle>
          <DialogDescription>
            {mode === 'replace-image'
              ? 'Choose an asset to replace the selected image in the editor.'
              : 'Choose an existing asset for the cover, attach it to the post, or embed it directly into the editor body.'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex w-full gap-2 lg:max-w-md">
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

            <div className="flex flex-wrap gap-2">
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

          {isMediaLoading ? <p className="text-sm text-white/45">Loading media...</p> : null}

          {!isMediaLoading && availableMedia.length > 0 ? (
            <div className="grid max-h-[60vh] gap-4 overflow-y-auto pr-1 sm:grid-cols-2 xl:grid-cols-3">
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
                    <div className="space-y-3 border-t border-white/8 px-4 py-3">
                      <div className="flex flex-wrap gap-2">
                        {mode === 'replace-image' ? (
                          <button
                            type="button"
                            onClick={() => replaceEditorImage(media)}
                            className="rounded-full border border-[#d9c8b0] bg-[#f5efe3] px-3 py-1 text-xs font-medium text-[#111111] transition hover:bg-white"
                          >
                            Replace selected image
                          </button>
                        ) : null}
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
                          disabled={mode === 'replace-image'}
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
      </DialogContent>
    </Dialog>
  )
}

export function BlogPostEditorForm({
  availableTags,
  availablePostOptions,
  post,
  onBack,
  onSubmit,
  isSubmitting,
}) {
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
          relatedPostIds: post.relatedPosts?.map((relatedPost) => relatedPost.id) ?? [],
        }
      : initialFormData,
  )
  const [fieldErrors, setFieldErrors] = useState({})
  const [dirtyFields, setDirtyFields] = useState({})
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false)
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
  const [isMediaBrowserOpen, setIsMediaBrowserOpen] = useState(false)
  const [mediaBrowserMode, setMediaBrowserMode] = useState('default')
  const [activeView, setActiveView] = useState('write')
  const [relatedSearch, setRelatedSearch] = useState('')
  const [initialSnapshot, setInitialSnapshot] = useState(() =>
    serializeFormState(
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
            relatedPostIds: post.relatedPosts?.map((relatedPost) => relatedPost.id) ?? [],
          }
        : initialFormData,
    ),
  )
  const editorRef = useRef(null)

  useEffect(() => {
    setFormData(
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
            relatedPostIds: post.relatedPosts?.map((relatedPost) => relatedPost.id) ?? [],
          }
        : initialFormData,
    )
    setFieldErrors({})
    setDirtyFields({})
    setHasAttemptedSubmit(false)
    setFormError('')
    setIsSlugDirty(Boolean(post?.slug))
    setInitialSnapshot(
      serializeFormState(
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
              relatedPostIds: post.relatedPosts?.map((relatedPost) => relatedPost.id) ?? [],
            }
          : initialFormData,
      ),
    )
  }, [post])

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

  const isDirty = serializeFormState(formData) !== initialSnapshot

  useEffect(() => {
    if (!isDirty) {
      return undefined
    }

    function handleBeforeUnload(event) {
      event.preventDefault()
      event.returnValue = ''
    }

    window.addEventListener('beforeunload', handleBeforeUnload)

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [isDirty])

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

  function markFieldDirty(name) {
    setDirtyFields((current) => {
      if (current[name]) {
        return current
      }

      return {
        ...current,
        [name]: true,
      }
    })
  }

  function shouldShowBlurError(name, currentErrors) {
    return Boolean(hasAttemptedSubmit || dirtyFields[name] || currentErrors[name])
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

    markFieldDirty(name)
    setFormError('')

    setFieldErrors((current) => {
      const nextErrors = {
        ...current,
      }

      if (hasAttemptedSubmit || current[name]) {
        nextErrors[name] = validateField(name, nextFormState)
      }

      if (name === 'title' && !isSlugDirty && (hasAttemptedSubmit || current.slug)) {
        nextErrors.slug = validateField('slug', nextFormState)
      }

      if (name === 'status' && (hasAttemptedSubmit || current.publishedAt)) {
        nextErrors.publishedAt = validateField('publishedAt', nextFormState)
      }

      return nextErrors
    })
  }

  function handleBlur(event) {
    const { name } = event.target
    setFieldErrors((current) => {
      if (!shouldShowBlurError(name, current)) {
        return current
      }

      return {
        ...current,
        [name]: validateField(name, formData),
      }
    })
  }

  function handleContentChange(html) {
    const nextFormState = {
      ...formData,
      content: html,
    }

    setFormData(nextFormState)
    markFieldDirty('content')
    setFormError('')
    setFieldErrors((current) => ({
      ...current,
      content: hasAttemptedSubmit || current.content ? validateField('content', nextFormState) : current.content,
    }))
  }

  function handleContentBlur() {
    setFieldErrors((current) => {
      if (!shouldShowBlurError('content', current)) {
        return current
      }

      return {
        ...current,
        content: validateField('content', formData),
      }
    })
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setHasAttemptedSubmit(true)

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

  function handleRelatedPostToggle(relatedPostId) {
    setFormData((current) => {
      const isSelected = current.relatedPostIds.includes(relatedPostId)

      return {
        ...current,
        relatedPostIds: isSelected
          ? current.relatedPostIds.filter((currentRelatedPostId) => currentRelatedPostId !== relatedPostId)
          : [...current.relatedPostIds, relatedPostId],
      }
    })

    setFieldErrors((current) => ({
      ...current,
      relatedPostIds: '',
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
  const availableRelatedPosts = (availablePostOptions ?? [])
    .filter((option) => option.id !== post?.id)
    .filter((option) => {
      const query = relatedSearch.trim().toLowerCase()

      if (!query) {
        return true
      }

      return option.title.toLowerCase().includes(query) || option.slug.toLowerCase().includes(query)
    })
  const selectedRelatedPosts = (availablePostOptions ?? [])
    .filter((option) => formData.relatedPostIds.includes(option.id))
    .sort((left, right) => formData.relatedPostIds.indexOf(left.id) - formData.relatedPostIds.indexOf(right.id))

  function handleAttemptLeave() {
    if (!isDirty || window.confirm('You have unsaved changes. Leave this editor anyway?')) {
      onBack()
    }
  }

  return (
    <section className="space-y-6">
      <MediaBrowserDialog
        isOpen={isMediaBrowserOpen}
        onOpenChange={(open) => {
          setIsMediaBrowserOpen(open)

          if (!open) {
            setMediaBrowserMode('default')
          }
        }}
        mode={mediaBrowserMode}
        availableMedia={availableMedia}
        formData={formData}
        isMediaLoading={isMediaLoading}
        mediaSearchInput={mediaSearchInput}
        setMediaSearchInput={setMediaSearchInput}
        mediaSearch={mediaSearch}
        setMediaSearch={setMediaSearch}
        mediaPage={mediaPage}
        setMediaPage={setMediaPage}
        mediaHasNext={mediaHasNext}
        handleMediaToggle={handleMediaToggle}
        insertMediaIntoContent={insertMediaIntoContent}
        replaceEditorImage={(media) => {
          editorRef.current?.replaceSelectedImage(media.url, media.originalFileName)
          setFormData((current) => ({
            ...current,
            mediaAssetIds: current.mediaAssetIds.includes(media.id)
              ? current.mediaAssetIds
              : [...current.mediaAssetIds, media.id],
          }))
          setIsMediaBrowserOpen(false)
          setMediaBrowserMode('default')
        }}
        handleMediaDelete={handleMediaDelete}
        deletingMediaId={deletingMediaId}
        setFormData={setFormData}
      />

      <div className="sticky top-4 z-10 rounded-[28px] border border-white/10 bg-[#111111]/95 px-4 py-4 shadow-[0_18px_50px_rgba(0,0,0,0.25)] backdrop-blur sm:px-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-3">
            <button
              type="button"
              onClick={handleAttemptLeave}
              className="inline-flex size-11 items-center justify-center rounded-full border border-white/12 text-white/75 transition hover:bg-white/8"
              aria-label="Back to blog posts"
            >
              <ArrowLeft className="size-4" />
            </button>
            <div>
              <p className="text-sm uppercase tracking-[0.25em] text-white/42">Admin blog</p>
              <h1 className="mt-2 font-['Space_Grotesk'] text-3xl font-semibold tracking-tight text-white lg:text-4xl">
                {post ? 'Edit blog post' : 'Create blog post'}
              </h1>
              <p className="mt-2 max-w-2xl text-sm text-white/62">
                Write, organize media, and manage publishing details from a full-page editor.
              </p>
              <p className="mt-3 text-xs uppercase tracking-[0.2em] text-white/42">
                {isSubmitting ? 'Saving changes' : isDirty ? 'Unsaved changes' : 'No unsaved changes'}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleAttemptLeave}
              className="rounded-full border border-white/12 px-5 py-3 font-medium text-white/75 transition hover:bg-white/8"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="blog-post-editor-form"
              disabled={isSubmitting || isUploadingImage}
              className="rounded-full bg-[#f5efe3] px-5 py-3 font-medium text-[#111111] transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? 'Saving...' : isUploadingImage ? 'Uploading image...' : post ? 'Save changes' : 'Create post'}
            </button>
          </div>
        </div>
      </div>

      <form id="blog-post-editor-form" className="grid gap-8 xl:grid-cols-[minmax(0,1.2fr)_380px]" onSubmit={handleSubmit}>
        <div className="space-y-5">
          {formError ? (
            <div className="rounded-[24px] border border-[#8b452c]/40 bg-[#8b452c]/10 px-4 py-3 text-sm text-[#ffd4c4]">
              {formError}
            </div>
          ) : null}

          <div className="overflow-hidden rounded-[36px] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.015))] p-5 shadow-[0_30px_90px_rgba(0,0,0,0.18)] lg:p-8">
            <div className="flex flex-col gap-4 border-b border-white/8 pb-5">
              <div className="inline-flex w-fit rounded-full border border-white/12 bg-white/5 p-1">
                {['write', 'preview'].map((view) => (
                  <button
                    key={view}
                    type="button"
                    onClick={() => setActiveView(view)}
                    className={cn(
                      'rounded-full px-4 py-2 text-sm font-medium transition',
                      activeView === view ? 'bg-[#f5efe3] text-[#111111]' : 'text-white/68 hover:bg-white/8',
                    )}
                  >
                    {view === 'write' ? 'Write' : 'Preview'}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-6 space-y-6">
              <label className="block space-y-3">
                <span className="sr-only">Title</span>
                <input
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Untitled story"
                  className={cn(
                    "w-full border-0 border-b border-white/10 bg-transparent px-0 py-2 font-['Space_Grotesk'] text-4xl font-semibold tracking-tight text-white outline-none transition placeholder:text-white/22 focus:border-white/28 lg:text-6xl",
                    fieldErrors.title && 'border-[#c96b53] focus:border-[#f0a991]',
                  )}
                />
                <FieldError message={fieldErrors.title} />
              </label>

              <label className="block space-y-3">
                <span className="sr-only">Excerpt</span>
                <textarea
                  name="excerpt"
                  rows="3"
                  value={formData.excerpt}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Write a sharp summary that feels like the opening deck of the article."
                  className={cn(
                    'w-full resize-none border-0 bg-transparent px-0 py-0 text-lg leading-8 text-white/74 outline-none transition placeholder:text-white/26 lg:text-[1.35rem]',
                    fieldErrors.excerpt && 'text-[#f3b7a5] placeholder:text-[#f3b7a5]/45',
                  )}
                />
                <FieldError message={fieldErrors.excerpt} />
              </label>

              <div className="grid gap-5 rounded-[28px] border border-white/8 bg-black/18 p-4 lg:grid-cols-[minmax(0,1fr)_220px]">
                <label className="block space-y-2">
                  <span className="text-xs uppercase tracking-[0.18em] text-white/45">Permalink</span>
                  <input
                    name="slug"
                    value={formData.slug}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={cn(
                      'w-full rounded-2xl border border-white/10 bg-white/4 px-4 py-3 text-sm text-white/82 outline-none transition focus:border-white/24',
                      fieldErrors.slug && 'border-[#c96b53] bg-[#2a1713] focus:border-[#f0a991]',
                    )}
                  />
                  <FieldError message={fieldErrors.slug} />
                </label>

                <label className="block space-y-2">
                  <span className="text-xs uppercase tracking-[0.18em] text-white/45">Reading time</span>
                  <input
                    name="readingTime"
                    type="number"
                    min="1"
                    value={formData.readingTime}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={cn(
                      'w-full rounded-2xl border border-white/10 bg-white/4 px-4 py-3 text-sm text-white/82 outline-none transition focus:border-white/24',
                      fieldErrors.readingTime && 'border-[#c96b53] bg-[#2a1713] focus:border-[#f0a991]',
                    )}
                  />
                  <FieldError message={fieldErrors.readingTime} />
                </label>
              </div>

              {activeView === 'write' ? (
                <label className="block space-y-2">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-xs uppercase tracking-[0.18em] text-white/45">Body</span>
                    <span className="text-xs text-white/34">Type `/` for blocks, or use the toolbar for links and media.</span>
                  </div>
                  <RichTextEditor
                    ref={editorRef}
                    content={formData.content}
                    onChange={handleContentChange}
                    onBlur={handleContentBlur}
                    onImageUpload={() => {
                      setMediaBrowserMode('default')
                      setIsMediaBrowserOpen(true)
                    }}
                    onReplaceImage={() => {
                      setMediaBrowserMode('replace-image')
                      setIsMediaBrowserOpen(true)
                    }}
                    className={cn(fieldErrors.content && 'border-[#c96b53] bg-[#2a1713]')}
                  />
                  <FieldError message={fieldErrors.content} />
                </label>
              ) : (
                <div className="rounded-[34px] border border-[#d7c7b4]/14 bg-[linear-gradient(180deg,rgba(245,239,227,0.96),rgba(235,225,210,0.94))] px-5 py-6 text-[#171511] shadow-[0_28px_80px_rgba(0,0,0,0.14)] lg:px-10 lg:py-10">
                  <article className="editor-preview-page mx-auto max-w-4xl space-y-8">
                    <header className="space-y-5 border-b border-black/8 pb-8">
                      <div className="flex flex-wrap items-center gap-3 text-sm text-black/46">
                        <span className="rounded-full border border-black/10 px-3 py-1 uppercase tracking-[0.18em] text-[#8b452c]">
                          Preview
                        </span>
                        <span>{formData.readingTime || 1} min read</span>
                        {formData.status === 'PUBLISHED' && formData.publishedAt ? (
                          <span>{new Date(formData.publishedAt).toLocaleDateString()}</span>
                        ) : null}
                      </div>

                      <div className="space-y-4">
                        <h1 className="font-['Space_Grotesk'] text-4xl font-semibold tracking-tight text-balance text-[#111111] lg:text-6xl">
                          {formData.title.trim() || 'Untitled story'}
                        </h1>
                        <p className="max-w-3xl text-lg leading-8 text-black/68 lg:text-[1.35rem]">
                          {formData.excerpt.trim() || 'Add an excerpt to evaluate the opening deck of the article.'}
                        </p>
                      </div>
                    </header>

                    {formData.coverImageUrl ? (
                      <div className="overflow-hidden rounded-[32px] border border-black/10 bg-[#f4efe7] shadow-[0_18px_50px_rgba(17,17,17,0.08)]">
                        <img src={formData.coverImageUrl} alt={formData.title || 'Cover preview'} className="h-auto w-full object-cover" />
                      </div>
                    ) : null}

                    <div className="prose prose-lg editor-preview max-w-none text-[#171511]/84 [&_img]:my-8 [&_img]:w-full [&_img]:rounded-[24px] [&_img]:border [&_img]:border-black/8 [&_img]:object-cover [&_img]:shadow-[0_18px_50px_rgba(17,17,17,0.08)]">
                      {formData.content.trim() ? (
                        <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(formData.content) }} />
                      ) : (
                        <p className="text-black/42">Start writing to see the article preview.</p>
                      )}
                    </div>
                  </article>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-5 xl:sticky xl:top-28 xl:self-start">
          <SidebarSection title="Publishing" description="Status, timing, and front-page emphasis." defaultOpen>
            <div className="space-y-5">
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
          </SidebarSection>

          <SidebarSection title="Tags" description="Organize posts without interrupting the writing flow." defaultOpen>

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
              <p className="text-sm text-white/45">No tags exist yet. Create tags from the admin tags screen.</p>
            )}
            <FieldError message={fieldErrors.tagIds} />
          </SidebarSection>

          <SidebarSection
            title="Related posts"
            description="Manually curate supporting reads for this article."
            defaultOpen={false}
          >
            <div className="space-y-3">
              <input
                type="search"
                value={relatedSearch}
                onChange={(event) => setRelatedSearch(event.target.value)}
                placeholder="Search posts by title or slug"
                className="w-full rounded-2xl border border-white/12 bg-white/6 px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/35 focus:border-white/30"
              />

              {selectedRelatedPosts.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {selectedRelatedPosts.map((relatedPost) => (
                    <button
                      key={relatedPost.id}
                      type="button"
                      onClick={() => handleRelatedPostToggle(relatedPost.id)}
                      className="rounded-full border border-[#d9c8b0] bg-[#f5efe3] px-4 py-2 text-sm font-medium text-[#111111] transition hover:bg-white"
                    >
                      {relatedPost.title}
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-white/45">No related posts selected yet.</p>
              )}

              <div className="grid gap-3">
                {availableRelatedPosts.length > 0 ? (
                  availableRelatedPosts.map((relatedPost) => {
                    const isSelected = formData.relatedPostIds.includes(relatedPost.id)

                    return (
                      <button
                        key={relatedPost.id}
                        type="button"
                        onClick={() => handleRelatedPostToggle(relatedPost.id)}
                        className={cn(
                          'flex items-center justify-between rounded-2xl border px-4 py-3 text-left transition',
                          isSelected
                            ? 'border-[#d9c8b0] bg-[#f5efe3] text-[#111111]'
                            : 'border-white/10 bg-white/5 text-white/78 hover:bg-white/8',
                        )}
                      >
                        <span className="min-w-0">
                          <span className="block truncate text-sm font-medium">{relatedPost.title}</span>
                          <span className={cn('mt-1 block text-xs', isSelected ? 'text-[#4b453c]' : 'text-white/45')}>
                            {relatedPost.slug}
                          </span>
                        </span>
                        <span className={cn('ml-3 shrink-0 text-xs font-medium', isSelected ? 'text-[#111111]' : 'text-white/55')}>
                          {isSelected ? 'Selected' : relatedPost.status}
                        </span>
                      </button>
                    )
                  })
                ) : (
                  <p className="text-sm text-white/45">No matching posts available.</p>
                )}
              </div>
            </div>
            <FieldError message={fieldErrors.relatedPostIds} />
          </SidebarSection>

          <SidebarSection title="Cover image" description="Upload or pick a visual without leaving the editor." defaultOpen>

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
              <button
                type="button"
                onClick={() => {
                  setMediaBrowserMode('default')
                  setIsMediaBrowserOpen(true)
                }}
                className="rounded-full border border-white/12 px-4 py-2 text-sm font-medium text-white/75 transition hover:bg-white/8"
              >
                Choose from library
              </button>
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

            {formData.coverImageUrl ? (
              <div className="overflow-hidden rounded-[24px] border border-white/10 bg-[#0f0f0f]">
                <img src={formData.coverImageUrl} alt="Cover preview" className="h-56 w-full object-cover" />
              </div>
            ) : null}
          </SidebarSection>

          <SidebarSection title="Media library" description="Open a focused browser when you need to attach or embed existing assets." defaultOpen={false}>
            <div className="space-y-4">
              <div className="rounded-2xl border border-white/10 bg-[#0d0d0d] p-4 text-sm text-white/65">
                <p>
                  {formData.mediaAssetIds.length} attached asset{formData.mediaAssetIds.length === 1 ? '' : 's'}.
                </p>
                <p className="mt-2">
                  Use the media browser for three actions: select a cover, attach reusable media, or embed images directly into the post body.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setMediaBrowserMode('default')
                    setIsMediaBrowserOpen(true)
                  }}
                  className="rounded-full bg-[#f5efe3] px-4 py-2 text-sm font-medium text-[#111111] transition hover:bg-white"
                >
                  Open media browser
                </button>
                <span className="inline-flex items-center rounded-full border border-white/12 px-3 py-2 text-xs font-medium text-white/70">
                  {isMediaLoading ? 'Refreshing library...' : `${availableMedia.length} items loaded`}
                </span>
              </div>
            </div>
          </SidebarSection>

          {formData.mediaAssetIds.length > 0 ? (
            <SidebarSection title="Attached media" description="Assets currently associated with this post." defaultOpen={false}>
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
            </SidebarSection>
          ) : null}

          <SidebarSection title="SEO" description="Secondary metadata kept out of the main writing surface." defaultOpen={false}>

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
          </SidebarSection>
        </div>
      </form>
    </section>
  )
}
