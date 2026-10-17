import { notFound } from 'next/navigation'
import { cookies } from 'next/headers'
import { NewsModel } from '@/model/news'
import * as Article from './article'
import { formatDate } from '@/lib/format-date'

type PageProps = {
  params: Promise<{ slug: string }>
}

export default async function Slug({ params }: PageProps) {
  const { slug } = await params
  const cookieStore = await cookies()
  const news = await NewsModel.getAll(cookieStore.toString())
  const post = news.find((item) => item.data.slug === slug)

  if (!post) {
    notFound()
  }

  const postIndex = news.indexOf(post)
  const previousPostSlug =
    postIndex >= 0 ? news[postIndex - 1]?.data.slug : undefined
  const nextPostSlug =
    postIndex >= 0 ? news[postIndex + 1]?.data.slug : undefined

  return (
    <div className="relative h-full min-h-0">
      <Article.Root>
        <Article.Metadata
          author={post.data.author?.name ?? 'Unknown'}
          date={formatDate(post.created_at)}
          title={post.data.title}
        />
        <Article.Content
          difficultWords={post.data.difficult_words}
          levels={post.data.html}
        />
        <Article.Sources links={post.data.links ?? []} />
        <Article.PostList
          currentPostSlug={slug}
          posts={news.map((item) => ({
            slug: item.data.slug,
            title: item.data.title,
          }))}
        />
        <Article.Navigation
          nextPostSlug={nextPostSlug}
          previousPostSlug={previousPostSlug}
        />
      </Article.Root>
    </div>
  )
}
