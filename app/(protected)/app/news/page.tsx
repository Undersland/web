import { ListFilter, Search } from 'lucide-react'
import Link from 'next/link'

import CreateNewsForm from '@/components/create-news-form'
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer'
import { getByline, getNews, type NewsItem } from './data'

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
})

function formatDate(value: string) {
  const date = new Date(value)

  return Number.isNaN(date.getTime()) ? '—' : dateFormatter.format(date)
}

function filterNews(news: NewsItem[], query: string) {
  const normalizedQuery = query.trim().toLowerCase()

  if (!normalizedQuery) return news

  return news.filter(
    (item) =>
      item.title.toLowerCase().includes(normalizedQuery) ||
      item.slug.toLowerCase().includes(normalizedQuery) ||
      item.shortDescription.toLowerCase().includes(normalizedQuery),
  )
}

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const { q = '' } = await searchParams
  const news = await getNews()
  const filteredNews = filterNews(news, q)

  return (
    <section className="flex min-h-screen flex-col">
      <div className="mt-20 flex flex-1 flex-col sm:mt-28">
        <ul className="space-y-16 sm:space-y-20 pb-20">
          {filteredNews.map((item) => (
            <li key={item.id}>
              <Link href={`/app/news/${item.slug}`} className="block max-w-3xl">
                <article className="group inline-block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4">
                  <h2 className="text-[15px] font-medium leading-snug tracking-tight transition-opacity group-hover:opacity-65">
                    {item.title}
                  </h2>
                </article>

                <p className="mt-4 text-[11px] text-muted-foreground">
                  {getByline(item)}
                  <span className="px-3" aria-hidden="true">
                    •
                  </span>
                  <time dateTime={item.createdAt}>
                    {formatDate(item.createdAt)}
                  </time>
                </p>

                <p className="mt-7 max-w-3xl text-[13px] leading-relaxed text-muted-foreground">
                  {item.shortDescription}
                </p>
              </Link>
            </li>
          ))}
        </ul>

        {filteredNews.length === 0 && (
          <p className="text-[13px] text-muted-foreground">
            No news articles found for “{q}”.
          </p>
        )}

        <footer className="sticky bg-transparent bottom-0 z-10 mt-auto flex justify-center gap-1.5 py-2 pb-7 pt-5">
          <form
            className="relative min-w-0 max-w-xs flex-1"
            action="/app/news"
            method="get"
          >
            <label className="relative block">
              <span className="sr-only">Search news</span>
              <Search
                aria-hidden="true"
                strokeWidth={1.5}
                className="absolute left-3 top-1/2 size-6 -translate-y-1/2 text-muted-foreground"
              />
              <input
                type="search"
                name="q"
                defaultValue={q}
                placeholder="Search"
                className="h-12 w-full rounded-full border border-border bg-background pl-14 pr-14 text-[13px] outline-none transition-shadow placeholder:text-muted-foreground/70 focus-visible:border-zinc-800 focus-visible:ring-2 focus-visible:ring-ring dark:focus-visible:border-zinc-200"
              />
            </label>

            <Drawer swipeDirection="right">
              <DrawerTrigger
                type="button"
                aria-label="Open filters"
                className="absolute right-1 top-1/2 inline-flex size-10 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <ListFilter
                  aria-hidden="true"
                  className="size-4"
                  strokeWidth={1.9}
                />
              </DrawerTrigger>
              <DrawerContent className="my-auto mr-2 h-[min(100vh,calc(100vh-1rem))] w-[min(28rem,calc(100vw-2rem))] rounded-l-2xl border rounded-r-xl border-border bg-background">
                <div className="w-full px-6 py-8">
                  <DrawerTitle>Filters</DrawerTitle>
                  <DrawerDescription className="mt-2 text-[13px]">
                    Refine the news shown in the list.
                  </DrawerDescription>
                </div>
              </DrawerContent>
            </Drawer>
          </form>

          <Drawer swipeDirection="right">
            <DrawerTrigger className="inline-flex h-12 shrink-0 cursor-pointer items-center justify-center rounded-full bg-foreground px-6 text-[13px] font-semibold text-background transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
              CREATE
            </DrawerTrigger>
            <DrawerContent className="my-auto mr-2 h-[min(100vh,calc(100vh-1rem))] w-[min(32rem,calc(100vw-2rem))] rounded-2xl border border-border bg-background">
              <div className="min-h-0 flex-1 overflow-y-auto px-6 py-8">
                <DrawerTitle className="sr-only">Create article</DrawerTitle>
                <CreateNewsForm inDrawer />
              </div>
            </DrawerContent>
          </Drawer>
        </footer>
      </div>
    </section>
  )
}
