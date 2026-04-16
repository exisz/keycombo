"use client";

import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";

export default function VercelAnalytics() {
  if (process.env.NEXT_PUBLIC_VERCEL_ANALYTICS !== "true") return null;
  return (
    <>
      <Analytics />
      <SpeedInsights />
    </>
  );
}
