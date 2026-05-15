import { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import { BubbleMenu, FloatingMenu } from '@tiptap/react/menus'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import Link from '@tiptap/extension-link'
import { Table } from '@tiptap/extension-table'
import TableRow from '@tiptap/extension-table-row'
import TableCell from '@tiptap/extension-table-cell'
import TableHeader from '@tiptap/extension-table-header'
import TextAlign from '@tiptap/extension-text-align'
import Placeholder from '@tiptap/extension-placeholder'
import Highlight from '@tiptap/extension-highlight'
import TaskList from '@tiptap/extension-task-list'
import TaskItem from '@tiptap/extension-task-item'
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight'
import HorizontalRule from '@tiptap/extension-horizontal-rule'
import BubbleMenuExtension from '@tiptap/extension-bubble-menu'
import FloatingMenuExtension from '@tiptap/extension-floating-menu'
import { common, createLowlight } from 'lowlight'
import { EditorToolbar } from './EditorToolbar'
import { FigureImageExtension } from './FigureImageExtension'
import { cn } from '../../lib/utils'

const lowlight = createLowlight(common)

function getSlashCommandState(editor) {
  const { from, empty, $from } = editor.state.selection

  if (!empty || !$from.parent.isTextblock) {
    return null
  }

  const textBefore = $from.parent.textBetween(0, $from.parentOffset, '\0', '\0')
  const match = textBefore.match(/(?:^|\s)\/([a-z-]*)$/i)

  if (!match) {
    return null
  }

  return {
    query: match[1].toLowerCase(),
    range: {
      from: from - (match[1].length + 1),
      to: from,
    },
  }
}

export const RichTextEditor = forwardRef(function RichTextEditor(
  { content, onChange, onBlur, className, placeholder = 'Start writing...', editable = true, onImageUpload, onReplaceImage },
  ref
) {
  const [selectedSlashIndex, setSelectedSlashIndex] = useState(0)
  const [selectedImage, setSelectedImage] = useState(null)
  const [imageCaptionDraft, setImageCaptionDraft] = useState('')
  const selectedSlashIndexRef = useRef(0)
  const slashCommandsRef = useRef([])

  useEffect(() => {
    selectedSlashIndexRef.current = selectedSlashIndex
  }, [selectedSlashIndex])

  const slashCommands = useMemo(
    () => [
      {
        id: 'heading',
        label: 'Heading',
        description: 'Large section heading',
        matches: ['heading', 'h2', 'title'],
        run: (editorInstance) => editorInstance.chain().focus().toggleHeading({ level: 2 }).run(),
      },
      {
        id: 'bullet-list',
        label: 'Bullet list',
        description: 'Start a simple list',
        matches: ['list', 'bullet', 'ul'],
        run: (editorInstance) => editorInstance.chain().focus().toggleBulletList().run(),
      },
      {
        id: 'quote',
        label: 'Quote',
        description: 'Insert a blockquote',
        matches: ['quote', 'blockquote', 'pullquote'],
        run: (editorInstance) => editorInstance.chain().focus().toggleBlockquote().run(),
      },
      {
        id: 'code',
        label: 'Code block',
        description: 'Insert formatted code',
        matches: ['code', 'snippet', 'pre'],
        run: (editorInstance) => editorInstance.chain().focus().toggleCodeBlock().run(),
      },
      {
        id: 'divider',
        label: 'Divider',
        description: 'Insert a horizontal rule',
        matches: ['divider', 'rule', 'hr'],
        run: (editorInstance) => editorInstance.chain().focus().setHorizontalRule().run(),
      },
      {
        id: 'image',
        label: 'Image',
        description: 'Open the media browser',
        matches: ['image', 'photo', 'media', 'asset'],
        run: (editorInstance) => {
          onImageUpload?.()
          editorInstance.chain().focus().run()
        },
      },
    ],
    [onImageUpload],
  )

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3, 4, 5, 6] },
        codeBlock: false,
      }),
      Underline,
      Link.configure({
        openOnClick: true,
        autolink: true,
        defaultProtocol: 'https',
      }),
      FigureImageExtension.configure({
        inline: false,
        allowBase64: false,
      }),
      Table.configure({ resizable: true }),
      TableRow,
      TableCell,
      TableHeader,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Placeholder.configure({ placeholder }),
      Highlight,
      TaskList,
      TaskItem.configure({ nested: true }),
      CodeBlockLowlight.configure({ lowlight }),
      HorizontalRule,
      BubbleMenuExtension,
      FloatingMenuExtension,
    ],
    content,
    editable,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
    editorProps: {
      handleDOMEvents: {
        blur: () => {
          onBlur?.()
          return false
        },
        keydown: (_view, event) => {
          const slashState = getSlashCommandState(editor)

          if (!slashState || slashCommandsRef.current.length === 0) {
            if (event.key === 'Escape') {
              setSelectedSlashIndex(0)
            }

            return false
          }

          if (event.key === 'ArrowDown') {
            event.preventDefault()
            setSelectedSlashIndex((current) => (current + 1) % slashCommandsRef.current.length)
            return true
          }

          if (event.key === 'ArrowUp') {
            event.preventDefault()
            setSelectedSlashIndex((current) =>
              current === 0 ? slashCommandsRef.current.length - 1 : current - 1,
            )
            return true
          }

          if (event.key === 'Enter') {
            event.preventDefault()
            const nextCommand = slashCommandsRef.current[selectedSlashIndexRef.current]

            if (!nextCommand) {
              return true
            }

            editor.chain().focus().deleteRange(slashState.range).run()
            nextCommand.run(editor)
            setSelectedSlashIndex(0)
            return true
          }

          if (event.key === 'Escape') {
            event.preventDefault()
            setSelectedSlashIndex(0)
            return true
          }

          return false
        },
      },
    },
  })

  useEffect(() => {
    if (!editor) {
      return undefined
    }

    function syncSelectedImage() {
      const imageNode = editor.state.selection.node?.type.name === 'image' ? editor.state.selection.node : null
      setSelectedImage(imageNode ? imageNode.attrs : null)
      setImageCaptionDraft(imageNode?.attrs.caption || '')
    }

    syncSelectedImage()
    editor.on('selectionUpdate', syncSelectedImage)
    editor.on('update', syncSelectedImage)

    return () => {
      editor.off('selectionUpdate', syncSelectedImage)
      editor.off('update', syncSelectedImage)
    }
  }, [editor])

  const filteredSlashCommands = useMemo(() => {
    if (!editor) {
      return []
    }

    const slashState = getSlashCommandState(editor)

    if (!slashState) {
      return []
    }

    if (!slashState.query) {
      return slashCommands
    }

    return slashCommands.filter((command) =>
      [command.label.toLowerCase(), ...command.matches].some((term) => term.includes(slashState.query)),
    )
  }, [editor, slashCommands])

  useEffect(() => {
    slashCommandsRef.current = filteredSlashCommands

    if (filteredSlashCommands.length === 0) {
      setSelectedSlashIndex(0)
      return
    }

    setSelectedSlashIndex((current) => Math.min(current, filteredSlashCommands.length - 1))
  }, [filteredSlashCommands])

  const insertImage = useCallback(
    (src, alt) => {
      editor?.chain().focus().setImage({ src, alt: alt || '', caption: '', display: 'contained' }).run()
    },
    [editor],
  )

  const replaceSelectedImage = useCallback(
    (src, alt) => {
      if (!editor) {
        return
      }

      if (editor.state.selection.node?.type.name === 'image') {
        editor.chain().focus().updateImageAttributes({ src, alt: alt || '', title: alt || '' }).run()
        return
      }

      editor.chain().focus().setImage({ src, alt: alt || '', caption: '', display: 'contained' }).run()
    },
    [editor],
  )

  const removeSelectedImage = useCallback(() => {
    if (editor?.state.selection.node?.type.name === 'image') {
      editor.chain().focus().deleteSelection().run()
    }
  }, [editor])

  const updateSelectedImageCaption = useCallback(() => {
    editor?.chain().focus().updateImageAttributes({ caption: imageCaptionDraft }).run()
  }, [editor, imageCaptionDraft])

  const updateSelectedImageDisplay = useCallback(
    (display) => {
      editor?.chain().focus().updateImageAttributes({ display }).run()
    },
    [editor],
  )

  useImperativeHandle(
    ref,
    () => ({
      insertImage,
      replaceSelectedImage,
      removeSelectedImage,
      getEditor: () => editor,
    }),
    [insertImage, replaceSelectedImage, removeSelectedImage, editor],
  )

  if (!editor) {
    return (
      <div className="flex items-center justify-center rounded-2xl border border-white/12 bg-[#0b0b0b] px-4 py-16 text-white/40">
        Loading editor...
      </div>
    )
  }

  return (
    <div
      className={cn(
        'rich-editor overflow-hidden rounded-[30px] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.035),rgba(255,255,255,0.015))] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]',
        className,
      )}
    >
      <BubbleMenu
        editor={editor}
        options={{ placement: 'top', offset: 10 }}
        shouldShow={({ editor: currentEditor, state }) => {
          const { empty } = state.selection
          return !empty && currentEditor.isEditable
        }}
        className="flex items-center gap-1 rounded-full border border-white/10 bg-[#111111]/95 p-1 shadow-[0_18px_40px_rgba(0,0,0,0.3)] backdrop-blur"
      >
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={cn(
            'rounded-full px-3 py-1.5 text-xs font-medium transition',
            editor.isActive('bold') ? 'bg-[#f5efe3] text-[#111111]' : 'text-white/72 hover:bg-white/8 hover:text-white',
          )}
        >
          Bold
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={cn(
            'rounded-full px-3 py-1.5 text-xs font-medium transition',
            editor.isActive('italic') ? 'bg-[#f5efe3] text-[#111111]' : 'text-white/72 hover:bg-white/8 hover:text-white',
          )}
        >
          Italic
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleCode().run()}
          className={cn(
            'rounded-full px-3 py-1.5 text-xs font-medium transition',
            editor.isActive('code') ? 'bg-[#f5efe3] text-[#111111]' : 'text-white/72 hover:bg-white/8 hover:text-white',
          )}
        >
          Code
        </button>
        <button
          type="button"
          onClick={() => {
            const previousUrl = editor.getAttributes('link').href ?? ''
            const nextUrl = window.prompt('Link URL', previousUrl)

            if (nextUrl === null) {
              return
            }

            if (!nextUrl.trim()) {
              editor.chain().focus().unsetLink().run()
              return
            }

            const href = nextUrl.startsWith('http') ? nextUrl : `https://${nextUrl}`
            editor.chain().focus().extendMarkRange('link').setLink({ href }).run()
          }}
          className={cn(
            'rounded-full px-3 py-1.5 text-xs font-medium transition',
            editor.isActive('link') ? 'bg-[#f5efe3] text-[#111111]' : 'text-white/72 hover:bg-white/8 hover:text-white',
          )}
        >
          Link
        </button>
      </BubbleMenu>
      <BubbleMenu
        editor={editor}
        options={{ placement: 'top', offset: 10 }}
        shouldShow={({ state }) => state.selection.node?.type.name === 'image'}
        className="w-[360px] rounded-[24px] border border-white/10 bg-[#111111]/97 p-3 shadow-[0_18px_40px_rgba(0,0,0,0.32)] backdrop-blur"
      >
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs uppercase tracking-[0.18em] text-white/40">Image block</p>
            <div className="flex items-center gap-1 rounded-full border border-white/10 bg-white/4 p-1">
              <button
                type="button"
                onClick={() => updateSelectedImageDisplay('contained')}
                className={cn(
                  'rounded-full px-3 py-1.5 text-xs font-medium transition',
                  selectedImage?.display === 'contained'
                    ? 'bg-[#f5efe3] text-[#111111]'
                    : 'text-white/70 hover:bg-white/8 hover:text-white',
                )}
              >
                Contained
              </button>
              <button
                type="button"
                onClick={() => updateSelectedImageDisplay('wide')}
                className={cn(
                  'rounded-full px-3 py-1.5 text-xs font-medium transition',
                  selectedImage?.display === 'wide'
                    ? 'bg-[#f5efe3] text-[#111111]'
                    : 'text-white/70 hover:bg-white/8 hover:text-white',
                )}
              >
                Wide
              </button>
            </div>
          </div>

          <label className="block space-y-2">
            <span className="text-xs uppercase tracking-[0.18em] text-white/40">Caption</span>
            <input
              type="text"
              value={imageCaptionDraft}
              onChange={(event) => setImageCaptionDraft(event.target.value)}
              onBlur={updateSelectedImageCaption}
              placeholder="Add a caption"
              className="w-full rounded-2xl border border-white/10 bg-white/4 px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/28 focus:border-white/24"
            />
          </label>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => {
                onReplaceImage?.()
              }}
              className="rounded-full border border-white/10 px-4 py-2 text-sm text-white/75 transition hover:bg-white/8 hover:text-white"
            >
              Replace image
            </button>
            <button
              type="button"
              onClick={removeSelectedImage}
              className="rounded-full border border-[#8b452c]/40 px-4 py-2 text-sm text-[#f7b39c] transition hover:bg-[#8b452c]/10"
            >
              Remove image
            </button>
          </div>
        </div>
      </BubbleMenu>
      <FloatingMenu
        editor={editor}
        options={{ placement: 'bottom-start', offset: 10 }}
        shouldShow={({ editor: currentEditor }) =>
          currentEditor.isEditable && getSlashCommandState(currentEditor) !== null && filteredSlashCommands.length > 0
        }
        className="w-[320px] rounded-[24px] border border-white/10 bg-[#111111]/98 p-2 shadow-[0_24px_60px_rgba(0,0,0,0.35)] backdrop-blur"
      >
        <div className="border-b border-white/8 px-3 py-2">
          <p className="text-xs uppercase tracking-[0.18em] text-white/40">Slash commands</p>
        </div>
        <div className="grid gap-1 p-1">
          {filteredSlashCommands.map((command, index) => (
            <button
              key={command.id}
              type="button"
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => {
                const slashState = getSlashCommandState(editor)

                if (!slashState) {
                  return
                }

                editor.chain().focus().deleteRange(slashState.range).run()
                command.run(editor)
                setSelectedSlashIndex(0)
              }}
              className={cn(
                'flex items-start justify-between gap-3 rounded-[18px] px-3 py-2 text-left transition',
                index === selectedSlashIndex ? 'bg-[#f5efe3] text-[#111111]' : 'text-white/75 hover:bg-white/8 hover:text-white',
              )}
            >
              <span className="min-w-0">
                <span className="block text-sm font-medium">{command.label}</span>
                <span className={cn('mt-1 block text-xs', index === selectedSlashIndex ? 'text-[#4d473d]' : 'text-white/42')}>
                  {command.description}
                </span>
              </span>
              <span className={cn('shrink-0 rounded-full px-2 py-1 text-[10px] uppercase tracking-[0.16em]', index === selectedSlashIndex ? 'bg-black/8 text-[#4d473d]' : 'bg-white/6 text-white/35')}>
                Enter
              </span>
            </button>
          ))}
        </div>
      </FloatingMenu>
      <EditorToolbar editor={editor} onImageUpload={onImageUpload} />
      <EditorContent editor={editor} />
    </div>
  )
})
