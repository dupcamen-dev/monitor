import { ImageResponse } from "next/og";

export const runtime = "nodejs";
export const alt = "TopStatus — Monitoring & Status Pages in one place";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: 80,
          background:
            "linear-gradient(135deg, #0a0a0a 0%, #101a2e 55%, #07140f 100%)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <div
            style={{
              width: 96,
              height: 96,
              borderRadius: 22,
              background: "linear-gradient(135deg, #adc6ff, #4edea3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 54,
              fontWeight: 800,
              color: "#0a0a0a",
            }}
          >
            U
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 40, fontWeight: 700, color: "#e4e2e2" }}>
              TopStatus
            </div>
            <div style={{ fontSize: 22, color: "#8c909f", marginTop: 4 }}>
              topstatus.space
            </div>
          </div>
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            marginTop: 48,
            fontSize: 66,
            fontWeight: 800,
            color: "#ffffff",
            lineHeight: 1.15,
            letterSpacing: -1,
          }}
        >
          Monitoring + Status Pages.
          <br />
          Finally in one place.
        </div>
        <div style={{ marginTop: 36, display: "flex", alignItems: "center", gap: 14 }}>
          <div
            style={{
              width: 18,
              height: 18,
              borderRadius: 999,
              background: "#4edea3",
            }}
          />
          <div style={{ fontSize: 26, fontWeight: 600, color: "#4edea3" }}>
            Checks every minute on paid plans
          </div>
        </div>
      </div>
    ),
    size
  );
}
