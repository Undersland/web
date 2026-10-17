interface TopicsOverviewProps {
  className?: string
}

export function TopicsOverview({ className }: TopicsOverviewProps) {
  return <div className="flex items-center pt-14 px-10"></div>
  // return (
  //   <section className={cn('min-h-0 overflow-y-auto px-10 pt-17', className)}>
  //     <Heading.Light>ENGLISH TOPICS [ {englishTopics.length} ]</Heading.Light>

  //     <ol className="mt-[96px] flex flex-col gap-7">
  //       {englishTopics.map((topic, index) => (
  //         <li key={topic}>
  //           <Link
  //             href={`/topic/${getTopicSlug(topic)}`}
  //             className="group grid grid-cols-[2rem_minmax(0,1fr)] items-start gap-5"
  //           >
  //             <span className="font-mono text-xs tabular-nums text-zinc-400 transition-colors group-hover:text-orange-500">
  //               {String(index + 1).padStart(2, '0')}
  //             </span>
  //             <span className="truncate text-xs font-medium uppercase leading-5 text-zinc-500 transition-colors group-hover:text-zinc-900 dark:text-zinc-400 dark:group-hover:text-zinc-100">
  //               {topic}
  //             </span>
  //           </Link>
  //         </li>
  //       ))}
  //     </ol>
  //   </section>
  // )
}
