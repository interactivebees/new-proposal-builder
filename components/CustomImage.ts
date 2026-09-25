import Image from '@tiptap/extension-image'
import { ReactNodeViewRenderer } from '@tiptap/react'
import ResizableImage from './ResizableImage'

export const CustomImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      width: {
        default: null,
        parseHTML: element => {
          const w = element.style.width
          return w ? parseInt(w, 10) : null
        },
      },
      align: {
        default: 'center',
        parseHTML: element => element.getAttribute('data-align') || 'center',
      },
    }
  },
  renderHTML({ HTMLAttributes }) {
    const { align, width, ...rest } = HTMLAttributes

    let style = ''
    if (width) style += `width: ${width}px; `
    
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
