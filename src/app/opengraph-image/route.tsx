import { ImageResponse } from "next/og";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const params = new URL(req.url).searchParams;
  const title = params.get("title") ?? (process.env.NEXT_PUBLIC_COMPANY_NAME ?? "Real Estate & Investment");
  const subtitle = params.get("subtitle") ?? "Land · Housing · Investment";

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          background: "linear-gradient(135deg,#0f766e 0%,#134e4a 100%)",
          padding: 72,
          color: "white",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div style={{ fontSize: 28, opacity: 0.8, marginBottom: 16 }}>{subtitle}</div>
        <div style={{ fontSize: 72, lineHeight: 1.05, fontWeight: 700, maxWidth: 1000 }}>{title}</div>
        <div style={{ fontSize: 22, marginTop: 32, opacity: 0.7 }}>{process.env.NEXT_PUBLIC_COMPANY_NAME ?? ""}</div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
