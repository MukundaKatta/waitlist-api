export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col justify-center px-8 py-16 font-mono text-neutral-800">
      <h1 className="text-2xl font-bold">waitlist-api</h1>
      <p className="mt-2 text-neutral-500">
        Shared waitlist backend for 20 landing pages.
      </p>

      <div className="mt-10 space-y-6 text-sm leading-relaxed">
        <div>
          <div className="font-semibold text-neutral-900">POST /api/waitlist</div>
          <pre className="mt-2 overflow-x-auto rounded-lg bg-neutral-100 p-3 text-xs">{`{
  "email": "me@example.com",
  "product": "fluentpal"
}`}</pre>
        </div>

        <div>
          <div className="font-semibold text-neutral-900">
            GET /api/signups?product=fluentpal&amp;key=ADMIN_KEY
          </div>
          <p className="mt-1 text-neutral-500">
            Returns all waitlist entries for a product. Admin-only.
          </p>
        </div>
      </div>

      <div className="mt-12 rounded-xl border border-neutral-200 bg-neutral-50 p-4 text-xs text-neutral-600">
        <div className="font-semibold text-neutral-800">Setup</div>
        <ol className="mt-2 list-decimal space-y-1 pl-4">
          <li>Add a Vercel KV store via the Storage tab (one click).</li>
          <li>
            Set <code>ADMIN_KEY</code> to something only you know.
          </li>
          <li>Redeploy. Signups start persisting.</li>
        </ol>
      </div>
    </main>
  );
}
