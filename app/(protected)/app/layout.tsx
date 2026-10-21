import Link from "next/link";
import { ReactNode } from "react";

export default function Layout({children}: {children: ReactNode}) {
  return (
    <main className="mx-auto min-h-full w-full max-w-6xl gap-8 px-6 grid grid-cols-10">
      <aside className="sticky top-0 col-span-2 flex h-screen self-start flex-col gap-3 border-r px-5 pt-12">
        <Link href={"/app/news"}>
          <strong className="font-medium text-2xl">News</strong>
        </Link>
        <Link href={"/app/profile"}>
          <strong className="font-medium text-2xl">Profile</strong>
        </Link>
      </aside>
      <div className="col-span-8 px-10">{children}</div>
    </main>
  )
}
