import * as React from 'react'
import { cn } from '@/lib/utils'

const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type, ...props }, ref) => (
    <input
      type={type}
      ref={ref}
      className={cn(
        'flex h-9 w-full rounded-[3px] border border-graphite-200 bg-white px-3 py-1 text-sm text-graphite-900 transition-colors placeholder:text-graphite-400 focus-visible:border-technical-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-technical-400/25 disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...props}
    />
  ),
)
Input.displayName = 'Input'

const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        'flex min-h-[80px] w-full rounded-[3px] border border-graphite-200 bg-white px-3 py-2 text-sm text-graphite-900 transition-colors placeholder:text-graphite-400 focus-visible:border-technical-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-technical-400/25',
        className,
      )}
      {...props}
    />
  ),
)
Textarea.displayName = 'Textarea'

export { Input, Textarea }
