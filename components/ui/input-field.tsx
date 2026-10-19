'use client'

import { type ComponentProps, createContext, useContext, useId } from 'react'
import { cn } from '@/lib/utils'

type InputFieldContextValue = {
  inputId: string
}

const InputFieldContext = createContext<InputFieldContextValue | null>(null)

function useInputField() {
  const context = useContext(InputFieldContext)

  if (!context) {
    throw new Error('InputField parts must be used inside InputField.Root')
  }

  return context
}

type RootProps = ComponentProps<'div'> & {
  id?: string
}

function Root({ children, className, id, ...props }: RootProps) {
  const generatedId = useId()
  const inputId = id ?? generatedId

  return (
    <InputFieldContext value={{ inputId }}>
      <div className={cn('flex w-full flex-col gap-2', className)} {...props}>
        {children}
      </div>
    </InputFieldContext>
  )
}

type LabelProps = Omit<ComponentProps<'label'>, 'htmlFor'>

function Label({ className, ...props }: LabelProps) {
  const { inputId } = useInputField()

  return (
    <label
      htmlFor={inputId}
      className={cn('text-sm font-medium', className)}
      {...props}
    />
  )
}

type ControlProps = Omit<ComponentProps<'input'>, 'id'>

function Control({ className, ...props }: ControlProps) {
  const { inputId } = useInputField()

  return (
    <input
      id={inputId}
      className={cn(
        'h-10 rounded-md border border-input -tracking-wider bg-background px-3 text-sm outline-none transition-shadow placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring',
        className,
      )}
      {...props}
    />
  )
}

const InputField = {
  Root,
  Label,
  Control,
}

export { InputField }
