import { Slot } from '@radix-ui/react-slot'
import { cva } from 'class-variance-authority'
import { cn } from '../../lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-medium transition-colors outline-none disabled:pointer-events-none disabled:opacity-60 [&_svg]:pointer-events-none [&_svg]:size-4 shrink-0',
  {
    variants: {
      variant: {
        default: 'bg-[#f5efe3] text-[#111111] hover:bg-white',
        secondary: 'border border-white/12 bg-white/6 text-white/80 hover:bg-white/10',
        ghost: 'text-white/75 hover:bg-white/8',
        danger: 'border border-[#8b452c]/40 text-[#f7b39c] hover:bg-[#8b452c]/10',
      },
      size: {
        default: 'px-5 py-3',
        sm: 'px-4 py-2 text-xs',
        icon: 'size-10 rounded-full',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}) {
  const Comp = asChild ? Slot : 'button'

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button }
