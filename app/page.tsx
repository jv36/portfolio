import Link from "next/link"

import { TabsMain } from "@/components/tabs-main"
import { buttonVariants } from "@/components/ui/button"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "João Vicente",
  description: "João Vicente, software engineer from Portugal.",
}

export default function Page() {
  return (
    <div className="flex min-h-svh items-center justify-center p-6">
      <div className="flex w-full max-w-[400px] min-w-0 flex-col gap-4 text-sm leading-loose">
        <div>
          <h1 className="text-4xl font-bold">João Vicente</h1>
        </div>
        <TabsMain />
        <Link
          href="/songs"
          className={buttonVariants({
            variant: "outline",
            className: "w-full",
          })}
        >
          Songs of the week
        </Link>
        <Link
          href="/aoty"
          className={buttonVariants({
            variant: "outline",
            className: "w-full",
          })}
        >
          Albums of the year
        </Link>
      </div>
    </div>
  )
}
