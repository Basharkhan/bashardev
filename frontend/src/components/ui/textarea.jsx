import { cn } from '../../lib/utils'

function Textarea({ className, ...props }) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        'flex min-h-24 w-full rounded-[24px] border border-white/12 bg-white/6 px-4 py-3 text-sm text-white outline-none transition',
        'placeholder:text-white/30 focus:border-[#d9c8b0] focus:bg-white/8',
        'disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...props}
    />
  )
}

export { Textarea }
