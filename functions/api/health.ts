import type { Env } from "../../cf/env"

// GET /api/health — checks the function runtime and the D1 binding
export const onRequestGet: PagesFunction<Env> = async ({ env }) => {
  try {
    await env.DB.prepare("SELECT 1").first()
    return Response.json({ ok: true, db: true })
  } catch (err) {
    console.error("D1 health check failed:", err)
    return Response.json({ ok: false, db: false }, { status: 503 })
  }
}
