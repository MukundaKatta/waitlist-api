# waitlist-api

Shared waitlist backend for the landing pages in this account.

## Endpoints

### `POST /api/waitlist`

Accepts CORS from any origin.

```json
{
  "email": "me@example.com",
  "product": "fluentpal"
}
```

Returns `{ "ok": true, "stored": "kv" | "log-only" }`.

### `GET /api/signups?product=fluentpal&key=<ADMIN_KEY>`

Returns waitlist entries for the given product. Pass `product=all` to get everything.

## Storage

Uses Vercel KV (Upstash Redis) when these env vars are set:

- `KV_REST_API_URL`
- `KV_REST_API_TOKEN`

Without them, writes go to Vercel logs only (still functional for testing).

## Setup

1. Connect a Vercel KV store in the Vercel dashboard (Storage tab → Create → KV). Env vars are auto-injected.
2. Set `ADMIN_KEY` to a random string (Project Settings → Environment Variables).
3. Redeploy.
