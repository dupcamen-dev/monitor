"use client";

import Script from "next/script";

declare global {
  interface Window {
    AssistLoopWidget?: { init: (opts: { agentId: string }) => void };
  }
}

const AGENT_ID = process.env.NEXT_PUBLIC_ASSISTLOOP_AGENT_ID;

export function AssistLoopWidget() {
  if (!AGENT_ID) return null;

  return (
    <Script
      src="https://assistloop.ai/assistloop-widget.js"
      strategy="afterInteractive"
      onLoad={() => {
        window.AssistLoopWidget?.init({ agentId: AGENT_ID });
      }}
    />
  );
}
