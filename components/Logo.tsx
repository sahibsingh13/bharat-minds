"use client";
import React from "react";

export default function Logo({ size = 24 }: { size?: number }) {
  return (
    <div className="relative inline-flex items-center gap-2 select-none">
      <div
        className="relative rounded-full overflow-hidden"
        style={{ width: size, height: size }}
        aria-label="Bharat Minds logo"
      >
        <span className="absolute inset-0 motion-safe:animate-pulse bg-blue-500/25" />
        <span className="absolute inset-[3px] rounded-full bg-blue-600" />
        <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 font-bold text-white" style={{ fontSize: Math.max(11, Math.floor((size||24)/2.2)) }}>
          B
        </span>
      </div>
      <span className="text-sm font-semibold tracking-tight">Bharat Minds</span>
    </div>
  );
}

