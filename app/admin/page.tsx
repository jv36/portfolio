import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft, LogOut } from "lucide-react"

import { LoginForm } from "@/components/admin/login-form"
import { SongsEditor } from "@/components/admin/songs-editor"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
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
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="size-3.5" aria-hidden />
            joaovicente.dev
          </Link>
          <h1 className="mt-2 font-heading text-3xl font-semibold tracking-tight">
            Songs of the week
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Pick five songs, add a note for each one, and publish the week.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" render={<Link href="/songs" />}>
            View public page
          </Button>
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
        <Card className="w-full max-w-sm">
          <CardHeader>
            <CardTitle>Admin sign in</CardTitle>
            <CardDescription>
              Enter the admin password to edit this week&apos;s picks.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <LoginForm configured={isAdminConfigured()} />
          </CardContent>
        </Card>
      )}
    </main>
  )
}
