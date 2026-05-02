import { Copy, ExternalLink, Image as ImageIcon, Search, Trash2, Upload } from 'lucide-react'
import { startTransition, useDeferredValue, useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import { deleteMediaAsset, getMediaAssets, uploadImage } from '../../api/uploads'
import { Button } from '../../components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog'
import { getApiErrorDetails } from '../../utils/apiError'

function formatDateTime(value) {
  if (!value) {
    return 'Not set'
  }

  return new Date(value).toLocaleString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

function resolveMediaUrl(url) {
  if (!url) {
    return ''
  }

  if (/^https?:\/\//i.test(url)) {
    return url
  }

  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api'
  const apiOrigin = new URL(apiBaseUrl).origin
  return new URL(url, apiOrigin).toString()
}

function DeleteMediaDialog({ media, isDeleting, errorMessage, onConfirm, onOpenChange }) {
  return (
    <Dialog open={Boolean(media)} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg overflow-hidden bg-[radial-gradient(circle_at_top,rgba(139,69,44,0.18),transparent_38%),#111111]">
        <DialogHeader>
          <DialogTitle>Delete image</DialogTitle>
          <DialogDescription>
            This will remove <span className="font-medium text-white">{media?.originalFileName}</span>. If the image is
            still attached to blog posts, the API will block the deletion.
          </DialogDescription>
        </DialogHeader>

        {media ? (
          <div className="rounded-[24px] border border-[#8b452c]/28 bg-[#8b452c]/10 p-4">
            <div className="flex items-center gap-3">
              <span className="inline-flex size-11 items-center justify-center rounded-2xl border border-[#f2b29d]/20 bg-[#8b452c]/16 text-[#ffd5c8]">
                <Trash2 className="size-4" />
              </span>
              <div className="min-w-0">
                <p className="truncate font-medium text-white">{media.originalFileName}</p>
                <p className="mt-1 truncate text-sm text-white/50">{media.storedFileName}</p>
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
            {isDeleting ? 'Deleting...' : 'Delete image'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function MediaCard({ media, copiedMediaId, deletingMediaId, onCopy, onDelete }) {
  const resolvedUrl = resolveMediaUrl(media.url)
  const [hasImageError, setHasImageError] = useState(false)

  return (
    <article className="overflow-hidden rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.03))] shadow-[0_20px_60px_rgba(0,0,0,0.22)]">
      {hasImageError ? (
        <div className="flex h-52 w-full flex-col items-center justify-center gap-3 bg-[radial-gradient(circle_at_top,rgba(217,200,176,0.12),transparent_42%),#0f0f0f] text-white/45">
          <span className="inline-flex size-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
            <ImageIcon className="size-5" />
          </span>
          <p className="text-sm">Preview unavailable</p>
        </div>
      ) : (
        <img
          src={resolvedUrl}
          alt={media.originalFileName}
          className="h-52 w-full object-cover"
          onError={() => setHasImageError(true)}
        />
      )}

      <div className="space-y-4 p-5">
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-2xl border border-[#d9c8b0]/22 bg-[#f5efe3]/8 text-[#f5efe3]">
              <ImageIcon className="size-4" />
            </span>
            <div className="min-w-0">
              <p className="truncate font-medium text-white">{media.originalFileName}</p>
              <p className="mt-1 text-xs text-white/45">
                {Math.round(media.sizeBytes / 1024)} KB | {media.contentType}
              </p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-white/8 bg-black/15 px-4 py-3">
              <p className="text-[11px] uppercase tracking-[0.18em] text-white/32">Uploaded</p>
              <p className="mt-2 text-sm text-white/70">{formatDateTime(media.createdAt)}</p>
            </div>
            <div className="rounded-2xl border border-white/8 bg-black/15 px-4 py-3">
              <p className="text-[11px] uppercase tracking-[0.18em] text-white/32">Stored file</p>
              <p className="mt-2 truncate text-sm text-white/70">{media.storedFileName}</p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="secondary" size="sm" onClick={() => onCopy(media)}>
            <Copy className="size-4" />
            <span>{copiedMediaId === media.id ? 'Copied' : 'Copy URL'}</span>
          </Button>
          <Button type="button" variant="secondary" size="sm" asChild>
            <a href={resolvedUrl} target="_blank" rel="noreferrer">
              <ExternalLink className="size-4" />
              <span>Open</span>
            </a>
          </Button>
          <Button
            type="button"
            variant="danger"
            size="sm"
            onClick={() => onDelete(media)}
            disabled={deletingMediaId === media.id}
          >
            <Trash2 className="size-4" />
            <span>{deletingMediaId === media.id ? 'Deleting...' : 'Delete'}</span>
          </Button>
        </div>
      </div>
    </article>
  )
}

export function AdminMediaPage() {
  const [mediaPage, setMediaPage] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isUploading, setIsUploading] = useState(false)
  const [deletingMediaId, setDeletingMediaId] = useState(null)
  const [pageError, setPageError] = useState('')
  const [copiedMediaId, setCopiedMediaId] = useState(null)
  const [mediaToDelete, setMediaToDelete] = useState(null)
  const [deleteError, setDeleteError] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [currentPage, setCurrentPage] = useState(0)
  const fileInputRef = useRef(null)
  const deferredSearch = useDeferredValue(searchInput.trim())
  const mediaAssets = mediaPage?.items ?? []

  useEffect(() => {
    loadMediaAssets(currentPage, deferredSearch)
  }, [currentPage, deferredSearch])

  async function loadMediaAssets(page, search) {
    setIsLoading(true)
    setPageError('')

    try {
      const response = await getMediaAssets({
        page,
        size: 12,
        search,
      })
      setMediaPage(response)
    } catch (error) {
      setPageError(getApiErrorDetails(error).message)
    } finally {
      setIsLoading(false)
    }
  }

  async function handleUpload(event) {
    const file = event.target.files?.[0]

    if (!file) {
      return
    }

    setIsUploading(true)
    setPageError('')

    try {
      await uploadImage(file)
      toast.success('Image uploaded.')
      setCurrentPage(0)
      await loadMediaAssets(0, deferredSearch)
    } catch (error) {
      const message = getApiErrorDetails(error).message
      toast.error(message)
      setPageError(message)
    } finally {
      setIsUploading(false)
      event.target.value = ''
    }
  }

  async function handleDelete(media) {
    setDeletingMediaId(media.id)
    setDeleteError('')

    try {
      await deleteMediaAsset(media.id)
      toast.success('Image deleted.')
      setMediaToDelete(null)
      const nextPage = mediaAssets.length === 1 && currentPage > 0 ? currentPage - 1 : currentPage
      setCurrentPage(nextPage)
      await loadMediaAssets(nextPage, deferredSearch)
    } catch (error) {
      const message = getApiErrorDetails(error).message
      setDeleteError(message)
      toast.error(message)
    } finally {
      setDeletingMediaId(null)
    }
  }

  async function handleCopyUrl(media) {
    try {
      await navigator.clipboard.writeText(resolveMediaUrl(media.url))
      setCopiedMediaId(media.id)
      toast.success('Media URL copied.')
      window.setTimeout(() => {
        setCopiedMediaId((current) => (current === media.id ? null : current))
      }, 1500)
    } catch {
      toast.error('Failed to copy media URL.')
    }
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.25em] text-white/45">Admin media</p>
          <h1 className="mt-3 font-['Space_Grotesk'] text-4xl font-semibold tracking-tight">Media library</h1>
        </div>

        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
          <div className="relative min-w-0 flex-1 sm:w-[320px]">
            <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-white/35" />
            <input
              type="search"
              value={searchInput}
              onChange={(event) => {
                const nextValue = event.target.value
                setSearchInput(nextValue)
                startTransition(() => {
                  setCurrentPage(0)
                })
              }}
              placeholder="Search by filename or type"
              className="flex h-12 w-full rounded-2xl border border-white/12 bg-white/6 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-[#d9c8b0] focus:bg-white/8"
            />
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif"
            onChange={handleUpload}
            className="hidden"
            disabled={isUploading}
          />
          <Button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-full sm:w-auto"
            disabled={isUploading}
          >
            <Upload className="size-4" />
            <span>{isUploading ? 'Uploading...' : 'Upload image'}</span>
          </Button>
        </div>
      </div>

      <div className="rounded-[24px] border border-white/10 bg-white/4 px-5 py-4 text-sm text-white/62">
        JPG, PNG, WEBP, or GIF up to 5 MB. Uploaded files are stored on the backend and tracked in the media library.
      </div>

      {pageError ? (
        <div className="rounded-[28px] border border-[#8b452c]/40 bg-[#8b452c]/10 px-5 py-4 text-[#ffd4c4]">
          {pageError}
        </div>
      ) : null}

      {isLoading ? (
        <div className="rounded-[30px] border border-white/10 bg-white/5 px-5 py-20 text-center text-white/55">
          Loading media assets...
        </div>
      ) : null}

      {!isLoading && mediaAssets.length === 0 ? (
        <div className="rounded-[30px] border border-white/10 bg-white/5 px-5 py-20 text-center text-white/55">
          {deferredSearch ? 'No media matches this search.' : 'No media uploaded yet. Use the upload button to add the first image.'}
        </div>
      ) : null}

      {!isLoading && mediaAssets.length > 0 ? (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {mediaAssets.map((media) => (
            <MediaCard
              key={media.id}
              media={media}
              copiedMediaId={copiedMediaId}
              deletingMediaId={deletingMediaId}
              onCopy={handleCopyUrl}
              onDelete={(selectedMedia) => {
                setMediaToDelete(selectedMedia)
                setDeleteError('')
              }}
            />
          ))}
        </div>
      ) : null}

      <div className="flex flex-col gap-3 rounded-[24px] border border-white/10 bg-white/4 px-5 py-4 text-sm text-white/62 md:flex-row md:items-center md:justify-between">
        <p>
          Page {(mediaPage?.page ?? 0) + 1} of {mediaPage?.totalPages || 1} | {mediaPage?.totalElements ?? 0} assets total
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
            disabled={!mediaPage?.hasNext || isLoading}
            onClick={() => setCurrentPage((page) => page + 1)}
          >
            Next
          </Button>
        </div>
      </div>

      <DeleteMediaDialog
        media={mediaToDelete}
        isDeleting={deletingMediaId === mediaToDelete?.id}
        errorMessage={deleteError}
        onConfirm={() => {
          if (mediaToDelete) {
            handleDelete(mediaToDelete)
          }
        }}
        onOpenChange={(isOpen) => {
          if (!isOpen) {
            setMediaToDelete(null)
            setDeleteError('')
          }
        }}
      />
    </section>
  )
}
