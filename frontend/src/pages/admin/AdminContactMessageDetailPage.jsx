import { Archive, ArrowLeft, Mail, MailOpen, RotateCcw, Trash2 } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import {
  deleteContactMessage,
  getAdminContactMessage,
  updateContactMessageStatus,
} from '../../api/contactMessages'
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

function formatDate(value) {
  if (!value) {
    return 'Not set'
  }

  return new Date(value).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function statusBadge(status) {
  const styles = {
    UNREAD: 'border-[#d9c8b0]/40 bg-[#d9c8b0]/10 text-[#f5efe3]',
    READ: 'border-white/15 bg-white/5 text-white/65',
    ARCHIVED: 'border-white/8 bg-white/[0.02] text-white/35',
  }

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium uppercase tracking-[0.12em] ${styles[status] || styles.READ}`}
    >
      {status === 'UNREAD' ? (
        <span className="inline-block size-2 rounded-full bg-[#d9c8b0] shadow-[0_0_6px_rgba(217,200,176,0.4)]" />
      ) : status === 'READ' ? (
        <span className="inline-block size-2 rounded-full bg-white/25" />
      ) : (
        <span className="inline-block size-2 rounded-full bg-white/10" />
      )}
      {status}
    </span>
  )
}

export function AdminContactMessageDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [message, setMessage] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [pageError, setPageError] = useState('')
  const [isUpdating, setIsUpdating] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [deleteError, setDeleteError] = useState('')
  const autoReadFired = useRef(false)

  useEffect(() => {
    loadMessage()
  }, [id])

  async function loadMessage() {
    setIsLoading(true)
    setPageError('')

    try {
      const data = await getAdminContactMessage(id)
      setMessage(data)
    } catch (error) {
      setPageError(getApiErrorDetails(error).message)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (message && message.status === 'UNREAD' && !autoReadFired.current) {
      autoReadFired.current = true
      markAsRead()
    }
  }, [message])

  async function markAsRead() {
    try {
      const updated = await updateContactMessageStatus(id, 'READ')
      setMessage(updated)
    } catch {
      // silent — the read status update is non-blocking
    }
  }

  async function handleStatusChange(newStatus) {
    setIsUpdating(true)

    try {
      const updated = await updateContactMessageStatus(id, newStatus)
      setMessage(updated)
      toast.success(`Message marked as ${newStatus.toLowerCase()}.`)
    } catch (error) {
      toast.error(getApiErrorDetails(error).message)
    } finally {
      setIsUpdating(false)
    }
  }

  async function handleDelete() {
    setIsDeleting(true)
    setDeleteError('')

    try {
      await deleteContactMessage(id)
      toast.success('Message deleted.')
      navigate('/admin/contact-messages')
    } catch (error) {
      const message = getApiErrorDetails(error).message
      setDeleteError(message)
      toast.error(message)
    } finally {
      setIsDeleting(false)
    }
  }

  if (isLoading) {
    return (
      <section className="flex items-center justify-center py-32">
        <p className="text-white/55">Loading message...</p>
      </section>
    )
  }

  if (pageError) {
    return (
      <section className="space-y-6">
        <Button type="button" variant="ghost" className="text-white/65 hover:text-white" onClick={() => navigate('/admin/contact-messages')}>
          <ArrowLeft className="size-4" />
          <span>Back to messages</span>
        </Button>
        <div className="rounded-[28px] border border-[#8b452c]/40 bg-[#8b452c]/10 px-5 py-4 text-[#ffd4c4]">
          {pageError}
        </div>
      </section>
    )
  }

  if (!message) {
    return (
      <section className="space-y-6">
        <Button type="button" variant="ghost" className="text-white/65 hover:text-white" onClick={() => navigate('/admin/contact-messages')}>
          <ArrowLeft className="size-4" />
          <span>Back to messages</span>
        </Button>
        <div className="rounded-[28px] border border-white/8 bg-white/4 px-5 py-12 text-center text-white/55">
          Message not found.
        </div>
      </section>
    )
  }

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <Button type="button" variant="ghost" className="text-white/65 hover:text-white" onClick={() => navigate('/admin/contact-messages')}>
          <ArrowLeft className="size-4" />
          <span>Back to messages</span>
        </Button>

        <Button
          type="button"
          variant="ghost"
          className="text-[#f3aa93] hover:bg-[#8b452c]/10 hover:text-[#ffd5c8]"
          disabled={isDeleting}
          onClick={() => {
            setShowDeleteDialog(true)
            setDeleteError('')
          }}
        >
          <Trash2 className="size-4" />
          <span>Delete</span>
        </Button>
      </div>

      <div>
        <p className="text-sm uppercase tracking-[0.25em] text-white/45">Message detail</p>
        <h1 className="mt-3 font-['Space_Grotesk'] text-4xl font-semibold tracking-tight">
          {message.subject}
        </h1>
      </div>

      <div className="overflow-hidden rounded-[30px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.03))] shadow-[0_24px_80px_rgba(0,0,0,0.22)]">
        <div className="border-b border-white/8 px-6 py-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex size-12 items-center justify-center rounded-2xl border border-[#d9c8b0]/22 bg-[#f5efe3]/8 text-[#f5efe3]">
                <Mail className="size-5" />
              </span>
              <div>
                <p className="font-medium text-white">{message.name}</p>
                <p className="mt-1 text-sm text-white/50">{message.email}</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {statusBadge(message.status)}

              {message.status !== 'ARCHIVED' ? (
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  disabled={isUpdating}
                  onClick={() => handleStatusChange('ARCHIVED')}
                >
                  <Archive className="size-4" />
                  <span>Archive</span>
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  disabled={isUpdating}
                  onClick={() => handleStatusChange('UNREAD')}
                >
                  <RotateCcw className="size-4" />
                  <span>Reopen</span>
                </Button>
              )}

              {message.status === 'READ' ? (
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  disabled={isUpdating}
                  onClick={() => handleStatusChange('UNREAD')}
                >
                  <Mail className="size-4" />
                  <span>Mark unread</span>
                </Button>
              ) : message.status === 'UNREAD' ? (
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  disabled={isUpdating}
                  onClick={() => handleStatusChange('READ')}
                >
                  <MailOpen className="size-4" />
                  <span>Mark read</span>
                </Button>
              ) : null}
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/8 bg-black/15 px-4 py-3">
              <p className="text-[11px] uppercase tracking-[0.18em] text-white/32">Received</p>
              <p className="mt-2 text-sm text-white/70">{formatDate(message.createdAt)}</p>
            </div>
          </div>
        </div>

        <div className="px-6 py-6">
          <p className="text-xs uppercase tracking-[0.18em] text-white/35">Message</p>
          <div className="mt-4 whitespace-pre-wrap text-white/85 leading-relaxed">
            {message.message}
          </div>
        </div>
      </div>

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="max-w-lg overflow-hidden bg-[radial-gradient(circle_at_top,rgba(139,69,44,0.18),transparent_38%),#111111]">
          <DialogHeader>
            <DialogTitle>Delete message</DialogTitle>
            <DialogDescription>
              Permanently delete this message from{' '}
              <span className="font-medium text-white">{message.name}</span>. This cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <div className="rounded-[24px] border border-[#8b452c]/28 bg-[#8b452c]/10 p-4">
            <div className="flex items-center gap-3">
              <span className="inline-flex size-11 items-center justify-center rounded-2xl border border-[#f2b29d]/20 bg-[#8b452c]/16 text-[#ffd5c8]">
                <Trash2 className="size-4" />
              </span>
              <div className="min-w-0">
                <p className="truncate font-medium text-white">{message.subject}</p>
                <p className="mt-1 text-sm text-white/50">{message.email}</p>
              </div>
            </div>
          </div>

          {deleteError ? (
            <p className="rounded-2xl border border-[#8b452c]/40 bg-[#8b452c]/10 px-4 py-3 text-sm text-[#ffd4c4]">
              {deleteError}
            </p>
          ) : null}

          <DialogFooter>
            <Button type="button" variant="secondary" onClick={() => setShowDeleteDialog(false)} disabled={isDeleting}>
              Cancel
            </Button>
            <Button type="button" variant="danger" onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? 'Deleting...' : 'Delete message'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  )
}
