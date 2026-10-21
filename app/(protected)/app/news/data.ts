import { cache } from 'react'

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'

export type NewsItem = {
  id: string
  title: string
  shortDescription: string
  slug: string
  createdAt: string
  author?: { name?: string } | string
  source?: string
}

type NewsResponse = {
  data: {
    content: NewsItem[]
  }
  error: unknown
}

export const getNews = cache(async () => {
  const response = await fetch(new URL('/core/v1/news', apiUrl), {
    cache: 'no-store',
    headers: { accept: 'application/json' },
  })

  if (!response.ok) {
    throw new Error(`Unable to load news: ${response.status}`)
  }

  const payload = (await response.json()) as NewsResponse

  return payload.data.content
})

export function getByline(item: NewsItem) {
  if (typeof item.author === 'string') return item.author

  return item.author?.name || item.source || 'Undersland Team'
}
