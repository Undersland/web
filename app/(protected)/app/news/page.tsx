import Link from 'next/link'
import { CalendarDays, ChevronDown, ListFilter, Search } from 'lucide-react'

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'

type NewsItem = {
  id: string
  title: string
  shortDescription: string
  slug: string
  createdAt: string
}

type NewsResponse = {
  data: {
    content: NewsItem[]
  }
  error: unknown
}

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  dateStyle: 'medium',
  timeStyle: 'short',
})

function formatDate(value: string) {
  const date = new Date(value)

  return Number.isNaN(date.getTime()) ? '—' : dateFormatter.format(date)
}

function countArticlesSince(news: NewsItem[], days: number) {
  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000

  return news.filter((item) => {
    const createdAt = new Date(item.createdAt).getTime()

    return !Number.isNaN(createdAt) && createdAt >= cutoff
  }).length
}

function filterNews(news: NewsItem[], query: string, period: string) {
  const normalizedQuery = query.trim().toLowerCase()
  const days = Number(period)
  const cutoff = Number.isFinite(days)
    ? Date.now() - days * 24 * 60 * 60 * 1000
    : null

  return news.filter((item) => {
    const matchesQuery =
      !normalizedQuery ||
      item.title.toLowerCase().includes(normalizedQuery) ||
      item.slug.toLowerCase().includes(normalizedQuery) ||
      item.shortDescription.toLowerCase().includes(normalizedQuery)
    const createdAt = new Date(item.createdAt).getTime()
    const matchesPeriod =
      cutoff === null || (!Number.isNaN(createdAt) && createdAt >= cutoff)

    return matchesQuery && matchesPeriod
  })
}

async function getNews() {
  const response = await fetch(new URL('/core/v1/news', apiUrl), {
    cache: 'no-store',
    headers: { accept: 'application/json' },
  })

  if (!response.ok) {
    throw new Error(`Unable to load news: ${response.status}`)
  }

  const payload = (await response.json()) as NewsResponse

  return payload.data.content
}

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; period?: string }>
}) {
  const { q = '', period = 'all' } = await searchParams
  const news = await getNews()
  const filteredNews = filterNews(news, q, period)
  const metrics = [
    {
      label: 'Total articles',
      value: news.length,
      description: 'All published articles',
      color: 'bg-cyan-500',
    },
    {
      label: 'Last 365 days',
      value: countArticlesSince(news, 365),
      description: 'Published in the last 365 days',
      color: 'bg-amber-500',
    },
    {
      label: 'Last 30 days',
      value: countArticlesSince(news, 30),
      description: 'Published in the last 30 days',
      color: 'bg-emerald-500',
    },
    {
      label: 'Last 7 days',
      value: countArticlesSince(news, 7),
      description: 'Published in the last 7 days',
      color: 'bg-rose-500',
    },
  ]

  return (
    <section className='relative min-h-screen py-12'>
      <div className="mb-12 flex items-end justify-between gap-4">
        <div>
          <h1 className="mt-1 text-3xl font-semibold -tracking-wider">News</h1>
        </div>

        <Link
          href="/app/news/create"
          className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          New article
        </Link>
      </div>

      <dl className="mb-8 grid border-b pb-7 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric, index) => (
          <div
            key={metric.label}
            className={`py-4 sm:px-6 sm:first:pl-0 lg:py-0 ${
              index > 0 ? 'border-t sm:border-t-0 sm:border-l' : ''
            } ${index === 2 ? 'sm:border-l-0 lg:border-l' : ''}`}
          >
            <dt className="text-sm text-muted-foreground">{metric.label}</dt>
            <dd className="mt-2 flex items-center gap-4">
              <span className="text-2xl font-semibold tabular-nums">
                {metric.value.toLocaleString('en-US')}
              </span>
              <span
                aria-hidden="true"
                className={`h-1 w-4 rounded-full ${metric.color}`}
              />
            </dd>
            <p className="mt-2 text-xs text-muted-foreground">
              {metric.description}
            </p>
          </div>
        ))}
      </dl>

      <div className="overflow-hidden rounded-lg border">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b bg-muted/50 text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">Title</th>
                <th className="px-4 py-3 font-medium">Slug</th>
                <th className="px-4 py-3 font-medium">Created at</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredNews.map((item) => (
                <tr key={item.id} className="align-top hover:bg-muted/30">
                  <td className="min-w-64 px-4 py-4">
                    <Link
                      href={`/app/news/${item.slug}`}
                      className="font-medium hover:underline line-clamp-1"
                    >
                      {item.title}
                    </Link>
                    <p className="mt-1 line-clamp-1 max-w-md text-xs leading-5 text-muted-foreground">
                      {item.shortDescription}
                    </p>
                  </td>
                  <td className="px-4 py-4 font-mono text-xs text-muted-foreground truncate">
                    {item.slug}
                  </td>
                  <td className="whitespace-nowrap px-4 py-4 text-muted-foreground">
                    {formatDate(item.createdAt)}
                  </td>
                </tr>
              ))}

              {filteredNews.length === 0 && (
                <tr>
                  <td
                    colSpan={3}
                    className="px-4 py-10 text-center text-muted-foreground"
                  >
                    No news articles found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <footer className='absolute left-0 bottom-10 right-0 flex items-center justify-center'>
        <label className="relative block w-full lg:max-w-sm">
          <span className="sr-only">Search news</span>
          <Search
            aria-hidden="true"
            className="absolute left-5 top-1/2 size-5 -translate-y-1/2 text-muted-foreground"
          />
          <input
            type="search"
            name="q"
            defaultValue={q}
            placeholder="Search by title or slug..."
            className="h-14 w-full rounded-full border bg-background pl-14 pr-3 text-sm outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
          />
        </label>
      </footer>
    </section>
  )
}
