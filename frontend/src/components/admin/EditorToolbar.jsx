import { useCallback, useMemo, useState } from 'react'
import {
  Bold,
  ChevronDown,
  Code,
  Code2,
  Heading2,
  Image,
  Italic,
  Link,
  List,
  ListOrdered,
  Minus,
  Quote,
  Redo2,
  Table,
  Underline,
  Undo2,
} from 'lucide-react'

function ToolbarButton({ icon: Icon, isActive, onClick, title }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`rounded-full px-3 py-2 text-sm transition ${
        isActive ? 'bg-[#f5efe3] text-[#111111]' : 'text-white/58 hover:bg-white/8 hover:text-white/85'
      }`}
    >
      <span className="flex items-center gap-2">
        <Icon size={15} />
      </span>
    </button>
  )
}

function MoreActionButton({ children, onClick, title }) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className="rounded-2xl border border-white/10 bg-white/4 px-3 py-2 text-left text-sm text-white/72 transition hover:bg-white/8 hover:text-white"
    >
      {children}
    </button>
  )
}

export function EditorToolbar({ editor, onImageUpload }) {
  const [linkUrl, setLinkUrl] = useState('')
  const [showLinkInput, setShowLinkInput] = useState(false)
  const [showMoreMenu, setShowMoreMenu] = useState(false)

  const shortcutLabel = useMemo(
    () => (typeof navigator !== 'undefined' && navigator.platform.toLowerCase().includes('mac') ? 'Cmd' : 'Ctrl'),
    [],
  )

  const handleSetLink = useCallback(() => {
    const url = linkUrl.trim()

    if (!url) {
      editor.chain().focus().unsetLink().run()
    } else {
      const href = url.startsWith('http') ? url : `https://${url}`
      editor.chain().focus().extendMarkRange('link').setLink({ href }).run()
    }

    setShowLinkInput(false)
    setLinkUrl('')
  }, [editor, linkUrl])

  const handleKeyDown = useCallback(
    (event) => {
      if (event.key === 'Enter') {
        event.preventDefault()
        handleSetLink()
      }

      if (event.key === 'Escape') {
        setShowLinkInput(false)
        setLinkUrl('')
      }
    },
    [handleSetLink],
  )

  const closeMoreMenu = useCallback(() => {
    setShowMoreMenu(false)
  }, [])

  return (
    <div className="border-b border-white/8 bg-black/18 px-3 py-3">
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex flex-wrap items-center gap-1 rounded-full border border-white/8 bg-black/18 p-1">
          <ToolbarButton
            icon={Bold}
            isActive={editor.isActive('bold')}
            onClick={() => editor.chain().focus().toggleBold().run()}
            title={`Bold (${shortcutLabel}+B)`}
          />
          <ToolbarButton
            icon={Italic}
            isActive={editor.isActive('italic')}
            onClick={() => editor.chain().focus().toggleItalic().run()}
            title={`Italic (${shortcutLabel}+I)`}
          />
          <ToolbarButton
            icon={Link}
            isActive={editor.isActive('link')}
            onClick={() => setShowLinkInput((current) => !current)}
            title="Link"
          />
          <ToolbarButton
            icon={Heading2}
            isActive={editor.isActive('heading', { level: 2 })}
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            title="Heading"
          />
          <ToolbarButton
            icon={List}
            isActive={editor.isActive('bulletList')}
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            title="Bullet list"
          />
          <ToolbarButton
            icon={Quote}
            isActive={editor.isActive('blockquote')}
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            title="Blockquote"
          />
        </div>

        <div className="relative">
          <button
            type="button"
            onClick={() => setShowMoreMenu((current) => !current)}
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/4 px-4 py-2 text-sm text-white/72 transition hover:bg-white/8 hover:text-white"
          >
            More
            <ChevronDown size={14} className={showMoreMenu ? 'rotate-180 transition' : 'transition'} />
          </button>

          {showMoreMenu ? (
            <div className="absolute left-0 top-[calc(100%+0.6rem)] z-20 grid w-[320px] gap-2 rounded-[24px] border border-white/10 bg-[#121212]/98 p-3 shadow-[0_24px_60px_rgba(0,0,0,0.35)] backdrop-blur">
              <div className="grid grid-cols-2 gap-2">
                <MoreActionButton
                  title="Underline"
                  onClick={() => {
                    editor.chain().focus().toggleUnderline().run()
                    closeMoreMenu()
                  }}
                >
                  <span className="flex items-center gap-2">
                    <Underline size={15} />
                    Underline
                  </span>
                </MoreActionButton>
                <MoreActionButton
                  title="Inline code"
                  onClick={() => {
                    editor.chain().focus().toggleCode().run()
                    closeMoreMenu()
                  }}
                >
                  <span className="flex items-center gap-2">
                    <Code size={15} />
                    Inline code
                  </span>
                </MoreActionButton>
                <MoreActionButton
                  title="Ordered list"
                  onClick={() => {
                    editor.chain().focus().toggleOrderedList().run()
                    closeMoreMenu()
                  }}
                >
                  <span className="flex items-center gap-2">
                    <ListOrdered size={15} />
                    Numbered list
                  </span>
                </MoreActionButton>
                <MoreActionButton
                  title="Code block"
                  onClick={() => {
                    editor.chain().focus().toggleCodeBlock().run()
                    closeMoreMenu()
                  }}
                >
                  <span className="flex items-center gap-2">
                    <Code2 size={15} />
                    Code block
                  </span>
                </MoreActionButton>
                <MoreActionButton
                  title="Horizontal rule"
                  onClick={() => {
                    editor.chain().focus().setHorizontalRule().run()
                    closeMoreMenu()
                  }}
                >
                  <span className="flex items-center gap-2">
                    <Minus size={15} />
                    Divider
                  </span>
                </MoreActionButton>
                <MoreActionButton
                  title="Insert table"
                  onClick={() => {
                    editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
                    closeMoreMenu()
                  }}
                >
                  <span className="flex items-center gap-2">
                    <Table size={15} />
                    Table
                  </span>
                </MoreActionButton>
                {onImageUpload ? (
                  <MoreActionButton
                    title="Insert image"
                    onClick={() => {
                      onImageUpload()
                      closeMoreMenu()
                    }}
                  >
                    <span className="flex items-center gap-2">
                      <Image size={15} />
                      Insert image
                    </span>
                  </MoreActionButton>
                ) : null}
              </div>
            </div>
          ) : null}
        </div>

        {showLinkInput ? (
          <span className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2">
            <input
              type="url"
              placeholder="https://..."
              value={linkUrl}
              onChange={(event) => setLinkUrl(event.target.value)}
              onKeyDown={handleKeyDown}
              autoFocus
              className="w-44 bg-transparent text-sm text-white outline-none placeholder:text-white/30"
            />
            <button
              type="button"
              onClick={handleSetLink}
              className="rounded-full bg-[#f5efe3] px-3 py-1 text-xs font-medium text-[#111111] transition hover:bg-white"
            >
              Apply
            </button>
          </span>
        ) : null}

        <div className="ml-auto flex items-center gap-1">
          <button
            type="button"
            onClick={() => editor.chain().focus().undo().run()}
            title={`Undo (${shortcutLabel}+Z)`}
            className="rounded-full border border-white/10 bg-white/4 p-2 text-white/58 transition hover:bg-white/8 hover:text-white/85"
          >
            <Undo2 size={15} />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().redo().run()}
            title={`Redo (${shortcutLabel}+Shift+Z)`}
            className="rounded-full border border-white/10 bg-white/4 p-2 text-white/58 transition hover:bg-white/8 hover:text-white/85"
          >
            <Redo2 size={15} />
          </button>
        </div>
      </div>

      <p className="mt-3 text-xs text-white/35">
        Shortcuts: {shortcutLabel}+B bold, {shortcutLabel}+I italic, {shortcutLabel}+Z undo.
      </p>
    </div>
  )
}
