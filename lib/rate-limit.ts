const store = new Map<string, { count: number; resetAt: number }>()

function getClientIp(req: Request): string {
  const headerOrder = [
    "x-forwarded-for",
    "x-real-ip",
    "x-client-ip",
  ]

  for (const name of headerOrder) {
    const value = req.headers.get(name)
    if (value) {
      const first = value.split(",")[0]?.trim()
      if (first) return first
    }
  }

  return "unknown"
}

export function buildRateLimitKey(req: Request, bucket: string): string {
  const ip = getClientIp(req)
  return `${bucket}:${ip}`
}

export function checkRateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now()
  const existing = store.get(key)

  if (!existing || existing.resetAt <= now) {
    store.set(key, { count: 1, resetAt: now + windowMs })
    return true
  }

  if (existing.count >= limit) {
    return false
  }

  existing.count += 1
  return true
}

