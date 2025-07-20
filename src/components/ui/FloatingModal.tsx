import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const floatingModalVariants = cva(
  "absolute z-50 rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
  {
    variants: {
      size: {
        sm: "w-56 max-w-[calc(100vw-32px)]",
        default: "w-72 max-w-[calc(100vw-32px)]", 
        lg: "w-80 max-w-[calc(100vw-32px)]",
        xl: "w-96 max-w-[calc(100vw-32px)]",
      },
    },
    defaultVariants: {
      size: "default",
    },
  }
)

const floatingModalArrowVariants = cva(
  "absolute w-4 h-4 bg-popover border-l border-t border-border transform rotate-45",
  {
    variants: {
      side: {
        top: "-top-2",    // Arrow at top of modal (pointing up)
        bottom: "-bottom-2", // Arrow at bottom of modal (pointing down)
        left: "-left-2",     // Arrow at left of modal (pointing left) 
        right: "-right-2",   // Arrow at right of modal (pointing right)
      },
    },
    defaultVariants: {
      side: "top",
    },
  }
)

interface FloatingModalProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof floatingModalVariants> {
  isOpen: boolean
  onClose: () => void
  triggerRef: React.RefObject<HTMLElement>
  showArrow?: boolean
  side?: "top" | "bottom" | "left" | "right"
  align?: "start" | "center" | "end"
  sideOffset?: number
  alignOffset?: number
}

const FloatingModal = React.forwardRef<HTMLDivElement, FloatingModalProps>(
  ({ 
    className,
    size,
    isOpen, 
    onClose, 
    triggerRef,
    showArrow = true,
    side = "bottom",
    align = "end", 
    sideOffset = 16,
    alignOffset = 0,
    children,
    ...props 
  }, ref) => {
    const [position, setPosition] = React.useState({ top: 0, left: 0, right: 0 })
    const [arrowPosition, setArrowPosition] = React.useState(24)
    const [actualSide, setActualSide] = React.useState(side)
    const modalRef = React.useRef<HTMLDivElement>(null)

    const calculatePosition = React.useCallback(() => {
      if (!triggerRef.current) return

      const container = triggerRef.current.closest('.relative') || document.body
      const containerRect = container.getBoundingClientRect()
      const triggerRect = triggerRef.current.getBoundingClientRect()
      const modalWidth = size === 'sm' ? 224 : size === 'lg' ? 320 : size === 'xl' ? 384 : 288
      const screenPadding = 16

      // Calculate base positions
      let top = 0
      let left = 0 
      let right = 0
      let finalSide = side

      // Calculate position based on side preference
      if (side === 'bottom' || side === 'top') {
        // Vertical positioning
        if (side === 'bottom') {
          top = (triggerRect.bottom - containerRect.top) + sideOffset
        } else {
          top = (triggerRect.top - containerRect.top) - 200 - sideOffset // Approximate modal height
        }

        // Horizontal alignment
        if (align === 'end') {
          right = containerRect.right - triggerRect.right + alignOffset
        } else if (align === 'start') {
          left = triggerRect.left - containerRect.left + alignOffset  
        } else {
          // Center alignment
          left = (triggerRect.left + triggerRect.width / 2) - containerRect.left - (modalWidth / 2) + alignOffset
        }

        // Viewport boundary checks for horizontal
        let modalLeftEdge, modalRightEdge
        
        if (align === 'end') {
          // Right-based positioning - check if modal goes off edges
          modalRightEdge = containerRect.right - right
          modalLeftEdge = modalRightEdge - modalWidth
          
          if (modalRightEdge + screenPadding > window.innerWidth) {
            right = containerRect.right - (window.innerWidth - screenPadding)
          } else if (modalLeftEdge < screenPadding) {
            right = containerRect.right - (modalWidth + screenPadding)
          }
        } else {
          // Left-based positioning - check if modal goes off edges  
          modalLeftEdge = containerRect.left + left
          modalRightEdge = modalLeftEdge + modalWidth
          
          if (modalRightEdge + screenPadding > window.innerWidth) {
            left = window.innerWidth - modalWidth - screenPadding - containerRect.left
          } else if (modalLeftEdge < screenPadding) {
            left = screenPadding - containerRect.left
          }
        }

        // Check vertical boundaries and flip if needed
        const modalBottom = containerRect.top + top + 200 // Approximate height
        if (side === 'bottom' && modalBottom + screenPadding > window.innerHeight) {
          top = (triggerRect.top - containerRect.top) - 200 - sideOffset
          finalSide = 'top'
        }
      }

      // Calculate arrow position if showing arrow
      if (showArrow && (finalSide === 'bottom' || finalSide === 'top')) {
        const triggerCenter = triggerRect.left + triggerRect.width / 2
        let arrowOffsetFromModalRight = 0
        
        if (right > 0) {
          // Right-based positioning (like our "end" alignment)
          const modalRightEdge = containerRect.right - right
          arrowOffsetFromModalRight = modalRightEdge - triggerCenter
        } else if (left >= 0) {
          // Left-based positioning  
          const modalLeftEdge = containerRect.left + left
          const modalRightEdge = modalLeftEdge + modalWidth
          arrowOffsetFromModalRight = modalRightEdge - triggerCenter
        }

        const arrowWidth = 16
        const minOffset = arrowWidth / 2
        const maxOffset = modalWidth - arrowWidth - 8
        
        const clampedOffset = Math.max(minOffset, Math.min(arrowOffsetFromModalRight, maxOffset))
        setArrowPosition(clampedOffset)
      }

      setPosition({ top, left, right })
      setActualSide(finalSide)
    }, [triggerRef, size, side, align, sideOffset, alignOffset, showArrow])

    // Calculate position when modal opens
    React.useEffect(() => {
      if (isOpen) {
        const timeoutId = setTimeout(calculatePosition, 0)
        return () => clearTimeout(timeoutId)
      }
    }, [isOpen, calculatePosition])

    // Click outside to close
    React.useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (
          modalRef.current &&
          triggerRef.current &&
          !modalRef.current.contains(event.target as Node) &&
          !triggerRef.current.contains(event.target as Node)
        ) {
          onClose()
        }
      }

      if (isOpen) {
        document.addEventListener('mousedown', handleClickOutside)
      }

      return () => {
        document.removeEventListener('mousedown', handleClickOutside)
      }
    }, [isOpen, onClose, triggerRef])

    // Handle resize
    React.useEffect(() => {
      const handleResize = () => {
        if (isOpen) {
          calculatePosition()
        }
      }

      if (isOpen) {
        window.addEventListener('resize', handleResize)
      }

      return () => {
        window.removeEventListener('resize', handleResize)
      }
    }, [isOpen, calculatePosition])

    if (!isOpen) {
      return null
    }

    return (
      <div
        ref={modalRef}
        className={cn(floatingModalVariants({ size, className }))}
        style={{
          top: `${position.top}px`,
          ...(position.right > 0 
            ? { right: `${position.right}px` } 
            : { left: `${position.left}px` }
          ),
        }}
        data-state={isOpen ? "open" : "closed"}
        data-side={actualSide}
        {...props}
      >
        {children}
        
        {showArrow && (actualSide === 'bottom' || actualSide === 'top') && (
          <div
            className={cn(floatingModalArrowVariants({ side: actualSide === 'bottom' ? 'top' : 'bottom' }))}
            style={{ right: `${arrowPosition}px` }}
          />
        )}
      </div>
    )
  }
)

FloatingModal.displayName = "FloatingModal"

export { FloatingModal, floatingModalVariants } 