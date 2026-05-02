import { cn } from '../../lib/utils'

function Input({ className, ...props }) {
  return (
    <input
      data-slot="input"
      className={cn(
        'flex h-12 w-full rounded-2xl border border-white/12 bg-white/6 px-4 text-sm text-white outline-none transition',
        'placeholder:text-white/30 focus:border-[#d9c8b0] focus:bg-white/8',
        'disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...props}
    />
  )
}

export { Input }
