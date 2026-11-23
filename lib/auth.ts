import { createHash, createHmac, timingSafeEqual } from "node:crypto"
import { cookies } from "next/headers"

export const ADMIN_COOKIE = "portfolio_admin_session"
const SESSION_AGE_SECONDS = 60 * 60 * 24 * 30
const LOGIN_WINDOW_MS = 15 * 60 * 1000
const MAX_LOGIN_ATTEMPTS = 6

type LoginAttempts = {
  count: number
  resetAt: number
}

const loginAttempts = new Map<string, LoginAttempts>()

function adminPassword(): string {
  return process.env.ADMIN_PASSWORD?.trim() ?? ""
}

function sessionSecret(): string {
  return (
    process.env.SESSION_SECRET?.trim() ||
    adminPassword() ||
    "portfolio-local-development-secret"
  )
}

function sign(value: string): string {
  return createHmac("sha256", sessionSecret()).update(value).digest("base64url")
}

function safeEqual(a: string, b: string): boolean {
  const left = createHash("sha256").update(a).digest()
  const right = createHash("sha256").update(b).digest()
  return timingSafeEqual(left, right)
}

export function isAdminConfigured(): boolean {
  return adminPassword().length > 0
}

function encodeSession(): string {
  const body = Buffer.from(
    JSON.stringify({ exp: Date.now() + SESSION_AGE_SECONDS * 1000 })
  ).toString("base64url")
  return `${body}.${sign(body)}`
}

function decodeSession(token: string): boolean {
  const [body, signature] = token.split(".")
  if (!body || !signature) return false

  const expected = sign(body)
  if (!safeEqual(expected, signature)) return false

  try {
    const payload: unknown = JSON.parse(
      Buffer.from(body, "base64url").toString("utf8")
    )
    if (typeof payload !== "object" || payload === null) return false
    const exp = (payload as { exp?: unknown }).exp
    return typeof exp === "number" && exp > Date.now()
  } catch {
    return false
  }
}

export async function isAdminAuthenticated(): Promise<boolean> {
  const store = await cookies()
  const token = store.get(ADMIN_COOKIE)?.value
  return token ? decodeSession(token) : false
}

export async function verifyAdminPassword(password: string): Promise<boolean> {
  const configured = adminPassword()
  if (!configured || !password) return false
  return safeEqual(configured, password)
}

export async function createAdminSession(): Promise<void> {
  const store = await cookies()
  store.set(ADMIN_COOKIE, encodeSession(), {
    httpOnly: true,
    sameSite: "lax",
    secure:
      process.env.COOKIE_SECURE === "true" ||
      (process.env.NODE_ENV === "production" &&
        process.env.COOKIE_SECURE !== "false"),
    path: "/",
    maxAge: SESSION_AGE_SECONDS,
  })
}

export async function destroyAdminSession(): Promise<void> {
  const store = await cookies()
  store.delete(ADMIN_COOKIE)
}

export function isLoginRateLimited(key: string): boolean {
  const entry = loginAttempts.get(key)
  if (!entry) return false
  if (entry.resetAt <= Date.now()) {
    loginAttempts.delete(key)
    return false
  }
  return entry.count >= MAX_LOGIN_ATTEMPTS
}

export function recordLoginFailure(key: string): void {
  const now = Date.now()
  const entry = loginAttempts.get(key)
  if (!entry || entry.resetAt <= now) {
    loginAttempts.set(key, { count: 1, resetAt: now + LOGIN_WINDOW_MS })
    return
  }
  entry.count += 1
}

export function clearLoginFailures(key: string): void {
  loginAttempts.delete(key)
}
