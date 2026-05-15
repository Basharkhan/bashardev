import Image from '@tiptap/extension-image'
import { mergeAttributes } from '@tiptap/core'

export const FigureImageExtension = Image.extend({
  name: 'image',

  addAttributes() {
    return {
      ...this.parent?.(),
      caption: {
        default: '',
        parseHTML: (element) => element.getAttribute('data-caption') || '',
        renderHTML: (attributes) =>
          attributes.caption
            ? {
                'data-caption': attributes.caption,
              }
            : {},
      },
      display: {
        default: 'contained',
        parseHTML: (element) => element.getAttribute('data-display') || 'contained',
        renderHTML: (attributes) => ({
          'data-display': attributes.display || 'contained',
        }),
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'figure[data-type="editor-image"]',
        getAttrs: (element) => {
          const image = element.querySelector('img')
          const caption = element.querySelector('figcaption')

          if (!image) {
            return false
          }

          return {
            src: image.getAttribute('src'),
            alt: image.getAttribute('alt') || '',
            title: image.getAttribute('title') || '',
            caption: caption?.textContent?.trim() || element.getAttribute('data-caption') || '',
            display: element.getAttribute('data-display') || 'contained',
          }
        },
      },
      {
        tag: 'img[src]',
        getAttrs: (element) => ({
          src: element.getAttribute('src'),
          alt: element.getAttribute('alt') || '',
          title: element.getAttribute('title') || '',
          caption: element.getAttribute('data-caption') || '',
          display: element.getAttribute('data-display') || 'contained',
        }),
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    const { caption, display, ...imageAttributes } = HTMLAttributes

    return [
      'figure',
      mergeAttributes(this.options.HTMLAttributes, {
        'data-type': 'editor-image',
        'data-display': display || 'contained',
        'data-caption': caption || undefined,
      }),
      ['img', imageAttributes],
      ...(caption ? [['figcaption', caption]] : []),
    ]
  },

  addCommands() {
    return {
      ...this.parent?.(),
      updateImageAttributes:
        (attributes) =>
        ({ state, dispatch }) => {
          const { selection } = state

          if (selection.node?.type.name !== this.name) {
            return false
          }

          if (dispatch) {
            dispatch(
              state.tr.setNodeMarkup(selection.from, undefined, {
                ...selection.node.attrs,
                ...attributes,
              }),
            )
          }

          return true
        },
    }
  },
})
