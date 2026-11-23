"use client"

import { useActionState } from "react"
import { Loader2, LockKeyhole } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { loginAction } from "@/lib/actions"

export function LoginForm({ configured }: { configured: boolean }) {
  const [state, formAction, pending] = useActionState(loginAction, {
    ok: false,
  })

  if (!configured) {
    return (
      <div className="rounded-lg border border-dashed border-border p-4 text-sm text-muted-foreground">
        Set <code className="font-mono text-foreground">ADMIN_PASSWORD</code> in
        the server environment, then restart the app to enable this page.
      </div>
    )
  }

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <label className="flex flex-col gap-1.5 text-sm font-medium">
        Admin password
        <Input
          name="password"
          type="password"
          autoComplete="current-password"
          autoFocus
          required
          aria-invalid={Boolean(state.error)}
        />
      </label>

      {state.error ? (
        <p className="text-sm text-destructive" role="alert">
          {state.error}
        </p>
      ) : null}

      <Button type="submit" disabled={pending} className="mt-1">
        {pending ? (
          <Loader2 className="size-4 animate-spin" aria-hidden />
        ) : (
          <LockKeyhole className="size-4" aria-hidden />
        )}
        Sign in
      </Button>
    </form>
  )
}
