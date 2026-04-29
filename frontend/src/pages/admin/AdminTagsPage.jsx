import { useEffect, useState } from 'react'
import { createTag, deleteTag, getAdminTags, updateTag } from '../../api/tags'
import { getApiErrorDetails } from '../../utils/apiError'

const initialFormData = {
  name: '',
  slug: '',
}

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

function validateForm(formData) {
  const errors = {}

  if (!formData.name.trim()) errors.name = 'Name is required.'
  if (!formData.slug.trim()) errors.slug = 'Slug is required.'
  if (formData.name.trim().length > 80) errors.name = 'Name must be at most 80 characters.'
  if (formData.slug.trim().length > 100) errors.slug = 'Slug must be at most 100 characters.'

  return errors
}

function ModalShell({ title, children, onClose }) {
  return (
    <div className="fixed inset-0 z-40 flex items-start justify-center overflow-y-auto bg-black/60 px-4 py-8 backdrop-blur-sm">
      <div className="w-full max-w-2xl rounded-[30px] border border-white/10 bg-[#111111] shadow-[0_32px_120px_rgba(0,0,0,0.45)]">
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

function AdminTagModal({ tag, onClose, onSubmit, isSubmitting }) {
  const [formData, setFormData] = useState(() =>
    tag
      ? {
          name: tag.name ?? '',
          slug: tag.slug ?? '',
        }
      : initialFormData,
  )
  const [fieldErrors, setFieldErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [isSlugDirty, setIsSlugDirty] = useState(Boolean(tag?.slug))

  function handleChange(event) {
    const { name, value } = event.target

    setFormData((current) => {
      const nextState = {
        ...current,
        [name]: value,
      }

      if (name === 'name' && !isSlugDirty) {
        nextState.slug = slugify(value)
      }

      return nextState
    })

    if (name === 'slug') {
      setIsSlugDirty(true)
    }

    setFieldErrors((current) => ({
      ...current,
      [name]: '',
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
      await onSubmit({
        name: formData.name.trim(),
        slug: formData.slug.trim(),
      })
    } catch (error) {
      const details = getApiErrorDetails(error)
      setFieldErrors(details.fieldErrors)
      setFormError(details.message)
    }
  }

  return (
    <ModalShell title={tag ? 'Edit tag' : 'Create tag'} onClose={onClose}>
      <form className="space-y-5" onSubmit={handleSubmit}>
        <label className="block space-y-2">
          <span className="text-sm text-white/75">Name</span>
          <input
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full rounded-2xl border border-white/12 bg-white/6 px-4 py-3 text-white outline-none transition focus:border-white/30"
          />
          <FieldError message={fieldErrors.name} />
        </label>

        <label className="block space-y-2">
          <span className="text-sm text-white/75">Slug</span>
          <input
            name="slug"
            value={formData.slug}
            onChange={handleChange}
            className="w-full rounded-2xl border border-white/12 bg-white/6 px-4 py-3 text-white outline-none transition focus:border-white/30"
          />
          <FieldError message={fieldErrors.slug} />
        </label>

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
            disabled={isSubmitting}
            className="rounded-full bg-[#f5efe3] px-5 py-3 font-medium text-[#111111] transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? 'Saving...' : tag ? 'Save changes' : 'Create tag'}
          </button>
        </div>
      </form>
    </ModalShell>
  )
}

export function AdminTagsPage() {
  const [tags, setTags] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [pageError, setPageError] = useState('')
  const [activeTag, setActiveTag] = useState(null)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeletingId, setIsDeletingId] = useState(null)

  useEffect(() => {
    loadTags()
  }, [])

  async function loadTags() {
    setIsLoading(true)
    setPageError('')

    try {
      const response = await getAdminTags()
      setTags(response)
    } catch (error) {
      setPageError(getApiErrorDetails(error).message)
    } finally {
      setIsLoading(false)
    }
  }

  async function handleCreate(payload) {
    setIsSaving(true)

    try {
      await createTag(payload)
      setIsCreateOpen(false)
      await loadTags()
    } finally {
      setIsSaving(false)
    }
  }

  async function handleUpdate(payload) {
    setIsSaving(true)

    try {
      await updateTag(activeTag.id, payload)
      setActiveTag(null)
      await loadTags()
    } finally {
      setIsSaving(false)
    }
  }

  async function handleDelete(tag) {
    const shouldDelete = window.confirm(`Delete "${tag.name}"?`)

    if (!shouldDelete) {
      return
    }

    setIsDeletingId(tag.id)

    try {
      await deleteTag(tag.id)
      await loadTags()
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
          <p className="text-sm uppercase tracking-[0.25em] text-white/45">Admin tags</p>
          <h1 className="mt-3 font-['Space_Grotesk'] text-4xl font-semibold tracking-tight">Manage tags</h1>
          <p className="mt-3 max-w-3xl text-white/68">
            Create and maintain the tags used across blog posts. Delete is blocked when a tag is already assigned to posts.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsCreateOpen(true)}
          className="rounded-full bg-[#f5efe3] px-5 py-3 font-medium text-[#111111] transition hover:bg-white"
        >
          New tag
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
                <th className="px-5 py-4">Name</th>
                <th className="px-5 py-4">Slug</th>
                <th className="px-5 py-4">Created</th>
                <th className="px-5 py-4">Updated</th>
                <th className="px-5 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan="5" className="px-5 py-16 text-center text-white/55">
                    Loading tags...
                  </td>
                </tr>
              ) : null}

              {!isLoading && tags.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-5 py-16 text-center text-white/55">
                    No tags yet. Create the first one from the button above.
                  </td>
                </tr>
              ) : null}

              {!isLoading
                ? tags.map((tag) => (
                    <tr key={tag.id} className="border-t border-white/8 align-top">
                      <td className="px-5 py-4 font-medium text-white">{tag.name}</td>
                      <td className="px-5 py-4 text-white/62">{tag.slug}</td>
                      <td className="px-5 py-4 text-white/62">{formatDateTime(tag.createdAt)}</td>
                      <td className="px-5 py-4 text-white/62">{formatDateTime(tag.updatedAt)}</td>
                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setActiveTag(tag)}
                            className="rounded-full border border-white/12 px-4 py-2 text-xs font-medium text-white/75 transition hover:bg-white/8"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(tag)}
                            disabled={isDeletingId === tag.id}
                            className="rounded-full border border-[#8b452c]/40 px-4 py-2 text-xs font-medium text-[#f7b39c] transition hover:bg-[#8b452c]/10 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {isDeletingId === tag.id ? 'Deleting...' : 'Delete'}
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

      {isCreateOpen ? (
        <AdminTagModal
          onClose={() => setIsCreateOpen(false)}
          onSubmit={handleCreate}
          isSubmitting={isSaving}
        />
      ) : null}

      {activeTag ? (
        <AdminTagModal
          tag={activeTag}
          onClose={() => setActiveTag(null)}
          onSubmit={handleUpdate}
          isSubmitting={isSaving}
        />
      ) : null}
    </section>
  )
}
