import * as React from 'react'
import { cn } from '@/lib/utils'

interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  name: string
  size?: 'sm' | 'md' | 'lg'
  tone?: 'navy' | 'light'
}

const sizes = { sm: 'h-7 w-7 text-[10px]', md: 'h-9 w-9 text-[11px]', lg: 'h-12 w-12 text-[14px]' }

/** Avatar com iniciais — a equipe da obra não tem foto no sistema. */
export function Avatar({ name, size = 'md', tone = 'navy', className, ...props }: AvatarProps) {
  const initials = name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0])
    .join('')
    .toUpperCase()

  return (
    <div
      className={cn(
        'flex shrink-0 items-center justify-center rounded-[3px] font-mono font-600 tracking-tight',
        tone === 'navy' ? 'bg-navy-800 text-technical-300' : 'bg-technical-100 text-technical-700',
        sizes[size],
        className,
      )}
      aria-hidden
      {...props}
    >
      {initials}
    </div>
  )
}
