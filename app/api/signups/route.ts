import { NextResponse } from "next/server";

export const runtime = "edge";

function json(body: unknown, init: ResponseInit = {}) {
  return NextResponse.json(body, init);
}

// GET /api/signups?product=fluentpal&key=...
// GET /api/signups?product=all&key=...
// Returns the waitlist entries for a given product (or "all").
// Protected by an admin key so emails aren't publicly readable.
export async function GET(request: Request) {
  const url = new URL(request.url);
  const key = url.searchParams.get("key") ?? "";
  const product = (url.searchParams.get("product") ?? "all")
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "")
    .slice(0, 40) || "all";

  const adminKey = process.env.ADMIN_KEY;
  if (!adminKey || key !== adminKey) {
    return json({ error: "Unauthorized" }, { status: 401 });
  }

  const kvUrl = process.env.KV_REST_API_URL;
  const kvToken = process.env.KV_REST_API_TOKEN;
  if (!kvUrl || !kvToken) {
    return json({ error: "KV not configured" }, { status: 503 });
  }

  try {
    const res = await fetch(`${kvUrl}/lrange/waitlist:${product}/0/-1`, {
      headers: { Authorization: `Bearer ${kvToken}` },
      cache: "no-store",
    });
    const data = (await res.json()) as { result?: string[] };
    const entries = (data.result ?? []).map((raw) => {
      try {
        return JSON.parse(raw);
      } catch {
        return { raw };
      }
    });
    return json({ product, count: entries.length, entries });
  } catch (err) {
    return json(
      { error: "Read failed", detail: String(err) },
      { status: 500 },
    );
  }
}
