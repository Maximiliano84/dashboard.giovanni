import * as React from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { X } from "lucide-react"

import { cn } from "../../lib/utils"

const Dialog = DialogPrimitive.Root
const DialogTrigger = DialogPrimitive.Trigger
const DialogPortal = DialogPrimitive.Portal
const DialogClose = DialogPrimitive.Close

// 🔥 OVERLAY MEJORADO (ANTES bg-black/80)
const DialogOverlay = React.forwardRef(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-50 bg-black/30 backdrop-blur-sm",
      "data-[state=open]:animate-in data-[state=open]:fade-in-0",
      "data-[state=closed]:animate-out data-[state=closed]:fade-out-0",
      className
    )}
    {...props}
  />
))
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName

// 🔥 MODAL NIVEL APP
const DialogContent = React.forwardRef(({ className, children, ...props }, ref) => (
  <DialogPortal>
    <DialogOverlay />

    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        "fixed left-1/2 top-1/2 z-50 w-full max-w-md",
        "-translate-x-1/2 -translate-y-1/2",
        "!bg-white text-black rounded-2xl border shadow-2xl",
        "p-6 space-y-4",
        className
      )}
      {...props}
    >
      {children}

      {/* 🔥 botón cerrar */}
      <DialogPrimitive.Close className="absolute right-4 top-4 p-1 rounded-md hover:bg-stone-100 transition">
        <X className="w-4 h-4 text-stone-500" />
        <span className="sr-only">Close</span>
      </DialogPrimitive.Close>
    </DialogPrimitive.Content>
  </DialogPortal>
))
DialogContent.displayName = DialogPrimitive.Content.displayName

// 🔥 HEADER LIMPIO
const DialogHeader = ({ className, ...props }) => (
  <div className={cn("space-y-1 text-left", className)} {...props} />
)
DialogHeader.displayName = "DialogHeader"

// 🔥 FOOTER
const DialogFooter = ({ className, ...props }) => (
  <div className={cn("flex justify-end gap-2 pt-4", className)} {...props} />
)
DialogFooter.displayName = "DialogFooter"

// 🔥 TITLE
const DialogTitle = React.forwardRef(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn("text-lg font-semibold text-stone-900", className)}
    {...props}
  />
))
DialogTitle.displayName = DialogPrimitive.Title.displayName

// 🔥 DESCRIPTION
const DialogDescription = React.forwardRef(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn("text-sm text-stone-500", className)}
    {...props}
  />
))
DialogDescription.displayName = DialogPrimitive.Description.displayName

export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogTrigger,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
}