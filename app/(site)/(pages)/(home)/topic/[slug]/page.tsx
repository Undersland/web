import { Heading } from '@/components/heading'
import { X } from 'lucide-react'
import Link from 'next/link'

interface TopicPageProps {
  params: Promise<{ slug: string }>
}

export default async function Topic({ params }: TopicPageProps) {
  const { slug } = await params

  return (
    <div className="overflow-y-auto pt-17 px-10 w-full">
      <header className="flex items-center justify-between">
        {/* <Heading.Light className="uppercase">
          TOPIC{' '}
          <span className="text-zinc-900 dark:text-white">[ {slug} ]</span>
        </Heading.Light> */}
        <Heading.Light className="uppercase text-red-500">
          THIS FEATURE IS COMING SOON
        </Heading.Light>

        <Link href="/">
          <X strokeWidth={1.5} />
        </Link>
      </header>
    </div>
  )
}
