import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const infoBoxVariants = cva(
  'flex items-start gap-2 rounded-lg border p-3',
  {
    variants: {
      variant: {
        info: 'bg-blue-50 border-blue-200 text-blue-800',
        success: 'bg-green-50 border-green-200 text-green-800',
        warning: 'bg-amber-50 border-amber-200 text-amber-800',
        error: 'bg-red-50 border-red-200 text-red-800',
      },
    },
    defaultVariants: {
      variant: 'info',
    },
  }
);

const iconVariants = cva(
  'w-4 h-4 mt-0.5 flex-shrink-0',
  {
    variants: {
      variant: {
        info: 'text-blue-600',
        success: 'text-green-600',
        warning: 'text-amber-600',
        error: 'text-red-600',
      },
    },
    defaultVariants: {
      variant: 'info',
    },
  }
);

export interface InfoBoxProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof infoBoxVariants> {
  title: string;
  icon?: React.ReactNode;
}

const InfoBox = React.forwardRef<HTMLDivElement, InfoBoxProps>(
  ({ className, variant, title, icon, children, ...props }, ref) => {
    return (
      <div
        className={cn(infoBoxVariants({ variant }), className)}
        ref={ref}
        {...props}
      >
        {icon && (
          <div className={cn(iconVariants({ variant }))}>
            {icon}
          </div>
        )}
        <div className="text-sm">
          <div className="font-medium mb-1">{title}</div>
          {children}
        </div>
      </div>
    );
  }
);

InfoBox.displayName = 'InfoBox';

export { InfoBox };
