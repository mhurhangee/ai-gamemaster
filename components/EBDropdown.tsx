'use client'

import * as React from "react"
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu"

import { cn } from "@/lib/utils"

const EBDropdown = DropdownMenuPrimitive.Root

const EBDropdownTrigger = DropdownMenuPrimitive.Trigger

const EBDropdownContent = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Content>
>(({ className, sideOffset = 4, ...props }, ref) => (
  <DropdownMenuPrimitive.Portal>
    <DropdownMenuPrimitive.Content
      ref={ref}
      sideOffset={sideOffset}
      className={cn("eb-dropdown-content", className)}
      {...props}
    />
  </DropdownMenuPrimitive.Portal>
))
EBDropdownContent.displayName = DropdownMenuPrimitive.Content.displayName

const EBDropdownItem = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Item> & {
    inset?: boolean
  }
>(({ className, inset, ...props }, ref) => (
  <DropdownMenuPrimitive.Item
    ref={ref}
    className={cn(inset && "pl-8", className)}
    {...props}
  />
))
EBDropdownItem.displayName = DropdownMenuPrimitive.Item.displayName

const EBDropdownLabel = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Label> & {
    inset?: boolean
  }
>(({ className, inset, ...props }, ref) => (
  <DropdownMenuPrimitive.Label
    ref={ref}
    className={cn(
      "px-2 py-1.5 text-sm font-semibold",
      inset && "pl-8",
      className
    )}
    {...props}
  />
))
EBDropdownLabel.displayName = DropdownMenuPrimitive.Label.displayName

const EBDropdownSeparator = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <DropdownMenuPrimitive.Separator
    ref={ref}
    className={cn("-mx-1 my-1 h-px bg-primary", className)}
    {...props}
  />
))
EBDropdownSeparator.displayName = DropdownMenuPrimitive.Separator.displayName

export {
  EBDropdown,
  EBDropdownTrigger,
  EBDropdownContent,
  EBDropdownItem,
  EBDropdownLabel,
  EBDropdownSeparator,
}