import { ImageResponse } from "@vercel/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

// Map Tailwind accent names to hex colours (subset used across products)
const ACCENT_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
  blue:    { bg: "#dbeafe", text: "#1d4ed8", dot: "#3b82f6" },
  amber:   { bg: "#fef3c7", text: "#b45309", dot: "#f59e0b" },
  teal:    { bg: "#ccfbf1", text: "#0f766e", dot: "#14b8a6" },
  rose:    { bg: "#ffe4e6", text: "#be123c", dot: "#f43f5e" },
  purple:  { bg: "#ede9fe", text: "#7c3aed", dot: "#a855f7" },
  cyan:    { bg: "#cffafe", text: "#0e7490", dot: "#06b6d4" },
  pink:    { bg: "#fce7f3", text: "#9d174d", dot: "#ec4899" },
  orange:  { bg: "#ffedd5", text: "#c2410c", dot: "#f97316" },
  indigo:  { bg: "#e0e7ff", text: "#4338ca", dot: "#6366f1" },
  emerald: { bg: "#d1fae5", text: "#065f46", dot: "#10b981" },
  red:     { bg: "#fee2e2", text: "#b91c1c", dot: "#ef4444" },
  sky:     { bg: "#e0f2fe", text: "#0369a1", dot: "#0ea5e9" },
  violet:  { bg: "#ede9fe", text: "#6d28d9", dot: "#8b5cf6" },
  green:   { bg: "#dcfce7", text: "#15803d", dot: "#22c55e" },
  slate:   { bg: "#f1f5f9", text: "#334155", dot: "#64748b" },
  stone:   { bg: "#f5f5f4", text: "#44403c", dot: "#78716c" },
  yellow:  { bg: "#fef9c3", text: "#854d0e", dot: "#eab308" },
  lime:    { bg: "#ecfccb", text: "#3f6212", dot: "#84cc16" },
  fuchsia: { bg: "#fae8ff", text: "#86198f", dot: "#d946ef" },
  neutral: { bg: "#f5f5f5", text: "#404040", dot: "#737373" },
  zinc:    { bg: "#f4f4f5", text: "#3f3f46", dot: "#71717a" },
};

const DEFAULT = { bg: "#dbeafe", text: "#1d4ed8", dot: "#3b82f6" };

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const title    = searchParams.get("title")    ?? "solo.shop";
  const category = searchParams.get("category") ?? "";
  const accent   = searchParams.get("accent")   ?? "blue";

  const colors = ACCENT_COLORS[accent] ?? DEFAULT;

  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 80px",
          background: `linear-gradient(135deg, ${colors.bg} 0%, #ffffff 60%)`,
          fontFamily: "system-ui, -apple-system, sans-serif",
        }}
      >
        {/* Category pill */}
        {category && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <div
              style={{
                background: colors.dot,
                width: "10px",
                height: "10px",
                borderRadius: "50%",
              }}
            />
            <span
              style={{
                color: colors.text,
                fontSize: "20px",
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.1em",
              }}
            >
              {category}
            </span>
          </div>
        )}

        {/* Product name */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "16px",
            flex: 1,
            justifyContent: "center",
          }}
        >
          <div
            style={{
              fontSize: "96px",
              fontWeight: 800,
              color: "#111827",
              lineHeight: 1,
              letterSpacing: "-0.03em",
            }}
          >
            {title}
          </div>
          <div
            style={{
              fontSize: "28px",
              color: "#6b7280",
              fontWeight: 400,
            }}
          >
            Join the early access waitlist
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "50%",
                background: colors.dot,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            />
            <span
              style={{
                fontSize: "20px",
                color: "#9ca3af",
                fontWeight: 500,
              }}
            >
              solo.shop's collection
            </span>
          </div>
          <div
            style={{
              fontSize: "20px",
              color: colors.text,
              fontWeight: 600,
              background: colors.bg,
              padding: "10px 24px",
              borderRadius: "100px",
              border: `2px solid ${colors.dot}`,
            }}
          >
            Get early access →
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
