import 'server-only'

import type { New } from '@/types/new'

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'

type ApiNews = {
  _id?: string | { $oid?: string }
  id?: string | number
  title?: string
  author?: { name?: string }
  authorId?: string
  created_at?: string
  short_description?: string
  html?: string[]
  difficult_words?: string[][]
  slug?: string
  links?: New['data']['links']
  data?: New['data']
}

function getNewsId(item: ApiNews) {
  if (item.id !== undefined) return item.id
  if (typeof item._id === 'string') return item._id
  if (item._id?.$oid) return item._id.$oid

  return item.slug ?? item.data?.slug ?? crypto.randomUUID()
}

function normalizeNews(item: ApiNews): New {
  if (item.data) {
    const html = item.data.html ?? []

    return {
      id: getNewsId(item),
      created_at: item.created_at ?? '',
      data: {
        ...item.data,
        html,
        difficult_words: html.map(
          (_, levelIndex) => item.data?.difficult_words?.[levelIndex] ?? [],
        ),
        links: item.data.links ?? [],
        author: { name: item.data.author?.name ?? 'Unknown' },
      },
    }
  }

  const html = item.html ?? []

  return {
    id: getNewsId(item),
    created_at: item.created_at ?? '',
    data: {
      title: item.title ?? '',
      short_description: item.short_description ?? '',
      html,
      difficult_words: html.map(
        (_, levelIndex) => item.difficult_words?.[levelIndex] ?? [],
      ),
      slug: item.slug ?? '',
      links: item.links ?? [],
      author: { name: item.author?.name ?? 'Unknown' },
    },
  }
}

// biome-ignore lint/complexity/noStaticOnlyClass: <>
export class NewsModel {
  static async getAll(cookieHeader?: string): Promise<New[]> {
    const headers = new Headers({ accept: 'application/json' })

    // Keep the frontend compatible with API deployments that still protect
    // this route while allowing the current public endpoint to work as-is.
    if (cookieHeader) headers.set('cookie', cookieHeader)

    const response = await fetch(new URL('/news', apiUrl), {
      cache: 'no-store',
      headers,
    })

    console.log('response', JSON.stringify(response, null, 2))

    if (!response.ok) {
      throw new Error(
        `Failed to fetch news: ${response.status} ${response.statusText}`,
      )
    }

    const news = (await response.json()) as ApiNews[]

    return news
      .map(normalizeNews)
      .toSorted(
        (first, second) =>
          Date.parse(second.created_at) - Date.parse(first.created_at),
      )
  }
}
