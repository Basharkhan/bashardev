import { useEffect, useState } from 'react'
import { deleteMediaAsset, getMediaAssets, uploadImage } from '../../api/uploads'
import { getApiErrorDetails } from '../../utils/apiError'

function formatDateTime(value) {
  if (!value) {
    return 'Not set'
  }

  return new Date(value).toLocaleString()
}

export function AdminMediaPage() {
  const [mediaAssets, setMediaAssets] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isUploading, setIsUploading] = useState(false)
  const [deletingMediaId, setDeletingMediaId] = useState(null)
  const [pageError, setPageError] = useState('')
  const [copiedMediaId, setCopiedMediaId] = useState(null)

  useEffect(() => {
    loadMediaAssets()
  }, [])

  async function loadMediaAssets() {
    setIsLoading(true)
    setPageError('')

    try {
      const response = await getMediaAssets()
      setMediaAssets(response)
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
      await loadMediaAssets()
    } catch (error) {
      setPageError(getApiErrorDetails(error).message)
    } finally {
      setIsUploading(false)
      event.target.value = ''
    }
  }

  async function handleDelete(media) {
    const shouldDelete = window.confirm(`Delete "${media.originalFileName}"?`)

    if (!shouldDelete) {
      return
    }

    setDeletingMediaId(media.id)

    try {
      await deleteMediaAsset(media.id)
      await loadMediaAssets()
    } catch (error) {
      setPageError(getApiErrorDetails(error).message)
    } finally {
      setDeletingMediaId(null)
    }
  }

  async function handleCopyUrl(media) {
    try {
      await navigator.clipboard.writeText(media.url)
      setCopiedMediaId(media.id)
      window.setTimeout(() => {
        setCopiedMediaId((current) => (current === media.id ? null : current))
      }, 1500)
    } catch {
      setPageError('Failed to copy media URL.')
    }
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.25em] text-white/45">Admin media</p>
          <h1 className="mt-3 font-['Space_Grotesk'] text-4xl font-semibold tracking-tight">Media library</h1>
          <p className="mt-3 max-w-3xl text-white/68">
            Upload and manage reusable images for blog covers now, with a clean base for multiple assets and article imagery later.
          </p>
        </div>

        <label className="inline-flex cursor-pointer rounded-full bg-[#f5efe3] px-5 py-3 font-medium text-[#111111] transition hover:bg-white">
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif"
            onChange={handleUpload}
            className="hidden"
            disabled={isUploading}
          />
          {isUploading ? 'Uploading...' : 'Upload image'}
        </label>
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
          No media uploaded yet. Use the upload button to add the first image.
        </div>
      ) : null}

      {!isLoading && mediaAssets.length > 0 ? (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {mediaAssets.map((media) => (
            <article key={media.id} className="overflow-hidden rounded-[28px] border border-white/10 bg-[#0f0f0f]">
              <img src={media.url} alt={media.originalFileName} className="h-52 w-full object-cover" />
              <div className="space-y-4 p-5">
                <div>
                  <p className="truncate font-medium text-white">{media.originalFileName}</p>
                  <p className="mt-1 text-xs text-white/45">
                    {Math.round(media.sizeBytes / 1024)} KB | {media.contentType}
                  </p>
                </div>

                <div className="space-y-1 text-xs text-white/45">
                  <p>Uploaded: {formatDateTime(media.createdAt)}</p>
                  <p className="truncate">Stored: {media.storedFileName}</p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => handleCopyUrl(media)}
                    className="rounded-full border border-white/12 px-4 py-2 text-xs font-medium text-white/75 transition hover:bg-white/8"
                  >
                    {copiedMediaId === media.id ? 'Copied' : 'Copy URL'}
                  </button>
                  <a
                    href={media.url}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-full border border-white/12 px-4 py-2 text-xs font-medium text-white/75 transition hover:bg-white/8"
                  >
                    Open
                  </a>
                  <button
                    type="button"
                    onClick={() => handleDelete(media)}
                    disabled={deletingMediaId === media.id}
                    className="rounded-full border border-[#8b452c]/40 px-4 py-2 text-xs font-medium text-[#f7b39c] transition hover:bg-[#8b452c]/10 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {deletingMediaId === media.id ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : null}
    </section>
  )
}
