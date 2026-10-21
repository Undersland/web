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

function getPreviewDocument(content: string) {
  return `<!doctype html>
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src https: data:; style-src 'unsafe-inline'" />
        <style>
          body { color: #27272a; font: 16px/1.75 system-ui, sans-serif; margin: 0; }
          h1, h2, h3 { line-height: 1.25; }
          img { height: auto; max-width: 100%; }
          a { color: inherit; text-decoration: underline; }
        </style>
      </head>
      <body>${content}</body>
    </html>`
}

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const news = await getNews(slug)
  const createdAt = new Date(news.createdAt)

  return (
    <article>
      <Link
        href="/app/news"
        className="text-sm text-muted-foreground hover:text-foreground hover:underline"
      >
        ← Back to news
      </Link>

      <header className="mt-6 border-b pb-6">
        <p className="text-sm text-muted-foreground">
          {Number.isNaN(createdAt.getTime())
            ? 'Date unavailable'
            : dateFormatter.format(createdAt)}
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">
          {news.title}
        </h1>
        <p className="mt-3 text-base leading-7 text-muted-foreground">
          {news.shortDescription}
        </p>
        <p className="mt-4 font-mono text-xs text-muted-foreground">
          {news.slug}
        </p>
      </header>

      <div className="mt-8 space-y-8">
        {news.html.map((content, index) => (
          <section
            key={`${news.id}-${getContentKey(content)}`}
            className="rounded-lg border p-6"
          >
            <h2 className="mb-5 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Version {index + 1}
            </h2>
            <iframe
              title={`Version ${index + 1} content`}
              sandbox=""
              srcDoc={getPreviewDocument(content)}
              className="h-[32rem] w-full border-0 bg-white"
            />
          </section>
        ))}

        {news.html.length === 0 && (
          <div className="rounded-lg border px-6 py-10 text-center text-muted-foreground">
            This news article has no content.
          </div>
        )}
      </div>
    </article>
  )
}
