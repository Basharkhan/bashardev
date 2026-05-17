import { ArrowUpRight, Mail, Search, Trash2 } from 'lucide-react'
import { startTransition, useDeferredValue, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { deleteContactMessage, getAdminContactMessages } from '../../api/contactMessages'
import { Button } from '../../components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog'
import { Input } from '../../components/ui/input'
import { cn } from '../../lib/utils'
import { getApiErrorDetails } from '../../utils/apiError'

const STATUS_TABS = [
  { label: 'All', value: '' },
  { label: 'Unread', value: 'UNREAD' },
  { label: 'Read', value: 'READ' },
  { label: 'Archived', value: 'ARCHIVED' },
]

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

function statusDot(status) {
  if (status === 'UNREAD') {
    return <span className="inline-block size-2.5 rounded-full bg-[#d9c8b0] shadow-[0_0_8px_rgba(217,200,176,0.5)]" />
  }

  if (status === 'READ') {
    return <span className="inline-block size-2.5 rounded-full bg-white/25" />
  }

  return <span className="inline-block size-2.5 rounded-full bg-white/10" />
}

function DeleteMessageDialog({ message, isDeleting, errorMessage, onConfirm, onOpenChange }) {
  return (
    <Dialog open={Boolean(message)} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg overflow-hidden bg-[radial-gradient(circle_at_top,rgba(139,69,44,0.18),transparent_38%),#111111]">
        <DialogHeader>
          <DialogTitle>Delete message</DialogTitle>
          <DialogDescription>
            Permanently delete the message from{' '}
            <span className="font-medium text-white">{message?.name}</span>. This cannot be undone.
          </DialogDescription>
        </DialogHeader>

        {message ? (
          <div className="rounded-[24px] border border-[#8b452c]/28 bg-[#8b452c]/10 p-4">
            <div className="flex items-center gap-3">
              <span className="inline-flex size-11 items-center justify-center rounded-2xl border border-[#f2b29d]/20 bg-[#8b452c]/16 text-[#ffd5c8]">
                <Trash2 className="size-4" />
              </span>
              <div className="min-w-0">
                <p className="truncate font-medium text-white">{message.name}</p>
                <p className="mt-1 truncate text-sm text-white/50">{message.subject}</p>
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
            {isDeleting ? 'Deleting...' : 'Delete message'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function AdminContactMessagesPage() {
  const navigate = useNavigate()
  const [messagePage, setMessagePage] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [pageError, setPageError] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [currentPage, setCurrentPage] = useState(0)
  const [statusFilter, setStatusFilter] = useState('')
  const [messageToDelete, setMessageToDelete] = useState(null)
  const [deleteError, setDeleteError] = useState('')
  const [isDeletingId, setIsDeletingId] = useState(null)
  const deferredSearch = useDeferredValue(searchInput.trim())
  const messages = messagePage?.items ?? []

  useEffect(() => {
    loadMessages(currentPage, deferredSearch, statusFilter)
  }, [currentPage, deferredSearch, statusFilter])

  async function loadMessages(page, search, status) {
    setIsLoading(true)
    setPageError('')

    try {
      const response = await getAdminContactMessages({
        page,
        size: 10,
        search,
        status,
      })
      setMessagePage(response)
    } catch (error) {
      setPageError(getApiErrorDetails(error).message)
    } finally {
      setIsLoading(false)
    }
  }

  async function handleDelete(message) {
    setIsDeletingId(message.id)
    setDeleteError('')

    try {
      await deleteContactMessage(message.id)
      toast.success('Message deleted.')
      setMessageToDelete(null)
      const nextPage = messages.length === 1 && currentPage > 0 ? currentPage - 1 : currentPage
      setCurrentPage(nextPage)
      await loadMessages(nextPage, deferredSearch, statusFilter)
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
          <p className="text-sm uppercase tracking-[0.25em] text-white/45">Admin messages</p>
          <h1 className="mt-3 font-['Space_Grotesk'] text-4xl font-semibold tracking-tight">Messages</h1>
        </div>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative min-w-0 flex-1 sm:max-w-[400px]">
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
            placeholder="Search by name, email or subject"
            className="pl-11"
          />
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto">
        {STATUS_TABS.map(({ label, value }) => (
          <Button
            key={value}
            type="button"
            variant={statusFilter === value ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => {
              setStatusFilter(value)
              setCurrentPage(0)
            }}
          >
            {label}
          </Button>
        ))}
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
                <th className="w-10 px-6 py-5 font-medium" aria-label="Status">
                  &nbsp;
                </th>
                <th className="px-6 py-5 font-medium">Name</th>
                <th className="px-6 py-5 font-medium">Email</th>
                <th className="px-6 py-5 font-medium">Subject</th>
                <th className="px-6 py-5 font-medium">Received</th>
                <th className="px-6 py-5 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-20 text-center text-white/55">
                    Loading messages...
                  </td>
                </tr>
              ) : null}

              {!isLoading && messages.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-20 text-center text-white/55">
                    {deferredSearch || statusFilter
                      ? 'No messages match the current filters.'
                      : 'No messages yet. Messages submitted via the contact form will appear here.'}
                  </td>
                </tr>
              ) : null}

              {!isLoading
                ? messages.map((msg) => (
                    <tr
                      key={msg.id}
                      className="cursor-pointer border-t border-white/8 align-middle transition hover:bg-white/[0.035]"
                      onClick={() => navigate(`${msg.id}`)}
                    >
                      <td className="px-6 py-4">
                        {statusDot(msg.status)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <span className="inline-flex size-10 items-center justify-center rounded-2xl border border-[#d9c8b0]/22 bg-[#f5efe3]/8 text-[#f5efe3]">
                            <Mail className="size-4" />
                          </span>
                          <div>
                            <p className="font-medium text-white">{msg.name}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-white/62">{msg.email}</td>
                      <td className="px-6 py-4 max-w-[240px]">
                        <p className="truncate font-medium text-white">{msg.subject}</p>
                      </td>
                      <td className="px-6 py-4 text-white/62">{formatDate(msg.createdAt)}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            className="text-white/65 hover:text-white"
                            aria-label={`Open message from ${msg.name}`}
                            onClick={(e) => {
                              e.stopPropagation()
                              navigate(`${msg.id}`)
                            }}
                          >
                            <ArrowUpRight className="size-4" />
                          </Button>
                          <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            className="text-[#f3aa93] hover:bg-[#8b452c]/10 hover:text-[#ffd5c8]"
                            aria-label={`Delete message from ${msg.name}`}
                            disabled={isDeletingId === msg.id}
                            onClick={(e) => {
                              e.stopPropagation()
                              setMessageToDelete(msg)
                              setDeleteError('')
                            }}
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </div>
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
              Loading messages...
            </div>
          ) : null}

          {!isLoading && messages.length === 0 ? (
            <div className="rounded-[24px] border border-white/8 bg-white/4 px-4 py-12 text-center text-white/55">
              {deferredSearch || statusFilter
                ? 'No messages match the current filters.'
                : 'No messages yet. Messages submitted via the contact form will appear here.'}
            </div>
          ) : null}

          {!isLoading
            ? messages.map((msg) => (
                <article
                  key={msg.id}
                  className="cursor-pointer rounded-[26px] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.03))] p-4 shadow-[0_18px_40px_rgba(0,0,0,0.18)]"
                  onClick={() => navigate(`${msg.id}`)}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                      {statusDot(msg.status)}
                      <span className="inline-flex size-10 items-center justify-center rounded-2xl border border-[#d9c8b0]/22 bg-[#f5efe3]/8 text-[#f5efe3]">
                        <Mail className="size-4" />
                      </span>
                      <div className="min-w-0">
                        <p className="truncate font-medium text-white">{msg.name}</p>
                        <p className="mt-1 truncate text-sm text-white/50">{msg.email}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        className="text-white/65 hover:text-white"
                        aria-label={`Open message from ${msg.name}`}
                        onClick={(e) => {
                          e.stopPropagation()
                          navigate(`${msg.id}`)
                        }}
                      >
                        <ArrowUpRight className="size-4" />
                      </Button>
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        className="text-[#f3aa93] hover:bg-[#8b452c]/10 hover:text-[#ffd5c8]"
                        aria-label={`Delete message from ${msg.name}`}
                        disabled={isDeletingId === msg.id}
                        onClick={(e) => {
                          e.stopPropagation()
                          setMessageToDelete(msg)
                          setDeleteError('')
                        }}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="mt-3">
                    <p className="truncate text-sm font-medium text-white">{msg.subject}</p>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <div className="rounded-2xl border border-white/8 bg-black/15 px-4 py-3">
                      <p className="text-[11px] uppercase tracking-[0.18em] text-white/32">Received</p>
                      <p className="mt-2 text-sm text-white/70">{formatDate(msg.createdAt)}</p>
                    </div>
                    <div className="rounded-2xl border border-white/8 bg-black/15 px-4 py-3">
                      <p className="text-[11px] uppercase tracking-[0.18em] text-white/32">Status</p>
                      <p className="mt-2 text-sm text-white/70">{msg.status}</p>
                    </div>
                  </div>
                </article>
              ))
            : null}
        </div>
      </div>

      <div className="flex flex-col gap-3 rounded-[24px] border border-white/10 bg-white/4 px-5 py-4 text-sm text-white/62 md:flex-row md:items-center md:justify-between">
        <p>
          Page {(messagePage?.page ?? 0) + 1} of {messagePage?.totalPages || 1} | {messagePage?.totalElements ?? 0} messages total
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
            disabled={!messagePage?.hasNext || isLoading}
            onClick={() => setCurrentPage((page) => page + 1)}
          >
            Next
          </Button>
        </div>
      </div>

      <DeleteMessageDialog
        message={messageToDelete}
        isDeleting={isDeletingId === messageToDelete?.id}
        errorMessage={deleteError}
        onConfirm={() => {
          if (messageToDelete) {
            handleDelete(messageToDelete)
          }
        }}
        onOpenChange={(isOpen) => {
          if (!isOpen) {
            setMessageToDelete(null)
            setDeleteError('')
          }
        }}
      />
    </section>
  )
}
