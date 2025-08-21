import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const infoLabelVariants = cva(
  'inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 whitespace-nowrap',
  {
    variants: {
      variant: {
        default:
          'border-transparent bg-primary text-primary-foreground hover:bg-primary/80',
        secondary:
          'border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80',
        success: 'border-transparent bg-green-100 text-green-700',
        info: 'border-transparent bg-blue-100 text-blue-700',
        warning: 'border-transparent bg-yellow-100 text-yellow-700',
        destructive:
          'border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80',
        outline: 'text-foreground',
      },
      size: {
        sm: 'text-xs px-2 py-0.5',
        default: 'text-sm px-2.5 py-0.5',
        lg: 'text-sm px-3 py-1',
      },
    },
    defaultVariants: {
      variant: 'success',
      size: 'default',
    },
  }
);

interface InfoLabelProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof infoLabelVariants> {}

const InfoLabel = React.forwardRef<HTMLSpanElement, InfoLabelProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <span
        className={cn(infoLabelVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
InfoLabel.displayName = 'InfoLabel';

export { InfoLabel };
