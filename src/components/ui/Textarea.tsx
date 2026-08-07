import { forwardRef, type TextareaHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, id, ...props }, ref) => (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
          {label}
        </label>
      )}
      <textarea
        ref={ref}
        id={id}
        className={cn(
          'w-full px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800',
          'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100',
          'placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent',
          'transition-colors duration-200 resize-none min-h-[120px]',
          error && 'border-red-500 focus:ring-red-500/50',
          className
        )}
        {...props}
      />
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  )
)

Textarea.displayName = 'Textarea'
export default Textarea
