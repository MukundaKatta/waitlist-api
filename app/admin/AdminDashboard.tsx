"use client";

import { useState, useMemo } from "react";

type Entry = {
  email: string;
  product: string;
  ts: string;
};

type ProductGroup = {
  product: string;
  count: number;
};

type Props = {
  total: number;
  groups: ProductGroup[];
  recent: Entry[];
};

export default function AdminDashboard({ total, groups, recent }: Props) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return recent;
    return recent.filter((e) => e.email.toLowerCase().includes(q));
  }, [query, recent]);

  return (
    <div className="space-y-10">
      {/* Search */}
      <input
        type="text"
        placeholder="Filter by email…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full rounded-lg border border-neutral-200 bg-neutral-50 px-4 py-2 text-sm font-mono text-neutral-800 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-300"
      />

      {/* Product breakdown */}
      <div>
        <div className="mb-3 text-xs font-semibold uppercase tracking-widest text-neutral-400">
          By product
        </div>
        <div className="overflow-hidden rounded-xl border border-neutral-200">
          <table className="w-full text-sm font-mono">
            <thead>
              <tr className="border-b border-neutral-200 bg-neutral-50 text-left text-xs text-neutral-400">
                <th className="px-4 py-2 font-normal">product</th>
                <th className="px-4 py-2 font-normal text-right">signups</th>
              </tr>
            </thead>
            <tbody>
              {groups.map((g, i) => (
                <tr
                  key={g.product}
                  className={i % 2 === 0 ? "bg-white" : "bg-neutral-50"}
                >
                  <td className="px-4 py-2 text-neutral-700">{g.product}</td>
                  <td className="px-4 py-2 text-right text-neutral-900 font-semibold">
                    {g.count}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent signups */}
      <div>
        <div className="mb-3 text-xs font-semibold uppercase tracking-widest text-neutral-400">
          {query ? `${filtered.length} result${filtered.length !== 1 ? "s" : ""}` : `Last ${recent.length} signups`}
        </div>
        {filtered.length === 0 ? (
          <p className="text-sm text-neutral-400">No signups match.</p>
        ) : (
          <div className="overflow-hidden rounded-xl border border-neutral-200">
            <table className="w-full text-sm font-mono">
              <thead>
                <tr className="border-b border-neutral-200 bg-neutral-50 text-left text-xs text-neutral-400">
                  <th className="px-4 py-2 font-normal">email</th>
                  <th className="px-4 py-2 font-normal hidden sm:table-cell">product</th>
                  <th className="px-4 py-2 font-normal text-right">time</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((e, i) => (
                  <tr
                    key={`${e.email}-${e.ts}`}
                    className={i % 2 === 0 ? "bg-white" : "bg-neutral-50"}
                  >
                    <td className="px-4 py-2 text-neutral-700 break-all">
                      {e.email}
                    </td>
                    <td className="px-4 py-2 text-neutral-500 hidden sm:table-cell">
                      {e.product}
                    </td>
                    <td className="px-4 py-2 text-right text-neutral-400 whitespace-nowrap text-xs">
                      {new Date(e.ts).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
