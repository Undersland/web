import Image from 'next/image'
import Link from 'next/link'

export default function Page() {
  return (
    <div className="max-w-5xl mx-auto h-full flex flex-col items-center justify-center px-20">
      <Image
        src="/UndersLand - Light.svg"
        alt="UndersLand"
        width={80}
        height={80}
        priority
        className="mb-4 dark:hidden"
      />
      <Image
        src="/UndersLand - Dark.svg"
        alt=""
        width={80}
        height={80}
        priority
        aria-hidden="true"
        className="hidden dark:block"
      />

      <Link href="/auth">
        <p>Autenticar</p>
      </Link>
    </div>
  )
}
