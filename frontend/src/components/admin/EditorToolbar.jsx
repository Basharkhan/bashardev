import { useCallback, useState } from 'react'
import {
  Bold, Italic, Underline, Strikethrough, Code, Highlighter,
  Heading1, Heading2, Heading3,
  List, ListOrdered, ListChecks,
  Quote, Code2, Minus,
  Link, Image, Table,
  AlignLeft, AlignCenter, AlignRight,
  Undo2, Redo2,
} from 'lucide-react'

function ToolbarButton({ icon: Icon, isActive, onClick, title }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`rounded-lg p-2 text-sm transition ${
        isActive
          ? 'bg-white/15 text-white'
          : 'text-white/55 hover:bg-white/8 hover:text-white/80'
      }`}
    >
      <Icon size={16} />
    </button>
  )
}

function ToolbarDivider() {
  return <span className="mx-1 h-6 w-px bg-white/10" />
}

export function EditorToolbar({ editor, onImageUpload }) {
  const [linkUrl, setLinkUrl] = useState('')
  const [showLinkInput, setShowLinkInput] = useState(false)

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
    (e) => {
      if (e.key === 'Enter') {
        e.preventDefault()
        handleSetLink()
      }
      if (e.key === 'Escape') {
        setShowLinkInput(false)
        setLinkUrl('')
      }
    },
    [handleSetLink]
  )

  const handleAddTable = useCallback(() => {
    editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
  }, [editor])

  return (
    <div className="flex flex-wrap items-center gap-1 border-b border-white/10 px-3 py-2">
      <div className="flex items-center gap-0.5">
        <ToolbarButton icon={Bold} isActive={editor.isActive('bold')} onClick={() => editor.chain().focus().toggleBold().run()} title="Bold" />
        <ToolbarButton icon={Italic} isActive={editor.isActive('italic')} onClick={() => editor.chain().focus().toggleItalic().run()} title="Italic" />
        <ToolbarButton icon={Underline} isActive={editor.isActive('underline')} onClick={() => editor.chain().focus().toggleUnderline().run()} title="Underline" />
        <ToolbarButton icon={Strikethrough} isActive={editor.isActive('strike')} onClick={() => editor.chain().focus().toggleStrike().run()} title="Strikethrough" />
        <ToolbarButton icon={Code} isActive={editor.isActive('code')} onClick={() => editor.chain().focus().toggleCode().run()} title="Inline code" />
        <ToolbarButton icon={Highlighter} isActive={editor.isActive('highlight')} onClick={() => editor.chain().focus().toggleHighlight().run()} title="Highlight" />
      </div>

      <ToolbarDivider />

      <div className="flex items-center gap-0.5">
        <ToolbarButton icon={Heading1} isActive={editor.isActive('heading', { level: 1 })} onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} title="Heading 1" />
        <ToolbarButton icon={Heading2} isActive={editor.isActive('heading', { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} title="Heading 2" />
        <ToolbarButton icon={Heading3} isActive={editor.isActive('heading', { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} title="Heading 3" />
      </div>

      <ToolbarDivider />

      <div className="flex items-center gap-0.5">
        <ToolbarButton icon={List} isActive={editor.isActive('bulletList')} onClick={() => editor.chain().focus().toggleBulletList().run()} title="Bullet list" />
        <ToolbarButton icon={ListOrdered} isActive={editor.isActive('orderedList')} onClick={() => editor.chain().focus().toggleOrderedList().run()} title="Ordered list" />
        <ToolbarButton icon={ListChecks} isActive={editor.isActive('taskList')} onClick={() => editor.chain().focus().toggleTaskList().run()} title="Task list" />
      </div>

      <ToolbarDivider />

      <div className="flex items-center gap-0.5">
        <ToolbarButton icon={Quote} isActive={editor.isActive('blockquote')} onClick={() => editor.chain().focus().toggleBlockquote().run()} title="Blockquote" />
        <ToolbarButton icon={Code2} isActive={editor.isActive('codeBlock')} onClick={() => editor.chain().focus().toggleCodeBlock().run()} title="Code block" />
        <ToolbarButton icon={Minus} isActive={false} onClick={() => editor.chain().focus().setHorizontalRule().run()} title="Horizontal rule" />
      </div>

      <ToolbarDivider />

      <div className="flex items-center gap-0.5">
        {showLinkInput ? (
          <span className="flex items-center gap-1 rounded-lg bg-white/8 px-2 py-1">
            <input
              type="url"
              placeholder="https://..."
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              onKeyDown={handleKeyDown}
              autoFocus
              className="w-36 bg-transparent text-sm text-white outline-none placeholder:text-white/30"
            />
            <button type="button" onClick={handleSetLink} className="rounded px-1.5 py-0.5 text-xs text-white/80 hover:bg-white/10">OK</button>
          </span>
        ) : (
          <ToolbarButton icon={Link} isActive={editor.isActive('link')} onClick={() => setShowLinkInput(true)} title="Link" />
        )}
        {onImageUpload ? (
          <ToolbarButton icon={Image} isActive={false} onClick={onImageUpload} title="Insert image" />
        ) : null}
        <ToolbarButton icon={Table} isActive={false} onClick={handleAddTable} title="Insert table" />
      </div>

      <ToolbarDivider />

      <div className="flex items-center gap-0.5">
        <ToolbarButton icon={AlignLeft} isActive={editor.isActive({ textAlign: 'left' })} onClick={() => editor.chain().focus().setTextAlign('left').run()} title="Align left" />
        <ToolbarButton icon={AlignCenter} isActive={editor.isActive({ textAlign: 'center' })} onClick={() => editor.chain().focus().setTextAlign('center').run()} title="Align center" />
        <ToolbarButton icon={AlignRight} isActive={editor.isActive({ textAlign: 'right' })} onClick={() => editor.chain().focus().setTextAlign('right').run()} title="Align right" />
      </div>

      <ToolbarDivider />

      <div className="flex items-center gap-0.5">
        <ToolbarButton icon={Undo2} isActive={false} onClick={() => editor.chain().focus().undo().run()} title="Undo" />
        <ToolbarButton icon={Redo2} isActive={false} onClick={() => editor.chain().focus().redo().run()} title="Redo" />
      </div>
    </div>
  )
}
