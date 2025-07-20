import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const infoButtonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary: "bg-blue-100 text-blue-700 hover:bg-blue-200",
        secondary: "bg-green-200 text-green-800 hover:bg-green-300",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
      },
      size: {
        sm: "h-8 rounded-md px-2 py-1.5 text-xs sm:px-2 sm:py-1",
        default: "h-9 px-3 py-1.5 text-sm sm:px-3 sm:py-1",
        lg: "h-11 rounded-md px-8 text-base",
      },
    },
    defaultVariants: {
      variant: "secondary",
      size: "sm",
    },
  }
)

export interface InfoButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof infoButtonVariants> {
  asChild?: boolean
}

const InfoButton = React.forwardRef<HTMLButtonElement, InfoButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(infoButtonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
InfoButton.displayName = "InfoButton"

export { InfoButton, infoButtonVariants } 