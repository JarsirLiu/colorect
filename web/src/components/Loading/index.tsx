import { memo } from 'react'

interface LoadingProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export const Loading = memo(function Loading({ size = 'md', className }: LoadingProps) {
  const sizeStyles = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  }
  
  return (
    <div className={className}>
      <div className={`animate-spin rounded-full border-2 border-gray-300 border-t-purple-600 ${sizeStyles[size]}`} />
    </div>
  )
})
