import { ChevronLeft } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'

type NewsItem = {
  id: string
  title: string
  shortDescription: string
  html: string[]
  slug: string
  createdAt: string
}

type NewsResponse = {
  data: {
    content: NewsItem
  }
  error: unknown
}

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  dateStyle: 'long',
  timeStyle: 'short',
})

const levels = ['Beginner', 'Intermediate', 'Advanced'] as const

async function getNews(slug: string) {
  const response = await fetch(
    new URL(`/core/v1/news/${encodeURIComponent(slug)}`, apiUrl),
    {
      cache: 'no-store',
      headers: { accept: 'application/json' },
    },
  )

  if (response.status === 404) notFound()

  if (!response.ok) {
    throw new Error(`Unable to load the news article: ${response.status}`)
  }

  const payload = (await response.json()) as NewsResponse

  return payload.data.content
}

function getContentKey(content: string) {
  let hash = 0

  for (const character of content) {
    hash = (hash * 31 + character.charCodeAt(0)) | 0
  }

  return hash
}

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ level?: string }>
}) {
  const { slug } = await params
  const { level = 'beginner' } = await searchParams
  const news = await getNews(slug)
  const createdAt = new Date(news.createdAt)
  const selectedLevelIndex = Math.max(
    levels.findIndex((item) => item.toLowerCase() === level.toLowerCase()),
    0,
  )
  const selectedContent = news.html[selectedLevelIndex]

  return (
    <article className="py-14">
      <Link
        href="/app/news"
        className="text-sm gap-2.5 text-muted-foreground hover:text-foreground flex items-center"
      >
        <ChevronLeft className="text-foreground size-3.5" />

        <p className="text-xs font-sans text-muted-foreground">
          {Number.isNaN(createdAt.getTime())
            ? 'Date unavailable'
            : dateFormatter.format(createdAt)}{' '}
          • {news.slug}
        </p>
      </Link>

      <header className="mt-6 pb-6">
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">
          {news.title}
        </h1>
        <p className="mt-5 text-sm leading-5 text-muted-foreground">
          {news.shortDescription}
        </p>
      </header>

      <div className="mt-8">
        {news.html.length > 0 && (
          <>
            <nav
              aria-label="Article level"
              className="flex gap-10 border-b border-border"
            >
              {levels.map((item, index) => {
                const isActive = index === selectedLevelIndex

                return (
                  <Link
                    key={item}
                    href={`?level=${item.toLowerCase()}`}
                    aria-current={isActive ? 'page' : undefined}
                    className={`-mb-px border-b pb-5 text-[15px] transition-colors ${
                      isActive
                        ? 'border-foreground text-foreground'
                        : 'border-transparent text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {item}
                  </Link>
                )
              })}
            </nav>

            {selectedContent && (
              <section className="mt-8">
                <article
                  key={`${news.id}-${getContentKey(selectedContent)}`}
                  className="prose prose-sm prose-strong:font-medium max-w-none [&_b]:font-medium"
                  // biome-ignore lint/security/noDangerouslySetInnerHtml: The API stores the article as trusted HTML.
                  dangerouslySetInnerHTML={{ __html: selectedContent }}
                />
              </section>
            )}
          </>
        )}

        {news.html.length === 0 && (
          <div className="px-6 py-10 text-center text-muted-foreground">
            This news article has no content.
          </div>
        )}
      </div>
    </article>
  )
}
