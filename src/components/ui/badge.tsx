import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center gap-1.5 rounded-[2px] border px-2 py-0.5 font-mono text-[10.5px] font-500 uppercase tracking-[0.1em] transition-colors',
  {
    variants: {
      variant: {
        default: 'border-graphite-200 bg-graphite-50 text-graphite-600',
        critical: 'border-status-critical/30 bg-status-critical-bg text-status-critical',
        warning: 'border-status-warning/30 bg-status-warning-bg text-status-warning',
        success: 'border-status-success/30 bg-status-success-bg text-status-success',
        info: 'border-status-info/25 bg-status-info-bg text-status-info',
        navy: 'border-navy-800/20 bg-navy-800/5 text-navy-800',
        outline: 'border-graphite-200 bg-transparent text-graphite-500',
        dark: 'border-white/15 bg-white/10 text-white/90',
      },
    },
    defaultVariants: { variant: 'default' },
  },
)

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }
