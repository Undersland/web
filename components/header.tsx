import { Logo } from './logo'

export function Header() {
  return (
    <header className="border-content-border flex h-14 w-full shrink-0 items-center justify-between border-b-0 pl-2.5 pr-5 sm:h-20 sm:pl-5 sm:pr-8 lg:border-b">
      <Logo className="size-10" />
    </header>
  )
}
