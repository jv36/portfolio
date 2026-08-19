import { TabsMain } from "@/components/tabs-main"

export default function Page() {
  return (
    <div className="flex min-h-svh items-center justify-center p-6">
      <div className="flex max-w-md min-w-0 flex-col gap-4 text-sm leading-loose">
        <div>
          <h1 className="text-4xl font-bold">João Vicente</h1>
        </div>
        <TabsMain />
      </div>
    </div>
  )
}
