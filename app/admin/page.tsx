import type { Metadata } from "next"
import { LogOut } from "lucide-react"

import { LoginForm } from "@/components/admin/login-form"
import { SongsEditor } from "@/components/admin/songs-editor"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { logoutAction } from "@/lib/actions"
import { isAdminAuthenticated, isAdminConfigured } from "@/lib/auth"
import { getAllWeeks } from "@/lib/songs"

export const metadata: Metadata = {
  title: "Songs of the week — Admin",
  robots: { index: false, follow: false },
}

export default async function AdminPage() {
  const authenticated = await isAdminAuthenticated()
  const weeks = authenticated ? await getAllWeeks() : []

  return (
    <main className="mx-auto flex min-h-svh w-full max-w-3xl flex-col gap-6 px-4 py-10 sm:px-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-2">
          {authenticated ? (
            <form action={logoutAction}>
              <Button type="submit" variant="ghost" size="sm">
                <LogOut className="size-4" aria-hidden />
                Sign out
              </Button>
            </form>
          ) : null}
        </div>
      </header>

      {authenticated ? (
        <SongsEditor initialWeeks={weeks} />
      ) : (
        <div className="flex flex-1 items-center justify-center">
          <Card className="w-full max-w-sm">
            <CardContent>
              <LoginForm configured={isAdminConfigured()} />
            </CardContent>
          </Card>
        </div>
      )}
    </main>
  )
}
