import Image from '@tiptap/extension-image'
import { ReactNodeViewRenderer } from '@tiptap/react'
import ResizableImage from './ResizableImage'

export const CustomImage = Image.extend({
  addOptions() {
    return {
      ...this.parent?.(),
      inline: false,
      allowBase64: true,
      HTMLAttributes: {},
      resize: false,
    }
  },
  addAttributes() {
    return {
      ...this.parent?.(),
      width: {
        default: null,
        parseHTML: element => {
          const w = element.style.width || element.getAttribute('width')
          return w ? parseInt(w, 10) : null
        },
      },
      height: {
        default: null,
        parseHTML: element => {
          const h = element.style.height || element.getAttribute('height')
          return h ? parseInt(h, 10) : null
        },
      },
      align: {
        default: 'center',
        parseHTML: element => element.getAttribute('data-align') || 'center',
      },
    }
  },
  renderHTML({ HTMLAttributes }) {
    const { align, width, height, ...rest } = HTMLAttributes

    let style = ''
    if (width) style += `width: ${width}px; `
    if (height) style += `height: ${height}px; `
    
    if (align === 'center') {
      style += 'display: block; margin-left: auto; margin-right: auto; '
    } else if (align === 'left') {
      style += 'float: left; margin-right: 1rem; '
    } else if (align === 'right') {
      style += 'float: right; margin-left: 1rem; '
    }

    return ['img', { ...rest, style, 'data-align': align }]
  },
  addNodeView() {
    return ReactNodeViewRenderer(ResizableImage)
  },
})
