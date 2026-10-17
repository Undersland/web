import { HugeiconsIcon } from '@hugeicons/react'
import { SearchIcon } from '@hugeicons/core-free-icons'

import { News } from '@/components/news'
import { NewsModel } from '@/model/news'
import { Navigation } from '@/components/level-navigation'
import { cookies } from 'next/headers'
import type { ReactNode } from 'react'

const contentTabs = [
  { label: 'News', href: '/' },
  // { label: 'Books', href: '/books', disabled: true },
] as const

interface HomeProps {
  children: ReactNode
}

export default async function Home({ children }: HomeProps) {
  const cookieStore = await cookies()
  const news = await NewsModel.getAll(cookieStore.toString())
  const selectedTab = 'News'

  return (
    <div className="grid min-h-[calc(100dvh_-_56px)] mx-auto max-w-6xl content-start grid-cols-1 sm:min-h-[calc(100dvh_-_80px)] lg:h-[calc(100vh_-_80px)] lg:grid-cols-11 lg:content-normal">
      <main className="flex min-w-0 flex-col border-content-border pb-24 lg:col-span-6 lg:overflow-y-auto lg:border-r lg:pb-0">
        <div className="flex h-24 items-start px-5 pt-5 sm:px-10 lg:h-30 lg:pt-14">
          <h1 className="text-5xl font-semibold uppercase -tracking-wide sm:text-3xl">
            A living library for english learners
          </h1>
        </div>

        <Navigation.Root className="my-10 h-14 shrink-0 justify-end border-b-0 px-5 sm:justify-start sm:px-10">
          <Navigation.List
            className="hidden lg:block"
            aria-label="Content type"
          >
            {contentTabs.map((tab) => (
              <Navigation.Item
                key={tab.label}
                href={tab.href}
                active={selectedTab === tab.label}
              >
                {tab.label}
              </Navigation.Item>
            ))}
          </Navigation.List>
        </Navigation.Root>

        <div className="[&_a]:px-5 [&_a]:py-7 sm:[&_a]:px-10 sm:[&_a]:py-10">
          <News news={news} />
        </div>

        <form
          action=""
          className="group fixed inset-x-5 bottom-[max(1.5rem,env(safe-area-inset-bottom))] z-40 mx-auto flex h-14 min-h-14 max-h-14 max-w-[16rem] items-center gap-2.5 rounded-full border border-content-border bg-white/90 px-5 backdrop-blur-sm transition-colors sm:gap-5 lg:static lg:inset-auto lg:z-auto lg:mb-10 lg:mt-auto lg:w-full lg:flex-1 lg:bg-zinc-50 dark:bg-zinc-900/90 lg:dark:bg-zinc-900"
        >
          <HugeiconsIcon
            icon={SearchIcon}
            color="currentColor"
            strokeWidth={1.5}
            className="size-6 text-zinc-500 transition-colors group-focus-within:text-zinc-950 dark:text-zinc-400 dark:group-focus-within:text-white"
          />
          <input
            type="text"
            className="h-full w-full text-sm text-zinc-950 outline-none placeholder:text-zinc-400 dark:text-zinc-50 dark:placeholder:text-zinc-500"
            placeholder="Search"
          />
        </form>
      </main>

      <div className="lg:col-span-5 w-full">{children}</div>
    </div>
  )
}
