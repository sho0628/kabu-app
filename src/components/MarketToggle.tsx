"use client";

import type { Market } from "@/lib/types";

export type MarketFilter = Market | "ALL";

const OPTIONS: { value: MarketFilter; label: string }[] = [
  { value: "ALL", label: "全市場" },
  { value: "US", label: "🇺🇸 米国株" },
  { value: "JP", label: "🇯🇵 日本株" },
];

export function MarketToggle({
  value,
  onChange,
}: {
  value: MarketFilter;
  onChange: (v: MarketFilter) => void;
}) {
  return (
    <div className="inline-flex rounded-lg border border-[var(--border)] bg-[var(--surface)] p-1">
      {OPTIONS.map((o) => (
        <button
          key={o.value}
          onClick={() => onChange(o.value)}
          className={`px-4 py-1.5 text-sm rounded-md transition-colors ${
            value === o.value
              ? "bg-[var(--accent)] text-white"
              : "text-[var(--muted)] hover:text-[var(--foreground)]"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
