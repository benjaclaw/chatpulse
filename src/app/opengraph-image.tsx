import { ImageResponse } from "next/og";

export const alt = "ChatPulse — AI-chatbot for din bedrift";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #4f46e5 0%, #6366f1 50%, #818cf8 100%)",
          fontFamily: "sans-serif",
        }}
      >
        {/* Chat bubble icon */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 80,
            height: 80,
            borderRadius: 20,
            background: "rgba(255,255,255,0.2)",
            marginBottom: 32,
            fontSize: 40,
          }}
        >
          💬
        </div>

        <div
          style={{
            fontSize: 72,
            fontWeight: 800,
            color: "white",
            letterSpacing: -2,
            lineHeight: 1,
          }}
        >
          ChatPulse
        </div>

        <div
          style={{
            fontSize: 28,
            color: "rgba(255,255,255,0.85)",
            marginTop: 20,
            fontWeight: 400,
          }}
        >
          AI-chatbot for din bedrift
        </div>
      </div>
    ),
    { ...size }
  );
}
