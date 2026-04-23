import { NextResponse } from "next/server";

export const runtime = "edge";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Max-Age": "86400",
};

export function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS });
}

function json(body: unknown, init: ResponseInit = {}) {
  return NextResponse.json(body, {
    ...init,
    headers: { ...CORS, ...(init.headers ?? {}) },
  });
}

export async function POST(request: Request) {
  let payload: { email?: unknown; product?: unknown };
  try {
    payload = await request.json();
  } catch {
    return json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const email = String(payload.email ?? "").trim().toLowerCase();
  const product = String(payload.product ?? "unknown")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "")
    .slice(0, 40) || "unknown";

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return json({ error: "Valid email required" }, { status: 400 });
  }

  const entry = {
    email,
    product,
    ts: new Date().toISOString(),
    ref: request.headers.get("referer") ?? "",
    ua: request.headers.get("user-agent") ?? "",
  };

  // Always log (shows up in Vercel logs even without KV)
  console.log("[waitlist]", JSON.stringify(entry));

  const kvUrl = process.env.KV_REST_API_URL;
  const kvToken = process.env.KV_REST_API_TOKEN;

  if (!kvUrl || !kvToken) {
    // Fallback: logs only. Still 200 so the frontend UX is seamless.
    return json({ ok: true, stored: "log-only" });
  }

  try {
    // Upstash Redis (Vercel KV) REST API.
    // RPUSH onto a per-product list and a global list.
    const value = encodeURIComponent(JSON.stringify(entry));
    await Promise.all([
      fetch(`${kvUrl}/rpush/waitlist:all/${value}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${kvToken}` },
      }),
      fetch(`${kvUrl}/rpush/waitlist:${product}/${value}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${kvToken}` },
      }),
      fetch(`${kvUrl}/sadd/waitlist:emails/${encodeURIComponent(email)}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${kvToken}` },
      }),
    ]);
    return json({ ok: true, stored: "kv" });
  } catch (err) {
    console.error("[waitlist] KV write failed", err);
    // Still return success to the user; we have the log line.
    return json({ ok: true, stored: "log-only-kv-failed" });
  }
}
