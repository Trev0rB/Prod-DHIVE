import { ImageResponse } from "next/og";

export const alt = "DHIVE: the AI marketplace where creators keep 100%";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Default social share card (WhatsApp, LinkedIn, X…). */
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          background: "#0f172a",
          color: "#ffffff",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20, fontSize: 44, fontWeight: 700 }}>
          <svg width="56" height="60" viewBox="0 0 26 28">
            <path d="M13 1l11 6.5v13L13 27 2 20.5v-13L13 1z" fill="#f59e0b" />
            <path d="M13 8l5.5 3.25v6.5L13 21l-5.5-3.25v-6.5L13 8z" fill="#0f172a" />
          </svg>
          DHIVE
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div style={{ fontSize: 76, fontWeight: 700, lineHeight: 1.05, maxWidth: 980 }}>
            The AI marketplace where creators keep 100%.
          </div>
          <div style={{ fontSize: 32, color: "#94a3b8" }}>
            Chatbots, automations, templates and courses · Built in South Africa
          </div>
        </div>
        <div
          style={{
            display: "flex",
            alignSelf: "flex-start",
            padding: "12px 24px",
            borderRadius: 999,
            background: "#f59e0b",
            color: "#0f172a",
            fontSize: 28,
            fontWeight: 700,
          }}
        >
          0% platform fees
        </div>
      </div>
    ),
    size,
  );
}
