import { zodResolver } from '@hookform/resolvers/zod'
import { Pencil, Plus, Search, Tag as TagIcon, Trash2 } from 'lucide-react'
import { startTransition, useDeferredValue, useEffect, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import { createTag, deleteTag, getAdminTags, updateTag } from '../../api/tags'
import { Button } from '../../components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '../../components/ui/form'
import { Input } from '../../components/ui/input'
import { cn } from '../../lib/utils'
import { getApiErrorDetails } from '../../utils/apiError'

const tagSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Name is required.')
    .max(80, 'Name must be at most 80 characters.'),
  slug: z
    .string()
    .trim()
    .min(1, 'Slug is required.')
    .max(100, 'Slug must be at most 100 characters.'),
})

function slugify(value) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function formatDate(value) {
  if (!value) {
    return 'Not set'
  }

  return new Date(value).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function hasFieldErrors(fieldErrors) {
  return Object.keys(fieldErrors || {}).length > 0
}

function getTagFieldErrors(details) {
  if (hasFieldErrors(details.fieldErrors)) {
    return details.fieldErrors
  }

  if (details.message === 'Tag name already exists') {
    return { name: details.message }
  }

  if (details.message === 'Tag slug already exists') {
    return { slug: details.message }
  }

  return {}
}

function AdminTagModal({ isOpen, tag, onOpenChange, onSubmit, isSubmitting }) {
  const [formError, setFormError] = useState('')
  const isEditing = Boolean(tag)

  const {
    control,
    register,
    handleSubmit,
    reset,
    setValue,
    setError,
    clearErrors,
    formState: { errors, touchedFields },
  } = useForm({
    resolver: zodResolver(tagSchema),
    mode: 'onBlur',
    defaultValues: {
      name: '',
      slug: '',
    },
  })

  const name = useWatch({ control, name: 'name' })
  const slug = useWatch({ control, name: 'slug' })
  const slugTouched = Boolean(touchedFields.slug)

  useEffect(() => {
    if (isOpen) {
      reset({
        name: tag?.name ?? '',
        slug: tag?.slug ?? '',
      })
    }
  }, [isOpen, tag, reset])

  useEffect(() => {
    if (!slugTouched) {
      setValue('slug', slugify(name || ''), {
        shouldValidate: false,
        shouldDirty: Boolean(name),
      })
    }
  }, [name, setValue, slugTouched])

  async function submitForm(values) {
    setFormError('')

    try {
      await onSubmit({
        name: values.name.trim(),
        slug: values.slug.trim(),
      })
      reset({
        name: '',
        slug: '',
      })
    } catch (error) {
      const details = getApiErrorDetails(error)
      const fieldErrors = getTagFieldErrors(details)

      if (hasFieldErrors(fieldErrors)) {
        Object.entries(fieldErrors).forEach(([field, message]) => {
          setError(field, { type: 'server', message })
        })
        return
      }

      setFormError(details.message)
    }
  }

  function handleOpenChange(nextOpen) {
    if (!nextOpen) {
      reset({
        name: tag?.name ?? '',
        slug: tag?.slug ?? '',
      })
      setFormError('')
    }

    onOpenChange(nextOpen)
  }

  const nameRegister = register('name', {
    onChange: () => {
      clearErrors('name')
      setFormError('')
    },
  })

  const slugRegister = register('slug', {
    onChange: () => {
      clearErrors('slug')
      setFormError('')
    },
  })

  const form = {
    control,
    register,
    handleSubmit,
    reset,
    setValue,
    setError,
    clearErrors,
    formState: { errors, touchedFields },
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="overflow-hidden bg-[radial-gradient(circle_at_top,rgba(217,200,176,0.12),transparent_35%),#111111]">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit tag' : 'Create tag'}</DialogTitle>
          <DialogDescription>
            Keep labels clean and short. Slugs are generated automatically until you override them.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
        <form className="space-y-5" onSubmit={handleSubmit(submitForm)}>
          <div className="grid gap-5 sm:grid-cols-2">
            <FormField
              control={control}
              name="name"
              render={() => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input
                      id="tag-name"
                      placeholder="Design Systems"
                      {...nameRegister}
                      className={cn(errors.name && 'border-[#c96b53] bg-[#2a1713] focus:border-[#f0a991]')}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="slug"
              render={() => (
                <FormItem>
                  <FormLabel>Slug</FormLabel>
                  <FormDescription>Generated from the name until you override it.</FormDescription>
                  <FormControl>
                    <Input
                      id="tag-slug"
                      placeholder="design-systems"
                      value={slug ?? ''}
                      {...slugRegister}
                      className={cn(errors.slug && 'border-[#c96b53] bg-[#2a1713] focus:border-[#f0a991]')}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="rounded-[24px] border border-white/10 bg-white/[0.03] p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-white/38">Preview</p>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-2 rounded-full border border-[#d9c8b0]/35 bg-[#f5efe3]/10 px-3 py-2 text-sm text-[#f5efe3]">
                <TagIcon className="size-4" />
                {name?.trim() || 'Tag name'}
              </span>
              <span className="rounded-full border border-white/10 px-3 py-2 text-xs uppercase tracking-[0.16em] text-white/45">
                /{slug?.trim() || 'tag-slug'}
              </span>
            </div>
          </div>

          {formError ? (
            <p className="rounded-2xl border border-[#8b452c]/40 bg-[#8b452c]/10 px-4 py-3 text-sm text-[#ffd4c4]">
              {formError}
            </p>
          ) : null}

          <DialogFooter>
            <Button type="button" variant="secondary" onClick={() => handleOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : isEditing ? 'Save changes' : 'Create tag'}
            </Button>
          </DialogFooter>
        </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

function DeleteTagDialog({ tag, isDeleting, errorMessage, onConfirm, onOpenChange }) {
  return (
    <Dialog open={Boolean(tag)} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg overflow-hidden bg-[radial-gradient(circle_at_top,rgba(139,69,44,0.18),transparent_38%),#111111]">
        <DialogHeader>
          <DialogTitle>Delete tag</DialogTitle>
          <DialogDescription>
            This will remove <span className="font-medium text-white">{tag?.name}</span>. If the tag is still assigned
            to posts, the API will block the deletion.
          </DialogDescription>
        </DialogHeader>

        {tag ? (
          <div className="rounded-[24px] border border-[#8b452c]/28 bg-[#8b452c]/10 p-4">
            <div className="flex items-center gap-3">
              <span className="inline-flex size-11 items-center justify-center rounded-2xl border border-[#f2b29d]/20 bg-[#8b452c]/16 text-[#ffd5c8]">
                <Trash2 className="size-4" />
              </span>
              <div>
                <p className="font-medium text-white">{tag.name}</p>
                <p className="mt-1 text-sm text-white/50">/{tag.slug}</p>
              </div>
            </div>
          </div>
        ) : null}

        {errorMessage ? (
          <p className="rounded-2xl border border-[#8b452c]/40 bg-[#8b452c]/10 px-4 py-3 text-sm text-[#ffd4c4]">
            {errorMessage}
          </p>
        ) : null}

        <DialogFooter>
          <Button type="button" variant="secondary" onClick={() => onOpenChange(false)} disabled={isDeleting}>
            Cancel
          </Button>
          <Button type="button" variant="danger" onClick={onConfirm} disabled={isDeleting}>
            {isDeleting ? 'Deleting...' : 'Delete tag'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function TagActions({ tag, isDeleting, onEdit, onDelete }) {
  return (
    <div className="flex items-center justify-end gap-2">
      <Button
        type="button"
        size="icon"
        variant="ghost"
        className="text-white/65 hover:text-white"
        aria-label={`Edit ${tag.name}`}
        onClick={() => onEdit(tag)}
      >
        <Pencil className="size-4" />
      </Button>
      <Button
        type="button"
        size="icon"
        variant="ghost"
        className="text-[#f3aa93] hover:bg-[#8b452c]/10 hover:text-[#ffd5c8]"
        aria-label={`Delete ${tag.name}`}
        disabled={isDeleting}
        onClick={() => onDelete(tag)}
      >
        <Trash2 className="size-4" />
      </Button>
    </div>
  )
}

export function AdminTagsPage() {
  const [tagPage, setTagPage] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [pageError, setPageError] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [currentPage, setCurrentPage] = useState(0)
  const [activeTag, setActiveTag] = useState(null)
  const [tagToDelete, setTagToDelete] = useState(null)
  const [deleteError, setDeleteError] = useState('')
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeletingId, setIsDeletingId] = useState(null)
  const deferredSearch = useDeferredValue(searchInput.trim())
  const tags = tagPage?.items ?? []

  useEffect(() => {
    loadTags(currentPage, deferredSearch)
  }, [currentPage, deferredSearch])

  async function loadTags(page, search) {
    setIsLoading(true)
    setPageError('')

    try {
      const response = await getAdminTags({
        page,
        size: 10,
        search,
      })
      setTagPage(response)
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
      toast.success('Tag created.')
      setIsCreateOpen(false)
      setCurrentPage(0)
      await loadTags(0, deferredSearch)
    } catch (error) {
      const details = getApiErrorDetails(error)
      const fieldErrors = getTagFieldErrors(details)

      if (!hasFieldErrors(fieldErrors)) {
        toast.error(details.message)
      }

      throw error
    } finally {
      setIsSaving(false)
    }
  }

  async function handleUpdate(payload) {
    setIsSaving(true)

    try {
      await updateTag(activeTag.id, payload)
      toast.success('Tag updated.')
      setActiveTag(null)
      await loadTags(currentPage, deferredSearch)
    } catch (error) {
      const details = getApiErrorDetails(error)
      const fieldErrors = getTagFieldErrors(details)

      if (!hasFieldErrors(fieldErrors)) {
        toast.error(details.message)
      }

      throw error
    } finally {
      setIsSaving(false)
    }
  }

  async function handleDelete(tag) {
    setIsDeletingId(tag.id)
    setDeleteError('')

    try {
      await deleteTag(tag.id)
      toast.success('Tag deleted.')
      setTagToDelete(null)
      const nextPage = tags.length === 1 && currentPage > 0 ? currentPage - 1 : currentPage
      setCurrentPage(nextPage)
      await loadTags(nextPage, deferredSearch)
    } catch (error) {
      const message = getApiErrorDetails(error).message
      setDeleteError(message)
      toast.error(message)
    } finally {
      setIsDeletingId(null)
    }
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.25em] text-white/45">Admin tags</p>
          <h1 className="mt-3 font-['Space_Grotesk'] text-4xl font-semibold tracking-tight">Manage tags</h1>
        </div>

        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
          <div className="relative min-w-0 flex-1 sm:w-[320px]">
            <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-white/35" />
            <Input
              type="search"
              value={searchInput}
              onChange={(event) => {
                const nextValue = event.target.value
                setSearchInput(nextValue)
                startTransition(() => {
                  setCurrentPage(0)
                })
              }}
              placeholder="Search by name or slug"
              className="pl-11"
            />
          </div>

          <Button type="button" onClick={() => setIsCreateOpen(true)} className="w-full sm:w-auto">
            <Plus className="size-4" />
            <span>New tag</span>
          </Button>
        </div>
      </div>

      {pageError ? (
        <div className="rounded-[28px] border border-[#8b452c]/40 bg-[#8b452c]/10 px-5 py-4 text-[#ffd4c4]">
          {pageError}
        </div>
      ) : null}

      <div className="overflow-hidden rounded-[30px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.03))] shadow-[0_24px_80px_rgba(0,0,0,0.22)]">
        <div className="hidden md:block">
          <table className="min-w-full text-left text-sm text-white/80">
            <thead className="bg-white/6 text-xs uppercase tracking-[0.2em] text-white/40">
              <tr>
                <th className="px-6 py-5 font-medium">Name</th>
                <th className="px-6 py-5 font-medium">Slug</th>
                <th className="px-6 py-5 font-medium">Created</th>
                <th className="px-6 py-5 font-medium">Updated</th>
                <th className="px-6 py-5 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-20 text-center text-white/55">
                    Loading tags...
                  </td>
                </tr>
              ) : null}

              {!isLoading && tags.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-20 text-center text-white/55">
                    {deferredSearch ? 'No tags match this search.' : 'No tags yet. Create the first one from the button above.'}
                  </td>
                </tr>
              ) : null}

              {!isLoading
                ? tags.map((tag) => (
                    <tr
                      key={tag.id}
                      className="border-t border-white/8 align-middle transition hover:bg-white/[0.035]"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <span className="inline-flex size-10 items-center justify-center rounded-2xl border border-[#d9c8b0]/22 bg-[#f5efe3]/8 text-[#f5efe3]">
                            <TagIcon className="size-4" />
                          </span>
                          <div>
                            <p className="font-medium text-white">{tag.name}</p>
                            <p className="text-xs uppercase tracking-[0.16em] text-white/35">Content tag</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-2 text-xs uppercase tracking-[0.18em] text-white/55">
                          /{tag.slug}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-white/62">{formatDate(tag.createdAt)}</td>
                      <td className="px-6 py-4 text-white/62">{formatDate(tag.updatedAt)}</td>
                      <td className="px-6 py-4">
                        <TagActions
                          tag={tag}
                          isDeleting={isDeletingId === tag.id}
                          onEdit={setActiveTag}
                          onDelete={(selectedTag) => {
                            setTagToDelete(selectedTag)
                            setDeleteError('')
                          }}
                        />
                      </td>
                    </tr>
                  ))
                : null}
            </tbody>
          </table>
        </div>

        <div className="space-y-3 p-4 md:hidden">
          {isLoading ? (
            <div className="rounded-[24px] border border-white/8 bg-white/4 px-4 py-12 text-center text-white/55">
              Loading tags...
            </div>
          ) : null}

          {!isLoading && tags.length === 0 ? (
            <div className="rounded-[24px] border border-white/8 bg-white/4 px-4 py-12 text-center text-white/55">
              {deferredSearch ? 'No tags match this search.' : 'No tags yet. Create the first one from the button above.'}
            </div>
          ) : null}

          {!isLoading
            ? tags.map((tag) => (
                <article
                  key={tag.id}
                  className="rounded-[26px] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.03))] p-4 shadow-[0_18px_40px_rgba(0,0,0,0.18)]"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-3">
                        <span className="inline-flex size-10 items-center justify-center rounded-2xl border border-[#d9c8b0]/22 bg-[#f5efe3]/8 text-[#f5efe3]">
                          <TagIcon className="size-4" />
                        </span>
                        <div className="min-w-0">
                          <p className="truncate font-medium text-white">{tag.name}</p>
                          <p className="mt-1 truncate text-sm text-white/50">/{tag.slug}</p>
                        </div>
                      </div>
                    </div>

                    <TagActions
                      tag={tag}
                      isDeleting={isDeletingId === tag.id}
                      onEdit={setActiveTag}
                      onDelete={(selectedTag) => {
                        setTagToDelete(selectedTag)
                        setDeleteError('')
                      }}
                    />
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <div className="rounded-2xl border border-white/8 bg-black/15 px-4 py-3">
                      <p className="text-[11px] uppercase tracking-[0.18em] text-white/32">Created</p>
                      <p className="mt-2 text-sm text-white/70">{formatDate(tag.createdAt)}</p>
                    </div>
                    <div className="rounded-2xl border border-white/8 bg-black/15 px-4 py-3">
                      <p className="text-[11px] uppercase tracking-[0.18em] text-white/32">Updated</p>
                      <p className="mt-2 text-sm text-white/70">{formatDate(tag.updatedAt)}</p>
                    </div>
                  </div>
                </article>
              ))
            : null}
        </div>
      </div>

      <div className="flex flex-col gap-3 rounded-[24px] border border-white/10 bg-white/4 px-5 py-4 text-sm text-white/62 md:flex-row md:items-center md:justify-between">
        <p>
          Page {(tagPage?.page ?? 0) + 1} of {tagPage?.totalPages || 1} | {tagPage?.totalElements ?? 0} tags total
        </p>
        <div className="flex gap-3">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            disabled={currentPage === 0 || isLoading}
            onClick={() => setCurrentPage((page) => Math.max(page - 1, 0))}
          >
            Previous
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            disabled={!tagPage?.hasNext || isLoading}
            onClick={() => setCurrentPage((page) => page + 1)}
          >
            Next
          </Button>
        </div>
      </div>

      {isCreateOpen ? (
        <AdminTagModal
          isOpen={isCreateOpen}
          onOpenChange={setIsCreateOpen}
          onSubmit={handleCreate}
          isSubmitting={isSaving}
        />
      ) : null}

      {activeTag ? (
        <AdminTagModal
          key={activeTag.id}
          isOpen={Boolean(activeTag)}
          tag={activeTag}
          onOpenChange={(isOpen) => {
            if (!isOpen) {
              setActiveTag(null)
            }
          }}
        onSubmit={handleUpdate}
        isSubmitting={isSaving}
      />
      ) : null}

      <DeleteTagDialog
        tag={tagToDelete}
        isDeleting={isDeletingId === tagToDelete?.id}
        errorMessage={deleteError}
        onConfirm={() => {
          if (tagToDelete) {
            handleDelete(tagToDelete)
          }
        }}
        onOpenChange={(isOpen) => {
          if (!isOpen) {
            setTagToDelete(null)
            setDeleteError('')
          }
        }}
      />
    </section>
  )
}
