import { Header } from '@/components/header'

export default function PagesLayout({ children }: LayoutProps<'/'>) {
  return (
    <div className="flex h-dvh flex-col overflow-hidden">
      <Header />
      <main className="min-h-0 flex-1 overflow-y-auto">{children}</main>
    </div>
  )
}
