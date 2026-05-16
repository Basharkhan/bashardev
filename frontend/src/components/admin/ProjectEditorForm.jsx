import { ArrowLeft, ExternalLink, GitBranch, GripVertical, ImagePlus, Plus, Save, Sparkles, Trash2 } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Controller, useFieldArray, useForm, useWatch } from 'react-hook-form'
import ReactMarkdown from 'react-markdown'
import { Button } from '../ui/button'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '../ui/form'
import { Input } from '../ui/input'
import { Textarea } from '../ui/textarea'
import { cn } from '../../lib/utils'
import { getApiErrorDetails } from '../../utils/apiError'

const statusOptions = ['DRAFT', 'PUBLISHED']

const initialFormData = {
  title: '',
  slug: '',
  summary: '',
  contentMarkdown: '',
  coverImageUrl: '',
  gallery: [],
  liveUrl: '',
  repositoryUrl: '',
  techStack: [],
  featured: false,
  status: 'DRAFT',
  publishedAt: '',
  displayOrder: 0,
  seoTitle: '',
  seoDescription: '',
}

function SidebarSection({ title, description, children }) {
  return (
    <section className="rounded-[24px] border border-white/10 bg-white/[0.04] p-5">
      <div className="space-y-1">
        <p className="font-['Space_Grotesk'] text-lg font-semibold text-white">{title}</p>
        {description ? <p className="text-sm text-white/55">{description}</p> : null}
      </div>
      <div className="mt-5 space-y-4">{children}</div>
    </section>
  )
}

function slugify(value) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
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

function fromProject(project) {
  if (!project) {
    return initialFormData
  }

  return {
    title: project.title ?? '',
    slug: project.slug ?? '',
    summary: project.summary ?? '',
    contentMarkdown: project.contentMarkdown ?? '',
    coverImageUrl: project.coverImageUrl ?? '',
    gallery: (project.gallery ?? []).map((item) => ({
      imageUrl: item.imageUrl ?? '',
      altText: item.altText ?? '',
    })),
    liveUrl: project.liveUrl ?? '',
    repositoryUrl: project.repositoryUrl ?? '',
    techStack: (project.techStack ?? []).map((item) => ({
      name: item.name ?? '',
    })),
    featured: Boolean(project.featured),
    status: project.status ?? 'DRAFT',
    publishedAt: toDateTimeLocalValue(project.publishedAt),
    displayOrder: Number.isFinite(project.displayOrder) ? project.displayOrder : 0,
    seoTitle: project.seoTitle ?? '',
    seoDescription: project.seoDescription ?? '',
  }
}

function toPayload(formData) {
  return {
    title: formData.title.trim(),
    slug: formData.slug.trim(),
    summary: formData.summary.trim(),
    contentMarkdown: formData.contentMarkdown.trim(),
    coverImageUrl: formData.coverImageUrl.trim(),
    gallery: formData.gallery
      .map((item) => ({
        imageUrl: item.imageUrl.trim(),
        altText: item.altText.trim(),
      }))
      .filter((item) => item.imageUrl || item.altText),
    liveUrl: formData.liveUrl.trim(),
    repositoryUrl: formData.repositoryUrl.trim(),
    techStack: formData.techStack
      .map((item) => ({
        name: item.name.trim(),
      }))
      .filter((item) => item.name),
    featured: Boolean(formData.featured),
    status: formData.status,
    publishedAt: formData.publishedAt ? new Date(formData.publishedAt).toISOString() : null,
    displayOrder: Number(formData.displayOrder) || 0,
    seoTitle: formData.seoTitle.trim(),
    seoDescription: formData.seoDescription.trim(),
  }
}

function normalizeFieldPath(path) {
  return path.replace(/\[(\d+)\]/g, '.$1')
}

function hasFieldErrors(fieldErrors) {
  return Object.keys(fieldErrors || {}).length > 0
}

