import * as Dialog from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import { cn } from '../../lib/utils'

function Sheet(props) {
  return <Dialog.Root data-slot="sheet" {...props} />
}

function SheetTrigger(props) {
  return <Dialog.Trigger data-slot="sheet-trigger" {...props} />
}

function SheetClose(props) {
  return <Dialog.Close data-slot="sheet-close" {...props} />
}

function SheetPortal(props) {
  return <Dialog.Portal data-slot="sheet-portal" {...props} />
}

function SheetOverlay({ className, ...props }) {
  return (
    <Dialog.Overlay
      data-slot="sheet-overlay"
      className={cn(
        'fixed inset-0 z-50 bg-black/70 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out',
        className,
      )}
      {...props}
    />
  )
}

function SheetContent({ className, children, side = 'left', ...props }) {
  return (
    <SheetPortal>
      <SheetOverlay />
      <Dialog.Content
        data-slot="sheet-content"
        className={cn(
          'fixed z-50 flex flex-col gap-4 border-white/10 bg-[#111111] p-5 text-[#f7f1e8] shadow-xl transition ease-in-out data-[state=open]:animate-in data-[state=closed]:animate-out',
          side === 'left' &&
            'inset-y-0 left-0 h-full w-[86vw] max-w-sm border-r data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left',
          side === 'right' &&
            'inset-y-0 right-0 h-full w-[86vw] max-w-sm border-l data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right',
          className,
        )}
        {...props}
      >
        {children}
        <Dialog.Close className="absolute top-4 right-4 rounded-full border border-white/12 p-2 text-white/65 transition hover:bg-white/8 hover:text-white">
          <X />
          <span className="sr-only">Close</span>
        </Dialog.Close>
      </Dialog.Content>
    </SheetPortal>
  )
}

function SheetHeader({ className, ...props }) {
  return <div data-slot="sheet-header" className={cn('space-y-1.5', className)} {...props} />
}

function SheetTitle(props) {
  return <Dialog.Title data-slot="sheet-title" {...props} />
}

function SheetDescription(props) {
  return <Dialog.Description data-slot="sheet-description" {...props} />
}

export {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetPortal,
  SheetTitle,
  SheetTrigger,
}
