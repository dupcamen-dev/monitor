import { ImageResponse } from "next/og";

export const runtime = "nodejs";
export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #adc6ff, #4edea3)",
          borderRadius: 7,
          fontSize: 21,
          fontWeight: 800,
          color: "#0a0a0a",
        }}
      >
        U
      </div>
    ),
    size
  );
}
