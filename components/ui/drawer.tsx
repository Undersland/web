'use client'

import { Drawer as DrawerPrimitive } from '@base-ui/react/drawer'
import * as React from 'react'

import { cn } from '@/lib/utils'

type DrawerContextValue = {
  modal: DrawerPrimitive.Root.Props['modal']
  showSwipeHandle: boolean
  swipeDirection: NonNullable<DrawerPrimitive.Root.Props['swipeDirection']>
}

const DrawerContext = React.createContext<DrawerContextValue | null>(null)

function useDrawer() {
  const context = React.useContext(DrawerContext)

  if (!context) throw new Error('Drawer components must be used within Drawer')

  return context
}

function Drawer({
  modal = true,
  showSwipeHandle = false,
  swipeDirection = 'down',
  ...props
}: DrawerPrimitive.Root.Props & { showSwipeHandle?: boolean }) {
  const contextValue = React.useMemo(
    () => ({ modal, showSwipeHandle, swipeDirection }),
    [modal, showSwipeHandle, swipeDirection],
  )

  return (
    <DrawerContext.Provider value={contextValue}>
      <DrawerPrimitive.Root
        data-slot="drawer"
        modal={modal}
        swipeDirection={swipeDirection}
        {...props}
      />
    </DrawerContext.Provider>
  )
}

function DrawerTrigger(props: DrawerPrimitive.Trigger.Props) {
  return <DrawerPrimitive.Trigger data-slot="drawer-trigger" {...props} />
}

function DrawerClose(props: DrawerPrimitive.Close.Props) {
  return <DrawerPrimitive.Close data-slot="drawer-close" {...props} />
}

function DrawerOverlay({
  className,
  ...props
}: DrawerPrimitive.Backdrop.Props) {
  return (
    <DrawerPrimitive.Backdrop
      className={cn(
        'fixed inset-0 z-50 min-h-dvh bg-transparent opacity-[calc(1-var(--drawer-swipe-progress))] backdrop-blur-sm transition-opacity duration-450 ease-[cubic-bezier(0.32,0.72,0,1)] data-ending-style:pointer-events-none data-ending-style:opacity-0 data-starting-style:opacity-0 data-swiping:duration-0 dark:bg-black/20 supports-[-webkit-touch-callout:none]:absolute',
        className,
      )}
      data-slot="drawer-overlay"
      {...props}
    />
  )
}

function DrawerContent({
  className,
  children,
  ...props
}: DrawerPrimitive.Popup.Props) {
  const { modal, showSwipeHandle, swipeDirection } = useDrawer()
  const swipeAxis =
    swipeDirection === 'down' || swipeDirection === 'up' ? 'y' : 'x'

  return (
    <DrawerPrimitive.Portal data-slot="drawer-portal">
      {modal === true && <DrawerOverlay />}
      <DrawerPrimitive.Viewport
        className="pointer-events-none fixed inset-0 z-50 select-none data-[modal=true]:pointer-events-auto"
        data-modal={modal}
        data-slot="drawer-viewport"
      >
        <DrawerPrimitive.Popup
          className={cn(
            'group/drawer-popup pointer-events-auto fixed z-50 flex max-h-[calc(100dvh-6rem)] min-h-0 flex-col overflow-hidden outline-none transition-[transform,height,opacity] duration-450 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform',
            'transform-[translate3d(var(--translate-x,0px),var(--translate-y,0px),0)] data-ending-style:transform-(--closed-transform) data-starting-style:transform-(--closed-transform) data-ending-style:duration-[calc(var(--drawer-swipe-strength)*400ms)]',
            'data-[swipe-axis=y]:inset-x-0 data-[swipe-direction=down]:bottom-0 data-[swipe-direction=up]:top-0',
            'data-[swipe-direction=down]:[--closed-transform:translate3d(0,calc(100%+2px),0)] data-[swipe-direction=down]:[--translate-y:var(--drawer-swipe-movement-y)]',
            'data-[swipe-direction=up]:[--closed-transform:translate3d(0,calc(-100%-2px),0)] data-[swipe-direction=up]:[--translate-y:var(--drawer-swipe-movement-y)]',
            'data-[swipe-axis=x]:inset-y-0 data-[swipe-axis=x]:max-h-none',
            'data-[swipe-direction=right]:right-0 data-[swipe-direction=right]:[--closed-transform:translate3d(calc(100%+2px),0,0)] data-[swipe-direction=right]:[--translate-x:var(--drawer-swipe-movement-x)]',
            'data-[swipe-direction=left]:left-0 data-[swipe-direction=left]:[--closed-transform:translate3d(calc(-100%-2px),0,0)] data-[swipe-direction=left]:[--translate-x:var(--drawer-swipe-movement-x)]',
            'data-swiping:duration-0',
            className,
          )}
          data-slot="drawer-popup"
          data-swipe-axis={swipeAxis}
          {...props}
        >
          {showSwipeHandle && (
            <div
              aria-hidden="true"
              className="mx-auto mt-3 h-1 w-10 shrink-0 rounded-full bg-zinc-700"
              data-slot="drawer-swipe-handle"
            />
          )}
          <DrawerPrimitive.Content
            className="flex min-h-0 flex-1 flex-col overflow-hidden overscroll-contain select-text"
            data-slot="drawer-content"
          >
            {children}
          </DrawerPrimitive.Content>
        </DrawerPrimitive.Popup>
      </DrawerPrimitive.Viewport>
    </DrawerPrimitive.Portal>
  )
}

function DrawerTitle({ className, ...props }: DrawerPrimitive.Title.Props) {
  return (
    <DrawerPrimitive.Title
      className={cn('font-semibold', className)}
      data-slot="drawer-title"
      {...props}
    />
  )
}

function DrawerDescription({
  className,
  ...props
}: DrawerPrimitive.Description.Props) {
  return (
    <DrawerPrimitive.Description
      className={cn('text-zinc-500', className)}
      data-slot="drawer-description"
      {...props}
    />
  )
}

export {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerOverlay,
  DrawerTitle,
  DrawerTrigger,
}
