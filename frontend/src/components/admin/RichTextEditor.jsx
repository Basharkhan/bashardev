import { forwardRef, useCallback, useImperativeHandle } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
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
import { common, createLowlight } from 'lowlight'
import { EditorToolbar } from './EditorToolbar'

const lowlight = createLowlight(common)

export const RichTextEditor = forwardRef(function RichTextEditor(
  { content, onChange, placeholder = 'Start writing...', editable = true, onImageUpload },
  ref
) {
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
      Image.configure({
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
    ],
    content,
    editable,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
  })

  const insertImage = useCallback(
    (src, alt) => {
      editor?.chain().focus().setImage({ src, alt: alt || '' }).run()
    },
    [editor]
  )

  useImperativeHandle(
    ref,
    () => ({
      insertImage,
      getEditor: () => editor,
    }),
    [insertImage, editor]
  )

  if (!editor) {
    return (
      <div className="flex items-center justify-center rounded-2xl border border-white/12 bg-[#0b0b0b] px-4 py-16 text-white/40">
        Loading editor...
      </div>
    )
  }

  return (
    <div className="rich-editor overflow-hidden rounded-2xl border border-white/12 bg-[#0b0b0b]">
      <EditorToolbar editor={editor} onImageUpload={onImageUpload} />
      <EditorContent editor={editor} />
    </div>
  )
})
