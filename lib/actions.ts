"use server"

import { revalidatePath } from "next/cache"
import { headers } from "next/headers"
import { redirect } from "next/navigation"

import type { ActionState } from "./action-state"
import {
  clearLoginFailures,
  createAdminSession,
  destroyAdminSession,
  isAdminAuthenticated,
  isAdminConfigured,
  isLoginRateLimited,
  recordLoginFailure,
  verifyAdminPassword,
} from "./auth"
import { parseIssueInput, saveIssue } from "./songs"
import type { SaveSongsResult } from "./songs-types"

function loginKey(headerList: Headers): string {
  const forwarded = headerList.get("x-forwarded-for")
  return (
    forwarded?.split(",")[0]?.trim() ||
    headerList.get("x-real-ip")?.trim() ||
    "unknown"
  )
}

export async function loginAction(
  _previous: ActionState,
  formData: FormData
): Promise<ActionState> {
  if (!isAdminConfigured()) {
    return {
      ok: false,
      error:
        "Admin access is not configured. Set ADMIN_PASSWORD on the server and restart.",
    }
  }

  const headerList = await headers()
  const key = loginKey(headerList)
  if (isLoginRateLimited(key)) {
    return {
      ok: false,
      error: "Too many attempts. Wait a few minutes and try again.",
    }
  }

  const password = formData.get("password")
  if (
    !(await verifyAdminPassword(typeof password === "string" ? password : ""))
  ) {
    recordLoginFailure(key)
    return { ok: false, error: "Wrong password." }
  }

  clearLoginFailures(key)
  await createAdminSession()
  redirect("/admin")
}

export async function logoutAction(): Promise<void> {
  await destroyAdminSession()
  redirect("/admin")
}

export async function saveSongsOfTheWeekAction(
  input: unknown
): Promise<SaveSongsResult> {
  if (!(await isAdminAuthenticated())) {
    return {
      ok: false,
      error: "Your session expired. Sign in again to save changes.",
    }
  }

  const parsed = parseIssueInput(input)
  if (!parsed.ok) {
    return { ok: false, error: parsed.error }
  }

  const week = await saveIssue(parsed.issue)

  revalidatePath("/")
  revalidatePath("/songs")
  revalidatePath(`/songs/${week.weekStart}`)
  revalidatePath("/admin")

  return { ok: true, week }
}
