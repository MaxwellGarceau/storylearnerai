import * as React from 'react';
import { type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';
import { badgeVariants } from './badge-variants';

interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  as?: 'div' | 'span';
}

function Badge({ className, variant, as = 'div', ...props }: BadgeProps) {
  const Component = as;
  return (
    <Component className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge };
