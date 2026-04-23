import { headers } from "next/headers";
import AdminDashboard from "./AdminDashboard";

type Entry = {
  email: string;
  product: string;
  ts: string;
};

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const key = typeof params.key === "string" ? params.key : "";

  if (!key) {
    return (
      <main className="mx-auto flex min-h-screen max-w-2xl flex-col justify-center px-8 py-16 font-mono text-neutral-800">
        <h1 className="text-2xl font-bold">Admin</h1>
        <p className="mt-3 text-neutral-500">
          Add <code className="rounded bg-neutral-100 px-1 py-0.5 text-sm">?key=YOUR_ADMIN_KEY</code> to the URL to access the dashboard.
        </p>
      </main>
    );
  }

  const adminKey = process.env.ADMIN_KEY;
  if (!adminKey || key !== adminKey) {
    return (
      <main className="mx-auto flex min-h-screen max-w-2xl flex-col justify-center px-8 py-16 font-mono text-neutral-800">
        <h1 className="text-2xl font-bold">Not authorized</h1>
        <p className="mt-3 text-neutral-500">Invalid admin key.</p>
      </main>
    );
  }

  // Fetch all signups server-side
  const headersList = await headers();
  const host = headersList.get("host") ?? "localhost:3000";
  const protocol = process.env.NODE_ENV === "production" ? "https" : "http";
  const apiUrl = `${protocol}://${host}/api/signups?product=all&key=${encodeURIComponent(key)}`;

  let entries: Entry[] = [];
  let fetchError: string | null = null;

  try {
    const res = await fetch(apiUrl, { cache: "no-store" });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      fetchError = (body as { error?: string }).error ?? `HTTP ${res.status}`;
    } else {
      const data = (await res.json()) as { entries?: unknown[] };
      entries = (data.entries ?? []) as Entry[];
    }
  } catch (err) {
    fetchError = String(err);
  }

  if (fetchError) {
    return (
      <main className="mx-auto flex min-h-screen max-w-2xl flex-col justify-center px-8 py-16 font-mono text-neutral-800">
        <h1 className="text-2xl font-bold">Admin</h1>
        <p className="mt-3 text-red-500">Error loading signups: {fetchError}</p>
      </main>
    );
  }

  const total = entries.length;

  // Group by product, sort by count desc
  const countMap = new Map<string, number>();
  for (const e of entries) {
    const p = e.product ?? "unknown";
    countMap.set(p, (countMap.get(p) ?? 0) + 1);
  }
  const groups = Array.from(countMap.entries())
    .map(([product, count]) => ({ product, count }))
    .sort((a, b) => b.count - a.count);

  // Last 50, most recent first
  const recent = [...entries]
    .sort((a, b) => new Date(b.ts).getTime() - new Date(a.ts).getTime())
    .slice(0, 50);

  return (
    <main className="mx-auto max-w-2xl px-8 py-16 font-mono text-neutral-800">
      {/* Header */}
      <h1 className="text-2xl font-bold">Admin</h1>
      <p className="mt-1 text-neutral-500">waitlist-api dashboard</p>

      {/* Total */}
      <div className="mt-10 rounded-xl border border-neutral-200 bg-neutral-50 p-6 text-center">
        <div className="text-5xl font-bold text-neutral-900">{total}</div>
        <div className="mt-1 text-sm text-neutral-400">total signups</div>
      </div>

      {/* Dashboard */}
      <div className="mt-10">
        <AdminDashboard total={total} groups={groups} recent={recent} />
      </div>
    </main>
  );
}
