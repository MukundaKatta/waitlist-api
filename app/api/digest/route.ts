import { NextResponse } from "next/server";

export const runtime = "edge";

interface SignupEntry {
  email: string;
  product: string;
  ts: string;
  ref: string;
  ua: string;
}

export async function GET(request: Request) {
  // Verify this is a legitimate Vercel Cron invocation
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const kvUrl = process.env.KV_REST_API_URL;
  const kvToken = process.env.KV_REST_API_TOKEN;
  if (!kvUrl || !kvToken) {
    return NextResponse.json({ error: "KV not configured" }, { status: 503 });
  }

  const resendKey = process.env.RESEND_API_KEY;
  const recipient = process.env.DIGEST_RECIPIENT;
  if (!resendKey || !recipient) {
    return NextResponse.json(
      { error: "RESEND_API_KEY or DIGEST_RECIPIENT not configured" },
      { status: 503 },
    );
  }

  // Fetch all signups
  const res = await fetch(`${kvUrl}/lrange/waitlist:all/0/-1`, {
    headers: { Authorization: `Bearer ${kvToken}` },
    cache: "no-store",
  });
  const data = (await res.json()) as { result?: string[] };
  const allEntries: SignupEntry[] = (data.result ?? [])
    .map((raw) => {
      try {
        return JSON.parse(raw) as SignupEntry;
      } catch {
        return null;
      }
    })
    .filter((e): e is SignupEntry => e !== null);

  // Filter to last 24 hours
  const cutoff = Date.now() - 24 * 60 * 60 * 1000;
  const recent = allEntries.filter((e) => new Date(e.ts).getTime() >= cutoff);

  if (recent.length === 0) {
    // No signups — still send a short note
    const body = formatEmail([], new Date());
    await sendEmail(resendKey, recipient, body.subject, body.text);
    return NextResponse.json({ ok: true, sent: true, signups: 0 });
  }

  // Group by product
  const byProduct = new Map<string, SignupEntry[]>();
  for (const entry of recent) {
    const list = byProduct.get(entry.product) ?? [];
    list.push(entry);
    byProduct.set(entry.product, list);
  }

  const body = formatEmail(recent, new Date(), byProduct);
  await sendEmail(resendKey, recipient, body.subject, body.text);

  return NextResponse.json({ ok: true, sent: true, signups: recent.length });
}

function formatEmail(
  recent: SignupEntry[],
  now: Date,
  byProduct?: Map<string, SignupEntry[]>,
) {
  const dateStr = now.toISOString().slice(0, 10);

  if (recent.length === 0) {
    return {
      subject: `Waitlist Digest — ${dateStr} — 0 signups`,
      text: `No new signups in the last 24 hours.\n`,
    };
  }

  const lines: string[] = [];
  lines.push(`Waitlist Digest — ${dateStr}`);
  lines.push(`${"=".repeat(40)}`);
  lines.push(`Total signups (last 24h): ${recent.length}`);
  lines.push("");

  // Per-product breakdown
  lines.push("By product:");
  lines.push("-".repeat(30));
  const sorted = [...(byProduct ?? new Map()).entries()].sort(
    (a, b) => b[1].length - a[1].length,
  );
  for (const [product, entries] of sorted) {
    lines.push(`  ${product}: ${entries.length}`);
  }
  lines.push("");

  // Last 10 emails
  lines.push("Latest signups (up to 10):");
  lines.push("-".repeat(30));
  const last10 = recent.slice(-10).reverse();
  for (const entry of last10) {
    const time = new Date(entry.ts).toISOString().slice(11, 16);
    lines.push(`  ${entry.email} — ${entry.product} — ${time} UTC`);
  }
  lines.push("");

  return {
    subject: `Waitlist Digest — ${dateStr} — ${recent.length} signup${recent.length === 1 ? "" : "s"}`,
    text: lines.join("\n"),
  };
}

async function sendEmail(
  apiKey: string,
  to: string,
  subject: string,
  text: string,
) {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "Waitlist Digest <onboarding@resend.dev>",
      to: [to],
      subject,
      text,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Resend API error: ${res.status} ${err}`);
  }
}
