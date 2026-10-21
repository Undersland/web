import { CalendarDays, FileText, Users } from 'lucide-react'
import type { ReactNode } from 'react'

import { getByline, getNews, type NewsItem } from './data'

function getNewsMetrics(news: NewsItem[]) {
  const now = new Date()
  const sevenDaysAgo = new Date(now)
  sevenDaysAgo.setDate(now.getDate() - 6)
  sevenDaysAgo.setHours(0, 0, 0, 0)

  const recentCount = news.filter((item) => {
    const createdAt = new Date(item.createdAt)
    return !Number.isNaN(createdAt.getTime()) && createdAt >= sevenDaysAgo
  }).length

  const contributors = new Set(news.map(getByline)).size

  return {
    total: news.length,
    recent: recentCount,
    contributors,
  }
}

export default async function Layout({ children }: { children: ReactNode }) {
  const news = await getNews()
  const metrics = getNewsMetrics(news)

  const metricItems = [
    { label: 'Total articles', value: metrics.total, icon: FileText },
    { label: 'Last 7 days', value: metrics.recent, icon: CalendarDays },
    { label: 'Contributors', value: metrics.contributors, icon: Users },
  ]

  return (
    <div className="grid min-h-screen gap-6 px-10 lg:grid-cols-[minmax(0,36rem)_240px] xl:gap-8">
      <div className="min-w-0 max-w-xl">{children}</div>

      <aside className="hidden lg:block" aria-label="News metrics">
        <div className="sticky top-28 pl-20 border-border">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Overview
          </p>

          <dl className="mt-8 space-y-8">
            {metricItems.map(({ label, value, icon: Icon }) => (
              <div key={label}>
                <dt className="flex items-center gap-2 text-[11px] text-muted-foreground">
                  <Icon
                    aria-hidden="true"
                    className="size-3.5"
                    strokeWidth={1.7}
                  />
                  {label}
                </dt>
                <dd className="mt-2 text-2xl font-medium tracking-tight tabular-nums">
                  {value}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </aside>
    </div>
  )
}