export function ProjectEditorForm({ project, onBack, onSubmit, isSubmitting }) {
  const [pageError, setPageError] = useState('')
  const [activeView, setActiveView] = useState('write')

  const defaultValues = useMemo(() => fromProject(project), [project])

  const form = useForm({
    defaultValues,
  })

  const {
    control,
    register,
    handleSubmit,
    reset,
    setValue,
    setError,
    clearErrors,
    formState: { errors, dirtyFields },
  } = form

  const {
    fields: galleryFields,
    append: appendGallery,
    remove: removeGallery,
    move: moveGallery,
  } = useFieldArray({
    control,
    name: 'gallery',
  })

  const {
    fields: techStackFields,
    append: appendTechStack,
    remove: removeTechStack,
    move: moveTechStack,
  } = useFieldArray({
    control,
    name: 'techStack',
  })

  const title = useWatch({ control, name: 'title' }) ?? ''
  const slug = useWatch({ control, name: 'slug' }) ?? ''
  const summary = useWatch({ control, name: 'summary' }) ?? ''
  const contentMarkdown = useWatch({ control, name: 'contentMarkdown' }) ?? ''
  const coverImageUrl = useWatch({ control, name: 'coverImageUrl' }) ?? ''
  const liveUrl = useWatch({ control, name: 'liveUrl' }) ?? ''
  const repositoryUrl = useWatch({ control, name: 'repositoryUrl' }) ?? ''
  const status = useWatch({ control, name: 'status' }) ?? 'DRAFT'
  const publishedAt = useWatch({ control, name: 'publishedAt' }) ?? ''
  const gallery = useWatch({ control, name: 'gallery' }) ?? []
  const techStack = useWatch({ control, name: 'techStack' }) ?? []

  useEffect(() => {
    reset(defaultValues)
    setPageError('')
  }, [defaultValues, reset])

  useEffect(() => {
    if (!dirtyFields.slug) {
      setValue('slug', slugify(title), {
        shouldDirty: Boolean(title),
        shouldValidate: false,
      })
    }
  }, [title, dirtyFields.slug, setValue])

  async function submitForm(values) {
    setPageError('')

    try {
      await onSubmit(toPayload(values))
    } catch (error) {
      const details = getApiErrorDetails(error)

      if (hasFieldErrors(details.fieldErrors)) {
        Object.entries(details.fieldErrors).forEach(([field, message]) => {
          setError(normalizeFieldPath(field), { type: 'server', message })
        })
        return
      }

      setPageError(details.message)
    }
  }

  const titleRegister = register('title', {
    onChange: () => {
      clearErrors('title')
      setPageError('')
    },
  })

  const slugRegister = register('slug', {
    onChange: () => {
      clearErrors('slug')
      setPageError('')
    },
  })

  const summaryRegister = register('summary', {
    onChange: () => {
      clearErrors('summary')
      setPageError('')
    },
  })

  const markdownRegister = register('contentMarkdown', {
    onChange: () => {
      clearErrors('contentMarkdown')
      setPageError('')
    },
  })

  const displayOrderRegister = register('displayOrder', {
    onChange: () => {
      clearErrors('displayOrder')
      setPageError('')
    },
  })

  return (
    <Form {...form}>
    <div className="space-y-6">
      {pageError ? (
        <div className="rounded-[24px] border border-[#8b452c]/40 bg-[#8b452c]/10 px-5 py-4 text-[#ffd4c4]">
          {pageError}
        </div>
      ) : null}

      <div className="sticky top-4 z-10 rounded-[28px] border border-white/10 bg-[#111111]/95 px-4 py-4 shadow-[0_18px_50px_rgba(0,0,0,0.25)] backdrop-blur sm:px-5">
        <div className="flex flex-wrap gap-3">
          <Button type="button" variant="secondary" onClick={onBack}>
            <ArrowLeft className="size-4" />
            Back
          </Button>
          <Button type="submit" form="project-editor-form" disabled={isSubmitting}>
            <Save className="size-4" />
            {isSubmitting ? 'Saving...' : 'Save project'}
          </Button>
        </div>
      </div>

      <form id="project-editor-form" className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_380px]" onSubmit={handleSubmit(submitForm)}>
        <div className="space-y-6">
          <section className="overflow-hidden rounded-[36px] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.015))] p-5 shadow-[0_30px_90px_rgba(0,0,0,0.18)] lg:p-8">
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
              {activeView === 'write' ? (
                <>
                  <label className="block space-y-3">
                    <span className="sr-only">Title</span>
                    <input
                      id="project-title"
                      placeholder="Portfolio platform"
                      {...titleRegister}
                      className={cn(
                        "w-full border-0 border-b border-white/10 bg-transparent px-0 py-2 font-['Space_Grotesk'] text-4xl font-semibold tracking-tight text-white outline-none transition placeholder:text-white/22 focus:border-white/28 lg:text-6xl",
                        errors.title && 'border-[#c96b53] bg-[#2a1713] focus:border-[#f0a991]',
                      )}
                    />
                    <p className="text-sm text-[#f7a28c]">{errors.title?.message}</p>
                  </label>

                  <FormField
                    control={control}
                    name="slug"
                    render={() => (
                      <FormItem>
                        <FormLabel>Slug</FormLabel>
                        <FormDescription>Generated from the title until you change it manually.</FormDescription>
                        <FormControl>
                          <Input
                            id="project-slug"
                            placeholder="portfolio-platform"
                            value={slug}
                            {...slugRegister}
                            className={cn(errors.slug && 'border-[#c96b53] bg-[#2a1713] focus:border-[#f0a991]')}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={control}
                    name="summary"
                    render={() => (
                      <FormItem>
                        <FormLabel>Summary</FormLabel>
                        <FormControl>
                          <Textarea
                            id="project-summary"
                            rows={4}
                            placeholder="Short public summary for cards and previews."
                            {...summaryRegister}
                            className={cn(errors.summary && 'border-[#c96b53] bg-[#2a1713] focus:border-[#f0a991]')}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={control}
                    name="contentMarkdown"
                    render={() => (
                      <FormItem>
                        <FormLabel>Markdown content</FormLabel>
                        <FormDescription>Use markdown for the case study body. This is the long-form detail view.</FormDescription>
                        <FormControl>
                          <Textarea
                            id="project-content-markdown"
                            rows={18}
                            placeholder={'## Context\n\nWhat was built, why it mattered, and how it worked.'}
                            {...markdownRegister}
                            className={cn(
                              'bg-[#121212] font-mono leading-7 focus:bg-[#171717]',
                              errors.contentMarkdown && 'border-[#c96b53] bg-[#2a1713] focus:border-[#f0a991]',
                            )}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              ) : (
                <div className="rounded-[34px] border border-[#d7c7b4]/14 bg-[linear-gradient(180deg,rgba(245,239,227,0.96),rgba(235,225,210,0.94))] px-5 py-6 text-[#171511] shadow-[0_28px_80px_rgba(0,0,0,0.14)] lg:px-10 lg:py-10">
                  <article className="mx-auto max-w-4xl space-y-8">
                    <header className="space-y-5 border-b border-black/8 pb-8">
                      <div className="flex flex-wrap items-center gap-3 text-sm text-black/46">
                        <span className="rounded-full border border-black/10 px-3 py-1 uppercase tracking-[0.18em] text-[#8b452c]">
                          Preview
                        </span>
                        {status === 'PUBLISHED' && publishedAt ? (
                          <span>{new Date(publishedAt).toLocaleDateString()}</span>
                        ) : (
                          <span>Draft project</span>
                        )}
                      </div>

                      <div className="space-y-4">
                        <h1 className="font-['Space_Grotesk'] text-4xl font-semibold tracking-tight text-balance text-[#111111] lg:text-6xl">
                          {title.trim() || 'Untitled project'}
                        </h1>
                        <p className="max-w-3xl text-lg leading-8 text-black/68 lg:text-[1.35rem]">
                          {summary.trim() || 'Add a summary to preview the public project intro.'}
                        </p>
                      </div>
                    </header>

                    {coverImageUrl ? (
                      <div className="overflow-hidden rounded-[32px] border border-black/10 bg-[#f4efe7] shadow-[0_18px_50px_rgba(17,17,17,0.08)]">
                        <img src={coverImageUrl} alt={title || 'Cover preview'} className="h-auto w-full object-cover" />
                      </div>
                    ) : null}

                    <div className="prose prose-lg max-w-none text-[#171511]/84 [&_img]:my-8 [&_img]:w-full [&_img]:rounded-[24px] [&_img]:border [&_img]:border-black/8 [&_img]:object-cover [&_img]:shadow-[0_18px_50px_rgba(17,17,17,0.08)]">
                      {contentMarkdown.trim() ? (
                        <ReactMarkdown>{contentMarkdown}</ReactMarkdown>
                      ) : (
                        <p className="text-black/42">Start writing markdown to see the project preview.</p>
                      )}
                    </div>
                  </article>
                </div>
              )}
            </div>
          </section>

          <section className="rounded-[28px] border border-white/10 bg-white/[0.04] p-5 sm:p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="font-['Space_Grotesk'] text-2xl font-semibold text-white">Gallery</p>
                <p className="mt-1 text-sm text-white/55">Keep gallery order intentional. The first item should usually be the strongest supporting view.</p>
              </div>
              <Button type="button" variant="secondary" onClick={() => appendGallery({ imageUrl: '', altText: '' })}>
                <ImagePlus className="size-4" />
                Add image
              </Button>
            </div>

            <div className="mt-5 space-y-4">
              {galleryFields.length === 0 ? (
                <div className="rounded-[24px] border border-dashed border-white/12 bg-white/[0.02] px-5 py-8 text-center text-sm text-white/45">
                  No gallery items yet.
                </div>
              ) : null}

              {galleryFields.map((field, index) => {
                const imageUrlPath = `gallery.${index}.imageUrl`
                const altTextPath = `gallery.${index}.altText`

                return (
                  <div key={field.id} className="rounded-[24px] border border-white/10 bg-black/10 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-white/38">
                        <GripVertical className="size-4" />
                        Image {index + 1}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Button type="button" size="sm" variant="secondary" onClick={() => moveGallery(index, index - 1)} disabled={index === 0}>
                          Up
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="secondary"
                          onClick={() => moveGallery(index, index + 1)}
                          disabled={index === galleryFields.length - 1}
                        >
                          Down
                        </Button>
                        <Button type="button" size="sm" variant="danger" onClick={() => removeGallery(index)}>
                          <Trash2 className="size-4" />
                          Remove
                        </Button>
                      </div>
                    </div>

                    <div className="mt-4 grid gap-4">
                      <FormField
                        control={control}
                        name={imageUrlPath}
                        render={() => (
                          <FormItem>
                            <FormLabel>Image URL</FormLabel>
                            <FormControl>
                              <Input
                                id={`gallery-url-${index}`}
                                placeholder="https://example.com/project-shot.jpg"
                                {...register(imageUrlPath, {
                                  onChange: () => {
                                    clearErrors(imageUrlPath)
                                    setPageError('')
                                  },
                                })}
                                className={cn(errors.gallery?.[index]?.imageUrl && 'border-[#c96b53] bg-[#2a1713] focus:border-[#f0a991]')}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={control}
                        name={altTextPath}
                        render={() => (
                          <FormItem>
                            <FormLabel>Alt text</FormLabel>
                            <FormControl>
                              <Input
                                id={`gallery-alt-${index}`}
                                placeholder="Admin dashboard overview"
                                {...register(altTextPath, {
                                  onChange: () => {
                                    clearErrors(altTextPath)
                                    setPageError('')
                                  },
                                })}
                                className={cn(errors.gallery?.[index]?.altText && 'border-[#c96b53] bg-[#2a1713] focus:border-[#f0a991]')}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </section>

          <section className="rounded-[28px] border border-white/10 bg-white/[0.04] p-5 sm:p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="font-['Space_Grotesk'] text-2xl font-semibold text-white">Tech stack</p>
                <p className="mt-1 text-sm text-white/55">Keep the stack short and ordered. Lead with the technologies that best describe the project.</p>
              </div>
              <Button type="button" variant="secondary" onClick={() => appendTechStack({ name: '' })}>
                <Plus className="size-4" />
                Add item
              </Button>
            </div>

            <div className="mt-5 space-y-4">
              {techStackFields.length === 0 ? (
                <div className="rounded-[24px] border border-dashed border-white/12 bg-white/[0.02] px-5 py-8 text-center text-sm text-white/45">
                  No tech stack items yet.
                </div>
              ) : null}

              {techStackFields.map((field, index) => {
                const techStackPath = `techStack.${index}.name`

                return (
                  <div key={field.id} className="flex flex-col gap-3 rounded-[22px] border border-white/10 bg-black/10 p-4 sm:flex-row sm:items-center">
                    <div className="flex min-w-0 flex-1 items-center gap-3">
                      <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/6 text-xs font-semibold text-white/70">
                        {index + 1}
                      </span>
                      <div className="min-w-0 flex-1">
                        <Input
                          placeholder="Spring Boot"
                          {...register(techStackPath, {
                            onChange: () => {
                              clearErrors(techStackPath)
                              setPageError('')
                            },
                          })}
                          className={cn(errors.techStack?.[index]?.name && 'border-[#c96b53] bg-[#2a1713] focus:border-[#f0a991]')}
                        />
                        <p className="text-sm text-[#f7a28c]">{errors.techStack?.[index]?.name?.message}</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 sm:justify-end">
                      <Button type="button" size="sm" variant="secondary" onClick={() => moveTechStack(index, index - 1)} disabled={index === 0}>
                        Up
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="secondary"
                        onClick={() => moveTechStack(index, index + 1)}
                        disabled={index === techStackFields.length - 1}
                      >
                        Down
                      </Button>
                      <Button type="button" size="sm" variant="danger" onClick={() => removeTechStack(index)}>
                        <Trash2 className="size-4" />
                        Remove
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          </section>
        </div>

        <aside className="space-y-6">
          <SidebarSection title="Publishing" description="Control visibility and ordering for the public portfolio.">
            <FormField
              control={control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <FormControl>
                    <select
                      id="project-status"
                      {...field}
                      onChange={(event) => {
                        field.onChange(event)
                        clearErrors('status')
                        setPageError('')
                      }}
                      className={cn(
                        'h-12 w-full rounded-2xl border border-white/12 bg-white/6 px-4 text-sm text-white outline-none transition focus:border-[#d9c8b0] focus:bg-white/8',
                        errors.status && 'border-[#c96b53] bg-[#2a1713] focus:border-[#f0a991]',
                      )}
                    >
                      {statusOptions.map((option) => (
                        <option key={option} value={option} className="bg-[#161616] text-white">
                          {option}
                        </option>
                      ))}
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="publishedAt"
              render={() => (
                <FormItem>
                  <FormLabel>Published date</FormLabel>
                  <FormControl>
                    <Input
                      id="project-published-at"
                      type="datetime-local"
                      {...register('publishedAt', {
                        onChange: () => {
                          clearErrors('publishedAt')
                          setPageError('')
                        },
                      })}
                      className={cn(errors.publishedAt && 'border-[#c96b53] bg-[#2a1713] focus:border-[#f0a991]')}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="displayOrder"
              render={() => (
                <FormItem>
                  <FormLabel>Display order</FormLabel>
                  <FormControl>
                    <Input
                      id="project-display-order"
                      type="number"
                      min="0"
                      {...displayOrderRegister}
                      className={cn(errors.displayOrder && 'border-[#c96b53] bg-[#2a1713] focus:border-[#f0a991]')}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <label className="flex items-center justify-between rounded-[20px] border border-white/10 bg-black/10 px-4 py-3 text-sm text-white/72">
              <span>Featured project</span>
              <Controller
                control={control}
                name="featured"
                render={({ field }) => (
                  <input
                    type="checkbox"
                    checked={Boolean(field.value)}
                    onChange={(event) => {
                      field.onChange(event.target.checked)
                      clearErrors('featured')
                      setPageError('')
                    }}
                    className="size-4 accent-[#f5efe3]"
                  />
                )}
              />
            </label>
          </SidebarSection>

          <SidebarSection title="Links" description="Public entry points for the live project and source code.">
            <FormField
              control={control}
              name="liveUrl"
              render={() => (
                <FormItem>
                  <FormLabel>Live URL</FormLabel>
                  <FormControl>
                    <Input
                      id="project-live-url"
                      placeholder="https://example.com"
                      {...register('liveUrl', {
                        onChange: () => {
                          clearErrors('liveUrl')
                          setPageError('')
                        },
                      })}
                      className={cn(errors.liveUrl && 'border-[#c96b53] bg-[#2a1713] focus:border-[#f0a991]')}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="repositoryUrl"
              render={() => (
                <FormItem>
                  <FormLabel>Repository URL</FormLabel>
                  <FormControl>
                    <Input
                      id="project-repository-url"
                      placeholder="https://github.com/example/repo"
                      {...register('repositoryUrl', {
                        onChange: () => {
                          clearErrors('repositoryUrl')
                          setPageError('')
                        },
                      })}
                      className={cn(errors.repositoryUrl && 'border-[#c96b53] bg-[#2a1713] focus:border-[#f0a991]')}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </SidebarSection>

          <SidebarSection title="Presentation" description="Primary artwork and search metadata.">
            <FormField
              control={control}
              name="coverImageUrl"
              render={() => (
                <FormItem>
                  <FormLabel>Cover image URL</FormLabel>
                  <FormControl>
                    <Input
                      id="project-cover-image-url"
                      placeholder="https://example.com/cover.jpg"
                      {...register('coverImageUrl', {
                        onChange: () => {
                          clearErrors('coverImageUrl')
                          setPageError('')
                        },
                      })}
                      className={cn(errors.coverImageUrl && 'border-[#c96b53] bg-[#2a1713] focus:border-[#f0a991]')}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {coverImageUrl ? (
              <div className="overflow-hidden rounded-[24px] border border-white/10 bg-black/10">
                <img src={coverImageUrl} alt="Cover preview" className="h-56 w-full object-cover" />
              </div>
            ) : null}

            <FormField
              control={control}
              name="seoTitle"
              render={() => (
                <FormItem>
                  <FormLabel>SEO title</FormLabel>
                  <FormControl>
                    <Input
                      id="project-seo-title"
                      placeholder="Portfolio Platform case study"
                      {...register('seoTitle', {
                        onChange: () => {
                          clearErrors('seoTitle')
                          setPageError('')
                        },
                      })}
                      className={cn(errors.seoTitle && 'border-[#c96b53] bg-[#2a1713] focus:border-[#f0a991]')}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="seoDescription"
              render={() => (
                <FormItem>
                  <FormLabel>SEO description</FormLabel>
                  <FormControl>
                    <Textarea
                      id="project-seo-description"
                      rows={4}
                      placeholder="Concise search-facing summary."
                      {...register('seoDescription', {
                        onChange: () => {
                          clearErrors('seoDescription')
                          setPageError('')
                        },
                      })}
                      className={cn(errors.seoDescription && 'border-[#c96b53] bg-[#2a1713] focus:border-[#f0a991]')}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </SidebarSection>

          <SidebarSection title="Preview cues" description="Quick read of the current public-facing structure.">
            <div className="space-y-3 rounded-[22px] border border-white/10 bg-black/10 p-4">
              <div className="flex items-center gap-3 text-sm text-white/68">
                <Sparkles className="size-4 text-white/40" />
                <span>{techStack.length} stack item{techStack.length === 1 ? '' : 's'}</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-white/68">
                <ImagePlus className="size-4 text-white/40" />
                <span>{gallery.length} gallery image{gallery.length === 1 ? '' : 's'}</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-white/68">
                <ExternalLink className="size-4 text-white/40" />
                <span>{liveUrl.trim() ? 'Live link added' : 'No live link yet'}</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-white/68">
                <GitBranch className="size-4 text-white/40" />
                <span>{repositoryUrl.trim() ? 'Repository link added' : 'No repository link yet'}</span>
              </div>
            </div>
          </SidebarSection>
        </aside>
      </form>
    </div>
    </Form>
  )
}
