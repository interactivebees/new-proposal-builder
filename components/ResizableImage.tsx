import { NodeViewWrapper, NodeViewProps } from '@tiptap/react'
import { useRef, useCallback } from 'react'

type HandlePosition = 'nw' | 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w'

const HANDLE_CURSORS: Record<HandlePosition, string> = {
  nw: 'nwse-resize',
  n: 'ns-resize',
  ne: 'nesw-resize',
  e: 'ew-resize',
  se: 'nwse-resize',
  s: 'ns-resize',
  sw: 'nesw-resize',
  w: 'ew-resize',
}

const HANDLE_STYLES: Record<HandlePosition, React.CSSProperties> = {
  nw: { top: -4, left: -4 },
  n:  { top: -4, left: '50%', transform: 'translateX(-50%)' },
  ne: { top: -4, right: -4 },
  e:  { top: '50%', right: -4, transform: 'translateY(-50%)' },
  se: { bottom: -4, right: -4 },
  s:  { bottom: -4, left: '50%', transform: 'translateX(-50%)' },
  sw: { bottom: -4, left: -4 },
  w:  { top: '50%', left: -4, transform: 'translateY(-50%)' },
}

export default function ResizableImage(props: NodeViewProps) {
  const { node, updateAttributes, selected } = props
  const containerRef = useRef<HTMLDivElement>(null)

  const handleResize = useCallback((e: React.MouseEvent, position: HandlePosition) => {
    e.preventDefault()
    e.stopPropagation()

    const startX = e.pageX
    const startY = e.pageY
    const startWidth = containerRef.current?.offsetWidth || 200
    const startHeight = containerRef.current?.offsetHeight || 150
    const aspectRatio = startWidth / startHeight

    const isCorner = ['nw', 'ne', 'se', 'sw'].includes(position)

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const dx = moveEvent.pageX - startX
      const dy = moveEvent.pageY - startY

      let newWidth = startWidth
      let newHeight = startHeight

      switch (position) {
        case 'e':
          newWidth = startWidth + dx
          break
        case 'w':
          newWidth = startWidth - dx
          break
        case 's':
          newHeight = startHeight + dy
          newWidth = newHeight * aspectRatio
          break
        case 'n':
          newHeight = startHeight - dy
          newWidth = newHeight * aspectRatio
          break
        case 'se':
          newWidth = startWidth + dx
          newHeight = newWidth / aspectRatio
          break
        case 'sw':
          newWidth = startWidth - dx
          newHeight = newWidth / aspectRatio
          break
        case 'ne':
          newWidth = startWidth + dx
          newHeight = newWidth / aspectRatio
          break
        case 'nw':
          newWidth = startWidth - dx
          newHeight = newWidth / aspectRatio
          break
      }

      newWidth = Math.max(30, Math.round(newWidth))
      newHeight = Math.max(30, Math.round(newHeight))

      if (isCorner) {
        updateAttributes({ width: newWidth })
      } else if (position === 'e' || position === 'w') {
        updateAttributes({ width: newWidth })
      } else {
        updateAttributes({ width: newWidth })
      }
    }

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }

    document.body.style.cursor = HANDLE_CURSORS[position]
    document.body.style.userSelect = 'none'
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }, [updateAttributes])

  const align = node.attrs.align || 'center'
  let wrapperClass = 'flex justify-center'
  if (align === 'left') wrapperClass = ''
  if (align === 'right') wrapperClass = 'flex justify-end'

  return (
    <NodeViewWrapper
      className={`relative ${wrapperClass} my-2`}
      style={{ width: '100%', clear: 'both' }}
    >
      <div
        ref={containerRef}
        className="relative inline-block group"
        style={{ width: node.attrs.width ? `${node.attrs.width}px` : 'auto' }}
      >
        <img
          src={node.attrs.src}
          alt={node.attrs.alt}
          draggable={false}
          className="max-w-full select-none"
          style={{
            width: '100%',
            height: 'auto',
            outline: selected ? '2px solid #2563eb' : 'none',
            outlineOffset: '1px',
          }}
        />

        {selected && (
          <>
            {/* Border overlay */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                border: '1px dashed #2563eb',
              }}
            />

            {/* 8 resize handles */}
            {(Object.keys(HANDLE_STYLES) as HandlePosition[]).map((pos) => (
              <div
                key={pos}
                onMouseDown={(e) => handleResize(e, pos)}
                style={{
                  position: 'absolute',
                  width: 8,
                  height: 8,
                  backgroundColor: '#2563eb',
                  border: '1px solid white',
                  cursor: HANDLE_CURSORS[pos],
                  zIndex: 50,
                  boxShadow: '0 0 2px rgba(0,0,0,0.3)',
                  ...HANDLE_STYLES[pos],
                }}
              />
            ))}
          </>
        )}
      </div>
    </NodeViewWrapper>
  )
}
