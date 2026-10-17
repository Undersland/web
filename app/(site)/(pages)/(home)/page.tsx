import { TopicsOverview } from '@/components/topics-overview'

export default function HomeLayout() {
  return (
    <aside className="relative hidden min-h-0 flex-col lg:col-span-5 lg:flex">
      <TopicsOverview className="flex-1" />
    </aside>
  )
}
